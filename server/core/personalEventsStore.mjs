/**
 * Authenticated personal event store for Luna29.
 * Ownership is always the verified authenticated user_id — never client-supplied IDs.
 *
 * Storage authority:
 * - Production / Preview: Postgres only. Missing/broken DB fails closed (no JSON fallback).
 * - Development: Postgres when DATABASE_URL is set; file only with PERSONAL_EVENTS_STORAGE=file.
 * - Test: isolated file store allowed via PERSONAL_EVENTS_STORAGE=file or runtime environment=test.
 */
import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ensurePersonalEventsTable, getPgPoolStatus } from './database.mjs';

export const PERSONAL_EVENT_SCHEMA_VERSION = 1;
export const MAX_EVENTS_PER_REQUEST = 100;
export const MAX_PAYLOAD_CHARS = 64_000;
export const DEFAULT_LIST_LIMIT = 50;
export const MAX_LIST_LIMIT = 200;
export const PERSONAL_EVENT_STORE_UNAVAILABLE = 'PERSONAL_EVENT_STORE_UNAVAILABLE';

/** Existing local EventType values + foundation logical types. */
export const ALLOWED_EVENT_TYPES = new Set([
  'DAILY_CHECKIN',
  'CYCLE_SYNC',
  'LAB_MARKER_ENTRY',
  'MEDICATION_LOG',
  'INSIGHT_GENERATED',
  'ONBOARDING_COMPLETE',
  'DATA_EXPORTED',
  'PROFILE_UPDATE',
  'AUTH_SUCCESS',
  'SUBSCRIPTION_PURCHASE',
  'AUDIO_REFLECTION',
  'FUEL_LOG',
  'onboarding',
  'reflection',
  'voice_reflection',
  'chat',
  'cycle',
  'sleep',
  'energy',
  'mood',
  'symptom',
  'body_sensation',
  'medication',
  'bridge',
  'report',
  'insight',
  'user_correction',
  'note',
]);

const ALLOWED_SOURCES = new Set([
  'web',
  'mobile',
  'api',
  'local_sync',
  'import',
  'system',
  'unknown',
]);

const safeText = (value, max = 240) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, max);
};

const isIsoTimestamp = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  const ms = Date.parse(value);
  return Number.isFinite(ms);
};

const toIso = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && isIsoTimestamp(value)) return new Date(value).toISOString();
  return new Date().toISOString();
};

const newId = () => randomBytes(12).toString('hex');

const publicEvent = (row) => ({
  id: row.id,
  user_id: row.user_id,
  event_type: row.event_type,
  occurred_at: toIso(row.occurred_at),
  created_at: toIso(row.created_at),
  updated_at: toIso(row.updated_at),
  source: row.source,
  payload: row.payload && typeof row.payload === 'object' ? row.payload : {},
  schema_version: Number(row.schema_version) || PERSONAL_EVENT_SCHEMA_VERSION,
  client_event_id: row.client_event_id || null,
  deleted_at: row.deleted_at ? toIso(row.deleted_at) : null,
});

/**
 * Normalize and validate a client event input.
 * Ignores any client-supplied user_id / owner_id.
 */
export const normalizePersonalEventInput = (raw, { defaultSource = 'api' } = {}) => {
  if (!raw || typeof raw !== 'object') {
    return { error: 'Event must be an object.' };
  }

  const eventType = safeText(raw.event_type || raw.type || '', 80);
  if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
    return { error: 'Invalid or unsupported event_type.' };
  }

  const occurredRaw = raw.occurred_at || raw.timestamp || raw.occurredAt;
  if (occurredRaw !== undefined && occurredRaw !== null && occurredRaw !== '' && !isIsoTimestamp(String(occurredRaw))) {
    return { error: 'Invalid occurred_at timestamp.' };
  }
  const occurredAt = occurredRaw ? toIso(String(occurredRaw)) : new Date().toISOString();

  const payload = raw.payload && typeof raw.payload === 'object' && !Array.isArray(raw.payload) ? raw.payload : {};
  let payloadJson;
  try {
    payloadJson = JSON.stringify(payload);
  } catch {
    return { error: 'Invalid payload JSON.' };
  }
  if (payloadJson.length > MAX_PAYLOAD_CHARS) {
    return { error: `Payload exceeds ${MAX_PAYLOAD_CHARS} characters.` };
  }

  const sourceRaw = safeText(raw.source || defaultSource, 40).toLowerCase() || defaultSource;
  const source = ALLOWED_SOURCES.has(sourceRaw) ? sourceRaw : 'unknown';

  const clientEventId = safeText(raw.client_event_id || raw.clientEventId || raw.id || '', 120) || null;
  const schemaVersion = Number.isFinite(Number(raw.schema_version ?? raw.version))
    ? Math.max(1, Math.floor(Number(raw.schema_version ?? raw.version)))
    : PERSONAL_EVENT_SCHEMA_VERSION;

  return {
    event: {
      event_type: eventType,
      occurred_at: occurredAt,
      source,
      payload,
      schema_version: schemaVersion,
      client_event_id: clientEventId,
    },
  };
};

