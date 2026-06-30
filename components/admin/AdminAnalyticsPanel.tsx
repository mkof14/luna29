import React, { useCallback, useEffect, useState } from 'react';
import { Language, getLang } from '../../constants';
import { ANALYTICS_ADMIN_COPY } from '../../utils/analyticsAdminI18n';
import {
  GA4_REALTIME_URL,
  SENTRY_ISSUES_URL,
  grantAnalyticsConsentForAdmin,
  maskValue,
  readAnalyticsBuildConfig,
  readAnalyticsRuntimeStatus,
  runAnalyticsSelfTest,
  type AnalyticsRuntimeStatus,
} from '../../utils/analyticsAdminStatus';

type AdminAnalyticsPanelProps = {
  lang: Language;
  onFeedback?: (message: string) => void;
};

const statusBadge = (ready: boolean, onLabel: string, offLabel: string) =>
  ready
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

export const AdminAnalyticsPanel: React.FC<AdminAnalyticsPanelProps> = ({ lang, onFeedback }) => {
  const copy = getLang(ANALYTICS_ADMIN_COPY, lang);
  const [build] = useState(() => readAnalyticsBuildConfig());
  const [runtime, setRuntime] = useState<AnalyticsRuntimeStatus>(() => readAnalyticsRuntimeStatus());
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setRuntime(readAnalyticsRuntimeStatus());
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const runSelfTest = async () => {
    setBusy(true);
    try {
      const result = await runAnalyticsSelfTest();
      refresh();
      onFeedback?.(result.ok ? copy.selfTestOk : copy.selfTestFail);
    } finally {
      setBusy(false);
    }
  };

  const grantConsent = () => {
    grantAnalyticsConsentForAdmin();
    refresh();
    onFeedback?.(copy.consentOn);
  };

  return (
    <section className="space-y-4 p-8 rounded-[2.5rem] bg-white/75 dark:bg-[#111c33]/72 backdrop-blur-xl border border-white/60 dark:border-white/12 shadow-luna-rich">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black uppercase tracking-wider">{copy.title}</h2>
        <span className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge(Boolean(build.ga4Id && build.sentryDsn), copy.configured, copy.missing)}`}>
          {build.ga4Id && build.sentryDsn ? copy.configured : copy.missing}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{copy.hint}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{copy.ga4Id}</p>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100 break-all">{build.ga4Id || '—'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{copy.sentryDsn}</p>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100 break-all">{build.sentryDsn ? maskValue(build.sentryDsn, 28) : '—'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{copy.sentryEnv}</p>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">{build.sentryEnv || '—'}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{copy.release}</p>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">{build.release || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{copy.consent}</p>
          <p className={`mt-2 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge(runtime.consentGranted, copy.consentOn, copy.consentOff)}`}>
            {runtime.consentGranted ? copy.consentOn : copy.consentOff}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{copy.ga4Runtime}</p>
          <p className={`mt-2 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge(runtime.gtagReady, copy.configured, copy.missing)}`}>
            {runtime.gtagReady ? copy.configured : copy.missing}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{copy.sentryRuntime}</p>
          <p className={`mt-2 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge(runtime.sentryReady, copy.configured, copy.missing)}`}>
            {runtime.sentryReady ? copy.configured : copy.missing}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex items-end">
          <button type="button" onClick={refresh} className="w-full px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest">
            {copy.refresh}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!runtime.consentGranted && (
          <button type="button" onClick={grantConsent} className="px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">
            {copy.grantConsent}
          </button>
        )}
        <button
          type="button"
          onClick={runSelfTest}
          disabled={busy || (!build.ga4Id && !build.sentryDsn)}
          className="px-4 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          {copy.selfTest}
        </button>
        <a href={GA4_REALTIME_URL} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">
          {copy.openGa4}
        </a>
        <a href={SENTRY_ISSUES_URL} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">
          {copy.openSentry}
        </a>
      </div>
    </section>
  );
};
