
import React, { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { AuthSession, HormoneData, AdminRole } from './types';
import { dataService } from './services/dataService';
import { useAppPreferences } from './hooks/useAppPreferences';
import { buildBottomNavItems, buildSidebarGroups, buildTopNavItems, TabType } from './utils/navigation';
import { readTabFromUrl, syncUrlState, updateHreflangLinks } from './utils/urlRouting';
import { resolveSiteUrl } from './utils/pageMeta';
import { pathnameToMemberTab } from './utils/memberFooterNavigation';
import {
  createMemberHubBack,
  type MemberNavigateOptions,
  MEMBER_HUB_TAB,
} from './utils/memberNavigation';
import { PrivacyControls } from './components/PrivacyControls';
import { useHealthModel } from './hooks/useHealthModel';
import { authService } from './services/authService';
import { captureAppError, initMonitoring } from './services/monitoringService';
import { initAnalytics, trackEvent, trackPageView } from './services/analyticsService';
import { conversionEvents } from './utils/conversionEvents';
import { billingService } from './services/billingService';
import { consumeCheckoutPending, consumeTrialPending } from './utils/subscriptionAccess';
import { captureUtmFromLocation } from './utils/utmAttribution';
import { useCalendarReminderLoop } from './hooks/useCalendarReminders';
import { useHealthProfileCompletion } from './hooks/useHealthProfileCompletion';
import { personalEventsService } from './services/personalEventsService';
import { readInviteFromUrl, readResetTokenFromUrl, readVerifyTokenFromUrl } from './utils/authUrlTokens';

// SHARED COMPONENTS
import { LunaLiveButton } from './components/LunaLiveButton';
import type { LiveSessionClosePayload } from './components/LiveAssistant';
import type { LiveCloseSummary } from './utils/liveSessionContinuity';

/** Member chrome — lazy so anonymous home does not download the member graph. */
const AppShellNav = lazy(() => import('./components/AppShellNav').then((m) => ({ default: m.AppShellNav })));
const AppMobileNav = lazy(() => import('./components/AppMobileNav').then((m) => ({ default: m.AppMobileNav })));
const MainContentRouter = lazy(() =>
  import('./components/MainContentRouter').then((m) => ({ default: m.MainContentRouter })),
);
const OnboardingGate = lazy(() => import('./components/OnboardingGate').then((m) => ({ default: m.OnboardingGate })));
const LiveAssistant = lazy(() => import('./components/LiveAssistant').then((m) => ({ default: m.LiveAssistant })));
const HormoneDetail = lazy(() => import('./components/HormoneDetail'));
const CheckinOverlay = lazy(() => import('./components/CheckinOverlay').then((m) => ({ default: m.CheckinOverlay })));
const AuthView = lazy(() => import('./components/AuthView').then((m) => ({ default: m.AuthView })));
const PublicLandingView = lazy(() => import('./components/PublicLandingView').then((m) => ({ default: m.PublicLandingView })));
const AdminWorkspaceView = lazy(() => import('./components/AdminWorkspaceView').then((m) => ({ default: m.AdminWorkspaceView })));
const AppFooter = lazy(() => import('./components/AppFooter').then((m) => ({ default: m.AppFooter })));
const InstallAppPrompt = lazy(() => import('./components/InstallAppPrompt').then((m) => ({ default: m.InstallAppPrompt })));
const StandaloneWelcomeOverlay = lazy(() => import('./components/StandaloneWelcomeOverlay').then((m) => ({ default: m.StandaloneWelcomeOverlay })));
const StandaloneLaunchSplash = lazy(() => import('./components/StandaloneLaunchSplash').then((m) => ({ default: m.StandaloneLaunchSplash })));

const MemberFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
    <div className="text-[10px] font-black uppercase tracking-[0.3em]">Loading…</div>
  </div>
);
const App: React.FC = () => {
  const [showLaunchSplash, setShowLaunchSplash] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => dataService.projectState(dataService.getLog()).onboarded);
  const [showLive, setShowLive] = useState(false);
  const [liveCloseSummary, setLiveCloseSummary] = useState<LiveCloseSummary | null>(null);
  const [liveResumeMessages, setLiveResumeMessages] = useState<
    Array<{ role: 'user' | 'luna' | 'system'; text: string }>
  >([]);
  const [liveRefreshToken, setLiveRefreshToken] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedHormone, setSelectedHormone] = useState<HormoneData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const fromQuery = readTabFromUrl();
    if (fromQuery) return fromQuery;
    const fromPath = pathnameToMemberTab(typeof window !== 'undefined' ? window.location.pathname : '/');
    return fromPath || MEMBER_HUB_TAB;
  });
  const [showSyncOverlay, setShowSyncOverlay] = useState(false);
  
  const [checkinData, setCheckinData] = useState<Record<string, number>>({ 
    energy: 3, mood: 3, sleep: 3, libido: 3, irritability: 3, stress: 3 
  });
  const [checkinClinical, setCheckinClinical] = useState(() => ({
    symptoms: [] as string[],
    isPeriod: false,
    periodEvent: null as 'started' | 'ended' | null,
    flow: '' as '' | 'none' | 'light' | 'medium' | 'heavy',
    intensity: 3,
    notes: '',
  }));
  
  const { lang, setLang, theme, setTheme, ui } = useAppPreferences();

  useEffect(() => {
    updateHreflangLinks(resolveSiteUrl(), lang);
  }, [lang]);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!standalone || !isMobile) return;

    const key = 'luna_launch_splash_seen_session_v1';
    let seen = false;
    try {
      seen = sessionStorage.getItem(key) === '1';
    } catch {
      seen = false;
    }
    if (seen) return;

    setShowLaunchSplash(true);
    try {
      sessionStorage.setItem(key, '1');
    } catch {
      // ignore
    }
    const timer = window.setTimeout(() => setShowLaunchSplash(false), 1300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    captureUtmFromLocation();
    initMonitoring().catch(() => undefined);
    initAnalytics().catch(() => undefined);
    dataService.hydrateLog().catch(() => undefined);
  }, []);

  useEffect(() => {
    captureUtmFromLocation();
    trackPageView(window.location.pathname);
  }, [activeTab]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (event.error) captureAppError(event.error);
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureAppError(event.reason || new Error('Unhandled promise rejection.'));
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const safetyTimer = window.setTimeout(() => {
      setIsAuthLoading(false);
    }, 5000);

    authService
      .getSession()
      .then((nextSession) => {
        if (isMounted) setSession(nextSession);
      })
      .catch(() => {
        captureAppError(new Error('Session bootstrap failed.'));
        if (isMounted) setSession(null);
      })
      .finally(() => {
        window.clearTimeout(safetyTimer);
        setIsAuthLoading(false);
      });

    return () => {
      isMounted = false;
      window.clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    const invite = readInviteFromUrl();
    const reset = readResetTokenFromUrl();
    const verify = readVerifyTokenFromUrl();
    if (!invite && !reset && !verify) return;

    if (session && verify) {
      void authService
        .verifyEmail(verify)
        .then((result) => {
          if (result.session) setSession(result.session);
          else {
            void authService.getSession().then((next) => {
              if (next) setSession(next);
            });
          }
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete('verify');
            window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
          } catch {
            /* ignore */
          }
        })
        .catch(() => undefined);
      return;
    }

    if (!session) {
      if (invite) setAuthMode('signup');
      setShowAuthModal(true);
    }
  }, [isAuthLoading, session]);

  const {
    log,
    setLog,
    systemState,
    currentPhase,
    ruleOutput,
    hormoneData,
    stateNarrative,
    isNarrativeLoading,
  } = useHealthModel({
    activeTab,
    hasCompletedOnboarding,
    lang,
  });

  const navigateTo = useCallback((tab: TabType, options?: MemberNavigateOptions) => {
    setActiveTab(tab);
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
    if (options?.openSidebar) {
      setShowSidebar(true);
    } else if (!options?.keepSidebar && !isDesktop) {
      setShowSidebar(false);
    }
    syncUrlState({ tab, lang, replace: false });
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lang]);

  const onMemberBack = useMemo(() => createMemberHubBack(navigateTo), [navigateTo]);

  const saveCheckin = useCallback(() => {
    dataService.logEvent('DAILY_CHECKIN', {
      metrics: { ...checkinData },
      symptoms: [...checkinClinical.symptoms],
      isPeriod: Boolean(checkinClinical.isPeriod || checkinClinical.periodEvent === 'started'),
      periodEvent: checkinClinical.periodEvent,
      flow: checkinClinical.flow || undefined,
      intensity: checkinClinical.intensity,
      notes: checkinClinical.notes.trim() || undefined,
    });
    if (checkinClinical.periodEvent === 'started') {
      const length = Number(dataService.projectState(dataService.getLog()).cycleLength || 28);
      dataService.logEvent('CYCLE_SYNC', {
        day: 1,
        length,
        lastPeriodStart: new Date().toISOString().slice(0, 10),
      });
    }
    setLog(dataService.getLog());
    setShowSyncOverlay(false);
    setCheckinClinical({
      symptoms: [],
      isPeriod: false,
      periodEvent: null,
      flow: '',
      intensity: 3,
      notes: '',
    });
    conversionEvents.checkinCompleted('sliders');
    void personalEventsService.syncLocalLog().catch(() => undefined);
  }, [checkinData, checkinClinical, setLog]);

  const saveCheckinAndBridge = useCallback(() => {
    saveCheckin();
    navigateTo('bridge');
  }, [saveCheckin, navigateTo]);

  const canAccessAdmin = useMemo(() => authService.canAccessAdminWorkspace(session), [session]);

  const sidebarGroups = useMemo(() => buildSidebarGroups(ui, canAccessAdmin, lang), [ui, canAccessAdmin, lang]);
  const topNavItems = useMemo(() => buildTopNavItems(ui, lang), [ui, lang]);
  const bottomNavItems = useMemo(() => buildBottomNavItems(ui, lang), [ui, lang]);
  const healthProfileCompletion = useHealthProfileCompletion(Boolean(session?.id));

  const handleRoleChange = useCallback((role: AdminRole) => {
    if (!session) return;
    authService
      .updateRole(session, role)
      .then((updatedSession) => setSession(updatedSession))
      .catch((error) => {
        console.error('Role update failed', error);
      });
  }, [session]);

  useCalendarReminderLoop(Boolean(session?.id));

  const handleLogout = useCallback(() => {
    authService
      .logout()
      .catch(() => undefined)
      .finally(() => {
        setSession(null);
        setActiveTab(MEMBER_HUB_TAB);
      });
  }, []);

  if (showLaunchSplash) {
    return (
      <Suspense fallback={null}>
        <StandaloneLaunchSplash lang={lang} />
      </Suspense>
    );
  }

  const awaitingSessionRestore = isAuthLoading && !session && (() => {
    try {
      return Boolean(localStorage.getItem('luna_auth_session_v2'));
    } catch {
      return false;
    }
  })();

  if (awaitingSessionRestore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
        <div className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
            <div className="text-[10px] font-black uppercase tracking-[0.3em]">Loading…</div>
          </div>
        }>
          <PublicLandingView
            onSignIn={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
            onSignUp={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            ui={ui}
          />
          {showAuthModal && (
            <AuthView
              ui={ui}
              initialMode={authMode}
              onClose={() => setShowAuthModal(false)}
              onBack={() => setShowAuthModal(false)}
              onSuccess={async (nextSession) => {
                setShowAuthModal(false);
                setSession(nextSession);
                const isAdmin = authService.canAccessAdminWorkspace(nextSession);
                setActiveTab(isAdmin ? 'admin' : MEMBER_HUB_TAB);
                // New subscribers: Stripe Checkout only (7-day trial via subscription_data).
                const pendingPeriod =
                  consumeCheckoutPending() || (consumeTrialPending() ? 'year' : null);
                if (pendingPeriod && !isAdmin) {
                  try {
                    conversionEvents.checkoutStarted(pendingPeriod);
                    const checkout = await billingService.createCheckoutSession(pendingPeriod);
                    conversionEvents.trialStarted();
                    window.location.assign(checkout.url);
                    return;
                  } catch {
                    // billing may be disabled / misconfigured — stay in member hub
                  }
                }
              }}
            />
          )}
        </Suspense>
        <Suspense fallback={null}>
          <StandaloneWelcomeOverlay lang={lang} />
          <InstallAppPrompt lang={lang} />
        </Suspense>
        <PrivacyControls lang={lang} isAuthenticated={false} />
        <LunaLiveButton onClick={() => setShowLive(true)} isActive={showLive} />
        <Suspense fallback={null}>
          <LiveAssistant
            isOpen={showLive}
            onClose={() => setShowLive(false)}
            stateSnapshot="Public preview."
            lang={lang}
            accessMode="public"
            onSignIn={() => {
              setShowLive(false);
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
            onSignUp={() => {
              setShowLive(false);
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
          />
        </Suspense>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Suspense fallback={<MemberFallback />}>
        <OnboardingGate
          lang={lang}
          onComplete={() => {
            conversionEvents.onboardingCompleted();
            setLog(dataService.getLog());
            setHasCompletedOnboarding(true);
            setActiveTab(MEMBER_HUB_TAB);
          }}
        />
        <StandaloneWelcomeOverlay lang={lang} />
        <InstallAppPrompt lang={lang} />
      </Suspense>
    );
  }

  if (activeTab === 'admin' && canAccessAdmin) {
    return (
      <Suspense fallback={<MemberFallback />}>
        <AdminWorkspaceView
          session={session}
          lang={lang}
          setLang={setLang}
          onBack={() => navigateTo(MEMBER_HUB_TAB)}
          onLogout={handleLogout}
          onRoleChange={handleRoleChange}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<MemberFallback />}>
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
        {session.emailVerified === false && session.provider === 'password' && (
          <div
            data-testid="email-verify-banner"
            className="z-40 border-b border-amber-200/80 bg-amber-50 text-amber-950 px-4 py-3 text-sm text-center"
          >
            Verify your email to finish account setup. Check your inbox for the verification link.
          </div>
        )}
        <AppShellNav
          activeTab={activeTab}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          navigateTo={navigateTo}
          onOpenLive={() => setShowLive(true)}
          sidebarGroups={sidebarGroups}
          topNavItems={topNavItems}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          healthProfileCompletionPercent={healthProfileCompletion.percent}
        />

        <div className="lg:pl-[240px]">
          <MainContentRouter
            activeTab={activeTab}
            lang={lang}
            ui={ui}
            currentPhase={currentPhase}
            systemState={systemState}
            log={log}
            hormoneData={hormoneData}
            ruleOutput={ruleOutput}
            isNarrativeLoading={isNarrativeLoading}
            stateNarrative={stateNarrative}
            setSelectedHormone={setSelectedHormone}
            setShowSyncOverlay={setShowSyncOverlay}
            setShowLive={setShowLive}
            setLog={setLog}
            navigateTo={navigateTo}
            onMemberBack={onMemberBack}
            session={session}
            onLogout={handleLogout}
            liveCloseSummary={liveCloseSummary}
            liveRefreshToken={liveRefreshToken}
            onContinueLiveConversation={() => {
              setLiveCloseSummary(null);
              trackEvent('continue_conversation_clicked', {
                surface: 'today',
                action: 'continue',
                result: 'ok',
              });
              setShowLive(true);
            }}
            onDismissLiveContinuity={() => setLiveCloseSummary(null)}
          />

          <AppFooter
            ui={ui}
            lang={lang}
            theme={theme}
            setLang={setLang}
            setTheme={setTheme}
            navigateTo={navigateTo}
            onOpenLive={() => setShowLive(true)}
            canAccessAdmin={canAccessAdmin}
          />
        </div>

        <CheckinOverlay
          isOpen={showSyncOverlay}
          onClose={() => setShowSyncOverlay(false)}
          ui={ui}
          lang={lang}
          checkinData={checkinData}
          setCheckinData={setCheckinData}
          clinical={checkinClinical}
          setClinical={setCheckinClinical}
          onSave={saveCheckin}
          onSaveAndBridge={saveCheckinAndBridge}
        />

        <LunaLiveButton onClick={() => setShowLive(true)} isActive={showLive} />
        <LiveAssistant
          isOpen={showLive}
          onClose={() => setShowLive(false)}
          stateSnapshot={stateNarrative || 'Presence.'}
          lang={lang}
          accessMode="member"
          resumeMessages={liveResumeMessages}
          onOpenHealthProfile={() => {
            setShowLive(false);
            navigateTo('profile');
          }}
          onSessionComplete={(payload: LiveSessionClosePayload) => {
            setLiveResumeMessages(payload.resumeMessages);
            setLiveCloseSummary({
              userTurnCount: payload.userTurnCount,
              memoryWriteStatus: payload.memoryWriteStatus,
              resumeMessages: payload.resumeMessages,
            });
            setLiveRefreshToken((n) => n + 1);
            if (activeTab !== MEMBER_HUB_TAB) {
              setActiveTab(MEMBER_HUB_TAB);
            }
            conversionEvents.liveAssistantSaved();
            trackEvent('today_refreshed_after_live', {
              surface: 'today',
              action: 'refresh',
              result: 'ok',
            });
          }}
        />
        {selectedHormone && (
          <HormoneDetail hormone={selectedHormone} lang={lang} onClose={() => setSelectedHormone(null)} />
        )}

        <AppMobileNav
          activeTab={activeTab}
          bottomNavItems={bottomNavItems}
          navigateTo={navigateTo}
          setShowSidebar={setShowSidebar}
          healthProfileCompletionPercent={healthProfileCompletion.percent}
        />
        <StandaloneWelcomeOverlay lang={lang} />
        <InstallAppPrompt lang={lang} />
        <PrivacyControls lang={lang} isAuthenticated />
      </div>
    </Suspense>
  );
};

export default App;
