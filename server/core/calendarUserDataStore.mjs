/**
 * WS1.6 — Durable per-user calendar bundle (journal/events/preferences).
 * Ownership key: authenticated user_id only.
 */

export const CALENDAR_USER_DATA_TABLE = 'calendar_user_data';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS calendar_user_data (
  user_id TEXT PRIMARY KEY,
  bundle JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS calendar_user_data_updated_at_idx ON calendar_user_data (updated_at DESC);
`;

let schemaReady = false;

export const __resetCalendarUserDataSchemaForTests = () => {
  schemaReady = false;
};

export const ensureCalendarUserDataTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[calendar-user-data] schema init failed:',
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

export const getCalendarBundleForUser = async (pool, userId) => {
  const result = await pool.query(
    `SELECT bundle, updated_at FROM calendar_user_data WHERE user_id = $1 LIMIT 1`,
    [String(userId)],
  );
  const row = result.rows[0];
  if (!row) return null;
  const bundle = row.bundle && typeof row.bundle === 'object' ? row.bundle : null;
  if (!bundle) return null;
  return {
    ...bundle,
    updatedAt: bundle.updatedAt || toIso(row.updated_at) || new Date().toISOString(),
  };
};

export const upsertCalendarBundleForUser = async (pool, userId, bundle) => {
  const updatedAt = bundle?.updatedAt || new Date().toISOString();
  const payload = { ...bundle, updatedAt };
  await pool.query(
    `INSERT INTO calendar_user_data (user_id, bundle, updated_at)
     VALUES ($1, $2::jsonb, COALESCE($3::timestamptz, NOW()))
     ON CONFLICT (user_id) DO UPDATE SET
       bundle = EXCLUDED.bundle,
       updated_at = EXCLUDED.updated_at`,
    [String(userId), JSON.stringify(payload), updatedAt],
  );
  return getCalendarBundleForUser(pool, userId);
};

export const deleteCalendarBundleForUser = async (pool, userId) => {
  const result = await pool.query(`DELETE FROM calendar_user_data WHERE user_id = $1`, [
    String(userId),
  ]);
  return Number(result.rowCount || 0);
};

export const countCalendarUserData = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM calendar_user_data`);
  return Number(result.rows[0]?.n || 0);
};

export const importCalendarBundleIfAbsent = async (pool, userId, bundle) => {
  const id = String(userId || '').trim();
  if (!id || !bundle || typeof bundle !== 'object') return 'skipped_invalid';
  const existing = await pool.query(`SELECT user_id FROM calendar_user_data WHERE user_id = $1`, [id]);
  if (existing.rows[0]) return 'skipped_exists';
  await upsertCalendarBundleForUser(pool, id, bundle);
  return 'inserted';
};

export const initCalendarUserDataRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureCalendarUserDataTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
