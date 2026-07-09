/**
 * WS1.5 — Durable privacy / DSAR request records.
 */

export const PRIVACY_REQUESTS_TABLE = 'privacy_requests';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS privacy_requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  email TEXT NOT NULL,
  actor TEXT,
  scope TEXT,
  fields JSONB,
  consent_scopes JSONB,
  source TEXT,
  action TEXT,
  consent_version INTEGER,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS privacy_requests_email_idx ON privacy_requests (LOWER(email));
CREATE INDEX IF NOT EXISTS privacy_requests_requested_at_idx ON privacy_requests (requested_at DESC);
`;

let schemaReady = false;

export const __resetPrivacyRequestsSchemaForTests = () => {
  schemaReady = false;
};

export const ensurePrivacyRequestsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    await pool.query(`ALTER TABLE privacy_requests ADD COLUMN IF NOT EXISTS action TEXT`);
    await pool.query(`ALTER TABLE privacy_requests ADD COLUMN IF NOT EXISTS consent_version INTEGER`);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[privacy-requests] schema init failed:',
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

const rowToRequest = (row) => {
  if (!row) return null;
  const out = {
    id: String(row.id),
    type: String(row.type || ''),
    status: String(row.status || ''),
    email: String(row.email || '').toLowerCase(),
    actor: row.actor == null ? undefined : String(row.actor),
    scope: row.scope == null ? undefined : String(row.scope),
    source: row.source == null ? undefined : String(row.source),
    action: row.action == null ? undefined : String(row.action),
    requestedAt: toIso(row.requested_at) || new Date().toISOString(),
    completedAt: toIso(row.completed_at) || undefined,
  };
  if (row.fields != null) out.fields = row.fields;
  if (row.consent_scopes != null) out.scopes = row.consent_scopes;
  if (row.consent_version != null) out.consentVersion = Number(row.consent_version);
  return out;
};

export const insertPrivacyRequest = async (pool, request) => {
  const id = String(request.id);
  await pool.query(
    `INSERT INTO privacy_requests (
       id, type, status, email, actor, scope, fields, consent_scopes, source, action, consent_version,
       requested_at, completed_at, created_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11,
       COALESCE($12::timestamptz, NOW()), $13::timestamptz, NOW()
     )
     ON CONFLICT (id) DO NOTHING`,
    [
      id,
      String(request.type || '').slice(0, 40),
      String(request.status || 'completed').slice(0, 40),
      String(request.email || '').toLowerCase(),
      request.actor || null,
      request.scope || null,
      request.fields ? JSON.stringify(request.fields) : null,
      request.scopes ? JSON.stringify(request.scopes) : null,
      request.source || null,
      request.action || null,
      request.consentVersion == null ? null : Number(request.consentVersion) || null,
      request.requestedAt || null,
      request.completedAt || null,
    ],
  );
  const result = await pool.query(`SELECT * FROM privacy_requests WHERE id = $1`, [id]);
  return rowToRequest(result.rows[0]);
};

export const listPrivacyRequests = async (pool, { email = null, limit = 200 } = {}) => {
  const lim = Math.max(1, Math.min(2000, Number(limit) || 200));
  if (email) {
    const result = await pool.query(
      `SELECT * FROM privacy_requests WHERE LOWER(email) = $1 ORDER BY requested_at DESC LIMIT $2`,
      [String(email).toLowerCase(), lim],
    );
    return result.rows.map(rowToRequest);
  }
  const result = await pool.query(
    `SELECT * FROM privacy_requests ORDER BY requested_at DESC LIMIT $1`,
    [lim],
  );
  return result.rows.map(rowToRequest);
};

export const countPrivacyRequests = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM privacy_requests`);
  return Number(result.rows[0]?.n || 0);
};

export const importPrivacyRequestIfAbsent = async (pool, raw) => {
  const id = String(raw?.id || '').trim();
  const email = String(raw?.email || '').trim().toLowerCase();
  const type = String(raw?.type || '').trim();
  if (!id || !email.includes('@') || !type) return 'skipped_invalid';
  const existing = await pool.query(`SELECT id FROM privacy_requests WHERE id = $1`, [id]);
  if (existing.rows[0]) return 'skipped_exists';
  await insertPrivacyRequest(pool, {
    id,
    type,
    status: raw.status || 'completed',
    email,
    actor: raw.actor,
    scope: raw.scope,
    fields: raw.fields,
    scopes: raw.scopes,
    source: raw.source,
    action: raw.action,
    consentVersion: raw.consentVersion,
    requestedAt: raw.requestedAt,
    completedAt: raw.completedAt,
  });
  return 'inserted';
};

export const initPrivacyRequestsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensurePrivacyRequestsTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
