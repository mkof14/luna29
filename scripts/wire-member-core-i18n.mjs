#!/usr/bin/env node
/**
 * Replace inline LangCopy blocks with imports from utils/memberCoreI18n.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const replaceBetween = (text, startMarker, endMarker, replacement) => {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start);
  if (start === -1 || end === -1) throw new Error(`Markers not found: ${startMarker}`);
  return text.slice(0, start) + replacement + text.slice(end);
};

// ─── BridgeView ──────────────────────────────────────────────────────────────
{
  const path = join(ROOT, 'components/BridgeView.tsx');
  let text = readFileSync(path, 'utf8');
  if (!text.includes("from '../utils/memberCoreI18n'")) {
    text = text.replace(
      "import { canUseBridgeReflection } from '../utils/subscriptionAccess';",
      "import { canUseBridgeReflection } from '../utils/subscriptionAccess';\nimport { BRIDGE_FLOW_COPY, BRIDGE_INFO_COPY } from '../utils/memberCoreI18n';",
    );
  }
  text = replaceBetween(
    text,
    '  const copyByLang: LangCopy<',
    '  const info = getLang(infoByLang, lang) || infoByLang.en;',
    `  const copy = getLang(BRIDGE_FLOW_COPY, lang) || BRIDGE_FLOW_COPY.en;\n  const info = getLang(BRIDGE_INFO_COPY, lang) || BRIDGE_INFO_COPY.en;`,
  );
  writeFileSync(path, text);
  console.log('BridgeView.tsx wired');
}

// ─── CycleTimeline ───────────────────────────────────────────────────────────
{
  const path = join(ROOT, 'components/CycleTimeline.tsx');
  let text = readFileSync(path, 'utf8');
  if (!text.includes("from '../utils/memberCoreI18n'")) {
    text = text.replace(
      "import { JourneyProgress } from './JourneyProgress';",
      "import { JourneyProgress } from './JourneyProgress';\nimport {\n  CYCLE_PHASE_NAMES,\n  CYCLE_UI_COPY,\n  CYCLE_LUNA_BALANCE_COPY,\n  CYCLE_INNER_WEATHER_COPY,\n  CYCLE_PHASE_SEASON_COPY,\n  CYCLE_SENSITIVITY_LABELS,\n} from '../utils/memberCoreI18n';",
    );
  }
  text = replaceBetween(
    text,
    '  const phaseNamesByLang: LangCopy<',
    '  he: {},};',
    `  const phaseNamesByLang = CYCLE_PHASE_NAMES;
  const uiByLang = CYCLE_UI_COPY;
  const lunaBalanceByLang = CYCLE_LUNA_BALANCE_COPY;
  const innerWeatherByLang = CYCLE_INNER_WEATHER_COPY;
  const phaseSeasonByLang = CYCLE_PHASE_SEASON_COPY;
  const sensitivityByLang = CYCLE_SENSITIVITY_LABELS;`,
  );
  // Fix: the end marker might not be unique - verify file
  writeFileSync(path, text);
  console.log('CycleTimeline.tsx wired');
}

// ─── CrisisCenterView ────────────────────────────────────────────────────────
{
  const path = join(ROOT, 'components/CrisisCenterView.tsx');
  let text = readFileSync(path, 'utf8');
  if (!text.includes("from '../utils/memberCoreI18n'")) {
    text = text.replace(
      "import { Language, LangCopy, getLang } from '../constants';",
      "import { Language, getLang } from '../constants';\nimport {\n  CRISIS_MAIN_COPY,\n  CRISIS_BREATH_PHASE_COPY,\n  CRISIS_SENSES_COPY,\n  CRISIS_SHARE_MESSAGE,\n} from '../utils/memberCoreI18n';",
    );
  }
  text = replaceBetween(
    text,
    '  const copyByLang = {',
    '  const copy = getLang(copyByLang, lang) || copyByLang.en;',
    '  const copy = getLang(CRISIS_MAIN_COPY, lang) || CRISIS_MAIN_COPY.en;',
  );
  text = replaceBetween(
    text,
    '  const phaseCopyByLang: LangCopy<',
    '  const phaseText = getLang(phaseCopyByLang, lang) || phaseCopyByLang.en;',
    '  const phaseText = getLang(CRISIS_BREATH_PHASE_COPY, lang) || CRISIS_BREATH_PHASE_COPY.en;',
  );
  text = replaceBetween(
    text,
    '  const sensesByLang: LangCopy<',
    '  const senses = getLang(sensesByLang, lang) || sensesByLang.en;',
    '  const senses = getLang(CRISIS_SENSES_COPY, lang) || CRISIS_SENSES_COPY.en;',
  );
  text = text.replace(
    `    const messageByLang: LangCopy< string> = {
      en: 'I am in overload right now. I am using my reset protocol and will reconnect shortly.',
      ru: 'Сейчас у меня перегрузка. Я в режиме стабилизации и вернусь к разговору позже.',
      uk: 'Зараз у мене перевантаження. Я в режимі стабілізації і повернусь до розмови пізніше.',
      es: 'Ahora mismo tengo sobrecarga. Estoy usando mi protocolo de estabilizacion y vuelvo en breve.',
      fr: 'Je suis en surcharge pour le moment. J utilise mon protocole reset et je reviens tres vite.',
      de: 'Ich bin gerade uberlastet. Ich nutze mein Reset-Protokoll und melde mich gleich wieder.',
      zh: '我现在处于过载状态。我正在执行重置流程，稍后会恢复联系。',
      ja: '今は過負荷の状態です。リセット手順を使って落ち着き、少ししてから戻ります。',
      pt: 'Estou em sobrecarga agora. Estou usando meu protocolo reset e retorno em breve.',
  ar: 'I am in overload right now. I am using my reset protocol and will reconnect shortly.',
  he: 'I am in overload right now. I am using my reset protocol and will reconnect shortly.',};
    const message = getLang(messageByLang, lang) || messageByLang.en;`,
    '    const message = getLang(CRISIS_SHARE_MESSAGE, lang) || CRISIS_SHARE_MESSAGE.en;',
  );
  writeFileSync(path, text);
  console.log('CrisisCenterView.tsx wired');
}

// ─── DashboardView (retention, billing, gentle, evening) ────────────────────
{
  const path = join(ROOT, 'components/DashboardView.tsx');
  let text = readFileSync(path, 'utf8');
  if (!text.includes("from '../utils/memberCoreI18n'")) {
    text = text.replace(
      "import { Language, TranslationSchema, LangCopy, getLang } from '../constants';",
      "import { Language, TranslationSchema, LangCopy, getLang } from '../constants';\nimport {\n  DASHBOARD_RETENTION_COPY,\n  DASHBOARD_BILLING_COPY,\n  DASHBOARD_GENTLE_REMINDERS,\n  DASHBOARD_EVENING_COPY,\n} from '../utils/memberCoreI18n';",
    );
  }
  const blocks = [
    ['  const retentionCopyByLang: LangCopy<', '  const retentionCopy = getLang(retentionCopyByLang, lang) || retentionCopyByLang.en;', '  const retentionCopy = getLang(DASHBOARD_RETENTION_COPY, lang) || DASHBOARD_RETENTION_COPY.en;'],
    ['  const billingCopyByLang: LangCopy<', '  const billingCopy = getLang(billingCopyByLang, lang) || billingCopyByLang.en;', '  const billingCopy = getLang(DASHBOARD_BILLING_COPY, lang) || DASHBOARD_BILLING_COPY.en;'],
    ['  const gentleReminderMessagesByLang: LangCopy<', '    const pool = getLang(gentleReminderMessagesByLang, lang) || gentleReminderMessagesByLang.en;', '    const pool = getLang(DASHBOARD_GENTLE_REMINDERS, lang) || DASHBOARD_GENTLE_REMINDERS.en;'],
    ['  const eveningCopyByLang = {', '  const eveningCopy = getLang(eveningCopyByLang, lang) || eveningCopyByLang.en;', '  const eveningCopy = getLang(DASHBOARD_EVENING_COPY, lang) || DASHBOARD_EVENING_COPY.en;'],
  ];
  for (const [start, end, replacement] of blocks) {
    text = replaceBetween(text, start, end, replacement);
  }
  writeFileSync(path, text);
  console.log('DashboardView.tsx wired (4 blocks)');
}

console.log('Done.');
