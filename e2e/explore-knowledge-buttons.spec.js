import { test, expect } from '@playwright/test';
test('explore knowledge buttons are clickable and wired to actions', async ({ page }) => {
  await page.addInitScript(() => {
    const encode = (value) => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
    const session = {
      id: 'e2e-session-id',
      name: 'E2E Admin',
      email: 'dnainform@gmail.com',
      provider: 'password',
      role: 'super_admin',
      permissions: ['manage_services', 'manage_marketing', 'manage_email_templates', 'manage_admin_roles', 'view_financials', 'view_technical_metrics'],
      lastLoginAt: new Date().toISOString(),
    };
    const log = [
      {
        id: 'onboarding-e2e',
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
  await page.waitForTimeout(250);

  await page.evaluate(() => {
    const target = document.querySelector('[data-testid="sidebar-nav-dashboard"]');
    if (target) {
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await expect(page.getByTestId('dashboard-explore-knowledge-btn')).toBeVisible();
  await expect(page.getByTestId('dashboard-open-reports-btn')).toBeVisible();

  await page.getByTestId('dashboard-explore-knowledge-btn').click();
  await expect(page.getByTestId('library-root')).toBeVisible();

  const firstCard = page.locator('[data-testid^="library-card-"]').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  await expect(page.getByTestId('hormone-detail')).toBeVisible();
  await page.getByTestId('hormone-add-to-brief').click();
  await expect(page.getByTestId('hormone-add-feedback')).toBeVisible();

  const briefCount = await page.evaluate(() => {
    const raw = window.localStorage.getItem('luna_hormone_brief_v1');
    if (!raw) return 0;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  });
  expect(briefCount).toBeGreaterThan(0);

  await page.getByTestId('hormone-detail-back').click();
  await expect(page.getByTestId('hormone-detail')).toBeHidden();

  await page.getByTestId('library-back').click();
  await expect(page.getByTestId('dashboard-checkin-start')).toBeVisible();

  const openReportsBtn = page.getByTestId('dashboard-open-reports-btn');
  if (await openReportsBtn.isVisible().catch(() => false)) {
    await openReportsBtn.click();
  } else {
    await page.evaluate(() => {
      const target = document.querySelector('[data-testid="sidebar-nav-labs"]');
      if (target) {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
  }
  await expect(page.getByTestId('labs-report-input')).toBeVisible();
});
