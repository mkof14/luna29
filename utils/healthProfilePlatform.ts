/**
 * Platform integration helpers for Personal Health Profile.
 * Client-only — reuses existing profile/completion/context APIs. No schema changes.
 */

import {
  missingCriticalInformation,
  reportReadiness,
  type PersonalHealthProfileLike,
  type ProfileSectionId,
  type ReportReadinessItem,
} from './healthProfileIntake';

export type LabsDraftProfileFields = {
  birthYear: string;
  medications: string;
  knownConditions: string;
  goals: string;
};

export type ProfileContextLike = {
  status?: string;
  completion_percent?: number;
  sections?: Partial<Record<ProfileSectionId, Record<string, unknown>>>;
  facts?: Array<{
    label?: string;
    section?: string;
    fact_key?: string;
    value?: unknown;
    trust_state?: string;
  }>;
  missing_context?: string[];
};

export type ModuleReadinessItem = ReportReadinessItem;

export type FutureConnectionItem = {
  id: string;
  label: string;
  status: string;
};

const hasValue = (v: unknown): boolean => {
  if (v == null || v === '') return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

const asLabels = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const row = item as Record<string, unknown>;
        return String(row.label || row.name || row.condition || '').trim();
      }
      return '';
    })
    .filter(Boolean);
};

const section = (profile: PersonalHealthProfileLike | null, id: ProfileSectionId) =>
  (profile?.sections?.[id] || {}) as Record<string, unknown>;

/** Prefill Labs draft fields from server Personal Health Profile — never invent. */
export const labsDraftFromPhp = (profile: PersonalHealthProfileLike | null): Partial<LabsDraftProfileFields> => {
  if (!profile?.sections) return {};
  const about = section(profile, 'about');
  const meds = section(profile, 'medications');
  const hh = section(profile, 'health_history');
  const goals = section(profile, 'goals');
  const out: Partial<LabsDraftProfileFields> = {};

  const dob = String(about.date_of_birth || '');
  if (/^\d{4}/.test(dob)) out.birthYear = dob.slice(0, 4);

  if (meds.takes_daily_medication === 'no') {
    out.medications = 'None';
  } else {
    const items = asLabels(meds.items);
    if (items.length) out.medications = items.join(', ');
  }

  const conditions = asLabels(hh.chronic_conditions);
  if (conditions.length) out.knownConditions = conditions.join(', ');

  if (hasValue(goals.primary_goal)) {
    out.goals = String(goals.primary_goal);
  } else {
    const goalLabels = asLabels(goals.goals);
    if (goalLabels.length) out.goals = goalLabels.join(', ');
  }

  return out;
};

/** Which Labs draft fields are already covered by PHP (hide duplicate inputs). */
export const labsFieldsCoveredByPhp = (
  profile: PersonalHealthProfileLike | null,
): Array<keyof LabsDraftProfileFields> => {
  const filled = labsDraftFromPhp(profile);
  return (Object.keys(filled) as Array<keyof LabsDraftProfileFields>).filter((key) => Boolean(filled[key]));
};

/** Bounded text for lab analysis — uses existing context payload only. */
export const formatProfileContextForAnalysis = (ctx: ProfileContextLike | null | undefined): string => {
  if (!ctx || ctx.status !== 'ok') return '';
  const lines: string[] = ['Personal Health Profile context (confirmed information only):'];
  const sections = ctx.sections || {};
  const about = (sections.about || {}) as Record<string, unknown>;
  const body = (sections.body || {}) as Record<string, unknown>;
  const hh = (sections.health_history || {}) as Record<string, unknown>;
  const meds = (sections.medications || {}) as Record<string, unknown>;
  const goals = (sections.goals || {}) as Record<string, unknown>;

  if (about.date_of_birth || about.biological_sex) {
    lines.push(
      `About: ${[about.date_of_birth ? `DOB ${about.date_of_birth}` : '', about.biological_sex ? `sex ${about.biological_sex}` : '']
        .filter(Boolean)
        .join(' · ')}`,
    );
  }
  if (body.height_cm || body.weight_kg) {
    lines.push(
      `Body: ${[body.height_cm ? `${body.height_cm} cm` : '', body.weight_kg ? `${body.weight_kg} kg` : '']
        .filter(Boolean)
        .join(' · ')}`,
    );
  }
  const conditions = asLabels(hh.chronic_conditions);
  if (conditions.length) lines.push(`Conditions: ${conditions.join(', ')}`);
  const allergies = asLabels(hh.allergies);
  if (allergies.length) lines.push(`Allergies: ${allergies.join(', ')}`);
  const surgeries = asLabels(hh.surgeries).filter((l) => !/no surgeries/i.test(l));
  if (surgeries.length) lines.push(`Surgeries: ${surgeries.join(', ')}`);
  if (meds.takes_daily_medication === 'no') lines.push('Medications: none reported');
  else {
    const medLabels = asLabels(meds.items);
    if (medLabels.length) lines.push(`Medications: ${medLabels.join(', ')}`);
  }
  if (goals.primary_goal) lines.push(`Goals: ${String(goals.primary_goal)}`);

  const factLines = (ctx.facts || [])
    .slice(0, 12)
    .map((f) => `${f.label || f.fact_key}: ${typeof f.value === 'string' ? f.value : JSON.stringify(f.value)}`)
    .filter(Boolean);
  if (factLines.length) {
    lines.push('Confirmed facts:');
    factLines.forEach((line) => lines.push(`- ${line}`));
  }

  return lines.length > 1 ? lines.join('\n') : '';
};

