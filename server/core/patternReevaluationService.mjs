/**
 * Task 7.1 — Trust-state re-evaluation for pattern candidates.
 *
 * After signal confirm/correct/reject/soft-delete of eligible evidence,
 * run bounded owner-scoped Task 5 evaluation. Reuses evaluatePatternCandidates.
 * No Gemini / embeddings / duplicated engine. Failure never rolls back trust mutation.
 */
import {
  evaluatePatternCandidates,
  isPatternEvidenceSignal,
  PATTERN_EVAL_DEFAULT_WINDOW_DAYS,
  PATTERN_INCLUDE_UNCERTAIN_EVIDENCE,
} from './patternCandidatesService.mjs';
import { toOccurrenceFact, TIMELINE_DEFAULT_TIMEZONE } from './timelineQueryService.mjs';

export const PATTERN_REEVAL_VERSION = 'pattern_reeval_v1';

/** Internal bounds — trust mutation requests cannot override. */
export const PATTERN_REEVAL_LOOKBACK_DAYS = PATTERN_EVAL_DEFAULT_WINDOW_DAYS;
export const PATTERN_REEVAL_TIMEOUT_MS = 20_000;

const MUTATION_TYPES = new Set([
  'confirm',
  'correct',
  'reject',
  'soft_delete',
]);

/**
 * Deterministic evidence fingerprint for Task 5 eligibility change detection.
 * Not ownership. Not medical. Not returned to clients.
 */
export const buildEvidenceFingerprint = (event) => {
  if (!event || event.event_type !== 'signal') {
    return 'none:non_signal';
  }
  const deleted = Boolean(event.deleted_at);
  const eligible = !deleted && isPatternEvidenceSignal(event);
  if (!eligible) {
    const status = event.payload?.user_status || 'unknown';
    return `ineligible:${status}:${deleted ? 'deleted' : 'active'}`;
  }
  const fact = toOccurrenceFact(event, TIMELINE_DEFAULT_TIMEZONE);
  return [
    'eligible',
    fact.signal_type || '',
    fact.normalized_value == null ? '_' : String(fact.normalized_value),
    fact.occurred_at || '',
    fact.negated ? '1' : '0',
    fact.uncertain ? '1' : '0',
    fact.user_status || '',
  ].join('|');
};

/**
 * Decide whether Task 5 re-evaluation is needed after a trust-state mutation.
 */
export const shouldReevaluateAfterMutation = ({
  before_signal: before,
  after_signal: after,
  mutation_type: mutationType,
} = {}) => {
  const reevaluation_version = PATTERN_REEVAL_VERSION;
  if (!MUTATION_TYPES.has(mutationType)) {
    return {
      should_reevaluate: false,
      reason: 'unknown_mutation',
      affected_signal_types: [],
      reevaluation_version,
    };
  }

  // Soft-delete of non-signal (observation, pattern_candidate, etc.) — never.
  if (mutationType === 'soft_delete') {
    const target = before || after;
    if (!target || target.event_type !== 'signal') {
      return {
        should_reevaluate: false,
        reason: 'non_signal_event',
        affected_signal_types: [],
        reevaluation_version,
      };
    }
  }

  const beforeFp = buildEvidenceFingerprint(before);
  const afterFp = buildEvidenceFingerprint(after);

  if (beforeFp === afterFp) {
    return {
      should_reevaluate: false,
      reason: 'no_eligible_change',
      affected_signal_types: [],
      reevaluation_version,
    };
  }

  const beforeEligible = beforeFp.startsWith('eligible|');
  const afterEligible = afterFp.startsWith('eligible|');

  // Soft-delete / reject of never-eligible evidence is not a Task 5 evidence change.
  if (!beforeEligible && !afterEligible) {
    return {
      should_reevaluate: false,
      reason: 'no_eligible_change',
      affected_signal_types: [],
      reevaluation_version,
    };
  }

  let reason = 'evidence_changed';
  if (!beforeEligible && afterEligible) reason = 'evidence_became_eligible';
  else if (beforeEligible && !afterEligible) reason = 'evidence_removed';

  const types = new Set();
  for (const ev of [before, after]) {
    if (!ev || ev.event_type !== 'signal') continue;
    try {
      const fact = toOccurrenceFact(ev, TIMELINE_DEFAULT_TIMEZONE);
      if (fact.signal_type) types.add(fact.signal_type);
    } catch {
      // ignore
    }
  }

  return {
    should_reevaluate: true,
    reason,
    affected_signal_types: [...types],
    reevaluation_version,
  };
};

