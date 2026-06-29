type SentryLike = {
  init: (config: Record<string, unknown>) => void;
  captureException: (error: unknown) => void;
};

declare global {
  interface Window {
    Sentry?: SentryLike;
    __lunaMonitoringInit?: boolean;
  }
}

import { readPrivacyConsent } from '../utils/privacyCompliance';

declare const __LUNA_SENTRY_DSN__: string;
declare const __LUNA_SENTRY_ENV__: string;
declare const __LUNA_APP_RELEASE__: string;

const hasMonitoringConsent = (): boolean => {
  const consent = readPrivacyConsent();
  return consent?.scopes.analytics === true;
};

const readEnv = () => {
  if (typeof window === 'undefined' || typeof __LUNA_SENTRY_DSN__ === 'undefined') {
    return { sentryDsn: '', sentryEnv: 'production', sentryRelease: '' };
  }

  const sentryDsn = String(__LUNA_SENTRY_DSN__ || '').trim();
  const sentryEnv = String(__LUNA_SENTRY_ENV__ || 'production').trim();
  const sentryRelease = String(__LUNA_APP_RELEASE__ || '').trim();
  return { sentryDsn, sentryEnv, sentryRelease };
};

const loadSentryScript = () =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-luna-sentry="1"]');
    if (existing) {
      if (window.Sentry) resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Sentry script failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://browser.sentry-cdn.com/8.36.0/bundle.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.lunaSentry = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Sentry script failed to load.'));
    document.head.appendChild(script);
  });

export const initMonitoring = async () => {
  const { sentryDsn, sentryEnv, sentryRelease } = readEnv();
  if (!sentryDsn || typeof window === 'undefined' || window.__lunaMonitoringInit || !hasMonitoringConsent()) {
    return;
  }

  window.__lunaMonitoringInit = true;
  try {
    await loadSentryScript();
    if (!window.Sentry) return;

    window.Sentry.init({
      dsn: sentryDsn,
      environment: sentryEnv,
      release: sentryRelease,
      tracesSampleRate: 0.05,
    });
  } catch (error) {
    console.warn('Monitoring init failed', error);
  }
};

export const captureAppError = (error: unknown) => {
  const { sentryDsn } = readEnv();
  if (!sentryDsn || typeof window === 'undefined' || !hasMonitoringConsent()) return;
  try {
    window.Sentry?.captureException(error);
  } catch {
    // no-op
  }
};
