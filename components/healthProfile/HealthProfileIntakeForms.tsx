import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  PersonalHealthProfile,
  ProfileSectionId,
} from '../../services/personalHealthProfileService';
import {
  FAMILY_RELATIONS,
  HEALTH_GOAL_OPTIONS,
  INTAKE_SECTIONS,
  MEDICAL_CONDITION_OPTIONS,
  NONE_ALLERGIES_LABEL,
  NONE_SURGERIES_LABEL,
  TRUST_NOTICES,
  type IntakeSectionId,
  buildHealthTimeline,
  formatMonthYear,
  groupTimelineByYear,
  intakeProgress,
  intakeSectionStatus,
  isWomensHealthApplicable,
  mergeHealthHistory,
  statusLabel,
  visibleIntakeSections,
} from '../../utils/healthProfileIntake';
import {
  DataUsageBlock,
  EmergencyHealthCardPlaceholder,
  FutureIntegrationsBlock,
  InformationSourcesBlock,
  ReportReadinessBlock,
} from './HealthProfileIntelligence';

type SaveFn = (section: ProfileSectionId, data: Record<string, unknown>) => Promise<boolean>;

type FormProps = {
  profile: PersonalHealthProfile;
  busy: boolean;
  onSave: SaveFn;
  onSavedLocal: (next: PersonalHealthProfile) => void;
};

const fieldClass =
  'w-full rounded-xl border border-slate-200/90 dark:border-slate-600/70 bg-white dark:bg-slate-950/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-luna-purple/30 focus:border-luna-purple/40 min-h-[48px]';
const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5';
const helpClass = 'text-xs text-slate-500 dark:text-slate-400 mt-1';
const chipActive =
  'px-3 py-2 rounded-full text-xs font-bold bg-luna-purple text-white min-h-[40px]';
const chipIdle =
  'px-3 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 min-h-[40px]';

const sec = (profile: PersonalHealthProfile, id: ProfileSectionId) =>
  ({ ...(profile.sections?.[id] || {}) }) as Record<string, unknown>;

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export const WhyAsk: React.FC<{ text: string }> = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-luna-purple min-h-[40px]"
        aria-label="Why are we asking this?"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
      >
        <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 text-[10px]">
          ⓘ
        </span>
        Why are we asking this?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1 w-[min(20rem,80vw)] rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
};

export const AboutYouForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const about = sec(profile, 'about');
  const body = sec(profile, 'body');
  const [draft, setDraft] = useState({
    preferred_name: String(about.preferred_name || ''),
    last_name: String((about as { last_name?: string }).last_name || ''),
    date_of_birth: String(about.date_of_birth || ''),
    biological_sex: String(about.biological_sex || ''),
    preferred_language: String(about.preferred_language || ''),
    country: String(about.country || ''),
    timezone: String(about.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
    height_cm: body.height_cm != null ? String(body.height_cm) : '',
    weight_kg: body.weight_kg != null ? String(body.weight_kg) : '',
  });

  // last_name is UI-only — store in preferred_name as "First Last" if both set, or keep preferred_name
  const persist = async () => {
    const preferred =
      draft.last_name.trim()
        ? `${draft.preferred_name.trim()} ${draft.last_name.trim()}`.trim()
        : draft.preferred_name.trim();
    const aboutPayload: Record<string, unknown> = {
      ...about,
      preferred_name: preferred || draft.preferred_name,
      date_of_birth: draft.date_of_birth || undefined,
      biological_sex: draft.biological_sex || undefined,
      preferred_language: draft.preferred_language || undefined,
      country: draft.country || undefined,
      timezone: draft.timezone || undefined,
    };
    const bodyPayload: Record<string, unknown> = {
      ...body,
      height_cm: draft.height_cm ? Number(draft.height_cm) : undefined,
      weight_kg: draft.weight_kg ? Number(draft.weight_kg) : undefined,
    };
    const okAbout = await onSave('about', aboutPayload);
    const okBody = await onSave('body', bodyPayload);
    if (okAbout || okBody) {
      onSavedLocal({
        ...profile,
        sections: {
          ...profile.sections,
          about: aboutPayload,
          body: bodyPayload,
        },
      });
    }
  };

  return (
    <div className="space-y-4" data-testid="intake-form-about_you">
      <p className="text-xs text-slate-500 dark:text-slate-400">{TRUST_NOTICES.hero}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>First Name</span>
          <input
            className={fieldClass}
            value={draft.preferred_name}
            onChange={(e) => setDraft({ ...draft, preferred_name: e.target.value })}
            onBlur={() => void persist()}
            disabled={busy}
            autoComplete="given-name"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Last Name</span>
          <input
            className={fieldClass}
            value={draft.last_name}
            onChange={(e) => setDraft({ ...draft, last_name: e.target.value })}
            onBlur={() => void persist()}
            disabled={busy}
            autoComplete="family-name"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Date of Birth</span>
          <input
            type="date"
            className={fieldClass}
            value={draft.date_of_birth}
            onChange={(e) => setDraft({ ...draft, date_of_birth: e.target.value })}
            onBlur={() => void persist()}
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Sex</span>
          <select
            className={fieldClass}
            value={draft.biological_sex}
            onChange={(e) => {
              const next = { ...draft, biological_sex: e.target.value };
              setDraft(next);
              void (async () => {
                await onSave('about', { ...about, biological_sex: e.target.value || undefined });
              })();
            }}
            disabled={busy}
          >
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="intersex">Intersex</option>
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Height (cm)</span>
          <input
            type="number"
            className={fieldClass}
            value={draft.height_cm}
            onChange={(e) => setDraft({ ...draft, height_cm: e.target.value })}
            onBlur={() => void persist()}
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Weight (kg)</span>
          <input
            type="number"
            className={fieldClass}
            value={draft.weight_kg}
            onChange={(e) => setDraft({ ...draft, weight_kg: e.target.value })}
            onBlur={() => void persist()}
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Preferred Language</span>
          <input
            className={fieldClass}
            value={draft.preferred_language}
            onChange={(e) => setDraft({ ...draft, preferred_language: e.target.value })}
            onBlur={() => void persist()}
            disabled={busy}
            placeholder="en"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Country</span>
          <input
            className={fieldClass}
            value={draft.country}
            onChange={(e) => setDraft({ ...draft, country: e.target.value })}
            onBlur={() => void persist()}
            disabled={busy}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Time Zone</span>
          <input
            className={fieldClass}
            value={draft.timezone}
            onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
            onBlur={() => void persist()}
            disabled={busy}
          />
        </label>
      </div>
      <p className={helpClass}>Profile photo upload is not available yet. Your details auto-save when you leave a field.</p>
    </div>
  );
};

