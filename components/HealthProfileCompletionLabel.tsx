import React from 'react';
import { getHealthProfileCopy } from '../utils/healthProfileCopy';
import type { Language } from '../constants';

type Props = {
  percent: number | null | undefined;
  /** Compact nav style: "● 82%" */
  compact?: boolean;
  className?: string;
  lang?: Language;
};

/** Displays the server completion score — never invents a second score. */
export const HealthProfileCompletionLabel: React.FC<Props> = ({
  percent,
  compact = false,
  className = '',
  lang,
}) => {
  const c = getHealthProfileCopy(lang);
  if (percent == null || !Number.isFinite(percent)) return null;
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  if (compact) {
    return (
      <span className={className || 'text-[9px] font-bold tabular-nums opacity-80'} data-testid="health-profile-nav-completion">
        ● {value}%
      </span>
    );
  }
  return (
    <span className={className || 'text-sm font-bold tabular-nums'} data-testid="health-profile-completion-label">
      {value}% {c.entryNavCompleteSuffix}
    </span>
  );
};

export default HealthProfileCompletionLabel;
