export const TRIAL_STORAGE_KEY = 'luna_pricing_trial_v1';
export const TRIAL_DAYS = 7;
export const FREE_BRIDGE_WEEKLY_LIMIT = 2;
export const PREMIUM_BRIDGE_WEEKLY_LIMIT = 999;

export type TrialState = {
  startedAt: string;
  endsAt: string;
  status: 'active' | 'expired';
  used: boolean;
};

export type BillingStatusPayload = {
  status?: string;
  plan?: string;
  period?: string;
};

export const FREE_FEATURES = [
  'Daily check-in and Today view',
  'Voice reflection',
  'Basic rhythm map',
  'Short story timeline',
  '2 Bridge reflections per week',
] as const;

export const PAID_FEATURES = [
  'Deeper pattern discovery',
  'Monthly reflection archive',
  'Unlimited Bridge reflections',
  'Full reflection history',
  'Health reports and doctor prep',
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export const isPremiumBillingStatus = (status?: string): boolean =>
  ['active', 'trialing'].includes(String(status || '').toLowerCase());

export const readLocalTrialState = (): TrialState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TRIAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TrialState>;
    if (!parsed.startedAt || !parsed.endsAt) return null;
    const endsAt = new Date(parsed.endsAt);
    if (Number.isNaN(endsAt.getTime())) return null;
    const active = endsAt.getTime() > Date.now();
    return {
      startedAt: parsed.startedAt,
      endsAt: parsed.endsAt,
      status: active ? 'active' : 'expired',
      used: Boolean(parsed.used),
    };
  } catch {
    return null;
  }
};

export const startLocalTrial = (): TrialState => {
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + TRIAL_DAYS * DAY_MS);
  const next: TrialState = {
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: 'active',
    used: true,
  };
  localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const trialDaysLeft = (trial: TrialState | null): number => {
  if (!trial || trial.status !== 'active') return 0;
  const diff = new Date(trial.endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / DAY_MS));
};

export const isLocalTrialActive = (): boolean => readLocalTrialState()?.status === 'active';

export const hasPremiumAccess = (billing?: BillingStatusPayload | null): boolean =>
  isPremiumBillingStatus(billing?.status) || isLocalTrialActive();

export const getBridgeWeeklyLimit = (premium: boolean): number =>
  premium ? PREMIUM_BRIDGE_WEEKLY_LIMIT : FREE_BRIDGE_WEEKLY_LIMIT;

export const canUseBridgeReflection = (usageCount: number, premium: boolean): boolean =>
  usageCount < getBridgeWeeklyLimit(premium);
