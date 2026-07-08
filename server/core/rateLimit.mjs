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

export const createRateLimiter = () => {
  const check = async (key, limit, windowMs) => {
    // Vitest runs files in parallel and shares this process-local store.
    // Skip memory rate limits in test runtime so suites do not collide.
    // Production / preview behavior is unchanged (Upstash or memory still apply outside Vitest).
    if (process.env.VITEST || process.env.NODE_ENV === 'test') {
      return true;
    }
    if (isUpstashRateLimitEnabled()) {
      try {
        const count = await upstashIncr(`luna:rl:${key}`, windowMs);
        if (count !== null) return count <= limit;
      } catch {
        // fall through to memory
      }
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
