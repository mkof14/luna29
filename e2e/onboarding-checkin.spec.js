import { expect, test } from '@playwright/test';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('onboarding and first check-in flow works', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: false });
  await page.goto('/');
  await page.waitForTimeout(300);

  await expect(page.getByTestId('onboarding-begin')).toBeVisible();
  await page.getByTestId('onboarding-begin').click();

  await page.getByRole('button', { name: /understand my emotions/i }).click();
  await page.getByRole('button', { name: /^next$/i }).click();
  await page.getByRole('button', { name: /^next$/i }).click();
  await page.getByRole('button', { name: /^next$/i }).click();
  await page.getByRole('button', { name: /^skip$/i }).click();
  await page.getByTestId('onboarding-checkin-save').click();
  await page.getByTestId('onboarding-finish').click();

  await expect(page.getByTestId('dashboard-checkin-start')).toBeVisible();
  const checkinSave = page.getByTestId('checkin-save');
  const alreadyOpen = await checkinSave.isVisible().catch(() => false);
  if (!alreadyOpen) {
    await page.getByTestId('dashboard-checkin-start').click({ force: true });
  }

  await checkinSave.waitFor({ state: 'visible', timeout: 20000 });
  await expect(checkinSave).toBeVisible();
  await expect(checkinSave).toBeEnabled();
  await checkinSave.click({ timeout: 6000 });

  await expect
    .poll(
      async () => page.evaluate(() => {
        const raw = window.localStorage.getItem('luna_event_log_v3');
        if (!raw) return [];
        try {
          return JSON.parse(raw).map((event) => event.type);
        } catch {
          return [];
        }
      }),
      { timeout: 12000, intervals: [250, 500, 1000] },
    )
    .toContain('DAILY_CHECKIN');

  const eventTypes = await page.evaluate(() => {
    const raw = window.localStorage.getItem('luna_event_log_v3');
    if (!raw) return [];
    try {
      return JSON.parse(raw).map((event) => event.type);
    } catch {
      return [];
    }
  });

  expect(eventTypes).toContain('ONBOARDING_COMPLETE');
  expect(eventTypes).toContain('DAILY_CHECKIN');
});
