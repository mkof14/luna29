import { trackEvent } from '../services/analyticsService';

/**
 * Conversion funnel events.
 * Prefer GA4 recommended names (sign_up, begin_checkout) plus Luna-specific names.
 */
export const conversionEvents = {
  signUpStarted: (method: 'email' | 'google') => {
    trackEvent('sign_up_started', { method });
  },
  signUpCompleted: (method: 'email' | 'google') => {
    trackEvent('sign_up', { method });
    trackEvent('sign_up_completed', { method });
    trackEvent('signup', { method });
  },
  signInCompleted: (method: 'email' | 'google') => trackEvent('sign_in_completed', { method }),
  onboardingCompleted: () => trackEvent('onboarding_completed', {}),
  firstVoiceReflection: (source: string) => trackEvent('first_voice_reflection', { source }),
  checkinCompleted: (mode: 'voice' | 'sliders') => trackEvent('checkin_completed', { mode }),
  bridgeCompleted: () => trackEvent('bridge_completed', {}),
  trialStarted: () => {
    trackEvent('trial_started', {});
    trackEvent('subscription', { phase: 'trial' });
  },
  checkoutStarted: (period: string) => {
    trackEvent('begin_checkout', { period, currency: 'USD' });
    trackEvent('checkout_started', { period });
    trackEvent('checkout', { period });
  },
  paywallViewed: (surface: string) => trackEvent('paywall_viewed', { surface }),
  liveAssistantSaved: () => trackEvent('live_assistant_saved', {}),
  anonymousVoiceTeaser: () => trackEvent('anonymous_voice_teaser', {}),
};
