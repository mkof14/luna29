import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { AuthCopy } from '../types/uiCopy';
import { AuthSession } from '../types';
import { authService } from '../services/authService';

interface AuthViewProps {
  ui: AuthCopy;
  onSuccess: (session: AuthSession) => void;
  initialMode?: 'signin' | 'signup';
  onClose?: () => void;
  onBack?: () => void;
}

type GoogleCredentialResponse = { credential?: string };

type GoogleIdClient = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    context?: 'signin' | 'signup' | 'use';
    cancel_on_tap_outside?: boolean;
    itp_support?: boolean;
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
    }
  ) => void;
  prompt: (cb?: (notification: {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
    getNotDisplayedReason?: () => string;
    getSkippedReason?: () => string;
  }) => void) => void;
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

const GOOGLE_SCRIPT_ID = 'luna-google-identity-sdk';

export const AuthView: React.FC<AuthViewProps> = ({ ui, onSuccess, initialMode = 'signin', onClose, onBack }) => {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [showRecovery, setShowRecovery] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleBack = onBack ?? onClose;
  const backLabel = ui.auth.backToPublic ?? 'Back to public home';

  const googleClientId = useMemo(() => {
    const envValue = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    return typeof envValue === 'string' ? envValue.trim() : '';
  }, []);

  const onGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      if (!response.credential) {
        throw new Error('Google response does not contain a credential.');
      }
      const session = await authService.loginWithGoogleCredential(response.credential);
      onSuccess(session);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google authorization failed.');
      setIsLoading(false);
    }
  }, [onSuccess]);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => setGoogleReady(true));
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setAuthError('Google SDK failed to load. Check your connection and try again.');
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleReady || !window.google?.accounts?.id) return;
    const mount = googleButtonRef.current;
    if (!mount) return;

    mount.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: onGoogleCredential,
      context: isLogin ? 'signin' : 'signup',
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });

    const width = Math.max(280, Math.min(mount.offsetWidth || 360, 420));
    window.google.accounts.id.renderButton(mount, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width,
    });
  }, [googleClientId, googleReady, isLogin, onGoogleCredential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      if (showRecovery) {
        setShowRecovery(false);
        setIsLoading(false);
        setAuthError(`Recovery email prepared for ${email || 'your account'}.`);
        return;
      }
      const session = isLogin
        ? await authService.loginWithPassword(email, password)
        : await authService.signupWithPassword(email, password);
      onSuccess(session);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authorization failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const backButton = handleBack ? (
    <button
      type="button"
      onClick={handleBack}
      className="absolute top-6 left-6 z-[510] inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-300/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:text-luna-purple hover:border-luna-purple/50 transition-colors shadow-sm"
      aria-label={backLabel}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-[0.14em] hidden sm:inline">{backLabel}</span>
    </button>
  ) : null;

  if (showRecovery) {
    return (
      <div className="fixed inset-0 z-[500] bg-gradient-to-br from-[#f6f3fa] via-[#f3eff8] to-[#eceef6] dark:from-[#080d1d] dark:via-[#0b1328] dark:to-[#111f3d] flex items-center justify-center p-6 animate-in fade-in duration-700 overflow-hidden">
        {backButton}
        <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#e5dbf4]/70 dark:bg-violet-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-[#e3e6f7]/70 dark:bg-indigo-500/20 blur-[120px]" />
        <div className="max-w-md w-full p-8 md:p-10 rounded-[2.4rem] border border-slate-300/70 dark:border-slate-700/70 bg-white/88 dark:bg-[#0b1328]/88 backdrop-blur-xl shadow-[0_30px_70px_rgba(71,85,105,0.22)] dark:shadow-[0_30px_70px_rgba(2,6,23,0.65)] space-y-8 relative z-10">
          <header className="text-center space-y-4">
            <Logo size="md" className="mx-auto" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{ui.auth.recoveryHeadline}</h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">{ui.auth.recoveryText}</p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">{ui.auth.email}</label>
              <input
                data-testid="auth-recovery-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <button
              data-testid="auth-recovery-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-luna-purple via-luna-coral to-luna-purple text-white font-black uppercase tracking-[0.16em] rounded-full hover:shadow-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-luna-purple/40"
            >
              {isLoading ? 'Processing...' : ui.auth.recoveryCta}
            </button>
          </form>
          <footer className="text-center space-y-4">
            <button
              onClick={() => setShowRecovery(false)}
              className="text-xs font-black text-slate-400 hover:text-luna-purple transition-colors uppercase tracking-widest"
            >
              Back to Login
            </button>
            {authError && <p className="text-xs font-semibold text-luna-purple">{authError}</p>}
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-gradient-to-br from-[#f6f3fa] via-[#f3eff8] to-[#eceef6] dark:from-[#080d1d] dark:via-[#0b1328] dark:to-[#111f3d] flex items-center justify-center p-6 animate-in fade-in duration-700 overflow-hidden">
      {backButton}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-[#e7def6]/70 dark:bg-violet-500/24 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 -right-24 w-[28rem] h-[28rem] bg-[#e3e7f8]/75 dark:bg-indigo-500/22 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] bg-[#f0e8f6]/60 dark:bg-fuchsia-500/12 rounded-full blur-[110px]" />

      <div className="w-full max-w-6xl rounded-[2.8rem] overflow-hidden border border-slate-300/70 dark:border-slate-700/70 shadow-[0_34px_90px_rgba(71,85,105,0.26)] dark:shadow-[0_34px_90px_rgba(2,6,23,0.72)] bg-white/86 dark:bg-[#0a1328]/88 backdrop-blur-xl grid grid-cols-1 lg:grid-cols-2 relative z-10">
        <aside className="hidden lg:block relative min-h-[680px] bg-gradient-to-br from-[#f4ecf8] via-[#efe7f5] to-[#e7eaf5] dark:from-[#0a1328] dark:via-[#0f1b38] dark:to-[#13264a]">
          <img
            src="/images/Luna%20logo3.png"
            alt="Luna29 artwork"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-75 dark:opacity-60"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.38)] to-[rgba(255,255,255,0.04)] dark:from-[rgba(9,14,30,0.18)] dark:to-[rgba(9,14,30,0.42)]" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/35 to-transparent dark:from-[#0a1328]/55 dark:to-transparent" />
        </aside>

        <div className="p-8 md:p-10 lg:p-12 space-y-8 relative overflow-hidden">
          <div className="pointer-events-none absolute top-0 right-0 w-36 h-36 bg-luna-purple/15 dark:bg-luna-purple/20 blur-3xl rounded-full -mr-10 -mt-10" />
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-300/80 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-luna-purple transition-colors"
              aria-label="Close authorization"
            >
              ×
            </button>
          )}

          <header className="text-center space-y-4">
            <Logo size="lg" className="mx-auto" />
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{ui.auth.headline}</h2>
            <p className="text-sm font-medium text-slate-500 italic leading-relaxed">{ui.auth.subheadline}</p>
          </header>

          <div className="space-y-4">
            {!googleClientId ? (
              <p className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
                Google sign-in requires <code className="text-luna-purple">VITE_GOOGLE_CLIENT_ID</code> in environment variables.
              </p>
            ) : !googleReady ? (
              <p className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
                Loading Google sign-in…
              </p>
            ) : (
              <div
                ref={googleButtonRef}
                data-testid="auth-google"
                className={`w-full flex justify-center min-h-[48px] ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
              />
            )}

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">{ui.auth.email}</label>
                <input
                  data-testid="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-300/70 dark:border-slate-700 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">{ui.auth.password}</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[9px] font-black text-luna-purple uppercase tracking-widest hover:underline"
                  >
                    {showPassword ? ui.auth.hide : ui.auth.show}
                  </button>
                </div>
                <input
                  data-testid="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-300/70 dark:border-slate-700 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all pr-12"
                  placeholder="••••••••"
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowRecovery(true)}
                  className="text-[10px] font-black text-slate-400 hover:text-luna-purple uppercase tracking-widest transition-colors"
                >
                  {ui.auth.forgot}
                </button>
              </div>
              <button
                data-testid="auth-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-luna-purple via-luna-coral to-luna-purple text-white font-black uppercase tracking-[0.16em] rounded-full hover:shadow-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-luna-purple/40 flex items-center justify-center gap-3"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isLogin ? ui.auth.login : ui.auth.signup}
              </button>
            </form>

            {authError && (
              <div className="rounded-2xl border border-luna-purple/30 bg-luna-purple/5 p-4">
                <p className="text-xs font-semibold text-luna-purple">{authError}</p>
              </div>
            )}
          </div>

          <footer className="text-center">
            <button
              data-testid="auth-mode-toggle"
              onClick={() => {
                setAuthError(null);
                setIsLogin(!isLogin);
              }}
              className="text-xs font-black text-slate-400 hover:text-luna-purple transition-colors uppercase tracking-widest"
            >
              {isLogin ? ui.auth.noAccount : ui.auth.hasAccount}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};
