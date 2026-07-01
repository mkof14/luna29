import { LangCopy, Language, getLang } from '../constants';

export type MoonPhaseName =
  | 'new'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

const microRitualByLang: LangCopy<Record<TimeOfDay, string>> = {
  en: {
    morning: 'Today, noticing one sensation is enough.',
    afternoon: 'Pause for one breath before the next decision.',
    evening: 'Let the day settle — one gentle observation will do.',
    night: 'Rest is part of the rhythm. Nothing else is required tonight.',
  },
  ru: {
    morning: 'Сегодня достаточно заметить одно ощущение.',
    afternoon: 'Сделайте паузу на один вдох перед следующим решением.',
    evening: 'Пусть день уложится — одного мягкого наблюдения достаточно.',
    night: 'Отдых — часть ритма. Сегодня больше ничего не нужно.',
  },
  uk: {
    morning: 'Сьогодні достатньо помітити одне відчуття.',
    afternoon: 'Зробіть паузу на один вдих перед наступним рішенням.',
    evening: 'Нехай день уложиться — одного м’якого спостереження достатньо.',
    night: 'Відпочинок — частина ритму. Сьогодні більше нічого не потрібно.',
  },
  es: {
    morning: 'Hoy basta con notar una sola sensacion.',
    afternoon: 'Haz una pausa de un respiro antes de la siguiente decision.',
    evening: 'Deja que el dia se asiente — una observacion suave es suficiente.',
    night: 'El descanso tambien es ritmo. Esta noche no hace falta mas.',
  },
  fr: {
    morning: "Aujourd'hui, remarquer une seule sensation suffit.",
    afternoon: 'Faites une pause d un souffle avant la prochaine decision.',
    evening: 'Laissez la journee se poser — une observation douce suffit.',
    night: 'Le repos fait partie du rythme. Rien d autre ce soir.',
  },
  de: {
    morning: 'Heute reicht es, eine einzige Empfindung wahrzunehmen.',
    afternoon: 'Halten Sie einen Atemzug inne, bevor die nachste Entscheidung kommt.',
    evening: 'Lassen Sie den Tag sich legen — eine sanfte Beobachtung genugt.',
    night: 'Ruhe gehort zum Rhythmus. Heute Nacht ist nichts weiter nötig.',
  },
  zh: {
    morning: '今天，留意一种感受就够了。',
    afternoon: '在做下一个决定之前，先停顿一次呼吸。',
    evening: '让一天慢慢落下——一次温柔的觉察就足够。',
    night: '休息也是节律的一部分。今晚不必再做更多。',
  },
  ja: {
    morning: '今日は、ひとつの感覚に気づくだけで十分です。',
    afternoon: '次の決めごとの前に、一度呼吸を止めてみてください。',
    evening: '一日が静かに沈むのを待ちましょう。やさしい観察ひとつで足ります。',
    night: '休息もリズムの一部。今夜はこれ以上いりません。',
  },
  pt: {
    morning: 'Hoje basta notar uma unica sensacao.',
    afternoon: 'Faca uma pausa de uma respiracao antes da proxima decisao.',
    evening: 'Deixe o dia assentar — uma observacao suave e suficiente.',
    night: 'Descanso tambem e ritmo. Esta noite nada mais e necessario.',
  },
  ar: {
    morning: 'Today, noticing one sensation is enough.',
    afternoon: 'Pause for one breath before the next decision.',
    evening: 'Let the day settle — one gentle observation will do.',
    night: 'Rest is part of the rhythm. Nothing else is required tonight.',
  },
  he: {
    morning: 'Today, noticing one sensation is enough.',
    afternoon: 'Pause for one breath before the next decision.',
    evening: 'Let the day settle — one gentle observation will do.',
    night: 'Rest is part of the rhythm. Nothing else is required tonight.',
  },
};

const trustLineByLang: LangCopy<string> = {
  en: 'Your data stays close · No ads · Not a medical diagnosis',
  ru: 'Данные рядом с вами · Без рекламы · Не медицинский диагноз',
  uk: 'Дані поруч із вами · Без реклами · Не медичний діагноз',
  es: 'Tus datos cerca de ti · Sin anuncios · No es un diagnostico medico',
  fr: 'Vos donnees restent proches · Sans publicite · Pas un diagnostic medical',
  de: 'Ihre Daten bleiben nah · Keine Werbung · Keine medizinische Diagnose',
  zh: '数据留在您身边 · 无广告 · 非医疗诊断',
  ja: 'データは身近に · 広告なし · 医療診断ではありません',
  pt: 'Seus dados ficam perto · Sem anuncios · Nao e diagnostico medico',
  ar: 'Your data stays close · No ads · Not a medical diagnosis',
  he: 'Your data stays close · No ads · Not a medical diagnosis',
};

