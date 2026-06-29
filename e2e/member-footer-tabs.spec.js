import { test, expect } from '@playwright/test';

const footerOnlyTabs = ['about', 'how_it_works', 'privacy', 'terms', 'medical', 'cookies', 'data_rights'];

test('footer-only member tabs are reachable and clickable', async ({ page }) => {
  await page.addInitScript(() => {
    const encode = (value) => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
    const session = {
      id: 'e2e-footer-session-id',
      name: 'E2E Footer Admin',
      email: 'dnainform@gmail.com',
      provider: 'password',
      role: 'super_admin',
      permissions: ['manage_services', 'manage_marketing', 'manage_email_templates', 'manage_admin_roles', 'view_financials', 'view_technical_metrics'],
      lastLoginAt: new Date().toISOString(),
    };
    const log = [
      {
        id: 'onboarding-footer-e2e',
        timestamp: new Date().toISOString(),
        type: 'ONBOARDING_COMPLETE',
        version: 4,
        payload: {},
      },
    ];
    window.localStorage.setItem('luna_auth_session_v2', encode(session));
    window.localStorage.setItem('luna_event_log_v3', JSON.stringify(log));
  });

  await page.goto('/');
  await page.waitForTimeout(350);

  for (const tab of footerOnlyTabs) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footerButton = page.getByTestId(`footer-nav-${tab}`);
    await expect(footerButton).toBeVisible();
    await footerButton.scrollIntoViewIfNeeded();
    await footerButton.evaluate((el) => el.click());
    await expect(page.getByTestId(`member-tab-${tab}`)).toBeVisible();
  }
});
