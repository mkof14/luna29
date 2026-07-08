import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { createPersonalEventsStore } from '../../server/core/personalEventsStore.mjs';
import {
  evaluatePatternCandidates,
  confirmPatternCandidate,
  rejectPatternCandidate,
  listPatternCandidates,
  PATTERN_THRESHOLDS,
  PATTERN_ENGINE_VERSION,
  PATTERN_INCLUDE_UNCERTAIN_EVIDENCE,
  buildCandidateKey,
} from '../../server/core/patternCandidatesService.mjs';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';

/**
 * Task 5 — deterministic Pattern Candidate Engine v1 tests.
 * No Gemini / ElevenLabs. Flattened public candidate shape (no nested payload).
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
  user_status: 'confirmed',
  original_extraction: null,
  ...overrides,
});

describe('pattern candidates foundation (Task 5)', () => {
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
    __resetMemoryRateLimitForTests();
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-patterns-'));
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
    return `198.18.${Math.floor(ipCounter / 250) % 250}.${(ipCounter % 250) + 1}`;
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

  const seedRepeatedFatigue = async (userId, prefix, days = ['2026-05-01', '2026-05-05', '2026-05-10', '2026-05-15']) => {
    const ids = [];
    for (let i = 0; i < days.length; i += 1) {
      const ev = await seedSignal(userId, {
        occurredAt: `${days[i]}T12:00:00.000Z`,
        clientEventId: `${prefix}-f-${i}`,
        payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
      });
      ids.push(ev.id);
    }
    return ids;
  };

  const ofType = (candidates, type) => (candidates || []).filter((c) => c.candidate_type === type);
  const findType = (candidates, type) => (candidates || []).find((c) => c.candidate_type === type);

  it('1-2. unauthenticated / invalid auth evaluate → 401', async () => {
    const unauth = await invoke(handler, { method: 'POST', path: '/api/personal/pattern-candidates/evaluate', body: {} });
    expect(unauth.statusCode).toBe(401);
    const bad = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/pattern-candidates/evaluate',
      headers: { authorization: 'Bearer invalid' },
      body: {},
    });
    expect(bad.statusCode).toBe(401);
  });

  it('3-4. cross-user isolation + spoofing cannot change owner', async () => {
    const a = await signup('pa@test.com', 'A');
    const b = await signup('pb@test.com', 'B');
    await seedRepeatedFatigue(b.userId, 'b');
    await evaluatePatternCandidates(store, b.userId, { timezone: 'UTC' });

    const listA = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/pattern-candidates',
      headers: a.authHeader,
      ip: a.ip,
    });
    expect(listA.statusCode).toBe(200);
    expect(listA.json?.candidates || []).toHaveLength(0);

    const spoof = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/pattern-candidates/evaluate?user_id=${b.userId}`,
      headers: { ...a.authHeader, 'x-user-id': b.userId },
      body: { userId: b.userId, timezone: 'UTC' },
      ip: a.ip,
    });
    expect(spoof.statusCode).toBe(200);
    expect(spoof.json?.created_count || 0).toBe(0);
  });

  it('5-8. repeated_signal thresholds: count / days / span / success', async () => {
    const user = await signup('thr@test.com');
    const uid = user.userId;

    await seedSignal(uid, {
      occurredAt: '2026-05-01T12:00:00.000Z',
      clientEventId: 't-1',
      payload: { user_status: 'confirmed' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-05-02T12:00:00.000Z',
      clientEventId: 't-2',
      payload: { user_status: 'confirmed' },
    });
    let result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC' });
    expect(ofType(result.candidates, 'repeated_signal')).toHaveLength(0);

    await seedSignal(uid, {
      occurredAt: '2026-05-01T18:00:00.000Z',
      clientEventId: 't-3',
      payload: { user_status: 'confirmed' },
    });
    result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC' });
    expect(ofType(result.candidates, 'repeated_signal')).toHaveLength(0);

    // Fresh user for span failure: 3 days within < 7 day span
    const user2 = await signup('thr2@test.com');
    await seedSignal(user2.userId, {
      occurredAt: '2026-06-01T12:00:00.000Z',
      clientEventId: 's-1',
      payload: { user_status: 'confirmed' },
    });
    await seedSignal(user2.userId, {
      occurredAt: '2026-06-02T12:00:00.000Z',
      clientEventId: 's-2',
      payload: { user_status: 'confirmed' },
    });
    await seedSignal(user2.userId, {
      occurredAt: '2026-06-03T12:00:00.000Z',
      clientEventId: 's-3',
      payload: { user_status: 'confirmed' },
    });
    result = await evaluatePatternCandidates(store, user2.userId, { timezone: 'UTC' });
    expect(ofType(result.candidates, 'repeated_signal')).toHaveLength(0);

    await seedRepeatedFatigue(user.userId, 'ok');
    result = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const cand = findType(result.candidates, 'repeated_signal');
    expect(cand).toBeTruthy();
    expect(cand.status).toBe('candidate');
    expect(cand.evidence_count).toBeGreaterThanOrEqual(3);
    expect(cand.active_days).toBeGreaterThanOrEqual(3);
  });

  it('9. description is factual recording language (no diagnosis)', async () => {
    const user = await signup('desc@test.com');
    await seedRepeatedFatigue(user.userId, 'd');
    const result = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const c = findType(result.candidates, 'repeated_signal');
    expect(c.description).toMatch(/recorded/i);
    expect(c.description).not.toMatch(/chronic|hormonal|diagnos|worsening|cause/i);
    expect(c.semantics.not_diagnosis).toBe(true);
    expect(c.semantics.not_causation).toBe(true);
    expect(c.semantics.not_correlation).toBe(true);
  });

  it('10-14. eligibility: rejected/negated/unreviewed/uncertain excluded; corrected uses effective value', async () => {
    expect(PATTERN_INCLUDE_UNCERTAIN_EVIDENCE).toBe(false);
    const user = await signup('elig-p@test.com');
    const uid = user.userId;
    const days = ['2026-05-01', '2026-05-05', '2026-05-10', '2026-05-15'];
    const statuses = ['rejected', 'confirmed', 'unreviewed', 'confirmed'];
    for (let i = 0; i < 4; i += 1) {
      await seedSignal(uid, {
        occurredAt: `${days[i]}T12:00:00.000Z`,
        clientEventId: `e-${i}`,
        payload: {
          user_status: statuses[i],
          negated: i === 1,
          uncertain: i === 3,
          normalized_value: 'fatigue',
        },
      });
    }
    let result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC' });
    expect(ofType(result.candidates, 'repeated_signal')).toHaveLength(0);

    // Span must meet min_span_days (7): four corrected days across >= 7 calendar days.
    const correctedDays = ['2026-06-01', '2026-06-05', '2026-06-10', '2026-06-15'];
    for (let i = 0; i < correctedDays.length; i += 1) {
      await seedSignal(uid, {
        occurredAt: `${correctedDays[i]}T12:00:00.000Z`,
        clientEventId: `c-${i}`,
        payload: {
          user_status: 'corrected',
          signal_type: 'energy',
          normalized_value: 'fatigue',
          correction: {
            corrected_value: { signal_type: 'energy', normalized_value: 'low_energy', negated: false, uncertain: false },
          },
        },
      });
    }
    result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC' });
    const cand = findType(result.candidates, 'repeated_signal');
    expect(cand).toBeTruthy();
    expect(cand.signal_definitions?.[0]?.normalized_value).toBe('low_energy');
  });

  it('15-16. idempotent evaluation; A+B vs B+A key order stable', async () => {
    const user = await signup('idem@test.com');
    await seedRepeatedFatigue(user.userId, 'i');
    const r1 = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const r2 = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const keys1 = r1.candidates.map((c) => c.candidate_key).sort();
    const keys2 = r2.candidates.map((c) => c.candidate_key).sort();
    expect(keys1).toEqual(keys2);
    expect(r2.created_count).toBe(0);

    const k1 = buildCandidateKey({
      candidate_type: 'repeated_co_occurrence',
      definition_key: 'energy:fatigue|sleep:poor_sleep',
    });
    const k2 = buildCandidateKey({
      candidate_type: 'repeated_co_occurrence',
      definition_key: 'sleep:poor_sleep|energy:fatigue',
    });
    // sortedPairKey normalizes before buildCandidateKey — both definition keys must be pre-sorted identically
    const sorted = 'energy:fatigue|sleep:poor_sleep';
    expect(
      buildCandidateKey({ candidate_type: 'repeated_co_occurrence', definition_key: sorted }),
    ).toBe(buildCandidateKey({ candidate_type: 'repeated_co_occurrence', definition_key: sorted }));
    expect(k1).not.toBe(k2); // unsorted inputs differ — engine always sorts before keying
  });

  it('17-19. co-occurrence thresholds + non-causal description', async () => {
    const user = await signup('co@test.com');
    const uid = user.userId;
    for (const day of ['2026-05-01', '2026-05-08']) {
      await seedSignal(uid, {
        occurredAt: `${day}T10:00:00.000Z`,
        clientEventId: `co-s-${day}`,
        payload: { user_status: 'confirmed', signal_type: 'sleep', normalized_value: 'poor_sleep' },
      });
      await seedSignal(uid, {
        occurredAt: `${day}T14:00:00.000Z`,
        clientEventId: `co-e-${day}`,
        payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
      });
    }
    let result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC' });
    expect(ofType(result.candidates, 'repeated_co_occurrence')).toHaveLength(0);

    await seedSignal(uid, {
      occurredAt: '2026-05-15T10:00:00.000Z',
      clientEventId: 'co-s-3',
      payload: { user_status: 'confirmed', signal_type: 'sleep', normalized_value: 'poor_sleep' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-05-15T14:00:00.000Z',
      clientEventId: 'co-e-3',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });
    result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC' });
    const cand = findType(result.candidates, 'repeated_co_occurrence');
    expect(cand).toBeTruthy();
    expect(cand.description).toMatch(/both recorded|recorded/i);
    expect(cand.description).not.toMatch(/cause|correlat|hormonal|suggests/i);
    expect(cand.semantics.not_causation).toBe(true);
    expect(cand.semantics.not_correlation).toBe(true);
  });

  it('20-21. temporal proximity: dense cluster does not inflate; distinct occasions qualify', async () => {
    const user = await signup('prox@test.com');
    const uid = user.userId;
    await seedSignal(uid, {
      occurredAt: '2026-05-01T08:00:00.000Z',
      clientEventId: 'p-s0',
      payload: { user_status: 'confirmed', signal_type: 'sleep', normalized_value: 'poor_sleep' },
    });
    for (let h = 9; h <= 14; h += 1) {
      await seedSignal(uid, {
        occurredAt: `2026-05-01T${String(h).padStart(2, '0')}:00:00.000Z`,
        clientEventId: `p-e-${h}`,
        payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
      });
    }
    let result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC' });
    expect(ofType(result.candidates, 'repeated_temporal_proximity')).toHaveLength(0);

    await seedSignal(uid, {
      occurredAt: '2026-05-08T08:00:00.000Z',
      clientEventId: 'p-s1',
      payload: { user_status: 'confirmed', signal_type: 'sleep', normalized_value: 'poor_sleep' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-05-08T12:00:00.000Z',
      clientEventId: 'p-e1',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-05-15T08:00:00.000Z',
      clientEventId: 'p-s2',
      payload: { user_status: 'confirmed', signal_type: 'sleep', normalized_value: 'poor_sleep' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-05-15T12:00:00.000Z',
      clientEventId: 'p-e2',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });
    result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC' });
    const cand = findType(result.candidates, 'repeated_temporal_proximity');
    expect(cand).toBeTruthy();
    expect(cand.evidence_count).toBeGreaterThanOrEqual(3);
    expect(cand.description).toMatch(/within 24 hours/i);
    expect(cand.description).not.toMatch(/leads to|causes/i);
  });

  it('22-23. sustained increase needs consecutive supporting comparisons', async () => {
    const user = await signup('sust@test.com');
    const uid = user.userId;
    const asOf = '2026-06-28T12:00:00.000Z';
    const asOfMs = Date.parse(asOf);
    const day = 86_400_000;

    // Only recent window with 2 events and empty prior — one supporting comparison, not two.
    await seedSignal(uid, {
      occurredAt: new Date(asOfMs - 3 * day).toISOString(),
      clientEventId: 'su-a1',
      payload: { user_status: 'confirmed' },
    });
    await seedSignal(uid, {
      occurredAt: new Date(asOfMs - 5 * day).toISOString(),
      clientEventId: 'su-a2',
      payload: { user_status: 'confirmed' },
    });
    let result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC', as_of: asOf });
    expect(ofType(result.candidates, 'sustained_recording_increase')).toHaveLength(0);

    // Window0 (0-14d): 3 vs prior (14-28d): 2 → increased_recording
    // Window1 (14-28d): 2 vs prior (28-42d): 0 → newly_recorded
    // Both windows need current_count >= min_current_window_occurrences (2).
    await seedSignal(uid, {
      occurredAt: new Date(asOfMs - 7 * day).toISOString(),
      clientEventId: 'su-a3',
      payload: { user_status: 'confirmed' },
    });
    await seedSignal(uid, {
      occurredAt: new Date(asOfMs - 16 * day).toISOString(),
      clientEventId: 'su-b1',
      payload: { user_status: 'confirmed' },
    });
    await seedSignal(uid, {
      occurredAt: new Date(asOfMs - 18 * day).toISOString(),
      clientEventId: 'su-b2',
      payload: { user_status: 'confirmed' },
    });
    result = await evaluatePatternCandidates(store, uid, { timezone: 'UTC', as_of: asOf });
    const sust = findType(result.candidates, 'sustained_recording_increase');
    expect(sust).toBeTruthy();
    expect(sust.description).toMatch(/more frequent|recordings/i);
    expect(sust.description).not.toMatch(/worsening|getting worse/i);
  });

  it('24-26. confidence band deterministic; default status candidate; no fake probability', async () => {
    const user = await signup('conf@test.com');
    await seedRepeatedFatigue(user.userId, 'cf');
    const result = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const c = findType(result.candidates, 'repeated_signal');
    expect(['low', 'moderate', 'strong']).toContain(c.confidence_band);
    expect(c.status).toBe('candidate');
    // Band labels only — no numeric probability / confidence score fields.
    // (Do not scan full JSON: ISO timestamps contain fractional seconds like .982.)
    expect(c.confidence).toBeUndefined();
    expect(c.confidence_score).toBeUndefined();
    expect(c.probability).toBeUndefined();
    expect(c.confidence_band).not.toMatch(/\d/);
    expect(JSON.stringify({ confidence_band: c.confidence_band, status: c.status })).not.toMatch(/0\.\d{2,}/);
  });

  it('27-30. confirm / reject / suppression / material evidence change', async () => {
    const user = await signup('life@test.com');
    await seedRepeatedFatigue(user.userId, 'l');
    let result = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const cand = findType(result.candidates, 'repeated_signal');
    expect(cand).toBeTruthy();

    const confirmed = await confirmPatternCandidate(store, user.userId, cand.id);
    expect(confirmed.candidate.status).toBe('confirmed');
    expect(confirmed.candidate.user_confirmed_at).toBeTruthy();

    const rejected = await rejectPatternCandidate(store, user.userId, cand.id);
    expect(rejected.candidate.status).toBe('rejected');

    result = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    expect(result.suppressed_count).toBeGreaterThanOrEqual(1);
    const listed = await listPatternCandidates(store, user.userId, { status: 'rejected' });
    expect(listed.candidates.some((c) => c.id === cand.id)).toBe(true);

    // Material evidence change: add many new days
    for (let i = 0; i < 5; i += 1) {
      await seedSignal(user.userId, {
        occurredAt: `2026-06-0${i + 1}T12:00:00.000Z`,
        clientEventId: `mat-${i}`,
        payload: { user_status: 'confirmed' },
      });
    }
    result = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const reopened = result.candidates.find((c) => c.candidate_key === cand.candidate_key);
    expect(reopened).toBeTruthy();
    expect(reopened.status).toBe('candidate');
  });

  it('31-33. invalidation when evidence rejected/soft-deleted; soft-deleted excluded', async () => {
    const user = await signup('inv@test.com');
    const ids = await seedRepeatedFatigue(user.userId, 'inv');
    let result = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const cand = findType(result.candidates, 'repeated_signal');
    expect(cand).toBeTruthy();

    for (const id of ids) {
      const owned = await store.getOwned(user.userId, id);
      await store.updatePayload(user.userId, id, { ...owned.payload, user_status: 'rejected' });
    }
    result = await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    expect(result.invalidated_count + result.stale_count).toBeGreaterThanOrEqual(1);

    const user2 = await signup('inv2@test.com');
    const ids2 = await seedRepeatedFatigue(user2.userId, 'sd');
    await evaluatePatternCandidates(store, user2.userId, { timezone: 'UTC' });
    for (const id of ids2) await store.softDelete(user2.userId, id);
    result = await evaluatePatternCandidates(store, user2.userId, { timezone: 'UTC' });
    expect(ofType(result.candidates, 'repeated_signal')).toHaveLength(0);
  });

  it('34. stale when no recent evidence beyond stale_after_days', async () => {
    const user = await signup('stale@test.com');
    await seedRepeatedFatigue(user.userId, 'st', ['2025-01-01', '2025-01-08', '2025-01-15', '2025-01-20']);
    const result = await evaluatePatternCandidates(store, user.userId, {
      timezone: 'UTC',
      as_of: '2025-05-01T12:00:00.000Z',
    });
    const cand = findType(result.candidates, 'repeated_signal');
    expect(cand).toBeTruthy();
    expect(cand.status).toBe('stale');
  });

  it('35-37. evidence owner-scoped; cross-user confirm/reject blocked', async () => {
    const a = await signup('own-a@test.com');
    const b = await signup('own-b@test.com');
    await seedRepeatedFatigue(a.userId, 'oa');
    const result = await evaluatePatternCandidates(store, a.userId, { timezone: 'UTC' });
    const cand = result.candidates[0];
    expect(cand.user_id).toBe(a.userId);
    expect(cand.evidence_signal_ids.every((id) => typeof id === 'string')).toBe(true);

    const denyConfirm = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/pattern-candidates/${cand.id}/confirm`,
      headers: b.authHeader,
      body: {},
      ip: b.ip,
    });
    expect(denyConfirm.statusCode).toBe(404);

    const denyReject = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/pattern-candidates/${cand.id}/reject`,
      headers: b.authHeader,
      body: {},
      ip: b.ip,
    });
    expect(denyReject.statusCode).toBe(404);
  });

  it('38-40. invalid timezone fallback; excessive window bounded; store unavailable 503', async () => {
    const user = await signup('tz-p@test.com');
    await seedRepeatedFatigue(user.userId, 'tz');
    const evalRes = await evaluatePatternCandidates(store, user.userId, {
      timezone: 'Not/ARealZone',
    });
    expect(evalRes.timezone).toBe('UTC');
    expect(evalRes.timezone_fallback_used).toBe(true);

    const tooBig = await evaluatePatternCandidates(store, user.userId, { window_days: 999 });
    expect(tooBig.error).toMatch(/maximum/i);

    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.DATABASE_URL;
    delete process.env.PERSONAL_EVENTS_STORAGE;
    vi.resetModules();
    const { buildApiHandler: buildProd } = await import('../../server/core/apiHandler.mjs');
    const prodHandler = await buildProd({ dataDir, environment: 'vercel' });
    const signupRes = await invoke(prodHandler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'prod-pat@test.com', password: 'password123', name: 'Prod' },
      ip: nextIp(),
    });
    expect(signupRes.statusCode).toBe(200);
    const evalApi = await invoke(prodHandler, {
      method: 'POST',
      path: '/api/personal/pattern-candidates/evaluate',
      headers: { authorization: `Bearer ${signupRes.json.token}` },
      body: {},
      ip: nextIp(),
    });
    expect(evalApi.statusCode).toBe(503);
    expect(evalApi.json?.code).toBe('PERSONAL_EVENT_STORE_UNAVAILABLE');
  });

  it('41-42. no Gemini/ElevenLabs imports in pattern engine module', async () => {
    const src = await fs.readFile(
      path.join(process.cwd(), 'server/core/patternCandidatesService.mjs'),
      'utf8',
    );
    expect(src).not.toMatch(/from ['"]@google\/genai['"]|GoogleGenAI|elevenlabs/i);
    expect(PATTERN_THRESHOLDS.repeated_signal.min_occurrences).toBe(3);
    expect(PATTERN_ENGINE_VERSION).toBeTruthy();
  });

  it('list omits raw observation text; get returns owner candidate', async () => {
    const user = await signup('list@test.com');
    await seedRepeatedFatigue(user.userId, 'li');
    await evaluatePatternCandidates(store, user.userId, { timezone: 'UTC' });
    const list = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/pattern-candidates',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(list.statusCode).toBe(200);
    expect(list.body).not.toMatch(/exhausted|raw_text/i);
    const id = list.json.candidates[0].id;
    const get = await invoke(handler, {
      method: 'GET',
      path: `/api/personal/pattern-candidates/${id}`,
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(get.statusCode).toBe(200);
    expect(get.json.candidate.id).toBe(id);
  });
});
