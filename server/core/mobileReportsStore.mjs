/**
 * WS1.6 — Durable saved mobile health reports.
 * Ownership: authenticated user_id only.
 */

export const MOBILE_REPORTS_TABLE = 'mobile_reports';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS mobile_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS mobile_reports_user_generated_idx
  ON mobile_reports (user_id, generated_at DESC);
`;

let schemaReady = false;

export const __resetMobileReportsSchemaForTests = () => {
  schemaReady = false;
};

export const ensureMobileReportsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[mobile-reports] schema init failed:',
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

const rowToReport = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    generatedAt: toIso(row.generated_at) || new Date().toISOString(),
    text: String(row.body || ''),
  };
};

export const listMobileReportsForUser = async (pool, userId, { limit = 20 } = {}) => {
  const result = await pool.query(
    `SELECT * FROM mobile_reports WHERE user_id = $1 ORDER BY generated_at DESC LIMIT $2`,
    [String(userId), Math.max(1, Math.min(100, Number(limit) || 20))],
  );
  return result.rows.map(rowToReport);
};

export const getMobileReportOwned = async (pool, userId, reportId) => {
  const result = await pool.query(
    `SELECT * FROM mobile_reports WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [String(reportId), String(userId)],
  );
  return rowToReport(result.rows[0]);
};

export const upsertMobileReportForUser = async (pool, userId, report) => {
  const id = String(report.id);
  await pool.query(
    `INSERT INTO mobile_reports (id, user_id, generated_at, body, created_at)
     VALUES ($1, $2, COALESCE($3::timestamptz, NOW()), $4, NOW())
     ON CONFLICT (id) DO UPDATE SET
       body = EXCLUDED.body,
       generated_at = EXCLUDED.generated_at
     WHERE mobile_reports.user_id = EXCLUDED.user_id`,
    [
      id,
      String(userId),
      report.generatedAt || null,
      String(report.text || '').slice(0, 20000),
    ],
  );
  return getMobileReportOwned(pool, userId, id);
};

export const deleteMobileReportOwned = async (pool, userId, reportId) => {
  const result = await pool.query(
    `DELETE FROM mobile_reports WHERE id = $1 AND user_id = $2 RETURNING id`,
    [String(reportId), String(userId)],
  );
  return Boolean(result.rows[0]);
};

export const countMobileReports = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM mobile_reports`);
  return Number(result.rows[0]?.n || 0);
};

export const importMobileReportIfAbsent = async (pool, userId, report) => {
  const uid = String(userId || '').trim();
  const id = String(report?.id || '').trim();
  const text = String(report?.text || '').trim();
  if (!uid || !id || !text) return 'skipped_invalid';
  const existing = await pool.query(`SELECT id FROM mobile_reports WHERE id = $1`, [id]);
  if (existing.rows[0]) return 'skipped_exists';
  await upsertMobileReportForUser(pool, uid, report);
  return 'inserted';
};

export const initMobileReportsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureMobileReportsTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
