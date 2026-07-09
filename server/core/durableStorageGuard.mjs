/**
 * WS1.1 — Durable storage production guard.
 *
 * Prevents production/preview (and NODE_ENV=production) from silently using
 * JSON /tmp / in-process memory as the authority for critical durable stores
 * when DATABASE_URL is missing.
 *
 * Does NOT migrate stores. When DATABASE_URL is present, legacy JSON paths may
 * still run until WS1 migration — that remaining risk is intentional for this step.
 *
 * personal_events and memory_consent keep their own fail-closed resolvers.
 */

export const DURABLE_STORAGE_UNAVAILABLE = 'DURABLE_STORAGE_UNAVAILABLE';

/** Critical stores that must not silently use JSON/tmp in production-like runtimes. */
export const CRITICAL_DURABLE_STORES = Object.freeze([
  'users',
  'sessions',
  'billing',
  'admin',
  'privacy_requests',
  'mobile_profiles',
  'mobile_state',
  'mobile_reports',
  'mobile_push',
  'calendar',
  'trials',
]);

export const hasDatabaseUrl = (env = process.env) =>
  Boolean(String(env?.DATABASE_URL || '').trim());

/**
 * Production-like = Vercel production/preview OR NODE_ENV=production.
 * Explicit buildApiHandler environment: 'test' does not override prod-like env
 * (same rule as personal_events / memory_consent).
 */
export const isProductionLikeRuntime = (env = process.env) => {
  const vercelEnv = String(env?.VERCEL_ENV || '').trim().toLowerCase();
  const nodeEnv = String(env?.NODE_ENV || '').trim().toLowerCase();
  return (
    vercelEnv === 'production' ||
    vercelEnv === 'preview' ||
    nodeEnv === 'production'
  );
};

/**
 * Decide whether legacy JSON file stores may be used for critical durable data.
 *
 * @returns {{
 *   allowed: boolean,
 *   mode: 'json' | 'unavailable',
 *   reason: string,
 *   category: 'ok' | 'database_missing',
 *   stores: readonly string[],
 * }}
 */
export const resolveDurableJsonStorageDecision = ({
  env = process.env,
  runtimeEnvironment = 'node',
} = {}) => {
  const prodLike = isProductionLikeRuntime(env);
  const dbConfigured = hasDatabaseUrl(env);
  const isExplicitTestHarness = runtimeEnvironment === 'test';

  // Production / preview / NODE_ENV=production: require DATABASE_URL. No JSON/tmp.
  if (prodLike) {
    if (!dbConfigured) {
      return {
        allowed: false,
        mode: 'unavailable',
        reason: 'database_missing',
        category: 'database_missing',
        stores: CRITICAL_DURABLE_STORES,
      };
    }
    // DB present — JSON still used until migration; guard only blocks missing DB.
    return {
      allowed: true,
      mode: 'json',
      reason: 'database_configured',
      category: 'ok',
      stores: CRITICAL_DURABLE_STORES,
    };
  }

  // Isolated test harness or local/dev: JSON allowed without DATABASE_URL.
  if (isExplicitTestHarness || !prodLike) {
    return {
      allowed: true,
      mode: 'json',
      reason: isExplicitTestHarness ? 'test_isolated_json' : 'dev_local_json',
      category: 'ok',
      stores: CRITICAL_DURABLE_STORES,
    };
  }

  return {
    allowed: false,
    mode: 'unavailable',
    reason: 'database_missing',
    category: 'database_missing',
    stores: CRITICAL_DURABLE_STORES,
  };
};

export const durableStorageUnavailablePayload = (decision) => ({
  error: 'Durable storage is unavailable. Production requires a configured database.',
  code: DURABLE_STORAGE_UNAVAILABLE,
  reason: decision?.reason || 'database_missing',
});
