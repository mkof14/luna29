/**
 * Task 5 — Deterministic Pattern Candidate Engine v1.
 *
 * Evidence-thresholded candidate regularities from owner-scoped signals.
 * Does NOT use Gemini/LLMs/embeddings. Does NOT claim causation, correlation,
 * diagnosis, or medical conclusions.
 *
 * Explicitly NOT based on PatternInsightCards.buildPatterns (unsafe heuristics).
 */
import {
  localDayKey,
  resolveTimelineTimezone,
  isEligiblePositiveSignal,
  toOccurrenceFact,
  getCoOccurrences,
  getRecentChanges,
  TIMELINE_DEFAULT_TIMEZONE,
} from './timelineQueryService.mjs';
import { isAllowedSignalType, normalizeSignalType, normalizeSubtype } from './signalTaxonomy.mjs';

export const PATTERN_ENGINE_VERSION = 'pattern_candidates_v1';
export const PATTERN_THRESHOLD_VERSION = 'thresholds_v1';
export const PATTERN_CANDIDATE_EVENT_TYPE = 'pattern_candidate';

export const PATTERN_EVAL_DEFAULT_WINDOW_DAYS = 180;
export const PATTERN_EVAL_MAX_WINDOW_DAYS = 365;
export const PATTERN_MAX_SIGNAL_SCAN = 2000;
export const PATTERN_STALE_DAYS = 60;

/** Uncertain signals are EXCLUDED from candidate evidence by default (v1). */
export const PATTERN_INCLUDE_UNCERTAIN_EVIDENCE = false;

export const PATTERN_CANDIDATE_TYPES = new Set([
  'repeated_signal',
  'repeated_co_occurrence',
  'repeated_temporal_proximity',
  'sustained_recording_increase',
]);

export const PATTERN_STATUSES = new Set([
  'candidate',
  'confirmed',
  'rejected',
  'stale',
  'invalidated',
]);

export const PATTERN_THRESHOLDS = {
  version: PATTERN_THRESHOLD_VERSION,
  repeated_signal: {
    min_occurrences: 3,
    min_active_days: 3,
    min_span_days: 7,
  },
  repeated_co_occurrence: {
    min_co_occurrence_days: 3,
    min_span_days: 7,
  },
  repeated_temporal_proximity: {
    min_distinct_windows: 3,
    max_proximity_hours: 24,
    min_span_days: 7,
  },
  sustained_recording_increase: {
    min_consecutive_supporting_comparisons: 2,
    min_current_window_occurrences: 2,
    window_days: 14,
  },
  /** Rejected suppression: regenerate only if evidence grows materially. */
  rejection_suppression: {
    min_evidence_count_delta: 2,
    min_active_days_delta: 2,
  },
  /** Confidence bands (evidence strength only — not medical probability). */
  confidence: {
    moderate_extra_active_days: 2,
    moderate_extra_span_days: 14,
    strong_extra_active_days: 5,
    strong_extra_span_days: 45,
  },
};

const SEMANTICS = {
  candidate_regularities_only: true,
  not_diagnosis: true,
  not_causation: true,
  not_correlation: true,
  not_medical_conclusion: true,
};

const safeText = (value, max = 120) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, max);
};

const labelFor = (signalType, subtype) => {
  const raw = subtype || signalType || 'signal';
  return String(raw)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 80);
};

const signalDefKey = (signalType, subtype) =>
  `${signalType}:${subtype == null || subtype === '' ? '_' : subtype}`;

const sortedPairKey = (aType, aSub, bType, bSub) => {
  const a = signalDefKey(aType, aSub);
  const b = signalDefKey(bType, bSub);
  return a <= b ? `${a}|${b}` : `${b}|${a}`;
};

const hashKey = (value) => {
  const s = String(value || '');
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
};

export const buildCandidateKey = (parts) => {
  const body = [
    PATTERN_ENGINE_VERSION,
    PATTERN_THRESHOLD_VERSION,
    parts.candidate_type,
    parts.definition_key,
    parts.extra || '',
  ].join('::');
  // Deterministic opaque-ish key without raw health text.
  let hash = 0;
  for (let i = 0; i < body.length; i += 1) {
    hash = (hash * 31 + body.charCodeAt(i)) >>> 0;
  }
  return `pc:${parts.candidate_type}:${hash.toString(16)}:${body.length}`;
};

