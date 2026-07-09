import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { createPersonalEventsStore } from '../../server/core/personalEventsStore.mjs';
import {
  buildPersonalContextPack,
  resolveRelevantDomains,
  applyContextBudget,
  PERSONAL_CONTEXT_VERSION,
  CONTEXT_MAX_ITEMS,
  CONTEXT_MAX_CHARS,
  CONTEXT_MAX_RECENT_SIGNALS,
  CONTEXT_MAX_LOOKBACK_DAYS,
  CONTEXT_ALIAS_MAP,
} from '../../server/core/personalContextPackService.mjs';
import {
  evaluatePatternCandidates,
  confirmPatternCandidate,
} from '../../server/core/patternCandidatesService.mjs';
import { handleVoiceConversation } from '../../server/voiceConversation.mjs';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';

/**
 * Task 6 — selective personal context pack for Luna Live.
 * Deterministic relevance only. No embeddings / Gemini relevance selection.
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

const signalPayload = (overrides = {}) => ({
  signal_type: 'energy',
  normalized_value: 'fatigue',
  display_label: 'Fatigue',
  source_observation_id: null,
  extraction_method: 'test',
  extractor_version: 'test',
  confidence: 0.9,
  evidence_text: 'SECRET_EVIDENCE',
  temporal_context: null,
  severity: null,
  frequency_context: null,
  recurrence_marker: false,
  negated: false,
  uncertain: false,
  user_status: 'confirmed',
  original_extraction: null,
  ...overrides,
});

describe('personal context pack foundation (Task 6)', () => {
  let dataDir;
  let handler;
  let store;
  let ipCounter = 0;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
    __resetMemoryRateLimitForTests();
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-ctx-'));
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
    const handle = await createPersonalEventsStore(path.join(dataDir, 'personal-events.json'), {
      runtimeEnvironment: 'test',
      env: process.env,
    });
    store = handle.store;
  });

  afterEach(async () => {
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
      session: result.json.session,
      userId: result.json.session.id,
      authHeader: { authorization: `Bearer ${result.json.token}` },
      ip,
    };
  };

  const seedSignal = async (userId, { occurredAt, clientEventId, payload }) => {
    const result = await store.create(userId, {
      event_type: 'signal',
      occurred_at: occurredAt,
      source: 'system',
      schema_version: 1,
      client_event_id: clientEventId,
      payload: signalPayload(payload),
    });
    return result.event;
  };

  const seedPattern = async (userId, { status, clientEventId, signalType = 'energy', subtype = 'fatigue' }) => {
    const now = new Date().toISOString();
    const result = await store.create(userId, {
      event_type: 'pattern_candidate',
      occurred_at: now,
      source: 'system',
      schema_version: 1,
      client_event_id: clientEventId,
      payload: {
        candidate_type: 'repeated_signal',
        candidate_key: `pc:test:${clientEventId}`,
        title: `Pattern ${status}`,
        description: `${subtype} was recorded on multiple days.`,
        semantics: {
          candidate_regularities_only: true,
          not_diagnosis: true,
          not_causation: true,
          not_correlation: true,
          not_medical_conclusion: true,
        },
        status,
        confidence_band: 'low',
        evidence_count: 4,
        active_days: 4,
        first_evidence_at: '2026-05-01T12:00:00.000Z',
        latest_evidence_at: '2026-05-15T12:00:00.000Z',
        evidence_window_start: '2026-01-01T00:00:00.000Z',
        evidence_window_end: now,
        evidence_signal_ids: [],
        evidence_observation_ids: [],
        signal_definitions: [{ signal_type: signalType, normalized_value: subtype }],
        threshold_definition: { min_occurrences: 3, version: 'thresholds_v1' },
        uncertainty_summary: { included: false, uncertain_count: 0 },
        generated_by: 'pattern_candidates_engine',
        engine_version: 'pattern_candidates_v1',
        generated_at: now,
        last_evaluated_at: now,
      },
    });
    return result.event;
  };

  const voiceRespond = async (user, body = {}) =>
    invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      headers: { ...user.authHeader, 'x-luna-ai-consent': '1' },
      body: {
        transcript: 'I feel exhausted again today',
        lang: 'en',
        mode: 'live',
        withAudio: false,
        ...body,
      },
      ip: user.ip,
    });

  it('1-2. authenticated user receives only own context; A cannot receive B signals', async () => {
    const a = await signup('ctx-a@test.com', 'A');
    const b = await signup('ctx-b@test.com', 'B');
    await seedSignal(b.userId, {
      occurredAt: '2026-06-10T12:00:00.000Z',
      clientEventId: 'b-fatigue',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });
    await seedSignal(a.userId, {
      occurredAt: '2026-06-11T12:00:00.000Z',
      clientEventId: 'a-fatigue',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });

    const packA = await buildPersonalContextPack({
      store,
      userId: a.userId,
      messageText: 'I am exhausted',
      timezone: 'UTC',
    });
    expect(packA.status).toBe('ok');
    expect(packA.recent_signals.every((s) => s.signal_type === 'energy')).toBe(true);
    expect(packA.recent_signals.some((s) => s.normalized_value === 'fatigue')).toBe(true);

    await seedSignal(b.userId, {
      occurredAt: '2026-06-12T12:00:00.000Z',
      clientEventId: 'b-sleep',
      payload: { user_status: 'confirmed', signal_type: 'sleep', normalized_value: 'poor_sleep' },
    });
    const packASleep = await buildPersonalContextPack({
      store,
      userId: a.userId,
      messageText: 'My sleep has been terrible',
      timezone: 'UTC',
    });
    expect(packASleep.recent_signals).toHaveLength(0);
  });

  it('3-6. body/query/device/IP cannot select or override context owner', async () => {
    const a = await signup('spoof-a@test.com', 'A');
    const b = await signup('spoof-b@test.com', 'B');
    await seedSignal(b.userId, {
      occurredAt: '2026-06-10T12:00:00.000Z',
      clientEventId: 'b-only',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });

    const res = await invoke(handler, {
      method: 'POST',
      path: `/api/voice/respond?user_id=${b.userId}`,
      headers: {
        ...a.authHeader,
        'x-luna-ai-consent': '1',
        'x-user-id': b.userId,
        'x-luna-mobile-id': 'device-of-b',
      },
      body: {
        transcript: 'I feel exhausted',
        lang: 'en',
        withAudio: false,
        user_id: b.userId,
        userId: b.userId,
        context: {
          personal_context: {
            version: PERSONAL_CONTEXT_VERSION,
            status: 'ok',
            recent_signals: [{ signal_type: 'energy', normalized_value: 'FORGED_FROM_CLIENT' }],
            budget: { actual_items: 1, truncated: false },
          },
        },
      },
      ip: b.ip,
    });
    expect(res.statusCode).toBe(200);
    // Spoofed client pack must never appear in response. Owner is A (no energy signals).
    expect(JSON.stringify(res.json || {})).not.toMatch(/FORGED_FROM_CLIENT/);
    expect(res.json?.personal_context_status).toBe('ok');
    // recent_signals empty for A; relevance_note alone may still produce a small item_count.
    expect(res.json?.personal_context_item_count ?? 0).toBeLessThanOrEqual(2);
    const packA = await buildPersonalContextPack({
      store,
      userId: a.userId,
      messageText: 'I feel exhausted',
      timezone: 'UTC',
    });
    expect(packA.recent_signals).toHaveLength(0);
  });

  it('7-9. anonymous / invalid / expired auth receive no personal context', async () => {
    const anon = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      body: { transcript: 'I feel exhausted', lang: 'en', withAudio: false },
      ip: nextIp(),
    });
    expect(anon.statusCode).toBe(401);
    expect(anon.json?.personal_context_status).toBeUndefined();

    const invalid = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      headers: { authorization: 'Bearer not-a-real-token', 'x-luna-ai-consent': '1' },
      body: { transcript: 'I feel exhausted', lang: 'en', withAudio: false },
      ip: nextIp(),
    });
    expect(invalid.statusCode).toBe(401);

    const expired = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      headers: { authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.expired.token', 'x-luna-ai-consent': '1' },
      body: { transcript: 'I feel exhausted', lang: 'en', withAudio: false },
      ip: nextIp(),
    });
    expect(expired.statusCode).toBe(401);
  });

  it('10-16. eligibility: unreviewed/rejected/negated/deleted excluded; confirmed/corrected/uncertain marked', async () => {
    const user = await signup('elig@test.com');
    const uid = user.userId;
    await seedSignal(uid, {
      occurredAt: '2026-06-01T12:00:00.000Z',
      clientEventId: 'unrev',
      payload: { user_status: 'unreviewed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-02T12:00:00.000Z',
      clientEventId: 'rej',
      payload: { user_status: 'rejected', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-03T12:00:00.000Z',
      clientEventId: 'neg',
      payload: { user_status: 'confirmed', negated: true, normalized_value: 'fatigue' },
    });
    const del = await seedSignal(uid, {
      occurredAt: '2026-06-04T12:00:00.000Z',
      clientEventId: 'del',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    await store.softDelete(uid, del.id);

    await seedSignal(uid, {
      occurredAt: '2026-06-05T12:00:00.000Z',
      clientEventId: 'ok',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue', uncertain: true },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-06T12:00:00.000Z',
      clientEventId: 'corr',
      payload: {
        user_status: 'corrected',
        normalized_value: 'fatigue',
        correction: {
          corrected_value: {
            signal_type: 'energy',
            normalized_value: 'low_energy',
            negated: false,
            uncertain: false,
          },
        },
      },
    });

    const pack = await buildPersonalContextPack({
      store,
      userId: uid,
      messageText: 'I am exhausted again',
      timezone: 'UTC',
    });
    expect(pack.recent_signals).toHaveLength(2);
    const values = pack.recent_signals.map((s) => s.normalized_value).sort();
    expect(values).toEqual(['fatigue', 'low_energy']);
    const uncertain = pack.recent_signals.find((s) => s.normalized_value === 'fatigue');
    expect(uncertain.uncertain).toBe(true);
    // Content buckets must not leak evidence/raw text (exclusions_applied may name excluded field types).
    expect(JSON.stringify(pack.recent_signals)).not.toMatch(/SECRET_EVIDENCE|"raw_text"|"evidence_text"|"transcript"/i);
    expect(JSON.stringify(pack.timeline_facts)).not.toMatch(/SECRET_EVIDENCE|"raw_text"|"evidence_text"/i);
    expect(JSON.stringify(pack.confirmed_patterns)).not.toMatch(/SECRET_EVIDENCE|"raw_text"|"evidence_text"/i);
  });

  it('17-21. patterns: candidate/rejected/stale/invalidated excluded; confirmed included', async () => {
    const user = await signup('pat@test.com');
    const uid = user.userId;
    await seedSignal(uid, {
      occurredAt: '2026-06-10T12:00:00.000Z',
      clientEventId: 'p-sig',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });
    await seedPattern(uid, { status: 'candidate', clientEventId: 'pc-cand' });
    await seedPattern(uid, { status: 'rejected', clientEventId: 'pc-rej' });
    await seedPattern(uid, { status: 'stale', clientEventId: 'pc-stale' });
    await seedPattern(uid, { status: 'invalidated', clientEventId: 'pc-inv' });
    await seedPattern(uid, { status: 'confirmed', clientEventId: 'pc-ok' });

    const pack = await buildPersonalContextPack({
      store,
      userId: uid,
      messageText: 'I feel exhausted',
      timezone: 'UTC',
    });
    expect(pack.confirmed_patterns).toHaveLength(1);
    expect(pack.confirmed_patterns[0].status).toBe('confirmed');
    expect(pack.confirmed_patterns[0].title).toMatch(/confirmed/i);
    expect(pack.exclusions_applied).toContain('automatic_pattern_candidates');
  });

  it('22-23. unrelated domains excluded; alias match works', async () => {
    const user = await signup('rel@test.com');
    const uid = user.userId;
    await seedSignal(uid, {
      occurredAt: '2026-06-10T12:00:00.000Z',
      clientEventId: 'cycle1',
      payload: { user_status: 'confirmed', signal_type: 'cycle', normalized_value: 'period_started' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-11T12:00:00.000Z',
      clientEventId: 'energy1',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });

    expect(resolveRelevantDomains('I am exhausted again today')).toContain('energy');
    expect(resolveRelevantDomains('I am exhausted again today')).not.toContain('cycle');

    const pack = await buildPersonalContextPack({
      store,
      userId: uid,
      messageText: 'I am exhausted again today',
      timezone: 'UTC',
    });
    expect(pack.recent_signals.every((s) => s.signal_type === 'energy')).toBe(true);
    expect(pack.recent_signals.some((s) => s.signal_type === 'cycle')).toBe(false);

    const sleepPack = await buildPersonalContextPack({
      store,
      userId: uid,
      messageText: 'My sleep has been terrible',
      timezone: 'UTC',
    });
    expect(sleepPack.recent_signals).toHaveLength(0);
  });

  it('24-25. no embeddings/vector imports; no Gemini relevance-selection call', async () => {
    const src = await fs.readFile(
      path.join(process.cwd(), 'server/core/personalContextPackService.mjs'),
      'utf8',
    );
    // Prohibition comments may mention embeddings/Gemini; assert no retrieval/LLM imports or API calls.
    expect(src).not.toMatch(/from ['"][^'"]*embed|import\(['"][^'"]*vector|pinecone|openai/i);
    expect(src).not.toMatch(/GoogleGenAI|generateContent|models\.generateContent/i);
    expect(src).not.toMatch(/cosineSimilarity|vectorStore|createEmbedding/i);

    const user = await signup('nogem@test.com');
    await seedSignal(user.userId, {
      occurredAt: '2026-06-10T12:00:00.000Z',
      clientEventId: 'ng1',
      payload: { user_status: 'confirmed' },
    });
    const pack = await buildPersonalContextPack({
      store,
      userId: user.userId,
      messageText: 'tired',
      timezone: 'UTC',
    });
    expect(pack.status).toBe('ok');
    expect(pack.recent_signals.length).toBeGreaterThanOrEqual(1);
  });

  it('26-29. item/char budgets enforced; truncation; lookback bounded', async () => {
    const user = await signup('bud@test.com');
    const uid = user.userId;
    for (let i = 0; i < 12; i += 1) {
      await seedSignal(uid, {
        occurredAt: `2026-06-${String(i + 1).padStart(2, '0')}T12:00:00.000Z`,
        clientEventId: `bud-${i}`,
        payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
      });
    }
    const pack = await buildPersonalContextPack({
      store,
      userId: uid,
      messageText: 'exhausted',
      timezone: 'UTC',
      lookbackDays: 999,
    });
    expect(pack.scope.lookback_days).toBeLessThanOrEqual(CONTEXT_MAX_LOOKBACK_DAYS);
    expect(pack.recent_signals.length).toBeLessThanOrEqual(CONTEXT_MAX_RECENT_SIGNALS);
    const items =
      pack.recent_signals.length +
      pack.timeline_facts.length +
      pack.confirmed_patterns.length +
      pack.relevant_facts.length;
    expect(items).toBeLessThanOrEqual(CONTEXT_MAX_ITEMS);
    expect(pack.budget.actual_chars).toBeLessThanOrEqual(CONTEXT_MAX_CHARS);
    expect(pack.budget.max_items).toBe(CONTEXT_MAX_ITEMS);

    const oversized = applyContextBudget({
      version: PERSONAL_CONTEXT_VERSION,
      status: 'ok',
      recent_signals: Array.from({ length: 30 }, (_, i) => ({
        kind: 'recent_signal',
        signal_type: 'energy',
        normalized_value: 'fatigue',
        occurred_at: `2026-06-01T${String(i).padStart(2, '0')}:00:00.000Z`,
        user_status: 'confirmed',
        uncertain: false,
        semantics: 'recorded_signal_fact',
        pad: 'x'.repeat(400),
      })),
      timeline_facts: [],
      confirmed_patterns: [],
      relevant_facts: [],
      exclusions_applied: [],
      budget: { max_items: CONTEXT_MAX_ITEMS, max_chars: CONTEXT_MAX_CHARS },
      semantics: {},
    });
    expect(oversized.budget.truncated).toBe(true);
    expect(oversized.budget.actual_items).toBeLessThanOrEqual(CONTEXT_MAX_ITEMS);
  });

  it('30-32. no raw_text/evidence_text; client pack ignored; server pack injected', async () => {
    const user = await signup('raw@test.com');
    await seedSignal(user.userId, {
      occurredAt: '2026-06-10T12:00:00.000Z',
      clientEventId: 'raw1',
      payload: {
        user_status: 'confirmed',
        evidence_text: 'SECRET_EVIDENCE',
        normalized_value: 'fatigue',
      },
    });
    const pack = await buildPersonalContextPack({
      store,
      userId: user.userId,
      messageText: 'tired',
      timezone: 'UTC',
    });
    expect(JSON.stringify(pack)).not.toMatch(/SECRET_EVIDENCE/);
    expect(JSON.stringify(pack.recent_signals)).not.toMatch(/"raw_text"|"evidence_text"|"transcript"/);

    const result = await handleVoiceConversation({
      transcript: 'I feel exhausted',
      lang: 'en',
      withAudio: false,
      context: {
        personal_context: {
          version: PERSONAL_CONTEXT_VERSION,
          status: 'ok',
          recent_signals: [{ signal_type: 'energy', normalized_value: 'CLIENT_FORGED' }],
          budget: { actual_items: 99, truncated: false },
        },
      },
      __server_personal_context: pack,
    });
    expect(result.personal_context_status).toBe('ok');
    expect(result.personal_context_item_count).toBeGreaterThan(0);
    expect(JSON.stringify(result)).not.toMatch(/CLIENT_FORGED/);
  });

  it('33-35. store unavailable / empty / no domain → safe empty; confirmed pattern via evaluate+confirm', async () => {
    const user = await signup('empty@test.com');
    const empty = await buildPersonalContextPack({
      store,
      userId: user.userId,
      messageText: 'hello there friend',
      timezone: 'UTC',
    });
    expect(empty.status).toBe('ok');
    expect(empty.recent_signals).toHaveLength(0);
    expect(empty.exclusions_applied).toContain('no_relevant_domain_match');

    const unavailable = await buildPersonalContextPack({
      store: null,
      userId: user.userId,
      messageText: 'exhausted',
    });
    expect(unavailable.status).toBe('unavailable');

    for (const day of ['2026-05-01', '2026-05-05', '2026-05-10', '2026-05-15']) {
      await seedSignal(user.userId, {
        occurredAt: `${day}T12:00:00.000Z`,
        clientEventId: `ev-${day}`,
        payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
      });
    }
    const evaluated = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const cand = (evaluated.candidates || []).find((c) => c.candidate_type === 'repeated_signal');
    expect(cand).toBeTruthy();
    expect(cand.status).toBe('candidate');

    const beforeConfirm = await buildPersonalContextPack({
      store,
      userId: user.userId,
      messageText: 'exhausted',
      timezone: 'UTC',
    });
    expect(beforeConfirm.confirmed_patterns).toHaveLength(0);

    await confirmPatternCandidate(store, user.userId, cand.id);
    const afterConfirm = await buildPersonalContextPack({
      store,
      userId: user.userId,
      messageText: 'exhausted',
      timezone: 'UTC',
    });
    expect(afterConfirm.confirmed_patterns.length).toBeGreaterThanOrEqual(1);
    expect(afterConfirm.confirmed_patterns.every((p) => p.status === 'confirmed')).toBe(true);
  });

  it('voice respond returns safe meta only; AI consent required', async () => {
    const user = await signup('voice@test.com');
    await seedSignal(user.userId, {
      occurredAt: '2026-06-10T12:00:00.000Z',
      clientEventId: 'v1',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });

    const noConsent = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      headers: user.authHeader,
      body: { transcript: 'exhausted', lang: 'en', withAudio: false },
      ip: user.ip,
    });
    expect(noConsent.statusCode).toBe(403);

    const ok = await voiceRespond(user);
    expect(ok.statusCode).toBe(200);
    expect(ok.json?.text).toBeTruthy();
    expect(ok.json?.personal_context_status).toBe('ok');
    expect(typeof ok.json?.personal_context_item_count).toBe('number');
    expect(JSON.stringify(ok.json)).not.toMatch(/SECRET_EVIDENCE|"raw_text"/i);
  });

  it('rate-limit bypass requires VITEST env only (source contract)', async () => {
    const src = await fs.readFile(path.join(process.cwd(), 'server/core/rateLimit.mjs'), 'utf8');
    expect(src).toMatch(/process\.env\.VITEST/);
    expect(src).not.toMatch(/NODE_ENV === ['"]test['"]/);
    expect(CONTEXT_ALIAS_MAP.energy).toContain('exhausted');
    expect(CONTEXT_ALIAS_MAP.sleep).toContain('insomnia');
  });
});
