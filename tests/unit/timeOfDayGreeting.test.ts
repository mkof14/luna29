import { describe, expect, it } from 'vitest';
import { getMemberTimeGreeting, getTimeOfDay, resolveTimeOfDayGreeting } from '../../utils/timeOfDayGreeting';

describe('timeOfDayGreeting', () => {
  it('maps local hours to morning, afternoon, evening, and night', () => {
    expect(getTimeOfDay(new Date('2026-07-02T08:30:00'))).toBe('morning');
    expect(getTimeOfDay(new Date('2026-07-02T14:00:00'))).toBe('afternoon');
    expect(getTimeOfDay(new Date('2026-07-02T19:00:00'))).toBe('evening');
    expect(getTimeOfDay(new Date('2026-07-02T23:30:00'))).toBe('night');
    expect(getTimeOfDay(new Date('2026-07-02T02:00:00'))).toBe('night');
  });

  it('returns localized greetings', () => {
    const afternoon = new Date('2026-07-02T15:00:00');
    expect(getMemberTimeGreeting('en', afternoon)).toBe('Good afternoon');
    expect(getMemberTimeGreeting('ru', afternoon)).toBe('Добрый день');
    expect(resolveTimeOfDayGreeting(
      { morning: 'A', afternoon: 'B', evening: 'C', night: 'D' },
      new Date('2026-07-02T21:00:00'),
    )).toBe('C');
  });
});
