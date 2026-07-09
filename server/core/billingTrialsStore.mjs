/**
 * WS1.3 — Server-authoritative Luna free trials.
 * Dedicated billing_trials table (luna_trials left unused — missing `used` semantics).
 * Upsert-only; trial start is idempotent per user_id.
 */

import { buildTrialRecord, isTrialActive } from './billingTrial.mjs';

export const BILLING_TRIALS_TABLE = 'billing_trials';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS billing_trials (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT NOT NULL DEFAULT 'luna_server',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS billing_trials_email_idx ON billing_trials (LOWER(email));
`;

let schemaReady = false;

export const __resetBillingTrialsSchemaForTests = () => {
  schemaReady = false;
};

export const ensureBillingTrialsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[billing-trials] schema init failed:',
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

const computeStatus = (endsAt) =>
  endsAt && new Date(endsAt).getTime() > Date.now() ? 'active' : 'expired';

const rowToTrial = (row) => {
  if (!row) return null;
  const endsAt = toIso(row.ends_at);
  const startedAt = toIso(row.started_at);
  const status = computeStatus(endsAt);
  return {
    userId: String(row.user_id),
    email: String(row.email || '').toLowerCase(),
    startedAt,
    endsAt,
    used: row.used !== false,
    status,
    source: row.source == null ? 'luna_server' : String(row.source),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
};

/** API-compatible trial payload (matches buildTrialRecord shape). */
export const trialToApiPayload = (trial) => {
  if (!trial) return null;
  return {
    userId: trial.userId,
    email: trial.email,
    startedAt: trial.startedAt,
    endsAt: trial.endsAt,
    used: trial.used,
    status: trial.status,
  };
};

export const getTrialByUserId = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM billing_trials WHERE user_id = $1 LIMIT 1`,
    [String(userId)],
  );
  return rowToTrial(result.rows[0]);
};

/**
 * Start trial idempotently.
 * - Active existing → return alreadyActive
 * - used (expired or not) → reject used
 * - absent → insert server-computed dates only (client dates ignored)
 */
export const startTrialForUser = async (pool, { userId, email, trialDays }) => {
  const id = String(userId);
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!id || !normalizedEmail) {
    throw new Error('trial_requires_user_and_email');
  }

  const existing = await getTrialByUserId(pool, id);
  if (existing) {
    if (isTrialActive(existing)) {
      return { trial: trialToApiPayload(existing), alreadyActive: true, rejected: false };
    }
    if (existing.used) {
      return {
        trial: trialToApiPayload(existing),
        alreadyActive: false,
        rejected: true,
        reason: 'trial_already_used',
      };
    }
  }

  // Server computes dates — never accept client started_at/ends_at.
  const record = buildTrialRecord(id, normalizedEmail, trialDays);

  await pool.query(
    `INSERT INTO billing_trials (
       user_id, email, status, started_at, ends_at, used, source, created_at, updated_at
     ) VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, TRUE, 'luna_server', NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [id, normalizedEmail, record.status, record.startedAt, record.endsAt],
  );

  // Re-read: concurrent starter may have won the insert.
  const after = await getTrialByUserId(pool, id);
  if (!after) {
    throw new Error('trial_start_failed');
  }
  if (isTrialActive(after) && after.startedAt === record.startedAt) {
    return { trial: trialToApiPayload(after), alreadyActive: false, rejected: false };
  }
  if (isTrialActive(after)) {
    return { trial: trialToApiPayload(after), alreadyActive: true, rejected: false };
  }
  if (after.used) {
    return {
      trial: trialToApiPayload(after),
      alreadyActive: false,
      rejected: true,
      reason: 'trial_already_used',
    };
  }
  return { trial: trialToApiPayload(after), alreadyActive: false, rejected: false };
};

/**
 * Import-only upsert: never overwrites an existing row.
 * @returns {'inserted'|'skipped_exists'|'skipped_invalid'}
 */
export const importTrialIfAbsent = async (pool, raw) => {
  const userId = String(raw?.userId || raw?.user_id || '').trim();
  const email = String(raw?.email || '').trim().toLowerCase();
  const startedAt = toIso(raw?.startedAt || raw?.started_at);
  const endsAt = toIso(raw?.endsAt || raw?.ends_at || raw?.expires_at);
  if (!userId || !email || !startedAt || !endsAt) return 'skipped_invalid';

  const existing = await getTrialByUserId(pool, userId);
  if (existing) return 'skipped_exists';

  const status = computeStatus(endsAt);
  const used = raw?.used !== false;
  const source = String(raw?.source || 'legacy_json').slice(0, 64);

  const result = await pool.query(
    `INSERT INTO billing_trials (
       user_id, email, status, started_at, ends_at, used, source, created_at, updated_at
     ) VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, $6, $7, NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING
     RETURNING user_id`,
    [userId, email, status, startedAt, endsAt, used, source],
  );
  return result.rows[0] ? 'inserted' : 'skipped_exists';
};

export const deleteTrialByUserId = async (pool, userId) => {
  await pool.query(`DELETE FROM billing_trials WHERE user_id = $1`, [String(userId)]);
};

export const countBillingTrials = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM billing_trials`);
  return Number(result.rows[0]?.n || 0);
};

export const listBillingTrials = async (pool) => {
  const result = await pool.query(`SELECT * FROM billing_trials`);
  return result.rows.map(rowToTrial);
};

export const initBillingTrialsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') {
    return { ok: true, mode: mode || 'json' };
  }
  if (!pool) {
    return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  }
  const ready = await ensureBillingTrialsTable(pool);
  return ready
    ? { ok: true, mode: 'postgres' }
    : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};

export { isTrialActive };
