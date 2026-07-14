#!/usr/bin/env node
/**
 * Post-vite: write crawlable HTML shells for public SEO routes into dist/.
 * Vercel serves these files before the SPA rewrite catch-all.
 * No Playwright — safe on Vercel builders.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const siteUrl = String(process.env.VITE_SITE_URL || 'https://www.luna29.com').trim().replace(/\/+$/, '');
const nowIso = new Date().toISOString();

const ROUTES = [
  {
    path: '/',
    title: 'Luna29 | Your Daily Emotional Mirror',
    description:
      'Luna29 is a calm daily emotional mirror for women. Speak, check in, and see gentle insights about your rhythm over time.',
    h1: 'Your body has a language — Luna29 helps you read it',
    body: 'A calm mirror for how your body feels across your cycle — private, observational, and never a medical diagnosis. Start a 7-day free trial or create a free account.',
  },
  {
    path: '/pricing',
    title: 'Pricing | Luna29',
    description: 'Simple Luna29 pricing: monthly or yearly membership with a 7-day free trial. Cancel anytime.',
    h1: 'Simple, transparent pricing',
    body: 'Luna29 Member Access — $12.99 per month or $89 per year. Includes a 7-day free trial via Stripe Checkout. Free tier forever for daily check-in and limited Bridge reflections.',
  },
  {
    path: '/faq',
    title: 'FAQ | Luna29',
    description: 'Frequently asked questions about Luna29 privacy, medical disclaimer, reports, and partner support.',
    h1: 'Frequently asked questions',
    body: 'Luna29 is not a medical service or therapy. Data is local-first by design. Partners can use The Bridge and Partner FAQ for calm communication.',
  },
  {
    path: '/about',
    title: 'About Luna29',
    description: 'About Luna29 — private rhythm awareness and care for women.',
    h1: 'About Luna29',
    body: 'Luna29 helps you notice links between body, state, and words — without streaks, guilt, or medical claims.',
  },
  {
    path: '/how-it-works',
    title: 'How It Works | Luna29',
    description: 'How Luna29 works: check-ins, voice reflection, rhythm map, and calm wording tools.',
    h1: 'How Luna29 works',
    body: 'Observe your body and senses, then turn them into clear words. Optional premium unlocks deeper patterns and reports.',
  },
  {
    path: '/privacy',
    title: 'Privacy Notice | Luna29',
    description: 'Luna29 Privacy Notice — how we handle account, billing, and wellness information.',
    h1: 'Privacy Notice',
    body: 'We do not sell your behavioral or physiological profiles. Billing is handled by Stripe; we do not store full card numbers.',
  },
  {
    path: '/terms',
    title: 'Terms | Luna29',
    description: 'Luna29 Terms of Use for access, subscriptions, and acceptable use.',
    h1: 'Terms of Use',
    body: 'By using Luna29 you agree to these terms and our Privacy Notice. Subscriptions are processed through Stripe.',
  },
  {
    path: '/disclaimer',
    title: 'Disclaimer | Luna29',
    description: 'Luna29 wellness disclaimer — not medical advice, diagnosis, or treatment.',
    h1: 'Wellness notice',
    body: 'Luna29 is not a medical service, medical device, diagnostic tool, or treatment provider.',
  },
  {
    path: '/luna-balance',
    title: 'Luna29 Balance | Visual Rhythm Map',
    description: 'Luna29 Balance — a visual map of physiological rhythms and markers.',
    h1: 'Luna29 Balance',
    body: 'A visual map of how hormonal and biological markers can interact with energy, focus, and mood over time.',
  },
  {
    path: '/rhythm-calendar',
    title: 'Rhythm Calendar | Luna29',
    description: 'Editorial month and year rhythm calendar with daily notes.',
    h1: 'Rhythm Calendar',
    body: 'See your cycle as an editorial map — not red dots. Notes, print, and sync inside your private space.',
  },
  {
    path: '/ritual-path',
    title: 'Ritual Path | Luna29',
    description: 'Ritual Path — a minute a day, no streaks, no guilt.',
    h1: 'Ritual Path',
    body: 'A gentle daily practice for noticing one sensation without pressure.',
  },
  {
    path: '/the-bridge',
    title: 'The Bridge | Luna29',
    description: 'The Bridge turns inner weather into calm words for yourself or someone you trust.',
    h1: 'The Bridge',
    body: 'Short prompts that turn uncertainty into clear, calm communication.',
  },
  {
    path: '/learning',
    title: 'Learning | Luna29',
    description: 'Learning resources about rhythm, hormones, and calm observation with Luna29.',
    h1: 'Learning',
    body: 'Educational content to support observation — not medical advice.',
  },
  {
    path: '/legal',
    title: 'Legal | Luna29',
    description: 'Legal hub for Luna29: privacy, terms, cookies, and data rights.',
    h1: 'Legal',
    body: 'Privacy Notice, Terms of Use, Cookies, Wellness Notice, and Data Rights.',
  },
  {
    path: '/cookies',
    title: 'Cookies Notice | Luna29',
    description: 'How Luna29 uses cookies and similar technologies.',
    h1: 'Cookies Notice',
    body: 'Essential cookies keep the app working. Analytics cookies are optional and require consent.',
  },
  {
    path: '/data-rights',
    title: 'Data Rights | Luna29',
    description: 'Your data rights with Luna29 including access, export, and deletion.',
    h1: 'Your data rights',
    body: 'Request access, correction, or deletion of personal information we maintain, subject to legal exceptions.',
  },
];

/** Canonical FAQ for rich results — single source; injected only on / and /faq. */
const FAQ_FOR_SCHEMA = [
  {
    q: 'Is Luna29 medical?',
    a: 'No. Luna29 is not a medical service, medical device, diagnostic tool, or treatment provider.',
  },
  {
    q: 'Does Luna29 sell personal data?',
    a: 'No. The business model is subscription-based access to tools — not data brokerage.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. New members can start a 7-day free trial through Stripe Checkout for monthly or yearly plans.',
  },
  {
    q: 'Is Luna29 therapy?',
    a: 'No. Luna29 is not therapy and does not replace mental health professionals.',
  },
];

