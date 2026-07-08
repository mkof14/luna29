/**
 * Task 7 + Task 8 — Selective Luna Live memory write pipeline.
 *
 * Two-gate model:
 *   Gate A: server feature flag LUNA_LIVE_MEMORY_WRITE_ENABLED (default OFF)
 *   Gate B: authenticated per-user memory consent (default OFF)
 * Write only when both are enabled. Consent uncertainty → no write.
 *
 * Chat success is independent of memory write success.
 * Uses Task 3 createObservationWithExtraction. No pattern re-eval on unreviewed writes.
 * Request body/query/headers cannot force either gate.
 */
import {
  evaluateMemoryWriteEligibility,
  MEMORY_GATE_VERSION,
} from './memoryWriteEligibilityService.mjs';
import {
  createObservationWithExtraction,
  MAX_OBSERVATION_TEXT_CHARS,
} from './observationSignalsService.mjs';
import { getMemoryConsentForWrite } from './memoryConsentStore.mjs';

export const LUNA_LIVE_MEMORY_WRITE_FLAG = 'LUNA_LIVE_MEMORY_WRITE_ENABLED';
export const MEMORY_WRITE_TIMEOUT_MS = 14_000;
export const CLIENT_MESSAGE_ID_MAX = 80;
export const CLIENT_MESSAGE_ID_RE = /^[A-Za-z0-9_-]{8,80}$/;

/** Opaque client message id for idempotency only — not ownership. */
export const validateClientMessageId = (value) => {
  if (value === undefined || value === null || value === '') {
    return { ok: false, reason: 'missing_id' };
  }
  if (typeof value !== 'string') return { ok: false, reason: 'invalid_id' };
  const id = value.trim();
  if (id.length < 8 || id.length > CLIENT_MESSAGE_ID_MAX) return { ok: false, reason: 'invalid_id' };
  if (!CLIENT_MESSAGE_ID_RE.test(id)) return { ok: false, reason: 'invalid_id' };
  return { ok: true, id };
};

/**
 * Server-controlled flag. Request body/query/headers cannot set this.
 * Default OFF (including production) until ops explicitly enables.
 */
export const isLunaLiveMemoryWriteEnabled = (env = process.env) => {
  const raw = String(env?.[LUNA_LIVE_MEMORY_WRITE_FLAG] ?? '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
};

const withTimeout = (promise, ms) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error('memory_write_timeout');
      err.code = 'memory_write_timeout';
      reject(err);
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });

const safeMeta = (partial) => ({
  memory_write_status: partial.status || 'failed',
  eligible: Boolean(partial.eligible),
  gate_reason: partial.gate_reason || null,
  matched_domain_count: Number(partial.matched_domain_count) || 0,
  observation_created: Boolean(partial.observation_created),
  signal_count: Number(partial.signal_count) || 0,
  extraction_status: partial.extraction_status || null,
  gate_version: MEMORY_GATE_VERSION,
});

/**
 * Best-effort selective memory write for authenticated Luna Live.
 * Never throws to caller — returns safe status object.
 *
 * @param {object} opts
 * @param {object} opts.store - personal events store
 * @param {object} [opts.consentStore] - memory consent store (required for Gate B)
 * @param {string} opts.userId - authenticated session user id only
 */
