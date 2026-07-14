import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeLabResults } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { HealthEvent } from '../types';
import { Logo } from './Logo';
import { versionedAbsoluteAsset, versionedStaticAsset } from '../utils/staticAssetUrl';
import { getBrandAssetUrl, LUNA_BRAND_PATHS } from '../utils/lunaBrandAssets';
import { isSupportedLabFile } from '../utils/runtimeGuards';
import { copyTextSafely, shareTextSafely } from '../utils/share';
import { Language } from '../constants';
import { getLabsViewLocalizedContent } from '../utils/labsViewContent';
import { getPublicChromeCopy } from '../utils/publicChromeCopy';
import { getHealthProfileCopy } from '../utils/healthProfileCopy';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { HealthProfileIncompleteNotice } from './HealthProfileIncompleteNotice';
import {
  ModuleReadinessPanel,
  ProfilePersonalizationBadge,
  ReportAttributionBlock,
} from './healthProfile/ProfilePlatformIntegration';
import {
  getProfile,
  getProfileContext,
  isProfileUnavailable,
  type PersonalHealthProfile as PhpProfile,
} from '../services/personalHealthProfileService';
import {
  formatProfileContextForAnalysis,
  labsDraftFromPhp,
  labsFieldsCoveredByPhp,
  type LabsDraftProfileFields,
  type ProfileContextLike,
} from '../utils/healthProfilePlatform';
import { invalidateHealthProfileCompletionCache } from '../hooks/useHealthProfileCompletion';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
import { clearLabsDraftSnapshot, createDefaultSexualScores, readLabsDraftSnapshot, writeLabsDraftSnapshot } from '../utils/labsDraft';
import { briefService } from '../services/briefService';
import {
  computeHormoneSignals,
  detectLabValueConflicts,
  extractTextFromLabFile,
  HealthLabRow,
  LabValueConflict,
  mergeParsedLabValues,
  ParsedLabValue,
  parseLabText,
  PersonalHealthProfile,
  summarizeHormoneSignals,
  toLabRows,
} from '../services/healthReportService';

const HormoneTestingGuideLazy = React.lazy(async () => {
  const module = await import('./HormoneTestingGuide');
  return { default: module.HormoneTestingGuide };
});

const REPORT_ID_STORAGE_KEY = 'luna_report_user_id_v1';

const emptyProfile: PersonalHealthProfile = {
  birthYear: '',
  cycleLength: '28',
  cycleDay: '',
  medications: '',
  knownConditions: '',
  goals: '',
};

const quickSymptoms = ['Fatigue', 'Anxiety', 'PMS', 'Sleep issues', 'Headache', 'Low mood', 'Bloating', 'Cravings'];
const intimacySymptoms = ['Low libido', 'Low arousal', 'Dryness', 'Pain during intimacy', 'Low orgasm quality', 'Low closeness'];

const downloadFile = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const templateRows: Record<string, Array<Partial<HealthLabRow>>> = {
  hormone_core: [
    { marker: 'Estradiol (E2)', unit: 'pg/mL', reference: '30-400' },
    { marker: 'Progesterone', unit: 'ng/mL', reference: '0.2-25' },
    { marker: 'LH', unit: 'IU/L', reference: '1.9-12.5' },
    { marker: 'FSH', unit: 'IU/L', reference: '2.5-10.2' },
    { marker: 'Prolactin', unit: 'ng/mL', reference: '4.8-23.3' },
  ],
  thyroid: [
    { marker: 'TSH', unit: 'mIU/L', reference: '0.4-4.0' },
    { marker: 'FT4', unit: 'pmol/L', reference: '10-22' },
    { marker: 'FT3', unit: 'pmol/L', reference: '3.1-6.8' },
  ],
  metabolic: [
    { marker: 'Glucose (fasting)', unit: 'mg/dL', reference: '70-99' },
    { marker: 'Insulin (fasting)', unit: 'uIU/mL', reference: '2-25' },
    { marker: 'HbA1c', unit: '%', reference: '4.0-5.6' },
    { marker: 'Ferritin', unit: 'ng/mL', reference: '15-150' },
    { marker: 'Vitamin D (25-OH)', unit: 'ng/mL', reference: '30-100' },
  ],
  libido_intimacy: [
    { marker: 'Estradiol (E2)', unit: 'pg/mL', reference: '30-400' },
    { marker: 'Progesterone', unit: 'ng/mL', reference: '0.2-25' },
    { marker: 'Total Testosterone', unit: 'ng/dL', reference: '15-70' },
    { marker: 'Free Testosterone', unit: 'pg/mL', reference: '0.3-3.5' },
    { marker: 'SHBG', unit: 'nmol/L', reference: '18-114' },
    { marker: 'Prolactin', unit: 'ng/mL', reference: '4.8-23.3' },
    { marker: 'DHEA-S', unit: 'ug/dL', reference: '35-430' },
    { marker: 'TSH', unit: 'mIU/L', reference: '0.4-4.0' },
    { marker: 'Ferritin', unit: 'ng/mL', reference: '15-150' },
  ],
};

const newRow = (seed?: Partial<HealthLabRow>): HealthLabRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  marker: seed?.marker || '',
  value: seed?.value || '',
  unit: seed?.unit || '',
  reference: seed?.reference || '',
  date: seed?.date || '',
  note: seed?.note || '',
});

const statusColor = (status: 'low' | 'normal' | 'high' | 'unknown') => {
  if (status === 'normal') return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30';
  if (status === 'low') return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30';
  if (status === 'high') return 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30';
  return 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/60';
};

const inferStatus = (value: number, referenceMin?: number, referenceMax?: number): 'low' | 'normal' | 'high' | 'unknown' => {
  if (!Number.isFinite(value)) return 'unknown';
  if (!Number.isFinite(referenceMin as number) || !Number.isFinite(referenceMax as number)) return 'unknown';
  if (value < Number(referenceMin)) return 'low';
  if (value > Number(referenceMax)) return 'high';
  return 'normal';
};

const parseReference = (reference: string): { min?: number; max?: number } => {
  const match = reference.match(/(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)/);
  if (!match) return {};
  const min = Number(match[1].replace(',', '.'));
  const max = Number(match[2].replace(',', '.'));
  if (!Number.isFinite(min) || !Number.isFinite(max)) return {};
  return { min, max };
};

