/**
 * WS1.3 — Conservative one-time import from billing-state.json into Postgres.
 * Never trusts localStorage. Never overwrites existing Postgres rows.
 */

import {
  upsertBillingAccount,
  getBillingAccountByUserId,
  countBillingAccounts,
} from './billingAccountsStore.mjs';
import {
  upsertSubscription,
  getSubscriptionByUserId,
  countBillingSubscriptions,
} from './billingSubscriptionsStore.mjs';
import { importTrialIfAbsent, countBillingTrials } from './billingTrialsStore.mjs';

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const looksLikeEmail = (value) =>
  typeof value === 'string' && value.includes('@') && value.length <= 320;

const looksLikeUserId = (value) =>
  typeof value === 'string' && value.length > 0 && value.length <= 120 && !value.includes('@');

const isStatusPayload = (value) =>
  isPlainObject(value) && typeof value.status === 'string' && value.status.length > 0;

const isTrialPayload = (value) =>
  isPlainObject(value) &&
  (value.startedAt || value.started_at) &&
  (value.endsAt || value.ends_at || value.expires_at);

/**
 * Parse legacy billing-state.json object into typed records.
 * Keys: userId | email | trial:userId
 */
export const parseLegacyBillingState = (billingState) => {
  const accounts = [];
  const subscriptions = [];
  const trials = [];

  if (!isPlainObject(billingState)) {
    return { accounts, subscriptions, trials, skipped: 0 };
  }

  let skipped = 0;
  for (const [key, value] of Object.entries(billingState)) {
    if (typeof key !== 'string' || !key) {
      skipped += 1;
      continue;
    }

    if (key.startsWith('trial:')) {
      const userId = key.slice('trial:'.length);
      if (!looksLikeUserId(userId) || !isTrialPayload(value)) {
        skipped += 1;
        continue;
      }
      trials.push({
        userId,
        email: String(value.email || '').toLowerCase() || 'unknown@imported.local',
        startedAt: value.startedAt || value.started_at,
        endsAt: value.endsAt || value.ends_at || value.expires_at,
        used: value.used !== false,
        source: 'legacy_json',
      });
      continue;
    }

    if (!isStatusPayload(value)) {
      skipped += 1;
      continue;
    }

    const status = String(value.status).toLowerCase();
    const period = value.period == null ? null : String(value.period);
    const plan = value.plan == null ? null : String(value.plan);
    const source = value.source == null ? 'legacy_json' : String(value.source);
    const stripeCustomerId =
      value.stripeCustomerId || value.stripe_customer_id || value.customerId || null;
    const stripeSubscriptionId =
      value.subscriptionId || value.stripe_subscription_id || value.stripeSubscriptionId || null;

    if (looksLikeUserId(key)) {
      subscriptions.push({
        userId: key,
        email: looksLikeEmail(value.email) ? String(value.email).toLowerCase() : null,
        status,
        period,
        planKey: plan,
        source,
        stripeCustomerId: stripeCustomerId ? String(stripeCustomerId) : null,
        stripeSubscriptionId: stripeSubscriptionId ? String(stripeSubscriptionId) : null,
      });
      if (stripeCustomerId || looksLikeEmail(value.email)) {
        accounts.push({
          userId: key,
          email: looksLikeEmail(value.email)
            ? String(value.email).toLowerCase()
            : `${key}@imported.local`,
          stripeCustomerId: stripeCustomerId ? String(stripeCustomerId) : null,
        });
      }
      continue;
    }

    if (looksLikeEmail(key)) {
      // Email-keyed status without user id — skip subscription row (needs user_id PK).
      // Preserve only if we can pair later; count as skipped for safety.
      skipped += 1;
      continue;
    }

    skipped += 1;
  }

  return { accounts, subscriptions, trials, skipped };
};

/**
 * Import when destination is empty OR per-record absent.
 * Never overwrites existing Postgres truth.
 */
export const importLegacyBillingState = async (pool, billingState) => {
  const parsed = parseLegacyBillingState(billingState);
  const counts = {
    accountsInserted: 0,
    accountsSkipped: 0,
    subscriptionsInserted: 0,
    subscriptionsSkipped: 0,
    trialsInserted: 0,
    trialsSkipped: 0,
    malformedSkipped: parsed.skipped,
  };

  for (const account of parsed.accounts) {
    try {
      const existing = await getBillingAccountByUserId(pool, account.userId);
      if (existing) {
        counts.accountsSkipped += 1;
        continue;
      }
      await upsertBillingAccount(pool, account);
      counts.accountsInserted += 1;
    } catch {
      counts.accountsSkipped += 1;
    }
  }

  for (const sub of parsed.subscriptions) {
    try {
      const existing = await getSubscriptionByUserId(pool, sub.userId);
      if (existing) {
        counts.subscriptionsSkipped += 1;
        continue;
      }
      await upsertSubscription(pool, sub);
      counts.subscriptionsInserted += 1;
    } catch {
      counts.subscriptionsSkipped += 1;
    }
  }

  for (const trial of parsed.trials) {
    const result = await importTrialIfAbsent(pool, trial);
    if (result === 'inserted') counts.trialsInserted += 1;
    else counts.trialsSkipped += 1;
  }

  return counts;
};

/**
 * Run import only when all billing tables are empty (one-time boot path).
 * Idempotent: second call with data present is a no-op.
 */
export const maybeImportLegacyBillingOnBoot = async (pool, billingState) => {
  if (!pool) return { imported: false, reason: 'no_pool' };
  const [accounts, subscriptions, trials] = await Promise.all([
    countBillingAccounts(pool),
    countBillingSubscriptions(pool),
    countBillingTrials(pool),
  ]);
  if (accounts + subscriptions + trials > 0) {
    return { imported: false, reason: 'postgres_not_empty', accounts, subscriptions, trials };
  }
  if (!isPlainObject(billingState) || Object.keys(billingState).length === 0) {
    return { imported: false, reason: 'no_legacy_data' };
  }
  const counts = await importLegacyBillingState(pool, billingState);
  console.info(
    `[billing] legacy import: accounts=${counts.accountsInserted} subscriptions=${counts.subscriptionsInserted} trials=${counts.trialsInserted} skipped=${counts.malformedSkipped + counts.accountsSkipped + counts.subscriptionsSkipped + counts.trialsSkipped}`,
  );
  return { imported: true, counts };
};
