import { expect, test } from '@playwright/test';
import { clickSidebarNav, openMoreMenu } from './helpers/auth.js';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('labs draft input persists after reload', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: true });
  await page.goto('/');
  await page.waitForTimeout(300);

  await page.evaluate(() => window.localStorage.removeItem('luna_labs_draft_v1'));

  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-labs');

  const input = page.getByTestId('labs-report-input');
  await expect(input).toBeVisible();

  const draftText = 'TSH 3.1, Ferritin 32, Vitamin D 24';
  await input.fill(draftText);

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
  expect(savedInput).toBe(draftText);
});
