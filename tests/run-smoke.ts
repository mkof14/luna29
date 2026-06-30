import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { runRuleEngine } from '../services/ruleEngine';
import { dataService } from '../services/dataService';
import { HormoneStatus, PartnerNoteBoundary, PartnerNoteIntent, PartnerNoteTone } from '../types';
import {
  analyzeLabResults,
  generateBridgeLetter,
  generatePartnerNote,
  generatePsychologistResponse,
  generateStateNarrative
} from '../services/geminiService';
import { mergeParsedLabValues, parseLabText } from '../services/healthReportService';
import { incrementBridgeUsage, isSupportedLabFile, parseBridgeUsage } from '../utils/runtimeGuards';
import { getCyclePhaseByDay } from '../utils/cycle';
import { buildBottomNavItems, buildSidebarGroups, buildTopNavItems } from '../utils/navigation';
import { normalizeBridgeReflectionInput, normalizePartnerNoteInput } from '../utils/bridge';
import { getMedicationValidationError, isMedicationDuplicate, normalizeMedicationInput } from '../utils/medications';
import { normalizeProfileData } from '../utils/profile';
import { copyTextSafely, shareTextSafely } from '../utils/share';
import { hasMeaningfulText, normalizeUserText } from '../utils/text';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_USER_AGE } from '../constants/appDefaults';
import { buildDetailedReportPayload } from '../utils/labsReportPayload';
import { buildDetailedReportHtml } from '../utils/reportHtmlTemplate';
import { getLabsViewLocalizedContent } from '../utils/labsViewContent';
import { createDefaultSexualScores, sanitizeLabsDraft } from '../utils/labsDraft';

type StorageMap = Map<string, string>;

const createLocalStorageMock = () => {
  const store: StorageMap = new Map();

  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    }
  };
};

const setBrowserMocks = () => {
  const localStorageMock = createLocalStorageMock();
  (globalThis as unknown as { localStorage: Storage }).localStorage = localStorageMock as unknown as Storage;
};

const testRuleEngine = () => {
  const stormOutput = runRuleEngine({
    age: 30,
    cycleDay: 24,
    cycleLength: 28,
    symptoms: ['irritability', 'anxiety'],
    medications: [],
    labMarkers: {}
  });

  assert.equal(stormOutput.hormoneStatuses.cortisol, HormoneStatus.UNSTABLE, 'cortisol should be unstable for stress cluster');
  assert.ok(
    stormOutput.doctorQuestions.some((q) => q.question.includes('stress response')),
    'doctor question for stress response should be present'
  );

  const ovulationOutput = runRuleEngine({
    age: 30,
    cycleDay: 13,
    cycleLength: 28,
    symptoms: [],
    medications: [],
    labMarkers: {}
  });

  assert.equal(ovulationOutput.hormoneStatuses.estrogen, HormoneStatus.PEAK, 'estrogen should peak in ovulatory window');
};

const testDataService = () => {
  localStorage.clear();

  dataService.logEvent('ONBOARDING_COMPLETE', {});
  dataService.logEvent('CYCLE_SYNC', { day: 9, length: 28 });
  dataService.logEvent('FUEL_LOG', { nutrient: 'protein' });
  dataService.logEvent('PROFILE_UPDATE', {
    name: '<Alice>',
    conditions: 'none<script>'
  });

  const log = dataService.getLog();
  const profilePayload = log[3].payload as { name?: string; conditions?: string };
  assert.equal(log.length, 4, '4 events should be saved');
  assert.equal(profilePayload.name, 'Alice', 'angle brackets must be stripped from profile name');
  assert.equal(profilePayload.conditions, 'nonescript', 'profile string payload should be sanitized');
  assert.equal(log[3].version, 4, 'event version should be 4');

  const state = dataService.projectState(log);
  assert.equal(state.onboarded, true, 'state should be onboarded');
  assert.equal(state.currentDay, 9, 'cycle day should follow CYCLE_SYNC');
  assert.ok(state.fuelLogs.includes('protein'), 'today fuel log should be projected');
  assert.equal(state.profile.name, 'Alice', 'profile projection should include sanitized name');
};

