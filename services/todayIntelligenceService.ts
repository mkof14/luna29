/**
 * Bounded Today intelligence fetch (Task 9.1).
 * AUTHORITY (Task 10): sole owner of the one-shot consent + signals + patterns read for Today.
 * One parallel read of consent + unreviewed signals + pattern candidates.
 * Tolerates individual failures; never blocks the primary daily action.
 * No polling, no infinite retry, no health content in logs.
 */

import { getMemoryConsent } from './memoryConsentService';
import { listSignals, type SignalRecord } from './observationSignalsService';
import { listPatternCandidates } from './patternCandidatesService';
import {
  filterSurfacedPatterns,
  type TodayMemoryStatus,
  type TodayPatternPreview,
  type TodaySignalPreview,
} from '../utils/todayState';

export type TodayIntelligenceSnapshot = {
  memoryStatus: TodayMemoryStatus;
  unreviewedSignals: TodaySignalPreview[];
  unreviewedCount: number;
  possiblePatterns: TodayPatternPreview[];
  confirmedPatterns: TodayPatternPreview[];
  signalsAvailable: boolean;
  patternsAvailable: boolean;
  consentAvailable: boolean;
  /** True after first settle (success or partial). */
  settled: boolean;
};

export const EMPTY_TODAY_INTELLIGENCE: TodayIntelligenceSnapshot = {
  memoryStatus: 'unknown',
  unreviewedSignals: [],
  unreviewedCount: 0,
  possiblePatterns: [],
  confirmedPatterns: [],
  signalsAvailable: true,
  patternsAvailable: true,
  consentAvailable: true,
  settled: false,
};

const toSignalPreview = (signal: SignalRecord): TodaySignalPreview => {
  const p = (signal.payload || {}) as Record<string, unknown>;
  return {
    id: signal.id,
    signal_type: String(p.signal_type || ''),
    normalized_value: (p.normalized_value as string | null) ?? null,
    display_label: typeof p.display_label === 'string' ? p.display_label : null,
    user_status: String(p.user_status || 'unreviewed'),
    occurred_at: signal.occurred_at,
  };
};

/**
 * Fetch secondary Today intelligence once.
 * Independent reads run in parallel; each failure is isolated.
 */
export const fetchTodayIntelligence = async (): Promise<TodayIntelligenceSnapshot> => {
  const [consentResult, signalsResult, patternsResult] = await Promise.all([
    getMemoryConsent()
      .then((c) => ({ ok: true as const, value: c }))
      .catch(() => ({ ok: false as const, value: null })),
    listSignals({ user_status: 'unreviewed', limit: 8 })
      .then((r) => ({ ok: true as const, value: r }))
      .catch(() => ({ ok: false as const, value: null })),
    // One list; client filterSurfacedPatterns keeps only candidate/confirmed.
    listPatternCandidates({ limit: 12 })
      .then((r) => ({ ok: true as const, value: r.candidates || [] }))
      .catch(() => ({ ok: false as const, value: null })),
  ]);

  let memoryStatus: TodayMemoryStatus = 'unknown';
  let consentAvailable = true;
  if (!consentResult.ok || !consentResult.value) {
    memoryStatus = 'unavailable';
    consentAvailable = false;
  } else if (consentResult.value.status === 'consent_unavailable') {
    memoryStatus = 'unavailable';
    consentAvailable = false;
  } else if (consentResult.value.status === 'enabled') {
    memoryStatus = 'on';
  } else {
    memoryStatus = 'off';
  }

  let unreviewedSignals: TodaySignalPreview[] = [];
  let unreviewedCount = 0;
  let signalsAvailable = true;
  if (!signalsResult.ok || !signalsResult.value) {
    signalsAvailable = false;
  } else {
    const events = signalsResult.value.events || [];
    unreviewedSignals = events.map(toSignalPreview).slice(0, 3);
    unreviewedCount =
      typeof signalsResult.value.total === 'number' ? signalsResult.value.total : events.length;
  }

  let possiblePatterns: TodayPatternPreview[] = [];
  let confirmedPatterns: TodayPatternPreview[] = [];
  let patternsAvailable = true;
  if (!patternsResult.ok || !patternsResult.value) {
    patternsAvailable = false;
  } else {
    const filtered = filterSurfacedPatterns(patternsResult.value);
    possiblePatterns = filtered.possible;
    confirmedPatterns = filtered.confirmed;
  }

  return {
    memoryStatus,
    unreviewedSignals,
    unreviewedCount,
    possiblePatterns,
    confirmedPatterns,
    signalsAvailable,
    patternsAvailable,
    consentAvailable,
    settled: true,
  };
};
