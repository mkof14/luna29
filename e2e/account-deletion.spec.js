import { test, expect } from '@playwright/test';

const uniqueEmail = () => `e2e.del.${Date.now()}.${Math.random().toString(16).slice(2, 8)}@luna.test`;

test.describe('account deletion (disposable local JSON only)', () => {
  test('delete account invalidates session and blocks login', async ({ request }) => {
    const email = uniqueEmail();
    const password = 'Password123!';

    const signup = await request.post('/api/auth/signup', {
      data: { email, password, name: 'Delete Me' },
    });
    expect(signup.status()).toBe(200);

    // Seed a little calendar data (cookie session from signup).
    await request.put('/api/calendar/data', {
      data: { events: [{ id: 'e2e-1', title: 'synthetic', date: '2026-07-10' }] },
    });

    const del = await request.post('/api/privacy/delete', {
      data: { scope: 'account', confirm: true },
    });
    expect(del.status()).toBe(200);
    const delBody = await del.json();
    expect(delBody.deleted === true || delBody.status === 'completed' || delBody.ok === true).toBeTruthy();

    const session = await request.get('/api/auth/session');
    const sessionBody = await session.json();
    expect(sessionBody.session == null || sessionBody.authenticated === false).toBeTruthy();

    const login = await request.post('/api/auth/signin', {
      data: { email, password },
    });
    expect([401, 403, 404]).toContain(login.status());
  });

  test('other user retained after peer deletion', async ({ request }) => {
    const aEmail = uniqueEmail();
    const bEmail = uniqueEmail();
    const password = 'Password123!';

    const a = await request.post('/api/mobile/auth/signup', {
      data: { email: aEmail, password, name: 'A' },
    });
    const b = await request.post('/api/mobile/auth/signup', {
      data: { email: bEmail, password, name: 'B' },
    });
    expect(a.status()).toBe(200);
    expect(b.status()).toBe(200);
    const aToken = (await a.json()).token;
    const bToken = (await b.json()).token;

    const del = await request.post('/api/privacy/delete', {
      headers: { Authorization: `Bearer ${aToken}` },
      data: { scope: 'account', confirm: true },
    });
    expect(del.status()).toBe(200);

    const bSession = await request.get('/api/mobile/auth/session', {
      headers: { Authorization: `Bearer ${bToken}` },
    });
    expect(bSession.ok()).toBeTruthy();
  });
});
