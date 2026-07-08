/**
 * Authenticated client for per-user Luna Live memory consent (Task 8).
 * Server session is the only owner authority — never send user_id as owner.
 */

export type MemoryConsentStatus = 'enabled' | 'disabled' | 'consent_unavailable';

export type MemoryConsentResponse = {
  status: MemoryConsentStatus | string;
  consent_version?: string;
  enabled_at?: string | null;
  disabled_at?: string | null;
  updated_at?: string | null;
  memory_write_available?: boolean;
  error?: string;
  code?: string;
};

const apiUrl = (path: string) => {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
  const base =
    fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')
      ? fromEnv.replace(/\/$/, '')
      : '';
  return `${base}${path}`;
};

const parseJson = async <T>(response: Response): Promise<T & { error?: string; code?: string }> => {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as T & { error?: string; code?: string }) : ({} as T & { error?: string; code?: string });
};

export const getMemoryConsent = async (): Promise<MemoryConsentResponse> => {
  const response = await fetch(apiUrl('/api/personal/memory-consent'), {
    method: 'GET',
    credentials: 'include',
  });
  const data = await parseJson<MemoryConsentResponse>(response);
  if (response.status === 503 || data.status === 'consent_unavailable') {
    return {
      status: 'consent_unavailable',
      memory_write_available: false,
      consent_version: data.consent_version,
      code: data.code,
      error: data.error,
    };
  }
  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status})`) as Error & {
      status?: number;
      code?: string;
    };
    err.status = response.status;
    err.code = data.code;
    throw err;
  }
  return data;
};

export const enableMemoryConsent = async (
  sourceSurface = 'memory_settings',
): Promise<MemoryConsentResponse> => {
  const response = await fetch(apiUrl('/api/personal/memory-consent/enable'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_surface: sourceSurface }),
  });
  const data = await parseJson<MemoryConsentResponse>(response);
  if (response.status === 503 || data.status === 'consent_unavailable') {
    return {
      status: 'consent_unavailable',
      memory_write_available: false,
      code: data.code,
      error: data.error,
    };
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
};

export const disableMemoryConsent = async (
  sourceSurface = 'memory_settings',
): Promise<MemoryConsentResponse> => {
  const response = await fetch(apiUrl('/api/personal/memory-consent/disable'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_surface: sourceSurface }),
  });
  const data = await parseJson<MemoryConsentResponse>(response);
  if (response.status === 503 || data.status === 'consent_unavailable') {
    return {
      status: 'consent_unavailable',
      memory_write_available: false,
      code: data.code,
      error: data.error,
    };
  }
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
};

export const memoryConsentService = {
  get: getMemoryConsent,
  enable: enableMemoryConsent,
  disable: disableMemoryConsent,
};
