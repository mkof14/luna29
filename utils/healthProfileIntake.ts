/**
 * Medical-intake UX model for Personal Health Profile.
 * Maps UI sections onto existing server section IDs — no schema/API changes.
 */

/** Mirrors server ProfileSectionId without importing the browser API client. */
export type ProfileSectionId =
  | 'about'
  | 'body'
  | 'health_history'
  | 'medications'
  | 'family_history'
  | 'sleep'
  | 'nutrition'
  | 'activity'
  | 'stress'
  | 'womens_health'
  | 'goals'
  | 'care_context'
  | 'data_sources';

export type PersonalHealthProfileLike = {
  sections?: Partial<Record<ProfileSectionId, Record<string, unknown>>>;
  completion_percent?: number;
  updated_at?: string | null;
  profile_preferences?: Record<string, unknown>;
};

export type IntakeSectionId =
  | 'about_you'
  | 'general_health'
  | 'medical_history'
  | 'current_conditions'
  | 'medications'
  | 'allergies'
  | 'surgeries'
  | 'family_history'
  | 'lifestyle'
  | 'womens_health'
  | 'health_goals'
  | 'emergency'
  | 'summary';

export type IntakeSectionStatus = 'complete' | 'needs_review' | 'missing' | 'ready';

export type ProfileQuality = 'Excellent' | 'Good' | 'Basic' | 'Minimal';

/** User-facing confidence — derived client-side; calculation details are never shown. */
export type ProfileConfidence = 'Excellent' | 'High' | 'Medium' | 'Limited';

export type CriticalMissingItem = {
  id: string;
  label: string;
  jumpTo: IntakeSectionId;
};

export type HealthTimelineEvent = {
  year: number | null;
  label: string;
  source: 'condition' | 'surgery' | 'medication' | 'history' | 'milestone';
  kindLabel: string;
};

export type TimelineYearGroup = {
  year: number | null;
  events: HealthTimelineEvent[];
};

export type InformationSourceItem = {
  id: 'user' | 'devices' | 'labs' | 'records';
  label: string;
};

export type ReportReadinessItem = {
  id: string;
  label: string;
  status: string;
};

export type IntegrationPlaceholder = {
  id: string;
  label: string;
  status: string;
};

export type ProfileFactLike = {
  source?: string | null;
  trust_state?: string | null;
  updated_at?: string | null;
};

export type IntakeSectionDef = {
  id: IntakeSectionId;
  navLabel: string;
  title: string;
  explanation: string;
  whyAsk: string;
  /** Server sections this UI step reads/writes */
  serverSections: ProfileSectionId[];
  /** Hide when women's health not applicable */
  conditional?: 'womens';
};