const spanDays = (firstIso, latestIso) => {
  if (!firstIso || !latestIso) return 0;
  return Math.max(0, Math.round((Date.parse(latestIso) - Date.parse(firstIso)) / 86_400_000));
};

export const confidenceBandFor = ({ evidenceCount, activeDays, spanDays: span, threshold }) => {
  const minOcc = threshold.min_occurrences || threshold.min_co_occurrence_days || threshold.min_distinct_windows || 3;
  const minDays = threshold.min_active_days || threshold.min_co_occurrence_days || threshold.min_distinct_windows || 3;
  const minSpan = threshold.min_span_days || 7;
  const cfg = PATTERN_THRESHOLDS.confidence;

  const strong =
    evidenceCount >= minOcc + cfg.strong_extra_active_days &&
    activeDays >= minDays + cfg.strong_extra_active_days &&
    span >= minSpan + cfg.strong_extra_span_days;
  if (strong) return 'strong';

  const moderate =
    evidenceCount >= minOcc + 1 &&
    (activeDays >= minDays + cfg.moderate_extra_active_days || span >= minSpan + cfg.moderate_extra_span_days);
  if (moderate) return 'moderate';

  return 'low';
};

const publicCandidate = (event) => {
  const p = event.payload || {};
  return {
    id: event.id,
    user_id: event.user_id,
    event_type: event.event_type,
    occurred_at: event.occurred_at,
    created_at: event.created_at,
    updated_at: event.updated_at,
    candidate_type: p.candidate_type,
    candidate_key: p.candidate_key,
    title: p.title,
    description: p.description,
    semantics: p.semantics || SEMANTICS,
    status: p.status,
    confidence_band: p.confidence_band,
    evidence_count: p.evidence_count,
    active_days: p.active_days,
    first_evidence_at: p.first_evidence_at,
    latest_evidence_at: p.latest_evidence_at,
    evidence_window_start: p.evidence_window_start,
    evidence_window_end: p.evidence_window_end,
    evidence_signal_ids: p.evidence_signal_ids || [],
    evidence_observation_ids: p.evidence_observation_ids || [],
    signal_definitions: p.signal_definitions || [],
    threshold_definition: p.threshold_definition || null,
    uncertainty_summary: p.uncertainty_summary || { included: false, uncertain_count: 0 },
    generated_by: p.generated_by || 'pattern_candidates_engine',
    engine_version: p.engine_version,
    generated_at: p.generated_at,
    last_evaluated_at: p.last_evaluated_at,
    invalidation_reason: p.invalidation_reason || null,
    user_confirmed_at: p.user_confirmed_at || null,
    user_rejected_at: p.user_rejected_at || null,
    supersedes_candidate_id: p.supersedes_candidate_id || null,
    deleted_at: event.deleted_at,
  };
};

const fetchSignals = async (store, userId, { since, until } = {}) => {
  const listed = await store.list(userId, {
    eventType: 'signal',
    since,
    until,
    limit: PATTERN_MAX_SIGNAL_SCAN,
    offset: 0,
  });
  return listed.events || [];
};

const fetchCandidates = async (store, userId) => {
  const listed = await store.list(userId, {
    eventType: PATTERN_CANDIDATE_EVENT_TYPE,
    limit: PATTERN_MAX_SIGNAL_SCAN,
    offset: 0,
  });
  return listed.events || [];
};

/** Pattern evidence eligibility: confirmed/corrected only; no rejected/negated/unreviewed/uncertain. */
export const isPatternEvidenceSignal = (event) =>
  isEligiblePositiveSignal(event, {
    includeCandidates: false,
    includeNegated: false,
    includeUncertain: PATTERN_INCLUDE_UNCERTAIN_EVIDENCE,
  });

const groupByDefinition = (events, timezone) => {
  const map = new Map();
  for (const event of events) {
    if (!isPatternEvidenceSignal(event)) continue;
    const fact = toOccurrenceFact(event, timezone);
    if (!fact.signal_type || !isAllowedSignalType(fact.signal_type)) continue;
    const key = signalDefKey(fact.signal_type, fact.normalized_value);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ event, fact });
  }
  return map;
};

