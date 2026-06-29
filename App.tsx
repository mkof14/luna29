
import React, { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { AdminRole, AuthSession, HormoneData } from './types';
import { dataService } from './services/dataService';
import { useAppPreferences } from './hooks/useAppPreferences';
import { buildBottomNavItems, buildSidebarGroups, buildTopNavItems, TabType } from './utils/navigation';
import { readTabFromUrl, syncUrlState } from './utils/urlRouting';
import { AppShellNav } from './components/AppShellNav';
import { AppFooter } from './components/AppFooter';
import { AppMobileNav } from './components/AppMobileNav';
import { MainContentRouter } from './components/MainContentRouter';
import { OnboardingGate } from './components/OnboardingGate';
import { PrivacyControls } from './components/PrivacyControls';
import { useHealthModel } from './hooks/useHealthModel';
import { authService } from './services/authService';
import { captureAppError, initMonitoring } from './services/monitoringService';
import { initAnalytics, trackPageView } from './services/analyticsService';
import { conversionEvents } from './utils/conversionEvents';
import { billingService } from './services/billingService';
import { applyServerTrialToLocal, consumeTrialPending, markTrialPending } from './utils/subscriptionAccess';
import { InstallAppPrompt } from './components/InstallAppPrompt';
import { StandaloneWelcomeOverlay } from './components/StandaloneWelcomeOverlay';
import { StandaloneLaunchSplash } from './components/StandaloneLaunchSplash';

// SHARED COMPONENTS
import { LunaLiveButton } from './components/LunaLiveButton';
const LiveAssistant = lazy(() => import('./components/LiveAssistant').then((m) => ({ default: m.LiveAssistant })));
const HormoneDetail = lazy(() => import('./components/HormoneDetail'));
const CheckinOverlay = lazy(() => import('./components/CheckinOverlay').then((m) => ({ default: m.CheckinOverlay })));
const AuthView = lazy(() => import('./components/AuthView').then((m) => ({ default: m.AuthView })));
const PublicLandingView = lazy(() => import('./components/PublicLandingView').then((m) => ({ default: m.PublicLandingView })));

const App: React.FC = () => {
  const [showLaunchSplash, setShowLaunchSplash] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => dataService.projectState(dataService.getLog()).onboarded);
  const [showLive, setShowLive] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedHormone, setSelectedHormone] = useState<HormoneData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(() => readTabFromUrl() || 'today_mirror');
  const [showSyncOverlay, setShowSyncOverlay] = useState(false);
  
  const [checkinData, setCheckinData] = useState<Record<string, number>>({ 
    energy: 3, mood: 3, sleep: 3, libido: 3, irritability: 3, stress: 3 
  });
  
  const { lang, setLang, theme, setTheme, ui } = useAppPreferences();

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
    initMonitoring().catch(() => undefined);
    initAnalytics().catch(() => undefined);
    dataService.hydrateLog().catch(() => undefined);
  }, []);

  useEffect(() => {
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

  const navigateTo = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setShowSidebar(false);
    syncUrlState({ tab, lang });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lang]);

  const saveCheckin = useCallback(() => {
    dataService.logEvent('DAILY_CHECKIN', { metrics: { ...checkinData }, symptoms: [], isPeriod: false });
    setLog(dataService.getLog());
    setShowSyncOverlay(false);
  }, [checkinData, setLog]);

  const saveCheckinAndBridge = useCallback(() => {
    saveCheckin();
    navigateTo('bridge');
  }, [saveCheckin, navigateTo]);

  const canAccessAdmin = useMemo(() => authService.hasPermission(session, 'manage_services') || authService.hasPermission(session, 'manage_admin_roles'), [session]);

  const sidebarGroups = useMemo(() => buildSidebarGroups(ui, canAccessAdmin), [ui, canAccessAdmin]);
  const topNavItems = useMemo(() => buildTopNavItems(ui), [ui]);
  const bottomNavItems = useMemo(() => buildBottomNavItems(ui), [ui]);
  const handleRoleChange = useCallback((role: AdminRole) => {
    if (!session) return;
    authService
      .updateRole(session, role)
      .then((updatedSession) => setSession(updatedSession))
      .catch((error) => {
        // Keep existing state on failed role update; Admin UI remains accessible.
        console.error('Role update failed', error);
      });
  }, [session]);

  const handleLogout = useCallback(() => {
    authService
      .logout()
      .catch(() => undefined)
      .finally(() => {
        setSession(null);
        setActiveTab('today_mirror');
      });
  }, []);

  if (showLaunchSplash) {
    return <StandaloneLaunchSplash lang={lang} />;
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
                const isAdmin =
                  authService.hasPermission(nextSession, 'manage_services') ||
                  authService.hasPermission(nextSession, 'manage_admin_roles');
                setActiveTab(isAdmin ? 'admin' : 'today_mirror');
                if (consumeTrialPending()) {
                  try {
                    const result = await billingService.startServerTrial();
                    applyServerTrialToLocal(result.trial as { startedAt: string; endsAt: string; used?: boolean });
                    conversionEvents.trialStarted();
                  } catch {
                    // trial may already be used server-side
                  }
                }
              }}
            />
          )}
        </Suspense>
        <StandaloneWelcomeOverlay lang={lang} />
        <InstallAppPrompt lang={lang} />
        <PrivacyControls lang={lang} isAuthenticated={false} />
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <>
        <OnboardingGate
          lang={lang}
          onComplete={() => {
            setLog(dataService.getLog());
            setHasCompletedOnboarding(true);
            setActiveTab('today_mirror');
          }}
        />
        <StandaloneWelcomeOverlay lang={lang} />
        <InstallAppPrompt lang={lang} />
      </>
    );
  }

  return (
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
        <AppShellNav
          activeTab={activeTab}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          navigateTo={navigateTo}
          sidebarGroups={sidebarGroups}
          topNavItems={topNavItems}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
        />

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
        session={session}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
      />

      <AppFooter
        ui={ui}
        lang={lang}
        navigateTo={navigateTo}
        canAccessAdmin={canAccessAdmin}
      />

      <Suspense fallback={null}>
        <CheckinOverlay
          isOpen={showSyncOverlay}
          onClose={() => setShowSyncOverlay(false)}
          ui={ui}
          lang={lang}
          checkinData={checkinData}
          setCheckinData={setCheckinData}
          onSave={saveCheckin}
          onSaveAndBridge={saveCheckinAndBridge}
        />
      </Suspense>

      <LunaLiveButton onClick={() => setShowLive(true)} isActive={showLive} />
      <Suspense fallback={null}>
        <LiveAssistant isOpen={showLive} onClose={() => setShowLive(false)} stateSnapshot={stateNarrative || "Presence."} lang={lang} />
        {selectedHormone && <HormoneDetail hormone={selectedHormone} lang={lang} onClose={() => setSelectedHormone(null)} />}
      </Suspense>

      <AppMobileNav
        activeTab={activeTab}
        bottomNavItems={bottomNavItems}
        navigateTo={navigateTo}
        setShowSidebar={setShowSidebar}
      />
      <StandaloneWelcomeOverlay lang={lang} />
      <InstallAppPrompt lang={lang} />
      <PrivacyControls lang={lang} isAuthenticated />
    </div>
  );
};

export default App;