const testRuntimeGuards = () => {
  const now = new Date('2026-03-02T10:00:00.000Z');

  const invalid = parseBridgeUsage('broken-json', now);
  assert.equal(invalid.count, 0, 'invalid bridge usage should reset count');

  const oldWeek = parseBridgeUsage(JSON.stringify({ count: 2, weekStart: '2026-02-20T10:00:00.000Z' }), now);
  assert.equal(oldWeek.count, 0, 'bridge usage older than a week should reset');

  const incremented = incrementBridgeUsage(JSON.stringify({ count: 1, weekStart: '2026-03-01T10:00:00.000Z' }), now);
  assert.equal(incremented.count, 2, 'bridge usage should increment');
  assert.equal(incremented.weekStart, '2026-03-01T10:00:00.000Z', 'bridge weekStart should stay stable in current week');

  assert.equal(isSupportedLabFile({ name: 'labs.txt', type: 'text/plain' }), true, 'text file should be supported');
  assert.equal(isSupportedLabFile({ name: 'scan.png', type: 'image/png' }), true, 'image file should be supported for scan flow');
  assert.equal(isSupportedLabFile({ name: 'report.pdf', type: 'application/pdf' }), true, 'pdf file should be supported for scan flow');
};

const testLabTextParsing = () => {
  const parsed = parseLabText(
    [
      'TSH\t4.8\tmIU/L\t0.4-4.0',
      'Estradiol (E2); 148; pg/mL; 30-400',
      'ТТГ 3.1 мМЕ/л 0.4-4.0',
      'PRL 19 ng/mL 4.8-23.3',
      'プロラクチン 26 ng/mL 4.8-23.3',
      'Ferritin 18 ng/mL',
      'Cycle day 21',
    ].join('\n')
  );

  assert.equal(parsed.length >= 4, true, 'parser should extract at least 4 valid lab rows');
  assert.equal(parsed.some((item) => item.marker.toLowerCase().includes('tsh') && item.value === 4.8), true, 'tab-delimited tsh row should parse');
  assert.equal(parsed.some((item) => item.marker === 'TSH' && item.value === 3.1), true, 'localized tsh alias should normalize to TSH');
  assert.equal(parsed.some((item) => item.marker === 'Prolactin' && item.value === 19), true, 'PRL alias should normalize to Prolactin');
  assert.equal(parsed.some((item) => item.marker.toLowerCase().includes('estradiol') && item.referenceMin === 30 && item.referenceMax === 400), true, 'semicolon-delimited estradiol row should parse with reference');
  assert.equal(parsed.some((item) => item.marker.toLowerCase().includes('cycle day')), false, 'non-lab helper lines should be ignored');
};

const testLabMergeResolver = () => {
  const merged = mergeParsedLabValues([
    { marker: 'E2', value: 120, unit: 'pg/mL' },
    { marker: 'Estradiol', value: 132, unit: 'pg/mL', referenceMin: 30, referenceMax: 400 },
    { marker: 'ТТГ', value: 2.8, unit: 'mIU/L' },
    { marker: 'TSH', value: 3.1, unit: 'mIU/L', referenceMin: 0.4, referenceMax: 4.0 },
  ]);

  assert.equal(merged.length, 2, 'duplicate markers should be merged by canonical marker key');
  assert.equal(
    merged.some((item) => item.marker === 'Estradiol (E2)' && item.value === 132 && item.referenceMin === 30 && item.referenceMax === 400),
    true,
    'merge should keep richer estradiol entry with reference range'
  );
  assert.equal(
    merged.some((item) => item.marker === 'TSH' && item.value === 3.1 && item.referenceMin === 0.4 && item.referenceMax === 4),
    true,
    'merge should keep richer TSH entry with reference range'
  );

  const selected = mergeParsedLabValues(
    [
      { marker: 'TSH', value: 2.2, unit: 'mIU/L', source: 'manual' },
      { marker: 'TSH', value: 3.8, unit: 'mIU/L', referenceMin: 0.4, referenceMax: 4.0, source: 'ocr' },
    ],
    { tsh: 1 }
  );
  assert.equal(selected.length, 1, 'selection merge should still output one row per marker');
  assert.equal(selected[0].value, 3.8, 'selected conflict option should be respected');
};

const testAuthSecurityInvariants = () => {
  const apiCode = readFileSync(path.join(process.cwd(), 'api/index.mjs'), 'utf8');
  const authCode = readFileSync(path.join(process.cwd(), 'services/authService.ts'), 'utf8');

  assert.equal(
    apiCode.includes("pattern: /admin|owner|founder/i, role: 'super_admin'"),
    false,
    'super_admin must not be auto-assigned from generic email patterns'
  );
  assert.equal(
    apiCode.includes("|| 'LunaAdmin2026!'"),
    false,
    'server must not include hardcoded super admin default password fallback'
  );
  assert.equal(
    authCode.includes("return 'LunaAdmin2026!'"),
    false,
    'client local auth must not include hardcoded super admin fallback password'
  );
};