const buildRepeatedSignalCandidates = (grouped, timezone, windowMeta) => {
  const thr = PATTERN_THRESHOLDS.repeated_signal;
  const out = [];
  for (const [defKey, rows] of grouped.entries()) {
    const sorted = [...rows].sort(
      (a, b) => Date.parse(a.fact.occurred_at) - Date.parse(b.fact.occurred_at),
    );
    const days = new Set(sorted.map((r) => r.fact.local_day).filter(Boolean));
    const first = sorted[0]?.fact.occurred_at;
    const latest = sorted[sorted.length - 1]?.fact.occurred_at;
    const span = spanDays(first, latest);
    if (sorted.length < thr.min_occurrences) continue;
    if (days.size < thr.min_active_days) continue;
    if (span < thr.min_span_days) continue;

    const signalType = sorted[0].fact.signal_type;
    const subtype = sorted[0].fact.normalized_value;
    const label = labelFor(signalType, subtype);
    const candidate_key = buildCandidateKey({
      candidate_type: 'repeated_signal',
      definition_key: defKey,
    });
    const band = confidenceBandFor({
      evidenceCount: sorted.length,
      activeDays: days.size,
      spanDays: span,
      threshold: thr,
    });
    out.push({
      candidate_type: 'repeated_signal',
      candidate_key,
      title: `Repeated recording: ${label}`,
      description: `${label} was recorded on ${days.size} distinct days across ${span} days (${sorted.length} eligible recordings).`,
      confidence_band: band,
      evidence_count: sorted.length,
      active_days: days.size,
      first_evidence_at: first,
      latest_evidence_at: latest,
      evidence_window_start: windowMeta.since,
      evidence_window_end: windowMeta.until,
      evidence_signal_ids: sorted.map((r) => r.event.id),
      evidence_observation_ids: [
        ...new Set(sorted.map((r) => r.fact.source_observation_id).filter(Boolean)),
      ],
      signal_definitions: [{ signal_type: signalType, normalized_value: subtype }],
      threshold_definition: { ...thr, version: PATTERN_THRESHOLD_VERSION },
      uncertainty_summary: { included: false, uncertain_count: 0, rule: 'uncertain_excluded_v1' },
      timezone,
    });
  }
  return out;
};

const buildCoOccurrenceCandidates = async (store, userId, definitions, timezone, windowMeta) => {
  const thr = PATTERN_THRESHOLDS.repeated_co_occurrence;
  const out = [];
  const defs = [...definitions.keys()];
  // Bound pairwise: O(d^2) over distinct definitions only (not raw events).
  for (let i = 0; i < defs.length; i += 1) {
    for (let j = i + 1; j < defs.length; j += 1) {
      const [typeA, subA] = defs[i].split(':');
      const [typeB, subB] = defs[j].split(':');
      const subtypeA = subA === '_' ? null : subA;
      const subtypeB = subB === '_' ? null : subB;
      const result = await getCoOccurrences(store, userId, {
        mode: 'same_local_day',
        signal_type_a: typeA,
        signal_type_b: typeB,
        subtype_a: subtypeA,
        subtype_b: subtypeB,
        since: windowMeta.since,
        until: windowMeta.until,
        timezone,
        include_candidates: false,
        include_negated: false,
      });
      if (result.error) continue;
      const days = (result.co_occurrences || []).map((c) => c.local_day).filter(Boolean);
      if (days.length < thr.min_co_occurrence_days) continue;
      // Filter pairs to matching subtypes when present
      const rowsA = definitions.get(defs[i]) || [];
      const rowsB = definitions.get(defs[j]) || [];
      const daysA = new Set(rowsA.map((r) => r.fact.local_day).filter(Boolean));
      const daysB = new Set(rowsB.map((r) => r.fact.local_day).filter(Boolean));
      const sharedDays = [...daysA].filter((d) => daysB.has(d)).sort();
      if (sharedDays.length < thr.min_co_occurrence_days) continue;
      const first = sharedDays[0];
      const latest = sharedDays[sharedDays.length - 1];
      // Approximate span from day keys
      const span = Math.max(
        0,
        Math.round((Date.parse(`${latest}T12:00:00.000Z`) - Date.parse(`${first}T12:00:00.000Z`)) / 86_400_000),
      );
      if (span < thr.min_span_days) continue;

      const pairKey = sortedPairKey(typeA, subtypeA, typeB, subtypeB);
      const labelA = labelFor(typeA, subtypeA);
      const labelB = labelFor(typeB, subtypeB);
      const signalIds = [
        ...rowsA.filter((r) => sharedDays.includes(r.fact.local_day)).map((r) => r.event.id),
        ...rowsB.filter((r) => sharedDays.includes(r.fact.local_day)).map((r) => r.event.id),
      ];
      const band = confidenceBandFor({
        evidenceCount: sharedDays.length,
        activeDays: sharedDays.length,
        spanDays: span,
        threshold: thr,
      });
      out.push({
        candidate_type: 'repeated_co_occurrence',
        candidate_key: buildCandidateKey({
          candidate_type: 'repeated_co_occurrence',
          definition_key: pairKey,
          extra: 'same_local_day',
        }),
        title: `Repeated same-day recording: ${labelA} and ${labelB}`,
        description: `${labelA} and ${labelB} were both recorded on ${sharedDays.length} distinct days across ${span} days.`,
        confidence_band: band,
        evidence_count: sharedDays.length,
        active_days: sharedDays.length,
        first_evidence_at: `${first}T12:00:00.000Z`,
        latest_evidence_at: `${latest}T12:00:00.000Z`,
        evidence_window_start: windowMeta.since,
        evidence_window_end: windowMeta.until,
        evidence_signal_ids: [...new Set(signalIds)],
        evidence_observation_ids: [
          ...new Set(
            [...rowsA, ...rowsB]
              .filter((r) => sharedDays.includes(r.fact.local_day))
              .map((r) => r.fact.source_observation_id)
              .filter(Boolean),
          ),
        ],
        signal_definitions: [
          { signal_type: typeA, normalized_value: subtypeA },
          { signal_type: typeB, normalized_value: subtypeB },
        ],
        threshold_definition: { ...thr, mode: 'same_local_day', version: PATTERN_THRESHOLD_VERSION },
        uncertainty_summary: { included: false, uncertain_count: 0, rule: 'uncertain_excluded_v1' },
        timezone,
      });
    }
  }
  return out;
};

