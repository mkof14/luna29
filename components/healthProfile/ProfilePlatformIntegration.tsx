import React from 'react';
import type { ProfileSectionId } from '../../services/personalHealthProfileService';
import type { PersonalHealthProfileLike } from '../../utils/healthProfileIntake';
import {
  missingPersonalizationHint,
  personalizationHeadline,
  platformModuleReadiness,
  profileHasMedicalHistory,
  profileHasMedications,
  reportAttributionFromProfile,
  type ProfileContextLike,
} from '../../utils/healthProfilePlatform';
import { useHealthProfileCompletion } from '../../hooks/useHealthProfileCompletion';

const cardClass =
  'rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/40 px-4 py-3';

type BadgeProps = {
  profile?: PersonalHealthProfileLike | null;
  surface?: 'labs' | 'reports' | 'live' | 'medications' | 'general';
  className?: string;
  recommendedNext?: ProfileSectionId | null;
  completionPercent?: number | null;
};

/** Consistent personalization indicator for health modules. */
export const ProfilePersonalizationBadge: React.FC<BadgeProps> = ({
  profile = null,
  surface = 'general',
  className = '',
  recommendedNext = null,
  completionPercent = null,
}) => {
  const completion = useHealthProfileCompletion(completionPercent == null);
  const percent = completionPercent ?? completion.percent;
  const next = recommendedNext ?? completion.recommendedNext;
  const headline = personalizationHeadline({
    completionPercent: percent,
    hasMedications: profileHasMedications(profile),
    hasMedicalHistory: profileHasMedicalHistory(profile),
    hasProfile: (percent ?? 0) > 0,
  });
  const hint = missingPersonalizationHint(next);

  return (
    <div
      data-testid={`profile-personalization-badge-${surface}`}
      className={`${cardClass} text-[11px] text-slate-600 dark:text-slate-300 space-y-1 ${className}`}
    >
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{headline}</p>
      {hint && percent != null && percent < 100 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
};

export const ModuleReadinessPanel: React.FC<{
  profile: PersonalHealthProfileLike | null;
  className?: string;
}> = ({ profile, className = '' }) => {
  const items = platformModuleReadiness(profile);
  return (
    <div data-testid="module-readiness-panel" className={`${cardClass} space-y-2 ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Module Readiness</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.label}</span>
            <span className="text-xs text-slate-500">{item.status}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-500">Informational only — never blocks your workflow.</p>
    </div>
  );
};

export const ReportAttributionBlock: React.FC<{
  profile: PersonalHealthProfileLike | null;
  context?: ProfileContextLike | null;
  className?: string;
}> = ({ profile, context = null, className = '' }) => {
  const labels = reportAttributionFromProfile(profile, context);
  if (!labels.length) return null;
  return (
    <div data-testid="report-attribution" className={`${cardClass} ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Based on</p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{labels.join(' · ')}</p>
    </div>
  );
};

export const FutureConnectionsBlock: React.FC<{ className?: string }> = () => null;
