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

  it('does not grant premium from localStorage trial alone', () => {
    const endsAt = new Date(Date.now() + 5 * 86400000).toISOString();
    applyServerTrialToLocal({ startedAt: new Date().toISOString(), endsAt });
    expect(readLocalTrialState()?.status).toBe('active');
    expect(hasPremiumAccess({ status: 'inactive' })).toBe(false);
    expect(hasPremiumAccess({ status: 'trialing' })).toBe(true);
  });

  it('persists server trial payload locally as display cache', () => {
    const endsAt = new Date(Date.now() + 5 * 86400000).toISOString();
    const trial = applyServerTrialToLocal({ startedAt: new Date().toISOString(), endsAt });
    expect(trial?.status).toBe('active');
    expect(readLocalTrialState()?.endsAt).toBe(endsAt);
    expect(localStorage.getItem(TRIAL_STORAGE_KEY)).toBeTruthy();
  });
});
