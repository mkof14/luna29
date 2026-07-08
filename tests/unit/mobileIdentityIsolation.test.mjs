import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

/**
 * P0 identity isolation tests for mobile personal data routes.
 * Ownership must come only from verified cookie/Bearer session → user:{id}.
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
  const req = payload
    ? Readable.from([payload])
    : Readable.from([]);
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
  return { statusCode: res.statusCode, json, headers: res.headers, raw: res.body };
};

describe('mobile identity isolation (P0)', () => {
  let dataDir;
  let handler;
  let buildApiHandler;

  beforeEach(async () => {
    vi.resetModules();
    ({ buildApiHandler } = await import('../../server/core/apiHandler.mjs'));
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-identity-'));
    handler = await buildApiHandler({ dataDir, environment: 'node' });
  });

  afterEach(async () => {
    if (dataDir) {
      await fs.rm(dataDir, { recursive: true, force: true });
    }
  });

  const signup = async (email, name = 'Member') => {
    const res = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email, password: 'password123', name },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json?.token).toBeTruthy();
    expect(res.json?.session?.id).toBeTruthy();
    return { token: res.json.token, userId: res.json.session.id, session: res.json.session };
  };

  it('1. missing auth on authenticated personal route → 401', async () => {
    const res = await invoke(handler, { method: 'GET', path: '/api/mobile/story' });
    expect(res.statusCode).toBe(401);
    expect(res.json?.error).toMatch(/not authenticated/i);
  });

  it('2. invalid token/session → 401', async () => {
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: 'Bearer totally-invalid-token' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('3. expired token/session → 401', async () => {
    const { token } = await signup('expired@test.com', 'Expired');
    const sessionsPath = path.join(dataDir, 'sessions.json');
    const stored = JSON.parse(await fs.readFile(sessionsPath, 'utf8'));
    const expired = stored.map((item) =>
      item.token === token ? { ...item, expiresAt: Date.now() - 5_000 } : item,
    );
    await fs.writeFile(sessionsPath, JSON.stringify(expired));

    // Reload handler with fresh module Map so disk expiry is authoritative.
    vi.resetModules();
    ({ buildApiHandler } = await import('../../server/core/apiHandler.mjs'));
    const expiredHandler = await buildApiHandler({ dataDir, environment: 'node' });

    const res = await invoke(expiredHandler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(401);
  });

  it('4. authenticated user A accesses own resource → allowed', async () => {
    const a = await signup('usera@test.com', 'UserA');
    const write = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${a.token}` },
      body: { mode: 'write', text: 'My private reflection A' },
    });
    expect(write.statusCode).toBe(200);
    expect(write.json?.ok).toBe(true);

    const story = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${a.token}` },
    });
    expect(story.statusCode).toBe(200);
    expect(JSON.stringify(story.json?.entries || [])).toContain('My private reflection A');
  });

  it('5. authenticated user A cannot read user B resource', async () => {
    const a = await signup('alice@test.com', 'Alice');
    const b = await signup('bob@test.com', 'Bob');

    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${b.token}` },
      body: { mode: 'write', text: 'Secret for Bob only' },
    });

    const aliceStory = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${a.token}` },
    });
    expect(aliceStory.statusCode).toBe(200);
    expect(JSON.stringify(aliceStory.json?.entries || [])).not.toContain('Secret for Bob only');

    const bobStory = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${b.token}` },
    });
    expect(JSON.stringify(bobStory.json?.entries || [])).toContain('Secret for Bob only');
  });

  it('6. arbitrary x-luna-mobile-id cannot access authenticated profile', async () => {
    const a = await signup('device-spoof@test.com', 'DeviceSpoof');
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${a.token}` },
      body: { mode: 'write', text: 'Owned by authenticated user' },
    });

    const spoof = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { 'x-luna-mobile-id': a.userId },
    });
    expect(spoof.statusCode).toBe(401);

    const spoofDevice = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { 'x-luna-mobile-id': 'attacker-device-999' },
    });
    expect(spoofDevice.statusCode).toBe(401);
  });

  it('7. arbitrary x-user-id cannot establish ownership', async () => {
    const a = await signup('xuserid@test.com', 'XUser');
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { 'x-user-id': a.userId },
    });
    expect(res.statusCode).toBe(401);
  });

  it('8. spoofed request body userId cannot override authenticated identity', async () => {
    const a = await signup('bodya@test.com', 'BodyA');
    const b = await signup('bodyb@test.com', 'BodyB');

    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${b.token}` },
      body: { mode: 'write', text: 'Bob body secret' },
    });

    const spoofWrite = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${a.token}` },
      body: { mode: 'write', text: 'Alice writing', userId: b.userId },
    });
    expect(spoofWrite.statusCode).toBe(200);

    const bobStory = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${b.token}` },
    });
    expect(JSON.stringify(bobStory.json?.entries || [])).not.toContain('Alice writing');
    expect(JSON.stringify(bobStory.json?.entries || [])).toContain('Bob body secret');

    const aliceStory = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${a.token}` },
    });
    expect(JSON.stringify(aliceStory.json?.entries || [])).toContain('Alice writing');
  });

  it('9. IP change does not change authenticated ownership', async () => {
    const a = await signup('ipchange@test.com', 'IpChange');
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${a.token}` },
      body: { mode: 'write', text: 'From IP one' },
      ip: '198.51.100.1',
    });

    const story = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${a.token}` },
      ip: '198.51.100.99',
    });
    expect(story.statusCode).toBe(200);
    expect(JSON.stringify(story.json?.entries || [])).toContain('From IP one');
  });

  it('10. same IP does not merge two users', async () => {
    const sharedIp = '198.51.100.50';
    const a = await signup('sameip-a@test.com', 'SameIpA');
    const b = await signup('sameip-b@test.com', 'SameIpB');

    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${a.token}` },
      body: { mode: 'write', text: 'Alice same-IP note' },
      ip: sharedIp,
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${b.token}` },
      body: { mode: 'write', text: 'Bob same-IP note' },
      ip: sharedIp,
    });

    const aliceStory = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${a.token}` },
      ip: sharedIp,
    });
    const bobStory = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${b.token}` },
      ip: sharedIp,
    });

    expect(JSON.stringify(aliceStory.json?.entries || [])).toContain('Alice same-IP note');
    expect(JSON.stringify(aliceStory.json?.entries || [])).not.toContain('Bob same-IP note');
    expect(JSON.stringify(bobStory.json?.entries || [])).toContain('Bob same-IP note');
    expect(JSON.stringify(bobStory.json?.entries || [])).not.toContain('Alice same-IP note');
  });

  it('11. guest request cannot access authenticated profile', async () => {
    const a = await signup('guest-block@test.com', 'GuestBlock');
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${a.token}` },
      body: { mode: 'write', text: 'Authenticated only' },
    });

    const guest = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/today',
      headers: { 'x-luna-mobile-id': 'guest-device' },
      ip: '203.0.113.77',
    });
    expect(guest.statusCode).toBe(401);
  });

  it('12. admin route still requires admin authorization', async () => {
    const noAuth = await invoke(handler, { method: 'GET', path: '/api/admin/state' });
    expect(noAuth.statusCode).toBe(401);

    // Admin router uses cookie requireSession — Bearer alone is not accepted.
    const member = await signup('member-admin@test.com', 'Member');
    const bearerOnly = await invoke(handler, {
      method: 'GET',
      path: '/api/admin/state',
      headers: { authorization: `Bearer ${member.token}` },
    });
    expect(bearerOnly.statusCode).toBe(401);

    // Cookie-authenticated default viewer cannot perform privileged admin writes.
    const webMember = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email: 'member-admin-write@test.com', password: 'password123', name: 'MemberWrite' },
    });
    expect(webMember.statusCode).toBe(200);
    const cookie = String(webMember.headers['Set-Cookie'] || '').split(';')[0];
    const roleWrite = await invoke(handler, {
      method: 'POST',
      path: '/api/admin/role',
      headers: { cookie, 'content-type': 'application/json' },
      body: { email: 'someone@test.com', role: 'operator' },
    });
    expect(roleWrite.statusCode).toBe(403);
  });

  it('13. existing valid authenticated web cookie flow remains functional', async () => {
    const webSignup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email: 'webcookie@test.com', password: 'password123', name: 'WebCookie' },
    });
    expect(webSignup.statusCode).toBe(200);
    const setCookie = webSignup.headers['Set-Cookie'] || '';
    expect(setCookie).toMatch(/luna_sid=/);

    const cookie = String(setCookie).split(';')[0];
    const story = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { cookie },
    });
    expect(story.statusCode).toBe(200);
    expect(Array.isArray(story.json?.entries)).toBe(true);
  });

  it('14. existing valid authenticated mobile Bearer flow remains functional', async () => {
    const mobile = await signup('mobile-ok@test.com', 'MobileOk');
    const today = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/today',
      headers: {
        authorization: `Bearer ${mobile.token}`,
        'x-luna-mobile-id': 'should-be-ignored-for-ownership',
      },
      body: undefined,
    });
    expect(today.statusCode).toBe(200);
    expect(today.json?.title).toBe('Today with Luna29');

    const state = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/state',
      headers: { authorization: `Bearer ${mobile.token}` },
      body: { section: 'body_map', data: { note: 'mine' }, userId: 'attacker' },
    });
    expect(state.statusCode).toBe(200);

    const readState = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/state?section=body_map',
      headers: { authorization: `Bearer ${mobile.token}` },
    });
    expect(readState.statusCode).toBe(200);
    expect(readState.json?.data?.note).toBe('mine');
  });

  it('stateless public mobile routes remain available without auth', async () => {
    const billing = await invoke(handler, { method: 'GET', path: '/api/mobile/billing/status' });
    expect(billing.statusCode).toBe(200);

    const providers = await invoke(handler, { method: 'GET', path: '/api/mobile/auth/providers' });
    expect(providers.statusCode).toBe(200);

    const generate = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reports/generate',
      body: { note: 'stateless template only' },
    });
    expect(generate.statusCode).toBe(200);
    expect(generate.json?.text).toContain('Luna29 Health Report');
  });

  it('legacy device:/guest: profile keys are not created by unauthenticated requests', async () => {
    const denied = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { 'x-luna-mobile-id': 'legacy-device-abc' },
      ip: '203.0.113.88',
    });
    expect(denied.statusCode).toBe(401);

    const reflectionsPath = path.join(dataDir, 'mobile-reflections.json');
    let keys = [];
    try {
      const reflections = JSON.parse(await fs.readFile(reflectionsPath, 'utf8'));
      keys = Object.keys(reflections.profiles || {});
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      // File may not exist until an authenticated write occurs — that is correct.
    }
    expect(keys.some((key) => key.startsWith('device:'))).toBe(false);
    expect(keys.some((key) => key.startsWith('guest:'))).toBe(false);
  });
});
