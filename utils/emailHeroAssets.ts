/** Email-safe hero art — JPEG copies under /images/heroes/email/ (built from /heroes/r2/*.webp). */

export const EMAIL_HERO_PUBLIC_DIR = '/images/heroes/email';

export const normalizeEmailHeroStem = (heroFile: string): string => {
  const stem = String(heroFile || 'dashboard.webp')
    .trim()
    .replace(/^.*\//, '')
    .replace(/\.(webp|jpe?g|png)$/i, '');
  return stem || 'dashboard';
};

export const buildEmailHeroPath = (heroFile: string): string =>
  `${EMAIL_HERO_PUBLIC_DIR}/${normalizeEmailHeroStem(heroFile)}.jpg`;

export const buildEmailHeroUrl = (heroFile: string, baseUrl: string): string =>
  `${baseUrl.replace(/\/$/, '')}${buildEmailHeroPath(heroFile)}`;

/** Template id → source hero filename in /images/heroes/r2/ (mirrors admin catalog + lifecycle mail). */
export const EMAIL_TEMPLATE_HERO_BY_ID: Record<string, string> = {
  'tpl-welcome': 'dashboard.webp',
  'tpl-site-invite': 'dashboard.webp',
  'tpl-invite-member': 'dashboard.webp',
  'tpl-admin-invite': 'admin.webp',
  'tpl-invite-admin': 'admin.webp',
  'tpl-reset': 'profile.webp',
  'tpl-verify-email': 'profile.webp',
  'tpl-magic-link': 'profile.webp',
  'tpl-trial-start': 'today_mirror.webp',
  'tpl-trial-ending': 'insights_paywall.webp',
  'tpl-renewal': 'insights_paywall.webp',
  'tpl-churn-save': 'bridge.webp',
  'tpl-payment-failed': 'insights_paywall.webp',
  'tpl-payment-receipt': 'insights_paywall.webp',
  'tpl-report-ready': 'labs.webp',
  'tpl-newsletter': 'library.webp',
  'tpl-campaign': 'creative.webp',
  'tpl-cycle-reminder': 'cycle.webp',
  'tpl-partner-invite': 'relationships.webp',
  'tpl-new-device-alert': 'crisis.webp',
};

export const resolveEmailHeroFile = (templateId: string, heroFile = ''): string => {
  const explicit = String(heroFile || '').trim();
  if (explicit) return explicit.replace(/^.*\//, '');
  return EMAIL_TEMPLATE_HERO_BY_ID[String(templateId || '').trim()] || 'admin.webp';
};
