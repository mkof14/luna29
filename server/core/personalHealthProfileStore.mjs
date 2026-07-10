/**
 * Personal Health Profile — durable storage authority.
 * Production/preview: Postgres only, fail-closed.
 * Test/dev: explicit file mode when configured (mirrors memory_consent).
 *
 * No health field values in logs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

export const PERSONAL_HEALTH_PROFILE_STORE_UNAVAILABLE = 'PERSONAL_HEALTH_PROFILE_STORE_UNAVAILABLE';
export const PROFILE_STORAGE_UNAVAILABLE = 'PROFILE_STORAGE_UNAVAILABLE';

export const PROFILE_FACT_SOURCES = Object.freeze([
  'user_entered',
  'user_confirmed',
  'imported_document',
  'imported_lab',
  'imported_calendar',
  'luna_inferred',
  'clinician_entered_future',
]);

/** Align with signal trust vocabulary where possible. */
export const PROFILE_TRUST_STATES = Object.freeze([
  'confirmed',
  'unreviewed',
  'corrected',
  'rejected',
]);

export const PROFILE_SECTIONS = Object.freeze([
  'about',
  'body',
  'health_history',
  'medications',
  'family_history',
  'sleep',
  'nutrition',
  'activity',
  'stress',
  'womens_health',
  'goals',
  'care_context',
  'data_sources',
]);

