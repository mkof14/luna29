import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import {
  buildEvidenceFingerprint,
  shouldReevaluateAfterMutation,
  runPatternReevaluationAfterMutation,
  PATTERN_REEVAL_VERSION,
  PATTERN_REEVAL_LOOKBACK_DAYS,
} from '../../server/core/patternReevaluationService.mjs';
import {
  evaluatePatternCandidates,
  PATTERN_EVAL_DEFAULT_WINDOW_DAYS,
  listPatternCandidates,
} from '../../server/core/patternCandidatesService.mjs';
import { buildPersonalContextPack } from '../../server/core/personalContextPackService.mjs';
import { LUNA_LIVE_MEMORY_WRITE_FLAG } from '../../server/core/lunaLiveMemoryWriteService.mjs';
import { __setGenerateContentForTests, __resetGenerateContentForTests } from '../../server/core/observationSignalsService.mjs';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';

/**
 * Task 7.1 — Trust-state pattern re-evaluation.
 * Seeds signals directly (no observation extract dependency).
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
  evidence_text: 'exhausted',
  temporal_context: null,
  severity: null,
  frequency_context: null,
  recurrence_marker: false,
  negated: false,
  uncertain: false,
  user_status: 'unreviewed',
  original_extraction: null,
  ...overrides,
});

describe('pattern reevaluation foundation (Task 7.1)', () => {
  let dataDir;
  let handler;
  let store;
  let ipCounter = 0;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    process.env.MEMORY_CONSENT_STORAGE = 'file';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
    delete process.env[LUNA_LIVE_MEMORY_WRITE_FLAG];
    __resetMemoryRateLimitForTests();
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-reeval-'));
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
    const { createPersonalEventsStore } = await import('../../server/core/personalEventsStore.mjs');
    const handle = await createPersonalEventsStore(path.join(dataDir, 'personal-events.json'), {
      runtimeEnvironment: 'test',
      env: process.env,
    });
    store = handle.store;
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

  const seedSignal = async (userId, { occurredAt, clientEventId, payload = {} }) => {
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

  /** Four unreviewed fatigue signals spanning >= 7 days (Task 5 threshold). */
  const seedUnreviewedFatigue = async (userId, prefix) => {
    const days = ['2026-05-01', '2026-05-05', '2026-05-10', '2026-05-15'];
    const ids = [];
    for (let i = 0; i < days.length; i += 1) {
      const ev = await seedSignal(userId, {
        occurredAt: `${days[i]}T12:00:00.000Z`,
        clientEventId: `${prefix}-f-${i}`,
        payload: { user_status: 'unreviewed', signal_type: 'energy', normalized_value: 'fatigue' },
      });
      ids.push(ev.id);
    }
    return ids;
  };

  const confirm = (user, id) =>
    invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${id}/confirm`,
      headers: user.authHeader,
      ip: user.ip,
    });

  const reject = (user, id) =>
    invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${id}/reject`,
      headers: user.authHeader,
      ip: user.ip,
    });

  const correct = (user, id, body) =>
    invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${id}/correct`,
      headers: user.authHeader,
      body,
      ip: user.ip,
    });

  const softDelete = (user, id) =>
    invoke(handler, {
      method: 'POST',
      path: `/api/personal/events/${id}/delete`,
      headers: user.authHeader,
      ip: user.ip,
    });

  const listSignalsApi = (user) =>
    invoke(handler, {
      method: 'GET',
      path: '/api/personal/signals?limit=100',
      headers: user.authHeader,
      ip: user.ip,
    });

  const listPatternsApi = (user) =>
    invoke(handler, {
      method: 'GET',
      path: '/api/personal/pattern-candidates',
      headers: user.authHeader,
      ip: user.ip,
    });

  it('1-13. confirm triggers; repeated confirm skips; ownership; spoof ignored', async () => {
    const a = await signup('ra@test.com', 'A');
    const b = await signup('rb@test.com', 'B');
    const ids = await seedUnreviewedFatigue(a.userId, 'a');

    const c1 = await confirm(a, ids[0]);
    expect(c1.statusCode).toBe(200);
    expect(c1.json?.signal?.payload?.user_status).toBe('confirmed');
    expect(c1.json?.pattern_reevaluation_status).toBe('completed');
    expect(c1.json?.pattern_reevaluation_reason).toBe('evidence_became_eligible');

    const c2 = await confirm(a, ids[0]);
    expect(c2.statusCode).toBe(200);
    expect(c2.json?.pattern_reevaluation_status).toBe('skipped');
    expect(c2.json?.pattern_reevaluation_reason).toBe('no_eligible_change');

    for (const id of ids.slice(1)) {
      const r = await confirm(a, id);
      expect(r.statusCode).toBe(200);
    }
    const listed = await listPatternsApi(a);
    const keys = (listed.json?.candidates || []).map((c) => c.candidate_key);
    expect(new Set(keys).size).toBe(keys.length);

    const listB = await listPatternsApi(b);
    expect(listB.json?.candidates || []).toHaveLength(0);

    const spoof = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${ids[0]}/confirm?user_id=${b.userId}`,
      headers: { ...a.authHeader, 'x-user-id': b.userId, 'x-luna-mobile-id': 'dev-b' },
      body: { user_id: b.userId, window_days: 9999 },
      ip: b.ip,
    });
    expect(spoof.statusCode).toBe(200);
    expect(spoof.json?.signal?.user_id).toBe(a.userId);

    const cross = await confirm(b, ids[0]);
    expect(cross.statusCode).toBe(404);
  });

  it('14-18. correct triggers; original_extraction preserved; effective value used', async () => {
    const user = await signup('corr@test.com');
    const ids = await seedUnreviewedFatigue(user.userId, 'c');
    const r1 = await correct(user, ids[0], {
      signal_type: 'energy',
      normalized_value: 'low_energy',
      negated: false,
      uncertain: false,
    });
    expect(r1.statusCode).toBe(200);
    expect(r1.json?.signal?.payload?.user_status).toBe('corrected');
    expect(r1.json?.signal?.payload?.original_extraction).toBeTruthy();
    expect(r1.json?.signal?.payload?.original_extraction?.normalized_value).toBe('fatigue');
    expect(r1.json?.pattern_reevaluation_status).toBe('completed');

    const r2 = await correct(user, ids[0], {
      signal_type: 'energy',
      normalized_value: 'fatigue',
      negated: false,
      uncertain: false,
    });
    expect(r2.statusCode).toBe(200);
    expect(r2.json?.pattern_reevaluation_status).toBe('completed');
    expect(r2.json?.pattern_reevaluation_reason).toBe('evidence_changed');
  });

  it('19-24. reject confirmed triggers; unreviewed reject skips; invalidation when evidence collapses', async () => {
    const user = await signup('rej@test.com');
    const ids = await seedUnreviewedFatigue(user.userId, 'rj');
    for (const id of ids) {
      expect((await confirm(user, id)).statusCode).toBe(200);
    }
    let listed = await listPatternsApi(user);
    expect(listed.statusCode).toBe(200);
    const beforeKeys = (listed.json?.candidates || []).map((c) => c.candidate_key);
    expect(beforeKeys.length).toBeGreaterThan(0);

    const rej = await reject(user, ids[0]);
    expect(rej.statusCode).toBe(200);
    expect(rej.json?.pattern_reevaluation_status).toBe('completed');
    expect(rej.json?.pattern_reevaluation_reason).toBe('evidence_removed');

    for (const id of ids.slice(1)) {
      await reject(user, id);
    }
    listed = await listPatternsApi(user);
    const active = (listed.json?.candidates || []).filter((c) => c.status === 'candidate' || c.status === 'confirmed');
    expect(active.length).toBe(0);

    // Unreviewed → rejected: never eligible Task 5 evidence → skip (unit decision)
    const unrev = {
      event_type: 'signal',
      deleted_at: null,
      occurred_at: '2026-05-01T12:00:00.000Z',
      payload: { user_status: 'unreviewed', signal_type: 'energy', normalized_value: 'fatigue', negated: false, uncertain: false },
    };
    const rejected = {
      ...unrev,
      payload: { ...unrev.payload, user_status: 'rejected' },
    };
    const skipDec = shouldReevaluateAfterMutation({
      before_signal: unrev,
      after_signal: rejected,
      mutation_type: 'reject',
    });
    expect(skipDec.should_reevaluate).toBe(false);
    expect(skipDec.reason).toBe('no_eligible_change');
  });

  it('25-30. soft-delete confirmed triggers; unreviewed/rejected/non-signal skip', async () => {
    const user = await signup('del@test.com');
    const ids = await seedUnreviewedFatigue(user.userId, 'd');
    // Confirm via API so handler store owns the rows
    for (const id of ids) {
      const r = await confirm(user, id);
      expect(r.statusCode).toBe(200);
    }

    const del = await softDelete(user, ids[0]);
    expect(del.statusCode).toBe(200);
    expect(del.json?.pattern_reevaluation_status).toBe('completed');
    expect(del.json?.pattern_reevaluation_reason).toBe('evidence_removed');

    // Unreviewed soft-delete: both fingerprints ineligible → skip (unit decision)
    const unrev = {
      event_type: 'signal',
      deleted_at: null,
      occurred_at: '2026-05-01T12:00:00.000Z',
      payload: { user_status: 'unreviewed', signal_type: 'energy', normalized_value: 'fatigue', negated: false, uncertain: false },
    };
    const unrevDel = shouldReevaluateAfterMutation({
      before_signal: unrev,
      after_signal: { ...unrev, deleted_at: '2026-06-01T00:00:00.000Z' },
      mutation_type: 'soft_delete',
    });
    expect(unrevDel.should_reevaluate).toBe(false);

    // Rejected soft-delete skip
    const rejEv = { ...unrev, payload: { ...unrev.payload, user_status: 'rejected' } };
    expect(
      shouldReevaluateAfterMutation({
        before_signal: rejEv,
        after_signal: { ...rejEv, deleted_at: '2026-06-01T00:00:00.000Z' },
        mutation_type: 'soft_delete',
      }).should_reevaluate,
    ).toBe(false);

    // Non-signal observation via API
    const obsCreate = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: {
        raw_text: 'hello note only',
        observation_kind: 'note',
        input_mode: 'text',
        source_surface: 'other',
        extract: false,
      },
      ip: user.ip,
    });
    expect(obsCreate.statusCode).toBe(200);
    const obsId = obsCreate.json?.observation?.id;
    const delObs = await softDelete(user, obsId);
    expect(delObs.statusCode).toBe(200);
    expect(delObs.json?.pattern_reevaluation_status).toBe('skipped');
    expect(delObs.json?.pattern_reevaluation_reason).toBe('non_signal_event');
  });

  it('31-36. fingerprint: metadata-only / raw_text do not change eligibility fingerprint', () => {
    const base = {
      event_type: 'signal',
      deleted_at: null,
      occurred_at: '2026-05-01T12:00:00.000Z',
      payload: {
        user_status: 'confirmed',
        signal_type: 'energy',
        normalized_value: 'fatigue',
        negated: false,
        uncertain: false,
        evidence_text: 'SECRET',
      },
    };
    const a = buildEvidenceFingerprint(base);
    const b = buildEvidenceFingerprint({
      ...base,
      payload: { ...base.payload, evidence_text: 'OTHER', display_label: 'X' },
    });
    expect(a).toBe(b);
    expect(a).not.toMatch(/SECRET|OTHER/);

    const decision = shouldReevaluateAfterMutation({
      before_signal: base,
      after_signal: { ...base, payload: { ...base.payload, evidence_text: 'OTHER' } },
      mutation_type: 'confirm',
    });
    expect(decision.should_reevaluate).toBe(false);
    expect(decision.reason).toBe('no_eligible_change');
  });

  it('37-42. failure isolation: confirm persists when re-evaluation fails', async () => {
    const user = await signup('fail@test.com');
    const [sid] = await seedUnreviewedFatigue(user.userId, 'f');
    const before = await store.getOwned(user.userId, sid);
    const confirmed = await (await import('../../server/core/observationSignalsService.mjs')).confirmSignalForUser(
      store,
      user.userId,
      sid,
    );
    expect(confirmed.signal.payload.user_status).toBe('confirmed');

    const meta = await runPatternReevaluationAfterMutation({
      store: null,
      userId: user.userId,
      before_signal: before,
      after_signal: confirmed.signal,
      mutation_type: 'confirm',
    });
    expect(meta.pattern_reevaluation_status).toBe('failed');
    const still = await store.getOwned(user.userId, sid);
    expect(still.payload.user_status).toBe('confirmed');
  });

  it('43-50. bounds fixed; no client override; no duplicate candidates; no mutex', async () => {
    expect(PATTERN_REEVAL_LOOKBACK_DAYS).toBe(PATTERN_EVAL_DEFAULT_WINDOW_DAYS);
    const src = await fs.readFile(path.join(process.cwd(), 'server/core/patternReevaluationService.mjs'), 'utf8');
    expect(src).toMatch(/window_days: PATTERN_REEVAL_LOOKBACK_DAYS/);
    expect(src).not.toMatch(/rawOptions\.window_days|body\.window_days|body\.thresholds/);
    expect(src).not.toMatch(/Mutex|mutex|lock\(/);

    const user = await signup('idem@test.com');
    const ids = await seedUnreviewedFatigue(user.userId, 'i');
    for (const id of ids) await confirm(user, id);
    const r1 = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const r2 = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    expect(r2.created_count).toBe(0);
    const keys1 = r1.candidates.map((c) => c.candidate_key).sort();
    const keys2 = r2.candidates.map((c) => c.candidate_key).sort();
    expect(keys1).toEqual(keys2);
  });

  it('51-53. Task 7 unreviewed extract does not trigger; later confirm does', async () => {
    process.env.LUNA_LIVE_MEMORY_WRITE_ENABLED = 'true';
    const { __setGenerateContentForTests, __resetGenerateContentForTests } = await import(
      '../../server/core/observationSignalsService.mjs'
    );
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          {
            signal_type: 'energy',
            normalized_value: 'fatigue',
            display_label: 'Fatigue',
            confidence: 0.9,
            evidence_text: 'exhausted',
            negated: false,
            uncertain: false,
            recurrence_marker: false,
          },
        ],
      }),
    );

    const user = await signup('t7int@test.com');
    const consentOn = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory-consent/enable',
      headers: user.authHeader,
      body: { source_surface: 'test' },
      ip: user.ip,
    });
    expect(consentOn.statusCode).toBe(200);
    const voice = await invoke(handler, {
      method: 'POST',
      path: '/api/voice/respond',
      headers: { ...user.authHeader, 'x-luna-ai-consent': '1' },
      body: {
        transcript: 'I am exhausted again today.',
        lang: 'en',
        withAudio: false,
        client_message_id: 't7reevalmsg01',
        mode: 'live',
      },
      ip: user.ip,
    });
    expect(voice.statusCode).toBe(200);
    expect(voice.json?.memory_write_status).toMatch(/written|already_exists|completed|extraction_/);
    // Voice respond must not include pattern reevaluation meta
    expect(voice.json?.pattern_reevaluation_status).toBeUndefined();

    const listSig = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/signals',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(listSig.statusCode).toBe(200);
    const unreviewed = (listSig.json?.events || []).filter((e) => e.payload?.user_status === 'unreviewed');
    expect(unreviewed.length).toBeGreaterThanOrEqual(1);

    const conf = await confirm(user, unreviewed[0].id);
    expect(conf.statusCode).toBe(200);
    expect(conf.json?.pattern_reevaluation_status).toBe('completed');
    __resetGenerateContentForTests();
  });

  it('54-65. Task 6 interaction + privacy + architecture', async () => {
    const user = await signup('t6@test.com');
    const ids = await seedUnreviewedFatigue(user.userId, 't6');
    for (const id of ids) await confirm(user, id);
    await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });

    const pack = await buildPersonalContextPack({
      store,
      userId: user.userId,
      messageText: 'I feel exhausted',
      timezone: 'UTC',
    });
    expect(pack.confirmed_patterns.every((p) => p.status === 'confirmed')).toBe(true);
    expect(pack.confirmed_patterns.some((p) => p.status === 'candidate')).toBe(false);

    const src = await fs.readFile(path.join(process.cwd(), 'server/core/patternReevaluationService.mjs'), 'utf8');
    expect(src).toMatch(/evaluatePatternCandidates/);
    expect(src).not.toMatch(/from ['"]@google/);
    expect(src).not.toMatch(/\bGoogleGenAI\b/);
    expect(src).not.toMatch(/\bpinecone\b|\bopenai\b|\bembedding\b|\bvector\b/i);
    expect(src).toMatch(/PATTERN_REEVAL_LOOKBACK_DAYS/);
    expect(PATTERN_REEVAL_VERSION).toBe('pattern_reeval_v1');

    const log = JSON.stringify({
      pattern_reevaluation_status: 'completed',
      reason: 'evidence_became_eligible',
      affected_signal_type_count: 1,
    });
    expect(log).not.toMatch(/fatigue|exhausted|SECRET/i);
  });
});
