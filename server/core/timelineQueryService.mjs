/**
 * Task 4 — deterministic longitudinal timeline query layer.
 *
 * Answers factual historical questions from stored personal_events only.
 * Does NOT diagnose, infer causes, claim correlations, or call an LLM.
 *
 * Timestamp authority:
 * - occurred_at: chronological authority for timeline queries
 * - created_at / updated_at: persistence metadata
 * - temporal_context: linguistic expression only (never invents dates)
 *
 * Timezone:
 * - validated IANA identifiers via Intl
 * - fallback: UTC (documented)
 */
import { isAllowedSignalType, normalizeSignalType, normalizeSubtype } from './signalTaxonomy.mjs';

export const TIMELINE_DEFAULT_LIMIT = 50;
export const TIMELINE_MAX_LIMIT = 200;
export const TIMELINE_MAX_WINDOW_DAYS = 366;
export const TIMELINE_DEFAULT_REPEATED_THRESHOLD = 2;
export const TIMELINE_DEFAULT_CHANGE_WINDOW_DAYS = 14;
export const TIMELINE_MAX_CO_OCCURRENCE_HOURS = 72;
export const TIMELINE_DEFAULT_TIMEZONE = 'UTC';

const POSITIVE_DEFAULT_STATUSES = new Set(['confirmed', 'corrected']);
const ALL_SIGNAL_STATUSES = new Set(['unreviewed', 'confirmed', 'corrected', 'rejected']);

const safeText = (value, max = 120) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, max);
};

const isIsoTimestamp = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  return Number.isFinite(Date.parse(value));
};

/**
 * Validate IANA timezone. Returns { ok, timezone, fallback_used }.
 * Invalid timezone → fallback UTC (documented contract).
 */
export const resolveTimelineTimezone = (raw) => {
  const candidate = safeText(raw || '', 80) || TIMELINE_DEFAULT_TIMEZONE;
  try {
    // Throws RangeError for invalid IANA zones in modern Node/Intl.
    new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date());
    return {
      ok: true,
      timezone: candidate,
      fallback_used: candidate === TIMELINE_DEFAULT_TIMEZONE && !raw,
      invalid_rejected: false,
    };
  } catch {
    return {
      ok: true,
      timezone: TIMELINE_DEFAULT_TIMEZONE,
      fallback_used: true,
      invalid_rejected: true,
      requested: candidate,
    };
  }
};

/** Local calendar day key YYYY-MM-DD in the given IANA timezone. */
export const localDayKey = (isoTimestamp, timezone = TIMELINE_DEFAULT_TIMEZONE) => {
  const ms = Date.parse(isoTimestamp);
  if (!Number.isFinite(ms)) return null;
  const tz = resolveTimelineTimezone(timezone).timezone;
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(ms));
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (!y || !m || !d) return null;
    return `${y}-${m}-${d}`;
  } catch {
    return new Date(ms).toISOString().slice(0, 10);
  }
};

const parseBool = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const s = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'off'].includes(s)) return false;
  return defaultValue;
};

const clampLimit = (raw, fallback = TIMELINE_DEFAULT_LIMIT) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(TIMELINE_MAX_LIMIT, Math.max(1, Math.floor(n)));
};

const clampOffset = (raw) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

/**
 * Parse and validate since/until. Rejects inverted ranges and excessive windows.
 */
export const parseTimelineRange = ({ since, until, maxWindowDays = TIMELINE_MAX_WINDOW_DAYS } = {}) => {
  let sinceIso = null;
  let untilIso = null;
  if (since != null && since !== '') {
    if (!isIsoTimestamp(String(since))) return { error: 'Invalid since timestamp.' };
    sinceIso = new Date(since).toISOString();
  }
  if (until != null && until !== '') {
    if (!isIsoTimestamp(String(until))) return { error: 'Invalid until timestamp.' };
    untilIso = new Date(until).toISOString();
  }
  if (sinceIso && untilIso && Date.parse(sinceIso) > Date.parse(untilIso)) {
    return { error: 'Invalid date range: since must be <= until.' };
  }
  if (sinceIso && untilIso) {
    const days = (Date.parse(untilIso) - Date.parse(sinceIso)) / 86_400_000;
    if (days > maxWindowDays) {
      return { error: `Date range exceeds maximum of ${maxWindowDays} days.` };
    }
  }
  return { since: sinceIso, until: untilIso };
};

