import { test, expect } from '@playwright/test';

const uniqueEmail = () => `e2e.sec.${Date.now()}.${Math.random().toString(16).slice(2, 8)}@luna.test`;

async function signupBearer(request, email) {
  const res = await request.post('/api/mobile/auth/signup', {
    data: { email, password: 'Password123!', name: 'Sec User' },
  });
  expect(res.status()).toBe(200);
  const json = await res.json();
  return { token: json.token, userId: json.session?.id || json.user?.id };
}

test.describe('security ownership and premium gates', () => {
  test('IDOR: user B cannot read user A personal events', async ({ request }) => {
    const a = await signupBearer(request, uniqueEmail());
    const b = await signupBearer(request, uniqueEmail());

    const create = await request.post('/api/personal/events', {
      headers: { Authorization: `Bearer ${a.token}` },
      data: {
        events: [
          {
            client_event_id: `evt-${Date.now()}`,
            kind: 'observation',
            occurred_at: new Date().toISOString(),
            payload: { raw_text: 'synthetic observation for e2e only' },
          },
        ],
      },
    });
    // May be 200 or 403 depending on entitlement/storage; never 500.
    expect(create.status()).toBeLessThan(500);

    const listB = await request.get('/api/personal/events', {
      headers: { Authorization: `Bearer ${b.token}` },
    });
    expect(listB.status()).toBeLessThan(500);
    if (listB.ok()) {
      const body = await listB.json();
      const events = body.events || body.items || [];
      const leaked = JSON.stringify(events).includes('synthetic observation for e2e only');
      expect(leaked).toBe(false);
    }
  });

  test('premium timeline observation detail denied for free user', async ({ request }) => {
    const user = await signupBearer(request, uniqueEmail());
    const res = await request.get('/api/personal/timeline/observations/obs-e2e-missing', {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('PREMIUM_REQUIRED');
  });

  test('user_id spoof on privacy delete is ignored', async ({ request }) => {
    const a = await signupBearer(request, uniqueEmail());
    const b = await signupBearer(request, uniqueEmail());
    const res = await request.post('/api/privacy/delete', {
      headers: { Authorization: `Bearer ${a.token}` },
      data: {
        scope: 'support_only',
        confirm: true,
        userId: b.userId,
        email: 'victim@luna.test',
      },
    });
    // Either completes for A only, or validation error — never deletes B silently as success for wrong owner.
    expect([200, 400, 403, 422]).toContain(res.status());
    if (res.ok()) {
      const body = await res.json();
      expect(body.deleted === true || body.ok === true || body.status === 'completed').toBeTruthy();
    }
    // B can still authenticate
    const stillB = await request.get('/api/mobile/auth/session', {
      headers: { Authorization: `Bearer ${b.token}` },
    });
    expect(stillB.ok()).toBeTruthy();
  });

  test('admin routes denied for normal user', async ({ request }) => {
    const user = await signupBearer(request, uniqueEmail());
    // Admin is cookie-session based; Bearer should not grant admin.
    const res = await request.get('/api/admin/ops', {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('billing remains disabled — checkout misconfigured or disabled', async ({ request }) => {
    const email = uniqueEmail();
    const signup = await request.post('/api/auth/signup', {
      data: { email, password: 'Password123!', name: 'Bill Free' },
    });
    expect(signup.status()).toBe(200);
    const checkout = await request.post('/api/billing/checkout-session', {
      data: { period: 'month' },
    });
    // Disabled/misconfigured must not create a live Stripe session.
    expect([401, 403, 503, 502, 400]).toContain(checkout.status());
    const body = await checkout.json().catch(() => ({}));
    expect(JSON.stringify(body)).not.toMatch(/sk_live_|sk_test_/);
  });

  test('XSS payload in contact form does not reflect raw script', async ({ request }) => {
    const res = await request.post('/api/public/contact', {
      data: {
        name: '<script>alert(1)</script>',
        email: uniqueEmail(),
        message: 'hello <img src=x onerror=alert(1)> synthetic e2e',
      },
    });
    expect([200, 400, 429, 503]).toContain(res.status());
    if (res.ok()) {
      const text = await res.text();
      expect(text).not.toContain('<script>alert(1)</script>');
    }
  });
});
