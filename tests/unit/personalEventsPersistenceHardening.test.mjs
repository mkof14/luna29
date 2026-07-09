import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

/**
 * Task 2.1 — production persistence hardening.
 * Personal events must never silently fall back to JSON/file in production.
 */

const createMockRes = () => {
  const res = {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(status, headers = {}) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(chunk = '') {
      this.body = typeof chunk === 'string' ? chunk : chunk?.toString?.() || '';
    },
  };
  return res;
};

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.10' }) => {
  const payload = body === undefined ? null : Buffer.from(JSON.stringify(body), 'utf8');
  const req = payload ? Readable.from([payload]) : Readable.from([]);
  req.method = method;
  req.url = pathname;
  req.headers = {
    host: 'localhost',
    ...(payload ? { 'content-type': 'application/json', 'content-length': String(payload.length) } : {}),
    ...headers,
  };
  req.socket = { remoteAddress: ip };

  const res = createMockRes();
  await handler(req, res);
  let json = null;
  try {
    json = res.body ? JSON.parse(res.body) : null;
  } catch {
    json = null;
  }
  return { statusCode: res.statusCode, headers: res.headers, json, body: res.body };
};

describe('personal events persistence hardening (Task 2.1)', () => {
  let dataDir;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-persist-harden-'));
    delete process.env.DATABASE_URL;
    delete process.env.PERSONAL_EVENTS_STORAGE;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL;
    process.env.NODE_ENV = 'test';
  });

  afterEach(async () => {
    process.env = originalEnv;
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('1. production + missing DATABASE_URL: no file fallback, request fails closed', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.DATABASE_URL;
    delete process.env.PERSONAL_EVENTS_STORAGE;

    const { resolvePersonalEventsStorageDecision, createPersonalEventsStore } = await import(
      '../../server/core/personalEventsStore.mjs'
    );
    const decision = resolvePersonalEventsStorageDecision({
      env: process.env,
      runtimeEnvironment: 'vercel',
    });
    expect(decision.mode).toBe('unavailable');
    expect(decision.reason).toBe('database_missing');

    const handle = await createPersonalEventsStore(path.join(dataDir, 'personal-events.json'), {
      runtimeEnvironment: 'vercel',
      env: process.env,
    });
    expect(handle.available).toBe(false);
    expect(handle.mode).toBe('unavailable');

    const files = await fs.readdir(dataDir);
    expect(files.includes('personal-events.json')).toBe(false);

    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'vercel' });
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'prod-missing-db@test.com', password: 'password123', name: 'Prod' },
      ip: '198.51.100.1',
    });
    // WS1.1: critical durable JSON (users/sessions) also blocked without DATABASE_URL.
    expect(signup.statusCode).toBe(503);
    expect(signup.json?.code).toBe('DURABLE_STORAGE_UNAVAILABLE');
    expect(JSON.stringify(signup.json)).not.toMatch(/should not persist/);
    expect(JSON.stringify(signup.json)).not.toMatch(/postgresql:\/\/|passwordHash|stack/i);
    const filesAfter = await fs.readdir(dataDir);
    expect(filesAfter.includes('users.json')).toBe(false);
    expect(filesAfter.includes('personal-events.json')).toBe(false);
  });

  it('2. production + explicit file mode: rejected', async () => {
    const { resolvePersonalEventsStorageDecision, createPersonalEventsStore } = await import(
      '../../server/core/personalEventsStore.mjs'
    );
    const decision = resolvePersonalEventsStorageDecision({
      env: {
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
        PERSONAL_EVENTS_STORAGE: 'file',
      },
      runtimeEnvironment: 'vercel',
    });
    expect(decision.mode).toBe('unavailable');
    expect(decision.reason).toBe('file_rejected_in_production');

    const handle = await createPersonalEventsStore(path.join(dataDir, 'personal-events.json'), {
      runtimeEnvironment: 'vercel',
      env: {
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
        PERSONAL_EVENTS_STORAGE: 'file',
      },
    });
    expect(handle.available).toBe(false);
    const files = await fs.readdir(dataDir);
    expect(files.includes('personal-events.json')).toBe(false);
  });

  it('3. development + missing DATABASE_URL + no file opt-in: no silent file fallback', async () => {
    const { resolvePersonalEventsStorageDecision, createPersonalEventsStore } = await import(
      '../../server/core/personalEventsStore.mjs'
    );
    const decision = resolvePersonalEventsStorageDecision({
      env: {
        NODE_ENV: 'development',
        DATABASE_URL: '',
      },
      runtimeEnvironment: 'node',
    });
    expect(decision.mode).toBe('unavailable');
    expect(decision.reason).toBe('database_missing');

    const handle = await createPersonalEventsStore(path.join(dataDir, 'personal-events.json'), {
      runtimeEnvironment: 'node',
      env: { NODE_ENV: 'development' },
    });
    expect(handle.available).toBe(false);
    const files = await fs.readdir(dataDir);
    expect(files.includes('personal-events.json')).toBe(false);
  });

  it('4. development + explicit file opt-in: file store works', async () => {
    const { createPersonalEventsStore } = await import('../../server/core/personalEventsStore.mjs');
    const filePath = path.join(dataDir, 'personal-events.json');
    const handle = await createPersonalEventsStore(filePath, {
      runtimeEnvironment: 'node',
      env: {
        NODE_ENV: 'development',
        PERSONAL_EVENTS_STORAGE: 'file',
      },
    });
    expect(handle.available).toBe(true);
    expect(handle.mode).toBe('file');
    const created = await handle.store.create('user-dev-1', {
      event_type: 'note',
      occurred_at: new Date().toISOString(),
      source: 'api',
      payload: { text: 'dev file ok' },
      schema_version: 1,
      client_event_id: 'dev-1',
    });
    expect(created.created).toBe(true);
    const raw = await fs.readFile(filePath, 'utf8');
    expect(raw).toContain('dev-1');
  });

  it('5. test mode: isolated store works', async () => {
    process.env.NODE_ENV = 'test';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    delete process.env.DATABASE_URL;
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'test-file@test.com', password: 'password123', name: 'Test' },
      ip: '198.51.100.5',
    });
    expect(signup.statusCode).toBe(200);
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: { authorization: `Bearer ${signup.json.token}` },
      body: { event_type: 'note', payload: { text: 'test ok' }, client_event_id: 't1' },
      ip: '198.51.100.5',
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.events?.[0]?.client_event_id).toBe('t1');
  });

  it('6. Postgres connection failure: no file fallback', async () => {
    const db = await import('../../server/core/database.mjs');
    const {
      createPersonalEventsStore,
      PERSONAL_EVENT_STORE_UNAVAILABLE,
    } = await import('../../server/core/personalEventsStore.mjs');
    db.__setPgPoolStatusForTests({ pool: null, category: 'database_connection_failed' });
    try {
      const handle = await createPersonalEventsStore({
        filePath: path.join(dataDir, 'personal-events.json'),
        env: {
          NODE_ENV: 'production',
          VERCEL_ENV: 'production',
          DATABASE_URL: 'postgresql://invalid:invalid@127.0.0.1:1/luna',
          PERSONAL_EVENTS_STORAGE: '',
        },
        runtimeEnvironment: 'vercel',
      });
      expect(handle.available).toBe(false);
      expect(handle.mode).toBe('unavailable');
      expect(handle.reason).toBe('database_connection_failed');
      await expect(
        handle.store.create('user-a', {
          event_type: 'note',
          occurred_at: new Date().toISOString(),
          source: 'api',
          payload: {},
          schema_version: 1,
          client_event_id: null,
        }),
      ).rejects.toMatchObject({ code: PERSONAL_EVENT_STORE_UNAVAILABLE });
      const files = await fs.readdir(dataDir);
      expect(files.includes('personal-events.json')).toBe(false);
    } finally {
      db.__setPgPoolStatusForTests(null);
    }
  });

  it('7. schema initialization failure: no file fallback', async () => {
    vi.resetModules();
    vi.doMock('../../server/core/database.mjs', async () => {
      const actual = await vi.importActual('../../server/core/database.mjs');
      return {
        ...actual,
        isDatabaseEnabled: () => true,
        getPgPoolStatus: async () => ({
          ok: true,
          pool: { query: async () => ({ rows: [] }) },
          category: 'ok',
        }),
        ensurePersonalEventsTable: async () => {
          throw new Error('schema boom');
        },
      };
    });

    const { createPersonalEventsStore } = await import('../../server/core/personalEventsStore.mjs');
    const handle = await createPersonalEventsStore(path.join(dataDir, 'personal-events.json'), {
      runtimeEnvironment: 'vercel',
      env: {
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
        DATABASE_URL: 'postgresql://example/luna29',
      },
    });
    expect(handle.available).toBe(false);
    expect(handle.reason).toBe('schema_init_failed');
    const files = await fs.readdir(dataDir);
    expect(files.includes('personal-events.json')).toBe(false);
    vi.doUnmock('../../server/core/database.mjs');
    vi.resetModules();
  });

  it('8-9. API returns controlled unavailable response without sensitive payload', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'preview';
    delete process.env.DATABASE_URL;
    delete process.env.PERSONAL_EVENTS_STORAGE;
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'vercel' });
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'preview-503@test.com', password: 'password123', name: 'Preview' },
      ip: '198.51.100.8',
    });
    // WS1.1 blocks critical durable JSON before personal_events path is reachable.
    expect(signup.statusCode).toBe(503);
    expect(signup.json?.code).toBe('DURABLE_STORAGE_UNAVAILABLE');
    expect(signup.body).not.toMatch(/postgresql:\/\/|passwordHash|stack/i);
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: { authorization: 'Bearer fake' },
      body: { event_type: 'note', payload: { text: 'SECRET_HEALTH_PAYLOAD_XYZ' } },
      ip: '198.51.100.8',
    });
    expect(create.statusCode).toBe(503);
    expect(create.json?.code).toBe('DURABLE_STORAGE_UNAVAILABLE');
    expect(create.body).not.toContain('SECRET_HEALTH_PAYLOAD_XYZ');
  });

  it('13-14. file mode cannot be forced by request header/query/body', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.DATABASE_URL;
    delete process.env.PERSONAL_EVENTS_STORAGE;
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'vercel' });
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events?PERSONAL_EVENTS_STORAGE=file&storage=file',
      headers: {
        authorization: 'Bearer fake',
        'x-personal-events-storage': 'file',
        'x-luna-storage': 'file',
      },
      body: {
        event_type: 'note',
        payload: { text: 'force' },
        PERSONAL_EVENTS_STORAGE: 'file',
        storage: 'file',
      },
      ip: '198.51.100.9',
    });
    expect(create.statusCode).toBe(503);
    expect(create.json?.code).toBe('DURABLE_STORAGE_UNAVAILABLE');
    const files = await fs.readdir(dataDir);
    expect(files.includes('personal-events.json')).toBe(false);
    expect(files.includes('users.json')).toBe(false);
  });

  it('preview missing DB fails closed (no silent JSON)', async () => {
    const { resolvePersonalEventsStorageDecision } = await import('../../server/core/personalEventsStore.mjs');
    const decision = resolvePersonalEventsStorageDecision({
      env: { NODE_ENV: 'production', VERCEL_ENV: 'preview' },
      runtimeEnvironment: 'vercel',
    });
    expect(decision.mode).toBe('unavailable');
    expect(decision.reason).toBe('database_missing');
  });
});