const testGeminiFallbacks = async () => {
  const bridgeOk = await generateBridgeLetter({
    language: 'en',
    reflection: {
      quiet_presence: 'I feel overloaded',
      not_meaning: 'I do not love you',
      kindness_needed: 'a calmer evening'
    }
  });
  assert.ok(!('error' in bridgeOk), 'bridge letter should return fallback content with valid input');

  const bridgeError = await generateBridgeLetter({
    language: 'en',
    reflection: { quiet_presence: '', not_meaning: '', kindness_needed: '' }
  });
  assert.ok('error' in bridgeError, 'bridge letter should return validation error for empty reflection');

  const partner = await generatePartnerNote({
    state_energy: 'low',
    state_sensitivity: 'high',
    state_social_bandwidth: 'low',
    state_cognitive_load: 'high',
    relationship_context: 'stable',
    intent: PartnerNoteIntent.UNDERSTANDING,
    tone: PartnerNoteTone.CALM,
    boundary_level: PartnerNoteBoundary.SOFT,
    partner_name: 'Alex',
    language: 'en'
  });

  assert.ok(!('error' in partner), 'partner note should produce fallback variants');
  if (!('error' in partner)) {
    assert.equal(partner.messages.text.length, 3, 'partner fallback should provide 3 text options');
  }

  const narrative = await generateStateNarrative('Luteal', 22, [], { energy: 2, stress: 4 }, 'en');
  assert.ok(narrative.includes('Day 22'), 'state narrative should include cycle day');

  const psych = await generatePsychologistResponse('I feel tired', 'en');
  assert.equal(psych.audio, null, 'psychologist fallback should not produce audio in local mode');

  const labResult = await analyzeLabResults(
    'TSH 2.4',
    {
      events: [],
      onboarded: true,
      isAuthenticated: false,
      subscriptionTier: 'none',
      currentDay: 12,
      cycleLength: 28,
      medications: [],
      symptoms: [],
      labData: '',
      fuelLogs: [],
      profile: {
        name: '',
        birthDate: '',
        lastUpdated: '',
        weight: '',
        height: '',
        bloodType: '',
        allergies: '',
        conditions: '',
        recentInterventions: '',
        contraception: '',
        stressBaseline: 'medium',
        sensitivities: [],
        mentalArchetype: '',
        familyHistory: '',
        menarcheAge: '',
        units: 'metric'
      }
    },
    'en'
  );
  assert.equal(Array.isArray(labResult.sources), true, 'lab fallback should return sources array');
  assert.ok(labResult.text.includes('TSH 2.4'), 'lab fallback should preserve snapshot excerpt');
};

const testCoreUtils = () => {
  assert.equal(DEFAULT_USER_AGE, 30, 'default user age should stay stable');
  assert.equal(DEFAULT_CYCLE_LENGTH, 28, 'default cycle length should stay stable');

  assert.equal(getCyclePhaseByDay(1), 'Menstrual', 'day 1 should map to Menstrual phase');
  assert.equal(getCyclePhaseByDay(10), 'Follicular', 'day 10 should map to Follicular phase');
  assert.equal(getCyclePhaseByDay(14), 'Ovulatory', 'day 14 should map to Ovulatory phase');
  assert.equal(getCyclePhaseByDay(22), 'Luteal', 'day 22 should map to Luteal phase');

  const ui = {
    navigation: {
      home: 'Home',
      cycle: 'Cycle',
      reflections: 'Reflections',
      labs: 'Labs',
      meds: 'Meds',
      bridge: 'Bridge',
      library: 'Library',
      history: 'History',
      creative: 'Creative',
      family: 'Family',
      profile: 'Profile',
      faq: 'FAQ',
      contact: 'Contact',
      crisis: 'Crisis',
      partner_faq: 'Partner FAQ',
      healthHub: 'Health Hub'
    }
  };

  const sidebar = buildSidebarGroups(ui);
  const top = buildTopNavItems(ui);
  const bottom = buildBottomNavItems(ui);

  assert.equal(sidebar.length, 5, 'sidebar should have five groups');
  assert.equal(top.length, 5, 'top nav should include five main items');
  assert.equal(bottom.length, 5, 'bottom nav should include five main items');
  assert.equal(sidebar[0].items[0].id, 'today_mirror', 'first sidebar item should be today_mirror');
  assert.equal(top[2].id, 'cycle', 'top nav third item should be cycle');
  assert.equal(bottom[0].id, 'today_mirror', 'first bottom item should be today_mirror');
  assert.ok(
    sidebar[2].items.some((item) => item.id === 'rhythm_calendar'),
    'insights group should include rhythm calendar',
  );
};

