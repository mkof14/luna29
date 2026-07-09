import { randomBytes } from 'node:crypto';

const REQUEST_ID_RE = /^[A-Za-z0-9._-]{8,128}$/;
const SENSITIVE_HEADER_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'stripe-signature',
  'x-api-key',
  'xi-api-key',
]);

/**
 * Accept only sanitized inbound x-request-id; otherwise generate a cryptographically random id.
 */
export const resolveRequestId = (incoming) => {
  const raw = String(incoming || '').trim();
  if (REQUEST_ID_RE.test(raw) && !/[\r\n]/.test(raw)) {
    return raw;
  }
  return randomBytes(16).toString('hex');
};

export const isSafeRequestId = (value) => REQUEST_ID_RE.test(String(value || '').trim());

/**
 * Structured request completion log. Never includes auth, cookies, bodies, or PII.
 */
export const logRequestComplete = ({
  requestId,
  method,
  route,
  status,
  latencyMs,
  errorCode = null,
  reasonCode = null,
}) => {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  const payload = {
    type: 'http_request',
    request_id: requestId,
    method: String(method || '').toUpperCase(),
    route: String(route || '').slice(0, 200),
    status: Number(status) || 0,
    latency_ms: Math.max(0, Math.round(Number(latencyMs) || 0)),
    ...(errorCode ? { error_code: String(errorCode).slice(0, 80) } : {}),
    ...(reasonCode ? { reason_code: String(reasonCode).slice(0, 80) } : {}),
  };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
};

/** Strip sensitive headers from any diagnostic object (never log these). */
export const redactHeadersForDiagnostics = (headers = {}) => {
  const out = {};
  for (const [key, value] of Object.entries(headers || {})) {
    const lower = String(key).toLowerCase();
    if (SENSITIVE_HEADER_KEYS.has(lower)) continue;
    if (lower.includes('authorization') || lower.includes('cookie') || lower.includes('signature')) continue;
    out[key] = typeof value === 'string' ? value.slice(0, 200) : value;
  }
  return out;
};

export const withTimeout = (promise, ms, code = 'timeout') => {
  const timeoutMs = Math.max(1, Number(ms) || 1);
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(code);
      err.code = code;
      err.name = 'TimeoutError';
      reject(err);
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

export const PROVIDER_TIMEOUT_MS = {
  gemini: Math.max(1000, Number(process.env.GEMINI_TIMEOUT_MS) || 20_000),
  elevenlabs: Math.max(1000, Number(process.env.ELEVENLABS_TIMEOUT_MS) || 15_000),
  dbProbe: Math.max(200, Number(process.env.HEALTH_DB_PROBE_TIMEOUT_MS) || 2_000),
  rateLimitProbe: Math.max(200, Number(process.env.HEALTH_RATE_LIMIT_PROBE_TIMEOUT_MS) || 1_500),
};
