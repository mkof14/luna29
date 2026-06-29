/**
 * Optional Postgres persistence (Neon/serverless). Falls back to JSON files when DATABASE_URL unset.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

let pgPool = null;

const initPg = async () => {
  const url = String(process.env.DATABASE_URL || '').trim();
  if (!url || pgPool) return pgPool;
  try {
    const { Pool } = await import('pg');
    pgPool = new Pool({ connectionString: url, ssl: url.includes('localhost') ? false : { rejectUnauthorized: false } });
    await pgPool.query(`
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
    return pgPool;
  } catch (error) {
    console.warn('[luna-db] Postgres unavailable, using JSON files:', error instanceof Error ? error.message : error);
    pgPool = null;
    return null;
  }
};

export const isDatabaseEnabled = () => Boolean(String(process.env.DATABASE_URL || '').trim());

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
