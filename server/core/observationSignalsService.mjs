/**
 * Task 3 — structured observation + signal extraction foundation.
 *
 * Layers:
 * A. SOURCE OBSERVATION (event_type: observation) — what the user said
 * B. EXTRACTED SIGNAL (event_type: signal) — AI candidate, user_status=unreviewed
 * C. USER CORRECTION — confirm / reject / correct without erasing provenance
 *
 * Does NOT reuse unsafe check-in 1–5 score extraction as health-signal authority.
 */
import { GoogleGenAI } from '@google/genai';
import {
  EXTRACTOR_VERSION,
  MAX_OBSERVATION_TEXT_CHARS,
  MAX_SIGNALS_PER_OBSERVATION,
  OBSERVATION_KINDS,
  INPUT_MODES,
  SOURCE_SURFACES,
  SIGNAL_USER_STATUSES,
  TEMPORAL_KINDS,
  isAllowedSignalType,
  isAllowedSubtype,
  normalizeSignalType,
  normalizeSubtype,
  clampConfidence,
  sanitizeEvidenceText,
  sanitizeDisplayLabel,
} from './signalTaxonomy.mjs';

export { EXTRACTOR_VERSION, MAX_OBSERVATION_TEXT_CHARS };
export const MAX_RAW_TEXT_CHARS = MAX_OBSERVATION_TEXT_CHARS;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const GEMINI_MODEL = String(process.env.GEMINI_VOICE_MODEL || 'gemini-2.5-flash').trim();
const GEMINI_MODEL_FALLBACKS = [GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-2.0-flash'].filter(
  (model, index, list) => model && list.indexOf(model) === index,
);

const EXTRACTION_TIMEOUT_MS = 12_000;
const MAX_RETRIES = 1;
const MAX_LIST_SAFE = 200;

export const OBSERVATION_EVENT_TYPE = 'observation';
export const SIGNAL_EVENT_TYPE = 'signal';

/** Test-only injectable Gemini stub. Never used in production paths unless set. */
let generateContentOverride = null;

const SIGNAL_EXTRACTION_SYSTEM_PROMPT = `You are Luna29's factual signal extractor for women's self-observation.
Extract ONLY what the user explicitly expressed. Return ONLY valid JSON (no markdown).

Schema:
{
  "signals": [
    {
      "signal_type": "sleep|energy|mood|cycle|symptom|body_sensation|stress|medication_context",
      "normalized_value": "allowed subtype or null",
      "display_label": "short human label",
      "confidence": 0.0-1.0,
      "evidence_text": "short quote or paraphrase from user text",
      "temporal_context": {
        "expression": "user's temporal words or null",
        "kind": "point|duration|recurrence|relative|vague|null",
        "normalized": { "value": number|null, "unit": "day|hour|week|month|null" } | null,
        "confidence": 0.0-1.0
      } | null,
      "severity": "mild|moderate|severe|null",
      "frequency_context": "string or null",
      "recurrence_marker": true|false,
      "negated": true|false,
      "uncertain": true|false
    }
  ]
}

Rules:
- Extract candidate self-observation signals only. Never diagnose.
- Never invent causes, correlations, hormone levels, lab results, or treatments.
- Preserve negation: "I'm not tired" → energy/fatigue with negated=true (do NOT assert fatigue as positive fact).
- Preserve uncertainty: "maybe", "I think", "might" → uncertain=true.
- Preserve recurrence language like "again" → recurrence_marker=true.
- Preserve temporal language without inventing dates. "recently" stays vague (kind=vague).
- "for three days" → kind=duration, normalized value=3 unit=day when clear.
- If the user asserts a medical diagnosis (e.g. "my thyroid is failing"), do NOT store it as a medical fact. Prefer empty signals, or at most a cautious symptom/body_sensation mention of concern with uncertain=true if clearly about felt experience — never invent labs.
- Workplace anger or ordinary life emotion is not automatically a medical mood disorder. Only extract mood when the user describes their felt state in a way that fits the taxonomy.
- If nothing eligible is present, return {"signals":[]}.
- Prefer allowed subtypes. If unsure of subtype, set normalized_value null and keep a safe display_label.
- Do not invent signal_type values outside the allowed list.
- evidence_text must stay short and grounded in the source.`;

