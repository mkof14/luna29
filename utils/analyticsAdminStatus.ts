import { readPrivacyConsent, savePrivacyConsent } from './privacyCompliance';
import { initAnalytics, refreshAnalyticsConsent, trackEvent, trackPageView } from '../services/analyticsService';
import { captureAppError, initMonitoring } from '../services/monitoringService';

declare const __LUNA_GA4_ID__: string;
declare const __LUNA_SENTRY_DSN__: string;
declare const __LUNA_SENTRY_ENV__: string;
declare const __LUNA_APP_RELEASE__: string;

export type AnalyticsBuildConfig = {
  ga4Id: string;
  sentryDsn: string;
  sentryEnv: string;
  release: string;
};

export type AnalyticsRuntimeStatus = {
  consentGranted: boolean;
  ga4Configured: boolean;
  sentryConfigured: boolean;
  ga4Initialized: boolean;
  sentryInitialized: boolean;
  gtagReady: boolean;
  sentryReady: boolean;
};

export const maskValue = (value: string, visibleTail = 6): string => {
  const trimmed = value.trim();
  if (!trimmed) return '—';
  if (trimmed.length <= visibleTail + 3) return trimmed;
  return `…${trimmed.slice(-visibleTail)}`;
};

export const readAnalyticsBuildConfig = (): AnalyticsBuildConfig => {
  const ga4Id = typeof __LUNA_GA4_ID__ === 'undefined' ? '' : String(__LUNA_GA4_ID__ || '').trim();
  const sentryDsn = typeof __LUNA_SENTRY_DSN__ === 'undefined' ? '' : String(__LUNA_SENTRY_DSN__ || '').trim();
  const sentryEnv = typeof __LUNA_SENTRY_ENV__ === 'undefined' ? 'production' : String(__LUNA_SENTRY_ENV__ || 'production').trim();
  const release = typeof __LUNA_APP_RELEASE__ === 'undefined' ? '' : String(__LUNA_APP_RELEASE__ || '').trim();
  return { ga4Id, sentryDsn, sentryEnv, release };
};

export const readAnalyticsRuntimeStatus = (): AnalyticsRuntimeStatus => {
  const build = readAnalyticsBuildConfig();
  const consentGranted = readPrivacyConsent()?.scopes.analytics === true;
  if (typeof window === 'undefined') {
    return {
      consentGranted,
      ga4Configured: Boolean(build.ga4Id),
      sentryConfigured: Boolean(build.sentryDsn),
      ga4Initialized: false,
      sentryInitialized: false,
      gtagReady: false,
      sentryReady: false,
    };
  }

  return {
    consentGranted,
    ga4Configured: Boolean(build.ga4Id),
    sentryConfigured: Boolean(build.sentryDsn),
    ga4Initialized: Boolean(window.__lunaAnalyticsInit),
    sentryInitialized: Boolean(window.__lunaMonitoringInit),
    gtagReady: typeof window.gtag === 'function',
    sentryReady: typeof window.Sentry !== 'undefined',
  };
};

export const grantAnalyticsConsentForAdmin = (): void => {
  savePrivacyConsent({ analytics: true });
};

export const runAnalyticsSelfTest = async (): Promise<{ ok: boolean; reason?: string }> => {
  const build = readAnalyticsBuildConfig();
  if (!build.ga4Id && !build.sentryDsn) {
    return { ok: false, reason: 'missing_env' };
  }

  if (!readPrivacyConsent()?.scopes.analytics) {
    grantAnalyticsConsentForAdmin();
  }

  await Promise.all([initMonitoring(), refreshAnalyticsConsent()]);

  if (build.ga4Id) {
    trackPageView('/admin/analytics-self-test');
    trackEvent('luna_admin_analytics_self_test', { source: 'admin_panel' });
  }
  if (build.sentryDsn) {
    captureAppError(new Error('Luna29 admin analytics self-test'));
  }

  return { ok: true };
};

export const GA4_REALTIME_URL = 'https://analytics.google.com/analytics/web/';
export const SENTRY_ISSUES_URL = 'https://sentry.io/issues/';
