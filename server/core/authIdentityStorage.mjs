/**
 * WS1.2 — Resolve users/sessions storage mode.
 * Postgres when DATABASE_URL is set (except explicit test harness → JSON).
 * JSON for development without DB and for automated tests.
 */

import { hasDatabaseUrl, isProductionLikeRuntime } from './durableStorageGuard.mjs';

/**
 * @returns {'postgres' | 'json' | 'unavailable'}
 */
export const resolveAuthIdentityStorageMode = ({
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