const safeText = (value, max = 240) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, max);
};

const parseJsonObject = (raw) => {
  const text = String(raw || '').trim();
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const withTimeout = (promise, ms) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error('extraction_timeout');
      err.code = 'EXTRACTION_TIMEOUT';
      reject(err);
    }, ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

const normalizeTemporalContext = (raw) => {
  if (raw == null) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;
  const expression = safeText(raw.expression || '', 120) || null;
  let kind = safeText(raw.kind || '', 40).toLowerCase() || null;
  if (kind && !TEMPORAL_KINDS.has(kind)) kind = 'vague';
  let normalized = null;
  if (raw.normalized && typeof raw.normalized === 'object' && !Array.isArray(raw.normalized)) {
    const value = Number(raw.normalized.value);
    const unit = safeText(raw.normalized.unit || '', 20).toLowerCase() || null;
    const allowedUnits = new Set(['day', 'hour', 'week', 'month']);
    if (Number.isFinite(value) && unit && allowedUnits.has(unit)) {
      normalized = { value, unit };
    }
  }
  return {
    expression,
    kind,
    normalized,
    confidence: clampConfidence(raw.confidence, 0.5),
  };
};

/**
 * Normalize a single AI signal candidate. Rejects unsupported types.
 * symptom / body_sensation may keep a constrained free label when subtype unknown.
 */
export const normalizeExtractedSignalCandidate = (raw, { sourceObservationId }) => {
  if (!raw || typeof raw !== 'object') {
    return { error: 'signal_not_object' };
  }
  const signalType = normalizeSignalType(raw.signal_type || raw.type);
  if (!isAllowedSignalType(signalType)) {
    return { error: 'unsupported_signal_type' };
  }

  let normalizedValue = normalizeSubtype(raw.normalized_value || raw.subtype || raw.value);
  if (normalizedValue && !isAllowedSubtype(signalType, normalizedValue)) {
    if (signalType === 'symptom' || signalType === 'body_sensation') {
      normalizedValue = safeText(String(raw.normalized_value || raw.subtype || ''), 80) || null;
    } else {
      normalizedValue = null;
    }
  }

  const displayLabel =
    sanitizeDisplayLabel(raw.display_label || raw.label || normalizedValue || signalType) || signalType;
  const evidenceText = sanitizeEvidenceText(raw.evidence_text || raw.evidence || '');
  const confidence = clampConfidence(raw.confidence, 0.5);
  const severityRaw = safeText(raw.severity || '', 32).toLowerCase();
  const severity = ['mild', 'moderate', 'severe'].includes(severityRaw) ? severityRaw : null;
  const frequencyContext = safeText(raw.frequency_context || '', 120) || null;
  const recurrenceMarker = Boolean(raw.recurrence_marker || raw.recurrence);
  const negated = Boolean(raw.negated);
  const uncertain = Boolean(raw.uncertain);
  const temporalContext = normalizeTemporalContext(raw.temporal_context);

  return {
    signal: {
      signal_type: signalType,
      normalized_value: normalizedValue,
      display_label: displayLabel,
      source_observation_id: sourceObservationId,
      extraction_method: 'gemini_structured_v1',
      extractor_version: EXTRACTOR_VERSION,
      confidence,
      evidence_text: evidenceText,
      temporal_context: temporalContext,
      severity,
      frequency_context: frequencyContext,
      recurrence_marker: recurrenceMarker,
      negated,
      uncertain,
      user_status: 'unreviewed',
      original_extraction: null,
      correction: null,
    },
  };
};

export const validateExtractionPayload = (parsed, { sourceObservationId }) => {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, reason: 'malformed_extraction', signals: [] };
  }
  if (!Array.isArray(parsed.signals)) {
    return { ok: false, reason: 'malformed_extraction', signals: [] };
  }

  const signals = [];
  const rejected = [];
  for (const item of parsed.signals.slice(0, MAX_SIGNALS_PER_OBSERVATION)) {
    const normalized = normalizeExtractedSignalCandidate(item, { sourceObservationId });
    if (normalized.error) {
      rejected.push(normalized.error);
      continue;
    }
    signals.push(normalized.signal);
  }

  if (parsed.signals.length > 0 && signals.length === 0) {
    return { ok: false, reason: 'all_signals_rejected', signals: [], rejected };
  }

  return { ok: true, reason: 'ok', signals, rejected };
};

