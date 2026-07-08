/**
 * Task 6 — Selective Personal Context Pack for Luna Live.
 *
 * Deterministic relevance selection only. No embeddings, no vector DB,
 * no Gemini call for relevance. Owner-scoped. Fail-open without fabricated memory.
 */
import {
  resolveTimelineTimezone,
  localDayKey,
  isEligiblePositiveSignal,
  toOccurrenceFact,
  getSignalHistory,
  getRecentChanges,
  TIMELINE_DEFAULT_TIMEZONE,
} from './timelineQueryService.mjs';
import {
  listPatternCandidates,
  PATTERN_CANDIDATE_EVENT_TYPE,
} from './patternCandidatesService.mjs';
import { isAllowedSignalType, normalizeSignalType, normalizeSubtype } from './signalTaxonomy.mjs';

export const PERSONAL_CONTEXT_VERSION = 'personal_context_v1';
export const PERSONAL_CONTEXT_ALIAS_VERSION = 'alias_map_v1';

export const CONTEXT_DEFAULT_LOOKBACK_DAYS = 90;
export const CONTEXT_MAX_LOOKBACK_DAYS = 180;
export const CONTEXT_MAX_ITEMS = 20;
export const CONTEXT_MAX_CHARS = 6000;
export const CONTEXT_MAX_RECENT_SIGNALS = 8;
export const CONTEXT_MAX_TIMELINE_FACTS = 6;
export const CONTEXT_MAX_CONFIRMED_PATTERNS = 4;
export const CONTEXT_MAX_RELEVANT_FACTS = 2;
export const CONTEXT_MAX_SIGNAL_SCAN = 500;

/** Versioned deterministic alias map — not a medical ontology. */
export const CONTEXT_ALIAS_MAP = {
  energy: [
    'tired',
    'exhausted',
    'drained',
    'fatigue',
    'fatigued',
    'low energy',
    'energy',
    'exhausted',
    'устал',
    'устала',
  ],
  sleep: [
    'sleep',
    'slept',
    'insomnia',
    'waking',
    'awake',
    'restless',
    'sleepless',
    'сон',
    'бессон',
  ],
  mood: [
    'mood',
    'irritable',
    'irritability',
    'anxious',
    'anxiety',
    'sad',
    'sadness',
    'emotional',
    'настроен',
  ],
  cycle: [
    'period',
    'menstrual',
    'cycle',
    'bleeding',
    'cramps',
    'менстру',
    'цикл',
  ],
  stress: [
    'stress',
    'stressed',
    'overwhelmed',
    'overwhelm',
    'tense',
    'tension',
    'стресс',
  ],
  medication_context: [
    'medication',
    'medicine',
    'dose',
    'pill',
    'prescription',
    'лекарств',
  ],
  symptom: ['symptom', 'pain', 'headache', 'nausea', 'cramp'],
  body_sensation: ['sensation', 'heaviness', 'soreness', 'restlessness'],
};

const DOMAIN_TO_SIGNAL_TYPES = {
  energy: ['energy'],
  sleep: ['sleep'],
  mood: ['mood'],
  cycle: ['cycle'],
  stress: ['stress'],
  medication_context: ['medication_context'],
  symptom: ['symptom'],
  body_sensation: ['body_sensation'],
};

const safeText = (value, max = 120) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, max);
};

const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яёіїєґ\s_-]/gi, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);

/**
 * Deterministic domain relevance from current message + alias map.
 */
export const resolveRelevantDomains = (messageText) => {
  const lower = String(messageText || '').toLowerCase();
  const tokens = new Set(tokenize(lower));
  const domains = new Set();

  for (const [domain, aliases] of Object.entries(CONTEXT_ALIAS_MAP)) {
    for (const alias of aliases) {
      const a = alias.toLowerCase();
      if (a.includes(' ')) {
        if (lower.includes(a)) {
          domains.add(domain);
          break;
        }
      } else if (tokens.has(a) || lower.includes(a)) {
        domains.add(domain);
        break;
      }
    }
  }

  // Direct taxonomy type mentions
  for (const type of Object.keys(DOMAIN_TO_SIGNAL_TYPES)) {
    if (tokens.has(type) || lower.includes(type.replace(/_/g, ' '))) {
      domains.add(type);
    }
  }

  return [...domains];
};