/** Report attribution labels — never expose prompts. */
export const reportAttributionFromProfile = (
  profile: PersonalHealthProfileLike | null,
  ctx?: ProfileContextLike | null,
): string[] => {
  const labels: string[] = [];
  const sections = ctx?.sections || profile?.sections || {};
  const meds = (sections.medications || {}) as Record<string, unknown>;
  const hh = (sections.health_history || {}) as Record<string, unknown>;
  const family = (sections.family_history || {}) as Record<string, unknown>;
  const sleep = (sections.sleep || {}) as Record<string, unknown>;
  const nutrition = (sections.nutrition || {}) as Record<string, unknown>;
  const activity = (sections.activity || {}) as Record<string, unknown>;
  const goals = (sections.goals || {}) as Record<string, unknown>;

  if (hasValue(meds.items) || meds.takes_daily_medication === 'no') labels.push('Current Medications');
  if (
    hasValue(hh.chronic_conditions) ||
    hasValue(hh.past_conditions) ||
    hasValue(hh.allergies) ||
    hasValue(hh.surgeries)
  ) {
    labels.push('Medical History');
  }
  if (hasValue(sleep.average_hours) || hasValue(nutrition.eating_pattern) || hasValue(activity.activity_level)) {
    labels.push('Lifestyle');
  }
  if (hasValue(family.items)) labels.push('Family History');
  if (hasValue(goals.primary_goal) || hasValue(goals.goals)) labels.push('Goals');
  return labels;
};

export const personalizationHeadline = (opts: {
  completionPercent: number | null;
  hasMedications?: boolean;
  hasMedicalHistory?: boolean;
  hasProfile?: boolean;
}): string => {
  const percent = opts.completionPercent ?? 0;
  if (percent < 20 && !opts.hasMedications && !opts.hasMedicalHistory) {
    return 'Needs more profile information';
  }
  if (opts.hasMedications && percent >= 40) return 'Personalized using confirmed medications';
  if (opts.hasMedicalHistory && percent >= 40) return 'Personalized using your confirmed medical history';
  if (opts.hasProfile || percent > 0) return 'Personalized using your health profile';
  return 'Needs more profile information';
};

export const MISSING_PERSONALIZATION_HINTS: Partial<Record<ProfileSectionId | string, string>> = {
  medications: 'Add your medications for a more personalized review.',
  family_history: 'Adding family history improves long-term risk assessment.',
  health_history: 'Adding medical history improves report personalization.',
  about: 'Add basic profile details for more relevant insights.',
  goals: 'Add your goals so recommendations can focus on what matters to you.',
  sleep: 'Add lifestyle details for more relevant daily insights.',
  care_context: 'Add emergency information when you are ready.',
};

export const missingPersonalizationHint = (
  sectionId: ProfileSectionId | string | null | undefined,
): string | null => {
  if (!sectionId) return null;
  return MISSING_PERSONALIZATION_HINTS[sectionId] || 'Complete your Personal Health Profile for better personalization.';
};

/** Module readiness across the app — informational only. */
export const platformModuleReadiness = (profile: PersonalHealthProfileLike | null): ModuleReadinessItem[] => {
  const base = reportReadiness(profile);
  const critical = missingCriticalInformation(profile);
  const missingIds = new Set(critical.map((c) => c.id));
  const percent = Number(profile?.completion_percent || 0);

  let aiStatus = 'Needs more profile information';
  if (percent >= 70 && missingIds.size === 0) aiStatus = 'Ready';
  else if (percent >= 30 || critical.length < 4) aiStatus = 'Partially Personalized';

  return [...base, { id: 'ai', label: 'AI Assistant', status: aiStatus }];
};

export const FUTURE_CONNECTIONS: FutureConnectionItem[] = [
  { id: 'wearables', label: 'Wearables', status: 'Coming soon' },
  { id: 'laboratories', label: 'Laboratories', status: 'Coming soon' },
  { id: 'medical_records', label: 'Medical Records', status: 'Coming soon' },
  { id: 'genetics', label: 'Genetics', status: 'Coming soon' },
  { id: 'nutrition', label: 'Nutrition', status: 'Coming soon' },
];

export const profileHasMedications = (profile: PersonalHealthProfileLike | null): boolean => {
  const meds = section(profile, 'medications');
  return hasValue(meds.items) || meds.takes_daily_medication === 'no';
};

export const profileHasMedicalHistory = (profile: PersonalHealthProfileLike | null): boolean => {
  const hh = section(profile, 'health_history');
  return (
    hasValue(hh.chronic_conditions) ||
    hasValue(hh.past_conditions) ||
    hasValue(hh.allergies) ||
    hasValue(hh.surgeries)
  );
};

export const phpMedicationsSummary = (profile: PersonalHealthProfileLike | null): string | null => {
  const meds = section(profile, 'medications');
  if (meds.takes_daily_medication === 'no') return 'No current medications in your Personal Health Profile.';
  const items = asLabels(meds.items);
  if (!items.length) return null;
  return items.join(', ');
};

/** Clinical medication rows from Personal Health Profile (source of truth). */
export const listPhpMedications = (
  profile: PersonalHealthProfileLike | null,
): Array<{ name: string; dose?: string; frequency?: string }> => {
  const meds = section(profile, 'medications');
  if (meds.takes_daily_medication === 'no') return [];
  const raw = Array.isArray(meds.items) ? meds.items : [];
  const out: Array<{ name: string; dose?: string; frequency?: string }> = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    if (!name) continue;
    out.push({
      name,
      dose: typeof row.dose === 'string' && row.dose.trim() ? row.dose.trim() : undefined,
      frequency: typeof row.frequency === 'string' && row.frequency.trim() ? row.frequency.trim() : undefined,
    });
  }
  return out;
};
