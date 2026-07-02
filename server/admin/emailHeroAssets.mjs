/** Email-safe hero paths — keep in sync with utils/emailHeroAssets.ts */

export const EMAIL_HERO_PUBLIC_DIR = '/images/heroes/email';

export const normalizeEmailHeroStem = (heroFile) => {
  const stem = String(heroFile || 'dashboard.webp')
    .trim()
    .replace(/^.*\//, '')
    .replace(/\.(webp|jpe?g|png)$/i, '');
  return stem || 'dashboard';
};

export const buildEmailHeroPath = (heroFile) =>
  `${EMAIL_HERO_PUBLIC_DIR}/${normalizeEmailHeroStem(heroFile)}.jpg`;

export const EMAIL_TEMPLATE_HERO_BY_ID = {
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

export const resolveEmailHeroFile = (templateId = '', heroFile = '') => {
  const explicit = String(heroFile || '').trim();
  if (explicit) return explicit.replace(/^.*\//, '');
  return EMAIL_TEMPLATE_HERO_BY_ID[String(templateId || '').trim()] || 'admin.webp';
};

export const resolveTemplateHeroPath = (templateId = '', heroFile = '') =>
  buildEmailHeroPath(resolveEmailHeroFile(templateId, heroFile));
