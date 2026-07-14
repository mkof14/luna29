import * as SecureStore from 'expo-secure-store';
import { env, hasApiBaseUrl } from '../config/env';
import type { MobileEntitlement } from '../utils/subscriptionAccess';

export type MobileAuthProviders = {
  google: boolean;
  apple: boolean;
  message: string;
};

export type MobileBillingStatus = {
  enabled: boolean;
  monthlyPrice: string;
  yearlyPrice: string;
  trial: string;
  provider: string;
  /** Present when the request included a valid Bearer token. */
  entitlement?: MobileEntitlement;
};

const TOKEN_KEY = 'luna_mobile_token';

const fallbackProviders: MobileAuthProviders = {
  google: false,
  apple: false,
  message: 'Provider auth will be enabled in production app builds.',
};

const fallbackBilling: MobileBillingStatus = {
  enabled: false,
  monthlyPrice: '$12.99',
  yearlyPrice: '$89',
  trial: '7-day free trial',
  provider: 'disabled',
};

async function requestJson<T>(path: string, auth = false): Promise<T> {
  if (!hasApiBaseUrl) throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  const headers = new Headers({ Accept: 'application/json' });
  if (auth) {
    try {
      const token = (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch {
      // ignore
    }
  }
  const response = await fetch(`${env.apiBaseUrl}${path}`, { method: 'GET', headers });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof json?.error === 'string' ? json.error : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return json as T;
}

export async function fetchMobileAuthProviders(): Promise<MobileAuthProviders> {
  if (!hasApiBaseUrl) return fallbackProviders;
  try {
    return await requestJson<MobileAuthProviders>('/api/mobile/auth/providers');
  } catch {
    return fallbackProviders;
  }
}

/** Marketing prices + optional user entitlement (same Stripe ledger as web). */
export async function fetchMobileBillingStatus(): Promise<MobileBillingStatus> {
  if (!hasApiBaseUrl) return fallbackBilling;
  try {
    return await requestJson<MobileBillingStatus>('/api/mobile/billing/status', true);
  } catch {
    return fallbackBilling;
  }
}

export async function fetchMobileEntitlement(): Promise<MobileEntitlement | null> {
  const status = await fetchMobileBillingStatus();
  return status.entitlement || null;
}
