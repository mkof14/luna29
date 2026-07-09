import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  TODAY_DAILY_REVIEW_LIMIT,
  TODAY_REVIEW_LATER_STORAGE_KEY,
  buildReviewContinuityLine,
  dailyReviewQuotaExhausted,
  formatReviewSignalTime,
  localDayKey,
  markSignalHandledToday,
  readTodayReviewDayState,
  selectDailyReviewSignals,
  toDailyReviewDisplayItem,
} from '../../utils/todayDailyReview';

describe('todayDailyReview', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('limits selection to 3 and excludes later/handled', () => {
    const signals = [1, 2, 3, 4, 5].map((n) => ({
      id: `s${n}`,
      signal_type: 'sleep',
      normalized_value: 'poor_sleep',
      user_status: 'unreviewed',
    }));
    const state = {
      dayKey: localDayKey(),
      laterIds: ['s1'],
      handledIds: ['s1', 's2'],
    };
    const selected = selectDailyReviewSignals(signals, state);
    expect(selected.map((s) => s.id)).toEqual(['s3']);
    expect(selected.length).toBeLessThanOrEqual(TODAY_DAILY_REVIEW_LIMIT);
  });

  it('review later does not confirm or reject — only day-scoped', () => {
    const next = markSignalHandledToday('abc', 'later');
    expect(next.laterIds).toContain('abc');
    expect(next.handledIds).toContain('abc');
    const raw = JSON.parse(window.localStorage.getItem(TODAY_REVIEW_LATER_STORAGE_KEY) || '{}');
    expect(raw.laterIds).toContain('abc');
  });

  it('quota exhausted after 3 handled', () => {
    markSignalHandledToday('a', 'confirm');
    markSignalHandledToday('b', 'reject');
    markSignalHandledToday('c', 'later');
    const state = readTodayReviewDayState();
    expect(dailyReviewQuotaExhausted(state)).toBe(true);
    expect(selectDailyReviewSignals([{ id: 'd', signal_type: 'mood' }], state)).toEqual([]);
  });

  it('day rollover clears later state', () => {
    markSignalHandledToday('x', 'later');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = readTodayReviewDayState(tomorrow);
    expect(nextDay.laterIds).toEqual([]);
    expect(nextDay.handledIds).toEqual([]);
  });

  it('display item has type, label, time, needs review — no diagnosis', () => {
    const item = toDailyReviewDisplayItem({
      id: '1',
      signal_type: 'energy',
      normalized_value: 'low_energy',
      occurred_at: new Date().toISOString(),
      user_status: 'unreviewed',
    });
    expect(item.typeLabel).toBe('Energy');
    expect(item.valueLabel).toBe('Low energy');
    expect(item.trustLabel).toBe('Needs review');
    expect(item.timeLabel.toLowerCase()).toMatch(/today|recently/);
    expect(JSON.stringify(item).toLowerCase()).not.toMatch(/diagnos|prescribe|disorder/);
  });

  it('continuity lines are factual', () => {
    expect(buildReviewContinuityLine({
      confirmedTodayCount: 0,
      visibleRemaining: 0,
      unreviewedTotal: 0,
      caughtUp: true,
    })?.line).toBe("You're all caught up.");
    expect(buildReviewContinuityLine({
      confirmedTodayCount: 1,
      visibleRemaining: 0,
      unreviewedTotal: 0,
      caughtUp: false,
    })?.line).toBe("You're all caught up.");
    expect(buildReviewContinuityLine({
      confirmedTodayCount: 0,
      visibleRemaining: 1,
      unreviewedTotal: 1,
      caughtUp: false,
    })?.line).toBe('One item still needs review.');
  });

  it('never says caught up when unreviewed remain', () => {
    expect(buildReviewContinuityLine({
      confirmedTodayCount: 3,
      visibleRemaining: 0,
      unreviewedTotal: 5,
      caughtUp: true,
      quotaExhausted: true,
    })?.line).toBe("That's enough for today.");
    expect(buildReviewContinuityLine({
      confirmedTodayCount: 0,
      visibleRemaining: 0,
      unreviewedTotal: 2,
      caughtUp: true,
      quotaExhausted: false,
    })?.line).toBe('More items remain in Memory.');
    expect(buildReviewContinuityLine({
      confirmedTodayCount: 1,
      visibleRemaining: 0,
      unreviewedTotal: 4,
      caughtUp: true,
      quotaExhausted: true,
    })?.kind).not.toBe('caught_up');
  });

  it('formatReviewSignalTime never invents yesterday without evidence', () => {
    const now = new Date('2026-07-08T15:00:00');
    const twoDays = new Date('2026-07-06T10:00:00').toISOString();
    expect(formatReviewSignalTime(twoDays, now).toLowerCase()).not.toContain('yesterday');
    const y = new Date('2026-07-07T10:00:00').toISOString();
    expect(formatReviewSignalTime(y, now).toLowerCase()).toContain('yesterday');
  });
});
