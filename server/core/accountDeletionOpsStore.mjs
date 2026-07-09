/**
 * WS2 Block 2 — Durable account deletion operation (idempotency + deleting-state).
 * Minimal table; not a workflow engine. No plaintext email retained.
 */

import { createHash, randomBytes } from 'node:crypto';

export const ACCOUNT_DELETION_OPS_TABLE = 'account_deletion_ops';

export const DELETION_OP_STATUS = Object.freeze({
  PENDING: 'pending',
  EXTERNAL_CLEANUP: 'external_cleanup',
  LOCAL_CLEANUP: 'local_cleanup',
  COMPLETED: 'completed',
  FAILED_RETRYABLE: 'failed_retryable',
});

/** Statuses that block login/session/writes while the auth user may still exist. */
export const DELETION_BLOCKING_STATUSES = new Set([
  DELETION_OP_STATUS.PENDING,
  DELETION_OP_STATUS.EXTERNAL_CLEANUP,
  DELETION_OP_STATUS.LOCAL_CLEANUP,
  DELETION_OP_STATUS.FAILED_RETRYABLE,
]);

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS account_deletion_ops (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_id_hash TEXT NOT NULL,
  email_marker TEXT NOT NULL,
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  local_subscription_status TEXT,
  stripe_cancel_status TEXT,
  error_code TEXT,
  runner_token TEXT,
  lease_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS account_deletion_ops_user_idx ON account_deletion_ops (user_id);
CREATE INDEX IF NOT EXISTS account_deletion_ops_status_idx ON account_deletion_ops (status);
CREATE UNIQUE INDEX IF NOT EXISTS account_deletion_ops_one_active_per_user
  ON account_deletion_ops (user_id)
  WHERE status IN ('pending', 'external_cleanup', 'local_cleanup', 'failed_retryable');
`;

const SCHEMA_LEASE_MIGRATE_SQL = `
ALTER TABLE account_deletion_ops ADD COLUMN IF NOT EXISTS runner_token TEXT;
ALTER TABLE account_deletion_ops ADD COLUMN IF NOT EXISTS lease_until TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS account_deletion_ops_one_active_per_user
  ON account_deletion_ops (user_id)
  WHERE status IN ('pending', 'external_cleanup', 'local_cleanup', 'failed_retryable');
`;

const DEFAULT_LEASE_MS = 120_000;

let schemaReady = false;

export const __resetAccountDeletionOpsSchemaForTests = () => {
  schemaReady = false;
};

export const ensureAccountDeletionOpsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    await pool.query(SCHEMA_LEASE_MIGRATE_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[account-deletion-ops] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

export const hashUserId = (userId) =>
  createHash('sha256').update(String(userId || '')).digest('hex').slice(0, 32);

export const emailMarkerForUser = (userId) => `deleted:${hashUserId(userId)}`;

export const newDeletionOpId = () =>
  `dsar-del-${Date.now()}-${randomBytes(4).toString('hex')}`;

const rowToOp = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    userIdHash: String(row.user_id_hash || ''),
    emailMarker: String(row.email_marker || ''),
    status: String(row.status || ''),
    stripeCustomerId: row.stripe_customer_id || null,
    stripeSubscriptionId: row.stripe_subscription_id || null,
    localSubscriptionStatus: row.local_subscription_status || null,
    stripeCancelStatus: row.stripe_cancel_status || null,
    errorCode: row.error_code || null,
    runnerToken: row.runner_token || null,
    leaseUntil: row.lease_until ? new Date(row.lease_until).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
  };
};

/**
 * Single-owner lease so concurrent delete requests cannot run two destructive workflows.
 * Expired leases may be stolen for retry after crash.
 */
export const tryAcquireDeletionOp = async (
  pool,
  id,
  runnerToken,
  leaseMs = DEFAULT_LEASE_MS,
) => {
  const token = String(runnerToken || '');
  if (!token) return { acquired: false, op: null };
  const lease = Math.max(5_000, Number(leaseMs) || DEFAULT_LEASE_MS);
  const result = await pool.query(
    `UPDATE account_deletion_ops
     SET runner_token = $2,
         lease_until = NOW() + ($3 * INTERVAL '1 millisecond'),
         updated_at = NOW()
     WHERE id = $1
       AND status = ANY($4::text[])
       AND (
         runner_token IS NULL
         OR lease_until IS NULL
         OR lease_until < NOW()
         OR runner_token = $2
       )
     RETURNING *`,
    [String(id), token, lease, [...DELETION_BLOCKING_STATUSES]],
  );
  const op = rowToOp(result.rows[0]);
  return { acquired: Boolean(op), op };
};

export const releaseDeletionOpLease = async (pool, id, runnerToken) => {
  await pool.query(
    `UPDATE account_deletion_ops
     SET runner_token = NULL, lease_until = NULL, updated_at = NOW()
     WHERE id = $1 AND runner_token = $2`,
    [String(id), String(runnerToken || '')],
  );
};

export const getDeletionOpById = async (pool, id) => {
  const result = await pool.query(`SELECT * FROM account_deletion_ops WHERE id = $1 LIMIT 1`, [
    String(id),
  ]);
  return rowToOp(result.rows[0]);
};

export const getActiveDeletionOpForUser = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM account_deletion_ops
     WHERE user_id = $1 AND status = ANY($2::text[])
     ORDER BY created_at DESC
     LIMIT 1`,
    [String(userId), [...DELETION_BLOCKING_STATUSES]],
  );
  return rowToOp(result.rows[0]);
};

