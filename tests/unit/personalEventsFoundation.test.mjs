import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { buildApiHandler } from '../../server/core/apiHandler.mjs';

/**
 * Task 2 — authenticated personal event foundation tests.
 * Ownership must come only from verified cookie/Bearer session.
 * Uses explicit test harness file store (environment: 'test') — never production fallback.
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

describe('personal events foundation (Task 2)', () => {
  let dataDir;
  let handler;
  let ipCounter = 0;

  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-personal-events-'));
    handler = await buildApiHandler({ dataDir, environment: 'test' });
    ipCounter = 0;
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  const nextIp = () => {
    ipCounter += 1;
    return `203.0.113.${(ipCounter % 200) + 1}`;
  };

  const signup = async (email, name = 'Member') => {
    const ip = nextIp();
    const result = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email, password: 'password123', name },
      ip,
    });
    expect(result.statusCode).toBe(200);
    expect(result.json?.token).toBeTruthy();
    return {
      token: result.json.token,
      session: result.json.session,
      authHeader: { authorization: `Bearer ${result.json.token}` },
      ip,
    };
  };

  it('unauthenticated create/read fails 401', async () => {
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      body: { event_type: 'note', payload: { text: 'x' } },
    });
    expect(create.statusCode).toBe(401);

    const list = await invoke(handler, { method: 'GET', path: '/api/personal/events' });
    expect(list.statusCode).toBe(401);
  });

  it('invalid auth fails 401', async () => {
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: { authorization: 'Bearer not-a-real-token' },
      body: { event_type: 'note', payload: { text: 'x' } },
    });
    expect(create.statusCode).toBe(401);
  });

  it('authenticated user can create and read own events', async () => {
    const user = await signup('owner@test.com', 'Owner');
    const created = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: user.authHeader,
      body: {
        event_type: 'DAILY_CHECKIN',
        occurred_at: '2026-07-01T10:00:00.000Z',
        source: 'web',
        payload: { metrics: { energy: 3 }, symptoms: [], isPeriod: false },
        client_event_id: 'local-checkin-1',
      },
    });
    expect(created.statusCode).toBe(200);
    expect(created.json.events).toHaveLength(1);
    expect(created.json.events[0].user_id).toBe(user.session.id);
    expect(created.json.events[0].event_type).toBe('DAILY_CHECKIN');

    const listed = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/events?event_type=DAILY_CHECKIN',
      headers: user.authHeader,
    });
    expect(listed.statusCode).toBe(200);
    expect(listed.json.events).toHaveLength(1);
    expect(listed.json.events[0].client_event_id).toBe('local-checkin-1');
  });

  it('user A cannot read user B events', async () => {
    const a = await signup('alice-pe@test.com', 'Alice');
    const b = await signup('bob-pe@test.com', 'Bob');

    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: a.authHeader,
      body: { event_type: 'note', payload: { text: 'alice-secret' }, client_event_id: 'a1' },
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: b.authHeader,
      body: { event_type: 'note', payload: { text: 'bob-secret' }, client_event_id: 'b1' },
    });

    const aliceList = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/events',
      headers: a.authHeader,
    });
    const bobList = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/events',
      headers: b.authHeader,
    });

    expect(JSON.stringify(aliceList.json.events)).toContain('alice-secret');
    expect(JSON.stringify(aliceList.json.events)).not.toContain('bob-secret');
    expect(JSON.stringify(bobList.json.events)).toContain('bob-secret');
    expect(JSON.stringify(bobList.json.events)).not.toContain('alice-secret');
  });

  it('user A cannot delete user B event', async () => {
    const a = await signup('alice-del@test.com', 'Alice');
    const b = await signup('bob-del@test.com', 'Bob');

    const created = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: b.authHeader,
      body: { event_type: 'note', payload: { text: 'bob-only' }, client_event_id: 'bob-del-1' },
    });
    const bobEventId = created.json.events[0].id;

    const del = await invoke(handler, {
      method: 'DELETE',
      path: `/api/personal/events/${bobEventId}`,
      headers: a.authHeader,
    });
    expect(del.statusCode).toBe(404);

    const bobList = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/events',
      headers: b.authHeader,
    });
    expect(bobList.json.events.some((e) => e.id === bobEventId)).toBe(true);
  });

  it('body user_id spoofing is ignored', async () => {
    const a = await signup('spoof-body@test.com', 'Spoof');
    const created = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: a.authHeader,
      body: {
        event_type: 'note',
        payload: { text: 'owned-by-auth' },
        user_id: 'attacker-user-id',
        owner_id: 'attacker-user-id',
        client_event_id: 'spoof-1',
      },
    });
    expect(created.statusCode).toBe(200);
    expect(created.json.events[0].user_id).toBe(a.session.id);
    expect(created.json.events[0].user_id).not.toBe('attacker-user-id');
  });

  it('query user_id spoofing is ignored', async () => {
    const a = await signup('spoof-query@test.com', 'SpoofQ');
    const b = await signup('spoof-query-b@test.com', 'SpoofB');

    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: b.authHeader,
      body: { event_type: 'note', payload: { text: 'b-private' }, client_event_id: 'bq1' },
    });

    const listed = await invoke(handler, {
      method: 'GET',
      path: `/api/personal/events?user_id=${encodeURIComponent(b.session.id)}`,
      headers: a.authHeader,
    });
    expect(listed.statusCode).toBe(200);
    expect(JSON.stringify(listed.json.events || [])).not.toContain('b-private');
  });

  it('imported local events become owned by authenticated user only', async () => {
    const a = await signup('sync-owner@test.com', 'SyncOwner');
    const sync = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events/sync-local',
      headers: a.authHeader,
      body: {
        events: [
          {
            id: 'local-1',
            type: 'AUDIO_REFLECTION',
            timestamp: '2026-07-01T12:00:00.000Z',
            version: 4,
            payload: { text: 'hello' },
            user_id: 'should-be-ignored',
          },
        ],
      },
    });
    expect(sync.statusCode).toBe(200);
    expect(sync.json?.imported).toBe(1);
    expect(sync.json?.events?.[0]?.user_id).toBe(a.session.id);
    expect(sync.json?.events?.[0]?.client_event_id).toBe('local-1');
    expect(sync.json?.events?.[0]?.source).toBe('local_sync');
  });

  it('duplicate sync does not create duplicates', async () => {
    const a = await signup('sync-dedupe@test.com', 'Dedupe');
    const localEvents = [
      {
        id: 'local-dup-1',
        type: 'DAILY_CHECKIN',
        timestamp: '2026-07-02T08:00:00.000Z',
        version: 4,
        payload: { metrics: { energy: 2 }, symptoms: [], isPeriod: false },
      },
    ];

    const first = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events/sync-local',
      headers: a.authHeader,
      body: { events: localEvents },
    });
    expect(first.statusCode).toBe(200);
    expect(first.json.imported).toBe(1);

    const second = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events/sync-local',
      headers: a.authHeader,
      body: { events: localEvents },
    });
    expect(second.statusCode).toBe(200);
    expect(second.json.imported).toBe(0);
    expect(second.json.updated).toBe(1);

    const listed = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/events?event_type=DAILY_CHECKIN',
      headers: a.authHeader,
    });
    expect(listed.json.events.filter((e) => e.client_event_id === 'local-dup-1')).toHaveLength(1);
  });

  it('event payload size limits work', async () => {
    const a = await signup('payload-limit@test.com', 'Payload');
    const huge = 'x'.repeat(70_000);
    const created = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: a.authHeader,
      body: { event_type: 'note', payload: { text: huge } },
    });
    expect(created.statusCode).toBe(400);
    expect(String(created.json?.error || '')).toMatch(/Payload exceeds/i);
  });

  it('invalid event_type rejected', async () => {
    const a = await signup('bad-type@test.com', 'BadType');
    const created = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: a.authHeader,
      body: { event_type: 'not_a_real_type', payload: {} },
    });
    expect(created.statusCode).toBe(400);
    expect(String(created.json?.error || '')).toMatch(/event_type/i);
  });

  it('malformed timestamp rejected', async () => {
    const a = await signup('bad-ts@test.com', 'BadTs');
    const created = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: a.authHeader,
      body: { event_type: 'note', occurred_at: 'not-a-date', payload: { text: 'x' } },
    });
    expect(created.statusCode).toBe(400);
    expect(String(created.json?.error || '')).toMatch(/timestamp/i);
  });

  it('soft delete hides event from list for owner', async () => {
    const a = await signup('soft-del@test.com', 'SoftDel');
    const created = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: a.authHeader,
      body: { event_type: 'note', payload: { text: 'to-delete' }, client_event_id: 'del-1' },
    });
    const id = created.json.events[0].id;

    const del = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/events/${id}/delete`,
      headers: a.authHeader,
      body: {},
    });
    expect(del.statusCode).toBe(200);

    const listed = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/events',
      headers: a.authHeader,
    });
    expect(listed.json.events.some((e) => e.id === id)).toBe(false);
  });

  it('web cookie auth can use personal events API', async () => {
    const web = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email: 'web-pe@test.com', password: 'password123', name: 'WebPE' },
      ip: nextIp(),
    });
    expect(web.statusCode).toBe(200);
    const cookie = String(web.headers['Set-Cookie'] || '').split(';')[0];
    expect(cookie).toMatch(/^luna_sid=/);

    const created = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: { cookie },
      body: { event_type: 'reflection', payload: { text: 'cookie-owned' } },
    });
    expect(created.statusCode).toBe(200);
    expect(created.json.events[0].user_id).toBe(web.json.session.id);
  });
});
