import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

/**
 * Task 3 — structured observation + signal extraction foundation.
 * Uses mocked extractor responses — no live Gemini calls.
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
    ...(payload
      ? { 'content-type': 'application/json', 'content-length': String(payload.length) }
      : {}),
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

const signal = (partial) => ({
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
  ...partial,
});

describe('observation + signal extraction foundation (Task 3)', () => {
  let dataDir;
  let originalEnv;
  let buildApiHandler;
  let __setGenerateContentForTests;
  let __resetGenerateContentForTests;
  let validateExtractionPayload;
  let normalizeExtractedSignalCandidate;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = 'test';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-obs-signals-'));
    vi.resetModules();
    ({ buildApiHandler } = await import('../../server/core/apiHandler.mjs'));
    ({
      __setGenerateContentForTests,
      __resetGenerateContentForTests,
      validateExtractionPayload,
      normalizeExtractedSignalCandidate,
    } = await import('../../server/core/observationSignalsService.mjs'));
  });

  afterEach(async () => {
    __resetGenerateContentForTests?.();
    process.env = originalEnv;
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  const signup = async (handler, email, ip) => {
    const result = await invoke(handler, {
      method: 'POST',
      path: '/api/mobile/auth/signup',
      body: { email, password: 'password123', name: 'Member' },
      ip,
    });
    expect(result.statusCode).toBe(200);
    return {
      token: result.json.token,
      authHeader: { authorization: `Bearer ${result.json.token}` },
      ip,
    };
  };

  it('1. authenticated observation create succeeds', async () => {
    __setGenerateContentForTests(async () => JSON.stringify({ signals: [] }));
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs1@test.com', '198.51.100.1');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: {
        raw_text: 'I slept terribly again, I am exhausted, and my period is late.',
        observation_kind: 'voice_reflection',
        input_mode: 'voice_transcript',
        source_surface: 'voice_reflection',
        extract: false,
      },
      ip: user.ip,
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.observation?.event_type).toBe('observation');
    expect(create.json?.observation?.payload?.raw_text).toContain('slept terribly');
    expect(create.json?.observation?.payload?.observation_kind).toBe('voice_reflection');
  });

  it('2. unauthenticated observation create → 401', async () => {
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      body: { raw_text: 'hello', extract: false },
      ip: '198.51.100.2',
    });
    expect(create.statusCode).toBe(401);
  });

  it('3. user A cannot read user B observation', async () => {
    __setGenerateContentForTests(async () => JSON.stringify({ signals: [] }));
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const a = await signup(handler, 'obsa@test.com', '198.51.100.3');
    const b = await signup(handler, 'obsb@test.com', '198.51.100.4');
    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: a.authHeader,
      body: { raw_text: 'private note for A only', extract: false, client_event_id: 'a-obs-1' },
      ip: a.ip,
    });
    const listB = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/observations',
      headers: b.authHeader,
      ip: b.ip,
    });
    expect(listB.statusCode).toBe(200);
    expect(listB.json?.events?.some((e) => e.payload?.raw_text?.includes('private note for A'))).toBe(
      false,
    );
  });

  it('4. source observation persists before extraction', async () => {
    __setGenerateContentForTests(async () => {
      throw Object.assign(new Error('extraction_timeout'), { code: 'EXTRACTION_TIMEOUT' });
    });
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs4@test.com', '198.51.100.5');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'I feel exhausted today', extract: true },
      ip: user.ip,
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.observation?.payload?.raw_text).toBe('I feel exhausted today');
    expect(create.json?.signals).toEqual([]);
    expect(create.json?.extraction?.status).toBe('failed');
  });

  it('5. valid extraction creates linked signals', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          signal({
            signal_type: 'sleep',
            normalized_value: 'poor_sleep',
            display_label: 'Poor sleep',
            evidence_text: 'slept terribly',
            recurrence_marker: true,
          }),
          signal({
            signal_type: 'energy',
            normalized_value: 'fatigue',
            display_label: 'Fatigue',
            evidence_text: 'exhausted',
          }),
          signal({
            signal_type: 'cycle',
            normalized_value: 'late_period',
            display_label: 'Late period',
            evidence_text: 'period is late',
            uncertain: false,
          }),
        ],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs5@test.com', '198.51.100.6');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: {
        raw_text: 'I slept terribly again, I am exhausted, and my period is late.',
        extract: true,
      },
      ip: user.ip,
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.signals?.length).toBe(3);
    const obsId = create.json.observation.id;
    for (const s of create.json.signals) {
      expect(s.event_type).toBe('signal');
      expect(s.payload.source_observation_id).toBe(obsId);
      expect(s.payload.user_status).toBe('unreviewed');
      expect(s.payload.extraction_method).toBe('gemini_structured_v1');
    }
  });

  it('6. malformed AI output creates no signals', async () => {
    __setGenerateContentForTests(async () => 'NOT JSON {{{');
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs6@test.com', '198.51.100.7');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'I slept badly', extract: true },
      ip: user.ip,
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.observation).toBeTruthy();
    expect(create.json?.signals).toEqual([]);
    expect(create.json?.extraction?.status).toBe('failed');
  });

  it('7. extraction timeout preserves observation, creates no fabricated signals', async () => {
    __setGenerateContentForTests(async () => {
      await new Promise((r) => setTimeout(r, 50));
      throw Object.assign(new Error('extraction_timeout'), { code: 'EXTRACTION_TIMEOUT' });
    });
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs7@test.com', '198.51.100.8');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'timeout case text', extract: true },
      ip: user.ip,
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.observation?.payload?.raw_text).toBe('timeout case text');
    expect(create.json?.signals).toEqual([]);
    expect(create.json?.extraction?.reason).toBe('extraction_timeout');
  });

  it('8. unsupported signal type rejected or safely normalized', async () => {
    const bad = normalizeExtractedSignalCandidate(
      {
        signal_type: 'thyroid_failure',
        normalized_value: 'failing',
        display_label: 'Thyroid failure',
        confidence: 0.99,
        evidence_text: 'thyroid',
        negated: false,
        uncertain: false,
      },
      { sourceObservationId: 'obs-x' },
    );
    expect(bad.error).toBeTruthy();

    const validated = validateExtractionPayload(
      {
        signals: [
          {
            signal_type: 'thyroid_failure',
            normalized_value: 'failing',
            confidence: 0.99,
            evidence_text: 'x',
          },
        ],
      },
      { sourceObservationId: 'obs-x' },
    );
    expect(validated.ok).toBe(false);
    expect(validated.signals).toEqual([]);
  });

  it('9. negation preserved: I am not tired today', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          signal({
            signal_type: 'energy',
            normalized_value: 'fatigue',
            display_label: 'Fatigue',
            evidence_text: 'not tired',
            negated: true,
            temporal_context: {
              expression: 'today',
              kind: 'point',
              normalized: null,
              confidence: 0.9,
            },
          }),
        ],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs9@test.com', '198.51.100.9');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: "I'm not tired today.", extract: true },
      ip: user.ip,
    });
    expect(create.json?.signals?.[0]?.payload?.negated).toBe(true);
    expect(create.json?.signals?.[0]?.payload?.normalized_value).toBe('fatigue');
  });

  it('10. uncertainty preserved: Maybe my period is late', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          signal({
            signal_type: 'cycle',
            normalized_value: 'late_period',
            display_label: 'Late period',
            evidence_text: 'maybe my period is late',
            uncertain: true,
          }),
        ],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs10@test.com', '198.51.100.10');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'Maybe my period is late.', extract: true },
      ip: user.ip,
    });
    expect(create.json?.signals?.[0]?.payload?.uncertain).toBe(true);
    expect(create.json?.signals?.[0]?.payload?.user_status).toBe('unreviewed');
  });

  it('11. recurrence marker preserved: I slept badly again', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          signal({
            signal_type: 'sleep',
            normalized_value: 'poor_sleep',
            evidence_text: 'slept badly again',
            recurrence_marker: true,
          }),
        ],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs11@test.com', '198.51.100.11');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'I slept badly again', extract: true },
      ip: user.ip,
    });
    expect(create.json?.signals?.[0]?.payload?.recurrence_marker).toBe(true);
  });

  it('12. temporal duration preserved: exhausted for three days', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          signal({
            signal_type: 'energy',
            normalized_value: 'fatigue',
            evidence_text: 'exhausted for three days',
            temporal_context: {
              expression: 'for three days',
              kind: 'duration',
              normalized: { value: 3, unit: 'day' },
              confidence: 0.96,
            },
          }),
        ],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs12@test.com', '198.51.100.12');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: "I've been exhausted for three days", extract: true },
      ip: user.ip,
    });
    const temporal = create.json?.signals?.[0]?.payload?.temporal_context;
    expect(temporal?.kind).toBe('duration');
    expect(temporal?.normalized?.value).toBe(3);
    expect(temporal?.normalized?.unit).toBe('day');
  });

  it('13. vague temporal language remains vague: recently', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          signal({
            signal_type: 'body_sensation',
            normalized_value: 'other_sensation',
            evidence_text: 'felt strange recently',
            temporal_context: {
              expression: 'recently',
              kind: 'vague',
              normalized: null,
              confidence: 0.7,
            },
          }),
        ],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs13@test.com', '198.51.100.13');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: "I've felt strange recently", extract: true },
      ip: user.ip,
    });
    const temporal = create.json?.signals?.[0]?.payload?.temporal_context;
    expect(temporal?.kind).toBe('vague');
    expect(temporal?.expression).toBe('recently');
    expect(temporal?.normalized).toBeNull();
  });

  it('14. diagnosis not extracted as fact: thyroid failing', async () => {
    __setGenerateContentForTests(async () => JSON.stringify({ signals: [] }));
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs14@test.com', '198.51.100.14');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'My thyroid is definitely failing.', extract: true },
      ip: user.ip,
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.observation?.payload?.raw_text).toContain('thyroid');
    expect(create.json?.signals).toEqual([]);
    const types = (create.json?.signals || []).map((s) => s.payload?.signal_type);
    expect(types.includes('thyroid_failure')).toBe(false);
  });

  it('15. causal claim not invented (workplace anger stays non-diagnostic)', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          signal({
            signal_type: 'mood',
            normalized_value: 'irritability',
            evidence_text: 'angry',
            confidence: 0.7,
          }),
        ],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs15@test.com', '198.51.100.15');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: {
        raw_text: "I'm angry because my boss cancelled the meeting.",
        extract: true,
      },
      ip: user.ip,
    });
    expect(create.json?.signals?.length).toBeLessThanOrEqual(1);
    const payload = create.json?.signals?.[0]?.payload;
    if (payload) {
      expect(payload.user_status).toBe('unreviewed');
      expect(payload.signal_type).toBe('mood');
      expect(String(JSON.stringify(payload))).not.toMatch(/diagnos|disorder|hormone/i);
    }
  });

  it('16. empty eligible signal set accepted safely', async () => {
    __setGenerateContentForTests(async () => JSON.stringify({ signals: [] }));
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs16@test.com', '198.51.100.16');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'The weather is nice today.', extract: true },
      ip: user.ip,
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.observation).toBeTruthy();
    expect(create.json?.signals).toEqual([]);
    expect(create.json?.extraction?.status).toBe('completed');
  });

  it('17. duplicate extraction retry does not duplicate signals', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [signal({ signal_type: 'sleep', normalized_value: 'poor_sleep', evidence_text: 'bad sleep' })],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs17@test.com', '198.51.100.17');
    const first = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: {
        raw_text: 'I slept badly',
        client_event_id: 'dup-obs-1',
        extract: true,
      },
      ip: user.ip,
    });
    expect(first.json?.signals?.length).toBe(1);
    const second = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: {
        raw_text: 'I slept badly',
        client_event_id: 'dup-obs-1',
        extract: true,
      },
      ip: user.ip,
    });
    expect(second.statusCode).toBe(200);
    expect(second.json?.extraction?.status).toBe('already_extracted');
    expect(second.json?.signals?.length).toBe(1);
    const list = await invoke(handler, {
      method: 'GET',
      path: `/api/personal/signals?source_observation_id=${first.json.observation.id}`,
      headers: user.authHeader,
      ip: user.ip,
    });
    expect(list.json?.events?.length).toBe(1);
  });

  it('18. user confirm works', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [signal({ signal_type: 'energy', normalized_value: 'low_energy', evidence_text: 'low' })],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs18@test.com', '198.51.100.18');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'Low energy', extract: true },
      ip: user.ip,
    });
    const signalId = create.json.signals[0].id;
    const confirm = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${signalId}/confirm`,
      headers: user.authHeader,
      body: {},
      ip: user.ip,
    });
    expect(confirm.statusCode).toBe(200);
    expect(confirm.json?.signal?.payload?.user_status).toBe('confirmed');
  });

  it('19. user reject works', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [signal({ signal_type: 'mood', normalized_value: 'sadness', evidence_text: 'sad' })],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs19@test.com', '198.51.100.19');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'Feeling sad', extract: true },
      ip: user.ip,
    });
    const signalId = create.json.signals[0].id;
    const reject = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${signalId}/reject`,
      headers: user.authHeader,
      body: {},
      ip: user.ip,
    });
    expect(reject.statusCode).toBe(200);
    expect(reject.json?.signal?.payload?.user_status).toBe('rejected');
  });

  it('20. user correction preserves original provenance', async () => {
    __setGenerateContentForTests(async () =>
      JSON.stringify({
        signals: [
          signal({
            signal_type: 'energy',
            normalized_value: 'fatigue',
            display_label: 'Fatigue',
            evidence_text: 'tired',
          }),
        ],
      }),
    );
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const user = await signup(handler, 'obs20@test.com', '198.51.100.20');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: { raw_text: 'I am tired', extract: true },
      ip: user.ip,
    });
    const signalId = create.json.signals[0].id;
    const correct = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/signals/${signalId}/correct`,
      headers: user.authHeader,
      body: {
        normalized_value: 'low_energy',
        display_label: 'Low energy',
        note: 'more low energy than fatigue',
      },
      ip: user.ip,
    });
    expect(correct.statusCode).toBe(200);
    expect(correct.json?.signal?.payload?.user_status).toBe('corrected');
    expect(correct.json?.signal?.payload?.normalized_value).toBe('low_energy');
    expect(correct.json?.signal?.payload?.original_extraction?.normalized_value).toBe('fatigue');
    expect(correct.json?.signal?.payload?.evidence_text).toBe('tired');
  });

  it('21. body/query/header user spoofing cannot change ownership', async () => {
    __setGenerateContentForTests(async () => JSON.stringify({ signals: [] }));
    const handler = await buildApiHandler({ dataDir, environment: 'test' });
    const a = await signup(handler, 'spoofa@test.com', '198.51.100.21');
    const b = await signup(handler, 'spoofb@test.com', '198.51.100.22');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations?userId=attacker',
      headers: {
        ...a.authHeader,
        'x-user-id': b.session?.user?.id || 'other-user',
        'x-luna-mobile-id': 'device-spoof',
      },
      body: {
        raw_text: 'owned by A',
        user_id: 'attacker',
        userId: b.session?.user?.id || 'other',
        extract: false,
      },
      ip: a.ip,
    });
    expect(create.statusCode).toBe(200);
    expect(create.json?.observation?.user_id).toBeTruthy();
    const listB = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/observations',
      headers: b.authHeader,
      ip: b.ip,
    });
    expect(listB.json?.events?.some((e) => e.payload?.raw_text === 'owned by A')).toBe(false);
  });

  it('error/extraction failure fields do not leak secrets or connection strings', async () => {
    __setGenerateContentForTests(async () => {
      throw new Error('boom postgresql://user:password@host/db SECRET_HEALTH_PAYLOAD_XYZ');
    });
    const user = await signup('leak@test.com');
    const create = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/observations',
      headers: user.authHeader,
      body: {
        raw_text: 'SECRET_HEALTH_PAYLOAD_XYZ',
        observation_kind: 'note',
        extract: true,
      },
      ip: user.ip,
    });
    expect(create.statusCode).toBe(200);
    // Owner may receive their own observation raw_text; extraction status must stay non-sensitive.
    expect(create.json?.extraction?.status).toBe('failed');
    expect(JSON.stringify(create.json?.extraction || {})).not.toMatch(/postgresql:\/\/|password|SECRET_HEALTH_PAYLOAD_XYZ/i);
    expect(create.json?.extraction?.reason).not.toMatch(/postgresql|password|SECRET_/i);
  });
});
