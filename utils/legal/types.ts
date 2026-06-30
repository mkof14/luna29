import { Language } from '../../constants';

export type LegalDocType = 'legal' | 'privacy' | 'terms' | 'medical' | 'cookies' | 'data_rights';

export type LegalDocSection = { heading: string; body: string };

export type LegalDocContent = {
  title: string;
  subtitle: string;
  sections: LegalDocSection[];
};

export type LegalDocMeta = {
  icon: string;
  accent: string;
};

export const LEGAL_DOC_META: Record<LegalDocType, LegalDocMeta> = {
  legal: { icon: '📋', accent: 'text-slate-600' },
  privacy: { icon: '🔒', accent: 'text-luna-purple' },
  terms: { icon: '📘', accent: 'text-indigo-500' },
  medical: { icon: '🌿', accent: 'text-rose-500' },
  cookies: { icon: '🍪', accent: 'text-amber-500' },
  data_rights: { icon: '⚖️', accent: 'text-teal-500' },
};

export const LEGAL_EFFECTIVE_DATE = 'June 29, 2026';

export const LEGAL_EFFECTIVE_DATE_BY_LANG: Record<Language, string> = {
  en: 'June 29, 2026',
  ru: '29 июня 2026 г.',
  uk: '29 червня 2026 р.',
  es: '29 de junio de 2026',
  fr: '29 juin 2026',
  de: '29. Juni 2026',
  zh: '2026年6月29日',
  ja: '2026年6月29日',
  pt: '29 de junho de 2026',
  ar: '29 يونيو 2026',
  he: '29 ביוני 2026',
};
