import React from 'react';
import { HEALTH_PROFILE_COPY as c } from '../utils/healthProfileCopy';
import type { ProfileSectionId } from '../services/personalHealthProfileService';

export type PersonalizationSource = keyof typeof c.badgeSources;

type Props = {
  using?: PersonalizationSource[];
  missingSectionIds?: Array<ProfileSectionId | string | null | undefined>;
  className?: string;
};

/**
 * Subtle informative personalization context — never a warning.
 */
export const PersonalizationSourcesBadge: React.FC<Props> = ({
  using = ['labs', 'profile', 'timeline', 'memory', 'today'],
  missingSectionIds = [],
  className = '',
}) => {
  const missingLabels = Array.from(
    new Set(
      missingSectionIds
        .filter(Boolean)
        .map((id) => c.missingLabels[String(id)] || c.sections[id as keyof typeof c.sections] || null)
        .filter((label): label is string => Boolean(label)),
    ),
  ).slice(0, 3);

  return (
    <div
      data-testid="personalization-sources-badge"
      className={`rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/40 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 ${className}`}
    >
      <p>
        <span className="font-black uppercase tracking-[0.12em] text-slate-500 mr-2">{c.badgeUsing}:</span>
        {using.map((key) => (
          <span key={key} className="mr-2 inline-flex items-center gap-1">
            <span aria-hidden>✓</span>
            {c.badgeSources[key]}
          </span>
        ))}
      </p>
      {missingLabels.length > 0 && (
        <p>
          <span className="font-black uppercase tracking-[0.12em] text-slate-500 mr-2">{c.badgeMissing}:</span>
          {missingLabels.join(' · ')}
        </p>
      )}
    </div>
  );
};

export default PersonalizationSourcesBadge;