export const domainsToSignalTypes = (domains) => {
  const types = new Set();
  for (const d of domains) {
    for (const t of DOMAIN_TO_SIGNAL_TYPES[d] || []) {
      if (isAllowedSignalType(t)) types.add(t);
    }
  }
  return [...types];
};

const emptyPack = ({ status, lookbackDays, timezone, exclusions = [] }) => ({
  version: PERSONAL_CONTEXT_VERSION,
  generated_at: new Date().toISOString(),
  status,
  scope: {
    lookback_days: lookbackDays,
    timezone,
  },
  recent_signals: [],
  timeline_facts: [],
  confirmed_patterns: [],
  relevant_facts: [],
  exclusions_applied: exclusions,
  budget: {
    max_items: CONTEXT_MAX_ITEMS,
    max_chars: CONTEXT_MAX_CHARS,
    actual_items: 0,
    actual_chars: 0,
    truncated: false,
  },
  alias_map_version: PERSONAL_CONTEXT_ALIAS_VERSION,
  semantics: {
    recorded_history_only: true,
    not_diagnosis: true,
    not_causation: true,
    not_correlation: true,
    not_medical_conclusion: true,
    candidates_are_not_confirmed_patterns: true,
  },
});

const serializePack = (pack) => JSON.stringify(pack);

const stripUnsafeFields = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = { ...obj };
  delete clone.raw_text;
  delete clone.evidence_text;
  delete clone.transcript;
  delete clone.payload;
  return clone;
};

/**
 * Apply hard item + char budgets with deterministic priority.
 */
export const applyContextBudget = (pack) => {
  const prioritized = [
    ...pack.recent_signals.map((item) => ({ bucket: 'recent_signals', item })),
    ...pack.timeline_facts.map((item) => ({ bucket: 'timeline_facts', item })),
    ...pack.confirmed_patterns.map((item) => ({ bucket: 'confirmed_patterns', item })),
    ...pack.relevant_facts.map((item) => ({ bucket: 'relevant_facts', item })),
  ];

  const selected = {
    recent_signals: [],
    timeline_facts: [],
    confirmed_patterns: [],
    relevant_facts: [],
  };

  let truncated = false;
  const trial = {
    ...pack,
    recent_signals: [],
    timeline_facts: [],
    confirmed_patterns: [],
    relevant_facts: [],
  };

  for (const entry of prioritized) {
    const next = {
      ...trial,
      [entry.bucket]: [...trial[entry.bucket], entry.item],
    };
    const items =
      next.recent_signals.length +
      next.timeline_facts.length +
      next.confirmed_patterns.length +
      next.relevant_facts.length;
    if (items > CONTEXT_MAX_ITEMS) {
      truncated = true;
      break;
    }
    const chars = serializePack({
      ...next,
      budget: { ...pack.budget, actual_items: items, actual_chars: 0, truncated: false },
    }).length;
    if (chars > CONTEXT_MAX_CHARS) {
      truncated = true;
      break;
    }
    trial[entry.bucket] = next[entry.bucket];
    selected[entry.bucket] = next[entry.bucket];
  }

  const actualItems =
    selected.recent_signals.length +
    selected.timeline_facts.length +
    selected.confirmed_patterns.length +
    selected.relevant_facts.length;

  const result = {
    ...pack,
    ...selected,
    budget: {
      max_items: CONTEXT_MAX_ITEMS,
      max_chars: CONTEXT_MAX_CHARS,
      actual_items: actualItems,
      actual_chars: 0,
      truncated,
    },
  };
  result.budget.actual_chars = serializePack(result).length;
  return result;
};