/**
 * Call Gemini for structured signal extraction.
 * Injectable via options.generateContent or __setGenerateContentForTests (no live Gemini in unit tests).
 */
export const runSignalExtraction = async (rawText, { language = 'en', generateContent } = {}) => {
  const text = String(rawText || '').trim().slice(0, MAX_OBSERVATION_TEXT_CHARS);
  if (!text) {
    return { ok: false, reason: 'empty_text', signals: [], provider: 'none' };
  }

  const usingMock =
    typeof generateContent === 'function' || typeof generateContentOverride === 'function';

  const invoke =
    typeof generateContent === 'function'
      ? generateContent
      : typeof generateContentOverride === 'function'
        ? generateContentOverride
        : async ({ systemPrompt, userText }) => {
            if (!GEMINI_API_KEY) {
              const err = new Error('extractor_unavailable');
              err.code = 'EXTRACTOR_UNAVAILABLE';
              throw err;
            }
            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            let lastError = null;
            for (const model of GEMINI_MODEL_FALLBACKS) {
              try {
                const response = await ai.models.generateContent({
                  model,
                  config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: 'application/json',
                  },
                  contents: [{ role: 'user', parts: [{ text: userText }] }],
                });
                return String(response?.text || '');
              } catch (error) {
                lastError = error;
              }
            }
            throw lastError || new Error('extractor_failed');
          };

  let attempt = 0;
  let lastReason = 'extraction_failed';
  while (attempt <= MAX_RETRIES) {
    attempt += 1;
    try {
      const rawResponse = await withTimeout(
        invoke({
          systemPrompt: SIGNAL_EXTRACTION_SYSTEM_PROMPT,
          userText: `Language hint: ${language}\n\nUser observation:\n${text}`,
        }),
        EXTRACTION_TIMEOUT_MS,
      );
      const parsed = parseJsonObject(rawResponse);
      if (!parsed) {
        lastReason = 'malformed_extraction';
        continue;
      }
      return {
        ok: true,
        reason: 'ok',
        parsed,
        provider: usingMock ? 'mock' : 'gemini',
      };
    } catch (error) {
      if (error?.code === 'EXTRACTION_TIMEOUT' || error?.message === 'extraction_timeout') {
        return { ok: false, reason: 'extraction_timeout', signals: [], provider: 'none' };
      }
      if (error?.code === 'EXTRACTOR_UNAVAILABLE') {
        return { ok: false, reason: 'extractor_unavailable', signals: [], provider: 'none' };
      }
      lastReason = 'extraction_failed';
    }
  }
  return { ok: false, reason: lastReason, signals: [], provider: 'none' };
};

const signalClientEventId = (observationId, index) => `sig:${observationId}:${index}:${EXTRACTOR_VERSION}`;

const updateObservationExtractionMeta = async (store, userId, observationEvent, patch) => {
  if (typeof store.updatePayload !== 'function') {
    return observationEvent;
  }
  try {
    const payload = {
      ...(observationEvent.payload || {}),
      extraction: {
        ...((observationEvent.payload && observationEvent.payload.extraction) || {}),
        ...patch,
        extractor_version: EXTRACTOR_VERSION,
        updated_at: new Date().toISOString(),
      },
    };
    return await store.updatePayload(userId, observationEvent.id, payload);
  } catch {
    return observationEvent;
  }
};