const PROFILE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS personal_health_profiles (
  user_id TEXT PRIMARY KEY,
  profile_version INTEGER NOT NULL DEFAULT 1,
  completion_percent INTEGER NOT NULL DEFAULT 0,
  sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  profile_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_scopes JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_php_updated ON personal_health_profiles (updated_at);
`;

const FACTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS personal_health_profile_facts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES personal_health_profiles(user_id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  fact_key TEXT NOT NULL,
  value_json JSONB NOT NULL,
  display_label TEXT,
  source TEXT NOT NULL,
  trust_state TEXT NOT NULL,
  confidence TEXT,
  occurred_at TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_event_id TEXT,
  source_report_id TEXT,
  source_document_id TEXT,
  consent_scope TEXT,
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  UNIQUE (user_id, section, fact_key, source, trust_state)
);
CREATE INDEX IF NOT EXISTS idx_php_facts_user ON personal_health_profile_facts (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_php_facts_trust ON personal_health_profile_facts (user_id, trust_state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_php_facts_section ON personal_health_profile_facts (user_id, section) WHERE deleted_at IS NULL;
`;

export const deletePersonalHealthProfileForUser = async (pool, userId) => {
  if (!pool || !userId) return { facts: 0, profiles: 0 };
  const uid = String(userId);
  // Facts cascade via FK; delete profile row (facts go with it). Also hard-delete orphans.
  const facts = await pool.query(`DELETE FROM personal_health_profile_facts WHERE user_id = $1`, [uid]);
  const profiles = await pool.query(`DELETE FROM personal_health_profiles WHERE user_id = $1`, [uid]);
  return {
    facts: Number(facts.rowCount || 0),
    profiles: Number(profiles.rowCount || 0),
  };
};

const getDatabaseUrl = (env = process.env) => String(env?.DATABASE_URL || '').trim() || null;
const envHasDatabaseUrl = (env = process.env) => Boolean(getDatabaseUrl(env));
const isProductionLike = (env = process.env) => {
  const nodeEnv = String(env.NODE_ENV || '').toLowerCase();
  const vercelEnv = String(env.VERCEL_ENV || '').toLowerCase();
  return nodeEnv === 'production' || vercelEnv === 'production' || vercelEnv === 'preview';
};

export const resolvePersonalHealthProfileStorageDecision = ({
  env = process.env,
  runtimeEnvironment = 'node',
} = {}) => {
  const vercelEnv = String(env.VERCEL_ENV || '').trim().toLowerCase();
  const nodeEnv = String(env.NODE_ENV || '').trim().toLowerCase();
  const explicit = String(env.PERSONAL_HEALTH_PROFILE_STORAGE || '').trim().toLowerCase();
  const hasDb = envHasDatabaseUrl(env);
  const isProdLike =
    vercelEnv === 'production' || vercelEnv === 'preview' || nodeEnv === 'production';
  const isExplicitTestHarness = runtimeEnvironment === 'test';

  if (explicit === 'file') {
    if (isProdLike) {
      return { mode: 'unavailable', reason: 'file_rejected_in_production', category: 'config_rejected' };
    }
    return { mode: 'file', reason: 'explicit_file_opt_in', category: 'ok' };
  }
  if (explicit && explicit !== 'postgres' && explicit !== 'auto') {
    return { mode: 'unavailable', reason: 'invalid_storage_mode', category: 'config_rejected' };
  }
  if (isProdLike) {
    if (!hasDb) return { mode: 'unavailable', reason: 'database_missing', category: 'database_missing' };
    return { mode: 'postgres', reason: 'database_configured', category: 'ok' };
  }
  if (isExplicitTestHarness && !hasDb) {
    return { mode: 'file', reason: 'test_isolated_file', category: 'ok' };
  }
  if (!hasDb) {
    if (env.LUNA_HEALTH_PROFILE_ALLOW_FILE_FALLBACK === '1') {
      return { mode: 'file', reason: 'dev_explicit_file_fallback', category: 'ok' };
    }
    return { mode: 'unavailable', reason: 'database_missing', category: 'database_missing' };
  }
  return { mode: 'postgres', reason: 'database_configured', category: 'ok' };
};

const unavailableError = (reason) => {
  const e = new Error('personal_health_profile_store_unavailable');
  e.code = PERSONAL_HEALTH_PROFILE_STORE_UNAVAILABLE;
  e.reason = reason;
  return e;
};

const emptyProfile = (userId) => ({
  user_id: String(userId),
  profile_version: 1,
  completion_percent: 0,
  sections: {},
  profile_preferences: {
    dismissed_questions: {},
    skipped_initial: false,
    applicable_sections: null,
  },
  consent_scopes: {},
  source_metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_reviewed_at: null,
});

const createPostgresBackend = async (databaseUrl, { pool: sharedPool = null } = {}) => {
  const ownsPool = !sharedPool;
  const pool =
    sharedPool ||
    new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 2,
    });
  await pool.query(PROFILE_TABLE_SQL);
  await pool.query(FACTS_TABLE_SQL);

  return {
    kind: 'postgres',
    available: true,
    async ensureProfile(userId) {
      const uid = String(userId);
      const existing = await pool.query(`SELECT * FROM personal_health_profiles WHERE user_id = $1`, [uid]);
      if (existing.rows[0]) return mapProfileRow(existing.rows[0]);
      const row = emptyProfile(uid);
      await pool.query(
        `INSERT INTO personal_health_profiles
          (user_id, profile_version, completion_percent, sections, profile_preferences, consent_scopes, source_metadata)
         VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb)
         ON CONFLICT (user_id) DO NOTHING`,
        [
          uid,
          row.profile_version,
          row.completion_percent,
          JSON.stringify(row.sections),
          JSON.stringify(row.profile_preferences),
          JSON.stringify(row.consent_scopes),
          JSON.stringify(row.source_metadata),
        ],
      );
      const again = await pool.query(`SELECT * FROM personal_health_profiles WHERE user_id = $1`, [uid]);
      return mapProfileRow(again.rows[0]);
    },
    async getProfile(userId) {
      const result = await pool.query(`SELECT * FROM personal_health_profiles WHERE user_id = $1`, [
        String(userId),
      ]);
      return result.rows[0] ? mapProfileRow(result.rows[0]) : null;
    },
    async upsertSection(userId, section, sectionData, { completionPercent, preferences } = {}) {
      await this.ensureProfile(userId);
      const uid = String(userId);
      const result = await pool.query(
        `UPDATE personal_health_profiles
         SET sections = jsonb_set(COALESCE(sections, '{}'::jsonb), ARRAY[$2]::text[], $3::jsonb, true),
             completion_percent = COALESCE($4, completion_percent),
             profile_preferences = COALESCE($5::jsonb, profile_preferences),
             profile_version = profile_version + 1,
             updated_at = NOW()
         WHERE user_id = $1
         RETURNING *`,
        [
          uid,
          section,
          JSON.stringify(sectionData || {}),
          completionPercent == null ? null : Number(completionPercent),
          preferences == null ? null : JSON.stringify(preferences),
        ],
      );
      return mapProfileRow(result.rows[0]);
    },
    async patchPreferences(userId, patch) {
      await this.ensureProfile(userId);
      const current = await this.getProfile(userId);
      const next = { ...(current.profile_preferences || {}), ...(patch || {}) };
      const result = await pool.query(
        `UPDATE personal_health_profiles
         SET profile_preferences = $2::jsonb, profile_version = profile_version + 1, updated_at = NOW()
         WHERE user_id = $1 RETURNING *`,
        [String(userId), JSON.stringify(next)],
      );
      return mapProfileRow(result.rows[0]);
    },
    async setCompletion(userId, percent) {
      const result = await pool.query(
        `UPDATE personal_health_profiles
         SET completion_percent = $2, updated_at = NOW()
         WHERE user_id = $1 RETURNING *`,
        [String(userId), Math.max(0, Math.min(100, Math.round(Number(percent) || 0)))],
      );
      return result.rows[0] ? mapProfileRow(result.rows[0]) : null;
    },
    async listFacts(userId, { section, trustStates, includeDeleted = false } = {}) {
      const params = [String(userId)];
      let sql = `SELECT * FROM personal_health_profile_facts WHERE user_id = $1`;
      if (!includeDeleted) sql += ` AND deleted_at IS NULL`;
      if (section) {
        params.push(section);
        sql += ` AND section = $${params.length}`;
      }
      if (Array.isArray(trustStates) && trustStates.length) {
        params.push(trustStates);
        sql += ` AND trust_state = ANY($${params.length})`;
      }
      sql += ` ORDER BY updated_at DESC LIMIT 500`;
      const result = await pool.query(sql, params);
      return result.rows.map(mapFactRow);
    },
    async getFact(userId, factId) {
      const result = await pool.query(
        `SELECT * FROM personal_health_profile_facts WHERE user_id = $1 AND id = $2`,
        [String(userId), String(factId)],
      );
      return result.rows[0] ? mapFactRow(result.rows[0]) : null;
    },
    async upsertFact(userId, fact) {
      await this.ensureProfile(userId);
      const id = fact.id || randomUUID().replace(/-/g, '').slice(0, 24);
      const result = await pool.query(
        `INSERT INTO personal_health_profile_facts
          (id, user_id, section, fact_key, value_json, display_label, source, trust_state, confidence,
           occurred_at, source_event_id, source_report_id, source_document_id, consent_scope, notes)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (user_id, section, fact_key, source, trust_state)
         DO UPDATE SET
           value_json = EXCLUDED.value_json,
           display_label = EXCLUDED.display_label,
           confidence = EXCLUDED.confidence,
           occurred_at = EXCLUDED.occurred_at,
           notes = EXCLUDED.notes,
           deleted_at = NULL,
           updated_at = NOW()
         RETURNING *`,
        [
          id,
          String(userId),
          fact.section,
          fact.fact_key,
          JSON.stringify(fact.value_json ?? null),
          fact.display_label || null,
          fact.source,
          fact.trust_state,
          fact.confidence || null,
          fact.occurred_at || null,
          fact.source_event_id || null,
          fact.source_report_id || null,
          fact.source_document_id || null,
          fact.consent_scope || null,
          fact.notes || null,
        ],
      );
      return mapFactRow(result.rows[0]);
    },
    async updateFactTrust(userId, factId, { trust_state, value_json, notes, confidence, source }) {
      const fields = ['trust_state = $3', 'updated_at = NOW()', 'deleted_at = NULL'];
      const params = [String(userId), String(factId), trust_state];
      if (value_json !== undefined) {
        params.push(JSON.stringify(value_json));
        fields.push(`value_json = $${params.length}::jsonb`);
      }
      if (notes !== undefined) {
        params.push(notes);
        fields.push(`notes = $${params.length}`);
      }
      if (confidence !== undefined) {
        params.push(confidence);
        fields.push(`confidence = $${params.length}`);
      }
      if (source !== undefined) {
        params.push(source);
        fields.push(`source = $${params.length}`);
      }
      const result = await pool.query(
        `UPDATE personal_health_profile_facts SET ${fields.join(', ')}
         WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`,
        params,
      );
      return result.rows[0] ? mapFactRow(result.rows[0]) : null;
    },
    async softDeleteFact(userId, factId) {
      const result = await pool.query(
        `UPDATE personal_health_profile_facts
         SET deleted_at = NOW(), updated_at = NOW()
         WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`,
        [String(userId), String(factId)],
      );
      return result.rows[0] ? mapFactRow(result.rows[0]) : null;
    },
    async hardDeleteAllForUser(userId) {
      const counts = await deletePersonalHealthProfileForUser(pool, userId);
      return counts.profiles + counts.facts;
    },
    async close() {
      if (ownsPool) await pool.end().catch(() => {});
    },
  };
};

