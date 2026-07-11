import { Language } from '../constants';
import { getMemberNavCopy } from './memberNavLabels';

export type TabType =
  | 'dashboard'
  | 'today_mirror'
  | 'my_day'
  | 'monthly_reflection'
  | 'insights_paywall'
  | 'about'
  | 'cycle'
  | 'labs'
  | 'history'
  | 'creative'
  | 'profile'
  | 'privacy'
  | 'bridge'
  | 'family'
  | 'reflections'
  | 'voice_files'
  | 'library'
  | 'faq'
  | 'contact'
  | 'meds'
  | 'crisis'
  | 'partner_faq'
  | 'relationships'
  | 'how_it_works'
  | 'terms'
  | 'medical'
  | 'cookies'
  | 'data_rights'
  | 'rhythm_calendar'
  | 'learning'
  | 'pricing'
  | 'ritual_path'
  | 'admin';

/** Sidebar may include Live AI (opens overlay; not a tab). */
export type NavItemId = TabType | 'live_ai';

export type NavItem = {
  id: NavItemId;
  label: string;
  icon: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type NavigationUi = {
  navigation: Partial<{ admin?: string }> & Record<string, string>;
};

/** Primary chrome — identical on top and bottom (desktop / tablet / mobile). */
const PRIMARY_NAV = (nav: ReturnType<typeof getMemberNavCopy>): NavItem[] => [
  { id: 'today_mirror', label: nav.today, icon: '☀️' },
  { id: 'history', label: nav.yourStory, icon: '📜' },
  { id: 'labs', label: nav.healthReports, icon: '📄' },
  { id: 'profile', label: nav.settings, icon: '⚙️' },
  { id: 'cycle', label: nav.rhythm, icon: '🌊' },
];

export const buildSidebarGroups = (ui: NavigationUi, includeAdmin = false, lang: Language = 'en'): NavGroup[] => {
  const nav = getMemberNavCopy(lang);
  const groups: NavGroup[] = [
    {
      title: nav.groupMain,
      items: [
        { id: 'today_mirror', label: nav.today, icon: '☀️' },
        { id: 'history', label: nav.yourStory, icon: '📜' },
        { id: 'cycle', label: nav.rhythm, icon: '🌊' },
        { id: 'labs', label: nav.healthReports, icon: '📄' },
        { id: 'library', label: nav.knowledge, icon: '📚' },
        { id: 'profile', label: nav.settings, icon: '⚙️' },
      ],
    },
    {
      title: nav.groupDaily,
      items: [
        { id: 'my_day', label: nav.myDay, icon: '🪞' },
        { id: 'live_ai', label: nav.liveAi, icon: '✨' },
        { id: 'reflections', label: nav.voiceReflection, icon: '🎙️' },
        { id: 'voice_files', label: nav.voiceFiles, icon: '🗂️' },
      ],
    },
    {
      title: nav.groupInsights,
      items: [
        { id: 'dashboard', label: nav.memberHome, icon: '📊' },
        { id: 'monthly_reflection', label: nav.yourMonth, icon: '🗓️' },
        { id: 'rhythm_calendar', label: nav.rhythmCalendar, icon: '📅' },
      ],
    },
    {
      title: nav.groupPractice,
      items: [
        { id: 'bridge', label: nav.bridge, icon: '🕊️' },
        { id: 'relationships', label: nav.relationships, icon: '💞' },
        { id: 'family', label: nav.family, icon: '🏡' },
        { id: 'creative', label: nav.creativeStudio, icon: '🎨' },
        { id: 'meds', label: nav.medicationNotes, icon: '💊' },
        { id: 'crisis', label: nav.resetRoom, icon: '🛟' },
      ],
    },
    {
      title: nav.groupHelp,
      items: [
        { id: 'faq', label: nav.faq, icon: '❓' },
        { id: 'partner_faq', label: nav.partnerFaq, icon: '🤝' },
        { id: 'contact', label: nav.contact, icon: '✉️' },
      ],
    },
  ];

  if (includeAdmin) {
    groups.push({
      title: nav.groupAdmin,
      items: [{ id: 'admin', label: ui.navigation.admin || nav.adminConsole, icon: '🛠️' }],
    });
  }

  return groups;
};

export const buildBottomNavItems = (_ui: NavigationUi, lang: Language = 'en'): NavItem[] =>
  PRIMARY_NAV(getMemberNavCopy(lang));

export const buildTopNavItems = (_ui: NavigationUi, lang: Language = 'en'): NavItem[] =>
  PRIMARY_NAV(getMemberNavCopy(lang));

export const getCheckinCta = (lang: Language) => getMemberNavCopy(lang).checkinCta;