const effectiveSignalType = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.user_status === 'corrected' && payload.correction?.corrected_value?.signal_type) {
    return normalizeSignalType(payload.correction.corrected_value.signal_type) || payload.signal_type;
  }
  return normalizeSignalType(payload.signal_type) || payload.signal_type || null;
};

const effectiveNormalizedValue = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.user_status === 'corrected' && payload.correction?.corrected_value) {
    const cv = payload.correction.corrected_value;
    if (cv.normalized_value !== undefined) {
      return normalizeSubtype(cv.normalized_value);
    }
  }
  return normalizeSubtype(payload.normalized_value);
};

const effectiveNegated = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.user_status === 'corrected' && payload.correction?.corrected_value?.negated !== undefined) {
    return Boolean(payload.correction.corrected_value.negated);
  }
  return Boolean(payload.negated);
};

const effectiveUncertain = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.user_status === 'corrected' && payload.correction?.corrected_value?.uncertain !== undefined) {
    return Boolean(payload.correction.corrected_value.uncertain);
  }
  return Boolean(payload.uncertain);
};

/**
 * Signal eligibility for positive occurrence queries.
 */
export const isEligiblePositiveSignal = (event, options = {}) => {
  if (!event || event.event_type !== 'signal' || event.deleted_at) return false;
  const payload = event.payload || {};
  const status = String(payload.user_status || 'unreviewed');
  if (!ALL_SIGNAL_STATUSES.has(status)) return false;
  if (status === 'rejected') return false;

  const includeCandidates = Boolean(options.includeCandidates);
  const includeNegated = Boolean(options.includeNegated);
  const includeUncertain = options.includeUncertain !== false; // uncertain may still be listed; marked as such

  if (status === 'unreviewed' && !includeCandidates) return false;
  if (!POSITIVE_DEFAULT_STATUSES.has(status) && status !== 'unreviewed') return false;

  if (effectiveNegated(payload) && !includeNegated) return false;
  if (effectiveUncertain(payload) && includeUncertain === false) return false;

  return true;
};

/** Public occurrence fact — no raw observation text. */
export const toOccurrenceFact = (event, timezone = TIMELINE_DEFAULT_TIMEZONE) => {
  const payload = event.payload || {};
  return {
    signal_id: event.id,
    event_type: event.event_type,
    occurred_at: event.occurred_at,
    local_day: localDayKey(event.occurred_at, timezone),
    signal_type: effectiveSignalType(payload),
    normalized_value: effectiveNormalizedValue(payload),
    display_label: payload.display_label || null,
    source_observation_id: payload.source_observation_id || null,
    source_surface: null, // filled when observation loaded; list endpoints omit raw text
    user_status: payload.user_status || 'unreviewed',
    uncertain: effectiveUncertain(payload),
    negated: effectiveNegated(payload),
    confidence: typeof payload.confidence === 'number' ? payload.confidence : null,
    temporal_context: payload.temporal_context || null,
    recurrence_marker: Boolean(payload.recurrence_marker),
  };
};

const matchesSignalFilters = (event, { signalType, subtype } = {}) => {
  const payload = event.payload || {};
  const type = effectiveSignalType(payload);
  const value = effectiveNormalizedValue(payload);
  if (signalType && type !== signalType) return false;
  if (subtype != null && subtype !== '' && value !== subtype) return false;
  return true;
};

const fetchOwnedEvents = async (store, userId, { eventType, since, until, limit = TIMELINE_MAX_LIMIT, offset = 0 } = {}) => {
  if (typeof store.list !== 'function') {
    return { events: [], total: 0, limit, offset };
  }
  return store.list(userId, {
    eventType,
    since,
    until,
    limit,
    offset,
    includeDeleted: false,
  });
};

/**
 * Load signals for a user within optional range, then apply eligibility filters in memory
 * (payload JSON filters are not indexed; owner+type+time already scoped by store).
 */
