/**
 * Task 8 — Per-user Luna Live memory consent authority.
 *
 * Dedicated store (not personal_events). Default disabled.
 * Production/preview: Postgres only, fail-closed, no silent file fallback.
 * Dev/test: explicit file fallback only when deliberately configured.
 *
 * API mirrors personalEventsStore handle shape:
 *   createMemoryConsentStore(filePath, { runtimeEnvironment, env })
 *   → { store, available, mode, reason }
 */

import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

export const MEMORY_CONSENT_VERSION = 'memory_consent_v1';
export const MEMORY_CONSENT_STATUS = Object.freeze({
  ENABLED: 'enabled',
  DISABLED: 'disabled',
});
export const MEMORY_CONSENT_STORE_UNAVAILABLE = 'MEMORY_CONSENT_STORE_UNAVAILABLE';

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS memory_consent (
  user_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('enabled', 'disabled')),
  consent_version TEXT NOT NULL,
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_surface TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_memory_consent_status ON memory_consent (status);
`;

/**
 * Hard-delete memory_consent for a user via shared Pool/Client (account deletion).
 * Does not use the store's private Pool — keeps cascade transactional on shared DB.
 */
export const deleteMemoryConsentForUser = async (pool, userId) => {
  if (!pool || !userId) return 0;
  const result = await pool.query(`DELETE FROM memory_consent WHERE user_id = $1`, [
    String(userId),
  ]);
  return Number(result.rowCount || 0);
};

const getDatabaseUrl = (env = process.env) => String(env?.DATABASE_URL || '').trim() || null;
const envHasDatabaseUrl = (env = process.env) => Boolean(getDatabaseUrl(env));

const isProductionLike = (env = process.env) => {
  const nodeEnv = String(env.NODE_ENV || '').toLowerCase();
  const vercelEnv = String(env.VERCEL_ENV || '').toLowerCase();
  return nodeEnv === 'production' || vercelEnv === 'production' || vercelEnv === 'preview';
};

/**
 * Resolve storage mode from server environment only.
 * Request headers/body/query cannot select file mode.
 */
export const resolveMemoryConsentStorageDecision = ({
  env = process.env,
  runtimeEnvironment = 'node',
} = {}) => {
  const vercelEnv = String(env.VERCEL_ENV || '').trim().toLowerCase();
  const nodeEnv = String(env.NODE_ENV || '').trim().toLowerCase();
  const explicit = String(env.MEMORY_CONSENT_STORAGE || '').trim().toLowerCase();
  const hasDb = envHasDatabaseUrl(env);
  const isProdLike =
    vercelEnv === 'production' ||
    vercelEnv === 'preview' ||
    nodeEnv === 'production';
  const isExplicitTestHarness = runtimeEnvironment === 'test';

  if (explicit === 'file') {
    if (isProdLike) {
      return {
        mode: 'unavailable',
        reason: 'file_rejected_in_production',
        category: 'config_rejected',
      };
    }
    return {
      mode: 'file',
      reason: 'explicit_file_opt_in',
      category: 'ok',
    };
  }

  if (explicit && explicit !== 'postgres' && explicit !== 'auto') {
    return {
      mode: 'unavailable',
      reason: 'invalid_storage_mode',
      category: 'config_rejected',
    };
  }

  if (isProdLike) {
    if (!hasDb) {
      return {
        mode: 'unavailable',
        reason: 'database_missing',
        category: 'database_missing',
      };
    }
    return {
      mode: 'postgres',
      reason: 'database_configured',
      category: 'ok',
    };
  }

  // Isolated test harness (buildApiHandler environment: 'test') may use file store.
  if (isExplicitTestHarness && !hasDb) {
    return {
      mode: 'file',
      reason: 'test_isolated_file',
      category: 'ok',
    };
  }

  if (!hasDb) {
    // Dev explicit opt-in only — never silent.
    if (env.LUNA_MEMORY_CONSENT_ALLOW_FILE_FALLBACK === '1') {
      return {
        mode: 'file',
        reason: 'dev_explicit_file_fallback',
        category: 'ok',
      };
    }
    return {
      mode: 'unavailable',
      reason: 'database_missing',
      category: 'database_missing',
    };
  }

  return {
    mode: 'postgres',
    reason: 'database_configured',
    category: 'ok',
  };
};

const defaultDisabledRecord = (userId) => ({
  user_id: String(userId),
  status: MEMORY_CONSENT_STATUS.DISABLED,
  consent_version: MEMORY_CONSENT_VERSION,
  enabled_at: null,
  disabled_at: null,
  updated_at: null,
  source_surface: null,
  created_at: null,
  exists: false,
});

const rowToRecord = (row) => {
  if (!row) return null;
  return {
    user_id: String(row.user_id),
    status:
      row.status === MEMORY_CONSENT_STATUS.ENABLED
        ? MEMORY_CONSENT_STATUS.ENABLED
        : MEMORY_CONSENT_STATUS.DISABLED,
    consent_version: String(row.consent_version || MEMORY_CONSENT_VERSION),
    enabled_at: row.enabled_at ? new Date(row.enabled_at).toISOString() : null,
    disabled_at: row.disabled_at ? new Date(row.disabled_at).toISOString() : null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    source_surface: row.source_surface ? String(row.source_surface) : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    exists: true,
  };
};

const createPostgresBackend = async (databaseUrl) => {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 3,
  });
  await pool.query(TABLE_SQL);

  return {
    kind: 'postgres',
    available: true,
    async get(userId) {
      const { rows } = await pool.query(
        `SELECT user_id, status, consent_version, enabled_at, disabled_at, updated_at, source_surface, created_at
         FROM memory_consent WHERE user_id = $1 LIMIT 1`,
        [String(userId)],
      );
      return rows[0] ? rowToRecord(rows[0]) : defaultDisabledRecord(userId);
    },
    async enable(userId, { source_surface = null, consent_version = MEMORY_CONSENT_VERSION } = {}) {
      const now = new Date().toISOString();
      const { rows } = await pool.query(
        `INSERT INTO memory_consent (user_id, status, consent_version, enabled_at, disabled_at, updated_at, source_surface, created_at)
         VALUES ($1, 'enabled', $2, $3::timestamptz, NULL, $3::timestamptz, $4, $3::timestamptz)
         ON CONFLICT (user_id) DO UPDATE SET
           status = 'enabled',
           consent_version = EXCLUDED.consent_version,
           enabled_at = COALESCE(memory_consent.enabled_at, EXCLUDED.enabled_at),
           disabled_at = NULL,
           updated_at = EXCLUDED.updated_at,
           source_surface = COALESCE(EXCLUDED.source_surface, memory_consent.source_surface)
         RETURNING user_id, status, consent_version, enabled_at, disabled_at, updated_at, source_surface, created_at`,
        [String(userId), String(consent_version), now, source_surface],
      );
      return rowToRecord(rows[0]);
    },
    async disable(userId, { source_surface = null } = {}) {
      const now = new Date().toISOString();
      const existing = await this.get(userId);
      if (!existing.exists) {
        const { rows } = await pool.query(
          `INSERT INTO memory_consent (user_id, status, consent_version, enabled_at, disabled_at, updated_at, source_surface, created_at)
           VALUES ($1, 'disabled', $2, NULL, $3::timestamptz, $3::timestamptz, $4, $3::timestamptz)
           RETURNING user_id, status, consent_version, enabled_at, disabled_at, updated_at, source_surface, created_at`,
          [String(userId), MEMORY_CONSENT_VERSION, now, source_surface],
        );
        return rowToRecord(rows[0]);
      }
      const { rows } = await pool.query(
        `UPDATE memory_consent SET
           status = 'disabled',
           disabled_at = $2::timestamptz,
           updated_at = $2::timestamptz,
           source_surface = COALESCE($3, source_surface)
         WHERE user_id = $1
         RETURNING user_id, status, consent_version, enabled_at, disabled_at, updated_at, source_surface, created_at`,
        [String(userId), now, source_surface],
      );
      return rowToRecord(rows[0]);
    },
    async hardDeleteForUser(userId) {
      return deleteMemoryConsentForUser(pool, userId);
    },
    async close() {
      await pool.end();
    },
  };
};

const createFileBackend = (filePath) => {
  const ensure = () => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ records: {} }, null, 2));
    }
  };
  const readAll = () => {
    ensure();
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return { records: {} };
    }
  };
  const writeAll = (data) => {
    ensure();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  };

  return {
    kind: 'file',
    available: true,
    async get(userId) {
      const data = readAll();
      const row = data.records?.[String(userId)];
      return row ? rowToRecord(row) : defaultDisabledRecord(userId);
    },
    async enable(userId, { source_surface = null, consent_version = MEMORY_CONSENT_VERSION } = {}) {
      const data = readAll();
      const key = String(userId);
      const now = new Date().toISOString();
      const prev = data.records[key];
      const next = {
        user_id: key,
        status: MEMORY_CONSENT_STATUS.ENABLED,
        consent_version: String(consent_version),
        enabled_at: prev?.enabled_at || now,
        disabled_at: null,
        updated_at: now,
        source_surface: source_surface || prev?.source_surface || null,
        created_at: prev?.created_at || now,
      };
      data.records[key] = next;
      writeAll(data);
      return rowToRecord(next);
    },
    async disable(userId, { source_surface = null } = {}) {
      const data = readAll();
      const key = String(userId);
      const now = new Date().toISOString();
      const prev = data.records[key];
      const next = {
        user_id: key,
        status: MEMORY_CONSENT_STATUS.DISABLED,
        consent_version: prev?.consent_version || MEMORY_CONSENT_VERSION,
        enabled_at: prev?.enabled_at || null,
        disabled_at: now,
        updated_at: now,
        source_surface: source_surface || prev?.source_surface || null,
        created_at: prev?.created_at || now,
      };
      data.records[key] = next;
      writeAll(data);
      return rowToRecord(next);
    },
    async hardDeleteForUser(userId) {
      const data = readAll();
      const key = String(userId);
      if (!data.records?.[key]) return 0;
      delete data.records[key];
      writeAll(data);
      return 1;
    },
    async close() {},
  };
};

const createUnavailableBackend = (reason) => ({
  kind: 'unavailable',
  available: false,
  reason,
  async get() {
    const e = new Error('memory_consent_store_unavailable');
    e.code = MEMORY_CONSENT_STORE_UNAVAILABLE;
    throw e;
  },
  async enable() {
    const e = new Error('memory_consent_store_unavailable');
    e.code = MEMORY_CONSENT_STORE_UNAVAILABLE;
    throw e;
  },
  async disable() {
    const e = new Error('memory_consent_store_unavailable');
    e.code = MEMORY_CONSENT_STORE_UNAVAILABLE;
    throw e;
  },
  async hardDeleteForUser() {
    const e = new Error('memory_consent_store_unavailable');
    e.code = MEMORY_CONSENT_STORE_UNAVAILABLE;
    throw e;
  },
  async close() {},
});

/**
 * Create memory consent store handle.
 * Signature mirrors createPersonalEventsStore(filePath, options).
 */
export const createMemoryConsentStore = async (filePathOrOptions, maybeOptions) => {
  const options =
    typeof filePathOrOptions === 'string' || filePathOrOptions == null
      ? { ...(maybeOptions || {}), filePath: filePathOrOptions }
      : { ...(filePathOrOptions || {}) };

  const env = options.env || process.env;
  const runtimeEnvironment = options.runtimeEnvironment || 'node';
  const filePath = options.filePath || null;
  const databaseUrl = options.databaseUrl || getDatabaseUrl(env);

  const decision = resolveMemoryConsentStorageDecision({ env, runtimeEnvironment });

  if (decision.mode === 'unavailable') {
    const store = createUnavailableBackend(decision.reason);
    return { store, available: false, mode: 'unavailable', reason: decision.reason };
  }

  if (decision.mode === 'postgres') {
    try {
      const url = databaseUrl || getDatabaseUrl(env);
      if (!url) {
        const store = createUnavailableBackend('database_missing');
        return { store, available: false, mode: 'unavailable', reason: 'database_missing' };
      }
      const store = await createPostgresBackend(url);
      return { store, available: true, mode: 'postgres', reason: decision.reason };
    } catch {
      // Production/preview: fail closed — no silent file fallback.
      if (isProductionLike(env)) {
        const store = createUnavailableBackend('postgres_init_failed');
        return { store, available: false, mode: 'unavailable', reason: 'postgres_init_failed' };
      }
      // Dev/test: file only when deliberately allowed.
      if (
        env.LUNA_MEMORY_CONSENT_ALLOW_FILE_FALLBACK === '1' ||
        runtimeEnvironment === 'test' ||
        String(env.MEMORY_CONSENT_STORAGE || '').toLowerCase() === 'file'
      ) {
        const resolvedPath =
          filePath || path.join(process.cwd(), '.data', `memory-consent-${randomUUID()}.json`);
        const store = createFileBackend(resolvedPath);
        return { store, available: true, mode: 'file', reason: 'postgres_failed_explicit_file' };
      }
      const store = createUnavailableBackend('postgres_init_failed');
      return { store, available: false, mode: 'unavailable', reason: 'postgres_init_failed' };
    }
  }

  if (decision.mode === 'file') {
    if (!filePath && runtimeEnvironment !== 'test' && env.LUNA_MEMORY_CONSENT_ALLOW_FILE_FALLBACK !== '1') {
      // Allow ephemeral path in test harness.
      if (runtimeEnvironment !== 'test' && !env.VITEST) {
        const store = createUnavailableBackend('file_path_missing');
        return { store, available: false, mode: 'unavailable', reason: 'file_path_missing' };
      }
    }
    const resolvedPath =
      filePath || path.join(process.cwd(), '.data', `memory-consent-${randomUUID()}.json`);
    const store = createFileBackend(resolvedPath);
    return { store, available: true, mode: 'file', reason: decision.reason };
  }

  const store = createUnavailableBackend(decision.reason || 'unknown');
  return { store, available: false, mode: 'unavailable', reason: decision.reason || 'unknown' };
};

export const isMemoryConsentStoreAvailable = (handleOrStore) => {
  if (!handleOrStore) return false;
  if (typeof handleOrStore.available === 'boolean') return handleOrStore.available;
  if (handleOrStore.store) return isMemoryConsentStoreAvailable(handleOrStore.store);
  return handleOrStore.available !== false && handleOrStore.kind !== 'unavailable';
};

/**
 * Safe consent check for memory write gate.
 * On any uncertainty: available=false, enabled=false — DO NOT WRITE.
 */
export const getMemoryConsentForWrite = async (storeOrHandle, userId) => {
  const store = storeOrHandle?.store || storeOrHandle;
  if (!store || !userId || !isMemoryConsentStoreAvailable(storeOrHandle)) {
    return {
      available: false,
      enabled: false,
      status: 'consent_unavailable',
      reason: 'missing_store_or_user',
    };
  }
  try {
    const record = await store.get(userId);
    const enabled = record?.status === MEMORY_CONSENT_STATUS.ENABLED;
    return {
      available: true,
      enabled,
      status: enabled ? 'consent_enabled' : 'consent_disabled',
      reason: enabled ? 'enabled' : 'disabled',
      record,
    };
  } catch {
    return {
      available: false,
      enabled: false,
      status: 'consent_unavailable',
      reason: 'store_error',
    };
  }
};

export const toPublicMemoryConsent = (record, { memoryWriteFeatureEnabled = false } = {}) => {
  const status =
    record?.status === MEMORY_CONSENT_STATUS.ENABLED
      ? MEMORY_CONSENT_STATUS.ENABLED
      : MEMORY_CONSENT_STATUS.DISABLED;
  return {
    status,
    consent_version: record?.consent_version || MEMORY_CONSENT_VERSION,
    enabled_at: record?.enabled_at || null,
    disabled_at: record?.disabled_at || null,
    updated_at: record?.updated_at || null,
    memory_write_available: Boolean(memoryWriteFeatureEnabled) && status === MEMORY_CONSENT_STATUS.ENABLED,
  };
};