export const INTAKE_SECTIONS: IntakeSectionDef[] = [
  {
    id: 'about_you',
    navLabel: 'About You',
    title: 'About You',
    explanation: 'Basic identity details help Luna personalize ranges and language.',
    whyAsk: 'Age, sex, and location make wellness ranges and explanations more relevant.',
    serverSections: ['about', 'body'],
  },
  {
    id: 'general_health',
    navLabel: 'General Health',
    title: 'General Health',
    explanation: 'A quick snapshot of how you feel day to day.',
    whyAsk: 'Energy, sleep, and stress context improve daily insights and recommendations.',
    serverSections: ['sleep', 'activity', 'stress', 'nutrition'],
  },
  {
    id: 'medical_history',
    navLabel: 'Medical History',
    title: 'Medical History',
    explanation: 'Past conditions help Luna avoid irrelevant explanations.',
    whyAsk: 'Known history improves report context without diagnosing.',
    serverSections: ['health_history'],
  },
  {
    id: 'current_conditions',
    navLabel: 'Current Conditions',
    title: 'Current Conditions',
    explanation: 'Active conditions Luna should keep in mind.',
    whyAsk: 'Current conditions help personalize reports and Live context.',
    serverSections: ['health_history'],
  },
  {
    id: 'medications',
    navLabel: 'Medications',
    title: 'Medications',
    explanation: 'Current medications help Luna personalize reports and explanations.',
    whyAsk: 'Medication information helps Luna personalize explanations and avoid irrelevant suggestions. Luna never tells you to change medication.',
    serverSections: ['medications'],
  },
  {
    id: 'allergies',
    navLabel: 'Allergies',
    title: 'Allergies',
    explanation: 'Known allergies for safer, more relevant context.',
    whyAsk: 'Allergy context helps Luna avoid unsafe or irrelevant suggestions.',
    serverSections: ['health_history'],
  },
  {
    id: 'surgeries',
    navLabel: 'Surgeries',
    title: 'Surgeries & Hospitalizations',
    explanation: 'Procedures and hospital stays that shape your health story.',
    whyAsk: 'Surgical history can make timeline and report context more accurate.',
    serverSections: ['health_history'],
  },
  {
    id: 'family_history',
    navLabel: 'Family History',
    title: 'Family Medical History',
    explanation: 'Family patterns that may inform wellness context.',
    whyAsk: 'Family history can make lifestyle and prevention context more relevant.',
    serverSections: ['family_history'],
  },
  {
    id: 'lifestyle',
    navLabel: 'Lifestyle',
    title: 'Lifestyle',
    explanation: 'Daily habits that influence energy, mood, and recovery.',
    whyAsk: 'Lifestyle details improve Today insights and recommendations.',
    serverSections: ['sleep', 'nutrition', 'activity', 'stress'],
  },
  {
    id: 'womens_health',
    navLabel: "Women's Health",
    title: "Women's Health",
    explanation: 'Cycle and reproductive context when it applies to you.',
    whyAsk: 'Cycle context can make energy, sleep, mood, and symptom patterns more relevant.',
    serverSections: ['womens_health'],
    conditional: 'womens',
  },
  {
    id: 'health_goals',
    navLabel: 'Health Goals',
    title: 'Health Goals',
    explanation: 'What you want Luna to help you understand.',
    whyAsk: 'Goals focus recommendations and report emphasis.',
    serverSections: ['goals'],
  },
  {
    id: 'emergency',
    navLabel: 'Emergency Information',
    title: 'Emergency Information',
    explanation: 'Contacts and notes for urgent situations.',
    whyAsk: 'Emergency details stay private and are used only for your care context.',
    serverSections: ['care_context', 'data_sources'],
  },
  {
    id: 'summary',
    navLabel: 'Summary',
    title: 'Profile Summary',
    explanation: 'A calm overview of your health information and what can wait.',
    whyAsk: 'The summary helps you finish later without losing progress.',
    serverSections: [],
  },
];

export const MEDICAL_CONDITION_OPTIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Stroke',
  'Cancer',
  'Asthma',
  'COPD',
  'Kidney Disease',
  'Liver Disease',
  'Thyroid Disease',
  'Autoimmune Disease',
  'Depression',
  'Anxiety',
  'Other',
] as const;

export const HEALTH_GOAL_OPTIONS = [
  'Lose Weight',
  'Improve Sleep',
  'Increase Energy',
  'Improve Fitness',
  'Lower Blood Pressure',
  'Reduce Stress',
  'Healthy Aging',
  'Manage Diabetes',
] as const;

export const FAMILY_RELATIONS = ['Mother', 'Father', 'Siblings', 'Grandparents', 'Children'] as const;

