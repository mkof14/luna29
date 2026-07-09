/**
 * WS1.6 — Durable mobile reflection entries + display name meta.
 * Ownership: authenticated user_id only.
 */

export const MOBILE_REFLECTIONS_TABLE = 'mobile_reflections';
export const MOBILE_REFLECTION_META_TABLE = 'mobile_reflection_meta';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS mobile_reflection_meta (
  user_id TEXT PRIMARY KEY,
  display_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS mobile_reflections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  body TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS mobile_reflections_user_occurred_idx
  ON mobile_reflections (user_id, occurred_at DESC);
`;

let schemaReady = false;

export const __resetMobileReflectionsSchemaForTests = () => {
  schemaReady = false;
};

export const ensureMobileReflectionsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[mobile-reflections] schema init failed:',
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

const rowToEntry = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    at: toIso(row.occurred_at) || new Date().toISOString(),
    mode: ['voice', 'quick_checkin', 'write'].includes(row.mode) ? row.mode : 'voice',
    text: String(row.body || ''),
  };
};

export const ensureMobileReflectionMeta = async (pool, userId, displayName) => {
  await pool.query(
    `INSERT INTO mobile_reflection_meta (user_id, display_name, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       display_name = COALESCE(EXCLUDED.display_name, mobile_reflection_meta.display_name),
       updated_at = NOW()`,
    [String(userId), displayName || null],
  );
};

export const getMobileReflectionProfile = async (pool, userId, { limit = 200 } = {}) => {
  const uid = String(userId);
  const meta = await pool.query(
    `SELECT display_name, updated_at FROM mobile_reflection_meta WHERE user_id = $1`,
    [uid],
  );
  const entriesResult = await pool.query(
    `SELECT * FROM mobile_reflections WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT $2`,
    [uid, Math.max(1, Math.min(200, Number(limit) || 200))],
  );
  return {
    name: meta.rows[0]?.display_name || 'Anna',
    entries: entriesResult.rows.map(rowToEntry),
    updatedAt: toIso(meta.rows[0]?.updated_at) || new Date().toISOString(),
  };
};

export const insertMobileReflection = async (pool, userId, entry) => {
  const id = String(entry.id);
  await pool.query(
    `INSERT INTO mobile_reflections (id, user_id, mode, body, occurred_at, created_at)
     VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, NOW()), NOW())
     ON CONFLICT (id) DO NOTHING`,
    [
      id,
      String(userId),
      entry.mode || 'voice',
      String(entry.text || '').slice(0, 500),
      entry.at || null,
    ],
  );
  await pool.query(
    `UPDATE mobile_reflection_meta SET updated_at = NOW() WHERE user_id = $1`,
    [String(userId)],
  );
  return getMobileReflectionProfile(pool, userId);
};

export const deleteMobileReflectionOwned = async (pool, userId, entryId) => {
  const result = await pool.query(
    `DELETE FROM mobile_reflections WHERE id = $1 AND user_id = $2 RETURNING id`,
    [String(entryId), String(userId)],
  );
  return Boolean(result.rows[0]);
};

/** Account deletion: remove all reflections + meta for one user. */
export const deleteAllMobileReflectionsForUser = async (pool, userId) => {
  const uid = String(userId);
  const reflections = await pool.query(`DELETE FROM mobile_reflections WHERE user_id = $1`, [uid]);
  const meta = await pool.query(`DELETE FROM mobile_reflection_meta WHERE user_id = $1`, [uid]);
  return {
    reflections: Number(reflections.rowCount || 0),
    meta: Number(meta.rowCount || 0),
  };
};

export const countMobileReflections = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM mobile_reflections`);
  return Number(result.rows[0]?.n || 0);
};

export const countMobileReflectionMeta = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM mobile_reflection_meta`);
  return Number(result.rows[0]?.n || 0);
};

export const importMobileReflectionIfAbsent = async (pool, userId, entry) => {
  const uid = String(userId || '').trim();
  const id = String(entry?.id || '').trim();
  const text = String(entry?.text || '').trim();
  if (!uid || !id || !text) return 'skipped_invalid';
  const existing = await pool.query(`SELECT id FROM mobile_reflections WHERE id = $1`, [id]);
  if (existing.rows[0]) return 'skipped_exists';
  await ensureMobileReflectionMeta(pool, uid, null);
  await insertMobileReflection(pool, uid, entry);
  return 'inserted';
};

export const initMobileReflectionsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureMobileReflectionsTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
