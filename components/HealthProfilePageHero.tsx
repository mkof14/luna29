import React, { useEffect, useRef } from 'react';
import { HEALTH_PROFILE_COPY as c } from '../utils/healthProfileCopy';
import { HealthProfileCompletionLabel } from './HealthProfileCompletionLabel';
import { trackHealthProfileOpened } from '../utils/healthProfileAnalytics';
import { useHealthProfileCompletion } from '../hooks/useHealthProfileCompletion';

type Props = {
  trackOpened?: boolean;
};

/** Canonical Personal Health Profile page hero — completion from existing API. */
export const HealthProfilePageHero: React.FC<Props> = ({ trackOpened = true }) => {
  const { percent } = useHealthProfileCompletion(true);
  const tracked = useRef(false);

  useEffect(() => {
    if (!trackOpened || percent == null || tracked.current) return;
    tracked.current = true;
    trackHealthProfileOpened('profile', percent);
  }, [trackOpened, percent]);

  return (
    <header
      data-testid="health-profile-page-hero"
      className="rounded-[1.5rem] border border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/70 px-5 py-6 md:px-7 space-y-4"
    >
      <div className="space-y-2 max-w-2xl">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{c.pageHeroTitle}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Add what helps Luna personalize your reports, Live, and recommendations. Skip anything. Change anytime.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{c.entryCompletionLabel}</p>
        <HealthProfileCompletionLabel percent={percent} />
      </div>
      {percent != null && (
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full rounded-full bg-luna-purple transition-all" style={{ width: `${Math.min(100, percent)}%` }} />
        </div>
      )}
    </header>
  );
};

export default HealthProfilePageHero;