const fetchEligibleSignals = async (store, userId, { since, until, timezone }) => {
  const listed = await store.list(userId, {
    eventType: 'signal',
    since,
    until,
    limit: CONTEXT_MAX_SIGNAL_SCAN,
    offset: 0,
  });
  return (listed.events || [])
    .filter((event) =>
      isEligiblePositiveSignal(event, {
        includeCandidates: false,
        includeNegated: false,
        includeUncertain: true, // may include but must remain marked uncertain
      }),
    )
    // Uncertain may be included only if confirmed/corrected; still marked.
    .filter((event) => {
      const status = event.payload?.user_status;
      return status === 'confirmed' || status === 'corrected';
    })
    .map((event) => ({
      event,
      fact: toOccurrenceFact(event, timezone),
    }));
};

/**
 * Build selective personal context pack for authenticated owner.
 * Never trusts client-supplied packs or user_id.
 */
export const buildPersonalContextPack = async ({
  store,
  userId,
  messageText,
  message,
  timezone: timezoneRaw,
  lookbackDays: lookbackRaw,
} = {}) => {
  if (!store || !userId) {
    return emptyPack({
      status: 'unavailable',
      lookbackDays: CONTEXT_DEFAULT_LOOKBACK_DAYS,
      timezone: TIMELINE_DEFAULT_TIMEZONE,
      exclusions: ['missing_store_or_user'],
    });
  }

  const tz = resolveTimelineTimezone(timezoneRaw);
  let lookbackDays = Math.floor(Number(lookbackRaw) || CONTEXT_DEFAULT_LOOKBACK_DAYS);
  if (!Number.isFinite(lookbackDays) || lookbackDays < 1) lookbackDays = CONTEXT_DEFAULT_LOOKBACK_DAYS;
  if (lookbackDays > CONTEXT_MAX_LOOKBACK_DAYS) lookbackDays = CONTEXT_MAX_LOOKBACK_DAYS;

  const until = new Date().toISOString();
  const since = new Date(Date.now() - lookbackDays * 86_400_000).toISOString();
  const exclusions = [
    'unreviewed_signals',
    'rejected_signals',
    'negated_as_positive',
    'soft_deleted',
    'automatic_pattern_candidates',
    'rejected_patterns',
    'stale_patterns',
    'invalidated_patterns',
    'raw_observation_text',
    'raw_transcript',
    'evidence_text',
  ];

  // Accept messageText (preferred) or message alias from callers.
  const domains = resolveRelevantDomains(messageText ?? message);
  const relevantTypes = domainsToSignalTypes(domains);

  // Domain match required for selective pack. No match → empty ok pack (no unrelated dump).
  const hasDomainFilter = relevantTypes.length > 0;

  let signals = [];
  try {
    signals = await fetchEligibleSignals(store, userId, {
      since,
      until,
      timezone: tz.timezone,
    });
  } catch {
    return emptyPack({
      status: 'degraded_signals',
      lookbackDays,
      timezone: tz.timezone,
      exclusions: [...exclusions, 'signal_fetch_failed'],
    });
  }

  if (!hasDomainFilter) {
    const empty = emptyPack({
      status: 'ok',
      lookbackDays,
      timezone: tz.timezone,
      exclusions: [...exclusions, 'no_relevant_domain_match'],
    });
    empty.scope = {
      lookback_days: lookbackDays,
      timezone: tz.timezone,
      timezone_fallback_used: tz.fallback_used,
      relevant_domains: [],
      relevant_signal_types: [],
    };
    return empty;
  }

  const relevantSignals = signals.filter((row) => relevantTypes.includes(row.fact.signal_type));

  // Sort by recency
  relevantSignals.sort(
    (a, b) => Date.parse(b.fact.occurred_at) - Date.parse(a.fact.occurred_at),
  );

  const recent_signals = relevantSignals.slice(0, CONTEXT_MAX_RECENT_SIGNALS).map((row) =>
    stripUnsafeFields({
      kind: 'recent_signal',
      signal_type: row.fact.signal_type,
      normalized_value: row.fact.normalized_value,
      display_label: row.fact.display_label,
      occurred_at: row.fact.occurred_at,
      local_day: row.fact.local_day,
      user_status: row.fact.user_status,
      uncertain: row.fact.uncertain,
      semantics: 'recorded_signal_fact',
    }),
  );

  // Timeline facts for relevant types only
  const timeline_facts = [];
  const typesForTimeline = relevantTypes;

  for (const signalType of typesForTimeline.slice(0, 4)) {
    if (timeline_facts.length >= CONTEXT_MAX_TIMELINE_FACTS) break;
    try {
      const history = await getSignalHistory(store, userId, signalType, {
        since,
        until,
        timezone: tz.timezone,
        include_candidates: false,
        include_negated: false,
      });
      if (history.error) continue;
      if (!history.recurrence || history.recurrence.occurrence_count < 1) continue;
      timeline_facts.push({
        kind: 'timeline_fact',
        fact_type: 'signal_history',
        signal_type: signalType,
        subtype: history.subtype || null,
        occurrence_count: history.recurrence.occurrence_count,
        active_days: history.recurrence.active_days,
        first_occurred_at: history.recurrence.first_occurred_at,
        latest_occurred_at: history.recurrence.latest_occurred_at,
        semantics: 'recorded_history_fact',
      });

      if (timeline_facts.length < CONTEXT_MAX_TIMELINE_FACTS) {
        const change = await getRecentChanges(store, userId, {
          signal_type: signalType,
          window_days: 14,
          timezone: tz.timezone,
          include_candidates: false,
          include_negated: false,
        });
        if (!change.error && change.current_count > 0) {
          timeline_facts.push({
            kind: 'timeline_fact',
            fact_type: 'recent_recording_comparison',
            signal_type: signalType,
            current_count: change.current_count,
            previous_count: change.previous_count,
            recording_change: change.recording_change,
            window_days: change.window_days,
            semantics: 'recorded_observation_change_only',
          });
        }
      }
    } catch {
      // degrade without this fact
    }
  }

  // Confirmed patterns only
  let confirmed_patterns = [];
  try {
    const listed = await listPatternCandidates(store, userId, {
      status: 'confirmed',
      limit: 50,
    });
    if (!listed.error) {
      confirmed_patterns = (listed.candidates || [])
        .filter((c) => c.status === 'confirmed')
        .filter((c) => {
          const defs = c.signal_definitions || [];
          return defs.some((d) => relevantTypes.includes(d.signal_type));
        })
        .slice(0, CONTEXT_MAX_CONFIRMED_PATTERNS)
        .map((c) =>
          stripUnsafeFields({
            kind: 'confirmed_pattern',
            candidate_type: c.candidate_type,
            title: c.title,
            description: c.description,
            evidence_count: c.evidence_count,
            active_days: c.active_days,
            first_evidence_at: c.first_evidence_at,
            latest_evidence_at: c.latest_evidence_at,
            signal_definitions: c.signal_definitions,
            semantics: c.semantics,
            status: 'confirmed',
          }),
        );
    }
  } catch {
    // continue without patterns
  }

  // Additional relevant facts (bounded): domain list for transparency
  const relevant_facts = [];
  if (domains.length) {
    relevant_facts.push({
      kind: 'relevance_note',
      domains,
      alias_map_version: PERSONAL_CONTEXT_ALIAS_VERSION,
      semantics: 'deterministic_alias_match',
    });
  }

  let pack = {
    version: PERSONAL_CONTEXT_VERSION,
    generated_at: new Date().toISOString(),
    status: 'ok',
    scope: {
      lookback_days: lookbackDays,
      timezone: tz.timezone,
      timezone_fallback_used: tz.fallback_used,
      relevant_domains: domains,
      relevant_signal_types: relevantTypes,
    },
    recent_signals,
    timeline_facts: timeline_facts.slice(0, CONTEXT_MAX_TIMELINE_FACTS),
    confirmed_patterns,
    relevant_facts: relevant_facts.slice(0, CONTEXT_MAX_RELEVANT_FACTS),
    exclusions_applied: exclusions,
    budget: {
      max_items: CONTEXT_MAX_ITEMS,
      max_chars: CONTEXT_MAX_CHARS,
      actual_items: 0,
      actual_chars: 0,
      truncated: false,
    },
    alias_map_version: PERSONAL_CONTEXT_ALIAS_VERSION,
    semantics: {
      recorded_history_only: true,
      not_diagnosis: true,
      not_causation: true,
      not_correlation: true,
      not_medical_conclusion: true,
      candidates_are_not_confirmed_patterns: true,
    },
  };

  pack = applyContextBudget(pack);

  // Final safety: ensure no raw text fields leaked in content buckets.
  // Do not scan exclusions_applied labels (they intentionally name excluded field types).
  const contentOnly = {
    recent_signals: pack.recent_signals,
    timeline_facts: pack.timeline_facts,
    confirmed_patterns: pack.confirmed_patterns,
    relevant_facts: pack.relevant_facts,
  };
  const contentSerialized = serializePack(contentOnly);
  if (
    Object.prototype.hasOwnProperty.call(contentOnly, 'raw_text') ||
    /"raw_text"\s*:|"evidence_text"\s*:|"transcript"\s*:/i.test(contentSerialized)
  ) {
    return emptyPack({
      status: 'validation_failed',
      lookbackDays,
      timezone: tz.timezone,
      exclusions: [...exclusions, 'unsafe_fields_detected'],
    });
  }

  return pack;
};