export const loadEligibleSignals = async (store, userId, filters = {}) => {
  const listed = await fetchOwnedEvents(store, userId, {
    eventType: 'signal',
    since: filters.since,
    until: filters.until,
    limit: TIMELINE_MAX_LIMIT,
    offset: 0,
  });
  const events = (listed.events || []).filter((event) => {
    if (!isEligiblePositiveSignal(event, filters)) return false;
    return matchesSignalFilters(event, filters);
  });
  return events;
};

export const buildRecurrenceFacts = (occurrences, { repeatedThreshold = TIMELINE_DEFAULT_REPEATED_THRESHOLD, timezone = TIMELINE_DEFAULT_TIMEZONE } = {}) => {
  const sorted = [...occurrences].sort(
    (a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at) || String(a.signal_id).localeCompare(String(b.signal_id)),
  );
  const days = new Set(sorted.map((o) => o.local_day).filter(Boolean));
  const first = sorted[0] || null;
  const latest = sorted[sorted.length - 1] || null;
  let daysBetween = null;
  if (first && latest && sorted.length >= 2) {
    daysBetween = Math.round((Date.parse(latest.occurred_at) - Date.parse(first.occurred_at)) / 86_400_000);
  }
  const threshold = Math.max(2, Math.floor(Number(repeatedThreshold) || TIMELINE_DEFAULT_REPEATED_THRESHOLD));
  return {
    occurrence_count: sorted.length,
    active_days: days.size,
    first_occurred_at: first?.occurred_at || null,
    latest_occurred_at: latest?.occurred_at || null,
    days_between_first_and_latest: daysBetween,
    repeated: sorted.length >= threshold,
    repeated_threshold: threshold,
    timezone,
    // Explicit: numeric recurrence fact only — not a medical pattern claim.
    semantics: 'numeric_recurrence_fact',
  };
};

const classifyRecordingChange = ({ currentCount, previousCount, presenceCurrent, presencePrevious }) => {
  if (!presencePrevious && presenceCurrent) return 'newly_recorded';
  if (presencePrevious && !presenceCurrent) return 'not_recently_recorded';
  if (currentCount > previousCount) return 'increased_recording';
  if (currentCount < previousCount) return 'decreased_recording';
  return 'unchanged_recording';
};

export const listTimeline = async (store, userId, rawFilters = {}) => {
  const tz = resolveTimelineTimezone(rawFilters.timezone);
  const range = parseTimelineRange({ since: rawFilters.since, until: rawFilters.until });
  if (range.error) return { error: range.error, status: 400 };

  const limit = clampLimit(rawFilters.limit);
  const offset = clampOffset(rawFilters.offset);
  const eventType = safeText(rawFilters.event_type || rawFilters.eventType || '', 40) || undefined;
  if (eventType && !['observation', 'signal', 'note', 'reflection', 'voice_reflection'].includes(eventType)) {
    // Allow known foundation types; unknown types still queryable if stored.
  }

  const listed = await fetchOwnedEvents(store, userId, {
    eventType,
    since: range.since,
    until: range.until,
    limit: TIMELINE_MAX_LIMIT,
    offset: 0,
  });

  let events = listed.events || [];

  // For signal rows, apply eligibility unless include_all_statuses.
  if (!eventType || eventType === 'signal') {
    const includeCandidates = parseBool(rawFilters.include_candidates ?? rawFilters.includeCandidates, false);
    const includeNegated = parseBool(rawFilters.include_negated ?? rawFilters.includeNegated, false);
    events = events.filter((event) => {
      if (event.event_type !== 'signal') return true;
      return isEligiblePositiveSignal(event, { includeCandidates, includeNegated });
    });
  }

  if (rawFilters.signal_type || rawFilters.signalType) {
    const signalType = normalizeSignalType(rawFilters.signal_type || rawFilters.signalType);
    if (!signalType) return { error: 'Invalid signal_type.', status: 400 };
    events = events.filter((e) => e.event_type !== 'signal' || matchesSignalFilters(e, { signalType }));
  }

  if (rawFilters.source_surface || rawFilters.sourceSurface) {
    const surface = safeText(rawFilters.source_surface || rawFilters.sourceSurface, 40);
    events = events.filter((e) => {
      if (e.event_type === 'observation') return e.payload?.source_surface === surface;
      return true;
    });
  }

  events.sort(
    (a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at) || String(b.id).localeCompare(String(a.id)),
  );
  const total = events.length;
  const sliced = events.slice(offset, offset + limit);

  // Broad list: never include raw_text by default.
  const items = sliced.map((event) => {
    if (event.event_type === 'signal') {
      return {
        kind: 'signal',
        ...toOccurrenceFact(event, tz.timezone),
      };
    }
    if (event.event_type === 'observation') {
      return {
        kind: 'observation',
        observation_id: event.id,
        occurred_at: event.occurred_at,
        local_day: localDayKey(event.occurred_at, tz.timezone),
        observation_kind: event.payload?.observation_kind || null,
        source_surface: event.payload?.source_surface || null,
        input_mode: event.payload?.input_mode || null,
        language: event.payload?.language || null,
        // raw_text intentionally omitted — use getObservationContext
        has_raw_text: Boolean(event.payload?.raw_text),
      };
    }
    return {
      kind: 'event',
      id: event.id,
      event_type: event.event_type,
      occurred_at: event.occurred_at,
      local_day: localDayKey(event.occurred_at, tz.timezone),
      source: event.source,
    };
  });

  return {
    items,
    total,
    limit,
    offset,
    timezone: tz.timezone,
    timezone_fallback_used: tz.fallback_used,
    timezone_invalid_requested: tz.invalid_rejected || false,
    since: range.since,
    until: range.until,
  };
};

