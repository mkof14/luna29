/**
 * Mobile account deletion — server first, then Luna SecureStore purge.
 */

import * as SecureStore from 'expo-secure-store';
import { env, hasApiBaseUrl } from '../config/env';
import { setMobileAuthToken } from './api';
import { logError, logInfo, logWarn } from './logger';

const TOKEN_KEY = 'luna_mobile_token';
const LOCAL_SESSION_KEY = 'luna_mobile_local_session';
const LANG_KEY = 'luna_mobile_lang';
const THEME_KEY = 'luna_mobile_theme';
const STATE_PREFIX = 'luna_mobile_state_';

const STATE_SECTIONS = [
  'body_map',
  'ritual_path',
  'bridge',
  'relationships',
  'family',
  'voice_files',
  'creative_studio',
  'medication_notes',
  'reset_room',
] as const;

export type MobileAccountDeleteResult =
  | { ok: true; deleted: true; requestId: string }
  | { ok: false; deleted: false; error: string; retryable?: boolean; status?: number };

async function getToken(): Promise<string> {
  try {
    return (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
  } catch {
    return '';
  }
}

/** Clear Luna-owned SecureStore keys after confirmed server deletion. */
export async function purgeLunaMobileLocalData(): Promise<number> {
  let removed = 0;
  const keys = [
    TOKEN_KEY,
    LOCAL_SESSION_KEY,
    LANG_KEY,
    THEME_KEY,
    ...STATE_SECTIONS.map((s) => `${STATE_PREFIX}${s}`),
  ];
  for (const key of keys) {
    try {
      const existing = await SecureStore.getItemAsync(key);
      if (existing != null) {
        await SecureStore.deleteItemAsync(key);
        removed += 1;
      }
    } catch {
      /* ignore */
    }
  }
  setMobileAuthToken('');
  return removed;
}

/**
 * Authenticated mobile account delete.
 * On failure: does not clear auth token (retry preserved).
 */
export async function deleteMobileAccount(): Promise<MobileAccountDeleteResult> {
  if (!hasApiBaseUrl) {
    return { ok: false, deleted: false, error: 'API base URL not configured.', retryable: false };
  }
  const token = await getToken();
  if (!token) {
    return { ok: false, deleted: false, error: 'Not authenticated.', retryable: false, status: 401 };
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}/api/privacy/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ scope: 'account' }),
    });
  } catch (error) {
    logWarn('Account delete network failure');
    return {
      ok: false,
      deleted: false,
      error: 'Network error. Account was not deleted. You can retry.',
      retryable: true,
    };
  }

  let json: Record<string, unknown> | null = null;
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    json = null;
  }

  if (!response.ok || json?.deleted !== true) {
    logError('Account delete failed', { status: response.status });
    return {
      ok: false,
      deleted: false,
      error: String(json?.error || 'Unable to complete account deletion.'),
      retryable: json?.retryable !== false,
      status: response.status,
    };
  }

  await purgeLunaMobileLocalData();
  logInfo('Account deleted and local data purged');
  return {
    ok: true,
    deleted: true,
    requestId: String(json.requestId || ''),
  };
}
