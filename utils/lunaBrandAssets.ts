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
  wordmark: '/brand/luna-wordmark.png',
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
  wordmark: string;
  lockup: string;
  hero: string;
  heroWide: string;
};

export const buildLunaBrandUrls = (baseUrl = resolveLunaAssetBaseUrl()): LunaBrandUrls => ({
  icon: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.icon),
  iconEmail: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.iconEmail),
  wordmark: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.wordmark),
  lockup: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.lockup),
  hero: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.hero),
  heroWide: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.heroWide),
});

export const LUNA_SITE_URL = resolveLunaSiteUrl();
export const LUNA_BRAND_URLS = buildLunaBrandUrls();

export const lunaCopyright = (year = new Date().getFullYear()) =>
  `© ${year} ${LUNA_PRODUCT_NAME}. All rights reserved. · ${resolveLunaSiteUrl()}`;