export const getSignalHistory = async (store, userId, signalTypeRaw, rawFilters = {}) => {
  const signalType = normalizeSignalType(signalTypeRaw);
  if (!signalType || !isAllowedSignalType(signalType)) {
    return { error: 'Invalid or unsupported signal_type.', status: 400 };
  }
  const subtypeRaw = rawFilters.subtype ?? rawFilters.normalized_value;
  const subtype = subtypeRaw != null && subtypeRaw !== '' ? normalizeSubtype(subtypeRaw) : null;

  const tz = resolveTimelineTimezone(rawFilters.timezone);
  const range = parseTimelineRange({ since: rawFilters.since, until: rawFilters.until });
  if (range.error) return { error: range.error, status: 400 };

  const includeCandidates = parseBool(rawFilters.include_candidates ?? rawFilters.includeCandidates, false);
  const includeNegated = parseBool(rawFilters.include_negated ?? rawFilters.includeNegated, false);
  const repeatedThreshold = Number(rawFilters.repeated_threshold ?? rawFilters.repeatedThreshold) || TIMELINE_DEFAULT_REPEATED_THRESHOLD;

  // Load all signals in range (including rejected/negated) for status distribution.
  const listed = await fetchOwnedEvents(store, userId, {
    eventType: 'signal',
    since: range.since,
    until: range.until,
    limit: TIMELINE_MAX_LIMIT,
    offset: 0,
  });
  const allMatching = (listed.events || []).filter((event) => {
    if (event.deleted_at) return false;
    return matchesSignalFilters(event, { signalType, subtype });
  });

  const statusDistribution = { unreviewed: 0, confirmed: 0, corrected: 0, rejected: 0 };
  const uncertaintyDistribution = { uncertain: 0, certain: 0 };
  const negatedCount = { negated: 0, not_negated: 0 };

  for (const event of allMatching) {
    const status = String(event.payload?.user_status || 'unreviewed');
    if (statusDistribution[status] != null) statusDistribution[status] += 1;
    if (effectiveUncertain(event.payload)) uncertaintyDistribution.uncertain += 1;
    else uncertaintyDistribution.certain += 1;
    if (effectiveNegated(event.payload)) negatedCount.negated += 1;
    else negatedCount.not_negated += 1;
  }

  const eligible = allMatching.filter((event) =>
    isEligiblePositiveSignal(event, { includeCandidates, includeNegated }),
  );
  const occurrences = eligible.map((event) => toOccurrenceFact(event, tz.timezone));
  const recurrence = buildRecurrenceFacts(occurrences, {
    repeatedThreshold,
    timezone: tz.timezone,
  });

  // Preserve temporal_context as linguistic only — never invent start dates from "recently" / "for three days".
  const temporalExpressions = occurrences
    .map((o) => o.temporal_context)
    .filter(Boolean)
    .slice(0, 20);

  return {
    signal_type: signalType,
    subtype,
    timezone: tz.timezone,
    timezone_fallback_used: tz.fallback_used,
    since: range.since,
    until: range.until,
    recurrence,
    status_distribution: statusDistribution,
    uncertainty_distribution: uncertaintyDistribution,
    negation_distribution: negatedCount,
    occurrences,
    temporal_expressions: temporalExpressions,
    notes: {
      duration_expressions_do_not_fabricate_daily_events: true,
      vague_temporal_does_not_invent_start_date: true,
      semantics: 'factual_recording_history',
    },
  };
};

