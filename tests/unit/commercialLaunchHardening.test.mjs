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

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.40' }) => {
  const payload = body === undefined ? null : Buffer.from(JSON.stringify(body), 'utf8');
  const req = payload ? Readable.from([payload]) : Readable.from([]);
  req.method = method;
  req.url = pathname;
  req.headers = {
    host: 'localhost',
    origin: headers.origin || 'http://localhost:5173',
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

describe('commercial launch hardening', () => {
  let dataDir;
  let handler;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    process.env.AUTH_ALLOWED_ORIGINS = 'http://localhost:5173';
    process.env.SUPER_ADMIN_EMAILS = 'google-super@luna.test';
    process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD = 'bootstrap-pass-123';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    __resetMemoryRateLimitForTests();
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-launch-harden-'));
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
  });

  afterEach(async () => {
    process.env = originalEnv;
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('rejects arbitrary-password recovery for Google-only super-admin', async () => {
    const boot = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signin',
      body: { email: 'google-super@luna.test', password: 'bootstrap-pass-123' },
      ip: '198.51.100.10',
    });
    expect(boot.statusCode).toBe(200);

    const usersPath = path.join(dataDir, 'users.json');
    const users = JSON.parse(await fs.readFile(usersPath, 'utf8'));
    const target = users.find((u) => u.email === 'google-super@luna.test');
    expect(target).toBeTruthy();
    target.passwordHash = null;
    target.lastProvider = 'google';
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });

    const attack = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signin',
      body: { email: 'google-super@luna.test', password: 'attacker-password-99' },
      ip: '198.51.100.11',
    });
    expect(attack.statusCode).toBe(401);
    expect(attack.json?.recovered).toBeUndefined();
    expect(attack.json?.session).toBeUndefined();

    const legit = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signin',
      body: { email: 'google-super@luna.test', password: 'bootstrap-pass-123' },
      ip: '198.51.100.12',
    });
    expect(legit.statusCode).toBe(200);
    expect(legit.json?.session?.role).toBe('super_admin');
  });

  it('requires premium for timeline observation detail', async () => {
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'free-obs@test.com', password: 'password123', name: 'Free' },
      ip: '198.51.100.20',
    });
    expect(signup.statusCode).toBe(200);
    const token = signup.json?.token;
    expect(token).toBeTruthy();

    const denied = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/timeline/observations/obs-does-not-matter',
      headers: { authorization: `Bearer ${token}` },
      ip: '198.51.100.20',
    });
    expect(denied.statusCode).toBe(403);
    expect(denied.json?.error).toBe('PREMIUM_REQUIRED');
  });

  it('CORS preflight allows PUT for calendar clients', async () => {
    const res = await invoke(handler, {
      method: 'OPTIONS',
      path: '/api/calendar/data',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'PUT',
      },
      ip: '198.51.100.30',
    });
    expect(res.statusCode).toBe(204);
    const allow = String(
      res.headers['Access-Control-Allow-Methods'] || res.headers['access-control-allow-methods'] || '',
    );
    expect(allow).toContain('PUT');
  });

  it('sets and clears session cookies with matching Secure in production-like runtimes', async () => {
    // Dummy DATABASE_URL satisfies durable-storage gate; explicit test harness keeps auth on JSON.
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://luna:luna@127.0.0.1:5432/luna_test_unused';
    process.env.AUTH_ALLOWED_ORIGINS = 'https://www.luna29.com';
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const prodHandler = await buildApiHandler({ dataDir, environment: 'test' });

    const signup = await invoke(prodHandler, {
      method: 'POST',
      path: '/api/auth/signup',
      headers: { origin: 'https://www.luna29.com' },
      body: { email: 'secure-cookie@test.com', password: 'password123', name: 'Secure' },
      ip: '198.51.100.40',
    });
    expect(signup.statusCode).toBe(200);
    const setCookie = String(signup.headers['Set-Cookie'] || '');
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/;\s*Secure/i);

    const cookie = setCookie.split(';')[0];
    const logout = await invoke(prodHandler, {
      method: 'POST',
      path: '/api/auth/logout',
      headers: { origin: 'https://www.luna29.com', cookie },
      ip: '198.51.100.40',
    });
    expect(logout.statusCode).toBe(200);
    const clearCookie = String(logout.headers['Set-Cookie'] || '');
    expect(clearCookie).toMatch(/Max-Age=0/i);
    expect(clearCookie).toMatch(/HttpOnly/i);
    expect(clearCookie).toMatch(/SameSite=Lax/i);
    expect(clearCookie).toMatch(/;\s*Secure/i);
  });
});
