/**
 * WS1.4 — Stripe webhook processing (claim → project → mark).
 *
 * Authority:
 * - Stripe: event identity, customer/subscription/payment facts, event.created
 * - Luna Postgres: event ledger + durable billing projection
 * - Client: never authoritative for Stripe IDs/status/timestamps
 *
 * Transaction boundary:
 * - Event claim uses a short DB transaction (INSERT/FOR UPDATE).
 * - Projection upserts run after claim (no external Stripe API calls).
 * - Mark processed/failed/ignored after projection outcome.
 * - Never mark processed before durable projection succeeds.
 */

import {
  claimStripeWebhookEvent,
  markStripeWebhookEventProcessed,
  markStripeWebhookEventIgnored,
  markStripeWebhookEventFailed,
  createMemoryStripeWebhookLedger,
} from './stripeWebhookEventsStore.mjs';
import {
  getBillingAccountByStripeCustomerId,
  getBillingAccountByEmail,
  upsertBillingAccount,
} from './billingAccountsStore.mjs';
import {
  getSubscriptionByStripeSubscriptionId,
  upsertSubscription,
} from './billingSubscriptionsStore.mjs';

export const SUPPORTED_STRIPE_EVENTS = Object.freeze([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
]);

const TRUSTED_META_KEYS = Object.freeze(['luna_user_id', 'luna_email', 'luna_period']);

const safeLog = (fields) => {
  try {
    console.info('[stripe-webhook]', JSON.stringify(fields));
  } catch {
    /* ignore */
  }
};

const asText = (value, max = 200) => {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

/**
 * Extract projection inputs from a verified Stripe event object.
 * Does not trust arbitrary client fields beyond Luna server checkout metadata keys.
 */
export const extractStripeEventProjection = (event) => {
  const eventId = asText(event?.id, 200);
  const eventType = asText(event?.type, 120);
  const stripeCreatedAt =
    event?.created == null || Number.isNaN(Number(event.created)) ? null : Number(event.created);
  const data = event?.data?.object || {};
  const objectId = asText(data.id, 200);

  let stripeCustomerId = null;
  if (typeof data.customer === 'string') stripeCustomerId = asText(data.customer, 120);
  else if (data.customer && typeof data.customer === 'object' && data.customer.id) {
    stripeCustomerId = asText(data.customer.id, 120);
  }

  let stripeSubscriptionId = null;
  if (typeof data.subscription === 'string') {
    stripeSubscriptionId = asText(data.subscription, 120);
  } else if (data.subscription && typeof data.subscription === 'object' && data.subscription.id) {
    stripeSubscriptionId = asText(data.subscription.id, 120);
  } else if (typeof data.id === 'string' && data.id.startsWith('sub_')) {
    stripeSubscriptionId = asText(data.id, 120);
  }

  const metadata =
    data.metadata && typeof data.metadata === 'object' && !Array.isArray(data.metadata)
      ? data.metadata
      : {};

  // Trusted only when present on Stripe object from Luna checkout (server-set keys).
  const trustedUserId = asText(metadata.luna_user_id || data.client_reference_id, 120);
  const trustedEmail = normalizeEmail(metadata.luna_email || data.customer_email || '');
  const period = asText(metadata.luna_period, 12) || null;

  let status = null;
  let planKey = null;
  let cancelAtPeriodEnd = null;
  let canceledAt = null;
  let currentPeriodStart = null;
  let currentPeriodEnd = null;
  let stripePriceId = null;

  if (eventType === 'checkout.session.completed' || eventType === 'invoice.paid') {
    status = 'active';
    planKey = 'premium';
  } else if (eventType === 'invoice.payment_failed') {
    status = 'past_due';
    planKey = 'premium';
  } else if (
    eventType === 'customer.subscription.created' ||
    eventType === 'customer.subscription.updated'
  ) {
    status = asText(data.status, 40) || 'inactive';
    // Map Stripe statuses used by Luna premium helper
    if (['active', 'trialing'].includes(status)) planKey = 'premium';
    else if (status === 'past_due') planKey = 'premium';
    else if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') {
      planKey = status;
    } else {
      planKey = status;
    }
    cancelAtPeriodEnd = Boolean(data.cancel_at_period_end);
    if (data.canceled_at) {
      canceledAt = new Date(Number(data.canceled_at) * 1000).toISOString();
    }
    if (data.current_period_start) {
      currentPeriodStart = new Date(Number(data.current_period_start) * 1000).toISOString();
    }
    if (data.current_period_end) {
      currentPeriodEnd = new Date(Number(data.current_period_end) * 1000).toISOString();
    }
    const priceId = data.items?.data?.[0]?.price?.id;
    if (priceId) stripePriceId = asText(priceId, 120);
  } else if (eventType === 'customer.subscription.deleted') {
    status = 'canceled';
    planKey = 'canceled';
    stripeSubscriptionId = stripeSubscriptionId || objectId;
    if (data.canceled_at) {
      canceledAt = new Date(Number(data.canceled_at) * 1000).toISOString();
    }
  }

  let resolvedPeriod = period;
  if (!resolvedPeriod) {
    const interval = data.items?.data?.[0]?.price?.recurring?.interval;
    if (interval === 'year') resolvedPeriod = 'year';
    else if (interval === 'month') resolvedPeriod = 'month';
    else resolvedPeriod = 'month';
  }

  return {
    eventId,
    eventType,
    stripeCreatedAt,
    objectId,
    stripeCustomerId,
    stripeSubscriptionId,
    trustedUserId,
    trustedEmail: trustedEmail || null,
    period: resolvedPeriod || 'month',
    status,
    planKey,
    cancelAtPeriodEnd,
    canceledAt,
    currentPeriodStart,
    currentPeriodEnd,
    stripePriceId,
    supported: SUPPORTED_STRIPE_EVENTS.includes(eventType),
    // Expose only that trusted keys were considered (never log values).
    trustedMetaKeysPresent: TRUSTED_META_KEYS.filter((k) => Boolean(metadata[k])),
  };
};

