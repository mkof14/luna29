import { useEffect, useMemo, useState } from 'react';
import { billingService, BillingStatusPayload } from '../services/billingService';
import {
  hasPremiumAccess,
  isLocalTrialActive,
  isPremiumBillingStatus,
  readLocalTrialState,
  trialDaysLeft,
  TrialState,
} from '../utils/subscriptionAccess';

export const useSubscriptionAccess = () => {
  const [billing, setBilling] = useState<BillingStatusPayload>({ status: 'inactive', plan: 'none' });
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trialState, setTrialState] = useState<TrialState | null>(() => readLocalTrialState());

  useEffect(() => {
    let mounted = true;
    billingService
      .getStatus()
      .then((payload) => {
        if (!mounted) return;
        setBilling(payload.billing);
        setBillingEnabled(Boolean(payload.enabled));
      })
      .catch(() => {
        if (!mounted) return;
        setBilling({ status: 'inactive', plan: 'none' });
        setBillingEnabled(false);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setTrialState(readLocalTrialState());
  }, []);

  // Authoritative premium comes from server billing status (includes server trial overlay).
  const premiumActive = useMemo(() => hasPremiumAccess(billing), [billing]);
  // localStorage trial is display-only cache — never grants premium.
  const localTrialActive = useMemo(
    () => isPremiumBillingStatus(billing?.status) && isLocalTrialActive(),
    [billing, trialState],
  );
  const daysLeft = useMemo(() => {
    if (isPremiumBillingStatus(billing?.status) && billing?.status === 'trialing') {
      return trialDaysLeft(trialState);
    }
    return 0;
  }, [billing, trialState]);

  return {
    billing,
    billingEnabled,
    loading,
    premiumActive,
    localTrialActive,
    trialState,
    trialDaysLeft: daysLeft,
    refreshTrial: () => setTrialState(readLocalTrialState()),
  };
};
