/**
 * WS1.3 — Resolve billing/trial storage mode.
 * Same production-like semantics as durableStorageGuard / authIdentityStorage.
 */

import { hasDatabaseUrl, isProductionLikeRuntime } from './durableStorageGuard.mjs';

export const BILLING_STORAGE_UNAVAILABLE = 'BILLING_STORAGE_UNAVAILABLE';

/**
 * @returns {'postgres' | 'json' | 'unavailable'}
 */
export const resolveBillingStorageMode = ({
  env = process.env,
  runtimeEnvironment = 'node',
} = {}) => {
  const prodLike = isProductionLikeRuntime(env);
  const dbConfigured = hasDatabaseUrl(env);
  const isExplicitTestHarness = runtimeEnvironment === 'test';

  // Isolated unit/integration harness always uses JSON (deterministic, no shared DB).
  if (isExplicitTestHarness) {
    return 'json';
  }

  if (prodLike) {
    return dbConfigured ? 'postgres' : 'unavailable';
  }

  // Local/dev: Postgres when configured, otherwise JSON.
  return dbConfigured ? 'postgres' : 'json';
};

/** Health/readiness label (never secrets). */
export const billingStorageHealthLabel = (mode) => {
  if (mode === 'postgres') return 'postgres';
  if (mode === 'json') return 'json_dev';
  return 'unavailable';
};

export const billingStorageUnavailablePayload = (reason = 'database_missing') => ({
  error: 'Billing storage is unavailable.',
  code: BILLING_STORAGE_UNAVAILABLE,
  reason,
});