/**
 * Resolve Luna user_id safely.
 * Order: durable stripe_customer_id → durable stripe_subscription_id →
 * trusted server checkout metadata (luna_user_id / client_reference_id) →
 * durable email mapping (last resort, only if unique account exists).
 */
export const resolveWebhookUserId = async (pool, projection, { mode, billingState } = {}) => {
  if (mode === 'json') {
    // JSON/test: trusted server checkout metadata only (no inventing users from email alone).
    if (projection.trustedUserId) {
      return { userId: projection.trustedUserId, strategy: 'trusted_metadata' };
    }
    return { userId: null, strategy: 'unmapped', reason: 'user_mapping_missing' };
  }

  if (projection.stripeCustomerId) {
    const account = await getBillingAccountByStripeCustomerId(pool, projection.stripeCustomerId);
    if (account?.userId) {
      // Conflict with trusted metadata → refuse mutation (safer than picking either side).
      if (
        projection.trustedUserId &&
        projection.trustedUserId !== account.userId
      ) {
        return {
          userId: null,
          strategy: 'ambiguous',
          reason: 'user_mapping_ambiguous',
        };
      }
      return { userId: account.userId, strategy: 'stripe_customer_id' };
    }
  }

  if (projection.stripeSubscriptionId) {
    const sub = await getSubscriptionByStripeSubscriptionId(pool, projection.stripeSubscriptionId);
    if (sub?.userId) {
      if (projection.trustedUserId && projection.trustedUserId !== sub.userId) {
        return { userId: null, strategy: 'ambiguous', reason: 'user_mapping_ambiguous' };
      }
      return { userId: sub.userId, strategy: 'stripe_subscription_id' };
    }
  }

  if (projection.trustedUserId) {
    return { userId: projection.trustedUserId, strategy: 'trusted_metadata' };
  }

  if (projection.trustedEmail) {
    const account = await getBillingAccountByEmail(pool, projection.trustedEmail);
    if (account?.userId) {
      return { userId: account.userId, strategy: 'email_account' };
    }
  }

  return { userId: null, strategy: 'unmapped', reason: 'user_mapping_missing' };
};

/**
 * Apply durable projection for a supported event. No Stripe network calls.
 */
