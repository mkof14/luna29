/** Mobile entitlement helpers — mirror web `utils/subscriptionAccess` semantics. */

export const isPremiumBillingStatus = (status?: string | null): boolean =>
  ['active', 'trialing'].includes(String(status || '').toLowerCase());

export const isPastDueBillingStatus = (status?: string | null): boolean =>
  String(status || '').toLowerCase() === 'past_due';

export type MobileEntitlement = {
  status: string;
  plan?: string;
  period?: string;
  entitled: boolean;
  pastDue: boolean;
};

export const entitlementFromBilling = (billing?: {
  status?: string;
  plan?: string;
  period?: string;
} | null): MobileEntitlement => {
  const status = String(billing?.status || 'none');
  return {
    status,
    plan: billing?.plan,
    period: billing?.period,
    entitled: isPremiumBillingStatus(status),
    pastDue: isPastDueBillingStatus(status),
  };
};
