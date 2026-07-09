/**
 * WS1.3 — Durable billing accounts (user ↔ Stripe customer mapping).
 * Shared pool via database.mjs. Upsert-only; no full-table replace.
 */

export const BILLING_ACCOUNTS_TABLE = 'billing_accounts';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS billing_accounts (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS billing_accounts_email_uidx
  ON billing_accounts (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS billing_accounts_stripe_customer_uidx
  ON billing_accounts (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
`;

let schemaReady = false;

export const __resetBillingAccountsSchemaForTests = () => {
  schemaReady = false;
};

export const ensureBillingAccountsTable = async (pool) => {
  if (schemaReady) return true;
  if (!pool) return false;
  try {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
    return true;
  } catch (error) {
    schemaReady = false;
    console.warn(
      '[billing-accounts] schema init failed:',
      error instanceof Error ? error.message.slice(0, 160) : 'schema_init_failed',
    );
    return false;
  }
};

const rowToAccount = (row) => {
  if (!row) return null;
  return {
    userId: String(row.user_id),
    email: String(row.email || '').toLowerCase(),
    stripeCustomerId: row.stripe_customer_id == null ? null : String(row.stripe_customer_id),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const getBillingAccountByUserId = async (pool, userId) => {
  const result = await pool.query(
    `SELECT user_id, email, stripe_customer_id, created_at, updated_at
     FROM billing_accounts WHERE user_id = $1 LIMIT 1`,
    [String(userId)],
  );
  return rowToAccount(result.rows[0]);
};

export const getBillingAccountByStripeCustomerId = async (pool, stripeCustomerId) => {
  if (!stripeCustomerId) return null;
  const result = await pool.query(
    `SELECT user_id, email, stripe_customer_id, created_at, updated_at
     FROM billing_accounts WHERE stripe_customer_id = $1 LIMIT 1`,
    [String(stripeCustomerId)],
  );
  return rowToAccount(result.rows[0]);
};

export const getBillingAccountByEmail = async (pool, email) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  const result = await pool.query(
    `SELECT user_id, email, stripe_customer_id, created_at, updated_at
     FROM billing_accounts WHERE LOWER(email) = $1 LIMIT 1`,
    [normalized],
  );
  return rowToAccount(result.rows[0]);
};

/**
 * Upsert account. Does not clear stripe_customer_id when omitted (nullish).
 * Conflicting stripe_customer_id on another user raises (unique index).
 */
export const upsertBillingAccount = async (pool, { userId, email, stripeCustomerId }) => {
  const id = String(userId);
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!id || !normalizedEmail) {
    throw new Error('billing_account_requires_user_and_email');
  }
  const customerId =
    stripeCustomerId === undefined || stripeCustomerId === null || stripeCustomerId === ''
      ? null
      : String(stripeCustomerId);

  if (customerId === null) {
    await pool.query(
      `INSERT INTO billing_accounts (user_id, email, stripe_customer_id, created_at, updated_at)
       VALUES ($1, $2, NULL, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         email = EXCLUDED.email,
         updated_at = NOW()`,
      [id, normalizedEmail],
    );
  } else {
    await pool.query(
      `INSERT INTO billing_accounts (user_id, email, stripe_customer_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         email = EXCLUDED.email,
         stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, billing_accounts.stripe_customer_id),
         updated_at = NOW()`,
      [id, normalizedEmail, customerId],
    );
  }
  return getBillingAccountByUserId(pool, id);
};

export const deleteBillingAccountByUserId = async (pool, userId) => {
  await pool.query(`DELETE FROM billing_accounts WHERE user_id = $1`, [String(userId)]);
};

export const countBillingAccounts = async (pool) => {
  const result = await pool.query(`SELECT COUNT(*)::int AS n FROM billing_accounts`);
  return Number(result.rows[0]?.n || 0);
};

export const listBillingAccounts = async (pool) => {
  const result = await pool.query(
    `SELECT user_id, email, stripe_customer_id, created_at, updated_at FROM billing_accounts`,
  );
  return result.rows.map(rowToAccount);
};

export const initBillingAccountsRepository = async ({ mode, pool }) => {
  if (mode !== 'postgres') {
    return { ok: true, mode: mode || 'json' };
  }
  if (!pool) {
    return { ok: false, mode: 'postgres', reason: 'pool_missing' };
  }
  const ready = await ensureBillingAccountsTable(pool);
  return ready
    ? { ok: true, mode: 'postgres' }
    : { ok: false, mode: 'postgres', reason: 'schema_init_failed' };
};
