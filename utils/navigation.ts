import { Language, TranslationSchema } from '../constants';

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
  | 'admin'
  | 'how_it_works'
  | 'terms'
  | 'medical'
  | 'cookies'
  | 'data_rights';

type NavItem = {
  id: TabType;
  label: string;
  icon: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type NavigationLabels = Partial<TranslationSchema['navigation']> & {
  home: string;
  cycle: string;
  reflections: string;
  voiceFiles?: string;
  labs: string;
  meds: string;
  bridge: string;
  library: string;
  history: string;
  creative: string;
  family: string;
  profile: string;
  faq: string;
  contact: string;
  crisis: string;
  admin?: string;
  partner?: string;
  partner_faq?: string;
  healthHub?: string;
};

type NavigationUi = {
  navigation: NavigationLabels;
};

export const buildSidebarGroups = (_ui: NavigationUi, includeAdmin = false): NavGroup[] => {
  const groups: NavGroup[] = [
    {
      title: 'Main',
      items: [
        { id: 'today_mirror', label: 'Today', icon: '☀️' },
        { id: 'history', label: 'Your Story', icon: '📜' },
        { id: 'cycle', label: 'Rhythm', icon: '🌊' },
        { id: 'library', label: 'Knowledge', icon: '📚' },
        { id: 'profile', label: 'You', icon: '👤' },
      ],
    },
    {
      title: 'Daily',
      items: [
        { id: 'my_day', label: 'My Day with Luna29', icon: '🪞' },
        { id: 'reflections', label: 'Voice Reflection', icon: '🎙️' },
        { id: 'voice_files', label: 'My Voice Files', icon: '🗂️' },
      ],
    },
    {
      title: 'Insights',
      items: [
        { id: 'dashboard', label: 'Member Home', icon: '🏠' },
        { id: 'labs', label: 'Health Reports', icon: '📄' },
        { id: 'monthly_reflection', label: 'Your month with Luna29', icon: '🗓️' },
        { id: 'insights_paywall', label: 'Unlock Insights', icon: '🔐' },
      ],
    },
    {
      title: 'Practice',
      items: [
        { id: 'bridge', label: 'The Bridge', icon: '🕊️' },
        { id: 'relationships', label: 'Relationships', icon: '💞' },
        { id: 'family', label: 'Family', icon: '🏡' },
        { id: 'creative', label: 'Creative Studio', icon: '🎨' },
        { id: 'meds', label: 'Medication Notes', icon: '💊' },
        { id: 'crisis', label: 'Reset Room', icon: '🛟' },
      ],
    },
    {
      title: 'Help',
      items: [
        { id: 'faq', label: 'FAQ', icon: '❓' },
        { id: 'partner_faq', label: 'Partner FAQ', icon: '🤝' },
      ],
    },
  ];

  if (includeAdmin) {
    groups.push({
      title: 'Administration',
      items: [{ id: 'admin', label: _ui.navigation.admin || 'Admin Console', icon: '🛠️' }],
    });
  }

  return groups;
};

export const buildBottomNavItems = (_ui: NavigationUi): NavItem[] => [
  { id: 'today_mirror', label: 'Today', icon: '☀️' },
  { id: 'history', label: 'Your Story', icon: '📜' },
  { id: 'cycle', label: 'Rhythm', icon: '🌊' },
  { id: 'library', label: 'Knowledge', icon: '📚' },
  { id: 'profile', label: 'You', icon: '👤' },
];

export const buildTopNavItems = (_ui: NavigationUi): NavItem[] => [
  { id: 'today_mirror', label: 'Today', icon: '☀️' },
  { id: 'history', label: 'Your Story', icon: '📜' },
  { id: 'cycle', label: 'Rhythm', icon: '🌊' },
  { id: 'library', label: 'Knowledge', icon: '📚' },
  { id: 'profile', label: 'You', icon: '👤' },
];

export const getCheckinCta = (lang: Language) => (lang === 'ru' ? 'Отметиться' : 'Check-in');
