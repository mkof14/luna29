/**
 * Daily trust-loop review helpers (Task 9.3).
 * AUTHORITY (Task 10): sole owner of Today's daily review quota / later / display.
 * Day-scoped "Review later" — does not confirm, reject, or delete.
 * Max 3 signals asked per local calendar day on Today only.
 *
 * Scope: TODAY_DAILY_REVIEW_LIMIT applies ONLY to the Today surface.
 * MemoryControls is the administrative review path and intentionally has
 * no daily quota — do not sync or enforce this limit there.
 */

import {
  humanizeNormalizedValue,
  humanizeSignalType,
} from './memorySignalLabels';
import type { TodaySignalPreview } from './todayState';

export const TODAY_DAILY_REVIEW_LIMIT = 3;
export const TODAY_REVIEW_LATER_STORAGE_KEY = 'luna29_today_review_later_v1';

export type TodayReviewDayState = {
  dayKey: string;
  /** Signal ids deferred for this local day only. */
  laterIds: string[];
  /** Signal ids confirmed, rejected, or deferred this local day (quota). */
  handledIds: string[];
};

const emptyState = (dayKey: string): TodayReviewDayState => ({
  dayKey,
  laterIds: [],
  handledIds: [],
});

export const localDayKey = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const readTodayReviewDayState = (now: Date = new Date()): TodayReviewDayState => {
  const dayKey = localDayKey(now);
  if (typeof window === 'undefined' || !window.localStorage) return emptyState(dayKey);
  try {
    const raw = window.localStorage.getItem(TODAY_REVIEW_LATER_STORAGE_KEY);
    if (!raw) return emptyState(dayKey);
    const parsed = JSON.parse(raw) as Partial<TodayReviewDayState>;
    if (parsed.dayKey !== dayKey) return emptyState(dayKey);
    return {
      dayKey,
      laterIds: Array.isArray(parsed.laterIds) ? parsed.laterIds.map(String) : [],
      handledIds: Array.isArray(parsed.handledIds) ? parsed.handledIds.map(String) : [],
    };
  } catch {
    return emptyState(dayKey);
  }
};

export const writeTodayReviewDayState = (state: TodayReviewDayState): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(TODAY_REVIEW_LATER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
};

export const markSignalHandledToday = (
  signalId: string,
  kind: 'confirm' | 'reject' | 'later',
  now: Date = new Date(),
): TodayReviewDayState => {
  const state = readTodayReviewDayState(now);
  const id = String(signalId);
  if (!state.handledIds.includes(id)) state.handledIds.push(id);
  if (kind === 'later' && !state.laterIds.includes(id)) state.laterIds.push(id);
  writeTodayReviewDayState(state);
  return state;
};

/**
 * Select up to remaining daily quota of unreviewed signals,
 * excluding ids deferred for today.
 */
export const selectDailyReviewSignals = (
  signals: TodaySignalPreview[],
  state: TodayReviewDayState,
  limit: number = TODAY_DAILY_REVIEW_LIMIT,
): TodaySignalPreview[] => {
  const remaining = Math.max(0, limit - state.handledIds.length);
  if (remaining <= 0) return [];
  const later = new Set(state.laterIds);
  const handled = new Set(state.handledIds);
  return (signals || [])
    .filter((s) => s?.id && !later.has(s.id) && !handled.has(s.id))
    .slice(0, remaining);
};

export const dailyReviewQuotaExhausted = (state: TodayReviewDayState): boolean =>
  state.handledIds.length >= TODAY_DAILY_REVIEW_LIMIT;

export type DailyReviewDisplayItem = {
  id: string;
  typeLabel: string;
  valueLabel: string;
  timeLabel: string;
  trustLabel: 'Needs review';
};

export const formatReviewSignalTime = (
  iso: string | null | undefined,
  now: Date = new Date(),
): string => {
  if (!iso) return 'Recently';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 'Recently';
  const event = new Date(t);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startEvent = new Date(event.getFullYear(), event.getMonth(), event.getDate()).getTime();
  const dayDiff = Math.floor((startToday - startEvent) / 86_400_000);
  const time = event.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (dayDiff <= 0) return `Today · ${time}`;
  if (dayDiff === 1) return `Yesterday · ${time}`;
  return `${dayDiff} days ago · ${time}`;
};

export const toDailyReviewDisplayItem = (
  signal: TodaySignalPreview,
  now: Date = new Date(),
): DailyReviewDisplayItem => {
  const typeLabel = humanizeSignalType(signal.signal_type);
  const valueLabel =
    humanizeNormalizedValue(signal.normalized_value) ||
    String(signal.display_label || '').trim() ||
    typeLabel;
  return {
    id: signal.id,
    typeLabel,
    valueLabel,
    timeLabel: formatReviewSignalTime(signal.occurred_at, now),
    trustLabel: 'Needs review',
  };
};

export type ReviewContinuityKind =
  | 'nothing_to_review'
  | 'items_remaining'
  | 'caught_up'
  | 'enough_for_today'
  | 'more_in_memory';

/**
 * Continuity copy after Today review actions.
 * "You're all caught up." only when unreviewedTotal === 0.
 * Quota / Review later / leftovers → neutral copy (never imply inbox empty).
 */
export const buildReviewContinuityLine = (input: {
  confirmedTodayCount: number;
  visibleRemaining: number;
  unreviewedTotal: number;
  caughtUp: boolean;
  quotaExhausted?: boolean;
}): { kind: ReviewContinuityKind; line: string } | null => {
  if (input.unreviewedTotal <= 0) {
    if (input.caughtUp || input.confirmedTodayCount > 0) {
      return { kind: 'caught_up', line: "You're all caught up." };
    }
    return { kind: 'nothing_to_review', line: 'Nothing to review today.' };
  }

  // Today session has nothing left to show, but Memory still has items.
  if (input.caughtUp || input.visibleRemaining === 0) {
    if (input.quotaExhausted) {
      return { kind: 'enough_for_today', line: "That's enough for today." };
    }
    return { kind: 'more_in_memory', line: 'More items remain in Memory.' };
  }

  if (input.visibleRemaining === 1) {
    return { kind: 'items_remaining', line: 'One item still needs review.' };
  }
  if (input.visibleRemaining > 1) {
    return {
      kind: 'items_remaining',
      line: `${Math.min(input.visibleRemaining, TODAY_DAILY_REVIEW_LIMIT)} items still need review.`,
    };
  }
  return null;
};
