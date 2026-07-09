import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';
import { __resetOperationalMetricsForTests, getOperationalCounter, OPS } from '../../server/core/operationalMetrics.mjs';

const invoke = async (handler, { method = 'GET', path: reqPath = '/', headers = {}, body, ip = '127.0.0.1' } = {}) => {
  const chunks = [];
  let statusCode = 0;
  let responseHeaders = {};
  const req = {
    method,
    url: reqPath,
    headers: {
      host: 'localhost',
      'x-forwarded-for': ip,
      ...headers,
    },
    async *[Symbol.asyncIterator]() {
      if (body == null) return;
      const raw = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
      yield raw;
    },
  };
  const res = {
    writeHead(code, hdrs) {
      statusCode = code;
      responseHeaders = hdrs || {};
    },
    end(payload) {
      if (payload != null) chunks.push(Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload)));
    },
    on() {},
  };
  // Support finish listeners used by observability wrapper
  const listeners = {};
  res.on = (event, fn) => {
    listeners[event] = listeners[event] || [];
    listeners[event].push(fn);
  };
  const originalEnd = res.end.bind(res);
  res.end = (payload) => {
    originalEnd(payload);
    for (const fn of listeners.finish || []) fn();
  };

  await handler(req, res);
  const raw = Buffer.concat(chunks).toString('utf8');
  let json = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }
  return { statusCode, headers: responseHeaders, body: raw, json };
};