/** Rolling offer end date for Google rich results (regenerated each build). */
const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Injected only on / and /pricing — not in base index.html (avoids duplicates). */
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Luna29 Membership',
  description: 'Private rhythm awareness membership with monthly or yearly billing and a 7-day free trial.',
  brand: { '@type': 'Brand', name: 'Luna29' },
  offers: [
    {
      '@type': 'Offer',
      price: '12.99',
      priceCurrency: 'USD',
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/pricing`,
      name: 'Monthly',
    },
    {
      '@type': 'Offer',
      price: '89.00',
      priceCurrency: 'USD',
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/pricing`,
      name: 'Yearly',
    },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_FOR_SCHEMA.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

/** Drop Product/FAQ from the Vite base shell so non-target routes stay clean. */
const stripJsonLdTypes = (html, types) =>
  html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, (block) => {
    try {
      const raw = block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
      const json = JSON.parse(raw);
      const type = json?.['@type'];
      if (typeof type === 'string' && types.includes(type)) return '';
    } catch {
      // keep unparseable blocks
    }
    return block;
  });

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const inject = (html, route) => {
  const url = route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`;
  // Base index keeps WebSite + Organization only; Product/FAQ are route-scoped below.
  let next = stripJsonLdTypes(html, ['Product', 'FAQPage']);
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  next = next.replace(
    /(<meta\s+name=["']description["']\s+content=["'])([^"']*)(["'])/i,
    `$1${escapeHtml(route.description)}$3`,
  );
  next = next.replace(
    /(<meta\s+property=["']og:title["']\s+content=["'])([^"']*)(["'])/i,
    `$1${escapeHtml(route.title)}$3`,
  );
  next = next.replace(
    /(<meta\s+property=["']og:description["']\s+content=["'])([^"']*)(["'])/i,
    `$1${escapeHtml(route.description)}$3`,
  );
  next = next.replace(/(<meta\s+property=["']og:url["']\s+content=["'])([^"']*)(["'])/i, `$1${url}$3`);
  next = next.replace(/(<link\s+rel=["']canonical["']\s+href=["'])([^"']*)(["'])/i, `$1${url}$3`);
  next = next.replace(
    /(<meta\s+name=["']twitter:title["']\s+content=["'])([^"']*)(["'])/i,
    `$1${escapeHtml(route.title)}$3`,
  );
  next = next.replace(
    /(<meta\s+name=["']twitter:description["']\s+content=["'])([^"']*)(["'])/i,
    `$1${escapeHtml(route.description)}$3`,
  );

  const extraLd = [];
  if (route.path === '/' || route.path === '/pricing') extraLd.push(productJsonLd);
  if (route.path === '/' || route.path === '/faq') extraLd.push(faqJsonLd);
  const ldHtml = extraLd
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join('\n');

  const noscript = `<noscript><main><h1>${escapeHtml(route.h1)}</h1><p>${escapeHtml(route.body)}</p><p><a href="${siteUrl}/pricing">Pricing</a> · <a href="${siteUrl}/privacy">Privacy</a> · <a href="${siteUrl}/faq">FAQ</a></p></main></noscript>`;

  if (ldHtml) {
    next = next.replace('</head>', `${ldHtml}\n</head>`);
  }
  if (!next.includes('<noscript>')) {
    next = next.replace('<div id="root"></div>', `<div id="root"></div>\n${noscript}`);
  } else {
    next = next.replace('<div id="root"></div>', `<div id="root"></div>\n${noscript}`);
  }
  next = next.replace(
    '</body>',
    `<!-- luna-seo-shell ${route.path} ${nowIso} -->\n</body>`,
  );
  return next;
};

const run = async () => {
  const indexPath = path.join(distDir, 'index.html');
  if (!(await fs.stat(indexPath).catch(() => null))) {
    console.warn('[seo-shells] dist/index.html missing — skip');
    return;
  }
  const base = await fs.readFile(indexPath, 'utf8');

  for (const route of ROUTES) {
    const html = inject(base, route);
    if (route.path === '/') {
      await fs.writeFile(indexPath, html, 'utf8');
      console.log('[seo-shells] / → dist/index.html');
      continue;
    }
    const outDir = path.join(distDir, route.path.replace(/^\//, ''));
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, 'index.html');
    await fs.writeFile(outPath, html, 'utf8');
    console.log(`[seo-shells] ${route.path} → ${path.relative(root, outPath)}`);
  }

  await fs.writeFile(
    path.join(distDir, 'seo-shells-manifest.json'),
    JSON.stringify({ generatedAt: nowIso, routes: ROUTES.map((r) => r.path) }, null, 2),
    'utf8',
  );
  console.log(`[seo-shells] Done — ${ROUTES.length} routes`);
};

run().catch((error) => {
  console.error('[seo-shells] failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
