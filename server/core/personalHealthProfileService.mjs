/**
 * Personal Health Profile — validation, completion, contextual questions, report/Live context.
 * Deterministic. No health values in logs/analytics helpers.
 */

import {
  PROFILE_SECTIONS,
  PROFILE_FACT_SOURCES,
  PROFILE_TRUST_STATES,
} from './personalHealthProfileStore.mjs';

export { PROFILE_SECTIONS };

const MAX_STRING = 500;
const MAX_ARRAY = 40;
const MAX_NOTES = 1000;

const stripHtml = (value) => String(value ?? '').replace(/<[^>]*>/g, '').trim();

export const sanitizePlainText = (value, max = MAX_STRING) => {
  const text = stripHtml(value).slice(0, max);
  return text;
};

const isIsoDate = (value) => {
  if (!value || typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
};

export const validateSectionPayload = (section, payload) => {
  if (!PROFILE_SECTIONS.includes(section)) {
    return { ok: false, error: 'Unknown profile section.', code: 'UNKNOWN_SECTION' };
  }
  if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'Section payload must be an object.', code: 'INVALID_PAYLOAD' };
  }

  const errors = {};
  const out = {};

  const takeString = (key, { max = MAX_STRING, optional = true } = {}) => {
    if (!(key in payload)) return;
    const raw = payload[key];
    if (raw == null || raw === '') {
      if (!optional) errors[key] = 'required';
      else out[key] = '';
      return;
    }
    if (typeof raw !== 'string' && typeof raw !== 'number') {
      errors[key] = 'invalid_type';
      return;
    }
    out[key] = sanitizePlainText(raw, max);
  };

  const takeNumber = (key, { min, max, optional = true } = {}) => {
    if (!(key in payload)) return;
    if (payload[key] == null || payload[key] === '') {
      if (!optional) errors[key] = 'required';
      else out[key] = null;
      return;
    }
    const n = Number(payload[key]);
    if (!Number.isFinite(n)) {
      errors[key] = 'invalid_number';
      return;
    }
    if (min != null && n < min) errors[key] = 'out_of_range';
    else if (max != null && n > max) errors[key] = 'out_of_range';
    else out[key] = n;
  };

  const takeDate = (key, { optional = true, notFuture = true } = {}) => {
    if (!(key in payload)) return;
    if (payload[key] == null || payload[key] === '') {
      if (!optional) errors[key] = 'required';
      else out[key] = '';
      return;
    }
    if (!isIsoDate(String(payload[key]))) {
      errors[key] = 'invalid_date';
      return;
    }
    if (notFuture && String(payload[key]) > new Date().toISOString().slice(0, 10)) {
      errors[key] = 'future_date';
      return;
    }
    out[key] = String(payload[key]);
  };

  const takeArrayOfObjects = (key, mapItem) => {
    if (!(key in payload)) return;
    if (!Array.isArray(payload[key])) {
      errors[key] = 'invalid_array';
      return;
    }
    if (payload[key].length > MAX_ARRAY) {
      errors[key] = 'array_too_large';
      return;
    }
    out[key] = payload[key].map(mapItem).filter(Boolean);
  };

  // Reject unknown keys at top level for the section schema.
  const allowedBySection = {
    about: ['preferred_name', 'date_of_birth', 'age_range', 'biological_sex', 'gender_identity', 'country', 'timezone', 'preferred_language', 'unit_system'],
    body: ['height_cm', 'weight_kg', 'waist_cm', 'weight_goal_kg'],
    health_history: ['chronic_conditions', 'past_conditions', 'surgeries', 'hospitalizations', 'allergies', 'has_significant_condition'],
    medications: ['items', 'takes_daily_medication'],
    family_history: ['items'],
    sleep: ['typical_bedtime', 'typical_wake_time', 'average_hours', 'quality', 'awakenings', 'shift_work'],
    nutrition: ['eating_pattern', 'water_glasses', 'caffeine', 'alcohol', 'dietary_restrictions'],
    activity: ['activity_level', 'exercise_types', 'frequency_per_week', 'mobility_limitations'],
    stress: ['general_level', 'sources', 'perceived_support'],
    womens_health: ['cycle_status', 'average_cycle_length', 'regularity', 'last_period_date', 'pregnancy_status', 'postpartum', 'perimenopause', 'menopause', 'contraception', 'tracked_symptoms', 'applicable'],
    goals: ['primary_goal', 'goals'],
    care_context: ['primary_clinician', 'specialists', 'emergency_contact', 'upcoming_appointment'],
    data_sources: ['notes'],
  };

  const allowed = new Set(allowedBySection[section] || []);
  for (const key of Object.keys(payload)) {
    if (!allowed.has(key)) {
      return { ok: false, error: `Unknown field: ${key}`, code: 'UNKNOWN_FIELD', field: key };
    }
  }

  if (section === 'about') {
    takeString('preferred_name', { max: 80 });
    takeDate('date_of_birth');
    takeString('age_range', { max: 32 });
    takeString('biological_sex', { max: 40 });
    takeString('gender_identity', { max: 80 });
    takeString('country', { max: 80 });
    takeString('timezone', { max: 64 });
    takeString('preferred_language', { max: 16 });
    takeString('unit_system', { max: 16 });
    if (out.date_of_birth) {
      const year = Number(out.date_of_birth.slice(0, 4));
      const nowY = new Date().getUTCFullYear();
      if (year < nowY - 120 || year > nowY) errors.date_of_birth = 'implausible_age';
    }
  } else if (section === 'body') {
    takeNumber('height_cm', { min: 80, max: 250 });
    takeNumber('weight_kg', { min: 25, max: 400 });
    takeNumber('waist_cm', { min: 30, max: 250 });
    takeNumber('weight_goal_kg', { min: 25, max: 400 });
  } else if (section === 'health_history') {
    takeString('has_significant_condition', { max: 8 });
    takeArrayOfObjects('chronic_conditions', (item) =>
      item && typeof item === 'object'
        ? { label: sanitizePlainText(item.label || item.name, 120), status: sanitizePlainText(item.status || 'active', 40) }
        : null,
    );
    takeArrayOfObjects('past_conditions', (item) =>
      item && typeof item === 'object' ? { label: sanitizePlainText(item.label || item.name, 120) } : null,
    );
    takeArrayOfObjects('surgeries', (item) =>
      item && typeof item === 'object'
        ? { label: sanitizePlainText(item.label || item.name, 120), year: sanitizePlainText(item.year, 8) }
        : null,
    );
    takeArrayOfObjects('hospitalizations', (item) =>
      item && typeof item === 'object' ? { label: sanitizePlainText(item.label || item.name, 120) } : null,
    );
    takeArrayOfObjects('allergies', (item) =>
      item && typeof item === 'object'
        ? { label: sanitizePlainText(item.label || item.name, 120), severity: sanitizePlainText(item.severity, 40) }
        : null,
    );
  } else if (section === 'medications') {
    takeString('takes_daily_medication', { max: 8 });
    takeArrayOfObjects('items', (item) => {
      if (!item || typeof item !== 'object') return null;
      const name = sanitizePlainText(item.name || item.label, 120);
      if (!name) return null;
      return {
        name,
        dose: sanitizePlainText(item.dose, 80),
        frequency: sanitizePlainText(item.frequency, 80),
        reason: sanitizePlainText(item.reason, 160),
        active: item.active === false ? false : true,
        start_date: isIsoDate(String(item.start_date || '')) ? String(item.start_date) : '',
      };
    });
  } else if (section === 'family_history') {
    takeArrayOfObjects('items', (item) =>
      item && typeof item === 'object'
        ? {
            condition: sanitizePlainText(item.condition || item.label, 120),
            relation: sanitizePlainText(item.relation, 80),
            onset_age: sanitizePlainText(item.onset_age, 16),
          }
        : null,
    );
  } else if (section === 'sleep') {
    takeString('typical_bedtime', { max: 8 });
    takeString('typical_wake_time', { max: 8 });
    takeNumber('average_hours', { min: 0, max: 24 });
    takeString('quality', { max: 40 });
    takeNumber('awakenings', { min: 0, max: 30 });
    takeString('shift_work', { max: 8 });
  } else if (section === 'nutrition') {
    takeString('eating_pattern', { max: 80 });
    takeNumber('water_glasses', { min: 0, max: 40 });
    takeString('caffeine', { max: 80 });
    takeString('alcohol', { max: 80 });
    takeArrayOfObjects('dietary_restrictions', (item) =>
      typeof item === 'string'
        ? { label: sanitizePlainText(item, 80) }
        : item && typeof item === 'object'
          ? { label: sanitizePlainText(item.label, 80) }
          : null,
    );
  } else if (section === 'activity') {
    takeString('activity_level', { max: 40 });
    takeArrayOfObjects('exercise_types', (item) =>
      typeof item === 'string'
        ? { label: sanitizePlainText(item, 80) }
        : item && typeof item === 'object'
          ? { label: sanitizePlainText(item.label, 80) }
          : null,
    );
    takeNumber('frequency_per_week', { min: 0, max: 21 });
    takeString('mobility_limitations', { max: 200 });
  } else if (section === 'stress') {
    takeString('general_level', { max: 40 });
    takeArrayOfObjects('sources', (item) =>
      typeof item === 'string'
        ? { label: sanitizePlainText(item, 80) }
        : item && typeof item === 'object'
          ? { label: sanitizePlainText(item.label, 80) }
          : null,
    );
    takeString('perceived_support', { max: 40 });
  } else if (section === 'womens_health') {
    takeString('applicable', { max: 8 });
    takeString('cycle_status', { max: 40 });
    takeNumber('average_cycle_length', { min: 15, max: 60 });
    takeString('regularity', { max: 40 });
    takeDate('last_period_date');
    takeString('pregnancy_status', { max: 40 });
    takeString('postpartum', { max: 8 });
    takeString('perimenopause', { max: 8 });
    takeString('menopause', { max: 8 });
    takeString('contraception', { max: 80 });
    takeArrayOfObjects('tracked_symptoms', (item) =>
      typeof item === 'string'
        ? { label: sanitizePlainText(item, 80) }
        : item && typeof item === 'object'
          ? { label: sanitizePlainText(item.label, 80) }
          : null,
    );
  } else if (section === 'goals') {
    takeString('primary_goal', { max: 80 });
    takeArrayOfObjects('goals', (item) =>
      typeof item === 'string'
        ? { label: sanitizePlainText(item, 80) }
        : item && typeof item === 'object'
          ? { label: sanitizePlainText(item.label, 80) }
          : null,
    );
  } else if (section === 'care_context') {
    takeString('primary_clinician', { max: 120 });
    takeString('specialists', { max: 200 });
    takeString('emergency_contact', { max: 160 });
    takeString('upcoming_appointment', { max: 160 });
  } else if (section === 'data_sources') {
    takeString('notes', { max: MAX_NOTES });
  }

  if (Object.keys(errors).length) {
    return { ok: false, error: 'Validation failed.', code: 'VALIDATION_FAILED', fields: errors };
  }
  return { ok: true, data: out };
};

