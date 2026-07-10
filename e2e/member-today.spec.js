import { test, expect } from '@playwright/test';
import { signInFromPublicHome, completeOnboardingIfVisible } from './helpers/auth.js';

test.describe('member today and check-in', () => {
  test('member reaches Today/check-in surface after session', async ({ page }) => {
    await signInFromPublicHome(page, { onboardingComplete: true });
    await completeOnboardingIfVisible(page);

    const todayCta = page.getByTestId('dashboard-checkin-start').first();
    await expect(todayCta).toBeVisible({ timeout: 20000 });
    await todayCta.click({ force: true });
    const saveBtn = page.getByTestId('checkin-save').first();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click({ force: true });
  });

  test('responsive Today at 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signInFromPublicHome(page, { onboardingComplete: true });
    await completeOnboardingIfVisible(page);
    await expect(page.locator('body')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 4,
    );
    expect(overflow).toBe(false);
  });
});