const hormoneTopic = (text: string): { key: 'cycle' | 'thyroid' | 'androgen' | 'metabolic' | 'stress' | 'reserve' | 'other'; label: string; accent: string; chipClass: string; textClass: string } => {
  const raw = text.toLowerCase();
  if (/(estradiol|estrogen|progesterone|lh|fsh|prolactin)/.test(raw)) {
    return { key: 'cycle', label: 'Cycle', accent: '#7c3aed', chipClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', textClass: 'text-violet-700 dark:text-violet-300' };
  }
  if (/(tsh|ft3|ft4|t3|t4|thyroid|anti-tpo|anti-tg)/.test(raw)) {
    return { key: 'thyroid', label: 'Thyroid', accent: '#0ea5e9', chipClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300', textClass: 'text-sky-700 dark:text-sky-300' };
  }
  if (/(testosterone|shbg|dhea|androstenedione|17-oh)/.test(raw)) {
    return { key: 'androgen', label: 'Androgen', accent: '#ec4899', chipClass: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300', textClass: 'text-pink-700 dark:text-pink-300' };
  }
  if (/(glucose|insulin|hba1c)/.test(raw)) {
    return { key: 'metabolic', label: 'Metabolic', accent: '#f59e0b', chipClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', textClass: 'text-amber-700 dark:text-amber-300' };
  }
  if (/(cortisol)/.test(raw)) {
    return { key: 'stress', label: 'Stress', accent: '#f43f5e', chipClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', textClass: 'text-rose-700 dark:text-rose-300' };
  }
  if (/(ferritin|vitamin d|b12|cbc)/.test(raw)) {
    return { key: 'reserve', label: 'Reserve', accent: '#14b8a6', chipClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300', textClass: 'text-teal-700 dark:text-teal-300' };
  }
  return { key: 'other', label: 'Other', accent: '#64748b', chipClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300', textClass: 'text-slate-700 dark:text-slate-300' };
};

const ensureReportId = () => {
  try {
    const current = localStorage.getItem(REPORT_ID_STORAGE_KEY);
    if (current) return current;
    const created = `LUNA29-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    localStorage.setItem(REPORT_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return `LUNA29-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }
};

export const LabsView: React.FC<{
  day: number;
  age: number;
  lang: Language;
  userId?: string;
  userName?: string;
  onBack?: () => void;
  onOpenHealthProfile?: () => void;
}> = ({ day, age, lang, userId, userName, onBack, onOpenHealthProfile }) => {
  const defaultProfile = useMemo<PersonalHealthProfile>(
    () => ({ ...emptyProfile, birthYear: String(new Date().getFullYear() - age), cycleDay: String(day) }),
    [age, day],
  );
  const initialDraftRef = useRef<ReturnType<typeof readLabsDraftSnapshot> | null>(null);
  if (initialDraftRef.current === null) initialDraftRef.current = readLabsDraftSnapshot(lang, defaultProfile);
  const initialDraft = initialDraftRef.current;

  const [input, setInput] = useState(() => initialDraft?.input || '');
  const [analysis, setAnalysis] = useState<{ text: string; sources: unknown[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportActionFeedback, setReportActionFeedback] = useState<string | null>(null);
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [manualRows, setManualRows] = useState<HealthLabRow[]>(() => {
    if (!initialDraft?.manualRows?.length) return [newRow()];
    return initialDraft.manualRows.map((row) => newRow(row));
  });
  const [parsedRows, setParsedRows] = useState<HealthLabRow[]>([]);
  const [parsedValues, setParsedValues] = useState<ParsedLabValue[]>([]);
  const [rawParsedValues, setRawParsedValues] = useState<ParsedLabValue[]>([]);
  const [labConflicts, setLabConflicts] = useState<LabValueConflict[]>([]);
  const [conflictChoices, setConflictChoices] = useState<Record<string, number>>({});
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(() => (Array.isArray(initialDraft?.selectedSymptoms) ? initialDraft.selectedSymptoms : []));
  const [sexualScores, setSexualScores] = useState(() => initialDraft?.sexualScores || createDefaultSexualScores());
  const [includeNameInReport, setIncludeNameInReport] = useState(() => Boolean(initialDraft?.includeNameInReport));
  const [includeIdInReport, setIncludeIdInReport] = useState(() => initialDraft?.includeIdInReport ?? true);
  const [manualReportId, setManualReportId] = useState(() => initialDraft?.manualReportId || '');
  const [reportLang, setReportLang] = useState<Language>(() => initialDraft?.reportLang || lang);
  const [profile, setProfile] = useState<PersonalHealthProfile>(() => ({ ...defaultProfile, ...(initialDraft?.profile || {}) }));
  const [phpProfile, setPhpProfile] = useState<PhpProfile | null>(null);
  const [profileContext, setProfileContext] = useState<ProfileContextLike | null>(null);
  const [phpCoveredFields, setPhpCoveredFields] = useState<Array<keyof LabsDraftProfileFields>>([]);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<number | null>(null);
  const localized = useMemo(() => getLabsViewLocalizedContent(lang, reportLang), [lang, reportLang]);
  const chrome = getPublicChromeCopy(lang);
  const hpCopy = getHealthProfileCopy(lang);
  const {
    sexualUi,
    visualGuide,
    reportUi,
    reportLangUi,
    reportCategories,
    reportActions,
    conflictsUi,
    reportsUi,
    reportLanguageNames,
    locale: uiLocale,
    export: exportCopy,
  } = localized;
  const {
    medForm,
    detailedUi,
    womenUi,
    reportSourcesUi,
    reportCategories: exportCategories,
    reportUi: exportReportUi,
    locale: reportLocale,
  } = exportCopy;
  const reportId = useMemo(() => manualReportId.trim() || userId || ensureReportId(), [manualReportId, userId]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const identitySectionRef = useRef<HTMLElement>(null);
  const profileSectionRef = useRef<HTMLElement>(null);
  const labsSectionRef = useRef<HTMLElement>(null);
  const reportSectionRef = useRef<HTMLElement>(null);
  const systemState = useMemo(() => dataService.projectState(log), [log]);
  const reportIdentityLine = useMemo(() => {
    const identity: string[] = [];
    if (includeNameInReport && userName) identity.push(`Name: ${userName}`);
    if (includeIdInReport) identity.push(`Report ID: ${reportId}`);
    return identity.join(' | ');
  }, [includeNameInReport, includeIdInReport, userName, reportId]);

  const hormoneSignals = useMemo(() => computeHormoneSignals(parsedValues), [parsedValues]);
  const hormoneSummary = useMemo(() => summarizeHormoneSignals(hormoneSignals), [hormoneSignals]);

  useEffect(() => {
    let alive = true;
    void getProfile()
      .then((result) => {
        if (!alive || isProfileUnavailable(result)) return;
        setPhpProfile(result);
        const fromPhp = labsDraftFromPhp(result);
        const covered = labsFieldsCoveredByPhp(result);
        setPhpCoveredFields(covered);
        setProfile((prev) => {
          const next = { ...prev };
          (Object.keys(fromPhp) as Array<keyof LabsDraftProfileFields>).forEach((key) => {
            const value = fromPhp[key];
            if (!value) return;
            if (!String(prev[key] || '').trim() || covered.includes(key)) {
              next[key] = value;
            }
          });
          return next;
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onFocus = () => {
      void getProfile()
        .then((result) => {
          if (isProfileUnavailable(result)) return;
          setPhpProfile(result);
          const fromPhp = labsDraftFromPhp(result);
          setPhpCoveredFields(labsFieldsCoveredByPhp(result));
          setProfile((prev) => ({ ...prev, ...fromPhp }));
          invalidateHealthProfileCompletionCache();
        })
        .catch(() => undefined);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const markerStatuses = useMemo(() => {
    let low = 0;
    let high = 0;
    let normal = 0;
    let unknown = 0;
    for (const item of parsedValues) {
      const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
      if (status === 'low') low += 1;
      if (status === 'high') high += 1;
      if (status === 'normal') normal += 1;
      if (status === 'unknown') unknown += 1;
    }
    return { low, high, normal, unknown };
  }, [parsedValues]);

  const hormoneTopicStats = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const item of parsedValues) {
      const topic = hormoneTopic(item.marker).key;
      totals[topic] = (totals[topic] || 0) + 1;
    }
    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
    return Object.entries(totals)
      .map(([topicKey, count]) => {
        const sample = parsedValues.find((item) => hormoneTopic(item.marker).key === topicKey)?.marker || topicKey;
        const meta = hormoneTopic(sample);
        return { topicKey, count, ratio: total ? Math.round((count / total) * 100) : 0, meta };
      })
      .sort((a, b) => b.count - a.count);
  }, [parsedValues]);

  const doctorQuestions = useMemo(() => {
    const risky = hormoneSignals.filter((s) => s.status === 'low' || s.status === 'high').slice(0, 4);
    const riskQuestions = risky.map((signal) => {
      const direction = signal.status === 'high' ? 'elevated' : 'reduced';
      return `Could ${signal.marker} (${direction}) explain my symptoms and cycle changes, and what follow-up test timing is best?`;
    });
    const briefQuestions = briefService
      .getItems()
      .flatMap((item) => item.questions)
      .slice(0, 8);
    const combined = [...riskQuestions, ...briefQuestions];
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const question of combined) {
      const key = question.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(question.trim());
    }
    return unique;
  }, [hormoneSignals]);

  const sexualOverview = useMemo(() => {
    const sumPositive = sexualScores.libido + sexualScores.arousal + sexualScores.comfort + sexualScores.closeness;
    const avgPositive = Number((sumPositive / 4).toFixed(1));
    const pain = sexualScores.pain;
    let state = sexualUi.stateStable;
    if (avgPositive <= 2.2 || pain >= 4) state = sexualUi.stateHigh;
    else if (avgPositive <= 3 || pain >= 3) state = sexualUi.stateModerate;
    return { avgPositive, pain, state };
  }, [sexualScores, sexualUi.stateStable, sexualUi.stateHigh, sexualUi.stateModerate]);

  const libidoHormoneSignals = useMemo(() => {
    const keys = ['estrogen', 'estradiol', 'progesterone', 'testosterone', 'shbg', 'prolactin', 'dhea', 'thyroid', 'tsh', 'ferritin'];
    return hormoneSignals.filter((signal) => keys.some((key) => signal.marker.toLowerCase().includes(key) || signal.hormone.toLowerCase().includes(key)));
  }, [hormoneSignals]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]));
  };

  const updateSexualScore = (key: keyof typeof sexualScores, value: number) => {
    setSexualScores((prev) => ({ ...prev, [key]: value }));
  };

  const updateProfile = (key: keyof PersonalHealthProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };
  const jumpTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearDraft = () => {
    clearLabsDraftSnapshot();
    setInput('');
    setManualRows([newRow()]);
    setParsedRows([]);
    setParsedValues([]);
    setRawParsedValues([]);
    setLabConflicts([]);
    setConflictChoices({});
    setSelectedSymptoms([]);
    setSexualScores(createDefaultSexualScores());
    setIncludeNameInReport(false);
    setIncludeIdInReport(true);
    setManualReportId('');
    setReportLang(lang);
    setProfile(defaultProfile);
    setAnalysis(null);
    setUploadFeedback(null);
    setCopyFeedback(null);
    setLastDraftSavedAt(null);
    setReportActionFeedback(reportActions.draftCleared);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const updateRow = (id: string, key: keyof HealthLabRow, value: string) => {
    setManualRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const addRow = () => setManualRows((prev) => [...prev, newRow()]);
  const removeRow = (id: string) => setManualRows((prev) => prev.filter((row) => row.id !== id));

  const applyTemplate = (templateKey: keyof typeof templateRows) => {
    const rows = templateRows[templateKey].map((seed) => newRow(seed));
    setManualRows(rows);
  };

  const buildManualRowsText = () => {
    return manualRows
      .filter((row) => row.marker.trim() && row.value.trim())
      .map((row) => {
        const unit = row.unit ? ` ${row.unit}` : '';
        const ref = row.reference ? ` (${row.reference})` : '';
        const dateChunk = row.date ? ` | date: ${row.date}` : '';
        const noteChunk = row.note ? ` | note: ${row.note}` : '';
        return `${row.marker}: ${row.value}${unit}${ref}${dateChunk}${noteChunk}`;
      })
      .join('\n');
  };

  const buildProfileText = () => {
    const lines = [
      `Birth year: ${profile.birthYear || 'N/A'}`,
      `Cycle length: ${profile.cycleLength || 'N/A'}`,
      `Cycle day: ${profile.cycleDay || systemState.currentDay}`,
      `Medications: ${profile.medications || 'N/A'}`,
      `Known conditions: ${profile.knownConditions || 'N/A'}`,
      `Goals: ${profile.goals || 'N/A'}`,
      `Symptoms today: ${selectedSymptoms.length ? selectedSymptoms.join(', ') : 'N/A'}`,
      `Sexual health scores (1-5): libido=${sexualScores.libido}, arousal=${sexualScores.arousal}, comfort=${sexualScores.comfort}, closeness=${sexualScores.closeness}, pain=${sexualScores.pain}`,
    ];
    if (reportIdentityLine) lines.unshift(reportIdentityLine);
    return lines.join('\n');
  };

  const parseManualRowsToParsed = (): ParsedLabValue[] => {
    return manualRows
      .filter((row) => row.marker.trim() && row.value.trim())
      .map((row) => {
        const value = Number(row.value.replace(',', '.'));
        const ref = parseReference(row.reference);
        return {
          marker: row.marker.trim(),
          value,
          unit: row.unit.trim() || undefined,
          referenceMin: ref.min,
          referenceMax: ref.max,
          source: 'manual' as const,
        };
      })
      .filter((item) => Number.isFinite(item.value));
  };

  useEffect(() => {
    if (!rawParsedValues.length) return;
    const resolved = mergeParsedLabValues(rawParsedValues, conflictChoices);
    setParsedValues(resolved);
    setParsedRows(toLabRows(resolved));
  }, [rawParsedValues, conflictChoices]);

  useEffect(() => {
    const saved = writeLabsDraftSnapshot({
      input,
      manualRows: manualRows.map((row) => ({
        marker: row.marker,
        value: row.value,
        unit: row.unit,
        reference: row.reference,
        date: row.date,
        note: row.note,
      })),
      selectedSymptoms,
      sexualScores,
      includeNameInReport,
      includeIdInReport,
      manualReportId,
      reportLang,
      profile,
    });
    if (saved) setLastDraftSavedAt(Date.now());
  }, [includeIdInReport, includeNameInReport, input, manualReportId, manualRows, profile, reportLang, selectedSymptoms, sexualScores]);

  const reportGeneratedAt = useMemo(() => new Date().toLocaleString(reportLocale), [analysis?.text, parsedValues.length, reportIdentityLine, reportLocale]);
  const reportCopyright = useMemo(() => {
    const base = detailedUi.copyright || 'Copyright © Luna29 Balance. All rights reserved.';
    return base.includes('2026') ? base : base.replace('Copyright ©', 'Copyright © 2026');
  }, [detailedUi.copyright]);
  const analysisSource = useMemo(() => {
    const pieces: string[] = [];
    if (uploadFeedback) pieces.push(uploadFeedback);
    if (input.trim()) pieces.push(reportSourcesUi.textInput);
    if (manualRows.some((row) => row.marker.trim() && row.value.trim())) pieces.push(reportSourcesUi.manualTable);
    return pieces.length ? pieces.join(' + ') : reportSourcesUi.profileOnly;
  }, [input, manualRows, reportSourcesUi.manualTable, reportSourcesUi.profileOnly, reportSourcesUi.textInput, uploadFeedback]);
  const hasIdentityReady = useMemo(() => includeIdInReport || (includeNameInReport && Boolean(userName)), [includeIdInReport, includeNameInReport, userName]);
  const hasProfileReady = useMemo(
    () =>
      [profile.birthYear, profile.cycleLength, profile.cycleDay, profile.goals]
        .map((value) => value.trim())
        .filter(Boolean).length >= 3,
    [profile.birthYear, profile.cycleDay, profile.cycleLength, profile.goals],
  );
  const hasLabsReady = useMemo(() => manualRows.some((row) => row.marker.trim() && row.value.trim()) || input.trim().length > 0, [input, manualRows]);
  const hasReportReady = Boolean(analysis?.text);
  const workflowChecklist = useMemo(
    () => [
      { key: 'identity', label: reportsUi.identityTitle, done: hasIdentityReady, action: () => jumpTo(identitySectionRef) },
      { key: 'profile', label: reportsUi.profileTitle, done: hasProfileReady, action: () => jumpTo(profileSectionRef) },
      { key: 'labs', label: reportsUi.labTable, done: hasLabsReady, action: () => jumpTo(labsSectionRef) },
      { key: 'report', label: reportsUi.workflowReportStep, done: hasReportReady, action: () => jumpTo(reportSectionRef) },
    ],
    [hasIdentityReady, hasLabsReady, hasProfileReady, hasReportReady, reportsUi.identityTitle, reportsUi.labTable, reportsUi.profileTitle, reportsUi.workflowReportStep],
  );
  const checklistDoneCount = workflowChecklist.filter((item) => item.done).length;
  const checklistProgress = Math.round((checklistDoneCount / workflowChecklist.length) * 100);

  const categorizeMarker = (categories: typeof reportCategories, marker: string): string => {
    const m = marker.toLowerCase();
    if (/(estradiol|progesterone|lh|fsh|prolactin)/.test(m)) return categories.cycle;
    if (/(tsh|ft3|ft4|t3|t4|thyroid|anti-tpo|anti-tg)/.test(m)) return categories.thyroid;
    if (/(testosterone|shbg|dhea|androstenedione|17-oh)/.test(m)) return categories.sexual;
    if (/(glucose|insulin|hba1c)/.test(m)) return categories.metabolic;
    if (/(ferritin|vitamin d|b12|cbc)/.test(m)) return categories.nutrient;
    return categories.other;
  };
  const markerCategory = (marker: string) => categorizeMarker(reportCategories, marker);
  const exportMarkerCategory = (marker: string) => categorizeMarker(exportCategories, marker);

  const sourceLabel = (source?: ParsedLabValue['source']) => {
    if (source === 'manual') return conflictsUi.manual;
    if (source === 'pdf') return conflictsUi.pdf;
    if (source === 'ocr') return conflictsUi.ocr;
    return conflictsUi.text;
  };

  const confidenceScore = (item: ParsedLabValue): number => {
    let score = item.source === 'manual' ? 92 : item.source === 'text' ? 82 : item.source === 'pdf' ? 76 : 68;
    if (item.unit) score += 3;
    if (Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)) score += 5;
    return Math.min(99, score);
  };

  const markerByTokens = (tokens: string[]) =>
    parsedValues.find((item) => tokens.some((token) => item.marker.toLowerCase().includes(token)));

  const womenClinicalInsights = useMemo(() => {
    type Insight = { level: 'high' | 'watch' | 'stable'; title: string; body: string };
    const combinations: Insight[] = [];
    const effects: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    const estradiol = markerByTokens(['estradiol', 'estrogen', 'e2']);
    const progesterone = markerByTokens(['progesterone']);
    const tsh = markerByTokens(['tsh']);
    const ft4 = markerByTokens(['ft4', 't4']);
    const insulin = markerByTokens(['insulin']);
    const glucose = markerByTokens(['glucose']);
    const testosterone = markerByTokens(['testosterone']);
    const dhea = markerByTokens(['dhea']);
    const prolactin = markerByTokens(['prolactin']);
    const ferritin = markerByTokens(['ferritin']);
    const cortisol = markerByTokens(['cortisol']);

    const stateOf = (item?: ParsedLabValue) => (item ? inferStatus(item.value, item.referenceMin, item.referenceMax) : 'unknown');
    const hasSymptom = (...keys: string[]) => selectedSymptoms.some((sym) => keys.some((key) => sym.toLowerCase().includes(key)));

    const estrState = stateOf(estradiol);
    const progState = stateOf(progesterone);
    if ((estrState === 'high' && (progState === 'low' || progState === 'unknown')) || (estrState === 'normal' && progState === 'low')) {
      combinations.push({ level: 'high', title: womenUi.estProgTitle, body: womenUi.estProgBody });
      effects.push(womenUi.estProgBody);
      risks.push(womenUi.estProgBody);
      recommendations.push(womenUi.recDoctor);
    }

    const tshState = stateOf(tsh);
    const ft4State = stateOf(ft4);
    if (tshState === 'high' || ft4State === 'low') {
      combinations.push({ level: 'high', title: womenUi.thyroidTitle, body: womenUi.thyroidBody });
      effects.push(womenUi.thyroidBody);
      risks.push(womenUi.thyroidBody);
      recommendations.push(womenUi.recDoctor);
    }

    const insulinState = stateOf(insulin);
    const glucoseState = stateOf(glucose);
    const testState = stateOf(testosterone);
    const dheaState = stateOf(dhea);
    if ((insulinState === 'high' || glucoseState === 'high') && (testState === 'high' || dheaState === 'high')) {
      combinations.push({ level: 'high', title: womenUi.insulinAndrogenTitle, body: womenUi.insulinAndrogenBody });
      effects.push(womenUi.insulinAndrogenBody);
      risks.push(womenUi.insulinAndrogenBody);
      recommendations.push(womenUi.recDoctor);
    }

    if (stateOf(prolactin) === 'high' && (sexualOverview.avgPositive <= 3 || hasSymptom('low libido', 'low arousal'))) {
      combinations.push({ level: 'watch', title: womenUi.prolactinTitle, body: womenUi.prolactinBody });
      effects.push(womenUi.prolactinBody);
      risks.push(womenUi.prolactinBody);
      recommendations.push(womenUi.recDoctor);
    }

    if (stateOf(ferritin) === 'low' || hasSymptom('fatigue', 'low mood', 'headache')) {
      combinations.push({ level: 'watch', title: womenUi.ferritinTitle, body: womenUi.ferritinBody });
      effects.push(womenUi.ferritinBody);
      risks.push(womenUi.ferritinBody);
      recommendations.push(womenUi.recDoctor);
    }

    if (stateOf(cortisol) === 'high' || hasSymptom('anxiety', 'sleep issues')) {
      combinations.push({ level: 'watch', title: womenUi.cortisolTitle, body: womenUi.cortisolBody });
      effects.push(womenUi.cortisolBody);
      risks.push(womenUi.cortisolBody);
      recommendations.push(womenUi.recDoctor);
    }

    if (!combinations.length && parsedValues.length) {
      combinations.push({ level: 'stable', title: womenUi.stable, body: womenUi.noData });
    }
    if (!recommendations.length && parsedValues.length) {
      recommendations.push(womenUi.recDoctor);
    }

    recommendations.push(womenUi.recCycle, womenUi.recRepeat, womenUi.recLifestyle);

    return {
      combinations,
      effects: effects.length ? effects : [womenUi.noData],
      risks: risks.length ? risks : [womenUi.noData],
      recommendations: Array.from(new Set(recommendations)),
    };
  }, [parsedValues, selectedSymptoms, sexualOverview.avgPositive, womenUi]);

  const markerStatusExplanation = (status: 'low' | 'normal' | 'high' | 'unknown') => {
    if (status === 'low') return detailedUi.statusLow;
    if (status === 'high') return detailedUi.statusHigh;
    if (status === 'normal') return detailedUi.statusNormal;
    return detailedUi.statusUnknown;
  };

  const reportText = useMemo(() => {
    const identity = reportIdentityLine || reportsUi.privateIdentity;
    const markersPreview = parsedValues
      .map((item) => {
        const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
        const reference =
          Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)
            ? ` [${item.referenceMin}-${item.referenceMax}]`
            : '';
        return `${item.marker}: ${item.value}${item.unit ? ` ${item.unit}` : ''}${reference} (${status})\n  ${markerStatusExplanation(status)}`;
      })
      .join('\n');
    const summary = analysis?.text || reportsUi.reportReadyBody;
    return [
      detailedUi.title,
      detailedUi.subtitle,
      `${medForm.generatedAt}: ${reportGeneratedAt}`,
      `${medForm.patientId}: ${identity}`,
      `${medForm.source}: ${analysisSource}`,
      `${reportsUi.day}: ${profile.cycleDay || systemState.currentDay}`,
      `${sexualUi.summaryLabel}: ${sexualOverview.avgPositive}/5 | ${sexualUi.scoreLabels.pain} ${sexualOverview.pain}/5`,
      '',
      `${detailedUi.detailedInterpretation}:`,
      markersPreview || detailedUi.noMarkers,
      '',
      `${medForm.summary}:`,
      summary,
      '',
      `${womenUi.combinationsTitle}:`,
      womenClinicalInsights.combinations.map((item) => `${item.title}: ${item.body}`).join('\n'),
      '',
      `${womenUi.effectsTitle}:`,
      womenClinicalInsights.effects.map((item) => `- ${item}`).join('\n'),
      '',
      `${womenUi.risksTitle}:`,
      womenClinicalInsights.risks.map((item) => `- ${item}`).join('\n'),
      '',
      `${womenUi.recommendationsTitle}:`,
      womenClinicalInsights.recommendations.map((item) => `- ${item}`).join('\n'),
      '',
      `${detailedUi.doctorQuestions}:`,
      doctorQuestions.length ? doctorQuestions.join('\n') : detailedUi.noQuestions,
      '',
      `${medForm.disclaimerTitle}: ${medForm.disclaimerBody}`,
      reportCopyright,
    ].join('\n');
  }, [analysis?.text, analysisSource, detailedUi.detailedInterpretation, detailedUi.doctorQuestions, detailedUi.noMarkers, detailedUi.noQuestions, detailedUi.statusHigh, detailedUi.statusLow, detailedUi.statusNormal, detailedUi.statusUnknown, detailedUi.subtitle, detailedUi.title, doctorQuestions, medForm.disclaimerBody, medForm.disclaimerTitle, medForm.generatedAt, medForm.patientId, medForm.source, medForm.summary, parsedValues, profile.cycleDay, reportCopyright, reportGeneratedAt, reportIdentityLine, reportsUi.day, reportsUi.privateIdentity, reportsUi.reportReadyBody, sexualOverview.avgPositive, sexualOverview.pain, sexualUi.scoreLabels.pain, sexualUi.summaryLabel, systemState.currentDay, womenClinicalInsights.combinations, womenClinicalInsights.effects, womenClinicalInsights.recommendations, womenClinicalInsights.risks, womenUi.combinationsTitle, womenUi.effectsTitle, womenUi.recommendationsTitle, womenUi.risksTitle]);

  const getReportHtml = async () => {
    const [{ buildDetailedReportHtml }, { buildDetailedReportPayload }] = await Promise.all([
      import('../utils/reportHtmlTemplate'),
      import('../utils/labsReportPayload'),
    ]);

    const reportHtmlPayload = buildDetailedReportPayload({
      reportOrigin: window.location.origin,
      analysisText: analysis?.text,
      analysisSource,
      parsedValues,
      doctorQuestions,
      hormoneTopicStats,
      womenClinicalInsights,
      sexualOverview,
      profileCycleDay: profile.cycleDay,
      currentDay: systemState.currentDay,
      reportIdentityLine,
      reportGeneratedAt,
      reportCopyright,
      detailedUi,
      medForm,
      reportsUi,
      sexualUi,
      womenUi,
      markerCategory: exportMarkerCategory,
      markerStatusExplanation,
      hormoneTopic,
    });
    return buildDetailedReportHtml(reportHtmlPayload);
  };

  const handleAnalyze = async () => {
    const manualText = buildManualRowsText();
    let phpContextText = '';
    try {
      const ctx = await getProfileContext({ reportType: 'labs', maxFacts: 24 });
      if (!isProfileUnavailable(ctx)) {
        setProfileContext(ctx);
        phpContextText = formatProfileContextForAnalysis(ctx);
        if (ctx.completion_percent != null) invalidateHealthProfileCompletionCache();
      }
    } catch {
      // Profile context is optional — analysis still runs from labs + local draft.
    }
    const combinedInput = [phpContextText, buildProfileText(), manualText, input].filter(Boolean).join('\n\n').trim();
    if (!combinedInput) return;

    setLoading(true);
    try {
      const sourceHint = (uploadFeedback || '').toLowerCase();
      const parsedInputSource: ParsedLabValue['source'] =
        sourceHint.includes('pdf') ? 'pdf' : sourceHint.includes('scan') || sourceHint.includes('ocr') || sourceHint.includes('ai') ? 'ocr' : 'text';
      const parsedFromText = parseLabText([manualText, input].filter(Boolean).join('\n')).map((item) => ({ ...item, source: parsedInputSource }));
      const rawMerged = [...parseManualRowsToParsed(), ...parsedFromText];
      const conflicts = detectLabValueConflicts(rawMerged);
      const parsedMerged = mergeParsedLabValues(rawMerged, {});
      setRawParsedValues(rawMerged);
      setLabConflicts(conflicts);
      setConflictChoices({});
      const nextSignals = computeHormoneSignals(parsedMerged);
      const summary = summarizeHormoneSignals(nextSignals);
      setParsedValues(parsedMerged);
      setParsedRows(toLabRows(parsedMerged));

      const aiResult = await analyzeLabResults(combinedInput, systemState);
      const extraLine = reportIdentityLine ? `Identity: ${reportIdentityLine}` : 'Identity: private';
      const fullText = `${extraLine}\n${summary}\n${sexualUi.summaryLabel}: desire/connection score ${sexualOverview.avgPositive}/5, pain ${sexualOverview.pain}/5. ${sexualOverview.state}\n\n${aiResult.text || 'The system could not generate a clear interpretation at this time.'}`;

      const formattedResult = {
        text: fullText,
        sources: aiResult.sources || [],
      };

      setAnalysis(formattedResult);
      dataService.logEvent('LAB_MARKER_ENTRY', {
        rawText: combinedInput,
        analysis: formattedResult.text,
        day: systemState.currentDay,
      });
      setLog(dataService.getLog());
    } catch {
      setAnalysis({ text: 'Analysis interrupted. Please review your markers and references manually.', sources: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!analysis) return;
    const copied = await copyTextSafely(analysis.text);
    setCopyFeedback(copied ? reportActions.copied : reportActions.copyFailed);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const openPrintableWindow = (html: string, autoPrint: boolean) => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760');
    if (!popup) return false;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    if (autoPrint) {
      popup.focus();
      popup.print();
    }
    return true;
  };

  const handleReportCopy = async () => {
    const copied = await copyTextSafely(reportText);
    setReportActionFeedback(copied ? reportActions.copied : reportActions.copyFailed);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportShare = async () => {
    const result = await shareTextSafely(reportText, exportReportUi.reportTitle);
    setReportActionFeedback(result === 'failed' ? reportActions.shareFailed : result === 'shared' ? reportActions.shared : reportActions.copied);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportPrint = async () => {
    const reportHtml = await getReportHtml();
    const ok = openPrintableWindow(reportHtml, true);
    setReportActionFeedback(ok ? reportActions.printOpened : reportActions.printBlocked);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportDownload = async () => {
    const reportHtml = await getReportHtml();
    downloadFile(`luna-report-${reportLang}-${Date.now()}.html`, reportHtml, 'text/html;charset=utf-8');
    setReportActionFeedback(reportActions.downloaded);
    setTimeout(() => setReportActionFeedback(null), 2000);
  };

  const handleReportPdf = async () => {
    const reportHtml = await getReportHtml();
    const ok = openPrintableWindow(reportHtml, true);
    setReportActionFeedback(ok ? reportActions.pdfHint : reportActions.pdfBlocked);
    setTimeout(() => setReportActionFeedback(null), 2400);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isSupportedLabFile(file)) {
      setUploadFeedback(reportsUi.unsupportedFormat);
      event.target.value = '';
      return;
    }

    try {
      const extracted = await extractTextFromLabFile(file);
      if (extracted.text.trim()) {
        setInput((prev) => (prev ? `${prev}\n${extracted.text}` : extracted.text));
      }
      setUploadFeedback(extracted.source + (extracted.usedAi ? ` (${reportsUi.aiScan})` : ''));
    } catch {
      setUploadFeedback(reportsUi.extractFailed);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      {onBack && <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />}
      <MemberPageIntro lang={lang} page="labs" tab="labs" />

      <LunaPageContentSection themeClass={getLunaPageTheme('labs').shellClass} padded={false}>
    <article className="space-y-8 relative dark:text-white">
      <p className="text-base font-medium text-slate-700 dark:text-slate-300 max-w-4xl leading-relaxed">
        {reportsUi.workflow}
      </p>

      <HealthProfileIncompleteNotice variant="labs" lang={lang} onContinue={onOpenHealthProfile} />
      <HealthProfileIncompleteNotice variant="reports" lang={lang} onContinue={onOpenHealthProfile} />
      <div className="grid gap-3 md:grid-cols-2">
        <ProfilePersonalizationBadge profile={phpProfile} surface="labs" />
        <ModuleReadinessPanel profile={phpProfile} />
      </div>

      <section className="rounded-[1.4rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/55 p-5 md:p-6 space-y-3">
        <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{visualGuide.title}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {visualGuide.cards.map((card) => (
            <div key={card.title} className="rounded-xl border border-white/65 dark:border-white/10 bg-white/70 dark:bg-slate-900/45 p-3 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-200">{card.title}</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="luna-vivid-surface rounded-[2rem] p-6 md:p-8 shadow-luna-rich space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple dark:text-[#d8b4fe]">{reportsUi.workflowTitle}</h3>
          <span className="luna-vivid-chip px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200">
            {checklistDoneCount}/{workflowChecklist.length}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-900/10 dark:bg-black/35 border border-white/40 dark:border-white/10 overflow-hidden">
          <span className="block h-full bg-gradient-to-r from-luna-purple via-luna-coral to-teal-500 transition-all duration-500 shadow-[0_0_12px_rgba(124,72,193,0.45)]" style={{ width: `${Math.max(checklistProgress, 6)}%` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {workflowChecklist.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={item.action}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                item.done
                  ? 'luna-vivid-card-alt-3 border-emerald-400/55 dark:border-emerald-500/45 shadow-[0_10px_28px_rgba(16,185,129,0.18)] dark:shadow-[0_10px_28px_rgba(16,185,129,0.12)]'
                  : 'luna-vivid-card-soft border-slate-200/80 dark:border-slate-600/55 hover:border-luna-purple/40 hover:shadow-[0_12px_32px_rgba(124,72,193,0.16)] dark:hover:shadow-[0_12px_32px_rgba(124,72,193,0.22)]'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${item.done ? 'text-emerald-700 dark:text-emerald-300' : 'text-luna-purple dark:text-[#d8b4fe]'}`}>
                {index + 1}
              </p>
              <p className={`mt-1.5 text-xs font-bold leading-snug ${item.done ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-100'}`}>
                {item.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      <Suspense
        fallback={
          <section className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/70 dark:bg-[#0a1d3f]/70 p-6 shadow-luna-rich">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{reportsUi.loadingGuide}</p>
          </section>
        }
      >
        <HormoneTestingGuideLazy lang={lang} />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <section className="xl:col-span-7 space-y-8">
          <article ref={identitySectionRef} className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <h3 className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple">{reportsUi.identityTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={includeIdInReport} onChange={(e) => setIncludeIdInReport(e.target.checked)} />
                {reportsUi.includeId}
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={includeNameInReport} onChange={(e) => setIncludeNameInReport(e.target.checked)} disabled={!userName} />
                {reportsUi.includeName}
              </label>
              <label className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.userIdOverride}</span>
                <input value={manualReportId} onChange={(e) => setManualReportId(e.target.value)} placeholder={reportId} className="w-full px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold" />
              </label>
              <label className="md:col-span-2 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportLangUi.label}</span>
                <select
                  value={reportLang}
                  onChange={(e) => setReportLang(e.target.value as Language)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  {(Object.keys(reportLanguageNames) as Language[]).map((languageCode) => (
                    <option key={languageCode} value={languageCode}>
                      {reportLanguageNames[languageCode]}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{reportLangUi.hint}</p>
              </label>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reportsUi.current}: {reportIdentityLine || reportsUi.privateIdentity}</p>
          </article>

          <article ref={profileSectionRef} className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple">{reportsUi.profileTitle}</h3>
              {onOpenHealthProfile && (
                <button
                  type="button"
                  onClick={onOpenHealthProfile}
                  className="text-[10px] font-black uppercase tracking-[0.12em] text-luna-purple"
                  data-testid="labs-open-health-profile"
                >
                  {hpCopy.openProfile}
                </button>
              )}
            </div>
            {phpCoveredFields.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400" data-testid="labs-php-reuse-notice">
                {hpCopy.phpReusePrefix} {phpCoveredFields.join(', ')}. {hpCopy.phpReuseSuffix}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['birthYear', reportsUi.profileBirthYear],
                ['cycleLength', reportsUi.profileCycleLength],
                ['cycleDay', reportsUi.profileCycleDay],
                ['medications', reportsUi.profileMedications],
                ['knownConditions', reportsUi.profileKnownConditions],
              ]
                .filter(([key]) => !phpCoveredFields.includes(key as keyof LabsDraftProfileFields))
                .map(([key, label]) => (
                <label key={key} className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{label}</span>
                  <input
                    value={profile[key as keyof PersonalHealthProfile]}
                    onChange={(e) => updateProfile(key as keyof PersonalHealthProfile, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold text-slate-800 dark:text-slate-100"
                  />
                </label>
              ))}
              {phpCoveredFields.includes('medications') && (
                <div className="space-y-1" data-testid="labs-php-medications">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.profileMedications}</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile.medications || '—'}</p>
                </div>
              )}
              {phpCoveredFields.includes('knownConditions') && (
                <div className="space-y-1" data-testid="labs-php-conditions">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.profileKnownConditions}</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile.knownConditions || '—'}</p>
                </div>
              )}
              {phpCoveredFields.includes('birthYear') && (
                <div className="space-y-1" data-testid="labs-php-birth-year">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.profileBirthYear}</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile.birthYear || '—'}</p>
                </div>
              )}
              {!phpCoveredFields.includes('goals') ? (
                <label className="md:col-span-2 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.goals}</span>
                  <textarea
                    value={profile.goals}
                    onChange={(e) => updateProfile('goals', e.target.value)}
                    className="w-full h-20 px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-sm font-semibold text-slate-800 dark:text-slate-100 resize-none"
                  />
                </label>
              ) : (
                <div className="md:col-span-2 space-y-1" data-testid="labs-php-goals">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.goals}</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile.goals || '—'}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{reportsUi.symptomsQuick}</p>
              <div className="flex flex-wrap gap-2">
                {quickSymptoms.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-colors ${active ? 'bg-luna-purple text-white border-luna-purple' : 'bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 border-slate-300/70 dark:border-slate-700/70'}`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
              <p className="pt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{sexualUi.intimacySymptomsTitle}</p>
              <div className="flex flex-wrap gap-2">
                {intimacySymptoms.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-colors ${active ? 'bg-luna-coral text-white border-luna-coral' : 'bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 border-slate-300/70 dark:border-slate-700/70'}`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#f9e5ee]/88 via-[#f0e8f7]/84 to-[#e3edf9]/82 dark:from-[#0a1b38]/95 dark:via-[#102448]/94 dark:to-[#142d56]/93 p-6 space-y-4 shadow-luna-rich">
            <h3 className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple">{sexualUi.sexualSnapshotTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                { key: 'libido', label: sexualUi.scoreLabels.libido },
                { key: 'arousal', label: sexualUi.scoreLabels.arousal },
                { key: 'comfort', label: sexualUi.scoreLabels.comfort },
                { key: 'closeness', label: sexualUi.scoreLabels.closeness },
                { key: 'pain', label: sexualUi.scoreLabels.pain },
              ].map((item) => (
                <label key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{item.label}</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{sexualScores[item.key as keyof typeof sexualScores]}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={sexualScores[item.key as keyof typeof sexualScores]}
                    onChange={(e) => updateSexualScore(item.key as keyof typeof sexualScores, Number(e.target.value))}
                    className="w-full accent-luna-purple"
                  />
                </label>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-3 bg-slate-50/70 dark:bg-slate-900/55">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{sexualUi.sexualSnapshotLabel}: {sexualOverview.state}</p>
            </div>
          </article>

          <article ref={labsSectionRef} className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple">{reportsUi.labTable}</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => applyTemplate('hormone_core')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">{reportCategories.cycle}</button>
                <button onClick={() => applyTemplate('thyroid')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">{reportCategories.thyroid}</button>
                <button onClick={() => applyTemplate('metabolic')} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-[10px] font-black uppercase tracking-[0.15em]">{reportCategories.metabolic}</button>
                <button onClick={() => applyTemplate('libido_intimacy')} className="px-3 py-2 rounded-full border border-luna-coral/50 text-luna-coral text-[10px] font-black uppercase tracking-[0.15em]">{sexualUi.libidoTemplate}</button>
                <button onClick={addRow} className="px-3 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.15em]">{reportsUi.addRow}</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-slate-500">
                    <th className="py-2 pr-2">{reportsUi.marker}</th>
                    <th className="py-2 pr-2">{reportsUi.value}</th>
                    <th className="py-2 pr-2">{reportsUi.unit}</th>
                    <th className="py-2 pr-2">{reportsUi.reference}</th>
                    <th className="py-2 pr-2">{reportsUi.date}</th>
                    <th className="py-2 pr-2">{reportsUi.note}</th>
                    <th className="py-2 pr-2"> </th>
                  </tr>
                </thead>
                <tbody>
                  {manualRows.map((row, rowIndex) => (
                    <tr key={row.id} className="border-t border-slate-200/70 dark:border-slate-700/60">
                      {(['marker', 'value', 'unit', 'reference', 'date', 'note'] as Array<keyof HealthLabRow>).map((field) => (
                        <td key={field} className="py-2 pr-2">
                          <input
                            data-testid={`labs-manual-${field}-${rowIndex}`}
                            value={row[field]}
                            onChange={(e) => updateRow(row.id, field, e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 text-xs font-semibold"
                          />
                        </td>
                      ))}
                      <td className="py-2 pr-2">
                        <button onClick={() => removeRow(row.id)} className="px-2 py-1 rounded-md border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{reportsUi.delete}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-[#081a3d]/85 p-6 space-y-4 shadow-luna-rich">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">{reportsUi.uploadTitle}</p>
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple bg-white/80 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-[0.15em]">{reportsUi.uploadFile}</button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv,.md,.pdf,.png,.jpg,.jpeg,.webp,text/plain,application/pdf,image/*" onChange={handleFileUpload} />
            </div>
            <textarea
              data-testid="labs-report-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={reportsUi.uploadPlaceholder}
              className="w-full h-56 p-4 rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/70 text-sm font-semibold leading-relaxed resize-none"
            />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{uploadFeedback || reportsUi.readyExtraction}</p>
                {lastDraftSavedAt && (
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {reportActions.autosaved}: {new Date(lastDraftSavedAt).toLocaleTimeString(uiLocale, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                {!hasLabsReady && (
                  <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">{reportsUi.labsRequiredHint}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  data-testid="labs-clear-draft"
                  onClick={clearDraft}
                  className="px-4 py-3 rounded-full border border-slate-300/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300"
                >
                  {reportActions.clearDraft}
                </button>
                <button
                  data-testid="labs-generate-report"
                  onClick={handleAnalyze}
                  disabled={loading || !hasLabsReady}
                  className="px-6 py-3 rounded-full bg-slate-950 dark:bg-[#17366b] text-white text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-40"
                >
                  {loading ? reportsUi.reading : reportsUi.generate}
                </button>
              </div>
            </div>
          </article>

          {labConflicts.length > 0 && (
            <article data-testid="labs-conflicts-card" className="rounded-[2rem] border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-900/10 p-6 space-y-4 shadow-luna-rich">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-700 dark:text-amber-300">{conflictsUi.title}</h3>
              <p className="text-sm font-semibold text-amber-800/90 dark:text-amber-200/90">{conflictsUi.hint}</p>
              <div className="space-y-3">
                {labConflicts.map((conflict, conflictIndex) => (
                  <div data-testid={`labs-conflict-${conflictIndex}`} key={conflict.key} className="rounded-xl border border-amber-200/80 dark:border-amber-700/50 bg-white/70 dark:bg-slate-900/60 p-3 space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">{conflict.marker}</p>
                    <div className="space-y-2">
                      {conflict.options.map((option, idx) => {
                        const selected = (conflictChoices[conflict.key] ?? 0) === idx;
                        return (
                          <label data-testid={`labs-conflict-option-${conflictIndex}-${idx}`} key={`${conflict.key}-${idx}`} className={`flex items-start gap-3 rounded-lg border p-2 cursor-pointer ${selected ? 'border-amber-400 bg-amber-100/70 dark:bg-amber-900/30' : 'border-slate-300/70 dark:border-slate-700/70'}`}>
                            <input
                              type="radio"
                              name={`conflict-${conflict.key}`}
                              checked={selected}
                              onChange={() => setConflictChoices((prev) => ({ ...prev, [conflict.key]: idx }))}
                              className="mt-1 accent-amber-500"
                            />
                            <div className="space-y-1">
                              <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                                {conflictsUi.choose}: {option.value}{option.unit ? ` ${option.unit}` : ''}
                                {Number.isFinite(option.referenceMin as number) && Number.isFinite(option.referenceMax as number) ? ` (${option.referenceMin}-${option.referenceMax})` : ''}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                {conflictsUi.source}: {sourceLabel(option.source)} • {conflictsUi.confidence}: {confidenceScore(option)}%
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>

        <aside className="xl:col-span-5 space-y-6">
          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#efe1ea]/92 to-[#dce6f4]/90 dark:from-[#08162f]/92 dark:to-[#0b2040]/90 p-6 space-y-3 shadow-luna-rich">
            <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{reportsUi.quickOverview}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/70 dark:bg-slate-900/55 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{reportsUi.withinRange}</p>
                <p data-testid="labs-within-count" className="text-2xl font-black text-emerald-600">{markerStatuses.normal}</p>
              </div>
              <div className="rounded-xl bg-white/70 dark:bg-slate-900/55 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{reportsUi.outOfRange}</p>
                <p data-testid="labs-outofrange-count" className="text-2xl font-black text-rose-600">{markerStatuses.low + markerStatuses.high}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{hormoneSummary}</p>
          </article>

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#e8e6f8]/90 via-[#e7f2fb]/88 to-[#e6f7f3]/86 dark:from-[#0d1f3f]/92 dark:via-[#12294b]/90 dark:to-[#133651]/88 p-6 space-y-4 shadow-luna-rich">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{reportsUi.hormoneInfographic}</p>
              <img src={versionedStaticAsset('/images/moon_phases_arc.webp')} alt={chrome.cycleVisualLabel} className="h-10 w-24 object-cover rounded-lg border border-white/60 dark:border-slate-700/60" />
            </div>
            <div className="space-y-2">
              {hormoneTopicStats.length > 0 ? hormoneTopicStats.map((entry) => (
                <div key={entry.topicKey} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-black uppercase tracking-[0.08em] ${entry.meta.textClass}`}>{entry.meta.label}</p>
                    <p className="text-xs font-black text-slate-600 dark:text-slate-300">{entry.count}</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/70 dark:bg-slate-900/70 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(10, entry.ratio)}%`, background: entry.meta.accent }} />
                  </div>
                </div>
              )) : (
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reportsUi.unlockInfographic}</p>
              )}
            </div>
          </article>

          <article ref={reportSectionRef} className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#f3e5f4]/95 via-[#eee8fb]/92 to-[#e3edf9]/90 dark:from-[#0d1f3f]/95 dark:via-[#132a50]/93 dark:to-[#17345f]/92 p-6 shadow-luna-rich space-y-4">
            <div className="flex items-center gap-3">
              <img src={getBrandAssetUrl('icon')} alt="Luna29 symbol" className="h-10 w-10 object-contain" />
              <div>
                <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{reportUi.reportTitle}</p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{reportUi.reportSubtitle}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/65 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Logo size="sm" className="text-3xl" />
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{profile.cycleDay || systemState.currentDay} {reportsUi.day}</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{reportIdentityLine || reportUi.reportSubtitle}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed line-clamp-4">
                {analysis?.text || 'Add lab markers to generate your report. No sample health data is shown.'}
              </p>
            </div>
            <ReportAttributionBlock
              profile={phpProfile}
              context={profileContext && !isProfileUnavailable(profileContext) ? profileContext : null}
            />
            <ProfilePersonalizationBadge profile={phpProfile} surface="reports" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button onClick={handleReportCopy} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black tracking-[0.05em] text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-tight text-center">{reportUi.copy}</button>
              <button onClick={handleReportPrint} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black tracking-[0.05em] text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-tight text-center">{reportUi.print}</button>
              <button onClick={handleReportShare} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black tracking-[0.05em] text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-tight text-center">{reportUi.share}</button>
              <button onClick={handleReportDownload} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-slate-300/70 dark:border-slate-700/70 text-[10px] font-black tracking-[0.05em] text-slate-700 dark:text-slate-300 whitespace-normal break-words leading-tight text-center">{reportUi.download}</button>
              <button onClick={handleReportPdf} className="px-2.5 py-2.5 min-h-[44px] rounded-lg border border-luna-purple/35 bg-luna-purple/10 text-[10px] font-black tracking-[0.05em] text-luna-purple whitespace-normal break-words leading-tight text-center">{reportUi.pdf}</button>
            </div>
            {reportActionFeedback && <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{reportActionFeedback}</p>}
          </article>

          {hormoneSignals.length > 0 && (
            <article data-testid="labs-doctor-questions-card" className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-[#081a3d]/85 p-6 shadow-luna-rich space-y-4">
              <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{reportsUi.hormoneSignals}</p>
              <div className="space-y-3">
                {hormoneSignals.map((signal, idx) => (
                  <div key={`${signal.marker}-${idx}`} className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-3 bg-slate-50/80 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-black uppercase tracking-[0.1em] ${hormoneTopic(signal.marker).textClass}`}>{signal.hormone}</p>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${statusColor(signal.status)}`}>{signal.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.08em] ${hormoneTopic(signal.marker).chipClass}`}>{hormoneTopic(signal.marker).label}</span>
                      <p className={`text-xs font-semibold ${hormoneTopic(signal.marker).textClass}`}>{signal.marker}: {signal.value}</p>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{signal.importance}</p>
                  </div>
                ))}
              </div>
            </article>
          )}

          {libidoHormoneSignals.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#fde9ef]/90 via-[#f4e8f7]/86 to-[#e8f0fb]/84 dark:from-[#10243f]/94 dark:via-[#173053]/93 dark:to-[#1a3b60]/92 p-6 shadow-luna-rich space-y-4">
              <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{sexualUi.intimacyFactors}</p>
              <div className="space-y-2">
                {libidoHormoneSignals.slice(0, 6).map((signal, idx) => (
                  <div key={`${signal.marker}-${idx}`} className="flex items-center justify-between rounded-lg border border-slate-200/70 dark:border-slate-700/70 px-3 py-2 bg-slate-50/70 dark:bg-slate-900/45">
                    <p className={`text-xs font-semibold ${hormoneTopic(signal.marker).textClass}`}>{signal.marker}</p>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.08em] ${statusColor(signal.status)}`}>{signal.status}</span>
                  </div>
                ))}
              </div>
            </article>
          )}

          {doctorQuestions.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-[#081a3d]/85 p-6 shadow-luna-rich space-y-4">
              <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{reportsUi.questionsDoctor}</p>
              <ul className="space-y-2">
                {doctorQuestions.map((question) => (
                  <li key={question} className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">• {question}</li>
                ))}
              </ul>
            </article>
          )}

          {parsedRows.length > 0 && (
            <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/85 dark:bg-[#081a3d]/85 p-6 shadow-luna-rich space-y-4">
              <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{reportsUi.detectedMarkers}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left uppercase tracking-[0.12em] text-slate-500">
                      <th className="py-2 pr-2">{reportsUi.marker}</th>
                      <th className="py-2 pr-2">{reportsUi.value}</th>
                      <th className="py-2 pr-2">{reportsUi.refShort}</th>
                      <th className="py-2 pr-2">{reportsUi.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedValues.map((item, idx) => {
                      const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
                      return (
                        <tr key={`${item.marker}-${idx}`} className="border-t border-slate-200/70 dark:border-slate-700/60">
                          <td className={`py-2 pr-2 font-semibold ${hormoneTopic(item.marker).textClass}`}>{item.marker}</td>
                          <td className="py-2 pr-2">{item.value}{item.unit ? ` ${item.unit}` : ''}</td>
                          <td className="py-2 pr-2">{Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number) ? `${item.referenceMin}-${item.referenceMax}` : reportsUi.na}</td>
                          <td className="py-2 pr-2"><span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.08em] ${statusColor(status)}`}>{status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {analysis ? (
            <article className="rounded-[2rem] border border-slate-800/70 dark:border-slate-700/70 bg-slate-950 text-white dark:bg-[#08162f] p-6 shadow-luna-deep space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{reportsUi.summaryTitle}</p>
              <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{analysis.text}</p>
              <button onClick={handleCopy} className="text-[10px] font-black uppercase tracking-[0.15em] border-b border-white/60 pb-1">{copyFeedback || reportsUi.copyDoctor}</button>
            </article>
          ) : (
            <article className="rounded-[2rem] border-2 border-dashed border-slate-300/80 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/50 p-6 text-center">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">{reportsUi.reportReadyTitle}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2">{reportsUi.reportReadyBody}</p>
            </article>
          )}

          <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 p-6 space-y-2">
            <p className="text-sm md:text-base font-black uppercase tracking-[0.14em] text-luna-purple">{reportsUi.safetyTitle}</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{reportsUi.safetyBody}</p>
          </article>
        </aside>
      </div>
    </article>
      </LunaPageContentSection>
    </>
  );
};
