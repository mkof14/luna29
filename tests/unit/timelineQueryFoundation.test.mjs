import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { buildApiHandler } from '../../server/core/apiHandler.mjs';
import { createPersonalEventsStore } from '../../server/core/personalEventsStore.mjs';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';
import {
  getSignalHistory,
  getRecentChanges,
  getCoOccurrences,
  localDayKey,
  resolveTimelineTimezone,
  buildRecurrenceFacts,
} from '../../server/core/timelineQueryService.mjs';

/**
 * Task 4 — deterministic longitudinal timeline query layer.
 * No Gemini. No ElevenLabs. Auth-owned factual queries only.
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
  source_observation_id: 'obs-1',
  extraction_method: 'gemini_structured_v1',
  extractor_version: 'observation_signals_v1',
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
  correction: null,
  ...overrides,
});

describe('timeline query foundation (Task 4)', () => {
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
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-timeline-'));
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
    return `198.51.100.${(ipCounter % 200) + 1}`;
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
    expect(result.json?.session?.id).toBeTruthy();
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

  const seedObservation = async (userId, { occurredAt, clientEventId, rawText = 'source text', payload = {} }) => {
    const result = await store.create(userId, {
      event_type: 'observation',
      occurred_at: occurredAt,
      source: 'api',
      schema_version: 1,
      client_event_id: clientEventId,
      payload: {
        observation_kind: 'note',
        raw_text: rawText,
        input_mode: 'text',
        source_surface: 'other',
        language: 'en',
        transcript_status: null,
        original_event_id: null,
        session_id: null,
        ...payload,
      },
    });
    return result.event;
  };

  it('1. unauthenticated timeline request → 401', async () => {
    const res = await invoke(handler, { method: 'GET', path: '/api/personal/timeline' });
    expect(res.statusCode).toBe(401);
  });

  it('2. invalid auth → 401', async () => {
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/timeline',
      headers: { authorization: 'Bearer invalid-token' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('3. user A cannot read user B timeline', async () => {
    const a = await signup('a-tl@test.com', 'A');
    const b = await signup('b-tl@test.com', 'B');
    await seedSignal(b.userId, {
      occurredAt: '2026-06-01T12:00:00.000Z',
      clientEventId: 'b-sig-1',
      payload: { user_status: 'confirmed', signal_type: 'energy', normalized_value: 'fatigue' },
    });
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/timeline/signals/energy?timezone=UTC',
      headers: a.authHeader,
      ip: a.ip,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json?.recurrence?.occurrence_count).toBe(0);
    expect(res.json?.occurrences || []).toHaveLength(0);
  });

  it('4. body/query/header user spoofing cannot change owner', async () => {
    const a = await signup('spoof-tl@test.com');
    const b = await signup('spoof-tl-b@test.com');
    await seedSignal(a.userId, {
      occurredAt: '2026-06-02T12:00:00.000Z',
      clientEventId: 'a-sig-1',
      payload: { user_status: 'confirmed' },
    });
    const res = await invoke(handler, {
      method: 'GET',
      path: `/api/personal/timeline/signals/energy?user_id=${b.userId}&userId=${b.userId}`,
      headers: {
        ...a.authHeader,
        'x-user-id': b.userId,
        'x-luna-mobile-id': 'device-spoof',
      },
      ip: a.ip,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json?.recurrence?.occurrence_count).toBe(1);
  });

  it('5-11. eligibility: confirmed/corrected/rejected/unreviewed/negated/uncertain', async () => {
    const user = await signup('elig@test.com');
    const uid = user.userId;
    await seedSignal(uid, {
      occurredAt: '2026-06-01T10:00:00.000Z',
      clientEventId: 'e-confirmed',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-02T10:00:00.000Z',
      clientEventId: 'e-corrected',
      payload: {
        user_status: 'corrected',
        normalized_value: 'low_energy',
        original_extraction: {
          signal_type: 'energy',
          normalized_value: 'fatigue',
          display_label: 'Fatigue',
        },
      },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-03T10:00:00.000Z',
      clientEventId: 'e-rejected',
      payload: { user_status: 'rejected', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-04T10:00:00.000Z',
      clientEventId: 'e-unreviewed',
      payload: { user_status: 'unreviewed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-05T10:00:00.000Z',
      clientEventId: 'e-negated',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue', negated: true },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-06T10:00:00.000Z',
      clientEventId: 'e-uncertain',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue', uncertain: true },
    });

    const defaultHist = await getSignalHistory(store, uid, 'energy', { timezone: 'UTC' });
    expect(defaultHist.recurrence.occurrence_count).toBe(3); // confirmed, corrected, uncertain-confirmed
    expect(defaultHist.occurrences.every((o) => o.user_status !== 'rejected')).toBe(true);
    expect(defaultHist.occurrences.every((o) => o.user_status !== 'unreviewed')).toBe(true);
    expect(defaultHist.occurrences.every((o) => o.negated !== true)).toBe(true);
    expect(defaultHist.occurrences.some((o) => o.normalized_value === 'low_energy')).toBe(true);
    expect(defaultHist.occurrences.some((o) => o.uncertain === true)).toBe(true);

    const withCandidates = await getSignalHistory(store, uid, 'energy', {
      timezone: 'UTC',
      include_candidates: true,
    });
    expect(withCandidates.recurrence.occurrence_count).toBe(4); // + unreviewed
    expect(withCandidates.occurrences.some((o) => o.user_status === 'unreviewed')).toBe(true);

    // Negated must not increment positive fatigue count
    const fatigueOnly = await getSignalHistory(store, uid, 'energy', {
      timezone: 'UTC',
      subtype: 'fatigue',
    });
    expect(fatigueOnly.occurrences.every((o) => o.negated !== true)).toBe(true);
    expect(fatigueOnly.negation_distribution.negated).toBeGreaterThanOrEqual(1);
  });

  it('12-16. first/latest/count/active-days/repeated threshold', async () => {
    const user = await signup('recur@test.com');
    const uid = user.userId;
    await seedSignal(uid, {
      occurredAt: '2026-06-01T08:00:00.000Z',
      clientEventId: 'r1',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-01T20:00:00.000Z',
      clientEventId: 'r2',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-03T12:00:00.000Z',
      clientEventId: 'r3',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-05T12:00:00.000Z',
      clientEventId: 'r4',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });

    const hist = await getSignalHistory(store, uid, 'energy', {
      timezone: 'UTC',
      subtype: 'fatigue',
      repeated_threshold: 2,
    });
    expect(hist.recurrence.first_occurred_at).toBe('2026-06-01T08:00:00.000Z');
    expect(hist.recurrence.latest_occurred_at).toBe('2026-06-05T12:00:00.000Z');
    expect(hist.recurrence.occurrence_count).toBe(4);
    expect(hist.recurrence.active_days).toBe(3);
    expect(hist.recurrence.repeated).toBe(true);
    expect(hist.recurrence.repeated_threshold).toBe(2);
    expect(hist.recurrence.semantics).toBe('numeric_recurrence_fact');
  });

  it('17. “for three days” does not fabricate three events', async () => {
    const user = await signup('duration@test.com');
    await seedSignal(user.userId, {
      occurredAt: '2026-06-10T12:00:00.000Z',
      clientEventId: 'd1',
      payload: {
        user_status: 'confirmed',
        temporal_context: {
          expression: 'for three days',
          kind: 'duration',
          normalized: { value: 3, unit: 'day' },
          confidence: 0.95,
        },
      },
    });
    const hist = await getSignalHistory(store, user.userId, 'energy', { timezone: 'UTC' });
    expect(hist.recurrence.occurrence_count).toBe(1);
    expect(hist.notes.duration_expressions_do_not_fabricate_daily_events).toBe(true);
  });

  it('18. vague “recently” does not invent a start date', async () => {
    const user = await signup('vague@test.com');
    await seedSignal(user.userId, {
      occurredAt: '2026-06-11T12:00:00.000Z',
      clientEventId: 'v1',
      payload: {
        user_status: 'confirmed',
        temporal_context: {
          expression: 'recently',
          kind: 'vague',
          normalized: null,
          confidence: 0.4,
        },
      },
    });
    const hist = await getSignalHistory(store, user.userId, 'energy', { timezone: 'UTC' });
    expect(hist.temporal_expressions[0].kind).toBe('vague');
    expect(hist.temporal_expressions[0].normalized).toBeNull();
    expect(hist.notes.vague_temporal_does_not_invent_start_date).toBe(true);
  });

  it('19. same-local-day grouping respects timezone', async () => {
    // 2026-06-01T02:00Z is still 2026-05-31 in America/Los_Angeles
    const dayUtc = localDayKey('2026-06-01T02:00:00.000Z', 'UTC');
    const dayLa = localDayKey('2026-06-01T02:00:00.000Z', 'America/Los_Angeles');
    expect(dayUtc).toBe('2026-06-01');
    expect(dayLa).toBe('2026-05-31');
  });

  it('20. invalid IANA timezone falls back to UTC', async () => {
    const resolved = resolveTimelineTimezone('Not/A_Real_Zone');
    expect(resolved.timezone).toBe('UTC');
    expect(resolved.fallback_used).toBe(true);
    expect(resolved.invalid_rejected).toBe(true);

    const user = await signup('tz@test.com');
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/timeline?timezone=Not/A_Real_Zone',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json?.timezone).toBe('UTC');
    expect(res.json?.timezone_fallback_used).toBe(true);
  });

  it('21-23. recent 14-day vs prior 14-day comparison + classifications', async () => {
    const user = await signup('change@test.com');
    const uid = user.userId;
    const asOf = '2026-06-28T12:00:00.000Z';

    // Current window: last 14 days before asOf → [2026-06-14, 2026-06-28]
    await seedSignal(uid, {
      occurredAt: '2026-06-20T12:00:00.000Z',
      clientEventId: 'c1',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-22T12:00:00.000Z',
      clientEventId: 'c2',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-25T12:00:00.000Z',
      clientEventId: 'c3',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-27T12:00:00.000Z',
      clientEventId: 'c4',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });
    // Previous window: [2026-05-31, 2026-06-14)
    await seedSignal(uid, {
      occurredAt: '2026-06-05T12:00:00.000Z',
      clientEventId: 'p1',
      payload: { user_status: 'confirmed', normalized_value: 'fatigue' },
    });

    const changes = await getRecentChanges(store, uid, {
      signal_type: 'energy',
      subtype: 'fatigue',
      window_days: 14,
      as_of: asOf,
      timezone: 'UTC',
    });
    expect(changes.current_count).toBe(4);
    expect(changes.previous_count).toBe(1);
    expect(changes.absolute_delta).toBe(3);
    expect(changes.recording_change).toBe('increased_recording');
    expect(changes.semantics).toBe('recorded_observation_change_only');
    expect(String(changes.statement || '')).not.toMatch(/hormone|worsening|medical|cause/i);

    // Newly recorded: only current window
    const uid2 = (await signup('newrec@test.com')).userId;
    await seedSignal(uid2, {
      occurredAt: '2026-06-20T12:00:00.000Z',
      clientEventId: 'n1',
      payload: { user_status: 'confirmed', signal_type: 'sleep', normalized_value: 'poor_sleep' },
    });
    const newly = await getRecentChanges(store, uid2, {
      signal_type: 'sleep',
      window_days: 14,
      as_of: asOf,
      timezone: 'UTC',
    });
    expect(newly.recording_change).toBe('newly_recorded');
  });

  it('24-27. co-occurrence same day / within hours; reject/negate excluded', async () => {
    const user = await signup('cooc@test.com');
    const uid = user.userId;
    await seedSignal(uid, {
      occurredAt: '2026-06-15T10:00:00.000Z',
      clientEventId: 'co-a1',
      payload: {
        user_status: 'confirmed',
        signal_type: 'sleep',
        normalized_value: 'poor_sleep',
        source_observation_id: 'obs-a',
      },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-15T14:00:00.000Z',
      clientEventId: 'co-b1',
      payload: {
        user_status: 'confirmed',
        signal_type: 'energy',
        normalized_value: 'fatigue',
        source_observation_id: 'obs-b',
      },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-15T16:00:00.000Z',
      clientEventId: 'co-rej',
      payload: {
        user_status: 'rejected',
        signal_type: 'mood',
        normalized_value: 'irritability',
      },
    });
    await seedSignal(uid, {
      occurredAt: '2026-06-15T17:00:00.000Z',
      clientEventId: 'co-neg',
      payload: {
        user_status: 'confirmed',
        signal_type: 'energy',
        normalized_value: 'fatigue',
        negated: true,
      },
    });

    const sameDay = await getCoOccurrences(store, uid, {
      mode: 'same_local_day',
      signal_type_a: 'sleep',
      signal_type_b: 'energy',
      timezone: 'UTC',
    });
    expect(sameDay.semantics).toBe('co_occurrence_only');
    expect(sameDay.co_occurrences.length).toBeGreaterThanOrEqual(1);
    expect(sameDay.co_occurrences[0].co_occurrence_count).toBeGreaterThanOrEqual(1);
    expect(sameDay.not_correlation).toBe(true);
    expect(sameDay.not_causation).toBe(true);
    expect(JSON.stringify(sameDay)).not.toMatch(/"correlation"|"causation"|"medical pattern"/i);

    const within = await getCoOccurrences(store, uid, {
      mode: 'within_hours',
      within_hours: 6,
      signal_type_a: 'sleep',
      signal_type_b: 'energy',
      timezone: 'UTC',
    });
    expect(within.co_occurrences.length).toBeGreaterThanOrEqual(1);

    // Rejected mood must not co-occur with sleep (eligibility excludes rejected).
    // (Baseline test called getCoOccurrences without signal_type_a/b, which is a 400 —
    // types are required by the Task 4 contract.)
    const sleepMood = await getCoOccurrences(store, uid, {
      mode: 'same_local_day',
      signal_type_a: 'sleep',
      signal_type_b: 'mood',
      timezone: 'UTC',
    });
    expect(sleepMood.error).toBeUndefined();
    expect(sleepMood.co_occurrences).toHaveLength(0);

    // Negated confirmed fatigue is excluded from positive energy eligibility.
    const energyMood = await getCoOccurrences(store, uid, {
      mode: 'same_local_day',
      signal_type_a: 'energy',
      signal_type_b: 'mood',
      timezone: 'UTC',
    });
    expect(energyMood.co_occurrences).toHaveLength(0);

    for (const row of [...sameDay.co_occurrences, ...within.co_occurrences]) {
      for (const sample of row.sample_statuses || []) {
        expect(sample.a_status).not.toBe('rejected');
        expect(sample.b_status).not.toBe('rejected');
      }
      // within_hours rows expose a_status/b_status directly
      if (row.a_status) expect(row.a_status).not.toBe('rejected');
      if (row.b_status) expect(row.b_status).not.toBe('rejected');
      if (row.a_uncertain !== undefined) {
        // negated signals never appear as eligible partners
        expect(row).not.toHaveProperty('negated', true);
      }
    }
  });

  it('28-29. source observation provenance; cross-user blocked', async () => {
    const a = await signup('prov-a@test.com');
    const b = await signup('prov-b@test.com');
    const obs = await seedObservation(a.userId, {
      occurredAt: '2026-06-12T12:00:00.000Z',
      clientEventId: 'obs-prov',
      rawText: 'I slept terribly again',
    });
    await seedSignal(a.userId, {
      occurredAt: '2026-06-12T12:00:00.000Z',
      clientEventId: 'sig-prov',
      payload: {
        user_status: 'confirmed',
        signal_type: 'sleep',
        normalized_value: 'poor_sleep',
        source_observation_id: obs.id,
        evidence_text: 'slept terribly',
      },
    });

    const ok = await invoke(handler, {
      method: 'GET',
      path: `/api/personal/timeline/observations/${obs.id}`,
      headers: a.authHeader,
      ip: a.ip,
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json?.observation?.payload?.raw_text).toBe('I slept terribly again');
    expect(ok.json?.linked_signals?.length).toBe(1);
    expect(ok.json?.linked_signals?.[0]?.source_observation_id).toBe(obs.id);

    const denied = await invoke(handler, {
      method: 'GET',
      path: `/api/personal/timeline/observations/${obs.id}`,
      headers: b.authHeader,
      ip: b.ip,
    });
    expect(denied.statusCode).toBe(404);
    expect(denied.json?.error).toBe('Observation not found.');
    expect(denied.body).not.toContain('slept terribly');
  });

  it('30. soft-deleted event excluded', async () => {
    const user = await signup('del@test.com');
    const sig = await seedSignal(user.userId, {
      occurredAt: '2026-06-08T12:00:00.000Z',
      clientEventId: 'del-1',
      payload: { user_status: 'confirmed' },
    });
    await store.softDelete(user.userId, sig.id);
    const hist = await getSignalHistory(store, user.userId, 'energy', { timezone: 'UTC' });
    expect(hist.recurrence.occurrence_count).toBe(0);
  });

  it('31. malformed date range rejected', async () => {
    const user = await signup('dates@test.com');
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/timeline?since=not-a-date',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(res.statusCode).toBe(400);

    const inverted = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/timeline?since=2026-06-10T00:00:00.000Z&until=2026-06-01T00:00:00.000Z',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(inverted.statusCode).toBe(400);
  });

  it('32. excessive limit bounded', async () => {
    const user = await signup('limit@test.com');
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/timeline?limit=99999',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json?.limit).toBeLessThanOrEqual(200);
  });

  it('33. store unavailable → controlled 503', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.DATABASE_URL;
    delete process.env.PERSONAL_EVENTS_STORAGE;
    vi.resetModules();
    const { buildApiHandler: buildProd } = await import('../../server/core/apiHandler.mjs');
    const prodHandler = await buildProd({ dataDir, environment: 'vercel' });
    // WS1.1: users/sessions JSON blocked — signup itself fails closed.
    const signupRes = await invoke(prodHandler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email: 'prod-tl@test.com', password: 'password123', name: 'Prod' },
      ip: '198.51.100.40',
    });
    expect(signupRes.statusCode).toBe(503);
    expect(signupRes.json?.code).toBe('DURABLE_STORAGE_UNAVAILABLE');
    const tl = await invoke(prodHandler, {
      method: 'GET',
      path: '/api/personal/timeline',
      headers: { authorization: 'Bearer fake' },
      ip: '198.51.100.40',
    });
    expect(tl.statusCode).toBe(503);
    expect(tl.json?.code).toBe('DURABLE_STORAGE_UNAVAILABLE');
  });

  it('timeline list omits raw_text by default', async () => {
    const user = await signup('noraw@test.com');
    await seedObservation(user.userId, {
      occurredAt: '2026-06-09T12:00:00.000Z',
      clientEventId: 'obs-noraw',
      rawText: 'SECRET_RAW_OBSERVATION_TEXT',
    });
    const res = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/timeline?event_type=observation',
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).not.toContain('SECRET_RAW_OBSERVATION_TEXT');
    expect(res.json?.items?.[0]?.has_raw_text).toBe(true);
  });

  it('buildRecurrenceFacts is numeric only', () => {
    const facts = buildRecurrenceFacts(
      [
        { occurred_at: '2026-06-01T00:00:00.000Z', local_day: '2026-06-01', signal_id: '1' },
        { occurred_at: '2026-06-02T00:00:00.000Z', local_day: '2026-06-02', signal_id: '2' },
      ],
      { repeatedThreshold: 2, timezone: 'UTC' },
    );
    expect(facts.repeated).toBe(true);
    expect(facts.semantics).toBe('numeric_recurrence_fact');
  });
});