const hasValue = (v: unknown): boolean => {
  if (v == null || v === '') return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

const sectionData = (profile: PersonalHealthProfileLike | null, id: ProfileSectionId) =>
  (profile?.sections?.[id] || {}) as Record<string, unknown>;

export const isWomensHealthApplicable = (profile: PersonalHealthProfileLike | null): boolean => {
  const prefs = profile?.profile_preferences || {};
  if (prefs.womens_health_applicable === false) return false;
  const wh = sectionData(profile, 'womens_health');
  if (wh.applicable === 'no' || wh.applicable === false) return false;
  const about = sectionData(profile, 'about');
  if (String(about.biological_sex || '').toLowerCase() === 'male') return false;
  return true;
};

export const visibleIntakeSections = (profile: PersonalHealthProfileLike | null): IntakeSectionDef[] =>
  INTAKE_SECTIONS.filter((s) => {
    if (s.conditional === 'womens') return isWomensHealthApplicable(profile);
    return true;
  });

export const intakeSectionStatus = (
  id: IntakeSectionId,
  profile: PersonalHealthProfileLike | null,
): IntakeSectionStatus => {
  if (id === 'summary') return 'ready';
  const about = sectionData(profile, 'about');
  const body = sectionData(profile, 'body');
  const hh = sectionData(profile, 'health_history');
  const meds = sectionData(profile, 'medications');
  const family = sectionData(profile, 'family_history');
  const sleep = sectionData(profile, 'sleep');
  const nutrition = sectionData(profile, 'nutrition');
  const activity = sectionData(profile, 'activity');
  const stress = sectionData(profile, 'stress');
  const goals = sectionData(profile, 'goals');
  const care = sectionData(profile, 'care_context');
  const wh = sectionData(profile, 'womens_health');

  const noneAllergy = asLabelList(hh.allergies).some((l) => /no known allerg/i.test(l));
  const noneSurgery = asLabelList(hh.surgeries).some((l) => /no surgeries/i.test(l));

  switch (id) {
    case 'about_you': {
      const core = [about.preferred_name, about.date_of_birth, about.biological_sex, body.height_cm, body.weight_kg];
      if (core.every(hasValue)) return 'complete';
      if (core.some(hasValue)) return 'needs_review';
      return 'missing';
    }
    case 'general_health': {
      const vals = [sleep.quality, sleep.average_hours, activity.activity_level, stress.general_level, nutrition.alcohol];
      if (vals.filter(hasValue).length >= 3) return 'complete';
      if (vals.some(hasValue)) return 'needs_review';
      return 'missing';
    }
    case 'medical_history': {
      if (hasValue(hh.past_conditions) || hasValue(hh.has_significant_condition)) return 'complete';
      return 'missing';
    }
    case 'current_conditions':
      return hasValue(hh.chronic_conditions) ? 'complete' : 'missing';
    case 'medications': {
      if (hasValue(meds.items) || meds.takes_daily_medication === 'no') return 'complete';
      if (hasValue(meds.takes_daily_medication)) return 'needs_review';
      return 'missing';
    }
    case 'allergies':
      if (noneAllergy || hasValue(hh.allergies)) return 'complete';
      return 'missing';
    case 'surgeries':
      if (noneSurgery || hasValue(hh.surgeries) || hasValue(hh.hospitalizations)) return 'complete';
      return 'missing';
    case 'family_history':
      return hasValue(family.items) ? 'complete' : 'missing';
    case 'lifestyle': {
      const vals = [sleep.average_hours, nutrition.eating_pattern, activity.frequency_per_week, stress.sources];
      if (vals.filter(hasValue).length >= 2) return 'complete';
      if (vals.some(hasValue)) return 'needs_review';
      return 'missing';
    }
    case 'womens_health': {
      if (wh.applicable === 'no') return 'complete';
      if (hasValue(wh.cycle_status) || hasValue(wh.last_period_date)) return 'complete';
      if (Object.values(wh).some(hasValue)) return 'needs_review';
      return 'missing';
    }
    case 'health_goals':
      return hasValue(goals.primary_goal) || hasValue(goals.goals) ? 'complete' : 'missing';
    case 'emergency':
      return hasValue(care.emergency_contact) ? 'complete' : 'missing';
    default:
      return 'missing';
  }
};

const asLabelList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'label' in item) return String((item as { label?: unknown }).label || '');
      if (item && typeof item === 'object' && 'name' in item) return String((item as { name?: unknown }).name || '');
      return '';
    })
    .filter(Boolean);
};

