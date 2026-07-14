import { readPrivacyConsent } from '../utils/privacyCompliance';
import { utmEventParams } from '../utils/utmAttribution';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __lunaAnalyticsInit?: boolean;
  }
}

declare const __LUNA_GA4_ID__: string;

const readGa4Id = (): string => {
  if (typeof __LUNA_GA4_ID__ === 'undefined') return '';
  return String(__LUNA_GA4_ID__ || '').trim();
};

const hasAnalyticsConsent = (): boolean => readPrivacyConsent()?.scopes.analytics === true;

const loadGtagScript = (measurementId: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-luna-ga4="1"]');
    if (existing) {
      resolve();
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true, send_page_view: false });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.lunaGa4 = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GA4 script failed to load.'));
    document.head.appendChild(script);
  });

export const initAnalytics = async () => {
  const measurementId = readGa4Id();
  if (!measurementId || typeof window === 'undefined' || !hasAnalyticsConsent()) {
    return;
  }
  if (window.__lunaAnalyticsInit) return;

  window.__lunaAnalyticsInit = true;
  try {
    await loadGtagScript(measurementId);
    window.gtag?.('config', measurementId, { page_path: window.location.pathname });
  } catch (error) {
    console.warn('Analytics init failed', error);
    window.__lunaAnalyticsInit = false;
  }
};

export const refreshAnalyticsConsent = async () => {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) {
    window.__lunaAnalyticsInit = false;
    return;
  }
  window.__lunaAnalyticsInit = false;
  await initAnalytics();
};

export const trackPageView = (path?: string) => {
  const measurementId = readGa4Id();
  if (!measurementId || !hasAnalyticsConsent() || typeof window === 'undefined') return;
  window.gtag?.('event', 'page_view', {
    page_path: path || window.location.pathname,
    send_to: measurementId,
  });
};

export const trackEvent = (name: string, params: Record<string, string | number | boolean> = {}) => {
  const measurementId = readGa4Id();
  if (!measurementId || !hasAnalyticsConsent() || typeof window === 'undefined') return;
  window.gtag?.('event', name, { ...utmEventParams(), ...params });
};
