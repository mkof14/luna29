import { expect, test } from '@playwright/test';
import { clickSidebarNav, openMoreMenu } from './helpers/auth.js';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('labs clear draft removes saved input', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: true });
  await page.goto('/');
  await page.waitForTimeout(300);

  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-labs');

  const input = page.getByTestId('labs-report-input');
  await expect(input).toBeVisible();
  await input.fill('TSH 4.2, Ferritin 20');

  await page.getByTestId('labs-clear-draft').click();
  await expect(page.getByTestId('labs-report-input')).toHaveValue('');

  await page.reload();
  const savedInput = await page.evaluate(() => {
    const raw = window.localStorage.getItem('luna_labs_draft_v1');
    if (!raw) return '';
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed?.input === 'string' ? parsed.input : '';
    } catch {
      return '';
    }
  });
  expect(savedInput).toBe('');
});