/** Critical gaps for hero — UI-only prioritization; percent still from completion API. */
export const missingCriticalInformation = (
  profile: PersonalHealthProfileLike | null,
): CriticalMissingItem[] => {
  const items: CriticalMissingItem[] = [];
  const hh = sectionData(profile, 'health_history');
  const meds = sectionData(profile, 'medications');
  const family = sectionData(profile, 'family_history');
  const care = sectionData(profile, 'care_context');
  const chronic = asLabelList(hh.chronic_conditions);
  const hasHypertension = chronic.some((l) => /hypertension|blood pressure/i.test(l));

  if (!(hasValue(meds.items) || meds.takes_daily_medication === 'no' || hasValue(meds.takes_daily_medication))) {
    items.push({ id: 'medications', label: 'Current Medications', jumpTo: 'medications' });
  }
  if (!hasValue(hh.allergies)) {
    items.push({ id: 'allergies', label: 'Allergies', jumpTo: 'allergies' });
  }
  if (!hasValue(hh.chronic_conditions) || !hasHypertension) {
    if (!hasValue(hh.chronic_conditions)) {
      items.push({ id: 'conditions', label: 'Current Conditions', jumpTo: 'current_conditions' });
    } else if (!hasHypertension) {
      items.push({ id: 'bp', label: 'Blood Pressure', jumpTo: 'current_conditions' });
    }
  }
  if (!hasValue(hh.surgeries) && !hasValue(hh.hospitalizations)) {
    items.push({ id: 'surgeries', label: 'Surgeries', jumpTo: 'surgeries' });
  }
  if (!hasValue(family.items)) {
    items.push({ id: 'family', label: 'Family History', jumpTo: 'family_history' });
  }
  if (!hasValue(care.emergency_contact)) {
    items.push({ id: 'emergency', label: 'Emergency Contact', jumpTo: 'emergency' });
  }
  return items;
};

export const profileQualityFromPercent = (percent: number): ProfileQuality => {
  if (percent >= 80) return 'Excellent';
  if (percent >= 60) return 'Good';
  if (percent >= 30) return 'Basic';
  return 'Minimal';
};

/** Days since last profile update; null when unknown. */
export const daysSinceUpdated = (iso?: string | null, nowMs = Date.now()): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((nowMs - t) / (24 * 60 * 60 * 1000)));
};

/**
 * Profile Confidence from completion, critical gaps, and freshness.
 * UI-only; does not change the completion API score.
 */
export const profileConfidence = (
  profile: PersonalHealthProfileLike | null,
  nowMs = Date.now(),
): ProfileConfidence => {
  const percent = Number(profile?.completion_percent || 0);
  const criticalMissing = missingCriticalInformation(profile).length;
  const criticalFilled = Math.max(0, 6 - criticalMissing);
  const days = daysSinceUpdated(profile?.updated_at, nowMs);

  let freshness = 0;
  if (days == null) freshness = 4;
  else if (days <= 90) freshness = 20;
  else if (days <= 180) freshness = 12;
  else if (days <= 365) freshness = 6;
  else freshness = 0;

  const score = percent * 0.5 + (criticalFilled / 6) * 30 + freshness;
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'High';
  if (score >= 45) return 'Medium';
  return 'Limited';
};

/** Subtle review reminder when important information may be stale. */
export const needsProfileReview = (
  profile: PersonalHealthProfileLike | null,
  nowMs = Date.now(),
  staleAfterDays = 180,
): boolean => {
  if (!profile) return false;
  const hasAny =
    Object.values(profile.sections || {}).some((section) =>
      Object.values(section || {}).some((v) => hasValue(v)),
    ) || Number(profile.completion_percent || 0) > 0;
  if (!hasAny) return false;
  const days = daysSinceUpdated(profile.updated_at, nowMs);
  if (days == null) return false;
  return days >= staleAfterDays;
};

