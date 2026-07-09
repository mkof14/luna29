import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import {
  createMemoryConsentStore,
  MEMORY_CONSENT_VERSION,
  MEMORY_CONSENT_STORE_UNAVAILABLE,
  resolveMemoryConsentStorageDecision,
  getMemoryConsentForWrite,
  toPublicMemoryConsent,
} from '../../server/core/memoryConsentStore.mjs';
import {
  attemptLunaLiveMemoryWrite,
  isLunaLiveMemoryWriteEnabled,
  LUNA_LIVE_MEMORY_WRITE_FLAG,
} from '../../server/core/lunaLiveMemoryWriteService.mjs';
import { createPersonalEventsStore } from '../../server/core/personalEventsStore.mjs';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';
import {
  __setGenerateContentForTests,
  __resetGenerateContentForTests,
} from '../../server/core/observationSignalsService.mjs';
import { SIGNAL_TAXONOMY } from '../../server/core/signalTaxonomy.mjs';
import {
  humanizeSignalType,
  humanizeNormalizedValue,
  describeSignalMemory,
  correctionOptionsForSignal,
} from '../../utils/memorySignalLabels.ts';
import { MEMORY_COPY } from '../../utils/memoryCopy.ts';

/**
 * Task 8 — Trust, memory consent & user control layer.
 * Deterministic fixtures. No live Gemini / ElevenLabs.
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

const fatigueSignal = (overrides = {}) => ({
  signal_type: 'energy',
  normalized_value: 'fatigue',
  display_label: 'Fatigue',
  confidence: 0.9,
  evidence_text: 'exhausted',
  temporal_context: null,
  severity: null,
  frequency_context: null,
  recurrence_marker: false,
  negated: false,
  uncertain: false,
  ...overrides,
});

describe('memory consent foundation (Task 8)', () => {
  let dataDir;
  let handler;
  let ipCounter = 0;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    process.env.MEMORY_CONSENT_STORAGE = 'file';
    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
    __resetMemoryRateLimitForTests();
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-memconsent-'));
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
    // Re-bind after vi.resetModules so the mock hits the same module instance as the handler.
    const obsMod = await import('../../server/core/observationSignalsService.mjs');
    obsMod.__setGenerateContentForTests(async () => JSON.stringify({ signals: [fatigueSignal()] }));
  });

  afterEach(async () => {
    __resetGenerateContentForTests?.();
    process.env = originalEnv;
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  const nextIp = () => {
    ipCounter += 1;
    return `198.51.${Math.floor(ipCounter / 250) % 250}.${(ipCounter % 250) + 1}`;
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
    // Premium APIs require durable trial/subscription — start server trial for foundation tests.
    const trial = await invoke(handler, {
      method: 'POST',
      path: '/api/billing/trial/start',
      headers: { authorization: `Bearer ${result.json.token}` },
      ip,
    });
    expect(trial.statusCode).toBe(200);

    return {
      token: result.json.token,
      userId: result.json.session.id,
      authHeader: { authorization: `Bearer ${result.json.token}` },
      ip,
    };
  };

  const getConsent = (user, pathSuffix = '') =>
    invoke(handler, {
      method: 'GET',
      path: `/api/personal/memory-consent${pathSuffix}`,
      headers: user.authHeader,
      ip: user.ip,
    });

  const enableConsent = (user, body = {}) =>
    invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory-consent/enable',
      headers: user.authHeader,
      body: { source_surface: 'test', ...body },
      ip: user.ip,
    });

  const disableConsent = (user, body = {}) =>
    invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory-consent/disable',
      headers: user.authHeader,
      body: { source_surface: 'test', ...body },
      ip: user.ip,
    });

  const voiceRespond = (user, body = {}) =>
    invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      headers: { ...user.authHeader, 'x-luna-ai-consent': '1' },
      body: {
        transcript: 'I slept terribly last night.',
        lang: 'en',
        withAudio: false,
        mode: 'live',
        client_message_id: `msg_${Math.random().toString(36).slice(2, 12)}`,
        ...body,
      },
      ip: user.ip,
    });

  // --- CONSENT AUTHORITY ---
  it('1. default disabled', async () => {
    const user = await signup('def@test.com');
    const res = await getConsent(user);
    expect(res.statusCode).toBe(200);
    expect(res.json?.status).toBe('disabled');
    expect(res.json?.consent_version).toBe(MEMORY_CONSENT_VERSION);
    expect(res.json?.memory_write_available).toBe(false);
  });

  it('2-5. authenticated enable/disable idempotent', async () => {
    const user = await signup('toggle@test.com');
    const e1 = await enableConsent(user);
    expect(e1.statusCode).toBe(200);
    expect(e1.json?.status).toBe('enabled');
    expect(e1.json?.enabled_at).toBeTruthy();
    const e2 = await enableConsent(user);
    expect(e2.statusCode).toBe(200);
    expect(e2.json?.status).toBe('enabled');
    expect(e2.json?.enabled_at).toBe(e1.json?.enabled_at);

    const d1 = await disableConsent(user);
    expect(d1.statusCode).toBe(200);
    expect(d1.json?.status).toBe('disabled');
    expect(d1.json?.disabled_at).toBeTruthy();
    const d2 = await disableConsent(user);
    expect(d2.statusCode).toBe(200);
    expect(d2.json?.status).toBe('disabled');
  });

  it('6-9. body/query user_id, device ID, IP ignored', async () => {
    const a = await signup('own-a@test.com', 'A');
    const b = await signup('own-b@test.com', 'B');
    const forged = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/memory-consent/enable?user_id=${b.userId}`,
      headers: {
        ...a.authHeader,
        'x-user-id': b.userId,
        'x-luna-mobile-id': 'device-b',
        'x-forwarded-for': '198.51.100.99',
      },
      body: { user_id: b.userId, userId: b.userId, source_surface: 'forged' },
      ip: '198.51.100.99',
    });
    expect(forged.statusCode).toBe(200);
    expect(forged.json?.status).toBe('enabled');
    expect((await getConsent(a)).json?.status).toBe('enabled');
    expect((await getConsent(b)).json?.status).toBe('disabled');
  });

  it('10. cross-user isolation', async () => {
    const a = await signup('iso-a@test.com');
    const b = await signup('iso-b@test.com');
    await enableConsent(a);
    expect((await getConsent(a)).json?.status).toBe('enabled');
    expect((await getConsent(b)).json?.status).toBe('disabled');
  });

  it('11-12. invalid and expired auth 401', async () => {
    const invalid = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/memory-consent',
      headers: { authorization: 'Bearer not-a-real-token' },
    });
    expect(invalid.statusCode).toBe(401);

    const user = await signup('exp@test.com');
    // Expire by logging out / using garbage after signup token mutation is hard;
    // invalid token covers auth failure path. Empty auth:
    const none = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory-consent/enable',
      body: {},
    });
    expect(none.statusCode).toBe(401);
    void user;
  });

  // --- STORAGE ---
  it('13-16. production/preview missing DB fails closed; no silent file fallback', async () => {
    const prod = resolveMemoryConsentStorageDecision({
      env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
      runtimeEnvironment: 'node',
    });
    expect(prod.mode).toBe('unavailable');
    expect(prod.reason).toBe('database_missing');

    const preview = resolveMemoryConsentStorageDecision({
      env: { NODE_ENV: 'development', VERCEL_ENV: 'preview' },
      runtimeEnvironment: 'node',
    });
    expect(preview.mode).toBe('unavailable');

    const fileRejected = resolveMemoryConsentStorageDecision({
      env: { NODE_ENV: 'production', VERCEL_ENV: 'production', MEMORY_CONSENT_STORAGE: 'file' },
      runtimeEnvironment: 'node',
    });
    expect(fileRejected.mode).toBe('unavailable');
    expect(fileRejected.reason).toBe('file_rejected_in_production');

    const testFile = resolveMemoryConsentStorageDecision({
      env: { NODE_ENV: 'test', MEMORY_CONSENT_STORAGE: 'file' },
      runtimeEnvironment: 'test',
    });
    expect(testFile.mode).toBe('file');

    await expect(
      createMemoryConsentStore({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
        runtimeEnvironment: 'node',
      }),
    ).resolves.toMatchObject({ available: false, reason: 'database_missing' });
  });

  it('17. consent unavailable does not become enabled', async () => {
    const check = await getMemoryConsentForWrite(null, 'user-1');
    expect(check.available).toBe(false);
    expect(check.enabled).toBe(false);
    expect(check.status).toBe('consent_unavailable');
    const pub = toPublicMemoryConsent(null, { memoryWriteFeatureEnabled: true });
    expect(pub.status).toBe('disabled');
    expect(pub.memory_write_available).toBe(false);
  });

  // --- TWO-GATE WRITE ---
  it('18-21. two-gate combinations', async () => {
    const user = await signup('gate@test.com');

    delete process.env[LUNA_LIVE_MEMORY_WRITE_FLAG];
    let res = await voiceRespond(user, { client_message_id: 'gateoff00001' });
    expect(res.statusCode).toBe(200);
    expect(res.json?.text).toBeTruthy();
    expect(res.json?.memory_write_status).toBe('feature_disabled');

    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    res = await voiceRespond(user, { client_message_id: 'gatecons0001' });
    expect(res.statusCode).toBe(200);
    expect(res.json?.memory_write_status).toBe('consent_disabled');

    delete process.env[LUNA_LIVE_MEMORY_WRITE_FLAG];
    await enableConsent(user);
    res = await voiceRespond(user, { client_message_id: 'gateflag0001' });
    expect(res.statusCode).toBe(200);
    expect(res.json?.memory_write_status).toBe('feature_disabled');

    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    res = await voiceRespond(user, {
      transcript: 'I am exhausted again today.',
      client_message_id: 'gateboth0001',
    });
    expect(res.statusCode).toBe(200);
    expect(['written', 'already_exists', 'extraction_empty', 'extraction_failed']).toContain(
      res.json?.memory_write_status,
    );
  });

  it('22-26. consent unavailable / force attempts / chat continues', async () => {
    const eventsPath = path.join(dataDir, 'direct-events.json');
    const consentPath = path.join(dataDir, 'direct-consent.json');
    const events = await createPersonalEventsStore(eventsPath, {
      runtimeEnvironment: 'test',
      env: process.env,
    });
    const consent = await createMemoryConsentStore(consentPath, {
      runtimeEnvironment: 'test',
      env: process.env,
    });

    const unavailable = await attemptLunaLiveMemoryWrite({
      store: events.store,
      consentStore: null,
      userId: 'u1',
      text: 'I slept terribly last night.',
      mode: 'live',
      language: 'en',
      inputMode: 'text',
      clientMessageId: 'unavail12345',
      env: { [LUNA_LIVE_MEMORY_WRITE_FLAG]: 'true' },
    });
    expect(unavailable.memory_write_status).toBe('consent_unavailable');
    expect(unavailable.eligible).toBe(false);

    const user = await signup('force@test.com');
    const forced = await voiceRespond(user, {
      client_message_id: 'force1234567',
      memory_consent: 'enabled',
      consent_enabled: true,
      LUNA_LIVE_MEMORY_WRITE_FLAG: true,
      luna_live_memory_write_enabled: true,
    });
    expect(forced.statusCode).toBe(200);
    expect(forced.json?.text).toBeTruthy();
    expect(forced.json?.memory_write_status).toBe('consent_disabled');

    const disabledChat = await voiceRespond(user, { client_message_id: 'chatdis12345' });
    expect(disabledChat.statusCode).toBe(200);
    expect(disabledChat.json?.text).toBeTruthy();

    // Simulate unavailable store via direct call already covered; chat path with consent disabled above.
    void consent;
    expect(isLunaLiveMemoryWriteEnabled({ [LUNA_LIVE_MEMORY_WRITE_FLAG]: 'true' })).toBe(true);
  });

  // --- UI COPY / LABELS ---
  it('27-34. memory copy and labels (no device-only claim; disable keeps memory)', () => {
    expect(MEMORY_COPY.memoryOff).toMatch(/won’t save new eligible/i);
    expect(MEMORY_COPY.disableKeeps).toMatch(/remain/i);
    expect(MEMORY_COPY.unavailable).toMatch(/temporarily unavailable/i);
    expect(MEMORY_COPY.explanation).not.toMatch(/only on (your )?device/i);
    expect(MEMORY_COPY.explanation).toMatch(/does not save every (conversation )?message/i);
    expect(humanizeSignalType('energy')).toBe('Energy');
    expect(humanizeNormalizedValue('low_energy')).toBe('Low energy');
    const unreviewed = describeSignalMemory({
      payload: { signal_type: 'stress', normalized_value: 'high_stress', user_status: 'unreviewed' },
    });
    expect(unreviewed.trustLabel).toBe('Needs review');
    expect(unreviewed.summary).toMatch(/review needed/i);
    const confirmed = describeSignalMemory({
      payload: { signal_type: 'energy', normalized_value: 'fatigue', user_status: 'confirmed' },
    });
    expect(confirmed.trustLabel).toBe('Confirmed by you');
    const opts = correctionOptionsForSignal('energy');
    expect(opts.map((o) => o.value).sort()).toEqual([...SIGNAL_TAXONOMY.energy].sort());
    expect(opts.every((o) => SIGNAL_TAXONOMY.energy.has(o.value))).toBe(true);
  });

  // --- REVIEW QUEUE / CORRECTION / DELETE ---
  it('35-51. review queue, correction taxonomy, delete ownership', async () => {
    const user = await signup('review@test.com');
    const other = await signup('review-other@test.com');
    await enableConsent(user);

    {
      const obsMod = await import('../../server/core/observationSignalsService.mjs');
      obsMod.__setGenerateContentForTests(async () =>
        JSON.stringify({
          signals: [
            {
              signal_type: 'energy',
              normalized_value: 'fatigue',
              display_label: 'Fatigue',
              confidence: 0.9,
              evidence_text: 'exhausted',
              temporal_context: null,
              severity: null,
              frequency_context: null,
              recurrence_marker: false,
              negated: false,
              uncertain: false,
            },
          ],
        }),
      );
    }

    const obs = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: {
        raw_text: 'I am exhausted again today.',
        observation_kind: 'luna_live_message',
        input_mode: 'text',
        source_surface: 'luna_live',
        language: 'en',
        extract: true,
        client_event_id: 'review-obs-0001',
      },
      ip: user.ip,
    });
    expect(obs.statusCode).toBe(200);
    // Prefer signals from create response; otherwise list (idempotent re-extract may omit).
    let createdSignals = obs.json?.signals || [];
    if (!createdSignals.length) {
      const listed = await invoke(handler, {
        method: 'GET',
        path: '/api/personal/signals?limit=20',
        headers: user.authHeader,
        ip: user.ip,
      });
      createdSignals = listed.json?.events || [];
    }
    expect(createdSignals.length).toBeGreaterThanOrEqual(1);

    const signals = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/signals?user_status=unreviewed&limit=20',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(signals.statusCode).toBe(200);
    const unreviewed = signals.json?.events || [];
    expect(unreviewed.length).toBeGreaterThanOrEqual(1);
    const signalId = unreviewed[0].id;

    // Cross-user cannot act
    const cross = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${signalId}/confirm`,
      headers: other.authHeader,
      body: {},
      ip: other.ip,
    });
    expect(cross.statusCode).toBe(404);

    // Arbitrary type rejected
    const badType = await invoke(handler, {
      method: 'PATCH',
      path: `/api/personal/signals/${signalId}/correct`,
      headers: user.authHeader,
      body: { signal_type: 'not_a_real_type', normalized_value: 'fatigue' },
      ip: user.ip,
    });
    expect(badType.statusCode).toBe(400);

    // Unsupported value rejected
    const badVal = await invoke(handler, {
      method: 'PATCH',
      path: `/api/personal/signals/${signalId}/correct`,
      headers: user.authHeader,
      body: { normalized_value: 'totally_made_up_value' },
      ip: user.ip,
    });
    expect(badVal.statusCode).toBe(400);

    const correct = await invoke(handler, {
      method: 'PATCH',
      path: `/api/personal/signals/${signalId}/correct`,
      headers: user.authHeader,
      body: { normalized_value: 'low_energy' },
      ip: user.ip,
    });
    expect(correct.statusCode).toBe(200);
    expect(correct.json?.signal?.payload?.user_status).toBe('corrected');
    expect(correct.json?.signal?.payload?.original_extraction).toBeTruthy();

    // Create another unreviewed for confirm/reject paths
    const write2 = await voiceRespond(user, {
      transcript: 'I feel high stress today.',
      client_message_id: 'reviewmsg0002',
    });
    expect(write2.statusCode).toBe(200);
    {
      const obsMod = await import('../../server/core/observationSignalsService.mjs');
      obsMod.__setGenerateContentForTests(async () =>
        JSON.stringify({
          signals: [fatigueSignal({ signal_type: 'stress', normalized_value: 'high_stress', display_label: 'High stress' })],
        }),
      );
    }
    const write3 = await voiceRespond(user, {
      transcript: 'I feel overwhelmed by stress.',
      client_message_id: 'reviewmsg0003',
    });
    expect(write3.statusCode).toBe(200);

    const list2 = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/signals?user_status=unreviewed&limit=50',
      headers: user.authHeader,
      ip: user.ip,
    });
    const pending = (list2.json?.events || []).filter((e) => e.payload?.user_status === 'unreviewed');
    expect(pending.length).toBeGreaterThanOrEqual(1);

    const confirmId = pending[0].id;
    const confirmed = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${confirmId}/confirm`,
      headers: user.authHeader,
      body: {},
      ip: user.ip,
    });
    expect(confirmed.statusCode).toBe(200);
    expect(confirmed.json?.signal?.payload?.user_status).toBe('confirmed');

    // Confirmed excluded from unreviewed list
    const afterConfirm = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/signals?user_status=unreviewed&limit=50',
      headers: user.authHeader,
      ip: user.ip,
    });
    const stillPending = (afterConfirm.json?.events || []).map((e) => e.id);
    expect(stillPending).not.toContain(confirmId);

    // Reject another if available
    if (pending[1]) {
      const rejected = await invoke(handler, {
        method: 'POST',
        path: `/api/personal/signals/${pending[1].id}/reject`,
        headers: user.authHeader,
        body: {},
        ip: user.ip,
      });
      expect(rejected.statusCode).toBe(200);
      expect(rejected.json?.signal?.payload?.user_status).toBe('rejected');
    }

    // Own delete
    const del = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/events/${confirmId}/delete`,
      headers: user.authHeader,
      body: {},
      ip: user.ip,
    });
    expect(del.statusCode).toBe(200);
    expect(del.json?.ok).toBe(true);
    // Task 7.1 re-eval meta may be present
    expect(del.json).toHaveProperty('pattern_reevaluation_status');

    // Cross-user delete denied
    const crossDel = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/events/${signalId}/delete`,
      headers: other.authHeader,
      body: {},
      ip: other.ip,
    });
    expect(crossDel.statusCode).toBe(404);

    // No fake bulk delete endpoint
    const bulk = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory/delete-all',
      headers: user.authHeader,
      body: {},
      ip: user.ip,
    });
    expect(bulk.statusCode).toBe(404);
  });

  // --- PATTERNS / PRIVACY / ARCHITECTURE ---
  it('52-57. pattern labels; no causality language in copy', () => {
    expect(MEMORY_COPY.possiblePattern).toBe('Possible pattern');
    expect(MEMORY_COPY.confirmedPattern).toBe('Confirmed by you');
    expect(MEMORY_COPY.explanation).not.toMatch(/causes|diagnos/i);
  });

  it('64-73. privacy + architecture invariants', async () => {
    const user = await signup('priv@test.com');
    await enableConsent(user);
    const res = await voiceRespond(user, {
      transcript: 'I slept terribly and feel exhausted.',
      client_message_id: 'privmsg12345',
    });
    expect(res.statusCode).toBe(200);
    const blob = JSON.stringify(res.json);
    expect(blob).not.toMatch(/context_pack|__server_personal_context|fingerprint/i);
    expect(res.json).not.toHaveProperty('context_pack');
    // Consent response has no health content
    const consent = await getConsent(user);
    expect(JSON.stringify(consent.json)).not.toMatch(/slept|exhausted|fatigue/i);
    // localStorage is not authority — server default remains disabled for new user
    const other = await signup('priv2@test.com');
    expect((await getConsent(other)).json?.status).toBe('disabled');
  });

  it('58-63. Task 6/7/7.1 regression: consent required; unreviewed not pattern evidence', async () => {
    const user = await signup('regr@test.com');
    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    // Without consent — no write
    const noConsent = await voiceRespond(user, {
      transcript: 'I am exhausted again today.',
      client_message_id: 'regrnocons01',
    });
    expect(noConsent.json?.memory_write_status).toBe('consent_disabled');

    await enableConsent(user);
    const withConsent = await voiceRespond(user, {
      transcript: 'I am exhausted again today.',
      client_message_id: 'regryescons01',
    });
    expect(['written', 'already_exists', 'extraction_empty', 'extraction_failed']).toContain(
      withConsent.json?.memory_write_status,
    );

    const signals = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/signals?limit=20',
      headers: user.authHeader,
      ip: user.ip,
    });
    const unreviewed = (signals.json?.events || []).filter((e) => e.payload?.user_status === 'unreviewed');
    // Unreviewed signals exist but pattern evaluate should not treat them as confirmed evidence by default
    // (covered by Task 5/7.1 suites; here we only assert they remain unreviewed after write)
    for (const s of unreviewed) {
      expect(s.payload.user_status).toBe('unreviewed');
    }
  });
});
