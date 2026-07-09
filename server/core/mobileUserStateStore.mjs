/**
 * WS1.6 — Durable mobile section state (one row per user+section).
 * Does not duplicate auth_users identity or role authority.
 */

export const MOBILE_USER_STATE_TABLE = 'mobile_user_state';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS mobile_user_state (
  user_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  data JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, section_key)
);
CREATE INDEX IF NOT EXISTS mobile_user_state_user_idx ON mobile_user_state (user_id);
`;

let schemaReady = false;

export const __resetMobileUserStateSchemaForTests = () => {
  schemaReady = false;
};

export const ensureMobileUserStateTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[mobile-user-state] schema init failed:',
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

export const getMobileStateSection = async (pool, userId, sectionKey) => {
  const result = await pool.query(
    `SELECT data, updated_at FROM mobile_user_state WHERE user_id = $1 AND section_key = $2 LIMIT 1`,
    [String(userId), String(sectionKey)],
  );
  const row = result.rows[0];
  if (!row) return { data: null, updatedAt: null };
  return { data: row.data ?? null, updatedAt: toIso(row.updated_at) };
};

export const listMobileStateSections = async (pool, userId) => {
  const result = await pool.query(
    `SELECT section_key, data, updated_at FROM mobile_user_state WHERE user_id = $1`,
    [String(userId)],
  );
  const sections = {};
  let latest = null;
  for (const row of result.rows) {
    sections[String(row.section_key)] = row.data ?? null;
    const at = toIso(row.updated_at);
    if (at && (!latest || at > latest)) latest = at;
  }
  return { sections, updatedAt: latest || new Date().toISOString() };
};

export const upsertMobileStateSection = async (pool, userId, sectionKey, data) => {
  const updatedAt = new Date().toISOString();
  await pool.query(
    `INSERT INTO mobile_user_state (user_id, section_key, data, updated_at)
     VALUES ($1, $2, $3::jsonb, $4::timestamptz)
     ON CONFLICT (user_id, section_key) DO UPDATE SET
       data = EXCLUDED.data,
       updated_at = EXCLUDED.updated_at`,
    [
      String(userId),
      String(sectionKey),
      data === undefined ? null : JSON.stringify(data),
      updatedAt,
    ],
  );
  return getMobileStateSection(pool, userId, sectionKey);
};

export const countMobileUserState = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM mobile_user_state`);
  return Number(result.rows[0]?.n || 0);
};

export const importMobileStateSectionIfAbsent = async (pool, userId, sectionKey, data) => {
  const uid = String(userId || '').trim();
  const section = String(sectionKey || '').trim();
  if (!uid || !section) return 'skipped_invalid';
  const existing = await pool.query(
    `SELECT user_id FROM mobile_user_state WHERE user_id = $1 AND section_key = $2`,
    [uid, section],
  );
  if (existing.rows[0]) return 'skipped_exists';
  await upsertMobileStateSection(pool, uid, section, data);
  return 'inserted';
};

export const initMobileUserStateRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureMobileUserStateTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
