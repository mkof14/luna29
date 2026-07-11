import { test, expect } from '@playwright/test';
import {
  clickSidebarNav,
  openMoreMenu,
  signInFromPublicHome,
  completeOnboardingIfVisible,
} from './helpers/auth.js';

test.describe('personal health profile medical intake UX', () => {
  test.beforeEach(async ({ page }) => {
    await signInFromPublicHome(page, { onboardingComplete: true });
    await completeOnboardingIfVisible(page);
    await openMoreMenu(page);
    await clickSidebarNav(page, 'sidebar-nav-profile');
    await expect(page.getByTestId('health-profile-panel').or(page.getByTestId('health-profile-unavailable')).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('desktop section navigation and summary', async ({ page }) => {
    const panel = page.getByTestId('health-profile-panel');
    if (await page.getByTestId('health-profile-unavailable').isVisible().catch(() => false)) {
      test.skip();
      return;
    }
    await expect(panel).toBeVisible();
    await expect(page.getByTestId('health-profile-page-hero')).toBeVisible();
    await expect(page.getByTestId('intake-profile-completion')).toBeVisible();
    await expect(page.getByTestId('intake-confidence-value')).toBeVisible();
    await expect(page.getByTestId('intake-continue-profile')).toBeVisible();
    await expect(page.getByTestId('intake-data-usage')).toBeVisible();
    await expect(page.getByTestId('intake-report-readiness')).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.getByTestId('intake-desktop-nav')).toBeVisible();
    await page.getByTestId('intake-nav-medications').click();
    await expect(page.getByTestId('intake-section-medications')).toBeVisible();
    await page.getByTestId('intake-view-summary').click();
    await expect(page.getByTestId('intake-form-summary')).toBeVisible({ timeout: 10000 });
  });

  test('mobile wizard previous next and jump', async ({ page }) => {
    if (await page.getByTestId('health-profile-unavailable').isVisible().catch(() => false)) {
      test.skip();
      return;
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('intake-mobile-wizard')).toBeVisible();
    await expect(page.getByTestId('intake-jump-select')).toBeVisible();
    await page.getByTestId('intake-jump-select').selectOption('medications');
    await expect(page.getByTestId('intake-form-medications')).toBeVisible();
    await page.getByTestId('intake-next').click();
    await expect(page.getByTestId('intake-prev')).toBeEnabled();
  });

  test('auto-save indicator after editing about you', async ({ page }) => {
    if (await page.getByTestId('health-profile-unavailable').isVisible().catch(() => false)) {
      test.skip();
      return;
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByTestId('intake-nav-about_you').click();
    const about = page.getByTestId('intake-form-about_you');
    await expect(about).toBeVisible();
    const firstName = about.locator('input').first();
    await firstName.fill('Ada');
    await firstName.blur();
    await expect(page.getByTestId('intake-save-indicator')).toContainText(/Saving|Profile Updated|Changes save/i, {
      timeout: 10000,
    });
  });

  test('accessibility basics on intake nav', async ({ page }) => {
    if (await page.getByTestId('health-profile-unavailable').isVisible().catch(() => false)) {
      test.skip();
      return;
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    const nav = page.getByTestId('intake-desktop-nav');
    await expect(nav).toHaveAttribute('aria-label', /Personal Health Profile sections/i);
    await page.getByTestId('intake-nav-about_you').focus();
    await expect(page.getByTestId('intake-nav-about_you')).toBeFocused();
  });
});
