import { versionedAbsoluteAsset, versionedStaticAsset } from './staticAssetUrl';

const CANONICAL_SITE_URL = 'https://www.luna29.com';

const readEnvSiteUrl = (): string | null => {
  if (typeof process !== 'undefined' && process.env?.VITE_SITE_URL) {
    return String(process.env.VITE_SITE_URL).trim().replace(/\/$/, '');
  }
  return null;
};

const runtimeOrigin = (): string | null => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return null;
};

/** Public site URL for links in emails (production domain on local dev). */
export const resolveLunaSiteUrl = (): string => {
  const origin = runtimeOrigin();
  if (origin && !/localhost|127\.0\.0\.1/.test(window.location.hostname)) {
    return origin;
  }
  return readEnvSiteUrl() || CANONICAL_SITE_URL;
};

/** Same-origin in browser — for admin iframe preview. */
export const resolveLunaAssetBaseUrl = (): string => runtimeOrigin() || readEnvSiteUrl() || CANONICAL_SITE_URL;

/** Production CDN URLs for images inside emails sent to real inboxes. */
export const resolveLunaEmailAssetBaseUrl = (): string => readEnvSiteUrl() || CANONICAL_SITE_URL;

/** Canonical Luna brand names */
export const LUNA_BRAND_NAME = 'Luna';
export const LUNA_PRODUCT_NAME = 'Luna29';
export const LUNA_STUDIO_NAME = 'Luna29 Care Studio';
export const LUNA_TAGLINE = 'Private rhythm awareness & care';

/** Optimized assets in /public/brand */
export const LUNA_BRAND_PATHS = {
  icon: '/brand/luna-icon.png',
  iconEmail: '/brand/luna-icon-email.png',
  moonLockup: '/brand/luna-moon-lockup.png',
  wordmark: '/brand/luna-wordmark.png',
  wordmarkPurple: '/brand/luna-wordmark-purple.png',
  wordmarkCoral: '/brand/luna-wordmark-coral.png',
  lockup: '/brand/luna-lockup.png',
  hero: '/brand/luna-hero.jpg',
  heroWide: '/brand/luna-hero-banner.webp',
  appIcon: '/brand/luna-app-icon.png',
  appIcon192: '/brand/luna-app-icon-192.png',
} as const;

export type LunaBrandAssetKey = keyof typeof LUNA_BRAND_PATHS;

/** Versioned /brand/* path for in-app <img> tags. */
export const getBrandAssetUrl = (key: LunaBrandAssetKey): string =>
  versionedStaticAsset(LUNA_BRAND_PATHS[key]);

export type LunaBrandUrls = {
  icon: string;
  iconEmail: string;
  moonLockup: string;
  wordmark: string;
  wordmarkPurple: string;
  wordmarkCoral: string;
  lockup: string;
  hero: string;
  heroWide: string;
};

export const buildLunaBrandUrls = (baseUrl = resolveLunaAssetBaseUrl()): LunaBrandUrls => ({
  icon: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.icon),
  iconEmail: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.iconEmail),
  moonLockup: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.moonLockup),
  wordmark: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.wordmark),
  wordmarkPurple: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.wordmarkPurple),
  wordmarkCoral: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.wordmarkCoral),
  lockup: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.lockup),
  hero: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.hero),
  heroWide: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.heroWide),
});

/** Email-safe header — single Luna29 lockup on dark bar. */
export const buildEmailBrandHeaderHtml = (brand: LunaBrandUrls, subtitle?: string): string => {
  const tagline = subtitle || 'Private rhythm awareness & care';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:8px 0"><img src="${brand.lockup}" alt="Luna29" height="48" style="display:block;height:48px;width:auto;max-width:220px;margin:0 auto"/></td></tr><tr><td align="center" style="font-family:sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;padding-top:8px">${tagline}</td></tr></table>`;
};

/** Dark footer with address, copyright, and links. */
export const buildEmailBrandFooterHtml = (_brand: LunaBrandUrls, copyright: string): string =>
  `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px;background:#050508"><p style="margin:0 0 6px;font-family:sans-serif;font-size:11px;color:#cbd5e1">Rhythm & Balance · www.luna29.com</p><p style="margin:0;font-family:sans-serif;font-size:10px;color:#64748b">${copyright}</p></td></tr></table>`;

export const LUNA_SITE_URL = resolveLunaSiteUrl();
export const LUNA_BRAND_URLS = buildLunaBrandUrls();

export const lunaCopyright = (year = new Date().getFullYear()) =>
  `© ${year} ${LUNA_PRODUCT_NAME}. All rights reserved. · ${resolveLunaSiteUrl()}`;
