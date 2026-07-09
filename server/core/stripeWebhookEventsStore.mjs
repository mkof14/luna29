/**
 * WS1.4 — Durable Stripe webhook event ledger (idempotency / claim).
 * Shared pool via database.mjs. No raw payload storage.
 *
 * Authority: Stripe owns event identity; Luna Postgres owns processed-event ledger.
 */

export const STRIPE_WEBHOOK_EVENTS_TABLE = 'stripe_webhook_events';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  stripe_created_at BIGINT,
  object_id TEXT,
  customer_id TEXT,
  subscription_id TEXT,
  processing_status TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  first_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  last_error_code TEXT
);
CREATE INDEX IF NOT EXISTS stripe_webhook_events_status_idx
  ON stripe_webhook_events (processing_status);
CREATE INDEX IF NOT EXISTS stripe_webhook_events_type_idx
  ON stripe_webhook_events (event_type);
`;

/** Stale "processing" rows older than this may be reclaimed (ms). */
export const PROCESSING_RECLAIM_MS = 2 * 60 * 1000;

let schemaReady = false;

export const __resetStripeWebhookEventsSchemaForTests = () => {
  schemaReady = false;
};

export const ensureStripeWebhookEventsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[stripe-webhook-events] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

const rowToEvent = (row) => {
  if (!row) return null;
  return {
    eventId: String(row.event_id),
    eventType: String(row.event_type || ''),
    stripeCreatedAt: row.stripe_created_at == null ? null : Number(row.stripe_created_at),
    objectId: row.object_id == null ? null : String(row.object_id),
    customerId: row.customer_id == null ? null : String(row.customer_id),
    subscriptionId: row.subscription_id == null ? null : String(row.subscription_id),
    processingStatus: String(row.processing_status || ''),
    attemptCount: Number(row.attempt_count || 0),
    firstReceivedAt: row.first_received_at ? new Date(row.first_received_at).toISOString() : null,
    lastReceivedAt: row.last_received_at ? new Date(row.last_received_at).toISOString() : null,
    processedAt: row.processed_at ? new Date(row.processed_at).toISOString() : null,
    failedAt: row.failed_at ? new Date(row.failed_at).toISOString() : null,
    lastErrorCode: row.last_error_code == null ? null : String(row.last_error_code),
  };
};

/**
 * Atomically claim an event for processing.
 * @returns {{ action: 'process'|'skip'|'in_progress', event, reason?: string }}
 */
export const claimStripeWebhookEvent = async (pool, input) => {
  const eventId = String(input.eventId || '');
  const eventType = String(input.eventType || '').slice(0, 120);
  if (!eventId) throw new Error('event_claim_requires_event_id');

  const stripeCreatedAt =
    input.stripeCreatedAt == null || Number.isNaN(Number(input.stripeCreatedAt))
      ? null
      : Number(input.stripeCreatedAt);
  const objectId = input.objectId ? String(input.objectId).slice(0, 200) : null;
  const customerId = input.customerId ? String(input.customerId).slice(0, 200) : null;
  const subscriptionId = input.subscriptionId
    ? String(input.subscriptionId).slice(0, 200)
    : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const inserted = await client.query(
      `INSERT INTO stripe_webhook_events (
         event_id, event_type, stripe_created_at, object_id, customer_id, subscription_id,
         processing_status, attempt_count, first_received_at, last_received_at
       ) VALUES ($1, $2, $3, $4, $5, $6, 'processing', 1, NOW(), NOW())
       ON CONFLICT (event_id) DO NOTHING
       RETURNING *`,
      [eventId, eventType, stripeCreatedAt, objectId, customerId, subscriptionId],
    );

    if (inserted.rows[0]) {
      await client.query('COMMIT');
      return { action: 'process', event: rowToEvent(inserted.rows[0]), reason: 'first_delivery' };
    }

    const locked = await client.query(
      `SELECT * FROM stripe_webhook_events WHERE event_id = $1 FOR UPDATE`,
      [eventId],
    );
    const row = locked.rows[0];
    if (!row) {
      await client.query('ROLLBACK');
      throw new Error('event_claim_failed');
    }

    const status = String(row.processing_status || '');
    if (status === 'processed' || status === 'ignored') {
      await client.query(
        `UPDATE stripe_webhook_events SET last_received_at = NOW() WHERE event_id = $1`,
        [eventId],
      );
      await client.query('COMMIT');
      return { action: 'skip', event: rowToEvent(row), reason: `already_${status}` };
    }

    if (status === 'failed') {
      const updated = await client.query(
        `UPDATE stripe_webhook_events SET
           processing_status = 'processing',
           attempt_count = attempt_count + 1,
           last_received_at = NOW(),
           failed_at = NULL,
           last_error_code = NULL,
           event_type = COALESCE($2, event_type),
           stripe_created_at = COALESCE($3, stripe_created_at),
           object_id = COALESCE($4, object_id),
           customer_id = COALESCE($5, customer_id),
           subscription_id = COALESCE($6, subscription_id)
         WHERE event_id = $1
         RETURNING *`,
        [eventId, eventType, stripeCreatedAt, objectId, customerId, subscriptionId],
      );
      await client.query('COMMIT');
      return { action: 'process', event: rowToEvent(updated.rows[0]), reason: 'retry_failed' };
    }

    // status === 'processing' — concurrent delivery or stuck worker
    const lastMs = row.last_received_at ? new Date(row.last_received_at).getTime() : 0;
    const age = Date.now() - lastMs;
    if (age >= PROCESSING_RECLAIM_MS) {
      const updated = await client.query(
        `UPDATE stripe_webhook_events SET
           attempt_count = attempt_count + 1,
           last_received_at = NOW(),
           processing_status = 'processing'
         WHERE event_id = $1
         RETURNING *`,
        [eventId],
      );
      await client.query('COMMIT');
      return { action: 'process', event: rowToEvent(updated.rows[0]), reason: 'reclaim_stale_processing' };
    }

    // Do NOT refresh last_received_at here — concurrent Stripe retries would
    // otherwise keep resetting the reclaim clock and block recovery of a hung worker.
    await client.query('COMMIT');
    return { action: 'in_progress', event: rowToEvent(row), reason: 'concurrent_processing' };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw error;
  } finally {
    client.release();
  }
};

export const markStripeWebhookEventProcessed = async (pool, eventId) => {
  const result = await pool.query(
    `UPDATE stripe_webhook_events SET
       processing_status = 'processed',
       processed_at = NOW(),
       failed_at = NULL,
       last_error_code = NULL,
       last_received_at = NOW()
     WHERE event_id = $1
     RETURNING *`,
    [String(eventId)],
  );
  return rowToEvent(result.rows[0]);
};

export const markStripeWebhookEventIgnored = async (pool, eventId, errorCode = 'unsupported_event') => {
  const result = await pool.query(
    `UPDATE stripe_webhook_events SET
       processing_status = 'ignored',
       processed_at = NOW(),
       last_error_code = $2,
       last_received_at = NOW()
     WHERE event_id = $1
     RETURNING *`,
    [String(eventId), String(errorCode || 'unsupported_event').slice(0, 80)],
  );
  return rowToEvent(result.rows[0]);
};

export const markStripeWebhookEventFailed = async (pool, eventId, errorCode) => {
  const result = await pool.query(
    `UPDATE stripe_webhook_events SET
       processing_status = 'failed',
       failed_at = NOW(),
       last_error_code = $2,
       last_received_at = NOW()
     WHERE event_id = $1
     RETURNING *`,
    [String(eventId), String(errorCode || 'projection_failed').slice(0, 80)],
  );
  return rowToEvent(result.rows[0]);
};

export const getStripeWebhookEvent = async (pool, eventId) => {
  const result = await pool.query(
    `SELECT * FROM stripe_webhook_events WHERE event_id = $1 LIMIT 1`,
    [String(eventId)],
  );
  return rowToEvent(result.rows[0]);
};

export const initStripeWebhookEventsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') {
    return { ok: true, mode: mode || 'json' };
  }
  if (!pool) {
    return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  }
  const ready = await ensureStripeWebhookEventsTable(pool);
  return ready
    ? { ok: true, mode: 'postgres' }
    : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};

/**
 * In-memory ledger for JSON/test mode (same claim semantics, process-local).
 */
export const createMemoryStripeWebhookLedger = () => {
  const rows = new Map();

  const claimStripeWebhookEvent = async (_pool, input) => {
    const eventId = String(input.eventId || '');
    const existing = rows.get(eventId);
    if (!existing) {
      const event = {
        eventId,
        eventType: String(input.eventType || ''),
        stripeCreatedAt: input.stripeCreatedAt == null ? null : Number(input.stripeCreatedAt),
        objectId: input.objectId || null,
        customerId: input.customerId || null,
        subscriptionId: input.subscriptionId || null,
        processingStatus: 'processing',
        attemptCount: 1,
        firstReceivedAt: new Date().toISOString(),
        lastReceivedAt: new Date().toISOString(),
        processedAt: null,
        failedAt: null,
        lastErrorCode: null,
      };
      rows.set(eventId, event);
      return { action: 'process', event, reason: 'first_delivery' };
    }

    if (existing.processingStatus === 'processed' || existing.processingStatus === 'ignored') {
      existing.lastReceivedAt = new Date().toISOString();
      return { action: 'skip', event: { ...existing }, reason: `already_${existing.processingStatus}` };
    }
    if (existing.processingStatus === 'failed') {
      existing.processingStatus = 'processing';
      existing.attemptCount += 1;
      existing.failedAt = null;
      existing.lastErrorCode = null;
      existing.lastReceivedAt = new Date().toISOString();
      return { action: 'process', event: { ...existing }, reason: 'retry_failed' };
    }
    const age = Date.now() - new Date(existing.lastReceivedAt).getTime();
    // Do not refresh lastReceivedAt on in_progress (preserves reclaim clock).
    if (age >= PROCESSING_RECLAIM_MS) {
      existing.attemptCount += 1;
      existing.lastReceivedAt = new Date().toISOString();
      return { action: 'process', event: { ...existing }, reason: 'reclaim_stale_processing' };
    }
    return { action: 'in_progress', event: { ...existing }, reason: 'concurrent_processing' };
  };

  return {
    rows,
    claimStripeWebhookEvent,
    markStripeWebhookEventProcessed: async (_pool, eventId) => {
      const row = rows.get(String(eventId));
      if (!row) return null;
      row.processingStatus = 'processed';
      row.processedAt = new Date().toISOString();
      row.failedAt = null;
      row.lastErrorCode = null;
      return { ...row };
    },
    markStripeWebhookEventIgnored: async (_pool, eventId, errorCode = 'unsupported_event') => {
      const row = rows.get(String(eventId));
      if (!row) return null;
      row.processingStatus = 'ignored';
      row.processedAt = new Date().toISOString();
      row.lastErrorCode = String(errorCode || 'unsupported_event');
      return { ...row };
    },
    markStripeWebhookEventFailed: async (_pool, eventId, errorCode) => {
      const row = rows.get(String(eventId));
      if (!row) return null;
      row.processingStatus = 'failed';
      row.failedAt = new Date().toISOString();
      row.lastErrorCode = String(errorCode || 'projection_failed');
      return { ...row };
    },
    getStripeWebhookEvent: async (_pool, eventId) => {
      const row = rows.get(String(eventId));
      return row ? { ...row } : null;
    },
  };
};
