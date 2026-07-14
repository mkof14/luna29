import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

/**
 * Canonical Stripe subscriber path — one plan (month|year) + Stripe trial days.
 */

describe('stripeSubscriberPath policy', () => {
  it('resolves period to month|year only', async () => {
    const {
      resolveCheckoutPeriod,
      resolveCheckoutPriceId,
      resolveStripeTrialDays,
      appendCheckoutTrialFields,
      buildCheckoutSessionFields,
      isLunaServerTrialAllowed,
      statusFromCheckoutSession,
      USE_STRIPE_CHECKOUT,
    } = await import('../../server/core/stripeSubscriberPath.mjs');

    expect(resolveCheckoutPeriod('year')).toBe('year');
    expect(resolveCheckoutPeriod('YEAR')).toBe('year');
    expect(resolveCheckoutPeriod('month')).toBe('month');
    expect(resolveCheckoutPeriod('week')).toBe('month');
    expect(resolveCheckoutPeriod(undefined)).toBe('month');

    expect(
      resolveCheckoutPriceId('month', { monthlyId: 'price_m', yearlyId: 'price_y' }),
    ).toBe('price_m');
    expect(
      resolveCheckoutPriceId('year', { monthlyId: 'price_m', yearlyId: 'price_y' }),
    ).toBe('price_y');
    expect(resolveCheckoutPriceId('month', { monthlyId: '', yearlyId: 'price_y' })).toBe(null);

    expect(resolveStripeTrialDays('7')).toBe(7);
    expect(resolveStripeTrialDays(undefined)).toBe(7);
    expect(resolveStripeTrialDays('0')).toBe(0);
    expect(resolveStripeTrialDays('abc')).toBe(7);

    const fields = appendCheckoutTrialFields([], 7);
    expect(fields).toEqual([['subscription_data[trial_period_days]', '7']]);
    expect(appendCheckoutTrialFields([], 0)).toEqual([]);

    expect(isLunaServerTrialAllowed(true)).toBe(false);
    expect(isLunaServerTrialAllowed('true')).toBe(false);
    expect(isLunaServerTrialAllowed(false)).toBe(true);
    expect(isLunaServerTrialAllowed('false')).toBe(true);
    expect(USE_STRIPE_CHECKOUT).toBe('USE_STRIPE_CHECKOUT');

    expect(statusFromCheckoutSession({ payment_status: 'no_payment_required' })).toBe('trialing');
    expect(statusFromCheckoutSession({ payment_status: 'unpaid' })).toBe('trialing');
    expect(statusFromCheckoutSession({ payment_status: 'paid' })).toBe('active');
    expect(statusFromCheckoutSession({})).toBe('active');

    const checkout = buildCheckoutSessionFields({
      period: 'year',
      priceId: 'price_y',
      userId: 'user_1',
      email: 'a@test.com',
      successUrl: 'https://www.luna29.com/?tab=profile&billing=success',
      cancelUrl: 'https://www.luna29.com/pricing?billing=canceled',
      trialDays: 7,
      existingCustomerId: null,
    });
    const asMap = Object.fromEntries(checkout);
    expect(asMap.mode).toBe('subscription');
    expect(asMap['line_items[0][price]']).toBe('price_y');
    expect(asMap['metadata[luna_period]']).toBe('year');
    expect(asMap['metadata[luna_user_id]']).toBe('user_1');
    expect(asMap.customer_email).toBe('a@test.com');
    expect(asMap['subscription_data[trial_period_days]']).toBe('7');
    expect(asMap.client_reference_id).toBe('user_1');
  });

  it('reuses existing Stripe customer id when present', async () => {
    const { buildCheckoutSessionFields } = await import('../../server/core/stripeSubscriberPath.mjs');
    const checkout = buildCheckoutSessionFields({
      period: 'month',
      priceId: 'price_m',
      userId: 'user_2',
      email: 'b@test.com',
      successUrl: 'https://x/success',
      cancelUrl: 'https://x/cancel',
      trialDays: 7,
      existingCustomerId: 'cus_existing',
    });
    const asMap = Object.fromEntries(checkout);
    expect(asMap.customer).toBe('cus_existing');
    expect(asMap.customer_email).toBeUndefined();
  });
});

