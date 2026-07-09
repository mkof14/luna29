import React, { Suspense, lazy } from 'react';
import { dataService } from '../services/dataService';
import { AuthSession, CyclePhase, HealthEvent, HormoneData, RuleOutput, SystemState } from '../types';
import { Language, TranslationSchema, LangCopy, getLang } from '../constants';
import { langMap } from '../utils/languages';
import { TabType } from '../utils/navigation';
import type { MemberNavigateOptions } from '../utils/memberNavigation';
import type { LiveCloseSummary } from '../utils/liveSessionContinuity';
import CycleTimeline from './CycleTimeline';
import { DashboardView } from './DashboardView';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_USER_AGE } from '../constants/appDefaults';

import { MemberPageShell } from './member/MemberPageShell';

const LabsView = lazy(() => import('./LabsView').then((m) => ({ default: m.LabsView })));
const MedicationsView = lazy(() => import('./MedicationsView').then((m) => ({ default: m.MedicationsView })));
const HistoryView = lazy(() => import('./HistoryView').then((m) => ({ default: m.HistoryView })));
const HormoneLibraryView = lazy(() => import('./HormoneLibraryView').then((m) => ({ default: m.HormoneLibraryView })));
const CreativeStudio = lazy(() => import('./CreativeStudio').then((m) => ({ default: m.CreativeStudio })));
const BridgeView = lazy(() => import('./BridgeView').then((m) => ({ default: m.BridgeView })));
const FamilyView = lazy(() => import('./FamilyView').then((m) => ({ default: m.FamilyView })));
const AudioReflection = lazy(() => import('./AudioReflection').then((m) => ({ default: m.AudioReflection })));
const MyVoiceFilesView = lazy(() => import('./MyVoiceFilesView').then((m) => ({ default: m.MyVoiceFilesView })));
const FAQView = lazy(() => import('./FAQView').then((m) => ({ default: m.FAQView })));
const ContactView = lazy(() => import('./ContactView').then((m) => ({ default: m.ContactView })));
const ProfileView = lazy(() => import('./ProfileView').then((m) => ({ default: m.ProfileView })));
const PrivacyPolicyView = lazy(() => import('./PrivacyPolicyView').then((m) => ({ default: m.PrivacyPolicyView })));
const CrisisCenterView = lazy(() => import('./CrisisCenterView').then((m) => ({ default: m.CrisisCenterView })));
const PartnerFAQView = lazy(() => import('./PartnerFAQView').then((m) => ({ default: m.PartnerFAQView })));
const RelationshipsView = lazy(() => import('./RelationshipsView').then((m) => ({ default: m.RelationshipsView })));
const HowItWorksView = lazy(() => import('./HowItWorksView').then((m) => ({ default: m.HowItWorksView })));
const LegalDocumentView = lazy(() => import('./LegalDocumentView').then((m) => ({ default: m.LegalDocumentView })));
const AboutLunaView = lazy(() => import('./AboutLunaView').then((m) => ({ default: m.AboutLunaView })));
const TodayMirrorView = lazy(() => import('./TodayMirrorView').then((m) => ({ default: m.TodayMirrorView })));
const MyDayWithLunaView = lazy(() => import('./MyDayWithLunaView').then((m) => ({ default: m.MyDayWithLunaView })));
const MonthlyReflectionView = lazy(() => import('./MonthlyReflectionView').then((m) => ({ default: m.MonthlyReflectionView })));
const InsightsPaywallView = lazy(() => import('./InsightsPaywallView').then((m) => ({ default: m.InsightsPaywallView })));
const LunaRhythmCalendarView = lazy(() => import('./LunaRhythmCalendarView').then((m) => ({ default: m.LunaRhythmCalendarView })));
const MemberLearningView = lazy(() => import('./member/MemberLearningView').then((m) => ({ default: m.MemberLearningView })));
const MemberPricingView = lazy(() => import('./member/MemberPricingView').then((m) => ({ default: m.MemberPricingView })));
const MemberRitualView = lazy(() => import('./member/MemberRitualView').then((m) => ({ default: m.MemberRitualView })));