/**
 * Format pack for Gemini system prompt. Returns null if pack should not be injected.
 */
export const formatPersonalContextForPrompt = (pack) => {
  if (!pack || pack.status === 'unavailable' || pack.status === 'validation_failed') {
    return null;
  }
  const items =
    (pack.recent_signals?.length || 0) +
    (pack.timeline_facts?.length || 0) +
    (pack.confirmed_patterns?.length || 0) +
    (pack.relevant_facts?.length || 0);
  if (items === 0 && pack.status !== 'ok') {
    return null;
  }
  // Even empty ok pack: omit injection to avoid implying memory.
  if (items === 0) return null;

  const instructions = [
    'Treat the following as historical user-provided/derived records only.',
    'Do not treat them as diagnosis, medical truth, causation, or correlation.',
    'Distinguish "recorded" from "medically true".',
    'Do not invent missing history.',
    'If context is absent, do not imply personal memory.',
    'Do not expose internal IDs or mention hidden context machinery.',
    'Automatic pattern candidates are never included; only user-confirmed patterns may appear.',
  ].join(' ');

  return `<personal_context>
${instructions}
${JSON.stringify(pack)}
</personal_context>`;
};

/**
 * Safe operational summary for logs — no health content.
 */
export const summarizeContextPackForLogs = (pack) => ({
  status: pack?.status || 'none',
  item_count:
    (pack?.recent_signals?.length || 0) +
    (pack?.timeline_facts?.length || 0) +
    (pack?.confirmed_patterns?.length || 0) +
    (pack?.relevant_facts?.length || 0),
  truncated: Boolean(pack?.budget?.truncated),
  lookback_days: pack?.scope?.lookback_days || null,
  domain_count: pack?.scope?.relevant_domains?.length || 0,
});

// Keep unused import referenced for clarity in audits (event type constant).
void PATTERN_CANDIDATE_EVENT_TYPE;
void localDayKey;
void normalizeSignalType;
void normalizeSubtype;
