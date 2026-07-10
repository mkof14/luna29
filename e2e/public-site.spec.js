import { test, expect } from '@playwright/test';

const publicRoutes = [
  '/',
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
  '/rhythm-calendar',
  '/ritual-path',
  '/the-bridge',
  '/luna-balance',
  '/this-route-does-not-exist-xyz',
];

test.describe('public website', () => {
  for (const path of publicRoutes) {
    test(`loads ${path}`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err?.message || err)));
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `status for ${path}`).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();
      await expect(page).toHaveTitle(/luna/i);
      expect(pageErrors, pageErrors.join(' | ')).toEqual([]);
    });
  }

  test('mobile viewport landing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });

  test('sign-in entry is reachable', async ({ page }) => {
    await page.goto('/');
    const signin = page.getByTestId('public-signin');
    if (await signin.isVisible().catch(() => false)) {
      await signin.click();
      await expect(page.getByTestId('auth-email')).toBeVisible({ timeout: 10000 });
    } else {
      // Some AB variants land on auth differently — still require auth fields somewhere.
      await expect(page.getByTestId('auth-email').or(page.getByRole('button', { name: /sign in|log in|entrar/i }))).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('health and auth config via same-origin proxy', async ({ request }) => {
    const health = await request.get('/api/health');
    expect(health.ok()).toBeTruthy();
    const healthBody = await health.json();
    expect(healthBody.status).toBe('alive');
    expect(healthBody.checks).toBeUndefined();

    const config = await request.get('/api/auth/config');
    expect(config.ok()).toBeTruthy();
    const cfg = await config.json();
    expect(cfg.googleUnverifiedAllowed).toBe(false);
  });
});