export const applyStripeProjection = async ({
  mode,
  pool,
  billingState,
  saveBillingState,
  projection,
  rememberStripeCustomer,
}) => {
  const mapping = await resolveWebhookUserId(pool, projection, { mode, billingState });
  if (mapping.reason === 'user_mapping_ambiguous') {
    return { ok: false, code: 'user_mapping_ambiguous', mapping };
  }
  if (!mapping.userId) {
    // Unmapped: not a hard failure for Stripe retries forever — treat as ignored outcome.
    return { ok: true, code: 'user_mapping_missing', persisted: false, mapping };
  }

  const userId = mapping.userId;
  const email = projection.trustedEmail || `${userId}@billing.local`;

  if (mode === 'postgres') {
    await upsertBillingAccount(pool, {
      userId,
      email,
      stripeCustomerId: projection.stripeCustomerId || undefined,
    });

    if (!projection.status) {
      return { ok: true, code: 'no_status_change', persisted: false, mapping };
    }

    const sub = await upsertSubscription(pool, {
      userId,
      email,
      status: projection.status,
      period: projection.period || 'month',
      planKey: projection.planKey || projection.status,
      source: projection.eventType,
      stripeCustomerId: projection.stripeCustomerId,
      stripeSubscriptionId: projection.stripeSubscriptionId,
      stripePriceId: projection.stripePriceId,
      currentPeriodStart: projection.currentPeriodStart,
      currentPeriodEnd: projection.currentPeriodEnd,
      cancelAtPeriodEnd: projection.cancelAtPeriodEnd,
      canceledAt: projection.canceledAt,
      stripeEventCreatedAt: projection.stripeCreatedAt,
      stripeEventId: projection.eventId,
    });

    const meta = sub?._upsertMeta || { applied: true, reason: 'applied' };
    if (projection.eventType === 'checkout.session.completed' && projection.stripeCustomerId) {
      if (typeof rememberStripeCustomer === 'function') {
        await rememberStripeCustomer({
          userId,
          email,
          stripeCustomerId: projection.stripeCustomerId,
        });
      }
    }

    return {
      ok: true,
      code: meta.applied === false ? meta.reason : 'projected',
      persisted: meta.applied !== false,
      stale: meta.reason === 'skip_stale',
      mapping,
      userId,
    };
  }

  // JSON mode (dev/test) — mutate only after durable save succeeds.
  const payload = {
    status: projection.status || 'inactive',
    period: projection.period || 'month',
    updatedAt: new Date().toISOString(),
    source: projection.eventType,
    subscriptionId: projection.stripeSubscriptionId || undefined,
    stripeCustomerId: projection.stripeCustomerId || undefined,
    lastStripeEventCreatedAt: projection.stripeCreatedAt,
    lastStripeEventId: projection.eventId,
  };
  const existing = billingState[userId] || billingState[email] || null;
  if (
    existing?.lastStripeEventCreatedAt != null &&
    existing?.lastStripeEventId &&
    projection.stripeCreatedAt != null &&
    projection.eventId
  ) {
    const prevC = Number(existing.lastStripeEventCreatedAt);
    const nextC = Number(projection.stripeCreatedAt);
    if (nextC < prevC) {
      return { ok: true, code: 'skip_stale', persisted: false, stale: true, mapping, userId };
    }
    if (nextC === prevC && String(projection.eventId) < String(existing.lastStripeEventId)) {
      return { ok: true, code: 'skip_stale', persisted: false, stale: true, mapping, userId };
    }
    if (nextC === prevC && String(projection.eventId) === String(existing.lastStripeEventId)) {
      return { ok: true, code: 'skip_same', persisted: false, mapping, userId };
    }
  }
  await saveBillingState();
  if (userId) billingState[userId] = payload;
  if (email) billingState[email] = payload;
  return { ok: true, code: 'projected', persisted: true, mapping, userId };
};

/**
 * Process one verified Stripe event end-to-end.
 * @returns {{ httpStatus: number, body: object, result: string, reason: string }}
 */
