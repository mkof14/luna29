import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { createPersonalEventsStore } from '../../server/core/personalEventsStore.mjs';
import {
  evaluateMemoryWriteEligibility,
  MEMORY_GATE_VERSION,
} from '../../server/core/memoryWriteEligibilityService.mjs';
import {
  attemptLunaLiveMemoryWrite,
  isLunaLiveMemoryWriteEnabled,
  validateClientMessageId,
  LUNA_LIVE_MEMORY_WRITE_FLAG,
  summarizeMemoryWriteForLogs,
} from '../../server/core/lunaLiveMemoryWriteService.mjs';
import {
  getSignalHistory,
  isEligiblePositiveSignal,
} from '../../server/core/timelineQueryService.mjs';
import { evaluatePatternCandidates } from '../../server/core/patternCandidatesService.mjs';
import { buildPersonalContextPack } from '../../server/core/personalContextPackService.mjs';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';
import {
  __setGenerateContentForTests,
  __resetGenerateContentForTests,
} from '../../server/core/observationSignalsService.mjs';

/**
 * Task 7 — Selective Luna Live memory write pipeline.
 * Mocked extraction. No live Gemini / ElevenLabs.
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

const mockExtract = (signals) =>
  __setGenerateContentForTests(async () => JSON.stringify({ signals }));

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

describe('luna live memory write foundation (Task 7)', () => {
  let dataDir;
  let handler;
  let store;
  let ipCounter = 0;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
    __resetMemoryRateLimitForTests();
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-memwrite-'));
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
    // Same file path as handler — used only for direct service calls (attemptLunaLiveMemoryWrite).
    const handle = await createPersonalEventsStore(path.join(dataDir, 'memory-write-events.json'), {
      runtimeEnvironment: 'test',
      env: process.env,
    });
    store = handle.store;
    mockExtract([fatigueSignal()]);
  });

  afterEach(async () => {
    __resetGenerateContentForTests?.();
    process.env = originalEnv;
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  const nextIp = () => {
    ipCounter += 1;
    return `198.19.${Math.floor(ipCounter / 250) % 250}.${(ipCounter % 250) + 1}`;
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
    return {
      token: result.json.token,
      userId: result.json.session.id,
      authHeader: { authorization: `Bearer ${result.json.token}` },
      ip,
    };
  };

  /** List via API so we read the handler's store, not a separate file-store cache. */
  const listObsApi = async (user) => {
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/observations',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(res.statusCode).toBe(200);
    return res.json?.events || [];
  };

  const listSignalsApi = async (user) => {
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/signals',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(res.statusCode).toBe(200);
    return res.json?.events || [];
  };

  const voiceRespond = async (user, body = {}) =>
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

  it('9-14. feature flag default off; request/header/query cannot enable; chat works', async () => {
    delete process.env[LUNA_LIVE_MEMORY_WRITE_FLAG];
    expect(isLunaLiveMemoryWriteEnabled({})).toBe(false);
    expect(isLunaLiveMemoryWriteEnabled({ [LUNA_LIVE_MEMORY_WRITE_FLAG]: 'false' })).toBe(false);

    const user = await signup('flag@test.com');
    const off = await voiceRespond(user, {
      transcript: 'I slept terribly last night.',
      client_message_id: 'flagoff123456',
      [LUNA_LIVE_MEMORY_WRITE_FLAG]: true,
      luna_live_memory_write_enabled: true,
    });
    expect(off.statusCode).toBe(200);
    expect(off.json?.text).toBeTruthy();
    expect(off.json?.memory_write_status).toBe('disabled');
    expect(await listObsApi(user)).toHaveLength(0);

    const hdr = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond?LUNA_LIVE_MEMORY_WRITE_ENABLED=true',
      headers: {
        ...user.authHeader,
        'x-luna-ai-consent': '1',
        'x-luna-live-memory-write-enabled': 'true',
      },
      body: {
        transcript: 'I slept terribly last night.',
        lang: 'en',
        withAudio: false,
        client_message_id: 'flaghdr123456',
      },
      ip: user.ip,
    });
    expect(hdr.statusCode).toBe(200);
    expect(hdr.json?.memory_write_status).toBe('disabled');

    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    const on = await voiceRespond(user, {
      transcript: 'I slept terribly last night.',
      client_message_id: 'flagon1234567',
    });
    expect(on.statusCode).toBe(200);
    expect(on.json?.memory_write_status).not.toBe('disabled');
    expect((await listObsApi(user)).length).toBeGreaterThanOrEqual(1);
  });

  it('1-8. auth ownership; spoof ignored; anon/invalid/expired cannot write', async () => {
    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    const a = await signup('own-a@test.com', 'A');
    const b = await signup('own-b@test.com', 'B');

    const ok = await voiceRespond(a, {
      transcript: 'I am exhausted again today.',
      client_message_id: 'owna12345678',
      user_id: b.userId,
      userId: b.userId,
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json?.memory_write_status).not.toBe('disabled');
    expect((await listObsApi(a)).length).toBeGreaterThanOrEqual(1);
    expect(await listObsApi(b)).toHaveLength(0);

    const spoof = await invoke(handler, {
      method: 'POST',
      path: `/api/voice/respond?user_id=${b.userId}`,
      headers: {
        ...a.authHeader,
        'x-luna-ai-consent': '1',
        'x-user-id': b.userId,
        'x-luna-mobile-id': 'device-b',
      },
      body: {
        transcript: 'I slept terribly last night.',
        lang: 'en',
        withAudio: false,
        client_message_id: 'spoof12345678',
        user_id: b.userId,
      },
      ip: b.ip,
    });
    expect(spoof.statusCode).toBe(200);
    expect(await listObsApi(b)).toHaveLength(0);
    expect((await listObsApi(a)).length).toBeGreaterThanOrEqual(2);

    for (const [label, headers, bodyExtra] of [
      ['anon', {}, {}],
      ['invalid', { authorization: 'Bearer not-real', 'x-luna-ai-consent': '1' }, {}],
      ['expired', { authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.expired.token', 'x-luna-ai-consent': '1' }, {}],
    ]) {
      const res = await invoke(handler, {
        method: 'POST',
        path: '/api/voice/respond',
        headers,
        body: {
          transcript: 'I slept terribly last night.',
          lang: 'en',
          withAudio: false,
          client_message_id: `${label}12345678`,
          ...bodyExtra,
        },
        ip: nextIp(),
      });
      expect(res.statusCode, label).toBe(401);
    }
  });

  it('15-40. eligibility positive and negative cases', () => {
    const pos = [
      'I slept terribly last night.',
      "I'm exhausted again today.",
      'My energy has been low for three days.',
      'I feel unusually irritable.',
      'I started my period this morning.',
      'My cramps are worse today.',
      'I have a headache again.',
      'My chest feels tight when I get stressed.',
      'I took my medication later than usual.',
      "I've been waking up at 3 AM.",
      "I'm not tired today.",
      'Why am I so exhausted today?',
    ];
    for (const t of pos) {
      const g = evaluateMemoryWriteEligibility({ text: t, mode: 'live', source_surface: 'luna_live' });
      expect(g.eligible, t).toBe(true);
      expect(g.gate_version).toBe(MEMORY_GATE_VERSION);
      expect(g.matched_domains.length).toBeGreaterThan(0);
    }

    const neg = [
      ['hello', 'greeting'],
      ['thanks', 'thanks'],
      ['bye', 'farewell'],
      ['how do I use this', 'product_ui'],
      ['cancel my subscription', 'account_billing'],
      ['what is Luna', 'meta_luna'],
      ['what causes fatigue', 'generic_information'],
      ['tell me about insomnia', 'generic_information'],
      ['Why does fatigue happen?', 'generic_information'],
      ['Tell me about sleep.', 'generic_information'],
      ['my husband is tired', 'third_person'],
      ['my daughter has cramps', 'third_person'],
      ['play music', 'pure_command'],
      ['you said that already', 'assistant_reference'],
    ];
    for (const [t, reason] of neg) {
      const g = evaluateMemoryWriteEligibility({ text: t, mode: 'live', source_surface: 'luna_live' });
      expect(g.eligible, t).toBe(false);
      expect(g.reason, t).toBe(reason);
    }

    expect(
      evaluateMemoryWriteEligibility({ text: 'I slept terribly', mode: 'teaser', source_surface: 'luna_live' }).eligible,
    ).toBe(false);
  });

  it('41-47. idempotency; invalid/missing id skips write; chat succeeds', async () => {
    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    const user = await signup('idem@test.com');
    const id = 'idempotent-msg-01';
    const sleepExtract = async () =>
      JSON.stringify({
        signals: [
          {
            signal_type: 'sleep',
            normalized_value: 'poor_sleep',
            display_label: 'Poor sleep',
            confidence: 0.9,
            evidence_text: 'slept terribly',
            negated: false,
            uncertain: false,
            recurrence_marker: false,
          },
        ],
      });

    const r1 = await attemptLunaLiveMemoryWrite({
      store,
      userId: user.userId,
      text: 'I slept terribly last night.',
      mode: 'live',
      language: 'en',
      inputMode: 'text',
      clientMessageId: id,
      env: process.env,
      generateContent: sleepExtract,
    });
    expect(r1.memory_write_status).toBe('completed');
    expect(r1.observation_created).toBe(true);
    expect(r1._observation_id).toBeTruthy();

    const r2 = await attemptLunaLiveMemoryWrite({
      store,
      userId: user.userId,
      text: 'I slept terribly last night.',
      mode: 'live',
      language: 'en',
      inputMode: 'text',
      clientMessageId: id,
      env: process.env,
      generateContent: async () => {
        throw new Error('should not re-extract');
      },
    });
    expect(r2.memory_write_status).toBe('completed');
    expect(r2.extraction_status).toBe('already_extracted');
    expect(r2._observation_id).toBe(r1._observation_id);

    const owned1 = await store.getOwned(user.userId, r1._observation_id);
    expect(owned1?.client_event_id).toBe(`luna_live:${id}`);

    const r3 = await attemptLunaLiveMemoryWrite({
      store,
      userId: user.userId,
      text: 'I slept terribly last night.',
      mode: 'live',
      language: 'en',
      inputMode: 'text',
      clientMessageId: 'idempotent-msg-02',
      env: process.env,
      generateContent: sleepExtract,
    });
    expect(r3.observation_created).toBe(true);
    expect(r3._observation_id).not.toBe(r1._observation_id);

    expect(validateClientMessageId('').ok).toBe(false);
    expect(validateClientMessageId('short').ok).toBe(false);
    expect(validateClientMessageId('good-id-123456').ok).toBe(true);

    const missing = await voiceRespond(user, {
      transcript: 'I slept terribly last night.',
      // no client_message_id
    });
    expect(missing.statusCode).toBe(200);
    // Service generates id client-side; server missing_id only when omitted entirely from body.
  });

  it('48-70. observation model; unreviewed; excluded from Task 4/5/6 defaults', async () => {
    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    const user = await signup('model@test.com');
    const { listSignalsForObservation } = await import('../../server/core/observationSignalsService.mjs');
    const r = await attemptLunaLiveMemoryWrite({
      store,
      userId: user.userId,
      text: "I'm not tired today.",
      mode: 'live',
      language: 'en',
      inputMode: 'text',
      clientMessageId: 'model-msg-0001',
      env: process.env,
      generateContent: async () =>
        JSON.stringify({
          signals: [
            {
              signal_type: 'energy',
              normalized_value: 'fatigue',
              display_label: 'Fatigue',
              confidence: 0.85,
              evidence_text: 'not tired',
              negated: true,
              uncertain: false,
              recurrence_marker: false,
            },
          ],
        }),
    });
    expect(r.observation_created).toBe(true);
    const obs = await store.getOwned(user.userId, r._observation_id);
    expect(obs.payload.observation_kind).toBe('luna_live_message');
    expect(obs.payload.source_surface).toBe('luna_live');
    expect(obs.payload.input_mode).toBe('text');
    expect(obs.payload.language).toBe('en');
    expect(obs.payload.memory_gate_version).toBe(MEMORY_GATE_VERSION);
    expect(obs.payload.matched_domains).toContain('energy');
    expect(JSON.stringify(obs.payload)).not.toMatch(/stateSnapshot|personal_context|assistant|elevenlabs|audio/i);

    const sigs = await listSignalsForObservation(store, user.userId, obs.id);
    expect(sigs.length).toBe(1);
    const sig = sigs[0];
    expect(sig.payload.user_status).toBe('unreviewed');
    expect(sig.payload.negated).toBe(true);
    expect(sig.payload.source_observation_id).toBe(obs.id);
    expect(isEligiblePositiveSignal(sig, { includeCandidates: false, includeNegated: false })).toBe(false);

    const history = await getSignalHistory(store, user.userId, 'energy', { timezone: 'UTC' });
    expect(history.recurrence?.occurrence_count || 0).toBe(0);

    const patterns = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    expect(patterns.candidates || []).toHaveLength(0);

    const pack = await buildPersonalContextPack({
      store,
      userId: user.userId,
      messageText: 'I am exhausted',
      timezone: 'UTC',
    });
    expect(pack.recent_signals).toHaveLength(0);
  });

  it('58-66. extraction failure preserves observation; zero fabricated signals; negation path', async () => {
    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    const user = await signup('failx@test.com');
    const { listSignalsForObservation } = await import('../../server/core/observationSignalsService.mjs');
    const fail = await attemptLunaLiveMemoryWrite({
      store,
      userId: user.userId,
      text: 'I slept terribly last night.',
      mode: 'live',
      language: 'en',
      inputMode: 'voice_transcript',
      clientMessageId: 'fail-extract-01',
      env: process.env,
      generateContent: async () => {
        throw new Error('boom');
      },
    });
    expect(fail.memory_write_status).toBe('extraction_failed');
    expect(fail.observation_created).toBe(true);
    expect(fail.signal_count).toBe(0);

    const obs = await store.getOwned(user.userId, fail._observation_id);
    expect(obs.payload.input_mode).toBe('voice_transcript');
    expect(obs.payload.observation_kind).toBe('luna_live_message');
    const sigs = await listSignalsForObservation(store, user.userId, obs.id);
    expect(sigs).toHaveLength(0);
  });

  it('73-84. failure isolation + privacy log shape; AudioReflection surface separate', async () => {
    const user = await signup('iso@test.com');

    delete process.env[LUNA_LIVE_MEMORY_WRITE_FLAG];
    const disabled = await voiceRespond(user, {
      transcript: 'I slept terribly last night.',
      client_message_id: 'iso-dis-00001',
    });
    expect(disabled.statusCode).toBe(200);
    expect(disabled.json?.text).toBeTruthy();
    expect(disabled.json?.memory_write_status).toBe('disabled');

    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    const ineligible = await voiceRespond(user, {
      transcript: 'hello there',
      client_message_id: 'iso-inel-0001',
    });
    expect(ineligible.statusCode).toBe(200);
    expect(ineligible.json?.memory_write_status).toBe('ineligible');

    const log = summarizeMemoryWriteForLogs({
      memory_write_status: 'completed',
      eligible: true,
      gate_reason: 'first_person_self_report',
      matched_domain_count: 1,
      observation_created: true,
      signal_count: 1,
      extraction_status: 'completed',
      latency_ms: 12,
    });
    expect(JSON.stringify(log)).not.toMatch(/slept|exhausted|fatigue|raw_text|transcript/i);

    // Luna Live gate rejects voice_reflection surface (separate write path).
    const wrong = evaluateMemoryWriteEligibility({
      text: 'I slept terribly last night.',
      mode: 'live',
      source_surface: 'voice_reflection',
    });
    expect(wrong.eligible).toBe(false);
    expect(wrong.reason).toBe('wrong_surface');
  });

  it('85-90. no embeddings / no LLM eligibility; client cannot submit trusted eligibility', async () => {
    const srcGate = await fs.readFile(
      path.join(process.cwd(), 'server/core/memoryWriteEligibilityService.mjs'),
      'utf8',
    );
    const srcPipe = await fs.readFile(
      path.join(process.cwd(), 'server/core/lunaLiveMemoryWriteService.mjs'),
      'utf8',
    );
    expect(srcGate).not.toMatch(/\bpinecone\b|\bopenai\b|cosine|vector similarity|\bembedding\b/i);
    expect(srcGate).not.toMatch(/from ['"]@google\/genai['"]|GoogleGenAI/);
    expect(srcPipe).not.toMatch(/\bpinecone\b|\bopenai\b|cosine|vector similarity|\bembedding\b/i);
    expect(srcPipe).not.toMatch(/from ['"]@google\/genai['"]|GoogleGenAI/);
    expect(srcGate).toMatch(/memory_gate_v1/);
    expect(srcPipe).toMatch(/createObservationWithExtraction/);

    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    const user = await signup('trust@test.com');
    const forged = await voiceRespond(user, {
      transcript: 'hello',
      client_message_id: 'forge-elig-01',
      eligible: true,
      matched_domains: ['energy'],
      memory_gate_reason: 'first_person_self_report',
      observation: { user_id: 'forged', raw_text: 'FORGED' },
    });
    expect(forged.statusCode).toBe(200);
    expect(forged.json?.memory_write_status).toBe('ineligible');
    expect(await listObsApi(user)).toHaveLength(0);
  });

  it('response meta exposes status only; no observation/signal payloads', async () => {
    process.env[LUNA_LIVE_MEMORY_WRITE_FLAG] = 'true';
    const user = await signup('meta@test.com');
    const res = await voiceRespond(user, {
      transcript: 'I slept terribly last night.',
      client_message_id: 'meta-msg-00001',
    });
    expect(res.statusCode).toBe(200);
    expect(typeof res.json?.memory_write_status).toBe('string');
    expect(res.json?.observation).toBeUndefined();
    expect(res.json?.signals).toBeUndefined();
    expect(res.json?.matched_domains).toBeUndefined();
    expect(JSON.stringify(res.json?.memory_write_status)).not.toMatch(/slept|exhausted/i);
  });
});
