import React, { useEffect, useMemo, useState } from 'react';
import { Facebook, Instagram, Music2, Youtube } from 'lucide-react';
import { Logo } from './Logo';
import LanguageSelector from './LanguageSelector';
import { LunaMenuLabel, LunaShimmerText } from './SmoothLangText';
import ThemeToggle from './ThemeToggle';
import { TabType } from '../utils/navigation';
import { getMemberNavCopy } from '../utils/memberNavLabels';
import { getBrandAssetUrl } from '../utils/lunaBrandAssets';
import { getLegalNavLabels } from '../utils/legal';
import { getLandingNarratives } from '../utils/publicLandingNarratives';
import {
  getFooterMicroRitual,
  getFooterMoonAccent,
  getFooterSpiritActions,
  getFooterTrustLine,
} from '../utils/publicFooterSpirit';
import { MEMBER_FOOTER_EXPLORE_TABS } from '../utils/memberFooterNavigation';
import { Language, TranslationSchema, LangCopy, getLang } from '../constants';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface AppFooterProps {
  ui: TranslationSchema;
  lang: Language;
  theme: 'light' | 'dark';
  setLang: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  navigateTo: (tab: TabType) => void;
  onOpenLive?: () => void;
}

type FooterTabLink = { id: TabType; label: string; testId?: string };

const normalizeExternalUrl = (value: unknown) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString();
  } catch {
    return '';
  }
  return '';
};

