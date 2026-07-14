import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Language } from '../../constants';
import { trackEvent } from '../../services/analyticsService';
import {
  getProfile,
  isProfileUnavailable,
  listFacts,
  PersonalHealthFact,
  PersonalHealthProfile,
  ProfileSectionId,
  putSection,
  confirmFact,
  rejectFact,
  correctFact,
  deleteFact,
} from '../../services/personalHealthProfileService';
import { invalidateHealthProfileCompletionCache } from '../../hooks/useHealthProfileCompletion';
import { trackHealthProfileCompletedSection, trackHealthProfileOpened } from '../../utils/healthProfileAnalytics';
import {
  TRUST_NOTICES,
  formatMonthYear,
  intakeProgress,
  intakeSectionStatus,
  profileImpactMessage,
  statusAttentionLabel,
  statusLabel,
  type IntakeSectionId,
  visibleIntakeSections,
} from '../../utils/healthProfileIntake';
import { IntakeSectionBody } from './HealthProfileIntakeForms';
import {
  DataUsageBlock,
  InformationSourcesBlock,
  ProfileReviewReminder,
  ReportReadinessBlock,
} from './HealthProfileIntelligence';
import { MEMBER_CHIP_ACTIVE, MEMBER_CHIP_INACTIVE } from '../../utils/memberPageStyles';
import { getHealthProfileCopy } from '../../utils/healthProfileCopy';

type Props = { lang: Language };

const completionBucket = (percent: number) =>
  `${Math.min(100, Math.floor(percent / 25) * 25)}_to_${Math.min(100, Math.floor(percent / 25) * 25 + 24)}`;

const factLabel = (fact: PersonalHealthFact) => fact.display_label || fact.fact_key.replace(/_/g, ' ');
const valueText = (fact: PersonalHealthFact) =>
  typeof fact.value_json === 'string' ? fact.value_json : JSON.stringify(fact.value_json);

/**
 * Medical-intake UX for Personal Health Profile.
 * Reuses getProfile / putSection / completion — no API or schema changes.
 */
