import { test, expect } from '@playwright/test';

const publicRoutes = [
  { path: '/', title: /luna/i },
  { path: '/rhythm-calendar', title: /calendar|rhythm|luna/i },
  { path: '/pricing', title: /pricing|plan|luna/i },
  { path: '/how-it-works', title: /how|luna/i },
  { path: '/about', title: /about|luna/i },
  { path: '/faq', title: /faq|luna/i },
];

for (const route of publicRoutes) {
  test(`prod public page ${route.path}`, async ({ page }) => {
    const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('body')).toBeVisible();
  });
}

test('prod health API', async ({ request }) => {
  const response = await request.get('/api/health?verbose=1');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(body.checks?.database).toBe('postgres');
  expect(body.checks?.rateLimit).toBe('upstash');
});