export const AppFooter: React.FC<AppFooterProps> = ({
  ui,
  lang,
  theme,
  setLang,
  setTheme,
  navigateTo,
  onOpenLive,
}) => {
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mobilePlatform, setMobilePlatform] = useState<'ios' | 'android' | 'other'>('other');

  const appStoreUrl = normalizeExternalUrl(import.meta.env.VITE_APP_STORE_URL);
  const googlePlayUrl = normalizeExternalUrl(import.meta.env.VITE_GOOGLE_PLAY_URL);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandaloneMode(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setMobilePlatform('ios');
    else if (/android/.test(ua)) setMobilePlatform('android');
    else setMobilePlatform('other');

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const runMemberInstall = async () => {
    if (!deferredPrompt) {
      setShowInstallGuideModal(true);
      return;
    }
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  const memberNav = getMemberNavCopy(lang);
  const homeStory = getLandingNarratives(lang).homeStory;
  const footerMicroRitual = getFooterMicroRitual(lang);
  const footerTrustLine = getFooterTrustLine(lang);
  const footerSpiritActions = getFooterSpiritActions(lang);
  const footerMoonAccent = getFooterMoonAccent(lang);
  const legalNav = getLegalNavLabels(lang);

  const footerSectionTitlesByLang: LangCopy<{ explore: string; legal: string; install: string; preferences: string }> = {
    en: { explore: 'Explore', legal: 'Legal', install: 'Install App', preferences: 'Language & Theme' },
    ru: { explore: 'Разделы', legal: 'Юридический раздел', install: 'Установить App', preferences: 'Язык и тема' },
    uk: { explore: 'Розділи', legal: 'Юридичний розділ', install: 'Встановити App', preferences: 'Мова і тема' },
    es: { explore: 'Secciones', legal: 'Legal', install: 'Instalar App', preferences: 'Idioma y tema' },
    fr: { explore: 'Sections', legal: 'Juridique', install: 'Installer App', preferences: 'Langue et theme' },
    de: { explore: 'Bereiche', legal: 'Rechtliches', install: 'App installieren', preferences: 'Sprache und Design' },
    zh: { explore: '页面', legal: '法律信息', install: '安装 App', preferences: '语言与主题' },
    ja: { explore: 'ページ', legal: '法務情報', install: 'App をインストール', preferences: '言語とテーマ' },
    pt: { explore: 'Secoes', legal: 'Legal', install: 'Instalar App', preferences: 'Idioma e tema' },
    ar: { explore: 'استكشاف', legal: 'قانوني', install: 'تثبيت التطبيق', preferences: 'اللغة والمظهر' },
    he: { explore: 'חקירה', legal: 'משפטי', install: 'התקנת אפליקציה', preferences: 'שפה וערכת נושא' },
  };

  const pricingLabelByLang: LangCopy<string> = {
    en: 'Pricing', ru: 'Тарифы', uk: 'Тарифи', es: 'Precios', fr: 'Tarifs', de: 'Preise', zh: '价格', ja: '料金', pt: 'Preços', ar: 'الأسعار', he: 'מחירים',
  };
  const aboutLabelByLang: LangCopy<string> = {
    en: 'About', ru: 'О проекте', uk: 'Про проект', es: 'Acerca', fr: 'A propos', de: 'Uber', zh: '关于', ja: '概要', pt: 'Sobre', ar: 'حول Luna29', he: 'אודות Luna29',
  };
  const howItWorksLabelByLang: LangCopy<string> = {
    en: 'How It Works', ru: 'Как это работает', uk: 'Як це працює', es: 'Cómo funciona', fr: 'Comment ça marche', de: 'So funktioniert es', zh: '如何运作', ja: '使い方', pt: 'Como funciona', ar: 'كيف يعمل', he: 'איך זה עובד',
  };
  const faqLabelByLang: LangCopy<string> = {
    en: 'FAQ', ru: 'FAQ', uk: 'FAQ', es: 'FAQ', fr: 'FAQ', de: 'FAQ', zh: '常见问题', ja: 'FAQ', pt: 'FAQ', ar: 'الأسئلة الشائعة', he: 'שאלות נפוצות',
  };
  const learningLabelByLang: LangCopy<string> = {
    en: 'Learning', ru: 'Обучение', uk: 'Навчання', es: 'Aprendizaje', fr: 'Apprentissage', de: 'Lernen', zh: '学习', ja: '学習', pt: 'Aprendizagem', ar: 'التعلّم', he: 'לימוד',
  };

  const publicHomeNavLabelsByLang: LangCopy<{ ritual: string }> = {
    en: { ritual: 'Ritual Path' },
    ru: { ritual: 'Ритуальный путь' },
    uk: { ritual: 'Ритуальний шлях' },
    es: { ritual: 'Ruta ritual' },
    fr: { ritual: 'Chemin rituel' },
    de: { ritual: 'Ritualpfad' },
    zh: { ritual: '仪式路径' },
    ja: { ritual: 'リチュアルパス' },
    pt: { ritual: 'Caminho ritual' },
    ar: { ritual: 'المسار الطقسي' },
    he: { ritual: 'נתיב טקסי' },
  };

  const themeLabelByLang: LangCopy<string> = {
    en: 'Theme', ru: 'Тема', uk: 'Тема', es: 'Tema', fr: 'Thème', de: 'Thema', zh: '主题', ja: 'テーマ', pt: 'Tema', ar: 'المظهر', he: 'ערכת נושא',
  };

  const installActionsByLang: LangCopy<{ android: string; desktop: string; social: string }> = {
    en: { android: 'Android Install', desktop: 'Install on Desktop', social: 'Social' },
    ru: { android: 'Установить на Android', desktop: 'Установить на компьютер', social: 'Соцсети' },
    uk: { android: 'Встановити на Android', desktop: 'Встановити на компʼютер', social: 'Соцмережі' },
    es: { android: 'Instalar en Android', desktop: 'Instalar en escritorio', social: 'Social' },
    fr: { android: 'Installer Android', desktop: 'Installer sur ordinateur', social: 'Social' },
    de: { android: 'Android installieren', desktop: 'Auf Desktop installieren', social: 'Social' },
    zh: { android: 'Android 安装', desktop: '桌面安装', social: '社交' },
    ja: { android: 'Android にインストール', desktop: 'デスクトップにインストール', social: 'SNS' },
    pt: { android: 'Instalar no Android', desktop: 'Instalar no desktop', social: 'Social' },
    ar: { android: 'تثبيت Android', desktop: 'تثبيت على سطح المكتب', social: 'Social' },
    he: { android: 'התקנה ב-Android', desktop: 'התקנה במחשב', social: 'Social' },
  };

  const storeBadgesByLang: LangCopy<{ appStore: string; googlePlay: string; soon: string }> = {
    en: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'Store links coming soon.' },
    ru: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'Ссылки на магазины скоро появятся.' },
    uk: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'Посилання на магазини зʼявляться незабаром.' },
    es: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'Enlaces de tiendas próximamente.' },
    fr: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'Liens stores bientôt disponibles.' },
    de: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'Store-Links folgen in Kürze.' },
    zh: { appStore: 'App Store', googlePlay: 'Google Play', soon: '商店链接即将上线。' },
    ja: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'ストアリンクは近日公開。' },
    pt: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'Links das lojas em breve.' },
    ar: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'روابط المتاجر قريباً.' },
    he: { appStore: 'App Store', googlePlay: 'Google Play', soon: 'קישורי החנות יופיעו בקרוב.' },
  };

  const installGuideModalByLang: LangCopy<{ title: string; close: string }> = {
    en: { title: 'Install Luna29', close: 'Close' },
    ru: { title: 'Установить Luna29', close: 'Закрыть' },
    uk: { title: 'Встановити Luna29', close: 'Закрити' },
    es: { title: 'Instalar Luna29', close: 'Cerrar' },
    fr: { title: 'Installer Luna29', close: 'Fermer' },
    de: { title: 'Luna29 installieren', close: 'Schließen' },
    zh: { title: '安装 Luna29', close: '关闭' },
    ja: { title: 'Luna29 をインストール', close: '閉じる' },
    pt: { title: 'Instalar Luna29', close: 'Fechar' },
    ar: { title: 'تثبيت Luna29', close: 'إغلاق' },
    he: { title: 'התקנת Luna29', close: 'סגירה' },
  };

  const footerSectionTitles = getLang(footerSectionTitlesByLang, lang) || footerSectionTitlesByLang.en;
  const publicHomeNavLabels = getLang(publicHomeNavLabelsByLang, lang) || publicHomeNavLabelsByLang.en;
  const installActions = getLang(installActionsByLang, lang) || installActionsByLang.en;
  const storeBadges = getLang(storeBadgesByLang, lang) || storeBadgesByLang.en;
  const installGuideModal = getLang(installGuideModalByLang, lang) || installGuideModalByLang.en;

  const exploreLabel = (id: TabType): string => {
    if (id === 'dashboard') return ui.publicHome.tabs.home;
    if (id === 'cycle') return ui.publicHome.tabs.map;
    if (id === 'rhythm_calendar') return memberNav.rhythmCalendar;
    if (id === 'ritual_path') return publicHomeNavLabels.ritual;
    if (id === 'bridge') return ui.navigation.bridge || 'The Bridge';
    if (id === 'pricing') return getLang(pricingLabelByLang, lang) || 'Pricing';
    if (id === 'about') return getLang(aboutLabelByLang, lang) || 'About';
    if (id === 'how_it_works') return getLang(howItWorksLabelByLang, lang) || 'How It Works';
    if (id === 'faq') return getLang(faqLabelByLang, lang) || 'FAQ';
    if (id === 'learning') return getLang(learningLabelByLang, lang) || 'Learning';
    return id;
  };

  const footerExploreLinks: FooterTabLink[] = useMemo(
    () =>
      MEMBER_FOOTER_EXPLORE_TABS.map((item) => ({
        id: item.id,
        testId: item.testId,
        label: exploreLabel(item.id),
      })),
    [lang, memberNav.rhythmCalendar, publicHomeNavLabels.ritual, ui.navigation.bridge, ui.publicHome.tabs.home, ui.publicHome.tabs.map]
  );

  const footerLegalLinks: FooterTabLink[] = useMemo(
    () => [
      { id: 'privacy', label: legalNav.privacy, testId: 'privacy' },
      { id: 'terms', label: legalNav.terms, testId: 'terms' },
      { id: 'medical', label: legalNav.medical, testId: 'medical' },
      { id: 'cookies', label: legalNav.cookies, testId: 'cookies' },
      { id: 'data_rights', label: legalNav.data_rights, testId: 'data_rights' },
    ],
    [legalNav]
  );

  const footerExploreMid = Math.ceil(footerExploreLinks.length / 2);
  const footerExploreColumns = [footerExploreLinks.slice(0, footerExploreMid), footerExploreLinks.slice(footerExploreMid)];
  const footerLegalMid = Math.ceil(footerLegalLinks.length / 2);
  const footerLegalColumns = [footerLegalLinks.slice(0, footerLegalMid), footerLegalLinks.slice(footerLegalMid)];

  const socialLinks = [
    { id: 'facebook', href: 'https://facebook.com', label: 'Facebook', icon: Facebook, iconBg: 'bg-[#1877F2]/15', iconColor: 'text-[#1877F2]' },
    { id: 'instagram', href: 'https://instagram.com', label: 'Instagram', icon: Instagram, iconBg: 'bg-[#DD2A7B]/15', iconColor: 'text-[#DD2A7B]' },
    { id: 'youtube', href: 'https://youtube.com', label: 'YouTube', icon: Youtube, iconBg: 'bg-[#FF0000]/15', iconColor: 'text-[#FF0000]' },
    { id: 'tiktok', href: 'https://tiktok.com', label: 'TikTok', icon: Music2, iconBg: 'bg-slate-900/10 dark:bg-white/10', iconColor: 'text-slate-900 dark:text-white' },
  ];

  const renderExploreLink = (link: FooterTabLink, key: string) => (
    <button
      key={key}
      type="button"
      data-testid={link.testId ? `footer-nav-${link.testId}` : `footer-nav-${link.id}`}
      onClick={() => navigateTo(link.id)}
      className="text-left"
    >
      <LunaMenuLabel text={link.label} muted className="font-light" />
    </button>
  );

  const renderLegalLink = (link: FooterTabLink, key: string) => (
    <button
      key={key}
      type="button"
      data-testid={link.testId ? `footer-nav-${link.testId}` : undefined}
      onClick={() => navigateTo(link.id)}
      className="text-left"
    >
      <LunaMenuLabel text={link.label} muted className="font-light" />
    </button>
  );

  return (
    <>
      <footer className={`w-full border-t-2 ${footerMoonAccent.borderClass} py-16 px-6 md:px-8 glass bg-slate-200/55 dark:bg-slate-950/72 mt-auto relative overflow-visible`}>
        <div className="max-w-7xl mx-auto space-y-14 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-0.5 origin-left scale-[1.12]">
              <img src={getBrandAssetUrl('icon')} alt="" aria-hidden="true" className="h-16 w-auto md:h-[4.5rem] object-contain select-none pointer-events-none" />
              <Logo size="sm" className="cursor-default text-4xl md:text-5xl leading-none" />
            </div>
            <p className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-400">{homeStory.heroLead}</p>
            <p className="text-sm font-light italic leading-relaxed text-slate-600 dark:text-slate-400">{footerMicroRitual}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <button type="button" onClick={() => navigateTo('about')} className="text-[13px] font-light underline underline-offset-4">
                <LunaMenuLabel text={footerSpiritActions.whyLuna29} muted />
              </button>
              {onOpenLive && (
                <button type="button" onClick={onOpenLive} className="text-[13px] font-light underline underline-offset-4">
                  <LunaMenuLabel text={footerSpiritActions.askLuna} muted />
                </button>
              )}
            </div>
            <p className="text-[12px] font-normal leading-relaxed text-slate-600 dark:text-slate-400">{footerTrustLine}</p>
            <div className="flex items-center gap-2 text-[11px] font-light text-slate-500 dark:text-slate-400">
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${footerMoonAccent.dotClass} ${footerMoonAccent.glowClass}`} aria-hidden="true" />
              <span>{footerMoonAccent.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-8 sm:gap-x-12 gap-y-10 sm:gap-y-12 min-w-0">
            <nav className="space-y-4 min-w-0 sm:col-span-2 xl:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                <LunaShimmerText text={footerSectionTitles.explore} className="opacity-90 font-semibold" />
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[13px] font-light">
                {footerExploreColumns.map((column, columnIndex) => (
                  <div key={`footer-explore-col-${columnIndex}`} className="flex flex-col gap-2.5">
                    {column.map((link) => renderExploreLink(link, `footer-explore-${columnIndex}-${link.id}`))}
                  </div>
                ))}
              </div>
            </nav>

            <nav className="space-y-4 min-w-0 sm:col-span-2 xl:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                <LunaShimmerText text={footerSectionTitles.legal} className="opacity-90 font-semibold" />
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[13px] font-light">
                {footerLegalColumns.map((column, columnIndex) => (
                  <div key={`footer-legal-col-${columnIndex}`} className="flex flex-col gap-2.5">
                    {column.map((link) => renderLegalLink(link, `footer-legal-${columnIndex}-${link.id}`))}
                  </div>
                ))}
              </div>
            </nav>

            <nav className="space-y-4 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                <LunaShimmerText text={footerSectionTitles.install} className="opacity-90 font-semibold" />
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInstallGuideModal(true)}
                  className="text-left text-[13px] font-light tracking-[0.03em] underline underline-offset-4"
                >
                  <LunaMenuLabel text={installGuideModal.title} muted className="font-light" />
                </button>
                {!isStandaloneMode && (
                  <button
                    type="button"
                    onClick={() => void runMemberInstall()}
                    className="text-left text-[12px] font-semibold"
                  >
                    <LunaMenuLabel
                      text={mobilePlatform === 'other' ? installActions.desktop : installActions.android}
                      muted
                      className="font-semibold"
                    />
                  </button>
                )}
                {appStoreUrl && (
                  <a href={appStoreUrl} target="_blank" rel="noreferrer" className="text-left text-[12px] font-semibold">
                    <LunaMenuLabel text={storeBadges.appStore} muted className="font-semibold" />
                  </a>
                )}
                {googlePlayUrl && (
                  <a href={googlePlayUrl} target="_blank" rel="noreferrer" className="text-left text-[12px] font-semibold">
                    <LunaMenuLabel text={storeBadges.googlePlay} muted className="font-semibold" />
                  </a>
                )}
                {!appStoreUrl && !googlePlayUrl && (
                  <p className="text-[11px] font-light text-slate-500 dark:text-slate-400">{storeBadges.soon}</p>
                )}
              </div>
              <div className="pt-4 border-t border-slate-300/70 dark:border-slate-700/70 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  <LunaShimmerText text={installActions.social} className="opacity-90 font-semibold" />
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="text-slate-700 dark:text-slate-300 hover:-translate-y-[1px] transition-transform"
                    >
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${social.iconBg}`}>
                        <social.icon size={14} className={social.iconColor} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </nav>

            <nav className="space-y-4 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                <LunaShimmerText text={footerSectionTitles.preferences} className="opacity-90 font-semibold" />
              </p>
              <div className="flex flex-col gap-4">
                <LanguageSelector current={lang} onSelect={setLang} variant="footer" menuAlign="left" menuPlacement="top" />
                <div className="flex items-center gap-3">
                  <LunaMenuLabel
                    text={getLang(themeLabelByLang, lang) || themeLabelByLang.en}
                    muted
                    className="text-[13px] font-light tracking-[0.03em]"
                  />
                  <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
                </div>
              </div>
            </nav>
          </div>

          <div className="pt-8 border-t border-slate-300 dark:border-slate-800">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-700 dark:text-slate-400">{ui.publicHome.footerCopy}</p>
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-400 leading-relaxed">{ui.shared.disclaimer}</p>
            </div>
          </div>
        </div>
      </footer>

      {showInstallGuideModal && (
        <div
          className="fixed inset-0 z-[900] bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowInstallGuideModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-black uppercase tracking-[0.24em] text-luna-purple">{installGuideModal.title}</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              {mobilePlatform === 'ios'
                ? 'Safari → Share → Add to Home Screen.'
                : mobilePlatform === 'android'
                  ? 'Chrome menu → Install App.'
                  : 'Use Chrome or Edge menu → Install Luna29.'}
            </p>
            {!isStandaloneMode && (
              <button
                type="button"
                onClick={() => void runMemberInstall()}
                className="px-5 py-2.5 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest"
              >
                {mobilePlatform === 'other' ? installActions.desktop : installActions.android}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowInstallGuideModal(false)}
              className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 underline underline-offset-4"
            >
              {installGuideModal.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