export const normalizeObservationInput = (raw = {}) => {
  const rawText = String(raw.raw_text || raw.text || '').trim();
  if (!rawText) return { error: 'raw_text is required.' };
  if (rawText.length > MAX_OBSERVATION_TEXT_CHARS) {
    return { error: `raw_text exceeds ${MAX_OBSERVATION_TEXT_CHARS} characters.` };
  }

  const observationKind = safeText(raw.observation_kind || raw.kind || 'note', 40).toLowerCase();
  if (!OBSERVATION_KINDS.has(observationKind)) {
    return { error: 'Invalid observation_kind.' };
  }

  const inputMode = safeText(raw.input_mode || raw.mode || 'text', 40).toLowerCase();
  if (!INPUT_MODES.has(inputMode)) {
    return { error: 'Invalid input_mode.' };
  }

  const sourceSurface = safeText(raw.source_surface || raw.surface || 'other', 40).toLowerCase();
  if (!SOURCE_SURFACES.has(sourceSurface)) {
    return { error: 'Invalid source_surface.' };
  }

  const language = safeText(raw.language || raw.lang || 'en', 16) || 'en';
  const transcriptStatus =
    inputMode === 'voice_transcript'
      ? safeText(raw.transcript_status || 'final', 40) || 'final'
      : raw.transcript_status
        ? safeText(raw.transcript_status, 40)
        : null;

  const occurredAt =
    typeof raw.occurred_at === 'string' && Number.isFinite(Date.parse(raw.occurred_at))
      ? new Date(raw.occurred_at).toISOString()
      : new Date().toISOString();

  const clientEventId = safeText(raw.client_event_id || raw.id || '', 120) || null;
  const sessionId = safeText(raw.session_id || '', 120) || null;
  const originalEventId = safeText(raw.original_event_id || '', 120) || null;

  return {
    observation: {
      event_type: OBSERVATION_EVENT_TYPE,
      occurred_at: occurredAt,
      source: safeText(raw.source || 'api', 40) || 'api',
      schema_version: 1,
      client_event_id: clientEventId,
      payload: {
        observation_kind: observationKind,
        raw_text: rawText,
        input_mode: inputMode,
        source_surface: sourceSurface,
        language,
        transcript_status: transcriptStatus,
        original_event_id: originalEventId,
        session_id: sessionId,
        // Task 7 optional memory-gate metadata (never ownership; no matched raw fragments).
        memory_gate_version: safeText(raw.memory_gate_version || '', 40) || null,
        memory_gate_reason: safeText(raw.memory_gate_reason || '', 80) || null,
        matched_domains: Array.isArray(raw.matched_domains)
          ? raw.matched_domains.map((d) => safeText(d, 40)).filter(Boolean).slice(0, 12)
          : null,
        extraction: {
          status: 'pending',
          extractor_version: EXTRACTOR_VERSION,
        },
      },
    },
  };
};

export const listSignalsForObservation = async (store, userId, observationId) => {
  const listed = await store.list(userId, {
    eventType: SIGNAL_EVENT_TYPE,
    limit: MAX_LIST_SAFE,
    offset: 0,
  });
  return (listed.events || []).filter(
    (event) => event.payload && event.payload.source_observation_id === observationId,
  );
};

/**
 * Persist observation, run extraction, persist validated signals.
 * Idempotent: re-running for the same observation does not duplicate signals.
 */