export const getLatestDeletionOpForUser = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM account_deletion_ops WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [String(userId)],
  );
  return rowToOp(result.rows[0]);
};

export const isUserDeletionBlocking = async (pool, userId) => {
  if (!pool || !userId) return false;
  const op = await getActiveDeletionOpForUser(pool, userId);
  return Boolean(op);
};

/**
 * Claim or resume a deletion operation for a user (single active owner).
 * Concurrent callers get the same active op.
 */
export const claimOrResumeDeletionOp = async (
  pool,
  {
    userId,
    requestId = null,
    stripeCustomerId = null,
    stripeSubscriptionId = null,
    localSubscriptionStatus = null,
  },
) => {
  const uid = String(userId);
  const existing = await getActiveDeletionOpForUser(pool, uid);
  if (existing) {
    return { op: existing, created: false };
  }

  const completed = await getLatestDeletionOpForUser(pool, uid);
  if (completed?.status === DELETION_OP_STATUS.COMPLETED) {
    return { op: completed, created: false, alreadyCompleted: true };
  }

  const id = requestId || newDeletionOpId();
  const marker = emailMarkerForUser(uid);
  const hash = hashUserId(uid);
  try {
    await pool.query(
      `INSERT INTO account_deletion_ops (
         id, user_id, user_id_hash, email_marker, status,
         stripe_customer_id, stripe_subscription_id, local_subscription_status,
         created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        id,
        uid,
        hash,
        marker,
        DELETION_OP_STATUS.PENDING,
        stripeCustomerId || null,
        stripeSubscriptionId || null,
        localSubscriptionStatus || null,
      ],
    );
  } catch (error) {
    // Unique active-per-user race: another claim won.
    if (error?.code !== '23505') throw error;
  }

  // Race: another claim may have won — prefer active op for user.
  const active = await getActiveDeletionOpForUser(pool, uid);
  if (active) return { op: active, created: active.id === id };
  const completedAfter = await getLatestDeletionOpForUser(pool, uid);
  if (completedAfter?.status === DELETION_OP_STATUS.COMPLETED) {
    return { op: completedAfter, created: false, alreadyCompleted: true };
  }
  const byId = await getDeletionOpById(pool, id);
  return { op: byId, created: Boolean(byId) };
};

export const updateDeletionOp = async (pool, id, patch) => {
  const fields = [];
  const params = [String(id)];
  const add = (col, value) => {
    params.push(value);
    fields.push(`${col} = $${params.length}`);
  };
  if (patch.status != null) add('status', patch.status);
  if (patch.stripeCancelStatus != null) add('stripe_cancel_status', patch.stripeCancelStatus);
  if (patch.errorCode !== undefined) add('error_code', patch.errorCode);
  if (patch.stripeCustomerId !== undefined) add('stripe_customer_id', patch.stripeCustomerId);
  if (patch.stripeSubscriptionId !== undefined) {
    add('stripe_subscription_id', patch.stripeSubscriptionId);
  }
  if (patch.localSubscriptionStatus !== undefined) {
    add('local_subscription_status', patch.localSubscriptionStatus);
  }
  if (patch.completedAt) add('completed_at', patch.completedAt);
  fields.push('updated_at = NOW()');
  const result = await pool.query(
    `UPDATE account_deletion_ops SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    params,
  );
  return rowToOp(result.rows[0]);
};

export const markDeletionOpCompleted = async (pool, id) => {
  const result = await pool.query(
    `UPDATE account_deletion_ops
     SET status = $2,
         stripe_customer_id = NULL,
         stripe_subscription_id = NULL,
         error_code = NULL,
         runner_token = NULL,
         lease_until = NULL,
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [String(id), DELETION_OP_STATUS.COMPLETED],
  );
  return rowToOp(result.rows[0]);
};

export const markDeletionOpFailedRetryable = async (pool, id, errorCode) =>
  updateDeletionOp(pool, id, {
    status: DELETION_OP_STATUS.FAILED_RETRYABLE,
    errorCode: String(errorCode || 'failed').slice(0, 120),
  });

/** In-memory ops for JSON/test harness (process-local). */
export const createMemoryDeletionOpsLedger = () => {
  const byId = new Map();
  const byUser = new Map();

  const getActive = (userId) => {
    const id = byUser.get(String(userId));
    if (!id) return null;
    const op = byId.get(id);
    if (!op || !DELETION_BLOCKING_STATUSES.has(op.status)) return null;
    return op;
  };

  return {
    async ensure() {
      return true;
    },
    async getById(id) {
      return byId.get(String(id)) || null;
    },
    async getActiveForUser(userId) {
      return getActive(userId);
    },
    async getLatestForUser(userId) {
      const id = byUser.get(String(userId));
      return id ? byId.get(id) || null : null;
    },
    async isBlocking(userId) {
      return Boolean(getActive(userId));
    },
    async claimOrResume({
      userId,
      requestId = null,
      stripeCustomerId = null,
      stripeSubscriptionId = null,
      localSubscriptionStatus = null,
    }) {
      const uid = String(userId);
      const active = getActive(uid);
      if (active) return { op: active, created: false };
      const latestId = byUser.get(uid);
      const latest = latestId ? byId.get(latestId) : null;
      if (latest?.status === DELETION_OP_STATUS.COMPLETED) {
        return { op: latest, created: false, alreadyCompleted: true };
      }
      const id = requestId || newDeletionOpId();
      const op = {
        id,
        userId: uid,
        userIdHash: hashUserId(uid),
        emailMarker: emailMarkerForUser(uid),
        status: DELETION_OP_STATUS.PENDING,
        stripeCustomerId: stripeCustomerId || null,
        stripeSubscriptionId: stripeSubscriptionId || null,
        localSubscriptionStatus: localSubscriptionStatus || null,
        stripeCancelStatus: null,
        errorCode: null,
        runnerToken: null,
        leaseUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
      };
      byId.set(id, op);
      byUser.set(uid, id);
      return { op, created: true };
    },
    async tryAcquire(id, runnerToken, leaseMs = DEFAULT_LEASE_MS) {
      const op = byId.get(String(id));
      if (!op || !DELETION_BLOCKING_STATUSES.has(op.status)) {
        return { acquired: false, op: null };
      }
      const now = Date.now();
      const leaseExpired =
        !op.leaseUntil || new Date(op.leaseUntil).getTime() < now;
      if (op.runnerToken && op.runnerToken !== runnerToken && !leaseExpired) {
        return { acquired: false, op };
      }
      op.runnerToken = String(runnerToken);
      op.leaseUntil = new Date(now + Math.max(5_000, Number(leaseMs) || DEFAULT_LEASE_MS)).toISOString();
      op.updatedAt = new Date().toISOString();
      return { acquired: true, op };
    },
    async releaseLease(id, runnerToken) {
      const op = byId.get(String(id));
      if (!op || op.runnerToken !== String(runnerToken || '')) return;
      op.runnerToken = null;
      op.leaseUntil = null;
      op.updatedAt = new Date().toISOString();
    },
    async update(id, patch) {
      const op = byId.get(String(id));
      if (!op) return null;
      Object.assign(op, patch, { updatedAt: new Date().toISOString() });
      if (patch.status === DELETION_OP_STATUS.COMPLETED) {
        op.stripeCustomerId = null;
        op.stripeSubscriptionId = null;
        op.completedAt = new Date().toISOString();
        op.errorCode = null;
        op.runnerToken = null;
        op.leaseUntil = null;
      }
      return op;
    },
  };
};

export const initAccountDeletionOpsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json', pool: null };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureAccountDeletionOpsTable(pool);
  return ready ? { ok: true, mode: 'postgres', pool } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
