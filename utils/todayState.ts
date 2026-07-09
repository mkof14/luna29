/**
 * Deterministic Today presentation-state resolver (Task 9.1).
 * AUTHORITY (Task 10): sole owner of Today presentation state + general continuity copy
 * + filterSurfacedPatterns for Task 5 candidate/confirmed filtering.
 * Pure / testable — no LLM, embeddings, or network.
 *
 * Priority (first match wins) — presentation context only.
 * Does NOT replace the primary daily action ("Tell Luna how I am today").
 *
 * 1. MEMORY_UNAVAILABLE
 * 2. RETURNING_AFTER_GAP   (last meaningful activity ≥ 7 days)
 * 3. CONFIRMED_PATTERN
 * 4. POSSIBLE_PATTERN
 * 5. REVIEW_AVAILABLE
 * 6. RETURNING
 * 7. NEW_MEMORY_ON
 * 8. NEW_LOCAL
 */

export const TODAY_PRIMARY_ACTION = 'quick_checkin' as const;

export type TodayPresentationState =
  | 'NEW_LOCAL'
  | 'NEW_MEMORY_ON'
  | 'RETURNING'
  | 'REVIEW_AVAILABLE'
  | 'POSSIBLE_PATTERN'
  | 'CONFIRMED_PATTERN'
  | 'MEMORY_UNAVAILABLE'
  | 'RETURNING_AFTER_GAP';

export type TodayMemoryStatus = 'off' | 'on' | 'unavailable' | 'unknown';

export type TodayPatternStatus = 'none' | 'possible' | 'confirmed' | 'unavailable';

export type TodayMeaningfulEvent = {
  type: string;
  timestamp: string;
};

export type TodaySignalPreview = {
  id: string;
  signal_type?: string;
  normalized_value?: string | null;
  display_label?: string | null;
  user_status?: string;
  occurred_at?: string;
};

export type TodayPatternPreview = {
  id: string;
  title: string;
  status: 'candidate' | 'confirmed';
};

export type ResolveTodayStateInput = {
  /** Local meaningful events (AUDIO_REFLECTION | DAILY_CHECKIN). */
  localEvents: TodayMeaningfulEvent[];
  memoryStatus: TodayMemoryStatus;
  unreviewedCount: number;
  possiblePatterns: TodayPatternPreview[];
  confirmedPatterns: TodayPatternPreview[];
  /** Wall-clock "now" for tests. */
  nowMs?: number;
  /** Gap threshold in days (default 7). */
  gapDays?: number;
};

export type TodayStateResult = {
  state: TodayPresentationState;
  memoryStatus: TodayMemoryStatus;
  patternStatus: TodayPatternStatus;
  hasLocalHistory: boolean;
  unreviewedCount: number;
  daysSinceLastActivity: number | null;
  lastActivityAt: string | null;
  /** Calendar relation of last activity to "today" in local timezone. */
  lastActivityDayRelation: 'today' | 'yesterday' | 'earlier' | 'none';
  primaryAction: typeof TODAY_PRIMARY_ACTION;
  possiblePattern: TodayPatternPreview | null;
  confirmedPattern: TodayPatternPreview | null;
};

const MEANINGFUL_TYPES = new Set(['AUDIO_REFLECTION', 'DAILY_CHECKIN']);

export const isMeaningfulTodayEvent = (type: string): boolean => MEANINGFUL_TYPES.has(type);

const startOfLocalDay = (ms: number): number => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const dayDiffFromToday = (iso: string, nowMs: number): number => {
  const eventStart = startOfLocalDay(new Date(iso).getTime());
  const todayStart = startOfLocalDay(nowMs);
  return Math.floor((todayStart - eventStart) / 86_400_000);
};

export const resolveLastActivityDayRelation = (
  lastActivityAt: string | null,
  nowMs: number = Date.now(),
): 'today' | 'yesterday' | 'earlier' | 'none' => {
  if (!lastActivityAt) return 'none';
  const diff = dayDiffFromToday(lastActivityAt, nowMs);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  return 'earlier';
};

