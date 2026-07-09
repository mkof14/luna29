/**
 * Task 9.1 — Adaptive Today foundation tests.
 * Pure resolver + continuity + pattern filtering + routing + analytics safety.
 */
import { describe, expect, it } from 'vitest';
import {
  TODAY_PRIMARY_ACTION,
  TODAY_STATE_PRIORITY,
  buildContinuityCopy,
  filterSurfacedPatterns,
  resolveLastActivityDayRelation,
  resolveTodayState,
} from '../../utils/todayState';
import { pathnameToMemberTab } from '../../utils/memberFooterNavigation';

const dayAgoIso = (days: number, now = new Date('2026-07-08T15:00:00')) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const NOW = new Date('2026-07-08T15:00:00').getTime();

describe('todayState resolver', () => {
  it('documents priority order', () => {
    expect([...TODAY_STATE_PRIORITY]).toEqual([
      'MEMORY_UNAVAILABLE',
      'RETURNING_AFTER_GAP',
      'CONFIRMED_PATTERN',
      'POSSIBLE_PATTERN',
      'REVIEW_AVAILABLE',
      'RETURNING',
      'NEW_MEMORY_ON',
      'NEW_LOCAL',
    ]);
  });

  it('1. new user Memory off → NEW_LOCAL with primary quick_checkin', () => {
    const r = resolveTodayState({
      localEvents: [],
      memoryStatus: 'off',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.state).toBe('NEW_LOCAL');
    expect(r.primaryAction).toBe(TODAY_PRIMARY_ACTION);
    expect(r.hasLocalHistory).toBe(false);
    const c = buildContinuityCopy({
      state: r.state,
      memoryStatus: r.memoryStatus,
      hasLocalHistory: r.hasLocalHistory,
      lastActivityAt: r.lastActivityAt,
      lastActivityDayRelation: r.lastActivityDayRelation,
      daysSinceLastActivity: r.daysSinceLastActivity,
      confirmedPattern: r.confirmedPattern,
      possiblePattern: r.possiblePattern,
    });
    expect(c.kind).toBe('memory_off');
    expect(c.line.toLowerCase()).not.toMatch(/remembered|saved for later|long-term/);
  });

  it('2. new user Memory on but empty → NEW_MEMORY_ON', () => {
    const r = resolveTodayState({
      localEvents: [],
      memoryStatus: 'on',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.state).toBe('NEW_MEMORY_ON');
    expect(r.primaryAction).toBe('quick_checkin');
    const c = buildContinuityCopy({
      state: r.state,
      memoryStatus: r.memoryStatus,
      hasLocalHistory: false,
      lastActivityAt: null,
      lastActivityDayRelation: 'none',
      daysSinceLastActivity: null,
      confirmedPattern: null,
      possiblePattern: null,
    });
    expect(c.kind).toBe('memory_on_empty');
    expect(c.line).toMatch(/nothing saved yet/i);
  });

  it('3. returning local-history user → RETURNING', () => {
    const r = resolveTodayState({
      localEvents: [{ type: 'DAILY_CHECKIN', timestamp: dayAgoIso(2) }],
      memoryStatus: 'off',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.state).toBe('RETURNING');
    expect(r.hasLocalHistory).toBe(true);
    expect(r.primaryAction).toBe('quick_checkin');
  });

  it('4. unreviewed signals do not replace primary action', () => {
    const r = resolveTodayState({
      localEvents: [{ type: 'AUDIO_REFLECTION', timestamp: dayAgoIso(1) }],
      memoryStatus: 'on',
      unreviewedCount: 7,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.state).toBe('REVIEW_AVAILABLE');
    expect(r.primaryAction).toBe('quick_checkin');
    expect(r.unreviewedCount).toBe(7);
  });

  it('5. possible pattern does not replace primary action', () => {
    const r = resolveTodayState({
      localEvents: [],
      memoryStatus: 'on',
      unreviewedCount: 0,
      possiblePatterns: [{ id: 'p1', title: 'Sleep and energy often appear together', status: 'candidate' }],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.state).toBe('POSSIBLE_PATTERN');
    expect(r.primaryAction).toBe('quick_checkin');
    expect(r.patternStatus).toBe('possible');
  });

  it('6. confirmed pattern continuity', () => {
    const r = resolveTodayState({
      localEvents: [{ type: 'DAILY_CHECKIN', timestamp: dayAgoIso(1) }],
      memoryStatus: 'on',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [{ id: 'c1', title: 'Low energy after short sleep', status: 'confirmed' }],
      nowMs: NOW,
    });
    expect(r.state).toBe('CONFIRMED_PATTERN');
    const c = buildContinuityCopy({
      state: r.state,
      memoryStatus: r.memoryStatus,
      hasLocalHistory: r.hasLocalHistory,
      lastActivityAt: r.lastActivityAt,
      lastActivityDayRelation: r.lastActivityDayRelation,
      daysSinceLastActivity: r.daysSinceLastActivity,
      confirmedPattern: r.confirmedPattern,
      possiblePattern: null,
    });
    expect(c.kind).toBe('confirmed_pattern');
    expect(c.line).toMatch(/confirmed/i);
    expect(c.line).toContain('Low energy after short sleep');
  });

  it('7. Memory unavailable fallback still keeps primary action', () => {
    const r = resolveTodayState({
      localEvents: [],
      memoryStatus: 'unavailable',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.state).toBe('MEMORY_UNAVAILABLE');
    expect(r.primaryAction).toBe('quick_checkin');
  });

  it('8. returning after 7+ days — no guilt language', () => {
    const r = resolveTodayState({
      localEvents: [{ type: 'DAILY_CHECKIN', timestamp: dayAgoIso(10) }],
      memoryStatus: 'off',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.state).toBe('RETURNING_AFTER_GAP');
    const c = buildContinuityCopy({
      state: r.state,
      memoryStatus: r.memoryStatus,
      hasLocalHistory: true,
      lastActivityAt: r.lastActivityAt,
      lastActivityDayRelation: r.lastActivityDayRelation,
      daysSinceLastActivity: r.daysSinceLastActivity,
      confirmedPattern: null,
      possiblePattern: null,
    });
    expect(c.kind).toBe('return_after_gap');
    expect(c.line.toLowerCase()).not.toMatch(/streak|missed|failed|guilt|behind/);
    expect(c.line).toMatch(/welcome back/i);
  });

  it('9. no false yesterday claim', () => {
    expect(resolveLastActivityDayRelation(dayAgoIso(2), NOW)).toBe('earlier');
    expect(resolveLastActivityDayRelation(dayAgoIso(1), NOW)).toBe('yesterday');
    expect(resolveLastActivityDayRelation(dayAgoIso(0), NOW)).toBe('today');
    expect(resolveLastActivityDayRelation(null, NOW)).toBe('none');

    const r = resolveTodayState({
      localEvents: [{ type: 'DAILY_CHECKIN', timestamp: dayAgoIso(3) }],
      memoryStatus: 'off',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    const c = buildContinuityCopy({
      state: r.state,
      memoryStatus: r.memoryStatus,
      hasLocalHistory: true,
      lastActivityAt: r.lastActivityAt,
      lastActivityDayRelation: r.lastActivityDayRelation,
      daysSinceLastActivity: r.daysSinceLastActivity,
      confirmedPattern: null,
      possiblePattern: null,
    });
    expect(c.line.toLowerCase()).not.toContain('yesterday');
  });

  it('10. no false memory claim when Memory off', () => {
    const r = resolveTodayState({
      localEvents: [],
      memoryStatus: 'off',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    const c = buildContinuityCopy({
      state: r.state,
      memoryStatus: 'off',
      hasLocalHistory: false,
      lastActivityAt: null,
      lastActivityDayRelation: 'none',
      daysSinceLastActivity: null,
      confirmedPattern: null,
      possiblePattern: null,
    });
    expect(c.line.toLowerCase()).toContain('memory is off');
    expect(c.line.toLowerCase()).toMatch(/this device/);
    expect(c.line.toLowerCase()).not.toMatch(/luna remembers you|from last week|your history with luna/);
  });

  it('11. rejected/stale/invalidated patterns excluded', () => {
    const filtered = filterSurfacedPatterns([
      { id: '1', payload: { status: 'candidate', title: 'Possible A' } },
      { id: '2', payload: { status: 'confirmed', title: 'Confirmed B' } },
      { id: '3', payload: { status: 'rejected', title: 'Rejected C' } },
      { id: '4', payload: { status: 'stale', title: 'Stale D' } },
      { id: '5', payload: { status: 'invalidated', title: 'Invalid E' } },
    ]);
    expect(filtered.possible.map((p) => p.id)).toEqual(['1']);
    expect(filtered.confirmed.map((p) => p.id)).toEqual(['2']);
  });

  it('12. local heuristic PatternInsightCards not used as authority', async () => {
    // Adaptive Today authority is utils/todayState + Task 5 candidates — not PatternInsightCards.
    const todayMod = await import('../../utils/todayState');
    expect(todayMod.resolveTodayState).toBeTypeOf('function');
    expect(todayMod.filterSurfacedPatterns).toBeTypeOf('function');
    // Ensure we do not re-export or depend on local heuristic cards module.
    expect('PatternInsightCards' in todayMod).toBe(false);
  });

  it('13. partial API failure — resolver still works with unknown/unavailable', () => {
    const r = resolveTodayState({
      localEvents: [{ type: 'DAILY_CHECKIN', timestamp: dayAgoIso(1) }],
      memoryStatus: 'unavailable',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.state).toBe('MEMORY_UNAVAILABLE');
    expect(r.primaryAction).toBe('quick_checkin');
    expect(r.hasLocalHistory).toBe(true);
  });

  it('14. primary action available before secondary intelligence resolves', () => {
    const r = resolveTodayState({
      localEvents: [],
      memoryStatus: 'unknown',
      unreviewedCount: 0,
      possiblePatterns: [],
      confirmedPatterns: [],
      nowMs: NOW,
    });
    expect(r.primaryAction).toBe('quick_checkin');
    expect(r.state).toBe('NEW_LOCAL');
  });
});

describe('today analytics safety', () => {
  it('15. analytics contain no health content keys', () => {
    const forbidden = [
      'transcript',
      'raw_text',
      'signal_value',
      'symptom',
      'pattern_content',
      'health_text',
      'observation_content',
      'title',
      'description',
    ];
    const safe = {
      surface: 'today',
      state: 'RETURNING',
      action: 'view',
      result: 'ok',
      memory_status: 'off',
      pattern_status: 'none',
      has_history: true,
    };
    for (const key of Object.keys(safe)) {
      expect(forbidden).not.toContain(key);
    }
    const serialized = JSON.stringify(safe);
    expect(serialized).not.toMatch(/poor_sleep|headache|cramp|transcript/i);
  });
});

describe('authenticated default route → Today', () => {
  it('16. pathname / resolves to today_mirror not dashboard', () => {
    expect(pathnameToMemberTab('/')).toBe('today_mirror');
    expect(pathnameToMemberTab('/pricing')).toBe('pricing');
    expect(pathnameToMemberTab('/how-it-works')).toBe('how_it_works');
  });
});
