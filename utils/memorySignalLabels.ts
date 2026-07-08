export { MEMORY_COPY } from './memoryCopy';
/**
 * Human-readable labels for Memory UI (Task 8).
 * Constrained to server signal taxonomy — no invented medical values.
 */

/** Mirrors server/core/signalTaxonomy.mjs SIGNAL_TAXONOMY for correction UI. */
export const MEMORY_SIGNAL_TAXONOMY: Record<string, readonly string[]> = {
  sleep: [
    'poor_sleep',
    'interrupted_sleep',
    'difficulty_falling_asleep',
    'early_waking',
    'short_sleep',
    'excessive_sleepiness',
  ],
  energy: ['low_energy', 'fatigue', 'energy_drop', 'high_energy'],
  mood: [
    'irritability',
    'anxiety_feeling',
    'sadness',
    'emotional_sensitivity',
    'mood_change',
  ],
  cycle: [
    'late_period',
    'early_period',
    'missed_period',
    'cycle_irregularity',
    'bleeding_change',
    'cramp_change',
  ],
  symptom: [
    'headache',
    'cramps',
    'nausea',
    'hot_flash',
    'brain_fog',
    'pain',
    'other_symptom',
  ],
  body_sensation: [
    'tension',
    'heaviness',
    'restlessness',
    'soreness',
    'other_sensation',
  ],
  stress: ['high_stress', 'overwhelm', 'tension'],
  medication_context: [
    'medication_started',
    'medication_stopped',
    'medication_changed',
    'medication_missed',
    'medication_mentioned',
  ],
};

const TYPE_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  energy: 'Energy',
  mood: 'Mood',
  cycle: 'Cycle',
  symptom: 'Symptom',
  body_sensation: 'Body sensation',
  stress: 'Stress',
  medication_context: 'Medication context',
};

const VALUE_LABELS: Record<string, string> = {
  poor_sleep: 'Poor sleep',
  interrupted_sleep: 'Interrupted sleep',
  difficulty_falling_asleep: 'Difficulty falling asleep',
  early_waking: 'Early waking',
  short_sleep: 'Short sleep',
  excessive_sleepiness: 'Excessive sleepiness',
  low_energy: 'Low energy',
  fatigue: 'Fatigue',
  energy_drop: 'Energy drop',
  high_energy: 'High energy',
  irritability: 'Irritability',
  anxiety_feeling: 'Anxiety feeling',
  sadness: 'Sadness',
  emotional_sensitivity: 'Emotional sensitivity',
  mood_change: 'Mood change',
  late_period: 'Late period',
  early_period: 'Early period',
  missed_period: 'Missed period',
  cycle_irregularity: 'Cycle irregularity',
  bleeding_change: 'Bleeding change',
  cramp_change: 'Cramp change',
  headache: 'Headache',
  cramps: 'Cramps',
  nausea: 'Nausea',
  hot_flash: 'Hot flash',
  brain_fog: 'Brain fog',
  pain: 'Pain',
  other_symptom: 'Other symptom',
  tension: 'Tension',
  heaviness: 'Heaviness',
  restlessness: 'Restlessness',
  soreness: 'Soreness',
  other_sensation: 'Other sensation',
  high_stress: 'High stress',
  overwhelm: 'Overwhelm',
  medication_started: 'Medication started',
  medication_stopped: 'Medication stopped',
  medication_changed: 'Medication changed',
  medication_missed: 'Medication missed',
  medication_mentioned: 'Medication mentioned',
};

export const humanizeSignalType = (signalType: string | null | undefined): string => {
  const key = String(signalType || '').trim();
  return TYPE_LABELS[key] || (key ? key.replace(/_/g, ' ') : 'Signal');
};

export const humanizeNormalizedValue = (value: string | null | undefined): string => {
  const key = String(value || '').trim();
  if (!key) return '';
  return VALUE_LABELS[key] || key.replace(/_/g, ' ');
};

export const formatSubtypeLabel = humanizeNormalizedValue;

export const correctionOptionsForSignal = (
  signalType: string | null | undefined,
): Array<{ value: string; label: string }> => {
  const key = String(signalType || '').trim();
  const values = MEMORY_SIGNAL_TAXONOMY[key] || [];
  return values.map((value) => ({ value, label: humanizeNormalizedValue(value) }));
};

export const getCorrectionOptionsForSignal = (signalType: string | null | undefined): string[] =>
  correctionOptionsForSignal(signalType).map((o) => o.value);

export type SignalMemoryDescription = {
  trustLabel: string;
  summary: string;
  typeLabel: string;
  valueLabel: string;
};

export const describeSignalMemory = (input: {
  payload?: Record<string, unknown>;
  signal_type?: string;
  normalized_value?: string | null;
  display_label?: string | null;
  user_status?: string;
}): SignalMemoryDescription => {
  const payload = input.payload || input;
  const status = String(payload.user_status || 'unreviewed');
  const typeLabel = humanizeSignalType(payload.signal_type as string);
  const valueLabel =
    humanizeNormalizedValue(payload.normalized_value as string) ||
    String(payload.display_label || '').trim() ||
    'a signal';

  if (status === 'unreviewed') {
    return {
      trustLabel: 'Needs review',
      summary: `Luna noticed a possible ${typeLabel.toLowerCase()} signal — review needed`,
      typeLabel,
      valueLabel,
    };
  }
  if (status === 'confirmed') {
    return {
      trustLabel: 'Confirmed by you',
      summary: `You confirmed ${valueLabel}`,
      typeLabel,
      valueLabel,
    };
  }
  if (status === 'corrected') {
    return {
      trustLabel: 'Confirmed by you',
      summary: `You corrected this to ${valueLabel}`,
      typeLabel,
      valueLabel,
    };
  }
  return {
    trustLabel: 'Signal',
    summary: valueLabel,
    typeLabel,
    valueLabel,
  };
};

export const formatSignalHeadline = (view: {
  signal_type?: string;
  normalized_value?: string | null;
  display_label?: string | null;
  user_status?: string;
}): string => describeSignalMemory(view).summary;
