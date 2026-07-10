import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Language } from '../constants';
import { trackEvent } from '../services/analyticsService';
import {
  confirmFact,
  correctFact,
  deleteFact,
  getProfile,
  isProfileUnavailable,
  listFacts,
  PersonalHealthFact,
  PersonalHealthProfile,
  ProfileSectionId,
  putSection,
  rejectFact,
} from '../services/personalHealthProfileService';
import { HEALTH_PROFILE_COPY as c, HealthProfileSection } from '../utils/healthProfileCopy';
import { MEMBER_CHIP_ACTIVE, MEMBER_CHIP_INACTIVE } from '../utils/memberPageStyles';

type Props = { lang: Language };
type WizardStep = 'about' | 'body' | 'sex' | 'goals' | 'condition' | 'medications' | 'womens';

const sectionIds: HealthProfileSection[] = [
  'about', 'body', 'health_history', 'medications', 'sleep', 'nutrition',
  'activity', 'stress', 'womens_health', 'goals', 'care_context', 'data_sources',
];

const completionBucket = (percent: number) => `${Math.min(100, Math.floor(percent / 25) * 25)}_to_${Math.min(100, Math.floor(percent / 25) * 25 + 24)}`;
const factLabel = (fact: PersonalHealthFact) => fact.display_label || fact.fact_key.replace(/_/g, ' ');
const valueText = (fact: PersonalHealthFact) =>
  typeof fact.value_json === 'string' ? fact.value_json : JSON.stringify(fact.value_json);

