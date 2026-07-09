import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

/**
 * WS1.3 — Billing/trial durable storage tests.
 */

const createMockRes = () => {
  const res = {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(status, headers = {}) {
      this.statusCode = status;
      this.headers = headers;
    },
    end(chunk = '') {
      this.body = typeof chunk === 'string' ? chunk : chunk?.toString?.() || '';
    },
  };
  return res;
};

const invoke = async (handler, { method, path: pathname, headers = {}, body, ip = '203.0.113.80' }) => {
  const payload = body === undefined ? null : Buffer.from(JSON.stringify(body), 'utf8');
  const req = payload ? Readable.from([payload]) : Readable.from([]);
  req.method = method;
  req.url = pathname;
  req.headers = {
    host: 'localhost',
    ...(payload ? { 'content-type': 'application/json', 'content-length': String(payload.length) } : {}),
    ...headers,
  };
  req.socket = { remoteAddress: ip };

  const res = createMockRes();
  await handler(req, res);
  let json = null;
  try {
    json = res.body ? JSON.parse(res.body) : null;
  } catch {
    json = null;
  }
  const setCookie = res.headers['Set-Cookie'] || res.headers['set-cookie'] || '';
  return { statusCode: res.statusCode, headers: res.headers, json, body: res.body, setCookie };
};

