/**
 * WS1.5 — Durable admin/site invites.
 * Tokens are cryptographically random; admin invites are single-use with expiry.
 */

import { randomBytes } from 'node:crypto';

export const ADMIN_INVITES_TABLE = 'admin_invites';
export const DEFAULT_ADMIN_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_invites (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  kind TEXT NOT NULL,
  role TEXT,
  invite_link TEXT,
  delivered BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_invites_email_idx ON admin_invites (LOWER(email));
CREATE INDEX IF NOT EXISTS admin_invites_status_idx ON admin_invites (status);
`;

let schemaReady = false;

export const __resetAdminInvitesSchemaForTests = () => {
  schemaReady = false;
};

export const ensureAdminInvitesTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[admin-invites] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

export const generateInviteToken = (prefix = 'inv') => {
  const safePrefix = String(prefix || 'inv').replace(/[^a-z0-9_-]/gi, '').slice(0, 12) || 'inv';
  return `${safePrefix}_${randomBytes(24).toString('hex')}`;
};

const toIso = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const rowToInvite = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email || '').toLowerCase(),
    kind: row.kind === 'admin' ? 'admin' : 'site',
    role: row.role == null ? undefined : String(row.role),
    inviteLink: row.invite_link == null ? undefined : String(row.invite_link),
    delivered: Boolean(row.delivered),
    status: String(row.status || 'pending'),
    createdAt: toIso(row.created_at) || undefined,
    createdBy: row.created_by == null ? undefined : String(row.created_by),
    expiresAt: toIso(row.expires_at) || undefined,
    acceptedAt: toIso(row.accepted_at) || undefined,
  };
};

export const insertAdminInvite = async (pool, invite) => {
  const id = String(invite.id);
  const email = String(invite.email || '').toLowerCase();
  const kind = invite.kind === 'admin' ? 'admin' : 'site';
  await pool.query(
    `INSERT INTO admin_invites (
       id, email, kind, role, invite_link, delivered, status, created_at, created_by, expires_at, accepted_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()), $9, $10::timestamptz, $11::timestamptz, NOW()
     )
     ON CONFLICT (id) DO NOTHING`,
    [
      id,
      email,
      kind,
      invite.role || null,
      invite.inviteLink || null,
      Boolean(invite.delivered),
      invite.status || 'pending',
      invite.createdAt || null,
      invite.createdBy || null,
      invite.expiresAt || null,
      invite.acceptedAt || null,
    ],
  );
  return getAdminInviteById(pool, id);
};

export const getAdminInviteById = async (pool, id) => {
  const result = await pool.query(`SELECT * FROM admin_invites WHERE id = $1 LIMIT 1`, [String(id)]);
  return rowToInvite(result.rows[0]);
};

export const updateAdminInviteDelivered = async (pool, id, delivered) => {
  const result = await pool.query(
    `UPDATE admin_invites SET delivered = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [String(id), Boolean(delivered)],
  );
  return rowToInvite(result.rows[0]);
};

export const listAdminInvites = async (pool, { limit = 100 } = {}) => {
  const result = await pool.query(
    `SELECT * FROM admin_invites ORDER BY created_at DESC LIMIT $1`,
    [Math.max(1, Math.min(500, Number(limit) || 100))],
  );
  return result.rows.map(rowToInvite);
};

/**
 * Read-only validation for admin invite consumption (does not mutate).
 * @returns {{ ok: true, invite } | { ok: false, reason: string, invite?: object }}
 */
export const validateAdminInviteForConsume = async (pool, { inviteId, email, now = new Date() }) => {
  const id = String(inviteId || '');
  const normalizedEmail = String(email || '').toLowerCase();
  if (!id) return { ok: false, reason: 'unknown_invite' };
  const invite = await getAdminInviteById(pool, id);
  if (!invite) return { ok: false, reason: 'unknown_invite' };
  if (invite.kind !== 'admin') return { ok: false, reason: 'not_admin_invite', invite };
  if (invite.status === 'accepted' || invite.status === 'consumed') {
    return { ok: false, reason: 'already_consumed', invite };
  }
  if (invite.status === 'expired' || invite.status === 'revoked') {
    return { ok: false, reason: invite.status, invite };
  }
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() <= now.getTime()) {
    return { ok: false, reason: 'expired', invite };
  }
  if (invite.email && normalizedEmail && invite.email !== normalizedEmail) {
    return { ok: false, reason: 'email_mismatch', invite };
  }
  return { ok: true, invite };
};

