import { Language, TranslationSchema } from '../constants';
import { TabType } from './navigation';
import { getMemberPageIntro } from './memberPageIntros';
import { TAB_INTRO_PAGE } from './lunaPageThemes';

export type MemberTabHeroCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  caption?: string;
};

const EYEBROW: Partial<Record<TabType, string>> = {
  dashboard: 'Member Zone',
  today_mirror: 'Today',
  rhythm_calendar: 'Rhythm',
  history: 'Journey',
  cycle: 'Cycle',
  library: 'Knowledge',
  labs: 'Labs',
  family: 'Family',
  faq: 'Help',
  partner_faq: 'Partner',
  contact: 'Contact',
  crisis: 'Reset',
  about: 'About',
  how_it_works: 'Guide',
  privacy: 'Legal',
  terms: 'Legal',
  medical: 'Legal',
  cookies: 'Legal',
  data_rights: 'Legal',
};

export const getMemberTabHeroCopy = (tab: TabType, lang: Language, ui: TranslationSchema): MemberTabHeroCopy => {
  const introPage = TAB_INTRO_PAGE[tab];
  if (introPage) {
    const intro = getMemberPageIntro(lang, introPage);
    return {
      eyebrow: intro.eyebrow,
      title: intro.title,
      subtitle: intro.body,
    };
  }

  const nav = ui.navigation;
  const titleByTab: Partial<Record<TabType, string>> = {
    dashboard: nav.home || 'Home',
    today_mirror: 'Today',
    rhythm_calendar: 'Rhythm Calendar',
    history: nav.history || 'My Journey',
    cycle: nav.cycle || 'Luna29 Balance',
    library: nav.library || 'Knowledge',
    labs: nav.labs || 'Labs',
    family: nav.family || 'Family',
    faq: nav.faq || 'FAQ',
    partner_faq: nav.partner || 'Partner FAQ',
    contact: nav.contact || 'Contact',
    crisis: nav.crisis || 'Reset Room',
    about: 'About Luna29',
    how_it_works: 'How It Works',
    privacy: 'Privacy',
    terms: 'Terms',
    medical: 'Medical Disclaimer',
    cookies: 'Cookies',
    data_rights: 'Data Rights',
  };

  const subtitleByTab: Partial<Record<TabType, string>> = {
    dashboard: 'Your daily orientation — signals, focus, and next steps.',
    today_mirror: 'A calm read of how today feels in body, mood, and rhythm.',
    rhythm_calendar: 'See cycle phases alongside your check-ins over time.',
    history: 'Timeline of patterns and what changed across recent days.',
    cycle: 'Visual map of physiological rhythms across the month.',
    library: 'Reference materials for understanding your inner patterns.',
    labs: 'Track metrics and practical interpretations over time.',
    family: 'Shared rhythm tools for home load and connection.',
    faq: 'Quick answers about scope, safety, and using Luna29.',
    partner_faq: 'Guidance for partners who want to support without pressure.',
    contact: 'Reach the team for practical help or feedback.',
    crisis: 'Short stabilization when overload needs a pause.',
    about: 'Background, purpose, and boundaries of Luna29.',
    how_it_works: 'Step-by-step flow from orientation to member tools.',
    privacy: 'How your data is handled and what you control.',
    terms: 'Conditions of use and service boundaries.',
    medical: 'Luna29 is informational support — not medical diagnosis.',
    cookies: 'Cookie usage and preference controls.',
    data_rights: 'Access, export, correction, and deletion rights.',
  };

  return {
    eyebrow: EYEBROW[tab] || 'Member Zone',
    title: titleByTab[tab] || tab.replace(/_/g, ' '),
    subtitle: subtitleByTab[tab] || 'Private member tools — calm, clear, and yours.',
  };
};
