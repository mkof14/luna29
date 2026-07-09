/**
 * WS1.5 — Durable admin audit events (append-only).
 */

export const ADMIN_AUDIT_TABLE = 'admin_audit_events';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_audit_events (
  id TEXT PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_audit_events_at_idx ON admin_audit_events (at DESC);
`;

let schemaReady = false;

export const __resetAdminAuditSchemaForTests = () => {
  schemaReady = false;
};

export const ensureAdminAuditTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[admin-audit] schema init failed:',
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

const rowToAudit = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    at: toIso(row.at) || new Date().toISOString(),
    actorEmail: row.actor_email == null ? undefined : String(row.actor_email),
    actorRole: row.actor_role == null ? undefined : String(row.actor_role),
    action: String(row.action || ''),
    details: row.details == null ? undefined : String(row.details).slice(0, 500),
  };
};

export const appendAdminAuditEvent = async (pool, entry) => {
  const id =
    String(entry.id || '').trim() ||
    `aud-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const at = entry.at || new Date().toISOString();
  // Never persist secrets — truncate details.
  const details = entry.details == null ? null : String(entry.details).slice(0, 500);
  await pool.query(
    `INSERT INTO admin_audit_events (id, at, actor_email, actor_role, action, details, created_at)
     VALUES ($1, $2::timestamptz, $3, $4, $5, $6, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [
      id,
      at,
      entry.actorEmail || null,
      entry.actorRole || null,
      String(entry.action || 'unknown').slice(0, 120),
      details,
    ],
  );
  const result = await pool.query(`SELECT * FROM admin_audit_events WHERE id = $1`, [id]);
  return rowToAudit(result.rows[0]);
};

export const listAdminAuditEvents = async (pool, { limit = 500 } = {}) => {
  const result = await pool.query(
    `SELECT * FROM admin_audit_events ORDER BY at DESC LIMIT $1`,
    [Math.max(1, Math.min(500, Number(limit) || 500))],
  );
  return result.rows.map(rowToAudit);
};

export const countAdminAuditEvents = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM admin_audit_events`);
  return Number(result.rows[0]?.n || 0);
};

/**
 * WS2.2 — Anonymize actor_email and scrub plaintext email from details.
 * Keeps audit history; removes plaintext email from actor + details text.
 */
export const anonymizeAdminAuditActorEmail = async (pool, email, anonymizedEmail) => {
  const normalized = String(email || '').toLowerCase();
  const marker = String(anonymizedEmail || '').slice(0, 320);
  if (!normalized || !marker) return 0;
  // Escape regex metacharacters for case-insensitive email scrub in details.
  const emailPattern = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const result = await pool.query(
    `UPDATE admin_audit_events
     SET
       actor_email = CASE
         WHEN actor_email IS NOT NULL AND LOWER(actor_email) = $1 THEN $2
         ELSE actor_email
       END,
       details = CASE
         WHEN details IS NOT NULL AND POSITION($1 IN LOWER(details)) > 0
         THEN regexp_replace(details, $3, $2, 'gi')
         ELSE details
       END
     WHERE (actor_email IS NOT NULL AND LOWER(actor_email) = $1)
        OR (details IS NOT NULL AND POSITION($1 IN LOWER(details)) > 0)`,
    [normalized, marker, emailPattern],
  );
  return Number(result.rowCount || 0);
};

export const importAdminAuditIfAbsent = async (pool, raw) => {
  const id = String(raw?.id || '').trim();
  const action = String(raw?.action || '').trim();
  if (!id || !action) return 'skipped_invalid';
  const existing = await pool.query(`SELECT id FROM admin_audit_events WHERE id = $1`, [id]);
  if (existing.rows[0]) return 'skipped_exists';
  await appendAdminAuditEvent(pool, {
    id,
    at: raw.at,
    actorEmail: raw.actorEmail,
    actorRole: raw.actorRole,
    action,
    details: raw.details,
  });
  return 'inserted';
};

export const initAdminAuditRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureAdminAuditTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
