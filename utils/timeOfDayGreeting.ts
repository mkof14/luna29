import { LangCopy, Language, getLang } from '../constants';

export type TimeOfDayPart = 'morning' | 'afternoon' | 'evening' | 'night';

export type TimeOfDayGreetings = Record<TimeOfDayPart, string>;

/** Local-time buckets: morning 05–11, afternoon 12–16, evening 17–21, night 22–04. */
export const getTimeOfDay = (date = new Date()): TimeOfDayPart => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

export const resolveTimeOfDayGreeting = (greetings: TimeOfDayGreetings, date = new Date()): string =>
  greetings[getTimeOfDay(date)];

export const MEMBER_TIME_GREETINGS: LangCopy<TimeOfDayGreetings> = {
  en: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
  },
  ru: {
    morning: 'Доброе утро',
    afternoon: 'Добрый день',
    evening: 'Добрый вечер',
    night: 'Доброй ночи',
  },
  uk: {
    morning: 'Доброго ранку',
    afternoon: 'Добрий день',
    evening: 'Добрий вечір',
    night: 'На добраніч',
  },
  es: {
    morning: 'Buenos días',
    afternoon: 'Buenas tardes',
    evening: 'Buenas tardes',
    night: 'Buenas noches',
  },
  fr: {
    morning: 'Bonjour',
    afternoon: 'Bon après-midi',
    evening: 'Bonsoir',
    night: 'Bonne nuit',
  },
  de: {
    morning: 'Guten Morgen',
    afternoon: 'Guten Tag',
    evening: 'Guten Abend',
    night: 'Gute Nacht',
  },
  zh: {
    morning: '早上好',
    afternoon: '下午好',
    evening: '晚上好',
    night: '晚安',
  },
  ja: {
    morning: 'おはようございます',
    afternoon: 'こんにちは',
    evening: 'こんばんは',
    night: 'おやすみなさい',
  },
  pt: {
    morning: 'Bom dia',
    afternoon: 'Boa tarde',
    evening: 'Boa noite',
    night: 'Boa noite',
  },
  ar: {
    morning: 'صباح الخير',
    afternoon: 'مساء النور',
    evening: 'مساء الخير',
    night: 'تصبحين على خير',
  },
  he: {
    morning: 'בוקר טוב',
    afternoon: 'צהריים טובים',
    evening: 'ערב טוב',
    night: 'לילה טוב',
  },
};

export const getMemberTimeGreeting = (lang: Language, date = new Date()): string => {
  const greetings = getLang(MEMBER_TIME_GREETINGS, lang) || MEMBER_TIME_GREETINGS.en;
  return resolveTimeOfDayGreeting(greetings, date);
};