describe('production operations readiness', () => {
  let dataDir;
  let prevEnv;
  let logSpy;
  let warnSpy;
  let errorSpy;
  let logs;

  beforeEach(async () => {
    prevEnv = { ...process.env };
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna-ops-'));
    process.env.NODE_ENV = 'test';
    delete process.env.VERCEL_ENV;
    delete process.env.DATABASE_URL;
    delete process.env.HEALTH_VERBOSE_SECRET;
    process.env.AUTH_ALLOWED_ORIGINS = 'http://localhost';
    process.env.SUPER_ADMIN_EMAILS = 'super@luna.test';
    process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD = 'bootstrap-pass-123';
    __resetMemoryRateLimitForTests();
    __resetOperationalMetricsForTests();
    logs = [];
    logSpy = vi.spyOn(console, 'info').mockImplementation((...args) => {
      logs.push(args.map(String).join(' '));
    });
    warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args) => {
      logs.push(args.map(String).join(' '));
    });
    errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      logs.push(args.map(String).join(' '));
    });
    vi.resetModules();
  });

  afterEach(async () => {
    process.env = prevEnv;
    logSpy?.mockRestore();
    warnSpy?.mockRestore();
    errorSpy?.mockRestore();
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true }).catch(() => {});
  });

  it('1-3. request id generated, unsafe rejected, returned', async () => {
    const { resolveRequestId, isSafeRequestId } = await import('../../server/core/requestObservability.mjs');
    expect(isSafeRequestId('bad id with spaces')).toBe(false);
    expect(isSafeRequestId('ok-id_123.ABC')).toBe(true);
    expect(resolveRequestId('not safe!!!')).toMatch(/^[a-f0-9]{32}$/);
    expect(resolveRequestId('safe-request-id-01')).toBe('safe-request-id-01');

    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const generated = await invoke(handler, { method: 'GET', path: '/api/health' });
    expect(generated.headers['x-request-id']).toMatch(/^[a-f0-9]{32}$/);
    const echoed = await invoke(handler, {
      method: 'GET',
      path: '/api/health',
      headers: { 'x-request-id': 'client-req-id-abc' },
    });
    expect(echoed.headers['x-request-id']).toBe('client-req-id-abc');
    const rejected = await invoke(handler, {
      method: 'GET',
      path: '/api/health',
      headers: { 'x-request-id': 'evil\r\ninject' },
    });
    expect(rejected.headers['x-request-id']).not.toContain('\r');
    expect(rejected.headers['x-request-id']).toMatch(/^[a-f0-9]{32}$/);
  });

  it('4. 500 response no stack in production-like normalize', async () => {
    const { normalizePublicError } = await import('../../server/core/serverErrorReporter.mjs');
    const err = new Error('boom');
    err.stack = 'Error: boom\n    at secret.js:1';
    const body = normalizePublicError({
      status: 500,
      publicCode: 'internal_error',
      reasonCode: 'voice_internal_error',
      requestId: 'rid12345678',
      message: 'boom',
      isProductionLike: true,
      error: err,
    });
    expect(body.debug).toBeUndefined();
    expect(body.message).toBeUndefined();
    expect(body.request_id).toBe('rid12345678');
    expect(JSON.stringify(body)).not.toMatch(/secret\.js/);
  });

  it('5-7. logs never include Authorization, Cookie, or transcript', async () => {
    const { logRequestComplete } = await import('../../server/core/requestObservability.mjs');
    const { emitOperationalEvent } = await import('../../server/core/operationalMetrics.mjs');
    logRequestComplete({
      requestId: 'rid',
      method: 'POST',
      route: '/api/voice/respond',
      status: 200,
      latencyMs: 12,
    });
    emitOperationalEvent('voice_request', {
      transcript: 'THIS_MUST_NOT_APPEAR',
      authorization: 'Bearer SECRET',
      cookie: 'session=abc',
    });
    const joined = logs.join('\n');
    expect(joined).not.toMatch(/Authorization|Bearer SECRET|session=abc|THIS_MUST_NOT_APPEAR/i);
    expect(joined).not.toMatch(/Cookie/i);
  });

  it('8-10. public health minimal; verbose unauthorized/authorized in prod-like', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    process.env.HEALTH_VERBOSE_SECRET = 'ops-secret';
    delete process.env.DATABASE_URL;
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'vercel' });

    const pub = await invoke(handler, { method: 'GET', path: '/api/health' });
    expect(pub.statusCode).toBe(200);
    expect(pub.json?.status).toBe('alive');
    expect(pub.json?.checks).toBeUndefined();
    expect(pub.json?.config).toBeUndefined();

    const unauth = await invoke(handler, { method: 'GET', path: '/api/health?verbose=1' });
    expect(unauth.statusCode).toBe(401);

    const authz = await invoke(handler, {
      method: 'GET',
      path: '/api/health?verbose=1',
      headers: { 'x-luna-health-secret': 'ops-secret' },
    });
    expect(authz.statusCode).toBe(503);
    expect(authz.json?.checks).toBeTruthy();
    expect(authz.json?.config).toBeTruthy();
  });

  it('11-12. DB probe timeout and unavailable readiness', async () => {
    const { probePostgres } = await import('../../server/core/healthReadiness.mjs');
    process.env.DATABASE_URL = 'postgresql://example.invalid/db';
    const timed = await probePostgres({
      timeoutMs: 30,
      getPoolStatus: async () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ pool: { query: async () => ({}) }, category: 'ok' }), 500);
        }),
    });
    expect(timed.status).toBe('unavailable');
    expect(timed.reason).toBe('timeout');

    delete process.env.DATABASE_URL;
    const missing = await probePostgres({
      getPoolStatus: async () => ({ pool: null, category: 'database_missing' }),
    });
    expect(missing.status).toBe('unavailable');
  });

  it('13-14. rate limiter and stripe config readiness labels', async () => {
    const { probeRateLimiter, stripeConfigReadiness } = await import('../../server/core/healthReadiness.mjs');
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    const rl = await probeRateLimiter({ timeoutMs: 50 });
    expect(rl.status).toBe('unavailable');

    expect(stripeConfigReadiness({ billingEnabled: false, stripeConfigReady: false })).toBe('disabled');
    expect(stripeConfigReadiness({ billingEnabled: true, stripeConfigReady: false })).toBe('incomplete');
    expect(stripeConfigReadiness({ billingEnabled: true, stripeConfigReady: true })).toBe('configured');
  });

  it('15-16. webhook failed and stale processing visible', async () => {
    const { createMemoryStripeWebhookLedger, PROCESSING_RECLAIM_MS } = await import(
      '../../server/core/stripeWebhookEventsStore.mjs'
    );
    const ledger = createMemoryStripeWebhookLedger();
    await ledger.claimStripeWebhookEvent(null, { eventId: 'evt_fail', eventType: 'invoice.paid' });
    await ledger.markStripeWebhookEventFailed(null, 'evt_fail', 'projection_failed');
    await ledger.claimStripeWebhookEvent(null, { eventId: 'evt_stale', eventType: 'invoice.paid' });
    const row = ledger.rows.get('evt_stale');
    row.lastReceivedAt = new Date(Date.now() - PROCESSING_RECLAIM_MS - 1000).toISOString();

    const summary = await ledger.summarizeStripeWebhookOps(null);
    expect(summary.failed.some((e) => e.eventId === 'evt_fail')).toBe(true);
    expect(summary.staleProcessing.some((e) => e.eventId === 'evt_stale')).toBe(true);
    expect(summary.replayNote).toMatch(/not stored/i);
  });

  it('17. operational webhook endpoint admin-only', async () => {
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const anon = await invoke(handler, { method: 'GET', path: '/api/admin/ops/stripe-webhooks' });
    expect(anon.statusCode).toBe(401);

    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email: 'member@luna.test', password: 'password123', name: 'Member' },
    });
    expect(signup.statusCode).toBe(200);
    const setCookie = signup.headers['Set-Cookie'] || signup.headers['set-cookie'] || '';
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : String(setCookie);
    const sid = cookieHeader.split(';')[0];
    expect(sid).toMatch(/^luna_sid=/);
    const member = await invoke(handler, {
      method: 'GET',
      path: '/api/admin/ops/stripe-webhooks',
      headers: { cookie: sid },
    });
    // Default role is viewer — must not access webhook ops.
    expect(member.statusCode).toBe(403);
  });

  it('18-24. Gemini/ElevenLabs error classification; no raw body leak', async () => {
    vi.resetModules();
    __resetOperationalMetricsForTests();
    const voice = await import('../../server/voiceConversation.mjs');
    expect(voice.classifyProviderError(Object.assign(new Error('timeout'), { name: 'TimeoutError' }), 'gemini').publicCode).toBe(
      'gemini_timeout',
    );
    expect(voice.classifyProviderError(new Error('429 rate limit'), 'gemini').publicCode).toBe('gemini_rate_limited');
    expect(voice.classifyProviderError(new Error('503 unavailable'), 'gemini').publicCode).toBe('gemini_unavailable');
    expect(voice.classifyProviderError(Object.assign(new Error('timeout'), { name: 'TimeoutError' }), 'elevenlabs').publicCode).toBe(
      'elevenlabs_timeout',
    );
    expect(voice.classifyProviderError(new Error('429'), 'elevenlabs').publicCode).toBe('elevenlabs_rate_limited');
    expect(voice.classifyProviderError(new Error('500 boom'), 'elevenlabs').publicCode).toBe('elevenlabs_unavailable');

    process.env.ELEVENLABS_API_KEY = 'test-key';
    vi.resetModules();
    const { synthesizeElevenLabs } = await import('../../server/voiceConversation.mjs');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'RAW_PROVIDER_SECRET_BODY_SHOULD_NOT_LEAK',
      arrayBuffer: async () => new ArrayBuffer(0),
    });
    await expect(synthesizeElevenLabs({ text: 'hello', personaId: 'luna', lang: 'en' })).rejects.toMatchObject({
      code: expect.stringMatching(/elevenlabs_/),
    });
    const joined = logs.join('\n');
    expect(joined).not.toMatch(/RAW_PROVIDER_SECRET_BODY/);
    fetchSpy.mockRestore();
  });

  it('25. voice latency event emitted', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
    delete process.env.ELEVENLABS_API_KEY;
    vi.resetModules();
    __resetOperationalMetricsForTests();
    const { handleVoiceConversation } = await import('../../server/voiceConversation.mjs');
    const { getOperationalCounter: getCount, OPS: ops } = await import('../../server/core/operationalMetrics.mjs');
    const result = await handleVoiceConversation({ transcript: 'hello', withAudio: false });
    expect(result.text).toBeTruthy();
    expect(getCount(ops.VOICE_REQUEST)).toBeGreaterThan(0);
    expect(getCount(ops.VOICE_LATENCY)).toBeGreaterThan(0);
  });

  it('26. account deletion failure event emitted', async () => {
    vi.resetModules();
    __resetOperationalMetricsForTests();
    const { createAccountDeletionOrchestrator } = await import('../../server/core/accountDeletionOrchestrator.mjs');
    const { createMemoryDeletionOpsLedger } = await import('../../server/core/accountDeletionOpsStore.mjs');
    const { getOperationalCounter: getCount, OPS: ops } = await import('../../server/core/operationalMetrics.mjs');
    const memoryOps = createMemoryDeletionOpsLedger();
    const orch = createAccountDeletionOrchestrator({
      mode: 'json',
      pool: null,
      memoryOps,
      stripeRequest: async () => ({ ok: true, status: 200, data: {} }),
      billingEnabled: false,
      getStripeCustomerIdForUser: async () => null,
      getStatusForUser: async () => ({ billing: {} }),
    });
    const result = await orch.runAccountDeletion({
      user: { id: 'u1', email: 'u1@test.com' },
      jsonCascadeContext: null,
    });
    expect(result.ok).toBe(false);
    expect(getCount(ops.ACCOUNT_DELETION_STARTED)).toBeGreaterThan(0);
    expect(getCount(ops.ACCOUNT_DELETION_LOCAL_FAILED)).toBeGreaterThan(0);
  });

  it('27. verifier source never prints secret assignment values', async () => {
    const src = await fs.readFile(path.join(process.cwd(), 'scripts/verify-production-env.mjs'), 'utf8');
    expect(src).toMatch(/assertNoSecretLeak/);
    expect(src).toMatch(/Never print secret/);
    expect(src).not.toMatch(/console\.log\([^)]*STRIPE_SECRET_KEY[^)]*\+/);
  });

  it('28. no random health metrics in admin metrics check source', async () => {
    const src = await fs.readFile(path.join(process.cwd(), 'server/admin/router.mjs'), 'utf8');
    expect(src).not.toMatch(/technicalMetrics\.apiP95 \+ \(Math\.random/);
    expect(src).toMatch(/no synthetic/);
  });
});
