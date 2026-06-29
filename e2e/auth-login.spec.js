import { test, expect } from '@playwright/test';
import { signInFromPublicHome } from './helpers/auth.js';

test('email sign-in for super admin', async ({ page }) => {
  await signInFromPublicHome(page, { onboardingComplete: true });
  await expect(page.getByTestId('sidebar-nav-dashboard')).toBeVisible({ timeout: 15000 });
});
