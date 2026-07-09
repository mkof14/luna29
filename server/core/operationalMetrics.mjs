/**
 * Minimal operational counters / structured events for production ops.
 * Not a dashboard product. No Math.random. Compatible with log aggregation.
 */

const counters = new Map();

const bump = (name, by = 1) => {
  const key = String(name);
  counters.set(key, (counters.get(key) || 0) + by);
  return counters.get(key);
};

export const __resetOperationalMetricsForTests = () => {
  counters.clear();
};

export const getOperationalCounter = (name) => counters.get(String(name)) || 0;

export const emitOperationalEvent = (name, fields = {}) => {
  const event = String(name || 'ops_event').slice(0, 80);
  bump(event);
  const payload = {
    type: 'ops_event',
    event,
    count: counters.get(event),
    ts: new Date().toISOString(),
  };
  for (const [key, value] of Object.entries(fields || {})) {
    if (value == null) continue;
    // Never accept known sensitive field names.
    if (/transcript|ocr|prompt|authorization|cookie|email|secret|body|payload/i.test(key)) continue;
    if (typeof value === 'string') payload[key] = value.slice(0, 120);
    else if (typeof value === 'number' || typeof value === 'boolean') payload[key] = value;
  }
  console.info(JSON.stringify(payload));
  return payload;
};

export const OPS = {
  API_5XX: 'api_5xx',
  AUTH_FAILURE: 'auth_failure',
  ENTITLEMENT_DENIAL: 'entitlement_denial',
  RATE_LIMIT_DENIAL: 'rate_limit_denial',
  STRIPE_WEBHOOK_PROCESSED: 'stripe_webhook_processed',
  STRIPE_WEBHOOK_DUPLICATE: 'stripe_webhook_duplicate',
  STRIPE_WEBHOOK_IGNORED: 'stripe_webhook_ignored',
  STRIPE_WEBHOOK_FAILED: 'stripe_webhook_failed',
  STRIPE_WEBHOOK_IN_PROGRESS: 'stripe_webhook_in_progress',
  ACCOUNT_DELETION_STARTED: 'account_deletion_started',
  ACCOUNT_DELETION_EXTERNAL_FAILED: 'account_deletion_external_cleanup_failed',
  ACCOUNT_DELETION_LOCAL_FAILED: 'account_deletion_local_cleanup_failed',
  ACCOUNT_DELETION_COMPLETED: 'account_deletion_completed',
  VOICE_REQUEST: 'voice_request',
  VOICE_SUCCESS: 'voice_success',
  VOICE_FAILURE: 'voice_failure',
  VOICE_LATENCY: 'voice_latency',
  GEMINI_LATENCY: 'gemini_latency',
  ELEVENLABS_LATENCY: 'elevenlabs_latency',
  LABS_OCR_REQUEST: 'labs_ocr_request',
  LABS_OCR_SUCCESS: 'labs_ocr_success',
  LABS_OCR_FAILURE: 'labs_ocr_failure',
  LABS_OCR_LATENCY: 'labs_ocr_latency',
};
