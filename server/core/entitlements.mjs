/**
 * WS3 — Server-authoritative commercial entitlements.
 * Postgres billing/trial is authority in production; JSON only where storage mode allows.
 * Client status / localStorage / Stripe IDs from the request are never trusted.
 */

export const PREMIUM_REQUIRED = 'PREMIUM_REQUIRED';
export const ENTITLEMENT_STORAGE_UNAVAILABLE = 'ENTITLEMENT_STORAGE_UNAVAILABLE';

/** Statuses that grant premium product + AI access (existing product semantics). */
export const PREMIUM_STATUSES = new Set(['active', 'trialing']);

/**
 * @param {string|null|undefined} status
 */
export const isPremiumStatus = (status) =>
  PREMIUM_STATUSES.has(String(status || '').toLowerCase());

/**
 * Resolve entitlement for an authenticated user from durable billing service only.
 *
 * @param {{
 *   user: { id: string, email?: string },
 *   billingService: { getStatusForUser: Function },
 *   billingStorageMode: string,
 *   allowAdminBypass?: boolean,
 *   isAdmin?: boolean,
 * }} args
 */
export const resolveEntitlement = async ({
  user,
  billingService,
  billingStorageMode,
  allowAdminBypass = false,
  isAdmin = false,
}) => {
  if (!user?.id) {
    return {
      ok: false,
      entitled: false,
      status: 'anonymous',
      reason: 'not_authenticated',
      storageMode: billingStorageMode || 'unknown',
    };
  }

  if (allowAdminBypass && isAdmin) {
    return {
      ok: true,
      entitled: true,
      status: 'admin_bypass',
      reason: 'admin_bypass',
      storageMode: billingStorageMode || 'unknown',
    };
  }

  if (billingStorageMode === 'unavailable') {
    return {
      ok: false,
      entitled: false,
      status: 'unavailable',
      reason: 'entitlement_storage_unavailable',
      storageMode: 'unavailable',
      httpStatus: 503,
      error: ENTITLEMENT_STORAGE_UNAVAILABLE,
    };
  }

  try {
    const payload = await billingService.getStatusForUser(user);
    const status = String(payload?.billing?.status || 'inactive').toLowerCase();
    const entitled = isPremiumStatus(status);
    return {
      ok: true,
      entitled,
      status,
      reason: entitled ? 'premium_ok' : `status_${status || 'inactive'}`,
      plan: payload?.billing?.plan || null,
      trial: payload?.trial || null,
      storageMode: billingStorageMode,
    };
  } catch (error) {
    if (error?.code === 'BILLING_STORAGE_UNAVAILABLE') {
      return {
        ok: false,
        entitled: false,
        status: 'unavailable',
        reason: 'entitlement_storage_unavailable',
        storageMode: 'unavailable',
        httpStatus: 503,
        error: ENTITLEMENT_STORAGE_UNAVAILABLE,
      };
    }
    return {
      ok: false,
      entitled: false,
      status: 'error',
      reason: 'entitlement_resolve_failed',
      storageMode: billingStorageMode || 'unknown',
      httpStatus: 503,
      error: ENTITLEMENT_STORAGE_UNAVAILABLE,
    };
  }
};

export const premiumRequiredPayload = (reason = 'premium_required') => ({
  error: PREMIUM_REQUIRED,
  reason: String(reason || 'premium_required').slice(0, 80),
});

export const entitlementUnavailablePayload = () => ({
  error: ENTITLEMENT_STORAGE_UNAVAILABLE,
});
