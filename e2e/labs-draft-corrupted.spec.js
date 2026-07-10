import { expect, test } from '@playwright/test';
import { clickSidebarNav, openMoreMenu } from './helpers/auth.js';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('labs view survives corrupted draft payload', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: true });
  await page.goto('/');
  await page.waitForTimeout(300);
  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-labs');

  await page.evaluate(() => {
    window.localStorage.setItem('luna_labs_draft_v1', JSON.stringify({
      input: 999,
      manualRows: [{ marker: 123, value: false }, null],
      sexualScores: { libido: 99, pain: -7 },
      reportLang: 'invalid',
      profile: { birthYear: 1992, cycleDay: '15' },
    }));
  });

  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-dashboard');
  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-labs');

  const input = page.getByTestId('labs-report-input');
  await expect(input).toBeVisible();
  await expect(input).toHaveValue('');

  await expect(page.getByTestId('labs-manual-marker-0')).toBeVisible();
  await expect(page.getByTestId('labs-manual-marker-0')).toHaveValue('');
});
