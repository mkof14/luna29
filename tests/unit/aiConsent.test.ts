import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('aiConsent', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('returns empty headers when ai_processing consent is false', async () => {
    localStorage.setItem(
      'luna_privacy_consent_v1',
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        scopes: { essential: true, analytics: false, ai_processing: false, personalization: true },
      }),
    );
    const { aiConsentHeaders, isAiProcessingAllowed } = await import('../../utils/aiConsent');
    expect(isAiProcessingAllowed()).toBe(false);
    expect(aiConsentHeaders()).toEqual({});
  });

  it('returns X-Luna-AI-Consent when ai_processing is enabled', async () => {
    localStorage.setItem(
      'luna_privacy_consent_v1',
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        scopes: { essential: true, analytics: false, ai_processing: true, personalization: true },
      }),
    );
    const { aiConsentHeaders, isAiProcessingAllowed } = await import('../../utils/aiConsent');
    expect(isAiProcessingAllowed()).toBe(true);
    expect(aiConsentHeaders()).toEqual({ 'X-Luna-AI-Consent': '1' });
  });
});
