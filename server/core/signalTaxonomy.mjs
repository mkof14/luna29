/**
 * Task 3 — constrained v1 signal taxonomy for structured observation extraction.
 * Not a medical ontology. No diagnoses. No hormone claims.
 */

export const EXTRACTOR_VERSION = 'observation_signals_v1';

export const OBSERVATION_KINDS = new Set([
  'reflection',
  'voice_reflection',
  'luna_live_message',
  'onboarding_free_text',
  'check_in_text',
  'note',
]);

export const INPUT_MODES = new Set(['text', 'voice_transcript']);

export const SOURCE_SURFACES = new Set([
  'luna_live',
  'voice_reflection',
  'onboarding',
  'today',
  'check_in',
  'other',
]);

export const TRANSCRIPT_STATUSES = new Set([
  'final',
  'interim',
  'unknown',
  'not_applicable',
]);

export const SIGNAL_USER_STATUSES = new Set([
  'unreviewed',
  'confirmed',
  'corrected',
  'rejected',
]);

export const TEMPORAL_KINDS = new Set([
  'point',
  'duration',
  'recurrence',
  'relative',
  'vague',
  'cycle_relative',
]);

export const TEMPORAL_UNITS = new Set([
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'unknown',
]);

/** Top-level signal types → allowed normalized subtypes. */
export const SIGNAL_TAXONOMY = {
  sleep: new Set([
    'poor_sleep',
    'interrupted_sleep',
    'difficulty_falling_asleep',
    'early_waking',
    'short_sleep',
    'excessive_sleepiness',
  ]),
  energy: new Set(['low_energy', 'fatigue', 'energy_drop', 'high_energy']),
  mood: new Set([
    'irritability',
    'anxiety_feeling',
    'sadness',
    'emotional_sensitivity',
    'mood_change',
  ]),
  cycle: new Set([
    'late_period',
    'early_period',
    'missed_period',
    'cycle_irregularity',
    'bleeding_change',
    'cramp_change',
  ]),
  symptom: new Set([
    'headache',
    'cramps',
    'nausea',
    'hot_flash',
    'brain_fog',
    'pain',
    'other_symptom',
  ]),
  body_sensation: new Set([
    'tension',
    'heaviness',
    'restlessness',
    'soreness',
    'other_sensation',
  ]),
  stress: new Set(['high_stress', 'overwhelm', 'tension']),
  medication_context: new Set([
    'medication_started',
    'medication_stopped',
    'medication_changed',
    'medication_missed',
    'medication_mentioned',
  ]),
};

export const SIGNAL_TYPES = new Set(Object.keys(SIGNAL_TAXONOMY));

/** Safe free-label fallback subtypes (only when taxonomy subtype missing). */
export const SAFE_FREE_LABEL_TYPES = new Set(['symptom', 'body_sensation']);

export const MAX_OBSERVATION_TEXT_CHARS = 4000;
export const MAX_OBSERVATION_CHARS = MAX_OBSERVATION_TEXT_CHARS;
export const MAX_EVIDENCE_CHARS = 400;
export const MAX_SIGNALS_PER_OBSERVATION = 20;
export const MAX_DISPLAY_LABEL_CHARS = 120;
export const MAX_FREE_LABEL_CHARS = 80;

export const isAllowedSignalType = (signalType) => SIGNAL_TYPES.has(String(signalType || ''));

export const isAllowedSubtype = (signalType, subtype) => {
  const set = SIGNAL_TAXONOMY[signalType];
  if (!set) return false;
  if (subtype == null || subtype === '') return true;
  return set.has(String(subtype));
};

export const normalizeSignalType = (value) => {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return isAllowedSignalType(raw) ? raw : null;
};

export const normalizeSubtype = (value) => {
  if (value == null || value === '') return null;
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .slice(0, MAX_FREE_LABEL_CHARS);
};

export const clampConfidence = (value, fallback = 0.5) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
};

export const sanitizeEvidenceText = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, MAX_EVIDENCE_CHARS);
};

export const sanitizeDisplayLabel = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, MAX_DISPLAY_LABEL_CHARS);
};

export const displayLabelFor = (signalType, subtype) => {
  if (subtype) {
    return String(subtype)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, MAX_DISPLAY_LABEL_CHARS);
  }
  return String(signalType || 'signal')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, MAX_DISPLAY_LABEL_CHARS);
};