/**
 * Build continuity copy from factual evidence only.
 * Never invents yesterday; never claims server memory when Memory is off/unavailable.
 */
export type ContinuityCopyInput = {
  state: TodayPresentationState;
  memoryStatus: TodayMemoryStatus;
  hasLocalHistory: boolean;
  lastActivityAt: string | null;
  lastActivityDayRelation: 'today' | 'yesterday' | 'earlier' | 'none';
  daysSinceLastActivity: number | null;
  confirmedPattern: TodayPatternPreview | null;
  possiblePattern: TodayPatternPreview | null;
};

export type ContinuityCopy = {
  kind:
    | 'none'
    | 'local_recent'
    | 'local_yesterday'
    | 'return_after_gap'
    | 'confirmed_pattern'
    | 'possible_pattern'
    | 'memory_off'
    | 'memory_on_empty'
    | 'memory_unavailable';
  line: string;
  /** Safe analytics: pattern_status / has_history only — no health text. */
  shown: boolean;
};

export const buildContinuityCopy = (input: ContinuityCopyInput): ContinuityCopy => {
  const {
    state,
    memoryStatus,
    hasLocalHistory,
    lastActivityDayRelation,
    daysSinceLastActivity,
    confirmedPattern,
    possiblePattern,
  } = input;

  if (state === 'MEMORY_UNAVAILABLE' && !hasLocalHistory) {
    return {
      kind: 'memory_unavailable',
      line: 'Memory settings are temporarily unavailable. You can still tell Luna how you are today — it stays on this device for now.',
      shown: true,
    };
  }

  if (state === 'RETURNING_AFTER_GAP' && hasLocalHistory && daysSinceLastActivity != null) {
    // Pattern detail lives on the Task 9.4 pattern experience card — keep gap copy welcome-only.
    return {
      kind: 'return_after_gap',
      line: 'Welcome back. Whenever you are ready, tell Luna how you are today.',
      shown: true,
    };
  }

  if (confirmedPattern) {
    return {
      kind: 'confirmed_pattern',
      line: `A pattern you confirmed: ${confirmedPattern.title}`,
      shown: true,
    };
  }

  if (possiblePattern && (state === 'POSSIBLE_PATTERN' || !hasLocalHistory)) {
    return {
      kind: 'possible_pattern',
      line: `Possible pattern (not confirmed): ${possiblePattern.title}`,
      shown: true,
    };
  }

  if (hasLocalHistory && lastActivityDayRelation === 'yesterday') {
    return {
      kind: 'local_yesterday',
      line: 'Yesterday you checked in with Luna. Tell her how today feels.',
      shown: true,
    };
  }

  if (hasLocalHistory && lastActivityDayRelation === 'today') {
    return {
      kind: 'local_recent',
      line: 'You already shared something with Luna today. You can update how you feel anytime.',
      shown: true,
    };
  }

  if (hasLocalHistory) {
    return {
      kind: 'local_recent',
      line: 'Luna has recent activity from you on this device. Tell her how today feels.',
      shown: true,
    };
  }

  if (memoryStatus === 'on') {
    return {
      kind: 'memory_on_empty',
      line: 'Memory is on. As you share, Luna can carry forward what you confirm — nothing saved yet.',
      shown: true,
    };
  }

  if (memoryStatus === 'off') {
    return {
      kind: 'memory_off',
      line: 'Memory is off. Your check-in still helps today — it stays on this device unless you turn Memory on later.',
      shown: true,
    };
  }

  if (memoryStatus === 'unavailable') {
    return {
      kind: 'memory_unavailable',
      line: 'Memory settings are temporarily unavailable. You can still tell Luna how you are today.',
      shown: true,
    };
  }

  return {
    kind: 'none',
    line: 'Tell Luna how you are today — she will meet you where you are.',
    shown: true,
  };
};

