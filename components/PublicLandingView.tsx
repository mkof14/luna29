import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Facebook, Heart, Instagram, Lock, MapPin, Mic, Music2, Sparkles, Youtube, Calendar } from 'lucide-react';
import { Logo } from './Logo';
import { Language, TranslationSchema, LangCopy, getLang } from '../constants';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW, PUBLIC_BTN_SECONDARY } from './public/publicButtonStyles';
import { getMemberNavCopy } from '../utils/memberNavLabels';

const HowItWorksView = lazy(() => import('./HowItWorksView').then((m) => ({ default: m.HowItWorksView })));
const FAQView = lazy(() => import('./FAQView').then((m) => ({ default: m.FAQView })));
const LearningView = lazy(() => import('./LearningView').then((m) => ({ default: m.LearningView })));
const LegalDocumentView = lazy(() => import('./LegalDocumentView').then((m) => ({ default: m.LegalDocumentView })));
const AboutLunaView = lazy(() => import('./AboutLunaView').then((m) => ({ default: m.AboutLunaView })));
const PublicMapSection = lazy(() => import('./public/PublicMapSection').then((m) => ({ default: m.PublicMapSection })));
const PublicRitualSection = lazy(() => import('./public/PublicRitualSection').then((m) => ({ default: m.PublicRitualSection })));
const PublicBridgeSection = lazy(() => import('./public/PublicBridgeSection').then((m) => ({ default: m.PublicBridgeSection })));
const PublicPricingSection = lazy(() => import('./public/PublicPricingSection').then((m) => ({ default: m.PublicPricingSection })));
const PublicCalendarSection = lazy(() => import('./public/PublicCalendarSection').then((m) => ({ default: m.PublicCalendarSection })));