/**
 * Temporal proximity: dedupe to at most one evidence window per local day of the earlier signal.
 * Prevents dense clusters from inflating pair counts.
 */
const buildTemporalProximityCandidates = (grouped, timezone, windowMeta) => {
  const thr = PATTERN_THRESHOLDS.repeated_temporal_proximity;
  const maxMs = thr.max_proximity_hours * 3_600_000;
  const out = [];
  const defs = [...grouped.keys()];

  for (let i = 0; i < defs.length; i += 1) {
    for (let j = i + 1; j < defs.length; j += 1) {
      const rowsA = grouped.get(defs[i]) || [];
      const rowsB = grouped.get(defs[j]) || [];
      const windows = [];
      const usedDays = new Set();

      for (const a of rowsA) {
        for (const b of rowsB) {
          const delta = Math.abs(Date.parse(a.fact.occurred_at) - Date.parse(b.fact.occurred_at));
          if (delta > maxMs) continue;
          const earlier = Date.parse(a.fact.occurred_at) <= Date.parse(b.fact.occurred_at) ? a : b;
          const day = earlier.fact.local_day;
          if (!day || usedDays.has(day)) continue;
          usedDays.add(day);
          windows.push({
            day,
            a,
            b,
            occurred_at: earlier.fact.occurred_at,
          });
        }
      }

      if (windows.length < thr.min_distinct_windows) continue;
      windows.sort((x, y) => Date.parse(x.occurred_at) - Date.parse(y.occurred_at));
      const first = windows[0].occurred_at;
      const latest = windows[windows.length - 1].occurred_at;
      const span = spanDays(first, latest);
      if (span < thr.min_span_days) continue;

      const [typeA, subA] = defs[i].split(':');
      const [typeB, subB] = defs[j].split(':');
      const subtypeA = subA === '_' ? null : subA;
      const subtypeB = subB === '_' ? null : subB;
      const pairKey = sortedPairKey(typeA, subtypeA, typeB, subtypeB);
      const labelA = labelFor(typeA, subtypeA);
      const labelB = labelFor(typeB, subtypeB);
      const band = confidenceBandFor({
        evidenceCount: windows.length,
        activeDays: windows.length,
        spanDays: span,
        threshold: thr,
      });
      out.push({
        candidate_type: 'repeated_temporal_proximity',
        candidate_key: buildCandidateKey({
          candidate_type: 'repeated_temporal_proximity',
          definition_key: pairKey,
          extra: `within_${thr.max_proximity_hours}h`,
        }),
        title: `Repeated proximity recording: ${labelA} and ${labelB}`,
        description: `${labelA} and ${labelB} were recorded within ${thr.max_proximity_hours} hours of each other on ${windows.length} separate occasions across ${span} days.`,
        confidence_band: band,
        evidence_count: windows.length,
        active_days: windows.length,
        first_evidence_at: first,
        latest_evidence_at: latest,
        evidence_window_start: windowMeta.since,
        evidence_window_end: windowMeta.until,
        evidence_signal_ids: [
          ...new Set(windows.flatMap((w) => [w.a.event.id, w.b.event.id])),
        ],
        evidence_observation_ids: [
          ...new Set(
            windows
              .flatMap((w) => [w.a.fact.source_observation_id, w.b.fact.source_observation_id])
              .filter(Boolean),
          ),
        ],
        signal_definitions: [
          { signal_type: typeA, normalized_value: subtypeA },
          { signal_type: typeB, normalized_value: subtypeB },
        ],
        threshold_definition: { ...thr, version: PATTERN_THRESHOLD_VERSION },
        uncertainty_summary: { included: false, uncertain_count: 0, rule: 'uncertain_excluded_v1' },
        timezone,
      });
    }
  }
  return out;
};

