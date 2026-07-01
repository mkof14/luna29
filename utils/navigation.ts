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
  | 'ritual_path';

type NavItem = {
  id: TabType;
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

export const buildSidebarGroups = (ui: NavigationUi, lang: Language = 'en'): NavGroup[] => {
  const nav = getMemberNavCopy(lang);
  const groups: NavGroup[] = [
    {
      title: nav.groupMain,
      items: [
        { id: 'today_mirror', label: nav.today, icon: '☀️' },
        { id: 'history', label: nav.yourStory, icon: '📜' },
        { id: 'cycle', label: nav.rhythm, icon: '🌊' },
        { id: 'library', label: nav.knowledge, icon: '📚' },
        { id: 'profile', label: nav.you, icon: '👤' },
      ],
    },
    {
      title: nav.groupDaily,
      items: [
        { id: 'my_day', label: nav.myDay, icon: '🪞' },
        { id: 'reflections', label: nav.voiceReflection, icon: '🎙️' },
        { id: 'voice_files', label: nav.voiceFiles, icon: '🗂️' },
      ],
    },
    {
      title: nav.groupInsights,
      items: [
        { id: 'dashboard', label: nav.memberHome, icon: '🏠' },
        { id: 'labs', label: nav.healthReports, icon: '📄' },
        { id: 'monthly_reflection', label: nav.yourMonth, icon: '🗓️' },
        { id: 'rhythm_calendar', label: nav.rhythmCalendar, icon: '📅' },
        { id: 'insights_paywall', label: nav.unlockInsights, icon: '🔐' },
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
      ],
    },
  ];

  return groups;
};

export const buildBottomNavItems = (_ui: NavigationUi, lang: Language = 'en'): NavItem[] => {
  const nav = getMemberNavCopy(lang);
  return [
    { id: 'today_mirror', label: nav.today, icon: '☀️' },
    { id: 'history', label: nav.yourStory, icon: '📜' },
    { id: 'cycle', label: nav.rhythm, icon: '🌊' },
    { id: 'library', label: nav.knowledge, icon: '📚' },
    { id: 'profile', label: nav.you, icon: '👤' },
  ];
};

export const buildTopNavItems = (_ui: NavigationUi, lang: Language = 'en'): NavItem[] => {
  const nav = getMemberNavCopy(lang);
  return [
    { id: 'today_mirror', label: nav.today, icon: '☀️' },
    { id: 'history', label: nav.yourStory, icon: '📜' },
    { id: 'cycle', label: nav.rhythm, icon: '🌊' },
    { id: 'library', label: nav.knowledge, icon: '📚' },
    { id: 'profile', label: nav.you, icon: '👤' },
  ];
};

export const getCheckinCta = (lang: Language) => getMemberNavCopy(lang).checkinCta;
