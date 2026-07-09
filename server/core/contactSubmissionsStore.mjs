/**
 * WS1.5 — Durable public contact submissions.
 */

export const CONTACT_SUBMISSIONS_TABLE = 'contact_submissions';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  ip TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS contact_submissions_email_idx ON contact_submissions (LOWER(email));
CREATE INDEX IF NOT EXISTS contact_submissions_at_idx ON contact_submissions (at DESC);
`;

let schemaReady = false;

export const __resetContactSubmissionsSchemaForTests = () => {
  schemaReady = false;
};

export const ensureContactSubmissionsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[contact-submissions] schema init failed:',
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

const rowToContact = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    at: toIso(row.at) || new Date().toISOString(),
    name: String(row.name || ''),
    email: String(row.email || '').toLowerCase(),
    subject: row.subject == null ? undefined : String(row.subject),
    message: String(row.message || ''),
    ip: row.ip == null ? undefined : String(row.ip),
    repliedAt: toIso(row.replied_at) || undefined,
  };
};

export const insertContactSubmission = async (pool, contact) => {
  const id = String(contact.id);
  await pool.query(
    `INSERT INTO contact_submissions (
       id, at, name, email, subject, message, ip, replied_at, created_at
     ) VALUES (
       $1, COALESCE($2::timestamptz, NOW()), $3, $4, $5, $6, $7, $8::timestamptz, NOW()
     )
     ON CONFLICT (id) DO NOTHING`,
    [
      id,
      contact.at || null,
      String(contact.name || '').slice(0, 120),
      String(contact.email || '').toLowerCase(),
      contact.subject ? String(contact.subject).slice(0, 120) : null,
      String(contact.message || '').slice(0, 5000),
      contact.ip ? String(contact.ip).slice(0, 80) : null,
      contact.repliedAt || null,
    ],
  );
  const result = await pool.query(`SELECT * FROM contact_submissions WHERE id = $1`, [id]);
  return rowToContact(result.rows[0]);
};

export const listContactSubmissions = async (pool, { email = null, limit = 200 } = {}) => {
  const lim = Math.max(1, Math.min(2000, Number(limit) || 200));
  if (email) {
    const result = await pool.query(
      `SELECT * FROM contact_submissions WHERE LOWER(email) = $1 ORDER BY at DESC LIMIT $2`,
      [String(email).toLowerCase(), lim],
    );
    return result.rows.map(rowToContact);
  }
  const result = await pool.query(
    `SELECT * FROM contact_submissions ORDER BY at DESC LIMIT $1`,
    [lim],
  );
  return result.rows.map(rowToContact);
};

export const deleteContactSubmissionsByEmail = async (pool, email) => {
  await pool.query(`DELETE FROM contact_submissions WHERE LOWER(email) = $1`, [
    String(email || '').toLowerCase(),
  ]);
};

export const markContactSubmissionReplied = async (pool, id, repliedAt = new Date().toISOString()) => {
  const result = await pool.query(
    `UPDATE contact_submissions SET replied_at = $2::timestamptz WHERE id = $1 RETURNING *`,
    [String(id), repliedAt],
  );
  return rowToContact(result.rows[0]);
};

export const countContactSubmissions = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM contact_submissions`);
  return Number(result.rows[0]?.n || 0);
};

export const importContactSubmissionIfAbsent = async (pool, raw) => {
  const id = String(raw?.id || '').trim();
  const email = String(raw?.email || '').trim().toLowerCase();
  const name = String(raw?.name || '').trim();
  const message = String(raw?.message || '').trim();
  if (!id || !email.includes('@') || name.length < 2 || message.length < 10) return 'skipped_invalid';
  const existing = await pool.query(`SELECT id FROM contact_submissions WHERE id = $1`, [id]);
  if (existing.rows[0]) return 'skipped_exists';
  await insertContactSubmission(pool, {
    id,
    at: raw.at,
    name,
    email,
    subject: raw.subject,
    message,
    ip: raw.ip,
    repliedAt: raw.repliedAt,
  });
  return 'inserted';
};

export const initContactSubmissionsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureContactSubmissionsTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
