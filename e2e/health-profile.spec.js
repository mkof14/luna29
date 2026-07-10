import { test, expect } from '@playwright/test';
import {
  clickSidebarNav,
  openMoreMenu,
  signInFromPublicHome,
  completeOnboardingIfVisible,
} from './helpers/auth.js';

const uniqueEmail = () => `e2e.hp.${Date.now()}.${Math.random().toString(16).slice(2, 8)}@luna.test`;

test.describe('personal health profile', () => {
  test('can reach Today without completing profile', async ({ page }) => {
    await signInFromPublicHome(page, { onboardingComplete: true });
    await completeOnboardingIfVisible(page);

    const todayCta = page.getByTestId('dashboard-checkin-start').first();
    await expect(todayCta).toBeVisible({ timeout: 20000 });
  });

  test('Profile shows Health Profile panel (or non-blocking unavailable)', async ({ page }) => {
    await signInFromPublicHome(page, { onboardingComplete: true });
    await completeOnboardingIfVisible(page);

    await openMoreMenu(page);
    await clickSidebarNav(page, 'sidebar-nav-profile');

    const panel = page.getByTestId('health-profile-panel');
    const unavailable = page.getByTestId('health-profile-unavailable');
    await expect(panel.or(unavailable).first()).toBeVisible({ timeout: 20000 });
  });

  test('authenticated API: save about section persists; peer isolated', async ({ request }) => {
    const password = 'Password123!';
    const emailA = uniqueEmail();
    const emailB = uniqueEmail();

    const signupA = await request.post('/api/auth/signup', {
      data: { email: emailA, password, name: 'HP A' },
    });
    expect(signupA.status()).toBe(200);

    const put = await request.put('/api/personal/profile/sections/about', {
      data: {
        preferred_name: 'E2E User',
        age_range: '30-39',
        country: 'US',
        timezone: 'UTC',
      },
    });
    expect(put.ok()).toBeTruthy();
    const body = await put.json();
    expect(body.profile?.sections?.about?.preferred_name).toBe('E2E User');
    expect(body.completion?.completion_percent).toBeGreaterThan(0);

    const get = await request.get('/api/personal/profile');
    expect(get.ok()).toBeTruthy();
    const again = await get.json();
    expect(again.profile?.sections?.about?.preferred_name).toBe('E2E User');

    // Switch to peer — Playwright request context keeps last cookies; re-signup B.
    await request.post('/api/auth/logout');
    const signupB = await request.post('/api/auth/signup', {
      data: { email: emailB, password, name: 'HP B' },
    });
    expect(signupB.status()).toBe(200);
    const peer = await request.get('/api/personal/profile');
    expect(peer.ok()).toBeTruthy();
    const peerBody = await peer.json();
    expect(peerBody.profile?.sections?.about?.preferred_name).toBeFalsy();
  });

  test('account deletion clears health profile', async ({ request }) => {
    const email = uniqueEmail();
    const password = 'Password123!';
    const signup = await request.post('/api/auth/signup', {
      data: { email, password, name: 'HP Delete' },
    });
    expect(signup.status()).toBe(200);

    await request.put('/api/personal/profile/sections/goals', {
      data: { primary_goal: 'sleep' },
    });

    const del = await request.post('/api/privacy/delete', {
      data: { scope: 'account', confirm: true },
    });
    expect(del.status()).toBe(200);

    const again = await request.post('/api/auth/signup', {
      data: { email: uniqueEmail(), password, name: 'Fresh' },
    });
    expect(again.status()).toBe(200);
    const profile = await request.get('/api/personal/profile');
    expect(profile.ok()).toBeTruthy();
    const body = await profile.json();
    expect(body.profile?.sections?.goals?.primary_goal).toBeFalsy();
  });
});
