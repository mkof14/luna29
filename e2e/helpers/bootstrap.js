export async function bootstrapMemberSession(page, { onboardingComplete = true } = {}) {
  await page.addInitScript(({ includeOnboardingEvent }) => {
    const encode = (value) => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
    const session = {
      id: 'e2e-bootstrap-session-id',
      name: 'E2E Admin',
      email: 'dnainform@gmail.com',
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
    window.localStorage.setItem('luna_auth_session_v2', encode(session));
    window.localStorage.setItem('luna_event_log_v3', JSON.stringify(log));
  }, { includeOnboardingEvent: onboardingComplete });
}
