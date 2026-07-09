/**
 * WS1.2 — Durable auth users repository (Postgres).
 * Shared pool via database.mjs. JSON mode remains for dev/test only.
 */

import { getPgPoolStatus } from './database.mjs';

export const AUTH_USERS_TABLE = 'auth_users';

const USERS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role_override TEXT,
  last_provider TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_uidx ON auth_users (LOWER(email));
`;

let authUsersSchemaReady = false;

export const __resetAuthUsersSchemaForTests = () => {
  authUsersSchemaReady = false;
};

export const ensureAuthUsersTable = async (pool) => {
  if (authUsersSchemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(USERS_SCHEMA_SQL);
    authUsersSchemaReady = true;
    return true;
  } catch (error) {
    authUsersSchemaReady = false;
    console.warn(
      '[auth-users] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

const rowToUser = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email || '').toLowerCase(),
    name: row.name == null ? undefined : String(row.name),
    passwordHash: row.password_hash == null ? null : String(row.password_hash),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    roleOverride: row.role_override == null ? null : String(row.role_override),
    lastProvider: row.last_provider == null ? undefined : String(row.last_provider),
    avatarUrl: row.avatar_url == null ? undefined : String(row.avatar_url),
  };
};

/**
 * Load all users from Postgres (same shape as users.json array).
 */
export const loadUsersFromPostgres = async (pool) => {
  const result = await pool.query(
    `SELECT id, email, name, password_hash, created_at, role_override, last_provider, avatar_url
     FROM auth_users
     ORDER BY created_at DESC`,
  );
  return result.rows.map(rowToUser);
};

/**
 * Upsert-only sync (no delete-missing).
 * Full-array replace-set caused lost updates under concurrent auth writes.
 * Removals must call deleteUserFromPostgres explicitly.
 */
export const saveUsersToPostgres = async (pool, users) => {
  const list = Array.isArray(users) ? users : [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const raw of list) {
      if (!raw?.id || !raw?.email) continue;
      const id = String(raw.id);
      await client.query(
        `INSERT INTO auth_users (
           id, email, name, password_hash, created_at, role_override, last_provider, avatar_url, updated_at
         ) VALUES ($1, $2, $3, $4, $5::timestamptz, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash,
           role_override = EXCLUDED.role_override,
           last_provider = EXCLUDED.last_provider,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = NOW()`,
        [
          id,
          String(raw.email).toLowerCase(),
          raw.name == null ? null : String(raw.name),
          raw.passwordHash == null ? null : String(raw.passwordHash),
          raw.createdAt || new Date().toISOString(),
          raw.roleOverride == null ? null : String(raw.roleOverride),
          raw.lastProvider == null ? null : String(raw.lastProvider),
          raw.avatarUrl == null ? null : String(raw.avatarUrl),
        ],
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

export const getUserByIdFromPostgres = async (pool, userId) => {
  if (!pool || !userId) return null;
  const result = await pool.query(
    `SELECT id, email, name, password_hash, created_at, role_override, last_provider, avatar_url
     FROM auth_users WHERE id = $1 LIMIT 1`,
    [String(userId)],
  );
  return rowToUser(result.rows[0]);
};

export const getUserByEmailFromPostgres = async (pool, email) => {
  if (!pool || !email) return null;
  const result = await pool.query(
    `SELECT id, email, name, password_hash, created_at, role_override, last_provider, avatar_url
     FROM auth_users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [String(email).trim()],
  );
  return rowToUser(result.rows[0]);
};

export const deleteUserFromPostgres = async (pool, userId) => {
  if (!pool || !userId) return;
  await pool.query('DELETE FROM auth_users WHERE id = $1', [String(userId)]);
};

export const countAuthUsers = async (pool) => {
  const result = await pool.query('SELECT COUNT(*)::int AS n FROM auth_users');
  return Number(result.rows[0]?.n || 0);
};

/**
 * Initialize users repository. Uses shared getPgPoolStatus pool only.
 */
export const initAuthUsersRepository = async ({ mode, pool = null } = {}) => {
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
  const ready = await ensureAuthUsersTable(status.pool);
  if (!ready) {
    return { ok: false, mode: 'unavailable', reason: 'schema_init_failed', pool: status.pool };
  }
  return { ok: true, mode: 'postgres', pool: status.pool };
};
