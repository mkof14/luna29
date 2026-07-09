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

/**
 * Premium access from server billing status only.
 * localStorage trial is a display cache and must not grant authoritative premium.
 * Server `/api/billing/status` overlays active Luna trials as status `trialing`.
 */
export const hasPremiumAccess = (billing?: BillingStatusPayload | null): boolean =>
  isPremiumBillingStatus(billing?.status);

export const getBridgeWeeklyLimit = (premium: boolean): number =>
  premium ? PREMIUM_BRIDGE_WEEKLY_LIMIT : FREE_BRIDGE_WEEKLY_LIMIT;

export const canUseBridgeReflection = (usageCount: number, premium: boolean): boolean =>
  usageCount < getBridgeWeeklyLimit(premium);

const TRIAL_PENDING_KEY = 'luna_trial_pending_v1';

export const markTrialPending = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIAL_PENDING_KEY, '1');
};

export const consumeTrialPending = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const pending = localStorage.getItem(TRIAL_PENDING_KEY);
    if (!pending) return false;
    localStorage.removeItem(TRIAL_PENDING_KEY);
    return true;
  } catch {
    return false;
  }
};

const CHECKOUT_PENDING_KEY = 'luna_checkout_pending_v1';
const ONBOARDING_REASON_KEY = 'luna_onboarding_reason_v1';

export const markCheckoutPending = (period: 'month' | 'year'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHECKOUT_PENDING_KEY, period);
};

export const consumeCheckoutPending = (): 'month' | 'year' | null => {
  if (typeof window === 'undefined') return null;
  try {
    const pending = localStorage.getItem(CHECKOUT_PENDING_KEY);
    if (pending !== 'month' && pending !== 'year') return null;
    localStorage.removeItem(CHECKOUT_PENDING_KEY);
    return pending;
  } catch {
    return null;
  }
};

export const saveOnboardingReason = (reason: string): void => {
  if (typeof window === 'undefined' || !reason.trim()) return;
  localStorage.setItem(ONBOARDING_REASON_KEY, reason.trim());
};

export const readOnboardingReason = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ONBOARDING_REASON_KEY);
  } catch {
    return null;
  }
};

import { TabType } from './navigation';

export const resolveOnboardingLandingTab = (reason: string | null): TabType => {
  if (!reason) return 'today_mirror';
  const lower = reason.toLowerCase();
  if (lower.includes('cycle') || lower.includes('цикл') || lower.includes('цикл') || lower.includes('ritmo') || lower.includes('周期') || lower.includes('zyk')) {
    return 'rhythm_calendar';
  }
  if (lower.includes('partner') || lower.includes('парт') || lower.includes('пар') || lower.includes('pareja') || lower.includes('partenaire')) {
    return 'bridge';
  }
  if (lower.includes('body') || lower.includes('тел') || lower.includes('тіл') || lower.includes('cuerpo') || lower.includes('körper') || lower.includes('身体')) {
    return 'cycle';
  }
  return 'today_mirror';
};

export const applyServerTrialToLocal = (payload: {
  startedAt: string;
  endsAt: string;
  used?: boolean;
}): TrialState | null => {
  if (!payload?.startedAt || !payload?.endsAt) return null;
  const next: TrialState = {
    startedAt: payload.startedAt,
    endsAt: payload.endsAt,
    status: new Date(payload.endsAt).getTime() > Date.now() ? 'active' : 'expired',
    used: Boolean(payload.used ?? true),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
};
