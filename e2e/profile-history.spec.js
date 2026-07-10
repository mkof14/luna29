import { expect, test } from '@playwright/test';
import { clickSidebarNav, openMoreMenu } from './helpers/auth.js';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('profile update and medication events appear in history timeline', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: true });
  await page.goto('/');
  await page.waitForTimeout(300);

  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-profile');

  await page.getByTestId('profile-name-input').fill('Mila QA');
  await page.getByTestId('profile-save').click();
  await expect(page.getByTestId('profile-save')).toContainText(/Identity Synced|Sync Profile/u);

  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-meds');
  await page.getByTestId('medications-toggle-add').click();
  await page.getByTestId('medications-name-input').fill('Zinc');
  await page.getByTestId('medications-dose-input').fill('25mg');
  await page.getByTestId('medications-save').click();

  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-history');

  await expect(page.getByTestId('history-timeline')).toBeVisible();
  await expect(page.getByText(/Profile updated\./u)).toBeVisible();
  await expect(page.getByText(/Support updated:\s*Zinc\./u)).toBeVisible();
});
