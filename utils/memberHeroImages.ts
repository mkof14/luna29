import { TabType } from '../utils/navigation';
import { versionedStaticAsset } from './staticAssetUrl';

/** Raster hero art — traditional watercolor / editorial illustrations */
const RAW_MEMBER_HERO_IMAGES: Partial<Record<TabType, string>> = {
  today_mirror: '/images/heroes/r2/today_mirror.webp',
  history: '/images/heroes/r2/history.webp',
  cycle: '/images/heroes/r2/cycle.webp',
  library: '/images/heroes/r2/library.webp',
  profile: '/images/heroes/r2/profile.webp',
  my_day: '/images/heroes/r2/my_day.webp',
  reflections: '/images/heroes/r2/reflections.webp',
  voice_files: '/images/heroes/r2/voice_files.webp',
  dashboard: '/images/heroes/r2/dashboard.webp',
  labs: '/images/heroes/r2/labs.webp',
  monthly_reflection: '/images/heroes/r2/monthly_reflection.webp',
  insights_paywall: '/images/heroes/r2/insights_paywall.webp',
  bridge: '/images/heroes/r2/bridge.webp',
  relationships: '/images/heroes/r2/relationships.webp',
  family: '/images/heroes/r2/family.webp',
  creative: '/images/heroes/r2/creative.webp',
  meds: '/images/heroes/r2/meds.webp',
  crisis: '/images/heroes/r2/crisis.webp',
  faq: '/images/heroes/r2/faq.webp',
  partner_faq: '/images/heroes/r2/partner_faq.webp',
  admin: '/images/heroes/r2/admin.webp',
  contact: '/images/heroes/r2/contact.webp',
  about: '/images/heroes/r2/about.webp',
  how_it_works: '/images/heroes/r2/how_it_works.webp',
  privacy: '/images/heroes/r2/privacy.webp',
  terms: '/images/heroes/r2/privacy.webp',
  medical: '/images/heroes/r2/crisis.webp',
  cookies: '/images/heroes/r2/privacy.webp',
  data_rights: '/images/heroes/r2/privacy.webp',
  rhythm_calendar: '/images/heroes/r2/cycle.webp',
};

export const MEMBER_HERO_IMAGES = Object.fromEntries(
  Object.entries(RAW_MEMBER_HERO_IMAGES).map(([tab, path]) => [tab, versionedStaticAsset(path)]),
) as Partial<Record<TabType, string>>;

export const getMemberHeroImage = (tab: TabType): string =>
  MEMBER_HERO_IMAGES[tab] ?? versionedStaticAsset('/images/heroes/r2/dashboard.webp');
