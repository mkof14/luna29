import React from 'react';
import type { PersonalHealthProfile, PersonalHealthFact } from '../../services/personalHealthProfileService';
import {
  DATA_USAGE,
  REVIEW_REMINDER,
  lastConfirmedLabel,
  listInformationSources,
  needsProfileReview,
  profileConfidence,
  reportReadiness,
  type ProfileConfidence,
} from '../../utils/healthProfileIntake';

const cardClass =
  'rounded-[1.25rem] bg-white/90 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 px-4 py-3';

const LegalLinks: React.FC<{ includeHowUsed?: boolean }> = ({ includeHowUsed }) => (
  <div className="flex flex-wrap gap-3 text-xs">
    <a href="/privacy" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
      Privacy Policy
    </a>
    <a href="/data-rights" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
      Data Protection
    </a>
    {includeHowUsed && (
      <a href="/privacy" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
        How information is used
      </a>
    )}
  </div>
);

export const ProfileConfidenceBlock: React.FC<{
  profile: PersonalHealthProfile;
  facts?: PersonalHealthFact[];
}> = ({ profile, facts = [] }) => {
  const confidence: ProfileConfidence = profileConfidence(profile);
  return (
    <div className="grid grid-cols-2 gap-3" data-testid="intake-profile-confidence">
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Profile Confidence</p>
        <p className="mt-1 text-2xl font-black" data-testid="intake-confidence-value">
          {confidence}
        </p>
      </div>
      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Last Confirmed</p>
        <p className="mt-1 text-lg font-black" data-testid="intake-last-confirmed">
          {lastConfirmedLabel(profile, facts)}
        </p>
      </div>
    </div>
  );
};

export const ProfileReviewReminder: React.FC<{ profile: PersonalHealthProfile }> = ({ profile }) => {
  if (!needsProfileReview(profile)) return null;
  return (
    <p
      data-testid="intake-review-reminder"
      className="text-sm text-slate-600 dark:text-slate-300 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 px-4 py-3"
    >
      {REVIEW_REMINDER}
    </p>
  );
};

export const DataUsageBlock: React.FC = () => (
  <div className={cardClass} data-testid="intake-data-usage">
    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{DATA_USAGE.title}</p>
    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{DATA_USAGE.body}</p>
    <div className="mt-3">
      <LegalLinks includeHowUsed />
    </div>
  </div>
);

export const InformationSourcesBlock: React.FC<{
  profile: PersonalHealthProfile;
  facts?: PersonalHealthFact[];
}> = ({ profile, facts = [] }) => {
  const sources = listInformationSources(profile, facts);
  if (!sources.length) return null;
  return (
    <div className={cardClass} data-testid="intake-information-sources">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Information sources</p>
      <ul className="mt-2 space-y-1.5">
        {sources.map((source) => (
          <li key={source.id} className="text-sm text-slate-600 dark:text-slate-300">
            <span aria-hidden className="mr-1.5 text-emerald-600">
              ✓
            </span>
            {source.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ReportReadinessBlock: React.FC<{ profile: PersonalHealthProfile }> = ({ profile }) => {
  const items = reportReadiness(profile);
  return (
    <div className={cardClass} data-testid="intake-report-readiness">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Report readiness</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Hidden for Closed Paid Beta — no Coming Soon placeholders in member UI. */
export const EmergencyHealthCardPlaceholder: React.FC = () => null;

export const FutureIntegrationsBlock: React.FC = () => null;