const withTimeout = (promise, ms) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error('pattern_reeval_timeout');
      err.code = 'pattern_reeval_timeout';
      reject(err);
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });

/** Safe operational log — no health content. */
export const summarizeReevaluationForLogs = (meta) => ({
  pattern_reevaluation_status: meta?.pattern_reevaluation_status || 'none',
  reason: meta?.pattern_reevaluation_reason || null,
  affected_signal_type_count: Number(meta?.affected_signal_type_count) || 0,
  latency_ms: meta?.latency_ms ?? null,
  reevaluation_version: PATTERN_REEVAL_VERSION,
  uncertain_included: PATTERN_INCLUDE_UNCERTAIN_EVIDENCE,
});

/**
 * After a persisted trust mutation: maybe re-evaluate patterns for owner.
 * Never throws. Never rolls back the mutation.
 * Request cannot override lookback/thresholds/scan caps.
 */
export const runPatternReevaluationAfterMutation = async ({
  store,
  userId,
  before_signal: before,
  after_signal: after,
  mutation_type: mutationType,
  timezone,
  timeoutMs = PATTERN_REEVAL_TIMEOUT_MS,
} = {}) => {
  const started = Date.now();
  try {
    if (!store || !userId) {
      return {
        pattern_reevaluation_status: 'failed',
        pattern_reevaluation_reason: 'unavailable',
        affected_signal_type_count: 0,
        latency_ms: Date.now() - started,
      };
    }

    const decision = shouldReevaluateAfterMutation({
      before_signal: before,
      after_signal: after,
      mutation_type: mutationType,
    });

    if (!decision.should_reevaluate) {
      return {
        pattern_reevaluation_status: 'skipped',
        pattern_reevaluation_reason: decision.reason,
        affected_signal_type_count: decision.affected_signal_types.length,
        latency_ms: Date.now() - started,
      };
    }

    // Fixed internal bounds — ignore any client-supplied options.
    const result = await withTimeout(
      evaluatePatternCandidates(store, userId, {
        timezone: timezone || TIMELINE_DEFAULT_TIMEZONE,
        window_days: PATTERN_REEVAL_LOOKBACK_DAYS,
      }),
      timeoutMs,
    );

    if (result?.error) {
      return {
        pattern_reevaluation_status: 'failed',
        pattern_reevaluation_reason: 'unavailable',
        affected_signal_type_count: decision.affected_signal_types.length,
        latency_ms: Date.now() - started,
      };
    }

    return {
      pattern_reevaluation_status: 'completed',
      pattern_reevaluation_reason: decision.reason,
      affected_signal_type_count: decision.affected_signal_types.length,
      latency_ms: Date.now() - started,
      // Internal counts only — not health content.
      _created_count: Number(result?.created_count) || 0,
      _updated_count: Number(result?.updated_count) || 0,
      _invalidated_count: Number(result?.invalidated_count) || 0,
      _stale_count: Number(result?.stale_count) || 0,
    };
  } catch {
    return {
      pattern_reevaluation_status: 'failed',
      pattern_reevaluation_reason: 'unavailable',
      affected_signal_type_count: 0,
      latency_ms: Date.now() - started,
    };
  }
};

/**
 * Public response slice — backward-compatible additive fields only.
 */
export const publicReevaluationMeta = (meta) => ({
  pattern_reevaluation_status: meta?.pattern_reevaluation_status || 'skipped',
  pattern_reevaluation_reason: meta?.pattern_reevaluation_reason || null,
});
