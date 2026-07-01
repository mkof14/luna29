import React from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { LunaMenuLabel, LunaShimmerText } from './SmoothLangText';
import { Logo } from './Logo';
import { Language, getLang } from '../constants';
import { TabType } from '../utils/navigation';
import { langMap } from '../utils/languages';
import { getBrandAssetUrl } from '../utils/lunaBrandAssets';

type NavItem = {
  id: TabType;
  label: string;
  icon: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

interface AppShellNavProps {
  activeTab: TabType;
  showSidebar: boolean;
  setShowSidebar: (next: boolean) => void;
  navigateTo: (tab: TabType) => void;
  sidebarGroups: NavGroup[];
  topNavItems: NavItem[];
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onLogout: () => void;
}

export const AppShellNav: React.FC<AppShellNavProps> = ({
  activeTab,
  showSidebar,
  setShowSidebar,
  navigateTo,
  sidebarGroups,
  topNavItems,
  lang,
  setLang,
  theme,
  setTheme,
  onLogout,
}) => {
  const moreByLang = langMap('More', { ru: 'Еще', uk: 'Ще', es: 'Más', fr: 'Plus', de: 'Mehr', zh: '更多', ja: 'その他', pt: 'Mais', ar: 'المزيد', he: 'עוד' });
  const logoutByLang = langMap('Logout', { ru: 'Выйти', uk: 'Вийти', es: 'Salir', fr: 'Quitter', de: 'Abmelden', zh: '退出', ja: 'ログアウト', pt: 'Sair', ar: 'خروج', he: 'יציאה' });
  const copy = { more: getLang(moreByLang, lang), logout: getLang(logoutByLang, lang) };
  const quickStartByLang = langMap('Quick Start', {
    ru: 'Быстрый Старт',
    uk: 'Швидкий Старт',
    es: 'Inicio Rapido',
    fr: 'Demarrage Rapide',
    de: 'Schnellstart',
    zh: '快速开始',
    ja: 'クイックスタート',
    pt: 'Inicio Rapido',
    ar: 'بدء سريع',
    he: 'התחלה מהירה',
  });
  const quickStartHintByLang = langMap(
    {
      dashboard: 'Step 1: Start with a quick check-in.',
      cycle: 'Step 2: Review your cycle context.',
      bridge: 'Step 3: Turn state into clear communication.',
      other: 'Core flow lives in Home → Cycle → Bridge.',
    },
    {
      ru: {
        dashboard: 'Шаг 1: начните с короткого check-in.',
        cycle: 'Шаг 2: проверьте контекст цикла.',
        bridge: 'Шаг 3: переведите состояние в ясное сообщение.',
        other: 'Базовый маршрут: Home → Cycle → Bridge.',
      },
      uk: {
        dashboard: 'Крок 1: почніть із короткого check-in.',
        cycle: 'Крок 2: перегляньте контекст циклу.',
        bridge: 'Крок 3: перетворіть стан на зрозуміле повідомлення.',
        other: 'Базовий маршрут: Home → Cycle → Bridge.',
      },
      es: {
        dashboard: 'Paso 1: inicia con un check-in rapido.',
        cycle: 'Paso 2: revisa el contexto del ciclo.',
        bridge: 'Paso 3: convierte el estado en mensaje claro.',
        other: 'Ruta base: Home → Cycle → Bridge.',
      },
      fr: {
        dashboard: 'Etape 1: commencez par un check-in rapide.',
        cycle: 'Etape 2: verifiez le contexte du cycle.',
        bridge: 'Etape 3: transformez l etat en message clair.',
        other: 'Parcours de base: Home → Cycle → Bridge.',
      },
      de: {
        dashboard: 'Schritt 1: mit kurzem Check-in starten.',
        cycle: 'Schritt 2: Zykluskontext ansehen.',
        bridge: 'Schritt 3: Zustand in klare Botschaft ubersetzen.',
        other: 'Basispfad: Home → Cycle → Bridge.',
      },
      zh: {
        dashboard: '第1步：先做一次快速 check-in。',
        cycle: '第2步：查看周期上下文。',
        bridge: '第3步：把状态转成清晰表达。',
        other: '核心路径：Home → Cycle → Bridge。',
      },
      ja: {
        dashboard: 'ステップ1: まず短いチェックイン。',
        cycle: 'ステップ2: サイクル文脈を確認。',
        bridge: 'ステップ3: 状態を明確な言葉に変換。',
        other: '基本導線: Home → Cycle → Bridge。',
      },
      pt: {
        dashboard: 'Passo 1: comece com um check-in rapido.',
        cycle: 'Passo 2: revise o contexto do ciclo.',
        bridge: 'Passo 3: transforme o estado em mensagem clara.',
        other: 'Fluxo base: Home → Cycle → Bridge.',
      },
      ar: {
        dashboard: 'الخطوة 1: ابدئي بفحص سريع.',
        cycle: 'الخطوة 2: راجعي سياق الدورة.',
        bridge: 'الخطوة 3: حوّلي حالتك إلى تواصل واضح.',
        other: 'المسار الأساسي: Home → Cycle → Bridge.',
      },
      he: {
        dashboard: 'שלב 1: התחילי עם check-in קצר.',
        cycle: 'שלב 2: בדקי את הקשר המחזור.',
        bridge: 'שלב 3: הפכי מצב לתקשורת ברורה.',
        other: 'מסלול ליבה: Home → Cycle → Bridge.',
      },
    }
  );
  const quickStartCopy = getLang(quickStartHintByLang, lang) || quickStartHintByLang.en;
  const quickStartKey: 'dashboard' | 'cycle' | 'bridge' | 'other' =
    activeTab === 'today_mirror'
      ? 'dashboard'
      : activeTab === 'cycle'
        ? 'cycle'
        : activeTab === 'history'
          ? 'bridge'
          : 'other';

  return (
    <>
      <nav className={`fixed inset-0 z-[1000] bg-slate-950/40 backdrop-blur-md transition-opacity duration-500 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowSidebar(false)}>
        <div className={`absolute left-0 top-0 h-full w-[340px] bg-slate-700/88 dark:bg-[#111c33]/86 backdrop-blur-xl border-r border-white/20 dark:border-white/10 shadow-luna-deep transition-transform duration-500 ease-out p-8 flex flex-col overflow-y-auto no-scrollbar ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-0.5">
              <img src={getBrandAssetUrl('icon')} alt="" aria-hidden="true" className="h-16 w-auto md:h-20 object-contain select-none pointer-events-none" />
              <Logo size="sm" className="text-5xl leading-none" />
            </div>
            <button onClick={() => setShowSidebar(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-2xl font-light">×</button>
          </header>

          <div className="flex flex-col gap-10">
            {sidebarGroups.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] px-4">
                  <LunaShimmerText text={group.title} className="opacity-90 font-black" />
                </h4>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      data-testid={`sidebar-nav-${item.id}`}
                      onClick={() => navigateTo(item.id)}
                      className={`flex items-center p-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-luna-purple/18 text-white font-bold shadow-sm' : 'hover:bg-white/12 dark:hover:bg-slate-800 text-white/95 dark:text-white'}`}
                    >
                      <LunaMenuLabel
                        text={item.label}
                        active={activeTab === item.id}
                        className="text-[11px] font-black uppercase tracking-[0.2em]"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 rounded-2xl border border-white/30 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] hover:border-luna-purple/60 transition-colors"
            >
              <LunaMenuLabel text={copy.logout} muted className="opacity-95" />
            </button>
          </div>
        </div>
      </nav>

      <header
        className="sticky top-0 z-[100] w-full bg-white/72 dark:bg-[#101a31]/74 backdrop-blur-xl border-b border-white/55 dark:border-white/12 shadow-sm transition-all duration-300"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 md:gap-8 shrink-0">
            <button
              data-testid="nav-logo-dashboard"
              onClick={() => navigateTo('today_mirror')}
              className="flex items-center gap-0.5 origin-left scale-[1.12] hover:scale-[1.16] active:scale-[1.08] transition-transform"
            >
              <img src={getBrandAssetUrl('icon')} alt="" aria-hidden="true" className="h-16 w-auto md:h-20 object-contain select-none pointer-events-none" />
              <Logo size="sm" className="text-5xl leading-none" />
            </button>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 flex-grow justify-center lg:justify-start px-2">
            {topNavItems.map((item) => (
              <button
                key={item.id}
                data-testid={`top-nav-${item.id}`}
                onClick={() => navigateTo(item.id)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-luna-purple/10 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <span className="hidden sm:inline">
                  <LunaMenuLabel text={item.label} active={activeTab === item.id} />
                </span>
              </button>
            ))}
            <button
              data-testid="top-nav-more"
              onClick={() => setShowSidebar(true)}
              className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 opacity-80 hover:opacity-100"
            >
              <span className="text-sm animate-color-shift-luna-suffix">➕</span>
              <span className="hidden sm:inline">
                <LunaMenuLabel text={copy.more} muted />
              </span>
            </button>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:block">
              <LanguageSelector current={lang} onSelect={setLang} />
            </div>
            <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            <button
              onClick={onLogout}
              className="hidden md:inline-flex px-3 py-2 rounded-full border border-slate-300/80 dark:border-slate-700/80 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-luna-purple hover:border-luna-purple/60 transition-colors"
            >
              {copy.logout}
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-2 hidden md:flex items-center gap-3">
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-luna-purple">{getLang(quickStartByLang, lang)}</span>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{quickStartCopy[quickStartKey]}</p>
        </div>
      </header>
    </>
  );
};