export const lastConfirmedLabel = (
  profile: PersonalHealthProfileLike | null,
  facts: ProfileFactLike[] = [],
): string => {
  const confirmedDates = facts
    .filter((f) => f.trust_state === 'confirmed' || f.trust_state === 'corrected')
    .map((f) => f.updated_at)
    .filter(Boolean) as string[];
  const candidates = [profile?.updated_at, ...confirmedDates].filter(Boolean) as string[];
  if (!candidates.length) return '—';
  const latest = candidates
    .map((iso) => ({ iso, t: new Date(iso).getTime() }))
    .filter((x) => Number.isFinite(x.t))
    .sort((a, b) => b.t - a.t)[0];
  return latest ? formatMonthYear(latest.iso) : '—';
};

export const listInformationSources = (
  profile: PersonalHealthProfileLike | null,
  facts: ProfileFactLike[] = [],
): InformationSourceItem[] => {
  const items: InformationSourceItem[] = [];
  const sectionHasContent = Object.values(profile?.sections || {}).some((section) =>
    Object.values(section || {}).some((v) => hasValue(v)),
  );
  const userFact = facts.some((f) => {
    const source = String(f.source || '').toLowerCase();
    return !source || /user|manual|entered/.test(source);
  });
  if (sectionHasContent || (facts.length > 0 && userFact)) {
    items.push({ id: 'user', label: 'Information entered by you' });
  }

  const sources = facts.map((f) => String(f.source || '').toLowerCase());
  if (sources.some((s) => /device|wearable|apple_health|google_fit|fitbit|oura|garmin/.test(s))) {
    items.push({ id: 'devices', label: 'Connected devices' });
  }
  if (sources.some((s) => /lab|report|blood|panel/.test(s))) {
    items.push({ id: 'labs', label: 'Laboratory results' });
  }
  if (sources.some((s) => /document|record|ehr|fhir|medical_record/.test(s))) {
    items.push({ id: 'records', label: 'Medical records' });
  }
  return items;
};

export const reportReadiness = (profile: PersonalHealthProfileLike | null): ReportReadinessItem[] => {
  const confidence = profileConfidence(profile);
  const critical = missingCriticalInformation(profile);
  const missingIds = new Set(critical.map((c) => c.id));
  const medsOk = !missingIds.has('medications');
  const allergiesOk = !missingIds.has('allergies');
  const conditionsOk = !missingIds.has('conditions') && !missingIds.has('bp');
  const percent = Number(profile?.completion_percent || 0);

  const personalization =
    confidence === 'Excellent'
      ? 'Excellent personalization'
      : confidence === 'High'
        ? 'High personalization'
        : confidence === 'Medium'
          ? 'Moderate personalization'
          : 'Additional information recommended';

  const medicationStatus =
    medsOk && allergiesOk
      ? confidence === 'Limited'
        ? 'Ready'
        : 'High confidence'
      : 'Additional information recommended';

  const riskStatus =
    conditionsOk && medsOk && !missingIds.has('family')
      ? confidence === 'Excellent' || confidence === 'High'
        ? 'High confidence'
        : 'Ready'
      : 'Additional information recommended';

  const labStatus =
    percent >= 40 && (conditionsOk || medsOk) ? 'Ready' : 'Additional information recommended';

  return [
    { id: 'reports', label: 'Health Reports', status: personalization },
    { id: 'medications', label: 'Medication Review', status: medicationStatus },
    { id: 'risk', label: 'Risk Assessment', status: riskStatus },
    { id: 'labs', label: 'Lab Interpretation', status: labStatus },
  ];
};

export const FUTURE_INTEGRATIONS: IntegrationPlaceholder[] = [
  { id: 'risk', label: 'Risk Assessment', status: 'Uses your health information' },
  { id: 'medication', label: 'Medication Review', status: 'Uses your health information' },
  { id: 'labs', label: 'Laboratory Interpretation', status: 'Uses your health information' },
  { id: 'assistant', label: 'AI Health Assistant', status: 'Uses your health information' },
  { id: 'recommendations', label: 'Personalized Recommendations', status: 'Uses your health information' },
];