export const createObservationWithExtraction = async (storeOrOptions, maybeUserId, maybeInput, maybeOpts) => {
  let store;
  let userId;
  let rawInput;
  let extract = true;
  let generateContent;
  if (storeOrOptions && typeof storeOrOptions === 'object' && storeOrOptions.store) {
    store = storeOrOptions.store;
    userId = storeOrOptions.userId;
    rawInput = storeOrOptions.input || {};
    extract = storeOrOptions.extract !== false;
    generateContent = storeOrOptions.generateContent;
  } else {
    store = storeOrOptions;
    userId = maybeUserId;
    rawInput = maybeInput || {};
    extract = maybeOpts?.extract !== false;
    generateContent = maybeOpts?.generateContent;
  }

  const normalized = normalizeObservationInput(rawInput);
  if (normalized.error) {
    return { error: normalized.error, status: 400 };
  }

  const created = await store.create(userId, normalized.observation);
  const observation = created.event;

  if (!extract) {
    return {
      observation,
      signals: [],
      extraction: { status: 'skipped', reason: 'extract_disabled' },
      created: created.created,
    };
  }

  const existingSignals = await listSignalsForObservation(store, userId, observation.id);
  if (existingSignals.length > 0) {
    return {
      observation,
      signals: existingSignals,
      extraction: {
        status: 'already_extracted',
        reason: 'idempotent_reuse',
        signal_count: existingSignals.length,
      },
      created: created.created,
    };
  }

  const extractionRun = await runSignalExtraction(observation.payload.raw_text, {
    language: observation.payload.language || 'en',
    generateContent,
  });

  if (!extractionRun.ok) {
    const updated = await updateObservationExtractionMeta(store, userId, observation, {
      status: 'failed',
      reason: extractionRun.reason,
      signal_count: 0,
    });
    return {
      observation: updated || observation,
      signals: [],
      extraction: { status: 'failed', reason: extractionRun.reason },
      created: created.created,
    };
  }

  const validated = validateExtractionPayload(extractionRun.parsed, {
    sourceObservationId: observation.id,
  });

  if (!validated.ok) {
    const updated = await updateObservationExtractionMeta(store, userId, observation, {
      status: 'failed',
      reason: validated.reason,
      signal_count: 0,
    });
    return {
      observation: updated || observation,
      signals: [],
      extraction: { status: 'failed', reason: validated.reason },
      created: created.created,
    };
  }

  const persistedSignals = [];
  const persistErrors = [];
  for (let i = 0; i < validated.signals.length; i += 1) {
    const signalPayload = validated.signals[i];
    try {
      const result = await store.create(userId, {
        event_type: SIGNAL_EVENT_TYPE,
        occurred_at: observation.occurred_at,
        source: 'system',
        schema_version: 1,
        client_event_id: signalClientEventId(observation.id, i),
        payload: signalPayload,
      });
      persistedSignals.push(result.event);
    } catch {
      persistErrors.push(i);
    }
  }

  if (persistErrors.length > 0) {
    const updated = await updateObservationExtractionMeta(store, userId, observation, {
      status: 'partial_failure',
      reason: 'signal_persist_failed',
      signal_count: persistedSignals.length,
    });
    return {
      observation: updated || observation,
      signals: persistedSignals,
      extraction: {
        status: 'partial_failure',
        reason: 'signal_persist_failed',
        signal_count: persistedSignals.length,
      },
      created: created.created,
      error: 'Signal persistence partially failed.',
      status: 500,
    };
  }

  const updated = await updateObservationExtractionMeta(store, userId, observation, {
    status: 'completed',
    reason: 'ok',
    signal_count: persistedSignals.length,
    provider: extractionRun.provider,
  });

  return {
    observation: updated || observation,
    signals: persistedSignals,
    extraction: {
      status: 'completed',
      reason: 'ok',
      signal_count: persistedSignals.length,
      provider: extractionRun.provider,
    },
    created: created.created,
  };
};

export const listObservationsForUser = async (store, userId, { since, until, limit = 50, offset = 0 } = {}) =>
  store.list(userId, {
    eventType: OBSERVATION_EVENT_TYPE,
    since,
    until,
    limit,
    offset,
  });

export const listSignalsForUser = async (
  store,
  userId,
  { since, until, limit = 50, offset = 0, signalType, userStatus, sourceObservationId } = {},
) => {
  const listed = await store.list(userId, {
    eventType: SIGNAL_EVENT_TYPE,
    since,
    until,
    limit: MAX_LIST_SAFE,
    offset: 0,
  });
  let events = listed.events || [];
  if (signalType) {
    events = events.filter((e) => e.payload?.signal_type === signalType);
  }
  if (userStatus) {
    events = events.filter((e) => e.payload?.user_status === userStatus);
  }
  if (sourceObservationId) {
    events = events.filter((e) => e.payload?.source_observation_id === sourceObservationId);
  }
  const total = events.length;
  const sliced = events.slice(offset, offset + limit);
  return { events: sliced, total, limit, offset };
};

const captureOriginalExtraction = (payload) => {
  if (payload.original_extraction) return payload.original_extraction;
  return {
    signal_type: payload.signal_type,
    normalized_value: payload.normalized_value,
    display_label: payload.display_label,
    confidence: payload.confidence,
    evidence_text: payload.evidence_text,
    temporal_context: payload.temporal_context,
    severity: payload.severity,
    frequency_context: payload.frequency_context,
    recurrence_marker: payload.recurrence_marker,
    negated: payload.negated,
    uncertain: payload.uncertain,
    extractor_version: payload.extractor_version,
    extraction_method: payload.extraction_method,
    captured_at: new Date().toISOString(),
  };
};