export const GeneralHealthForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const sleep = sec(profile, 'sleep');
  const activity = sec(profile, 'activity');
  const stress = sec(profile, 'stress');
  const nutrition = sec(profile, 'nutrition');
  const [draft, setDraft] = useState({
    overall: String(stress.perceived_support || ''),
    energy: String(activity.activity_level || ''),
    sleep_quality: String(sleep.quality || ''),
    average_hours: sleep.average_hours != null ? String(sleep.average_hours) : '',
    exercise: String(activity.frequency_per_week ?? ''),
    stress: String(stress.general_level || ''),
    occupation: String(asArray<{ label: string }>(stress.sources)[0]?.label || ''),
    smoking: '',
    alcohol: String(nutrition.alcohol || ''),
  });

  const persist = async () => {
    const sleepPayload = {
      ...sleep,
      quality: draft.sleep_quality || undefined,
      average_hours: draft.average_hours ? Number(draft.average_hours) : undefined,
    };
    const activityPayload = {
      ...activity,
      activity_level: draft.energy || undefined,
      frequency_per_week: draft.exercise !== '' ? Number(draft.exercise) : undefined,
    };
    const stressPayload = {
      ...stress,
      general_level: draft.stress || undefined,
      perceived_support: draft.overall || undefined,
      sources: [
        ...(draft.occupation ? [{ label: draft.occupation }] : []),
        ...(draft.smoking ? [{ label: `Smoking: ${draft.smoking}` }] : []),
      ],
    };
    const nutritionPayload = {
      ...nutrition,
      alcohol: draft.alcohol || undefined,
    };
    await onSave('sleep', sleepPayload);
    await onSave('activity', activityPayload);
    await onSave('stress', stressPayload);
    await onSave('nutrition', nutritionPayload);
    onSavedLocal({
      ...profile,
      sections: {
        ...profile.sections,
        sleep: sleepPayload,
        activity: activityPayload,
        stress: stressPayload,
        nutrition: nutritionPayload,
      },
    });
  };

  const rating = (key: keyof typeof draft, options: string[]) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={busy}
          className={draft[key] === opt ? chipActive : chipIdle}
          onClick={() => {
            const next = { ...draft, [key]: opt };
            setDraft(next);
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5" data-testid="intake-form-general_health">
      <div>
        <p className={labelClass}>Overall Health</p>
        {rating('overall', ['Excellent', 'Good', 'Fair', 'Poor'])}
      </div>
      <div>
        <p className={labelClass}>Energy Level</p>
        {rating('energy', ['High', 'Moderate', 'Low', 'Very low'])}
      </div>
      <div>
        <p className={labelClass}>Sleep Quality</p>
        {rating('sleep_quality', ['Excellent', 'Good', 'Fair', 'Poor'])}
      </div>
      <label className="block">
        <span className={labelClass}>Average sleep hours</span>
        <input
          type="number"
          className={fieldClass}
          value={draft.average_hours}
          onChange={(e) => setDraft({ ...draft, average_hours: e.target.value })}
          disabled={busy}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Exercise (sessions / week)</span>
        <input
          type="number"
          className={fieldClass}
          value={draft.exercise}
          onChange={(e) => setDraft({ ...draft, exercise: e.target.value })}
          disabled={busy}
        />
      </label>
      <div>
        <p className={labelClass}>Stress</p>
        {rating('stress', ['Low', 'Moderate', 'High', 'Very high'])}
      </div>
      <label className="block">
        <span className={labelClass}>Occupation</span>
        <input
          className={fieldClass}
          value={draft.occupation}
          onChange={(e) => setDraft({ ...draft, occupation: e.target.value })}
          disabled={busy}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Smoking</span>
        <div className="flex flex-wrap gap-2">
          {['Never', 'Former', 'Current'].map((opt) => (
            <button
              key={opt}
              type="button"
              className={draft.smoking === opt ? chipActive : chipIdle}
              disabled={busy}
              onClick={() => setDraft({ ...draft, smoking: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      </label>
      <label className="block">
        <span className={labelClass}>Alcohol</span>
        <input
          className={fieldClass}
          value={draft.alcohol}
          onChange={(e) => setDraft({ ...draft, alcohol: e.target.value })}
          disabled={busy}
        />
      </label>
      <button type="button" disabled={busy} className={chipActive} onClick={() => void persist()}>
        Save information
      </button>
    </div>
  );
};

type ConditionItem = { label: string; status?: string };
type AllergyItem = { label: string; severity?: string };
type SurgeryItem = { label: string; year?: string };
type MedItem = {
  name: string;
  dose?: string;
  frequency?: string;
  reason?: string;
  start_date?: string;
  active?: boolean;
};
type FamilyItem = { condition: string; relation?: string; onset_age?: string };

export const ChecklistHistoryForm: React.FC<FormProps & { mode: 'past' | 'current' }> = ({
  profile,
  busy,
  onSave,
  onSavedLocal,
  mode,
}) => {
  const hh = sec(profile, 'health_history');
  const key = mode === 'past' ? 'past_conditions' : 'chronic_conditions';
  const items = asArray<ConditionItem>(hh[key]);
  const [query, setQuery] = useState('');
  const selected = new Set(items.map((i) => i.label));

  const toggle = async (label: string) => {
    const nextItems = selected.has(label)
      ? items.filter((i) => i.label !== label)
      : [...items, mode === 'current' ? { label, status: 'active' } : { label }];
    const payload = mergeHealthHistory(hh, {
      [key]: nextItems,
      has_significant_condition: nextItems.length ? 'yes' : hh.has_significant_condition,
    });
    const ok = await onSave('health_history', payload);
    if (ok) onSavedLocal({ ...profile, sections: { ...profile.sections, health_history: payload } });
  };

  const filtered = MEDICAL_CONDITION_OPTIONS.filter((c) =>
    c.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="space-y-4" data-testid={`intake-form-${mode === 'past' ? 'medical_history' : 'current_conditions'}`}>
      <input
        className={fieldClass}
        placeholder="Search conditions"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search conditions"
      />
      <div className="flex flex-wrap gap-2">
        {filtered.map((label) => (
          <button
            key={label}
            type="button"
            disabled={busy}
            className={selected.has(label) ? chipActive : chipIdle}
            onClick={() => void toggle(label)}
            aria-pressed={selected.has(label)}
          >
            {selected.has(label) ? '✓ ' : ''}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const MedicationsForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const meds = sec(profile, 'medications');
  const items = asArray<MedItem>(meds.items).filter((item) => item.name);
  const initialGate =
    items.length > 0 ? 'yes' : meds.takes_daily_medication === 'no' ? 'no' : 'unset';
  const [gate, setGate] = useState<'unset' | 'yes' | 'no'>(initialGate);
  const [draft, setDraft] = useState<MedItem>({
    name: '',
    dose: '',
    frequency: '',
    reason: '',
    start_date: '',
    active: true,
  });

  const persist = async (nextItems: MedItem[], takes: string) => {
    const payload = {
      ...meds,
      takes_daily_medication: takes,
      items: nextItems,
    };
    const ok = await onSave('medications', payload);
    if (ok) onSavedLocal({ ...profile, sections: { ...profile.sections, medications: payload } });
  };

  return (
    <div className="space-y-4" data-testid="intake-form-medications">
      <p className={labelClass}>Do you currently take any medications?</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={gate === 'yes' ? chipActive : chipIdle}
          disabled={busy}
          onClick={() => setGate('yes')}
        >
          Yes
        </button>
        <button
          type="button"
          className={gate === 'no' ? chipActive : chipIdle}
          disabled={busy}
          onClick={() => {
            setGate('no');
            void persist([], 'no');
          }}
        >
          No
        </button>
      </div>
      {gate === 'no' && <p className="text-sm text-slate-600 dark:text-slate-300">Information saved. Medication details are hidden.</p>}
      {gate === 'yes' && (
        <>
          <button
            type="button"
            className={`${chipActive} w-full sm:w-auto text-sm px-5 py-3`}
            disabled={busy || !draft.name.trim()}
            onClick={() => {
              const next = [...items, { ...draft, name: draft.name.trim() }];
              setDraft({ name: '', dose: '', frequency: '', reason: '', start_date: '', active: true });
              void persist(next, 'yes');
            }}
          >
            Add Medication
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['name', 'dose', 'frequency', 'reason', 'start_date'] as const).map((key) => (
              <label key={key} className="block">
                <span className={labelClass}>
                  {key === 'name'
                    ? 'Medication'
                    : key === 'start_date'
                      ? 'Start Date'
                      : key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <input
                  type={key === 'start_date' ? 'date' : 'text'}
                  className={fieldClass}
                  value={String(draft[key] || '')}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  disabled={busy}
                />
              </label>
            ))}
          </div>
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li
                key={`${item.name}-${idx}`}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 px-4 py-3 space-y-1"
              >
                <p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {[item.dose, item.frequency, item.reason].filter(Boolean).join(' · ')}
                </p>
                <button
                  type="button"
                  className="text-xs font-bold text-rose-500"
                  disabled={busy}
                  onClick={() => void persist(items.filter((_, i) => i !== idx), items.length <= 1 ? 'no' : 'yes')}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export const AllergiesForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const hh = sec(profile, 'health_history');
  const rawItems = asArray<AllergyItem>(hh.allergies);
  const noneSelected = rawItems.some((item) => /no known allerg/i.test(String(item.label || '')));
  const items = rawItems.filter((item) => !/no known allerg/i.test(String(item.label || '')));
  const [gate, setGate] = useState<'unset' | 'yes' | 'no'>(
    items.length > 0 ? 'yes' : noneSelected ? 'no' : 'unset',
  );
  const [draft, setDraft] = useState({ label: '', severity: '', category: 'Medication' });

  const persist = async (next: AllergyItem[]) => {
    const payload = mergeHealthHistory(hh, { allergies: next });
    const ok = await onSave('health_history', payload);
    if (ok) onSavedLocal({ ...profile, sections: { ...profile.sections, health_history: payload } });
  };

  return (
    <div className="space-y-4" data-testid="intake-form-allergies">
      <p className="text-xs text-slate-500 dark:text-slate-400">{TRUST_NOTICES.sensitive}</p>
      <p className={labelClass}>Do you have any allergies?</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={gate === 'yes' ? chipActive : chipIdle} disabled={busy} onClick={() => setGate('yes')}>
          Yes
        </button>
        <button
          type="button"
          className={gate === 'no' ? chipActive : chipIdle}
          disabled={busy}
          onClick={() => {
            setGate('no');
            void persist([{ label: NONE_ALLERGIES_LABEL, severity: 'none' }]);
          }}
        >
          No
        </button>
      </div>
      {gate === 'no' && <p className="text-sm text-slate-600 dark:text-slate-300">Information saved. Allergy details are hidden.</p>}
      {gate === 'yes' && (
        <>
          <div className="flex flex-wrap gap-2">
            {['Medication', 'Food', 'Environmental', 'Other'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={draft.category === cat ? chipActive : chipIdle}
                onClick={() => setDraft({ ...draft, category: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Allergy</span>
              <input
                className={fieldClass}
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                disabled={busy}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Severity / Reaction</span>
              <input
                className={fieldClass}
                value={draft.severity}
                onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
                disabled={busy}
                placeholder="Mild / Moderate / Severe"
              />
            </label>
          </div>
          <button
            type="button"
            className={chipActive}
            disabled={busy || !draft.label.trim()}
            onClick={() => {
              const label = `${draft.category}: ${draft.label.trim()}`;
              void persist([...items, { label, severity: draft.severity || undefined }]);
              setDraft({ ...draft, label: '', severity: '' });
            }}
          >
            Add Allergy
          </button>
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={`${item.label}-${idx}`} className="flex justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700 px-3 py-2">
                <span className="text-sm">
                  {item.label}
                  {item.severity ? ` · ${item.severity}` : ''}
                </span>
                <button type="button" className="text-xs font-bold text-rose-500" disabled={busy} onClick={() => void persist(items.filter((_, i) => i !== idx))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export const SurgeriesForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const hh = sec(profile, 'health_history');
  const rawSurgeries = asArray<SurgeryItem>(hh.surgeries);
  const noneSelected = rawSurgeries.some((item) => /no surgeries/i.test(String(item.label || '')));
  const surgeries = rawSurgeries.filter((item) => !/no surgeries/i.test(String(item.label || '')));
  const hospitalizations = asArray<{ label: string }>(hh.hospitalizations);
  const [gate, setGate] = useState<'unset' | 'yes' | 'no'>(
    surgeries.length > 0 || hospitalizations.length > 0 ? 'yes' : noneSelected ? 'no' : 'unset',
  );
  const [draft, setDraft] = useState({ label: '', year: '', hospital: '' });

  const persist = async (nextSurgeries: SurgeryItem[], nextHosp = hospitalizations) => {
    const payload = mergeHealthHistory(hh, {
      surgeries: nextSurgeries,
      hospitalizations: nextHosp,
    });
    const ok = await onSave('health_history', payload);
    if (ok) onSavedLocal({ ...profile, sections: { ...profile.sections, health_history: payload } });
  };

  return (
    <div className="space-y-4" data-testid="intake-form-surgeries">
      <p className={labelClass}>Have you had any surgeries or hospitalizations?</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={gate === 'yes' ? chipActive : chipIdle} disabled={busy} onClick={() => setGate('yes')}>
          Yes
        </button>
        <button
          type="button"
          className={gate === 'no' ? chipActive : chipIdle}
          disabled={busy}
          onClick={() => {
            setGate('no');
            void persist([{ label: NONE_SURGERIES_LABEL, year: '' }], []);
          }}
        >
          No
        </button>
      </div>
      {gate === 'no' && <p className="text-sm text-slate-600 dark:text-slate-300">Information saved. Surgery details are hidden.</p>}
      {gate === 'yes' && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className={labelClass}>Procedure</span>
              <input className={fieldClass} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} disabled={busy} />
            </label>
            <label className="block">
              <span className={labelClass}>Hospital</span>
              <input className={fieldClass} value={draft.hospital} onChange={(e) => setDraft({ ...draft, hospital: e.target.value })} disabled={busy} />
            </label>
            <label className="block">
              <span className={labelClass}>Year</span>
              <input className={fieldClass} value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} disabled={busy} />
            </label>
          </div>
          <button
            type="button"
            className={chipActive}
            disabled={busy || !draft.label.trim()}
            onClick={() => {
              const label = draft.hospital.trim()
                ? `${draft.label.trim()} @ ${draft.hospital.trim()}`
                : draft.label.trim();
              void persist([...surgeries, { label, year: draft.year || undefined }]);
              setDraft({ label: '', year: '', hospital: '' });
            }}
          >
            Add Procedure
          </button>
          <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-2 space-y-4">
            {surgeries.map((item, idx) => (
              <li key={`${item.label}-${idx}`} className="ml-4">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-luna-purple" />
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                <p className="text-xs text-slate-500">{item.year || 'Year unknown'}</p>
                <button type="button" className="text-xs font-bold text-rose-500" disabled={busy} onClick={() => void persist(surgeries.filter((_, i) => i !== idx))}>
                  Remove
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
};

export const FamilyHistoryForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const family = sec(profile, 'family_history');
  const items = asArray<FamilyItem>(family.items);
  const [relation, setRelation] = useState<string>('Mother');
  const [condition, setCondition] = useState('Diabetes');

  const persist = async (next: FamilyItem[]) => {
    const payload = { ...family, items: next };
    const ok = await onSave('family_history', payload);
    if (ok) onSavedLocal({ ...profile, sections: { ...profile.sections, family_history: payload } });
  };

  return (
    <div className="space-y-4" data-testid="intake-form-family_history">
      <div className="flex flex-wrap gap-2">
        {FAMILY_RELATIONS.map((r) => (
          <button key={r} type="button" className={relation === r ? chipActive : chipIdle} onClick={() => setRelation(r)}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {MEDICAL_CONDITION_OPTIONS.map((c) => (
          <button key={c} type="button" className={condition === c ? chipActive : chipIdle} onClick={() => setCondition(c)}>
            {c}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={chipActive}
        disabled={busy}
        onClick={() => void persist([...items, { condition, relation }])}
      >
        Add Family Condition
      </button>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={`${item.relation}-${item.condition}-${idx}`} className="flex justify-between rounded-xl border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-sm">
            <span>
              {item.relation}: {item.condition}
            </span>
            <button type="button" className="text-xs font-bold text-rose-500" disabled={busy} onClick={() => void persist(items.filter((_, i) => i !== idx))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const LifestyleForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const sleep = sec(profile, 'sleep');
  const nutrition = sec(profile, 'nutrition');
  const activity = sec(profile, 'activity');
  const [draft, setDraft] = useState({
    average_hours: sleep.average_hours != null ? String(sleep.average_hours) : '',
    eating_pattern: String(nutrition.eating_pattern || ''),
    alcohol: String(nutrition.alcohol || ''),
    activity_level: String(activity.activity_level || ''),
    frequency_per_week: activity.frequency_per_week != null ? String(activity.frequency_per_week) : '',
    mobility_limitations: String(activity.mobility_limitations || ''),
  });

  const persist = async () => {
    const sleepPayload = { ...sleep, average_hours: draft.average_hours ? Number(draft.average_hours) : undefined };
    const nutritionPayload = {
      ...nutrition,
      eating_pattern: draft.eating_pattern || undefined,
      alcohol: draft.alcohol || undefined,
    };
    const activityPayload = {
      ...activity,
      activity_level: draft.activity_level || undefined,
      frequency_per_week: draft.frequency_per_week !== '' ? Number(draft.frequency_per_week) : undefined,
      mobility_limitations: draft.mobility_limitations || undefined,
    };
    await onSave('sleep', sleepPayload);
    await onSave('nutrition', nutritionPayload);
    await onSave('activity', activityPayload);
    onSavedLocal({
      ...profile,
      sections: { ...profile.sections, sleep: sleepPayload, nutrition: nutritionPayload, activity: activityPayload },
    });
  };

  return (
    <div className="space-y-4" data-testid="intake-form-lifestyle">
      {(
        [
          ['average_hours', 'Sleep (hours)'],
          ['eating_pattern', 'Diet / eating pattern'],
          ['alcohol', 'Alcohol'],
          ['activity_level', 'Exercise level'],
          ['frequency_per_week', 'Exercise frequency / week'],
          ['mobility_limitations', 'Environmental exposure / limitations'],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block">
          <span className={labelClass}>{label}</span>
          <input
            className={fieldClass}
            value={draft[key]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            disabled={busy}
          />
        </label>
      ))}
      <button type="button" className={chipActive} disabled={busy} onClick={() => void persist()}>
        Save lifestyle
      </button>
    </div>
  );
};

export const WomensHealthForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const wh = sec(profile, 'womens_health');
  const [draft, setDraft] = useState({
    applicable: String(wh.applicable || 'yes'),
    cycle_status: String(wh.cycle_status || ''),
    average_cycle_length: wh.average_cycle_length != null ? String(wh.average_cycle_length) : '',
    last_period_date: String(wh.last_period_date || ''),
    contraception: String(wh.contraception || ''),
  });

  const persist = async () => {
    const payload = {
      ...wh,
      applicable: draft.applicable,
      cycle_status: draft.cycle_status || undefined,
      average_cycle_length: draft.average_cycle_length ? Number(draft.average_cycle_length) : undefined,
      last_period_date: draft.last_period_date || undefined,
      contraception: draft.contraception || undefined,
    };
    const ok = await onSave('womens_health', payload);
    if (ok) onSavedLocal({ ...profile, sections: { ...profile.sections, womens_health: payload } });
  };

  return (
    <div className="space-y-4" data-testid="intake-form-womens_health">
      <div className="flex flex-wrap gap-2">
        {['yes', 'no'].map((v) => (
          <button
            key={v}
            type="button"
            className={draft.applicable === v ? chipActive : chipIdle}
            onClick={() => setDraft({ ...draft, applicable: v })}
          >
            {v === 'yes' ? 'Applicable' : 'Not applicable'}
          </button>
        ))}
      </div>
      {draft.applicable !== 'no' && (
        <>
          <label className="block">
            <span className={labelClass}>Cycle status</span>
            <input className={fieldClass} value={draft.cycle_status} onChange={(e) => setDraft({ ...draft, cycle_status: e.target.value })} disabled={busy} />
          </label>
          <label className="block">
            <span className={labelClass}>Average cycle length</span>
            <input type="number" className={fieldClass} value={draft.average_cycle_length} onChange={(e) => setDraft({ ...draft, average_cycle_length: e.target.value })} disabled={busy} />
          </label>
          <label className="block">
            <span className={labelClass}>Last period date</span>
            <input type="date" className={fieldClass} value={draft.last_period_date} onChange={(e) => setDraft({ ...draft, last_period_date: e.target.value })} disabled={busy} />
          </label>
          <label className="block">
            <span className={labelClass}>Contraception</span>
            <input className={fieldClass} value={draft.contraception} onChange={(e) => setDraft({ ...draft, contraception: e.target.value })} disabled={busy} />
          </label>
        </>
      )}
      <button type="button" className={chipActive} disabled={busy} onClick={() => void persist()}>
        Save women's health
      </button>
    </div>
  );
};

export const GoalsForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const goals = sec(profile, 'goals');
  const selected = asArray<{ label: string }>(goals.goals).map((g) => g.label);
  const [custom, setCustom] = useState('');

  const persist = async (labels: string[]) => {
    const payload = {
      ...goals,
      primary_goal: labels[0] || goals.primary_goal,
      goals: labels.map((label) => ({ label })),
    };
    const ok = await onSave('goals', payload);
    if (ok) onSavedLocal({ ...profile, sections: { ...profile.sections, goals: payload } });
  };

  const toggle = (label: string) => {
    const next = selected.includes(label) ? selected.filter((l) => l !== label) : [...selected, label];
    void persist(next);
  };

  return (
    <div className="space-y-4" data-testid="intake-form-health_goals">
      <div className="flex flex-wrap gap-2">
        {HEALTH_GOAL_OPTIONS.map((g) => (
          <button key={g} type="button" disabled={busy} className={selected.includes(g) ? chipActive : chipIdle} onClick={() => toggle(g)}>
            {selected.includes(g) ? '✓ ' : ''}
            {g}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className={`${fieldClass} flex-1`}
          placeholder="Custom goal"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          disabled={busy}
        />
        <button
          type="button"
          className={chipActive}
          disabled={busy || !custom.trim()}
          onClick={() => {
            void persist([...selected, custom.trim()]);
            setCustom('');
          }}
        >
          Add Custom Goal
        </button>
      </div>
    </div>
  );
};

export const EmergencyForm: React.FC<FormProps> = ({ profile, busy, onSave, onSavedLocal }) => {
  const care = sec(profile, 'care_context');
  const notes = sec(profile, 'data_sources');
  const [draft, setDraft] = useState({
    emergency_contact: String(care.emergency_contact || ''),
    primary_clinician: String(care.primary_clinician || ''),
    notes: String(notes.notes || ''),
  });

  const persist = async () => {
    const carePayload = {
      ...care,
      emergency_contact: draft.emergency_contact || undefined,
      primary_clinician: draft.primary_clinician || undefined,
    };
    const notesPayload = { ...notes, notes: draft.notes || undefined };
    await onSave('care_context', carePayload);
    await onSave('data_sources', notesPayload);
    onSavedLocal({
      ...profile,
      sections: { ...profile.sections, care_context: carePayload, data_sources: notesPayload },
    });
  };

  return (
    <div className="space-y-4" data-testid="intake-form-emergency">
      <EmergencyHealthCardPlaceholder />
      <label className="block">
        <span className={labelClass}>Emergency Contact (name, relationship, phone)</span>
        <input className={fieldClass} value={draft.emergency_contact} onChange={(e) => setDraft({ ...draft, emergency_contact: e.target.value })} onBlur={() => void persist()} disabled={busy} />
      </label>
      <label className="block">
        <span className={labelClass}>Primary clinician / blood type notes</span>
        <input className={fieldClass} value={draft.primary_clinician} onChange={(e) => setDraft({ ...draft, primary_clinician: e.target.value })} onBlur={() => void persist()} disabled={busy} />
      </label>
      <label className="block">
        <span className={labelClass}>Important medical notes</span>
        <textarea className={`${fieldClass} min-h-[100px]`} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} onBlur={() => void persist()} disabled={busy} />
      </label>
    </div>
  );
};

export const SummaryPanel: React.FC<{
  profile: PersonalHealthProfile;
  onContinue: (id: IntakeSectionId) => void;
  onFinishLater: () => void;
}> = ({ profile, onContinue, onFinishLater }) => {
  const progress = intakeProgress(profile);
  const timeline = buildHealthTimeline(profile);
  const timelineGroups = groupTimelineByYear(timeline);
  const about = sec(profile, 'about');
  const body = sec(profile, 'body');
  const hh = sec(profile, 'health_history');
  const meds = sec(profile, 'medications');
  const family = sec(profile, 'family_history');
  const sleep = sec(profile, 'sleep');
  const nutrition = sec(profile, 'nutrition');
  const activity = sec(profile, 'activity');
  const goals = sec(profile, 'goals');
  const care = sec(profile, 'care_context');
  const next = progress.criticalMissing[0]?.jumpTo || 'about_you';

  const list = (value: unknown, mapFn?: (item: Record<string, unknown>) => string) => {
    const arr = asArray<Record<string, unknown> | string>(value);
    if (!arr.length) return <p className="text-sm text-slate-500">Not provided</p>;
    return (
      <ul className="text-sm text-slate-700 dark:text-slate-200 space-y-1">
        {arr.map((item, idx) => {
          const text =
            typeof item === 'string'
              ? item
              : mapFn
                ? mapFn(item)
                : String(item.label || item.name || item.condition || JSON.stringify(item));
          return <li key={`${text}-${idx}`}>• {text}</li>;
        })}
      </ul>
    );
  };

  const block = (title: string, children: React.ReactNode) => (
    <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 px-4 py-4 space-y-2">
      <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{title}</h4>
      {children}
    </section>
  );

  return (
    <div className="space-y-5" data-testid="intake-form-summary">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Read-only overview of your Personal Health Profile. Edit sections from the navigation when you need to make changes.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Profile Confidence</p>
          <p className="mt-1 text-2xl font-black">{progress.confidence}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Profile Completion</p>
          <p className="mt-1 text-2xl font-black">{progress.percent}%</p>
        </div>
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Last Confirmed</p>
          <p className="mt-1 text-2xl font-black">{formatMonthYear(profile.updated_at)}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ReportReadinessBlock profile={profile} />
        <DataUsageBlock />
        <InformationSourcesBlock profile={profile} />
        <FutureIntegrationsBlock />
      </div>

      <EmergencyHealthCardPlaceholder />

      {block(
        'Overview',
        <p className="text-sm text-slate-700 dark:text-slate-200">
          {[about.preferred_name, about.biological_sex, body.height_cm ? `${body.height_cm} cm` : '', body.weight_kg ? `${body.weight_kg} kg` : '']
            .filter(Boolean)
            .join(' · ') || 'Not provided'}
        </p>,
      )}
      {block('Medical History', list(hh.past_conditions))}
      {block('Conditions', list(hh.chronic_conditions))}
      {block(
        'Medications',
        meds.takes_daily_medication === 'no' && !asArray(meds.items).length ? (
          <p className="text-sm text-slate-500">No current medications</p>
        ) : (
          list(meds.items, (item) => [String(item.name || ''), item.dose, item.frequency].filter(Boolean).join(' · '))
        ),
      )}
      {block('Allergies', list(hh.allergies, (item) => [String(item.label || ''), item.severity].filter(Boolean).join(' · ')))}
      {block(
        'Lifestyle',
        <p className="text-sm text-slate-700 dark:text-slate-200">
          {[
            sleep.average_hours != null ? `Sleep ${sleep.average_hours}h` : '',
            nutrition.eating_pattern ? `Diet: ${nutrition.eating_pattern}` : '',
            activity.activity_level ? `Activity: ${activity.activity_level}` : '',
          ]
            .filter(Boolean)
            .join(' · ') || 'Not provided'}
        </p>,
      )}
      {block(
        'Goals',
        <>
          {list(goals.goals, (item) => String(item.label || ''))}
          {goals.primary_goal ? <p className="text-sm">Primary: {String(goals.primary_goal)}</p> : null}
        </>,
      )}
      {block(
        'Emergency Information',
        <p className="text-sm text-slate-700 dark:text-slate-200">{String(care.emergency_contact || 'Not provided')}</p>,
      )}
      {block(
        'Family History',
        list(family.items, (item) => `${item.relation || 'Family'}: ${item.condition || ''}`),
      )}

      <section className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 px-4 py-4 space-y-4" data-testid="intake-health-timeline">
        <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Health Timeline</h4>
        {timelineGroups.length === 0 ? (
          <p className="text-sm text-slate-500">
            No dated events yet. Add surgeries, conditions, or medication start dates to build your timeline.
          </p>
        ) : (
          <ol className="space-y-5">
            {timelineGroups.map((group) => (
              <li key={group.year ?? 'unknown'} className="space-y-2">
                <p className="text-sm font-black text-luna-purple">{group.year ?? 'Year unknown'}</p>
                <ul className="space-y-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                  {group.events.map((event, idx) => (
                    <li key={`${event.label}-${idx}`} className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                        {event.kindLabel}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{event.label}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
        <p className="text-[11px] text-slate-500">Printing will be available in a future update.</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={chipActive} onClick={() => onContinue(next)}>
          {progress.remaining <= 1 ? 'One more section remaining' : 'Continue Profile'}
        </button>
        <button type="button" className={chipIdle} onClick={onFinishLater}>
          Finish later
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{TRUST_NOTICES.summary}</p>
      <div className="flex flex-wrap gap-3 text-xs">
        <a href="/privacy" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
          Privacy Policy
        </a>
        <a href="/data-rights" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
          Data Protection
        </a>
        <a href="/privacy" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
          Security
        </a>
        <a href="/privacy" className="underline underline-offset-2 text-slate-500 hover:text-luna-purple">
          How Your Information Is Used
        </a>
      </div>
      <p className="text-xs text-slate-500">Last Confirmed {formatMonthYear(profile.updated_at)}</p>
    </div>
  );
};

export const IntakeSectionBody: React.FC<{
  id: IntakeSectionId;
  profile: PersonalHealthProfile;
  busy: boolean;
  onSave: SaveFn;
  onSavedLocal: (next: PersonalHealthProfile) => void;
  onJump: (id: IntakeSectionId) => void;
  onFinishLater: () => void;
}> = (props) => {
  const def = INTAKE_SECTIONS.find((s) => s.id === props.id);
  if (!def) return null;
  return (
    <div className="space-y-4">
      <WhyAsk text={def.whyAsk} />
      {props.id === 'about_you' && <AboutYouForm {...props} />}
      {props.id === 'general_health' && <GeneralHealthForm {...props} />}
      {props.id === 'medical_history' && <ChecklistHistoryForm {...props} mode="past" />}
      {props.id === 'current_conditions' && <ChecklistHistoryForm {...props} mode="current" />}
      {props.id === 'medications' && <MedicationsForm {...props} />}
      {props.id === 'allergies' && <AllergiesForm {...props} />}
      {props.id === 'surgeries' && <SurgeriesForm {...props} />}
      {props.id === 'family_history' && <FamilyHistoryForm {...props} />}
      {props.id === 'lifestyle' && <LifestyleForm {...props} />}
      {props.id === 'womens_health' && <WomensHealthForm {...props} />}
      {props.id === 'health_goals' && <GoalsForm {...props} />}
      {props.id === 'emergency' && <EmergencyForm {...props} />}
      {props.id === 'summary' && (
        <SummaryPanel profile={props.profile} onContinue={props.onJump} onFinishLater={props.onFinishLater} />
      )}
    </div>
  );
};

export { intakeProgress, intakeSectionStatus, statusLabel, visibleIntakeSections, isWomensHealthApplicable };
