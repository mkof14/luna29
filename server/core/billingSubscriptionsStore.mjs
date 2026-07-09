/**
 * WS1.3 — Durable local projection of Stripe subscription status.
 * Stripe remains authoritative for payment facts; this table is the app read model.
 * Upsert-only; no full-table replace.
 */

export const BILLING_SUBSCRIPTIONS_TABLE = 'billing_subscriptions';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  user_id TEXT PRIMARY KEY,
  email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_key TEXT,
  period TEXT,
  stripe_price_id TEXT,
  source TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  last_stripe_event_created_at BIGINT,
  last_stripe_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS billing_subscriptions_stripe_sub_uidx
  ON billing_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS billing_subscriptions_email_idx
  ON billing_subscriptions (LOWER(email));
`;

/** Idempotent column add for deployments that created billing_subscriptions before WS1.4. */
const ORDERING_COLUMNS_SQL = `
ALTER TABLE billing_subscriptions
  ADD COLUMN IF NOT EXISTS last_stripe_event_created_at BIGINT;
ALTER TABLE billing_subscriptions
  ADD COLUMN IF NOT EXISTS last_stripe_event_id TEXT;
`;

let schemaReady = false;

export const __resetBillingSubscriptionsSchemaForTests = () => {
  schemaReady = false;
};

export const ensureBillingSubscriptionsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    await pool.query(ORDERING_COLUMNS_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[billing-subscriptions] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

const toIso = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const rowToSubscription = (row) => {
  if (!row) return null;
  return {
    userId: String(row.user_id),
    email: row.email == null ? null : String(row.email).toLowerCase(),
    stripeCustomerId: row.stripe_customer_id == null ? null : String(row.stripe_customer_id),
    stripeSubscriptionId:
      row.stripe_subscription_id == null ? null : String(row.stripe_subscription_id),
    status: String(row.status || 'inactive'),
    planKey: row.plan_key == null ? null : String(row.plan_key),
    period: row.period == null ? null : String(row.period),
    stripePriceId: row.stripe_price_id == null ? null : String(row.stripe_price_id),
    source: row.source == null ? null : String(row.source),
    currentPeriodStart: toIso(row.current_period_start),
    currentPeriodEnd: toIso(row.current_period_end),
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    canceledAt: toIso(row.canceled_at),
    lastStripeEventCreatedAt:
      row.last_stripe_event_created_at == null ? null : Number(row.last_stripe_event_created_at),
    lastStripeEventId:
      row.last_stripe_event_id == null ? null : String(row.last_stripe_event_id),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
};

/**
 * Ordering: Stripe event.created (unix seconds), then event_id lexicographic tie-break.
 * @returns {'apply'|'skip_same'|'skip_stale'}
 */
export const compareStripeEventOrder = (existing, nextCreatedAt, nextEventId) => {
  if (!existing || existing.lastStripeEventCreatedAt == null || !existing.lastStripeEventId) {
    return 'apply';
  }
  const nextCreated = Number(nextCreatedAt);
  if (!Number.isFinite(nextCreated) || !nextEventId) return 'apply';
  const prevCreated = Number(existing.lastStripeEventCreatedAt);
  if (nextCreated > prevCreated) return 'apply';
  if (nextCreated < prevCreated) return 'skip_stale';
  // Equal created: deterministic event_id tie-break
  if (String(nextEventId) === String(existing.lastStripeEventId)) return 'skip_same';
  if (String(nextEventId) > String(existing.lastStripeEventId)) return 'apply';
  return 'skip_stale';
};

/** Shape compatible with legacy billingState status payload. */
export const subscriptionToStatusPayload = (sub) => {
  if (!sub) return { status: 'inactive', plan: 'none' };
  return {
    status: sub.status || 'inactive',
    plan: sub.planKey || (sub.status === 'inactive' ? 'none' : sub.status),
    period: sub.period || 'none',
    updatedAt: sub.updatedAt || undefined,
    source: sub.source || undefined,
    subscriptionId: sub.stripeSubscriptionId || undefined,
  };
};

export const getSubscriptionByUserId = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM billing_subscriptions WHERE user_id = $1 LIMIT 1`,
    [String(userId)],
  );
  return rowToSubscription(result.rows[0]);
};

export const getSubscriptionByStripeSubscriptionId = async (pool, stripeSubscriptionId) => {
  if (!stripeSubscriptionId) return null;
  const result = await pool.query(
    `SELECT * FROM billing_subscriptions WHERE stripe_subscription_id = $1 LIMIT 1`,
    [String(stripeSubscriptionId)],
  );
  return rowToSubscription(result.rows[0]);
};

export const getSubscriptionByEmail = async (pool, email) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  const result = await pool.query(
    `SELECT * FROM billing_subscriptions WHERE LOWER(email) = $1 LIMIT 1`,
    [normalized],
  );
  return rowToSubscription(result.rows[0]);
};

/**
 * Targeted upsert by user_id. Nullish optional fields do not wipe existing values
 * except status/period/source which are always set when provided.
 */
