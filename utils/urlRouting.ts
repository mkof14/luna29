import { isSupportedLanguage } from './languages';
import type { Language } from '../constants';
import type { TabType } from './navigation';

const MEMBER_TABS = new Set<TabType>([
  'dashboard',
  'today_mirror',
  'my_day',
  'monthly_reflection',
  'insights_paywall',
  'cycle',
  'labs',
  'history',
  'creative',
  'profile',
  'bridge',
  'family',
  'reflections',
  'voice_files',
  'library',
  'faq',
  'contact',
  'meds',
  'crisis',
  'partner_faq',
  'relationships',
  'admin',
  'rhythm_calendar',
]);

export const readLangFromUrl = (): Language | null => {
  if (typeof window === 'undefined') return null;
  const lang = new URLSearchParams(window.location.search).get('lang');
  return isSupportedLanguage(lang) ? lang : null;
};

export const readTabFromUrl = (): TabType | null => {
  if (typeof window === 'undefined') return null;
  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab && MEMBER_TABS.has(tab as TabType) ? (tab as TabType) : null;
};

export const syncUrlState = (options: { tab?: TabType; lang?: Language; replace?: boolean }) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (options.lang) url.searchParams.set('lang', options.lang);
  if (options.tab) url.searchParams.set('tab', options.tab);
  const method = options.replace === false ? 'pushState' : 'replaceState';
  window.history[method]({}, '', url.toString());
};

export const updateHreflangLinks = (siteUrl: string, lang: Language) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => {
    const link = node as HTMLLinkElement;
    const hrefLang = link.getAttribute('hreflang');
    if (!hrefLang || hrefLang === 'x-default') return;
    link.href = hrefLang === 'en' ? `${siteUrl}/` : `${siteUrl}/?lang=${hrefLang}`;
  });
};
