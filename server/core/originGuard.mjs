/**
 * WS4 — Origin validation for cookie-authenticated mutating requests.
 * Bearer mobile flows and Stripe webhooks are not subject to browser Origin rules.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Parse AUTH_ALLOWED_ORIGINS. Production-like requires explicit env (no baked-in prod defaults).
 */
export const resolveAllowedOrigins = ({ env = process.env, productionLike = false } = {}) => {
  const raw = String(env.AUTH_ALLOWED_ORIGINS || '').trim();
  if (raw) {
    const set = new Set(
      raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    );
    return { origins: set, source: 'env', ok: set.size > 0 };
  }
  if (productionLike) {
    return { origins: new Set(), source: 'missing', ok: false };
  }
  // Dev/test defaults only.
  return {
    origins: new Set([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    ]),
    source: 'dev_default',
    ok: true,
  };
};

export const originListHasWildcard = (origins) =>
  [...origins].some((o) => o === '*' || o.includes('*'));

export const originListHasLocalhost = (origins) =>
  [...origins].some((o) => /localhost|127\.0\.0\.1/i.test(o));

/**
 * Whether this request should enforce Origin allowlist.
 * - Safe methods: no
 * - Stripe webhook: no
 * - Bearer Authorization present: no (mobile / non-browser)
 * - Cookie session present on mutating method: yes in productionLike
 */
export const shouldEnforceOrigin = ({
  method,
  pathname,
  hasBearer,
  hasSessionCookie,
  productionLike,
}) => {
  if (!productionLike) return false;
  if (SAFE_METHODS.has(String(method || '').toUpperCase())) return false;
  if (String(pathname || '') === '/api/billing/webhook') return false;
  if (hasBearer) return false;
  if (!hasSessionCookie) return false;
  return true;
};

/**
 * @returns {{ ok: true } | { ok: false, code: 'ORIGIN_NOT_ALLOWED' }}
 */
export const assertOriginAllowed = ({ origin, allowedOrigins }) => {
  const value = String(origin || '').trim();
  if (!value) {
    return { ok: false, code: 'ORIGIN_NOT_ALLOWED', reason: 'origin_missing' };
  }
  if (!allowedOrigins.has(value)) {
    return { ok: false, code: 'ORIGIN_NOT_ALLOWED', reason: 'origin_not_allowlisted' };
  }
  return { ok: true };
};
