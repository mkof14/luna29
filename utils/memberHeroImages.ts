import { TabType } from '../utils/navigation';

/** Raster hero art — traditional watercolor / editorial illustrations */
export const MEMBER_HERO_IMAGES: Partial<Record<TabType, string>> = {
  today_mirror: '/images/heroes/today_mirror.webp',
  history: '/images/heroes/history.webp',
  cycle: '/images/heroes/cycle.webp',
  library: '/images/heroes/library.webp',
  profile: '/images/heroes/profile.webp',
  my_day: '/images/heroes/my_day.webp',
  reflections: '/images/heroes/reflections.webp',
  voice_files: '/images/heroes/voice_files.webp',
  dashboard: '/images/heroes/dashboard.webp',
  labs: '/images/heroes/labs.webp',
  monthly_reflection: '/images/heroes/monthly_reflection.webp',
  insights_paywall: '/images/heroes/insights_paywall.webp',
  bridge: '/images/heroes/bridge.webp',
  relationships: '/images/heroes/relationships.webp',
  family: '/images/heroes/family.webp',
  creative: '/images/heroes/creative.webp',
  meds: '/images/heroes/meds.webp',
  crisis: '/images/heroes/crisis.webp',
  faq: '/images/heroes/faq.webp',
  partner_faq: '/images/heroes/partner_faq.webp',
  admin: '/images/heroes/admin.webp',
  contact: '/images/heroes/contact.webp',
  about: '/images/heroes/about.webp',
  how_it_works: '/images/heroes/how_it_works.webp',
  privacy: '/images/heroes/privacy.webp',
  terms: '/images/heroes/privacy.webp',
  medical: '/images/heroes/crisis.webp',
  cookies: '/images/heroes/privacy.webp',
  data_rights: '/images/heroes/privacy.webp',
  rhythm_calendar: '/images/heroes/monthly_reflection.webp'};

export const getMemberHeroImage = (tab: TabType): string =>
  MEMBER_HERO_IMAGES[tab] ?? '/images/heroes/dashboard.webp';
