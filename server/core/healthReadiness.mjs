/**
 * Public liveness vs protected readiness probes.
 * Bounded timeouts. No secrets, no provider spend, no fake metrics.
 */

import { withTimeout, PROVIDER_TIMEOUT_MS } from './requestObservability.mjs';
import { isProductionLikeRuntime, hasDatabaseUrl } from './durableStorageGuard.mjs';
import { rateLimitBackendLabel, isUpstashRateLimitEnabled, getUpstashRestUrl } from './rateLimit.mjs';
import { PROCESSING_RECLAIM_MS } from './stripeWebhookEventsStore.mjs';

export const buildLivenessPayload = () => ({
  ok: true,
  service: 'luna-auth-api',
  status: 'alive',
  timestamp: new Date().toISOString(),
  uptimeSec: Math.floor(process.uptime()),
});

/**
 * Bounded SELECT 1 against shared pool. Never returns connection strings.
 */
export const probePostgres = async ({ getPoolStatus, timeoutMs = PROVIDER_TIMEOUT_MS.dbProbe } = {}) => {
  if (!hasDatabaseUrl(process.env)) {
    return { status: 'unavailable', reason: 'database_missing' };
  }
  try {
    const result = await withTimeout(
      (async () => {
        const status = await getPoolStatus();
        if (!status?.pool || status.category !== 'ok') {
          return { status: 'unavailable', reason: status?.category || 'pool_unavailable' };
        }
        await status.pool.query('SELECT 1');
        return { status: 'ok' };
      })(),
      timeoutMs,
      'db_probe_timeout',
    );
    return result;
  } catch (error) {
    const code = error?.code || error?.name;
    if (code === 'db_probe_timeout' || error?.name === 'TimeoutError') {
      return { status: 'unavailable', reason: 'timeout' };
    }
    return { status: 'unavailable', reason: 'query_failed' };
  }
};

/**
 * Non-destructive Upstash ping: GET base URL with auth. No INCR mutation.
 */
export const probeRateLimiter = async ({ timeoutMs = PROVIDER_TIMEOUT_MS.rateLimitProbe } = {}) => {
  const backend = rateLimitBackendLabel(process.env);
  if (backend === 'memory') {
    return { status: isProductionLikeRuntime(process.env) ? 'unavailable' : 'ok', backend: 'memory' };
  }
  if (backend === 'unavailable' || !isUpstashRateLimitEnabled()) {
    return { status: 'unavailable', backend: 'unavailable' };
  }
  const url = getUpstashRestUrl();
  try {
    const result = await withTimeout(
      (async () => {
        const token = String(
          process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '',
        ).trim();
        const response = await fetch(`${url}/ping`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        // Accept 200 or Upstash-style success; treat network/auth failure as unavailable.
        if (response.ok) return { status: 'ok', backend: 'upstash' };
        // Some Upstash REST gateways use POST-only; a 404/405 still proves reachability + auth path.
        if (response.status === 404 || response.status === 405) {
          return { status: 'ok', backend: 'upstash' };
        }
        return { status: 'unavailable', backend: 'upstash' };
      })(),
      timeoutMs,
      'rate_limit_probe_timeout',
    );
    return result;
  } catch {
    return { status: 'unavailable', backend: 'upstash' };
  }
};

export const stripeConfigReadiness = ({ billingEnabled, stripeConfigReady }) => {
  if (!billingEnabled) return 'disabled';
  return stripeConfigReady ? 'configured' : 'incomplete';
};

export const geminiConfigReadiness = () => {
  const key = String(process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();
  return key ? 'configured' : 'unconfigured';
};

export const elevenLabsConfigReadiness = () => {
  const key = String(process.env.ELEVENLABS_API_KEY || '').trim();
  return key ? 'configured' : 'unconfigured';
};

/**
 * Table reachability: SELECT 1 FROM table LIMIT 0 (or EXISTS via simple query).
 */
export const probeTableReachable = async (pool, tableName, timeoutMs = PROVIDER_TIMEOUT_MS.dbProbe) => {
  if (!pool) return 'unavailable';
  const safeTable = String(tableName || '').replace(/[^a-z0-9_]/gi, '');
  if (!safeTable) return 'unavailable';
  try {
    await withTimeout(
      pool.query(`SELECT 1 FROM ${safeTable} LIMIT 0`),
      timeoutMs,
      'table_probe_timeout',
    );
    return 'ok';
  } catch {
    return 'unavailable';
  }
};

export const isVerboseHealthAuthorized = ({
  wantVerbose,
  verboseKey,
  healthVerboseSecret,
  env = process.env,
}) => {
  if (!wantVerbose) return false;
  if (!isProductionLikeRuntime(env)) return true;
  return Boolean(healthVerboseSecret && verboseKey && verboseKey === healthVerboseSecret);
};

export const staleProcessingThresholdMs = () => PROCESSING_RECLAIM_MS;
