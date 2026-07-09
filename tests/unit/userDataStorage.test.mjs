import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

/**
 * WS1.6 — Calendar + Mobile durable user-data storage.
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

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.91' }) => {
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

describe('user data storage mode (WS1.6)', () => {
  it('1. test => json', async () => {
    const { resolveUserDataStorageMode } = await import('../../server/core/userDataStorage.mjs');
    expect(
      resolveUserDataStorageMode({
        env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://x/y' },
        runtimeEnvironment: 'test',
      }),
    ).toBe('json');
  });

  it('2. local no DB => json', async () => {
    const { resolveUserDataStorageMode } = await import('../../server/core/userDataStorage.mjs');
    expect(
      resolveUserDataStorageMode({
        env: { NODE_ENV: 'development' },
        runtimeEnvironment: 'node',
      }),
    ).toBe('json');
  });

  it('3. local + DB => postgres', async () => {
    const { resolveUserDataStorageMode } = await import('../../server/core/userDataStorage.mjs');
    expect(
      resolveUserDataStorageMode({
        env: { NODE_ENV: 'development', DATABASE_URL: 'postgresql://x/y' },
        runtimeEnvironment: 'node',
      }),
    ).toBe('postgres');
  });

  it('4. production no DB => unavailable', async () => {
    const { resolveUserDataStorageMode } = await import('../../server/core/userDataStorage.mjs');
    expect(
      resolveUserDataStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('unavailable');
  });

  it('5. preview no DB => unavailable', async () => {
    const { resolveUserDataStorageMode } = await import('../../server/core/userDataStorage.mjs');
    expect(
      resolveUserDataStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'preview' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('unavailable');
  });

  it('6. production + DB => postgres', async () => {
    const { resolveUserDataStorageMode } = await import('../../server/core/userDataStorage.mjs');
    expect(
      resolveUserDataStorageMode({
        env: {
          NODE_ENV: 'production',
          VERCEL_ENV: 'production',
          DATABASE_URL: 'postgresql://x/y',
        },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('postgres');
  });
});

const createUserDataMockPool = () => {
  const calendar = new Map();
  const reflections = new Map();
  const reflectionMeta = new Map();
  const reports = new Map();
  const state = new Map();
  const push = new Map();

  return {
    calendar,
    reflections,
    reflectionMeta,
    reports,
    state,
    push,
    async query(sql, params = []) {
      const q = String(sql);
      if (q.includes('CREATE TABLE') || q.includes('CREATE INDEX')) return { rows: [] };

      if (q.includes('DELETE FROM calendar_user_data')) {
        calendar.delete(params[0]);
        return { rows: [] };
      }
      if (q.includes('INSERT INTO calendar_user_data')) {
        calendar.set(params[0], {
          user_id: params[0],
          bundle: JSON.parse(params[1]),
          updated_at: new Date(params[2] || Date.now()),
        });
        return { rows: [] };
      }
      if (q.includes('COUNT(*)') && q.includes('calendar_user_data')) {
        return { rows: [{ n: calendar.size }] };
      }
      if (q.includes('FROM calendar_user_data WHERE user_id') || q.includes('SELECT user_id FROM calendar_user_data')) {
        const row = calendar.get(params[0]);
        return { rows: row ? [row] : [] };
      }

      if (q.includes('INSERT INTO mobile_reflection_meta')) {
        const prev = reflectionMeta.get(params[0]);
        reflectionMeta.set(params[0], {
          user_id: params[0],
          display_name: params[1] ?? prev?.display_name ?? null,
          updated_at: new Date(),
        });
        return { rows: [] };
      }
      if (q.includes('UPDATE mobile_reflection_meta SET updated_at')) {
        const prev = reflectionMeta.get(params[0]);
        if (prev) prev.updated_at = new Date();
        return { rows: [] };
      }
      if (q.includes('FROM mobile_reflection_meta WHERE user_id')) {
        const row = reflectionMeta.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('INSERT INTO mobile_reflections')) {
        if (!reflections.has(params[0])) {
          reflections.set(params[0], {
            id: params[0],
            user_id: params[1],
            mode: params[2],
            body: params[3],
            occurred_at: params[4] ? new Date(params[4]) : new Date(),
            created_at: new Date(),
          });
        }
        return { rows: [] };
      }
      if (q.includes('FROM mobile_reflections WHERE user_id')) {
        return {
          rows: [...reflections.values()]
            .filter((r) => r.user_id === params[0])
            .sort((a, b) => b.occurred_at - a.occurred_at)
            .slice(0, params[1]),
        };
      }
      if (q.includes('DELETE FROM mobile_reflections WHERE id')) {
        const row = reflections.get(params[0]);
        if (row && row.user_id === params[1]) {
          reflections.delete(params[0]);
          return { rows: [{ id: params[0] }] };
        }
        return { rows: [] };
      }
      if (q.includes('COUNT(*)') && q.includes('mobile_reflections')) {
        return { rows: [{ n: reflections.size }] };
      }
      if (q.includes('COUNT(*)') && q.includes('mobile_reflection_meta')) {
        return { rows: [{ n: reflectionMeta.size }] };
      }
      if (q.includes('SELECT id FROM mobile_reflections WHERE id')) {
        const row = reflections.get(params[0]);
        return { rows: row ? [{ id: row.id }] : [] };
      }

      if (q.includes('INSERT INTO mobile_reports')) {
        const existing = reports.get(params[0]);
        if (!existing || existing.user_id === params[1]) {
          reports.set(params[0], {
            id: params[0],
            user_id: params[1],
            generated_at: params[2] ? new Date(params[2]) : new Date(),
            body: params[3],
            created_at: new Date(),
          });
        }
        return { rows: [] };
      }
      if (q.includes('FROM mobile_reports WHERE id') && q.includes('user_id')) {
        const row = reports.get(params[0]);
        return { rows: row && row.user_id === params[1] ? [row] : [] };
      }
      if (q.includes('FROM mobile_reports WHERE user_id')) {
        return {
          rows: [...reports.values()]
            .filter((r) => r.user_id === params[0])
            .sort((a, b) => b.generated_at - a.generated_at)
            .slice(0, params[1]),
        };
      }
      if (q.includes('DELETE FROM mobile_reports')) {
        const row = reports.get(params[0]);
        if (row && row.user_id === params[1]) {
          reports.delete(params[0]);
          return { rows: [{ id: params[0] }] };
        }
        return { rows: [] };
      }
      if (q.includes('COUNT(*)') && q.includes('mobile_reports')) {
        return { rows: [{ n: reports.size }] };
      }
      if (q.includes('SELECT id FROM mobile_reports WHERE id')) {
        const row = reports.get(params[0]);
        return { rows: row ? [{ id: row.id }] : [] };
      }

      if (q.includes('INSERT INTO mobile_user_state')) {
        const key = `${params[0]}::${params[1]}`;
        state.set(key, {
          user_id: params[0],
          section_key: params[1],
          data: params[2] == null ? null : JSON.parse(params[2]),
          updated_at: new Date(params[3] || Date.now()),
        });
        return { rows: [] };
      }
      if (q.includes('FROM mobile_user_state WHERE user_id') && q.includes('section_key')) {
        const row = state.get(`${params[0]}::${params[1]}`);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM mobile_user_state WHERE user_id')) {
        return { rows: [...state.values()].filter((r) => r.user_id === params[0]) };
      }
      if (q.includes('COUNT(*)') && q.includes('mobile_user_state')) {
        return { rows: [{ n: state.size }] };
      }
      if (q.includes('SELECT user_id FROM mobile_user_state')) {
        const row = state.get(`${params[0]}::${params[1]}`);
        return { rows: row ? [{ user_id: row.user_id }] : [] };
      }

      if (q.includes('INSERT INTO mobile_push_registrations')) {
        const key = `${params[0]}::${params[1]}`;
        push.set(key, {
          user_id: params[0],
          token: params[1],
          platform: params[2],
          device_name: params[3],
          updated_at: new Date(params[4] || Date.now()),
          created_at: new Date(),
        });
        return { rows: [] };
      }
      if (q.includes('FROM mobile_push_registrations WHERE user_id') && q.includes('ORDER BY')) {
        return {
          rows: [...push.values()]
            .filter((r) => r.user_id === params[0])
            .sort((a, b) => b.updated_at - a.updated_at)
            .slice(0, params[1]),
        };
      }
      if (q.includes('SELECT token FROM mobile_push_registrations') && q.includes('OFFSET')) {
        return {
          rows: [...push.values()]
            .filter((r) => r.user_id === params[0])
            .sort((a, b) => b.updated_at - a.updated_at)
            .slice(10)
            .map((r) => ({ token: r.token })),
        };
      }
      if (q.includes('DELETE FROM mobile_push_registrations WHERE user_id') && q.includes('AND token')) {
        const key = `${params[0]}::${params[1]}`;
        const existed = push.has(key);
        push.delete(key);
        return { rows: existed ? [{ token: params[1] }] : [] };
      }
      if (q.includes('DELETE FROM mobile_push_registrations WHERE user_id')) {
        for (const [k, row] of [...push.entries()]) {
          if (row.user_id === params[0]) push.delete(k);
        }
        return { rows: [] };
      }
      if (q.includes('COUNT(*)') && q.includes('mobile_push_registrations')) {
        return { rows: [{ n: push.size }] };
      }
      if (q.includes('SELECT token FROM mobile_push_registrations WHERE user_id') && q.includes('AND token')) {
        const row = push.get(`${params[0]}::${params[1]}`);
        return { rows: row ? [{ token: row.token }] : [] };
      }

      throw new Error(`Unhandled SQL in mock: ${q.slice(0, 140)}`);
    },
  };
};

describe('calendar/mobile repositories (WS1.6)', () => {
  beforeEach(async () => {
    const calendar = await import('../../server/core/calendarUserDataStore.mjs');
    const reflections = await import('../../server/core/mobileReflectionsStore.mjs');
    const reports = await import('../../server/core/mobileReportsStore.mjs');
    const state = await import('../../server/core/mobileUserStateStore.mjs');
    const push = await import('../../server/core/mobilePushStore.mjs');
    calendar.__resetCalendarUserDataSchemaForTests();
    reflections.__resetMobileReflectionsSchemaForTests();
    reports.__resetMobileReportsSchemaForTests();
    state.__resetMobileUserStateSchemaForTests();
    push.__resetMobilePushSchemaForTests();
  });

  it('7/12. calendar owner upsert + concurrent siblings preserved', async () => {
    const {
      ensureCalendarUserDataTable,
      upsertCalendarBundleForUser,
      getCalendarBundleForUser,
    } = await import('../../server/core/calendarUserDataStore.mjs');
    const pool = createUserDataMockPool();
    await ensureCalendarUserDataTable(pool);
    await upsertCalendarBundleForUser(pool, 'user-a', {
      version: 2,
      journal: {},
      events: [{ id: 'e1', title: 'A', updatedAt: new Date().toISOString() }],
      preferences: {},
      updatedAt: new Date().toISOString(),
    });
    await Promise.all([
      upsertCalendarBundleForUser(pool, 'user-b', {
        version: 2,
        journal: {},
        events: [{ id: 'e2', title: 'B', updatedAt: new Date().toISOString() }],
        preferences: {},
        updatedAt: new Date().toISOString(),
      }),
      upsertCalendarBundleForUser(pool, 'user-a', {
        version: 2,
        journal: {},
        events: [
          { id: 'e1', title: 'A', updatedAt: new Date().toISOString() },
          { id: 'e3', title: 'C', updatedAt: new Date().toISOString() },
        ],
        preferences: {},
        updatedAt: new Date().toISOString(),
      }),
    ]);
    const a = await getCalendarBundleForUser(pool, 'user-a');
    const b = await getCalendarBundleForUser(pool, 'user-b');
    expect(a.events.map((e) => e.id).sort()).toEqual(['e1', 'e3']);
    expect(b.events.map((e) => e.id)).toEqual(['e2']);
  });

  it('8/9/10. calendar get/update/delete are owner-scoped', async () => {
    const {
      ensureCalendarUserDataTable,
      upsertCalendarBundleForUser,
      getCalendarBundleForUser,
      deleteCalendarBundleForUser,
    } = await import('../../server/core/calendarUserDataStore.mjs');
    const pool = createUserDataMockPool();
    await ensureCalendarUserDataTable(pool);
    await upsertCalendarBundleForUser(pool, 'owner', {
      version: 2,
      events: [{ id: 'secret', title: 'Private' }],
      journal: {},
      preferences: {},
    });
    expect(await getCalendarBundleForUser(pool, 'other')).toBeNull();
    await upsertCalendarBundleForUser(pool, 'other', {
      version: 2,
      events: [{ id: 'mine', title: 'Mine' }],
      journal: {},
      preferences: {},
    });
    await deleteCalendarBundleForUser(pool, 'other');
    expect(await getCalendarBundleForUser(pool, 'owner')).toBeTruthy();
    expect(await getCalendarBundleForUser(pool, 'other')).toBeNull();
  });

  it('13-16. reflections owner-scoped + concurrent inserts', async () => {
    const {
      ensureMobileReflectionsTable,
      ensureMobileReflectionMeta,
      insertMobileReflection,
      getMobileReflectionProfile,
      deleteMobileReflectionOwned,
    } = await import('../../server/core/mobileReflectionsStore.mjs');
    const pool = createUserDataMockPool();
    await ensureMobileReflectionsTable(pool);
    await ensureMobileReflectionMeta(pool, 'u1', 'Ada');
    await ensureMobileReflectionMeta(pool, 'u2', 'Bob');
    await Promise.all([
      insertMobileReflection(pool, 'u1', {
        id: 'r1',
        mode: 'write',
        text: 'Feeling tired today after work.',
        at: new Date().toISOString(),
      }),
      insertMobileReflection(pool, 'u2', {
        id: 'r2',
        mode: 'voice',
        text: 'Different user reflection text.',
        at: new Date().toISOString(),
      }),
    ]);
    const p1 = await getMobileReflectionProfile(pool, 'u1');
    const p2 = await getMobileReflectionProfile(pool, 'u2');
    expect(p1.entries.map((e) => e.id)).toEqual(['r1']);
    expect(p2.entries.map((e) => e.id)).toEqual(['r2']);
    expect(await deleteMobileReflectionOwned(pool, 'u2', 'r1')).toBe(false);
    expect(await deleteMobileReflectionOwned(pool, 'u1', 'r1')).toBe(true);
  });

  it('21. report get/list owner-scoped', async () => {
    const {
      ensureMobileReportsTable,
      upsertMobileReportForUser,
      listMobileReportsForUser,
      getMobileReportOwned,
    } = await import('../../server/core/mobileReportsStore.mjs');
    const pool = createUserDataMockPool();
    await ensureMobileReportsTable(pool);
    await upsertMobileReportForUser(pool, 'u1', {
      id: 'rep-1',
      generatedAt: new Date().toISOString(),
      text: 'Private report body for user one.',
    });
    expect(await getMobileReportOwned(pool, 'u2', 'rep-1')).toBeNull();
    expect(await listMobileReportsForUser(pool, 'u2')).toEqual([]);
    expect((await listMobileReportsForUser(pool, 'u1'))[0].id).toBe('rep-1');
  });

  it('23. state upsert does not overwrite another user', async () => {
    const {
      ensureMobileUserStateTable,
      upsertMobileStateSection,
      getMobileStateSection,
    } = await import('../../server/core/mobileUserStateStore.mjs');
    const pool = createUserDataMockPool();
    await ensureMobileUserStateTable(pool);
    await upsertMobileStateSection(pool, 'u1', 'body_map', { note: 'a' });
    await upsertMobileStateSection(pool, 'u2', 'body_map', { note: 'b' });
    expect((await getMobileStateSection(pool, 'u1', 'body_map')).data.note).toBe('a');
    expect((await getMobileStateSection(pool, 'u2', 'body_map')).data.note).toBe('b');
  });

  it('26/27. push revoke owner-scoped; concurrent devices preserved', async () => {
    const {
      ensureMobilePushTable,
      upsertMobilePushToken,
      listMobilePushTokensForUser,
      deleteMobilePushTokenOwned,
    } = await import('../../server/core/mobilePushStore.mjs');
    const pool = createUserDataMockPool();
    await ensureMobilePushTable(pool);
    await Promise.all([
      upsertMobilePushToken(pool, 'u1', { token: 'tok-a', platform: 'ios', deviceName: 'A' }),
      upsertMobilePushToken(pool, 'u1', { token: 'tok-b', platform: 'android', deviceName: 'B' }),
      upsertMobilePushToken(pool, 'u2', { token: 'tok-c', platform: 'ios', deviceName: 'C' }),
    ]);
    expect((await listMobilePushTokensForUser(pool, 'u1')).map((t) => t.token).sort()).toEqual([
      'tok-a',
      'tok-b',
    ]);
    expect(await deleteMobilePushTokenOwned(pool, 'u2', 'tok-a')).toBe(false);
    expect(await deleteMobilePushTokenOwned(pool, 'u1', 'tok-a')).toBe(true);
  });

  it('29-32. legacy import empty/non-empty/malformed/untrusted owner', async () => {
    const { maybeImportUserDataOnBoot } = await import('../../server/core/userDataLegacyImport.mjs');
    const { countMobileReflections } = await import('../../server/core/mobileReflectionsStore.mjs');
    const { countCalendarUserData } = await import('../../server/core/calendarUserDataStore.mjs');
    const pool = createUserDataMockPool();
    const trustedId = 'a1b2c3d4e5f60718293a4b5c'; // 24 hex — matches auth id shape
    await maybeImportUserDataOnBoot(pool, {
      calendarStoreRaw: {
        [trustedId]: {
          version: 2,
          events: [],
          journal: {},
          preferences: {},
          updatedAt: new Date().toISOString(),
        },
        'userabcdef12': { version: 2, events: [], journal: {}, preferences: {} }, // too short / non-hex-24
        'device:legacy': { version: 2, events: [], journal: {}, preferences: {} },
        'guest:legacy': { version: 2, events: [], journal: {}, preferences: {} },
        'bad@email.com': { version: 2, events: [], journal: {}, preferences: {} },
        'not-a-real-user-id!!': { version: 2, events: [], journal: {}, preferences: {} },
      },
      mobileReflectionsRaw: {
        profiles: {
          [`user:${trustedId}`]: {
            name: 'Ada',
            entries: [
              { id: 'e1', at: new Date().toISOString(), mode: 'write', text: 'Valid reflection text.' },
              { id: 'bad' },
            ],
          },
          'device:xyz': {
            name: 'Legacy',
            entries: [{ id: 'e2', at: new Date().toISOString(), mode: 'write', text: 'Should skip.' }],
          },
        },
      },
      mobileReportsRaw: { profiles: {} },
      mobileStateRaw: { profiles: {} },
      mobilePushRaw: { profiles: {} },
    });
    expect(await countCalendarUserData(pool)).toBe(1);
    expect(await countMobileReflections(pool)).toBe(1);

    // Non-empty skips further calendar import
    await maybeImportUserDataOnBoot(pool, {
      calendarStoreRaw: {
        'ffffffffffffffffffffffff': {
          version: 2,
          events: [],
          journal: {},
          preferences: {},
        },
      },
      mobileReflectionsRaw: { profiles: {} },
      mobileReportsRaw: { profiles: {} },
      mobileStateRaw: { profiles: {} },
      mobilePushRaw: { profiles: {} },
    });
    expect(await countCalendarUserData(pool)).toBe(1);
  });

  it('37-39. no second Pool / replace-set / DELETE WHERE NOT IN', () => {
    const files = [
      'server/core/userDataStorage.mjs',
      'server/core/calendarUserDataStore.mjs',
      'server/core/mobileReflectionsStore.mjs',
      'server/core/mobileReportsStore.mjs',
      'server/core/mobileUserStateStore.mjs',
      'server/core/mobilePushStore.mjs',
      'server/core/userDataLegacyImport.mjs',
    ];
    for (const rel of files) {
      const src = readFileSync(path.join(process.cwd(), rel), 'utf8');
      expect(src).not.toMatch(/new Pool\(/);
      expect(src).not.toMatch(/DELETE\s+FROM[\s\S]*WHERE\s+NOT\s+IN/i);
      expect(src).not.toMatch(/REPLACE\s+INTO/i);
    }
  });

  it('17/22/25. logs omit reflection/report/token content', () => {
    const files = [
      'server/core/mobileReflectionsStore.mjs',
      'server/core/mobileReportsStore.mjs',
      'server/core/mobilePushStore.mjs',
      'server/core/userDataLegacyImport.mjs',
    ];
    for (const rel of files) {
      const src = readFileSync(path.join(process.cwd(), rel), 'utf8');
      const consoleCalls = [...src.matchAll(/console\.(log|info|warn|error)\(([\s\S]*?)\);/g)].map(
        (m) => m[2],
      );
      for (const args of consoleCalls) {
        expect(args).not.toMatch(/\b(entry\.text|report\.text|body\.text|\.token)\b/);
      }
    }
  });
});

describe('API ownership + fail-closed (WS1.6)', () => {
  let tmpDir;
  let prevEnv;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna-userdata-'));
    prevEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    process.env.SUPER_ADMIN_EMAILS = 'super@luna.test';
    process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD = 'bootstrap-pass-123';
    process.env.AUTH_ALLOWED_ORIGINS = 'http://localhost';
  });

  afterEach(async () => {
    process.env = prevEnv;
    vi.resetModules();
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  const signup = async (handler, email) => {
    const res = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email, password: 'password123', name: 'User' },
    });
    expect(res.statusCode).toBe(200);
    return String(res.setCookie).split(';')[0];
  };

  it('11/18/19/20. body user_id ignored; report/OCR require auth', async () => {
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir: tmpDir, environment: 'test' });
    const cookie = await signup(handler, 'owner@luna.test');

    const deniedGenerate = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reports/generate',
      body: { note: 'no auth', userId: 'attacker' },
    });
    expect(deniedGenerate.statusCode).toBe(401);

    const mobileSignup = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'mobile@luna.test', password: 'password123', name: 'Mobile' },
    });
    expect(mobileSignup.statusCode).toBe(200);
    const token = mobileSignup.json?.token;
    expect(token).toBeTruthy();

    const generate = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reports/generate',
      headers: { authorization: `Bearer ${token}` },
      body: { note: 'authenticated generate', userId: 'spoofed' },
    });
    expect(generate.statusCode).toBe(200);
    expect(generate.json?.text).toContain('Luna29 Health Report');

    const ocr = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reports/ocr-intake',
      headers: { authorization: `Bearer ${token}` },
      body: { input: 'synthetic lab line', userId: 'spoofed' },
    });
    expect(ocr.statusCode).toBe(200);

    const state = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/state',
      headers: { authorization: `Bearer ${token}` },
      body: { section: 'body_map', data: { note: 'mine' }, userId: 'attacker' },
    });
    expect(state.statusCode).toBe(200);
    const read = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/state?section=body_map',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(read.json?.data?.note).toBe('mine');

    // Calendar uses cookie session owner only.
    const put = await invoke(handler, {
      method: 'PUT',
      path: '/api/calendar/data',
      headers: { cookie },
      body: {
        data: {
          version: 2,
          journal: {},
          events: [{ id: 'ev-1', title: 'Mine', updatedAt: new Date().toISOString() }],
          preferences: { browserNotifications: true, emailReminders: false, reminderEmail: '', sentReminderKeys: [] },
          updatedAt: new Date().toISOString(),
        },
        userId: 'attacker-id',
      },
    });
    expect(put.statusCode).toBe(200);
    expect(put.json?.data?.events?.[0]?.id).toBe('ev-1');
  });

  it('34-36. unavailable returns 503; no JSON write; health unavailable', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.DATABASE_URL;
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir: tmpDir, environment: 'vercel' });
    const health = await invoke(handler, { method: 'GET', path: '/api/health?verbose=1' });
    expect(health.statusCode).toBe(503);
    expect(health.json?.checks?.userDataStorage).toBe('unavailable');

    const contact = await invoke(handler, {
      method: 'PUT',
      path: '/api/calendar/data',
      body: { data: { version: 2, journal: {}, events: [], preferences: {} } },
    });
    expect(contact.statusCode).toBe(503);
    const calendarPath = path.join(tmpDir, 'calendar-data.json');
    const exists = await fs
      .access(calendarPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });
});
