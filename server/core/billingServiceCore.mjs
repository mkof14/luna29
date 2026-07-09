/**
 * WS1.3 — Server billing facade over Postgres or JSON (dev/test only).
 * Process memory is never authoritative in postgres mode.
 */

import { isTrialActive, buildTrialRecord, trialStorageKey } from './billingTrial.mjs';
import {
  getBillingAccountByUserId,
  upsertBillingAccount,
  deleteBillingAccountByUserId,
  getBillingAccountByStripeCustomerId,
  getBillingAccountByEmail,
} from './billingAccountsStore.mjs';
import {
  getSubscriptionByUserId,
  getSubscriptionByEmail,
  upsertSubscription,
  deleteSubscriptionByUserId,
  subscriptionToStatusPayload,
} from './billingSubscriptionsStore.mjs';
import {
  getTrialByUserId,
  startTrialForUser,
  deleteTrialByUserId,
  trialToApiPayload,
} from './billingTrialsStore.mjs';

/**
 * @param {{
 *   mode: 'postgres'|'json'|'unavailable',
 *   pool: import('pg').Pool | null,
 *   billingState: Record<string, unknown>,
 *   saveBillingState: () => Promise<void>,
 *   trialDays: number,
 * }} ctx
 */
export const createBillingService = (ctx) => {
  const { mode, pool, billingState, saveBillingState, trialDays } = ctx;

  const assertWritable = () => {
    if (mode === 'unavailable') {
      const err = new Error('Billing storage is unavailable.');
      err.code = 'BILLING_STORAGE_UNAVAILABLE';
      throw err;
    }
    if (mode === 'postgres' && !pool) {
      const err = new Error('Billing storage is unavailable.');
      err.code = 'BILLING_STORAGE_UNAVAILABLE';
      throw err;
    }
  };

  const getStatusForUser = async (user) => {
    assertWritable();
    const userId = user.id;
    const email = String(user.email || '').toLowerCase();

    if (mode === 'postgres') {
      const [subById, trial] = await Promise.all([
        getSubscriptionByUserId(pool, userId),
        getTrialByUserId(pool, userId),
      ]);
      let sub = subById;
      if (!sub && email) {
        sub = await getSubscriptionByEmail(pool, email);
      }
      const currentStatus = subscriptionToStatusPayload(sub);
      const trialActive = trial && isTrialActive(trial);
      const billing =
        trialActive && !['active', 'trialing'].includes(String(currentStatus.status || '').toLowerCase())
          ? {
              ...currentStatus,
              status: 'trialing',
              plan: currentStatus.plan || 'trial',
              trialEndsAt: trial.endsAt,
            }
          : currentStatus;
      return { billing, trial: trialToApiPayload(trial) };
    }

    // JSON mode (dev/test)
    const byId = billingState[userId];
    const byEmail = billingState[email];
    const currentStatus = byId || byEmail || { status: 'inactive', plan: 'none' };
    const trialKey = trialStorageKey(userId);
    const trial = billingState[trialKey] || null;
    const trialActive = trial?.endsAt && new Date(trial.endsAt).getTime() > Date.now();
    const billing =
      trialActive && !['active', 'trialing'].includes(String(currentStatus.status || '').toLowerCase())
        ? {
            ...currentStatus,
            status: 'trialing',
            plan: currentStatus.plan || 'trial',
            trialEndsAt: trial.endsAt,
          }
        : currentStatus;
    return { billing, trial };
  };

  const startTrial = async (user) => {
    assertWritable();
    const userId = user.id;
    const email = String(user.email || '').toLowerCase();

    if (mode === 'postgres') {
      const result = await startTrialForUser(pool, { userId, email, trialDays });
      if (result.rejected) {
        const err = new Error('Trial already used for this account.');
        err.code = 'TRIAL_ALREADY_USED';
        err.trial = result.trial;
        throw err;
      }
      return { trial: result.trial, alreadyActive: Boolean(result.alreadyActive) };
    }

    const trialKey = trialStorageKey(userId);
    const existing = billingState[trialKey];
    if (existing?.endsAt && new Date(existing.endsAt).getTime() > Date.now()) {
      return { trial: existing, alreadyActive: true };
    }
    if (existing?.used) {
      const err = new Error('Trial already used for this account.');
      err.code = 'TRIAL_ALREADY_USED';
      throw err;
    }
    const trial = buildTrialRecord(userId, email, trialDays);
    billingState[trialKey] = trial;
    await saveBillingState();
    return { trial, alreadyActive: false };
  };

  /**
   * Persist webhook-driven status (legacy semantics preserved).
   * Maps by userId and/or email; stores subscription projection when userId known.
   */
  /**
   * @deprecated Prefer processStripeWebhookEvent (WS1.4). Kept for narrow internal use/tests.
   */
  const applyWebhookBillingUpdate = async ({
    userId,
    customerEmail,
    status,
    period,
    source,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeEventCreatedAt,
    stripeEventId,
  }) => {
    assertWritable();
    const email = customerEmail ? String(customerEmail).toLowerCase() : '';
    const nowIso = new Date().toISOString();

    if (mode === 'postgres') {
      let resolvedUserId = userId ? String(userId) : '';
      if (!resolvedUserId && stripeCustomerId) {
        const account = await getBillingAccountByStripeCustomerId(pool, stripeCustomerId);
        if (account) resolvedUserId = account.userId;
      }
      if (!resolvedUserId && stripeSubscriptionId) {
        const { getSubscriptionByStripeSubscriptionId } = await import(
          './billingSubscriptionsStore.mjs'
        );
        const sub = await getSubscriptionByStripeSubscriptionId(pool, stripeSubscriptionId);
        if (sub) resolvedUserId = sub.userId;
      }
      if (!resolvedUserId && email) {
        const account = await getBillingAccountByEmail(pool, email);
        if (account) resolvedUserId = account.userId;
      }
      if (!resolvedUserId) {
        return { persisted: false, reason: 'unmapped_user' };
      }

      await upsertBillingAccount(pool, {
        userId: resolvedUserId,
        email: email || `${resolvedUserId}@billing.local`,
        stripeCustomerId: stripeCustomerId || undefined,
      });

      await upsertSubscription(pool, {
        userId: resolvedUserId,
        email: email || null,
        status,
        period: period || 'month',
        planKey: status === 'active' || status === 'trialing' ? 'premium' : status,
        source,
        stripeCustomerId: stripeCustomerId || null,
        stripeSubscriptionId: stripeSubscriptionId || null,
        stripeEventCreatedAt,
        stripeEventId,
      });
      return { persisted: true, userId: resolvedUserId };
    }

    const payload = {
      status,
      period: period || 'month',
      updatedAt: nowIso,
      source,
      lastStripeEventCreatedAt: stripeEventCreatedAt,
      lastStripeEventId: stripeEventId,
    };
    if (stripeSubscriptionId) payload.subscriptionId = stripeSubscriptionId;
    if (stripeCustomerId) payload.stripeCustomerId = stripeCustomerId;
    if (userId) billingState[userId] = payload;
    if (email) billingState[email] = payload;
    await saveBillingState();
    return { persisted: Boolean(userId || email) };
  };

  const ensureBillingAccount = async ({ userId, email }) => {
    assertWritable();
    if (!userId) return null;
    if (mode === 'postgres') {
      return upsertBillingAccount(pool, {
        userId,
        email: email || `${userId}@billing.local`,
      });
    }
    return null;
  };

  const rememberStripeCustomer = async ({ userId, email, stripeCustomerId }) => {
    assertWritable();
    if (!userId) return null;
    if (mode === 'postgres') {
      return upsertBillingAccount(pool, {
        userId,
        email: email || `${userId}@billing.local`,
        stripeCustomerId: stripeCustomerId || undefined,
      });
    }
    if (!stripeCustomerId) return null;
    const existing = billingState[userId] || {};
    billingState[userId] = {
      ...existing,
      stripeCustomerId,
      updatedAt: new Date().toISOString(),
    };
    if (email) {
      billingState[String(email).toLowerCase()] = {
        ...(billingState[String(email).toLowerCase()] || {}),
        stripeCustomerId,
        updatedAt: new Date().toISOString(),
      };
    }
    await saveBillingState();
    return billingState[userId];
  };

  const getStripeCustomerIdForUser = async (user) => {
    assertWritable();
    if (mode === 'postgres') {
      const account = await getBillingAccountByUserId(pool, user.id);
      return account?.stripeCustomerId || null;
    }
    const byId = billingState[user.id];
    const byEmail = billingState[String(user.email || '').toLowerCase()];
    return byId?.stripeCustomerId || byEmail?.stripeCustomerId || null;
  };

  const deleteBillingForUser = async (user) => {
    assertWritable();
    const userId = user.id;
    const email = String(user.email || '').toLowerCase();

    if (mode === 'postgres') {
      await Promise.all([
        deleteBillingAccountByUserId(pool, userId),
        deleteSubscriptionByUserId(pool, userId),
        deleteTrialByUserId(pool, userId),
      ]);
      return;
    }

    delete billingState[userId];
    delete billingState[email];
    delete billingState[trialStorageKey(userId)];
    await saveBillingState();
  };

  /**
   * Build legacy-shaped billingState map for admin metrics (read projection).
   */
  const buildAdminBillingStateProjection = async (users) => {
    if (mode === 'json') return billingState;
    if (mode !== 'postgres' || !pool) return {};

    const projection = {};
    for (const user of users || []) {
      if (!user?.id) continue;
      const [sub, trial] = await Promise.all([
        getSubscriptionByUserId(pool, user.id),
        getTrialByUserId(pool, user.id),
      ]);
      if (sub) {
        const payload = subscriptionToStatusPayload(sub);
        projection[user.id] = payload;
        if (user.email) projection[String(user.email).toLowerCase()] = payload;
      }
      if (trial) {
        projection[trialStorageKey(user.id)] = {
          ...trialToApiPayload(trial),
          trial: true,
        };
        if (isTrialActive(trial) && !projection[user.id]) {
          const trialBilling = {
            status: 'trialing',
            plan: 'trial',
            trial: true,
            trialEndsAt: trial.endsAt,
          };
          projection[user.id] = trialBilling;
          if (user.email) projection[String(user.email).toLowerCase()] = trialBilling;
        }
      }
    }
    return projection;
  };

  return {
    mode,
    getStatusForUser,
    startTrial,
    applyWebhookBillingUpdate,
    ensureBillingAccount,
    rememberStripeCustomer,
    getStripeCustomerIdForUser,
    deleteBillingForUser,
    buildAdminBillingStateProjection,
  };
};