const buildSustainedIncreaseCandidates = async (store, userId, definitions, timezone, asOfIso) => {
  const thr = PATTERN_THRESHOLDS.sustained_recording_increase;
  const out = [];
  const asOf = Date.parse(asOfIso);

  for (const [defKey, rows] of definitions.entries()) {
    if (!rows.length) continue;
    const signalType = rows[0].fact.signal_type;
    const subtype = rows[0].fact.normalized_value;

    // Two consecutive comparisons ending at asOf and asOf - window_days.
    const comparisons = [];
    for (let step = 0; step < thr.min_consecutive_supporting_comparisons; step += 1) {
      const stepAsOf = new Date(asOf - step * thr.window_days * 86_400_000).toISOString();
      const change = await getRecentChanges(store, userId, {
        signal_type: signalType,
        subtype,
        window_days: thr.window_days,
        as_of: stepAsOf,
        timezone,
        include_candidates: false,
        include_negated: false,
      });
      if (change.error) {
        comparisons.push(null);
        continue;
      }
      comparisons.push(change);
    }

    const supporting = comparisons.filter(
      (c) =>
        c &&
        (c.recording_change === 'increased_recording' || c.recording_change === 'newly_recorded') &&
        Number(c.current_count) >= thr.min_current_window_occurrences,
    );
    if (supporting.length < thr.min_consecutive_supporting_comparisons) continue;

    const label = labelFor(signalType, subtype);
    const evidenceIds = rows.map((r) => r.event.id);
    const days = new Set(rows.map((r) => r.fact.local_day).filter(Boolean));
    const first = rows.map((r) => r.fact.occurred_at).sort()[0];
    const latest = rows.map((r) => r.fact.occurred_at).sort().slice(-1)[0];
    out.push({
      candidate_type: 'sustained_recording_increase',
      candidate_key: buildCandidateKey({
        candidate_type: 'sustained_recording_increase',
        definition_key: defKey,
        extra: `w${thr.window_days}`,
      }),
      title: `Sustained increase in recordings: ${label}`,
      description: `${label} recordings were more frequent in ${thr.min_consecutive_supporting_comparisons} consecutive recent ${thr.window_days}-day comparison windows.`,
      confidence_band: supporting.length > thr.min_consecutive_supporting_comparisons ? 'moderate' : 'low',
      evidence_count: supporting.reduce((sum, c) => sum + Number(c.current_count || 0), 0),
      active_days: days.size,
      first_evidence_at: first,
      latest_evidence_at: latest,
      evidence_window_start: new Date(asOf - thr.window_days * thr.min_consecutive_supporting_comparisons * 2 * 86_400_000).toISOString(),
      evidence_window_end: asOfIso,
      evidence_signal_ids: evidenceIds,
      evidence_observation_ids: [
        ...new Set(rows.map((r) => r.fact.source_observation_id).filter(Boolean)),
      ],
      signal_definitions: [{ signal_type: signalType, normalized_value: subtype }],
      threshold_definition: { ...thr, version: PATTERN_THRESHOLD_VERSION },
      uncertainty_summary: { included: false, uncertain_count: 0, rule: 'uncertain_excluded_v1' },
      timezone,
      comparison_summary: supporting.map((c) => ({
        recording_change: c.recording_change,
        current_count: c.current_count,
        previous_count: c.previous_count,
      })),
    });
  }
  return out;
};

