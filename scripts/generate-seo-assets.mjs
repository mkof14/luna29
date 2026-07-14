#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { readReleaseManifest, resolveCacheKey, resolveReleaseTag } from './releaseManifest.mjs';

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

const now = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (entry) =>
      `  <url><loc>${siteUrl}${entry === '/' ? '/' : entry}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq></url>`,
  )
  .join('\n')}
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

const emailHeroDir = path.join(heroesDir, 'email');
await fs.mkdir(emailHeroDir, { recursive: true });
let emailHeroCount = 0;
for (const name of heroFiles) {
  if (!name.endsWith('.webp')) continue;
  const stem = name.replace(/\.webp$/i, '');
  const dest = path.join(emailHeroDir, `${stem}.jpg`);
  try {
    await sharp(path.join(heroesR2Dir, name))
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(dest);
    emailHeroCount += 1;
  } catch (error) {
    console.warn(`[email-heroes] skip ${name}:`, error instanceof Error ? error.message : error);
  }
}

const manifest = readReleaseManifest();
const releaseTag = resolveCacheKey(manifest);
const releaseFull = resolveReleaseTag(manifest);

const versionPayload = {
  semver: manifest.semver,
  release: releaseFull,
  cacheKey: releaseTag,
  status: manifest.status,
  completedAt: manifest.completedAt,
  label: manifest.label || '',
  builtAt: new Date().toISOString(),
};

await fs.writeFile(
  path.join(root, 'public', 'version.json'),
  `${JSON.stringify(versionPayload, null, 2)}\n`,
  'utf8',
);

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
console.log(`Email hero JPEGs: ${emailHeroCount} files in /images/heroes/email/`);
console.log(`Release ${releaseFull} (${manifest.status}) · cache luna-shell-${releaseTag}`);
