import { Language } from '../constants';
import { HealthLabRow, PersonalHealthProfile } from '../services/healthReportService';

export const LABS_DRAFT_STORAGE_KEY = 'luna_labs_draft_v1';

export type SexualScores = {
  libido: number;
  arousal: number;
  comfort: number;
  closeness: number;
  pain: number;
};

export type DraftRowSeed = Pick<HealthLabRow, 'marker' | 'value' | 'unit' | 'reference' | 'date' | 'note'>;

export type LabsDraftSnapshot = {
  input: string;
  manualRows: DraftRowSeed[];
  selectedSymptoms: string[];
  sexualScores: SexualScores;
  includeNameInReport: boolean;
  includeIdInReport: boolean;
  manualReportId: string;
  reportLang: Language;
  profile: PersonalHealthProfile;
};

const ALLOWED_LANGUAGES: Language[] = ['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ar', 'he'];
const PROFILE_KEYS: Array<keyof PersonalHealthProfile> = ['birthYear', 'cycleLength', 'cycleDay', 'medications', 'knownConditions', 'goals'];

const clampScore = (value: unknown, fallback: number) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(1, Math.min(5, Math.round(num)));
};

const cleanText = (value: unknown, max = 300): string => {
  if (typeof value !== 'string') return '';
  return value.slice(0, max);
};

const isLanguage = (value: unknown): value is Language => typeof value === 'string' && ALLOWED_LANGUAGES.includes(value as Language);

const sanitizeRow = (row: unknown): DraftRowSeed | null => {
  if (!row || typeof row !== 'object') return null;
  const candidate = row as Partial<DraftRowSeed>;
  const cleaned: DraftRowSeed = {
    marker: cleanText(candidate.marker, 120),
    value: cleanText(candidate.value, 80),
    unit: cleanText(candidate.unit, 80),
    reference: cleanText(candidate.reference, 80),
    date: cleanText(candidate.date, 40),
    note: cleanText(candidate.note, 200),
  };
  const hasValue = Object.values(cleaned).some((value) => value.trim().length > 0);
  return hasValue ? cleaned : null;
};

export const createDefaultSexualScores = (): SexualScores => ({
  libido: 3,
  arousal: 3,
  comfort: 3,
  closeness: 3,
  pain: 1,
});

export const sanitizeLabsDraft = (
  raw: unknown,
  fallbackLang: Language,
  defaultProfile: PersonalHealthProfile,
): LabsDraftSnapshot => {
  const source = raw && typeof raw === 'object' ? (raw as Partial<LabsDraftSnapshot>) : {};

  const manualRows = Array.isArray(source.manualRows)
    ? source.manualRows
        .map((row) => sanitizeRow(row))
        .filter((row): row is DraftRowSeed => Boolean(row))
    : [];

  const selectedSymptoms = Array.isArray(source.selectedSymptoms)
    ? source.selectedSymptoms
        .map((item) => cleanText(item, 80).trim())
        .filter((item) => item.length > 0)
        .slice(0, 40)
    : [];

  const sourceSexual = source.sexualScores || {};
  const sexualScores: SexualScores = {
    libido: clampScore((sourceSexual as Partial<SexualScores>).libido, 3),
    arousal: clampScore((sourceSexual as Partial<SexualScores>).arousal, 3),
    comfort: clampScore((sourceSexual as Partial<SexualScores>).comfort, 3),
    closeness: clampScore((sourceSexual as Partial<SexualScores>).closeness, 3),
    pain: clampScore((sourceSexual as Partial<SexualScores>).pain, 1),
  };

  const safeProfile: PersonalHealthProfile = { ...defaultProfile };
  for (const key of PROFILE_KEYS) {
    const value = source.profile?.[key];
    if (typeof value === 'string') safeProfile[key] = cleanText(value, 240);
  }

  return {
    input: cleanText(source.input, 5000),
    manualRows,
    selectedSymptoms,
    sexualScores,
    includeNameInReport: Boolean(source.includeNameInReport),
    includeIdInReport: source.includeIdInReport ?? true,
    manualReportId: cleanText(source.manualReportId, 80),
    reportLang: isLanguage(source.reportLang) ? source.reportLang : fallbackLang,
    profile: safeProfile,
  };
};

export const readLabsDraftSnapshot = (
  fallbackLang: Language,
  defaultProfile: PersonalHealthProfile,
): LabsDraftSnapshot | null => {
  try {
    const raw = localStorage.getItem(LABS_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return sanitizeLabsDraft(parsed, fallbackLang, defaultProfile);
  } catch {
    return null;
  }
};

export const writeLabsDraftSnapshot = (snapshot: LabsDraftSnapshot): boolean => {
  try {
    localStorage.setItem(LABS_DRAFT_STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
};

export const clearLabsDraftSnapshot = (): void => {
  try {
    localStorage.removeItem(LABS_DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
};