const materialEvidenceChange = (existingPayload, computed) => {
  const cfg = PATTERN_THRESHOLDS.rejection_suppression;
  const prevCount = Number(existingPayload.evidence_count || 0);
  const prevDays = Number(existingPayload.active_days || 0);
  const countDelta = Number(computed.evidence_count || 0) - prevCount;
  const daysDelta = Number(computed.active_days || 0) - prevDays;
  return countDelta >= cfg.min_evidence_count_delta || daysDelta >= cfg.min_active_days_delta;
};

const stillQualifies = (computed) => Boolean(computed && computed.evidence_count > 0);

const toPayload = (computed, { status = 'candidate', previous = null } = {}) => {
  const now = new Date().toISOString();
  return {
    candidate_type: computed.candidate_type,
    candidate_key: computed.candidate_key,
    title: computed.title,
    description: computed.description,
    semantics: SEMANTICS,
    status,
    confidence_band: computed.confidence_band,
    evidence_count: computed.evidence_count,
    active_days: computed.active_days,
    first_evidence_at: computed.first_evidence_at,
    latest_evidence_at: computed.latest_evidence_at,
    evidence_window_start: computed.evidence_window_start,
    evidence_window_end: computed.evidence_window_end,
    evidence_signal_ids: computed.evidence_signal_ids || [],
    evidence_observation_ids: computed.evidence_observation_ids || [],
    signal_definitions: computed.signal_definitions || [],
    threshold_definition: computed.threshold_definition,
    uncertainty_summary: computed.uncertainty_summary,
    generated_by: 'pattern_candidates_engine',
    engine_version: PATTERN_ENGINE_VERSION,
    generated_at: previous?.generated_at || now,
    last_evaluated_at: now,
    invalidation_reason: null,
    user_confirmed_at: previous?.user_confirmed_at || null,
    user_rejected_at: previous?.user_rejected_at || null,
    supersedes_candidate_id: previous?.supersedes_candidate_id || null,
    comparison_summary: computed.comparison_summary || null,
    timezone: computed.timezone || TIMELINE_DEFAULT_TIMEZONE,
  };
};

/**
 * Evaluate pattern candidates for an authenticated owner.
 */