const spiritActionsByLang: LangCopy<{ askLuna: string; whyLuna29: string }> = {
  en: { askLuna: 'Ask Luna', whyLuna29: 'Why Luna29' },
  ru: { askLuna: 'Спросить Luna', whyLuna29: 'Почему Luna29' },
  uk: { askLuna: 'Запитати Luna', whyLuna29: 'Чому Luna29' },
  es: { askLuna: 'Preguntar a Luna', whyLuna29: 'Por que Luna29' },
  fr: { askLuna: 'Demander a Luna', whyLuna29: 'Pourquoi Luna29' },
  de: { askLuna: 'Luna fragen', whyLuna29: 'Warum Luna29' },
  zh: { askLuna: '问问 Luna', whyLuna29: '为什么选择 Luna29' },
  ja: { askLuna: 'Lunaに聞く', whyLuna29: 'Luna29とは' },
  pt: { askLuna: 'Perguntar a Luna', whyLuna29: 'Por que Luna29' },
  ar: { askLuna: 'Ask Luna', whyLuna29: 'Why Luna29' },
  he: { askLuna: 'Ask Luna', whyLuna29: 'Why Luna29' },
};

const moonPhaseLabelByLang: LangCopy<Record<MoonPhaseName, string>> = {
  en: {
    new: 'New moon',
    waxing_crescent: 'Waxing crescent',
    first_quarter: 'First quarter',
    waxing_gibbous: 'Waxing gibbous',
    full: 'Full moon',
    waning_gibbous: 'Waning gibbous',
    last_quarter: 'Last quarter',
    waning_crescent: 'Waning crescent',
  },
  ru: {
    new: 'Новолуние',
    waxing_crescent: 'Растущий серп',
    first_quarter: 'Первая четверть',
    waxing_gibbous: 'Растущая Луна',
    full: 'Полнолуние',
    waning_gibbous: 'Убывающая Луна',
    last_quarter: 'Последняя четверть',
    waning_crescent: 'Убывающий серп',
  },
  uk: {
    new: 'Молодик',
    waxing_crescent: 'Зростаючий серп',
    first_quarter: 'Перша чверть',
    waxing_gibbous: 'Зростаюча Місяць',
    full: 'Повний місяць',
    waning_gibbous: 'Спадаюча Місяць',
    last_quarter: 'Остання чверть',
    waning_crescent: 'Спадаючий серп',
  },
  es: {
    new: 'Luna nueva',
    waxing_crescent: 'Creciente',
    first_quarter: 'Cuarto creciente',
    waxing_gibbous: 'Gibosa creciente',
    full: 'Luna llena',
    waning_gibbous: 'Gibosa menguante',
    last_quarter: 'Cuarto menguante',
    waning_crescent: 'Menguante',
  },
  fr: {
    new: 'Nouvelle lune',
    waxing_crescent: 'Premier croissant',
    first_quarter: 'Premier quartier',
    waxing_gibbous: 'Gibbeuse croissante',
    full: 'Pleine lune',
    waning_gibbous: 'Gibbeuse decroissante',
    last_quarter: 'Dernier quartier',
    waning_crescent: 'Dernier croissant',
  },
  de: {
    new: 'Neumond',
    waxing_crescent: 'Zunehmende Sichel',
    first_quarter: 'Erstes Viertel',
    waxing_gibbous: 'Zunehmender Mond',
    full: 'Vollmond',
    waning_gibbous: 'Abnehmender Mond',
    last_quarter: 'Letztes Viertel',
    waning_crescent: 'Abnehmende Sichel',
  },
  zh: {
    new: '新月',
    waxing_crescent: '娥眉月',
    first_quarter: '上弦月',
    waxing_gibbous: '盈凸月',
    full: '满月',
    waning_gibbous: '亏凸月',
    last_quarter: '下弦月',
    waning_crescent: '残月',
  },
  ja: {
    new: '新月',
    waxing_crescent: '三日月',
    first_quarter: '上弦の月',
    waxing_gibbous: '十三夜前',
    full: '満月',
    waning_gibbous: '寝待月',
    last_quarter: '下弦の月',
    waning_crescent: '有明月',
  },
  pt: {
    new: 'Lua nova',
    waxing_crescent: 'Crescente',
    first_quarter: 'Quarto crescente',
    waxing_gibbous: 'Gibosa crescente',
    full: 'Lua cheia',
    waning_gibbous: 'Gibosa minguante',
    last_quarter: 'Quarto minguante',
    waning_crescent: 'Minguante',
  },
  ar: {
    new: 'New moon',
    waxing_crescent: 'Waxing crescent',
    first_quarter: 'First quarter',
    waxing_gibbous: 'Waxing gibbous',
    full: 'Full moon',
    waning_gibbous: 'Waning gibbous',
    last_quarter: 'Last quarter',
    waning_crescent: 'Waning crescent',
  },
  he: {
    new: 'New moon',
    waxing_crescent: 'Waxing crescent',
    first_quarter: 'First quarter',
    waxing_gibbous: 'Waxing gibbous',
    full: 'Full moon',
    waning_gibbous: 'Waning gibbous',
    last_quarter: 'Last quarter',
    waning_crescent: 'Waning crescent',
  },
};

