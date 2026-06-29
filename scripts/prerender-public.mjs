#!/usr/bin/env node
/**
 * Post-build prerender for public SEO routes.
 * Runs against `vite preview` and writes static HTML snapshots to dist/prerender/.
 */
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const prerenderDir = path.join(distDir, 'prerender');
const previewPort = Number(process.env.PRERENDER_PORT || 4173);
const previewUrl = `http://127.0.0.1:${previewPort}`;

const routes = [
  '/',
  '/luna-balance',
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

const waitForServer = async (url, timeoutMs = 60_000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Preview server did not start at ${url}`);
};

const routeToFile = (route) => {
  if (route === '/') return path.join(prerenderDir, 'index.html');
  const slug = route.replace(/^\//, '');
  return path.join(prerenderDir, slug, 'index.html');
};

const run = async () => {
  if (!(await fs.stat(distDir).catch(() => null))) {
    console.warn('[prerender] dist/ missing — skip');
    return;
  }

  const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(previewPort)], {
    cwd: root,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  let previewLog = '';
  preview.stderr?.on('data', (chunk) => {
    previewLog += String(chunk);
  });

  try {
    await waitForServer(previewUrl);
    await fs.mkdir(prerenderDir, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    for (const route of routes) {
      const target = `${previewUrl}${route === '/' ? '/' : route}`;
      await page.goto(target, { waitUntil: 'networkidle', timeout: 45_000 });
      await page.waitForTimeout(800);
      const html = await page.content();
      const outPath = routeToFile(route);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, html, 'utf8');
      console.log(`[prerender] ${route} → ${path.relative(root, outPath)}`);
    }

    await browser.close();

    const manifest = {
      generatedAt: new Date().toISOString(),
      routes,
      note: 'Serve via CDN or bot detection for crawlers; SPA fallback remains index.html for users.',
    };
    await fs.writeFile(path.join(prerenderDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`[prerender] Done — ${routes.length} routes`);
  } finally {
    preview.kill('SIGTERM');
    if (preview.exitCode === null) {
      await new Promise((resolve) => preview.once('exit', resolve));
    }
    if (previewLog.trim()) {
      process.stderr.write(previewLog);
    }
  }
};

run().catch((error) => {
  console.error('[prerender] failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
