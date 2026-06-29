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
export const PUBLIC_HOME_ART = '/images/public-home-hero.png';

/** Quiet watercolor backgrounds — reuses member hero art at low opacity. */
export const PUBLIC_PAGE_ART: Record<PublicArtPage, string> = {
  home: PUBLIC_HOME_ART,
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
  calendar: '/images/heroes/monthly_reflection.webp'};
