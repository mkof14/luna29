import { readPrivacyConsent } from './privacyCompliance';

export const isAiProcessingAllowed = (): boolean => {
  if (typeof window === 'undefined') return false;
  const consent = readPrivacyConsent();
  return consent?.scopes.ai_processing === true;
};

export const aiConsentHeaders = (): Record<string, string> =>
  isAiProcessingAllowed() ? { 'X-Luna-AI-Consent': '1' } : {};