const createUnavailableStore = (reason) => ({
  available: false,
  mode: 'unavailable',
  reason,
  async create() {
    throw Object.assign(new Error('Personal event store unavailable.'), {
      code: PERSONAL_EVENT_STORE_UNAVAILABLE,
      reason,
    });
  },
  async list() {
    throw Object.assign(new Error('Personal event store unavailable.'), {
      code: PERSONAL_EVENT_STORE_UNAVAILABLE,
      reason,
    });
  },
  async softDelete() {
    throw Object.assign(new Error('Personal event store unavailable.'), {
      code: PERSONAL_EVENT_STORE_UNAVAILABLE,
      reason,
    });
  },
  async getOwned() {
    throw Object.assign(new Error('Personal event store unavailable.'), {
      code: PERSONAL_EVENT_STORE_UNAVAILABLE,
      reason,
    });
  },
});

const envHasDatabaseUrl = (env) => Boolean(String(env?.DATABASE_URL || '').trim());

/**
 * Resolve storage mode from server environment only.
 * Request headers/body/query cannot select file mode.
 *
 * Important: Vitest sets VITEST in process.env. That must NOT select file mode
 * when simulating production/preview (VERCEL_ENV or NODE_ENV=production).
 * Isolated file store is only for explicit runtimeEnvironment === 'test'
 * or PERSONAL_EVENTS_STORAGE=file outside production/preview.
 */
export const resolvePersonalEventsStorageDecision = ({
  env = process.env,
  runtimeEnvironment = 'node',
} = {}) => {
  const vercelEnv = String(env.VERCEL_ENV || '').trim().toLowerCase();
  const nodeEnv = String(env.NODE_ENV || '').trim().toLowerCase();
  const explicit = String(env.PERSONAL_EVENTS_STORAGE || '').trim().toLowerCase();
  const hasDb = envHasDatabaseUrl(env);
  const isProdLike =
    vercelEnv === 'production' ||
    vercelEnv === 'preview' ||
    nodeEnv === 'production';
  const isExplicitTestHarness = runtimeEnvironment === 'test';

  // Explicit file mode is never allowed in production/preview.
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

  // Production / preview: Postgres only. Never JSON/file, even under Vitest.
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

const createFileStore = (filePath) => {
  let cache = null;

  const load = async () => {
    if (cache) return cache;
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      cache = Array.isArray(parsed?.events) ? { events: parsed.events } : { events: [] };
    } catch {
      cache = { events: [] };
    }
    return cache;
  };

  const save = async (state) => {
    cache = state;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
  };

  return {
    available: true,
    mode: 'file',
    reason: 'explicit_file_opt_in',
    async create(userId, input) {
      const state = await load();
      const now = new Date().toISOString();
      if (input.client_event_id) {
        const existing = state.events.find(
          (item) => item.user_id === userId && item.client_event_id === input.client_event_id,
        );
        if (existing) {
          existing.event_type = input.event_type;
          existing.occurred_at = input.occurred_at;
          existing.source = input.source;
          existing.payload = input.payload;
          existing.schema_version = input.schema_version;
          existing.updated_at = now;
          existing.deleted_at = null;
          await save(state);
          return { event: publicEvent(existing), created: false };
        }
      }
      const row = {
        id: newId(),
        user_id: userId,
        event_type: input.event_type,
        occurred_at: input.occurred_at,
        created_at: now,
        updated_at: now,
        source: input.source,
        payload: input.payload,
        schema_version: input.schema_version,
        client_event_id: input.client_event_id,
        deleted_at: null,
      };
      state.events.push(row);
      await save(state);
      return { event: publicEvent(row), created: true };
    },

    async list(userId, { eventType, since, until, limit, offset, includeDeleted } = {}) {
      const state = await load();
      let rows = state.events.filter((item) => item.user_id === userId);
      if (!includeDeleted) rows = rows.filter((item) => !item.deleted_at);
      if (eventType) rows = rows.filter((item) => item.event_type === eventType);
      if (since) {
        const sinceMs = Date.parse(since);
        rows = rows.filter((item) => Date.parse(item.occurred_at) >= sinceMs);
      }
      if (until) {
        const untilMs = Date.parse(until);
        rows = rows.filter((item) => Date.parse(item.occurred_at) <= untilMs);
      }
      rows.sort((a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at) || String(b.id).localeCompare(String(a.id)));
      const total = rows.length;
      const sliced = rows.slice(offset, offset + limit).map(publicEvent);
      return { events: sliced, total, limit, offset };
    },

    async softDelete(userId, eventId) {
      const state = await load();
      const row = state.events.find((item) => item.id === eventId && item.user_id === userId && !item.deleted_at);
      if (!row) return null;
      row.deleted_at = new Date().toISOString();
      row.updated_at = row.deleted_at;
      await save(state);
      return publicEvent(row);
    },

    async getOwned(userId, eventId) {
      const state = await load();
      const row = state.events.find((item) => item.id === eventId && item.user_id === userId);
      return row ? publicEvent(row) : null;
    },
  };
};