export const DATA_USAGE = {
  title: 'How your information is used',
  body: 'Your information helps personalize health insights, improve report accuracy, and provide more relevant recommendations. Your information is never sold. You remain in control of your data.',
} as const;

export const REVIEW_REMINDER =
  'Some information may no longer be current. Review your profile when you have a moment.' as const;

export const EMERGENCY_CARD = {
  title: 'Emergency Health Card',
  status: 'Coming Soon',
  learnMore:
    'A concise card of critical health information for emergencies will be available in a future update.',
} as const;

export const intakeProgress = (profile: PersonalHealthProfileLike | null) => {
  const sections = visibleIntakeSections(profile).filter((s) => s.id !== 'summary');
  const statuses = sections.map((s) => intakeSectionStatus(s.id, profile));
  const completed = statuses.filter((s) => s === 'complete' || s === 'ready').length;
  const total = sections.length;
  const remaining = Math.max(0, total - completed);
  const criticalMissing = missingCriticalInformation(profile);
  // Time estimate prioritizes clinical gaps without changing the completion API score.
  const estimatedMinutes = Math.max(
    0,
    Math.round(criticalMissing.length * 2 + Math.max(0, remaining - criticalMissing.length) * 1),
  );
  const percent = Number(profile?.completion_percent || 0);
  return {
    completed,
    total,
    remaining,
    estimatedMinutes,
    quality: profileQualityFromPercent(percent),
    confidence: profileConfidence(profile),
    percent,
    criticalMissing,
    needsReview: needsProfileReview(profile),
  };
};

export const statusLabel = (status: IntakeSectionStatus): string => {
  if (status === 'complete') return 'Complete';
  if (status === 'needs_review') return 'Needs Review';
  if (status === 'ready') return 'Ready';
  return 'Missing Information';
};

export const statusAttentionLabel = (status: IntakeSectionStatus): string => {
  if (status === 'complete' || status === 'ready') return 'Complete';
  if (status === 'needs_review') return 'Needs Attention';
  return 'Missing Information';
};

/** Merge patch into existing health_history before PUT (section replace semantics). */
export const mergeHealthHistory = (
  existing: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> => ({
  ...existing,
  ...patch,
});

export const formatMonthYear = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const buildHealthTimeline = (profile: PersonalHealthProfileLike | null): HealthTimelineEvent[] => {
  if (!profile) return [];
  const events: HealthTimelineEvent[] = [];
  const hh = sectionData(profile, 'health_history');
  const meds = sectionData(profile, 'medications');

  asArrayObjects(hh.surgeries).forEach((item) => {
    const label = String(item.label || item.name || '').trim();
    if (!label || /no surgeries/i.test(label)) return;
    const year = parseYear(item.year);
    events.push({ year, label, source: 'surgery', kindLabel: 'Surgery' });
  });

  asArrayObjects(hh.chronic_conditions).forEach((item) => {
    const label = String(item.label || '').trim();
    if (!label) return;
    const year = parseYear(item.year || item.diagnosed || item.diagnosis_date);
    events.push({
      year,
      label: year ? `${label} Diagnosed` : label,
      source: 'condition',
      kindLabel: 'Condition',
    });
  });

  asArrayObjects(hh.past_conditions).forEach((item) => {
    const label = String(item.label || '').trim();
    if (!label) return;
    events.push({
      year: parseYear(item.year),
      label,
      source: 'history',
      kindLabel: 'Medical History',
    });
  });

  asArrayObjects(hh.hospitalizations).forEach((item) => {
    const label = String(item.label || item.name || item.reason || '').trim();
    if (!label) return;
    events.push({
      year: parseYear(item.year || item.date),
      label,
      source: 'milestone',
      kindLabel: 'Milestone',
    });
  });

  asArrayObjects(meds.items).forEach((item) => {
    const name = String(item.name || '').trim();
    if (!name) return;
    const year = parseYear(item.start_date);
    events.push({
      year,
      label: year ? `Started ${name}` : name,
      source: 'medication',
      kindLabel: 'Medication',
    });
  });

  return events.sort((a, b) => {
    if (a.year == null && b.year == null) return a.label.localeCompare(b.label);
    if (a.year == null) return 1;
    if (b.year == null) return -1;
    return a.year - b.year;
  });
};

/** Group timeline events by year for summary presentation. */
export const groupTimelineByYear = (events: HealthTimelineEvent[]): TimelineYearGroup[] => {
  const map = new Map<string, TimelineYearGroup>();
  for (const event of events) {
    const key = event.year == null ? 'unknown' : String(event.year);
    const existing = map.get(key);
    if (existing) existing.events.push(event);
    else map.set(key, { year: event.year, events: [event] });
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.year == null && b.year == null) return 0;
    if (a.year == null) return 1;
    if (b.year == null) return -1;
    return a.year - b.year;
  });
};

