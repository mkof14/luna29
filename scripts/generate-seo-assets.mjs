#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteUrl = String(process.env.VITE_SITE_URL || 'https://www.luna29.com').trim().replace(/\/+$/, '');

const paths = [
  '/',
  '/luna-balance',
  '/rhythm-calendar',
  '/ritual-path',
  '/the-bridge',
  '/pricing',
  '/about',
  '/how-it-works',
  '/faq',
  '/learning',
  '/legal',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/cookies',
  '/data-rights',
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((entry) => `  <url><loc>${siteUrl}${entry === '/' ? '/' : entry}</loc></url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await fs.writeFile(path.join(root, 'public', 'sitemap.xml'), sitemap, 'utf8');
await fs.writeFile(path.join(root, 'public', 'robots.txt'), robots, 'utf8');

const heroesDir = path.join(root, 'public', 'images', 'heroes');
const heroesR2Dir = path.join(heroesDir, 'r2');
await fs.mkdir(heroesR2Dir, { recursive: true });
const heroFiles = (await fs.readdir(heroesDir)).filter((name) => name.endsWith('.webp'));
await Promise.all(
  heroFiles.map((name) => fs.copyFile(path.join(heroesDir, name), path.join(heroesR2Dir, name))),
);

const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const releaseTag = String(
  process.env.VERCEL_GIT_COMMIT_SHA
  || process.env.VERCEL_DEPLOYMENT_ID
  || process.env.VITE_APP_RELEASE
  || pkg.version
  || 'dev',
).trim().slice(0, 12);

// Shell-only SW: purge stale caches on deploy. Do not intercept navigations or cache index.html.
const swSource = `const CACHE_NAME = 'luna-shell-${releaseTag}';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;

await fs.writeFile(path.join(root, 'public', 'sw.js'), swSource, 'utf8');
console.log(`SEO assets generated for ${siteUrl}`);
console.log(`Service worker cache tag: luna-shell-${releaseTag}`);
