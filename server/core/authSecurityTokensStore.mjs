/**
 * Password-reset and email-verification tokens for Closed Paid Beta.
 * Single-use, time-limited. No health data stored.
 */

import { randomBytes, createHash } from 'node:crypto';

export const AUTH_SECURITY_TOKENS_TABLE = 'auth_security_tokens';
export const DEFAULT_AUTH_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS auth_security_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  kind TEXT NOT NULL,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_security_tokens_email_idx ON auth_security_tokens (LOWER(email));
CREATE INDEX IF NOT EXISTS auth_security_tokens_kind_idx ON auth_security_tokens (kind, status);
`;

let schemaReady = false;
/** @type {Map<string, object>} */
const memoryTokens = new Map();

export const __resetAuthSecurityTokensForTests = () => {
  schemaReady = false;
  memoryTokens.clear();
};

export const ensureAuthSecurityTokensTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[auth-tokens] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

export const hashAuthToken = (rawToken) =>
  createHash('sha256').update(String(rawToken || '')).digest('hex');

export const generateAuthToken = (prefix = 'tok') => {
  const safePrefix = String(prefix || 'tok').replace(/[^a-z0-9_-]/gi, '').slice(0, 12) || 'tok';
  return `${safePrefix}_${randomBytes(24).toString('hex')}`;
};

const toIso = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const rowToToken = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    tokenHash: String(row.token_hash),
    email: String(row.email || '').toLowerCase(),
    kind: String(row.kind),
    userId: row.user_id == null ? null : String(row.user_id),
    status: String(row.status || 'pending'),
    expiresAt: toIso(row.expires_at),
    consumedAt: toIso(row.consumed_at),
    createdAt: toIso(row.created_at),
  };
};

export const createAuthSecurityToken = async (
  pool,
  { email, kind, userId = null, ttlMs = DEFAULT_AUTH_TOKEN_TTL_MS },
) => {
  const rawToken = generateAuthToken(kind === 'email_verify' ? 'verify' : 'reset');
  const tokenHash = hashAuthToken(rawToken);
  const id = generateAuthToken('ast');
  const expiresAt = new Date(Date.now() + Math.max(60_000, Number(ttlMs) || DEFAULT_AUTH_TOKEN_TTL_MS)).toISOString();
  const emailNorm = String(email || '').toLowerCase();
  const record = {
    id,
    token_hash: tokenHash,
    email: emailNorm,
    kind: kind === 'email_verify' ? 'email_verify' : 'password_reset',
    user_id: userId,
    status: 'pending',
    expires_at: expiresAt,
    consumed_at: null,
    created_at: new Date().toISOString(),
  };

  if (pool && (await ensureAuthSecurityTokensTable(pool))) {
    await pool.query(
      `INSERT INTO auth_security_tokens
        (id, token_hash, email, kind, user_id, status, expires_at, created_at)
       VALUES ($1,$2,$3,$4,$5,'pending',$6::timestamptz,NOW())`,
      [id, tokenHash, emailNorm, record.kind, userId, expiresAt],
    );
  } else {
    memoryTokens.set(tokenHash, record);
  }

  return { rawToken, expiresAt, kind: record.kind, email: emailNorm };
};

export const consumeAuthSecurityToken = async (pool, { rawToken, kind }) => {
  const tokenHash = hashAuthToken(rawToken);
  const expectedKind = kind === 'email_verify' ? 'email_verify' : 'password_reset';
  const now = Date.now();

  if (pool && (await ensureAuthSecurityTokensTable(pool))) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const locked = await client.query(
        `SELECT * FROM auth_security_tokens WHERE token_hash = $1 FOR UPDATE`,
        [tokenHash],
      );
      const row = locked.rows[0];
      if (!row) {
        await client.query('ROLLBACK');
        return { ok: false, reason: 'invalid_token' };
      }
      const token = rowToToken(row);
      if (token.kind !== expectedKind) {
        await client.query('ROLLBACK');
        return { ok: false, reason: 'invalid_token' };
      }
      if (token.status !== 'pending') {
        await client.query('ROLLBACK');
        return { ok: false, reason: 'already_consumed' };
      }
      if (token.expiresAt && new Date(token.expiresAt).getTime() <= now) {
        await client.query(
          `UPDATE auth_security_tokens SET status = 'expired' WHERE id = $1`,
          [token.id],
        );
        await client.query('COMMIT');
        return { ok: false, reason: 'expired' };
      }
      await client.query(
        `UPDATE auth_security_tokens
         SET status = 'consumed', consumed_at = NOW()
         WHERE id = $1 AND status = 'pending'`,
        [token.id],
      );
      await client.query('COMMIT');
      return { ok: true, token };
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* ignore */
      }
      throw error;
    } finally {
      client.release();
    }
  }

  const mem = memoryTokens.get(tokenHash);
  if (!mem || mem.kind !== expectedKind) return { ok: false, reason: 'invalid_token' };
  if (mem.status !== 'pending') return { ok: false, reason: 'already_consumed' };
  if (mem.expires_at && new Date(mem.expires_at).getTime() <= now) {
    mem.status = 'expired';
    return { ok: false, reason: 'expired' };
  }
  mem.status = 'consumed';
  mem.consumed_at = new Date().toISOString();
  return { ok: true, token: rowToToken(mem) };
};