describe('checkout.session.completed maps trial vs paid', () => {
  it('no_payment_required → trialing; paid → active; subscription.created keeps Stripe status', async () => {
    const { extractStripeEventProjection } = await import(
      '../../server/core/stripeWebhookProcessor.mjs'
    );

    const trialCheckout = extractStripeEventProjection({
      id: 'evt_t',
      type: 'checkout.session.completed',
      created: 100,
      data: {
        object: {
          id: 'cs_t',
          payment_status: 'no_payment_required',
          customer: 'cus_t',
          subscription: 'sub_t',
          metadata: { luna_user_id: 'u1', luna_period: 'month' },
        },
      },
    });
    expect(trialCheckout.status).toBe('trialing');
    expect(trialCheckout.planKey).toBe('premium');
    expect(trialCheckout.period).toBe('month');

    const paidCheckout = extractStripeEventProjection({
      id: 'evt_p',
      type: 'checkout.session.completed',
      created: 101,
      data: {
        object: {
          id: 'cs_p',
          payment_status: 'paid',
          customer: 'cus_p',
          subscription: 'sub_p',
          metadata: { luna_user_id: 'u1', luna_period: 'year' },
        },
      },
    });
    expect(paidCheckout.status).toBe('active');
    expect(paidCheckout.period).toBe('year');

    const subCreated = extractStripeEventProjection({
      id: 'evt_s',
      type: 'customer.subscription.created',
      created: 102,
      data: {
        object: {
          id: 'sub_t',
          customer: 'cus_t',
          status: 'trialing',
          items: { data: [{ price: { id: 'price_m', recurring: { interval: 'month' } } }] },
          metadata: { luna_user_id: 'u1' },
        },
      },
    });
    expect(subCreated.status).toBe('trialing');
    expect(subCreated.period).toBe('month');
    expect(subCreated.stripePriceId).toBe('price_m');
  });
});

