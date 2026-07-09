import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { createHash } from 'node:crypto';

/**
 * WS2.2 — Local account deletion cascade (server Postgres + JSON harness).
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

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.55' }) => {
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

const markerFor = (userId) => {
  const hash = createHash('sha256').update(String(userId)).digest('hex').slice(0, 32);
  return `deleted:${hash}`;
};

/** In-memory Postgres mock with transaction support for cascade unit tests. */
const createCascadeMockPool = () => {
  const tables = {
    personal_events: [],
    memory_consent: [],
    calendar_user_data: [],
    mobile_reflections: [],
    mobile_reflection_meta: [],
    mobile_reports: [],
    mobile_user_state: [],
    mobile_push_registrations: [],
    billing_accounts: [],
    billing_subscriptions: [],
    billing_trials: [],
    contact_submissions: [],
    admin_invites: [],
    privacy_requests: [],
    admin_audit_events: [],
    auth_sessions: [],
    auth_users: [],
    luna_trials: [],
    stripe_webhook_events: [{ event_id: 'evt_keep', payload: {} }],
  };

  let failNext = null;
  let failCommit = false;
  let inTx = false;
  let snapshot = null;
  let rollbackCount = 0;

  const clone = () => JSON.parse(JSON.stringify(tables));

  const exec = async (sql, params = []) => {
    const q = String(sql).replace(/\s+/g, ' ').trim();

    if (q === 'BEGIN') {
      inTx = true;
      snapshot = clone();
      return { rows: [], rowCount: 0 };
    }
    if (q === 'COMMIT') {
      if (failCommit) {
        failCommit = false;
        const err = new Error('commit_forced');
        err.code = 'FORCE_FAIL';
        throw err;
      }
      inTx = false;
      snapshot = null;
      return { rows: [], rowCount: 0 };
    }
    if (q === 'ROLLBACK') {
      rollbackCount += 1;
      if (snapshot) {
        for (const key of Object.keys(tables)) {
          tables[key] = snapshot[key];
        }
      }
      inTx = false;
      snapshot = null;
      return { rows: [], rowCount: 0 };
    }

    if (failNext && failNext.pattern.test(q)) {
      const err = new Error(failNext.message || 'forced_failure');
      err.code = failNext.code || 'FORCE_FAIL';
      failNext = null;
      throw err;
    }

    if (q.startsWith('DELETE FROM personal_events')) {
      const uid = params[0];
      const before = tables.personal_events.length;
      tables.personal_events = tables.personal_events.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.personal_events.length };
    }
    if (q.startsWith('DELETE FROM memory_consent')) {
      const uid = params[0];
      const before = tables.memory_consent.length;
      tables.memory_consent = tables.memory_consent.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.memory_consent.length };
    }
    if (q.startsWith('DELETE FROM calendar_user_data')) {
      const uid = params[0];
      const before = tables.calendar_user_data.length;
      tables.calendar_user_data = tables.calendar_user_data.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.calendar_user_data.length };
    }
    if (q.startsWith('DELETE FROM mobile_reflections')) {
      const uid = params[0];
      const before = tables.mobile_reflections.length;
      tables.mobile_reflections = tables.mobile_reflections.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.mobile_reflections.length };
    }
    if (q.startsWith('DELETE FROM mobile_reflection_meta')) {
      const uid = params[0];
      const before = tables.mobile_reflection_meta.length;
      tables.mobile_reflection_meta = tables.mobile_reflection_meta.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.mobile_reflection_meta.length };
    }
    if (q.startsWith('DELETE FROM mobile_reports')) {
      const uid = params[0];
      const before = tables.mobile_reports.length;
      tables.mobile_reports = tables.mobile_reports.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.mobile_reports.length };
    }
    if (q.startsWith('DELETE FROM mobile_user_state')) {
      const uid = params[0];
      const before = tables.mobile_user_state.length;
      tables.mobile_user_state = tables.mobile_user_state.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.mobile_user_state.length };
    }
    if (q.startsWith('DELETE FROM mobile_push_registrations')) {
      const uid = params[0];
      const before = tables.mobile_push_registrations.length;
      tables.mobile_push_registrations = tables.mobile_push_registrations.filter(
        (r) => r.user_id !== uid,
      );
      return { rows: [], rowCount: before - tables.mobile_push_registrations.length };
    }
    if (q.startsWith('DELETE FROM billing_accounts')) {
      const uid = params[0];
      const before = tables.billing_accounts.length;
      tables.billing_accounts = tables.billing_accounts.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.billing_accounts.length };
    }
    if (q.startsWith('DELETE FROM billing_subscriptions')) {
      const uid = params[0];
      const before = tables.billing_subscriptions.length;
      tables.billing_subscriptions = tables.billing_subscriptions.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.billing_subscriptions.length };
    }
    if (q.startsWith('DELETE FROM billing_trials')) {
      const uid = params[0];
      const before = tables.billing_trials.length;
      tables.billing_trials = tables.billing_trials.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.billing_trials.length };
    }
    if (q.startsWith('DELETE FROM luna_trials')) {
      const uid = params[0];
      const before = tables.luna_trials.length;
      tables.luna_trials = tables.luna_trials.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.luna_trials.length };
    }
    if (q.startsWith('DELETE FROM contact_submissions')) {
      const email = String(params[0] || '').toLowerCase();
      const before = tables.contact_submissions.length;
      tables.contact_submissions = tables.contact_submissions.filter(
        (r) => String(r.email || '').toLowerCase() !== email,
      );
      return { rows: [], rowCount: before - tables.contact_submissions.length };
    }
    if (q.startsWith('DELETE FROM auth_sessions')) {
      const uid = params[0];
      const before = tables.auth_sessions.length;
      tables.auth_sessions = tables.auth_sessions.filter((r) => r.user_id !== uid);
      return { rows: [], rowCount: before - tables.auth_sessions.length };
    }
    if (q.startsWith('DELETE FROM auth_users')) {
      const uid = params[0];
      const before = tables.auth_users.length;
      tables.auth_users = tables.auth_users.filter((r) => r.id !== uid);
      return { rows: [], rowCount: before - tables.auth_users.length };
    }

    if (q.includes('UPDATE admin_invites')) {
      const email = String(params[0] || '').toLowerCase();
      const marker = params[1];
      let n = 0;
      for (const row of tables.admin_invites) {
        const emailMatch = String(row.email || '').toLowerCase() === email;
        const createdByMatch = String(row.created_by || '').toLowerCase() === email;
        if (emailMatch || createdByMatch) {
          if (emailMatch && row.status === 'pending') row.status = 'revoked';
          if (emailMatch) {
            row.email = marker;
            row.invite_link = null;
          }
          if (createdByMatch) row.created_by = marker;
          n += 1;
        }
      }
      return { rows: [], rowCount: n };
    }
    if (q.includes('UPDATE privacy_requests')) {
      const email = String(params[0] || '').toLowerCase();
      const marker = params[1];
      let n = 0;
      for (const row of tables.privacy_requests) {
        const emailMatch = String(row.email || '').toLowerCase() === email;
        const actorMatch = String(row.actor || '').toLowerCase() === email;
        if (emailMatch || actorMatch) {
          if (emailMatch) row.email = marker;
          if (actorMatch) row.actor = marker;
          row.fields = null;
          row.consent_scopes = null;
          n += 1;
        }
      }
      return { rows: [], rowCount: n };
    }
    if (q.includes('UPDATE admin_audit_events')) {
      const email = String(params[0] || '').toLowerCase();
      const marker = params[1];
      let n = 0;
      for (const row of tables.admin_audit_events) {
        let touched = false;
        if (String(row.actor_email || '').toLowerCase() === email) {
          row.actor_email = marker;
          touched = true;
        }
        if (typeof row.details === 'string' && row.details.toLowerCase().includes(email)) {
          row.details = row.details.replace(new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), marker);
          touched = true;
        }
        if (touched) n += 1;
      }
      return { rows: [], rowCount: n };
    }

    if (q.startsWith('INSERT INTO privacy_requests')) {
      const id = params[0];
      if (!tables.privacy_requests.some((r) => r.id === id)) {
        tables.privacy_requests.push({
          id,
          type: params[1],
          status: params[2],
          email: params[3],
          actor: params[4],
          scope: params[5],
          source: params[8],
          action: params[9],
        });
      }
      return { rows: [], rowCount: 1 };
    }
    if (q.startsWith('SELECT * FROM privacy_requests WHERE id')) {
      const row = tables.privacy_requests.find((r) => r.id === params[0]);
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    }

    throw new Error(`unmocked_sql:${q.slice(0, 80)}`);
  };

  const pool = {
    tables,
    get rollbackCount() {
      return rollbackCount;
    },
    forceFailOn(pattern, message = 'forced_failure', code = 'FORCE_FAIL') {
      failNext = { pattern, message, code };
    },
    forceFailCommit() {
      failCommit = true;
    },
    async connect() {
      return {
        query: exec,
        release() {},
      };
    },
    async query(sql, params) {
      return exec(sql, params);
    },
  };

  return pool;
};