export const getRecentChanges = async (store, userId, rawFilters = {}) => {
  const signalType = normalizeSignalType(rawFilters.signal_type || rawFilters.signalType);
  if (!signalType) return { error: 'signal_type is required.', status: 400 };

  const subtypeRaw = rawFilters.subtype ?? rawFilters.normalized_value;
  const subtype = subtypeRaw != null && subtypeRaw !== '' ? normalizeSubtype(subtypeRaw) : null;
  const tz = resolveTimelineTimezone(rawFilters.timezone);
  const windowDays = Math.min(
    90,
    Math.max(1, Math.floor(Number(rawFilters.window_days ?? rawFilters.windowDays) || TIMELINE_DEFAULT_CHANGE_WINDOW_DAYS)),
  );
  const includeCandidates = parseBool(rawFilters.include_candidates ?? rawFilters.includeCandidates, false);
  const includeNegated = parseBool(rawFilters.include_negated ?? rawFilters.includeNegated, false);

  const nowMs = Number.isFinite(Date.parse(rawFilters.as_of || '')) ? Date.parse(rawFilters.as_of) : Date.now();
  const currentUntil = new Date(nowMs).toISOString();
  const currentSince = new Date(nowMs - windowDays * 86_400_000).toISOString();
  const previousUntil = currentSince;
  const previousSince = new Date(nowMs - windowDays * 2 * 86_400_000).toISOString();

  const loadWindow = async (since, until) => {
    const events = await loadEligibleSignals(store, userId, {
      since,
      until,
      signalType,
      subtype,
      includeCandidates,
      includeNegated,
    });
    const facts = events.map((e) => toOccurrenceFact(e, tz.timezone));
    const days = new Set(facts.map((f) => f.local_day).filter(Boolean));
    return { count: facts.length, active_days: days.size, presence: facts.length > 0, facts };
  };

  const current = await loadWindow(currentSince, currentUntil);
  const previous = await loadWindow(previousSince, previousUntil);
  const classification = classifyRecordingChange({
    currentCount: current.count,
    previousCount: previous.count,
    presenceCurrent: current.presence,
    presencePrevious: previous.presence,
  });

  return {
    signal_type: signalType,
    subtype,
    timezone: tz.timezone,
    window_days: windowDays,
    current_window: { since: currentSince, until: currentUntil },
    previous_window: { since: previousSince, until: previousUntil },
    current_count: current.count,
    previous_count: previous.count,
    absolute_delta: current.count - previous.count,
    active_days_current: current.active_days,
    active_days_previous: previous.active_days,
    presence_current: current.presence,
    presence_previous: previous.presence,
    recording_change: classification,
    // Safe factual language only — about recorded signals, not biology.
    statement:
      classification === 'increased_recording'
        ? `${signalType} signals were recorded more often in the recent ${windowDays}-day window than in the preceding window.`
        : classification === 'decreased_recording'
          ? `${signalType} signals were recorded less often in the recent ${windowDays}-day window than in the preceding window.`
          : classification === 'newly_recorded'
            ? `${signalType} signals were recorded in the recent ${windowDays}-day window and not in the preceding window.`
            : classification === 'not_recently_recorded'
              ? `${signalType} signals were not recorded in the recent ${windowDays}-day window.`
              : `${signalType} signal recording count was unchanged across the compared ${windowDays}-day windows.`,
    semantics: 'recorded_observation_change_only',
  };
};

