import { Language, LangCopy } from '../constants';

export const SUPPORTED_LANGUAGES: readonly Language[] = ['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ar', 'he'];

export const isSupportedLanguage = (value: string | null): value is Language =>
  Boolean(value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value));

export const isRtlLanguage = (lang: Language): boolean => lang === 'ar' || lang === 'he';

export type LanguagePickerEntry = {
  code: Language;
  label: string;
  full: string;
  native: string;
  flag: string;
};

export const LANGUAGE_PICKER: LanguagePickerEntry[] = [
  { code: 'en', label: 'EN', full: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'AR', full: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'de', label: 'DE', full: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'ES', full: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'FR', full: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'he', label: 'HE', full: 'Hebrew', native: 'עברית', flag: '🇮🇱' },
  { code: 'ja', label: 'JA', full: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'pt', label: 'PT', full: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'ru', label: 'RU', full: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'uk', label: 'UK', full: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
  { code: 'zh', label: 'ZH', full: 'Chinese', native: '中文', flag: '🇨🇳' },
];

export const pickLang = <T>(map: LangCopy<T>, lang: Language): T => map[lang] ?? map.en;

/** Build a full Language map with English defaults and optional locale overrides. */
export const langMap = <T>(en: T, overrides: Partial<Record<Language, T>> = {}): Record<Language, T> =>
  Object.fromEntries(SUPPORTED_LANGUAGES.map((code) => [code, overrides[code] ?? en])) as Record<Language, T>;

type CoreLanguage = Exclude<Language, 'ar' | 'he'>;

/** Accept maps for core locales and auto-fill Arabic/Hebrew from English unless overridden. */
export const asLangMap = <T>(
  partial: Record<CoreLanguage, T>,
  extras?: Partial<Record<'ar' | 'he', T>>
): Record<Language, T> => ({
  ...partial,
  ar: extras?.ar ?? partial.en,
  he: extras?.he ?? partial.en,
});
