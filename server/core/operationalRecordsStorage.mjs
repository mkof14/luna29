/**
 * WS1.5 — Resolve operational records storage mode
 * (admin invites/audit/workspace, privacy requests, contact submissions).
 * Same production-like semantics as durableStorageGuard / authIdentityStorage.
 */

import { hasDatabaseUrl, isProductionLikeRuntime } from './durableStorageGuard.mjs';

export const OPERATIONAL_RECORDS_UNAVAILABLE = 'OPERATIONAL_RECORDS_UNAVAILABLE';

/**
 * @returns {'postgres' | 'json' | 'unavailable'}
 */
export const resolveOperationalRecordsStorageMode = ({
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

export const operationalRecordsHealthLabel = (mode) => {
  if (mode === 'postgres') return 'ok';
  if (mode === 'json') return 'ok';
  return 'unavailable';
};

export const operationalRecordsStorageModeLabel = (mode) => {
  if (mode === 'postgres') return 'postgres';
  if (mode === 'json') return 'json_dev';
  return 'unavailable';
};

export const operationalRecordsUnavailablePayload = (reason = 'database_missing') => ({
  error: 'Operational records storage is unavailable.',
  code: OPERATIONAL_RECORDS_UNAVAILABLE,
  reason,
});
