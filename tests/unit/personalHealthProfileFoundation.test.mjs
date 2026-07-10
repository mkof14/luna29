/**
 * Personal Health Profile — storage, validation, trust, completion, questions, context.
 * Deterministic fixtures. File mode only. No live Gemini / Neon.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import {
  createPersonalHealthProfileStore,
  resolvePersonalHealthProfileStorageDecision,
  PROFILE_STORAGE_UNAVAILABLE,
  PERSONAL_HEALTH_PROFILE_STORE_UNAVAILABLE,
} from '../../server/core/personalHealthProfileStore.mjs';
import {
  validateSectionPayload,
  validateFactInput,
  calculateProfileCompletion,
  resolveNextProfileQuestion,
  buildPersonalProfileContext,
  assertWellnessSafeLanguage,
  summarizeProfileForLogs,
} from '../../server/core/personalHealthProfileService.mjs';
import { __resetMemoryRateLimitForTests } from '../../server/core/rateLimit.mjs';

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

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.40' }) => {
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

describe('personal health profile storage decision', () => {
  it('production without DATABASE_URL fails closed', () => {
    const d = resolvePersonalHealthProfileStorageDecision({
      env: { NODE_ENV: 'production', DATABASE_URL: '' },
      runtimeEnvironment: 'node',
    });
    expect(d.mode).toBe('unavailable');
  });

  it('explicit file rejected in production', () => {
    const d = resolvePersonalHealthProfileStorageDecision({
      env: {
        NODE_ENV: 'production',
        PERSONAL_HEALTH_PROFILE_STORAGE: 'file',
        DATABASE_URL: 'postgres://x',
      },
      runtimeEnvironment: 'node',
    });
    expect(d.mode).toBe('unavailable');
  });

  it('test harness without DB uses file', () => {
    const d = resolvePersonalHealthProfileStorageDecision({
      env: { NODE_ENV: 'test', DATABASE_URL: '' },
      runtimeEnvironment: 'test',
    });
    expect(d.mode).toBe('file');
  });
});

describe('personal health profile validation + completion', () => {
  it('rejects future DOB and invalid height', () => {
    const future = validateSectionPayload('about', { date_of_birth: '2099-01-01' });
    expect(future.ok).toBe(false);
    const height = validateSectionPayload('body', { height_cm: 10 });
    expect(height.ok).toBe(false);
    const unknown = validateSectionPayload('about', { secret_field: 'x' });
    expect(unknown.ok).toBe(false);
    expect(unknown.code).toBe('UNKNOWN_FIELD');
  });

  it('rejects oversized medication arrays and strips HTML', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ name: `med${i}` }));
    const oversized = validateSectionPayload('medications', { items });
    expect(oversized.ok).toBe(false);
    const html = validateSectionPayload('about', { preferred_name: '<b>Ada</b>' });
    expect(html.ok).toBe(true);
    expect(html.data.preferred_name).toBe('Ada');
  });

  it('rejects inferred facts created as confirmed', () => {
    const bad = validateFactInput({
      section: 'sleep',
      fact_key: 'average_hours',
      source: 'luna_inferred',
      trust_state: 'confirmed',
      value_json: 6,
    });
    expect(bad.ok).toBe(false);
    expect(bad.code).toBe('INFERENCE_NOT_CONFIRMED');
  });

  it('completion is deterministic and excludes N/A womens health', () => {
    const empty = calculateProfileCompletion({ sections: {} });
    expect(empty.completion_percent).toBe(0);
    const partial = calculateProfileCompletion({
      sections: {
        about: { date_of_birth: '1990-01-01', country: 'US' },
        goals: { primary_goal: 'sleep' },
        womens_health: { applicable: 'no' },
      },
      profile_preferences: { womens_health_applicable: false },
    });
    expect(partial.completion_percent).toBeGreaterThan(0);
    expect(partial.applicable_sections).not.toContain('womens_health');
    expect(partial.completion_percent % 5).toBe(0);
  });

  it('contextual questions respect daily cap and dismissals', () => {
    const profile = {
      sections: {},
      profile_preferences: {
        last_question_shown_at: Date.now(),
        dismissed_questions: {},
      },
    };
    expect(resolveNextProfileQuestion({ profile, recentSignals: ['energy'] })).toBeNull();
    const open = resolveNextProfileQuestion({
      profile: { sections: {}, profile_preferences: {} },
      recentSignals: ['energy'],
      currentSurface: 'today',
    });
    expect(open?.id).toBe('q_sleep_duration');
    const dismissed = resolveNextProfileQuestion({
      profile: {
        sections: {},
        profile_preferences: { dismissed_questions: { q_sleep_duration: 'not_now' } },
      },
      recentSignals: ['energy'],
    });
    expect(dismissed?.id).not.toBe('q_sleep_duration');
  });

  it('wellness safety language rejects diagnosis / medication-change phrasing', () => {
    expect(assertWellnessSafeLanguage('You may want to discuss this with a clinician.').ok).toBe(true);
    expect(assertWellnessSafeLanguage('You have hypothyroidism.').ok).toBe(false);
    expect(assertWellnessSafeLanguage('Stop taking your medication.').ok).toBe(false);
  });

  it('log summary never includes field values', () => {
    const summary = summarizeProfileForLogs({
      status: 'ok',
      completion_percent: 40,
      sections: { about: { date_of_birth: '1990-01-01' } },
      facts: [{ value: 'secret' }],
    });
    expect(JSON.stringify(summary)).not.toMatch(/1990|secret/);
    expect(summary.completion_percent).toBe(40);
  });
});

describe('personal health profile store + API', () => {
  let tmpDir;
  let handler;
  let originalEnv;
  let ipCounter = 0;

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
    return {
      token: result.json.token,
      userId: result.json.session.id,
      authHeader: { authorization: `Bearer ${result.json.token}` },
      ip,
    };
  };

  beforeEach(async () => {
    originalEnv = { ...process.env };
    __resetMemoryRateLimitForTests?.();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna-hp-'));
    process.env.PERSONAL_HEALTH_PROFILE_STORAGE = 'file';
    process.env.LUNA_HEALTH_PROFILE_ALLOW_FILE_FALLBACK = '1';
    process.env.PERSONAL_EVENTS_STORAGE = 'file';
    process.env.MEMORY_CONSENT_STORAGE = 'file';
    process.env.LUNA_MEMORY_CONSENT_ALLOW_FILE_FALLBACK = '1';
    process.env.STRIPE_BILLING_ENABLED = 'false';
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir: tmpDir, environment: 'test' });
  });

  afterEach(async () => {
    process.env = originalEnv;
    vi.resetModules();
    if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('owner can upsert section; peer cannot read owner data', async () => {
    const a = await signup(`hp-a-${Date.now()}@test.com`, 'HP A');
    const b = await signup(`hp-b-${Date.now()}@test.com`, 'HP B');

    const put = await invoke(handler, {
      method: 'PUT',
      path: '/api/personal/profile/sections/about',
      headers: a.authHeader,
      body: { date_of_birth: '1990-05-01', country: 'US', timezone: 'America/New_York' },
      ip: a.ip,
    });
    expect(put.statusCode).toBe(200);
    expect(put.json.profile.sections.about.date_of_birth).toBe('1990-05-01');
    expect(put.json.completion.completion_percent).toBeGreaterThan(0);

    const peer = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/profile',
      headers: b.authHeader,
      ip: b.ip,
    });
    expect(peer.statusCode).toBe(200);
    expect(peer.json.profile.sections?.about?.date_of_birth).toBeFalsy();
  });

  it('rejects spoofed user_id and unknown keys', async () => {
    const a = await signup(`hp-spoof-${Date.now()}@test.com`);
    const spoof = await invoke(handler, {
      method: 'PUT',
      path: '/api/personal/profile/sections/about',
      headers: a.authHeader,
      body: { user_id: 'attacker', preferred_name: 'Ok' },
      ip: a.ip,
    });
    expect(spoof.statusCode).toBe(200);
    expect(spoof.json.profile.user_id).not.toBe('attacker');

    const unknown = await invoke(handler, {
      method: 'PUT',
      path: '/api/personal/profile/sections/about',
      headers: a.authHeader,
      body: { evil: true },
      ip: a.ip,
    });
    expect(unknown.statusCode).toBe(400);
    expect(unknown.json.code).toBe('UNKNOWN_FIELD');
  });

  it('inferred fact does not overwrite confirmed; confirm/reject/correct + IDOR', async () => {
    const a = await signup(`hp-trust-${Date.now()}@test.com`);
    const b = await signup(`hp-trust-b-${Date.now()}@test.com`);

    await invoke(handler, {
      method: 'PUT',
      path: '/api/personal/profile/sections/sleep',
      headers: a.authHeader,
      body: { average_hours: 7 },
      ip: a.ip,
    });

    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory-consent/enable',
      headers: a.authHeader,
      body: { source_surface: 'test' },
      ip: a.ip,
    });

    const conflict = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/profile/facts',
      headers: a.authHeader,
      body: {
        section: 'sleep',
        fact_key: 'average_hours',
        value_json: 4,
        source: 'luna_inferred',
        trust_state: 'unreviewed',
      },
      ip: a.ip,
    });
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json.code).toBe('CONFLICT_CONFIRMED');

    const inferred = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/profile/facts',
      headers: a.authHeader,
      body: {
        section: 'medications',
        fact_key: 'candidate_med',
        value_json: { name: 'Candidate' },
        source: 'luna_inferred',
        trust_state: 'unreviewed',
        display_label: 'Candidate med',
      },
      ip: a.ip,
    });
    expect(inferred.statusCode).toBe(201);
    const factId = inferred.json.fact.id;

    const confirmed = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/profile/facts/${factId}/confirm`,
      headers: a.authHeader,
      body: {},
      ip: a.ip,
    });
    expect(confirmed.statusCode).toBe(200);
    expect(confirmed.json.fact.trust_state).toBe('confirmed');
    expect(confirmed.json.fact.source).toBe('user_confirmed');

    const other = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/profile/facts',
      headers: a.authHeader,
      body: {
        section: 'health_history',
        fact_key: 'allergy_candidate',
        value_json: { label: 'Peanuts' },
        source: 'luna_inferred',
        trust_state: 'unreviewed',
      },
      ip: a.ip,
    });
    const otherId = other.json.fact.id;
    const rejected = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/profile/facts/${otherId}/reject`,
      headers: a.authHeader,
      body: {},
      ip: a.ip,
    });
    expect(rejected.json.fact.trust_state).toBe('rejected');

    const corrected = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/profile/facts/${factId}/correct`,
      headers: a.authHeader,
      body: { value_json: { name: 'Corrected' } },
      ip: a.ip,
    });
    expect(corrected.json.fact.trust_state).toBe('corrected');

    const idor = await invoke(handler, {
      method: 'POST',
      path: `/api/personal/profile/facts/${factId}/reject`,
      headers: b.authHeader,
      body: {},
      ip: b.ip,
    });
    expect(idor.statusCode).toBe(404);
  });

  it('Memory OFF blocks Live-derived inferred writes but allows manual sections', async () => {
    const a = await signup(`hp-mem-${Date.now()}@test.com`);
    await invoke(handler, {
      method: 'POST',
      path: '/api/personal/memory-consent/disable',
      headers: a.authHeader,
      body: { source_surface: 'test' },
      ip: a.ip,
    });
    const blocked = await invoke(handler, {
      method: 'POST',
      path: '/api/personal/profile/facts',
      headers: a.authHeader,
      body: {
        section: 'sleep',
        fact_key: 'average_hours',
        value_json: 6,
        source: 'luna_inferred',
        trust_state: 'unreviewed',
      },
      ip: a.ip,
    });
    expect(blocked.statusCode).toBe(403);
    expect(blocked.json.code).toBe('MEMORY_CONSENT_REQUIRED');

    const manual = await invoke(handler, {
      method: 'PUT',
      path: '/api/personal/profile/sections/goals',
      headers: a.authHeader,
      body: { primary_goal: 'energy' },
      ip: a.ip,
    });
    expect(manual.statusCode).toBe(200);
    expect(manual.json.profile.sections.goals.primary_goal).toBe('energy');
  });

  it('report context prioritizes confirmed facts', async () => {
    const a = await signup(`hp-ctx-${Date.now()}@test.com`);
    await invoke(handler, {
      method: 'PUT',
      path: '/api/personal/profile/sections/about',
      headers: a.authHeader,
      body: { age_range: '30-39', country: 'US' },
      ip: a.ip,
    });
    const ctx = await invoke(handler, {
      method: 'GET',
      path: '/api/personal/profile/context?reportType=labs&maxFacts=10',
      headers: a.authHeader,
      ip: a.ip,
    });
    expect(ctx.statusCode).toBe(200);
    expect(ctx.json.status).toBe('ok');
    expect(Array.isArray(ctx.json.facts)).toBe(true);
    expect(ctx.json.facts.every((f) => f.trust_state === 'confirmed' || f.trust_state === 'corrected')).toBe(
      true,
    );
  });

  it('buildPersonalProfileContext excludes rejected and inferred by default', async () => {
    const file = path.join(tmpDir, 'hp-ctx.json');
    const { store } = await createPersonalHealthProfileStore(file, {
      env: {
        PERSONAL_HEALTH_PROFILE_STORAGE: 'file',
        LUNA_HEALTH_PROFILE_ALLOW_FILE_FALLBACK: '1',
        NODE_ENV: 'test',
      },
      runtimeEnvironment: 'test',
    });
    await store.ensureProfile('u1');
    await store.upsertFact('u1', {
      section: 'about',
      fact_key: 'age_range',
      value_json: '30-39',
      source: 'user_entered',
      trust_state: 'confirmed',
    });
    await store.upsertFact('u1', {
      section: 'sleep',
      fact_key: 'average_hours',
      value_json: 5,
      source: 'luna_inferred',
      trust_state: 'unreviewed',
    });
    await store.upsertFact('u1', {
      section: 'medications',
      fact_key: 'bad',
      value_json: 'x',
      source: 'user_entered',
      trust_state: 'rejected',
    });
    const ctx = await buildPersonalProfileContext({
      store,
      userId: 'u1',
      includeInferred: false,
      maxFacts: 5,
    });
    expect(ctx.facts.every((f) => f.trust_state !== 'rejected')).toBe(true);
    expect(ctx.facts.every((f) => f.source !== 'luna_inferred')).toBe(true);
  });
});

describe('personal health profile unavailable codes', () => {
  it('exports stable unavailable codes', () => {
    expect(PROFILE_STORAGE_UNAVAILABLE).toBe('PROFILE_STORAGE_UNAVAILABLE');
    expect(PERSONAL_HEALTH_PROFILE_STORE_UNAVAILABLE).toBe('PERSONAL_HEALTH_PROFILE_STORE_UNAVAILABLE');
  });
});
