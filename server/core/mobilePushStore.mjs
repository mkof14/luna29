/**
 * WS1.6 — Durable mobile push registrations.
 * Tokens are sensitive: never log raw token values.
 * Token is not identity authority.
 */

export const MOBILE_PUSH_TABLE = 'mobile_push_registrations';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS mobile_push_registrations (
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT,
  device_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, token)
);
CREATE INDEX IF NOT EXISTS mobile_push_user_updated_idx
  ON mobile_push_registrations (user_id, updated_at DESC);
`;

let schemaReady = false;

export const __resetMobilePushSchemaForTests = () => {
  schemaReady = false;
};

export const ensureMobilePushTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[mobile-push] schema init failed:',
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

const rowToToken = (row) => {
  if (!row) return null;
  return {
    token: String(row.token),
    platform: String(row.platform || 'unknown'),
    deviceName: row.device_name == null ? '' : String(row.device_name),
    updatedAt: toIso(row.updated_at) || new Date().toISOString(),
  };
};

export const listMobilePushTokensForUser = async (pool, userId, { limit = 10 } = {}) => {
  const result = await pool.query(
    `SELECT * FROM mobile_push_registrations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2`,
    [String(userId), Math.max(1, Math.min(10, Number(limit) || 10))],
  );
  return result.rows.map(rowToToken);
};

export const upsertMobilePushToken = async (pool, userId, { token, platform, deviceName }) => {
  const updatedAt = new Date().toISOString();
  await pool.query(
    `INSERT INTO mobile_push_registrations (user_id, token, platform, device_name, updated_at, created_at)
     VALUES ($1, $2, $3, $4, $5::timestamptz, NOW())
     ON CONFLICT (user_id, token) DO UPDATE SET
       platform = EXCLUDED.platform,
       device_name = EXCLUDED.device_name,
       updated_at = EXCLUDED.updated_at`,
    [
      String(userId),
      String(token).slice(0, 512),
      String(platform || 'unknown').slice(0, 32),
      deviceName ? String(deviceName).slice(0, 120) : null,
      updatedAt,
    ],
  );

  // Cap at 10 tokens per user — delete oldest beyond cap (targeted, no NOT IN).
  const overflow = await pool.query(
    `SELECT token FROM mobile_push_registrations
     WHERE user_id = $1
     ORDER BY updated_at DESC
     OFFSET 10`,
    [String(userId)],
  );
  for (const row of overflow.rows) {
    await pool.query(`DELETE FROM mobile_push_registrations WHERE user_id = $1 AND token = $2`, [
      String(userId),
      row.token,
    ]);
  }

  return listMobilePushTokensForUser(pool, userId);
};

export const deleteMobilePushTokenOwned = async (pool, userId, token) => {
  const result = await pool.query(
    `DELETE FROM mobile_push_registrations WHERE user_id = $1 AND token = $2 RETURNING token`,
    [String(userId), String(token)],
  );
  return Boolean(result.rows[0]);
};

export const deleteAllMobilePushTokensForUser = async (pool, userId) => {
  const result = await pool.query(`DELETE FROM mobile_push_registrations WHERE user_id = $1`, [
    String(userId),
  ]);
  return Number(result.rowCount || 0);
};

export const countMobilePushRegistrations = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM mobile_push_registrations`);
  return Number(result.rows[0]?.n || 0);
};

export const importMobilePushTokenIfAbsent = async (pool, userId, item) => {
  const uid = String(userId || '').trim();
  const token = String(item?.token || '').trim();
  if (!uid || !token) return 'skipped_invalid';
  const existing = await pool.query(
    `SELECT token FROM mobile_push_registrations WHERE user_id = $1 AND token = $2`,
    [uid, token],
  );
  if (existing.rows[0]) return 'skipped_exists';
  await upsertMobilePushToken(pool, uid, {
    token,
    platform: item.platform,
    deviceName: item.deviceName,
  });
  return 'inserted';
};

export const initMobilePushRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureMobilePushTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