const MOON_ACCENT: Record<MoonPhaseName, { border: string; dot: string; glow: string }> = {
  new: {
    border: 'border-indigo-300/50 dark:border-indigo-500/25',
    dot: 'bg-indigo-300/80 dark:bg-indigo-400/70',
    glow: 'shadow-[0_0_12px_rgba(129,140,248,0.25)]',
  },
  waxing_crescent: {
    border: 'border-violet-300/55 dark:border-violet-500/30',
    dot: 'bg-violet-300/85 dark:bg-violet-400/75',
    glow: 'shadow-[0_0_14px_rgba(167,139,250,0.28)]',
  },
  first_quarter: {
    border: 'border-purple-300/60 dark:border-purple-500/35',
    dot: 'bg-purple-300/90 dark:bg-purple-400/80',
    glow: 'shadow-[0_0_16px_rgba(192,132,252,0.32)]',
  },
  waxing_gibbous: {
    border: 'border-fuchsia-300/55 dark:border-fuchsia-500/30',
    dot: 'bg-fuchsia-300/85 dark:bg-fuchsia-400/75',
    glow: 'shadow-[0_0_16px_rgba(232,121,249,0.28)]',
  },
  full: {
    border: 'border-luna-purple/45 dark:border-luna-purple/35',
    dot: 'bg-luna-purple/90 dark:bg-luna-purple/80',
    glow: 'shadow-[0_0_18px_rgba(109,40,217,0.35)]',
  },
  waning_gibbous: {
    border: 'border-indigo-300/55 dark:border-indigo-500/30',
    dot: 'bg-indigo-300/85 dark:bg-indigo-400/75',
    glow: 'shadow-[0_0_14px_rgba(129,140,248,0.28)]',
  },
  last_quarter: {
    border: 'border-slate-300/70 dark:border-slate-500/35',
    dot: 'bg-slate-300/90 dark:bg-slate-400/75',
    glow: 'shadow-[0_0_12px_rgba(148,163,184,0.22)]',
  },
  waning_crescent: {
    border: 'border-sky-300/50 dark:border-sky-500/25',
    dot: 'bg-sky-300/80 dark:bg-sky-400/70',
    glow: 'shadow-[0_0_12px_rgba(125,211,252,0.22)]',
  },
};

function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function resolveMoonPhaseName(illumination: number, age: number): MoonPhaseName {
  if (illumination < 0.03) return 'new';
  if (age < SYNODIC_MONTH / 8) return 'waxing_crescent';
  if (age < SYNODIC_MONTH / 4) return 'first_quarter';
  if (age < (SYNODIC_MONTH * 3) / 8) return 'waxing_gibbous';
  if (age < (SYNODIC_MONTH * 5) / 8) return 'full';
  if (age < (SYNODIC_MONTH * 3) / 4) return 'waning_gibbous';
  if (age < (SYNODIC_MONTH * 7) / 8) return 'last_quarter';
  return 'waning_crescent';
}

export function getMoonPhase(date = new Date()): { name: MoonPhaseName; illumination: number; age: number } {
  const elapsedDays = (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const age = ((elapsedDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2;
  return {
    name: resolveMoonPhaseName(illumination, age),
    illumination,
    age,
  };
}

export function getFooterMicroRitual(lang: Language, date = new Date()): string {
  const copy = getLang(microRitualByLang, lang) || microRitualByLang.en;
  return copy[getTimeOfDay(date)];
}

export function getFooterTrustLine(lang: Language): string {
  return getLang(trustLineByLang, lang) || trustLineByLang.en;
}

export function getFooterSpiritActions(lang: Language): { askLuna: string; whyLuna29: string } {
  return getLang(spiritActionsByLang, lang) || spiritActionsByLang.en;
}

export function getFooterMoonAccent(lang: Language, date = new Date()) {
  const phase = getMoonPhase(date);
  const labels = getLang(moonPhaseLabelByLang, lang) || moonPhaseLabelByLang.en;
  const accent = MOON_ACCENT[phase.name];
  return {
    phase: phase.name,
    label: labels[phase.name],
    borderClass: accent.border,
    dotClass: accent.dot,
    glowClass: accent.glow,
  };
}
