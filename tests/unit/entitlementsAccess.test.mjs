import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';

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

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.90' }) => {
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

describe('entitlements resolver', () => {
  it('1/2. active and trialing are entitled', async () => {
    const { resolveEntitlement, isPremiumStatus } = await import('../../server/core/entitlements.mjs');
    expect(isPremiumStatus('active')).toBe(true);
    expect(isPremiumStatus('trialing')).toBe(true);
    const active = await resolveEntitlement({
      user: { id: 'u1', email: 'a@x.com' },
      billingStorageMode: 'json',
      billingService: {
        getStatusForUser: async () => ({ billing: { status: 'active' }, trial: null }),
      },
    });
    expect(active.entitled).toBe(true);
    const trial = await resolveEntitlement({
      user: { id: 'u1', email: 'a@x.com' },
      billingStorageMode: 'json',
      billingService: {
        getStatusForUser: async () => ({ billing: { status: 'trialing' }, trial: { used: true } }),
      },
    });
    expect(trial.entitled).toBe(true);
  });

  it('3/4/5. expired/canceled/free not entitled', async () => {
    const { resolveEntitlement } = await import('../../server/core/entitlements.mjs');
    for (const status of ['canceled', 'inactive', 'past_due', 'expired']) {
      const r = await resolveEntitlement({
        user: { id: 'u1' },
        billingStorageMode: 'json',
        billingService: {
          getStatusForUser: async () => ({ billing: { status }, trial: null }),
        },
      });
      expect(r.entitled).toBe(false);
    }
  });

  it('8. unavailable billing storage → 503 payload', async () => {
    const { resolveEntitlement, ENTITLEMENT_STORAGE_UNAVAILABLE } = await import(
      '../../server/core/entitlements.mjs'
    );
    const r = await resolveEntitlement({
      user: { id: 'u1' },
      billingStorageMode: 'unavailable',
      billingService: { getStatusForUser: async () => ({}) },
    });
    expect(r.entitled).toBe(false);
    expect(r.error).toBe(ENTITLEMENT_STORAGE_UNAVAILABLE);
    expect(r.httpStatus).toBe(503);
  });
});

describe('origin guard', () => {
  it('20/21. invalid origin blocked; allowlist passes', async () => {
    const { resolveAllowedOrigins, assertOriginAllowed, shouldEnforceOrigin } = await import(
      '../../server/core/originGuard.mjs'
    );
    const { origins } = resolveAllowedOrigins({
      env: { AUTH_ALLOWED_ORIGINS: 'https://www.luna29.com' },
      productionLike: true,
    });
    expect(assertOriginAllowed({ origin: 'https://evil.com', allowedOrigins: origins }).ok).toBe(false);
    expect(assertOriginAllowed({ origin: 'https://www.luna29.com', allowedOrigins: origins }).ok).toBe(true);
    expect(
      shouldEnforceOrigin({
        method: 'POST',
        pathname: '/api/privacy/delete',
        hasBearer: false,
        hasSessionCookie: true,
        productionLike: true,
      }),
    ).toBe(true);
    expect(
      shouldEnforceOrigin({
        method: 'POST',
        pathname: '/api/billing/webhook',
        hasBearer: false,
        hasSessionCookie: false,
        productionLike: true,
      }),
    ).toBe(false);
    expect(
      shouldEnforceOrigin({
        method: 'POST',
        pathname: '/api/privacy/delete',
        hasBearer: true,
        hasSessionCookie: false,
        productionLike: true,
      }),
    ).toBe(false);
  });

  it('33. localhost / wildcard rejected for prod origins helper', async () => {
    const { originListHasLocalhost, originListHasWildcard, resolveAllowedOrigins } = await import(
      '../../server/core/originGuard.mjs'
    );
    const bad = resolveAllowedOrigins({
      env: { AUTH_ALLOWED_ORIGINS: 'https://www.luna29.com,http://localhost:3000,*' },
      productionLike: true,
    });
    expect(originListHasLocalhost(bad.origins)).toBe(true);
    expect(originListHasWildcard(bad.origins)).toBe(true);
    const missing = resolveAllowedOrigins({ env: {}, productionLike: true });
    expect(missing.ok).toBe(false);
  });
});

