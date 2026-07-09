/**
 * WS2 Block 2 — Stripe external cancellation for account deletion.
 * No Postgres transaction. No customer hard-delete. Server secret only.
 */

export const STRIPE_CANCEL_REQUIRED = 'stripe_cancel_required';
export const STRIPE_CANCEL_FAILED = 'stripe_cancel_failed';
export const STRIPE_CANCEL_UNAVAILABLE = 'stripe_cancel_unavailable';

const ACTIVE_LIKE = new Set(['active', 'trialing', 'past_due', 'unpaid', 'incomplete']);

/**
 * @param {{
 *   stripeRequest: (method: string, url: string, body?: string|null) => Promise<{ok:boolean,status:number,data:object}>,
 *   billingEnabled: boolean,
 *   secretConfigured: boolean,
 * }} deps
 */
export const createStripeAccountDeletion = ({
  stripeRequest,
  billingEnabled,
  secretConfigured,
}) => {
  /**
   * Cancel Stripe subscription immediately when local status is active-like.
   * Safe no-ops: missing id, already canceled, Stripe 404 resource_missing.
   */
  const cancelSubscriptionForDeletion = async ({
    stripeSubscriptionId,
    localSubscriptionStatus = null,
  }) => {
    const subId = String(stripeSubscriptionId || '').trim();
    const status = String(localSubscriptionStatus || '').toLowerCase();

    if (!subId) {
      return {
        ok: true,
        status: 'skipped_no_subscription',
        reason: 'no_subscription_id',
      };
    }

    if (status === 'canceled' || status === 'cancelled' || status === 'inactive') {
      return {
        ok: true,
        status: 'already_canceled_local',
        reason: 'local_inactive',
      };
    }

    // If billing disabled and no active-like status, skip external call.
    if (!billingEnabled || !secretConfigured) {
      if (ACTIVE_LIKE.has(status)) {
        return {
          ok: false,
          status: 'unavailable',
          reason: STRIPE_CANCEL_UNAVAILABLE,
          retryable: true,
        };
      }
      return {
        ok: true,
        status: 'skipped_billing_disabled',
        reason: 'billing_disabled',
      };
    }

    // Only cancel when we believe subscription may still be active.
    if (status && !ACTIVE_LIKE.has(status)) {
      return {
        ok: true,
        status: 'skipped_non_active',
        reason: 'non_active_status',
      };
    }

    try {
      const result = await stripeRequest(
        'DELETE',
        `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subId)}`,
        null,
      );

      if (result.ok) {
        return {
          ok: true,
          status: 'canceled',
          reason: 'stripe_canceled',
          stripeStatus: result.data?.status || 'canceled',
        };
      }

      const code = String(result.data?.error?.code || '');
      const errType = String(result.data?.error?.type || '');
      // Already gone / already canceled → safe no-op.
      if (
        result.status === 404 ||
        code === 'resource_missing' ||
        (result.status === 400 && /already been canceled|No such subscription/i.test(String(result.data?.error?.message || '')))
      ) {
        return {
          ok: true,
          status: 'already_absent',
          reason: 'stripe_resource_missing',
        };
      }

      // Unknown Stripe error — do not proceed to local cascade.
      return {
        ok: false,
        status: 'failed',
        reason: STRIPE_CANCEL_FAILED,
        retryable: true,
        httpStatus: result.status,
        errorType: errType || undefined,
      };
    } catch {
      return {
        ok: false,
        status: 'failed',
        reason: STRIPE_CANCEL_FAILED,
        retryable: true,
      };
    }
  };

  return { cancelSubscriptionForDeletion, ACTIVE_LIKE };
};

/**
 * Decide whether Stripe cancel is required from local snapshot.
 */
export const stripeCancelRequired = (localSubscriptionStatus, stripeSubscriptionId) => {
  const subId = String(stripeSubscriptionId || '').trim();
  if (!subId) return false;
  const status = String(localSubscriptionStatus || '').toLowerCase();
  if (!status) return true; // unknown but have id → attempt cancel
  return ACTIVE_LIKE.has(status);
};