const createPgStore = (pool) => ({
  available: true,
  mode: 'postgres',
  reason: 'database_configured',
  async create(userId, input) {
    const id = newId();
    const now = new Date().toISOString();
    if (input.client_event_id) {
      const existing = await pool.query(
        `SELECT * FROM personal_events
         WHERE user_id = $1 AND client_event_id = $2
         LIMIT 1`,
        [userId, input.client_event_id],
      );
      if (existing.rows[0]) {
        const updated = await pool.query(
          `UPDATE personal_events
           SET event_type = $1, occurred_at = $2, source = $3, payload = $4::jsonb,
               schema_version = $5, updated_at = $6, deleted_at = NULL
           WHERE id = $7 AND user_id = $8
           RETURNING *`,
          [
            input.event_type,
            input.occurred_at,
            input.source,
            JSON.stringify(input.payload),
            input.schema_version,
            now,
            existing.rows[0].id,
            userId,
          ],
        );
        return { event: publicEvent(updated.rows[0]), created: false };
      }
    }

    try {
      const inserted = await pool.query(
        `INSERT INTO personal_events
          (id, user_id, event_type, occurred_at, created_at, updated_at, source, payload, schema_version, client_event_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10)
         RETURNING *`,
        [
          id,
          userId,
          input.event_type,
          input.occurred_at,
          now,
          now,
          input.source,
          JSON.stringify(input.payload),
          input.schema_version,
          input.client_event_id,
        ],
      );
      return { event: publicEvent(inserted.rows[0]), created: true };
    } catch (error) {
      if (input.client_event_id && /unique|duplicate/i.test(String(error?.message || ''))) {
        const existing = await pool.query(
          `SELECT * FROM personal_events WHERE user_id = $1 AND client_event_id = $2 LIMIT 1`,
          [userId, input.client_event_id],
        );
        if (existing.rows[0]) {
          const updated = await pool.query(
            `UPDATE personal_events
             SET event_type = $1, occurred_at = $2, source = $3, payload = $4::jsonb,
                 schema_version = $5, updated_at = $6, deleted_at = NULL
             WHERE id = $7 AND user_id = $8
             RETURNING *`,
            [
              input.event_type,
              input.occurred_at,
              input.source,
              JSON.stringify(input.payload),
              input.schema_version,
              now,
              existing.rows[0].id,
              userId,
            ],
          );
          return { event: publicEvent(updated.rows[0]), created: false };
        }
      }
      throw error;
    }
  },

  async list(userId, { eventType, since, until, limit, offset, includeDeleted } = {}) {
    const clauses = ['user_id = $1'];
    const params = [userId];
    if (!includeDeleted) clauses.push('deleted_at IS NULL');
    if (eventType) {
      params.push(eventType);
      clauses.push(`event_type = $${params.length}`);
    }
    if (since) {
      params.push(since);
      clauses.push(`occurred_at >= $${params.length}`);
    }
    if (until) {
      params.push(until);
      clauses.push(`occurred_at <= $${params.length}`);
    }
    const where = clauses.join(' AND ');
    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM personal_events WHERE ${where}`, params);
    params.push(limit);
    params.push(offset);
    const result = await pool.query(
      `SELECT * FROM personal_events
       WHERE ${where}
       ORDER BY occurred_at DESC, id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return {
      events: result.rows.map(publicEvent),
      total: countResult.rows[0]?.total || 0,
      limit,
      offset,
    };
  },

  async softDelete(userId, eventId) {
    const result = await pool.query(
      `UPDATE personal_events
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [eventId, userId],
    );
    return result.rows[0] ? publicEvent(result.rows[0]) : null;
  },

  async getOwned(userId, eventId) {
    const result = await pool.query(
      `SELECT * FROM personal_events WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [eventId, userId],
    );
    return result.rows[0] ? publicEvent(result.rows[0]) : null;
  },
});

const logStoreDecision = (decision) => {
  if (decision.mode === 'unavailable') {
    console.warn('[personal-events] store unavailable:', decision.reason);
  }
};