export const HealthProfilePanel: React.FC<Props> = ({ lang }) => {
  const [profile, setProfile] = useState<PersonalHealthProfile | null>(null);
  const [facts, setFacts] = useState<PersonalHealthFact[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>('loading');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<ProfileSectionId | null>(null);
  const [correction, setCorrection] = useState<{ id: string; value: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const completion = Number(profile?.completion_percent || 0);

  const refresh = useCallback(async () => {
    setState('loading');
    try {
      const [profileResult, factsResult] = await Promise.all([getProfile(), listFacts({ limit: 40 })]);
      if (isProfileUnavailable(profileResult) || isProfileUnavailable(factsResult)) {
        setState('unavailable');
        return;
      }
      setProfile(profileResult);
      setFacts(Array.isArray(factsResult.facts) ? factsResult.facts : []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (state === 'ready') {
      trackEvent('profile_section_viewed', { surface: 'profile', section_id: 'overview', action: 'view', result: 'ok', completion_bucket: completionBucket(completion) });
    }
  }, [state, completion]);

  const wizardSteps = useMemo<WizardStep[]>(() => {
    const steps: WizardStep[] = ['about', 'body', 'sex', 'goals', 'condition', 'medications'];
    if (draft.biological_sex === 'female' || profile?.sections?.about?.biological_sex === 'female') steps.push('womens');
    return steps;
  }, [draft.biological_sex, profile]);
  const step = wizardSteps[stepIndex] || 'about';

  const saveSection = async (section: ProfileSectionId, payload: Record<string, unknown>, action = 'save') => {
    setBusy(true);
    try {
      const result = await putSection(section, payload);
      if (isProfileUnavailable(result)) { setState('unavailable'); return false; }
      setProfile(result);
      trackEvent('profile_section_saved', { surface: 'profile', section_id: section, action, result: 'ok', completion_bucket: completionBucket(Number(result.completion_percent || completion)) });
      if (Number(result.completion_percent || 0) !== completion) {
        trackEvent('profile_completion_changed', { surface: 'profile', section_id: section, action: 'completion_changed', result: 'ok', completion_bucket: completionBucket(Number(result.completion_percent || 0)) });
      }
      return true;
    } catch {
      trackEvent('profile_section_saved', { surface: 'profile', section_id: section, action, result: 'error', completion_bucket: completionBucket(completion) });
      return false;
    } finally { setBusy(false); }
  };

  const saveWizardStep = async (skip = false) => {
    const payloads: Record<WizardStep, [ProfileSectionId, Record<string, unknown>]> = {
      about: ['about', { date_of_birth: draft.date_of_birth, country: draft.country, timezone: draft.timezone }],
      body: ['body', { height_cm: draft.height_cm || null, weight_kg: draft.weight_kg || null }],
      sex: ['about', { biological_sex: draft.biological_sex || '' }],
      goals: ['goals', { primary_goal: draft.primary_goal }],
      condition: ['health_history', { has_significant_condition: draft.has_significant_condition }],
      medications: ['medications', { takes_daily_medication: draft.takes_daily_medication }],
      womens: ['womens_health', { applicable: draft.womens_applicable || 'yes', cycle_status: draft.cycle_status || '' }],
    };
    if (!skip) await saveSection(...payloads[step], 'wizard');
    else trackEvent('profile_question_skipped', { surface: 'profile', section_id: payloads[step][0], action: 'skip', result: 'ok', completion_bucket: completionBucket(completion) });
    if (stepIndex >= wizardSteps.length - 1) {
      setWizardOpen(false);
      await refresh();
      return;
    }
    setStepIndex((n) => n + 1);
  };

  const openWizard = () => {
    setStepIndex(0);
    setDraft({});
    setWizardOpen(true);
    trackEvent('profile_started', { surface: 'profile', section_id: 'setup', action: 'start', result: 'ok', completion_bucket: completionBucket(completion) });
  };

  const handleFact = async (fact: PersonalHealthFact, action: 'confirm' | 'reject' | 'delete' | 'correct') => {
    setBusy(true);
    try {
      if (action === 'confirm') await confirmFact(fact.id);
      if (action === 'reject') await rejectFact(fact.id);
      if (action === 'delete') await deleteFact(fact.id);
      if (action === 'correct' && correction) await correctFact(fact.id, { value_json: correction.value });
      const event = action === 'confirm' ? 'profile_fact_confirmed' : action === 'reject' ? 'profile_fact_rejected' : 'profile_fact_corrected';
      if (action !== 'delete') trackEvent(event, { surface: 'profile', section_id: fact.section, action, result: 'ok', completion_bucket: completionBucket(completion) });
      setCorrection(null);
      await refresh();
    } catch {
      // Keep the profile view usable; a future refresh may recover.
    } finally { setBusy(false); }
  };

  if (state === 'loading') return <section className="luna-vivid-surface p-6 rounded-[2rem]"><p className="text-sm text-slate-500">Loading Health Profile…</p></section>;
  if (state === 'unavailable' || state === 'error') return <section data-testid="health-profile-unavailable" className="luna-vivid-surface p-6 rounded-[2rem]"><h2 className="text-lg font-black">Health Profile</h2><p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{c.unavailable}</p></section>;

  const unreviewed = facts.filter((fact) => fact.trust_state === 'unreviewed');
  const confirmed = facts.filter((fact) => fact.trust_state === 'confirmed' || fact.trust_state === 'corrected');
  const editSection = editing ? profile?.sections?.[editing] || {} : {};

  return (
    <section data-testid="health-profile-panel" className="luna-vivid-surface p-6 md:p-8 rounded-[2rem] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">Personal Health Profile</p>
          <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">{c.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{c.setupBody}</p>
        </div>
        <button type="button" onClick={openWizard} className={MEMBER_CHIP_ACTIVE}>{c.continue}</button>
      </div>
      {lang !== 'en' && <p className="text-xs text-amber-700 dark:text-amber-300">{c.englishOnly}</p>}
      <div className="rounded-2xl border border-luna-purple/20 bg-luna-purple/5 p-4">
        <div className="flex justify-between text-sm font-bold"><span>Profile completion</span><span>{completion}%</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full bg-luna-purple" style={{ width: `${completion}%` }} /></div>
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{completion >= 60 ? c.readyBasic : completion >= 30 ? c.addSleep : c.reviewMedications}</p>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{c.safety} {c.memoryOff}</p>

      {wizardOpen && <div className="rounded-2xl border border-luna-purple/25 p-4 space-y-4" data-testid="health-profile-wizard">
        <div><p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">Setup {stepIndex + 1} of {wizardSteps.length}</p><h3 className="font-black">{step === 'about' ? 'A little about you' : step === 'body' ? 'Body basics (optional)' : step === 'sex' ? 'Biological sex (optional)' : step === 'goals' ? 'Your primary goal' : step === 'condition' ? 'Significant health condition?' : step === 'medications' ? 'Daily medication?' : "Women's health (optional)"}</h3></div>
        {step === 'about' && <div className="grid gap-2 sm:grid-cols-3"><input type="date" aria-label="Date of birth" value={draft.date_of_birth || ''} onChange={(e) => setDraft({ ...draft, date_of_birth: e.target.value })} className="luna-vivid-chip rounded-xl p-3" /><input aria-label="Country" placeholder="Country" value={draft.country || ''} onChange={(e) => setDraft({ ...draft, country: e.target.value })} className="luna-vivid-chip rounded-xl p-3" /><input aria-label="Timezone" placeholder="Timezone" value={draft.timezone || ''} onChange={(e) => setDraft({ ...draft, timezone: e.target.value })} className="luna-vivid-chip rounded-xl p-3" /><p className="sm:col-span-3 text-xs text-slate-500">{c.whyDob}</p></div>}
        {step === 'body' && <div className="grid gap-2 sm:grid-cols-2"><input type="number" placeholder="Height (cm)" value={draft.height_cm || ''} onChange={(e) => setDraft({ ...draft, height_cm: e.target.value })} className="luna-vivid-chip rounded-xl p-3" /><input type="number" placeholder="Weight (kg)" value={draft.weight_kg || ''} onChange={(e) => setDraft({ ...draft, weight_kg: e.target.value })} className="luna-vivid-chip rounded-xl p-3" /></div>}
        {step === 'sex' && <div className="space-y-2"><select aria-label="Biological sex" value={draft.biological_sex || ''} onChange={(e) => setDraft({ ...draft, biological_sex: e.target.value })} className="luna-vivid-chip rounded-xl p-3"><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="intersex">Intersex</option></select><p className="text-xs text-slate-500">{c.whyCycle}</p></div>}
        {step === 'goals' && <input aria-label="Primary goal" placeholder="What would you like Luna to help you understand?" value={draft.primary_goal || ''} onChange={(e) => setDraft({ ...draft, primary_goal: e.target.value })} className="w-full luna-vivid-chip rounded-xl p-3" />}
        {step === 'condition' && <YesNo value={draft.has_significant_condition} onChange={(value) => setDraft({ ...draft, has_significant_condition: value })} />}
        {step === 'medications' && <div><YesNo value={draft.takes_daily_medication} onChange={(value) => setDraft({ ...draft, takes_daily_medication: value })} /><p className="mt-2 text-xs text-slate-500">{c.whyMedications}</p></div>}
        {step === 'womens' && <div className="space-y-2"><YesNo value={draft.womens_applicable} onChange={(value) => setDraft({ ...draft, womens_applicable: value })} /><input placeholder="Cycle status (optional)" value={draft.cycle_status || ''} onChange={(e) => setDraft({ ...draft, cycle_status: e.target.value })} className="w-full luna-vivid-chip rounded-xl p-3" /></div>}
        <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void saveWizardStep()} className={MEMBER_CHIP_ACTIVE}>{c.saveContinue}</button><button type="button" disabled={busy} onClick={() => void saveWizardStep(true)} className={MEMBER_CHIP_INACTIVE}>{c.skip}</button>{stepIndex > 0 && <button type="button" onClick={() => setStepIndex((n) => n - 1)} className={MEMBER_CHIP_INACTIVE}>{c.back}</button>}<button type="button" onClick={() => setWizardOpen(false)} className="px-3 text-xs font-bold text-slate-500">{c.exitLater}</button></div>
      </div>}

      <div><h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">Profile sections</h3><div className="flex flex-wrap gap-2">{sectionIds.map((id) => <button key={id} type="button" onClick={() => { setEditing(id); trackEvent('profile_section_viewed', { surface: 'profile', section_id: id, action: 'edit', result: 'ok', completion_bucket: completionBucket(completion) }); }} className={MEMBER_CHIP_INACTIVE}>{c.sections[id]} · {profile?.sections?.[id] ? c.edit : 'Add'}</button>)}</div></div>
      {editing && <SectionEditor section={editing} initial={editSection} busy={busy} onCancel={() => setEditing(null)} onSave={async (payload) => { if (await saveSection(editing, payload)) { setEditing(null); await refresh(); } }} />}

      <FactList title={c.needsReview} facts={unreviewed} empty={c.noReview} busy={busy} correction={correction} setCorrection={setCorrection} onAction={handleFact} />
      <FactList title={c.confirmedFacts} facts={confirmed} empty={c.noConfirmed} busy={busy} correction={correction} setCorrection={setCorrection} onAction={handleFact} />
    </section>
  );
};

const YesNo = ({ value, onChange }: { value?: string; onChange: (value: string) => void }) => <div className="flex gap-2">{['yes', 'no'].map((choice) => <button key={choice} type="button" onClick={() => onChange(choice)} className={value === choice ? MEMBER_CHIP_ACTIVE : MEMBER_CHIP_INACTIVE}>{choice === 'yes' ? 'Yes' : 'No'}</button>)}</div>;

const SectionEditor = ({ section, initial, busy, onCancel, onSave }: { section: ProfileSectionId; initial: Record<string, unknown>; busy: boolean; onCancel: () => void; onSave: (value: Record<string, unknown>) => void }) => {
  const fields: Partial<Record<ProfileSectionId, Array<[string, string]>>> = {
    about: [['country', 'Country'], ['timezone', 'Timezone']], body: [['height_cm', 'Height (cm)'], ['weight_kg', 'Weight (kg)']],
    health_history: [['has_significant_condition', 'Significant condition (yes/no)']], medications: [['takes_daily_medication', 'Daily medication (yes/no)']],
    sleep: [['average_hours', 'Average sleep hours']], nutrition: [['eating_pattern', 'Eating pattern']], activity: [['activity_level', 'Activity level']],
    stress: [['general_level', 'General stress level']], womens_health: [['cycle_status', 'Cycle status']], goals: [['primary_goal', 'Primary goal']],
    care_context: [['primary_clinician', 'Primary clinician']], data_sources: [['notes', 'Notes']],
  };
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries((fields[section] || []).map(([key]) => [key, String(initial[key] ?? '')])));
  return <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3"><h3 className="font-black">{c.sections[section as HealthProfileSection]}</h3>{(fields[section] || []).map(([key, label]) => <label key={key} className="block text-xs font-bold text-slate-600 dark:text-slate-300">{label}<input value={values[key] || ''} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className="mt-1 w-full luna-vivid-chip rounded-xl p-3" /></label>)}<div className="flex gap-2"><button type="button" disabled={busy} onClick={() => onSave(values)} className={MEMBER_CHIP_ACTIVE}>Save</button><button type="button" onClick={onCancel} className={MEMBER_CHIP_INACTIVE}>Cancel</button></div></div>;
};

const FactList = ({ title, facts, empty, busy, correction, setCorrection, onAction }: { title: string; facts: PersonalHealthFact[]; empty: string; busy: boolean; correction: { id: string; value: string } | null; setCorrection: (value: { id: string; value: string } | null) => void; onAction: (fact: PersonalHealthFact, action: 'confirm' | 'reject' | 'delete' | 'correct') => void }) => <div><h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">{title}</h3>{facts.length === 0 ? <p className="text-sm text-slate-500">{empty}</p> : <ul className="space-y-2">{facts.slice(0, 12).map((fact) => <li key={fact.id} className="rounded-xl border border-slate-200/70 dark:border-slate-700 p-3"><p className="text-sm font-semibold">{factLabel(fact)}: {valueText(fact)}</p>{correction?.id === fact.id ? <div className="mt-2 flex flex-wrap gap-2"><input aria-label={`Correct ${factLabel(fact)}`} value={correction.value} onChange={(e) => setCorrection({ id: fact.id, value: e.target.value })} className="luna-vivid-chip rounded-lg p-2 text-sm" /><button type="button" disabled={busy} onClick={() => onAction(fact, 'correct')} className={MEMBER_CHIP_ACTIVE}>Save correction</button></div> : <div className="mt-2 flex flex-wrap gap-2">{fact.trust_state === 'unreviewed' && <><button type="button" disabled={busy} onClick={() => onAction(fact, 'confirm')} className="text-xs font-bold text-emerald-600">Confirm</button><button type="button" disabled={busy} onClick={() => onAction(fact, 'reject')} className="text-xs font-bold text-rose-500">Reject</button><button type="button" onClick={() => setCorrection({ id: fact.id, value: valueText(fact) })} className="text-xs font-bold text-luna-purple">Correct</button></>}<button type="button" disabled={busy} onClick={() => onAction(fact, 'delete')} className="text-xs font-bold text-slate-500">Delete</button></div>}</li>)}</ul>}</div>;

export default HealthProfilePanel;