export const validateFactInput = (body) => {
  const section = String(body?.section || '').trim();
  const fact_key = sanitizePlainText(body?.fact_key, 80);
  const source = String(body?.source || 'user_entered').trim();
  const trust_state = String(body?.trust_state || 'confirmed').trim();
  if (!PROFILE_SECTIONS.includes(section)) {
    return { ok: false, error: 'Unknown section.', code: 'UNKNOWN_SECTION' };
  }
  if (!fact_key) return { ok: false, error: 'fact_key required.', code: 'VALIDATION_FAILED' };
  if (!PROFILE_FACT_SOURCES.includes(source)) {
    return { ok: false, error: 'Invalid source.', code: 'INVALID_SOURCE' };
  }
  if (!PROFILE_TRUST_STATES.includes(trust_state)) {
    return { ok: false, error: 'Invalid trust_state.', code: 'INVALID_TRUST_STATE' };
  }
  if (source === 'luna_inferred' && trust_state === 'confirmed') {
    return {
      ok: false,
      error: 'Inferred facts cannot be created as confirmed.',
      code: 'INFERENCE_NOT_CONFIRMED',
    };
  }
  return {
    ok: true,
    data: {
      section,
      fact_key,
      value_json: body?.value_json ?? null,
      display_label: sanitizePlainText(body?.display_label, 120) || fact_key,
      source,
      trust_state,
      confidence: ['high', 'medium', 'low'].includes(body?.confidence) ? body.confidence : null,
      occurred_at: body?.occurred_at || null,
      notes: sanitizePlainText(body?.notes, MAX_NOTES) || null,
      consent_scope: sanitizePlainText(body?.consent_scope, 40) || null,
      source_event_id: sanitizePlainText(body?.source_event_id, 80) || null,
      source_report_id: sanitizePlainText(body?.source_report_id, 80) || null,
      source_document_id: sanitizePlainText(body?.source_document_id, 80) || null,
    },
  };
};

