import { expect, test } from '@playwright/test';
import { clickSidebarNav, openMoreMenu } from './helpers/auth.js';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('labs analysis renders local-mode result', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: true });
  await page.goto('/');
  await page.waitForTimeout(300);
  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-labs');

  const input = page.getByTestId('labs-report-input');
  await expect(input).toBeVisible();
  await input.fill('TSH 2.4, Ferritin 45, Vitamin D 28');

  await page.getByTestId('labs-generate-report').click();
  await expect(page.getByText(/local mode without ai/i).first()).toBeVisible();
});