describe('billing storage mode (WS1.3)', () => {
  it('prod + DB => postgres', async () => {
    const { resolveBillingStorageMode } = await import('../../server/core/billingStorage.mjs');
    expect(
      resolveBillingStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'production', DATABASE_URL: 'postgresql://x/y' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('postgres');
  });

  it('preview + DB => postgres', async () => {
    const { resolveBillingStorageMode } = await import('../../server/core/billingStorage.mjs');
    expect(
      resolveBillingStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'preview', DATABASE_URL: 'postgresql://x/y' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('postgres');
  });

  it('prod no DB => unavailable', async () => {
    const { resolveBillingStorageMode } = await import('../../server/core/billingStorage.mjs');
    expect(
      resolveBillingStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('unavailable');
  });

  it('preview no DB => unavailable', async () => {
    const { resolveBillingStorageMode } = await import('../../server/core/billingStorage.mjs');
    expect(
      resolveBillingStorageMode({
        env: { NODE_ENV: 'production', VERCEL_ENV: 'preview' },
        runtimeEnvironment: 'vercel',
      }),
    ).toBe('unavailable');
  });

  it('test => isolated json mode', async () => {
    const { resolveBillingStorageMode } = await import('../../server/core/billingStorage.mjs');
    expect(
      resolveBillingStorageMode({
        env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://x/y' },
        runtimeEnvironment: 'test',
      }),
    ).toBe('json');
  });

  it('dev no DB => JSON allowed', async () => {
    const { resolveBillingStorageMode } = await import('../../server/core/billingStorage.mjs');
    expect(
      resolveBillingStorageMode({
        env: { NODE_ENV: 'development' },
        runtimeEnvironment: 'node',
      }),
    ).toBe('json');
  });

  it('health labels map correctly', async () => {
    const { billingStorageHealthLabel } = await import('../../server/core/billingStorage.mjs');
    expect(billingStorageHealthLabel('postgres')).toBe('postgres');
    expect(billingStorageHealthLabel('json')).toBe('json_dev');
    expect(billingStorageHealthLabel('unavailable')).toBe('unavailable');
  });
});

/** In-memory SQL-ish mock covering billing tables. */
const createBillingMockPool = () => {
  const accounts = new Map();
  const subscriptions = new Map();
  const trials = new Map();

  const pool = {
    accounts,
    subscriptions,
    trials,
    async query(sql, params = []) {
      const q = String(sql);
      if (q.includes('CREATE TABLE') || q.includes('CREATE UNIQUE INDEX') || q.includes('CREATE INDEX')) {
        return { rows: [] };
      }

      // accounts
      if (q.includes('FROM billing_accounts') && q.includes('WHERE user_id')) {
        const row = accounts.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM billing_accounts') && q.includes('stripe_customer_id')) {
        const row = [...accounts.values()].find((r) => r.stripe_customer_id === params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM billing_accounts') && q.includes('LOWER(email)')) {
        const row = [...accounts.values()].find((r) => r.email === params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('COUNT(*)') && q.includes('billing_accounts')) {
        return { rows: [{ n: accounts.size }] };
      }
      if (q.includes('INSERT INTO billing_accounts')) {
        const [userId, email, stripeCustomerId] = params;
        const existing = accounts.get(userId);
        if (q.includes('stripe_customer_id = COALESCE') || params.length >= 3) {
          const next = {
            user_id: userId,
            email,
            stripe_customer_id:
              stripeCustomerId ?? existing?.stripe_customer_id ?? null,
            created_at: existing?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          if (existing && stripeCustomerId == null && q.includes('VALUES ($1, $2, NULL')) {
            next.stripe_customer_id = existing.stripe_customer_id;
          }
          if (existing && q.includes('COALESCE(EXCLUDED.stripe_customer_id')) {
            next.stripe_customer_id = stripeCustomerId || existing.stripe_customer_id;
          }
          accounts.set(userId, next);
        } else {
          accounts.set(userId, {
            user_id: userId,
            email,
            stripe_customer_id: existing?.stripe_customer_id ?? null,
            created_at: existing?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        return { rows: [] };
      }
      if (q.includes('DELETE FROM billing_accounts')) {
        accounts.delete(params[0]);
        return { rows: [] };
      }

      // subscriptions
      if (q.includes('FROM billing_subscriptions') && q.includes('WHERE user_id')) {
        const row = subscriptions.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM billing_subscriptions') && q.includes('stripe_subscription_id')) {
        const row = [...subscriptions.values()].find((r) => r.stripe_subscription_id === params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('FROM billing_subscriptions') && q.includes('LOWER(email)')) {
        const row = [...subscriptions.values()].find((r) => r.email === params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('COUNT(*)') && q.includes('billing_subscriptions')) {
        return { rows: [{ n: subscriptions.size }] };
      }
      if (q.includes('INSERT INTO billing_subscriptions')) {
        const [
          userId,
          email,
          stripeCustomerId,
          stripeSubscriptionId,
          status,
          planKey,
          period,
          stripePriceId,
          source,
        ] = params;
        const existing = subscriptions.get(userId);
        subscriptions.set(userId, {
          user_id: userId,
          email: email ?? existing?.email ?? null,
          stripe_customer_id: stripeCustomerId ?? existing?.stripe_customer_id ?? null,
          stripe_subscription_id: stripeSubscriptionId ?? existing?.stripe_subscription_id ?? null,
          status,
          plan_key: planKey ?? existing?.plan_key ?? null,
          period: period ?? existing?.period ?? null,
          stripe_price_id: stripePriceId ?? existing?.stripe_price_id ?? null,
          source: source ?? existing?.source ?? null,
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          canceled_at: null,
          created_at: existing?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        return { rows: [] };
      }
      if (q.includes('DELETE FROM billing_subscriptions')) {
        subscriptions.delete(params[0]);
        return { rows: [] };
      }

      // trials
      if (q.includes('FROM billing_trials') && q.includes('WHERE user_id')) {
        const row = trials.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.includes('COUNT(*)') && q.includes('billing_trials')) {
        return { rows: [{ n: trials.size }] };
      }
      if (q.includes('INSERT INTO billing_trials')) {
        const id = params[0];
        if (trials.has(id) && q.includes('DO NOTHING')) {
          return { rows: q.includes('RETURNING') ? [] : [] };
        }
        const email = params[1];
        const status = params[2];
        const startedAt = params[3];
        const endsAt = params[4];
        const used = params.length >= 6 ? params[5] !== false : true;
        const source = params.length >= 7 ? params[6] : 'luna_server';
        if (!trials.has(id)) {
          trials.set(id, {
            user_id: id,
            email,
            status,
            started_at: startedAt,
            ends_at: endsAt,
            used,
            source: source || 'luna_server',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          if (q.includes('RETURNING')) return { rows: [{ user_id: id }] };
        }
        return { rows: [] };
      }
      if (q.includes('DELETE FROM billing_trials')) {
        trials.delete(params[0]);
        return { rows: [] };
      }

      return { rows: [] };
    },
  };
  return pool;
};

describe('billing repositories (mocked pool)', () => {
  beforeEach(async () => {
    vi.resetModules();
    const accounts = await import('../../server/core/billingAccountsStore.mjs');
    const subs = await import('../../server/core/billingSubscriptionsStore.mjs');
    const trials = await import('../../server/core/billingTrialsStore.mjs');
    accounts.__resetBillingAccountsSchemaForTests();
    subs.__resetBillingSubscriptionsSchemaForTests();
    trials.__resetBillingTrialsSchemaForTests();
  });

  it('account upsert survives new repository instance + lookup by Stripe id', async () => {
    const pool = createBillingMockPool();
    const {
      ensureBillingAccountsTable,
      upsertBillingAccount,
      getBillingAccountByUserId,
      getBillingAccountByStripeCustomerId,
      __resetBillingAccountsSchemaForTests,
    } = await import('../../server/core/billingAccountsStore.mjs');
    __resetBillingAccountsSchemaForTests();
    await ensureBillingAccountsTable(pool);
    await upsertBillingAccount(pool, {
      userId: 'u1',
      email: 'a@test.com',
      stripeCustomerId: 'cus_1',
    });
    __resetBillingAccountsSchemaForTests();
    await ensureBillingAccountsTable(pool);
    expect(await getBillingAccountByUserId(pool, 'u1')).toMatchObject({
      email: 'a@test.com',
      stripeCustomerId: 'cus_1',
    });
    expect(await getBillingAccountByStripeCustomerId(pool, 'cus_1')).toMatchObject({ userId: 'u1' });
  });

  it('subscription upsert survives + concurrent siblings preserved', async () => {
    const pool = createBillingMockPool();
    const {
      ensureBillingSubscriptionsTable,
      upsertSubscription,
      getSubscriptionByUserId,
      getSubscriptionByStripeSubscriptionId,
      __resetBillingSubscriptionsSchemaForTests,
    } = await import('../../server/core/billingSubscriptionsStore.mjs');
    __resetBillingSubscriptionsSchemaForTests();
    await ensureBillingSubscriptionsTable(pool);
    await Promise.all([
      upsertSubscription(pool, {
        userId: 'u1',
        email: 'a@test.com',
        status: 'active',
        period: 'month',
        stripeSubscriptionId: 'sub_1',
      }),
      upsertSubscription(pool, {
        userId: 'u2',
        email: 'b@test.com',
        status: 'past_due',
        period: 'year',
        stripeSubscriptionId: 'sub_2',
      }),
    ]);
    expect(await getSubscriptionByUserId(pool, 'u1')).toMatchObject({ status: 'active' });
    expect(await getSubscriptionByUserId(pool, 'u2')).toMatchObject({ status: 'past_due' });
    expect(await getSubscriptionByStripeSubscriptionId(pool, 'sub_2')).toMatchObject({ userId: 'u2' });
    // Idempotent re-upsert
    await upsertSubscription(pool, {
      userId: 'u1',
      email: 'a@test.com',
      status: 'active',
      period: 'month',
      stripeSubscriptionId: 'sub_1',
    });
    expect(pool.subscriptions.size).toBe(2);
  });

  it('stale instance upsert cannot delete unrelated records', async () => {
    const pool = createBillingMockPool();
    const { upsertSubscription, ensureBillingSubscriptionsTable, __resetBillingSubscriptionsSchemaForTests } =
      await import('../../server/core/billingSubscriptionsStore.mjs');
    __resetBillingSubscriptionsSchemaForTests();
    await ensureBillingSubscriptionsTable(pool);
    await upsertSubscription(pool, { userId: 'keep', email: 'k@test.com', status: 'active', period: 'month' });
    // "Stale instance" only knows about another user — upsert must not wipe keep.
    await upsertSubscription(pool, { userId: 'other', email: 'o@test.com', status: 'canceled', period: 'month' });
    expect(pool.subscriptions.has('keep')).toBe(true);
    expect(pool.subscriptions.has('other')).toBe(true);
  });

  it('trial start durable + idempotent; client dates ignored; expired stays used', async () => {
    const pool = createBillingMockPool();
    const {
      ensureBillingTrialsTable,
      startTrialForUser,
      getTrialByUserId,
      importTrialIfAbsent,
      __resetBillingTrialsSchemaForTests,
    } = await import('../../server/core/billingTrialsStore.mjs');
    __resetBillingTrialsSchemaForTests();
    await ensureBillingTrialsTable(pool);

    const first = await startTrialForUser(pool, { userId: 'u1', email: 'a@test.com', trialDays: 7 });
    expect(first.rejected).toBe(false);
    expect(first.trial.status).toBe('active');
    const startedAt = first.trial.startedAt;

    const second = await startTrialForUser(pool, { userId: 'u1', email: 'a@test.com', trialDays: 7 });
    expect(second.alreadyActive).toBe(true);
    expect(second.trial.startedAt).toBe(startedAt);

    // Simulate second browser: same durable row
    const otherView = await getTrialByUserId(pool, 'u1');
    expect(otherView.startedAt).toBe(startedAt);

    // Expire trial
    pool.trials.get('u1').ends_at = new Date(Date.now() - 1000).toISOString();
    const expired = await getTrialByUserId(pool, 'u1');
    expect(expired.status).toBe('expired');
    const reuse = await startTrialForUser(pool, { userId: 'u1', email: 'a@test.com', trialDays: 7 });
    expect(reuse.rejected).toBe(true);

    // import with client-forged dates for another user — server import uses provided legacy dates,
    // but startTrial never accepts client dates (proven by startedAt stability above).
    const forged = await importTrialIfAbsent(pool, {
      userId: 'u2',
      email: 'b@test.com',
      startedAt: '2099-01-01T00:00:00.000Z',
      endsAt: '2099-01-08T00:00:00.000Z',
      used: true,
    });
    expect(forged).toBe('inserted');
    // Existing truth not overwritten
    expect(await importTrialIfAbsent(pool, {
      userId: 'u2',
      email: 'b@test.com',
      startedAt: '2000-01-01T00:00:00.000Z',
      endsAt: '2000-01-08T00:00:00.000Z',
    })).toBe('skipped_exists');
  });
});

describe('billing legacy import', () => {
  it('imports only when appropriate; skips malformed; idempotent; no overwrite', async () => {
    const pool = createBillingMockPool();
    const accounts = await import('../../server/core/billingAccountsStore.mjs');
    const subs = await import('../../server/core/billingSubscriptionsStore.mjs');
    const trials = await import('../../server/core/billingTrialsStore.mjs');
    accounts.__resetBillingAccountsSchemaForTests();
    subs.__resetBillingSubscriptionsSchemaForTests();
    trials.__resetBillingTrialsSchemaForTests();
    await accounts.ensureBillingAccountsTable(pool);
    await subs.ensureBillingSubscriptionsTable(pool);
    await trials.ensureBillingTrialsTable(pool);

    const { parseLegacyBillingState, importLegacyBillingState, maybeImportLegacyBillingOnBoot } =
      await import('../../server/core/billingLegacyImport.mjs');

    const legacy = {
      u1: { status: 'active', period: 'year', subscriptionId: 'sub_x', email: 'a@test.com' },
      'trial:u1': {
        userId: 'u1',
        email: 'a@test.com',
        startedAt: '2026-01-01T00:00:00.000Z',
        endsAt: '2026-01-08T00:00:00.000Z',
        used: true,
      },
      'not-a-key': { foo: 1 },
      'bad@email.com': { status: 'active' },
    };
    const parsed = parseLegacyBillingState(legacy);
    expect(parsed.subscriptions.length).toBe(1);
    expect(parsed.trials.length).toBe(1);
    expect(parsed.skipped).toBeGreaterThan(0);

    const first = await importLegacyBillingState(pool, legacy);
    expect(first.subscriptionsInserted).toBe(1);
    expect(first.trialsInserted).toBe(1);

    const second = await importLegacyBillingState(pool, legacy);
    expect(second.subscriptionsInserted).toBe(0);
    expect(second.subscriptionsSkipped).toBe(1);

    // Boot helper skips when not empty
    const boot = await maybeImportLegacyBillingOnBoot(pool, legacy);
    expect(boot.imported).toBe(false);
    expect(boot.reason).toBe('postgres_not_empty');
  });
});

describe('billing JSON API (test harness) + fail-closed', () => {
  let dataDir;
  let originalEnv;
  let handler;
  let ipSeq = 90;
  const nextIp = () => `198.51.100.${ipSeq++}`;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'luna29-billing-'));
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL;
    process.env.NODE_ENV = 'test';
    process.env.STRIPE_BILLING_ENABLED = 'false';
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    handler = await buildApiHandler({ dataDir, environment: 'test' });
  });

  afterEach(async () => {
    process.env = originalEnv;
    vi.resetModules();
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('trial start is durable across handler rebuild (JSON test mode)', async () => {
    const email = `bill-${Date.now()}@test.com`;
    const signup = await invoke(handler, {
      method: 'POST',
      path: '/api/auth/signup',
      body: { email, password: 'password123', name: 'Bill' },
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
    expect(trial.statusCode).toBe(200);
    expect(trial.json?.trial?.used).toBe(true);

    const again = await invoke(handler, {
      method: 'POST',
      path: '/api/billing/trial/start',
      headers: { cookie },
      ip: nextIp(),
    });
    expect(again.statusCode).toBe(200);
    expect(again.json?.alreadyActive).toBe(true);

    // Rebuild handler (cold start) — JSON file must retain trial
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const handler2 = await buildApiHandler({ dataDir, environment: 'test' });
    const status = await invoke(handler2, {
      method: 'GET',
      path: '/api/billing/status',
      headers: { cookie },
      ip: nextIp(),
    });
    expect(status.statusCode).toBe(200);
    expect(status.json?.billing?.status).toBe('trialing');
    expect(status.json?.trial?.used).toBe(true);
  });

  it('health reports billingStorage json_dev in test', async () => {
    const health = await invoke(handler, { method: 'GET', path: '/api/health?verbose=1', ip: nextIp() });
    expect(health.statusCode).toBe(200);
    expect(health.json?.checks?.billingStorage).toBe('json_dev');
    expect(health.json?.checks?.trialStorage).toBe('json_dev');
  });

  it('prod-like without DB fails closed for billing (no JSON fallback)', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';
    delete process.env.DATABASE_URL;
    vi.resetModules();
    const { buildApiHandler } = await import('../../server/core/apiHandler.mjs');
    const prodHandler = await buildApiHandler({ dataDir, environment: 'vercel' });
    const health = await invoke(prodHandler, { method: 'GET', path: '/api/health?verbose=1', ip: nextIp() });
    expect(health.statusCode).toBe(503);
    expect(health.json?.code === 'DURABLE_STORAGE_UNAVAILABLE' || health.json?.ok === false).toBe(true);
  });
});

describe('billing service facade fail-closed', () => {
  it('unavailable mode throws BILLING_STORAGE_UNAVAILABLE (no false success)', async () => {
    const { createBillingService } = await import('../../server/core/billingServiceCore.mjs');
    const svc = createBillingService({
      mode: 'unavailable',
      pool: null,
      billingState: {},
      saveBillingState: async () => {},
      trialDays: 7,
    });
    await expect(svc.startTrial({ id: 'u', email: 'a@test.com' })).rejects.toMatchObject({
      code: 'BILLING_STORAGE_UNAVAILABLE',
    });
    await expect(
      svc.applyWebhookBillingUpdate({
        userId: 'u',
        customerEmail: 'a@test.com',
        status: 'active',
        period: 'month',
        source: 'invoice.paid',
      }),
    ).rejects.toMatchObject({ code: 'BILLING_STORAGE_UNAVAILABLE' });
  });
});
