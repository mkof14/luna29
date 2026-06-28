const trim = (value?: string) => (value ?? '').trim();

const webBase = trim(process.env.EXPO_PUBLIC_WEB_BASE_URL) || 'https://luna29.vercel.app';

export const publicWebBaseUrl = webBase.replace(/\/+$/, '');

export const publicWebUrl = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${publicWebBaseUrl}${normalized}`;
};

export const PUBLIC_WEB_PATHS = {
  home: '/',
  ritual: '/ritual-path',
  body: '/luna-balance',
  bridge: '/the-bridge',
  pricing: '/pricing',
  faq: '/faq',
  contact: '/contact',
  partnerFaq: '/partner-faq',
  about: '/about',
  how: '/how-it-works',
  learning: '/learning',
  privacy: '/privacy',
  terms: '/terms',
  medical: '/disclaimer',
  cookies: '/cookies',
  dataRights: '/data-rights',
} as const;

export type PublicWebPathKey = keyof typeof PUBLIC_WEB_PATHS;

export const publicWebLink = (key: PublicWebPathKey): string => publicWebUrl(PUBLIC_WEB_PATHS[key]);