export const attemptLunaLiveMemoryWrite = async ({
  store,
  consentStore = null,
  userId,
  text,
  mode,
  language,
  inputMode,
  clientMessageId,
  generateContent,
  env = process.env,
  timeoutMs = MEMORY_WRITE_TIMEOUT_MS,
} = {}) => {
  const started = Date.now();
  try {
    // Gate A — server feature flag
    if (!isLunaLiveMemoryWriteEnabled(env)) {
      return safeMeta({ status: 'feature_disabled', eligible: false, gate_reason: 'flag_disabled' });
    }
    if (!store || !userId) {
      return safeMeta({ status: 'store_unavailable', eligible: false, gate_reason: 'missing_store_or_user' });
    }

    // Gate B — per-user memory consent (fail closed on uncertainty)
    const consent = await getMemoryConsentForWrite(consentStore, userId);
    if (!consent.available) {
      return safeMeta({
        status: 'consent_unavailable',
        eligible: false,
        gate_reason: consent.reason || 'consent_unavailable',
      });
    }
    if (!consent.enabled) {
      return safeMeta({
        status: 'consent_disabled',
        eligible: false,
        gate_reason: 'consent_disabled',
      });
    }

    const idCheck = validateClientMessageId(clientMessageId);
    if (!idCheck.ok) {
      return safeMeta({
        status: idCheck.reason,
        eligible: false,
        gate_reason: idCheck.reason,
      });
    }

    const gate = evaluateMemoryWriteEligibility({
      text,
      mode,
      source_surface: 'luna_live',
      language,
    });

    if (!gate.eligible) {
      return safeMeta({
        status: 'ineligible',
        eligible: false,
        gate_reason: gate.reason,
        matched_domain_count: gate.matched_domains?.length || 0,
      });
    }

    const boundedText = String(text || '').trim().slice(0, MAX_OBSERVATION_TEXT_CHARS);
    const resolvedInputMode =
      inputMode === 'voice_transcript' || inputMode === 'voice' ? 'voice_transcript' : 'text';

    const writePromise = createObservationWithExtraction({
      store,
      userId,
      extract: true,
      generateContent,
      input: {
        raw_text: boundedText,
        observation_kind: 'luna_live_message',
        input_mode: resolvedInputMode,
        source_surface: 'luna_live',
        language: language || 'en',
        transcript_status: resolvedInputMode === 'voice_transcript' ? 'final' : 'not_applicable',
        client_event_id: `luna_live:${idCheck.id}`,
        source: 'api',
        // Gate metadata only — no matched raw fragments.
        memory_gate_version: gate.gate_version,
        memory_gate_reason: gate.reason,
        matched_domains: gate.matched_domains,
      },
    });

    const result = await withTimeout(writePromise, timeoutMs);

    if (result?.error && result.status === 400) {
      return safeMeta({
        status: 'failed',
        eligible: true,
        gate_reason: gate.reason,
        matched_domain_count: gate.matched_domains.length,
        observation_created: false,
        extraction_status: 'failed',
      });
    }

    const extractionStatus = result?.extraction?.status || 'unknown';
    const signalCount = Array.isArray(result?.signals) ? result.signals.length : 0;
    const observationCreated = Boolean(result?.observation?.id);
    const alreadyExists = result?.created === false && observationCreated;

    let status = alreadyExists ? 'already_exists' : 'written';
    if (extractionStatus === 'failed') status = 'extraction_failed';
    else if (extractionStatus === 'completed' && signalCount === 0) status = 'extraction_empty';
    else if (extractionStatus === 'already_extracted' && alreadyExists) status = 'already_exists';
    else if (extractionStatus === 'already_extracted') status = 'written';
    else if (extractionStatus === 'completed' && observationCreated) status = alreadyExists ? 'already_exists' : 'written';

    return {
      ...safeMeta({
        status,
        eligible: true,
        gate_reason: gate.reason,
        matched_domain_count: gate.matched_domains.length,
        observation_created: observationCreated,
        signal_count: signalCount,
        extraction_status: extractionStatus,
      }),
      latency_ms: Date.now() - started,
      // Internal only — not returned to client by apiHandler.
      _observation_id: result?.observation?.id || null,
      _created: Boolean(result?.created),
    };
  } catch (error) {
    const code = error?.code || (error instanceof Error ? error.message : 'failed');
    const status =
      code === 'memory_write_timeout'
        ? 'failed'
        : /unavailable|PERSONAL_EVENT_STORE|CONSENT_STORE/i.test(String(code))
          ? 'store_unavailable'
          : 'failed';
    return {
      ...safeMeta({
        status,
        eligible: false,
        gate_reason: status === 'store_unavailable' ? 'store_unavailable' : 'exception',
      }),
      latency_ms: Date.now() - started,
    };
  }
};

/** Safe operational log payload — no health content. */
export const summarizeMemoryWriteForLogs = (meta) => ({
  memory_write_status: meta?.memory_write_status || 'none',
  eligible: Boolean(meta?.eligible),
  gate_reason: meta?.gate_reason || null,
  matched_domain_count: Number(meta?.matched_domain_count) || 0,
  observation_created: Boolean(meta?.observation_created),
  signal_count: Number(meta?.signal_count) || 0,
  extraction_status: meta?.extraction_status || null,
  latency_ms: meta?.latency_ms ?? null,
});
