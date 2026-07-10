import { expect, test } from '@playwright/test';
import { clickSidebarNav, openMoreMenu } from './helpers/auth.js';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('relationships note generation and medications CRUD flow work in local mode', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: true });
  await page.goto('/');
  await page.waitForTimeout(300);

  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-relationships');

  await expect(page.getByTestId('relationships-step-intro')).toBeVisible();
  await page.getByTestId('relationships-partner-input').fill('Alex');
  await page.getByTestId('relationships-begin').click();

  await page.locator('[data-testid^="relationships-intent-"]').first().click();
  await page.locator('[data-testid^="relationships-tone-"]').first().click();
  await page.locator('[data-testid^="relationships-boundary-"]').first().click();

  await expect(page.getByTestId('relationships-result-message')).toBeVisible();
  await expect(page.getByTestId('relationships-result-message')).toContainText(/Alex|I am|My internal bandwidth|Привет|Сегодня/u);

  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-meds');
  const cards = page.locator('[data-testid^="medications-card-"]');
  const initialCount = await cards.count();

  await page.getByTestId('medications-toggle-add').click();
  await expect(page.getByTestId('medications-form')).toBeVisible();

  await page.getByTestId('medications-name-input').fill('Magnesium');
  await page.getByTestId('medications-dose-input').fill('200mg');
  await page.getByTestId('medications-save').click();

  await expect(page.getByTestId('medications-status')).toContainText(/Support profile added|Добав/u);
  await expect(cards).toHaveCount(initialCount + 1);
  await expect(page.getByText('Magnesium')).toBeVisible();

  const removeButton = page.locator('[data-testid^="medications-remove-"]').first();
  await expect(removeButton).toBeVisible();
  await removeButton.click({ force: true });
  await expect(page.getByTestId('medications-status')).toBeVisible();
});
