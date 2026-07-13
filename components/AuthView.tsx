import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { AuthCopy } from '../types/uiCopy';
import { AuthSession } from '../types';
import { authService } from '../services/authService';
import {
  bindGoogleIdentityHandlers,
  cancelGoogleIdentityPrompt,
  ensureGoogleIdentityClient,
  loadGoogleIdentityScript,
  renderGoogleSignInButton,
} from '../utils/googleIdentity';
import { readInviteFromUrl, readResetTokenFromUrl, readVerifyTokenFromUrl } from '../utils/authUrlTokens';

interface AuthViewProps {
  ui: AuthCopy;
  onSuccess: (session: AuthSession) => void;
  initialMode?: 'signin' | 'signup';
  onClose?: () => void;
  onBack?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

export const AuthView: React.FC<AuthViewProps> = ({ ui, onSuccess, initialMode = 'signin', onClose, onBack }) => {
  const [mode, setMode] = useState<AuthMode>(() =>
    readResetTokenFromUrl() ? 'reset' : initialMode === 'signup' ? 'signup' : 'signin',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [inviteOnly, setInviteOnly] = useState(false);
  const [resetToken] = useState(() => readResetTokenFromUrl());
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const isLogin = mode === 'signin';
  const handleBack = onBack ?? onClose;
  const backLabel = ui.auth.backToPublic ?? 'Back to public home';
  const inviteToken = readInviteFromUrl();

  const googleClientId = useMemo(() => {
    const envValue = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    return typeof envValue === 'string' ? envValue.trim() : '';
  }, []);

  useEffect(() => {
    void authService
      .getAuthConfig()
      .then((cfg) => {
        if (typeof cfg.inviteOnly === 'boolean') setInviteOnly(cfg.inviteOnly);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const verify = readVerifyTokenFromUrl();
    if (!verify) return;
    void authService
      .verifyEmail(verify)
      .then((result) => {
        if (result.session) {
          onSuccess(result.session);
          return;
        }
        setAuthInfo(result.alreadyVerified ? 'Email already verified. You can sign in.' : 'Email verified. You can sign in.');
        setMode('signin');
      })
      .catch((error) => setAuthError(error instanceof Error ? error.message : 'Verification failed.'));
  }, [onSuccess]);

  const onGoogleCredential = useCallback(
    async (response: { credential?: string }) => {
      setAuthError(null);
      setIsLoading(true);
      try {
        if (!response.credential) throw new Error('Google sign-in was cancelled.');
        const session = await authService.loginWithGoogleCredential(response.credential, inviteToken);
        onSuccess(session);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Google sign-in failed.';
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setAuthError(
          /origin|oauth|400|audience|javascript/i.test(message) && origin
            ? `Google sign-in failed for ${origin}. Add this exact URL to Authorized JavaScript origins in Google Cloud Console.`
            : message,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, inviteToken],
  );

  const onGoogleError = useCallback((message: string) => {
    setIsLoading(false);
    if (/popup_closed|cancel/i.test(message)) return;
    setAuthError(message);
  }, []);

  useEffect(() => {
    if (!googleClientId || mode === 'forgot' || mode === 'reset') return;
    let alive = true;
    loadGoogleIdentityScript()
      .then(() => {
        if (alive) setGoogleReady(true);
      })
      .catch((error) => {
        if (alive) setAuthError(error instanceof Error ? error.message : 'Could not load Google sign-in.');
      });
    return () => {
      alive = false;
    };
  }, [googleClientId, mode]);

  useEffect(() => {
    if (!googleClientId || mode === 'forgot' || mode === 'reset') return;
    return bindGoogleIdentityHandlers(onGoogleCredential, onGoogleError);
  }, [googleClientId, onGoogleCredential, onGoogleError, mode]);

  useEffect(() => {
    if (!googleClientId || !googleReady || mode === 'forgot' || mode === 'reset') return;
    const mount = googleButtonRef.current;
    if (!mount) return;
    const context = isLogin ? 'signin' : 'signup';
    ensureGoogleIdentityClient(googleClientId, context);
    renderGoogleSignInButton(mount, { width: mount.offsetWidth, context });
    return () => cancelGoogleIdentityPrompt();
  }, [googleClientId, googleReady, isLogin, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfo(null);
    setIsLoading(true);
    try {
      if (mode === 'forgot') {
        await authService.forgotPassword(email);
        setAuthInfo('If an account exists for that email, a reset link has been sent.');
        return;
      }
      if (mode === 'reset') {
        if (!resetToken) throw new Error('Reset link is invalid.');
        await authService.resetPassword(resetToken, password);
        setAuthInfo('Password updated. You can sign in.');
        setMode('signin');
        setPassword('');
        return;
      }
      if (mode === 'signup' && inviteOnly && !inviteToken) {
        throw new Error('A valid invitation is required for Closed Paid Beta.');
      }
      const session =
        mode === 'signin'
          ? await authService.loginWithPassword(email, password)
          : await authService.signupWithPassword(email, password, inviteToken);
      onSuccess(session);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign-in failed.');
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

  const headline =
    mode === 'forgot'
      ? ui.auth.recoveryHeadline || 'Reset password'
      : mode === 'reset'
        ? 'Choose a new password'
        : ui.auth.headline;
  const subheadline =
    mode === 'forgot'
      ? ui.auth.recoveryText || 'Enter your email and we will send a reset link.'
      : mode === 'reset'
        ? 'Enter a new password for your account.'
        : inviteOnly && mode === 'signup'
          ? 'Closed Paid Beta — invitation required.'
          : ui.auth.subheadline;

  return (
    <div className="fixed inset-0 z-[500] bg-gradient-to-br from-[#f6f3fa] via-[#f3eff8] to-[#eceef6] dark:from-[#080d1d] dark:via-[#0b1328] dark:to-[#111f3d] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {backButton}
      <div className="w-full max-w-md my-8 rounded-[2rem] border border-slate-300/70 dark:border-slate-700/70 shadow-[0_34px_90px_rgba(71,85,105,0.26)] dark:shadow-[0_34px_90px_rgba(2,6,23,0.72)] bg-white/92 dark:bg-[#0a1328]/92 backdrop-blur-xl relative z-10">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full border border-slate-300/80 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-luna-purple transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        )}

        <div className="p-8 md:p-10 space-y-6">
          <header className="text-center space-y-3">
            <Logo size="lg" className="mx-auto" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">{headline}</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{subheadline}</p>
            {mode === 'signup' && inviteToken && (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Invitation detected</p>
            )}
          </header>

          {googleClientId && (mode === 'signin' || mode === 'signup') && (
            <>
              <div
                ref={googleButtonRef}
                data-testid="auth-google"
                className={`w-full flex justify-center min-h-[48px] ${!googleReady || isLoading ? 'opacity-60 pointer-events-none' : ''}`}
              />
              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">
                  {ui.auth.email}
                </label>
                <input
                  data-testid="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-300/70 dark:border-slate-700 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            )}
            {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">
                    {ui.auth.password}
                  </label>
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
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-300/70 dark:border-slate-700 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}
            {mode === 'signin' && (
              <button
                type="button"
                data-testid="auth-forgot"
                className="text-[10px] font-black uppercase tracking-widest text-luna-purple"
                onClick={() => {
                  setAuthError(null);
                  setAuthInfo(null);
                  setMode('forgot');
                }}
              >
                {ui.auth.forgot || 'Forgot password?'}
              </button>
            )}
            <button
              data-testid="auth-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-luna-purple via-luna-coral to-luna-purple text-white font-black uppercase tracking-[0.16em] rounded-full hover:shadow-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-luna-purple/40 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'forgot' ? (
                ui.auth.recoveryCta || 'Send reset link'
              ) : mode === 'reset' ? (
                'Update password'
              ) : isLogin ? (
                ui.auth.login
              ) : (
                ui.auth.signup
              )}
            </button>
          </form>

          {authInfo && (
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 text-center" role="status">
              {authInfo}
            </p>
          )}
          {authError && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 text-center" role="alert">
              {authError}
            </p>
          )}

          <footer className="text-center pt-2 space-y-2">
            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                className="text-xs font-black text-slate-400 hover:text-luna-purple transition-colors uppercase tracking-widest"
                onClick={() => {
                  setAuthError(null);
                  setMode('signin');
                }}
              >
                Back to sign in
              </button>
            )}
            {(mode === 'signin' || mode === 'signup') && (
              <button
                data-testid="auth-mode-toggle"
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                }}
                className="text-xs font-black text-slate-400 hover:text-luna-purple transition-colors uppercase tracking-widest"
              >
                {isLogin ? ui.auth.noAccount : ui.auth.hasAccount}
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};