const testMedicationUtils = () => {
  const meds = [
    {
      id: 'm1',
      name: 'Magnesium',
      dose: '200mg',
      observations: [],
      notes: '',
      addedAt: '2026-03-02T10:00:00.000Z'
    }
  ];

  const normalized = normalizeMedicationInput('  Magnesium ', ' 200mg ');
  assert.equal(normalized.name, 'Magnesium', 'name should be trimmed');
  assert.equal(normalized.dose, '200mg', 'dose should be trimmed');

  assert.equal(
    isMedicationDuplicate(meds, 'magnesium', '200MG'),
    true,
    'duplicate check should be case-insensitive'
  );
  assert.equal(
    isMedicationDuplicate(meds, 'Magnesium', '100mg'),
    false,
    'different dose should not be duplicate'
  );

  assert.equal(
    getMedicationValidationError(meds, '', '100mg'),
    'Name is required.',
    'empty name should return validation error'
  );
  assert.equal(
    getMedicationValidationError(meds, 'Magnesium', '200mg'),
    'This support profile already exists.',
    'existing profile should return duplicate validation error'
  );
  assert.equal(
    getMedicationValidationError(meds, 'Zinc', '25mg'),
    null,
    'new profile should pass validation'
  );
};

const testTextUtils = () => {
  assert.equal(
    normalizeUserText('  hello    world  '),
    'hello world',
    'normalizeUserText should trim and collapse whitespace'
  );
  assert.equal(
    hasMeaningfulText('   \n\t  '),
    false,
    'hasMeaningfulText should reject blank whitespace-only input'
  );
  assert.equal(
    hasMeaningfulText('  ok  '),
    true,
    'hasMeaningfulText should accept non-empty normalized input'
  );
};

const testProfileUtils = () => {
  localStorage.clear();

  const normalized = normalizeProfileData({
    name: '  Anna   Maria  ',
    birthDate: ' 1995-03-10 ',
    lastUpdated: '',
    weight: ' 65 ',
    height: ' 170 ',
    bloodType: ' O+ ',
    allergies: '  pollen   dust ',
    conditions: '  none  ',
    recentInterventions: '  yearly   checkup ',
    contraception: '  none ',
    stressBaseline: ' medium ',
    sensitivities: ['  Noise ', 'Noise', '  ', ' Bright   Light '],
    mentalArchetype: '  steady ',
    familyHistory: '  thyroid   issues ',
    menarcheAge: ' 13 ',
    units: 'metric'
  });

  dataService.logEvent('PROFILE_UPDATE', normalized);
  const projected = dataService.projectState(dataService.getLog()).profile;

  assert.equal(projected.name, 'Anna Maria', 'profile name should be normalized');
  assert.equal(projected.birthDate, '1995-03-10', 'birthDate should be trimmed');
  assert.equal(projected.allergies, 'pollen dust', 'allergies should collapse whitespace');
  assert.equal(projected.stressBaseline, 'medium', 'stressBaseline should be trimmed');
  assert.deepEqual(
    projected.sensitivities,
    ['Noise', 'Bright Light'],
    'sensitivities should be normalized, deduplicated and empty values removed'
  );
};

