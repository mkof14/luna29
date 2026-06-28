export type BaseMobileLang = 'en' | 'ru' | 'es';
export type ExtraMobileLang = 'uk' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';
export type MobileLang = BaseMobileLang | ExtraMobileLang;

type CopyShape = {
  common: {
    back: string;
    allServices: string;
    memberZone: string;
    admin: string;
    footerLinks: string;
  };
  services: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroText: string;
    speak: string;
    coreSections: string;
    bodyMap: string;
    ritualPath: string;
    bridge: string;
    knowledge: string;
    reports: string;
    support: string;
  };
  admin: {
    title: string;
    subtitle: string;
    restricted: string;
    restrictedBody: string;
    state: string;
    metrics: string;
    audit: string;
    refresh: string;
    runCheck: string;
  };
  publicHome: {
    title: string;
    subtitle: string;
    start: string;
    how: string;
    openApp: string;
  };
  today: {
    reflection: string;
    chooseAction: string;
    speak: string;
    quick: string;
    refresh: string;
    services: string;
  };
  onboarding: {
    welcome: string;
    welcomeBody: string;
    begin: string;
    continue: string;
    firstQuestion: string;
    speak: string;
    write: string;
    skip: string;
  };
};

export const mobileCopy: Record<BaseMobileLang, CopyShape> = {
  en: {
    common: {
      back: 'Back',
      allServices: 'All Services',
      memberZone: 'Member Zone',
      admin: 'Admin',
      footerLinks: 'Footer links',
    },
    services: {
      title: 'Luna29 Services',
      subtitle: 'Everything in your daily flow.',
      heroTitle: 'Your daily emotional mirror',
      heroText: 'Speak to Luna29, track your rhythm, and turn signals into clear next steps.',
      speak: 'Speak to Luna29',
      coreSections: 'Core sections',
      bodyMap: 'Body Map',
      ritualPath: 'Ritual Path',
      bridge: 'The Bridge',
      knowledge: 'Knowledge',
      reports: 'Health Reports',
      support: 'Support & FAQ',
    },
    admin: {
      title: 'Admin',
      subtitle: 'Administration and operations.',
      restricted: 'Access restricted',
      restrictedBody: 'Sign in with your super admin account to manage users, roles, templates, and services.',
      state: 'Admin state',
      metrics: 'Metrics',
      audit: 'Recent audit',
      refresh: 'Refresh admin data',
      runCheck: 'Run technical check',
    },
    publicHome: {
      title: 'Your daily emotional mirror',
      subtitle: 'Understand yourself through body rhythms, daily observations, and voice notes.',
      start: 'Start today',
      how: 'See how Luna29 works',
      openApp: 'Open full app',
    },
    today: {
      reflection: 'Today’s reflection',
      chooseAction: 'Choose one small action now.',
      speak: 'Speak to Luna29',
      quick: 'Quick check-in',
      refresh: 'Refresh context',
      services: 'All Services',
    },
    onboarding: {
      welcome: 'Welcome to Luna29',
      welcomeBody: 'A quiet place to understand how your body and emotions move together.',
      begin: 'Begin',
      continue: 'Continue',
      firstQuestion: 'How does today feel so far?',
      speak: 'Speak',
      write: 'Write',
      skip: 'Skip',
    },
  },
  ru: {
    common: {
      back: 'Назад',
      allServices: 'Все сервисы',
      memberZone: 'Мембер Зона',
      admin: 'Админ',
      footerLinks: 'Ссылки футера',
    },
    services: {
      title: 'Сервисы Luna29',
      subtitle: 'Все важное в ежедневном потоке.',
      heroTitle: 'Ваше ежедневное эмоциональное зеркало',
      heroText: 'Говорите с Luna29, отслеживайте ритм и получайте ясные шаги на сегодня.',
      speak: 'Говорить с Luna29',
      coreSections: 'Основные разделы',
      bodyMap: 'Body Map',
      ritualPath: 'Ritual Path',
      bridge: 'The Bridge',
      knowledge: 'Knowledge',
      reports: 'Health Reports',
      support: 'Поддержка и FAQ',
    },
    admin: {
      title: 'Админ',
      subtitle: 'Управление и операции.',
      restricted: 'Доступ ограничен',
      restrictedBody: 'Войдите под super admin аккаунтом для управления пользователями, ролями, шаблонами и сервисами.',
      state: 'Состояние админки',
      metrics: 'Метрики',
      audit: 'Последние действия',
      refresh: 'Обновить админ-данные',
      runCheck: 'Запустить техпроверку',
    },
    publicHome: {
      title: 'Ваше ежедневное эмоциональное зеркало',
      subtitle: 'Понимайте себя через ритмы тела, ежедневные наблюдения и голосовые заметки.',
      start: 'Начать сегодня',
      how: 'Как работает Luna29',
      openApp: 'Открыть полный апп',
    },
    today: {
      reflection: 'Отражение дня',
      chooseAction: 'Выберите одно короткое действие сейчас.',
      speak: 'Говорить с Luna29',
      quick: 'Быстрый check-in',
      refresh: 'Обновить контекст',
      services: 'Все сервисы',
    },
    onboarding: {
      welcome: 'Добро пожаловать в Luna29',
      welcomeBody: 'Тихое пространство, чтобы понимать, как движутся тело и эмоции.',
      begin: 'Начать',
      continue: 'Продолжить',
      firstQuestion: 'Как ощущается сегодняшний день?',
      speak: 'Голос',
      write: 'Текст',
      skip: 'Пропустить',
    },
  },
  es: {
    common: {
      back: 'Atras',
      allServices: 'Todos los servicios',
      memberZone: 'Zona miembro',
      admin: 'Admin',
      footerLinks: 'Links del footer',
    },
    services: {
      title: 'Servicios Luna29',
      subtitle: 'Todo en tu flujo diario.',
      heroTitle: 'Tu espejo emocional diario',
      heroText: 'Habla con Luna29, sigue tu ritmo y convierte señales en pasos claros.',
      speak: 'Hablar con Luna29',
      coreSections: 'Secciones principales',
      bodyMap: 'Body Map',
      ritualPath: 'Ritual Path',
      bridge: 'The Bridge',
      knowledge: 'Knowledge',
      reports: 'Health Reports',
      support: 'Soporte y FAQ',
    },
    admin: {
      title: 'Admin',
      subtitle: 'Administracion y operaciones.',
      restricted: 'Acceso restringido',
      restrictedBody: 'Inicia sesion con tu cuenta super admin para gestionar usuarios, roles, plantillas y servicios.',
      state: 'Estado admin',
      metrics: 'Metricas',
      audit: 'Auditoria reciente',
      refresh: 'Actualizar datos admin',
      runCheck: 'Ejecutar chequeo tecnico',
    },
    publicHome: {
      title: 'Tu espejo emocional diario',
      subtitle: 'Entiendete a traves de ritmos del cuerpo, observaciones diarias y notas de voz.',
      start: 'Empezar hoy',
      how: 'Como funciona Luna29',
      openApp: 'Abrir app completa',
    },
    today: {
      reflection: 'Reflexion de hoy',
      chooseAction: 'Elige una accion pequena ahora.',
      speak: 'Hablar con Luna29',
      quick: 'Check-in rapido',
      refresh: 'Actualizar contexto',
      services: 'Todos los servicios',
    },
    onboarding: {
      welcome: 'Bienvenida a Luna29',
      welcomeBody: 'Un espacio tranquilo para entender como se mueven tu cuerpo y emociones.',
      begin: 'Comenzar',
      continue: 'Continuar',
      firstQuestion: 'Como se siente hoy hasta ahora?',
      speak: 'Hablar',
      write: 'Escribir',
      skip: 'Saltar',
    },
  },
};

export const languageOptions: Array<{ key: MobileLang | ExtraMobileLang; target: MobileLang; label: string }> = [
  { key: 'en', target: 'en', label: '🇺🇸 EN' },
  { key: 'ru', target: 'ru', label: '🇷🇺 RU' },
  { key: 'es', target: 'es', label: '🇪🇸 ES' },
  { key: 'uk', target: 'uk', label: '🇺🇦 UK' },
  { key: 'fr', target: 'fr', label: '🇫🇷 FR' },
  { key: 'de', target: 'de', label: '🇩🇪 DE' },
  { key: 'pt', target: 'pt', label: '🇵🇹 PT' },
  { key: 'ja', target: 'ja', label: '🇯🇵 JA' },
  { key: 'zh', target: 'zh', label: '🇨🇳 ZH' },
];

export function resolveLangBase(lang: MobileLang | ExtraMobileLang): BaseMobileLang {
  if (lang === 'ru' || lang === 'uk') return 'ru';
  if (lang === 'es' || lang === 'pt') return 'es';
  return 'en';
}

export function getMobileCopy(lang: MobileLang): CopyShape {
  return mobileCopy[resolveLangBase(lang)];
}
