import { TabType } from './navigation';
import { MemberIntroPageId } from './memberPageIntros';
import { PublicArtPage } from './publicPageArt';

export type LunaPageTheme = {
  shellClass: string;
  publicArtPage?: PublicArtPage;
};

/** Member intro blocks — pages that ship guided copy + tips under the hero. */
export const TAB_INTRO_PAGE: Partial<Record<TabType, MemberIntroPageId>> = {
  my_day: 'my_day',
  reflections: 'voice_note',
  voice_files: 'voice_files',
  monthly_reflection: 'monthly_reflection',
  insights_paywall: 'insights_paywall',
  bridge: 'bridge',
  relationships: 'relationships',
  creative: 'creative',
  meds: 'meds',
  profile: 'profile',
  labs: 'labs',
  history: 'history',
};

/** Per-tab watercolor gradient modifiers (see styles.css `.luna-page-*`). */
export const LUNA_PAGE_THEMES: Partial<Record<TabType, LunaPageTheme>> = {
  dashboard: { shellClass: 'luna-page-bodymap luna-page-focus luna-focus-bodymap', publicArtPage: 'home' },
  today_mirror: { shellClass: 'luna-page-ritual luna-page-focus', publicArtPage: 'ritual' },
  my_day: { shellClass: 'luna-page-ritual luna-page-focus', publicArtPage: 'ritual' },
  monthly_reflection: { shellClass: 'luna-page-seasons', publicArtPage: 'calendar' },
  insights_paywall: { shellClass: 'luna-page-reports', publicArtPage: 'pricing' },
  rhythm_calendar: { shellClass: 'luna-page-bodymap', publicArtPage: 'calendar' },
  history: { shellClass: 'luna-page-journey', publicArtPage: 'map' },
  cycle: { shellClass: 'luna-page-bodymap luna-page-focus luna-focus-bodymap', publicArtPage: 'map' },
  library: { shellClass: 'luna-page-knowledge', publicArtPage: 'learning' },
  profile: { shellClass: 'luna-page-profile', publicArtPage: 'about' },
  bridge: { shellClass: 'luna-page-bridge', publicArtPage: 'bridge' },
  relationships: { shellClass: 'luna-page-relationships', publicArtPage: 'bridge' },
  family: { shellClass: 'luna-page-relationships', publicArtPage: 'bridge' },
  reflections: { shellClass: 'luna-page-voice', publicArtPage: 'ritual' },
  voice_files: { shellClass: 'luna-page-voice', publicArtPage: 'ritual' },
  creative: { shellClass: 'luna-page-create', publicArtPage: 'map' },
  labs: { shellClass: 'luna-page-reports', publicArtPage: 'map' },
  meds: { shellClass: 'luna-page-support', publicArtPage: 'map' },
  crisis: { shellClass: 'luna-page-bodymap', publicArtPage: 'medical' },
  faq: { shellClass: 'luna-page-questions', publicArtPage: 'faq' },
  partner_faq: { shellClass: 'luna-page-partner', publicArtPage: 'faq' },
  contact: { shellClass: 'luna-page-contact', publicArtPage: 'about' },
  about: { shellClass: 'luna-page-knowledge', publicArtPage: 'about' },
  how_it_works: { shellClass: 'luna-page-knowledge', publicArtPage: 'how_it_works' },
  learning: { shellClass: 'luna-page-knowledge', publicArtPage: 'learning' },
  pricing: { shellClass: 'luna-page-pricing luna-page-focus luna-focus-pricing', publicArtPage: 'pricing' },
  ritual_path: { shellClass: 'luna-page-ritual luna-page-focus', publicArtPage: 'ritual' },
  privacy: { shellClass: 'luna-page-knowledge', publicArtPage: 'privacy' },
  terms: { shellClass: 'luna-page-knowledge', publicArtPage: 'terms' },
  medical: { shellClass: 'luna-page-bodymap', publicArtPage: 'medical' },
  cookies: { shellClass: 'luna-page-knowledge', publicArtPage: 'cookies' },
  data_rights: { shellClass: 'luna-page-knowledge', publicArtPage: 'data_rights' },
};

export const getLunaPageTheme = (tab: TabType): LunaPageTheme =>
  LUNA_PAGE_THEMES[tab] ?? { shellClass: 'luna-page-knowledge' };

export const tabUsesIntroBlock = (tab: TabType): boolean => Boolean(TAB_INTRO_PAGE[tab]);

/** Tabs that render their own full Public* stack (skip generic hero). */
export const TAB_SELF_CONTAINED_LAYOUT = new Set<TabType>([
  'ritual_path',
  'learning',
  'pricing',
  'dashboard',
  'today_mirror',
  'faq',
  'about',
  'how_it_works',
  'privacy',
  'terms',
  'medical',
  'cookies',
  'data_rights',
  'cycle',
  'rhythm_calendar',
  'family',
  'library',
  'contact',
  'crisis',
  'partner_faq',
]);
