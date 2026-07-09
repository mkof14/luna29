import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AppShell } from '../components/AppShell';
import { BottomTabs } from '../components/BottomTabs';
import { QuickCheckInScreen } from '../screens/QuickCheckInScreen';
import { ReflectionResultScreen } from '../screens/ReflectionResultScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { VoiceReflectionScreen } from '../screens/VoiceReflectionScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PublicHomeScreen } from '../screens/PublicHomeScreen';
import { RhythmScreen } from '../screens/RhythmScreen';
import { YouScreen } from '../screens/YouScreen';
import { YourStoryScreen } from '../screens/YourStoryScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { TodayMirrorScreen } from '../screens/TodayMirrorScreen';
import { MyDayWithLunaScreen } from '../screens/MyDayWithLunaScreen';
import { MonthlyReflectionScreen } from '../screens/MonthlyReflectionScreen';
import { InsightsPaywallScreen } from '../screens/InsightsPaywallScreen';
import { MemberZoneScreen } from '../screens/MemberZoneScreen';
import { FooterLinksScreen } from '../screens/FooterLinksScreen';
import { AdminScreen } from '../screens/AdminScreen';
import { ServicesHubScreen } from '../screens/ServicesHubScreen';
import { BodyMapScreen } from '../screens/BodyMapScreen';
import { RitualPathScreen } from '../screens/RitualPathScreen';
import { BridgeMobileScreen } from '../screens/BridgeMobileScreen';
import { KnowledgeScreen } from '../screens/KnowledgeScreen';
import { HealthReportsScreen } from '../screens/HealthReportsScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { PartnerFAQMobileScreen } from '../screens/PartnerFAQMobileScreen';
import { LegalMobileScreen } from '../screens/LegalMobileScreen';
import { AboutLunaMobileScreen } from '../screens/AboutLunaMobileScreen';
import { HowItWorksMobileScreen } from '../screens/HowItWorksMobileScreen';
import { ContactMobileScreen } from '../screens/ContactMobileScreen';
import { VoiceFilesMobileScreen } from '../screens/VoiceFilesMobileScreen';
import { RelationshipsMobileScreen } from '../screens/RelationshipsMobileScreen';
import { FamilyMobileScreen } from '../screens/FamilyMobileScreen';
import { CreativeStudioMobileScreen } from '../screens/CreativeStudioMobileScreen';
import { MedicationNotesMobileScreen } from '../screens/MedicationNotesMobileScreen';
import { ResetRoomMobileScreen } from '../screens/ResetRoomMobileScreen';
import { TermsMobileScreen } from '../screens/TermsMobileScreen';
import { MedicalDisclaimerMobileScreen } from '../screens/MedicalDisclaimerMobileScreen';
import { CookiesMobileScreen } from '../screens/CookiesMobileScreen';
import { DataRightsMobileScreen } from '../screens/DataRightsMobileScreen';
import { colors } from '../theme/tokens';
import { AppView, TabKey } from '../types';
import { useLunaState } from '../state/useLunaState';
import { useRemoteLunaData } from '../state/useRemoteLunaData';
import { useMobileAuth } from '../state/useMobileAuth';
import { MobileLang } from '../i18n/mobileCopy';

