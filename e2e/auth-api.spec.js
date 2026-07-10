import { test, expect } from '@playwright/test';

const uniqueEmail = () => `e2e.${Date.now()}.${Math.random().toString(16).slice(2, 8)}@luna.test`;

test.describe('authentication API + UI', () => {
  test('email signup, session, logout, wrong password', async ({ request }) => {
    const email = uniqueEmail();
    const password = 'Password123!';

    const signup = await request.post('/api/auth/signup', {
      data: { email, password, name: 'E2E User' },
    });
    expect(signup.status()).toBe(200);
    const signupBody = await signup.json();
    expect(signupBody.session?.email).toBe(email);
    const setCookie = signup.headers()['set-cookie'] || '';
    expect(setCookie.toLowerCase()).toContain('luna_sid');

    const session = await request.get('/api/auth/session');
    expect(session.ok()).toBeTruthy();

    const bad = await request.post('/api/auth/signin', {
      data: { email, password: 'WrongPassword999!' },
    });
    expect(bad.status()).toBe(401);

    const dup = await request.post('/api/auth/signup', {
      data: { email, password, name: 'E2E User' },
    });
    expect([400, 409, 401]).toContain(dup.status());

    const weak = await request.post('/api/auth/signup', {
      data: { email: uniqueEmail(), password: 'short', name: 'Weak' },
    });
    expect(weak.status()).toBeGreaterThanOrEqual(400);

    const logout = await request.post('/api/auth/logout');
    expect(logout.ok()).toBeTruthy();

    const after = await request.get('/api/auth/session');
    const afterBody = await after.json();
    expect(afterBody.session == null || afterBody.authenticated === false).toBeTruthy();
  });

  test('Bearer invalid rejected; mobile signup returns token', async ({ request }) => {
    const bad = await request.get('/api/mobile/auth/session', {
      headers: { Authorization: 'Bearer totally-invalid-token' },
    });
    const body = await bad.json();
    expect(body.session == null || body.authenticated === false || bad.status() === 401).toBeTruthy();

    const email = uniqueEmail();
    const signup = await request.post('/api/mobile/auth/signup', {
      data: { email, password: 'Password123!', name: 'Mobile E2E' },
    });
    expect(signup.status()).toBe(200);
    const json = await signup.json();
    expect(json.token).toBeTruthy();
    const ok = await request.get('/api/mobile/auth/session', {
      headers: { Authorization: `Bearer ${json.token}` },
    });
    expect(ok.ok()).toBeTruthy();
  });

  test('CORS preflight advertises PUT when Origin allowed', async ({ request }) => {
    const options = await request.fetch('/api/calendar/data', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://127.0.0.1:3020',
        'Access-Control-Request-Method': 'PUT',
      },
    });
    expect(options.status()).toBeLessThan(500);
    const allow = options.headers()['access-control-allow-methods'] || '';
    if (allow) expect(allow.toUpperCase()).toContain('PUT');
  });
});