export const evaluatePatternCandidates = async (store, userId, rawOptions = {}) => {
  const tz = resolveTimelineTimezone(rawOptions.timezone);
  let windowDays = Math.floor(Number(rawOptions.window_days ?? rawOptions.windowDays) || PATTERN_EVAL_DEFAULT_WINDOW_DAYS);
  if (!Number.isFinite(windowDays) || windowDays < 1) {
    return { error: 'Invalid window_days.', status: 400 };
  }
  if (windowDays > PATTERN_EVAL_MAX_WINDOW_DAYS) {
    return { error: `Evaluation window exceeds maximum of ${PATTERN_EVAL_MAX_WINDOW_DAYS} days.`, status: 400 };
  }

  const asOfRaw = rawOptions.as_of || rawOptions.asOf;
  let untilMs = Date.now();
  if (asOfRaw) {
    const parsed = Date.parse(asOfRaw);
    if (!Number.isFinite(parsed)) return { error: 'Invalid as_of timestamp.', status: 400 };
    untilMs = parsed;
  }
  const until = new Date(untilMs).toISOString();
  const since = new Date(untilMs - windowDays * 86_400_000).toISOString();
  const windowMeta = { since, until, window_days: windowDays, as_of: until };

  const signals = await fetchSignals(store, userId, { since, until });
  const grouped = groupByDefinition(signals, tz.timezone);

  const computed = [
    ...buildRepeatedSignalCandidates(grouped, tz.timezone, windowMeta),
    ...(await buildCoOccurrenceCandidates(store, userId, grouped, tz.timezone, windowMeta)),
    ...buildTemporalProximityCandidates(grouped, tz.timezone, windowMeta),
    ...(await buildSustainedIncreaseCandidates(store, userId, grouped, tz.timezone, until)),
  ];

  const existing = await fetchCandidates(store, userId);
  const byKey = new Map();
  for (const event of existing) {
    const key = event.payload?.candidate_key;
    if (key) byKey.set(key, event);
  }

  const computedKeys = new Set(computed.map((c) => c.candidate_key));
  const created = [];
  const updated = [];
  const suppressed = [];
  const invalidated = [];
  const stale = [];

  for (const item of computed) {
    const prev = byKey.get(item.candidate_key);
    if (!prev) {
      const latestMs = Date.parse(item.latest_evidence_at || 0);
      const ageDays = Number.isFinite(latestMs) ? (untilMs - latestMs) / 86_400_000 : 0;
      const nextStatus = ageDays >= PATTERN_STALE_DAYS ? 'stale' : 'candidate';
      const payload = toPayload(item, { status: nextStatus });
      if (nextStatus === 'stale') payload.invalidation_reason = 'no_recent_supporting_evidence';
      const result = await store.create(userId, {
        event_type: PATTERN_CANDIDATE_EVENT_TYPE,
        occurred_at: item.latest_evidence_at || until,
        source: 'system',
        schema_version: 1,
        client_event_id: `pc:${hashKey(item.candidate_key)}`,
        payload,
      });
      if (nextStatus === 'stale') stale.push(publicCandidate(result.event));
      else created.push(publicCandidate(result.event));
      continue;
    }

    const prevStatus = prev.payload?.status || 'candidate';
    if (prevStatus === 'rejected') {
      if (!materialEvidenceChange(prev.payload, item)) {
        const payload = {
          ...prev.payload,
          last_evaluated_at: new Date().toISOString(),
        };
        const next = await store.updatePayload(userId, prev.id, payload);
        suppressed.push(publicCandidate(next || prev));
        continue;
      }
      // Material change: reopen as candidate (does not auto-confirm).
      const payload = toPayload(item, {
        status: 'candidate',
        previous: { ...prev.payload, user_rejected_at: prev.payload.user_rejected_at },
      });
      payload.supersedes_candidate_id = prev.id;
      const next = await store.updatePayload(userId, prev.id, payload);
      updated.push(publicCandidate(next || prev));
      continue;
    }

    if (prevStatus === 'confirmed') {
      // Keep confirmed; refresh evidence fields only.
      const payload = {
        ...toPayload(item, { status: 'confirmed', previous: prev.payload }),
        user_confirmed_at: prev.payload.user_confirmed_at,
      };
      if (!stillQualifies(item)) {
        payload.status = 'invalidated';
        payload.invalidation_reason = 'evidence_no_longer_meets_threshold';
        invalidated.push(publicCandidate((await store.updatePayload(userId, prev.id, payload)) || prev));
      } else {
        updated.push(publicCandidate((await store.updatePayload(userId, prev.id, payload)) || prev));
      }
      continue;
    }

    if (prevStatus === 'invalidated' || prevStatus === 'stale' || prevStatus === 'candidate') {
      const latestMs = Date.parse(item.latest_evidence_at || 0);
      const ageDays = Number.isFinite(latestMs) ? (untilMs - latestMs) / 86_400_000 : 0;
      const nextStatus = ageDays >= PATTERN_STALE_DAYS ? 'stale' : 'candidate';
      const payload = toPayload(item, { status: nextStatus, previous: prev.payload });
      if (nextStatus === 'stale') {
        payload.invalidation_reason = 'no_recent_supporting_evidence';
        const next = await store.updatePayload(userId, prev.id, payload);
        stale.push(publicCandidate(next || prev));
      } else {
        updated.push(publicCandidate((await store.updatePayload(userId, prev.id, payload)) || prev));
      }
    }
  }

  // Invalidate / stale existing candidates not recomputed.
  for (const event of existing) {
    const key = event.payload?.candidate_key;
    if (!key || computedKeys.has(key)) continue;
    const status = event.payload?.status;
    if (status === 'rejected') continue;
    if (status === 'confirmed' || status === 'candidate' || status === 'stale') {
      const latest = Date.parse(event.payload?.latest_evidence_at || event.occurred_at || 0);
      const ageDays = Number.isFinite(latest) ? (untilMs - latest) / 86_400_000 : Infinity;
      let nextStatus = 'invalidated';
      let reason = 'evidence_no_longer_meets_threshold';
      if (ageDays >= PATTERN_STALE_DAYS && status !== 'confirmed') {
        nextStatus = 'stale';
        reason = 'no_supporting_evidence_in_stale_window';
      }
      if (status === 'confirmed') {
        nextStatus = 'invalidated';
        reason = 'confirmed_evidence_no_longer_meets_threshold';
      }
      const payload = {
        ...event.payload,
        status: nextStatus,
        invalidation_reason: reason,
        last_evaluated_at: new Date().toISOString(),
      };
      const next = await store.updatePayload(userId, event.id, payload);
      if (nextStatus === 'stale') stale.push(publicCandidate(next || event));
      else invalidated.push(publicCandidate(next || event));
    }
  }

  // Candidates touched this evaluation (created/updated/stale). Rejected suppressions remain separate.
  const candidates = [...created, ...updated, ...stale];

  return {
    engine_version: PATTERN_ENGINE_VERSION,
    threshold_version: PATTERN_THRESHOLD_VERSION,
    timezone: tz.timezone,
    timezone_fallback_used: tz.fallback_used,
    evaluation_window: windowMeta,
    created_count: created.length,
    updated_count: updated.length,
    suppressed_count: suppressed.length,
    invalidated_count: invalidated.length,
    stale_count: stale.length,
    computed_count: computed.length,
    candidates,
    created,
    updated,
    suppressed,
    invalidated,
    stale,
    semantics: SEMANTICS,
  };
};

