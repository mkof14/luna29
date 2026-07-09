/**
 * Canonical authenticated account deletion client flow (web).
 * Server success is required before local purge.
 */

import { clearLunaLocalData } from '../utils/privacyCompliance';

export type AccountDeleteScope = 'account' | 'support_only';

export type AccountDeleteResult =
  | { ok: true; deleted: true; requestId: string; scope: AccountDeleteScope; purgedKeys: number }
  | {
      ok: false;
      deleted: false;
      status: number;
      error: string;
      code?: string;
      retryable?: boolean;
      requestId?: string;
    };

const EXTRA_LOCAL_KEYS = ['luna29_today_review_later_v1'] as const;

/** Purge Luna-owned browser storage after confirmed server deletion. */
export const purgeLunaClientDataAfterAccountDelete = (): number => {
  let removed = clearLunaLocalData(true);
  try {
    // Also clear luna29_* localStorage keys (Today/review caches) — Luna-owned only.
    const localKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('luna29_')) localKeys.push(key);
    }
    for (const key of localKeys) {
      localStorage.removeItem(key);
      removed += 1;
    }
    for (const key of EXTRA_LOCAL_KEYS) {
      if (localStorage.getItem(key) != null) {
        localStorage.removeItem(key);
        removed += 1;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('luna_') || key.startsWith('luna29_'))) sessionKeys.push(key);
    }
    sessionKeys.forEach((key) => {
      sessionStorage.removeItem(key);
      removed += 1;
    });
  } catch {
    /* ignore */
  }
  // Best-effort analytics identity reset (no-op if SDK absent).
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('set', { user_id: null });
    }
  } catch {
    /* ignore */
  }
  return removed;
};

/**
 * Authenticated account delete: server first, then local purge only on success.
 * Does not purge on failure (preserves retry).
 */
export const deleteAuthenticatedAccount = async (
  scope: AccountDeleteScope = 'account',
): Promise<AccountDeleteResult> => {
  let response: Response;
  try {
    response = await fetch('/api/privacy/delete', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope }),
    });
  } catch {
    return {
      ok: false,
      deleted: false,
      status: 0,
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
    return {
      ok: false,
      deleted: false,
      status: response.status,
      error: String(json?.error || 'Unable to complete account deletion.'),
      code: json?.code ? String(json.code) : undefined,
      retryable: json?.retryable !== false,
      requestId: json?.requestId ? String(json.requestId) : undefined,
    };
  }

  const purgedKeys =
    scope === 'account' ? purgeLunaClientDataAfterAccountDelete() : clearLunaLocalData(false);

  return {
    ok: true,
    deleted: true,
    requestId: String(json.requestId || ''),
    scope,
    purgedKeys,
  };
};