/**
 * Atomically consume an admin invite (single-use).
 * @returns {{ ok: true, invite } | { ok: false, reason: string, invite?: object }}
 */
export const consumeAdminInvite = async (pool, { inviteId, email, now = new Date() }) => {
  const id = String(inviteId || '');
  const normalizedEmail = String(email || '').toLowerCase();
  if (!id) return { ok: false, reason: 'unknown_invite' };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query(`SELECT * FROM admin_invites WHERE id = $1 FOR UPDATE`, [id]);
    const row = locked.rows[0];
    if (!row) {
      await client.query('ROLLBACK');
      return { ok: false, reason: 'unknown_invite' };
    }
    const invite = rowToInvite(row);
    if (invite.kind !== 'admin') {
      await client.query('ROLLBACK');
      return { ok: false, reason: 'not_admin_invite', invite };
    }
    if (invite.status === 'accepted' || invite.status === 'consumed') {
      await client.query('ROLLBACK');
      return { ok: false, reason: 'already_consumed', invite };
    }
    if (invite.status === 'expired' || invite.status === 'revoked') {
      await client.query('ROLLBACK');
      return { ok: false, reason: invite.status, invite };
    }
    if (invite.expiresAt && new Date(invite.expiresAt).getTime() <= now.getTime()) {
      await client.query(
        `UPDATE admin_invites SET status = 'expired', updated_at = NOW() WHERE id = $1`,
        [id],
      );
      await client.query('COMMIT');
      return { ok: false, reason: 'expired', invite: { ...invite, status: 'expired' } };
    }
    if (invite.email && normalizedEmail && invite.email !== normalizedEmail) {
      await client.query('ROLLBACK');
      return { ok: false, reason: 'email_mismatch', invite };
    }

    const acceptedAt = now.toISOString();
    const updated = await client.query(
      `UPDATE admin_invites SET
         status = 'accepted',
         accepted_at = $2::timestamptz,
         updated_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id, acceptedAt],
    );
    if (!updated.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, reason: 'already_consumed', invite };
    }
    await client.query('COMMIT');
    return { ok: true, invite: rowToInvite(updated.rows[0]) };
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
};

export const countAdminInvites = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM admin_invites`);
  return Number(result.rows[0]?.n || 0);
};

export const importAdminInviteIfAbsent = async (pool, raw) => {
  const id = String(raw?.id || '').trim();
  const email = String(raw?.email || '').trim().toLowerCase();
  if (!id || !email.includes('@')) return 'skipped_invalid';
  const existing = await getAdminInviteById(pool, id);
  if (existing) return 'skipped_exists';

  // Legacy predictable tokens: import as expired so they cannot grant privilege.
  const looksLegacyPredictable = /^(adm|site)-\d+$/.test(id);
  const status = looksLegacyPredictable
    ? 'expired'
    : raw?.status === 'accepted'
      ? 'accepted'
      : 'pending';
  const expiresAt =
    raw?.expiresAt ||
    (looksLegacyPredictable ? new Date().toISOString() : null);

  await insertAdminInvite(pool, {
    id,
    email,
    kind: raw?.kind === 'admin' ? 'admin' : 'site',
    role: raw?.role,
    inviteLink: raw?.inviteLink,
    delivered: Boolean(raw?.delivered),
    status,
    createdAt: raw?.createdAt,
    createdBy: raw?.createdBy,
    expiresAt,
    acceptedAt: raw?.acceptedAt,
  });
  return 'inserted';
};

export const initAdminInvitesRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureAdminInvitesTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
