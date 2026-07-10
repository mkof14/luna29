import { test, expect } from '@playwright/test';
import { signInFromPublicHome , clickSidebarNav} from './helpers/auth.js';

test('email sign-in for super admin', async ({ page }) => {
  await signInFromPublicHome(page, { onboardingComplete: true });
  await expect(page.getByTestId('sidebar-nav-dashboard').first()).toBeVisible({ timeout: 15000 });
});