describe('rate limit production fail-closed', () => {
  it('26/27. prod-like without upstash fails closed; test memory works', async () => {
    const { createRateLimiter } = await import('../../server/core/rateLimit.mjs');
    __resetMemoryRateLimitForTests();
    const prod = createRateLimiter({
      env: { NODE_ENV: 'production' },
      allowMemoryFallback: false,
      skipVitestBypass: true,
    });
    // No Upstash in this env → fail closed
    expect(await prod('k1', 10, 60_000)).toBe(false);

    const dev = createRateLimiter({
      env: { NODE_ENV: 'test' },
      allowMemoryFallback: true,
      skipVitestBypass: true,
    });
    expect(await dev('k2', 2, 60_000)).toBe(true);
    expect(await dev('k2', 2, 60_000)).toBe(true);
    expect(await dev('k2', 2, 60_000)).toBe(false);
  });
});

describe('API premium gates (JSON harness)', () => {
  let dataDir;
  let handler;
  let prevEnv;

  beforeEach(async () => {
    vi.resetModules();
    prevEnv = { ...process.env };
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-ent-'));
    process.env.NODE_ENV = 'test';
    delete process.env.VERCEL_ENV;
    delete process.env.DATABASE_URL;
    process.env.STRIPE_BILLING_ENABLED = 'false';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    __resetMemoryRateLimitForTests();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
  });

  afterEach(async () => {
    process.env = prevEnv;
    if (dataDir) await fs.rm(dataDir, { recursive: true, force: true });
  });

  const signup = async (email) => {
    const res = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email, password: 'password123', name: 'Mem' },
    });
    expect(res.statusCode).toBe(200);
    return { token: res.json.token, authHeader: { authorization: `Bearer ${res.json.token}` } };
  };

  it('5/11/12. free user blocked from premium voice/pattern; anonymous blocked', async () => {
    const anon = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      body: { transcript: 'hi' },
      headers: { 'x-luna-ai-consent': '1' },
    });
    expect(anon.statusCode).toBe(401);

    const free = await signup('free-ent@luna.test');
    const voice = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      headers: { ...free.authHeader, 'x-luna-ai-consent': '1' },
      body: { transcript: 'hi' },
    });
    expect(voice.statusCode).toBe(403);
    expect(voice.json?.error).toBe('PREMIUM_REQUIRED');

    const patterns = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/pattern-candidates',
      headers: free.authHeader,
    });
    expect(patterns.statusCode).toBe(403);
  });

  it('13/14. trial user allowed on premium route', async () => {
    const u = await signup('trial-ent@luna.test');
    const trial = await invoke(handler, {
      method: 'POST',
      path: '/api/billing/trial/start',
      headers: u.authHeader,
    });
    expect(trial.statusCode).toBe(200);
    const patterns = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/pattern-candidates',
      headers: u.authHeader,
    });
    expect(patterns.statusCode).toBe(200);
  });

  it('7. client body status cannot grant premium', async () => {
    const u = await signup('spoof-ent@luna.test');
    const voice = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      headers: { ...u.authHeader, 'x-luna-ai-consent': '1' },
      body: { transcript: 'hi', billing: { status: 'active' }, status: 'active', premium: true },
    });
    expect(voice.statusCode).toBe(403);
  });

  it('38. public health is minimal', async () => {
    const health = await invoke(handler, { method: 'GET', path: '/api/health' });
    expect(health.statusCode).toBe(200);
    expect(health.json?.checks?.rateLimit).toBeTruthy();
    expect(health.json?.config).toBeUndefined();
    expect(health.json?.checks?.aiScan).toBeUndefined();
    expect(health.json?.checks?.googleAuth).toBeUndefined();
  });
});
