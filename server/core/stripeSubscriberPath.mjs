/**
 * Canonical Stripe subscriber path for Luna29.
 *
 * One product plan, two billing intervals (month | year), Stripe-hosted trial
 * via subscription_data[trial_period_days]. Luna server trial must not grant
 * premium when Stripe billing is enabled.
 */

export const STRIPE_CHECKOUT_PERIODS = Object.freeze(['month', 'year']);
export const DEFAULT_STRIPE_TRIAL_DAYS = 7;
export const USE_STRIPE_CHECKOUT = 'USE_STRIPE_CHECKOUT';

/**
 * @param {unknown} raw
 * @returns {'month'|'year'}
 */
export const resolveCheckoutPeriod = (raw) =>
  String(raw || 'month').trim().toLowerCase() === 'year' ? 'year' : 'month';

/**
 * @param {'month'|'year'} period
 * @param {{ monthlyId?: string, yearlyId?: string }} priceIds
 */
export const resolveCheckoutPriceId = (period, { monthlyId = '', yearlyId = '' } = {}) => {
  const price = period === 'year' ? String(yearlyId || '').trim() : String(monthlyId || '').trim();
  return price || null;
};

/**
 * @param {unknown} raw
 * @param {number} [fallback=DEFAULT_STRIPE_TRIAL_DAYS]
 */
export const resolveStripeTrialDays = (raw, fallback = DEFAULT_STRIPE_TRIAL_DAYS) => {
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  return Math.max(0, Math.floor(Number(fallback) || DEFAULT_STRIPE_TRIAL_DAYS));
};

/**
 * Append Stripe Checkout trial fields. Mutates and returns `fields`.
 * @param {Array<[string, string]>} fields
 * @param {number} trialDays
 */
export const appendCheckoutTrialFields = (fields, trialDays) => {
  const days = resolveStripeTrialDays(trialDays, 0);
  if (days > 0) {
    fields.push(['subscription_data[trial_period_days]', String(days)]);
  }
  return fields;
};

/**
 * When Stripe billing is on, Luna `/api/billing/trial/start` must not grant premium.
 * @param {boolean|string|undefined} billingEnabled
 */
export const isLunaServerTrialAllowed = (billingEnabled) => {
  if (billingEnabled === true) return false;
  if (typeof billingEnabled === 'string') {
    return billingEnabled.trim().toLowerCase() !== 'true';
  }
  return true;
};

/**
 * Map checkout.session.completed payment_status → Luna billing status.
 * Trial checkouts typically complete with no_payment_required.
 * @param {{ payment_status?: string, status?: string }|null|undefined} session
 */
export const statusFromCheckoutSession = (session) => {
  const paymentStatus = String(session?.payment_status || '').toLowerCase();
  if (paymentStatus === 'no_payment_required' || paymentStatus === 'unpaid') {
    return 'trialing';
  }
  return 'active';
};

/**
 * Build form field pairs for Stripe Checkout Session create.
 * @param {{
 *   period: 'month'|'year',
 *   priceId: string,
 *   userId: string,
 *   email: string,
 *   successUrl: string,
 *   cancelUrl: string,
 *   trialDays: number,
 *   existingCustomerId?: string|null,
 * }} args
 */
export const buildCheckoutSessionFields = ({
  period,
  priceId,
  userId,
  email,
  successUrl,
  cancelUrl,
  trialDays,
  existingCustomerId = null,
}) => {
  const fields = [
    ['mode', 'subscription'],
    ['success_url', successUrl],
    ['cancel_url', cancelUrl],
    ['client_reference_id', userId],
    ['line_items[0][price]', priceId],
    ['line_items[0][quantity]', '1'],
    ['metadata[luna_user_id]', userId],
    ['metadata[luna_email]', email],
    ['metadata[luna_period]', period],
  ];
  if (existingCustomerId) {
    fields.push(['customer', String(existingCustomerId)]);
  } else {
    fields.push(['customer_email', email]);
  }
  return appendCheckoutTrialFields(fields, trialDays);
};
