import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

/**
 * WS1.1 — Durable storage production guard.
 * Critical JSON/tmp stores must not run in production/preview without DATABASE_URL.
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

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.50' }) => {
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

const listCriticalJsonFiles = async (dir) => {
  const names = await fs.readdir(dir).catch(() => []);
  return names.filter((n) =>
    [
      'users.json',
      'sessions.json',
      'billing-state.json',
      'admin-state.json',
      'privacy-requests.json',
      'mobile-reflections.json',
      'mobile-reports.json',
      'mobile-state.json',
      'mobile-push.json',
      'calendar-data.json',
    ].includes(n),
  );
};

describe('durable storage production guard (WS1.1)', () => {
  let dataDir;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-durable-guard-'));
    delete process.env.DATABASE_URL;
    delete process.env.PERSONAL_EVENTS_STORAGE;
    delete process.env.MEMORY_CONSENT_STORAGE;
    delete process.env.LUNA_MEMORY_CONSENT_ALLOW_FILE_FALLBACK;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL;
    process.env.NODE_ENV = 'test';
    vi.resetModules();
  });

  afterEach(async () => {
    process.env = originalEnv;
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('resolver: production missing DATABASE_URL → unavailable', async () => {
    const { resolveDurableJsonStorageDecision, CRITICAL_DURABLE_STORES } = await import(
      '../../server/core/durableStorageGuard.mjs'
    );
    const decision = resolveDurableJsonStorageDecision({
      env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
      runtimeEnvironment: 'vercel',
    });
    expect(decision.allowed).toBe(false);
    expect(decision.mode).toBe('unavailable');
    expect(decision.reason).toBe('database_missing');
    expect(decision.stores).toEqual(CRITICAL_DURABLE_STORES);
  });

  it('resolver: preview missing DATABASE_URL → unavailable', async () => {
    const { resolveDurableJsonStorageDecision } = await import('../../server/core/durableStorageGuard.mjs');
    const decision = resolveDurableJsonStorageDecision({
      env: { NODE_ENV: 'production', VERCEL_ENV: 'preview' },
      runtimeEnvironment: 'vercel',
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('database_missing');
  });

  it('resolver: NODE_ENV=production alone missing DB → unavailable', async () => {
    const { resolveDurableJsonStorageDecision } = await import('../../server/core/durableStorageGuard.mjs');
    const decision = resolveDurableJsonStorageDecision({
      env: { NODE_ENV: 'production' },
      runtimeEnvironment: 'node',
    });
    expect(decision.allowed).toBe(false);
  });

  it('resolver: production with DATABASE_URL → allowed (migration still pending)', async () => {
    const { resolveDurableJsonStorageDecision } = await import('../../server/core/durableStorageGuard.mjs');
    const decision = resolveDurableJsonStorageDecision({
      env: {
        NODE_ENV: 'production',
        VERCEL_ENV: 'production',
        DATABASE_URL: 'postgresql://example/luna29',
      },
      runtimeEnvironment: 'vercel',
    });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe('database_configured');
  });

  it('resolver: development without DATABASE_URL → local JSON allowed', async () => {
    const { resolveDurableJsonStorageDecision } = await import('../../server/core/durableStorageGuard.mjs');
    const decision = resolveDurableJsonStorageDecision({
      env: { NODE_ENV: 'development' },
      runtimeEnvironment: 'node',
    });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe('dev_local_json');
  });

  it('resolver: explicit test harness without DATABASE_URL → JSON allowed', async () => {
    const { resolveDurableJsonStorageDecision } = await import('../../server/core/durableStorageGuard.mjs');
    const decision = resolveDurableJsonStorageDecision({
      env: { NODE_ENV: 'test' },
      runtimeEnvironment: 'test',
    });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe('test_isolated_json');
  });

  it('API: production missing DATABASE_URL blocks signup and does not write critical JSON', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.DATABASE_URL;

    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'vercel' });

    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'prod-guard@test.com', password: 'password123', name: 'Prod' },
    });
    expect(signup.statusCode).toBe(503);
    expect(signup.json?.code).toBe('DURABLE_STORAGE_UNAVAILABLE');
    expect(signup.body).not.toMatch(/postgresql:\/\/|passwordHash|stack/i);

    const health = await invoke(handler, { method: 'GET', path: '/api/health?verbose=1' });
    expect(health.statusCode).toBe(503);
    expect(health.json?.ok).toBe(false);
    expect(health.json?.checks?.durableStorage).toBe('unavailable');
    expect(health.json?.checks?.database).toBe('unavailable');

    expect(await listCriticalJsonFiles(dataDir)).toEqual([]);
  });

  it('API: preview missing DATABASE_URL blocks auth and critical JSON writes', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'preview';
    delete process.env.DATABASE_URL;

    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'vercel' });

    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email: 'preview-guard@test.com', password: 'password123', name: 'Preview' },
    });
    expect(signup.statusCode).toBe(503);
    expect(signup.json?.code).toBe('DURABLE_STORAGE_UNAVAILABLE');
    expect(await listCriticalJsonFiles(dataDir)).toEqual([]);
  });

  it('API: test harness without DATABASE_URL still allows local JSON auth', async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.VERCEL_ENV;
    delete process.env.DATABASE_URL;

    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'test' });

    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'test-guard@test.com', password: 'password123', name: 'Test' },
      ip: '198.51.100.77',
    });
    expect(signup.statusCode).toBe(200);
    expect(signup.json?.token).toBeTruthy();
    const files = await fs.readdir(dataDir);
    expect(files.includes('users.json')).toBe(true);
  });

  it('personal_events fail-closed unchanged when prod missing DATABASE_URL', async () => {
    const { resolvePersonalEventsStorageDecision, createPersonalEventsStore } = await import(
      '../../server/core/personalEventsStore.mjs'
    );
    const decision = resolvePersonalEventsStorageDecision({
      env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
      runtimeEnvironment: 'vercel',
    });
    expect(decision.mode).toBe('unavailable');
    expect(decision.reason).toBe('database_missing');

    const handle = await createPersonalEventsStore(path.join(dataDir, 'personal-events.json'), {
      runtimeEnvironment: 'vercel',
      env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
    });
    expect(handle.available).toBe(false);
    const files = await fs.readdir(dataDir);
    expect(files.includes('personal-events.json')).toBe(false);
  });

  it('memory_consent fail-closed unchanged when prod missing DATABASE_URL', async () => {
    const { resolveMemoryConsentStorageDecision, createMemoryConsentStore } = await import(
      '../../server/core/memoryConsentStore.mjs'
    );
    const decision = resolveMemoryConsentStorageDecision({
      env: { NODE_ENV: 'production', VERCEL_ENV: 'preview' },
      runtimeEnvironment: 'vercel',
    });
    expect(decision.mode).toBe('unavailable');
    expect(decision.reason).toBe('database_missing');

    const handle = await createMemoryConsentStore(path.join(dataDir, 'memory-consent.json'), {
      runtimeEnvironment: 'vercel',
      env: { NODE_ENV: 'production', VERCEL_ENV: 'preview' },
    });
    expect(handle.available).toBe(false);
    const files = await fs.readdir(dataDir);
    expect(files.includes('memory-consent.json')).toBe(false);
  });
});
