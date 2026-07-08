/**
 * Optional Postgres persistence (Neon/serverless).
 * Personal events never silently fall back to JSON when Postgres is unavailable —
 * see personalEventsStore.mjs for fail-closed production behavior.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

let pgPool = null;
let personalEventsReady = false;
let personalEventsInitError = null;

const initPg = async () => {
  const url = String(process.env.DATABASE_URL || '').trim();
  if (!url) return null;
  if (pgPool) return pgPool;
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: url,
      ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    // Probe connectivity before caching the pool.
    await pool.query('SELECT 1');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS luna_kv (
        namespace TEXT NOT NULL,
        key TEXT NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (namespace, key)
      );
      CREATE TABLE IF NOT EXISTS luna_trials (
        user_id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        started_at TIMESTAMPTZ NOT NULL,
        ends_at TIMESTAMPTZ NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
      );
    `);
    pgPool = pool;
    return pgPool;
  } catch (error) {
    // Do not cache a failed pool. Callers decide fail-closed vs other stores.
    console.warn(
      '[luna-db] Postgres unavailable:',
      error instanceof Error ? error.message.slice(0, 160) : 'connection_failed',
    );
    pgPool = null;
    return null;
  }
};

export const isDatabaseEnabled = () => Boolean(String(process.env.DATABASE_URL || '').trim());

export const getPgPool = async () => initPg();

/**
 * Structured pool status for personal-events fail-closed decisions.
 * Never returns credentials or connection strings.
 */
let pgPoolStatusOverride = null;
export const __setPgPoolStatusForTests = (value) => {
  pgPoolStatusOverride = value;
};

export const getPgPoolStatus = async () => {
  if (pgPoolStatusOverride !== null) return pgPoolStatusOverride;
  if (!isDatabaseEnabled()) {
    return { pool: null, category: 'database_missing' };
  }
  const pool = await initPg();
  if (!pool) {
    return { pool: null, category: 'database_connection_failed' };
  }
  return { pool, category: 'ok' };
};


export const getPersonalEventsInitError = () => personalEventsInitError;

/**
 * Authenticated personal event foundation table.
 * Ownership is always user_id from verified server auth — never client-supplied.
 * Runtime initialization is idempotent. Schema creation is hybrid: CREATE IF NOT EXISTS on first use.
 */
export const ensurePersonalEventsTable = async () => {
  if (personalEventsReady) return true;
  const pool = await initPg();
  if (!pool) {
    personalEventsInitError = 'connection_failed_or_missing';
    return false;
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personal_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        source TEXT NOT NULL DEFAULT 'api',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        schema_version INTEGER NOT NULL DEFAULT 1,
        client_event_id TEXT,
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS personal_events_user_occurred_idx
        ON personal_events (user_id, occurred_at DESC);
      CREATE INDEX IF NOT EXISTS personal_events_user_type_idx
        ON personal_events (user_id, event_type);
      CREATE UNIQUE INDEX IF NOT EXISTS personal_events_user_client_id_active_uidx
        ON personal_events (user_id, client_event_id)
        WHERE client_event_id IS NOT NULL AND deleted_at IS NULL;
    `);
    personalEventsReady = true;
    personalEventsInitError = null;
    return true;
  } catch (error) {
    personalEventsReady = false;
    personalEventsInitError = 'schema_init_failed';
    console.warn(
      '[luna-db] personal_events schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

/** Test helper — reset cached pool/schema state between isolated tests. */
export const __resetDatabaseStateForTests = () => {
  pgPool = null;
  personalEventsReady = false;
  personalEventsInitError = null;
  pgPoolStatusOverride = null;
};

export const dbGetJson = async (namespace, key, filePath, fallback) => {
  const pool = await initPg();
  if (pool) {
    const result = await pool.query('SELECT value FROM luna_kv WHERE namespace = $1 AND key = $2', [namespace, key]);
    if (result.rows[0]?.value) return result.rows[0].value;
    return fallback;
  }
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const dbSetJson = async (namespace, key, filePath, value) => {
  const pool = await initPg();
  if (pool) {
    await pool.query(
      `INSERT INTO luna_kv (namespace, key, value, updated_at) VALUES ($1, $2, $3, NOW())
       ON CONFLICT (namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [namespace, key, value],
    );
    return;
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
};

export const dbGetTrial = async (userId) => {
  const pool = await initPg();
  if (!pool) return null;
  const result = await pool.query('SELECT * FROM luna_trials WHERE user_id = $1 LIMIT 1', [userId]);
  return result.rows[0] || null;
};

export const dbUpsertTrial = async ({ userId, email, startedAt, endsAt, status = 'active' }) => {
  const pool = await initPg();
  if (!pool) return null;
  await pool.query(
    `INSERT INTO luna_trials (user_id, email, started_at, ends_at, status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET ends_at = EXCLUDED.ends_at, status = EXCLUDED.status`,
    [userId, email, startedAt, endsAt, status],
  );
  return { userId, email, startedAt, endsAt, status };
};