export const HealthProfileIntake: React.FC<Props> = ({ lang }) => {
  const hp = getHealthProfileCopy(lang);
  const [profile, setProfile] = useState<PersonalHealthProfile | null>(null);
  const [facts, setFacts] = useState<PersonalHealthFact[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState(() => getHealthProfileCopy(lang).informationSaved);
  const [activeId, setActiveId] = useState<IntakeSectionId>('about_you');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ about_you: true });
  const [mobileStep, setMobileStep] = useState(0);
  const [correction, setCorrection] = useState<{ id: string; value: string } | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const refresh = useCallback(async () => {
    setState('loading');
    try {
      const [profileResult, factsResult] = await Promise.all([getProfile(), listFacts({ limit: 40 })]);
      if (isProfileUnavailable(profileResult) || isProfileUnavailable(factsResult)) {
        setState('unavailable');
        return;
      }
      setProfile(profileResult);
      setFacts(factsResult.facts || []);
      setState('ready');
      invalidateHealthProfileCompletionCache();
      trackHealthProfileOpened('profile', Number(profileResult.completion_percent || 0));
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sections = useMemo(() => (profile ? visibleIntakeSections(profile) : []), [profile]);
  const progress = useMemo(() => intakeProgress(profile), [profile]);

  useEffect(() => {
    if (!sections.length) return;
    if (!sections.some((s) => s.id === activeId)) {
      setActiveId(sections[0].id);
      setMobileStep(0);
    }
  }, [sections, activeId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !profile) return;
    const nodes = sections
      .map((s) => sectionRefs.current[s.id])
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          const id = visible.target.id.replace('intake-section-', '') as IntakeSectionId;
          setActiveId(id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.5, 0.8] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections, profile, state]);

  const saveSection = useCallback(
    async (section: ProfileSectionId, data: Record<string, unknown>) => {
      setBusy(true);
      setSaveState('saving');
      try {
        const cleaned = Object.fromEntries(
          Object.entries(data).filter(([, v]) => v !== undefined && v !== ''),
        );
        const result = await putSection(section, cleaned);
        if (isProfileUnavailable(result)) {
          setSaveState('error');
          return false;
        }
        setProfile(result);
        setSaveState('saved');
        setSaveMessage(`Profile Updated. ${profileImpactMessage(section)}`);
        invalidateHealthProfileCompletionCache();
        trackEvent('profile_section_saved', {
          surface: 'profile',
          section_id: section,
          action: 'save',
          result: 'ok',
          completion_bucket: completionBucket(Number(result.completion_percent || 0)),
        });
        trackHealthProfileCompletedSection('profile', Number(result.completion_percent || 0));
        window.setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 2800);
        return true;
      } catch {
        setSaveState('error');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const jumpTo = (id: IntakeSectionId) => {
    setActiveId(id);
    setExpanded((prev) => ({ ...prev, [id]: true }));
    const idx = sections.findIndex((s) => s.id === id);
    if (idx >= 0) setMobileStep(idx);
    const el = sectionRefs.current[id];
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const firstIncomplete = sections.find(
    (s) => s.id !== 'summary' && intakeSectionStatus(s.id, profile) !== 'complete' && intakeSectionStatus(s.id, profile) !== 'ready',
  );

  if (state === 'loading') {
    return (
      <section className="rounded-[1.5rem] border border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/70 p-8" data-testid="health-profile-panel">
        <p className="text-sm text-slate-500">{hp.loading}</p>
      </section>
    );
  }
  if (state === 'unavailable' || state === 'error' || !profile) {
    return (
      <section data-testid="health-profile-unavailable" className="rounded-[1.5rem] border border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/70 p-8 space-y-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{hp.pageHeroTitle}</h2>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {hp.unavailable}
        </p>
      </section>
    );
  }

  const unreviewed = facts.filter((f) => f.trust_state === 'unreviewed');
  const confirmed = facts.filter((f) => f.trust_state === 'confirmed' || f.trust_state === 'corrected');
  const mobileSection = sections[mobileStep] || sections[0];

  return (
    <section data-testid="health-profile-panel" className="space-y-6">
      <header
        data-testid="health-profile-page-hero"
        className="rounded-[1.5rem] border border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/70 px-5 py-6 md:px-7 md:py-7 space-y-5"
      >
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">
            {hp.pageHeroTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {hp.pageHeroBody}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{hp.entryCompletionLabel}</p>
              <p className="mt-0.5 text-3xl font-black tabular-nums text-slate-900 dark:text-slate-50" data-testid="intake-profile-completion">
                {progress.percent}%
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400" data-testid="intake-confidence-value">
              {hp.confidenceLabel} · {progress.confidence}
              {progress.estimatedMinutes > 0 ? ` · ~${progress.estimatedMinutes} ${hp.minLeft}` : ''}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-luna-purple transition-all"
              style={{ width: `${Math.min(100, progress.percent)}%` }}
            />
          </div>
        </div>

        <ProfileReviewReminder profile={profile} />

        {progress.criticalMissing.length > 0 && (
          <div data-testid="intake-missing-critical" className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Still needed</p>
            <div className="flex flex-wrap gap-2">
              {progress.criticalMissing.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={MEMBER_CHIP_INACTIVE}
                  onClick={() => jumpTo(item.jumpTo)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={MEMBER_CHIP_ACTIVE}
            data-testid="intake-continue-profile"
            onClick={() => jumpTo((firstIncomplete?.id || progress.criticalMissing[0]?.jumpTo || 'summary') as IntakeSectionId)}
          >
            Continue
          </button>
          <button
            type="button"
            className={MEMBER_CHIP_INACTIVE}
            data-testid="intake-view-summary"
            onClick={() => jumpTo('summary')}
          >
            Summary
          </button>
        </div>

        {lang !== 'en' && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Health Profile is currently available in English only; other languages are not yet release-ready.
          </p>
        )}
      </header>

      {/* Mobile wizard */}
      <div className="lg:hidden space-y-4" data-testid="intake-mobile-wizard">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Jump to section
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-4 py-3 min-h-[48px]"
            value={mobileSection?.id}
            onChange={(e) => jumpTo(e.target.value as IntakeSectionId)}
            data-testid="intake-jump-select"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.navLabel} — {statusLabel(intakeSectionStatus(s.id, profile))}
              </option>
            ))}
          </select>
        </label>
        {mobileSection && (
          <article className="rounded-[1.5rem] bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 p-5 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{mobileSection.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{mobileSection.explanation}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-luna-purple">
                {statusLabel(intakeSectionStatus(mobileSection.id, profile))}
              </p>
            </div>
            <IntakeSectionBody
              id={mobileSection.id}
              profile={profile}
              busy={busy}
              onSave={saveSection}
              onSavedLocal={setProfile}
              onJump={jumpTo}
              onFinishLater={() => jumpTo('summary')}
            />
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className={MEMBER_CHIP_INACTIVE}
                disabled={mobileStep <= 0}
                data-testid="intake-prev"
                onClick={() => {
                  const next = Math.max(0, mobileStep - 1);
                  setMobileStep(next);
                  jumpTo(sections[next].id);
                }}
              >
                Previous
              </button>
              <button
                type="button"
                className={MEMBER_CHIP_ACTIVE}
                disabled={mobileStep >= sections.length - 1}
                data-testid="intake-next"
                onClick={() => {
                  const next = Math.min(sections.length - 1, mobileStep + 1);
                  setMobileStep(next);
                  jumpTo(sections[next].id);
                }}
              >
                Next
              </button>
            </div>
          </article>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:grid lg:grid-cols-[220px_minmax(0,1fr)] gap-6 items-start">
        <nav
          className="sticky top-24 space-y-0.5 rounded-[1.25rem] bg-white/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 p-2.5"
          aria-label={hp.pageHeroTitle}
          data-testid="intake-desktop-nav"
        >
          {sections.map((s) => {
            const status = intakeSectionStatus(s.id, profile);
            const active = activeId === s.id;
            const done = status === 'complete' || status === 'ready';
            return (
              <button
                key={s.id}
                type="button"
                data-testid={`intake-nav-${s.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => jumpTo(s.id)}
                className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors min-h-[44px] ${
                  active
                    ? 'bg-luna-purple/15 text-luna-purple font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="block text-sm leading-snug">{s.navLabel}</span>
                  <span className={`text-[10px] font-semibold tabular-nums shrink-0 ${done ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-60'}`}>
                    {done ? '✓' : '·'}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-3" data-testid="intake-desktop-sections">
          {sections.map((s) => {
            const status = intakeSectionStatus(s.id, profile);
            const isOpen = expanded[s.id] ?? s.id === activeId;
            const done = status === 'complete' || status === 'ready';
            return (
              <article
                key={s.id}
                id={`intake-section-${s.id}`}
                ref={(el) => {
                  sectionRefs.current[s.id] = el;
                }}
                className="rounded-[1.25rem] bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 overflow-hidden"
                data-testid={`intake-section-${s.id}`}
              >
                <button
                  type="button"
                  className="w-full text-left px-5 py-4 flex flex-wrap items-center justify-between gap-3 min-h-[52px]"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded((prev) => ({ ...prev, [s.id]: !isOpen }))}
                >
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{s.title}</h3>
                    {!isOpen && (
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{s.explanation}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[10px] font-black uppercase tracking-[0.12em] ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-luna-purple'}`}>
                      {done ? `✓ ${statusLabel(status)}` : statusAttentionLabel(status)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{isOpen ? 'Collapse' : 'Edit'}</p>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{s.explanation}</p>
                    <IntakeSectionBody
                      id={s.id}
                      profile={profile}
                      busy={busy}
                      onSave={saveSection}
                      onSavedLocal={setProfile}
                      onJump={jumpTo}
                      onFinishLater={() => jumpTo('summary')}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Sticky save indicator */}
      <div
        className="sticky bottom-20 lg:bottom-6 z-20 flex justify-end pointer-events-none"
        aria-live="polite"
      >
        <div
          data-testid="intake-save-indicator"
          className={`pointer-events-auto max-w-sm rounded-2xl px-4 py-2.5 text-xs font-semibold leading-snug shadow-lg ${
            saveState === 'saving'
              ? 'bg-amber-500 text-white'
              : saveState === 'saved'
                ? 'bg-emerald-600 text-white'
                : saveState === 'error'
                  ? 'bg-rose-500 text-white'
                  : 'hidden'
          }`}
        >
          {saveState === 'saving'
            ? 'Saving…'
            : saveState === 'saved'
              ? saveMessage
              : saveState === 'error'
                ? 'Could not save. Please try again.'
                : null}
        </div>
      </div>

      {/* Facts review */}
      <div className="rounded-[1.25rem] bg-white/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">Needs your review</h3>
          <p className="mt-1 text-sm text-slate-500">Confirm, correct, or reject items Luna suggested.</p>
        </div>
        {unreviewed.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing needs review.</p>
        ) : (
          <ul className="space-y-2">
            {unreviewed.slice(0, 12).map((fact) => (
              <li key={fact.id} className="rounded-xl border border-slate-200/70 dark:border-slate-700 px-3 py-3">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {factLabel(fact)}: {valueText(fact)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="text-xs font-bold text-emerald-600" disabled={busy} onClick={() => void confirmFact(fact.id).then(refresh)}>
                    Confirm
                  </button>
                  <button type="button" className="text-xs font-bold text-rose-500" disabled={busy} onClick={() => void rejectFact(fact.id).then(refresh)}>
                    Reject
                  </button>
                  <button type="button" className="text-xs font-bold text-luna-purple" onClick={() => setCorrection({ id: fact.id, value: valueText(fact) })}>
                    Correct
                  </button>
                  <button type="button" className="text-xs font-bold text-slate-500" disabled={busy} onClick={() => void deleteFact(fact.id).then(refresh)}>
                    Delete
                  </button>
                </div>
                {correction?.id === fact.id && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-2 py-1 text-sm"
                      value={correction.value}
                      onChange={(e) => setCorrection({ id: fact.id, value: e.target.value })}
                      aria-label={`Correct ${factLabel(fact)}`}
                    />
                    <button
                      type="button"
                      className={MEMBER_CHIP_ACTIVE}
                      disabled={busy}
                      onClick={() =>
                        void correctFact(fact.id, { value_json: correction.value }).then(() => {
                          setCorrection(null);
                          return refresh();
                        })
                      }
                    >
                      Save correction
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {confirmed.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Confirmed</h3>
            <ul className="mt-2 space-y-1.5">
              {confirmed.slice(0, 12).map((fact) => (
                <li key={fact.id} className="text-sm text-slate-600 dark:text-slate-300">
                  {factLabel(fact)}: {valueText(fact)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Trust & readiness — secondary, after the work */}
      <div className="grid gap-3 md:grid-cols-2">
        <DataUsageBlock />
        <ReportReadinessBlock profile={profile} />
        <InformationSourcesBlock profile={profile} facts={facts} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{TRUST_NOTICES.hero}</p>
      <div className="flex flex-wrap gap-3 text-xs pb-2">
        <a href="/privacy" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
          Privacy Policy
        </a>
        <a href="/data-rights" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
          Data Protection
        </a>
      </div>
      <span className="sr-only" data-testid="intake-last-confirmed">
        {formatMonthYear(profile.updated_at)}
      </span>
    </section>
  );
};

export default HealthProfileIntake;