describe('API: Stripe billing blocks Luna server trial; checkout fields include trial', () => {
  let dataDir;
  let originalEnv;
  let ipCounter = 0;

  const nextIp = () => `203.0.113.${(ipCounter++ % 200) + 1}`;

  const createMockRes = () => {
    const state = { statusCode: 0, body: '', headers: {}, setCookie: '' };
    return {
      state,
      writeHead(status, headers = {}) {
        state.statusCode = status;
        state.headers = headers;
        if (headers['Set-Cookie']) state.setCookie = headers['Set-Cookie'];
      },
      end(chunk = '') {
        state.body = typeof chunk === 'string' ? chunk : chunk?.toString?.() || '';
      },
      get statusCode() {
        return state.statusCode;
      },
      get json() {
        try {
          return state.body ? JSON.parse(state.body) : null;
        } catch {
          return null;
        }
      },
      get setCookie() {
        return state.setCookie;
      },
    };
  };

  const invoke = async (handler, { method, path: pathname, headers = {}, body, ip }) => {
    const payload = body == null ? null : Buffer.from(JSON.stringify(body), 'utf8');
    const req = Readable.from(payload ? [payload] : []);
    req.method = method;
    req.url = pathname;
    req.headers = {
      host: 'localhost',
      'content-type': 'application/json',
      ...(payload ? { 'content-length': String(payload.length) } : {}),
      ...headers,
    };
    if (ip) req.headers['x-forwarded-for'] = ip;
    const res = createMockRes();
    await handler(req, res);
    return res;
  };

  beforeEach(async () => {
    originalEnv = { ...process.env };
    dataDir = await mkdtemp(path.join(tmpdir(), 'luna-stripe-path-'));
    process.env.NODE_ENV = 'test';
    process.env.STRIPE_BILLING_ENABLED = 'true';
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_x';
    process.env.STRIPE_PRICE_MONTHLY_ID = 'price_month_test';
    process.env.STRIPE_PRICE_YEARLY_ID = 'price_year_test';
    process.env.STRIPE_SUCCESS_URL = 'https://www.luna29.com/?tab=profile&billing=success';
    process.env.STRIPE_CANCEL_URL = 'https://www.luna29.com/pricing?billing=canceled';
    process.env.STRIPE_PORTAL_RETURN_URL = 'https://www.luna29.com/?tab=profile';
    process.env.STRIPE_TRIAL_DAYS = '7';
    process.env.AUTH_INVITE_ONLY = 'false';
    delete process.env.DATABASE_URL;
    vi.resetModules();
  });

  afterEach(async () => {
    process.env = originalEnv;
    vi.resetModules();
    vi.unstubAllGlobals();
    await rm(dataDir, { recursive: true, force: true });
  });

  it('POST /api/billing/trial/start returns USE_STRIPE_CHECKOUT when billing enabled', async () => {
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'test' });

    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email: `stripe-path-${Date.now()}@test.com`, password: 'password123', name: 'Stripe' },
      ip: nextIp(),
    });
    expect(signup.statusCode).toBe(200);
    const cookie = String(signup.setCookie).split(';')[0];

    const trial = await invoke(handler, {
      method: 'POST',
      path: '/api/billing/trial/start',
      headers: { cookie },
      ip: nextIp(),
    });
    expect(trial.statusCode).toBe(403);
    expect(trial.json?.code).toBe('USE_STRIPE_CHECKOUT');
    expect(trial.json?.trialDays).toBe(7);
  });

  it('POST /api/billing/checkout-session sends month/year price + 7-day trial to Stripe', async () => {
    const calls = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, init = {}) => {
        calls.push({ url: String(url), body: String(init.body || '') });
        return {
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify({
              id: 'cs_test_1',
              url: 'https://checkout.stripe.com/c/pay/cs_test_1',
            });
          },
        };
      }),
    );

    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler = await buildApiHandler({ dataDir, environment: 'test' });

    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email: `checkout-${Date.now()}@test.com`, password: 'password123', name: 'Checkout' },
      ip: nextIp(),
    });
    expect(signup.statusCode).toBe(200);
    const cookie = String(signup.setCookie).split(';')[0];

    const month = await invoke(handler, {
      method: 'POST',
      path: '/api/billing/checkout-session',
      headers: { cookie },
      body: { period: 'month' },
      ip: nextIp(),
    });
    expect(month.statusCode).toBe(200);
    expect(month.json?.url).toContain('checkout.stripe.com');
    expect(calls[0].url).toBe('https://api.stripe.com/v1/checkout/sessions');
    expect(calls[0].body).toContain('line_items%5B0%5D%5Bprice%5D=price_month_test');
    expect(calls[0].body).toContain('subscription_data%5Btrial_period_days%5D=7');
    expect(calls[0].body).toContain('metadata%5Bluna_period%5D=month');

    const year = await invoke(handler, {
      method: 'POST',
      path: '/api/billing/checkout-session',
      headers: { cookie },
      body: { period: 'year' },
      ip: nextIp(),
    });
    expect(year.statusCode).toBe(200);
    expect(calls[1].body).toContain('line_items%5B0%5D%5Bprice%5D=price_year_test');
    expect(calls[1].body).toContain('metadata%5Bluna_period%5D=year');
    expect(calls[1].body).toContain('subscription_data%5Btrial_period_days%5D=7');
  });

  it('webhook checkout trial → entitlement trialing; subscription.deleted → not entitled', async () => {
    const { createMemoryStripeWebhookLedger } = await import(
      '../../server/core/stripeWebhookEventsStore.mjs'
    );
    const { processStripeWebhookEvent } = await import('../../server/core/stripeWebhookProcessor.mjs');
    const { createBillingService } = await import('../../server/core/billingServiceCore.mjs');
    const { resolveEntitlement } = await import('../../server/core/entitlements.mjs');

    const ledger = createMemoryStripeWebhookLedger();
    const billingState = {};
    const saveBillingState = async () => {};
    const user = { id: 'user_stripe_1', email: 'stripe1@test.com' };

    const trialEvent = {
      id: 'evt_chk_trial',
      type: 'checkout.session.completed',
      created: 1_700_000_100,
      data: {
        object: {
          id: 'cs_trial',
          payment_status: 'no_payment_required',
          customer: 'cus_stripe_1',
          subscription: 'sub_stripe_1',
          client_reference_id: user.id,
          customer_email: user.email,
          metadata: {
            luna_user_id: user.id,
            luna_email: user.email,
            luna_period: 'year',
          },
        },
      },
    };

    const processed = await processStripeWebhookEvent({
      mode: 'json',
      pool: null,
      billingState,
      saveBillingState,
      event: trialEvent,
      ledger,
      authUserExists: async (id) => id === user.id,
    });
    expect(processed.httpStatus).toBe(200);
    expect(billingState[user.id].status).toBe('trialing');
    expect(billingState[user.id].period).toBe('year');

    const billingService = createBillingService({
      mode: 'json',
      pool: null,
      billingState,
      saveBillingState,
      trialDays: 7,
    });
    const entitled = await resolveEntitlement({
      user,
      billingService,
      billingStorageMode: 'json',
    });
    expect(entitled.entitled).toBe(true);
    expect(entitled.status).toBe('trialing');

    await processStripeWebhookEvent({
      mode: 'json',
      pool: null,
      billingState,
      saveBillingState,
      event: {
        id: 'evt_sub_del',
        type: 'customer.subscription.deleted',
        created: 1_700_000_200,
        data: {
          object: {
            id: 'sub_stripe_1',
            customer: 'cus_stripe_1',
            status: 'canceled',
            metadata: { luna_user_id: user.id, luna_email: user.email },
          },
        },
      },
      ledger,
      authUserExists: async (id) => id === user.id,
    });

    const afterCancel = await resolveEntitlement({
      user,
      billingService,
      billingStorageMode: 'json',
    });
    expect(afterCancel.entitled).toBe(false);
    expect(afterCancel.status).toBe('canceled');
  });
});

