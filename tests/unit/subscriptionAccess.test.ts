import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyServerTrialToLocal,
  hasPremiumAccess,
  isPremiumBillingStatus,
  readLocalTrialState,
  TRIAL_STORAGE_KEY,
} from '../../utils/subscriptionAccess';

describe('subscriptionAccess', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('detects premium billing statuses', () => {
    expect(isPremiumBillingStatus('active')).toBe(true);
    expect(isPremiumBillingStatus('trialing')).toBe(true);
    expect(isPremiumBillingStatus('inactive')).toBe(false);
    expect(hasPremiumAccess({ status: 'active' })).toBe(true);
  });

  it('persists server trial payload locally', () => {
    const endsAt = new Date(Date.now() + 5 * 86400000).toISOString();
    const trial = applyServerTrialToLocal({ startedAt: new Date().toISOString(), endsAt });
    expect(trial?.status).toBe('active');
    expect(readLocalTrialState()?.endsAt).toBe(endsAt);
    expect(localStorage.getItem(TRIAL_STORAGE_KEY)).toBeTruthy();
  });
});
