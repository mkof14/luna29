import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Facebook, Instagram, Music2, Youtube } from 'lucide-react';
import { Logo } from './Logo';
import { Language, TranslationSchema, LangCopy, getLang } from '../constants';
import LanguageSelector from './LanguageSelector';
import { LunaMenuLabel, LunaShimmerText } from './SmoothLangText';
import ThemeToggle from './ThemeToggle';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW, PUBLIC_BTN_SECONDARY } from './public/publicButtonStyles';
import {
  PUBLIC_BODY,
  PUBLIC_CARD_SOFT,
  PUBLIC_EYEBROW,
  PUBLIC_H2,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
  PUBLIC_SURFACE,
} from './public/publicPageStyles';
import { PublicHomeSection } from './public/PublicHomeSection';
import { getMemberNavCopy } from '../utils/memberNavLabels';
import { getBrandAssetUrl } from '../utils/lunaBrandAssets';
import { getLegalHubLabel, getLegalNavLabels, LEGAL_ENTITY_NAME, LegalNavDocType } from '../utils/legal';
import { getPublicHomeContent } from '../utils/publicHomeContent';
import { resolveHeroAbVariant } from '../utils/publicHomeAb';
import {
  getFooterMicroRitual,
  getFooterMoonAccent,
  getFooterSpiritActions,
  getFooterTrustLine,
} from '../utils/publicFooterSpirit';
import { markCheckoutPending, markTrialPending } from '../utils/subscriptionAccess';

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
  onOpenLive?: () => void;
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

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ onSignIn, onSignUp, onOpenLive, lang, setLang, theme, setTheme, ui }) => {
  type PublicPage = 'home' | 'map' | 'ritual' | 'bridge' | 'pricing' | 'about' | 'how_it_works' | 'faq' | 'learning' | 'legal' | 'privacy' | 'terms' | 'medical' | 'cookies' | 'data_rights' | 'calendar';
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
    if (pathname === '/legal') return 'legal';
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
    if (page === 'legal') return '/legal';
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
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [trialState, setTrialState] = useState<TrialState | null>(null);
  const [trialFeedback, setTrialFeedback] = useState('');
  const [publicInstallPrompt, setPublicInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installFeedback, setInstallFeedback] = useState('');
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [mobilePlatform, setMobilePlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [heroAbVariant] = useState(() => resolveHeroAbVariant());
  const normalizeExternalUrl = (value: unknown) => {
    const next = String(value || '').trim();
    if (!next || next === '#') return '';
    return next;
  };
  const appStoreUrl = normalizeExternalUrl(import.meta.env.VITE_APP_STORE_URL);
  const googlePlayUrl = normalizeExternalUrl(import.meta.env.VITE_GOOGLE_PLAY_URL);
  const expoPreviewUrl = normalizeExternalUrl(import.meta.env.VITE_EXPO_PREVIEW_URL || 'https://expo.dev/accounts/mkof14/projects/luna-mobile');
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
      featureReports: '✓ Health reports and doctor-ready exports',
      continueTrial: 'Continue Trial',
      startTrial: 'Start 7-day free trial',
      subscribeCta: 'Subscribe · {price}',
      freeAccountCta: 'Create free account — free tier forever',
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
      featureReports: '✓ Health Reports и отчёты для врача',
      continueTrial: 'Продолжить Trial',
      startTrial: 'Начать trial на 7 дней',
      subscribeCta: 'Подписаться · {price}',
      freeAccountCta: 'Бесплатный аккаунт — free tier навсегда',
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
      featureReports: '✓ Health Reports і звіти для лікаря',
      continueTrial: 'Продовжити Trial',
      startTrial: 'Почати trial на 7 днів',
      subscribeCta: 'Підписатися · {price}',
      freeAccountCta: 'Безкоштовний акаунт — free tier назавжди',
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
      featureReports: '✓ Informes de salud listos para el medico',
      continueTrial: 'Continuar prueba',
      startTrial: 'Prueba gratis 7 dias',
      subscribeCta: 'Suscribirse · {price}',
      freeAccountCta: 'Cuenta gratis — plan free para siempre',
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
      featureReports: '✓ Rapports sante prets pour le medecin',
      continueTrial: "Continuer l'essai",
      startTrial: 'Essai gratuit 7 jours',
      subscribeCta: "S'abonner · {price}",
      freeAccountCta: 'Compte gratuit — offre free a vie',
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
      featureReports: '✓ Gesundheitsberichte fur Arztbesuche',
      continueTrial: 'Testphase Fortsetzen',
      startTrial: '7-Tage-Test starten',
      subscribeCta: 'Abonnieren · {price}',
      freeAccountCta: 'Kostenloses Konto — Free tier dauerhaft',
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
      featureReports: '✓ 健康报告与就医准备导出',
      continueTrial: '继续试用',
      startTrial: '开始 7 天免费试用',
      subscribeCta: '订阅 · {price}',
      freeAccountCta: '创建免费账户 — 永久免费层',
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
      featureReports: '✓ 健康レポートと医師向けエクスポート',
      continueTrial: 'トライアルを続ける',
      startTrial: '7日間無料トライアル',
      subscribeCta: '登録 · {price}',
      freeAccountCta: '無料アカウント — 永久無料プラン',
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
      featureReports: '✓ Relatorios de saude prontos para o medico',
      continueTrial: 'Continuar teste',
      startTrial: 'Teste gratis de 7 dias',
      subscribeCta: 'Assinar · {price}',
      freeAccountCta: 'Conta gratis — plano free para sempre',
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
      featureReports: '✓ Health reports and doctor-ready exports',
      continueTrial: 'Continue trial',
      startTrial: 'Start 7-day free trial',
      subscribeCta: 'Subscribe · {price}',
      freeAccountCta: 'Create free account — free tier forever',
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
      featureReports: '✓ Health reports and doctor-ready exports',
      continueTrial: 'המשך ניסיון',
      startTrial: 'Start 7-day free trial',
      subscribeCta: 'Subscribe · {price}',
      freeAccountCta: 'Create free account — free tier forever',
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
    markTrialPending();
    onSignUp();
  };

  const handleSubscribe = () => {
    markCheckoutPending(billingPeriod);
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
    cta: 'Subscribe after account',
    recommended: 'Cancel anytime · 7-day free trial included.',
  };
  const pricingUi = getLang(pricingUiByLang, lang) || pricingUiByLang.en;
  const sections = [
    { id: 'home', label: ui.publicHome.tabs.home },
    { id: 'map', label: ui.publicHome.tabs.map },
    { id: 'ritual', label: 'Ritual Path' },
    { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
    { id: 'pricing', label: getLang(pricingLabelByLang, lang) || 'Pricing' },
  ] as const;
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

  const legalNav = getLegalNavLabels(lang);
  const legalHubLabel = getLegalHubLabel(lang);
  const openLegalDoc = (doc: LegalNavDocType) => {
    const pageByDoc: Record<LegalNavDocType, PublicPage> = {
      privacy: 'privacy',
      terms: 'terms',
      medical: 'medical',
      cookies: 'cookies',
      data_rights: 'data_rights',
    };
    setActivePage(pageByDoc[doc]);
  };
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
      desktop: 'Install on Desktop',
      iosTip: 'Open Safari -> Share -> Add to Home Screen.',
      androidTip: 'Use browser menu -> Install App.',
      desktopTip: 'Use Chrome or Edge menu -> Install Luna29.',
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
      desktop: 'Установить на компьютер',
      iosTip: 'Откройте Safari -> Поделиться -> На экран Домой.',
      androidTip: 'Используйте меню браузера -> Установить приложение.',
      desktopTip: 'Chrome или Edge -> меню -> Установить Luna29.',
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
  const installActions = { ...installActionsByLang.en, ...(getLang(installActionsByLang, lang) || {}) };
  const runPublicInstall = async () => {
    if (!publicInstallPrompt) {
      setInstallFeedback(installActions.noPrompt);
      return;
    }
    await publicInstallPrompt.prompt();
    await publicInstallPrompt.userChoice;
    setInstallFeedback(mobilePlatform === 'other' ? installActions.desktopTip : installActions.androidTip);
  };
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
        desktopTitle?: string;
        desktopStep1?: string;
        desktopStep2?: string;
        openDesktopPrompt?: string;
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
      desktopTitle: 'Desktop Install',
      desktopStep1: 'Step 1: Open Luna29 in Chrome or Edge.',
      desktopStep2: 'Step 2: Click Install in the address bar or browser menu.',
      fallback: 'Open Safari -> Share -> Add to Home Screen.',
      close: 'Close',
      openPrompt: 'Open Android Install',
      openDesktopPrompt: 'Install Luna29 on Desktop',
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
      desktopTitle: 'Desktop Install',
      desktopStep1: 'Шаг 1: Откройте Luna29 в Chrome или Edge.',
      desktopStep2: 'Шаг 2: Нажмите «Установить» в адресной строке или меню браузера.',
      fallback: 'Open Safari -> Share -> Add to Home Screen.',
      close: 'Закрыть',
      openPrompt: 'Открыть Android Install',
      openDesktopPrompt: 'Установить Luna29 на компьютер',
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
  const homeContent = useMemo(() => getPublicHomeContent(lang, heroAbVariant), [heroAbVariant, lang]);
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
  const footerPageLinks: Array<{ id: PublicPage; label: string }> = [
    { id: 'home', label: ui.publicHome.tabs.home },
    { id: 'map', label: ui.publicHome.tabs.map },
    { id: 'calendar', label: memberNav.rhythmCalendar },
    { id: 'ritual', label: publicHomeNavLabels.ritual },
    { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
    { id: 'pricing', label: getLang(pricingLabelByLang, lang) || 'Pricing' },
    { id: 'about', label: getLang(aboutLabelByLang, lang) || 'About' },
    { id: 'how_it_works', label: getLang(howItWorksLabelByLang, lang) || 'How It Works' },
    { id: 'faq', label: getLang(faqLabelByLang, lang) || 'FAQ' },
    { id: 'learning', label: getLang(learningLabelByLang, lang) || 'Learning' },
  ];
  const footerLegalLinks: Array<{ id: PublicPage; label: string }> = [
    { id: 'legal', label: legalHubLabel },
    { id: 'privacy', label: legalNav.privacy },
    { id: 'terms', label: legalNav.terms },
    { id: 'medical', label: legalNav.medical },
    { id: 'cookies', label: legalNav.cookies },
    { id: 'data_rights', label: legalNav.data_rights },
  ];
  const footerExploreMid = Math.ceil(footerPageLinks.length / 2);
  const footerExploreColumns = [footerPageLinks.slice(0, footerExploreMid), footerPageLinks.slice(footerExploreMid)];
  const footerLegalMid = Math.ceil(footerLegalLinks.length / 2);
  const footerLegalColumns = [footerLegalLinks.slice(0, footerLegalMid), footerLegalLinks.slice(footerLegalMid)];
  const footerMicroRitual = getFooterMicroRitual(lang);
  const footerTrustLine = getFooterTrustLine(lang);
  const footerSpiritActions = getFooterSpiritActions(lang);
  const footerMoonAccent = getFooterMoonAccent(lang);
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
    if (activePage === 'legal') return legalHubLabel;
    if (activePage === 'privacy') return legalNav.privacy;
    if (activePage === 'terms') return legalNav.terms;
    if (activePage === 'medical') return legalNav.medical;
    if (activePage === 'cookies') return legalNav.cookies;
    if (activePage === 'data_rights') return legalNav.data_rights;
    return ui.publicHome.pageTitle.home;
  }, [activePage, howItWorksLabelByLang, lang, legalHubLabel, legalNav, pricingLabelByLang, ui.publicHome.pageTitle.home, ui.publicHome.pageTitle.map, ui.publicHome.pageTitle.ritual]);

  useEffect(() => {
    const path = resolvePathFromPage(activePage);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    const titleByPageByLang: LangCopy< Record<Exclude<PublicPage, 'calendar' | 'legal'>, string>> = {
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
    const descriptionByPageByLang: LangCopy< Record<Exclude<PublicPage, 'calendar' | 'legal'>, string>> = {
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
        : activePage === 'legal'
          ? `${legalHubLabel} | Luna29`
          : titleByPage[activePage];
    const descriptionEl = document.querySelector('meta[name="description"]');
    if (descriptionEl) {
      descriptionEl.setAttribute(
        'content',
        activePage === 'calendar'
          ? getLang(calendarSeoDescriptionByLang, lang) || calendarSeoDescriptionByLang.en
          : activePage === 'legal'
            ? `${LEGAL_ENTITY_NAME} legal center: Privacy, Terms, Wellness Notice, Cookies, and Your Data.`
            : descriptionByPage[activePage],
      );
    }
  }, [activePage, calendarSeoDescriptionByLang, calendarSeoTitleByLang, lang, legalHubLabel]);

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

  const publicNavClass = (page: PublicPage) =>
    `text-[1.02rem] transition-opacity duration-300 ${
      activePage === page ? 'font-bold opacity-100' : 'opacity-70 hover:opacity-100'
    }`;

  const publicNavItems: Array<{ page: PublicPage; label: string }> = [
    { page: 'home', label: publicHomeNavLabels.home },
    { page: 'ritual', label: publicHomeNavLabels.ritual },
    { page: 'map', label: publicHomeNavLabels.map },
    { page: 'calendar', label: memberNav.rhythmCalendar },
    { page: 'pricing', label: getLang(pricingLabelByLang, lang) || 'Pricing' },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-gradient-to-b from-[#ebe4f4] via-slate-100 to-[#e4ecf6] dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <header
        className="sticky top-0 z-30 border-b border-[#c9bdd9]/70 dark:border-slate-700/70 bg-white/88 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(109,87,163,0.08)]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[1160px] mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 md:h-[4.5rem] flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          <button type="button" onClick={() => setActivePage('home')} className="flex items-center gap-1 min-w-0 shrink origin-left scale-[1.14] hover:scale-[1.18] active:scale-[1.1] transition-transform overflow-visible pr-1.5">
            <img src={getBrandAssetUrl('icon')} alt="" aria-hidden="true" className="h-10 sm:h-14 w-auto md:h-16 object-contain select-none pointer-events-none shrink-0" />
            <Logo size="sm" className="cursor-default text-3xl sm:text-5xl leading-none shrink-0" />
          </button>
          <nav className="hidden md:flex items-center gap-4 min-w-0">
            {publicNavItems.map((item, index) => (
              <React.Fragment key={item.page}>
                {index > 0 && <span className="text-slate-400/80 animate-color-shift-luna-suffix text-sm leading-none select-none">·</span>}
                <button type="button" onClick={() => setActivePage(item.page)} className={publicNavClass(item.page)}>
                  <LunaMenuLabel text={item.label} active={activePage === item.page} />
                </button>
              </React.Fragment>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector current={lang} onSelect={setLang} />
            <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            <button
              data-testid="public-signin-up"
              onClick={onSignIn}
              className="px-5 py-2 rounded-full border border-luna-purple/40 bg-white/80 dark:bg-slate-900/70 text-luna-purple hover:border-luna-purple/70 hover:bg-luna-purple/10 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {ui.publicHome.signInUp}
            </button>
          </div>
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            <div className="max-w-[5.5rem] sm:max-w-none overflow-hidden">
              <LanguageSelector current={lang} onSelect={setLang} />
            </div>
            <button
              data-testid="public-signin-up-mobile"
              onClick={onSignIn}
              className="px-2.5 sm:px-3 py-1.5 rounded-full border border-luna-purple/45 bg-white/90 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-luna-purple whitespace-nowrap"
            >
              {ui.publicHome.signInUp}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1160px] mx-auto px-3 sm:px-4 md:px-6 pt-6 sm:pt-8 md:pt-10 pb-14 sm:pb-16 md:pb-24 relative z-10 space-y-10 sm:space-y-12 md:space-y-14 luna-public-baseline min-w-0 w-full">
        {activePage !== 'home' && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{pageTitle}</p>
          </div>
        )}

        {activePage === 'home' && (
          <PublicHomeSection
            homeEyebrow={getLang(homeEyebrowByLang, lang) || homeEyebrowByLang.en || 'Luna29 Home'}
            homePatternNote={getLang(homePatternNoteByLang, lang) || homePatternNoteByLang.en || ''}
            homeStory={homeStory}
            homeContent={homeContent}
            hormoneFocus={hormoneFocus}
            calendarService={calendarHomeService}
            onSignIn={onSignIn}
            onStartTrial={startTrial}
            onNavigate={setActivePage}
          />
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
          <Suspense fallback={lazyFallback}>
            <LegalDocumentView lang={lang} doc="privacy" mode="public" onBack={() => setActivePage('legal')} />
          </Suspense>
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
              onSubscribe={handleSubscribe}
              trialFeedback={trialFeedback}
            />
          </Suspense>
        )}

        <Suspense fallback={lazyFallback}>
          {activePage === 'about' && <AboutLunaView lang={lang} mode="public" />}
          {activePage === 'how_it_works' && <HowItWorksView lang={lang} onBack={() => setActivePage('home')} />}
          {activePage === 'faq' && <FAQView lang={lang} mode="public" onBack={() => setActivePage('home')} />}
          {activePage === 'learning' && <LearningView lang={lang} onBack={() => setActivePage('home')} />}
          {activePage === 'legal' && (
            <LegalDocumentView
              lang={lang}
              doc="legal"
              mode="public"
              onBack={() => setActivePage('home')}
              onNavigateDoc={openLegalDoc}
            />
          )}
          {activePage === 'terms' && <LegalDocumentView lang={lang} doc="terms" mode="public" onBack={() => setActivePage('legal')} />}
          {activePage === 'medical' && <LegalDocumentView lang={lang} doc="medical" mode="public" onBack={() => setActivePage('legal')} />}
          {activePage === 'cookies' && <LegalDocumentView lang={lang} doc="cookies" mode="public" onBack={() => setActivePage('legal')} />}
          {activePage === 'data_rights' && <LegalDocumentView lang={lang} doc="data_rights" mode="public" onBack={() => setActivePage('legal')} onNavigateDoc={openLegalDoc} />}
        </Suspense>
      </main>

      <footer className={`w-full border-t-2 ${footerMoonAccent.borderClass} py-16 px-6 md:px-8 glass bg-slate-200/40 dark:bg-transparent mt-auto relative overflow-visible`}>
        <div className="max-w-7xl mx-auto space-y-14 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-0.5 origin-left scale-[1.12]">
              <img src={getBrandAssetUrl('icon')} alt="" aria-hidden="true" className="h-16 w-auto md:h-[4.5rem] object-contain select-none pointer-events-none" />
              <Logo size="sm" className="cursor-default text-4xl md:text-5xl leading-none" />
            </div>
            <p className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-400">{homeStory.heroLead}</p>
            <p className="text-sm font-light italic leading-relaxed text-slate-600 dark:text-slate-400">{footerMicroRitual}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <button type="button" onClick={() => setActivePage('about')} className="text-[13px] font-light underline underline-offset-4">
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
              <span
                className={`inline-block w-2 h-2 rounded-full shrink-0 ${footerMoonAccent.dotClass} ${footerMoonAccent.glowClass}`}
                aria-hidden="true"
              />
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
                    {column.map((page) => (
                      <button
                        key={`footer-${page.id}`}
                        onClick={() => setActivePage(page.id)}
                        className="text-left"
                      >
                        <LunaMenuLabel text={page.label} muted className="font-light" />
                      </button>
                    ))}
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
                    {column.map((link) => (
                      <button
                        key={`footer-legal-${link.id}`}
                        onClick={() => setActivePage(link.id)}
                        className="text-left"
                      >
                        <LunaMenuLabel text={link.label} muted className="font-light" />
                      </button>
                    ))}
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
                  onClick={() => setShowInstallGuideModal(true)}
                  className="text-left text-[13px] font-light tracking-[0.03em] underline underline-offset-4"
                >
                  <LunaMenuLabel text={installGuideModal.title} muted className="font-light" />
                </button>
                {!isStandaloneMode && (
                  <button
                    type="button"
                    onClick={() => void runPublicInstall()}
                    className="text-left text-[12px] font-semibold"
                  >
                    <LunaMenuLabel
                      text={mobilePlatform === 'other' ? installActions.desktop : installActions.android}
                      muted
                      className="font-semibold"
                    />
                  </button>
                )}
                {(appStoreUrl || (showPreviewLink && mobilePlatform === 'ios')) && (
                  <a
                    href={appStoreUrl || expoPreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-left text-[12px] font-semibold"
                  >
                    <LunaMenuLabel
                      text={appStoreUrl ? storeBadges.appStore : storeBadges.preview}
                      muted
                      className="font-semibold"
                    />
                  </a>
                )}
                {(googlePlayUrl || (showPreviewLink && mobilePlatform === 'android')) && (
                  <a
                    href={googlePlayUrl || expoPreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-left text-[12px] font-semibold"
                  >
                    <LunaMenuLabel
                      text={googlePlayUrl ? storeBadges.googlePlay : storeBadges.preview}
                      muted
                      className="font-semibold"
                    />
                  </a>
                )}
                {showPreviewLink && mobilePlatform === 'other' && (
                  <a href={expoPreviewUrl} target="_blank" rel="noreferrer" className="text-left text-[12px] font-semibold">
                    <LunaMenuLabel text={storeBadges.preview} muted className="font-semibold" />
                  </a>
                )}
                {!appStoreUrl && !googlePlayUrl && !showPreviewLink && (
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
                <LanguageSelector
                  current={lang}
                  onSelect={setLang}
                  variant="footer"
                  menuAlign="left"
                  menuPlacement="top"
                />
                <div className="flex items-center gap-3">
                  <LunaMenuLabel
                    text={getLang(themeLabelByLang, lang) || themeLabelByLang.en}
                    muted
                    className="text-[13px] font-light tracking-[0.03em]"
                  />
                  <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
                </div>
                <button onClick={onSignIn} className="text-left text-[13px] font-light tracking-[0.03em] underline underline-offset-4">
                  <LunaMenuLabel text={publicHomeNavLabels.adminLogin} muted className="font-light" />
                </button>
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
        <div className="fixed inset-0 z-[900] bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInstallGuideModal(false)}>
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-luna-purple">{installGuideModal.title}</p>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">{installGuideModal.how}</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{installGuideModal.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onClick={() => void runPublicInstall()}
                  className={`${PUBLIC_BTN_SECONDARY} mt-2 px-3 py-2 text-[10px] tracking-[0.14em] text-luna-purple`}
                >
                  {installGuideModal.openPrompt}
                </button>
              </article>
              {mobilePlatform === 'other' && (
                <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/40 p-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">
                    {installGuideModal.desktopTitle || installActions.desktop}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {installGuideModal.desktopStep1 || installActions.desktopTip}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {installGuideModal.desktopStep2 || installActions.desktopTip}
                  </p>
                  {!isStandaloneMode && (
                    <button
                      onClick={() => void runPublicInstall()}
                      className={`${PUBLIC_BTN_SECONDARY} mt-2 px-3 py-2 text-[10px] tracking-[0.14em] text-luna-purple`}
                    >
                      {installGuideModal.openDesktopPrompt || installActions.desktop}
                    </button>
                  )}
                </article>
              )}
            </div>
            {showPreviewLink && (
              <a href={expoPreviewUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-luna-purple underline underline-offset-4">
                {storeBadges.preview}
              </a>
            )}
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