export const upsertSubscription = async (pool, input) => {
  const userId = String(input.userId || '');
  if (!userId) throw new Error('subscription_requires_user_id');

  const email = input.email == null ? null : String(input.email).trim().toLowerCase();
  const status = String(input.status || 'inactive');
  const period = input.period == null ? null : String(input.period);
  const planKey = input.planKey == null ? null : String(input.planKey);
  const source = input.source == null ? null : String(input.source);
  const stripeCustomerId =
    input.stripeCustomerId == null || input.stripeCustomerId === ''
      ? null
      : String(input.stripeCustomerId);
  const stripeSubscriptionId =
    input.stripeSubscriptionId == null || input.stripeSubscriptionId === ''
      ? null
      : String(input.stripeSubscriptionId);
  const stripePriceId =
    input.stripePriceId == null || input.stripePriceId === ''
      ? null
      : String(input.stripePriceId);

  const stripeEventCreatedAt =
    input.stripeEventCreatedAt == null || Number.isNaN(Number(input.stripeEventCreatedAt))
      ? null
      : Number(input.stripeEventCreatedAt);
  const stripeEventId = input.stripeEventId ? String(input.stripeEventId) : null;

  // When ordering metadata provided, skip stale/same updates (no overwrite of newer state).
  if (stripeEventCreatedAt != null && stripeEventId) {
    const existing = await getSubscriptionByUserId(pool, userId);
    const order = compareStripeEventOrder(existing, stripeEventCreatedAt, stripeEventId);
    if (order === 'skip_same' || order === 'skip_stale') {
      if (existing && typeof existing === 'object') {
        Object.defineProperty(existing, '_upsertMeta', {
          value: { applied: false, reason: order },
          enumerable: false,
          configurable: true,
        });
      }
      return existing;
    }
  }

  await pool.query(
    `INSERT INTO billing_subscriptions (
       user_id, email, stripe_customer_id, stripe_subscription_id, status, plan_key, period,
       stripe_price_id, source, current_period_start, current_period_end,
       cancel_at_period_end, canceled_at, last_stripe_event_created_at, last_stripe_event_id,
       created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::timestamptz, $11::timestamptz,
       COALESCE($12, FALSE), $13::timestamptz, $14, $15, NOW(), NOW()
     )
     ON CONFLICT (user_id) DO UPDATE SET
       email = COALESCE(EXCLUDED.email, billing_subscriptions.email),
       stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, billing_subscriptions.stripe_customer_id),
       stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, billing_subscriptions.stripe_subscription_id),
       status = EXCLUDED.status,
       plan_key = COALESCE(EXCLUDED.plan_key, billing_subscriptions.plan_key),
       period = COALESCE(EXCLUDED.period, billing_subscriptions.period),
       stripe_price_id = COALESCE(EXCLUDED.stripe_price_id, billing_subscriptions.stripe_price_id),
       source = COALESCE(EXCLUDED.source, billing_subscriptions.source),
       current_period_start = COALESCE(EXCLUDED.current_period_start, billing_subscriptions.current_period_start),
       current_period_end = COALESCE(EXCLUDED.current_period_end, billing_subscriptions.current_period_end),
       cancel_at_period_end = COALESCE(EXCLUDED.cancel_at_period_end, billing_subscriptions.cancel_at_period_end),
       canceled_at = COALESCE(EXCLUDED.canceled_at, billing_subscriptions.canceled_at),
       last_stripe_event_created_at = COALESCE(EXCLUDED.last_stripe_event_created_at, billing_subscriptions.last_stripe_event_created_at),
       last_stripe_event_id = COALESCE(EXCLUDED.last_stripe_event_id, billing_subscriptions.last_stripe_event_id),
       updated_at = NOW()
     WHERE
       billing_subscriptions.last_stripe_event_created_at IS NULL
       OR EXCLUDED.last_stripe_event_created_at IS NULL
       OR EXCLUDED.last_stripe_event_created_at > billing_subscriptions.last_stripe_event_created_at
       OR (
         EXCLUDED.last_stripe_event_created_at = billing_subscriptions.last_stripe_event_created_at
         AND EXCLUDED.last_stripe_event_id IS NOT NULL
         AND (
           billing_subscriptions.last_stripe_event_id IS NULL
           OR EXCLUDED.last_stripe_event_id >= billing_subscriptions.last_stripe_event_id
         )
       )`,
    [
      userId,
      email,
      stripeCustomerId,
      stripeSubscriptionId,
      status,
      planKey,
      period,
      stripePriceId,
      source,
      input.currentPeriodStart || null,
      input.currentPeriodEnd || null,
      input.cancelAtPeriodEnd == null ? null : Boolean(input.cancelAtPeriodEnd),
      input.canceledAt || null,
      stripeEventCreatedAt,
      stripeEventId,
    ],
  );
  const subscription = await getSubscriptionByUserId(pool, userId);
  // Preserve prior return shape (subscription object) for WS1.3 callers.
  // Attach applied/reason non-enumerably for webhook ordering introspection.
  if (subscription && typeof subscription === 'object') {
    Object.defineProperty(subscription, '_upsertMeta', {
      value: { applied: true, reason: 'applied' },
      enumerable: false,
    });
  }
  return subscription;
};

export const deleteSubscriptionByUserId = async (pool, userId) => {
  const result = await pool.query(`DELETE FROM billing_subscriptions WHERE user_id = $1`, [
    String(userId),
  ]);
  return Number(result.rowCount || 0);
};

export const countBillingSubscriptions = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM billing_subscriptions`);
  return Number(result.rows[0]?.n || 0);
};

export const listBillingSubscriptions = async (pool) => {
  const result = await pool.query(`SELECT * FROM billing_subscriptions`);
  return result.rows.map(rowToSubscription);
};

export const initBillingSubscriptionsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') {
    return { ok: true, mode: mode || 'json' };
  }
  if (!pool) {
    return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  }
  const ready = await ensureBillingSubscriptionsTable(pool);
  return ready
    ? { ok: true, mode: 'postgres' }
    : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
