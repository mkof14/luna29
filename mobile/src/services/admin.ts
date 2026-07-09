import * as SecureStore from 'expo-secure-store';
import { env, hasApiBaseUrl } from '../config/env';

const TOKEN_KEY = 'luna_mobile_token';

type AdminState = {
  services?: Record<string, unknown>;
  admins?: Array<Record<string, unknown>>;
  templates?: Array<Record<string, unknown>>;
  templateHistory?: string[];
};

type AdminMetrics = {
  financial?: Record<string, unknown>;
  technical?: Record<string, unknown>;
  history?: Array<Record<string, unknown>>;
};

type AdminAudit = {
  audit?: Array<{ action?: string; details?: string; at?: string }>;
};

async function requestAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasApiBaseUrl) {
    throw new Error('Admin requires API base URL — local stubs are disabled.');
  }
  const token = (await SecureStore.getItemAsync(TOKEN_KEY).catch(() => '')) || '';
  if (!token) {
    throw new Error('Admin requires an authenticated server session.');
  }
  const headers = new Headers(init?.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: init?.method || 'GET',
    ...init,
    headers,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(json?.error || `Request failed: ${response.status}`));
  }
  return json as T;
}

export async function fetchAdminState(): Promise<AdminState> {
  return requestAdmin<AdminState>('/api/admin/state');
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  return requestAdmin<AdminMetrics>('/api/admin/metrics');
}

export async function fetchAdminAudit(): Promise<AdminAudit> {
  return requestAdmin<AdminAudit>('/api/admin/audit');
}

export async function runAdminMetricsCheck(): Promise<{ ok: boolean }> {
  return requestAdmin<{ ok: boolean }>('/api/admin/metrics/check', { method: 'POST' });
}

export async function connectAllSocialChannels(): Promise<{ ok: boolean }> {
  return requestAdmin<{ ok: boolean }>('/api/admin/social/connect-all', { method: 'POST' });
}

export async function markSocialPendingReview(): Promise<{ ok: boolean }> {
  return requestAdmin<{ ok: boolean }>('/api/admin/social/pending-review', { method: 'POST' });
}

export async function fetchSocialAnalytics(): Promise<{
  reach?: number;
  engagement?: number;
  growth?: number;
}> {
  return requestAdmin<{ reach?: number; engagement?: number; growth?: number }>(
    '/api/admin/social/analytics',
  );
}

export async function previewTemplates(): Promise<{ ok: boolean }> {
  return requestAdmin<{ ok: boolean }>('/api/admin/templates/preview', { method: 'POST' });
}

export async function sendAdminInvite(): Promise<{ ok: boolean }> {
  return requestAdmin<{ ok: boolean }>('/api/admin/invites/admin', { method: 'POST' });
}
