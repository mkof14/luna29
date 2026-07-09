/**
 * WS1.5 — Durable admin workspace document (non-role, non-invite, non-audit state).
 * Role authority remains auth_users.role_override (WS1.2).
 * Invites/audit use dedicated tables.
 */

export const ADMIN_WORKSPACE_TABLE = 'admin_workspace_state';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admin_workspace_state (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const WORKSPACE_ID = 'default';

let schemaReady = false;

export const __resetAdminWorkspaceSchemaForTests = () => {
  schemaReady = false;
};

export const ensureAdminWorkspaceTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[admin-workspace] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

export const getAdminWorkspaceDocument = async (pool) => {
  const result = await pool.query(
    `SELECT value FROM admin_workspace_state WHERE id = $1 LIMIT 1`,
    [WORKSPACE_ID],
  );
  return result.rows[0]?.value || null;
};

export const saveAdminWorkspaceDocument = async (pool, value) => {
  await pool.query(
    `INSERT INTO admin_workspace_state (id, value, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [WORKSPACE_ID, JSON.stringify(value || {})],
  );
};

export const countAdminWorkspaceDocuments = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM admin_workspace_state`);
  return Number(result.rows[0]?.n || 0);
};

export const initAdminWorkspaceRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') return { ok: true, mode: mode || 'json' };
  if (!pool) return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  const ready = await ensureAdminWorkspaceTable(pool);
  return ready ? { ok: true, mode: 'postgres' } : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
