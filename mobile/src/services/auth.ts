import * as SecureStore from 'expo-secure-store';
import { env, hasApiBaseUrl } from '../config/env';
import { setMobileAuthToken } from './api';
import { logError, logInfo, logWarn } from './logger';

const TOKEN_KEY = 'luna_mobile_token';
const LOCAL_SESSION_KEY = 'luna_mobile_local_session';

export type MobileSession = {
  id: string;
  email: string;
  name: string;
  provider: 'password' | 'google';
  role: string;
  permissions: string[];
  lastLoginAt: string;
  avatarUrl?: string;
};

type AuthResponse = {
  session: MobileSession;
  token: string;
};

async function safeGetToken(): Promise<string> {
  try {
    return (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
  } catch {
    return '';
  }
}

async function safeSetToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // ignore secure store errors in Expo Go fallback mode
  }
}

async function safeDeleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore secure store errors
  }
}

/** Server role/permissions only — never elevate from a hardcoded email. */
function normalizeSession(input: unknown): MobileSession | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;

  return {
    id: String(raw.id || ''),
    email: String(raw.email || ''),
    name: String(raw.name || 'Anna'),
    provider: raw.provider === 'google' ? 'google' : 'password',
    role: String(raw.role || 'member'),
    permissions: Array.isArray(raw.permissions) ? raw.permissions.map((item) => String(item)) : [],
    lastLoginAt: String(raw.lastLoginAt || new Date().toISOString()),
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : undefined,
  };
}

async function saveLocalSession(session: MobileSession): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCAL_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

async function loadLocalSession(): Promise<MobileSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(LOCAL_SESSION_KEY);
    if (!raw) return null;
    return normalizeSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function clearLocalSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(LOCAL_SESSION_KEY);
  } catch {
    // ignore
  }
}

async function requestAuth(path: string, body?: Record<string, unknown>, method: 'GET' | 'POST' = 'POST') {
  if (!hasApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }

  const token = await safeGetToken();
  const headers = new Headers({ Accept: 'application/json' });
  if (method === 'POST') headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(json?.error || 'Request failed'));
  }
  return json;
}

export async function restoreMobileSession(): Promise<MobileSession | null> {
  const token = await safeGetToken();
  if (!token) {
    // Without a server token, do not restore privileged local sessions.
    await clearLocalSession();
    return null;
  }
  setMobileAuthToken(token);

  try {
    const data = await requestAuth('/api/mobile/auth/session', undefined, 'GET');
    logInfo('Session restored');
    const normalized = normalizeSession(data?.session);
    if (normalized) {
      await saveLocalSession(normalized);
    }
    return normalized;
  } catch {
    logWarn('Session restore failed. Clearing local token.');
    await safeDeleteToken();
    setMobileAuthToken('');
    await clearLocalSession();
    return null;
  }
}

export async function signInMobile(email: string, password: string): Promise<MobileSession> {
  try {
    const data = (await requestAuth('/api/mobile/auth/signin', { email, password })) as AuthResponse;
    const normalized = normalizeSession(data.session);
    if (!normalized || !data.token) {
      throw new Error('Invalid sign in response');
    }
    await safeSetToken(data.token);
    setMobileAuthToken(data.token);
    await saveLocalSession(normalized);
    logInfo('Signed in');
    return normalized;
  } catch (error) {
    logError('Sign in failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function signUpMobile(name: string, email: string, password: string): Promise<MobileSession> {
  try {
    const data = (await requestAuth('/api/mobile/auth/signup', { name, email, password })) as AuthResponse;
    const normalized = normalizeSession(data.session);
    if (!normalized || !data.token) {
      throw new Error('Invalid sign up response');
    }
    await safeSetToken(data.token);
    setMobileAuthToken(data.token);
    await saveLocalSession(normalized);
    logInfo('Signed up');
    return normalized;
  } catch (error) {
    logError('Sign up failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function signOutMobile(): Promise<void> {
  try {
    await requestAuth('/api/mobile/auth/logout', {});
  } catch {
    // ignore network errors on logout
  }
  await safeDeleteToken();
  setMobileAuthToken('');
  await clearLocalSession();
}