export const resolveTodayState = (input: ResolveTodayStateInput): TodayStateResult => {
  const nowMs = input.nowMs ?? Date.now();
  const gapDays = input.gapDays ?? 7;

  const meaningful = (input.localEvents || [])
    .filter((e) => e?.timestamp && isMeaningfulTodayEvent(String(e.type || '')))
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const last = meaningful[0] || null;
  const lastActivityAt = last?.timestamp ?? null;
  const daysSinceLastActivity =
    lastActivityAt != null ? dayDiffFromToday(lastActivityAt, nowMs) : null;
  const lastActivityDayRelation = resolveLastActivityDayRelation(lastActivityAt, nowMs);
  const hasLocalHistory = meaningful.length > 0;

  const confirmedPatterns = (input.confirmedPatterns || []).filter((p) => p.status === 'confirmed');
  const possiblePatterns = (input.possiblePatterns || []).filter((p) => p.status === 'candidate');
  const confirmedPattern = confirmedPatterns[0] || null;
  const possiblePattern = possiblePatterns[0] || null;

  let patternStatus: TodayPatternStatus = 'none';
  if (confirmedPattern) patternStatus = 'confirmed';
  else if (possiblePattern) patternStatus = 'possible';

  let state: TodayPresentationState = 'NEW_LOCAL';

  if (input.memoryStatus === 'unavailable') {
    state = 'MEMORY_UNAVAILABLE';
  } else if (hasLocalHistory && daysSinceLastActivity != null && daysSinceLastActivity >= gapDays) {
    // Gap return wins over pattern/review for presentation tone; patterns still attach via continuity.
    state = 'RETURNING_AFTER_GAP';
  } else if (confirmedPattern) {
    state = 'CONFIRMED_PATTERN';
  } else if (possiblePattern) {
    state = 'POSSIBLE_PATTERN';
  } else if (input.unreviewedCount > 0) {
    state = 'REVIEW_AVAILABLE';
  } else if (hasLocalHistory) {
    state = 'RETURNING';
  } else if (input.memoryStatus === 'on') {
    state = 'NEW_MEMORY_ON';
  } else {
    state = 'NEW_LOCAL';
  }

  return {
    state,
    memoryStatus: input.memoryStatus,
    patternStatus,
    hasLocalHistory,
    unreviewedCount: Math.max(0, input.unreviewedCount | 0),
    daysSinceLastActivity,
    lastActivityAt,
    lastActivityDayRelation,
    primaryAction: TODAY_PRIMARY_ACTION,
    possiblePattern,
    confirmedPattern,
  };
};

/** Filter Task 5 candidates — never surface rejected / stale / invalidated. */
export const filterSurfacedPatterns = <
  T extends { payload?: { status?: string; title?: string }; id?: string },
>(
  candidates: T[],
): { possible: TodayPatternPreview[]; confirmed: TodayPatternPreview[] } => {
  const possible: TodayPatternPreview[] = [];
  const confirmed: TodayPatternPreview[] = [];
  for (const c of candidates || []) {
    const status = String(c.payload?.status || '');
    const title = String(c.payload?.title || '').trim();
    const id = String(c.id || '');
    if (!id || !title) continue;
    if (status === 'candidate') possible.push({ id, title, status: 'candidate' });
    else if (status === 'confirmed') confirmed.push({ id, title, status: 'confirmed' });
  }
  return { possible, confirmed };
};

export const TODAY_STATE_PRIORITY = [
  'MEMORY_UNAVAILABLE',
  'RETURNING_AFTER_GAP',
  'CONFIRMED_PATTERN',
  'POSSIBLE_PATTERN',
  'REVIEW_AVAILABLE',
  'RETURNING',
  'NEW_MEMORY_ON',
  'NEW_LOCAL',
] as const;