const mapProfileRow = (row) => ({
  user_id: row.user_id,
  profile_version: Number(row.profile_version || 1),
  completion_percent: Number(row.completion_percent || 0),
  sections: row.sections || {},
  profile_preferences: row.profile_preferences || {},
  consent_scopes: row.consent_scopes || {},
  source_metadata: row.source_metadata || {},
  created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
  updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  last_reviewed_at: row.last_reviewed_at ? new Date(row.last_reviewed_at).toISOString() : null,
});

const mapFactRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  section: row.section,
  fact_key: row.fact_key,
  value_json: row.value_json,
  display_label: row.display_label,
  source: row.source,
  trust_state: row.trust_state,
  confidence: row.confidence,
  occurred_at: row.occurred_at ? new Date(row.occurred_at).toISOString() : null,
  recorded_at: row.recorded_at ? new Date(row.recorded_at).toISOString() : null,
  updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  source_event_id: row.source_event_id,
  source_report_id: row.source_report_id,
  source_document_id: row.source_document_id,
  consent_scope: row.consent_scope,
  notes: row.notes,
  deleted_at: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
});

const createFileBackend = (filePath) => {
  const read = () => {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return { profiles: {}, facts: {} };
    }
  };
  const write = (data) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  };

  return {
    kind: 'file',
    available: true,
    async ensureProfile(userId) {
      const data = read();
      const uid = String(userId);
      if (!data.profiles[uid]) {
        data.profiles[uid] = emptyProfile(uid);
        write(data);
      }
      return data.profiles[uid];
    },
    async getProfile(userId) {
      const data = read();
      return data.profiles[String(userId)] || null;
    },
    async upsertSection(userId, section, sectionData, { completionPercent, preferences } = {}) {
      const data = read();
      const uid = String(userId);
      if (!data.profiles[uid]) data.profiles[uid] = emptyProfile(uid);
      data.profiles[uid].sections = { ...(data.profiles[uid].sections || {}), [section]: sectionData || {} };
      if (completionPercent != null) data.profiles[uid].completion_percent = Number(completionPercent);
      if (preferences) data.profiles[uid].profile_preferences = preferences;
      data.profiles[uid].profile_version = Number(data.profiles[uid].profile_version || 1) + 1;
      data.profiles[uid].updated_at = new Date().toISOString();
      write(data);
      return data.profiles[uid];
    },
    async patchPreferences(userId, patch) {
      const data = read();
      const uid = String(userId);
      if (!data.profiles[uid]) data.profiles[uid] = emptyProfile(uid);
      data.profiles[uid].profile_preferences = {
        ...(data.profiles[uid].profile_preferences || {}),
        ...(patch || {}),
      };
      data.profiles[uid].profile_version += 1;
      data.profiles[uid].updated_at = new Date().toISOString();
      write(data);
      return data.profiles[uid];
    },
    async setCompletion(userId, percent) {
      const data = read();
      const uid = String(userId);
      if (!data.profiles[uid]) return null;
      data.profiles[uid].completion_percent = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
      data.profiles[uid].updated_at = new Date().toISOString();
      write(data);
      return data.profiles[uid];
    },
    async listFacts(userId, { section, trustStates, includeDeleted = false } = {}) {
      const data = read();
      return Object.values(data.facts || {})
        .filter((f) => f.user_id === String(userId))
        .filter((f) => includeDeleted || !f.deleted_at)
        .filter((f) => !section || f.section === section)
        .filter((f) => !trustStates?.length || trustStates.includes(f.trust_state))
        .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
        .slice(0, 500);
    },
    async getFact(userId, factId) {
      const data = read();
      const fact = data.facts?.[String(factId)];
      if (!fact || fact.user_id !== String(userId)) return null;
      return fact;
    },
    async upsertFact(userId, fact) {
      await this.ensureProfile(userId);
      const data = read();
      const id = fact.id || randomUUID().replace(/-/g, '').slice(0, 24);
      const existingKey = Object.keys(data.facts || {}).find((k) => {
        const f = data.facts[k];
        return (
          f.user_id === String(userId) &&
          f.section === fact.section &&
          f.fact_key === fact.fact_key &&
          f.source === fact.source &&
          f.trust_state === fact.trust_state &&
          !f.deleted_at
        );
      });
      const now = new Date().toISOString();
      const row = {
        id: existingKey || id,
        user_id: String(userId),
        section: fact.section,
        fact_key: fact.fact_key,
        value_json: fact.value_json ?? null,
        display_label: fact.display_label || null,
        source: fact.source,
        trust_state: fact.trust_state,
        confidence: fact.confidence || null,
        occurred_at: fact.occurred_at || null,
        recorded_at: now,
        updated_at: now,
        source_event_id: fact.source_event_id || null,
        source_report_id: fact.source_report_id || null,
        source_document_id: fact.source_document_id || null,
        consent_scope: fact.consent_scope || null,
        notes: fact.notes || null,
        deleted_at: null,
      };
      data.facts = data.facts || {};
      data.facts[row.id] = row;
      write(data);
      return row;
    },
    async updateFactTrust(userId, factId, patch) {
      const data = read();
      const fact = data.facts?.[String(factId)];
      if (!fact || fact.user_id !== String(userId) || fact.deleted_at) return null;
      Object.assign(fact, patch, { updated_at: new Date().toISOString(), deleted_at: null });
      write(data);
      return fact;
    },
    async softDeleteFact(userId, factId) {
      const data = read();
      const fact = data.facts?.[String(factId)];
      if (!fact || fact.user_id !== String(userId) || fact.deleted_at) return null;
      fact.deleted_at = new Date().toISOString();
      fact.updated_at = fact.deleted_at;
      write(data);
      return fact;
    },
    async hardDeleteAllForUser(userId) {
      const data = read();
      const uid = String(userId);
      let count = 0;
      if (data.profiles?.[uid]) {
        delete data.profiles[uid];
        count += 1;
      }
      for (const [id, fact] of Object.entries(data.facts || {})) {
        if (fact.user_id === uid) {
          delete data.facts[id];
          count += 1;
        }
      }
      write(data);
      return count;
    },
    async close() {},
  };
};

