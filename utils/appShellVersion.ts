import { purgeServiceWorkerCaches } from './devRuntime';

declare const __LUNA_APP_RELEASE__: string;
declare const __LUNA_SHELL_CACHE_KEY__: string;

const STORAGE_KEY = 'luna_app_shell_version';

export const APP_SHELL_VERSION =
  typeof __LUNA_SHELL_CACHE_KEY__ !== 'undefined' && String(__LUNA_SHELL_CACHE_KEY__ || '').trim()
    ? String(__LUNA_SHELL_CACHE_KEY__).trim().slice(0, 12)
    : typeof __LUNA_APP_RELEASE__ !== 'undefined' && String(__LUNA_APP_RELEASE__ || '').trim()
      ? String(__LUNA_APP_RELEASE__).trim().slice(0, 12)
      : 'shell4';

/** Drop legacy SW caches and reload once when the deployed shell version changes. */
export async function ensureFreshAppShell(): Promise<'ready' | 'reloading'> {
  if (typeof window === 'undefined') return 'ready';

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  if (stored === APP_SHELL_VERSION) return 'ready';

  await purgeServiceWorkerCaches();

  try {
    localStorage.setItem(STORAGE_KEY, APP_SHELL_VERSION);
  } catch {
    // ignore
  }

  if (stored) {
    const url = new URL(window.location.href);
    url.searchParams.set('_shell', APP_SHELL_VERSION);
    window.location.replace(url.toString());
    return 'reloading';
  }

  return 'ready';
}
