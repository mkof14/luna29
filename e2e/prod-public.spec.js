import { test, expect } from '@playwright/test';

/**
 * Production safe smoke — no auth mutations, no billing, no admin writes.
 * Health contract: public liveness is minimal; verbose requires secret.
 */

const publicRoutes = [
  { path: '/', title: /luna/i },
  { path: '/rhythm-calendar', title: /calendar|rhythm|luna/i },
  { path: '/ritual-path', title: /ritual|luna/i },
  { path: '/the-bridge', title: /bridge|luna/i },
  { path: '/pricing', title: /pricing|plan|luna/i },
  { path: '/how-it-works', title: /how|luna/i },
  { path: '/about', title: /about|luna/i },
  { path: '/faq', title: /faq|luna/i },
  { path: '/learning', title: /learn|luna/i },
  { path: '/legal', title: /legal|luna/i },
  { path: '/privacy', title: /privacy|luna/i },
  { path: '/terms', title: /terms|luna/i },
  { path: '/disclaimer', title: /disclaimer|luna/i },
  { path: '/cookies', title: /cookie|luna/i },
  { path: '/data-rights', title: /data|rights|luna|privacy/i },
];

for (const route of publicRoutes) {
  test(`prod public page ${route.path}`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err?.message || err)));
    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    expect(response?.ok() || response?.status() === 304).toBeTruthy();
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('body')).toBeVisible();
    expect(pageErrors, `uncaught JS on ${route.path}: ${pageErrors.join(' | ')}`).toEqual([]);
  });
}

test('prod public health is liveness-only', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(body.status).toBe('alive');
  expect(body.checks).toBeUndefined();
  expect(body.config).toBeUndefined();
  expect(body.googleAuth).toBeUndefined();
  expect(body.aiScan).toBeUndefined();
});

test('prod verbose health unauthorized without secret', async ({ request }) => {
  const response = await request.get('/api/health?verbose=1');
  expect(response.status()).toBe(401);
});

test('prod auth config is safe', async ({ request }) => {
  const response = await request.get('/api/auth/config');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.googleUnverifiedAllowed).toBe(false);
  expect(typeof body.googleEnabled).toBe('boolean');
  expect(typeof body.emailEnabled).toBe('boolean');
});

test('prod robots and sitemap', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
});
