/**
 * WS1.6 — Resolve Calendar + Mobile user-data storage mode.
 * Same production-like semantics as billing / operational records.
 */

import { hasDatabaseUrl, isProductionLikeRuntime } from './durableStorageGuard.mjs';

export const USER_DATA_STORAGE_UNAVAILABLE = 'USER_DATA_STORAGE_UNAVAILABLE';

/**
 * @returns {'postgres' | 'json' | 'unavailable'}
 */
export const resolveUserDataStorageMode = ({
  env = process.env,
  runtimeEnvironment = 'node',
} = {}) => {
  const prodLike = isProductionLikeRuntime(env);
  const dbConfigured = hasDatabaseUrl(env);
  const isExplicitTestHarness = runtimeEnvironment === 'test';

  if (isExplicitTestHarness) {
    return 'json';
  }

  if (prodLike) {
    return dbConfigured ? 'postgres' : 'unavailable';
  }

  return dbConfigured ? 'postgres' : 'json';
};

export const userDataHealthLabel = (mode) => {
  if (mode === 'postgres') return 'ok';
  if (mode === 'json') return 'ok';
  return 'unavailable';
};

export const userDataStorageModeLabel = (mode) => {
  if (mode === 'postgres') return 'postgres';
  if (mode === 'json') return 'json_dev';
  return 'unavailable';
};

export const userDataUnavailablePayload = (reason = 'database_missing') => ({
  error: 'User data storage is unavailable.',
  code: USER_DATA_STORAGE_UNAVAILABLE,
  reason,
});
