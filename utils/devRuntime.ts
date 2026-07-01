declare const __LUNA_VITE_DEV__: boolean;

const DEV_BOOT_RESET_KEY = 'luna_dev_boot_reset_v1';

export const isLocalRuntimeHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
};

export const shouldBypassServiceWorker = (): boolean =>
  (typeof __LUNA_VITE_DEV__ !== 'undefined' && __LUNA_VITE_DEV__) || isLocalRuntimeHost();

export const purgeServiceWorkerCaches = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
};

export const hardResetLocalDev = async (): Promise<void> => {
  await purgeServiceWorkerCaches();
  try {
    sessionStorage.removeItem(DEV_BOOT_RESET_KEY);
  } catch {
    // ignore
  }
  const url = new URL(window.location.href);
  url.searchParams.set('_dev', String(Date.now()));
  window.location.replace(url.toString());
};

export const prepareLocalDevRuntime = async (): Promise<'ready' | 'reloading'> => {
  if (!shouldBypassServiceWorker()) return 'ready';

  await purgeServiceWorkerCaches();

  if (navigator.serviceWorker?.controller) {
    try {
      const alreadyReset = sessionStorage.getItem(DEV_BOOT_RESET_KEY) === '1';
      if (!alreadyReset) {
        sessionStorage.setItem(DEV_BOOT_RESET_KEY, '1');
        const url = new URL(window.location.href);
        url.searchParams.set('_dev', String(Date.now()));
        window.location.replace(url.toString());
        return 'reloading';
      }
    } catch {
      // ignore
    }
  }

  try {
    sessionStorage.removeItem(DEV_BOOT_RESET_KEY);
  } catch {
    // ignore
  }

  return 'ready';
};
