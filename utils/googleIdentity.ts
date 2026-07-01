type GoogleCredentialResponse = { credential?: string; select_by?: string };

type GoogleIdClient = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    error_callback?: (error: { type?: string; message?: string }) => void;
    context?: 'signin' | 'signup' | 'use';
    cancel_on_tap_outside?: boolean;
    itp_support?: boolean;
    use_fedcm_for_prompt?: boolean;
    auto_select?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
      locale?: string;
    },
  ) => void;
  cancel: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdClient;
      };
    };
  }
}

export type GoogleCredentialHandler = (response: GoogleCredentialResponse) => void;
export type GoogleErrorHandler = (message: string) => void;

const GOOGLE_SCRIPT_ID = 'luna-google-identity-sdk';

let scriptLoadPromise: Promise<void> | null = null;
let initializedClientId: string | null = null;
let initializedContext: 'signin' | 'signup' | null = null;
let activeCredentialHandler: GoogleCredentialHandler | null = null;
let activeErrorHandler: GoogleErrorHandler | null = null;

const dispatchCredential = (response: GoogleCredentialResponse) => {
  activeCredentialHandler?.(response);
};

const dispatchError = (error: { type?: string; message?: string }) => {
  const message = error.message || error.type || 'Google sign-in was interrupted.';
  activeErrorHandler?.(message);
};

/** COOP same-origin-allow-popups uses the popup/postMessage path — FedCM often hangs silently. */
const shouldUseFedCm = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!('IdentityCredential' in window)) return false;
  return false;
};

export const loadGoogleIdentityScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), { once: true });
      if (window.google?.accounts?.id) resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google sign-in.'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
};

export const ensureGoogleIdentityClient = (clientId: string, context: 'signin' | 'signup'): void => {
  const idClient = window.google?.accounts?.id;
  if (!idClient || !clientId) return;

  if (initializedClientId === clientId && initializedContext === context) return;

  if (initializedClientId) {
    idClient.cancel();
  }

  idClient.initialize({
    client_id: clientId,
    callback: dispatchCredential,
    error_callback: dispatchError,
    context,
    cancel_on_tap_outside: true,
    itp_support: true,
    auto_select: false,
    use_fedcm_for_prompt: shouldUseFedCm(),
  });
  initializedClientId = clientId;
  initializedContext = context;
};

export const bindGoogleIdentityHandlers = (
  onCredential: GoogleCredentialHandler,
  onError: GoogleErrorHandler,
): (() => void) => {
  activeCredentialHandler = onCredential;
  activeErrorHandler = onError;
  return () => {
    if (activeCredentialHandler === onCredential) activeCredentialHandler = null;
    if (activeErrorHandler === onError) activeErrorHandler = null;
  };
};

export const renderGoogleSignInButton = (
  mount: HTMLElement,
  options: { width?: number; context?: 'signin' | 'signup' } = {},
): void => {
  const idClient = window.google?.accounts?.id;
  if (!idClient) return;

  mount.innerHTML = '';
  const width = Math.max(280, Math.min(options.width ?? (mount.offsetWidth || 360), 420));
  idClient.renderButton(mount, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    width,
  });
};

export const cancelGoogleIdentityPrompt = (): void => {
  window.google?.accounts?.id?.cancel();
};