export const getCoOccurrences = async (store, userId, rawFilters = {}) => {
  const mode = safeText(rawFilters.mode || 'same_local_day', 40) || 'same_local_day';
  if (mode !== 'same_local_day' && mode !== 'within_hours') {
    return { error: 'mode must be same_local_day or within_hours.', status: 400 };
  }

  const signalTypeA = normalizeSignalType(rawFilters.signal_type_a || rawFilters.signalTypeA);
  const signalTypeB = normalizeSignalType(rawFilters.signal_type_b || rawFilters.signalTypeB);
  if (!signalTypeA || !signalTypeB) {
    return { error: 'signal_type_a and signal_type_b are required.', status: 400 };
  }

  const tz = resolveTimelineTimezone(rawFilters.timezone);
  const range = parseTimelineRange({ since: rawFilters.since, until: rawFilters.until });
  if (range.error) return { error: range.error, status: 400 };

  const includeCandidates = parseBool(rawFilters.include_candidates ?? rawFilters.includeCandidates, false);
  const includeNegated = parseBool(rawFilters.include_negated ?? rawFilters.includeNegated, false);
  const withinHours = Math.min(
    TIMELINE_MAX_CO_OCCURRENCE_HOURS,
    Math.max(1, Math.floor(Number(rawFilters.within_hours ?? rawFilters.withinHours) || 24)),
  );

  const [listA, listB] = await Promise.all([
    loadEligibleSignals(store, userId, {
      since: range.since,
      until: range.until,
      signalType: signalTypeA,
      includeCandidates,
      includeNegated,
    }),
    loadEligibleSignals(store, userId, {
      since: range.since,
      until: range.until,
      signalType: signalTypeB,
      includeCandidates,
      includeNegated,
    }),
  ]);

  const factsA = listA.map((e) => toOccurrenceFact(e, tz.timezone));
  const factsB = listB.map((e) => toOccurrenceFact(e, tz.timezone));
  const pairs = [];

  if (mode === 'same_local_day') {
    const byDayB = new Map();
    for (const b of factsB) {
      if (!b.local_day) continue;
      if (!byDayB.has(b.local_day)) byDayB.set(b.local_day, []);
      byDayB.get(b.local_day).push(b);
    }
    const dayCounts = new Map();
    for (const a of factsA) {
      if (!a.local_day) continue;
      const matches = byDayB.get(a.local_day) || [];
      for (const b of matches) {
        // Avoid pairing a signal with itself if types somehow collide on same id.
        if (a.signal_id === b.signal_id) continue;
        const key = a.local_day;
        if (!dayCounts.has(key)) {
          dayCounts.set(key, {
            local_day: key,
            signal_a_ids: new Set(),
            signal_b_ids: new Set(),
            pairs: [],
          });
        }
        const bucket = dayCounts.get(key);
        bucket.signal_a_ids.add(a.signal_id);
        bucket.signal_b_ids.add(b.signal_id);
        bucket.pairs.push({ a, b });
      }
    }
    for (const bucket of dayCounts.values()) {
      pairs.push({
        mode: 'same_local_day',
        local_day: bucket.local_day,
        signal_type_a: signalTypeA,
        signal_type_b: signalTypeB,
        co_occurrence_count: bucket.pairs.length,
        signal_a_ids: [...bucket.signal_a_ids],
        signal_b_ids: [...bucket.signal_b_ids],
        sample_statuses: bucket.pairs.slice(0, 5).map(({ a, b }) => ({
          a_status: a.user_status,
          b_status: b.user_status,
          a_uncertain: a.uncertain,
          b_uncertain: b.uncertain,
        })),
      });
    }
  } else {
    // within_hours
    const windowMs = withinHours * 3_600_000;
    const used = new Set();
    for (const a of factsA) {
      for (const b of factsB) {
        if (a.signal_id === b.signal_id) continue;
        const delta = Math.abs(Date.parse(a.occurred_at) - Date.parse(b.occurred_at));
        if (delta > windowMs) continue;
        const pairKey = [a.signal_id, b.signal_id].sort().join(':');
        if (used.has(pairKey)) continue;
        used.add(pairKey);
        pairs.push({
          mode: 'within_hours',
          within_hours: withinHours,
          signal_type_a: signalTypeA,
          signal_type_b: signalTypeB,
          signal_a_id: a.signal_id,
          signal_b_id: b.signal_id,
          occurred_at_a: a.occurred_at,
          occurred_at_b: b.occurred_at,
          delta_hours: Math.round((delta / 3_600_000) * 100) / 100,
          a_status: a.user_status,
          b_status: b.user_status,
          a_uncertain: a.uncertain,
          b_uncertain: b.uncertain,
          local_day_a: a.local_day,
          local_day_b: b.local_day,
        });
      }
    }
  }

  return {
    mode,
    signal_type_a: signalTypeA,
    signal_type_b: signalTypeB,
    timezone: tz.timezone,
    within_hours: mode === 'within_hours' ? withinHours : null,
    co_occurrences: pairs,
    co_occurrence_total: pairs.length,
    // Explicit non-claims
    semantics: 'co_occurrence_only',
    not_correlation: true,
    not_causation: true,
    not_medical_pattern: true,
  };
};