const testBridgeUtils = () => {
  const normalizedReflection = normalizeBridgeReflectionInput({
    language: ' EN ',
    reflection: {
      quiet_presence: '  I feel   tense ',
      not_meaning: ' not about   you ',
      kindness_needed: '  a  calm evening  ',
    },
  });

  assert.equal(normalizedReflection.language, 'en', 'bridge input language should be normalized');
  assert.equal(normalizedReflection.reflection.quiet_presence, 'I feel tense', 'bridge quiet_presence should normalize whitespace');
  assert.equal(normalizedReflection.reflection.not_meaning, 'not about you', 'bridge not_meaning should normalize whitespace');
  assert.equal(normalizedReflection.reflection.kindness_needed, 'a calm evening', 'bridge kindness_needed should normalize whitespace');

  const normalizedPartnerInput = normalizePartnerNoteInput({
    state_energy: 'low',
    state_sensitivity: 'high',
    state_social_bandwidth: 'medium',
    state_cognitive_load: 'high',
    relationship_context: 'stable',
    intent: PartnerNoteIntent.UNDERSTANDING,
    tone: PartnerNoteTone.CALM,
    boundary_level: PartnerNoteBoundary.SOFT,
    partner_name: '  Alex  ',
    preferred_terms: '  be gentle ',
    avoid_terms: ['  blame ', ' ', ' pressure  '],
    language: ' EN ',
  });

  assert.equal(normalizedPartnerInput.partner_name, 'Alex', 'partner_name should be normalized');
  assert.equal(normalizedPartnerInput.preferred_terms, 'be gentle', 'preferred_terms should be normalized');
  assert.deepEqual(normalizedPartnerInput.avoid_terms, ['blame', 'pressure'], 'avoid_terms should be normalized and empty entries removed');
  assert.equal(normalizedPartnerInput.language, 'en', 'partner input language should be normalized');
};

const testShareUtils = async () => {
  const clipboardStore: { text: string } = { text: '' };
  const okClipboardEnv = {
    clipboard: {
      writeText: async (text: string) => {
        clipboardStore.text = text;
      },
    },
  };

  const copied = await copyTextSafely('hello', okClipboardEnv);
  assert.equal(copied, true, 'copyTextSafely should return true for writable clipboard');
  assert.equal(clipboardStore.text, 'hello', 'clipboard should receive copied text');

  const shared = await shareTextSafely('hello', 'Title', {
    ...okClipboardEnv,
    share: async () => {},
  });
  assert.equal(shared, 'shared', 'shareTextSafely should prefer native share when available');

  const copiedFallback = await shareTextSafely('fallback', 'Title', okClipboardEnv);
  assert.equal(copiedFallback, 'copied', 'shareTextSafely should fallback to clipboard');

  const failed = await shareTextSafely('x', 'Title', {
    clipboard: {
      writeText: async () => {
        throw new Error('clipboard blocked');
      },
    },
  });
  assert.equal(failed, 'failed', 'shareTextSafely should fail when both share and clipboard fail');
};

