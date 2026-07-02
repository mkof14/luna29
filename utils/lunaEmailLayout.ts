/** Shared Luna29 email shell — single lockup wordmark on dark brand bar. */

export const LUNA_EMAIL_TAGLINE = 'Private rhythm awareness & care';
export const LUNA_EMAIL_ADDRESS = 'Rhythm & Balance · www.luna29.com';
export const LUNA_EMAIL_SUPPORT = 'hello@luna29.com';

export type LunaEmailBrandAssets = {
  lockupUrl: string;
};

const escapeHtml = (value: string): string =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Dark brand header — single Luna29 lockup, centered. */
export const buildLunaEmailHeaderHtml = (
  brand: LunaEmailBrandAssets,
  tagline = LUNA_EMAIL_TAGLINE,
): string => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center" style="padding:8px 0 4px;">
      <img src="${brand.lockupUrl}" alt="Luna29" height="56" style="display:block;height:56px;width:auto;max-width:240px;margin:0 auto;" />
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:10px 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">
      ${escapeHtml(tagline)}
    </td>
  </tr>
</table>`;

export type LunaEmailFooterInput = {
  copyright: string;
  address?: string;
  supportEmail?: string;
  siteUrl?: string;
};

export const buildLunaEmailFooterHtml = ({
  copyright,
  address = LUNA_EMAIL_ADDRESS,
  supportEmail = LUNA_EMAIL_SUPPORT,
  siteUrl = 'https://www.luna29.com',
}: LunaEmailFooterInput): string => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center" style="padding:26px 24px 28px;background:#050508;">
      <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;line-height:1.65;color:#cbd5e1;">${escapeHtml(address)}</p>
      <p style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:10px;color:#64748b;">${escapeHtml(copyright)}</p>
      <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;">
        <a href="${escapeHtml(siteUrl)}" style="color:#c4b5fd;text-decoration:none;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a>
        <span style="color:#475569;"> · </span>
        <a href="mailto:${escapeHtml(supportEmail)}" style="color:#fda4af;text-decoration:none;">${escapeHtml(supportEmail)}</a>
      </p>
    </td>
  </tr>
</table>`;

export type LunaEmailDocumentInput = {
  lang?: string;
  preheader: string;
  subject: string;
  body: string;
  heroUrl: string;
  brand: LunaEmailBrandAssets;
  ctaLabel?: string;
  ctaUrl?: string;
  copyright: string;
  siteUrl?: string;
};

/** Full responsive email document — Luna brand assets + hero illustration. */
export const buildLunaEmailDocumentHtml = ({
  lang = 'en',
  preheader,
  subject,
  body,
  heroUrl,
  brand,
  ctaLabel = '',
  ctaUrl = '',
  copyright,
  siteUrl = 'https://www.luna29.com',
}: LunaEmailDocumentInput): string => {
  const safeSubject = escapeHtml(subject);
  const safePreheader = escapeHtml(preheader || subject);
  const safeBody = escapeHtml(body).replace(/\n/g, '<br/>');
  const header = buildLunaEmailHeaderHtml(brand);
  const footer = buildLunaEmailFooterHtml({ copyright, siteUrl });
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 4px;"><tr><td align="center" style="border-radius:999px;background:linear-gradient(135deg,#a855f7 0%,#7c3aed 50%,#ec4899 100%);"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(ctaLabel)}</a></td></tr></table>`
      : '';

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light dark"/>
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:Georgia,'Times New Roman',serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${safePreheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#eef2ff,#e0e7ff);padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid rgba(30,27,75,0.12);box-shadow:0 24px 60px rgba(49,46,129,0.12);">
          <tr><td style="height:4px;background:linear-gradient(90deg,#7c3aed,#c026d3,#fb7185);font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:20px 24px 16px;background:#050508;border-bottom:1px solid #1e1b4b;">${header}</td></tr>
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <img src="${heroUrl}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;max-height:280px;object-fit:cover;object-position:center 40%;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 20px;font-family:Georgia,'Times New Roman',serif;background:#ffffff;">
              <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#0f172a;font-weight:700;letter-spacing:-0.01em;">${safeSubject}</h1>
              <p style="margin:0;font-size:16px;line-height:1.7;color:#475569;font-weight:400;">${safeBody}</p>
              ${ctaBlock}
            </td>
          </tr>
          <tr><td style="padding:0;">${footer}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const buildLunaEmailPlainText = ({
  subject,
  body,
  ctaLabel = '',
  ctaUrl = '',
  copyright,
  siteUrl = 'https://www.luna29.com',
}: Pick<LunaEmailDocumentInput, 'subject' | 'body' | 'ctaLabel' | 'ctaUrl' | 'copyright' | 'siteUrl'>): string => {
  const lines = [subject, '', body];
  if (ctaLabel && ctaUrl) lines.push('', `${ctaLabel}: ${ctaUrl}`);
  lines.push('', copyright, LUNA_EMAIL_SUPPORT, siteUrl.replace(/^https?:\/\//, ''));
  return lines.filter(Boolean).join('\n');
};

/** Map LunaBrandUrls → email asset bundle. */
export const toEmailBrandAssets = (urls: { lockup: string }): LunaEmailBrandAssets => ({
  lockupUrl: urls.lockup,
});