/**
 * Create the personal events store.
 * Never silently falls back from Postgres to JSON in production/preview.
 * File mode requires explicit PERSONAL_EVENTS_STORAGE=file (or isolated test runtime).
 */
export const createPersonalEventsStore = async (filePathOrOptions, maybeOptions) => {
  const options =
    typeof filePathOrOptions === 'string'
      ? { filePath: filePathOrOptions, ...(maybeOptions || {}) }
      : filePathOrOptions || {};
  const filePath = options.filePath;
  const runtimeEnvironment = options.runtimeEnvironment || options.environment || 'node';
  const env = options.env || process.env;

  const decision = resolvePersonalEventsStorageDecision({ env, runtimeEnvironment });

  if (decision.mode === 'unavailable') {
    logStoreDecision(decision);
    const store = createUnavailableStore(decision.reason);
    return { store, available: false, mode: 'unavailable', reason: decision.reason };
  }

  if (decision.mode === 'file') {
    if (!filePath) {
      logStoreDecision({ mode: 'unavailable', reason: 'file_path_missing' });
      const store = createUnavailableStore('file_path_missing');
      return { store, available: false, mode: 'unavailable', reason: 'file_path_missing' };
    }
    const store = createFileStore(filePath);
    return { store, available: true, mode: 'file', reason: decision.reason };
  }

  // Postgres path — connection/schema failures fail closed (no file fallback).
  const poolStatus = await getPgPoolStatus();
  if (!poolStatus.pool) {
    const reason =
      poolStatus.category === 'database_missing' ? 'database_missing' : 'database_connection_failed';
    logStoreDecision({ mode: 'unavailable', reason });
    const store = createUnavailableStore(reason);
    return { store, available: false, mode: 'unavailable', reason };
  }

  try {
    const ready = await ensurePersonalEventsTable();
    if (!ready) {
      logStoreDecision({ mode: 'unavailable', reason: 'schema_init_failed' });
      const store = createUnavailableStore('schema_init_failed');
      return { store, available: false, mode: 'unavailable', reason: 'schema_init_failed' };
    }
  } catch {
    logStoreDecision({ mode: 'unavailable', reason: 'schema_init_failed' });
    const store = createUnavailableStore('schema_init_failed');
    return { store, available: false, mode: 'unavailable', reason: 'schema_init_failed' };
  }

  const store = createPgStore(poolStatus.pool);
  return { store, available: true, mode: 'postgres', reason: decision.reason };
};

export const isPersonalEventStoreAvailable = (handleOrStore) => {
  if (!handleOrStore) return false;
  if (typeof handleOrStore.available === 'boolean') return handleOrStore.available;
  return handleOrStore.available !== false;
};

export const isPersonalEventsStoreAvailable = isPersonalEventStoreAvailable;

export const syncLocalEventsForUser = async (storeOrHandle, userId, localEvents) => {
  const store = storeOrHandle?.store || storeOrHandle;
  if (!isPersonalEventStoreAvailable(storeOrHandle) && !isPersonalEventStoreAvailable(store)) {
    return {
      error: 'Personal event store unavailable.',
      code: PERSONAL_EVENT_STORE_UNAVAILABLE,
      imported: 0,
      updated: 0,
      skipped: 0,
      events: [],
    };
  }
  if (!Array.isArray(localEvents)) {
    return { error: 'events must be an array.', imported: 0, updated: 0, skipped: 0, events: [] };
  }
  if (localEvents.length > MAX_EVENTS_PER_REQUEST) {
    return {
      error: `At most ${MAX_EVENTS_PER_REQUEST} events per request.`,
      imported: 0,
      updated: 0,
      skipped: 0,
      events: [],
    };
  }

  const importedEvents = [];
  const updatedEvents = [];
  const errors = [];
  let skipped = 0;

  for (let i = 0; i < localEvents.length; i += 1) {
    const item = localEvents[i];
    const normalized = normalizePersonalEventInput(
      {
        ...item,
        event_type: item?.event_type || item?.type,
        occurred_at: item?.occurred_at || item?.timestamp,
        client_event_id: item?.client_event_id || item?.id,
        source: item?.source || 'local_sync',
        schema_version: item?.schema_version || item?.version,
        payload: item?.payload && typeof item.payload === 'object' ? item.payload : {},
      },
      { defaultSource: 'local_sync' },
    );
    if (normalized.error) {
      errors.push({ index: i, error: normalized.error });
      skipped += 1;
      continue;
    }
    const result = await store.create(userId, normalized.event);
    if (result.created) importedEvents.push(result.event);
    else updatedEvents.push(result.event);
  }

  return {
    imported: importedEvents.length,
    updated: updatedEvents.length,
    skipped,
    errors: errors.length ? errors : undefined,
    events: [...importedEvents, ...updatedEvents],
  };
};
