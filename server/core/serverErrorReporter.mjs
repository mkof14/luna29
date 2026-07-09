/**
 * Server-side error capture abstraction.
 * Essential reporting must NOT depend on marketing analytics consent.
 * Never attach health payloads, transcripts, OCR text, webhook bodies, or secrets.
 */

const SENSITIVE_KEY_RE =
  /authorization|cookie|password|secret|token|transcript|ocr|prompt|webhook.?body|email|api.?key|signature/i;

const sanitizeContext = (context = {}) => {
  const out = {};
  for (const [key, value] of Object.entries(context || {})) {
    if (SENSITIVE_KEY_RE.test(key)) continue;
    if (value == null) continue;
    if (typeof value === 'string') {
      out[key] = value.slice(0, 200);
      continue;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
      continue;
    }
    // Nested objects: only allow shallow safe primitives already filtered by key.
  }
  return out;
};

let captureHook = null;

/** Optional test/integration hook (e.g. Sentry) — must not receive PII. */
export const __setServerErrorCaptureHook = (fn) => {
  captureHook = typeof fn === 'function' ? fn : null;
};

export const reportServerError = (error, context = {}) => {
  const safe = sanitizeContext(context);
  const message = error instanceof Error ? error.message.slice(0, 300) : String(error || 'unknown').slice(0, 300);
  const name = error instanceof Error ? error.name : 'Error';
  const payload = {
    type: 'server_error',
    name,
    message,
    ...safe,
  };

  // Structured stderr is the minimum durable signal.
  console.error(JSON.stringify(payload));

  if (captureHook) {
    try {
      captureHook({
        message: `${name}: ${message}`,
        context: safe,
        // Never pass raw error objects that may hold request bodies.
      });
    } catch {
      // Swallow reporter failures — never break the request path.
    }
  }
};

/**
 * Normalize API errors for clients.
 * Production: no stack traces. Always include request_id when available.
 */
export const normalizePublicError = ({
  status,
  publicCode,
  reasonCode,
  requestId,
  message,
  isProductionLike,
  error,
}) => {
  const prod = Boolean(isProductionLike);
  const body = {
    error: String(publicCode || (status >= 500 ? 'internal_error' : 'request_error')),
    request_id: requestId || undefined,
  };
  if (reasonCode) body.reason = String(reasonCode).slice(0, 80);
  if (!prod && message) body.message = String(message).slice(0, 300);
  if (!prod && error instanceof Error && error.stack) {
    body.debug = error.stack.split('\n').slice(0, 5);
  }
  return body;
};
