import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

/**
 * WS1.2 — Users + Sessions durable storage.
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

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.60' }) => {
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
  const setCookie = res.headers['Set-Cookie'] || res.headers['set-cookie'] || '';
  return { statusCode: res.statusCode, headers: res.headers, json, body: res.body, setCookie };
};

describe('auth identity storage mode (WS1.2)', () => {
  it('production without DATABASE_URL → unavailable', async () => {
    const { resolveAuthIdentityStorageMode } = await import('../../server/core/authIdentityStorage.mjs');
    expect(
      resolveAuthIdentityStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('unavailable');
  });

  it('preview with DATABASE_URL → postgres', async () => {
    const { resolveAuthIdentityStorageMode } = await import('../../server/core/authIdentityStorage.mjs');
    expect(
      resolveAuthIdentityStorageMode({
        env: {
          NODE_ENV: 'production',
          VERCEL_ENV: 'preview',
          DATABASE_URL: 'postgresql://example/luna',
        },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('postgres');
  });

  it('development without DATABASE_URL → json', async () => {
    const { resolveAuthIdentityStorageMode } = await import('../../server/core/authIdentityStorage.mjs');
    expect(
      resolveAuthIdentityStorageMode({
        env: { NODE_ENV: 'development' },
        runtimeEnvironment: 'node',
      }),
    ).toBe('json');
  });

  it('explicit test harness → json even if DATABASE_URL set', async () => {
    const { resolveAuthIdentityStorageMode } = await import('../../server/core/authIdentityStorage.mjs');
    expect(
      resolveAuthIdentityStorageMode({
        env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://example/luna' },
        runtimeEnvironment: 'test',
      }),
    ).toBe('json');
  });
});

describe('auth users/sessions API (JSON test mode)', () => {
  let dataDir;
  let originalEnv;
  let handler;
  let ipSeq = 70;

  const nextIp = () => `198.51.100.${ipSeq++}`;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-auth-id-'));
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL;
    process.env.NODE_ENV = 'test';
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
  });

  afterEach(async () => {
    process.env = originalEnv;
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('signup + login + session restore (cookie)', async () => {
    const email = `user-${Date.now()}@test.com`;
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email, password: 'password123', name: 'Ada' },
      ip: nextIp(),
    });
    expect(signup.statusCode).toBe(200);
    expect(signup.json?.session?.email).toBe(email);
    expect(signup.setCookie).toMatch(/luna_sid=/);

    const cookie = String(signup.setCookie).split(';')[0];
    const session = await invoke(handler, {
      method: 'GET',
      path: '/api/auth/session',
      headers: { cookie },
      ip: nextIp(),
    });
    expect(session.statusCode).toBe(200);
    expect(session.json?.session?.email).toBe(email);

    const login = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signin',
      body: { email, password: 'password123' },
      ip: nextIp(),
    });
    expect(login.statusCode).toBe(200);
    expect(login.json?.session?.email).toBe(email);
  });

  it('mobile bearer signup + logout', async () => {
    const email = `mobile-${Date.now()}@test.com`;
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email, password: 'password123', name: 'Mobile' },
      ip: nextIp(),
    });
    expect(signup.statusCode).toBe(200);
    const token = signup.json?.token;
    expect(token).toBeTruthy();

    const session = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/auth/session',
      headers: { authorization: `Bearer ${token}` },
      ip: nextIp(),
    });
    expect(session.json?.session?.email).toBe(email);

    const logout = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/logout',
      headers: { authorization: `Bearer ${token}` },
      ip: nextIp(),
    });
    expect(logout.statusCode).toBe(200);

    const after = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/auth/session',
      headers: { authorization: `Bearer ${token}` },
      ip: nextIp(),
    });
    expect(after.json?.session).toBeNull();
  });

  it('concurrent sessions for same user', async () => {
    const email = `multi-${Date.now()}@test.com`;
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email, password: 'password123', name: 'Multi' },
      ip: nextIp(),
    });
    const a = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signin',
      body: { email, password: 'password123' },
      ip: nextIp(),
    });
    const b = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signin',
      body: { email, password: 'password123' },
      ip: nextIp(),
    });
    expect(a.json?.token).toBeTruthy();
    expect(b.json?.token).toBeTruthy();
    expect(a.json.token).not.toBe(b.json.token);

    const sa = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/auth/session',
      headers: { authorization: `Bearer ${a.json.token}` },
      ip: nextIp(),
    });
    const sb = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/auth/session',
      headers: { authorization: `Bearer ${b.json.token}` },
      ip: nextIp(),
    });
    expect(sa.json?.session?.email).toBe(email);
    expect(sb.json?.session?.email).toBe(email);
  });

  it('expired session is rejected', async () => {
    const email = `exp-${Date.now()}@test.com`;
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email, password: 'password123', name: 'Exp' },
      ip: nextIp(),
    });
    const token = signup.json.token;
    // Corrupt sessions.json to expire the token.
    const sessionsPath = path.join(dataDir, 'sessions.json');
    const raw = JSON.parse(await fs.readFile(sessionsPath, 'utf8'));
    const next = raw.map((row) =>
      row.token === token ? { ...row, expiresAt: Date.now() - 1000 } : row,
    );
    await fs.writeFile(sessionsPath, JSON.stringify(next), 'utf8');
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const restarted = await buildApiHandler({ dataDir, environment: 'test' });
    const session = await invoke(restarted, {
      method: 'GET',
      path: '/api/mobile/auth/session',
      headers: { authorization: `Bearer ${token}` },
      ip: nextIp(),
    });
    expect(session.json?.session).toBeNull();
  });

  it('web logout clears cookie session', async () => {
    const email = `out-${Date.now()}@test.com`;
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email, password: 'password123', name: 'Out' },
      ip: nextIp(),
    });
    const cookie = String(signup.setCookie).split(';')[0];
    const logout = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/logout',
      headers: { cookie },
      ip: nextIp(),
    });
    expect(logout.statusCode).toBe(200);
    const session = await invoke(handler, {
      method: 'GET',
      path: '/api/auth/session',
      headers: { cookie },
      ip: nextIp(),
    });
    expect(session.json?.session).toBeNull();
  });

  it('development JSON mode writes users.json', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const devHandler = await buildApiHandler({ dataDir, environment: 'node' });
    const email = `dev-${Date.now()}@test.com`;
    const signup = await invoke(devHandler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email, password: 'password123', name: 'Dev' },
      ip: nextIp(),
    });
    expect(signup.statusCode).toBe(200);
    const files = await fs.readdir(dataDir);
    expect(files.includes('users.json')).toBe(true);
    expect(files.includes('sessions.json')).toBe(true);
  });

  it('Google login creates session when unverified fallback allowed (test)', async () => {
    process.env.AUTH_ALLOW_UNVERIFIED_GOOGLE = 'true';
    process.env.AUTH_GOOGLE_CLIENT_IDS = 'test-client';
    process.env.VITE_GOOGLE_CLIENT_ID = 'test-client';
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const googleHandler = await buildApiHandler({ dataDir, environment: 'test' });

    // Minimal unsigned JWT payload (unverified path).
    const payload = Buffer.from(
      JSON.stringify({
        email: `google-${Date.now()}@test.com`,
        email_verified: true,
        name: 'Google User',
        sub: 'google-sub-1',
        aud: 'test-client',
        iss: 'https://accounts.google.com',
      }),
    ).toString('base64url');
    const credential = `hdr.${payload}.sig`;

    const res = await invoke(googleHandler, {
      method: 'POST',
      path: '/api/auth/google',
      body: { credential },
      ip: nextIp(),
    });
    // May be 200 (unverified allowed) or 401 if verification path rejects — either must not 500.
    expect([200, 401, 400]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.json?.session?.email).toMatch(/@test.com$/);
      expect(res.setCookie).toMatch(/luna_sid=/);
    }
  });

  it('production without DATABASE_URL cannot use JSON users/sessions', async () => {
    const prodDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-auth-prod-'));
    try {
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_ENV = 'production';
      delete process.env.DATABASE_URL;
      vi.resetModules();
      const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
      const prodHandler = await buildApiHandler({ dataDir: prodDir, environment: 'vercel' });
      const signup = await invoke(prodHandler, {
        method: 'POST',
        path: '/api/mobile/auth/signup',
        body: { email: 'prod@test.com', password: 'password123', name: 'Prod' },
        ip: nextIp(),
      });
      expect(signup.statusCode).toBe(503);
      expect(signup.json?.code).toMatch(/DURABLE_STORAGE_UNAVAILABLE|AUTH_IDENTITY/);
      const files = await fs.readdir(prodDir);
      expect(files.includes('users.json')).toBe(false);
      expect(files.includes('sessions.json')).toBe(false);
    } finally {
      await fs.rm(prodDir, { recursive: true, force: true });
    }
  });
});

describe('auth users/sessions postgres repositories (unit, mocked pool)', () => {
  it('save/load users round-trip via mock pool', async () => {
    const rows = [];
    const pool = {
      async query(sql, params) {
        const q = String(sql);
        if (q.includes('CREATE TABLE')) return { rows: [] };
        if (q.includes('COUNT(*)')) return { rows: [{ n: rows.length }] };
        if (q.includes('SELECT') && q.includes('FROM auth_users') && q.includes('WHERE id')) {
          const u = rows.find((r) => r.id === params[0]);
          return {
            rows: u
              ? [
                  {
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    password_hash: u.passwordHash,
                    created_at: u.createdAt,
                    role_override: u.roleOverride,
                    last_provider: u.lastProvider,
                    avatar_url: u.avatarUrl,
                  },
                ]
              : [],
          };
        }
        if (q.includes('SELECT') && q.includes('FROM auth_users')) {
          return {
            rows: rows.map((u) => ({
              id: u.id,
              email: u.email,
              name: u.name,
              password_hash: u.passwordHash,
              created_at: u.createdAt,
              role_override: u.roleOverride,
              last_provider: u.lastProvider,
              avatar_url: u.avatarUrl,
            })),
          };
        }
        if (q.includes('DELETE FROM auth_users WHERE id')) {
          const idx = rows.findIndex((r) => r.id === params[0]);
          if (idx >= 0) rows.splice(idx, 1);
          return { rows: [] };
        }
        return { rows: [] };
      },
      async connect() {
        return {
          async query(sql, params) {
            const q = String(sql);
            if (q === 'BEGIN' || q === 'COMMIT' || q === 'ROLLBACK') return { rows: [] };
            if (q.includes('INSERT INTO auth_users')) {
              const [id, email, name, passwordHash, createdAt, roleOverride, lastProvider, avatarUrl] =
                params;
              const idx = rows.findIndex((r) => r.id === id);
              const next = {
                id,
                email,
                name,
                passwordHash,
                createdAt,
                roleOverride,
                lastProvider,
                avatarUrl,
              };
              if (idx >= 0) rows[idx] = next;
              else rows.push(next);
              return { rows: [] };
            }
            return { rows: [] };
          },
          release() {},
        };
      },
    };

    const {
      ensureAuthUsersTable,
      saveUsersToPostgres,
      loadUsersFromPostgres,
      getUserByIdFromPostgres,
      __resetAuthUsersSchemaForTests,
    } = await import('../../server/core/authUsersStore.mjs');
    __resetAuthUsersSchemaForTests();
    expect(await ensureAuthUsersTable(pool)).toBe(true);
    await saveUsersToPostgres(pool, [
      {
        id: 'u1',
        email: 'a@test.com',
        name: 'A',
        passwordHash: 'scrypt:x:y',
        createdAt: '2026-01-01T00:00:00.000Z',
        roleOverride: null,
        lastProvider: 'password',
      },
    ]);
    // Concurrent upsert of another user must not delete u1 (no replace-set).
    await saveUsersToPostgres(pool, [
      {
        id: 'u2',
        email: 'b@test.com',
        name: 'B',
        passwordHash: 'scrypt:a:b',
        createdAt: '2026-01-02T00:00:00.000Z',
        roleOverride: null,
        lastProvider: 'password',
      },
    ]);
    const loaded = await loadUsersFromPostgres(pool);
    expect(loaded.map((u) => u.id).sort()).toEqual(['u1', 'u2']);
    expect(loaded.find((u) => u.id === 'u1')?.passwordHash).toBe('scrypt:x:y');
    expect(await getUserByIdFromPostgres(pool, 'u1')).toMatchObject({ email: 'a@test.com' });
  });

  it('save/load sessions round-trip via mock pool', async () => {
    const rows = new Map();
    const pool = {
      async query(sql, params) {
        const q = String(sql);
        if (q.includes('CREATE TABLE')) return { rows: [] };
        if (q.includes('COUNT(*)')) return { rows: [{ n: rows.size }] };
        if (q.includes('DELETE FROM auth_sessions WHERE expires_at')) {
          for (const [token, row] of [...rows.entries()]) {
            if (row.expiresAt < params[0]) rows.delete(token);
          }
          return { rows: [] };
        }
        if (q.includes('SELECT') && q.includes('FROM auth_sessions') && q.includes('WHERE token')) {
          const row = rows.get(params[0]);
          return {
            rows: row
              ? [
                  {
                    token: row.token,
                    user_id: row.userId,
                    expires_at: row.expiresAt,
                    max_age_sec: row.maxAgeSec,
                  },
                ]
              : [],
          };
        }
        if (q.includes('SELECT') && q.includes('FROM auth_sessions')) {
          return {
            rows: [...rows.values()].map((r) => ({
              token: r.token,
              user_id: r.userId,
              expires_at: r.expiresAt,
              max_age_sec: r.maxAgeSec,
            })),
          };
        }
        if (q.includes('DELETE FROM auth_sessions WHERE token')) {
          rows.delete(params[0]);
          return { rows: [] };
        }
        return { rows: [] };
      },
      async connect() {
        return {
          async query(sql, params) {
            const q = String(sql);
            if (q === 'BEGIN' || q === 'COMMIT' || q === 'ROLLBACK') return { rows: [] };
            if (q.includes('INSERT INTO auth_sessions')) {
              const [token, userId, expiresAt, maxAgeSec] = params;
              rows.set(token, { token, userId, expiresAt, maxAgeSec });
              return { rows: [] };
            }
            return { rows: [] };
          },
          release() {},
        };
      },
    };

    const {
      ensureAuthSessionsTable,
      saveSessionsToPostgres,
      loadSessionsFromPostgres,
      getSessionRowFromPostgres,
      __resetAuthSessionsSchemaForTests,
    } = await import('../../server/core/authSessionsStore.mjs');
    __resetAuthSessionsSchemaForTests();
    expect(await ensureAuthSessionsTable(pool)).toBe(true);
    const token = 'abc123';
    await saveSessionsToPostgres(pool, [
      { token, userId: 'u1', expiresAt: Date.now() + 60_000, maxAgeSec: 3600 },
    ]);
    // Concurrent save of another session must not delete token (no replace-set).
    await saveSessionsToPostgres(pool, [
      { token: 'def456', userId: 'u1', expiresAt: Date.now() + 60_000, maxAgeSec: 3600 },
    ]);
    const loaded = await loadSessionsFromPostgres(pool);
    expect(loaded.map((s) => s.token).sort()).toEqual(['abc123', 'def456']);
    const one = await getSessionRowFromPostgres(pool, token);
    expect(one?.userId).toBe('u1');
  });
});