export const processStripeWebhookEvent = async ({
  mode,
  pool,
  billingState,
  saveBillingState,
  event,
  ledger = null,
  rememberStripeCustomer = null,
}) => {
  const started = Date.now();
  const projection = extractStripeEventProjection(event);

  if (!projection.eventId || !projection.eventType) {
    return {
      httpStatus: 400,
      body: { error: 'Invalid Stripe event.' },
      result: 'rejected',
      reason: 'invalid_event',
    };
  }

  const claimApi = ledger || {
    claimStripeWebhookEvent,
    markStripeWebhookEventProcessed,
    markStripeWebhookEventIgnored,
    markStripeWebhookEventFailed,
  };

  let claim;
  try {
    claim = await claimApi.claimStripeWebhookEvent(pool, {
      eventId: projection.eventId,
      eventType: projection.eventType,
      stripeCreatedAt: projection.stripeCreatedAt,
      objectId: projection.objectId,
      customerId: projection.stripeCustomerId,
      subscriptionId: projection.stripeSubscriptionId,
    });
  } catch {
    safeLog({
      event_id: projection.eventId,
      event_type: projection.eventType,
      status: 'failed',
      result_reason: 'event_claim_failed',
      latency_ms: Date.now() - started,
    });
    return {
      httpStatus: 500,
      body: { error: 'Unable to claim webhook event.' },
      result: 'failed',
      reason: 'event_claim_failed',
    };
  }

  if (claim.action === 'skip') {
    safeLog({
      event_id: projection.eventId,
      event_type: projection.eventType,
      status: claim.event?.processingStatus,
      attempt_count: claim.event?.attemptCount,
      result_reason: claim.reason,
      latency_ms: Date.now() - started,
      has_customer_id: Boolean(projection.stripeCustomerId),
      has_subscription_id: Boolean(projection.stripeSubscriptionId),
    });
    return {
      httpStatus: 200,
      body: { received: true, duplicate: true },
      result: 'duplicate',
      reason: claim.reason,
    };
  }

  if (claim.action === 'in_progress') {
    // Another instance is processing — ask Stripe to retry shortly.
    safeLog({
      event_id: projection.eventId,
      event_type: projection.eventType,
      status: 'processing',
      attempt_count: claim.event?.attemptCount,
      result_reason: 'concurrent_processing',
      latency_ms: Date.now() - started,
    });
    return {
      httpStatus: 409,
      body: { error: 'Event processing in progress.' },
      result: 'in_progress',
      reason: 'concurrent_processing',
    };
  }

  // Unsupported → ignore (2xx), no projection mutation
  if (!projection.supported) {
    await claimApi.markStripeWebhookEventIgnored(pool, projection.eventId, 'unsupported_event');
    safeLog({
      event_id: projection.eventId,
      event_type: projection.eventType,
      status: 'ignored',
      attempt_count: claim.event?.attemptCount,
      result_reason: 'unsupported_event',
      latency_ms: Date.now() - started,
    });
    return {
      httpStatus: 200,
      body: { received: true, ignored: true },
      result: 'ignored',
      reason: 'unsupported_event',
    };
  }

  try {
    const applied = await applyStripeProjection({
      mode,
      pool,
      billingState,
      saveBillingState,
      projection,
      rememberStripeCustomer,
    });

    if (!applied.ok) {
      // Ambiguous mapping: do not mutate; ignore (2xx) to avoid infinite poison retries.
      if (applied.code === 'user_mapping_ambiguous') {
        await claimApi.markStripeWebhookEventIgnored(pool, projection.eventId, applied.code);
        safeLog({
          event_id: projection.eventId,
          event_type: projection.eventType,
          status: 'ignored',
          attempt_count: claim.event?.attemptCount,
          result_reason: applied.code,
          latency_ms: Date.now() - started,
          has_customer_id: Boolean(projection.stripeCustomerId),
          has_subscription_id: Boolean(projection.stripeSubscriptionId),
        });
        return {
          httpStatus: 200,
          body: { received: true, ignored: true },
          result: 'ignored',
          reason: applied.code,
        };
      }
      await claimApi.markStripeWebhookEventFailed(pool, projection.eventId, applied.code);
      safeLog({
        event_id: projection.eventId,
        event_type: projection.eventType,
        status: 'failed',
        attempt_count: claim.event?.attemptCount,
        result_reason: applied.code,
        latency_ms: Date.now() - started,
        has_customer_id: Boolean(projection.stripeCustomerId),
        has_subscription_id: Boolean(projection.stripeSubscriptionId),
      });
      return {
        httpStatus: 500,
        body: { error: 'Unable to persist billing webhook.' },
        result: 'failed',
        reason: applied.code,
      };
    }

    // Unmapped supported event: ignore (no wrong-user mutation); Stripe retry won't help.
    if (applied.code === 'user_mapping_missing') {
      await claimApi.markStripeWebhookEventIgnored(pool, projection.eventId, applied.code);
      safeLog({
        event_id: projection.eventId,
        event_type: projection.eventType,
        status: 'ignored',
        attempt_count: claim.event?.attemptCount,
        result_reason: applied.code,
        latency_ms: Date.now() - started,
        has_customer_id: Boolean(projection.stripeCustomerId),
        has_subscription_id: Boolean(projection.stripeSubscriptionId),
      });
      return {
        httpStatus: 200,
        body: { received: true, ignored: true },
        result: 'ignored',
        reason: applied.code,
      };
    }

    // Stale/same: still mark processed (event handled safely, no overwrite).
    await claimApi.markStripeWebhookEventProcessed(pool, projection.eventId);
    safeLog({
      event_id: projection.eventId,
      event_type: projection.eventType,
      status: 'processed',
      attempt_count: claim.event?.attemptCount,
      result_reason: applied.code,
      latency_ms: Date.now() - started,
      has_customer_id: Boolean(projection.stripeCustomerId),
      has_subscription_id: Boolean(projection.stripeSubscriptionId),
    });
    return {
      httpStatus: 200,
      body: { received: true },
      result: 'processed',
      reason: applied.code,
    };
  } catch {
    try {
      await claimApi.markStripeWebhookEventFailed(pool, projection.eventId, 'projection_failed');
    } catch {
      /* still return non-2xx */
    }
    safeLog({
      event_id: projection.eventId,
      event_type: projection.eventType,
      status: 'failed',
      attempt_count: claim.event?.attemptCount,
      result_reason: 'projection_failed',
      latency_ms: Date.now() - started,
    });
    return {
      httpStatus: 500,
      body: { error: 'Unable to persist billing webhook.' },
      result: 'failed',
      reason: 'projection_failed',
    };
  }
};

export { createMemoryStripeWebhookLedger };
