import React from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { LunaMenuLabel } from './SmoothLangText';
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
  navigateTo: (tab: TabType, options?: { openSidebar?: boolean; keepSidebar?: boolean }) => void;
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

  const isDark = theme === 'dark';

  const sidebarPanelClass =
    'luna-app-sidebar h-full w-[300px] bg-[#f8f5fa] dark:bg-[#0f1a33] backdrop-blur-xl border-r border-slate-200/90 dark:border-slate-500/25 shadow-luna-deep p-8 flex flex-col overflow-y-auto no-scrollbar';

  const groupAccents = [
    {
      stripe: 'from-violet-400 via-fuchsia-400 to-violet-500',
      pillLight: 'bg-violet-100 border-violet-300/60 text-violet-950 shadow-[inset_4px_0_0_0_rgba(124,58,237,0.88),0_8px_20px_rgba(124,58,237,0.12)] ring-1 ring-violet-200/80',
      pillDark: 'bg-violet-500/24 border-violet-400/45 text-white shadow-[inset_4px_0_0_0_rgba(196,181,253,0.95),0_10px_24px_rgba(0,0,0,0.22)] ring-1 ring-violet-300/35',
      itemHoverLight: 'hover:bg-violet-50 hover:border-violet-200/50 hover:text-violet-950',
      itemHoverDark: 'hover:bg-violet-500/14 hover:border-violet-300/30 hover:text-white',
    },
    {
      stripe: 'from-teal-400 via-cyan-400 to-sky-500',
      pillLight: 'bg-teal-50 border-teal-300/60 text-teal-950 shadow-[inset_4px_0_0_0_rgba(20,184,166,0.88),0_8px_20px_rgba(20,184,166,0.1)] ring-1 ring-teal-200/80',
      pillDark: 'bg-teal-500/22 border-teal-400/40 text-white shadow-[inset_4px_0_0_0_rgba(153,246,228,0.95),0_10px_24px_rgba(0,0,0,0.22)] ring-1 ring-teal-300/30',
      itemHoverLight: 'hover:bg-teal-50 hover:border-teal-200/50 hover:text-teal-950',
      itemHoverDark: 'hover:bg-teal-500/12 hover:border-teal-300/28 hover:text-white',
    },
    {
      stripe: 'from-amber-400 via-orange-400 to-rose-400',
      pillLight: 'bg-amber-50 border-amber-300/60 text-amber-950 shadow-[inset_4px_0_0_0_rgba(245,158,11,0.88),0_8px_20px_rgba(245,158,11,0.1)] ring-1 ring-amber-200/80',
      pillDark: 'bg-amber-500/22 border-amber-400/40 text-white shadow-[inset_4px_0_0_0_rgba(253,230,138,0.95),0_10px_24px_rgba(0,0,0,0.22)] ring-1 ring-amber-300/30',
      itemHoverLight: 'hover:bg-amber-50 hover:border-amber-200/50 hover:text-amber-950',
      itemHoverDark: 'hover:bg-amber-500/12 hover:border-amber-300/28 hover:text-white',
    },
    {
      stripe: 'from-rose-400 via-pink-400 to-fuchsia-500',
      pillLight: 'bg-rose-50 border-rose-300/60 text-rose-950 shadow-[inset_4px_0_0_0_rgba(244,63,94,0.88),0_8px_20px_rgba(244,63,94,0.1)] ring-1 ring-rose-200/80',
      pillDark: 'bg-rose-500/22 border-rose-400/40 text-white shadow-[inset_4px_0_0_0_rgba(251,207,232,0.95),0_10px_24px_rgba(0,0,0,0.22)] ring-1 ring-rose-300/30',
      itemHoverLight: 'hover:bg-rose-50 hover:border-rose-200/50 hover:text-rose-950',
      itemHoverDark: 'hover:bg-rose-500/12 hover:border-rose-300/28 hover:text-white',
    },
    {
      stripe: 'from-sky-400 via-indigo-400 to-blue-500',
      pillLight: 'bg-sky-50 border-sky-300/60 text-sky-950 shadow-[inset_4px_0_0_0_rgba(14,165,233,0.88),0_8px_20px_rgba(14,165,233,0.1)] ring-1 ring-sky-200/80',
      pillDark: 'bg-sky-500/22 border-sky-400/40 text-white shadow-[inset_4px_0_0_0_rgba(186,230,253,0.95),0_10px_24px_rgba(0,0,0,0.22)] ring-1 ring-sky-300/30',
      itemHoverLight: 'hover:bg-sky-50 hover:border-sky-200/50 hover:text-sky-950',
      itemHoverDark: 'hover:bg-sky-500/12 hover:border-sky-300/28 hover:text-white',
    },
  ];

  const sidebarContent = (
    <>
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-0.5">
          <img src={getBrandAssetUrl('icon')} alt="" aria-hidden="true" className="h-14 w-auto object-contain select-none pointer-events-none" />
          <Logo size="sm" className="text-4xl leading-none" />
        </div>
        <button
          type="button"
          onClick={() => setShowSidebar(false)}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-200/20 text-2xl font-light text-slate-700 dark:text-white"
          aria-label="Close menu"
        >
          ×
        </button>
      </header>

      <div className="flex flex-col gap-7 flex-1">
        {sidebarGroups.map((group, idx) => {
          const accent = groupAccents[idx % groupAccents.length];
          const groupActive = group.items.some((item) => item.id === activeTab);
          return (
          <div
            key={idx}
            className={`space-y-2 transition-opacity duration-300 ${groupActive ? 'opacity-100' : 'opacity-72 hover:opacity-90 dark:opacity-95 dark:hover:opacity-100'}`}
            aria-labelledby={`sidebar-group-${idx}`}
          >
            {idx > 0 && <div className="h-px bg-gradient-to-r from-transparent via-slate-200/90 to-transparent dark:via-white/20 mx-1 mb-1" />}
            <div className="relative px-1 pt-0.5">
              <div
                className={`absolute left-0 top-0 bottom-2 w-0.5 rounded-full bg-gradient-to-b ${accent.stripe} ${
                  groupActive ? 'opacity-100' : 'opacity-45 dark:opacity-35'
                }`}
              />
              <h3
                id={`sidebar-group-${idx}`}
                className={`pl-3 pb-2 mb-1 border-b text-[10px] font-black uppercase tracking-[0.34em] leading-none ${
                  groupActive
                    ? isDark
                      ? 'text-white border-white/35'
                      : 'text-slate-800 border-slate-300/55'
                    : isDark
                      ? 'text-white/82 border-white/18'
                      : 'text-slate-500 border-slate-200/80'
                }`}
              >
                {group.title}
              </h3>
            </div>
            <div className={`flex flex-col gap-1 px-0.5 ${groupActive ? '' : 'pl-0.5'}`}>
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const pillClass = isDark ? accent.pillDark : accent.pillLight;
                const hoverClass = isDark ? accent.itemHoverDark : accent.itemHoverLight;
                return (
                <button
                  key={item.id}
                  data-testid={`sidebar-nav-${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => navigateTo(item.id, { openSidebar: true, keepSidebar: true })}
                  className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-250 border text-left w-full ${
                    isActive
                      ? `${pillClass} scale-[1.015]`
                      : `border-transparent ${isDark ? 'text-white/92' : 'text-slate-700'} ${hoverClass}`
                  }`}
                >
                  {isActive && (
                    <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b ${accent.stripe}`} />
                  )}
                  <span className={`text-base shrink-0 ${isActive ? 'opacity-100' : 'opacity-75 dark:opacity-95'}`} aria-hidden>{item.icon}</span>
                  <span
                    className={`text-[11px] uppercase tracking-[0.12em] leading-snug ${
                      isActive ? 'font-bold' : 'font-semibold'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );})}
            </div>
          </div>
        );})}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/15 dark:border-slate-600/40">
        <button
          type="button"
          onClick={onLogout}
          className="w-full px-4 py-3 rounded-2xl border border-slate-300/70 dark:border-slate-500/45 text-slate-700 dark:text-white text-[10px] font-black uppercase tracking-[0.2em] hover:border-luna-purple/60 transition-colors"
        >
          <LunaMenuLabel text={copy.logout} muted className="opacity-95 text-[10px] font-semibold uppercase tracking-[0.18em]" />
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className={`hidden lg:flex fixed inset-y-0 left-0 z-[90] ${sidebarPanelClass}`}>{sidebarContent}</aside>

      <nav className={`lg:hidden fixed inset-0 z-[1000] bg-slate-950/40 backdrop-blur-md transition-opacity duration-500 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowSidebar(false)}>
        <div className={`absolute left-0 top-0 ${sidebarPanelClass} transition-transform duration-500 ease-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
          {sidebarContent}
        </div>
      </nav>

      <header
        className="sticky top-0 z-[100] w-full lg:pl-[300px] bg-white/72 dark:bg-[#101a31]/74 backdrop-blur-xl border-b border-white/55 dark:border-white/12 shadow-sm transition-all duration-300"
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