export const confirmSignalForUser = async (store, userId, signalId) => {
  const owned = await store.getOwned(userId, signalId);
  if (!owned || owned.event_type !== SIGNAL_EVENT_TYPE || owned.deleted_at) {
    return { error: 'Signal not found.' };
  }
  const now = new Date().toISOString();
  const payload = {
    ...owned.payload,
    original_extraction: captureOriginalExtraction(owned.payload || {}),
    user_status: 'confirmed',
    correction: { action: 'confirm', at: now, corrected_value: null },
    confirmed_at: now,
    rejected_at: null,
  };
  if (!SIGNAL_USER_STATUSES.has(payload.user_status)) {
    return { error: 'Invalid user_status.' };
  }
  const updated = await store.updatePayload(userId, signalId, payload);
  return updated ? { signal: updated } : { error: 'Signal not found.' };
};

export const rejectSignalForUser = async (store, userId, signalId) => {
  const owned = await store.getOwned(userId, signalId);
  if (!owned || owned.event_type !== SIGNAL_EVENT_TYPE || owned.deleted_at) {
    return { error: 'Signal not found.' };
  }
  const now = new Date().toISOString();
  const payload = {
    ...owned.payload,
    original_extraction: captureOriginalExtraction(owned.payload || {}),
    user_status: 'rejected',
    correction: { action: 'reject', at: now, corrected_value: null },
    rejected_at: now,
  };
  const updated = await store.updatePayload(userId, signalId, payload);
  return updated ? { signal: updated } : { error: 'Signal not found.' };
};

export const correctSignalForUser = async (store, userId, signalId, correction = {}) => {
  const owned = await store.getOwned(userId, signalId);
  if (!owned || owned.event_type !== SIGNAL_EVENT_TYPE || owned.deleted_at) {
    return { error: 'Signal not found.' };
  }
  if (!correction || typeof correction !== 'object') {
    return { error: 'correction object is required.' };
  }

  const now = new Date().toISOString();
  const payload = {
    ...owned.payload,
    original_extraction: captureOriginalExtraction(owned.payload || {}),
  };

  const nextType = correction.signal_type
    ? normalizeSignalType(correction.signal_type)
    : payload.signal_type;
  if (!isAllowedSignalType(nextType)) {
    return { error: 'Invalid corrected signal_type.' };
  }

  let nextSubtype =
    correction.normalized_value !== undefined
      ? normalizeSubtype(correction.normalized_value)
      : payload.normalized_value;

  if (nextSubtype && !isAllowedSubtype(nextType, nextSubtype)) {
    if (nextType === 'symptom' || nextType === 'body_sensation') {
      nextSubtype = safeText(String(correction.normalized_value || ''), 80) || null;
    } else {
      return { error: 'Invalid corrected normalized_value.' };
    }
  }

  payload.signal_type = nextType;
  payload.normalized_value = nextSubtype;
  if (correction.display_label != null) {
    payload.display_label = sanitizeDisplayLabel(correction.display_label) || payload.display_label;
  }
  if (correction.negated !== undefined) payload.negated = Boolean(correction.negated);
  if (correction.uncertain !== undefined) payload.uncertain = Boolean(correction.uncertain);
  if (correction.severity !== undefined) {
    const sev = correction.severity == null ? null : safeText(String(correction.severity), 32).toLowerCase();
    payload.severity = sev && ['mild', 'moderate', 'severe'].includes(sev) ? sev : null;
  }
  payload.user_status = 'corrected';
  payload.correction = {
    action: 'correct',
    at: now,
    note: typeof correction.note === 'string' ? correction.note.trim().slice(0, 500) : null,
    corrected_value: {
      signal_type: payload.signal_type,
      normalized_value: payload.normalized_value,
      display_label: payload.display_label,
      negated: payload.negated,
      uncertain: payload.uncertain,
      severity: payload.severity,
    },
  };
  payload.corrected_at = now;

  const updated = await store.updatePayload(userId, signalId, payload);
  return updated ? { signal: updated } : { error: 'Signal not found.' };
};

export const __setGenerateContentForTests = (fn) => {
  generateContentOverride = fn;
};

export const __resetGenerateContentForTests = () => {
  generateContentOverride = null;
};
