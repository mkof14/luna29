import type { PrivacyConsentState } from '../utils/privacyCompliance';

export type PrivacyConsentAction = 'accept_all' | 'essential_only' | 'save';

const logConsentRequest = async (payload: {
  scopes: PrivacyConsentState['scopes'];
  action: PrivacyConsentAction;
  version: number;
}): Promise<void> => {
  const response = await fetch('/api/privacy/consent', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      source: 'privacy_controls',
    }),
  });
  if (!response.ok) {
    throw new Error(`Consent audit log failed (${response.status})`);
  }
};

export const logPrivacyConsentEvent = (
  scopes: PrivacyConsentState['scopes'],
  action: PrivacyConsentAction,
  version = 1,
): void => {
  logConsentRequest({ scopes, action, version }).catch(() => undefined);
};
