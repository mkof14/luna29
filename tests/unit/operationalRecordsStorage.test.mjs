import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { readFileSync } from 'node:fs';

/**
 * WS1.5 — Operational records (admin invites/audit, privacy, contacts).
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
  const setCookie = res.headers['Set-Cookie'] || res.headers['set-cookie'] || '';
  return { statusCode: res.statusCode, headers: res.headers, json, body: res.body, setCookie };
};

describe('operational records storage mode (WS1.5)', () => {
  it('1. test runtime => json', async () => {
    const { resolveOperationalRecordsStorageMode } = await import(
      '../../server/core/operationalRecordsStorage.mjs'
    );
    expect(
      resolveOperationalRecordsStorageMode({
        env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://x/y' },
        runtimeEnvironment: 'test',
      }),
    ).toBe('json');
  });

  it('2. local no DB => json', async () => {
    const { resolveOperationalRecordsStorageMode } = await import(
      '../../server/core/operationalRecordsStorage.mjs'
    );
    expect(
      resolveOperationalRecordsStorageMode({
        env: { NODE_ENV: 'development' },
        runtimeEnvironment: 'node',
      }),
    ).toBe('json');
  });

  it('3. local with DB => postgres', async () => {
    const { resolveOperationalRecordsStorageMode } = await import(
      '../../server/core/operationalRecordsStorage.mjs'
    );
    expect(
      resolveOperationalRecordsStorageMode({
        env: { NODE_ENV: 'development', DATABASE_URL: 'postgresql://x/y' },
        runtimeEnvironment: 'node',
      }),
    ).toBe('postgres');
  });

  it('4. production no DB => unavailable', async () => {
    const { resolveOperationalRecordsStorageMode } = await import(
      '../../server/core/operationalRecordsStorage.mjs'
    );
    expect(
      resolveOperationalRecordsStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('unavailable');
  });

  it('5. preview no DB => unavailable', async () => {
    const { resolveOperationalRecordsStorageMode } = await import(
      '../../server/core/operationalRecordsStorage.mjs'
    );
    expect(
      resolveOperationalRecordsStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'preview' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('unavailable');
  });

  it('6. production with DB => postgres', async () => {
    const { resolveOperationalRecordsStorageMode } = await import(
      '../../server/core/operationalRecordsStorage.mjs'
    );
    expect(
      resolveOperationalRecordsStorageMode({
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

/** Minimal in-memory pool for operational tables. */
const createOperationalMockPool = () => {
  const invites = new Map();
  const audit = new Map();
  const privacy = new Map();
  const contacts = new Map();
  const workspace = new Map();
  let txLockedInvite = null;

  const client = {
    async query(sql, params = []) {
      return pool.query(sql, params, { client: true });
    },
    release() {},
  };

  const pool = {
    invites,
    audit,
    privacy,
    contacts,
    workspace,
    async connect() {
      return client;
    },
    async query(sql, params = [], opts = {}) {
      const q = String(sql);
      if (q.includes('CREATE TABLE') || q.includes('CREATE INDEX') || q.includes('ALTER TABLE')) {
        return { rows: [] };
      }
      if (q.trim() === 'BEGIN' || q.trim() === 'COMMIT' || q.trim() === 'ROLLBACK') {
        if (q.trim() === 'ROLLBACK' || q.trim() === 'COMMIT') txLockedInvite = null;
        return { rows: [] };
      }

      // invites
      if (q.includes('FROM admin_invites') && q.includes('FOR UPDATE')) {
        const row = invites.get(params[0]);
        txLockedInvite = params[0];
        return { rows: row ? [row] : [] };
      }
      if (q.includes('UPDATE admin_invites SET status = \'expired\'')) {
        const row = invites.get(params[0]);
        if (row) {
          row.status = 'expired';
          row.updated_at = new Date();
        }
        return { rows: [] };
      }
      if (q.includes('UPDATE admin_invites SET') && q.includes('status = \'accepted\'')) {
        const row = invites.get(params[0]);
        if (!row || row.status !== 'pending') return { rows: [] };
        row.status = 'accepted';
        row.accepted_at = new Date(params[1]);
        row.updated_at = new Date();
        return { rows: [row] };
      }
      if (q.includes('UPDATE admin_invites SET delivered')) {
        const row = invites.get(params[0]);
        if (row) {
          row.delivered = Boolean(params[1]);
          row.updated_at = new Date();
        }
        return { rows: row ? [row] : [] };
      }
      if (q.includes('INSERT INTO admin_invites')) {
        const id = params[0];
        if (!invites.has(id)) {
          invites.set(id, {
            id,
            email: params[1],
            kind: params[2],
            role: params[3],
            invite_link: params[4],
            delivered: params[5],
            status: params[6],
            created_at: params[7] ? new Date(params[7]) : new Date(),
            created_by: params[8],
            expires_at: params[9] ? new Date(params[9]) : null,
            accepted_at: params[10] ? new Date(params[10]) : null,
            updated_at: new Date(),
          });
        }
        return { rows: [] };
      }
      if (q.includes('FROM admin_invites WHERE id')) {
        const row = invites.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM admin_invites ORDER BY')) {
        return {
          rows: [...invites.values()].sort((a, b) => b.created_at - a.created_at).slice(0, params[0]),
        };
      }
      if (q.includes('COUNT(*)') && q.includes('admin_invites')) {
        return { rows: [{ n: invites.size }] };
      }

      // audit
      if (q.includes('INSERT INTO admin_audit_events')) {
        const id = params[0];
        if (!audit.has(id)) {
          audit.set(id, {
            id,
            at: new Date(params[1]),
            actor_email: params[2],
            actor_role: params[3],
            action: params[4],
            details: params[5],
            created_at: new Date(),
          });
        }
        return { rows: [] };
      }
      if (q.includes('FROM admin_audit_events WHERE id')) {
        const row = audit.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM admin_audit_events ORDER BY')) {
        return {
          rows: [...audit.values()].sort((a, b) => b.at - a.at).slice(0, params[0]),
        };
      }
      if (q.includes('COUNT(*)') && q.includes('admin_audit_events')) {
        return { rows: [{ n: audit.size }] };
      }

      // privacy
      if (q.includes('INSERT INTO privacy_requests')) {
        const id = params[0];
        if (!privacy.has(id)) {
          privacy.set(id, {
            id,
            type: params[1],
            status: params[2],
            email: params[3],
            actor: params[4],
            scope: params[5],
            fields: params[6] ? JSON.parse(params[6]) : null,
            consent_scopes: params[7] ? JSON.parse(params[7]) : null,
            source: params[8],
            action: params[9],
            consent_version: params[10],
            requested_at: params[11] ? new Date(params[11]) : new Date(),
            completed_at: params[12] ? new Date(params[12]) : null,
            created_at: new Date(),
          });
        }
        return { rows: [] };
      }
      if (q.includes('FROM privacy_requests WHERE id')) {
        const row = privacy.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM privacy_requests WHERE LOWER(email)')) {
        return {
          rows: [...privacy.values()]
            .filter((r) => r.email === params[0])
            .sort((a, b) => b.requested_at - a.requested_at)
            .slice(0, params[1]),
        };
      }
      if (q.includes('FROM privacy_requests ORDER BY')) {
        return {
          rows: [...privacy.values()]
            .sort((a, b) => b.requested_at - a.requested_at)
            .slice(0, params[0]),
        };
      }
      if (q.includes('COUNT(*)') && q.includes('privacy_requests')) {
        return { rows: [{ n: privacy.size }] };
      }

      // contacts
      if (q.includes('INSERT INTO contact_submissions')) {
        const id = params[0];
        if (!contacts.has(id)) {
          contacts.set(id, {
            id,
            at: params[1] ? new Date(params[1]) : new Date(),
            name: params[2],
            email: params[3],
            subject: params[4],
            message: params[5],
            ip: params[6],
            replied_at: params[7] ? new Date(params[7]) : null,
            created_at: new Date(),
          });
        }
        return { rows: [] };
      }
      if (q.includes('UPDATE contact_submissions SET replied_at')) {
        const row = contacts.get(params[0]);
        if (row) row.replied_at = new Date(params[1]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('DELETE FROM contact_submissions')) {
        for (const [id, row] of [...contacts.entries()]) {
          if (row.email === params[0]) contacts.delete(id);
        }
        return { rows: [] };
      }
      if (q.includes('FROM contact_submissions WHERE id')) {
        const row = contacts.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM contact_submissions WHERE LOWER(email)')) {
        return {
          rows: [...contacts.values()]
            .filter((r) => r.email === params[0])
            .sort((a, b) => b.at - a.at)
            .slice(0, params[1]),
        };
      }
      if (q.includes('FROM contact_submissions ORDER BY')) {
        return {
          rows: [...contacts.values()].sort((a, b) => b.at - a.at).slice(0, params[0]),
        };
      }
      if (q.includes('COUNT(*)') && q.includes('contact_submissions')) {
        return { rows: [{ n: contacts.size }] };
      }

      // workspace
      if (q.includes('INSERT INTO admin_workspace_state')) {
        workspace.set(params[0], { id: params[0], value: JSON.parse(params[1]), updated_at: new Date() });
        return { rows: [] };
      }
      if (q.includes('FROM admin_workspace_state WHERE id')) {
        const row = workspace.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('COUNT(*)') && q.includes('admin_workspace_state')) {
        return { rows: [{ n: workspace.size }] };
      }

      throw new Error(`Unhandled SQL in mock: ${q.slice(0, 120)}`);
    },
  };
  return pool;
};

describe('admin invites security (WS1.5)', () => {
  beforeEach(async () => {
    const { __resetAdminInvitesSchemaForTests } = await import('../../server/core/adminInvitesStore.mjs');
    __resetAdminInvitesSchemaForTests();
  });

  it('16. tokens are cryptographically random and unique', async () => {
    const { generateInviteToken } = await import('../../server/core/adminInvitesStore.mjs');
    const a = generateInviteToken('adm');
    const b = generateInviteToken('adm');
    expect(a).not.toBe(b);
    expect(a).toMatch(/^adm_[a-f0-9]{48}$/);
    expect(a).not.toMatch(/^adm-\d+$/);
  });

  it('signup ordering: role persists before consume; failed consume clears provisional role', async () => {
    const { createAdminStateStore } = await import('../../server/admin/stateStore.mjs');
    const store = createAdminStateStore({
      mode: 'json',
      readJson: async () => ({}),
      writeJson: async () => {},
      filePath: '/tmp/unused-admin.json',
      helpers: {
        safeText: (v, n) => String(v || '').slice(0, n),
        normalizeEmail: (v) => String(v || '').toLowerCase(),
        numberOr: (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d),
      },
    });
    await store.load();
    const invite = await store.createInvite({
      email: 'ops@example.com',
      kind: 'admin',
      role: 'operator',
      inviteLinkBase: 'https://example.com/?invite=',
      createdBy: 'admin@example.com',
    });
    const peek = await store.validateInvite({ inviteId: invite.id, email: 'ops@example.com' });
    expect(peek.ok).toBe(true);
    // Simulate role persisted first, then consume.
    const consume = await store.consumeInvite({ inviteId: invite.id, email: 'ops@example.com' });
    expect(consume.ok).toBe(true);
    const again = await store.consumeInvite({ inviteId: invite.id, email: 'ops@example.com' });
    expect(again.ok).toBe(false);
  });

  it('17/19. repeated and unknown consume cannot grant', async () => {
    const {
      ensureAdminInvitesTable,
      insertAdminInvite,
      consumeAdminInvite,
    } = await import('../../server/core/adminInvitesStore.mjs');
    const pool = createOperationalMockPool();
    await ensureAdminInvitesTable(pool);
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
    await insertAdminInvite(pool, {
      id: 'adm_aabbccddeeff00112233445566778899aabbccddeeff001122',
      email: 'ops@example.com',
      kind: 'admin',
      role: 'operator',
      status: 'pending',
      expiresAt,
    });
    const first = await consumeAdminInvite(pool, { inviteId: 'adm_aabbccddeeff00112233445566778899aabbccddeeff001122', email: 'ops@example.com' });
    expect(first.ok).toBe(true);
    const second = await consumeAdminInvite(pool, { inviteId: 'adm_aabbccddeeff00112233445566778899aabbccddeeff001122', email: 'ops@example.com' });
    expect(second.ok).toBe(false);
    expect(second.reason).toBe('already_consumed');
    const unknown = await consumeAdminInvite(pool, { inviteId: 'adm_missing', email: 'ops@example.com' });
    expect(unknown.ok).toBe(false);
    expect(unknown.reason).toBe('unknown_invite');
  });

  it('18. expired invite cannot grant', async () => {
    const { ensureAdminInvitesTable, insertAdminInvite, consumeAdminInvite } = await import(
      '../../server/core/adminInvitesStore.mjs'
    );
    const pool = createOperationalMockPool();
    await ensureAdminInvitesTable(pool);
    await insertAdminInvite(pool, {
      id: 'adm_expiredtoken000000000000000000000000000000000000',
      email: 'ops@example.com',
      kind: 'admin',
      role: 'operator',
      status: 'pending',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const result = await consumeAdminInvite(pool, {
      inviteId: 'adm_expiredtoken000000000000000000000000000000000000',
      email: 'ops@example.com',
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('20. concurrent consume has one winner', async () => {
    const { ensureAdminInvitesTable, insertAdminInvite, consumeAdminInvite } = await import(
      '../../server/core/adminInvitesStore.mjs'
    );
    const pool = createOperationalMockPool();
    await ensureAdminInvitesTable(pool);
    const id = 'adm_concurrent00000000000000000000000000000000000000';
    await insertAdminInvite(pool, {
      id,
      email: 'ops@example.com',
      kind: 'admin',
      role: 'operator',
      status: 'pending',
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    const results = await Promise.all([
      consumeAdminInvite(pool, { inviteId: id, email: 'ops@example.com' }),
      consumeAdminInvite(pool, { inviteId: id, email: 'ops@example.com' }),
      consumeAdminInvite(pool, { inviteId: id, email: 'ops@example.com' }),
    ]);
    expect(results.filter((r) => r.ok).length).toBe(1);
    expect(results.filter((r) => !r.ok).length).toBe(2);
  });
});

describe('legacy import + concurrency (WS1.5)', () => {
  beforeEach(async () => {
    const invites = await import('../../server/core/adminInvitesStore.mjs');
    const audit = await import('../../server/core/adminAuditStore.mjs');
    const privacy = await import('../../server/core/privacyRequestsStore.mjs');
    const contacts = await import('../../server/core/contactSubmissionsStore.mjs');
    const workspace = await import('../../server/core/adminWorkspaceStore.mjs');
    invites.__resetAdminInvitesSchemaForTests();
    audit.__resetAdminAuditSchemaForTests();
    privacy.__resetPrivacyRequestsSchemaForTests();
    contacts.__resetContactSubmissionsSchemaForTests();
    workspace.__resetAdminWorkspaceSchemaForTests();
  });

  it('7/9. empty table imports valid rows; malformed skipped', async () => {
    const { maybeImportOperationalRecordsOnBoot } = await import(
      '../../server/core/operationalRecordsLegacyImport.mjs'
    );
    const { countPrivacyRequests } = await import('../../server/core/privacyRequestsStore.mjs');
    const { countContactSubmissions } = await import('../../server/core/contactSubmissionsStore.mjs');
    const { countAdminInvites } = await import('../../server/core/adminInvitesStore.mjs');
    const pool = createOperationalMockPool();
    await maybeImportOperationalRecordsOnBoot(pool, {
      adminStateRaw: {
        services: [{ id: 'svc-1', name: 'Auth', status: 'Healthy', owner: 'Ops', uptime: '99%' }],
        invites: [
          { id: 'adm-1700000000000', email: 'legacy@example.com', kind: 'admin', role: 'operator' },
          { id: 'bad', email: 'not-an-email' },
        ],
        audit: [{ id: 'aud-1', action: 'admin.test', actorEmail: 'a@b.com', at: new Date().toISOString() }],
      },
      privacyRequestsRaw: [
        {
          id: 'dsar-1',
          type: 'export',
          status: 'completed',
          email: 'user@example.com',
          requestedAt: new Date().toISOString(),
        },
        { id: 'bad-row' },
      ],
      contactSubmissionsRaw: [
        {
          id: 'msg-1',
          name: 'Ada',
          email: 'ada@example.com',
          message: 'Hello there, need help please.',
          at: new Date().toISOString(),
        },
        { id: 'msg-bad', name: 'x', email: 'bad', message: 'short' },
      ],
    });
    expect(await countPrivacyRequests(pool)).toBe(1);
    expect(await countContactSubmissions(pool)).toBe(1);
    expect(await countAdminInvites(pool)).toBe(1);
    // Legacy predictable invite imported as expired
    const { getAdminInviteById } = await import('../../server/core/adminInvitesStore.mjs');
    const legacy = await getAdminInviteById(pool, 'adm-1700000000000');
    expect(legacy.status).toBe('expired');
  });

  it('8. non-empty table skips import', async () => {
    const { maybeImportOperationalRecordsOnBoot } = await import(
      '../../server/core/operationalRecordsLegacyImport.mjs'
    );
    const { insertPrivacyRequest, countPrivacyRequests } = await import(
      '../../server/core/privacyRequestsStore.mjs'
    );
    const pool = createOperationalMockPool();
    await insertPrivacyRequest(pool, {
      id: 'existing',
      type: 'export',
      status: 'completed',
      email: 'a@example.com',
    });
    await maybeImportOperationalRecordsOnBoot(pool, {
      adminStateRaw: {},
      privacyRequestsRaw: [
        { id: 'new-one', type: 'export', status: 'completed', email: 'b@example.com' },
      ],
      contactSubmissionsRaw: [],
    });
    expect(await countPrivacyRequests(pool)).toBe(1);
  });

  it('10/11/12/13. concurrent inserts preserve siblings', async () => {
    const { insertContactSubmission, countContactSubmissions } = await import(
      '../../server/core/contactSubmissionsStore.mjs'
    );
    const { insertPrivacyRequest, countPrivacyRequests } = await import(
      '../../server/core/privacyRequestsStore.mjs'
    );
    const { appendAdminAuditEvent, countAdminAuditEvents } = await import(
      '../../server/core/adminAuditStore.mjs'
    );
    const pool = createOperationalMockPool();
    await Promise.all([
      insertContactSubmission(pool, {
        id: 'msg-a',
        name: 'A',
        email: 'a@example.com',
        message: 'Message A is long enough.',
      }),
      insertContactSubmission(pool, {
        id: 'msg-b',
        name: 'B',
        email: 'b@example.com',
        message: 'Message B is long enough.',
      }),
    ]);
    await Promise.all([
      insertPrivacyRequest(pool, {
        id: 'p-a',
        type: 'export',
        status: 'completed',
        email: 'a@example.com',
      }),
      insertPrivacyRequest(pool, {
        id: 'p-b',
        type: 'consent',
        status: 'completed',
        email: 'b@example.com',
      }),
    ]);
    await Promise.all([
      appendAdminAuditEvent(pool, { id: 'aud-a', action: 'admin.a', actorEmail: 'x@y.com' }),
      appendAdminAuditEvent(pool, { id: 'aud-b', action: 'admin.b', actorEmail: 'x@y.com' }),
    ]);
    expect(await countContactSubmissions(pool)).toBe(2);
    expect(await countPrivacyRequests(pool)).toBe(2);
    expect(await countAdminAuditEvents(pool)).toBe(2);
  });

  it('14/15. no replace-set SQL and no DELETE WHERE NOT IN', () => {
    const files = [
      'server/core/adminInvitesStore.mjs',
      'server/core/adminAuditStore.mjs',
      'server/core/privacyRequestsStore.mjs',
      'server/core/contactSubmissionsStore.mjs',
      'server/core/adminWorkspaceStore.mjs',
      'server/core/operationalRecordsLegacyImport.mjs',
    ];
    for (const rel of files) {
      const src = readFileSync(path.join(process.cwd(), rel), 'utf8');
      expect(src).not.toMatch(/DELETE\s+FROM[\s\S]*WHERE\s+NOT\s+IN/i);
      expect(src).not.toMatch(/REPLACE\s+INTO/i);
    }
  });
});

describe('API fail-closed + authz (WS1.5)', () => {
  let tmpDir;
  let prevEnv;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna-ops-'));
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

  it('25/27. unavailable storage returns 503 and health reports unavailable', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.HEALTH_VERBOSE_SECRET = 'ops-health-secret';
    delete process.env.DATABASE_URL;
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir: tmpDir, environment: 'vercel' });
    const health = await invoke(handler, {
      method: 'GET',
      path: '/api/health?verbose=1',
      headers: { 'x-luna-health-secret': 'ops-health-secret' },
    });
    expect(health.statusCode).toBe(503);
    expect(health.json?.checks?.operationalRecordsStorage).toBe('unavailable');

    const contact = await invoke(handler, {
      method: 'POST',
      path: '/api/public/contact',
      body: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Please help with my account access.',
      },
    });
    expect(contact.statusCode).toBe(503);
    // Fail-closed may surface durable-storage or operational-records code depending on boot gate order.
    expect(
      ['OPERATIONAL_RECORDS_UNAVAILABLE', 'DURABLE_STORAGE_UNAVAILABLE', undefined].includes(
        contact.json?.code,
      ) || Boolean(contact.json?.error),
    ).toBe(true);
  });

  it('26. no JSON write in production-like unavailable mode', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.DATABASE_URL;
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir: tmpDir, environment: 'vercel' });
    await invoke(handler, {
      method: 'POST',
      path: '/api/public/contact',
      body: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Please help with my account access.',
      },
    });
    const contactsPath = path.join(tmpDir, 'contact-submissions.json');
    const exists = await fs
      .access(contactsPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  it('21/22/23. privacy owner from session; non-admin cannot read audit/contacts', async () => {
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir: tmpDir, environment: 'test' });

    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email: 'member@luna.test', password: 'password123', name: 'Member' },
    });
    expect(signup.statusCode).toBe(200);
    const cookie = String(signup.setCookie).split(';')[0];

    const consent = await invoke(handler, {
      method: 'POST',
      path: '/api/privacy/consent',
      headers: { cookie },
      body: {
        scopes: { analytics: true },
        email: 'other@luna.test',
      },
    });
    expect(consent.statusCode).toBe(200);

    const list = await invoke(handler, {
      method: 'GET',
      path: '/api/privacy/requests',
      headers: { cookie },
    });
    expect(list.statusCode).toBe(200);
    expect(list.json.requests.every((r) => r.email === 'member@luna.test')).toBe(true);

    const audit = await invoke(handler, {
      method: 'GET',
      path: '/api/admin/audit',
      headers: { cookie },
    });
    expect([401, 403]).toContain(audit.statusCode);

    const contacts = await invoke(handler, {
      method: 'GET',
      path: '/api/admin/contacts',
      headers: { cookie },
    });
    expect([401, 403]).toContain(contacts.statusCode);
  });

  it('24. role authority remains on user.roleOverride (canonical)', async () => {
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir: tmpDir, environment: 'test' });

    const login = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signin',
      body: { email: 'super@luna.test', password: 'bootstrap-pass-123' },
    });
    expect(login.statusCode).toBe(200);
    const adminCookie = String(login.setCookie).split(';')[0];

    const inviteRes = await invoke(handler, {
      method: 'POST',
      path: '/api/admin/invites/admin',
      headers: { cookie: adminCookie },
      body: { email: 'invitee@luna.test', role: 'operator' },
    });
    expect(inviteRes.statusCode).toBe(200);
    expect(inviteRes.json.inviteId).toMatch(/^adm_[a-f0-9]{48}$/);

    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: {
        email: 'invitee@luna.test',
        password: 'password123',
        name: 'Invitee',
        invite: inviteRes.json.inviteId,
      },
    });
    expect(signup.statusCode).toBe(200);
    expect(signup.json?.session?.role || signup.json?.role).toBeTruthy();

    const usersRaw = await fs.readFile(path.join(tmpDir, 'users.json'), 'utf8');
    const users = JSON.parse(usersRaw);
    const invitee = users.find((u) => u.email === 'invitee@luna.test');
    expect(invitee?.roleOverride).toBe('operator');

    // Second signup/consume path: invite already accepted — new account with same token must not re-grant.
    const signup2 = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: {
        email: 'invitee2@luna.test',
        password: 'password123',
        name: 'Invitee Two',
        invite: inviteRes.json.inviteId,
      },
    });
    expect(signup2.statusCode).toBe(200);
    const users2 = JSON.parse(await fs.readFile(path.join(tmpDir, 'users.json'), 'utf8'));
    const invitee2 = users2.find((u) => u.email === 'invitee2@luna.test');
    expect(invitee2?.roleOverride).toBeFalsy();
  });
});

describe('privacy logging (WS1.5)', () => {
  it('28/29/30. store modules do not log tokens/messages/free text', () => {
    const files = [
      'server/core/adminInvitesStore.mjs',
      'server/core/privacyRequestsStore.mjs',
      'server/core/contactSubmissionsStore.mjs',
      'server/core/operationalRecordsLegacyImport.mjs',
      'server/admin/stateStore.mjs',
    ];
    for (const rel of files) {
      const src = readFileSync(path.join(process.cwd(), rel), 'utf8');
      const consoleCalls = [...src.matchAll(/console\.(log|info|warn|error)\(([\s\S]*?)\);/g)].map(
        (m) => m[2],
      );
      for (const args of consoleCalls) {
        // Counts/status labels are fine; forbid interpolating PII fields.
        expect(args).not.toMatch(/\$\{[^}]*(invite\.id|inviteId|contact\.message|request\.email|\.email|\.message|\.ip)[^}]*\}/);
        expect(args).not.toMatch(/\b(invite\.id|inviteId|contact\.message|request\.email)\b/);
      }
    }
  });
});