export const listPatternCandidates = async (store, userId, rawFilters = {}) => {
  const listed = await fetchCandidates(store, userId);
  let events = listed.filter((e) => !e.deleted_at);
  const status = safeText(rawFilters.status || '', 40);
  const candidateType = safeText(rawFilters.candidate_type || rawFilters.candidateType || '', 60);
  if (status) {
    if (!PATTERN_STATUSES.has(status)) return { error: 'Invalid status filter.', status: 400 };
    events = events.filter((e) => e.payload?.status === status);
  }
  if (candidateType) {
    if (!PATTERN_CANDIDATE_TYPES.has(candidateType)) {
      return { error: 'Invalid candidate_type filter.', status: 400 };
    }
    events = events.filter((e) => e.payload?.candidate_type === candidateType);
  }
  if (rawFilters.since && Number.isFinite(Date.parse(rawFilters.since))) {
    const sinceMs = Date.parse(rawFilters.since);
    events = events.filter((e) => Date.parse(e.occurred_at) >= sinceMs);
  }
  events.sort(
    (a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at) || String(b.id).localeCompare(String(a.id)),
  );
  const limit = Math.min(200, Math.max(1, Math.floor(Number(rawFilters.limit) || 50)));
  const offset = Math.max(0, Math.floor(Number(rawFilters.offset) || 0));
  const sliced = events.slice(offset, offset + limit).map(publicCandidate);
  return { candidates: sliced, total: events.length, limit, offset };
};

export const getPatternCandidate = async (store, userId, candidateId) => {
  const id = safeText(candidateId, 120);
  if (!id) return { error: 'Candidate id is required.', status: 400 };
  const owned = await store.getOwned(userId, id);
  if (!owned || owned.event_type !== PATTERN_CANDIDATE_EVENT_TYPE || owned.deleted_at) {
    return { error: 'Pattern candidate not found.', status: 404 };
  }
  return { candidate: publicCandidate(owned) };
};

export const confirmPatternCandidate = async (store, userId, candidateId) => {
  const got = await getPatternCandidate(store, userId, candidateId);
  if (got.error) return got;
  const owned = await store.getOwned(userId, candidateId);
  const now = new Date().toISOString();
  const payload = {
    ...owned.payload,
    status: 'confirmed',
    user_confirmed_at: now,
    user_rejected_at: null,
    invalidation_reason: null,
    last_evaluated_at: now,
  };
  const updated = await store.updatePayload(userId, candidateId, payload);
  return { candidate: publicCandidate(updated || owned) };
};

export const rejectPatternCandidate = async (store, userId, candidateId) => {
  const got = await getPatternCandidate(store, userId, candidateId);
  if (got.error) return got;
  const owned = await store.getOwned(userId, candidateId);
  const now = new Date().toISOString();
  const payload = {
    ...owned.payload,
    status: 'rejected',
    user_rejected_at: now,
    last_evaluated_at: now,
  };
  const updated = await store.updatePayload(userId, candidateId, payload);
  return { candidate: publicCandidate(updated || owned) };
};
