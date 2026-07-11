import React, { useEffect, useState } from 'react';
import type { ProfileSectionId } from '../services/personalHealthProfileService';
import { HEALTH_PROFILE_COPY as c } from '../utils/healthProfileCopy';
import { MEMBER_CHIP_ACTIVE, MEMBER_CHIP_INACTIVE } from '../utils/memberPageStyles';
import {
  dismissHealthProfileTodayCard,
  isHealthProfileTodayCardDismissed,
  markHealthProfileLiveReminderShown,
  shouldShowHealthProfileLiveReminder,
} from '../utils/healthProfileEntryPrefs';
import {
  trackHealthProfileContinued,
  trackHealthProfileDismissedPrompt,
} from '../utils/healthProfileAnalytics';
import { missingPersonalizationHint } from '../utils/healthProfilePlatform';
import { useHealthProfileCompletion } from '../hooks/useHealthProfileCompletion';
import { PersonalizationSourcesBadge } from './PersonalizationSourcesBadge';
import { ProfilePersonalizationBadge } from './healthProfile/ProfilePlatformIntegration';

type Variant = 'today' | 'labs' | 'reports' | 'live';

type Props = {
  variant: Variant;
  onContinue?: () => void;
  showBadge?: boolean;
};

const liveSuggestion = (section: ProfileSectionId | null | undefined) => {
  if (!section) return c.entryLiveReminder;
  return c.entryLiveBySection[section] || missingPersonalizationHint(section) || c.entryLiveReminder;
};

/**
 * Compact incomplete-profile entry points. Never blocks the host surface.
 * Reuses getCompletion via shared hook so saves refresh indicators automatically.
 */
export const HealthProfileIncompleteNotice: React.FC<Props> = ({
  variant,
  onContinue,
  showBadge = variant === 'labs' || variant === 'reports',
}) => {
  const completionState = useHealthProfileCompletion(true);
  const completion = completionState.percent;
  const recommendedNext = completionState.recommendedNext;
  const [hidden, setHidden] = useState(() =>
    variant === 'today' ? isHealthProfileTodayCardDismissed() : false,
  );
  const [liveAllowed, setLiveAllowed] = useState(
    () => variant !== 'live' || shouldShowHealthProfileLiveReminder(),
  );

  useEffect(() => {
    if (variant !== 'live') return;
    if (completion == null || completion >= 100) return;
    if (!shouldShowHealthProfileLiveReminder()) {
      setLiveAllowed(false);
      return;
    }
    markHealthProfileLiveReminderShown();
    setLiveAllowed(true);
  }, [variant, completion]);

  if (hidden || completion == null || completion >= 100) return null;
  if (variant === 'live' && !liveAllowed) return null;

  const handleContinue = () => {
    trackHealthProfileContinued(variant, completion);
    onContinue?.();
  };

  if (variant === 'today') {
    return (
      <div
        data-testid="health-profile-today-prompt"
        className="rounded-[1.25rem] border border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/70 px-4 py-4 space-y-3"
      >
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {c.entryTodayTitle}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{c.entryTodayBody}</p>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
            {c.entryCompletionLabel}: {completion}%
          </p>
          <div className="flex flex-wrap gap-2">
            {onContinue && (
              <button
                type="button"
                onClick={handleContinue}
                className={MEMBER_CHIP_ACTIVE}
                data-testid="health-profile-continue"
              >
                {c.entryContinueArrow}
              </button>
            )}
            <button
              type="button"
              className={MEMBER_CHIP_INACTIVE}
              onClick={() => {
                dismissHealthProfileTodayCard();
                trackHealthProfileDismissedPrompt('today', completion);
                setHidden(true);
              }}
            >
              {c.entryDismiss}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'live') {
    return (
      <div
        data-testid="health-profile-live-reminder"
        className="px-4 py-2 border-b border-inherit bg-inherit/80 text-center space-y-1"
      >
        <p className="text-[11px] font-medium opacity-80">{liveSuggestion(recommendedNext)}</p>
        <ProfilePersonalizationBadge
          surface="live"
          className="mx-auto max-w-md text-left border-0 bg-transparent px-0 py-1"
        />
        {onContinue && (
          <button
            type="button"
            onClick={handleContinue}
            className="text-[10px] font-black uppercase tracking-[0.12em] text-luna-purple"
          >
            {c.entryUpdateProfile}
          </button>
        )}
      </div>
    );
  }

  const title = variant === 'labs' ? c.entryLabsTitle : null;
  const body = variant === 'labs' ? c.entryLabsNotice : c.entryReportsNotice;
  const hint = missingPersonalizationHint(recommendedNext);
  return (
    <div className="space-y-2">
      <div
        data-testid={`health-profile-${variant}-notice`}
        className="rounded-[1.25rem] border border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="space-y-1 min-w-0">
          {title && (
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300">{body}</p>
          {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        {onContinue && (
          <button
            type="button"
            onClick={handleContinue}
            className={MEMBER_CHIP_ACTIVE}
          >
            {c.entryContinueArrow}
          </button>
        )}
      </div>
      {showBadge && (
        <PersonalizationSourcesBadge
          using={['labs', 'profile']}
          missingSectionIds={[recommendedNext]}
        />
      )}
    </div>
  );
};

export default HealthProfileIncompleteNotice;
