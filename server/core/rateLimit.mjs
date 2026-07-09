/**
 * Durable rate limiting — Upstash/KV in production-like runtimes.
 * Memory fallback is test/dev only; production-like fails closed when backend missing/unavailable.
 */

import { isProductionLikeRuntime } from './durableStorageGuard.mjs';

const memoryStore = new Map();

export const __resetMemoryRateLimitForTests = () => {
  memoryStore.clear();
};

export const getUpstashRestUrl = () =>
  String(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').trim();

export const getUpstashRestToken = () =>
  String(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '').trim();

export const isUpstashRateLimitEnabled = () =>
  Boolean(getUpstashRestUrl() && getUpstashRestToken());

const upstashIncr = async (key, windowMs) => {
  const url = getUpstashRestUrl();
  const token = getUpstashRestToken();
  const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));
  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, ttlSec],
    ]),
  });
  if (!response.ok) return null;
  const data = await response.json();
  const count = Number(data?.[0]?.result);
  return Number.isFinite(count) ? count : null;
};

/**
 * @param {{ env?: NodeJS.ProcessEnv, allowMemoryFallback?: boolean }} [options]
 * allowMemoryFallback: force memory (tests). Production-like never uses memory.
 */
export const createRateLimiter = (options = {}) => {
  const env = options.env || process.env;
  const forceMemory = options.allowMemoryFallback === true;
  const skipVitestBypass = options.skipVitestBypass === true;

  const check = async (key, limit, windowMs) => {
    // Vitest-only bypass: process-local store is shared across parallel test files.
    if (process.env.VITEST && !skipVitestBypass) {
      return true;
    }

    const prodLike = isProductionLikeRuntime(env);
    const useMemory = forceMemory || (!prodLike && !isUpstashRateLimitEnabled());

    if (!useMemory && isUpstashRateLimitEnabled()) {
      try {
        const count = await upstashIncr(`luna:rl:${key}`, windowMs);
        if (count !== null) return count <= limit;
        // Upstash call failed.
        if (prodLike) return false;
      } catch {
        if (prodLike) return false;
      }
    }

    if (prodLike && !forceMemory) {
      // Production-like without durable backend: fail closed.
      return false;
    }

    const now = Date.now();
    const state = memoryStore.get(key);
    if (!state || state.resetAt < now) {
      memoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (state.count >= limit) return false;
    state.count += 1;
    return true;
  };

  return check;
};

export const rateLimitBackendLabel = (env = process.env) => {
  if (isUpstashRateLimitEnabled()) return 'upstash';
  if (isProductionLikeRuntime(env)) return 'unavailable';
  return 'memory';
};