const LoadingFallback: React.FC<{ lang: Language }> = ({ lang }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-pulse">
    <div className="w-12 h-12 border-4 border-luna-purple border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
      {langMap('Syncing Architecture...', {
        ru: 'Синхронизация...',
        uk: 'Синхронізація...',
        es: 'Sincronizando arquitectura...',
        fr: 'Synchronisation...',
        de: 'Synchronisierung...',
        zh: '正在同步...',
        ja: '同期中...',
        pt: 'Sincronizando...',
        ar: 'جاري المزامنة...',
        he: 'מסנכרן...',
      })[lang]}
    </p>
  </div>
);

class MemberContentErrorBoundary extends React.Component<
  { lang: Language; onBackHome: () => void; resetKey: string; children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { lang: Language; onBackHome: () => void; resetKey: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unknown rendering error',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('Member content render error:', error);
  }

  componentDidUpdate(prevProps: { resetKey: string; lang: Language }) {
    // Reset the boundary when user navigates to another section or switches language.
    if (this.state.hasError && (prevProps.resetKey !== this.props.resetKey || prevProps.lang !== this.props.lang)) {
      this.setState({ hasError: false, message: '' });
    }
  }

  private handleBackHome = () => {
    this.setState({ hasError: false, message: '' }, () => {
      this.props.onBackHome();
    });
  };

  private handleHardReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      // no-op: continue with hard reload
    }

    const url = new URL(window.location.href);
    url.searchParams.set('reload', String(Date.now()));
    window.location.replace(url.toString());
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const copyByLang: LangCopy< { title: string; body: string; home: string; reload: string }> = {
      en: { title: 'Section Failed To Render', body: 'This section crashed while loading. You can go back home or reload.', home: 'Back To Home', reload: 'Reload' },
      ru: { title: 'Раздел Не Загрузился', body: 'Этот раздел упал при загрузке. Вернитесь на главную или перезагрузите страницу.', home: 'На Главную', reload: 'Перезагрузить' },
      uk: { title: 'Розділ Не Завантажився', body: 'Цей розділ впав під час завантаження. Поверніться на головну або перезавантажте сторінку.', home: 'На Головну', reload: 'Перезавантажити' },
      es: { title: 'La Sección Falló', body: 'Esta sección falló al cargar. Puedes volver al inicio o recargar.', home: 'Volver Al Inicio', reload: 'Recargar' },
      fr: { title: 'Échec Du Chargement', body: 'Cette section a échoué au chargement. Revenez à l accueil ou rechargez.', home: 'Retour Accueil', reload: 'Recharger' },
      de: { title: 'Bereich Konnte Nicht Laden', body: 'Dieser Bereich ist beim Laden abgestürzt. Zur Startseite oder neu laden.', home: 'Zur Startseite', reload: 'Neu Laden' },
      zh: { title: '页面加载失败', body: '该模块加载时发生错误。可返回首页或刷新页面。', home: '返回首页', reload: '刷新页面' },
      ja: { title: 'セクションの表示に失敗しました', body: 'このセクションの読み込み中にエラーが発生しました。ホームへ戻るか再読み込みしてください。', home: 'ホームへ戻る', reload: '再読み込み' },
      pt: { title: 'Falha Ao Carregar Seção', body: 'Esta seção falhou ao carregar. Volte ao início ou recarregue.', home: 'Voltar Ao Início', reload: 'Recarregar' },
      ar: { title: 'تعذّر عرض القسم', body: 'تعطّل هذا القسم أثناء التحميل. يمكنكِ العودة إلى الرئيسية أو إعادة التحميل.', home: 'العودة للرئيسية', reload: 'إعادة التحميل' },
      he: { title: 'הסעיף לא נטען', body: 'סעיף זה קרס בעת הטעינה. אפשר לחזור לדף הבית או לטעון מחדש.', home: 'חזרה לדף הבית', reload: 'טעינה מחדש' },};
    const copy = copyByLang[this.props.lang] || copyByLang.en;

    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-5">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-rose-400">{copy.title}</p>
        <p className="max-w-xl text-slate-500 font-semibold">{copy.body}</p>
        {this.state.message && (
          <p className="max-w-xl text-xs font-semibold text-rose-400/90 break-words">
            {this.state.message}
          </p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={this.handleBackHome} className="px-6 py-3 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest">
            {copy.home}
          </button>
          <button onClick={this.handleHardReload} className="px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
            {copy.reload}
          </button>
        </div>
      </section>
    );
  }
}

