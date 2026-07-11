import { beforeEach, describe, expect, it } from 'vitest';
import {
  dismissHealthProfileTodayCard,
  isHealthProfileTodayCardDismissed,
  markHealthProfileLiveReminderShown,
  shouldShowHealthProfileLiveReminder,
} from '../../utils/healthProfileEntryPrefs';
import { pathnameToMemberTab } from '../../utils/memberFooterNavigation';
import { healthProfileCompletionBucket } from '../../utils/healthProfileAnalytics';

describe('healthProfileEntryPrefs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('dismisses today card for the local calendar day only', () => {
    const day = new Date('2026-07-10T15:00:00');
    expect(isHealthProfileTodayCardDismissed(day)).toBe(false);
    dismissHealthProfileTodayCard(day);
    expect(isHealthProfileTodayCardDismissed(day)).toBe(true);
    expect(isHealthProfileTodayCardDismissed(new Date('2026-07-11T09:00:00'))).toBe(false);
  });

  it('allows live reminder until cooldown', () => {
    const now = Date.now();
    expect(shouldShowHealthProfileLiveReminder(now)).toBe(true);
    markHealthProfileLiveReminderShown(now);
    expect(shouldShowHealthProfileLiveReminder(now + 60_000)).toBe(false);
    expect(shouldShowHealthProfileLiveReminder(now + 4 * 24 * 60 * 60 * 1000)).toBe(true);
  });
});

describe('profile entry routing', () => {
  it('maps /profile to the existing profile tab', () => {
    expect(pathnameToMemberTab('/profile')).toBe('profile');
  });
});

describe('healthProfileCompletionBucket', () => {
  it('buckets without inventing a second score', () => {
    expect(healthProfileCompletionBucket(0)).toBe('0_to_24');
    expect(healthProfileCompletionBucket(82)).toBe('75_to_99');
    expect(healthProfileCompletionBucket(100)).toBe('100');
  });
});
