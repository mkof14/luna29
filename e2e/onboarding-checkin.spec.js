import { expect, test } from '@playwright/test';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('optional one-page onboarding can skip or save answers', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: false });
  await page.goto('/');
  await page.waitForTimeout(300);

  await expect(page.getByTestId('onboarding-optional-page')).toBeVisible();
  await expect(page.getByTestId('onboarding-skip')).toBeVisible();

  await page.getByRole('button', { name: /understand my emotions/i }).click();
  await page.getByPlaceholder(/write a few words/i).fill('Feeling steady today.');
  await page.getByTestId('onboarding-finish').click();

  await expect(page.getByTestId('dashboard-checkin-start')).toBeVisible({ timeout: 15000 });

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
  expect(eventTypes).toContain('AUDIO_REFLECTION');
});

test('optional onboarding skip goes to Today without forced answers', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: false });
  await page.goto('/');
  await page.waitForTimeout(300);

  await expect(page.getByTestId('onboarding-optional-page')).toBeVisible();
  await page.getByTestId('onboarding-skip').click();
  await expect(page.getByTestId('dashboard-checkin-start')).toBeVisible({ timeout: 15000 });

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
});
