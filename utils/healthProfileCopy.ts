/**
 * English-only Personal Health Profile copy.
 * Kept as a plain object (not LangCopy) until localized UI is release-ready.
 */
export const HEALTH_PROFILE_COPY = {
  title: 'Help Luna understand your context',
  setupBody: 'Add only what feels useful. You can skip anything and change it later.',
  continue: 'Continue profile',
  saveContinue: 'Save and continue',
  skip: 'Skip',
  back: 'Back',
  exitLater: 'Exit and finish later',
  edit: 'Edit',
  needsReview: 'Needs your review',
  confirmedFacts: 'Confirmed facts',
  noReview: 'Nothing needs review.',
  noConfirmed: 'No confirmed facts yet.',
  whyAsk: 'Why Luna asks this',
  whyDob: 'Age can make wellness ranges and patterns more relevant. You can skip this.',
  whyMedications: 'Medication context can prevent irrelevant explanations. Luna will not tell you to change medication.',
  whyCycle: 'Cycle context can make energy, sleep, mood, and symptom patterns more relevant. This is optional.',
  readyBasic: 'Your profile is ready for basic personalization.',
  addSleep: 'Add your sleep routine when you are ready for more relevant daily context.',
  reviewMedications: 'Review medications so Luna can avoid irrelevant explanations.',
  safety: 'Luna supports wellness reflection. She does not diagnose conditions or tell you to start, stop, or change medication.',
  memoryOff: 'Turning Memory off does not delete profile details you manually save here.',
  unavailable: 'Your health profile is temporarily unavailable. The rest of Luna remains available.',
  englishOnly: 'Health Profile is currently available in English only; other languages are not yet release-ready.',
  sections: {
    about: 'About you',
    body: 'Body',
    health_history: 'Health history',
    medications: 'Medications',
    sleep: 'Sleep',
    nutrition: 'Nutrition',
    activity: 'Activity',
    stress: 'Stress',
    womens_health: "Women's health",
    goals: 'Goals',
    care_context: 'Care context',
    data_sources: 'Data sources',
  },
} as const;

export type HealthProfileSection = keyof typeof HEALTH_PROFILE_COPY.sections;
