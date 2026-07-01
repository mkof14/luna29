import { versionedStaticAsset } from './staticAssetUrl';

export type PublicArtPage =
  | 'home'
  | 'map'
  | 'ritual'
  | 'bridge'
  | 'pricing'
  | 'about'
  | 'how_it_works'
  | 'faq'
  | 'learning'
  | 'privacy'
  | 'terms'
  | 'medical'
  | 'cookies'
  | 'data_rights'
  | 'calendar';

/** Main public landing hero — watercolor studio with moon & peonies. */
export const PUBLIC_HOME_ART = versionedStaticAsset('/images/public-home-hero.png');

const RAW_PUBLIC_PAGE_ART: Record<PublicArtPage, string> = {
  home: '/images/public-home-hero.png',
  map: '/images/heroes/cycle.webp',
  ritual: '/images/heroes/my_day.webp',
  bridge: '/images/heroes/bridge.webp',
  pricing: '/images/heroes/insights_paywall.webp',
  about: '/images/heroes/about.webp',
  how_it_works: '/images/heroes/how_it_works.webp',
  faq: '/images/heroes/faq.webp',
  learning: '/images/heroes/library.webp',
  privacy: '/images/heroes/privacy.webp',
  terms: '/images/heroes/privacy.webp',
  medical: '/images/heroes/crisis.webp',
  cookies: '/images/heroes/privacy.webp',
  data_rights: '/images/heroes/privacy.webp',
  calendar: '/images/heroes/monthly_reflection.webp',
};

/** Quiet watercolor backgrounds — reuses member hero art at low opacity. */
export const PUBLIC_PAGE_ART = Object.fromEntries(
  Object.entries(RAW_PUBLIC_PAGE_ART).map(([page, path]) => [page, versionedStaticAsset(path)]),
) as Record<PublicArtPage, string>;
