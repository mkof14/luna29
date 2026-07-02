/**
 * Branded admin/marketing email — single Luna29 lockup wordmark.
 */
const BRAND = {
  name: 'Luna29',
  tagline: 'Private rhythm awareness & care',
  address: String(process.env.LUNA_BRAND_ADDRESS || 'Rhythm & Balance · www.luna29.com').trim(),
  supportEmail: String(process.env.LUNA_SUPPORT_EMAIL || 'hello@luna29.com').trim(),
};

const BRAND_PATHS = {
  lockup: '/brand/luna-lockup.png',
};

const resolveSiteUrl = () => {
  const explicit = String(
    process.env.VITE_SITE_URL || process.env.SITE_URL || process.env.PUBLIC_SITE_URL || '',
  ).trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = String(process.env.VERCEL_URL || '').trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '')}`;
  return 'https://www.luna29.com';
};

const HERO_BY_TEMPLATE = {
  'tpl-welcome': 'dashboard.webp',
  'tpl-reset': 'profile.webp',
  'tpl-renewal': 'insights_paywall.webp',
  'tpl-churn-save': 'bridge.webp',
  'tpl-verify-email': 'profile.webp',
  'tpl-magic-link': 'profile.webp',
  'tpl-new-device-alert': 'crisis.webp',
  'tpl-trial-start': 'today_mirror.webp',
  'tpl-trial-ending': 'insights_paywall.webp',
  'tpl-payment-failed': 'insights_paywall.webp',
  'tpl-payment-receipt': 'insights_paywall.webp',
  'tpl-invite-member': 'dashboard.webp',
  'tpl-site-invite': 'dashboard.webp',
  'tpl-invite-admin': 'admin.webp',
  'tpl-admin-invite': 'admin.webp',
  'tpl-newsletter': 'library.webp',
  'tpl-cycle-reminder': 'cycle.webp',
  'tpl-report-ready': 'labs.webp',
  'tpl-partner-invite': 'relationships.webp',
  'tpl-campaign': 'creative.webp',
};

export const resolveTemplateHeroPath = (templateId = '') => {
  const file = HERO_BY_TEMPLATE[String(templateId || '').trim()] || 'admin.webp';
  return `/images/heroes/r2/${file}`;
};

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildHeader = (baseUrl) => {
  const lockup = `${baseUrl}${BRAND_PATHS.lockup}`;
  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr><td align="center" style="padding:8px 0 4px;">
    <img src="${lockup}" alt="Luna29" height="56" style="display:block;height:56px;width:auto;max-width:240px;margin:0 auto;" />
  </td></tr>
  <tr><td align="center" style="padding:10px 0 4px;font-family:sans-serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">${escapeHtml(BRAND.tagline)}</td></tr>
</table>`;
};

const buildFooter = (siteUrl) => {
  const year = new Date().getFullYear();
  const copyright = `© ${year} ${BRAND.name}. All rights reserved. · ${siteUrl}`;
  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr><td align="center" style="padding:26px 24px 28px;background:#050508;">
    <p style="margin:0 0 8px;font-family:sans-serif;font-size:11px;line-height:1.65;color:#cbd5e1;">${escapeHtml(BRAND.address)}</p>
    <p style="margin:0 0 12px;font-family:sans-serif;font-size:10px;color:#64748b;">${escapeHtml(copyright)}</p>
    <p style="margin:0;font-family:sans-serif;font-size:11px;">
      <a href="${escapeHtml(siteUrl)}" style="color:#c4b5fd;text-decoration:none;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a>
      <span style="color:#475569;"> · </span>
      <a href="mailto:${escapeHtml(BRAND.supportEmail)}" style="color:#fda4af;text-decoration:none;">${escapeHtml(BRAND.supportEmail)}</a>
    </p>
  </td></tr>
</table>`;
};

export const renderBrandedEmailHtml = ({
  subject = 'Luna29',
  preheader = '',
  body = '',
  templateId = '',
  ctaLabel = '',
  ctaUrl = '',
  siteUrl = resolveSiteUrl(),
} = {}) => {
  const assetBase = siteUrl.replace(/\/$/, '');
  const heroUrl = `${assetBase}${resolveTemplateHeroPath(templateId)}`;
  const safeSubject = escapeHtml(subject);
  const safePreheader = escapeHtml(preheader || subject);
  const safeBody = escapeHtml(body).replace(/\n/g, '<br/>');
  const header = buildHeader(assetBase);
  const footer = buildFooter(siteUrl);
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 4px;"><tr><td align="center" style="border-radius:999px;background:linear-gradient(135deg,#a855f7,#7c3aed,#ec4899);"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 32px;font-family:sans-serif;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#fff;text-decoration:none;">${escapeHtml(ctaLabel)}</a></td></tr></table>`
      : '';

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${safeSubject}</title></head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:Georgia,serif;">
<div style="display:none;max-height:0;overflow:hidden;">${safePreheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ff;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden;border:1px solid rgba(30,27,75,0.12);box-shadow:0 24px 60px rgba(49,46,129,0.12);">
<tr><td style="height:4px;background:linear-gradient(90deg,#7c3aed,#c026d3,#fb7185);">&nbsp;</td></tr>
<tr><td style="padding:20px 24px 16px;background:#050508;border-bottom:1px solid #1e1b4b;">${header}</td></tr>
<tr><td style="padding:0;line-height:0;"><img src="${heroUrl}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;max-height:280px;object-fit:cover;object-position:center 40%;"/></td></tr>
<tr><td style="padding:32px 28px 20px;background:#fff;"><h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#0f172a;font-weight:700;">${safeSubject}</h1><p style="margin:0;font-size:16px;line-height:1.7;color:#475569;">${safeBody}</p>${ctaBlock}</td></tr>
<tr><td style="padding:0;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
};

export const renderPlainEmailText = ({ subject = 'Luna29', body = '', ctaLabel = '', ctaUrl = '' } = {}) => {
  const siteUrl = resolveSiteUrl();
  const lines = [subject, '', body];
  if (ctaLabel && ctaUrl) lines.push('', `${ctaLabel}: ${ctaUrl}`);
  lines.push('', `© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.`, BRAND.supportEmail, siteUrl.replace(/^https?:\/\//, ''));
  return lines.filter(Boolean).join('\n');
};

export const getBrandMeta = () => ({ ...BRAND, siteUrl: resolveSiteUrl() });
