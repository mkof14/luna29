import { Language } from '../constants';
import {
  buildLunaBrandUrls,
  lunaCopyright,
  resolveLunaEmailAssetBaseUrl,
  resolveLunaSiteUrl,
} from './lunaBrandAssets';
import {
  buildLunaEmailDocumentHtml,
  buildLunaEmailPlainText,
  toEmailBrandAssets,
} from './lunaEmailLayout';
import { AdminTemplateDef, getTemplateLocalized, templateHeroUrl } from './adminTemplatesCatalog';

export type BrandedEmailInput = {
  lang: Language;
  template: AdminTemplateDef;
  ctaUrl?: string;
  bodyOverride?: string;
  subjectOverride?: string;
  preheaderOverride?: string;
};

const brandForBase = (baseUrl: string) =>
  toEmailBrandAssets(buildLunaBrandUrls(baseUrl));

/** Build full HTML email with official Luna moon + wordmarks, hero art, address, copyright. */
export const buildBrandedAdminEmailHtml = ({
  lang,
  template,
  ctaUrl,
  bodyOverride,
  subjectOverride,
  preheaderOverride,
}: BrandedEmailInput): { html: string; text: string; subject: string; preheader: string } => {
  const siteUrl = resolveLunaSiteUrl();
  const assetBase = resolveLunaEmailAssetBaseUrl();
  const brand = brandForBase(assetBase);
  const loc = getTemplateLocalized(template, lang);
  const subject = subjectOverride || loc.subject;
  const preheader = preheaderOverride || loc.preheader;
  const body = bodyOverride || loc.body;
  const cta = ctaUrl || siteUrl;
  const hero = templateHeroUrl(template.hero, assetBase);
  const copyright = lunaCopyright();

  const html = buildLunaEmailDocumentHtml({
    lang,
    preheader,
    subject,
    body,
    heroUrl: hero,
    brand,
    ctaLabel: loc.ctaLabel,
    ctaUrl: cta,
    copyright,
    siteUrl,
  });

  const text = buildLunaEmailPlainText({
    subject,
    body,
    ctaLabel: loc.ctaLabel,
    ctaUrl: cta,
    copyright,
    siteUrl,
  });

  return { html, text, subject, preheader };
};

/** Same-origin preview for admin iframe — assets always from production CDN. */
export const buildBrandedAdminEmailPreviewHtml = (input: BrandedEmailInput): string => {
  const siteUrl = resolveLunaSiteUrl();
  const assetBase = resolveLunaEmailAssetBaseUrl();
  const brand = brandForBase(assetBase);
  const loc = getTemplateLocalized(input.template, input.lang);
  const subject = input.subjectOverride || loc.subject;
  const preheader = input.preheaderOverride || loc.preheader;
  const body = input.bodyOverride || loc.body;
  const cta = input.ctaUrl || siteUrl;
  const hero = templateHeroUrl(input.template.hero, assetBase);

  return buildLunaEmailDocumentHtml({
    lang: input.lang,
    preheader,
    subject,
    body,
    heroUrl: hero,
    brand,
    ctaLabel: loc.ctaLabel,
    ctaUrl: cta,
    copyright: lunaCopyright(),
    siteUrl,
  });
};
