import { expect, test } from '@playwright/test';
import { clickSidebarNav, openMoreMenu } from './helpers/auth.js';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('labs conflict selector updates merged marker choice', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: true });
  await page.goto('/');
  await page.waitForTimeout(300);
  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-labs');

  await expect(page.getByTestId('labs-manual-marker-0')).toBeVisible();
  await page.getByTestId('labs-manual-marker-0').fill('TSH');
  await page.getByTestId('labs-manual-value-0').fill('2.4');
  await page.getByTestId('labs-manual-unit-0').fill('mIU/L');
  await page.getByTestId('labs-manual-reference-0').fill('0.4-4.0');

  const input = page.getByTestId('labs-report-input');
  await input.fill('TSH 4.6 mIU/L 0.4-4.0');
  await page.getByTestId('labs-generate-report').click();

  await expect(page.getByTestId('labs-conflicts-card')).toBeVisible();
  await expect(page.getByTestId('labs-outofrange-count')).toHaveText('0');

  await page.locator('[data-testid^="labs-conflict-option-0-"]').filter({ hasText: '4.6' }).first().click();
  await expect(page.getByTestId('labs-outofrange-count')).toHaveText('1');
});
