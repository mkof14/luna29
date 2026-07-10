import { expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL || 'e2e.user@luna.test';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'E2eLocalPass123!';

async function seedLocalSession(page, { onboardingComplete = false } = {}) {
  const payload = {
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    includeOnboardingEvent: onboardingComplete,
  };

  await page.addInitScript(({ email, password, includeOnboardingEvent }) => {
    const encode = (value) => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
    const session = {
      id: 'e2e-auth-session-id',
      name: 'E2E Admin',
      email,
      provider: 'password',
      role: 'super_admin',
      permissions: [
        'manage_services',
        'manage_marketing',
        'manage_email_templates',
        'manage_admin_roles',
        'view_financials',
        'view_technical_metrics',
      ],
      lastLoginAt: new Date().toISOString(),
    };
    const users = [
      {
        email,
        password,
        name: 'E2E Admin',
        provider: 'password',
      },
    ];
    const log = includeOnboardingEvent
      ? [
          {
            id: 'onboarding-e2e',
            timestamp: new Date().toISOString(),
            type: 'ONBOARDING_COMPLETE',
            version: 4,
            payload: {},
          },
        ]
      : [];

    window.localStorage.setItem('luna_allow_local_auth_fallback', 'true');
    window.localStorage.setItem('luna_auth_session_v2', encode(session));
    window.localStorage.setItem('luna_auth_users_v2', encode(users));
    window.localStorage.setItem('luna_event_log_v3', JSON.stringify(log));
  }, payload);

  await page.evaluate(({ email, password, includeOnboardingEvent }) => {
    const encode = (value) => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
    const session = {
      id: 'e2e-auth-session-id',
      name: 'E2E Admin',
      email,
      provider: 'password',
      role: 'super_admin',
      permissions: [
        'manage_services',
        'manage_marketing',
        'manage_email_templates',
        'manage_admin_roles',
        'view_financials',
        'view_technical_metrics',
      ],
      lastLoginAt: new Date().toISOString(),
    };
    const users = [
      {
        email,
        password,
        name: 'E2E Admin',
        provider: 'password',
      },
    ];
    const log = includeOnboardingEvent
      ? [
          {
            id: 'onboarding-e2e',
            timestamp: new Date().toISOString(),
            type: 'ONBOARDING_COMPLETE',
            version: 4,
            payload: {},
          },
        ]
      : [];

    window.localStorage.setItem('luna_allow_local_auth_fallback', 'true');
    window.localStorage.setItem('luna_auth_session_v2', encode(session));
    window.localStorage.setItem('luna_auth_users_v2', encode(users));
    window.localStorage.setItem('luna_event_log_v3', JSON.stringify(log));
  }, payload);
}

async function isMemberSurfaceVisible(page) {
  const candidates = [
    page.getByTestId('top-nav-more'),
    page.getByTestId('mobile-nav-menu'),
    page.getByTestId('sidebar-nav-dashboard'),
    page.getByTestId('onboarding-begin'),
    page.getByTestId('dashboard-checkin-start'),
  ];

  for (const locator of candidates) {
    if (await locator.isVisible().catch(() => false)) return true;
  }
  return false;
}

async function loginThroughAuthForm(page) {
  const acceptAllPrivacy = page.getByRole('button', { name: /Accept All|Принять|Aceptar|Tout accepter|Alle akzeptieren|全部|すべて|Aceitar/i }).first();
  if (await acceptAllPrivacy.isVisible().catch(() => false)) {
    await acceptAllPrivacy.click({ force: true });
    await page.waitForTimeout(120);
  }

  const publicSignin = page.getByTestId('public-signin');
  if (await publicSignin.isVisible().catch(() => false)) {
    await publicSignin.click({ force: true });
    await page.waitForTimeout(150);
  }

  const authEmail = page.getByTestId('auth-email');
  const authPassword = page.getByTestId('auth-password');
  const authSubmit = page.getByTestId('auth-submit');
  if (!(await authEmail.isVisible().catch(() => false))) {
    const adminLogin = page.getByRole('button', { name: /Admin Login/i }).first();
    if (await adminLogin.isVisible().catch(() => false)) {
      await adminLogin.click({ force: true });
      await page.waitForTimeout(150);
    }
  }
  if (!(await authEmail.isVisible().catch(() => false))) {
    if (await publicSignin.isVisible().catch(() => false)) {
      await publicSignin.click({ force: true });
      await page.waitForTimeout(200);
    }
  }
  const authVisible = await authEmail.isVisible().catch(() => false);
  if (!authVisible) return false;

  const submitText = ((await authSubmit.textContent().catch(() => '')) || '').toLowerCase();
  if (submitText.includes('create') || submitText.includes('account') || submitText.includes('signup')) {
    const modeToggle = page.getByTestId('auth-mode-toggle');
    if (await modeToggle.isVisible().catch(() => false)) {
      await modeToggle.click({ force: true });
    }
  }

  await authEmail.fill(E2E_EMAIL);
  await authPassword.fill(E2E_PASSWORD);
  await authSubmit.click({ force: true });
  return true;
}

export async function signInFromPublicHome(page, { onboardingComplete = false } = {}) {
  await page.goto('/');
  await seedLocalSession(page, { onboardingComplete });
  await page.reload();
  await page.waitForTimeout(250);

  if (!(await isMemberSurfaceVisible(page))) {
    await loginThroughAuthForm(page);
    await expect
      .poll(() => isMemberSurfaceVisible(page), { timeout: 15000, intervals: [300, 500, 1000] })
      .toBe(true);
  }

  if (onboardingComplete) {
    const onboardingButton = page.getByTestId('onboarding-begin');
    if (await onboardingButton.isVisible().catch(() => false)) {
      await onboardingButton.click({ force: true });
    }
  }
}

async function clickIfVisible(locator) {
  const visible = await locator.isVisible().catch(() => false);
  if (!visible) return false;
  const clicked = await locator
    .first()
    .click({ force: true, timeout: 1000 })
    .then(() => true)
    .catch(() => false);
  return clicked;
}

export async function completeOnboardingIfVisible(page) {
  const onboardingButton = page.getByTestId('onboarding-begin');
  if (await onboardingButton.isVisible().catch(() => false)) {
    await onboardingButton.click({ force: true, timeout: 1500 });
  }

  const checkinClose = page.getByTestId('checkin-close');
  const checkinSave = page.getByTestId('checkin-save');

  let noOverlayStreak = 0;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await clickIfVisible(checkinClose)) {
      noOverlayStreak = 0;
      await page.waitForTimeout(150);
      continue;
    }
    if (await clickIfVisible(checkinSave)) {
      noOverlayStreak = 0;
      await page.waitForTimeout(150);
      continue;
    }
    noOverlayStreak += 1;
    if (noOverlayStreak >= 3) break;
    await page.waitForTimeout(250);
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const closed = await clickIfVisible(checkinClose);
    const saved = await clickIfVisible(checkinSave);
    if (!closed && !saved) break;
    await page.waitForTimeout(120);
  }
}

export async function clickSidebarNav(page, testId) {
  // Desktop sidebar + mobile drawer both render the same test ids.
  await page.getByTestId(testId).first().click({ force: true });
}

export async function openMoreMenu(page) {
  const topNavMore = page.getByTestId('top-nav-more');
  const mobileMenu = page.getByTestId('mobile-nav-menu');
  const sidebarDashboard = page.getByTestId('sidebar-nav-dashboard').first();

  if (await topNavMore.isVisible().catch(() => false)) {
    await topNavMore.click();
    return;
  }
  if (await mobileMenu.isVisible().catch(() => false)) {
    await mobileMenu.click();
    return;
  }
  if (await sidebarDashboard.isVisible().catch(() => false)) {
    return;
  }

  await expect(topNavMore).toBeVisible({ timeout: 10000 });
  await topNavMore.click();
}