const testDetailedReportBuilders = () => {
  const payload = buildDetailedReportPayload({
    reportOrigin: 'https://example.test',
    analysisText: 'Clinical summary text for a patient report.',
    analysisSource: 'manual table + text input',
    parsedValues: [
      { marker: 'TSH', value: 4.8, unit: 'mIU/L', referenceMin: 0.4, referenceMax: 4.0 },
      { marker: 'Estradiol (E2)', value: 120, unit: 'pg/mL', referenceMin: 30, referenceMax: 400 },
    ],
    doctorQuestions: ['Could elevated TSH explain fatigue and cycle delay?'],
    hormoneTopicStats: [
      { count: 1, ratio: 50, meta: { accent: '#0ea5e9', label: 'Thyroid' } },
      { count: 1, ratio: 50, meta: { accent: '#7c3aed', label: 'Cycle' } },
    ],
    womenClinicalInsights: {
      combinations: [{ level: 'high', title: 'Thyroid Slowdown Pattern', body: 'Pattern may correlate with low energy and cold sensitivity.' }],
      effects: ['Fatigue may increase during late luteal phase.'],
      risks: ['Cycle irregularity risk may increase if trend persists.'],
      recommendations: ['Repeat thyroid panel in 6-10 weeks.'],
    },
    sexualOverview: { avgPositive: 3.2, pain: 2 },
    profileCycleDay: '21',
    currentDay: 21,
    reportIdentityLine: 'Report ID: LUNA29-TEST',
    reportGeneratedAt: '3/8/2026, 3:00:00 PM',
    reportCopyright: 'Copyright © 2026 Luna29 Balance. All rights reserved.',
    detailedUi: {
      title: 'Luna29 Clinical Report',
      subtitle: 'Detailed physiological interpretation for care discussion',
      keyFindings: 'Key Findings',
      explanation: 'Explanation',
      whatHappening: 'What Is Happening In Your Body',
      doctorQuestions: 'Questions To Discuss With Your Doctor',
      noQuestions: 'No priority questions generated yet.',
      noMarkers: 'No markers added yet.',
    },
    medForm: {
      generatedAt: 'Generated At',
      patientId: 'Patient ID',
      source: 'Analysis Source',
      allMarkers: 'All Lab Indicators',
      disclaimerTitle: 'MEDICAL DISCLAIMER',
      disclaimerBody: 'THIS REPORT IS INFORMATIONAL ONLY.',
    },
    reportsUi: {
      withinRange: 'Within range',
      outOfRange: 'Out of range',
      quickOverview: 'Quick Overview',
      na: 'n/a',
      day: 'day',
      hormoneInfographic: 'Hormone Infographic',
      detectedMarkers: 'Detected Markers',
      hormoneSignals: 'Hormone Signals',
      marker: 'Marker',
      value: 'Value',
      reference: 'Reference',
      status: 'Status',
      privateIdentity: 'Private',
      reportReadyBody: 'Report ready',
    },
    sexualUi: {
      sexualSnapshotTitle: 'Sexual Wellbeing Snapshot',
      summaryLabel: 'Sexual health snapshot',
      scoreLabels: { pain: 'Pain During Intimacy' },
    },
    womenUi: {
      stable: 'Stable',
      watch: 'Watch',
      highPriority: 'High Priority',
      clinicalFocusTitle: 'Women-Specific Clinical Focus',
      clinicalFocusLead: 'Clinical focus lead.',
      effectsTitle: 'Potential Effects',
      risksTitle: 'Potential Risks',
      recommendationsTitle: 'Actionable Recommendations',
      combinationsTitle: 'Hormone Combinations',
      noData: 'No data.',
    },
    markerCategory: (marker) => (marker.toLowerCase().includes('tsh') ? 'Thyroid' : 'Cycle'),
    markerStatusExplanation: (status) => `status:${status}`,
    hormoneTopic: (text) => (text.toLowerCase().includes('tsh') ? { accent: '#0ea5e9', label: 'Thyroid' } : { accent: '#7c3aed', label: 'Cycle' }),
  });

  assert.equal(payload.patientIdValue, 'Report ID: LUNA29-TEST', 'payload should keep selected report identity');
  assert.equal(payload.totalMarkers, 2, 'payload should count parsed markers');
  assert.equal(payload.disclaimerTitle, 'MEDICAL DISCLAIMER', 'payload should expose medical disclaimer title');
  assert.equal(payload.logoUrl, 'https://example.test/brand/luna-lockup.png', 'payload should build branded logo URL from origin');

  const html = buildDetailedReportHtml(payload);
  assert.equal(html.includes('Luna29 Clinical Report'), true, 'html should include report title');
  assert.equal(html.includes('MEDICAL DISCLAIMER'), true, 'html should include disclaimer title');
  assert.equal(html.includes('Report ID: LUNA29-TEST'), true, 'html should include selected identity line');
  assert.equal(html.includes('Thyroid Slowdown Pattern'), true, 'html should include women-specific clinical insights');
  assert.equal(html.includes('Copyright © 2026'), true, 'html should include 2026 copyright');
};

const testLabsLocalizationCoverage = () => {
  const langs = ['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt'] as const;
  for (const lang of langs) {
    for (const reportLang of langs) {
      const localized = getLabsViewLocalizedContent(lang, reportLang);
      assert.ok(localized.reportsUi.title.trim().length > 0, `reports title should be non-empty for lang=${lang}`);
      assert.ok(localized.reportsUi.generate.trim().length > 0, `reports generate label should be non-empty for lang=${lang}`);
      assert.ok(localized.reportUi.reportTitle.trim().length > 0, `report title should be non-empty for reportLang=${reportLang}`);
      assert.ok(localized.reportUi.sampleDownload.trim().length > 0, `sample download label should be non-empty for reportLang=${reportLang}`);
      assert.ok(localized.medForm.disclaimerTitle.trim().length > 0, `disclaimer title should be non-empty for reportLang=${reportLang}`);
      assert.ok(localized.medForm.disclaimerBody.trim().length > 0, `disclaimer body should be non-empty for reportLang=${reportLang}`);
      assert.ok(localized.reportActions.downloaded.trim().length > 0, `report action feedback should be non-empty for lang=${lang}`);
      assert.ok(localized.reportActions.clearDraft.trim().length > 0, `clear draft label should be non-empty for lang=${lang}`);
      assert.ok(localized.reportActions.autosaved.trim().length > 0, `autosaved label should be non-empty for lang=${lang}`);
      assert.ok(localized.conflictsUi.title.trim().length > 0, `conflicts title should be non-empty for lang=${lang}`);
      assert.ok(localized.womenUi.clinicalFocusTitle.trim().length > 0, `women clinical title should be non-empty for reportLang=${reportLang}`);
      assert.ok(localized.detailedUi.title.trim().length > 0, `detailed report title should be non-empty for reportLang=${reportLang}`);
      assert.equal(typeof localized.locale, 'string', `locale should be string for reportLang=${reportLang}`);
      assert.ok(localized.locale.includes('-'), `locale should be normalized with region for reportLang=${reportLang}`);
      assert.ok((localized.reportLanguageNames[reportLang] ?? localized.reportLanguageNames.en).trim().length > 0, `report language name should exist for ${reportLang}`);
      assert.equal(localized.visualGuide.cards.length >= 1, true, `visual guide should have cards for lang=${lang}`);
      assert.equal(localized.reportUi.serviceBullets.length >= 3, true, `service bullets should have enough items for reportLang=${reportLang}`);
    }
  }
};