const createUnavailableBackend = (reason) => ({
  kind: 'unavailable',
  available: false,
  reason,
  async ensureProfile() {
    throw unavailableError(reason);
  },
  async getProfile() {
    throw unavailableError(reason);
  },
  async upsertSection() {
    throw unavailableError(reason);
  },
  async patchPreferences() {
    throw unavailableError(reason);
  },
  async setCompletion() {
    throw unavailableError(reason);
  },
  async listFacts() {
    throw unavailableError(reason);
  },
  async getFact() {
    throw unavailableError(reason);
  },
  async upsertFact() {
    throw unavailableError(reason);
  },
  async updateFactTrust() {
    throw unavailableError(reason);
  },
  async softDeleteFact() {
    throw unavailableError(reason);
  },
  async hardDeleteAllForUser() {
    throw unavailableError(reason);
  },
  async close() {},
});

export const createPersonalHealthProfileStore = async (filePathOrOptions, maybeOptions) => {
  const options =
    typeof filePathOrOptions === 'string' || filePathOrOptions == null
      ? { ...(maybeOptions || {}), filePath: filePathOrOptions }
      : { ...(filePathOrOptions || {}) };
  const env = options.env || process.env;
  const runtimeEnvironment = options.runtimeEnvironment || 'node';
  const filePath = options.filePath || null;
  const decision = resolvePersonalHealthProfileStorageDecision({ env, runtimeEnvironment });

  if (decision.mode === 'unavailable') {
    return {
      store: createUnavailableBackend(decision.reason),
      available: false,
      mode: 'unavailable',
      reason: decision.reason,
    };
  }
  if (decision.mode === 'postgres') {
    try {
      const url = getDatabaseUrl(env);
      if (!url) {
        return {
          store: createUnavailableBackend('database_missing'),
          available: false,
          mode: 'unavailable',
          reason: 'database_missing',
        };
      }
      const store = await createPostgresBackend(url, { pool: options.pool || null });
      return { store, available: true, mode: 'postgres', reason: decision.reason };
    } catch {
      if (isProductionLike(env)) {
        return {
          store: createUnavailableBackend('postgres_init_failed'),
          available: false,
          mode: 'unavailable',
          reason: 'postgres_init_failed',
        };
      }
      if (
        env.LUNA_HEALTH_PROFILE_ALLOW_FILE_FALLBACK === '1' ||
        runtimeEnvironment === 'test' ||
        String(env.PERSONAL_HEALTH_PROFILE_STORAGE || '').toLowerCase() === 'file'
      ) {
        const resolved =
          filePath || path.join(process.cwd(), '.data', `health-profile-${randomUUID()}.json`);
        return {
          store: createFileBackend(resolved),
          available: true,
          mode: 'file',
          reason: 'postgres_failed_explicit_file',
        };
      }
      return {
        store: createUnavailableBackend('postgres_init_failed'),
        available: false,
        mode: 'unavailable',
        reason: 'postgres_init_failed',
      };
    }
  }
  if (decision.mode === 'file') {
    const resolved =
      filePath || path.join(process.cwd(), '.data', `health-profile-${randomUUID()}.json`);
    return {
      store: createFileBackend(resolved),
      available: true,
      mode: 'file',
      reason: decision.reason,
    };
  }
  return {
    store: createUnavailableBackend(decision.reason || 'unknown'),
    available: false,
    mode: 'unavailable',
    reason: decision.reason || 'unknown',
  };
};

export const isPersonalHealthProfileStoreAvailable = (handleOrStore) => {
  if (!handleOrStore) return false;
  if (typeof handleOrStore.available === 'boolean') return handleOrStore.available;
  if (handleOrStore.store) return isPersonalHealthProfileStoreAvailable(handleOrStore.store);
  return handleOrStore.available !== false && handleOrStore.kind !== 'unavailable';
};

export const profileStorageUnavailablePayload = () => ({
  error: 'Personal health profile storage is unavailable.',
  code: PROFILE_STORAGE_UNAVAILABLE,
});