const sectionFilled = (section, data) => {
  if (!data || typeof data !== 'object') return false;
  if (section === 'womens_health' && (data.applicable === 'no' || data.applicable === false)) {
    return true; // marked N/A counts as complete for weighting
  }
  return Object.values(data).some((v) => {
    if (v == null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });
};

/**
 * Deterministic completion. Non-applicable women's health does not reduce score.
 */
export const calculateProfileCompletion = (profile) => {
  const sections = profile?.sections || {};
  const prefs = profile?.profile_preferences || {};
  const womensApplicable = prefs.womens_health_applicable !== false && sections.womens_health?.applicable !== 'no';

  const weights = [
    { id: 'about', weight: 20 },
    { id: 'body', weight: 10 },
    { id: 'health_history', weight: 15 },
    { id: 'medications', weight: 15 },
    { id: 'sleep', weight: 10 },
    { id: 'nutrition', weight: 5 },
    { id: 'activity', weight: 5 },
    { id: 'stress', weight: 10 },
    { id: 'goals', weight: 10 },
  ];
  if (womensApplicable) weights.push({ id: 'womens_health', weight: 10 });

  const total = weights.reduce((s, w) => s + w.weight, 0);
  let earned = 0;
  const completed = [];
  const missing = [];
  for (const w of weights) {
    if (sectionFilled(w.id, sections[w.id])) {
      earned += w.weight;
      completed.push(w.id);
    } else {
      missing.push(w.id);
    }
  }
  const raw = total > 0 ? (earned / total) * 100 : 0;
  // Prefer rounded buckets without false precision.
  const rounded = Math.round(raw / 5) * 5;
  return {
    completion_percent: Math.max(0, Math.min(100, rounded)),
    completed_sections: completed,
    recommended_next_section: missing[0] || null,
    applicable_sections: weights.map((w) => w.id),
  };
};

export const PROFILE_QUESTION_CATALOG = Object.freeze([
  {
    id: 'q_sleep_duration',
    section: 'sleep',
    reason: 'Sleep context helps Luna make daily energy summaries more relevant.',
    prompt: 'About how many hours do you usually sleep?',
    field: 'average_hours',
    eligibility: ({ profile, recentSignals }) => {
      if (sectionFilled('sleep', profile?.sections?.sleep)) return false;
      const lowEnergy = (recentSignals || []).some((s) => s === 'energy' || s === 'sleep');
      return lowEnergy;
    },
  },
  {
    id: 'q_daily_medication',
    section: 'medications',
    reason: 'Medication context can prevent irrelevant explanations. Luna will not tell you to change medication.',
    prompt: 'Do you take any medication or supplement most days?',
    field: 'takes_daily_medication',
    eligibility: ({ profile }) => !sectionFilled('medications', profile?.sections?.medications),
  },
  {
    id: 'q_primary_goal',
    section: 'goals',
    reason: 'A primary goal helps Luna prioritize what to highlight in Today and reports.',
    prompt: 'What would you most like Luna to help you understand?',
    field: 'primary_goal',
    eligibility: ({ profile }) => !profile?.sections?.goals?.primary_goal,
  },
  {
    id: 'q_dob',
    section: 'about',
    reason: 'Age changes how some wellness ranges and patterns are interpreted.',
    prompt: 'What is your date of birth? (You can skip.)',
    field: 'date_of_birth',
    eligibility: ({ profile, surface }) =>
      !profile?.sections?.about?.date_of_birth &&
      !profile?.sections?.about?.age_range &&
      (surface === 'labs' || surface === 'reports'),
  },
  {
    id: 'q_cycle_last_period',
    section: 'womens_health',
    reason: 'Cycle context can make energy, sleep, mood, and symptom patterns more relevant.',
    prompt: 'Would you like to update your last period date?',
    field: 'last_period_date',
    eligibility: ({ profile }) => {
      const wh = profile?.sections?.womens_health;
      if (!wh || wh.applicable === 'no') return false;
      return Boolean(wh.cycle_status) && !wh.last_period_date;
    },
  },
]);

export const resolveNextProfileQuestion = ({
  profile,
  recentSignals = [],
  currentSurface = 'today',
  now = Date.now(),
} = {}) => {
  const prefs = profile?.profile_preferences || {};
  const dismissed = prefs.dismissed_questions || {};
  const lastShownAt = Number(prefs.last_question_shown_at || 0);
  // Max one contextual question per day.
  if (lastShownAt && now - lastShownAt < 20 * 60 * 60 * 1000) return null;

  for (const q of PROFILE_QUESTION_CATALOG) {
    const state = dismissed[q.id];
    if (state === 'not_now' || state === 'does_not_apply' || state === 'completed') continue;
    if (q.eligibility({ profile, recentSignals, surface: currentSurface })) {
      return {
        id: q.id,
        section: q.section,
        prompt: q.prompt,
        reason: q.reason,
        field: q.field,
      };
    }
  }
  return null;
};

/**
 * Bounded profile context for Live / reports. Confirmed facts prioritized.
 * Never includes rejected/deleted. Inferred only when includeInferred=true and labeled.
 */
export const buildPersonalProfileContext = async ({
  store,
  userId,
  reportType = 'general',
  includeInferred = false,
  maxFacts = 24,
  sectionsAllowlist = null,
} = {}) => {
  if (!store || !userId) {
    return { status: 'unavailable', facts: [], sections: {}, completion_percent: 0 };
  }
  let profile;
  let facts;
  try {
    profile = (await store.getProfile(userId)) || (await store.ensureProfile(userId));
    facts = await store.listFacts(userId, {
      trustStates: includeInferred
        ? ['confirmed', 'corrected', 'unreviewed']
        : ['confirmed', 'corrected'],
    });
  } catch {
    return { status: 'unavailable', facts: [], sections: {}, completion_percent: 0 };
  }

  const allow = Array.isArray(sectionsAllowlist) && sectionsAllowlist.length
    ? new Set(sectionsAllowlist)
    : null;

  const filtered = facts
    .filter((f) => f.source !== 'luna_inferred' || includeInferred)
    .filter(
      (f) =>
        f.trust_state === 'confirmed' ||
        f.trust_state === 'corrected' ||
        (includeInferred && f.trust_state === 'unreviewed'),
    )
    .filter((f) => !allow || allow.has(f.section))
    .slice(0, Math.max(1, Math.min(60, Number(maxFacts) || 24)))
    .map((f) => ({
      label: f.display_label || f.fact_key,
      section: f.section,
      fact_key: f.fact_key,
      value: f.value_json,
      source: f.source,
      trust_state: f.trust_state,
      confidence: f.confidence,
      updated_at: f.updated_at,
    }));

  // Prefer confirmed over inferred in ordering.
  filtered.sort((a, b) => {
    const rank = (t) => (t === 'confirmed' || t === 'corrected' ? 0 : 1);
    return rank(a.trust_state) - rank(b.trust_state);
  });

  const sections = {};
  for (const [key, value] of Object.entries(profile.sections || {})) {
    if (allow && !allow.has(key)) continue;
    sections[key] = value;
  }

  return {
    status: 'ok',
    report_type: reportType,
    completion_percent: profile.completion_percent || 0,
    sections,
    facts: filtered.slice(0, maxFacts),
    missing_context: calculateProfileCompletion(profile).recommended_next_section
      ? [`missing_section:${calculateProfileCompletion(profile).recommended_next_section}`]
      : [],
  };
};

/** Safe Live context slice — confirmed only, bounded. */
export const buildLiveProfileContextSlice = async ({ store, userId, messageText = '' }) => {
  const text = String(messageText || '').toLowerCase();
  const allow = new Set(['about', 'goals']);
  if (/sleep|tired|fatigue|insomnia/.test(text)) allow.add('sleep');
  if (/medicat|pill|supplement|dose/.test(text)) allow.add('medications');
  if (/allerg/.test(text)) allow.add('health_history');
  if (/cycle|period|pregnan|menopaus/.test(text)) allow.add('womens_health');
  if (/stress|anxiet|mood/.test(text)) allow.add('stress');
  if (/exercise|workout|walk|activ/.test(text)) allow.add('activity');
  if (/food|eat|hydrat|caffeine|alcohol/.test(text)) allow.add('nutrition');

  const ctx = await buildPersonalProfileContext({
    store,
    userId,
    reportType: 'luna_live',
    includeInferred: false,
    maxFacts: 12,
    sectionsAllowlist: [...allow],
  });

  return {
    status: ctx.status,
    categories: {
      basic_context: ctx.sections.about || {},
      goals: ctx.sections.goals || {},
      conditions: (ctx.sections.health_history?.chronic_conditions || []).slice(0, 8),
      medications: (ctx.sections.medications?.items || []).filter((m) => m.active !== false).slice(0, 8),
      allergies: (ctx.sections.health_history?.allergies || []).slice(0, 8),
      sleep: ctx.sections.sleep || {},
      cycle: ctx.sections.womens_health || {},
    },
    facts: ctx.facts.slice(0, 12),
  };
};

export const summarizeProfileForLogs = (profileOrCtx) => ({
  type: 'health_profile',
  status: profileOrCtx?.status || 'ok',
  completion_percent: profileOrCtx?.completion_percent ?? null,
  section_count: profileOrCtx?.sections ? Object.keys(profileOrCtx.sections).length : null,
  fact_count: Array.isArray(profileOrCtx?.facts) ? profileOrCtx.facts.length : null,
  // Never include field values.
});

/** Safety: reject diagnosis / medication-change language in generated text. */
export const assertWellnessSafeLanguage = (text) => {
  const raw = String(text || '');
  const banned = [
    /\byou have\b/i,
    /\bthis proves\b/i,
    /\bstop taking\b/i,
    /\byou do not need a doctor\b/i,
    /\bdiagnos(e|is|ed)\b/i,
    /\bprescrib(e|ed|ing)\b/i,
  ];
  for (const re of banned) {
    if (re.test(raw)) {
      return { ok: false, code: 'UNSAFE_LANGUAGE' };
    }
  }
  return { ok: true };
};