const testLabsDraftSanitizer = () => {
  const fallbackProfile = {
    birthYear: '1990',
    cycleLength: '28',
    cycleDay: '10',
    medications: '',
    knownConditions: '',
    goals: '',
  };

  const draft = sanitizeLabsDraft(
    {
      input: 1234,
      manualRows: [{ marker: 'TSH', value: '4.2', unit: 'mIU/L' }, { marker: '', value: '' }, { marker: 12 }],
      selectedSymptoms: ['Fatigue', '', 22, 'Low mood'],
      sexualScores: { libido: 99, arousal: -5, comfort: 3.4, closeness: '4', pain: 'NaN' },
      includeNameInReport: 'true',
      includeIdInReport: false,
      manualReportId: '   ID-1   ',
      reportLang: 'ru',
      profile: { birthYear: '1988', cycleLength: 28, cycleDay: '12', goals: 'stability' },
    },
    'en',
    fallbackProfile,
  );

  assert.equal(draft.input, '', 'non-string draft input should sanitize to empty string');
  assert.equal(draft.manualRows.length, 1, 'draft rows should keep only meaningful sanitized rows');
  assert.equal(draft.manualRows[0].marker, 'TSH', 'draft row marker should be sanitized');
  assert.deepEqual(draft.selectedSymptoms, ['Fatigue', 'Low mood'], 'draft symptoms should keep only valid strings');
  assert.deepEqual(draft.sexualScores, { libido: 5, arousal: 1, comfort: 3, closeness: 4, pain: 1 }, 'draft scores should clamp to 1..5');
  assert.equal(draft.includeNameInReport, true, 'draft includeName flag should coerce to boolean');
  assert.equal(draft.includeIdInReport, false, 'draft includeId should respect explicit false');
  assert.equal(draft.reportLang, 'ru', 'draft reportLang should keep valid language');
  assert.equal(draft.profile.birthYear, '1988', 'draft profile should keep valid string fields');
  assert.equal(draft.profile.cycleLength, '28', 'draft profile should fallback for invalid field types');

  const fallbackDraft = sanitizeLabsDraft({ reportLang: 'xx', sexualScores: {} }, 'en', fallbackProfile);
  assert.equal(fallbackDraft.reportLang, 'en', 'invalid report language should fallback');
  assert.deepEqual(fallbackDraft.sexualScores, createDefaultSexualScores(), 'empty scores should fallback to defaults');
};

const run = async () => {
  setBrowserMocks();
  testRuleEngine();
  testDataService();
  testRuntimeGuards();
  testLabTextParsing();
  testLabMergeResolver();
  testAuthSecurityInvariants();
  testCoreUtils();
  testMedicationUtils();
  testTextUtils();
  testProfileUtils();
  testBridgeUtils();
  testDetailedReportBuilders();
  testLabsLocalizationCoverage();
  testLabsDraftSanitizer();
  await testShareUtils();
  await testGeminiFallbacks();
  console.log('Smoke tests passed: ruleEngine + dataService + runtimeGuards + labParser + labMerge + authSecurity + coreUtils + medicationsUtils + textUtils + profileUtils + bridgeUtils + reportBuilders + labsLocalization + labsDraft + shareUtils + geminiFallbacks');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
