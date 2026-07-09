/**
 * WS1.2 — Durable auth sessions repository (Postgres).
 * Token format unchanged (opaque hex). Shared pool via database.mjs.
 */

import { getPgPoolStatus } from './database.mjs';

export const AUTH_SESSIONS_TABLE = 'auth_sessions';

const SESSIONS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS auth_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  max_age_sec INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions (expires_at);
`;

let authSessionsSchemaReady = false;

export const __resetAuthSessionsSchemaForTests = () => {
  authSessionsSchemaReady = false;
};

export const ensureAuthSessionsTable = async (pool) => {
  if (authSessionsSchemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SESSIONS_SCHEMA_SQL);
    authSessionsSchemaReady = true;
    return true;
  } catch (error) {
    authSessionsSchemaReady = false;
    console.warn(
      '[auth-sessions] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

/**
 * @returns {Array<{ token: string, userId: string, expiresAt: number, maxAgeSec: number }>}
 */
export const loadSessionsFromPostgres = async (pool, { now = Date.now() } = {}) => {
  // Drop expired rows on load (compatible with prior purge-on-boot behavior).
  await pool.query('DELETE FROM auth_sessions WHERE expires_at < $1', [now]);
  const result = await pool.query(
    `SELECT token, user_id, expires_at, max_age_sec FROM auth_sessions`,
  );
  return result.rows.map((row) => ({
    token: String(row.token),
    userId: String(row.user_id),
    expiresAt: Number(row.expires_at),
    maxAgeSec: Number(row.max_age_sec) > 0 ? Number(row.max_age_sec) : 60 * 60 * 24 * 7,
  }));
};

/**
 * Upsert-only sync (no delete-missing).
 * Full-array replace-set caused lost sessions under concurrent login/logout.
 * Removals must call deleteSessionFromPostgres / deleteSessionsForUserFromPostgres.
 */
export const saveSessionsToPostgres = async (pool, sessionRows) => {
  const list = Array.isArray(sessionRows) ? sessionRows : [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const raw of list) {
      if (!raw?.token || !raw?.userId) continue;
      const token = String(raw.token);
      const expiresAt = Number(raw.expiresAt);
      const maxAgeSec = Number(raw.maxAgeSec) > 0 ? Number(raw.maxAgeSec) : 60 * 60 * 24 * 7;
      if (!Number.isFinite(expiresAt)) continue;
      await client.query(
        `INSERT INTO auth_sessions (token, user_id, expires_at, max_age_sec, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (token) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           expires_at = EXCLUDED.expires_at,
           max_age_sec = EXCLUDED.max_age_sec,
           updated_at = NOW()`,
        [token, String(raw.userId), expiresAt, maxAgeSec],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const countAuthSessions = async (pool) => {
  const result = await pool.query('SELECT COUNT(*)::int AS n FROM auth_sessions');
  return Number(result.rows[0]?.n || 0);
};

/**
 * Lookup one session by token (for multi-instance Map miss).
 * @returns {{ token: string, userId: string, expiresAt: number, maxAgeSec: number } | null}
 */
export const getSessionRowFromPostgres = async (pool, token, { now = Date.now() } = {}) => {
  if (!pool || !token) return null;
  const result = await pool.query(
    `SELECT token, user_id, expires_at, max_age_sec FROM auth_sessions WHERE token = $1 LIMIT 1`,
    [String(token)],
  );
  const row = result.rows[0];
  if (!row) return null;
  const expiresAt = Number(row.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt < now) {
    await pool.query('DELETE FROM auth_sessions WHERE token = $1', [String(token)]);
    return null;
  }
  return {
    token: String(row.token),
    userId: String(row.user_id),
    expiresAt,
    maxAgeSec: Number(row.max_age_sec) > 0 ? Number(row.max_age_sec) : 60 * 60 * 24 * 7,
  };
};

export const deleteSessionFromPostgres = async (pool, token) => {
  if (!pool || !token) return;
  await pool.query('DELETE FROM auth_sessions WHERE token = $1', [String(token)]);
};

export const deleteSessionsForUserFromPostgres = async (pool, userId) => {
  if (!pool || !userId) return;
  await pool.query('DELETE FROM auth_sessions WHERE user_id = $1', [String(userId)]);
};

export const initAuthSessionsRepository = async ({ mode, pool = null } = {}) => {
  if (mode !== 'postgres') {
    return { ok: true, mode: 'json', pool: null };
  }
  const status = pool ? { pool, category: 'ok' } : await getPgPoolStatus();
  if (!status.pool) {
    return {
      ok: false,
      mode: 'unavailable',
      reason: status.category || 'database_missing',
      pool: null,
    };
  }
  const ready = await ensureAuthSessionsTable(status.pool);
  if (!ready) {
    return { ok: false, mode: 'unavailable', reason: 'schema_init_failed', pool: status.pool };
  }
  return { ok: true, mode: 'postgres', pool: status.pool };
};