const asArrayObjects = (value: unknown): Array<Record<string, unknown>> => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
};

const parseYear = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  const raw = String(value);
  const match = raw.match(/(19|20)\d{2}/);
  if (!match) return null;
  const year = Number(match[0]);
  return Number.isFinite(year) ? year : null;
};

const IMPACT_BY_SECTION: Partial<Record<ProfileSectionId, string[]>> = {
  medications: [
    'Your medication analysis has been updated.',
    'Future recommendations will use this information.',
  ],
  health_history: [
    'Health reports are now more personalized.',
    'Risk calculations have improved.',
  ],
  family_history: [
    'Risk calculations have improved.',
    'Future recommendations will use this information.',
  ],
  care_context: [
    'Emergency information is ready when you need it.',
    'Future recommendations will use this information.',
  ],
  goals: [
    'Future recommendations will use this information.',
    'Health reports are now more personalized.',
  ],
  sleep: [
    'Health reports are now more personalized.',
    'Future recommendations will use this information.',
  ],
  nutrition: [
    'Health reports are now more personalized.',
    'Future recommendations will use this information.',
  ],
  activity: [
    'Health reports are now more personalized.',
    'Future recommendations will use this information.',
  ],
  stress: [
    'Health reports are now more personalized.',
    'Future recommendations will use this information.',
  ],
  about: [
    'Health reports are now more personalized.',
    'Future recommendations will use this information.',
  ],
  body: [
    'Health reports are now more personalized.',
    'Risk calculations have improved.',
  ],
  womens_health: [
    'Health reports are now more personalized.',
    'Future recommendations will use this information.',
  ],
  data_sources: ['Information saved.', 'Future recommendations will use this information.'],
};

const IMPACT_ROTATION = [
  'Your medication analysis has been updated.',
  'Health reports are now more personalized.',
  'Risk calculations have improved.',
  'Future recommendations will use this information.',
] as const;

/** Meaningful after-save impact — never "Saved successfully." */
export const profileImpactMessage = (section: ProfileSectionId, rotateSeed = Date.now()): string => {
  const options = IMPACT_BY_SECTION[section] || [...IMPACT_ROTATION];
  return options[Math.abs(rotateSeed) % options.length];
};

/** @deprecated Prefer profileImpactMessage — kept for existing call sites. */
export const saveValueMessage = (section: ProfileSectionId): string => profileImpactMessage(section);

export const TRUST_NOTICES = {
  hero: 'Encrypted in transit and at rest. Only you control access.',
  sensitive: 'You may update or remove your information at any time. We never sell your personal health information.',
  summary: 'Encrypted in transit and at rest. You remain in control of what you share.',
  settings: 'Privacy & data controls',
} as const;

export const NONE_ALLERGIES_LABEL = 'No known allergies';
export const NONE_SURGERIES_LABEL = 'No surgeries reported';