interface PublicLandingViewProps {
  onSignIn: () => void;
  onSignUp: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  ui: TranslationSchema;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ onSignIn, onSignUp, lang, setLang, theme, setTheme, ui }) => {
  type PublicPage = 'home' | 'map' | 'ritual' | 'bridge' | 'pricing' | 'about' | 'how_it_works' | 'faq' | 'learning' | 'privacy' | 'terms' | 'medical' | 'cookies' | 'data_rights' | 'calendar';
  type TrialState = {
    startedAt: string;
    endsAt: string;
    status: 'active' | 'expired';
    used: boolean;
  };

  const TRIAL_STORAGE_KEY = 'luna_pricing_trial_v1';
  const TRIAL_DAYS = 7;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const resolvePageFromPath = (pathname: string): PublicPage => {
    if (pathname === '/ritual-path') return 'ritual';
    if (pathname === '/the-bridge') return 'bridge';
    if (pathname === '/pricing') return 'pricing';
    if (pathname === '/about') return 'about';
    if (pathname === '/how-it-works') return 'how_it_works';
    if (pathname === '/faq') return 'faq';
    if (pathname === '/training' || pathname === '/learning') return 'learning';
    if (pathname === '/privacy') return 'privacy';
    if (pathname === '/terms') return 'terms';
    if (pathname === '/disclaimer') return 'medical';
    if (pathname === '/cookies') return 'cookies';
    if (pathname === '/data-rights') return 'data_rights';
    if (pathname === '/luna-balance') return 'map';
    if (pathname === '/rhythm-calendar') return 'calendar';
    return 'home';
  };
  const resolvePathFromPage = (page: PublicPage): string => {
    if (page === 'ritual') return '/ritual-path';
    if (page === 'bridge') return '/the-bridge';
    if (page === 'pricing') return '/pricing';
    if (page === 'about') return '/about';
    if (page === 'how_it_works') return '/how-it-works';
    if (page === 'faq') return '/faq';
    if (page === 'learning') return '/learning';
    if (page === 'privacy') return '/privacy';
    if (page === 'terms') return '/terms';
    if (page === 'medical') return '/disclaimer';
    if (page === 'cookies') return '/cookies';
    if (page === 'data_rights') return '/data-rights';
    if (page === 'map') return '/luna-balance';
    if (page === 'calendar') return '/rhythm-calendar';
    return '/';
  };

  const [activePage, setActivePage] = useState<PublicPage>(() => {
    if (typeof window === 'undefined') return 'home';
    return resolvePageFromPath(window.location.pathname);
  });
  const [isHomeExpanded, setIsHomeExpanded] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [trialState, setTrialState] = useState<TrialState | null>(null);
  const [trialFeedback, setTrialFeedback] = useState('');
  const [publicInstallPrompt, setPublicInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installFeedback, setInstallFeedback] = useState('');
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [mobilePlatform, setMobilePlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [homeCalibrateEnabled, setHomeCalibrateEnabled] = useState(false);
  const [homeCalibrateRef, setHomeCalibrateRef] = useState('/images/home-reference.png');
  const [homeCalibrateOpacity, setHomeCalibrateOpacity] = useState(45);
  const [homeCalibrateOffsetX, setHomeCalibrateOffsetX] = useState(0);
  const [homeCalibrateOffsetY, setHomeCalibrateOffsetY] = useState(0);
  const [homeCalibrateScale, setHomeCalibrateScale] = useState(100);
  const [homeCalibrateHidePanel, setHomeCalibrateHidePanel] = useState(false);
  const normalizeExternalUrl = (value: unknown) => {
    const next = String(value || '').trim();
    if (!next || next === '#') return '';
    return next;
  };
  const appStoreUrl = normalizeExternalUrl(import.meta.env.VITE_APP_STORE_URL);
  const googlePlayUrl = normalizeExternalUrl(import.meta.env.VITE_GOOGLE_PLAY_URL);
  const expoPreviewUrl = normalizeExternalUrl(import.meta.env.VITE_EXPO_PREVIEW_URL || 'https://expo.dev/accounts/mkof14/projects/luna-mobile');
  const appStoreHref = appStoreUrl || expoPreviewUrl || '#';
  const googlePlayHref = googlePlayUrl || expoPreviewUrl || '#';
  const showPreviewLink = (!appStoreUrl || !googlePlayUrl) && Boolean(expoPreviewUrl);

  const storeBadgeCopyByLang: LangCopy< { title: string; appStore: string; googlePlay: string; preview: string; soon: string }> = {
    en: { title: 'Luna29 Mobile', appStore: 'Download on the App Store', googlePlay: 'Get it on Google Play', preview: 'Open Mobile Preview', soon: 'Store links will be active after release.' },
    ru: { title: 'Luna29 Mobile', appStore: 'Скачать в App Store', googlePlay: 'Скачать в Google Play', preview: 'Открыть мобильный превью', soon: 'Ссылки станут активны после релиза.' },
    uk: { title: 'Luna29 Mobile', appStore: 'Завантажити в App Store', googlePlay: 'Отримати в Google Play', preview: 'Відкрити мобільне превʼю', soon: 'Посилання стануть активними після релізу.' },
    es: { title: 'Luna29 Mobile', appStore: 'Descargar en App Store', googlePlay: 'Disponible en Google Play', preview: 'Abrir vista previa móvil', soon: 'Los enlaces estarán activos tras el lanzamiento.' },
    fr: { title: 'Luna29 Mobile', appStore: 'Télécharger sur App Store', googlePlay: 'Disponible sur Google Play', preview: 'Ouvrir aperçu mobile', soon: 'Les liens seront actifs après la sortie.' },
    de: { title: 'Luna29 Mobile', appStore: 'Im App Store laden', googlePlay: 'Bei Google Play', preview: 'Mobile Vorschau öffnen', soon: 'Store-Links werden nach dem Release aktiviert.' },
    zh: { title: 'Luna29 Mobile', appStore: 'App Store 下载', googlePlay: 'Google Play 获取', preview: '打开移动预览', soon: '发布后将启用商店链接。' },
    ja: { title: 'Luna29 Mobile', appStore: 'App Store で入手', googlePlay: 'Google Play で入手', preview: 'モバイルプレビューを開く', soon: 'リリース後にストアリンクを有効化します。' },
    pt: { title: 'Luna29 Mobile', appStore: 'Baixar na App Store', googlePlay: 'Disponível no Google Play', preview: 'Abrir prévia móvel', soon: 'Os links serão ativados após o lançamento.' },
  ar: { title: 'Luna29 Mobile', appStore: 'تنزيل من App Store', googlePlay: 'احصلي عليه من Google Play', preview: 'فتح المعاينة على الجوال', soon: 'ستُفعّل روابط المتجر بعد الإصدار.' },
  he: { title: 'Luna29 Mobile', appStore: 'הורדה מ-App Store', googlePlay: 'קבלי ב-Google Play', preview: 'פתיחת תצוגה מקדימה בנייד', soon: 'קישורי החנות יופעלו לאחר השקה.' },};
  const storeBadges = getLang(storeBadgeCopyByLang, lang) || storeBadgeCopyByLang.en;

  const loadingLabelByLang: LangCopy< string> = {
    en: 'Loading',
    ru: 'Загрузка',
    uk: 'Завантаження',
    es: 'Cargando',
    fr: 'Chargement',
    de: 'Laden',
    zh: '加载中',
    ja: '読み込み中',
    pt: 'Carregando',
  ar: 'جارٍ التحميل',
  he: 'טוען',};
  const lazyFallback = (
    <div className="min-h-[40vh] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
      {getLang(loadingLabelByLang, lang)}...
    </div>
  );

  const installGuideByLang = {
    en: {
      title: 'Install Luna29 As App',
      subtitle: 'Use Luna29 full-screen and open in one tap.',
      iosStep1: 'Tap Share in Safari.',
      iosStep2: 'Select Add to Home Screen.',
      androidStep1: 'Tap Install when browser suggests it.',
      androidStep2: 'Or open browser menu and choose Install App.',
      cta: 'Create Account',
    },
    ru: {
      title: 'Установите Luna29 Как App',
      subtitle: 'Открывайте Luna29 в полноэкранном режиме в один тап.',
      iosStep1: 'Нажмите Поделиться в Safari.',
      iosStep2: 'Выберите На экран Домой.',
      androidStep1: 'Нажмите Установить, когда браузер предложит.',
      androidStep2: 'Или откройте меню браузера и выберите Установить приложение.',
      cta: 'Создать Аккаунт',
    },
    uk: {
      title: 'Встановіть Luna29 Як App',
      subtitle: 'Відкривайте Luna29 у повному екрані в один дотик.',
      iosStep1: 'Натисніть Поділитися в Safari.',
      iosStep2: 'Оберіть На екран Додому.',
      androidStep1: 'Натисніть Встановити, коли браузер запропонує.',
      androidStep2: 'Або відкрийте меню браузера і виберіть Встановити застосунок.',
      cta: 'Створити Акаунт',
    },
    es: {
      title: 'Instala Luna29 Como App',
      subtitle: 'Abre Luna29 en pantalla completa con un toque.',
      iosStep1: 'Toca Compartir en Safari.',
      iosStep2: 'Elige Anadir a inicio.',
      androidStep1: 'Toca Instalar cuando el navegador lo sugiera.',
      androidStep2: 'O abre el menu del navegador y elige Instalar app.',
      cta: 'Crear Cuenta',
    },
    fr: {
      title: 'Installer Luna29 Comme App',
      subtitle: 'Ouvrez Luna29 en plein ecran en un geste.',
      iosStep1: 'Touchez Partager dans Safari.',
      iosStep2: 'Choisissez Sur l ecran d accueil.',
      androidStep1: 'Touchez Installer lorsque le navigateur le propose.',
      androidStep2: 'Ou ouvrez le menu du navigateur puis Installer l app.',
      cta: 'Creer Un Compte',
    },
    de: {
      title: 'Luna29 Als App Installieren',
      subtitle: 'Luna29 im Vollbild mit einem Tippen offnen.',
      iosStep1: 'In Safari auf Teilen tippen.',
      iosStep2: 'Zum Home-Bildschirm auswahlen.',
      androidStep1: 'Auf Installieren tippen, wenn der Browser es anbietet.',
      androidStep2: 'Oder im Browsermenu App installieren wahlen.',
      cta: 'Konto Erstellen',
    },
    zh: {
      title: '将 Luna29 安装为 App',
      subtitle: '全屏打开 Luna29，一键进入。',
      iosStep1: '在 Safari 中点击分享。',
      iosStep2: '选择添加到主屏幕。',
      androidStep1: '浏览器提示时点击安装。',
      androidStep2: '或打开浏览器菜单，选择安装应用。',
      cta: '创建账号',
    },
    ja: {
      title: 'Luna29 をアプリとしてインストール',
      subtitle: '全画面で素早く起動できます。',
      iosStep1: 'Safari の共有をタップ。',
      iosStep2: 'ホーム画面に追加を選択。',
      androidStep1: 'ブラウザのインストール提案をタップ。',
      androidStep2: 'またはブラウザメニューからアプリをインストール。',
      cta: 'アカウント作成',
    },
    pt: {
      title: 'Instale Luna29 Como App',
      subtitle: 'Abra Luna29 em tela cheia com um toque.',
      iosStep1: 'Toque em Compartilhar no Safari.',
      iosStep2: 'Escolha Adicionar a Tela Inicial.',
      androidStep1: 'Toque em Instalar quando o navegador sugerir.',
      androidStep2: 'Ou abra o menu do navegador e escolha Instalar app.',
      cta: 'Criar Conta',
    },
  ar: {
      title: 'ثبّتي Luna29 كتطبيق',
      subtitle: 'استخدمي Luna29 بملء الشاشة وافتحيها بلمسة واحدة.',
      iosStep1: 'اضغطي مشاركة في Safari.',
      iosStep2: 'اختاري إضافة إلى الشاشة الرئيسية.',
      androidStep1: 'اضغطي تثبيت عندما يقترح المتصفح ذلك.',
      androidStep2: 'أو افتحي قائمة المتصفح واختاري تثبيت التطبيق.',
      cta: 'إنشاء حساب',
    },
  he: {
      title: 'התקיני את Luna29 כאפליקציה',
      subtitle: 'השתמשי ב-Luna29 במסך מלא ופתחי בלחיצה אחת.',
      iosStep1: 'הקישי על שיתוף ב-Safari.',
      iosStep2: 'בחרי הוספה למסך הבית.',
      androidStep1: 'הקישי על התקנה כשהדפדפן מציע.',
      androidStep2: 'או פתחי את תפריט הדפדפן ובחרי התקנת אפליקציה.',
      cta: 'יצירת חשבון',
    },};
  const installGuide = getLang(installGuideByLang, lang) || installGuideByLang.en;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandaloneMode(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setMobilePlatform('ios');
    else if (/android/.test(ua)) setMobilePlatform('android');
    else setMobilePlatform('other');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const enabled = params.get('calibrate') === '1' || params.get('calibrate_home') === '1';
    if (!enabled) return;

    const parseNumber = (raw: string | null, fallback: number) => {
      if (!raw) return fallback;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    setHomeCalibrateEnabled(true);
    setHomeCalibrateRef(params.get('ref') || '/images/home-reference.png');
    setHomeCalibrateOpacity(parseNumber(params.get('opacity'), 45));
    setHomeCalibrateOffsetX(parseNumber(params.get('offset_x'), 0));
    setHomeCalibrateOffsetY(parseNumber(params.get('offset_y'), 0));
    setHomeCalibrateScale(parseNumber(params.get('scale'), 100));
    setHomeCalibrateHidePanel(params.get('hide_calibration_panel') === '1');
  }, []);

  const pricingUiByLang = {
    en: {
      monthToggle: 'Month',
      yearToggle: 'Year',
      trialBadge: 'Trial',
      trialDaysLeft: '{days} days left',
      flexibleBilling: 'Flexible billing',
      planCompare: 'Plan Compare',
      monthly: 'Monthly',
      yearly: 'Yearly',
      cancelAnyTime: 'Cancel any time',
      bestValue: 'Best value • 25% off',
      includes: 'Includes',
      includesText: 'One account, full features, and all future core updates included.',
      memberAccess: 'Luna29 Member Access',
      featurePrivate: '✓ Health data stays on your device',
      featureBodyMap: '✓ Body rhythm map and daily guidance',
      featureBridge: '✓ Partner bridge and note tools',
      featureAdmin: '✓ Admin-secured access and role logic',
      continueTrial: 'Continue Trial',
      startTrial: 'Start Trial • 7 Days',
      freeTier: 'Free',
      paidTier: 'Insights (Paid)',
      trialActiveFeedback: 'Trial active: {days} days left.',
      trialUsedFeedback: 'Trial already used on this device.',
      trialStartedFeedback: 'Trial started. Create account to continue.',
    },
    ru: {
      monthToggle: 'Месяц',
      yearToggle: 'Год',
      trialBadge: 'Пробный',
      trialDaysLeft: 'осталось {days} дн.',
      flexibleBilling: 'Гибкая оплата',
      planCompare: 'Сравнение Планов',
      monthly: 'Помесячно',
      yearly: 'Годовой',
      cancelAnyTime: 'Можно отменить в любой момент',
      bestValue: 'Лучшая цена • скидка 25%',
      includes: 'Включено',
      includesText: 'Один аккаунт, полный функционал и все будущие базовые обновления.',
      memberAccess: 'Доступ в зону участника Luna29',
      featurePrivate: '✓ Данные здоровья остаются на вашем устройстве',
      featureBodyMap: '✓ Карта ритмов тела и ежедневные подсказки',
      featureBridge: '✓ Мост с партнером и инструменты заметок',
      featureAdmin: '✓ Защищенный админ-доступ и роли',
      continueTrial: 'Продолжить Trial',
      startTrial: 'Начать Trial • 7 Дней',
      freeTier: 'Бесплатно',
      paidTier: 'Insights (Платно)',
      trialActiveFeedback: 'Trial активен: осталось {days} дн.',
      trialUsedFeedback: 'Trial уже использован на этом устройстве.',
      trialStartedFeedback: 'Trial запущен. Создайте аккаунт для продолжения.',
    },
    uk: {
      monthToggle: 'Місяць',
      yearToggle: 'Рік',
      trialBadge: 'Пробний',
      trialDaysLeft: 'залишилось {days} дн.',
      flexibleBilling: 'Гнучка оплата',
      planCompare: 'Порівняння Планів',
      monthly: 'Щомісячно',
      yearly: 'Річний',
      cancelAnyTime: 'Скасування будь-коли',
      bestValue: 'Найкраща ціна • мінус 25%',
      includes: 'Включено',
      includesText: 'Один акаунт, повний функціонал і всі майбутні базові оновлення.',
      memberAccess: 'Доступ до зони учасника Luna29',
      featurePrivate: '✓ Дані здоровʼя залишаються на вашому пристрої',
      featureBodyMap: '✓ Карта ритмів тіла і щоденні підказки',
      featureBridge: '✓ Міст для партнера та інструменти нотаток',
      featureAdmin: '✓ Захищений адмін-доступ і ролі',
      continueTrial: 'Продовжити Trial',
      startTrial: 'Почати Trial • 7 Днів',
      freeTier: 'Безкоштовно',
      paidTier: 'Insights (Платно)',
      trialActiveFeedback: 'Trial активний: залишилось {days} дн.',
      trialUsedFeedback: 'Trial уже використано на цьому пристрої.',
      trialStartedFeedback: 'Trial розпочато. Створіть акаунт для продовження.',
    },
    es: {
      monthToggle: 'Mes',
      yearToggle: 'Ano',
      trialBadge: 'Prueba',
      trialDaysLeft: '{days} dias restantes',
      flexibleBilling: 'Pago flexible',
      planCompare: 'Comparar Planes',
      monthly: 'Mensual',
      yearly: 'Anual',
      cancelAnyTime: 'Cancela cuando quieras',
      bestValue: 'Mejor valor • 25% menos',
      includes: 'Incluye',
      includesText: 'Una cuenta, funciones completas y futuras actualizaciones principales incluidas.',
      memberAccess: 'Acceso Miembro Luna29',
      featurePrivate: '✓ Zona privada completa con check-ins',
      featureBodyMap: '✓ Mapa de ritmo corporal y guia diaria',
      featureBridge: '✓ Bridge para pareja y herramientas de reflexion',
      featureAdmin: '✓ Acceso admin seguro y logica de roles',
      continueTrial: 'Continuar Prueba',
      startTrial: 'Iniciar Prueba • 7 Dias',
      trialActiveFeedback: 'Prueba activa: {days} dias restantes.',
      trialUsedFeedback: 'La prueba ya se uso en este dispositivo.',
      trialStartedFeedback: 'Prueba iniciada. Crea una cuenta para continuar.',
    },
    fr: {
      monthToggle: 'Mois',
      yearToggle: 'Annee',
      trialBadge: 'Essai',
      trialDaysLeft: '{days} jours restants',
      flexibleBilling: 'Facturation flexible',
      planCompare: 'Comparer Les Plans',
      monthly: 'Mensuel',
      yearly: 'Annuel',
      cancelAnyTime: 'Annulation a tout moment',
      bestValue: 'Meilleure valeur • -25%',
      includes: 'Inclus',
      includesText: 'Un compte, toutes les fonctions, et toutes les mises a jour principales incluses.',
      memberAccess: 'Acces Membre Luna29',
      featurePrivate: '✓ Zone membre complete avec check-ins prives',
      featureBodyMap: '✓ Carte des rythmes corporels et guidance quotidienne',
      featureBridge: '✓ Bridge partenaire et outils de reflexion',
      featureAdmin: '✓ Acces admin securise et roles',
      continueTrial: "Continuer L'Essai",
      startTrial: "Demarrer L'Essai • 7 Jours",
      trialActiveFeedback: 'Essai actif: {days} jours restants.',
      trialUsedFeedback: 'Essai deja utilise sur cet appareil.',
      trialStartedFeedback: 'Essai demarre. Creez un compte pour continuer.',
    },
    de: {
      monthToggle: 'Monat',
      yearToggle: 'Jahr',
      trialBadge: 'Testphase',
      trialDaysLeft: 'noch {days} Tage',
      flexibleBilling: 'Flexible Abrechnung',
      planCompare: 'Planvergleich',
      monthly: 'Monatlich',
      yearly: 'Jaehrlich',
      cancelAnyTime: 'Jederzeit kuendbar',
      bestValue: 'Bester Preis • 25% Rabatt',
      includes: 'Enthaelt',
      includesText: 'Ein Konto, voller Funktionsumfang und alle kuenftigen Kern-Updates inklusive.',
      memberAccess: 'Luna29 Mitgliederzugang',
      featurePrivate: '✓ Voller Mitgliederbereich mit privaten Check-ins',
      featureBodyMap: '✓ Koerperrhythmus-Karte und taegliche Guidance',
      featureBridge: '✓ Partner-Bridge und Reflexions-Tools',
      featureAdmin: '✓ Admin-gesicherter Zugang und Rollenlogik',
      continueTrial: 'Testphase Fortsetzen',
      startTrial: 'Test Starten • 7 Tage',
      trialActiveFeedback: 'Testphase aktiv: noch {days} Tage.',
      trialUsedFeedback: 'Testphase wurde auf diesem Geraet bereits genutzt.',
      trialStartedFeedback: 'Test gestartet. Konto erstellen, um fortzufahren.',
    },
    zh: {
      monthToggle: '月付',
      yearToggle: '年付',
      trialBadge: '试用',
      trialDaysLeft: '剩余 {days} 天',
      flexibleBilling: '灵活计费',
      planCompare: '方案对比',
      monthly: '月度',
      yearly: '年度',
      cancelAnyTime: '可随时取消',
      bestValue: '最优价格 • 省 25%',
      includes: '包含',
      includesText: '一个账号、完整功能，以及后续核心更新。',
      memberAccess: 'Luna29 会员访问',
      featurePrivate: '✓ 完整会员区与私密 check-in',
      featureBodyMap: '✓ 身体节律地图与每日引导',
      featureBridge: '✓ 伴侣 bridge 与反思工具',
      featureAdmin: '✓ 管理员安全访问与角色逻辑',
      continueTrial: '继续试用',
      startTrial: '开始试用 • 7 天',
      trialActiveFeedback: '试用进行中：剩余 {days} 天。',
      trialUsedFeedback: '该设备已使用过试用。',
      trialStartedFeedback: '试用已开始。请创建账号继续。',
    },
    ja: {
      monthToggle: '月額',
      yearToggle: '年額',
      trialBadge: 'トライアル',
      trialDaysLeft: '残り {days} 日',
      flexibleBilling: '柔軟な課金',
      planCompare: 'プラン比較',
      monthly: '月払い',
      yearly: '年払い',
      cancelAnyTime: 'いつでも解約可能',
      bestValue: '最もお得 • 25%オフ',
      includes: '含まれるもの',
      includesText: '1アカウント、全機能、今後の主要アップデートを含みます。',
      memberAccess: 'Luna29 メンバーアクセス',
      featurePrivate: '✓ 非公開チェックインを含むメンバーゾーン',
      featureBodyMap: '✓ ボディリズムマップと日次ガイダンス',
      featureBridge: '✓ パートナーブリッジと内省ツール',
      featureAdmin: '✓ 管理者保護アクセスと権限ロジック',
      continueTrial: 'トライアルを続ける',
      startTrial: 'トライアル開始 • 7日間',
      trialActiveFeedback: 'トライアル中: 残り {days} 日。',
      trialUsedFeedback: 'この端末では既にトライアルを利用済みです。',
      trialStartedFeedback: 'トライアル開始。続けるにはアカウント作成が必要です。',
    },
    pt: {
      monthToggle: 'Mes',
      yearToggle: 'Ano',
      trialBadge: 'Teste',
      trialDaysLeft: '{days} dias restantes',
      flexibleBilling: 'Cobranca flexivel',
      planCompare: 'Comparar Planos',
      monthly: 'Mensal',
      yearly: 'Anual',
      cancelAnyTime: 'Cancele quando quiser',
      bestValue: 'Melhor valor • 25% off',
      includes: 'Inclui',
      includesText: 'Uma conta, todos os recursos e futuras atualizacoes principais inclusas.',
      memberAccess: 'Acesso Membro Luna29',
      featurePrivate: '✓ Zona membro completa com check-ins privados',
      featureBodyMap: '✓ Mapa de ritmo corporal e guia diaria',
      featureBridge: '✓ Bridge com parceiro e ferramentas de reflexao',
      featureAdmin: '✓ Acesso admin seguro e logica de papeis',
      continueTrial: 'Continuar Teste',
      startTrial: 'Iniciar Teste • 7 Dias',
      trialActiveFeedback: 'Teste ativo: {days} dias restantes.',
      trialUsedFeedback: 'O teste ja foi usado neste dispositivo.',
      trialStartedFeedback: 'Teste iniciado. Crie uma conta para continuar.',
    },
  ar: {
      monthToggle: 'شهري',
      yearToggle: 'سنوي',
      trialBadge: 'تجربة',
      trialDaysLeft: 'متبقٍ {days} أيام',
      flexibleBilling: 'فوترة مرنة',
      planCompare: 'مقارنة الخطط',
      monthly: 'شهري',
      yearly: 'سنوي',
      cancelAnyTime: 'إلغاء في أي وقت',
      bestValue: 'أفضل قيمة • خصم 25%',
      includes: 'يشمل',
      includesText: 'حساب واحد، كل الميزات، وجميع التحديثات الأساسية المستقبلية.',
      memberAccess: 'وصول عضو Luna29',
      featurePrivate: '✓ بيانات الصحة تبقى على جهازك',
      featureBodyMap: '✓ خريطة إيقاع الجسم والإرشاد اليومي',
      featureBridge: '✓ جسر الشريك وأدوات الملاحظات',
      featureAdmin: '✓ وصول إداري آمن ومنطق الأدوار',
      continueTrial: 'متابعة التجربة',
      startTrial: 'ابدئي التجربة • 7 أيام',
      freeTier: 'مجاني',
      paidTier: 'Insights (مدفوع)',
      trialActiveFeedback: 'التجربة نشطة: متبقٍ {days} أيام.',
      trialUsedFeedback: 'التجربة مستخدمة بالفعل على هذا الجهاز.',
      trialStartedFeedback: 'بدأت التجربة. أنشئي حساباً للمتابعة.',
    },
  he: {
      monthToggle: 'חודשי',
      yearToggle: 'שנתי',
      trialBadge: 'ניסיון',
      trialDaysLeft: 'נותרו {days} ימים',
      flexibleBilling: 'חיוב גמיש',
      planCompare: 'השוואת תוכניות',
      monthly: 'חודשי',
      yearly: 'שנתי',
      cancelAnyTime: 'ביטול בכל עת',
      bestValue: 'הערך הטוב ביותר • 25% הנחה',
      includes: 'כולל',
      includesText: 'חשבון אחד, כל התכונות וכל עדכוני הליבה העתידיים.',
      memberAccess: 'גישת חברה Luna29',
      featurePrivate: '✓ נתוני בריאות נשארים במכשיר שלך',
      featureBodyMap: '✓ מפת קצב גוף והנחיה יומית',
      featureBridge: '✓ גשר לבן/בת זוג וכלי הערות',
      featureAdmin: '✓ גישת אדמין מאובטחת ולוגיקת תפקידים',
      continueTrial: 'המשך ניסיון',
      startTrial: 'התחילי ניסיון • 7 ימים',
      freeTier: 'חינם',
      paidTier: 'Insights (בתשלום)',
      trialActiveFeedback: 'ניסיון פעיל: נותרו {days} ימים.',
      trialUsedFeedback: 'הניסיון כבר נוצל במכשיר הזה.',
      trialStartedFeedback: 'הניסיון התחיל. צרי חשבון כדי להמשיך.',
    },};

  const normalizeTrialState = (value: unknown): TrialState | null => {
    if (!value || typeof value !== 'object') return null;
    const item = value as Record<string, unknown>;
    if (typeof item.startedAt !== 'string' || typeof item.endsAt !== 'string' || typeof item.used !== 'boolean') return null;
    const startedAtTs = Date.parse(item.startedAt);
    const endsAtTs = Date.parse(item.endsAt);
    if (Number.isNaN(startedAtTs) || Number.isNaN(endsAtTs)) return null;
    const active = endsAtTs > Date.now();
    return {
      startedAt: item.startedAt,
      endsAt: item.endsAt,
      used: item.used,
      status: active ? 'active' : 'expired',
    };
  };

  const readTrialState = (): TrialState | null => {
    try {
      const raw = localStorage.getItem(TRIAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeTrialState(parsed);
      if (!normalized) return null;
      localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch {
      return null;
    }
  };

  const trialDaysLeft = useMemo(() => {
    if (!trialState || trialState.status !== 'active') return 0;
    return Math.max(1, Math.ceil((Date.parse(trialState.endsAt) - Date.now()) / DAY_MS));
  }, [trialState]);

  useEffect(() => {
    const next = readTrialState();
    setTrialState(next);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(resolvePageFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const startTrial = () => {
    const pricingUi = getLang(pricingUiByLang, lang) || pricingUiByLang.en;
    const existing = readTrialState();
    if (existing?.status === 'active') {
      setTrialState(existing);
      setTrialFeedback(
        pricingUi.trialActiveFeedback.replace(
          '{days}',
          String(Math.max(1, Math.ceil((Date.parse(existing.endsAt) - Date.now()) / DAY_MS))),
        ),
      );
      onSignIn();
      return;
    }
    if (existing?.used) {
      setTrialState(existing);
      setTrialFeedback(pricingUi.trialUsedFeedback);
      return;
    }

    const now = Date.now();
    const next: TrialState = {
      startedAt: new Date(now).toISOString(),
      endsAt: new Date(now + TRIAL_DAYS * DAY_MS).toISOString(),
      status: 'active',
      used: true,
    };
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(next));
    setTrialState(next);
    setTrialFeedback(pricingUi.trialStartedFeedback);
    onSignUp();
  };

  const pricingLabelByLang: LangCopy< string> = {
    en: 'Pricing',
    ru: 'Цены',
    uk: 'Ціни',
    es: 'Precios',
    fr: 'Tarifs',
    de: 'Preise',
    zh: '价格',
    ja: '料金',
    pt: 'Precos',
  ar: 'الأسعار',
  he: 'מחירים',};
  const howItWorksLabelByLang: LangCopy< string> = {
    en: 'How It Works',
    ru: 'Как Это Работает',
    uk: 'Як Це Працює',
    es: 'Como Funciona',
    fr: 'Comment Ca Marche',
    de: 'So Funktioniert Es',
    zh: '如何使用',
    ja: '使い方',
    pt: 'Como Funciona',
  ar: 'كيف يعمل',
  he: 'איך זה עובד',};
  const faqLabelByLang: LangCopy<string> = {
    en: 'FAQ',
    ru: 'FAQ',
    uk: 'FAQ',
    es: 'Preguntas frecuentes',
    fr: 'FAQ',
    de: 'FAQ',
    zh: '常见问题',
    ja: 'FAQ',
    pt: 'FAQ',
  ar: 'الأسئلة الشائعة',
  he: 'שאלות נפוצות',};
  const learningLabelByLang: LangCopy<string> = {
  en: 'Learning',
  ru: 'Обучение',
  uk: 'Навчання',
  es: 'Aprendizaje',
  fr: 'Apprentissage',
  de: 'Lernen',
  zh: '学习',
  ja: '学び',
  pt: 'Aprendizagem',
  ar: 'التعلّم',
  he: 'לימוד',
  };

  const [landingNarratives, setLandingNarratives] = useState<import('../utils/publicLandingNarratives').LandingNarratives | null>(null);

  useEffect(() => {
    let alive = true;
    import('../utils/publicLandingNarratives').then((module) => {
      if (!alive) return;
      setLandingNarratives(module.getLandingNarratives(lang));
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPublicInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  const homeStory = landingNarratives?.homeStory || {
    heroTitle: 'Luna29',
    heroLead: 'Luna29 — The physiology of feeling.',
    heroBody: 'A personal system for physiological clarity.',
    heroCta: 'Try Luna29',
    heroSub: 'Private. Calm. Personal.',
    explainTitle: 'Short Explanation',
    explainParagraphs: ['Luna29 helps understand body state through data and notes.', 'Open member tools to continue your journey.'],
    flowTitle: 'How Luna29 Works',
    flowItems: [{ title: 'Body', text: 'Rhythms and markers' }, { title: 'Senses', text: 'Observations and notes' }, { title: 'Words', text: 'Clear communication' }],
    sections: [{ title: 'Luna29 Balance', body: 'Visual rhythm map.' }, { title: 'Voice Note', body: 'Structured voice notes.' }],
    differenceTitle: 'Why Luna29 Is Different',
    differenceList: ['body', 'state', 'clarity'],
    differenceBody: 'Luna29 links signals into a clear picture.',
    finalTitle: 'Luna29 is your personal system for physiological clarity.',
    finalBody: 'Pause, understand, and move forward with clarity.',
    finalCta: 'Try Luna29',
  };
  const homeToggle = landingNarratives?.homeToggle || { more: 'Show Full Story', less: 'Show Less' };
  const hormoneFocus = landingNarratives?.hormoneFocus || {
    title: 'Hormones Matter',
    subtitle: 'Markers shape energy, mood, focus, and recovery.',
    cards: [
      { hormone: 'Estrogen / Progesterone', why: 'Cycle rhythm and stability.' },
      { hormone: 'Cortisol', why: 'Stress and recovery dynamics.' },
    ],
  };
  const reportsOverview = landingNarratives?.reportsOverview || {
    title: 'My Health Reports',
    subtitle: 'Structured report from labs and symptoms.',
    points: ['Upload labs', 'Track markers', 'Generate report', 'Export in selected language'],
  };
  const pricingCopy = landingNarratives?.pricingCopy || {
    title: 'Simple, Transparent Pricing',
    subtitle: 'One plan. Full Luna29 member zone.',
    month: '$12.99',
    year: '$89',
    monthNote: 'per month',
    yearNote: 'per year',
    saveBadge: 'Save 25% yearly',
    cta: 'Buy Luna29 Access',
    recommended: 'Recommended: $12.99/month.',
  };
  const pricingUi = getLang(pricingUiByLang, lang) || pricingUiByLang.en;
  const visibleExplainParagraphs = isHomeExpanded ? homeStory.explainParagraphs : homeStory.explainParagraphs.slice(0, 2);
  const visibleSections = isHomeExpanded ? homeStory.sections : homeStory.sections.slice(0, 2);

  const sections = [
    { id: 'home', label: ui.publicHome.tabs.home },
    { id: 'map', label: ui.publicHome.tabs.map },
    { id: 'ritual', label: 'Ritual Path' },
    { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
    { id: 'pricing', label: getLang(pricingLabelByLang, lang) || 'Pricing' },
  ] as const;
  const footerSectionTitlesByLang: LangCopy< { explore: string; guides: string; legal: string; install: string; account: string }> = {
    en: { explore: 'Explore', guides: 'Guides', legal: 'Legal', install: 'Install App', account: 'Account' },
    ru: { explore: 'Разделы', guides: 'Гайды', legal: 'Юридический', install: 'Установить App', account: 'Аккаунт' },
    uk: { explore: 'Розділи', guides: 'Гайди', legal: 'Юридичний', install: 'Встановити App', account: 'Акаунт' },
    es: { explore: 'Secciones', guides: 'Guias', legal: 'Legal', install: 'Instalar App', account: 'Cuenta' },
    fr: { explore: 'Sections', guides: 'Guides', legal: 'Juridique', install: 'Installer App', account: 'Compte' },
    de: { explore: 'Bereiche', guides: 'Leitfaden', legal: 'Recht', install: 'App Installieren', account: 'Konto' },
    zh: { explore: '页面', guides: '指南', legal: '法律', install: '安装 App', account: '账户' },
    ja: { explore: 'ページ', guides: 'ガイド', legal: '法務', install: 'App をインストール', account: 'アカウント' },
    pt: { explore: 'Secoes', guides: 'Guias', legal: 'Legal', install: 'Instalar App', account: 'Conta' },
  ar: { explore: 'استكشاف', guides: 'أدلة', legal: 'قانوني', install: 'تثبيت التطبيق', account: 'الحساب' },
  he: { explore: 'חקירה', guides: 'מדריכים', legal: 'משפטי', install: 'התקנת אפליקציה', account: 'חשבון' },};

  const legalLabelsByLang: LangCopy< { legal: string; privacy: string; terms: string; medical: string; cookies: string; dataRights: string }> = {
    en: { legal: 'Legal', privacy: 'Privacy Notice', terms: 'Terms', medical: 'Disclaimer', cookies: 'Cookies', dataRights: 'Data Rights' },
    ru: { legal: 'Юридический раздел', privacy: 'Приватность', terms: 'Условия', medical: 'Дисклеймер', cookies: 'Cookies', dataRights: 'Права на данные' },
    uk: { legal: 'Юридичний розділ', privacy: 'Приватність', terms: 'Умови', medical: 'Дисклеймер', cookies: 'Cookies', dataRights: 'Права на дані' },
    es: { legal: 'Legal', privacy: 'Privacidad', terms: 'Terminos', medical: 'Descargo', cookies: 'Cookies', dataRights: 'Derechos de Datos' },
    fr: { legal: 'Juridique', privacy: 'Confidentialite', terms: 'Conditions', medical: 'Avertissement', cookies: 'Cookies', dataRights: 'Droits Donnees' },
    de: { legal: 'Rechtliches', privacy: 'Datenschutz', terms: 'Bedingungen', medical: 'Hinweis', cookies: 'Cookies', dataRights: 'Datenrechte' },
    zh: { legal: '法律', privacy: '隐私', terms: '条款', medical: '免责声明', cookies: 'Cookies', dataRights: '数据权利' },
    ja: { legal: '法務', privacy: 'プライバシー', terms: '利用規約', medical: '免責', cookies: 'Cookies', dataRights: 'データ権利' },
    pt: { legal: 'Legal', privacy: 'Privacidade', terms: 'Termos', medical: 'Aviso', cookies: 'Cookies', dataRights: 'Direitos de Dados' },
  ar: { legal: 'قانوني', privacy: 'إشعار الخصوصية', terms: 'الشروط', medical: 'إخلاء المسؤولية', cookies: 'Cookies', dataRights: 'حقوق البيانات' },
  he: { legal: 'משפטי', privacy: 'הודעת פרטיות', terms: 'תנאים', medical: 'הצהרת אחריות', cookies: 'Cookies', dataRights: 'זכויות נתונים' },};
  const legalLabels = getLang(legalLabelsByLang, lang);
  const footerSectionTitles = getLang(footerSectionTitlesByLang, lang) || footerSectionTitlesByLang.en;
  const themeLabelByLang: LangCopy< string> = {
    en: 'Theme',
    ru: 'Тема',
    uk: 'Тема',
    es: 'Tema',
    fr: 'Thème',
    de: 'Thema',
    zh: '主题',
    ja: 'テーマ',
    pt: 'Tema',
  ar: 'المظهر',
  he: 'ערכת נושא',};
  const installActionsByLang = {
    en: {
      ios: 'iPhone Install',
      android: 'Android Install',
      iosTip: 'Open Safari -> Share -> Add to Home Screen.',
      androidTip: 'Use browser menu -> Install App.',
      noPrompt: 'Install prompt is not available in this browser session.',
      explainTitle: 'How Install Works',
      explainBody: 'Install adds Luna29 to your home screen and opens full-screen like an app.',
      stepPrefix: 'Step',
      iosStep1: 'Open Luna29 in Safari.',
      iosStep2: 'Tap Share and choose Add to Home Screen.',
      androidStep1: 'Open Luna29 in Chrome/Edge.',
      androidStep2: 'Tap browser menu and choose Install App.',
      admin: 'Admin',
      social: 'Social',
    },
    ru: {
      ios: 'Установить на iPhone',
      android: 'Установить на Android',
      iosTip: 'Откройте Safari -> Поделиться -> На экран Домой.',
      androidTip: 'Используйте меню браузера -> Установить приложение.',
      noPrompt: 'Системный install prompt сейчас недоступен в этом браузере.',
      explainTitle: 'Как работает установка',
      explainBody: 'После установки Luna29 появится на домашнем экране и будет открываться как приложение.',
      stepPrefix: 'Шаг',
      iosStep1: 'Откройте Luna29 в Safari.',
      iosStep2: 'Нажмите Поделиться и выберите На экран Домой.',
      androidStep1: 'Откройте Luna29 в Chrome/Edge.',
      androidStep2: 'Откройте меню браузера и выберите Установить приложение.',
      admin: 'Админ',
      social: 'Соцсети',
    },
    uk: {
      ios: 'Встановити на iPhone',
      android: 'Встановити на Android',
      iosTip: 'Відкрийте Safari -> Поділитися -> На екран Додому.',
      androidTip: 'Використайте меню браузера -> Встановити застосунок.',
      noPrompt: 'Системний install prompt зараз недоступний у цьому браузері.',
      explainTitle: 'Як працює встановлення',
      explainBody: 'Після встановлення Luna29 зʼявиться на головному екрані та відкриватиметься як застосунок.',
      stepPrefix: 'Крок',
      iosStep1: 'Відкрийте Luna29 у Safari.',
      iosStep2: 'Натисніть Поділитися і оберіть На екран Додому.',
      androidStep1: 'Відкрийте Luna29 у Chrome/Edge.',
      androidStep2: 'Відкрийте меню браузера і оберіть Встановити застосунок.',
      admin: 'Адмін',
      social: 'Соцмережі',
    },
    es: {
      ios: 'Instalar en iPhone',
      android: 'Instalar en Android',
      iosTip: 'Abre Safari -> Compartir -> Anadir a inicio.',
      androidTip: 'Usa menu del navegador -> Instalar app.',
      noPrompt: 'El prompt de instalacion no esta disponible ahora.',
      explainTitle: 'Como funciona la instalacion',
      explainBody: 'Al instalar, Luna29 aparece en inicio y se abre en pantalla completa como app.',
      stepPrefix: 'Paso',
      iosStep1: 'Abre Luna29 en Safari.',
      iosStep2: 'Toca Compartir y luego Anadir a inicio.',
      androidStep1: 'Abre Luna29 en Chrome/Edge.',
      androidStep2: 'Abre menu del navegador y elige Instalar app.',
      admin: 'Admin',
      social: 'Redes',
    },
    fr: {
      ios: 'Installer sur iPhone',
      android: 'Installer sur Android',
      iosTip: 'Ouvrez Safari -> Partager -> Sur l ecran d accueil.',
      androidTip: 'Utilisez menu navigateur -> Installer app.',
      noPrompt: "Le prompt d installation n est pas disponible actuellement.",
      explainTitle: "Comment l installation fonctionne",
      explainBody: 'Apres installation, Luna29 apparait sur accueil et s ouvre en plein ecran.',
      stepPrefix: 'Etape',
      iosStep1: 'Ouvrez Luna29 dans Safari.',
      iosStep2: "Touchez Partager puis Sur l ecran d accueil.",
      androidStep1: 'Ouvrez Luna29 dans Chrome/Edge.',
      androidStep2: 'Ouvrez le menu du navigateur puis Installer app.',
      admin: 'Admin',
      social: 'Reseaux',
    },
    de: {
      ios: 'Auf iPhone installieren',
      android: 'Auf Android installieren',
      iosTip: 'Safari offnen -> Teilen -> Zum Home-Bildschirm.',
      androidTip: 'Browsermenu -> App installieren.',
      noPrompt: 'Installationsdialog ist in dieser Sitzung nicht verfugbar.',
      explainTitle: 'So funktioniert die Installation',
      explainBody: 'Nach Installation erscheint Luna29 auf dem Homescreen und startet im Vollbild.',
      stepPrefix: 'Schritt',
      iosStep1: 'Luna29 in Safari offnen.',
      iosStep2: 'Teilen tippen und Zum Home-Bildschirm wahlen.',
      androidStep1: 'Luna29 in Chrome/Edge offnen.',
      androidStep2: 'Browsermenu offnen und App installieren wahlen.',
      admin: 'Admin',
      social: 'Social',
    },
    zh: {
      ios: 'iPhone 安装',
      android: 'Android 安装',
      iosTip: '打开 Safari -> 分享 -> 添加到主屏幕。',
      androidTip: '使用浏览器菜单 -> 安装应用。',
      noPrompt: '当前浏览器会话中无法触发安装弹窗。',
      explainTitle: '安装说明',
      explainBody: '安装后 Luna29 会出现在主屏幕，并以全屏应用方式打开。',
      stepPrefix: '步骤',
      iosStep1: '在 Safari 中打开 Luna29。',
      iosStep2: '点击分享，选择添加到主屏幕。',
      androidStep1: '在 Chrome/Edge 中打开 Luna29。',
      androidStep2: '打开浏览器菜单，选择安装应用。',
      admin: '管理',
      social: '社交',
    },
    ja: {
      ios: 'iPhone にインストール',
      android: 'Android にインストール',
      iosTip: 'Safari を開く -> 共有 -> ホーム画面に追加。',
      androidTip: 'ブラウザメニュー -> アプリをインストール。',
      noPrompt: 'このブラウザではインストールダイアログを表示できません。',
      explainTitle: 'インストール方法',
      explainBody: 'インストールするとホーム画面に追加され、全画面アプリとして起動できます。',
      stepPrefix: '手順',
      iosStep1: 'Safari で Luna29 を開く。',
      iosStep2: '共有を押してホーム画面に追加を選択。',
      androidStep1: 'Chrome/Edge で Luna29 を開く。',
      androidStep2: 'ブラウザメニューからアプリをインストール。',
      admin: '管理',
      social: 'SNS',
    },
    pt: {
      ios: 'Instalar no iPhone',
      android: 'Instalar no Android',
      iosTip: 'Abra Safari -> Compartilhar -> Adicionar a Tela Inicial.',
      androidTip: 'Use menu do navegador -> Instalar app.',
      noPrompt: 'O prompt de instalacao nao esta disponivel nesta sessao.',
      explainTitle: 'Como funciona a instalacao',
      explainBody: 'Depois de instalar, Luna29 aparece na tela inicial e abre em tela cheia.',
      stepPrefix: 'Passo',
      iosStep1: 'Abra Luna29 no Safari.',
      iosStep2: 'Toque em Compartilhar e escolha Adicionar a Tela Inicial.',
      androidStep1: 'Abra Luna29 no Chrome/Edge.',
      androidStep2: 'Abra o menu do navegador e escolha Instalar app.',
      admin: 'Admin',
      social: 'Sociais',
    },
  ar: {
      ios: 'تثبيت على iPhone',
      android: 'تثبيت على Android',
      iosTip: 'افتحي Safari -> مشاركة -> إضافة إلى الشاشة الرئيسية.',
      androidTip: 'استخدمي قائمة المتصفح -> تثبيت التطبيق.',
      noPrompt: 'مطالبة التثبيت غير متاحة في هذه الجلسة.',
      explainTitle: 'كيف يعمل التثبيت',
      explainBody: 'يضيف التثبيت Luna29 إلى شاشتك الرئيسية ويفتحها بملء الشاشة كتطبيق.',
      stepPrefix: 'خطوة',
      iosStep1: 'افتحي Luna29 في Safari.',
      iosStep2: 'اضغطي مشاركة واختاري إضافة إلى الشاشة الرئيسية.',
      androidStep1: 'افتحي Luna29 في Chrome/Edge.',
      androidStep2: 'افتحي قائمة المتصفح واختاري تثبيت التطبيق.',
      admin: 'الإدارة',
      social: 'التواصل',
    },
  he: {
      ios: 'התקנה ב-iPhone',
      android: 'התקנה ב-Android',
      iosTip: 'פתחי Safari -> שיתוף -> הוספה למסך הבית.',
      androidTip: 'השתמשי בתפריט הדפדפן -> התקנת אפליקציה.',
      noPrompt: 'בקשת ההתקנה לא זמינה ב-session הזה.',
      explainTitle: 'איך ההתקנה עובדת',
      explainBody: 'ההתקנה מוסיפה את Luna29 למסך הבית ופותחת במסך מלא כמו אפליקציה.',
      stepPrefix: 'שלב',
      iosStep1: 'פתחי את Luna29 ב-Safari.',
      iosStep2: 'הקישי על שיתוף ובחרי הוספה למסך הבית.',
      androidStep1: 'פתחי את Luna29 ב-Chrome/Edge.',
      androidStep2: 'פתחי את תפריט הדפדפן ובחרי התקנת אפליקציה.',
      admin: 'אדמין',
      social: 'רשתות',
    },};
  const installActions = getLang(installActionsByLang, lang) || installActionsByLang.en;
  const installGuideModalByLang: Partial<
    Record<
      Language,
      {
        title: string;
        how: string;
        intro: string;
        iosTitle: string;
        androidTitle: string;
        iosStep1: string;
        iosStep2: string;
        androidStep1: string;
        androidStep2: string;
        fallback: string;
        close: string;
        openPrompt: string;
      }
    >
  > = {
    en: {
      title: 'Install App',
      how: 'How Install Works',
      intro: 'Install adds Luna29 to your home screen and opens full-screen like an app.',
      iosTitle: 'iPhone Install',
      androidTitle: 'Android Install',
      iosStep1: 'Step 1: Open Luna29 in Safari.',
      iosStep2: 'Step 2: Tap Share and choose Add to Home Screen.',
      androidStep1: 'Step 1: Open Luna29 in Chrome/Edge.',
      androidStep2: 'Step 2: Tap browser menu and choose Install App.',
      fallback: 'Open Safari -> Share -> Add to Home Screen.',
      close: 'Close',
      openPrompt: 'Open Android Install',
    },
    ru: {
      title: 'Install App',
      how: 'How Install Works',
      intro: 'Install добавляет Luna29 на домашний экран и открывает в полноэкранном режиме как app.',
      iosTitle: 'iPhone Install',
      androidTitle: 'Android Install',
      iosStep1: 'Step 1: Open Luna29 in Safari.',
      iosStep2: 'Step 2: Tap Share and choose Add to Home Screen.',
      androidStep1: 'Step 1: Open Luna29 in Chrome/Edge.',
      androidStep2: 'Step 2: Tap browser menu and choose Install App.',
      fallback: 'Open Safari -> Share -> Add to Home Screen.',
      close: 'Закрыть',
      openPrompt: 'Открыть Android Install',
    },
    ar: {
      title: 'تثبيت التطبيق',
      how: 'كيف يعمل التثبيت',
      intro: 'يضيف التثبيت Luna29 إلى الشاشة الرئيسية ويفتح بملء الشاشة كتطبيق.',
      iosTitle: 'تثبيت iPhone',
      androidTitle: 'تثبيت Android',
      iosStep1: 'الخطوة 1: افتحي Luna29 في Safari.',
      iosStep2: 'الخطوة 2: اضغطي مشاركة واختي «إضافة إلى الشاشة الرئيسية».',
      androidStep1: 'الخطوة 1: افتحي Luna29 في Chrome/Edge.',
      androidStep2: 'الخطوة 2: اضغطي قائمة المتصفح واختي «تثبيت التطبيق».',
      fallback: 'Safari -> مشاركة -> إضافة إلى الشاشة الرئيسية.',
      close: 'إغلاق',
      openPrompt: 'فتح تثبيت Android',
    },
    he: {
      title: 'התקנת אפליקציה',
      how: 'איך ההתקנה עובדת',
      intro: 'ההתקנה מוסיפה את Luna29 למסך הבית ופותחת במסך מלא כמו אפליקציה.',
      iosTitle: 'התקנה ב-iPhone',
      androidTitle: 'התקנה ב-Android',
      iosStep1: 'שלב 1: פתחי את Luna29 ב-Safari.',
      iosStep2: 'שלב 2: הקישי שיתוף ובחרי «הוספה למסך הבית».',
      androidStep1: 'שלב 1: פתחי את Luna29 ב-Chrome/Edge.',
      androidStep2: 'שלב 2: הקישי בתפריט הדפדפן ובחרי «התקנת אפליקציה».',
      fallback: 'Safari -> שיתוף -> הוספה למסך הבית.',
      close: 'סגירה',
      openPrompt: 'פתיחת התקנת Android',
    },
  };
  const installGuideModal = getLang(installGuideModalByLang, lang) || installGuideModalByLang.en!;

  const socialLinks = [
    {
      id: 'facebook',
      label: 'Facebook',
      href: 'https://facebook.com',
      icon: Facebook,
      iconBg: 'bg-[#1877F2]/15',
      iconColor: 'text-[#1877F2]',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: Instagram,
      iconBg: 'bg-gradient-to-br from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20',
      iconColor: 'text-[#DD2A7B]',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      href: 'https://youtube.com',
      icon: Youtube,
      iconBg: 'bg-[#FF0000]/15',
      iconColor: 'text-[#FF0000]',
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      href: 'https://tiktok.com',
      icon: Music2,
      iconBg: 'bg-[#111111]/15 dark:bg-white/10',
      iconColor: 'text-[#111111] dark:text-white',
    },
  ];
  const aboutLabelByLang: LangCopy< string> = {
    en: 'About',
    ru: 'О проекте',
    uk: 'Про проект',
    es: 'Acerca',
    fr: 'A Propos',
    de: 'Uber',
    zh: '关于',
    ja: '概要',
    pt: 'Sobre',
  ar: 'حول',
  he: 'אודות',};
  const memberNav = getMemberNavCopy(lang);
  const calendarSeoTitleByLang: LangCopy<string> = {
    en: 'Rhythm Calendar | Luna29',
    ru: 'Календарь ритма | Luna29',
    uk: 'Календар ритму | Luna29',
    es: 'Calendario de ritmo | Luna29',
    fr: 'Calendrier du rythme | Luna29',
    de: 'Rhythmus-Kalender | Luna29',
    zh: '节律日历 | Luna29',
    ja: 'リズムカレンダー | Luna29',
    pt: 'Calendário de ritmo | Luna29',
    ar: 'تقويم الإيقاع | Luna29',
    he: 'לוח קצב | Luna29',
  };
  const calendarSeoDescriptionByLang: LangCopy<string> = {
    en: 'Preview Luna29 Rhythm Calendar: editorial month and year views, daily notes, print, share, and calendar sync.',
    ru: 'Preview календаря ритма Luna29: editorial месяц и год, записи на каждый день, печать, обмен и синхронизация.',
    uk: 'Preview календаря ритму Luna29: editorial місяць і рік, щоденні записи, друк, обмін і синхронізація.',
    es: 'Vista previa del calendario de ritmo Luna29: vistas editoriales, notas diarias, impresión, compartir y sync.',
    fr: 'Aperçu du calendrier du rythme Luna29: vues éditoriales, notes quotidiennes, impression, partage et sync.',
    de: 'Vorschau des Luna29 Rhythmus-Kalenders: Editorial-Ansichten, Tagesnotizen, Druck, Teilen und Sync.',
    zh: '预览 Luna29 节律日历：编辑式月年视图、每日记录、打印、分享与同步。',
    ja: 'Luna29リズムカレンダーのプレビュー：エディトリアル表示、日次メモ、印刷・共有・同期。',
    pt: 'Prévia do calendário de ritmo Luna29: visões editoriais, notas diárias, impressão, compartilhamento e sync.',
    ar: 'معاينة تقويم الإيقاع Luna29: عروض تحريرية شهرية وسنوية، ملاحظات يومية، طباعة ومشاركة ومزامنة.',
    he: 'תצוגה מקדימה של לוח הקצב Luna29: תצוגות עריכה, הערות יומיות, הדפסה, שיתוף וסנכרון.',
  };
  const calendarHomeServiceByLang: LangCopy<{ title: string; body: string }> = {
    en: { title: 'Rhythm Calendar', body: 'Editorial month and year views with daily notes, print, and sync.' },
    ru: { title: 'Календарь ритма', body: 'Editorial месяц и год с записями на каждый день, печатью и синхронизацией.' },
    uk: { title: 'Календар ритму', body: 'Editorial місяць і рік з щоденними записами, друком і синхронізацією.' },
    es: { title: 'Calendario de ritmo', body: 'Vistas editoriales mensuales y anuales con notas diarias, impresión y sync.' },
    fr: { title: 'Calendrier du rythme', body: 'Vues éditoriales mois et année avec notes quotidiennes, impression et sync.' },
    de: { title: 'Rhythmus-Kalender', body: 'Editorial Monats- und Jahresansicht mit Tagesnotizen, Druck und Sync.' },
    zh: { title: '节律日历', body: '编辑式月年视图，含每日记录、打印与同步。' },
    ja: { title: 'リズムカレンダー', body: '日次メモ・印刷・同期付きのエディトリアル月/年ビュー。' },
    pt: { title: 'Calendário de ritmo', body: 'Visões editoriais mensais e anuais com notas diárias, impressão e sync.' },
    ar: { title: 'تقويم الإيقاع', body: 'عرض شهري وسنوي تحريري مع ملاحظات يومية وطباعة ومزامنة.' },
    he: { title: 'לוח קצב', body: 'תצוגות חודש ושנה עריכתיות עם הערות יומיות, הדפסה וסנכרון.' },
  };
  const calendarHomeService = getLang(calendarHomeServiceByLang, lang) || calendarHomeServiceByLang.en;
  const footerPageLinks: Array<{ id: PublicPage; label: string }> = [
    { id: 'home', label: ui.publicHome.tabs.home },
    { id: 'map', label: ui.publicHome.tabs.map },
    { id: 'calendar', label: memberNav.rhythmCalendar },
    { id: 'ritual', label: 'Ritual Path' },
    { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
    { id: 'pricing', label: getLang(pricingLabelByLang, lang) || 'Pricing' },
    { id: 'about', label: getLang(aboutLabelByLang, lang) || 'About' },
    { id: 'how_it_works', label: getLang(howItWorksLabelByLang, lang) || 'How It Works' },
    { id: 'faq', label: getLang(faqLabelByLang, lang) || 'FAQ' },
    { id: 'learning', label: getLang(learningLabelByLang, lang) || 'Learning' },
    { id: 'privacy', label: legalLabels.privacy },
    { id: 'terms', label: legalLabels.terms },
    { id: 'medical', label: legalLabels.medical },
    { id: 'cookies', label: legalLabels.cookies },
    { id: 'data_rights', label: legalLabels.dataRights },
  ];
  const aboutPageTitleByLang: LangCopy< string> = {
    en: 'About Luna29',
    ru: 'О Luna29',
    uk: 'Про Luna29',
    es: 'Sobre Luna29',
    fr: 'A propos de Luna29',
    de: 'Uber Luna29',
    zh: '关于 Luna29',
    ja: 'Luna29 について',
    pt: 'Sobre Luna29',
  ar: 'حول Luna29',
  he: 'אודות Luna29',};
  const publicSharedByLang: Partial<
    Record<
      Language,
      {
      flowSummary: string;
      appliedTitle: string;
      appliedBody: string;
      }
    >
  > = {
    en: {
      flowSummary: 'Together this forms a clear picture of your inner state.',
      appliedTitle: 'Applied In Member Zone',
      appliedBody: 'In the member zone, Luna29 Balance becomes practical: move through cycle day, see phase shifts, read sensitivity states, and connect markers to daily decisions.',
    },
    ru: {
      flowSummary: 'Вместе это формирует понятную картину внутреннего состояния.',
      appliedTitle: 'Практика в зоне участника',
      appliedBody: 'В зоне участника Luna29 Balance становится практичной: вы двигаетесь по дню цикла, видите сдвиги фаз, состояния чувствительности и связываете маркеры с ежедневными решениями.',
    },
    uk: {
      flowSummary: 'Разом це формує зрозумілу картину внутрішнього стану.',
      appliedTitle: 'Практика в зоні учасника',
      appliedBody: 'У зоні учасника Luna29 Balance стає практичною: рух по дню циклу, зміни фаз, стани чутливості та звʼязок маркерів із щоденними рішеннями.',
    },
    es: {
      flowSummary: 'En conjunto, esto forma una imagen clara de tu estado interno.',
      appliedTitle: 'Aplicado en zona de miembro',
      appliedBody: 'En la zona de miembros, Luna29 Balance se vuelve práctico: día del ciclo, cambios de fase, sensibilidad y conexión de marcadores con decisiones diarias.',
    },
    fr: {
      flowSummary: 'Ensemble, cela forme une image claire de votre état intérieur.',
      appliedTitle: 'Appliqué dans la zone membre',
      appliedBody: 'Dans la zone membre, Luna29 Balance devient pratique: jour du cycle, transitions de phase, états de sensibilité et lien avec les décisions quotidiennes.',
    },
    de: {
      flowSummary: 'Zusammen ergibt das ein klares Bild deines inneren Zustands.',
      appliedTitle: 'Angewendet in der Mitgliederzone',
      appliedBody: 'In der Mitgliederzone wird Luna29 Balance praktisch: Zyklustag, Phasenwechsel, Sensitivitätszustände und Verknüpfung der Marker mit täglichen Entscheidungen.',
    },
    zh: {
      flowSummary: '这些模块组合在一起，形成清晰的内在状态图景。',
      appliedTitle: '在会员区中落地',
      appliedBody: '在会员区，Luna29 Balance 变得可执行：查看周期日、阶段变化、敏感状态，并将指标连接到日常决策。',
    },
    ja: {
      flowSummary: 'これらを合わせることで、内的状態の全体像が明確になります。',
      appliedTitle: 'メンバーゾーンで実用化',
      appliedBody: 'メンバーゾーンでは Luna29 Balance を実践的に使えます。周期日・フェーズ変化・感受性を確認し、日々の意思決定に接続します。',
    },
    pt: {
      flowSummary: 'Juntos, esses blocos formam uma visão clara do seu estado interno.',
      appliedTitle: 'Aplicado na zona de membros',
      appliedBody: 'Na área de membros, Luna29 Balance vira prática: dia do ciclo, mudanças de fase, estados de sensibilidade e ligação dos marcadores com decisões diárias.',
    },
  };
  const publicShared = getLang(publicSharedByLang, lang) || publicSharedByLang.en!;
  const homeRefCopyByLang = {
    en: {
      heroTitle: 'Luna29 — The physiology of feeling.',
      heroBody: 'A personal system that connects body rhythms, lived observations, and calm language for your inner state.',
      heroCta: 'Try Luna29',
      heroSub: 'Private. Calm. Personal.',
      whyTitle: 'Why Luna29 exists',
      whyIntro: 'In everyday life many states are difficult to read.',
      whyPoint1: 'Fatigue.',
      whyPoint2: 'Pressure.',
      whyPoint3: 'Emotional overload.',
      whyPoint4: 'Unclear signals from the body.',
      whyOutro: 'Luna29 helps make these states clearer through observation, notes, and patterns that appear over time.',
      bodyCardTitle: 'Your\nBody',
      bodyCardText: 'physiological rhythms and markers',
      sensesCardTitle: 'Your\nSenses',
      sensesCardText: 'observations and voice notes',
      wordsCardTitle: 'Your\nWords',
      wordsCardText: 'clear and calm formulation of thought',
      miniNote: 'Together this forms a clearer picture of your inner state.',
      rhythmTitle: 'Your rhythm becomes visible',
      previous: 'Previous',
      today: 'Today',
      nextPhase: 'Next phase',
      patternsTitle: 'Patterns appear quietly over time',
      patternLabel: 'Pattern noticed',
      patternText1: 'Energy often drops two days before your cycle begins.',
      patternText2: 'Short sleep tends to affect emotional sensitivity the next day.',
      voiceTitle: 'Голосовая заметка',
      voiceText1: 'Sometimes it is easier to speak than write.',
      voiceText2: 'Record a short voice note about how you feel and what happened during your day.',
      voiceText3: 'Over time these moments become part of your personal story.',
      record: 'Record',
      bridgeTitle: 'Мост',
      bridgeText1: 'Sometimes it is difficult to explain how you feel.',
      bridgeText2: 'Luna29 helps formulate calm and clear words for your state.',
      bridgeText3: 'For yourself first.',
      bridgeText4: 'And, if you choose, for someone close to you.',
      resetHeading: 'Комната восстановления',
      resetTitle: 'Begin observing your rhythm.',
      resetCta: 'Create your Luna29 space',
    },
    ru: {
      heroTitle: 'Luna29 — физиология чувств.',
      heroBody: 'Личная система, которая соединяет ритмы тела, наблюдения из жизни и спокойный язык для вашего внутреннего состояния.',
      heroCta: 'Попробовать Luna29',
      heroSub: 'Приватно. Спокойно. Лично.',
      whyTitle: 'Почему существует Luna29',
      whyIntro: 'В повседневной жизни многие состояния трудно распознать.',
      whyPoint1: 'Усталость.',
      whyPoint2: 'Напряжение.',
      whyPoint3: 'Эмоциональная перегрузка.',
      whyPoint4: 'Неясные сигналы от тела.',
      whyOutro: 'Luna29 помогает сделать эти состояния понятнее через наблюдение, заметки и паттерны, которые проявляются со временем.',
      bodyCardTitle: 'Ваше\nтело',
      bodyCardText: 'физиологические ритмы и маркеры',
      sensesCardTitle: 'Ваши\nощущения',
      sensesCardText: 'наблюдения и голосовые заметки',
      wordsCardTitle: 'Ваши\nслова',
      wordsCardText: 'ясная и спокойная формулировка мыслей',
      miniNote: 'Вместе это формирует более ясную картину вашего внутреннего состояния.',
      rhythmTitle: 'Ваш ритм становится видимым',
      previous: 'Ранее',
      today: 'Сегодня',
      nextPhase: 'Следующая фаза',
      patternsTitle: 'Паттерны тихо проявляются со временем',
      patternLabel: 'Обнаружен паттерн',
      patternText1: 'Энергия часто падает за два дня до начала цикла.',
      patternText2: 'Короткий сон на следующий день повышает эмоциональную чувствительность.',
      voiceTitle: 'Voice Note',
      voiceText1: 'Иногда проще сказать, чем написать.',
      voiceText2: 'Запишите короткую голосовую заметку о том, как вы себя чувствуете и что произошло за день.',
      voiceText3: 'Со временем эти моменты становятся частью вашей личной истории.',
      record: 'Запись',
      bridgeTitle: 'Puente',
      bridgeText1: 'Иногда сложно объяснить, что вы чувствуете.',
      bridgeText2: 'Luna29 помогает формулировать состояние спокойно и ясно.',
      bridgeText3: 'Сначала для себя.',
      bridgeText4: 'И, если захотите, для близкого человека.',
      resetHeading: 'Sala de reinicio',
      resetTitle: 'Начните наблюдать свой ритм.',
      resetCta: 'Создать своё пространство Luna29',
    },
    uk: {
      heroTitle: 'Luna29 — фізіологія відчуттів.',
      heroBody: 'Персональна система, що поєднує ритми тіла, щоденні спостереження та спокійну мову для вашого внутрішнього стану.',
      heroCta: 'Спробувати Luna29',
      heroSub: 'Приватно. Спокійно. Особисто.',
      whyTitle: 'Чому існує Luna29',
      whyIntro: 'У щоденному житті багато станів важко зчитати.',
      whyPoint1: 'Втома.',
      whyPoint2: 'Напруга.',
      whyPoint3: 'Емоційне перевантаження.',
      whyPoint4: 'Нечіткі сигнали тіла.',
      whyOutro: 'Luna29 допомагає зробити ці стани зрозумілішими через спостереження, нотатки та патерни, що проявляються з часом.',
      bodyCardTitle: 'Ваше\nтіло',
      bodyCardText: 'фізіологічні ритми та маркери',
      sensesCardTitle: 'Ваші\nвідчуття',
      sensesCardText: 'спостереження та голосові нотатки',
      wordsCardTitle: 'Ваші\nслова',
      wordsCardText: 'чітке й спокійне формулювання думок',
      miniNote: 'Разом це формує яснішу картину вашого внутрішнього стану.',
      rhythmTitle: 'Ваш ритм стає видимим',
      previous: 'Раніше',
      today: 'Сьогодні',
      nextPhase: 'Наступна фаза',
      patternsTitle: 'Патерни тихо проявляються з часом',
      patternLabel: 'Помічений патерн',
      patternText1: 'Енергія часто знижується за два дні до початку циклу.',
      patternText2: 'Короткий сон зазвичай підвищує емоційну чутливість наступного дня.',
      voiceTitle: 'Голосова нотатка',
      voiceText1: 'Іноді легше сказати, ніж написати.',
      voiceText2: 'Запишіть коротку голосову нотатку про те, як ви почуваєтесь і що відбулося протягом дня.',
      voiceText3: 'З часом ці моменти стають частиною вашої особистої історії.',
      record: 'Запис',
      bridgeTitle: 'Міст',
      bridgeText1: 'Іноді складно пояснити, що ви відчуваєте.',
      bridgeText2: 'Luna29 допомагає формулювати ваш стан спокійно й чітко.',
      bridgeText3: 'Спочатку для себе.',
      bridgeText4: 'А якщо захочете, і для близької людини.',
      resetHeading: 'Кімната відновлення',
      resetTitle: 'Почніть спостерігати свій ритм.',
      resetCta: 'Створити свій простір Luna29',
    },
    es: {
      heroTitle: 'Luna29 — la fisiología del sentir.',
      heroBody: 'Un sistema personal que conecta ritmos del cuerpo, observaciones cotidianas y un lenguaje sereno para tu estado interior.',
      heroCta: 'Probar Luna29',
      heroSub: 'Privado. Calma. Personal.',
      whyTitle: 'Por qué existe Luna29',
      whyIntro: 'En la vida diaria muchos estados son difíciles de leer.',
      whyPoint1: 'Fatiga.',
      whyPoint2: 'Presión.',
      whyPoint3: 'Sobrecarga emocional.',
      whyPoint4: 'Señales poco claras del cuerpo.',
      whyOutro: 'Luna29 ayuda a aclarar estos estados mediante observación, reflexión y patrones que aparecen con el tiempo.',
      bodyCardTitle: 'Tu\ncuerpo',
      bodyCardText: 'ritmos fisiológicos y marcadores',
      sensesCardTitle: 'Tus\nsensaciones',
      sensesCardText: 'observaciones y notas de voz',
      wordsCardTitle: 'Tus\npalabras',
      wordsCardText: 'formulación clara y serena de pensamientos',
      miniNote: 'Juntas, estas señales forman una imagen más clara de tu estado interior.',
      rhythmTitle: 'Tu ritmo se vuelve visible',
      previous: 'Anterior',
      today: 'Hoy',
      nextPhase: 'Siguiente fase',
      patternsTitle: 'Los patrones aparecen en silencio con el tiempo',
      patternLabel: 'Patrón detectado',
      patternText1: 'La energía suele bajar dos días antes de que inicie tu ciclo.',
      patternText2: 'Dormir poco suele aumentar la sensibilidad emocional al día siguiente.',
      voiceTitle: 'Nota de voz',
      voiceText1: 'A veces es más fácil hablar que escribir.',
      voiceText2: 'Graba una breve reflexión de voz sobre cómo te sientes y qué ocurrió durante el día.',
      voiceText3: 'Con el tiempo, estos momentos se convierten en parte de tu historia personal.',
      record: 'Grabar',
      bridgeTitle: 'Le Pont',
      bridgeText1: 'A veces es difícil explicar cómo te sientes.',
      bridgeText2: 'Luna29 te ayuda a formular tu estado con calma y claridad.',
      bridgeText3: 'Primero para ti.',
      bridgeText4: 'Y, si lo eliges, para alguien cercano.',
      resetHeading: 'Salle de réinitialisation',
      resetTitle: 'Empieza a observar tu ritmo.',
      resetCta: 'Crear tu espacio Luna29',
    },
    fr: {
      heroTitle: 'Luna29 — la physiologie du ressenti.',
      heroBody: 'Un systeme personnel qui relie les rythmes du corps, les observations du quotidien et un langage calme pour votre etat interieur.',
      heroCta: 'Essayer Luna29',
      heroSub: 'Prive. Calme. Personnel.',
      whyTitle: 'Pourquoi Luna29 existe',
      whyIntro: 'Dans la vie quotidienne, de nombreux etats sont difficiles a lire.',
      whyPoint1: 'Fatigue.',
      whyPoint2: 'Pression.',
      whyPoint3: 'Surcharge emotionnelle.',
      whyPoint4: 'Signaux corporels peu clairs.',
      whyOutro: 'Luna29 aide a clarifier ces etats par l observation, la reflexion et les tendances qui apparaissent avec le temps.',
      bodyCardTitle: 'Votre\ncorps',
      bodyCardText: 'rythmes physiologiques et marqueurs',
      sensesCardTitle: 'Vos\nsens',
      sensesCardText: 'observations et notes vocales',
      wordsCardTitle: 'Vos\nmots',
      wordsCardText: 'formulation claire et calme des pensees',
      miniNote: 'Ensemble, cela forme une image plus claire de votre etat interieur.',
      rhythmTitle: 'Votre rythme devient visible',
      previous: 'Precedent',
      today: 'Aujourd hui',
      nextPhase: 'Phase suivante',
      patternsTitle: 'Les tendances apparaissent doucement avec le temps',
      patternLabel: 'Tendance observee',
      patternText1: 'L energie baisse souvent deux jours avant le debut du cycle.',
      patternText2: 'Un sommeil court tend a augmenter la sensibilite emotionnelle le lendemain.',
      voiceTitle: 'Note vocale',
      voiceText1: 'Parfois, il est plus facile de parler que d ecrire.',
      voiceText2: 'Enregistrez une courte note vocale sur votre ressenti et ce qui s est passe dans la journee.',
      voiceText3: 'Avec le temps, ces moments deviennent une partie de votre histoire personnelle.',
      record: 'Enregistrer',
      bridgeTitle: 'Die Brücke',
      bridgeText1: 'Parfois, il est difficile d expliquer ce que vous ressentez.',
      bridgeText2: 'Luna29 vous aide a formuler votre etat avec calme et clarte.',
      bridgeText3: 'D abord pour vous.',
      bridgeText4: 'Et, si vous le souhaitez, pour une personne proche.',
      resetHeading: 'Reset-Raum',
      resetTitle: 'Commencez a observer votre rythme.',
      resetCta: 'Creer votre espace Luna29',
    },
    de: {
      heroTitle: 'Luna29 — die Physiologie des Fuehlens.',
      heroBody: 'Ein persoenliches System, das Koerperrhythmen, alltaegliche Beobachtungen und eine ruhige Sprache fuer Ihren inneren Zustand verbindet.',
      heroCta: 'Luna29 testen',
      heroSub: 'Privat. Ruhig. Persoenlich.',
      whyTitle: 'Warum Luna29 existiert',
      whyIntro: 'Im Alltag sind viele Zustaende schwer zu erkennen.',
      whyPoint1: 'Muedigkeit.',
      whyPoint2: 'Druck.',
      whyPoint3: 'Emotionale Ueberlastung.',
      whyPoint4: 'Unklare Signale des Koerpers.',
      whyOutro: 'Luna29 hilft, diese Zustaende durch Beobachtung, Reflexion und Muster, die mit der Zeit sichtbar werden, klarer zu machen.',
      bodyCardTitle: 'Ihr\nKoerper',
      bodyCardText: 'physiologische Rhythmen und Marker',
      sensesCardTitle: 'Ihre\nWahrnehmung',
      sensesCardText: 'Beobachtungen und Sprachnotizen',
      wordsCardTitle: 'Ihre\nWorte',
      wordsCardText: 'klare und ruhige Formulierung von Gedanken',
      miniNote: 'Zusammen ergibt das ein klareres Bild Ihres inneren Zustands.',
      rhythmTitle: 'Ihr Rhythmus wird sichtbar',
      previous: 'Vorher',
      today: 'Heute',
      nextPhase: 'Naechste Phase',
      patternsTitle: 'Muster zeigen sich mit der Zeit leise',
      patternLabel: 'Muster erkannt',
      patternText1: 'Die Energie sinkt oft zwei Tage vor Beginn des Zyklus.',
      patternText2: 'Kurzer Schlaf erhoeht am naechsten Tag haeufig die emotionale Sensitivitaet.',
      voiceTitle: 'Sprachnotiz',
      voiceText1: 'Manchmal ist Sprechen leichter als Schreiben.',
      voiceText2: 'Nehmen Sie eine kurze Sprachreflexion auf: wie Sie sich fuehlen und was im Tagesverlauf passiert ist.',
      voiceText3: 'Mit der Zeit werden diese Momente Teil Ihrer persoenlichen Geschichte.',
      record: 'Aufnehmen',
      bridgeTitle: '连接桥',
      bridgeText1: 'Manchmal ist es schwer zu erklaeren, wie Sie sich fuehlen.',
      bridgeText2: 'Luna29 hilft, Ihren Zustand ruhig und klar zu formulieren.',
      bridgeText3: 'Zuerst fuer sich selbst.',
      bridgeText4: 'Und, wenn Sie moechten, fuer eine nahestehende Person.',
      resetHeading: '重置空间',
      resetTitle: 'Beginnen Sie, Ihren Rhythmus zu beobachten.',
      resetCta: 'Ihren Luna29-Bereich erstellen',
    },
    zh: {
      heroTitle: 'Luna29 - 感受的生理学。',
      heroBody: '一个个人系统，将身体节律、日常观察与平静表达连接起来，帮助你理解自己的内在状态。',
      heroCta: '体验 Luna29',
      heroSub: '私密。平静。专属。',
      whyTitle: '为什么有 Luna29',
      whyIntro: '在日常生活中，很多状态都不容易被读懂。',
      whyPoint1: '疲劳。',
      whyPoint2: '压力。',
      whyPoint3: '情绪过载。',
      whyPoint4: '身体信号不清晰。',
      whyOutro: 'Luna29 通过观察、反思和随时间出现的规律，让这些状态更清晰。',
      bodyCardTitle: '你的\n身体',
      bodyCardText: '生理节律与关键指标',
      sensesCardTitle: '你的\n感受',
      sensesCardText: '观察记录与语音笔记',
      wordsCardTitle: '你的\n表达',
      wordsCardText: '清晰、平静地组织想法',
      miniNote: '这些信息结合在一起，会形成更清晰的内在状态画像。',
      rhythmTitle: '你的节律变得可见',
      previous: '之前',
      today: '今天',
      nextPhase: '下一阶段',
      patternsTitle: '规律会在时间中悄然出现',
      patternLabel: '发现规律',
      patternText1: '通常在周期开始前两天，能量会下降。',
      patternText2: '睡眠不足通常会在次日提高情绪敏感度。',
      voiceTitle: '语音笔记',
      voiceText1: '有时说出来比写下来更容易。',
      voiceText2: '记录一段简短语音，描述你的感受和当天发生的事情。',
      voiceText3: '随着时间推移，这些片段会成为你个人故事的一部分。',
      record: '录音',
      bridgeTitle: 'ブリッジ',
      bridgeText1: '有时很难解释自己的感受。',
      bridgeText2: 'Luna29 帮助你用平静而清晰的语言表达当前状态。',
      bridgeText3: '先对自己说清楚。',
      bridgeText4: '如果你愿意，也可以说给亲近的人。',
      resetHeading: 'リセットルーム',
      resetTitle: '开始观察你的节律。',
      resetCta: '创建你的 Luna29 空间',
    },
    ja: {
      heroTitle: 'Luna29 - 感覚の生理学。',
      heroBody: '身体のリズム、日々の観察、そして穏やかな言葉をつなぎ、あなたの内側の状態を理解するためのパーソナルシステムです。',
      heroCta: 'Luna29を試す',
      heroSub: 'プライベート。穏やか。パーソナル。',
      whyTitle: 'なぜ Luna29 があるのか',
      whyIntro: '日常の中には、読み取りにくい状態がたくさんあります。',
      whyPoint1: '疲労。',
      whyPoint2: 'プレッシャー。',
      whyPoint3: '感情の過負荷。',
      whyPoint4: '身体からの不明瞭なサイン。',
      whyOutro: 'Luna29 は観察と振り返り、そして時間とともに現れるパターンによって、これらの状態をより明確にします。',
      bodyCardTitle: 'あなたの\n身体',
      bodyCardText: '生理リズムとマーカー',
      sensesCardTitle: 'あなたの\n感覚',
      sensesCardText: '観察と音声メモ',
      wordsCardTitle: 'あなたの\n言葉',
      wordsCardText: '考えを穏やかに、明確に言語化',
      miniNote: 'これらを合わせることで、内側の状態がより明確に見えてきます。',
      rhythmTitle: 'あなたのリズムが見える',
      previous: '前',
      today: '今日',
      nextPhase: '次のフェーズ',
      patternsTitle: 'パターンは時間とともに静かに現れます',
      patternLabel: 'パターンを検出',
      patternText1: '周期が始まる2日前に、エネルギーが下がることがよくあります。',
      patternText2: '睡眠が短いと、翌日の感情の敏感さが高まる傾向があります。',
      voiceTitle: 'ボイスノート',
      voiceText1: '書くより、話すほうが楽なときがあります。',
      voiceText2: '今日の出来事と気分について、短い音声リフレクションを録音してください。',
      voiceText3: '時間がたつほど、これらの瞬間はあなたの物語の一部になります。',
      record: '録音',
      bridgeTitle: 'A Ponte',
      bridgeText1: '気持ちを説明するのが難しいときがあります。',
      bridgeText2: 'Luna29 は、その状態を穏やかで明確な言葉にするのを助けます。',
      bridgeText3: 'まずは自分のために。',
      bridgeText4: 'そして望むなら、大切な人のためにも。',
      resetHeading: 'Sala de reinício',
      resetTitle: 'あなたのリズム観察を始めましょう。',
      resetCta: 'Luna29スペースを作成',
    },
    pt: {
      heroTitle: 'Luna29 — a fisiologia de sentir.',
      heroBody: 'Um sistema pessoal que conecta ritmos do corpo, observacoes do dia a dia e uma linguagem calma para o seu estado interno.',
      heroCta: 'Experimentar Luna29',
      heroSub: 'Privado. Calmo. Pessoal.',
      whyTitle: 'Por que a Luna29 existe',
      whyIntro: 'Na vida cotidiana, muitos estados sao dificeis de entender.',
      whyPoint1: 'Fadiga.',
      whyPoint2: 'Pressao.',
      whyPoint3: 'Sobrecarga emocional.',
      whyPoint4: 'Sinais pouco claros do corpo.',
      whyOutro: 'A Luna29 ajuda a tornar esses estados mais claros por meio de observacao, reflexao e padroes que aparecem com o tempo.',
      bodyCardTitle: 'Seu\ncorpo',
      bodyCardText: 'ritmos fisiologicos e marcadores',
      sensesCardTitle: 'Seus\nsentidos',
      sensesCardText: 'observacoes e notas de voz',
      wordsCardTitle: 'Suas\npalavras',
      wordsCardText: 'formulacao clara e calma dos pensamentos',
      miniNote: 'Juntas, essas informacoes formam um retrato mais claro do seu estado interno.',
      rhythmTitle: 'Seu ritmo fica visivel',
      previous: 'Anterior',
      today: 'Hoje',
      nextPhase: 'Proxima fase',
      patternsTitle: 'Padroes aparecem silenciosamente com o tempo',
      patternLabel: 'Padrao identificado',
      patternText1: 'A energia costuma cair dois dias antes do inicio do ciclo.',
      patternText2: 'Sono curto tende a aumentar a sensibilidade emocional no dia seguinte.',
      voiceTitle: 'Nota de voz',
      voiceText1: 'As vezes e mais facil falar do que escrever.',
      voiceText2: 'Grave uma breve reflexao em voz sobre como voce se sente e o que aconteceu durante o dia.',
      voiceText3: 'Com o tempo, esses momentos se tornam parte da sua historia pessoal.',
      record: 'Gravar',
      bridgeTitle: 'A Ponte',
      bridgeText1: 'As vezes e dificil explicar como voce se sente.',
      bridgeText2: 'A Luna29 ajuda a formular seu estado com calma e clareza.',
      bridgeText3: 'Primeiro para voce.',
      bridgeText4: 'E, se quiser, para alguem proximo.',
      resetHeading: 'Sala de reinício',
      resetTitle: 'Comece a observar seu ritmo.',
      resetCta: 'Criar seu espaco Luna29',
    },
  ar: {
      heroTitle: 'Luna29 — فسيولوجيا الشعور.',
      heroBody: 'نظام شخصي يربط إيقاعات الجسم والملاحظات اليومية ولغة هادئة لحالتك الداخلية.',
      heroCta: 'جرّبي Luna29',
      heroSub: 'خاص. هادئ. شخصي.',
      whyTitle: 'لماذا وُجدت Luna29',
      whyIntro: 'في الحياة اليومية، كثير من الحالات صعبة القراءة.',
      whyPoint1: 'الإرهاق.',
      whyPoint2: 'الضغط.',
      whyPoint3: 'الحمل العاطفي الزائد.',
      whyPoint4: 'إشارات غير واضحة من الجسم.',
      whyOutro: 'Luna29 تساعد على توضيح هذه الحالات عبر الملاحظة والملاحظات والأنماط التي تظهر مع الوقت.',
      bodyCardTitle: 'جسمك',
      bodyCardText: 'الإيقاعات الفسيولوجية والمؤشرات',
      sensesCardTitle: 'حواسك',
      sensesCardText: 'الملاحظات والملاحظات الصوتية',
      wordsCardTitle: 'كلماتك',
      wordsCardText: 'صياغة واضحة وهادئة للفكر',
      miniNote: 'معاً تشكّل صورة أوضح لحالتك الداخلية.',
      rhythmTitle: 'إيقاعك يصبح مرئياً',
      previous: 'السابق',
      today: 'اليوم',
      nextPhase: 'المرحلة التالية',
      patternsTitle: 'الأنماط تظهر بهدوء مع الوقت',
      patternLabel: 'نمط ملحوظ',
      patternText1: 'الطاقة غالباً تنخفض قبل يومين من بدء دورتك.',
      patternText2: 'النوم القصير يميل لتأثير الحساسية العاطفية في اليوم التالي.',
      voiceTitle: 'ملاحظة صوتية',
      voiceText1: 'أحياناً التحدّث أسهل من الكتابة.',
      voiceText2: 'سجّلي ملاحظة صوتية قصيرة عن شعورك وما حدث خلال يومك.',
      voiceText3: 'مع الوقت تصبح هذه اللحظات جزءاً من قصتك الشخصية.',
      record: 'تسجيل',
      bridgeTitle: 'الجسر',
      bridgeText1: 'أحياناً يصعب شرح شعورك.',
      bridgeText2: 'Luna29 تساعد على صياغة حالتك بكلمات هادئة وواضحة.',
      bridgeText3: 'لكِ أولاً.',
      bridgeText4: 'وإن اخترتِ، لشخص قريب منك.',
      resetHeading: 'غرفة إعادة التوازن',
      resetTitle: 'ابدئي مراقبة إيقاعك.',
      resetCta: 'أنشئي مساحة Luna29 الخاصة بك',
    },
  he: {
      heroTitle: 'Luna29 — הפיזיולוגיה של הרגש.',
      heroBody: 'מערכת אישית שמחברת קצבי גוף, תצפיות יומיות ושפה רגועה למצב הפנימי שלך.',
      heroCta: 'נסי את Luna29',
      heroSub: 'פרטי. רגוע. אישי.',
      whyTitle: 'למה Luna29 קיימת',
      whyIntro: 'בחיים היומיומיים הרבה מצבים קשים לקריאה.',
      whyPoint1: 'עייפות.',
      whyPoint2: 'לחץ.',
      whyPoint3: 'עומס רגשי.',
      whyPoint4: 'אותות לא ברורים מהגוף.',
      whyOutro: 'Luna29 עוזרת להבהיר מצבים אלה דרך תצפית, הערות ודפוסים שמופיעים עם הזמן.',
      bodyCardTitle: 'הגוף\nשלך',
      bodyCardText: 'קצבים פיזיולוגיים וסמנים',
      sensesCardTitle: 'החושים\nשלך',
      sensesCardText: 'תצפיות והערות קוליות',
      wordsCardTitle: 'המילים\nשלך',
      wordsCardText: 'ניסוח ברור ורגוע של מחשבות',
      miniNote: 'יחד זה יוצר תמונה ברורה יותר של המצב הפנימי שלך.',
      rhythmTitle: 'הקצב שלך נהיה נראה',
      previous: 'הקודם',
      today: 'היום',
      nextPhase: 'שלב הבא',
      patternsTitle: 'דפוסים מופיעים בשקט עם הזמן',
      patternLabel: 'דפוס שזוהה',
      patternText1: 'האנרגיה לרוב יורדת יומיים לפני תחילת המחזור.',
      patternText2: 'שינה קצרה נוטה להשפיע על רגישות רגשית למחרת.',
      voiceTitle: 'הערה קולית',
      voiceText1: 'לפעמים קל יותר לדבר מאשר לכתוב.',
      voiceText2: 'הקליטי הערה קולית קצרה על איך את מרגישה ומה קרה במהלך היום.',
      voiceText3: 'עם הזמן הרגעים האלה הופכים לחלק מהסיפור האישי שלך.',
      record: 'הקלטה',
      bridgeTitle: 'הגשר',
      bridgeText1: 'לפעמים קשה להסביר איך את מרגישה.',
      bridgeText2: 'Luna29 עוזרת לנסח את המצב במילים רגועות וברורות.',
      bridgeText3: 'קודם בשבילך.',
      bridgeText4: 'ואם תבחרי, גם למישהו קרוב.',
      resetHeading: 'חדר איפוס',
      resetTitle: 'התחילי לצפות בקצב שלך.',
      resetCta: 'צרי את מרחב Luna29 שלך',
    },};
  const homeRefCopy = getLang(homeRefCopyByLang, lang)?.heroTitle ? getLang(homeRefCopyByLang, lang) : homeRefCopyByLang.en;
  const dailyCompanionByLang: Partial<Record<
    Language,
    {
      heroTitle: string;
      heroSubtitle: string;
      primaryCta: string;
      secondaryCta: string;
      whatTitle: string;
      whatBody: string;
      ritualTitle: string;
      ritualSubtitle: string;
      stepSpeak: string;
      stepCheckin: string;
      stepRhythm: string;
      stepPattern: string;
      patternTitle: string;
      patternCardLabel: string;
      patternOne: string;
      patternTwo: string;
      finalTitle: string;
      finalCta: string;
    }
  >> = {
    en: {
      heroTitle: 'Your daily emotional mirror',
      heroSubtitle: 'Understand yourself through body, senses, and words.',
      primaryCta: "Start today's note",
      secondaryCta: 'See how Luna29 works',
      whatTitle: 'A simple daily structure',
      whatBody: 'Luna29 helps you understand your day with calm and clarity.',
      ritualTitle: 'A small daily ritual',
      ritualSubtitle: 'A clear flow you can repeat in under a minute.',
      stepSpeak: 'Speak to Luna29',
      stepCheckin: 'Quick check-in',
      stepRhythm: 'See your rhythm',
      stepPattern: 'Discover patterns',
      patternTitle: 'Pattern preview',
      patternCardLabel: 'Pattern noticed',
      patternOne: 'Energy drops two days before cycle',
      patternTwo: 'Sleep under 6h affects emotional sensitivity',
      finalTitle: 'Begin observing your rhythm',
      finalCta: 'Create your Luna29 space',
    },
    ru: {
      heroTitle: 'Ваше ежедневное эмоциональное зеркало',
      heroSubtitle: 'Понимайте себя через тело, ощущения и слова.',
      primaryCta: 'Начать сегодняшнюю заметку',
      secondaryCta: 'Как работает Luna29',
      whatTitle: 'Простая ежедневная структура',
      whatBody: 'Luna29 помогает понять день спокойно и без перегрузки.',
      ritualTitle: 'Небольшой ежедневный ритуал',
      ritualSubtitle: 'Простой поток, который легко повторять каждый день.',
      stepSpeak: 'Поговорить с Luna29',
      stepCheckin: 'Быстрый check-in',
      stepRhythm: 'Увидеть ритм',
      stepPattern: 'Замечать паттерны',
      patternTitle: 'Превью паттернов',
      patternCardLabel: 'Паттерн замечен',
      patternOne: 'Энергия снижается за два дня до цикла',
      patternTwo: 'Сон меньше 6 часов усиливает эмоциональную чувствительность',
      finalTitle: 'Начните наблюдать свой ритм',
      finalCta: 'Создать пространство Luna29',
    },
    uk: {
      heroTitle: 'Ваше щоденне емоційне дзеркало',
      heroSubtitle: 'Розумійте себе через тіло, відчуття і слова.',
      primaryCta: 'Почати сьогоднішню нотатку',
      secondaryCta: 'Як працює Luna29',
      whatTitle: 'Проста щоденна структура',
      whatBody: 'Luna29 допомагає спокійно зрозуміти свій день.',
      ritualTitle: 'Невеликий щоденний ритуал',
      ritualSubtitle: 'Короткий щоденний потік без перевантаження.',
      stepSpeak: 'Поговорити з Luna29',
      stepCheckin: 'Швидкий check-in',
      stepRhythm: 'Побачити ритм',
      stepPattern: 'Помічати патерни',
      patternTitle: 'Попередній перегляд патернів',
      patternCardLabel: 'Патерн помічено',
      patternOne: 'Енергія знижується за два дні до циклу',
      patternTwo: 'Сон менше 6 годин підвищує емоційну чутливість',
      finalTitle: 'Почніть спостерігати свій ритм',
      finalCta: 'Створити свій простір Luna29',
    },
    es: {
      heroTitle: 'Tu espejo emocional diario',
      heroSubtitle: 'Comprendete a traves del cuerpo, los sentidos y las palabras.',
      primaryCta: 'Empezar la nota de hoy',
      secondaryCta: 'Ver como funciona Luna29',
      whatTitle: 'Una estructura diaria simple',
      whatBody: 'Luna29 te ayuda a entender tu dia con calma y claridad.',
      ritualTitle: 'Un pequeno ritual diario',
      ritualSubtitle: 'Un flujo claro que puedes repetir en menos de un minuto.',
      stepSpeak: 'Hablar con Luna29',
      stepCheckin: 'Check-in rapido',
      stepRhythm: 'Ver tu ritmo',
      stepPattern: 'Descubrir patrones',
      patternTitle: 'Vista previa de patrones',
      patternCardLabel: 'Patron detectado',
      patternOne: 'La energia baja dos dias antes del ciclo',
      patternTwo: 'Dormir menos de 6 h aumenta la sensibilidad emocional',
      finalTitle: 'Comienza a observar tu ritmo',
      finalCta: 'Crear tu espacio Luna29',
    },
    fr: {
      heroTitle: 'Votre miroir emotionnel quotidien',
      heroSubtitle: 'Comprenez-vous a travers le corps, les sensations et les mots.',
      primaryCta: "Commencer la note d'aujourd'hui",
      secondaryCta: 'Voir comment Luna29 fonctionne',
      whatTitle: 'Une structure quotidienne simple',
      whatBody: 'Luna29 vous aide a comprendre votre journee avec calme et clarte.',
      ritualTitle: 'Un petit rituel quotidien',
      ritualSubtitle: 'Un flux clair a repeter en moins d une minute.',
      stepSpeak: 'Parler avec Luna29',
      stepCheckin: 'Check-in rapide',
      stepRhythm: 'Voir votre rythme',
      stepPattern: 'Decouvrir des tendances',
      patternTitle: 'Apercu des tendances',
      patternCardLabel: 'Tendance remarquee',
      patternOne: 'L energie baisse deux jours avant le cycle',
      patternTwo: 'Moins de 6 h de sommeil augmente la sensibilite emotionnelle',
      finalTitle: 'Commencez a observer votre rythme',
      finalCta: 'Creer votre espace Luna29',
    },
    de: {
      heroTitle: 'Dein taeglicher emotionaler Spiegel',
      heroSubtitle: 'Verstehe dich ueber Koerper, Sinne und Worte.',
      primaryCta: 'Heutige Notiz starten',
      secondaryCta: 'So funktioniert Luna29',
      whatTitle: 'Eine einfache Tagesstruktur',
      whatBody: 'Luna29 hilft dir, deinen Tag ruhig und klar zu verstehen.',
      ritualTitle: 'Ein kleines taegliches Ritual',
      ritualSubtitle: 'Ein klarer Ablauf, den du in unter einer Minute wiederholst.',
      stepSpeak: 'Mit Luna29 sprechen',
      stepCheckin: 'Schneller Check-in',
      stepRhythm: 'Deinen Rhythmus sehen',
      stepPattern: 'Muster erkennen',
      patternTitle: 'Muster-Vorschau',
      patternCardLabel: 'Muster erkannt',
      patternOne: 'Die Energie sinkt zwei Tage vor dem Zyklus',
      patternTwo: 'Weniger als 6 h Schlaf erhoehen die emotionale Sensibilitaet',
      finalTitle: 'Beginne, deinen Rhythmus zu beobachten',
      finalCta: 'Deinen Luna29-Raum erstellen',
    },
    zh: {
      heroTitle: '你的每日情绪镜像',
      heroSubtitle: '通过身体、感受与表达，更理解自己。',
      primaryCta: '开始今天的记录',
      secondaryCta: '了解 Luna29 如何工作',
      whatTitle: '简单的每日结构',
      whatBody: 'Luna29 帮助你以平静与清晰理解一天。',
      ritualTitle: '一个小小的每日仪式',
      ritualSubtitle: '不到一分钟即可完成的清晰流程。',
      stepSpeak: '与 Luna29 对话',
      stepCheckin: '快速 check-in',
      stepRhythm: '查看你的节律',
      stepPattern: '发现规律',
      patternTitle: '规律预览',
      patternCardLabel: '发现规律',
      patternOne: '能量会在周期前两天下降',
      patternTwo: '睡眠少于 6 小时会提高情绪敏感度',
      finalTitle: '开始观察你的节律',
      finalCta: '创建你的 Luna29 空间',
    },
    ja: {
      heroTitle: 'あなたの毎日の感情ミラー',
      heroSubtitle: 'からだ、感覚、ことばを通して自分を理解する。',
      primaryCta: '今日のメモを始める',
      secondaryCta: 'Luna29 の仕組みを見る',
      whatTitle: 'シンプルな毎日の構成',
      whatBody: 'Luna29 は一日を穏やかに分かりやすく整えます。',
      ritualTitle: '小さな毎日のリチュアル',
      ritualSubtitle: '1分以内で繰り返せる明確な流れ。',
      stepSpeak: 'Luna29 と話す',
      stepCheckin: 'クイック check-in',
      stepRhythm: 'リズムを見る',
      stepPattern: 'パターンを見つける',
      patternTitle: 'パターンプレビュー',
      patternCardLabel: 'パターンを確認',
      patternOne: 'エネルギーは周期の2日前に下がりやすい',
      patternTwo: '睡眠 6 時間未満で感情の敏感さが上がりやすい',
      finalTitle: 'あなたのリズムを観察しよう',
      finalCta: 'Luna29 スペースを作成',
    },
    pt: {
      heroTitle: 'Seu espelho emocional diario',
      heroSubtitle: 'Entenda-se por meio do corpo, dos sentidos e das palavras.',
      primaryCta: 'Iniciar a nota de hoje',
      secondaryCta: 'Ver como Luna29 funciona',
      whatTitle: 'Uma estrutura diaria simples',
      whatBody: 'A Luna29 ajuda voce a entender seu dia com calma e clareza.',
      ritualTitle: 'Um pequeno ritual diario',
      ritualSubtitle: 'Um fluxo claro para repetir em menos de um minuto.',
      stepSpeak: 'Falar com a Luna29',
      stepCheckin: 'Check-in rapido',
      stepRhythm: 'Ver seu ritmo',
      stepPattern: 'Descobrir padroes',
      patternTitle: 'Previa de padroes',
      patternCardLabel: 'Padrao identificado',
      patternOne: 'A energia cai dois dias antes do ciclo',
      patternTwo: 'Dormir menos de 6h aumenta a sensibilidade emocional',
      finalTitle: 'Comece a observar seu ritmo',
      finalCta: 'Criar seu espaco Luna29',
    },
    ar: {
      heroTitle: 'مرآتك العاطفية اليومية',
      heroSubtitle: 'افهمي نفسك عبر الجسم والحواس والكلمات.',
      primaryCta: 'ابدئي ملاحظة اليوم',
      secondaryCta: 'شاهدي كيف تعمل Luna29',
      whatTitle: 'هيكل يومي بسيط',
      whatBody: 'Luna29 تساعدك على فهم يومك بهدوء ووضوح.',
      ritualTitle: 'طقس يومي صغير',
      ritualSubtitle: 'مسار واضح يمكنك تكراره في أقل من دقيقة.',
      stepSpeak: 'تحدّثي مع Luna29',
      stepCheckin: 'تسجيل سريع',
      stepRhythm: 'شاهدي إيقاعك',
      stepPattern: 'اكتشفي الأنماط',
      patternTitle: 'معاينة الأنماط',
      patternCardLabel: 'نمط ملحوظ',
      patternOne: 'الطاقة تنخفض قبل يومين من الدورة',
      patternTwo: 'النوم أقل من 6 ساعات يؤثر على الحساسية العاطفية',
      finalTitle: 'ابدئي مراقبة إيقاعك',
      finalCta: 'أنشئي مساحة Luna29 الخاصة بك',
    },
    he: {
      heroTitle: 'המראה הרגשית היומית שלך',
      heroSubtitle: 'הביני את עצמך דרך גוף, חושים ומילים.',
      primaryCta: 'התחילי את הערת היום',
      secondaryCta: 'ראי איך Luna29 עובדת',
      whatTitle: 'מבנה יומי פשוט',
      whatBody: 'Luna29 עוזרת להבין את היום בשקט ובבהירות.',
      ritualTitle: 'טקס יומי קטן',
      ritualSubtitle: 'זרימה ברורה שאפשר לחזור עליה בפחות מדקה.',
      stepSpeak: 'דברי עם Luna29',
      stepCheckin: 'צ׳ק-אין מהיר',
      stepRhythm: 'ראי את הקצב שלך',
      stepPattern: 'גלי דפוסים',
      patternTitle: 'תצוגה מקדימה של דפוסים',
      patternCardLabel: 'דפוס שזוהה',
      patternOne: 'האנרגיה יורדת יומיים לפני המחזור',
      patternTwo: 'שינה מתחת ל-6 שעות משפיעה על רגישות רגשית',
      finalTitle: 'התחילי לצפות בקצב שלך',
      finalCta: 'צרי את מרחב Luna29 שלך',
    },
  };
  const dailyCompanionCopy = getLang(dailyCompanionByLang, lang) || dailyCompanionByLang.en!;
  const homeActionByLang: Partial<
    Record<
      Language,
      {
        talkLine: string;
        actions: Array<{ label: string; sub: string }>;
        servicesTitle: string;
        servicesSubtitle: string;
        services: Array<{ title: string; body: string }>;
      }
    >
  > = {
    en: {
      talkLine: 'You can speak with Luna29 by voice any day.',
      actions: [
        { label: 'Start Note', sub: 'Talk with Luna29 now' },
        { label: 'Check-In', sub: '30 sec emotional check-in' },
        { label: 'See Insights', sub: 'Get a gentle daily response' },
        { label: 'Body Map', sub: 'See your rhythm visually' },
      ],
      servicesTitle: 'What Luna29 includes',
      servicesSubtitle: 'Core services available after sign in.',
      services: [
        { title: 'Voice Note', body: 'Record how your day felt and get a calm note.' },
        { title: 'Daily Mirror', body: 'See today context from cycle, sleep, and check-ins.' },
        { title: 'Pattern Preview', body: 'Notice simple recurring signals over time.' },
        { title: 'My Health Reports', body: 'Upload labs/tests and generate structured reports.' },
      ],
    },
    ru: {
      talkLine: 'С Luna29 можно говорить голосом каждый день.',
      actions: [
        { label: 'Начать Заметку', sub: 'Поговорить с Luna29 сейчас' },
        { label: 'Check-In', sub: 'Эмоциональный check-in за 30 сек' },
        { label: 'Смотреть Инсайты', sub: 'Получить мягкую ежедневную обратную связь' },
        { label: 'Карта Тела', sub: 'Увидеть ритм визуально' },
      ],
      servicesTitle: 'Что включает Luna29',
      servicesSubtitle: 'Основные функции и сервисы после входа.',
      services: [
        { title: 'Voice Note', body: 'Записывайте состояние голосом и получайте спокойную заметку.' },
        { title: 'Daily Mirror', body: 'Контекст дня из цикла, сна и check-in.' },
        { title: 'Pattern Preview', body: 'Отслеживание повторяющихся сигналов во времени.' },
        { title: 'My Health Reports', body: 'Загрузка анализов/тестов и генерация структурированного отчета.' },
      ],
    },
    uk: {
      talkLine: 'З Luna29 можна говорити голосом щодня.',
      actions: [
        { label: 'Почати Нотатку', sub: 'Поговорити з Luna29 зараз' },
        { label: 'Check-In', sub: 'Емоційний check-in за 30 сек' },
        { label: 'Дивитись Інсайти', sub: 'Отримати м’який щоденний відгук' },
        { label: 'Мапа Тіла', sub: 'Побачити ритм візуально' },
      ],
      servicesTitle: 'Що включає Luna29',
      servicesSubtitle: 'Ключові функції та сервіси після входу.',
      services: [
        { title: 'Voice Note', body: 'Записуйте стан голосом і отримуйте спокійну нотатку.' },
        { title: 'Daily Mirror', body: 'Контекст дня з циклу, сну та check-in.' },
        { title: 'Pattern Preview', body: 'Відстеження повторюваних сигналів у часі.' },
        { title: 'My Health Reports', body: 'Завантаження аналізів/тестів і генерація структурованого звіту.' },
      ],
    },
    es: {
      talkLine: 'Puedes hablar con Luna29 por voz cada dia.',
      actions: [
        { label: 'Iniciar Nota', sub: 'Hablar con Luna29 ahora' },
        { label: 'Check-In', sub: 'Check-in emocional en 30 seg' },
        { label: 'Ver Insights', sub: 'Recibir una respuesta diaria suave' },
        { label: 'Mapa Corporal', sub: 'Ver tu ritmo de forma visual' },
      ],
      servicesTitle: 'Que incluye Luna29',
      servicesSubtitle: 'Funciones y servicios principales despues de iniciar sesion.',
      services: [
        { title: 'Voice Note', body: 'Graba como te sentiste hoy y recibe una nota tranquila.' },
        { title: 'Daily Mirror', body: 'Mira el contexto de hoy desde ciclo, sueno y check-ins.' },
        { title: 'Pattern Preview', body: 'Detecta senales repetidas con el paso del tiempo.' },
        { title: 'My Health Reports', body: 'Sube analisis/pruebas y genera reportes estructurados.' },
      ],
    },
    fr: {
      talkLine: 'Vous pouvez parler avec Luna29 a voix haute chaque jour.',
      actions: [
        { label: 'Demarrer Note', sub: 'Parler avec Luna29 maintenant' },
        { label: 'Check-In', sub: 'Check-in emotionnel en 30 sec' },
        { label: 'Voir Insights', sub: 'Obtenir un retour quotidien en douceur' },
        { label: 'Carte du Corps', sub: 'Voir votre rythme visuellement' },
      ],
      servicesTitle: 'Ce que Luna29 inclut',
      servicesSubtitle: 'Fonctions et services essentiels apres connexion.',
      services: [
        { title: 'Voice Note', body: 'Enregistrez votre etat du jour et recevez une note calme.' },
        { title: 'Daily Mirror', body: 'Contexte du jour via cycle, sommeil et check-ins.' },
        { title: 'Pattern Preview', body: 'Reperez les signaux recurrents au fil du temps.' },
        { title: 'My Health Reports', body: 'Importez analyses/tests et generez des rapports structures.' },
      ],
    },
    de: {
      talkLine: 'Du kannst jeden Tag per Stimme mit Luna29 sprechen.',
      actions: [
        { label: 'Notiz Starten', sub: 'Jetzt mit Luna29 sprechen' },
        { label: 'Check-In', sub: 'Emotionaler Check-in in 30 Sek' },
        { label: 'Insights Sehen', sub: 'Sanfte taegliche Rueckmeldung erhalten' },
        { label: 'Koerperkarte', sub: 'Deinen Rhythmus visuell sehen' },
      ],
      servicesTitle: 'Was Luna29 beinhaltet',
      servicesSubtitle: 'Wichtige Funktionen und Services nach dem Login.',
      services: [
        { title: 'Voice Note', body: 'Nimm deinen Tag per Stimme auf und erhalte eine ruhige Notiz.' },
        { title: 'Daily Mirror', body: 'Tageskontext aus Zyklus, Schlaf und Check-ins.' },
        { title: 'Pattern Preview', body: 'Einfache wiederkehrende Signale ueber Zeit erkennen.' },
        { title: 'My Health Reports', body: 'Analysen/Tests hochladen und strukturierte Berichte erstellen.' },
      ],
    },
    zh: {
      talkLine: '你每天都可以用语音与 Luna29 对话。',
      actions: [
        { label: '开始记录', sub: '现在就和 Luna29 说说话' },
        { label: '快速 Check-In', sub: '30 秒情绪 check-in' },
        { label: '查看洞察', sub: '获得温和的每日反馈' },
        { label: '身体地图', sub: '可视化查看你的节律' },
      ],
      servicesTitle: 'Luna29 包含的内容',
      servicesSubtitle: '登录后可用的核心功能与服务。',
      services: [
        { title: 'Voice Note', body: '语音记录你的一天，并获得平静总结。' },
        { title: 'Daily Mirror', body: '结合周期、睡眠与 check-in 查看今日状态。' },
        { title: 'Pattern Preview', body: '逐步发现重复出现的信号。' },
        { title: 'My Health Reports', body: '上传化验/测试并生成结构化报告。' },
      ],
    },
    ja: {
      talkLine: '毎日、Luna29 に声で話しかけられます。',
      actions: [
        { label: 'メモ開始', sub: '今すぐ Luna29 と話す' },
        { label: 'クイック Check-In', sub: '30秒の感情 check-in' },
        { label: 'インサイトを見る', sub: 'やさしい毎日のフィードバックを受け取る' },
        { label: 'ボディマップ', sub: 'リズムを視覚的に確認する' },
      ],
      servicesTitle: 'Luna29 に含まれる機能',
      servicesSubtitle: 'サインイン後に使える主な機能とサービス。',
      services: [
        { title: 'Voice Note', body: '一日の気持ちを音声で記録し、穏やかなメモを受け取る。' },
        { title: 'Daily Mirror', body: '周期・睡眠・check-inから今日の文脈を確認。' },
        { title: 'Pattern Preview', body: '時間とともに繰り返しのサインに気づく。' },
        { title: 'My Health Reports', body: '検査データをアップロードして構造化レポートを作成。' },
      ],
    },
    pt: {
      talkLine: 'Voce pode falar com a Luna29 por voz todos os dias.',
      actions: [
        { label: 'Iniciar Nota', sub: 'Falar com a Luna29 agora' },
        { label: 'Check-In', sub: 'Check-in emocional em 30 seg' },
        { label: 'Ver Insights', sub: 'Receber um retorno diario suave' },
        { label: 'Mapa Corporal', sub: 'Ver seu ritmo de forma visual' },
      ],
      servicesTitle: 'O que a Luna29 inclui',
      servicesSubtitle: 'Funcoes e servicos principais apos entrar.',
      services: [
        { title: 'Voice Note', body: 'Grave como seu dia foi e receba uma nota calma.' },
        { title: 'Daily Mirror', body: 'Veja o contexto de hoje por ciclo, sono e check-ins.' },
        { title: 'Pattern Preview', body: 'Perceba sinais recorrentes ao longo do tempo.' },
        { title: 'My Health Reports', body: 'Envie exames/testes e gere relatorios estruturados.' },
      ],
    },
    ar: {
      talkLine: 'يمكنك التحدث مع Luna29 بالصوت كل يوم.',
      actions: [
        { label: 'بدء ملاحظة', sub: 'تحدثي مع Luna29 الآن' },
        { label: 'Check-In', sub: 'check-in عاطفي في 30 ثانية' },
        { label: 'عرض الرؤى', sub: 'احصلي على رد يومي لطيف' },
        { label: 'خريطة الجسم', sub: 'شاهدي إيقاعك بصرياً' },
      ],
      servicesTitle: 'ما يتضمنه Luna29',
      servicesSubtitle: 'الخدمات الأساسية المتاحة بعد تسجيل الدخول.',
      services: [
        { title: 'Voice Note', body: 'سجّلي شعورك باليوم واحصلي على ملاحظة هادئة.' },
        { title: 'Daily Mirror', body: 'سياق اليوم من الدورة والنوم وcheck-in.' },
        { title: 'Pattern Preview', body: 'لاحظي إشارات متكررة ببساطة مع الوقت.' },
        { title: 'My Health Reports', body: 'ارفعي تحاليل/فحوصات وأنشئي تقارير منظمة.' },
      ],
    },
    he: {
      talkLine: 'אפשר לדבר עם Luna29 בקול בכל יום.',
      actions: [
        { label: 'התחלת הערה', sub: 'דברי עם Luna29 עכשיו' },
        { label: 'Check-In', sub: 'check-in רגשי ב-30 שניות' },
        { label: 'צפייה בתובנות', sub: 'קבלי תגובה יומית עדינה' },
        { label: 'מפת גוף', sub: 'ראי את הקצב שלך ויזואלית' },
      ],
      servicesTitle: 'מה Luna29 כוללת',
      servicesSubtitle: 'שירותים מרכזיים זמינים אחרי התחברות.',
      services: [
        { title: 'Voice Note', body: 'הקליטי איך היום הרגיש וקבלי הערה שקטה.' },
        { title: 'Daily Mirror', body: 'הקשר של היום ממחזור, שינה ו-check-in.' },
        { title: 'Pattern Preview', body: 'שימי לב לאותות חוזרים פשוטים לאורך זמן.' },
        { title: 'My Health Reports', body: 'העלי בדיקות/מעבדה ויצרי דוחות מובנים.' },
      ],
    },
  };
  const homeActionCopy = getLang(homeActionByLang, lang) || homeActionByLang.en!;
  const homeEyebrowByLang: Partial<LangCopy< string>> = {
    en: 'Luna29 Home',
    ru: 'Главная Luna29',
    uk: 'Головна Luna29',
    es: 'Inicio Luna29',
    fr: 'Accueil Luna29',
    de: 'Luna29 Start',
    zh: 'Luna29 首页',
    ja: 'Luna29 ホーム',
    pt: 'Inicio Luna29',
    ar: 'الرئيسية Luna29',
    he: 'בית Luna29',
  };
  const homePatternNoteByLang: Partial<LangCopy< string>> = {
    en: 'Observational examples from daily use.',
    ru: 'Наблюдательные примеры из ежедневного использования.',
    uk: 'Приклади спостережень із щоденного використання.',
    es: 'Ejemplos observacionales del uso diario.',
    fr: 'Exemples d observation issus de l usage quotidien.',
    de: 'Beobachtungsbeispiele aus dem taeglichen Gebrauch.',
    zh: '来自日常使用的观察示例。',
    ja: '日々の利用から得られた観察例です。',
    pt: 'Exemplos observacionais do uso diario.',
    ar: 'أمثلة للملاحظة من الاستخدام اليومي.',
    he: 'דוגמאות תצפית מהשימוש היומי.',
  };
  const homePillarsByLang: Partial<
    Record<
      Language,
      Array<{ title: string; text: string }>
    >
  > = {
    en: [
      { title: 'Your Body', text: 'body rhythms and inner signals' },
      { title: 'Your Senses', text: 'moments, feelings, and emotional tone' },
      { title: 'Your Words', text: 'voice notes and gentle thoughts' },
    ],
    ru: [
      { title: 'Ваше Тело', text: 'ритмы тела и внутренние сигналы' },
      { title: 'Ваши Ощущения', text: 'моменты, чувства и эмоциональный фон' },
      { title: 'Ваши Слова', text: 'голосовые отражения и мягкие мысли' },
    ],
    uk: [
      { title: 'Ваше Тіло', text: 'ритми тіла та внутрішні сигнали' },
      { title: 'Ваші Відчуття', text: 'моменти, почуття та емоційний тон' },
      { title: 'Ваші Слова', text: 'голосові нотатки та м’які думки' },
    ],
    es: [
      { title: 'Tu Cuerpo', text: 'ritmos del cuerpo y senales internas' },
      { title: 'Tus Sentidos', text: 'momentos, emociones y tono del dia' },
      { title: 'Tus Palabras', text: 'reflexiones por voz y pensamientos suaves' },
    ],
    fr: [
      { title: 'Votre Corps', text: 'rythmes du corps et signaux interieurs' },
      { title: 'Vos Sens', text: 'moments, ressentis et tonalite emotionnelle' },
      { title: 'Vos Mots', text: 'reflexions vocales et pensees en douceur' },
    ],
    de: [
      { title: 'Dein Koerper', text: 'Koerperrhythmen und innere Signale' },
      { title: 'Deine Sinne', text: 'Momente, Gefuehle und emotionale Stimmung' },
      { title: 'Deine Worte', text: 'Sprachreflexionen und sanfte Gedanken' },
    ],
    zh: [
      { title: '你的身体', text: '身体节律与内在信号' },
      { title: '你的感受', text: '一天中的时刻、感受与情绪' },
      { title: '你的表达', text: '语音反思与温柔想法' },
    ],
    ja: [
      { title: 'あなたの体', text: '体のリズムと内側のサイン' },
      { title: 'あなたの感覚', text: 'その日の出来事、感情、雰囲気' },
      { title: 'あなたの言葉', text: '音声リフレクションとやさしい思考' },
    ],
    pt: [
      { title: 'Seu Corpo', text: 'ritmos do corpo e sinais internos' },
      { title: 'Seus Sentidos', text: 'momentos, sentimentos e tom emocional' },
      { title: 'Suas Palavras', text: 'reflexoes por voz e pensamentos suaves' },
    ],
    ar: [
      { title: 'جسمك', text: 'إيقاعات الجسم والإشارات الداخلية' },
      { title: 'حواسك', text: 'لحظات ومشاعر ونبرة عاطفية' },
      { title: 'كلماتك', text: 'ملاحظات صوتية وأفكار لطيفة' },
    ],
    he: [
      { title: 'הגוף שלך', text: 'קצבי גוף ואותות פנימיים' },
      { title: 'החושים שלך', text: 'רגעים, רגשות וטון רגשי' },
      { title: 'המילים שלך', text: 'הערות קוליות ומחשבות עדינות' },
    ],
  };
  const homePillars = getLang(homePillarsByLang, lang) || homePillarsByLang.en!;
  const homeFeatureChipLabelsByLang: Partial<LangCopy< string[]>> = {
    en: ['Voice recording', 'Gentle insights', 'Body Map rhythm', 'Notes history'],
    ru: ['Голосовая запись', 'Мягкие инсайты', 'Body Map ритма', 'История отражений'],
    uk: ['Голосовий запис', 'М’які інсайти', 'Body Map ритму', 'Історія нотаток'],
    es: ['Grabacion de voz', 'Insights suaves', 'Ritmo en Body Map', 'Historial de reflexiones'],
    fr: ['Enregistrement vocal', 'Insights doux', 'Rythme dans Body Map', 'Historique des reflexions'],
    de: ['Sprachaufnahme', 'Sanfte Insights', 'Rhythmus in Body Map', 'Reflexionsverlauf'],
    zh: ['语音记录', '温和洞察', 'Body Map 节律', '反思历史'],
    ja: ['音声記録', 'やさしいインサイト', 'Body Map リズム', 'リフレクション履歴'],
    pt: ['Gravacao por voz', 'Insights suaves', 'Ritmo no Body Map', 'Historico de reflexoes'],
    ar: ['تسجيل صوتي', 'رؤى لطيفة', 'إيقاع Body Map', 'سجل التأملات'],
    he: ['הקלטה קולית', 'תובנות עדינות', 'קצב Body Map', 'היסטוריית רפлексיה'],
  };
  const homeFeatureChipLabels = getLang(homeFeatureChipLabelsByLang, lang) || homeFeatureChipLabelsByLang.en!;
  const publicHomeNavLabelsByLang: LangCopy< { home: string; ritual: string; map: string; adminLogin: string }> = {
    en: { home: 'Home', ritual: 'Ritual Path', map: 'Body Map', adminLogin: 'Admin Login' },
    ru: { home: 'Главная', ritual: 'Ритуальный путь', map: 'Карта тела', adminLogin: 'Вход Админ' },
    uk: { home: 'Головна', ritual: 'Ритуальний шлях', map: 'Мапа тіла', adminLogin: 'Вхід Адмін' },
    es: { home: 'Inicio', ritual: 'Ruta ritual', map: 'Mapa corporal', adminLogin: 'Acceso Admin' },
    fr: { home: 'Accueil', ritual: 'Chemin rituel', map: 'Carte du corps', adminLogin: 'Connexion Admin' },
    de: { home: 'Start', ritual: 'Ritualpfad', map: 'Körperkarte', adminLogin: 'Admin-Login' },
    zh: { home: '首页', ritual: '仪式路径', map: '身体地图', adminLogin: '管理员登录' },
    ja: { home: 'ホーム', ritual: 'リチュアルパス', map: 'ボディマップ', adminLogin: '管理者ログイン' },
    pt: { home: 'Inicio', ritual: 'Caminho ritual', map: 'Mapa corporal', adminLogin: 'Login Admin' },
  ar: { home: 'الرئيسية', ritual: 'المسار الطقسي', map: 'خريطة الجسم', adminLogin: 'دخول الإدارة' },
  he: { home: 'בית', ritual: 'נתיב טקסי', map: 'מפת הגוף', adminLogin: 'כניסת אדמין' },};
  const publicHomeNavLabels = getLang(publicHomeNavLabelsByLang, lang) || publicHomeNavLabelsByLang.en;
  const pageTitle = useMemo(() => {
    if (activePage === 'home') return ui.publicHome.pageTitle.home;
    if (activePage === 'map') return ui.publicHome.pageTitle.map;
    if (activePage === 'calendar') return memberNav.rhythmCalendar;
    if (activePage === 'ritual') return ui.publicHome.pageTitle.ritual;
    if (activePage === 'bridge') return ui.navigation.bridge || 'The Bridge';
    if (activePage === 'pricing') return getLang(pricingLabelByLang, lang) || 'Pricing';
    if (activePage === 'about') return getLang(aboutPageTitleByLang, lang) || 'About Luna29';
    if (activePage === 'how_it_works') return getLang(howItWorksLabelByLang, lang) || 'How It Works';
    if (activePage === 'faq') return getLang(faqLabelByLang, lang) || 'FAQ';
    if (activePage === 'learning') return getLang(learningLabelByLang, lang) || 'Learning';
    if (activePage === 'terms') return legalLabels.terms;
    if (activePage === 'medical') return legalLabels.medical;
    if (activePage === 'cookies') return legalLabels.cookies;
    if (activePage === 'data_rights') return legalLabels.dataRights;
    return ui.publicHome.pageTitle.privacy;
  }, [activePage, howItWorksLabelByLang, lang, legalLabels.cookies, legalLabels.dataRights, legalLabels.medical, legalLabels.terms, pricingLabelByLang, ui.publicHome.pageTitle.home, ui.publicHome.pageTitle.map, ui.publicHome.pageTitle.privacy, ui.publicHome.pageTitle.ritual]);

  useEffect(() => {
    const path = resolvePathFromPage(activePage);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    const titleByPageByLang: LangCopy< Record<Exclude<PublicPage, 'calendar'>, string>> = {
      en: { home: 'Luna29 | Public Home', map: 'Luna29 Balance | Visual Rhythm Map', ritual: 'Ritual Path | Luna29', bridge: 'The Bridge | Luna29', pricing: 'Pricing | Luna29', about: 'About Luna29', how_it_works: 'How It Works | Luna29', faq: 'FAQ | Luna29', learning: 'Learning | Luna29', privacy: 'Privacy Notice | Luna29', terms: 'Terms | Luna29', medical: 'Disclaimer | Luna29', cookies: 'Cookies Notice | Luna29', data_rights: 'Data Rights | Luna29' },
      ru: { home: 'Luna29 | Публичная Главная', map: 'Luna29 Balance | Карта ритма', ritual: 'Ритуальный путь | Luna29', bridge: 'Мост | Luna29', pricing: 'Тарифы | Luna29', about: 'О Luna29', how_it_works: 'Как это работает | Luna29', faq: 'FAQ | Luna29', learning: 'Обучение | Luna29', privacy: 'Уведомление о приватности | Luna29', terms: 'Условия | Luna29', medical: 'Дисклеймер | Luna29', cookies: 'Уведомление о cookies | Luna29', data_rights: 'Права на данные | Luna29' },
      uk: { home: 'Luna29 | Публічна Головна', map: 'Luna29 Balance | Мапа ритму', ritual: 'Ритуальний шлях | Luna29', bridge: 'Міст | Luna29', pricing: 'Тарифи | Luna29', about: 'Про Luna29', how_it_works: 'Як це працює | Luna29', faq: 'FAQ | Luna29', learning: 'Навчання | Luna29', privacy: 'Повідомлення про приватність | Luna29', terms: 'Умови | Luna29', medical: 'Дисклеймер | Luna29', cookies: 'Повідомлення про cookies | Luna29', data_rights: 'Права на дані | Luna29' },
      es: { home: 'Luna29 | Inicio público', map: 'Luna29 Balance | Mapa visual del ritmo', ritual: 'Ruta ritual | Luna29', bridge: 'Puente | Luna29', pricing: 'Precios | Luna29', about: 'Sobre Luna29', how_it_works: 'Cómo funciona | Luna29', faq: 'FAQ | Luna29', learning: 'Aprendizaje | Luna29', privacy: 'Aviso de privacidad | Luna29', terms: 'Términos | Luna29', medical: 'Descargo | Luna29', cookies: 'Aviso de cookies | Luna29', data_rights: 'Derechos de datos | Luna29' },
      fr: { home: 'Luna29 | Accueil public', map: 'Luna29 Balance | Carte visuelle du rythme', ritual: 'Chemin rituel | Luna29', bridge: 'Le Pont | Luna29', pricing: 'Tarifs | Luna29', about: 'À propos de Luna29', how_it_works: 'Comment ça marche | Luna29', faq: 'FAQ | Luna29', learning: 'Apprentissage | Luna29', privacy: 'Avis de confidentialité | Luna29', terms: "Conditions | Luna29", medical: 'Avertissement | Luna29', cookies: 'Avis cookies | Luna29', data_rights: 'Droits sur les données | Luna29' },
      de: { home: 'Luna29 | Öffentliche Startseite', map: 'Luna29 Balance | Visuelle Rhythmuskarte', ritual: 'Ritualpfad | Luna29', bridge: 'Die Brücke | Luna29', pricing: 'Preise | Luna29', about: 'Über Luna29', how_it_works: 'So funktioniert es | Luna29', faq: 'FAQ | Luna29', learning: 'Lernen | Luna29', privacy: 'Datenschutzhinweis | Luna29', terms: 'Nutzungsbedingungen | Luna29', medical: 'Haftungsausschluss | Luna29', cookies: 'Cookie-Hinweis | Luna29', data_rights: 'Datenrechte | Luna29' },
      zh: { home: 'Luna29 | 公开主页', map: 'Luna29 Balance | 可视化节律图', ritual: '仪式路径 | Luna29', bridge: '连接桥 | Luna29', pricing: '价格 | Luna29', about: '关于 Luna29', how_it_works: '工作方式 | Luna29', faq: '常见问题 | Luna29', learning: '学习 | Luna29', privacy: '隐私声明 | Luna29', terms: '服务条款 | Luna29', medical: '免责声明 | Luna29', cookies: 'Cookie 声明 | Luna29', data_rights: '数据权利 | Luna29' },
      ja: { home: 'Luna29 | 公開ホーム', map: 'Luna29 Balance | リズムマップ', ritual: 'リチュアルパス | Luna29', bridge: 'ブリッジ | Luna29', pricing: '料金 | Luna29', about: 'Luna29について', how_it_works: '使い方 | Luna29', faq: 'FAQ | Luna29', learning: '学習 | Luna29', privacy: 'プライバシー通知 | Luna29', terms: '利用規約 | Luna29', medical: '免責事項 | Luna29', cookies: 'Cookie通知 | Luna29', data_rights: 'データ権利 | Luna29' },
      pt: { home: 'Luna29 | Início público', map: 'Luna29 Balance | Mapa visual do ritmo', ritual: 'Caminho ritual | Luna29', bridge: 'A Ponte | Luna29', pricing: 'Preços | Luna29', about: 'Sobre Luna29', how_it_works: 'Como funciona | Luna29', faq: 'FAQ | Luna29', learning: 'Aprendizagem | Luna29', privacy: 'Aviso de privacidade | Luna29', terms: 'Termos | Luna29', medical: 'Aviso legal | Luna29', cookies: 'Aviso de cookies | Luna29', data_rights: 'Direitos de dados | Luna29' },
      ar: { home: 'Luna29 | الصفحة العامة', map: 'Luna29 Balance | خريطة الإيقاع', ritual: 'المسار الطقسي | Luna29', bridge: 'الجسر | Luna29', pricing: 'الأسعار | Luna29', about: 'حول Luna29', how_it_works: 'كيف يعمل | Luna29', faq: 'الأسئلة الشائعة | Luna29', learning: 'التعلّم | Luna29', privacy: 'إشعار الخصوصية | Luna29', terms: 'الشروط | Luna29', medical: 'إخلاء المسؤولية | Luna29', cookies: 'إشعار cookies | Luna29', data_rights: 'حقوق البيانات | Luna29' },
      he: { home: 'Luna29 | דף ציבורי', map: 'Luna29 Balance | מפת קצב ויזואלית', ritual: 'נתיב טקסי | Luna29', bridge: 'הגשר | Luna29', pricing: 'מחירים | Luna29', about: 'אודות Luna29', how_it_works: 'איך זה עובד | Luna29', faq: 'שאלות נפוצות | Luna29', learning: 'לימוד | Luna29', privacy: 'הודעת פרטיות | Luna29', terms: 'תנאים | Luna29', medical: 'הצהרת אחריות | Luna29', cookies: 'הודעת cookies | Luna29', data_rights: 'זכויות נתונים | Luna29' },
    };
    const descriptionByPageByLang: LangCopy< Record<Exclude<PublicPage, 'calendar'>, string>> = {
      en: { home: 'Luna29 public home. Calm orientation and access to member tools.', map: 'Luna29 Balance visualizes physiological rhythms and inner dynamics.', ritual: 'Ritual Path by Luna29: a path, not a checklist. A simple daily rhythm that protects attention and preserves signal.', bridge: 'The Bridge by Luna29 helps formulate state, explain calmly, and preserve respect in conversations.', pricing: 'Luna29 member access pricing and trial options.', about: 'About Luna29 and the BioMath origin.', how_it_works: 'How Luna29 works in practice.', faq: 'Detailed FAQ about Luna29 Balance, privacy, safety, and daily use.', learning: 'Luna29 Learning: terminology, concepts, and practical guidance.', privacy: 'Luna29 privacy notice.', terms: 'Luna29 terms of service.', medical: 'Luna29 disclaimer information.', cookies: 'Luna29 cookies notice.', data_rights: 'Luna29 data rights information.' },
      ru: { home: 'Публичная главная страница Luna29: спокойная навигация и доступ к инструментам участника.', map: 'Luna29 Balance визуализирует физиологические ритмы и внутреннюю динамику.', ritual: 'Ритуальный путь Luna29: путь, а не чеклист. Ежедневный ритм, который бережет внимание.', bridge: 'Мост Luna29 помогает ясно формулировать состояние и сохранять уважение в разговоре.', pricing: 'Тарифы и пробный доступ Luna29.', about: 'О Luna29 и происхождении BioMath.', how_it_works: 'Как Luna29 работает на практике.', faq: 'Подробный FAQ о Luna29 Balance, приватности, безопасности и ежедневном использовании.', learning: 'Обучение Luna29: терминология, идеи и практические рекомендации.', privacy: 'Уведомление о приватности Luna29.', terms: 'Условия использования Luna29.', medical: 'Дисклеймер Luna29.', cookies: 'Уведомление о cookies Luna29.', data_rights: 'Информация о правах на данные в Luna29.' },
      uk: { home: 'Публічна головна сторінка Luna29: спокійна орієнтація і доступ до інструментів учасника.', map: 'Luna29 Balance візуалізує фізіологічні ритми та внутрішню динаміку.', ritual: 'Ритуальний шлях Luna29: шлях, а не чеклист. Простий ритм, що береже увагу.', bridge: 'Міст Luna29 допомагає чітко формулювати стан і зберігати повагу в розмові.', pricing: 'Тарифи та пробний доступ Luna29.', about: 'Про Luna29 і походження BioMath.', how_it_works: 'Як Luna29 працює на практиці.', faq: 'Детальний FAQ про Luna29 Balance, приватність і безпеку.', learning: 'Навчання Luna29: термінологія, ідеї та практичні поради.', privacy: 'Повідомлення про приватність Luna29.', terms: 'Умови використання Luna29.', medical: 'Дисклеймер Luna29.', cookies: 'Повідомлення про cookies Luna29.', data_rights: 'Інформація про права на дані в Luna29.' },
      es: { home: 'Inicio público de Luna29: orientación tranquila y acceso a herramientas para miembros.', map: 'Luna29 Balance visualiza ritmos fisiológicos y dinámica interna.', ritual: 'Ruta ritual de Luna29: un camino, no una lista. Ritmo diario simple que protege la atención.', bridge: 'El Puente de Luna29 ayuda a formular tu estado con calma y respeto.', pricing: 'Opciones de precio y prueba de Luna29.', about: 'Sobre Luna29 y el origen BioMath.', how_it_works: 'Cómo funciona Luna29 en la práctica.', faq: 'FAQ detallado sobre Luna29 Balance, privacidad y uso diario.', learning: 'Aprendizaje Luna29: terminología, conceptos y guía práctica.', privacy: 'Aviso de privacidad de Luna29.', terms: 'Términos de servicio de Luna29.', medical: 'Información de descargo de Luna29.', cookies: 'Aviso de cookies de Luna29.', data_rights: 'Información de derechos de datos de Luna29.' },
      fr: { home: 'Accueil public Luna29: orientation calme et accès aux outils membre.', map: 'Luna29 Balance visualise les rythmes physiologiques et la dynamique intérieure.', ritual: 'Chemin rituel Luna29: un chemin, pas une checklist. Un rythme quotidien simple qui protège l’attention.', bridge: 'Le Pont de Luna29 aide à formuler votre état calmement et avec respect.', pricing: 'Tarifs Luna29 et options d’essai.', about: 'À propos de Luna29 et de l’origine BioMath.', how_it_works: 'Comment Luna29 fonctionne en pratique.', faq: 'FAQ détaillé sur Luna29 Balance, confidentialité et usage quotidien.', learning: 'Apprentissage Luna29: terminologie, concepts et guide pratique.', privacy: 'Avis de confidentialité Luna29.', terms: 'Conditions d’utilisation Luna29.', medical: 'Informations d’avertissement Luna29.', cookies: 'Avis cookies Luna29.', data_rights: 'Informations sur les droits des données Luna29.' },
      de: { home: 'Öffentliche Luna29-Startseite: ruhige Orientierung und Zugang zu Mitglieder-Tools.', map: 'Luna29 Balance visualisiert physiologische Rhythmen und innere Dynamik.', ritual: 'Luna29 Ritualpfad: ein Pfad statt einer Checkliste. Ein einfacher Rhythmus, der Aufmerksamkeit schützt.', bridge: 'Die Luna29-Brücke hilft, den Zustand klar und respektvoll zu formulieren.', pricing: 'Luna29 Preise und Testoptionen.', about: 'Über Luna29 und den BioMath-Ursprung.', how_it_works: 'Wie Luna29 in der Praxis funktioniert.', faq: 'Ausführliches FAQ zu Luna29 Balance, Datenschutz und Alltag.', learning: 'Luna29 Lernen: Terminologie, Konzepte und praktische Orientierung.', privacy: 'Luna29 Datenschutzhinweis.', terms: 'Luna29 Nutzungsbedingungen.', medical: 'Luna29 Haftungsausschluss.', cookies: 'Luna29 Cookie-Hinweis.', data_rights: 'Luna29 Informationen zu Datenrechten.' },
      zh: { home: 'Luna29 公开主页：提供平静指引并连接会员工具。', map: 'Luna29 Balance 可视化生理节律与内在变化。', ritual: 'Luna29 仪式路径：不是清单，而是节律。简单日常节律帮助保护注意力。', bridge: 'Luna29 连接桥帮助你平静、清晰地表达状态并保持沟通尊重。', pricing: 'Luna29 会员价格与试用选项。', about: '关于 Luna29 与 BioMath 起源。', how_it_works: 'Luna29 的实际工作方式。', faq: '关于 Luna29 Balance、隐私与日常使用的详细 FAQ。', learning: 'Luna29 学习：术语、核心概念与实践指南。', privacy: 'Luna29 隐私声明。', terms: 'Luna29 服务条款。', medical: 'Luna29 免责声明信息。', cookies: 'Luna29 Cookie 声明。', data_rights: 'Luna29 数据权利信息。' },
      ja: { home: 'Luna29公開ホーム。落ち着いた導線とメンバーツールへのアクセス。', map: 'Luna29 Balance は生理リズムと内面の変化を可視化します。', ritual: 'Luna29リチュアルパス: チェックリストではなく道筋。注意を守るシンプルな日次リズム。', bridge: 'Luna29ブリッジは状態を穏やかに言語化し、対話の尊重を保つのに役立ちます。', pricing: 'Luna29メンバー料金とトライアル。', about: 'Luna29とBioMathの起源について。', how_it_works: 'Luna29の実際の使い方。', faq: 'Luna29 Balance、プライバシー、日常利用に関する詳細FAQ。', learning: 'Luna29学習: 用語、概念、実践ガイド。', privacy: 'Luna29プライバシー通知。', terms: 'Luna29利用規約。', medical: 'Luna29免責情報。', cookies: 'Luna29 Cookie通知。', data_rights: 'Luna29データ権利情報。' },
      pt: { home: 'Início público da Luna29: orientação calma e acesso às ferramentas de membros.', map: 'Luna29 Balance visualiza ritmos fisiológicos e dinâmica interna.', ritual: 'Caminho ritual da Luna29: um caminho, não checklist. Ritmo diário simples que protege atenção.', bridge: 'A Ponte da Luna29 ajuda a formular estado com calma e respeito na conversa.', pricing: 'Planos e opções de teste da Luna29.', about: 'Sobre a Luna29 e a origem BioMath.', how_it_works: 'Como a Luna29 funciona na prática.', faq: 'FAQ detalhado sobre Luna29 Balance, privacidade e uso diário.', learning: 'Aprendizagem Luna29: terminologia, conceitos e guia prática.', privacy: 'Aviso de privacidade da Luna29.', terms: 'Termos de serviço da Luna29.', medical: 'Informações de aviso legal da Luna29.', cookies: 'Aviso de cookies da Luna29.', data_rights: 'Informações de direitos de dados da Luna29.' },
      ar: { home: 'الصفحة العامة لـ Luna29: توجيه هادئ ووصول لأدوات العضو.', map: 'Luna29 Balance يعرض الإيقاعات الفسيولوجية والديناميكية الداخلية.', ritual: 'المسار الطقسي Luna29: مسار لا قائمة. إيقاع يومي بسيط يحمي الانتباه.', bridge: 'جسر Luna29 يساعد على صياغة الحالة بهدوء واحترام.', pricing: 'أسعار Luna29 وخيارات التجربة.', about: 'حول Luna29 وأصل BioMath.', how_it_works: 'كيف تعمل Luna29 عملياً.', faq: 'FAQ مفصل عن Luna29 Balance والخصوصية والاستخدام اليومي.', learning: 'تعلّم Luna29: مصطلحات ومفاهيم وإرشاد عملي.', privacy: 'إشعار خصوصية Luna29.', terms: 'شروط خدمة Luna29.', medical: 'معلومات إخلاء المسؤولية Luna29.', cookies: 'إشعار cookies Luna29.', data_rights: 'معلومات حقوق البيانات Luna29.' },
      he: { home: 'דף ציבורי Luna29: כיוון רגוע וגישה לכלי חבר.', map: 'Luna29 Balance מציגה קצבי גוף ושינויי מצב פנימיים.', ritual: 'נתיב טקסי Luna29: דרך, לא רשימה. קצב יומי עדין ששומר על תשומת הלב.', bridge: 'הגשר Luna29 עוזר לנסח מצב בשקט ובכבוד.', pricing: 'מחירי Luna29 ואפשרויות ניסיון.', about: 'אודות Luna29 ומקור BioMath.', how_it_works: 'איך Luna29 עובדת בפועל.', faq: 'FAQ מפורט על Luna29 Balance, פרטיות ושימוש יומי.', learning: 'לימוד Luna29: מונחים, רעיונות והנחיה מעשית.', privacy: 'הודעת פרטיות Luna29.', terms: 'תנאי שירות Luna29.', medical: 'מידע הצהרת אחריות Luna29.', cookies: 'הודעת cookies Luna29.', data_rights: 'מידע זכויות נתונים Luna29.' },
    };
    const titleByPage = getLang(titleByPageByLang, lang) || titleByPageByLang.en;
    const descriptionByPage = getLang(descriptionByPageByLang, lang) || descriptionByPageByLang.en;

    document.title =
      activePage === 'calendar'
        ? getLang(calendarSeoTitleByLang, lang) || calendarSeoTitleByLang.en
        : titleByPage[activePage];
    const descriptionEl = document.querySelector('meta[name="description"]');
    if (descriptionEl) {
      descriptionEl.setAttribute(
        'content',
        activePage === 'calendar'
          ? getLang(calendarSeoDescriptionByLang, lang) || calendarSeoDescriptionByLang.en
          : descriptionByPage[activePage],
      );
    }
  }, [activePage, calendarSeoDescriptionByLang, calendarSeoTitleByLang, lang]);

  useEffect(() => {
    if (activePage !== 'home') {
      setIsHomeExpanded(false);
    }
  }, [activePage]);

  const heroBackgroundStyle = useMemo<React.CSSProperties>(() => {
    if (theme === 'dark') {
      return {
        backgroundImage:
          "linear-gradient(180deg, rgba(6,8,24,0.92) 0%, rgba(7,9,27,0.96) 100%), radial-gradient(82% 56% at 66% 16%, rgba(190,154,223,0.34), transparent 72%), radial-gradient(72% 48% at 28% 72%, rgba(106,118,190,0.24), transparent 74%), radial-gradient(58% 40% at 72% 46%, rgba(236,190,214,0.22), transparent 76%)",
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
        backgroundPosition: 'center, center, center, center',
        backgroundRepeat: 'no-repeat',
      };
    }

    return {
      backgroundImage:
        "linear-gradient(180deg, rgba(6,8,24,0.92) 0%, rgba(7,9,27,0.96) 100%), radial-gradient(82% 56% at 66% 16%, rgba(190,154,223,0.34), transparent 72%), radial-gradient(72% 48% at 28% 72%, rgba(106,118,190,0.24), transparent 74%), radial-gradient(58% 40% at 72% 46%, rgba(236,190,214,0.22), transparent 76%)",
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      backgroundPosition: 'center, center, center, center',
      backgroundRepeat: 'no-repeat',
    };
  }, [theme]);

  const bodyMapBackgroundStyle = useMemo<React.CSSProperties>(() => {
    if (theme === 'dark') {
      return {
        backgroundImage:
          "linear-gradient(180deg, rgba(8,10,26,0.8), rgba(8,10,26,0.86)), radial-gradient(46% 58% at 88% 62%, rgba(255,199,147,0.34), transparent 70%), radial-gradient(38% 46% at 82% 68%, rgba(249,233,183,0.24), transparent 70%), radial-gradient(82% 70% at 34% 26%, rgba(136,132,199,0.22), transparent 78%)",
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
        backgroundPosition: 'center, center, center, center',
        backgroundRepeat: 'no-repeat',
      };
    }

    return {
      backgroundImage:
        "linear-gradient(180deg, rgba(8,10,26,0.8), rgba(8,10,26,0.86)), radial-gradient(46% 58% at 88% 62%, rgba(255,199,147,0.34), transparent 70%), radial-gradient(38% 46% at 82% 68%, rgba(249,233,183,0.24), transparent 70%), radial-gradient(82% 70% at 34% 26%, rgba(136,132,199,0.22), transparent 78%)",
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      backgroundPosition: 'center, center, center, center',
      backgroundRepeat: 'no-repeat',
    };
  }, [theme]);

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${activePage === 'home' ? (theme === 'dark' ? 'bg-[#0b0d1f] text-slate-100' : 'bg-[#f3f2f6] text-slate-900') : ''}`}>
      <div className={`absolute -top-16 -left-16 w-[34rem] h-[34rem] rounded-full blur-[138px] ${activePage === 'home' ? (theme === 'dark' ? 'bg-violet-500/30' : 'bg-[#f0edf5]/85') : 'bg-luna-purple/20'}`} />
      <div className={`absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full blur-[138px] ${activePage === 'home' ? (theme === 'dark' ? 'bg-indigo-500/28' : 'bg-[#f6f5f9]/86') : 'bg-luna-teal/20'}`} />
      <div className={`absolute -bottom-20 left-1/3 w-[28rem] h-[28rem] rounded-full blur-[138px] ${activePage === 'home' ? (theme === 'dark' ? 'bg-fuchsia-500/24' : 'bg-[#edeaf3]/84') : 'bg-luna-coral/20'}`} />

      <div className={`${activePage === 'home' ? (theme === 'dark' ? 'relative z-30 h-2 bg-gradient-to-r from-[#12152f] via-[#1a2041] to-[#131733]' : 'relative z-30 h-2 bg-gradient-to-r from-[#f0ecf6] via-[#ece7f4] to-[#f1edf7]') : 'relative z-30 h-2 bg-slate-200/70 dark:bg-slate-900/60'}`} />

      <header className={`${activePage === 'home' ? (theme === 'dark' ? 'relative z-30 border-b border-white/10 bg-[#0b0d1f]/82 backdrop-blur-md' : 'relative z-30 border-b border-[#d8d1e2] bg-[#f6f4fa]/88 backdrop-blur-md') : 'sticky top-0 z-30 border-b border-slate-300/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl'}`}>
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 h-14 md:h-14 flex items-center justify-between gap-4">
          <button type="button" onClick={() => setActivePage('home')} className={`flex items-center gap-0.5 ${theme === 'dark' ? 'text-violet-100/95' : 'text-[#402c35]'}`}>
            <img src="/images/luna-logo-transparent.webp" alt="" aria-hidden="true" className="h-[5.4rem] w-auto md:h-[6.3rem] object-contain select-none pointer-events-none" />
            <Logo size="sm" className="cursor-default text-5xl leading-none" />
          </button>
          <nav className="hidden md:flex items-center gap-4">
            <button onClick={() => setActivePage('home')} className={`text-[1.02rem] transition-colors ${theme === 'dark' ? (activePage === 'home' ? 'text-violet-100' : 'text-violet-100/70 hover:text-violet-100') : (activePage === 'home' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}>{publicHomeNavLabels.home}</button>
            <span className={`${theme === 'dark' ? 'text-violet-100/35' : 'text-slate-400'}`}>·</span>
            <button onClick={() => setActivePage('ritual')} className={`text-[1.02rem] transition-colors ${theme === 'dark' ? (activePage === 'ritual' ? 'text-violet-100' : 'text-violet-100/70 hover:text-violet-100') : (activePage === 'ritual' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}>{publicHomeNavLabels.ritual}</button>
            <span className={`${theme === 'dark' ? 'text-violet-100/35' : 'text-slate-400'}`}>·</span>
            <button onClick={() => setActivePage('map')} className={`text-[1.02rem] transition-colors ${theme === 'dark' ? (activePage === 'map' ? 'text-violet-100' : 'text-violet-100/70 hover:text-violet-100') : (activePage === 'map' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}>{publicHomeNavLabels.map}</button>
            <span className={`${theme === 'dark' ? 'text-violet-100/35' : 'text-slate-400'}`}>·</span>
            <button onClick={() => setActivePage('calendar')} className={`text-[1.02rem] transition-colors ${theme === 'dark' ? (activePage === 'calendar' ? 'text-violet-100' : 'text-violet-100/70 hover:text-violet-100') : (activePage === 'calendar' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}>{memberNav.rhythmCalendar}</button>
            <span className={`${theme === 'dark' ? 'text-violet-100/35' : 'text-slate-400'}`}>·</span>
            <button onClick={() => setActivePage('pricing')} className={`text-[1.02rem] transition-colors ${theme === 'dark' ? (activePage === 'pricing' ? 'text-violet-100' : 'text-violet-100/70 hover:text-violet-100') : (activePage === 'pricing' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}>{getLang(pricingLabelByLang, lang) || 'Pricing'}</button>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector current={lang} onSelect={setLang} />
            <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            <button
              data-testid="public-signin-up"
              onClick={onSignIn}
              className={`${activePage === 'home' ? (theme === 'dark' ? 'px-4 py-1.5 rounded-full bg-violet-300/24 text-violet-100 hover:bg-violet-300/36' : 'px-4 py-1.5 rounded-full bg-violet-300/22 text-slate-800 hover:bg-violet-300/34') : 'px-5 py-2 rounded-full border border-luna-purple/40 bg-white/80 dark:bg-slate-900/70 text-luna-purple hover:border-luna-purple/70 hover:bg-luna-purple/10'} text-[10px] font-black uppercase tracking-widest transition-all`}
            >
              {ui.publicHome.signInUp}
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            <div>
              <LanguageSelector current={lang} onSelect={setLang} />
            </div>
            <button data-testid="public-signin-up-mobile" onClick={onSignIn} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] ${theme === 'dark' ? 'bg-violet-300/24 text-violet-100' : 'bg-violet-300/22 text-slate-800'}`}>{ui.publicHome.signInUp}</button>
          </div>
        </div>
      </header>

      <main className={`max-w-[1160px] mx-auto px-4 md:px-6 ${activePage === 'home' ? 'pt-8 md:pt-12' : 'pt-4 md:pt-5'} pb-16 md:pb-24 relative z-10 ${activePage === 'home' ? 'space-y-12' : 'space-y-14 md:space-y-16'} ${activePage !== 'home' ? 'luna-public-baseline' : ''}`}>
        {activePage !== 'home' && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{pageTitle}</p>
          </div>
        )}

        {activePage === 'home' && (
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <section className="relative overflow-hidden rounded-[3rem] border border-slate-200/70 dark:border-[#2a4670] shadow-luna-rich">
              <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_15%,rgba(241,184,223,0.34),transparent_60%),radial-gradient(100%_100%_at_5%_95%,rgba(172,182,246,0.32),transparent_62%),linear-gradient(145deg,#fcf4f8_0%,#f2eef8_44%,#eceefb_100%)] dark:bg-[radial-gradient(120%_90%_at_85%_15%,rgba(214,114,185,0.25),transparent_56%),radial-gradient(100%_100%_at_5%_95%,rgba(108,124,209,0.23),transparent_60%),linear-gradient(145deg,#121831_0%,#121f43_40%,#1a2f56_100%)]" />
              <div className="relative z-10 p-6 md:p-10 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10 items-center">
                  <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.34em] text-luna-purple">{getLang(homeEyebrowByLang, lang) || homeEyebrowByLang.en}</p>
                    <h1 className="text-[clamp(2.3rem,4.9vw,5rem)] leading-[0.96] tracking-tight font-black text-slate-900 dark:text-slate-100">
                      {dailyCompanionCopy.heroTitle}
                    </h1>
                    <p className="max-w-xl text-[1.02rem] md:text-[1.12rem] font-medium text-slate-700 dark:text-slate-200/90 leading-relaxed">
                      {dailyCompanionCopy.heroSubtitle}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={onSignIn}
                        className={`${PUBLIC_BTN_PRIMARY} px-7 py-3 text-sm tracking-[0.08em]`}
                      >
                        <span className={PUBLIC_BTN_PRIMARY_GLOW} />
                        <span className="relative z-10">{dailyCompanionCopy.primaryCta}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePage('how_it_works')}
                        className={`${PUBLIC_BTN_SECONDARY} px-7 py-3 text-sm tracking-[0.08em]`}
                      >
                        {dailyCompanionCopy.secondaryCta}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{storeBadges.title}</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={appStoreHref}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-full border border-slate-300/80 dark:border-slate-600/80 bg-white/70 dark:bg-slate-900/55 text-[11px] font-black tracking-wide text-slate-800 dark:text-slate-100 hover:border-luna-purple/60 hover:text-luna-purple transition-colors"
                        >
                          {storeBadges.appStore}
                        </a>
                        <a
                          href={googlePlayHref}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-full border border-slate-300/80 dark:border-slate-600/80 bg-white/70 dark:bg-slate-900/55 text-[11px] font-black tracking-wide text-slate-800 dark:text-slate-100 hover:border-luna-purple/60 hover:text-luna-purple transition-colors"
                        >
                          {storeBadges.googlePlay}
                        </a>
                      </div>
                      {showPreviewLink && (
                        <a
                          href={expoPreviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-full border border-slate-300/80 dark:border-slate-600/80 bg-white/70 dark:bg-slate-900/55 text-[11px] font-black tracking-wide text-slate-800 dark:text-slate-100 hover:border-luna-purple/60 hover:text-luna-purple transition-colors"
                        >
                          {storeBadges.preview}
                        </a>
                      )}
                      {(!appStoreUrl || !googlePlayUrl) && (
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">{storeBadges.soon}</p>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-5 rounded-[2.4rem] bg-gradient-to-b from-fuchsia-300/22 via-violet-300/16 to-transparent dark:from-fuchsia-500/15 dark:via-indigo-500/18 blur-2xl" />
                    <div className="relative rounded-[2.2rem] overflow-hidden border border-white/45 dark:border-white/10 shadow-[0_24px_60px_rgba(40,24,84,0.28)]">
                      <img
                        src="/images/face_image.webp"
                        alt="Luna29 daily note mood"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-[420px] object-cover object-[58%_38%] saturate-[0.92] contrast-[0.93] brightness-[0.95]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(250,227,241,0.18)_0%,rgba(188,154,222,0.14)_42%,rgba(34,42,86,0.42)_100%)]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171c3c]/44 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.8rem] border border-white/55 dark:border-white/14 bg-white/68 dark:bg-[#132a53]/52 backdrop-blur p-3 md:p-4">
                  <p className="px-2 pb-2 inline-flex items-center gap-2 text-xs font-semibold text-[#704a90] dark:text-[#d2c3f3]">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-[#f3cde4] to-[#e3d8ff] dark:from-[#604285] dark:to-[#4a4f86] text-luna-purple">
                      <Mic size={11} />
                    </span>
                    {homeActionCopy.talkLine}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    {[
                      {
                        icon: Sparkles,
                        ...homeActionCopy.actions[0],
                        onClick: onSignIn,
                        tone: 'from-[#f8dce9] via-[#f0ddfa] to-[#e5e0ff] dark:from-[#4f3a6f] dark:via-[#3f4278] dark:to-[#304f84]',
                        iconTone: 'from-[#ffe8f3] to-[#ecdfff] dark:from-[#6b4e8f] dark:to-[#515990]',
                      },
                      {
                        icon: Heart,
                        ...homeActionCopy.actions[1],
                        onClick: onSignIn,
                        tone: 'from-[#fbe4ea] via-[#f3e4f9] to-[#ebddff] dark:from-[#5d3d67] dark:via-[#4a3f73] dark:to-[#3a4f7e]',
                        iconTone: 'from-[#ffeef3] to-[#f1e3ff] dark:from-[#714b77] dark:to-[#575198]',
                      },
                      {
                        icon: Mic,
                        ...homeActionCopy.actions[2],
                        onClick: onSignIn,
                        tone: 'from-[#f4e8ff] via-[#e8e8ff] to-[#dcecff] dark:from-[#513969] dark:via-[#3f4678] dark:to-[#2f5385]',
                        iconTone: 'from-[#f9eeff] to-[#e5edff] dark:from-[#68488f] dark:to-[#4a5f99]',
                      },
                      {
                        icon: MapPin,
                        ...homeActionCopy.actions[3],
                        onClick: () => setActivePage('map'),
                        tone: 'from-[#fae5f2] via-[#f3e9ff] to-[#e8e8ff] dark:from-[#5f426e] dark:via-[#4b4679] dark:to-[#3d4f86]',
                        iconTone: 'from-[#ffeef8] to-[#ece8ff] dark:from-[#764f86] dark:to-[#57589a]',
                      },
                    ].map((item, index) => (
                      <button
                        key={`${item.label}-${index}`}
                        onClick={item.onClick}
                        className={`rounded-[1.2rem] border border-white/50 dark:border-white/12 bg-gradient-to-br ${item.tone} p-3 text-center shadow-[0_10px_24px_rgba(152,112,194,0.16)] dark:shadow-[0_12px_26px_rgba(16,24,54,0.38)] hover:-translate-y-0.5 transition-all`}
                      >
                        <span className={`mx-auto inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${item.iconTone} text-luna-purple shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]`}>
                          <item.icon size={16} />
                        </span>
                        <p className="mt-2 text-[12px] md:text-[13px] font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-100">{item.label}</p>
                        <p className="mt-1 text-[11px] md:text-[11.5px] font-semibold text-slate-600 dark:text-slate-200/90 leading-snug">{item.sub}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 rounded-[1.1rem] border border-white/45 dark:border-white/10 bg-white/52 dark:bg-[#14254a]/55 px-3 py-2.5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { icon: Mic, label: homeFeatureChipLabels[0] || homeFeatureChipLabelsByLang.en![0] },
                        { icon: Sparkles, label: homeFeatureChipLabels[1] || homeFeatureChipLabelsByLang.en![1] },
                        { icon: MapPin, label: homeFeatureChipLabels[2] || homeFeatureChipLabelsByLang.en![2] },
                        { icon: Music2, label: homeFeatureChipLabels[3] || homeFeatureChipLabelsByLang.en![3] },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-[#102043]/60 px-2.5 py-2 text-center">
                          <span className="mx-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-luna-purple/16 text-luna-purple">
                            <item.icon size={12} />
                          </span>
                          <p className="mt-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <article className="rounded-[2.2rem] border border-slate-200/70 dark:border-[#2a4670] bg-white/76 dark:bg-[#0d1f45]/86 shadow-luna-rich p-7 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      title: homePillars[0]?.title || homePillarsByLang.en![0].title,
                      text: homePillars[0]?.text || homePillarsByLang.en![0].text,
                      tone: 'text-[#8b3f92] dark:text-[#d9a2ff]',
                      icon: Lock,
                    },
                    {
                      title: homePillars[1]?.title || homePillarsByLang.en![1].title,
                      text: homePillars[1]?.text || homePillarsByLang.en![1].text,
                      tone: 'text-[#6a58b6] dark:text-[#b7b6ff]',
                      icon: Heart,
                    },
                    {
                      title: homePillars[2]?.title || homePillarsByLang.en![2].title,
                      text: homePillars[2]?.text || homePillarsByLang.en![2].text,
                      tone: 'text-[#9b4e78] dark:text-[#f0b3d5]',
                      icon: Mic,
                    },
                  ].map((item) => (
                    <article
                      key={item.title}
                      className="rounded-[1.3rem] border border-white/60 dark:border-white/14 bg-[linear-gradient(165deg,rgba(255,255,255,0.86),rgba(245,236,255,0.72))] dark:bg-[linear-gradient(165deg,rgba(31,49,92,0.68),rgba(22,39,78,0.52))] backdrop-blur px-4 py-4 shadow-[0_12px_28px_rgba(143,104,191,0.18),inset_0_1px_0_rgba(255,255,255,0.62)] dark:shadow-[0_12px_28px_rgba(20,29,58,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(143,104,191,0.24),inset_0_1px_0_rgba(255,255,255,0.62)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-luna-purple/14 text-luna-purple">
                          <item.icon size={14} />
                        </span>
                        <p className={`text-[14px] md:text-[16px] font-black uppercase tracking-[0.12em] ${item.tone}`}>{item.title}</p>
                      </div>
                      <p className="mt-2 text-[12px] font-semibold leading-relaxed text-slate-700 dark:text-slate-200/95">{item.text}</p>
                    </article>
                  ))}
                </div>
              </article>

              <article className="rounded-[2.2rem] border border-slate-200/70 dark:border-[#2a4670] bg-white/76 dark:bg-[#0d1f45]/86 shadow-luna-rich p-7 md:p-8">
                <h2 className="text-3xl md:text-[2.2rem] font-black tracking-tight text-slate-900 dark:text-slate-100">{dailyCompanionCopy.patternTitle}</h2>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{getLang(homePatternNoteByLang, lang) || homePatternNoteByLang.en}</p>
                <div className="mt-4 space-y-3">
                  <article className="rounded-[1.25rem] border border-slate-200/80 dark:border-[#2a4670] bg-slate-50/86 dark:bg-[#11284f]/76 p-4 transition-all hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(125,93,173,0.22)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-luna-purple">{dailyCompanionCopy.patternCardLabel}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{dailyCompanionCopy.patternOne}</p>
                  </article>
                  <article className="rounded-[1.25rem] border border-slate-200/80 dark:border-[#2a4670] bg-slate-50/86 dark:bg-[#11284f]/76 p-4 transition-all hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(125,93,173,0.22)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-luna-purple">{dailyCompanionCopy.patternCardLabel}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{dailyCompanionCopy.patternTwo}</p>
                  </article>
                </div>
              </article>
            </section>

            <section className="relative overflow-hidden rounded-[2.2rem] border border-slate-200/70 dark:border-[#2a4670] bg-white/76 dark:bg-[#0d1f45]/86 shadow-luna-rich p-7 md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_8%_10%,rgba(248,196,225,0.26),transparent_58%),radial-gradient(70%_100%_at_92%_0%,rgba(197,182,255,0.24),transparent_60%),linear-gradient(145deg,rgba(255,255,255,0.36),rgba(245,239,255,0.28))] dark:bg-[radial-gradient(90%_120%_at_8%_10%,rgba(157,106,184,0.18),transparent_60%),radial-gradient(70%_100%_at_92%_0%,rgba(92,113,177,0.16),transparent_62%),linear-gradient(145deg,rgba(20,35,70,0.38),rgba(17,31,62,0.26))]" />
              <div className="relative z-10">
              <h2 className="text-[1.7rem] md:text-[2rem] font-black tracking-tight text-slate-900 dark:text-slate-100">{homeActionCopy.servicesTitle}</h2>
              <p className="mt-1 text-[0.95rem] font-semibold text-slate-700 dark:text-slate-300">{homeActionCopy.servicesSubtitle}</p>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...homeActionCopy.services, calendarHomeService].map((service, index) => {
                  const isCalendar = index === homeActionCopy.services.length;
                  const CardTag = isCalendar ? 'button' : 'article';
                  return (
                  <CardTag
                    key={service.title}
                    type={isCalendar ? 'button' : undefined}
                    onClick={isCalendar ? () => setActivePage('calendar') : undefined}
                    className={`rounded-[1.2rem] border border-white/55 dark:border-white/12 p-4 shadow-[0_10px_24px_rgba(147,107,187,0.16)] dark:shadow-[0_12px_24px_rgba(13,22,48,0.38)] text-left w-full ${
                      isCalendar ? 'hover:-translate-y-0.5 transition-all cursor-pointer' : ''
                    } ${
                      index % 2 === 0
                        ? 'bg-[linear-gradient(160deg,rgba(255,255,255,0.88),rgba(246,238,255,0.72))] dark:bg-[linear-gradient(160deg,rgba(28,46,86,0.68),rgba(21,39,76,0.56))]'
                        : 'bg-[linear-gradient(160deg,rgba(255,249,253,0.88),rgba(240,241,255,0.72))] dark:bg-[linear-gradient(160deg,rgba(32,44,82,0.7),rgba(20,37,72,0.56))]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {(() => {
                        const iconMetaList = [
                          { icon: Mic, iconTone: 'from-[#ffe0ef] to-[#eddcff] dark:from-[#6a4f89] dark:to-[#5a5a97]', titleTone: 'text-[#9a397a] dark:text-[#f0b7dc]' },
                          { icon: Heart, iconTone: 'from-[#ffe8e9] to-[#f0e1ff] dark:from-[#6d4c7b] dark:to-[#5d5b99]', titleTone: 'text-[#7f4eb2] dark:text-[#cdc1ff]' },
                          { icon: Sparkles, iconTone: 'from-[#f7e4ff] to-[#e2ecff] dark:from-[#624c8b] dark:to-[#4f659f]', titleTone: 'text-[#5f54b5] dark:text-[#bac7ff]' },
                          { icon: MapPin, iconTone: 'from-[#ffeaf4] to-[#ece7ff] dark:from-[#6f4d84] dark:to-[#5b5d95]', titleTone: 'text-[#a14f7e] dark:text-[#efbdd8]' },
                          { icon: Calendar, iconTone: 'from-[#ffe8f3] to-[#e8e4ff] dark:from-[#6a5088] dark:to-[#525a96]', titleTone: 'text-[#7a4fa8] dark:text-[#d4c4ff]' },
                        ];
                        const iconMeta = iconMetaList[index] ?? iconMetaList[0];
                        const Icon = iconMeta.icon;
                        return (
                          <>
                            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${iconMeta.iconTone} text-luna-purple shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`}>
                              <Icon size={16} />
                            </span>
                            <p className={`text-[13px] md:text-[14px] font-black uppercase tracking-[0.12em] ${iconMeta.titleTone}`}>{service.title}</p>
                          </>
                        );
                      })()}
                    </div>
                    <p className="mt-2 text-[0.95rem] font-medium leading-relaxed text-slate-700 dark:text-slate-200">{service.body}</p>
                  </CardTag>
                  );
                })}
              </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[2.8rem] border border-slate-200/70 dark:border-[#2a4670] shadow-luna-rich p-9 md:p-12 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_0%_100%,rgba(174,161,223,0.28),transparent_58%),radial-gradient(80%_100%_at_100%_0%,rgba(244,176,208,0.24),transparent_62%),linear-gradient(145deg,#f9f2f8_0%,#f1eef9_44%,#eef0fa_100%)] dark:bg-[radial-gradient(90%_120%_at_0%_100%,rgba(120,102,184,0.27),transparent_60%),radial-gradient(80%_100%_at_100%_0%,rgba(185,101,149,0.2),transparent_62%),linear-gradient(145deg,#141a35_0%,#17234a_45%,#1d315b_100%)]" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{dailyCompanionCopy.finalTitle}</h2>
                <p className="mt-3 text-base font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">{dailyCompanionCopy.whatBody}</p>
                <div className="mt-7">
                  <button
                    type="button"
                    onClick={onSignIn}
                    className={`${PUBLIC_BTN_PRIMARY} px-8 py-3 text-sm tracking-[0.08em]`}
                  >
                    <span className={PUBLIC_BTN_PRIMARY_GLOW} />
                    <span className="relative z-10">{dailyCompanionCopy.finalCta}</span>
                  </button>
                </div>
              </div>
            </section>
          </section>
        )}
        {activePage === 'map' && (
          <Suspense fallback={lazyFallback}>
            <PublicMapSection
              lang={lang}
              theme={theme}
              eyebrow={ui.publicHome.map.eyebrow}
              mapCards={ui.publicHome.map.cards}
              appliedTitle={publicShared.appliedTitle}
              appliedBody={publicShared.appliedBody}
              bodyMapBackgroundStyle={bodyMapBackgroundStyle}
            />
          </Suspense>
        )}

        {activePage === 'ritual' && (
          <Suspense fallback={lazyFallback}>
            <PublicRitualSection
              onSignIn={onSignIn}
              lang={lang}
            />
          </Suspense>
        )}

        {activePage === 'bridge' && (
          <Suspense fallback={lazyFallback}>
            <PublicBridgeSection
              onSignIn={onSignIn}
              lang={lang}
            />
          </Suspense>
        )}

        {activePage === 'calendar' && (
          <Suspense fallback={lazyFallback}>
            <PublicCalendarSection
              lang={lang}
              onSignIn={onSignIn}
              onSignUp={onSignUp}
              onBackHome={() => setActivePage('home')}
            />
          </Suspense>
        )}

        {activePage === 'privacy' && (
          <section className="luna-page-shell luna-page-questions p-8 md:p-10 rounded-[3rem] border border-slate-200/70 dark:border-slate-800/80 shadow-luna-inset animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6">
            <div className="space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-600 dark:text-slate-500">{ui.publicHome.privacy.title}</h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{ui.publicHome.privacy.subtitle}</p>
            </div>
            <button onClick={onSignIn} className={`${PUBLIC_BTN_SECONDARY} px-4 py-2 text-[10px] tracking-widest text-luna-purple`}>{ui.publicHome.privacy.cta}</button>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6">
            <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed max-w-4xl">
              {ui.publicHome.privacy.body}
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              {ui.shared.disclaimer}
            </p>
          </div>
          </section>
        )}

        {activePage === 'pricing' && (
          <Suspense fallback={lazyFallback}>
            <PublicPricingSection
              lang={lang}
              pricingLabel={getLang(pricingLabelByLang, lang) || 'Pricing'}
              billingPeriod={billingPeriod}
              setBillingPeriod={setBillingPeriod}
              pricingCopy={pricingCopy}
              pricingUi={pricingUi}
              trialState={trialState}
              trialDaysLeft={trialDaysLeft}
              onSignUp={onSignUp}
              onStartTrial={startTrial}
              trialFeedback={trialFeedback}
            />
          </Suspense>
        )}

        <Suspense fallback={lazyFallback}>
          {activePage === 'about' && <AboutLunaView lang={lang} mode="public" />}
          {activePage === 'how_it_works' && <HowItWorksView lang={lang} onBack={() => setActivePage('home')} />}
          {activePage === 'faq' && <FAQView lang={lang} mode="public" onBack={() => setActivePage('home')} />}
          {activePage === 'learning' && <LearningView lang={lang} onBack={() => setActivePage('home')} />}
          {activePage === 'terms' && <LegalDocumentView lang={lang} doc="terms" mode="public" onBack={() => setActivePage('home')} />}
          {activePage === 'medical' && <LegalDocumentView lang={lang} doc="medical" mode="public" onBack={() => setActivePage('home')} />}
          {activePage === 'cookies' && <LegalDocumentView lang={lang} doc="cookies" mode="public" onBack={() => setActivePage('home')} />}
          {activePage === 'data_rights' && <LegalDocumentView lang={lang} doc="data_rights" mode="public" onBack={() => setActivePage('home')} />}
        </Suspense>
      </main>

      <footer className="w-full border-t border-slate-300 dark:border-white/10 py-14 px-6 glass bg-slate-200/40 dark:bg-transparent mt-auto relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 left-1/4 w-52 h-52 rounded-full bg-luna-purple/20 blur-[95px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-luna-teal/18 blur-[100px]" />
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-0.5">
                <img src="/images/luna-logo-transparent.webp" alt="" aria-hidden="true" className="h-24 w-auto md:h-28 object-contain select-none pointer-events-none" />
                <Logo size="sm" className="cursor-default text-5xl leading-none" />
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-400">Luna29 — The physiology of feeling.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-8">
            <nav className="space-y-4 md:col-span-4">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.explore}</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300">
                {footerPageLinks.map((page) => (
                  <button key={`footer-${page.id}`} onClick={() => setActivePage(page.id)} className="text-left font-light hover:text-luna-purple transition-colors hover:-translate-y-[1px]">
                    {page.label}
                  </button>
                ))}
              </div>
            </nav>
            <nav className="space-y-4 md:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.guides}</p>
              <div className="flex flex-col gap-3 text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300">
                <button onClick={() => setActivePage('about')} className="text-left font-light hover:text-luna-purple transition-colors">
                  {getLang(aboutLabelByLang, lang) || 'About'}
                </button>
                <button onClick={() => setActivePage('how_it_works')} className="text-left font-light hover:text-luna-purple transition-colors">
                  {getLang(howItWorksLabelByLang, lang) || 'How It Works'}
                </button>
                <button onClick={() => setActivePage('faq')} className="text-left font-light hover:text-luna-purple transition-colors">
                  {getLang(faqLabelByLang, lang) || 'FAQ'}
                </button>
                <button onClick={() => setActivePage('learning')} className="text-left font-light hover:text-luna-purple transition-colors">
                  {getLang(learningLabelByLang, lang) || 'Learning'}
                </button>
              </div>
            </nav>
            <nav className="space-y-4 md:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.legal}</p>
              <div className="flex flex-col gap-3 text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300">
                <button onClick={() => setActivePage('privacy')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.privacy}</button>
                <button onClick={() => setActivePage('terms')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.terms}</button>
                <button onClick={() => setActivePage('medical')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.medical}</button>
                <button onClick={() => setActivePage('cookies')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.cookies}</button>
                <button onClick={() => setActivePage('data_rights')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.dataRights}</button>
              </div>
            </nav>
            <nav className="space-y-4 md:col-span-1">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.install}</p>
              <button
                onClick={() => setShowInstallGuideModal(true)}
                className="text-left text-[13px] font-light tracking-[0.03em] text-luna-purple underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                {installGuideModal.title}
              </button>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={appStoreHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-left text-[12px] font-semibold text-slate-800 dark:text-slate-300 hover:text-luna-purple transition-colors"
                >
                  {storeBadges.appStore}
                </a>
                <a
                  href={googlePlayHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-left text-[12px] font-semibold text-slate-800 dark:text-slate-300 hover:text-luna-purple transition-colors"
                >
                  {storeBadges.googlePlay}
                </a>
                {showPreviewLink && (
                  <a
                    href={expoPreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-left text-[12px] font-semibold text-slate-800 dark:text-slate-300 hover:text-luna-purple transition-colors"
                  >
                    {storeBadges.preview}
                  </a>
                )}
              </div>
            </nav>
            <nav className="space-y-4 md:col-span-1">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{installActions.social}</p>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.16em]">
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
            </nav>
            <nav className="space-y-4 md:col-span-2 mt-16 md:mt-32">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.account}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300">
                    {getLang(themeLabelByLang, lang) || themeLabelByLang.en}
                  </span>
                  <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
                </div>
                <button onClick={onSignIn} className="text-left text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300 underline underline-offset-4 hover:text-luna-purple transition-colors">
                  {publicHomeNavLabels.adminLogin}
                </button>
              </div>
            </nav>
          </div>
          <div className="pt-6 border-t border-slate-300 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-700 dark:text-slate-400">{ui.publicHome.footerCopy}</p>
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-400 leading-relaxed max-w-3xl">{ui.shared.disclaimer}</p>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-600 dark:text-slate-500">{legalLabels.legal}</p>
          </div>
        </div>
      </footer>
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-[900] bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInstallGuideModal(false)}>
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-luna-purple">{installGuideModal.title}</p>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">{installGuideModal.how}</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{installGuideModal.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/40 p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">{installGuideModal.iosTitle}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{installGuideModal.iosStep1}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{installGuideModal.iosStep2}</p>
              </article>
              <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/40 p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">{installGuideModal.androidTitle}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{installGuideModal.androidStep1}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{installGuideModal.androidStep2}</p>
                <button
                  onClick={async () => {
                    if (publicInstallPrompt) {
                      await publicInstallPrompt.prompt();
                      await publicInstallPrompt.userChoice;
                      setInstallFeedback(installActions.androidTip);
                      return;
                    }
                    setInstallFeedback(installActions.noPrompt);
                  }}
                  className={`${PUBLIC_BTN_SECONDARY} mt-2 px-3 py-2 text-[10px] tracking-[0.14em] text-luna-purple`}
                >
                  {installGuideModal.openPrompt}
                </button>
              </article>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{installGuideModal.fallback}</p>
            {installFeedback && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{installFeedback}</p>}
            <div className="pt-2">
              <button onClick={() => setShowInstallGuideModal(false)} className={`${PUBLIC_BTN_SECONDARY} px-4 py-2 text-[10px] tracking-[0.16em] text-slate-600 dark:text-slate-300`}>
                {installGuideModal.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
