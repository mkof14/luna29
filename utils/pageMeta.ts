const upsertMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`${selector}[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  if (typeof document === 'undefined') return;
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.href = href;
};

export type PageMetaInput = {
  title: string;
  description: string;
  url: string;
};

export const updatePageMeta = ({ title, description, url }: PageMetaInput) => {
  if (typeof document === 'undefined') return;
  document.title = title;
  upsertMeta('meta', 'name', 'description', description);
  upsertMeta('meta', 'property', 'og:title', title);
  upsertMeta('meta', 'property', 'og:description', description);
  upsertMeta('meta', 'property', 'og:url', url);
  upsertMeta('meta', 'name', 'twitter:title', title);
  upsertMeta('meta', 'name', 'twitter:description', description);
  upsertCanonical(url);
};

export const resolveSiteUrl = (): string => {
  const fromEnv = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, '');
  return fromEnv || 'https://www.luna29.com';
};

export const buildPublicPageUrl = (siteUrl: string, pathname: string, lang: string): string => {
  const path = pathname === '/' ? '' : pathname;
  const base = `${siteUrl}${path}`;
  if (lang === 'en') return base || `${siteUrl}/`;
  const joiner = base.includes('?') ? '&' : '?';
  return `${base || `${siteUrl}/`}${joiner}lang=${lang}`;
};