export const getObservationContext = async (store, userId, observationId) => {
  const id = safeText(observationId, 120);
  if (!id) return { error: 'Observation id is required.', status: 400 };
  const owned = await store.getOwned(userId, id);
  // Do not reveal whether another user's observation exists.
  if (!owned || owned.event_type !== 'observation' || owned.deleted_at) {
    return { error: 'Observation not found.', status: 404 };
  }

  const linkedSignalsListed = await fetchOwnedEvents(store, userId, {
    eventType: 'signal',
    limit: TIMELINE_MAX_LIMIT,
    offset: 0,
  });
  const linkedSignals = (linkedSignalsListed.events || [])
    .filter((e) => e.payload?.source_observation_id === owned.id && !e.deleted_at)
    .map((e) => toOccurrenceFact(e, TIMELINE_DEFAULT_TIMEZONE));

  return {
    observation: {
      id: owned.id,
      user_id: owned.user_id,
      event_type: owned.event_type,
      occurred_at: owned.occurred_at,
      created_at: owned.created_at,
      updated_at: owned.updated_at,
      source: owned.source,
      payload: {
        observation_kind: owned.payload?.observation_kind || null,
        raw_text: owned.payload?.raw_text || '',
        input_mode: owned.payload?.input_mode || null,
        source_surface: owned.payload?.source_surface || null,
        language: owned.payload?.language || null,
        transcript_status: owned.payload?.transcript_status || null,
        temporal_note:
          'temporal_context on linked signals is linguistic only; occurred_at is chronological authority.',
      },
    },
    linked_signals: linkedSignals,
  };
};

export const getTimelineSummaryData = async (store, userId, rawFilters = {}) => {
  const tz = resolveTimelineTimezone(rawFilters.timezone);
  const windowDays = Math.min(
    90,
    Math.max(1, Math.floor(Number(rawFilters.window_days ?? rawFilters.windowDays) || TIMELINE_DEFAULT_CHANGE_WINDOW_DAYS)),
  );
  const until = new Date().toISOString();
  const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();
  const includeCandidates = parseBool(rawFilters.include_candidates ?? rawFilters.includeCandidates, false);

  const signals = await loadEligibleSignals(store, userId, {
    since,
    until,
    includeCandidates,
    includeNegated: false,
  });

  const byType = {};
  for (const event of signals) {
    const type = effectiveSignalType(event.payload);
    if (!type) continue;
    if (!byType[type]) byType[type] = [];
    byType[type].push(toOccurrenceFact(event, tz.timezone));
  }

  const signal_summaries = Object.entries(byType).map(([signal_type, occurrences]) => ({
    signal_type,
    ...buildRecurrenceFacts(occurrences, { timezone: tz.timezone }),
  }));

  const observationsListed = await fetchOwnedEvents(store, userId, {
    eventType: 'observation',
    since,
    until,
    limit: TIMELINE_MAX_LIMIT,
    offset: 0,
  });

  return {
    timezone: tz.timezone,
    window_days: windowDays,
    since,
    until,
    observation_count: observationsListed.total || (observationsListed.events || []).length,
    eligible_signal_count: signals.length,
    signal_summaries,
    cycle_context: {
      available: false,
      reason: 'insufficient_deterministic_cycle_events_for_phase_inference',
    },
    semantics: 'deterministic_factual_summary',
    no_medical_interpretation: true,
  };
};
