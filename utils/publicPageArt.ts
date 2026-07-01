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
  map: '/images/heroes/r2/cycle.webp',
  ritual: '/images/heroes/r2/my_day.webp',
  bridge: '/images/heroes/r2/bridge.webp',
  pricing: '/images/heroes/r2/insights_paywall.webp',
  about: '/images/heroes/r2/about.webp',
  how_it_works: '/images/heroes/r2/how_it_works.webp',
  faq: '/images/heroes/r2/faq.webp',
  learning: '/images/heroes/r2/library.webp',
  privacy: '/images/heroes/r2/privacy.webp',
  terms: '/images/heroes/r2/privacy.webp',
  medical: '/images/heroes/r2/crisis.webp',
  cookies: '/images/heroes/r2/privacy.webp',
  data_rights: '/images/heroes/r2/privacy.webp',
  calendar: '/images/heroes/r2/monthly_reflection.webp',
};

/** Quiet watercolor backgrounds — reuses member hero art at low opacity. */
export const PUBLIC_PAGE_ART = Object.fromEntries(
  Object.entries(RAW_PUBLIC_PAGE_ART).map(([page, path]) => [page, versionedStaticAsset(path)]),
) as Record<PublicArtPage, string>;