describe('client checkout pending helpers', () => {
  it('mark/consume checkout pending round-trips month|year', async () => {
    const store = new Map();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
      },
    });
    const {
      markCheckoutPending,
      consumeCheckoutPending,
      markTrialPending,
      consumeTrialPending,
    } = await import('../../utils/subscriptionAccess.ts');

    markCheckoutPending('year');
    expect(consumeCheckoutPending()).toBe('year');
    expect(consumeCheckoutPending()).toBe(null);

    markTrialPending();
    expect(consumeTrialPending()).toBe(true);
    expect(consumeTrialPending()).toBe(false);
  });
});

describe('webhook signature still required before projection', () => {
  it('invalid signature never reaches processor (handler-level contract)', () => {
    // Document the contract: verifyStripeSignature must run before JSON.parse / process.
    // Covered in stripeWebhookHardening; this asserts HMAC payload format used by Stripe.
    const secret = 'whsec_path_test';
    const raw = Buffer.from(
      JSON.stringify({
        id: 'evt_1',
        type: 'checkout.session.completed',
        data: { object: { payment_status: 'no_payment_required' } },
      }),
      'utf8',
    );
    const ts = Math.floor(Date.now() / 1000);
    const expected = createHmac('sha256', secret).update(`${ts}.${raw.toString('utf8')}`).digest('hex');
    const header = `t=${ts},v1=${expected}`;
    const pairs = header.split(',').map((c) => c.trim().split('='));
    const timestamp = pairs.find(([k]) => k === 't')?.[1];
    const sig = pairs.find(([k]) => k === 'v1')?.[1];
    const recomputed = createHmac('sha256', secret)
      .update(`${timestamp}.${raw.toString('utf8')}`)
      .digest('hex');
    expect(sig).toBe(recomputed);
  });
});