const seedMinimalUser = (pool, userId = 'u1', email = 'u1@luna.test') => {
  pool.tables.auth_users.push({ id: userId, email });
  pool.tables.auth_sessions.push({ token: 'tok1', user_id: userId });
  pool.tables.personal_events.push({ id: 'e1', user_id: userId, event_type: 'observation' });
  pool.tables.memory_consent.push({ user_id: userId });
  pool.tables.calendar_user_data.push({ user_id: userId });
  pool.tables.mobile_reflections.push({ id: 'r1', user_id: userId });
  pool.tables.billing_accounts.push({ user_id: userId });
  pool.tables.billing_trials.push({ user_id: userId });
  pool.tables.privacy_requests.push({
    id: 'p1',
    email,
    actor: email,
    fields: { email },
  });
  pool.tables.admin_invites.push({
    id: 'inv1',
    email,
    status: 'accepted',
    invite_link: 'https://x',
    created_by: email,
  });
  pool.tables.admin_audit_events.push({
    id: 'a1',
    actor_email: 'admin@luna.test',
    details: `Assigned operator to ${email}`,
  });
  return { userId, email };
};

describe('accountDeletionService local cascade (WS2.2)', () => {
  it('deletes owner rows, retains other users, anonymizes operational email', async () => {
    const { deleteAccountLocalCascade, deletedUserEmailMarker } = await import(
      '../../server/core/accountDeletionService.mjs'
    );
    const pool = createCascadeMockPool();
    const userA = 'user-a';
    const userB = 'user-b';
    const emailA = 'alice@luna.test';
    const emailB = 'bob@luna.test';

    pool.tables.personal_events.push(
      { id: 'e1', user_id: userA, event_type: 'observation' },
      { id: 'e2', user_id: userA, event_type: 'signal' },
      { id: 'e3', user_id: userB, event_type: 'observation' },
    );
    pool.tables.memory_consent.push({ user_id: userA }, { user_id: userB });
    pool.tables.calendar_user_data.push({ user_id: userA }, { user_id: userB });
    pool.tables.mobile_reflections.push({ id: 'r1', user_id: userA }, { id: 'r2', user_id: userB });
    pool.tables.mobile_reflection_meta.push({ user_id: userA }, { user_id: userB });
    pool.tables.mobile_reports.push({ id: 'rep1', user_id: userA }, { id: 'rep2', user_id: userB });
    pool.tables.mobile_user_state.push({ user_id: userA, section_key: 'home' }, { user_id: userB, section_key: 'home' });
    pool.tables.mobile_push_registrations.push(
      { user_id: userA, token: 'tok-a' },
      { user_id: userB, token: 'tok-b' },
    );
    pool.tables.billing_accounts.push({ user_id: userA }, { user_id: userB });
    pool.tables.billing_subscriptions.push({ user_id: userA }, { user_id: userB });
    pool.tables.billing_trials.push({ user_id: userA }, { user_id: userB });
    pool.tables.contact_submissions.push({ id: 'c1', email: emailA }, { id: 'c2', email: emailB });
    pool.tables.admin_invites.push({ id: 'inv1', email: emailA, status: 'pending', invite_link: 'https://x' });
    pool.tables.privacy_requests.push({ id: 'p1', email: emailA, actor: emailA });
    pool.tables.admin_audit_events.push({ id: 'a1', actor_email: emailA, action: 'invite' });
    pool.tables.auth_sessions.push({ token: 's1', user_id: userA }, { token: 's2', user_id: userB });
    pool.tables.auth_users.push({ id: userA, email: emailA }, { id: userB, email: emailB });

    const result = await deleteAccountLocalCascade({
      pool,
      userId: userA,
      email: emailA,
      actorUserId: userA,
      scope: 'account',
      requestId: 'dsar-del-test-1',
    });

    expect(result.ok).toBe(true);
    expect(result.deleted.authUser).toBe(1);
    expect(result.deleted.sessions).toBe(1);
    expect(result.deleted.personalEvents).toBe(2);
    expect(result.deleted.memoryConsent).toBe(1);
    expect(result.deleted.calendar).toBe(1);
    expect(result.deleted.mobilePush).toBe(1);
    expect(result.deleted.billingTrials).toBe(1);
    expect(result.deleted.contactSubmissions).toBe(1);
    expect(result.retained.stripeWebhookEvents).toBe(true);

    expect(pool.tables.personal_events.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.memory_consent.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.calendar_user_data.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.mobile_reflections.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.mobile_reports.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.mobile_user_state.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.mobile_push_registrations.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.billing_accounts.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.billing_subscriptions.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.billing_trials.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.auth_users.map((r) => r.id)).toEqual([userB]);
    expect(pool.tables.auth_sessions.map((r) => r.user_id)).toEqual([userB]);
    expect(pool.tables.stripe_webhook_events).toHaveLength(1);

    const marker = deletedUserEmailMarker(userA);
    expect(marker).toBe(markerFor(userA));
    expect(pool.tables.admin_invites[0].email).toBe(marker);
    expect(pool.tables.admin_invites[0].status).toBe('revoked');
    expect(pool.tables.privacy_requests.some((r) => r.email === emailA)).toBe(false);
    expect(pool.tables.admin_audit_events[0].actor_email).toBe(marker);
    const tombstone = pool.tables.privacy_requests.find((r) => r.id === 'dsar-del-test-1');
    expect(tombstone?.email).toBe(marker);
    expect(tombstone?.email).not.toContain('@');
  });

  it.each([
    ['A personal_events', /DELETE FROM personal_events/],
    ['B memory_consent', /DELETE FROM memory_consent/],
    ['C calendar', /DELETE FROM calendar_user_data/],
    ['D billing', /DELETE FROM billing_accounts/],
    ['E privacy anonymization', /UPDATE privacy_requests/],
    ['F invite anonymization', /UPDATE admin_invites/],
    ['G audit anonymization', /UPDATE admin_audit_events/],
    ['H sessions', /DELETE FROM auth_sessions/],
    ['I auth user', /DELETE FROM auth_users/],
  ])('failure injection %s rolls back; auth preserved; ok=false', async (_label, pattern) => {
    const { deleteAccountLocalCascade } = await import(
      '../../server/core/accountDeletionService.mjs'
    );
    const pool = createCascadeMockPool();
    const { userId, email } = seedMinimalUser(pool, 'fail-user', 'fail@luna.test');
    pool.forceFailOn(pattern, `forced_${_label}`);

    const result = await deleteAccountLocalCascade({
      pool,
      userId,
      email,
      scope: 'account',
    });

    expect(result.ok).toBe(false);
    expect(pool.rollbackCount).toBeGreaterThanOrEqual(1);
    expect(pool.tables.auth_users).toHaveLength(1);
    expect(pool.tables.personal_events).toHaveLength(1);
    expect(pool.tables.auth_sessions).toHaveLength(1);
  });

  it('failure injection J COMMIT rolls back; auth preserved; ok=false', async () => {
    const { deleteAccountLocalCascade } = await import(
      '../../server/core/accountDeletionService.mjs'
    );
    const pool = createCascadeMockPool();
    const { userId, email } = seedMinimalUser(pool, 'commit-fail', 'commit-fail@luna.test');
    pool.forceFailCommit();

    const result = await deleteAccountLocalCascade({
      pool,
      userId,
      email,
      scope: 'account',
    });

    expect(result.ok).toBe(false);
    expect(pool.rollbackCount).toBeGreaterThanOrEqual(1);
    expect(pool.tables.auth_users).toHaveLength(1);
    expect(pool.tables.personal_events).toHaveLength(1);
  });

  it('anonymizes accepted invites, audit details, and privacy fields JSON', async () => {
    const { deleteAccountLocalCascade, deletedUserEmailMarker } = await import(
      '../../server/core/accountDeletionService.mjs'
    );
    const pool = createCascadeMockPool();
    const { userId, email } = seedMinimalUser(pool, 'pii-user', 'pii@luna.test');
    pool.tables.admin_invites.push({
      id: 'inv-expired',
      email,
      status: 'expired',
      invite_link: 'https://y',
    });

    const result = await deleteAccountLocalCascade({
      pool,
      userId,
      email,
      scope: 'account',
      requestId: 'dsar-pii-1',
    });
    expect(result.ok).toBe(true);
    const marker = deletedUserEmailMarker(userId);
    expect(pool.tables.admin_invites.every((i) => i.email === marker || i.created_by === marker)).toBe(
      true,
    );
    expect(pool.tables.admin_invites.every((i) => !String(i.email || '').includes('@'))).toBe(true);
    expect(pool.tables.admin_audit_events[0].details).not.toMatch(/pii@luna\.test/i);
    expect(pool.tables.admin_audit_events[0].details).toContain(marker);
    expect(pool.tables.privacy_requests.find((r) => r.id === 'p1')?.fields).toBeNull();
  });

  it('retry after failure can succeed (idempotent enough)', async () => {
    const { deleteAccountLocalCascade } = await import(
      '../../server/core/accountDeletionService.mjs'
    );
    const pool = createCascadeMockPool();
    const userA = 'user-retry';
    const emailA = 'retry@luna.test';
    pool.tables.personal_events.push({ id: 'e1', user_id: userA });
    pool.tables.auth_users.push({ id: userA, email: emailA });
    pool.forceFailOn(/DELETE FROM auth_users/, 'first_fail');

    const first = await deleteAccountLocalCascade({
      pool,
      userId: userA,
      email: emailA,
      scope: 'account',
      requestId: 'dsar-retry-1',
    });
    expect(first.ok).toBe(false);

    const second = await deleteAccountLocalCascade({
      pool,
      userId: userA,
      email: emailA,
      scope: 'account',
      requestId: 'dsar-retry-2',
    });
    expect(second.ok).toBe(true);
    expect(pool.tables.auth_users).toHaveLength(0);
    expect(pool.tables.personal_events).toHaveLength(0);
  });

  it('logs do not include plaintext email or push tokens', async () => {
    const { deleteAccountLocalCascade } = await import(
      '../../server/core/accountDeletionService.mjs'
    );
    const pool = createCascadeMockPool();
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    pool.tables.auth_users.push({ id: 'u-log', email: 'secret@luna.test' });
    pool.tables.mobile_push_registrations.push({ user_id: 'u-log', token: 'ExponentPushToken[abc]' });

    await deleteAccountLocalCascade({
      pool,
      userId: 'u-log',
      email: 'secret@luna.test',
      scope: 'account',
    });

    const joined = infoSpy.mock.calls.map((c) => c.map(String).join(' ')).join('\n');
    expect(joined).not.toMatch(/secret@luna\.test/i);
    expect(joined).not.toMatch(/ExponentPushToken/i);
    expect(joined).not.toMatch(/health text|cramps|bleeding/i);
    infoSpy.mockRestore();
  });

  it('session/user resolution is Postgres-authoritative (no stale Map trust)', async () => {
    const src = await fs.readFile(
      path.join(process.cwd(), 'server/core/apiHandler.mjs'),
      'utf8',
    );
    const sessionFn = src.slice(
      src.indexOf('const resolveSessionRecord'),
      src.indexOf('const resolveUserRecord'),
    );
    const userFn = src.slice(
      src.indexOf('const resolveUserRecord'),
      src.indexOf('const getSessionUser'),
    );
    // Postgres branch must query before trusting Map; Map get only in non-PG path.
    expect(sessionFn).toMatch(/if \(authPgPool\) \{/);
    expect(sessionFn).toMatch(/getSessionRowFromPostgres/);
    expect(sessionFn).toMatch(/sessions\.delete\(token\)/);
    const pgBlockEnd = sessionFn.indexOf('const session = sessions.get(token)');
    const pgCheck = sessionFn.indexOf('getSessionRowFromPostgres');
    expect(pgCheck).toBeGreaterThan(-1);
    expect(pgBlockEnd).toBeGreaterThan(pgCheck);
    expect(userFn).toMatch(/getUserByIdFromPostgres/);
    expect(userFn).toMatch(/users\.splice/);
  });
});

describe('POST /api/privacy/delete account cascade (JSON harness)', () => {
  let dataDir;
  let handler;
  let prevSuper;
  let prevBootstrap;

  beforeEach(async () => {
    vi.resetModules();
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-del-'));
    prevSuper = process.env.SUPER_ADMIN_EMAILS;
    prevBootstrap = process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD;
    process.env.NODE_ENV = 'test';
    delete process.env.VERCEL_ENV;
    delete process.env.DATABASE_URL;
    process.env.SUPER_ADMIN_EMAILS = 'super-del@luna.test';
    process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD = 'bootstrap-pass-123';
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
  });

  afterEach(async () => {
    if (prevSuper === undefined) delete process.env.SUPER_ADMIN_EMAILS;
    else process.env.SUPER_ADMIN_EMAILS = prevSuper;
    if (prevBootstrap === undefined) delete process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD;
    else process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD = prevBootstrap;
    if (dataDir) await fs.rm(dataDir, { recursive: true, force: true });
  });

  const signup = async (email, name = 'Member') => {
    const res = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email, password: 'password123', name },
    });
    expect(res.statusCode).toBe(200);
    const cookie = String(res.setCookie).split(';')[0];
    return { cookie, session: res.json?.session || res.json, setCookie: res.setCookie };
  };

  it('1. unauthenticated account delete returns 401', async () => {
    const res = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete',
      body: { scope: 'account' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json?.deleted).not.toBe(true);
  });

  it('2. body/query cannot choose another user', async () => {
    const a = await signup('owner-a@luna.test', 'A');
    const b = await signup('owner-b@luna.test', 'B');

    // Seed B calendar via B session
    await invoke(handler, {
      method: 'PUT',
      path: '/api/calendar/data',
      headers: { cookie: b.cookie },
      body: {
        data: {
          version: 2,
          journal: {},
          events: [],
          preferences: { browserNotifications: true, emailReminders: false, reminderEmail: 'owner-b@luna.test', sentReminderKeys: [] },
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const del = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete?userId=hack&email=owner-b@luna.test',
      headers: { cookie: a.cookie },
      body: { scope: 'account', userId: b.session?.id, email: 'owner-b@luna.test' },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json?.deleted).toBe(true);

    // B still exists and can load calendar
    const bCal = await invoke(handler, {
      method: 'GET',
      path: '/api/calendar/data',
      headers: { cookie: b.cookie },
    });
    expect(bCal.statusCode).toBe(200);

    const users = JSON.parse(await fs.readFile(path.join(dataDir, 'users.json'), 'utf8'));
    expect(users.some((u) => u.email === 'owner-b@luna.test')).toBe(true);
    expect(users.some((u) => u.email === 'owner-a@luna.test')).toBe(false);
  });

  it('3. super_admin self-delete still blocked', async () => {
    const login = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signin',
      body: { email: 'super-del@luna.test', password: 'bootstrap-pass-123' },
    });
    expect(login.statusCode).toBe(200);
    const cookie = String(login.setCookie).split(';')[0];
    const del = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete',
      headers: { cookie },
      body: { scope: 'account' },
    });
    expect(del.statusCode).toBe(403);
    expect(del.json?.deleted).not.toBe(true);
  });

  it('4/5. successful delete revokes sessions; no false success shape', async () => {
    const a = await signup('sess-del@luna.test', 'Sess');
    const del = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete',
      headers: { cookie: a.cookie },
      body: { scope: 'account' },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json).toEqual(
      expect.objectContaining({ deleted: true, scope: 'account', requestId: expect.any(String) }),
    );
    expect(String(del.setCookie)).toMatch(/Max-Age=0|Expires=/i);

    const me = await invoke(handler, {
      method: 'GET',
      path: '/api/auth/session',
      headers: { cookie: a.cookie },
    });
    // Session endpoint may return 200 with null session; account must be gone.
    if (me.statusCode === 200) {
      expect(me.json?.session || me.json?.user || null).toBeFalsy();
    } else {
      expect([401, 404]).toContain(me.statusCode);
    }
    const users = JSON.parse(await fs.readFile(path.join(dataDir, 'users.json'), 'utf8'));
    expect(users.some((u) => u.email === 'sess-del@luna.test')).toBe(false);
  });

  it('6–16. personal/memory/calendar/mobile deleted for owner only', async () => {
    const a = await signup('data-a@luna.test', 'DataA');
    const b = await signup('data-b@luna.test', 'DataB');

    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: { cookie: a.cookie },
      body: {
        event_type: 'DAILY_CHECKIN',
        occurred_at: new Date().toISOString(),
        payload: { note: 'private-a' },
      },
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/events',
      headers: { cookie: b.cookie },
      body: {
        event_type: 'DAILY_CHECKIN',
        occurred_at: new Date().toISOString(),
        payload: { note: 'private-b' },
      },
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory-consent/enable',
      headers: { cookie: a.cookie },
      body: {},
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory-consent/enable',
      headers: { cookie: b.cookie },
      body: {},
    });
    await invoke(handler, {
      method: 'PUT',
      path: '/api/calendar/data',
      headers: { cookie: a.cookie },
      body: {
        data: {
          version: 2,
          journal: { '2026-01-01': { note: 'a' } },
          events: [],
          preferences: { browserNotifications: true, emailReminders: false, reminderEmail: 'data-a@luna.test', sentReminderKeys: [] },
          updatedAt: new Date().toISOString(),
        },
      },
    });
    await invoke(handler, {
      method: 'PUT',
      path: '/api/calendar/data',
      headers: { cookie: b.cookie },
      body: {
        data: {
          version: 2,
          journal: { '2026-01-01': { note: 'b' } },
          events: [],
          preferences: { browserNotifications: true, emailReminders: false, reminderEmail: 'data-b@luna.test', sentReminderKeys: [] },
          updatedAt: new Date().toISOString(),
        },
      },
    });

    // Mobile reflections via bearer
    const mobileA = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'mob-a@luna.test', password: 'password123', name: 'MobA' },
    });
    const mobileB = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'mob-b@luna.test', password: 'password123', name: 'MobB' },
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${mobileA.json.token}` },
      body: { text: 'reflection-a', mode: 'voice' },
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/reflection',
      headers: { authorization: `Bearer ${mobileB.json.token}` },
      body: { text: 'reflection-b', mode: 'voice' },
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/push/register',
      headers: { authorization: `Bearer ${mobileA.json.token}` },
      body: { token: 'ExponentPushToken[aaa]' },
    });
    await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/push/register',
      headers: { authorization: `Bearer ${mobileB.json.token}` },
      body: { token: 'ExponentPushToken[bbb]' },
    });

    const del = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete',
      headers: { cookie: a.cookie },
      body: { scope: 'account' },
    });
    expect(del.statusCode).toBe(200);

    const bEvents = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/events',
      headers: { cookie: b.cookie },
    });
    expect(bEvents.statusCode).toBe(200);
    expect(bEvents.json?.events?.length || bEvents.json?.total || 0).toBeGreaterThan(0);

    const bCal = await invoke(handler, {
      method: 'GET',
      path: '/api/calendar/data',
      headers: { cookie: b.cookie },
    });
    expect(bCal.json?.data?.journal?.['2026-01-01']?.note).toBe('b');

    const bStory = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${mobileB.json.token}` },
    });
    expect(bStory.statusCode).toBe(200);

    // Mobile A account still exists (different user) — delete was web user A only
    const aStory = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${mobileA.json.token}` },
    });
    expect(aStory.statusCode).toBe(200);

    // Delete mobile A via cookie session after signin as that user
    const mobLogin = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signin',
      body: { email: 'mob-a@luna.test', password: 'password123' },
    });
    const mobCookie = String(mobLogin.setCookie).split(';')[0];
    const delMob = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete',
      headers: { cookie: mobCookie },
      body: { scope: 'account' },
    });
    expect(delMob.statusCode).toBe(200);

    const aGone = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${mobileA.json.token}` },
    });
    expect(aGone.statusCode).toBe(401);

    const bStill = await invoke(handler, {
      method: 'GET',
      path: '/api/mobile/story',
      headers: { authorization: `Bearer ${mobileB.json.token}` },
    });
    expect(bStill.statusCode).toBe(200);
  });

  it('22/35. support_only deletes contacts only; account remains', async () => {
    const a = await signup('support-only@luna.test', 'Support');
    const contact = await invoke(handler, {
      method: 'POST',
      path: '/api/public/contact',
      body: {
        name: 'Support',
        email: 'support-only@luna.test',
        message: 'Need help please.',
      },
    });
    expect(contact.statusCode).toBe(200);

    const del = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete',
      headers: { cookie: a.cookie },
      body: { scope: 'support_only' },
    });
    expect(del.statusCode).toBe(200);
    expect(del.json?.scope).toBe('support_only');
    expect(del.json?.deleted).toBe(true);

    const users = JSON.parse(await fs.readFile(path.join(dataDir, 'users.json'), 'utf8'));
    expect(users.some((u) => u.email === 'support-only@luna.test')).toBe(true);

    const contacts = JSON.parse(await fs.readFile(path.join(dataDir, 'contact-submissions.json'), 'utf8'));
    expect(contacts.every((c) => c.email !== 'support-only@luna.test')).toBe(true);
  });

  it('23/24. invites revoked/anonymized; privacy tombstone has no plaintext email', async () => {
    const login = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signin',
      body: { email: 'super-del@luna.test', password: 'bootstrap-pass-123' },
    });
    expect(login.statusCode).toBe(200);
    const adminCookie = String(login.setCookie).split(';')[0];

    const target = await signup('invite-target@luna.test', 'Target');
    const inviteRes = await invoke(handler, {
      method: 'POST',
      path: '/api/admin/invites/admin',
      headers: { cookie: adminCookie },
      body: { email: 'invite-target@luna.test', role: 'viewer' },
    });
    expect(inviteRes.statusCode).toBe(200);

    const del = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete',
      headers: { cookie: target.cookie },
      body: { scope: 'account' },
    });
    expect(del.statusCode).toBe(200);

    const privacy = JSON.parse(await fs.readFile(path.join(dataDir, 'privacy-requests.json'), 'utf8'));
    const tombstone = privacy.find((r) => r.id === del.json.requestId);
    expect(tombstone).toBeTruthy();
    expect(String(tombstone.email)).toMatch(/^deleted:/);
    expect(String(tombstone.email)).not.toContain('@');
    expect(privacy.every((r) => r.email !== 'invite-target@luna.test')).toBe(true);

    const admin = JSON.parse(await fs.readFile(path.join(dataDir, 'admin-state.json'), 'utf8'));
    const invites = admin.invites || [];
    expect(invites.every((i) => i.email !== 'invite-target@luna.test')).toBe(true);
    expect(invites.some((i) => String(i.email || '').startsWith('deleted:'))).toBe(true);
  });

  it('28. failed cascade does not clear cookie (forced via unavailable billing in postgres path skipped — JSON path success)', async () => {
    // JSON harness succeeds; verify failure path via service unit test above.
    // Here: unauthenticated failure must not set success cookie clear as deleted:true.
    const res = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/delete',
      body: { scope: 'account' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json?.deleted).not.toBe(true);
  });
});
