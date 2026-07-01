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

const releaseTag = String(process.env.VITE_APP_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || 'dev').trim().slice(0, 12);
const swSource = `const CACHE_NAME = 'luna-shell-${releaseTag}';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const shouldBypassServiceWorkerCache = (url) =>
  url.pathname.startsWith('/api/')
  || url.pathname.startsWith('/assets/')
  || url.pathname.startsWith('/images/')
  || url.pathname === '/sw.js';

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (shouldBypassServiceWorkerCache(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', cloned)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
`;

await fs.writeFile(path.join(root, 'public', 'sw.js'), swSource, 'utf8');
console.log(`SEO assets generated for ${siteUrl}`);
console.log(`Service worker cache tag: luna-shell-${releaseTag}`);