export function AppNavigator() {
  const auth = useMobileAuth();
  const [view, setView] = useState<AppView>({ type: 'onboarding' });
  const [preAuthScreen, setPreAuthScreen] = useState<'public' | 'auth'>('public');
  const [showPublicHome, setShowPublicHome] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [lang, setLang] = useState<MobileLang>('en');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const { reflectionCount, insightStage, addReflection } = useLunaState();
  const { today, reflection, thread, loading, remoteError, refresh, syncReflection } = useRemoteLunaData();

  const effectiveSession =
    auth.session ||
    (guestMode
      ? {
          id: 'guest-mobile-user',
          email: 'guest@luna.local',
          name: 'Anna',
          provider: 'password' as const,
          role: 'member',
          permissions: [],
          lastLoginAt: new Date().toISOString(),
        }
      : null);

  function openTab(tab: TabKey) {
    setView({ type: 'tabs', tab });
  }

  function openVoice() {
    setView({ type: 'voice' });
  }

  function openQuickCheckIn() {
    setView({ type: 'quickCheckIn' });
  }

  function openTodayMirror() {
    setView({ type: 'todayMirror' });
  }

  function openMyDay() {
    setView({ type: 'myDay' });
  }

  function openMonthlyReflection() {
    setView({ type: 'monthlyReflection' });
  }

  function openPaywall() {
    setView({ type: 'paywall' });
  }
  function openMemberZone() {
    setView({ type: 'memberZone' });
  }
  function openFooterLinks() {
    setView({ type: 'footerLinks' });
  }
  function openAdmin() {
    setView({ type: 'admin' });
  }
  function openServicesHub() {
    setView({ type: 'servicesHub' });
  }
  function openBodyMap() {
    setView({ type: 'bodyMap' });
  }
  function openRitualPath() {
    setView({ type: 'ritualPath' });
  }
  function openBridge() {
    setView({ type: 'bridge' });
  }
  function openKnowledge() {
    setView({ type: 'knowledge' });
  }
  function openHealthReports() {
    setView({ type: 'healthReports' });
  }
  function openSupport() {
    setView({ type: 'support' });
  }
  function openPartnerFaq() {
    setView({ type: 'partnerFaq' });
  }
  function openLegal() {
    setView({ type: 'legal' });
  }
  function openAbout() {
    setView({ type: 'about' });
  }
  function openHowItWorks() {
    setView({ type: 'howItWorks' });
  }
  function openContact() {
    setView({ type: 'contact' });
  }
  function openVoiceFiles() {
    setView({ type: 'voiceFiles' });
  }
  function openRelationships() {
    setView({ type: 'relationships' });
  }
  function openFamily() {
    setView({ type: 'family' });
  }
  function openCreative() {
    setView({ type: 'creative' });
  }
  function openMedicationNotes() {
    setView({ type: 'medicationNotes' });
  }
  function openResetRoom() {
    setView({ type: 'resetRoom' });
  }
  function openTerms() {
    setView({ type: 'terms' });
  }
  function openMedicalDisclaimer() {
    setView({ type: 'medicalDisclaimer' });
  }
  function openCookies() {
    setView({ type: 'cookies' });
  }
  function openDataRights() {
    setView({ type: 'dataRights' });
  }

  function openPublicHome() {
    setShowPublicHome(true);
    setPreAuthScreen('public');
  }

  function openAuthScreen() {
    setGuestMode(false);
    setShowPublicHome(false);
    setPreAuthScreen('auth');
  }

  function openGuestSupport() {
    setGuestMode(true);
    setShowPublicHome(false);
    setPreAuthScreen('public');
    setView({ type: 'support' });
  }

  function openGuestMenu() {
    setGuestMode(true);
    setShowPublicHome(false);
    setPreAuthScreen('public');
    setView({ type: 'servicesHub' });
  }

  function openGuestFooter() {
    setGuestMode(true);
    setShowPublicHome(false);
    setPreAuthScreen('public');
    setView({ type: 'footerLinks' });
  }

  function openGuestLegal() {
    setGuestMode(true);
    setShowPublicHome(false);
    setPreAuthScreen('public');
    setView({ type: 'legal' });
  }

  function openResult(entry: string) {
    addReflection(entry);
    void syncReflection('voice', entry);
    setView({ type: 'result' });
  }

  function handleQuickCheckIn(entry: string) {
    addReflection(entry);
    void syncReflection('quick_checkin', entry);
    setView({ type: 'result' });
  }

  function handleWrite() {
    const entry = 'Written note: today felt heavier than expected, and you asked for a calmer evening.';
    addReflection(entry);
    void syncReflection('write', entry);
    setView({ type: 'result' });
  }

  function handleSkip() {
    Alert.alert('Luna29', 'Skipped for today. You can return tonight.');
  }

  function handleSave() {
    Alert.alert('Luna29', 'Reflection saved.');
  }

  function handleShare() {
    Alert.alert('Luna29', 'Share flow is prepared for next phase.');
  }

  const activeTab = useMemo<TabKey>(() => {
    if (view.type === 'tabs') return view.tab;
    return 'today';
  }, [view]);

  React.useEffect(() => {
    void (async () => {
      try {
        const savedLang = await SecureStore.getItemAsync('luna_mobile_lang');
        if (savedLang && ['en', 'ru', 'es', 'uk', 'fr', 'de', 'pt', 'ja', 'zh'].includes(savedLang)) {
          setLang(savedLang as MobileLang);
        }
        const savedTheme = await SecureStore.getItemAsync('luna_mobile_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeMode(savedTheme);
        }
      } catch {
        // Keep defaults when secure storage is unavailable.
      }
    })();
  }, []);

  React.useEffect(() => {
    void SecureStore.setItemAsync('luna_mobile_lang', lang).catch(() => {});
  }, [lang]);

  React.useEffect(() => {
    void SecureStore.setItemAsync('luna_mobile_theme', themeMode).catch(() => {});
  }, [themeMode]);

  const tabScreen = useMemo(() => {
    if (view.type !== 'tabs') return null;

    if (view.tab === 'today') {
      return (
        <TodayScreen
          userName={effectiveSession?.name || today.userName}
          title={today.title}
          explanation={today.explanation}
          continuity={today.continuity}
          context={today.context}
          remoteError={remoteError}
          loading={loading}
          onRefresh={refresh}
          onSpeak={openVoice}
          onQuickCheckIn={openQuickCheckIn}
          onOpenTodayMirror={openTodayMirror}
          onOpenMyDay={openMyDay}
          onOpenMonthly={openMonthlyReflection}
          onOpenPaywall={openPaywall}
          onWrite={handleWrite}
          onSkip={handleSkip}
          onOpenServices={openServicesHub}
          onOpenFooterLinks={openFooterLinks}
          onOpenSupport={openSupport}
          onOpenLegal={openLegal}
          onOpenPublicHome={openPublicHome}
          onOpenAuth={openAuthScreen}
          lang={lang}
          setLang={setLang}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
        />
      );
    }

    if (view.tab === 'story') {
      return <YourStoryScreen entries={thread} onBack={() => openTab('today')} lang={lang} />;
    }

    if (view.tab === 'rhythm') {
      return <RhythmScreen stage={insightStage} onBack={() => openTab('today')} lang={lang} />;
    }

    if (view.tab === 'menu') {
      return (
        <ServicesHubScreen
          onBack={() => openTab('today')}
          onOpenToday={() => openTab('today')}
          onOpenStory={() => openTab('story')}
          onOpenRhythm={() => openTab('rhythm')}
          onOpenYou={() => openTab('you')}
          onOpenPublicHome={openPublicHome}
          onOpenAuth={openAuthScreen}
          onOpenMemberZone={openMemberZone}
          onOpenFooterLinks={openFooterLinks}
          onOpenAdmin={openAdmin}
          onOpenBodyMap={openBodyMap}
          onOpenRitualPath={openRitualPath}
          onOpenBridge={openBridge}
          onOpenKnowledge={openKnowledge}
          onOpenHealthReports={openHealthReports}
          onOpenSupport={openSupport}
          onOpenVoice={openVoice}
          onOpenRelationships={openRelationships}
          onOpenFamily={openFamily}
          onOpenCreative={openCreative}
          onOpenMedicationNotes={openMedicationNotes}
          onOpenResetRoom={openResetRoom}
          onOpenVoiceFiles={openVoiceFiles}
          onOpenHowItWorks={openHowItWorks}
          onOpenContact={openContact}
          onOpenAbout={openAbout}
          lang={lang}
          setLang={setLang}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
        />
      );
    }

    return (
      <YouScreen
        dayOfMonth={new Date().getDate()}
        onOpenPaywall={openPaywall}
        onOpenMonthly={openMonthlyReflection}
        onOpenVoice={openVoice}
        onOpenQuickCheckIn={openQuickCheckIn}
        onOpenToday={() => openTab('today')}
        onOpenStory={() => openTab('story')}
        onOpenRhythm={() => openTab('rhythm')}
        onOpenTodayMirror={openTodayMirror}
        onOpenMyDay={openMyDay}
        onOpenResult={() => setView({ type: 'result' })}
        onOpenMemberZone={openMemberZone}
        onOpenFooterLinks={openFooterLinks}
        onOpenAdmin={openAdmin}
        onOpenServices={openServicesHub}
        onOpenPublicHome={openPublicHome}
        onOpenAuth={openAuthScreen}
        onOpenRelationships={openRelationships}
        onOpenFamily={openFamily}
        onOpenCreative={openCreative}
        onOpenMedicationNotes={openMedicationNotes}
        onOpenResetRoom={openResetRoom}
        onOpenVoiceFiles={openVoiceFiles}
        onOpenHowItWorks={openHowItWorks}
        onOpenContact={openContact}
        onOpenAbout={openAbout}
        lang={lang}
        setLang={setLang}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
        onSignOut={async () => {
          if (auth.session) {
            await auth.signOut();
          }
          setGuestMode(false);
          setShowPublicHome(true);
          setPreAuthScreen('public');
          setView({ type: 'onboarding' });
        }}
      />
    );
  }, [
    view,
    today,
    remoteError,
    loading,
    refresh,
    thread,
    insightStage,
    auth.signOut,
    effectiveSession?.name,
    auth.session,
    lang,
    themeMode,
  ]);

  if (auth.loading) {
    return (
      <AppShell mode={themeMode}>
        <PublicHomeScreen
          onOpenAuth={openAuthScreen}
          onOpenAboutFlow={() => {
            openGuestMenu();
          }}
          onOpenApp={() => {
            setGuestMode(true);
            setShowPublicHome(false);
            setPreAuthScreen('public');
            setView({ type: 'onboarding' });
          }}
          onOpenSupport={openGuestSupport}
          onOpenLegal={openGuestLegal}
          lang={lang}
          setLang={setLang}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
          onOpenMenu={openGuestMenu}
          onOpenFooter={openGuestFooter}
          loading
        />
      </AppShell>
    );
  }

  if (showPublicHome) {
    return (
      <AppShell mode={themeMode}>
        <PublicHomeScreen
          onOpenAuth={openAuthScreen}
          onOpenAboutFlow={() => {
            openGuestMenu();
          }}
          onOpenApp={() => {
            setGuestMode(true);
            setShowPublicHome(false);
            setPreAuthScreen('public');
            setView({ type: 'onboarding' });
          }}
          onOpenSupport={openGuestSupport}
          onOpenLegal={openGuestLegal}
          lang={lang}
          setLang={setLang}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
          onOpenMenu={openGuestMenu}
          onOpenFooter={openGuestFooter}
        />
      </AppShell>
    );
  }

  if (!effectiveSession) {
    if (preAuthScreen === 'public') {
      return (
        <AppShell mode={themeMode}>
          <PublicHomeScreen
            onOpenAuth={openAuthScreen}
            onOpenAboutFlow={() => {
              openGuestMenu();
            }}
            onOpenApp={() => {
              setGuestMode(true);
              setShowPublicHome(false);
              setPreAuthScreen('public');
              setView({ type: 'onboarding' });
            }}
            onOpenSupport={openGuestSupport}
            onOpenLegal={openGuestLegal}
            lang={lang}
            setLang={setLang}
            themeMode={themeMode}
            onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
            onOpenMenu={openGuestMenu}
            onOpenFooter={openGuestFooter}
          />
        </AppShell>
      );
    }
    return (
      <AppShell mode={themeMode}>
        <AuthScreen
          onSignIn={async (email, password) => {
            try {
              await auth.signIn(email, password);
              setGuestMode(false);
              setShowPublicHome(false);
              setPreAuthScreen('public');
              openTab('today');
            } catch (error) {
              auth.setError(error instanceof Error ? error.message : 'Sign in failed.');
            }
          }}
          onSignUp={async (name, email, password) => {
            try {
              await auth.signUp(name, email, password);
              setGuestMode(false);
              setShowPublicHome(false);
              setPreAuthScreen('public');
              openTab('today');
            } catch (error) {
              auth.setError(error instanceof Error ? error.message : 'Sign up failed.');
            }
          }}
          onBack={() => {
            setPreAuthScreen('public');
            setShowPublicHome(true);
          }}
          error={auth.error}
          lang={lang}
          setLang={setLang}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
        />
      </AppShell>
    );
  }

  if (view.type === 'onboarding') {
    return (
      <AppShell mode={themeMode}>
        <OnboardingScreen onBeginVoice={openVoice} onComplete={() => openTab('today')} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'voice') {
    return (
      <AppShell mode={themeMode}>
        <VoiceReflectionScreen onBack={() => openTab('today')} onFinish={openResult} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'quickCheckIn') {
    return (
      <AppShell mode={themeMode}>
        <QuickCheckInScreen onBack={() => openTab('today')} onSubmit={handleQuickCheckIn} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'todayMirror') {
    return (
      <AppShell mode={themeMode}>
        <TodayMirrorScreen
          userName={effectiveSession.name || today.userName}
          explanation={today.explanation}
          continuity={today.continuity}
          context={today.context}
          onSpeak={openVoice}
          onQuickCheckIn={openQuickCheckIn}
          onBack={() => openTab('today')}
          lang={lang}
        />
      </AppShell>
    );
  }

  if (view.type === 'myDay') {
    return (
      <AppShell mode={themeMode}>
        <MyDayWithLunaScreen context={today.context} onBack={() => openTab('today')} onSpeak={openVoice} />
      </AppShell>
    );
  }

  if (view.type === 'monthlyReflection') {
    return (
      <AppShell mode={themeMode}>
        <MonthlyReflectionScreen onBack={() => openTab('today')} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'memberZone') {
    return (
      <AppShell mode={themeMode}>
        <MemberZoneScreen
          onBack={() => openTab('today')}
          onOpenToday={() => openTab('today')}
          onOpenStory={() => openTab('story')}
          onOpenRhythm={() => openTab('rhythm')}
          onOpenVoice={openVoice}
          onOpenQuickCheckIn={openQuickCheckIn}
          onOpenTodayMirror={openTodayMirror}
          onOpenMyDay={openMyDay}
          onOpenMonthly={openMonthlyReflection}
          onOpenPaywall={openPaywall}
          onOpenServices={openServicesHub}
          onOpenHealthReports={openHealthReports}
          lang={lang}
        />
      </AppShell>
    );
  }

  if (view.type === 'footerLinks') {
    return (
      <AppShell mode={themeMode}>
        <FooterLinksScreen
          onBack={() => openTab('today')}
          onOpenToday={() => openTab('today')}
          onOpenStory={() => openTab('story')}
          onOpenRhythm={() => openTab('rhythm')}
          onOpenYou={() => openTab('you')}
          onOpenPublicHome={openPublicHome}
          onOpenAuth={openAuthScreen}
          onOpenMemberZone={openMemberZone}
          onOpenAdmin={openAdmin}
          onOpenServices={openServicesHub}
          lang={lang}
          setLang={setLang}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
        />
      </AppShell>
    );
  }

  if (view.type === 'admin') {
    // Admin UI only when server session returned elevated permissions (never local grant).
    const hasAdminAccess = Boolean(
      auth.session &&
        auth.session.id &&
        auth.session.id !== 'local-super-admin' &&
        (auth.session.permissions.includes('manage_services') ||
          auth.session.permissions.includes('manage_admin_roles')),
    );
    return (
      <AppShell mode={themeMode}>
        <AdminScreen
          onBack={() => openTab('today')}
          hasAccess={hasAdminAccess}
          onOpenFooterLinks={openFooterLinks}
          onOpenMemberZone={openMemberZone}
          lang={lang}
        />
      </AppShell>
    );
  }

  if (view.type === 'servicesHub') {
    return (
      <AppShell mode={themeMode}>
        <ServicesHubScreen
          onBack={() => openTab('today')}
          onOpenToday={() => openTab('today')}
          onOpenStory={() => openTab('story')}
          onOpenRhythm={() => openTab('rhythm')}
          onOpenYou={() => openTab('you')}
          onOpenPublicHome={openPublicHome}
          onOpenAuth={openAuthScreen}
          onOpenMemberZone={openMemberZone}
          onOpenFooterLinks={openFooterLinks}
          onOpenAdmin={openAdmin}
          onOpenBodyMap={openBodyMap}
          onOpenRitualPath={openRitualPath}
          onOpenBridge={openBridge}
          onOpenKnowledge={openKnowledge}
          onOpenHealthReports={openHealthReports}
          onOpenSupport={openSupport}
          onOpenVoice={openVoice}
          onOpenRelationships={openRelationships}
          onOpenFamily={openFamily}
          onOpenCreative={openCreative}
          onOpenMedicationNotes={openMedicationNotes}
          onOpenResetRoom={openResetRoom}
          onOpenVoiceFiles={openVoiceFiles}
          onOpenHowItWorks={openHowItWorks}
          onOpenContact={openContact}
          onOpenAbout={openAbout}
          lang={lang}
          setLang={setLang}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
        />
      </AppShell>
    );
  }

  if (view.type === 'bodyMap') {
    return (
      <AppShell mode={themeMode}>
        <BodyMapScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'ritualPath') {
    return (
      <AppShell mode={themeMode}>
        <RitualPathScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'bridge') {
    return (
      <AppShell mode={themeMode}>
        <BridgeMobileScreen onBack={openServicesHub} onOpenVoice={openVoice} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'knowledge') {
    return (
      <AppShell mode={themeMode}>
        <KnowledgeScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'healthReports') {
    return (
      <AppShell mode={themeMode}>
        <HealthReportsScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'support') {
    return (
      <AppShell mode={themeMode}>
        <SupportScreen onBack={openServicesHub} onOpenPartnerFaq={openPartnerFaq} onOpenLegal={openLegal} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'partnerFaq') {
    return (
      <AppShell mode={themeMode}>
        <PartnerFAQMobileScreen onBack={openSupport} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'legal') {
    return (
      <AppShell mode={themeMode}>
        <LegalMobileScreen
          onBack={openSupport}
          lang={lang}
          onOpenTerms={openTerms}
          onOpenMedical={openMedicalDisclaimer}
          onOpenCookies={openCookies}
          onOpenDataRights={openDataRights}
        />
      </AppShell>
    );
  }

  if (view.type === 'about') {
    return (
      <AppShell mode={themeMode}>
        <AboutLunaMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'howItWorks') {
    return (
      <AppShell mode={themeMode}>
        <HowItWorksMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'contact') {
    return (
      <AppShell mode={themeMode}>
        <ContactMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'voiceFiles') {
    return (
      <AppShell mode={themeMode}>
        <VoiceFilesMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'relationships') {
    return (
      <AppShell mode={themeMode}>
        <RelationshipsMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'family') {
    return (
      <AppShell mode={themeMode}>
        <FamilyMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'creative') {
    return (
      <AppShell mode={themeMode}>
        <CreativeStudioMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'medicationNotes') {
    return (
      <AppShell mode={themeMode}>
        <MedicationNotesMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'resetRoom') {
    return (
      <AppShell mode={themeMode}>
        <ResetRoomMobileScreen onBack={openServicesHub} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'terms') {
    return (
      <AppShell mode={themeMode}>
        <TermsMobileScreen onBack={openLegal} />
      </AppShell>
    );
  }

  if (view.type === 'medicalDisclaimer') {
    return (
      <AppShell mode={themeMode}>
        <MedicalDisclaimerMobileScreen onBack={openLegal} />
      </AppShell>
    );
  }

  if (view.type === 'cookies') {
    return (
      <AppShell mode={themeMode}>
        <CookiesMobileScreen onBack={openLegal} />
      </AppShell>
    );
  }

  if (view.type === 'dataRights') {
    return (
      <AppShell mode={themeMode}>
        <DataRightsMobileScreen
          onBack={openLegal}
          onDeleted={() => {
            void auth.signOut();
          }}
        />
      </AppShell>
    );
  }

  if (view.type === 'paywall') {
    return (
      <AppShell mode={themeMode}>
        <InsightsPaywallScreen onBack={() => openTab('today')} lang={lang} />
      </AppShell>
    );
  }

  if (view.type === 'result') {
    return (
      <AppShell mode={themeMode}>
        <ReflectionResultScreen
          userName={effectiveSession.name || today.userName}
          reflection={reflection}
          context={today.context}
          recentEntries={thread}
          onSeeRhythm={() => openTab('rhythm')}
          onSave={handleSave}
          onShare={handleShare}
          onBackToday={() => openTab('today')}
          hasPattern={reflectionCount >= 7}
          lang={lang}
        />
      </AppShell>
    );
  }

  return (
    <AppShell padded mode={themeMode}>
      <View style={styles.layout}>
        <View style={[styles.content, themeMode === 'dark' && styles.contentDark]}>{tabScreen}</View>
        <BottomTabs activeTab={activeTab} onSelect={openTab} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    gap: 10,
  },
  content: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(252, 247, 255, 0.84)',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  contentDark: {
    backgroundColor: 'rgba(10, 15, 31, 0.92)',
    borderColor: '#2f3a5a',
  },
});
