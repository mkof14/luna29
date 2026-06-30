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
console.log(`SEO assets generated for ${siteUrl}`);
