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
  wordmark: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.wordmark),
  wordmarkPurple: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.wordmarkPurple),
  wordmarkCoral: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.wordmarkCoral),
  lockup: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.lockup),
  hero: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.hero),
  heroWide: versionedAbsoluteAsset(baseUrl, LUNA_BRAND_PATHS.heroWide),
});

/** Email-safe header: moon icon + Luna wordmark in purple and coral. */
export const buildEmailBrandHeaderHtml = (brand: LunaBrandUrls, subtitle?: string): string => {
  const subtitleHtml = subtitle
    ? `<p style="margin:8px 0 0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b">${subtitle}</p>`
    : '';
  return `<table role="presentation" cellspacing="0" cellpadding="0"><tr><td width="58" valign="middle" style="padding-right:14px"><img src="${brand.iconEmail}" alt="Luna" width="52" height="52" style="display:block;border-radius:14px;width:52px;height:52px;object-fit:contain"/></td><td valign="middle"><img src="${brand.wordmarkPurple}" alt="Luna" height="34" style="display:block;height:34px;width:auto;max-width:160px"/><img src="${brand.wordmarkCoral}" alt="" height="26" style="display:block;height:26px;width:auto;max-width:148px;margin-top:-2px;opacity:0.95"/>${subtitleHtml}</td></tr></table>`;
};

/** Compact brand row for email footers. */
export const buildEmailBrandFooterHtml = (brand: LunaBrandUrls, copyright: string): string =>
  `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td width="36" valign="middle"><img src="${brand.iconEmail}" alt="" width="32" height="32" style="display:block;border-radius:10px;width:32px;height:32px;object-fit:contain"/></td><td valign="middle" style="padding-left:10px"><img src="${brand.wordmarkPurple}" alt="Luna" height="20" style="display:inline-block;height:20px;width:auto;vertical-align:middle"/><img src="${brand.wordmarkCoral}" alt="" height="16" style="display:inline-block;height:16px;width:auto;margin-left:6px;vertical-align:middle;opacity:0.9"/></td></tr><tr><td colspan="2" style="padding-top:10px"><p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#cbd5e1">Luna29 — private reflective space for rhythm awareness.</p><p style="margin:0;font-size:11px;color:#94a3b8">${copyright}</p></td></tr></table>`;

export const LUNA_SITE_URL = resolveLunaSiteUrl();
export const LUNA_BRAND_URLS = buildLunaBrandUrls();

export const lunaCopyright = (year = new Date().getFullYear()) =>
  `© ${year} ${LUNA_PRODUCT_NAME}. All rights reserved. · ${resolveLunaSiteUrl()}`;