interface MainContentRouterProps {
  activeTab: TabType;
  lang: Language;
  ui: TranslationSchema;
  currentPhase: CyclePhase;
  systemState: SystemState;
  log: HealthEvent[];
  hormoneData: HormoneData[];
  ruleOutput: RuleOutput;
  isNarrativeLoading: boolean;
  stateNarrative: string | null;
  setSelectedHormone: (hormone: HormoneData | null) => void;
  setShowSyncOverlay: (next: boolean) => void;
  setShowLive: (next: boolean) => void;
  setLog: (log: HealthEvent[]) => void;
  navigateTo: (tab: TabType, options?: MemberNavigateOptions) => void;
  onMemberBack: () => void;
  session: AuthSession | null;
  onLogout: () => void;
  liveCloseSummary?: LiveCloseSummary | null;
  liveRefreshToken?: number;
  onContinueLiveConversation?: () => void;
  onDismissLiveContinuity?: () => void;
}

export const MainContentRouter: React.FC<MainContentRouterProps> = ({
  activeTab,
  lang,
  ui,
  currentPhase,
  systemState,
  log,
  hormoneData,
  ruleOutput,
  isNarrativeLoading,
  stateNarrative,
  setSelectedHormone,
  setShowSyncOverlay,
  setShowLive,
  setLog,
  navigateTo,
  onMemberBack,
  session,
  onLogout,
  liveCloseSummary = null,
  liveRefreshToken = 0,
  onContinueLiveConversation,
  onDismissLiveContinuity,
}) => {
  return (
    <main data-testid={`member-tab-${activeTab}`} className="flex-grow max-w-7xl mx-auto w-full px-6 pt-12 pb-40 relative z-10 member-tab-content">
      <div className="pointer-events-none absolute -top-16 left-10 w-72 h-72 rounded-full bg-[#f2ccda]/20 dark:bg-luna-purple/18 blur-[90px]" />
      <div className="pointer-events-none absolute top-1/3 right-0 w-96 h-96 rounded-full bg-[#d6dff7]/24 dark:bg-[#1e3a7a]/20 blur-[120px]" />
      <MemberContentErrorBoundary lang={lang} resetKey={`${activeTab}:${lang}`} onBackHome={onMemberBack}>
      <MemberPageShell tab={activeTab} lang={lang} ui={ui}>
      <Suspense fallback={<LoadingFallback lang={lang} />}>
        {activeTab === 'dashboard' && (
          <DashboardView
            lang={lang}
            ui={ui}
            currentPhase={currentPhase}
            ruleOutput={ruleOutput}
            isNarrativeLoading={isNarrativeLoading}
            stateNarrative={stateNarrative}
            hormoneData={hormoneData}
            setSelectedHormone={setSelectedHormone}
            setShowSyncOverlay={setShowSyncOverlay}
            setShowLive={setShowLive}
            navigateTo={navigateTo}
          />
        )}
        {activeTab === 'today_mirror' && (
          <TodayMirrorView
            lang={lang}
            currentPhase={currentPhase}
            systemState={systemState}
            events={log}
            onSpeak={() => navigateTo('reflections')}
            onQuickCheckin={() => setShowSyncOverlay(true)}
            onOpenMyDay={() => navigateTo('my_day')}
            onOpenMonthly={() => navigateTo('monthly_reflection')}
            onOpenMemory={() => navigateTo('profile')}
            liveCloseSummary={liveCloseSummary}
            liveRefreshToken={liveRefreshToken}
            onContinueLiveConversation={onContinueLiveConversation}
            onDismissLiveContinuity={onDismissLiveContinuity}
          />
        )}
        {activeTab === 'my_day' && (
          <MyDayWithLunaView
            lang={lang}
            currentPhase={currentPhase}
            systemState={systemState}
            events={log}
            onSpeak={() => navigateTo('reflections')}
            onBack={onMemberBack}
          />
        )}
        {activeTab === 'monthly_reflection' && (
          <MonthlyReflectionView
            lang={lang}
            currentPhase={currentPhase}
            systemState={systemState}
            events={log}
            onBack={onMemberBack}
          />
        )}
        {activeTab === 'insights_paywall' && <InsightsPaywallView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'rhythm_calendar' && (
          <LunaRhythmCalendarView
            lang={lang}
            log={log}
            currentCycleDay={systemState.currentDay}
            cycleLength={systemState.cycleLength}
            onBack={onMemberBack}
            memberEmail={session?.email}
            syncEnabled={Boolean(session?.id)}
          />
        )}
        {activeTab === 'about' && <AboutLunaView lang={lang} mode="member" onBack={onMemberBack} />}
        {activeTab === 'cycle' && (
          <CycleTimeline
            currentDay={systemState.currentDay}
            lang={lang}
            onDayChange={(day) => {
              dataService.logEvent('CYCLE_SYNC', { day, length: DEFAULT_CYCLE_LENGTH });
              setLog(dataService.getLog());
            }}
            isDetailed={true}
            onBack={onMemberBack}
          />
        )}
        {activeTab === 'profile' && <ProfileView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'bridge' && <BridgeView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'relationships' && <RelationshipsView phase={currentPhase} lang={lang} onBack={onMemberBack} />}
        {activeTab === 'family' && <FamilyView phase={currentPhase} lang={lang} onBack={onMemberBack} />}
        {activeTab === 'reflections' && <AudioReflection onBack={onMemberBack} lang={lang} />}
        {activeTab === 'voice_files' && <MyVoiceFilesView onBack={onMemberBack} lang={lang} />}
        {activeTab === 'creative' && <CreativeStudio lang={lang} onBack={onMemberBack} />}
        {activeTab === 'labs' && (
          <LabsView
            day={systemState.currentDay}
            age={DEFAULT_USER_AGE}
            lang={lang}
            userId={session?.id}
            userName={session?.name}
            onBack={onMemberBack}
          />
        )}
        {activeTab === 'meds' && <MedicationsView medications={systemState.medications} lang={lang} onBack={onMemberBack} />}
        {activeTab === 'history' && <HistoryView log={dataService.getLog()} lang={lang} onBack={onMemberBack} />}
        {activeTab === 'privacy' && <PrivacyPolicyView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'terms' && <LegalDocumentView lang={lang} doc="terms" onBack={onMemberBack} mode="member" />}
        {activeTab === 'medical' && <LegalDocumentView lang={lang} doc="medical" onBack={onMemberBack} mode="member" />}
        {activeTab === 'cookies' && <LegalDocumentView lang={lang} doc="cookies" onBack={onMemberBack} mode="member" />}
        {activeTab === 'data_rights' && <LegalDocumentView lang={lang} doc="data_rights" onBack={onMemberBack} mode="member" />}
        {activeTab === 'library' && <HormoneLibraryView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'faq' && <FAQView lang={lang} mode="member" onBack={onMemberBack} />}
        {activeTab === 'partner_faq' && <PartnerFAQView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'contact' && <ContactView ui={ui} lang={lang} onBack={onMemberBack} />}
        {activeTab === 'crisis' && <CrisisCenterView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'how_it_works' && <HowItWorksView lang={lang} onBack={onMemberBack} mode="member" />}
        {activeTab === 'learning' && <MemberLearningView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'pricing' && <MemberPricingView lang={lang} onBack={onMemberBack} />}
        {activeTab === 'ritual_path' && <MemberRitualView lang={lang} onBack={onMemberBack} />}
      </Suspense>
      </MemberPageShell>
      </MemberContentErrorBoundary>
    </main>
  );
};
