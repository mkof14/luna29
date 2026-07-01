
import { HormoneStatus, HormoneData, CyclePhase } from './types';

export type Language = 'en' | 'ru' | 'uk' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'ar' | 'he';

export type LangCopy<T> = Partial<Record<Language, T>> & { en: T };

export function getLang<T>(map: { en?: T } & Partial<Record<Language, T>>, lang: Language): T {
  return (map[lang] ?? map.en) as T;
}

export const BRAND_NAME = 'Luna29';
export const BRAND_NAME_UPPER = 'LUNA29';

const en = {
  navigation: {
    home: "Home",
    dashboard: "Today",
    cycle: "My Cycle",
    labs: "Health Reports",
    meds: "Medication Note",
    history: "My Journey",
    bridge: "The Bridge",
    creative: "Create",
    reflections: "Voice Note",
    voiceFiles: "My Voice Files",
    relationships: "Connection",
    family: "Home Seasons",
    profile: "Profile",
    library: "Knowledge",
    faq: "Questions",
    contact: "Contact",
    crisis: "Reset Room",
    admin: "Admin",
    partner: "PARTNER FAQ",
    support: "Support",
    healthHub: "Health Hub",
    awareness: "Awareness",
    harmony: "Harmony"
  },
  library: {
    headline: "Your Body's Voice",
    subheadline: "A guide to understanding your unique biological rhythm.",
    categories: {
      rhythm: "Reproductive rhythm",
      metabolism: "Metabolic engine",
      stress: "Stress & Survival",
      vitality: "Vitality & Resources",
      brain: "Neurochemistry & Bonding"
    }
  },
  fuel: {
    title: "Nourishment",
    subtitle: "What your body needs in this phase",
    priorities: "Focus on",
    fullProtocol: "Phase Guide",
    categories: {
      micronutrients: "Micronutrients",
      foods: "Functional Foods",
      ritual: "Supportive Rituals"
    },
    avoid: "Sensitivity Watch"
  },
  archetypes: {
    fog: { name: "The Fog", desc: "Low visibility, internal focus required." },
    radiance: { name: "The Radiance", desc: "Peak capacity and social magnetism." },
    storm: { name: "The Storm", desc: "High sensitivity, boundary protection." },
    anchor: { name: "The Anchor", desc: "Grounded, restorative, steady." }
  },
  checkin: {
    energy: { label: "Physical Energy", min: "Heavy/Low", max: "Full/Vibrant" },
    mood: { label: "My Mood", min: "Sensitive", max: "Radiant" },
    sleep: { label: "Sleep Quality", min: "Interrupted", max: "Deep/Restful" },
    libido: { label: "Inner Drive", min: "Quiet", max: "Active" },
    irritability: { label: "Patience Level", min: "Short", max: "Calm/High" },
    stress: { label: "Current Load", min: "Grounded", max: "Overloaded" }
  },
  dashboard: {
    quickCheckin: "Check-in",
    journal: "Journal",
    bridge: "Bridge",
    cycle: "Cycle",
    startCheckin: "Start Check-in",
    talkToLuna: "Talk to Luna29",
    archetypeModeActive: "Mode Active",
    thinking: "Thinking...",
    balanced: "Balanced.",
    insight: "Insight",
    dailyTip: "Daily Tip",
    hydrateTip: "Hydrate intentionally today to support your rhythm.",
    learnWhy: "Learn Why →",
    bodyMap: "Body Map",
    exploreKnowledge: "Explore Knowledge →",
    reassurance: "Nature is never in a hurry.",
    baselineInsight: "Your body is operating at a balanced baseline."
  },
  checkinOverlay: {
    headline: "Daily Check-in",
    subheadline: "Capture your current state.",
    save: "Save",
    saveAndBridge: "+ The Bridge"
  },
  bridge: {
    title: "Relationship Mode",
    subtitle: "Partner Note",
    cta: "Generate a calm message to help [Name] understand your current state.",
    generating: "Crafting note...",
    shared: "Copied to clipboard",
    partnerPlaceholder: "Partner's Name",
    intents: {
      understanding: "I want understanding / patience",
      space: "I want space / quiet",
      support: "I want specific support",
      prevent_misunderstanding: "I want to prevent misunderstanding",
      not_sure: "I'm not sure — help me phrase it"
    },
    tones: {
      calm: "Calm & neutral",
      warm: "Warm & close",
      short: "Very short",
      detailed: "More detailed",
      repair: "Repair after tension"
    },
    boundaries: {
      soft: "Soft ask",
      gentle: "Gentle boundary",
      clear: "Clear boundary"
    },
    steps: {
      intent: "What is your intent?",
      tone: "Choose a tone",
      boundary: "Set a boundary level",
      result: "Your Partner Note"
    },
    refinements: {
      shorter: "Make it shorter",
      softer: "Make it softer",
      clearer: "Make it clearer",
      appreciation: "Add appreciation",
      boundary: "Add boundary",
      neutralize: "Remove blame"
    },
    shareAction: "Share with Partner",
    refineAction: "Refine Message",
    partnerFAQ: {
      title: "Partner FAQ",
      subtitle: "Understanding the Luna29 system from the outside.",
      items: [
        { q: "What is Luna29?", a: "Luna29 is a wellness support system that maps physiological rhythms to help users understand their internal state. It's a mirror, not a coach." },
        { q: "How can I support her?", a: "The best support is understanding. When she shares a 'Partner Note,' it's an invitation to sync with her current capacity, not a request for a solution." },
        { q: "Why does her mood change?", a: "Physiological cycles affect energy, sensitivity, and social bandwidth. These are natural shifts, not personal reactions." },
        { q: "Is this medical?", a: "No. Luna29 is a mirror for self-observation. It doesn't diagnose. If you have medical concerns, please consult a professional." },
        { q: "How to read the 'Partner Note'?", a: "It's a bridge. It uses 'I' statements to explain her internal landscape. Read it as a weather report for her day." }
      ]
    }
  },
  contact: {
    headline: "Reach Out",
    subheadline: "Direct communication with the Luna29 architecture team.",
    supportTitle: "System Support",
    supportDesc: "Troubleshooting and technical inquiries.",
    feedbackTitle: "Evolution Ideas",
    feedbackDesc: "Share your thoughts on the system's growth.",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    send: "Send"
  },
  auth: {
    recoveryHeadline: "Restore Access",
    recoveryText: "Enter your account email and Luna29 will prepare a secure recovery route.",
    email: "Email",
    recoveryCta: "Send Recovery Link",
    headline: "Luna29 Authorization",
    subheadline: "Private access to your Luna29 workspace and admin systems.",
    google: "Continue with Google",
    password: "Password",
    hide: "Hide",
    show: "Show",
    forgot: "Forgot Password?",
    login: "Sign In",
    signup: "Create Account",
    noAccount: "Need an account?",
    hasAccount: "Already have an account?",
    backToPublic: "Back to public home",
  },
  publicHome: {
    tabs: {
      home: "Home",
      map: "Body Map",
      ritual: "Ritual Path"
    },
    pageTitle: {
      home: "Public Home",
      map: "Body Map",
      ritual: "Ritual Path",
      privacy: "Privacy"
    },
    signInUp: "Sign In / Up",
    heroTitleA: "Daily",
    heroTitleB: "Mirror.",
    heroSubtitle: "Luna29 Home is a calm public entry point: observe your rhythm, understand your state, and enter private space when ready.",
    panel: {
      phase: "Open",
      summary: "Presence before pressure. Rhythm before reaction.",
      reassurance: "You can move slowly and still move deeply."
    },
    map: {
      eyebrow: "Body Map",
      title: "Map The Invisible",
      subtitle: "A section for sensing subtle shifts. Less diagnosis, more orientation.",
      cards: {
        weatherTitle: "Inner Weather",
        weatherText: "Luna29 reads your state as weather: changing, valid, and worth listening to.",
        memoryTitle: "Rhythm Memory",
        memoryText: "Patterns become visible over days and weeks, helping you respond with less friction.",
        languageTitle: "Gentle Language",
        languageText: "No alarmist tone. No pressure to optimize. Just clarity and grounded note."
      }
    },
    ritual: {
      eyebrow: "Ritual Path",
      title: "A Path, Not A Checklist",
      morningTitle: "Morning",
      morningText: "Name your baseline before the world names your pace.",
      middayTitle: "Midday",
      middayText: "Re-check capacity and adjust plans with respect for your energy.",
      eveningTitle: "Evening",
      eveningText: "Close the day with a short note to preserve signal, not noise.",
      noteTitle: "Luna29 Note",
      noteMain: "This Home is public by design. It gives orientation without extracting attention.",
      noteSub: "Your private member zone is where personal data, check-ins, and deeper tools live."
    },
    privacy: {
      title: "Privacy Promise",
      subtitle: "A protected center for your personal rhythm data.",
      cta: "Enter Member Zone",
      body: "Luna29 follows a local-first approach. The public page remains informational and open. Personal records and role-specific tools stay inside the authenticated member space."
    },
    footerTagline: "Public Home for orientation, rhythm, and note.",
    footerCopy: "© 2026 LUNA29 • PUBLIC HOME"
  },
  shared: {
    footer: "Private & Local. Your data stays on your device.",
    disclaimer: "Luna29 is not a medical service, medical device, diagnostic tool, or treatment provider. Luna29 does not provide medical advice, diagnosis, monitoring, or emergency care. Always consult a licensed healthcare professional."
  }
};

export type TranslationSchema = typeof en;

const ru = {
  ...en,
  navigation: {
    ...en.navigation,
    home: "Главная",
    dashboard: "Сегодня",
    cycle: "Мой цикл",
    labs: "Отчеты здоровья",
    meds: "Заметка о препарате",
    history: "Мой путь",
    bridge: "Мост",
    creative: "Творчество",
    reflections: "Голосовая заметка",
    voiceFiles: "Мои голосовые файлы",
    relationships: "Связь",
    family: "Сезоны Дома",
    profile: "Профиль",
    library: "Знания",
    faq: "Вопросы",
    contact: "Контакт",
    crisis: "Комната Стабилизации",
    admin: "Админ",
    partner: "PARTNER FAQ",
    support: "Поддержка",
    healthHub: "Центр здоровья",
    awareness: "Осознанность",
    harmony: "Гармония"
  },
  library: {
    headline: "Голос тела",
    subheadline: "Ваш личный путеводитель по биологическим ритмам.",
    categories: {
      rhythm: "Репродуктивный Ритм",
      metabolism: "Метаболический Двигатель",
      stress: "Стресс и Выживание",
      vitality: "Жизненная Сила и Ресурсы",
      brain: "Нейрохимия и Связи"
    }
  },
  fuel: {
    title: "Питание",
    subtitle: "Что нужно вашему телу сейчас",
    priorities: "В фокусе",
    fullProtocol: "Гид по фазе",
    categories: {
      micronutrients: "Микронутриенты",
      foods: "Функциональные продукты",
      ritual: "Поддерживающие ритуалы"
    },
    avoid: "Ограничения"
  },
  dashboard: {
    quickCheckin: "Отметиться",
    journal: "Дневник",
    bridge: "Мост",
    cycle: "Цикл",
    startCheckin: "Начать проверку",
    talkToLuna: "Поговорить с Luna29",
    archetypeModeActive: "Режим активен",
    thinking: "Думаю...",
    balanced: "Сбалансировано.",
    insight: "Инсайт",
    dailyTip: "Совет дня",
    hydrateTip: "Пейте больше воды сегодня для поддержания баланса.",
    learnWhy: "Почему это важно →",
    bodyMap: "Карта тела",
    exploreKnowledge: "Изучить знания →",
    reassurance: "Природа никогда не спешит.",
    baselineInsight: "Ваше тело работает в сбалансированном режиме."
  },
  checkinOverlay: {
    headline: "Как вы сегодня?",
    subheadline: "Отметьте свое текущее состояние.",
    save: "Сохранить",
    saveAndBridge: "+ Мост"
  },
  bridge: {
    title: "Режим Отношений",
    subtitle: "Записка Партнеру",
    cta: "Создать спокойное сообщение, чтобы помочь [Name] понять ваше состояние.",
    generating: "Создаю записку...",
    shared: "Скопировано в буфер",
    partnerPlaceholder: "Имя партнера",
    intents: {
      understanding: "Я хочу понимания / терпения",
      space: "Мне нужно пространство / тишина",
      support: "Мне нужна конкретная поддержка",
      prevent_misunderstanding: "Я хочу избежать недопонимания",
      not_sure: "Я не уверена — помоги мне сформулировать"
    },
    tones: {
      calm: "Спокойный и нейтральный",
      warm: "Теплый и близкий",
      short: "Очень короткий",
      detailed: "Более детальный",
      repair: "Восстановление после напряжения"
    },
    boundaries: {
      soft: "Мягкая просьба",
      gentle: "Мягкая граница",
      clear: "Четкая граница"
    },
    steps: {
      intent: "Какова ваша цель?",
      tone: "Выберите тон",
      boundary: "Установите уровень границ",
      result: "Ваша Записка Партнеру"
    },
    refinements: {
      shorter: "Сделать короче",
      softer: "Сделать мягче",
      clearer: "Сделать четче",
      appreciation: "Добавить благодарность",
      boundary: "Добавить границу",
      neutralize: "Убрать обвинения"
    },
    shareAction: "Поделиться с партнером",
    refineAction: "Уточнить сообщение",
    partnerFAQ: {
      title: "FAQ для партнеров",
      subtitle: "Понимание системы Luna29 со стороны.",
      items: [
        { q: "Что такое Luna29?", a: "Luna29 — это система поддержки благополучия, которая сопоставляет физиологические ритмы, чтобы помочь пользователю понять свое внутреннее состояние. Это зеркало, а не коуч." },
        { q: "Как я могу ее поддержать?", a: "Лучшая поддержка — это понимание. Когда она делится «Запиской партнера», это приглашение синхронизироваться с ее текущими возможностями, а не просьба о решении." },
        { q: "Почему ее настроение меняется?", a: "Физиологические циклы влияют на энергию, чувствительность и социальную активность. Это естественные сдвиги, а не личные реакции." },
        { q: "Это медицинское приложение?", a: "Нет. Luna29 — это зеркало для самонаблюдения. Она не ставит диагнозы. Если у вас есть медицинские вопросы, обратитесь к специалисту." },
        { q: "Как читать «Записку партнера»?", a: "Это мост. В ней используются «Я-сообщения» для объяснения ее внутреннего ландшафта. Читайте это как прогноз погоды на ее день." }
      ]
    }
  },
  auth: {
    recoveryHeadline: "Восстановление доступа",
    recoveryText: "Введите email аккаунта, и Luna29 подготовит безопасное восстановление.",
    email: "Email",
    recoveryCta: "Отправить ссылку",
    headline: "Авторизация Luna29",
    subheadline: "Приватный вход в рабочее пространство Luna29 и админ-системы.",
    google: "Войти через Google",
    password: "Пароль",
    hide: "Скрыть",
    show: "Показать",
    forgot: "Забыли пароль?",
    login: "Войти",
    signup: "Создать аккаунт",
    noAccount: "Нужен аккаунт?",
    hasAccount: "Уже есть аккаунт?",
    backToPublic: "Назад на публичную главную",
  },
  publicHome: {
    tabs: {
      home: "Главная",
      map: "Карта Тела",
      ritual: "Ритуальный Путь"
    },
    pageTitle: {
      home: "Публичная Главная",
      map: "Карта Тела",
      ritual: "Ритуальный Путь",
      privacy: "Приватность"
    },
    signInUp: "Вход / Регистрация",
    heroTitleA: "Ежедневное",
    heroTitleB: "Зеркало.",
    heroSubtitle: "Luna29 — это спокойная публичная точка входа: наблюдайте свой ритм, понимайте состояние и входите в личное пространство, когда будете готовы.",
    panel: {
      phase: "Открыто",
      summary: "Сначала присутствие. Потом действие.",
      reassurance: "Можно двигаться медленно и всё равно глубоко."
    },
    map: {
      eyebrow: "Карта Тела",
      title: "Картируйте Невидимое",
      subtitle: "Раздел для тонких сдвигов состояния. Меньше диагнозов, больше ориентации.",
      cards: {
        weatherTitle: "Внутренняя Погода",
        weatherText: "Luna29 читает состояние как погоду: изменчивую, важную и достойную внимания.",
        memoryTitle: "Память Ритма",
        memoryText: "Паттерны проявляются по дням и неделям, помогая действовать с меньшим напряжением.",
        languageTitle: "Мягкий Язык",
        languageText: "Без давления и тревожных формулировок. Только ясность и бережное наблюдение."
      }
    },
    ritual: {
      eyebrow: "Ритуальный Путь",
      title: "Путь, А Не Чеклист",
      morningTitle: "Утро",
      morningText: "Назовите свою базовую точку до того, как день задаст темп.",
      middayTitle: "День",
      middayText: "Проверьте ресурс и скорректируйте планы с уважением к энергии.",
      eveningTitle: "Вечер",
      eveningText: "Закройте день короткой заметкой, чтобы сохранять сигнал, а не шум.",
      noteTitle: "Заметка Luna29",
      noteMain: "Эта главная страница публичная по дизайну. Она дает ориентир без борьбы за внимание.",
      noteSub: "Личная зона — это ваши данные, отметки состояния и более глубокие инструменты."
    },
    privacy: {
      title: "Обещание Приватности",
      subtitle: "Защищенное пространство для ваших ритмов.",
      cta: "Войти в личную зону",
      body: "Luna29 следует local-first подходу. Публичная страница остается информационной и открытой. Личные записи и ролевые инструменты находятся внутри авторизованной зоны."
    },
    footerTagline: "Публичная главная для ориентации, ритма и заметок.",
    footerCopy: "© 2026 LUNA29 • ПУБЛИЧНАЯ ГЛАВНАЯ"
  },
  shared: {
    footer: "Приватно и локально. Ваши данные остаются на вашем устройстве.",
    disclaimer: "Luna29 не является медицинским сервисом, медицинским устройством, диагностическим инструментом или поставщиком лечения. Luna29 не предоставляет медицинских советов, диагнозов, мониторинга или экстренной помощи. Всегда обращайтесь к лицензированному медицинскому специалисту."
  }
};

export const UI_COPY = {
  hormones: {
    displayNames: {
      estrogen: "Social Battery",
      progesterone: "Inner Peace",
      cortisol: "Stress Load",
      testosterone: "Vitality",
      insulin: "Energy Balance",
      thyroid: "Body Speed"
    }
  },
  reflection: {
    guidance: "Thoughts for self-notes"
  }
};

const uk: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: 'Головна',
    dashboard: 'Сьогодні',
    cycle: 'Мій цикл',
    labs: "Звіти здоров'я",
    meds: 'Нотатка про препарат',
    history: 'Мій шлях',
    bridge: 'Міст',
    creative: 'Творчість',
    reflections: 'Голосова нотатка',
    voiceFiles: 'Мої голосові файли',
    relationships: "Зв'язок",
    family: 'Сезони Дому',
    profile: 'Профіль',
    library: 'Знання',
    faq: 'Питання',
    contact: 'Контакт',
    crisis: 'Кімната Стабілізації',
    admin: 'Адмін',
    partner: 'PARTNER FAQ',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: 'Чек-ін',
    startCheckin: 'Почати чек-ін',
    talkToLuna: 'Поговорити з Luna29',
    dailyTip: 'Порада дня',
    bodyMap: 'Карта тіла',
  },
  checkinOverlay: {
    headline: 'Щоденний чек-ін',
    subheadline: 'Зафіксуйте поточний стан.',
    save: 'Зберегти',
    saveAndBridge: '+ Міст'
  },
  auth: {
    ...en.auth,
    recoveryHeadline: 'Відновити доступ',
    recoveryText: 'Введіть email облікового запису, і Luna29 підготує безпечне відновлення.',
    recoveryCta: 'Надіслати посилання',
    headline: 'Авторизація Luna29',
    subheadline: 'Приватний доступ до вашого простору Luna29 та адмін-систем.',
    google: 'Продовжити з Google',
    password: 'Пароль',
    hide: 'Сховати',
    show: 'Показати',
    forgot: 'Забули пароль?',
    login: 'Увійти',
    signup: 'Створити акаунт',
    noAccount: 'Потрібен акаунт?',
    hasAccount: 'Вже маєте акаунт?'
  },
  publicHome: {
    ...en.publicHome,
    tabs: { home: 'Головна', map: 'Карта тіла', ritual: 'Ритуальний шлях' },
    pageTitle: { home: 'Публічна головна', map: 'Карта тіла', ritual: 'Ритуальний шлях', privacy: 'Приватність' },
    signInUp: 'Вхід / Реєстрація',
    heroTitleA: 'Щоденне',
    heroTitleB: 'Дзеркало.',
    heroSubtitle: 'Luna29 — спокійна публічна точка входу: спостерігайте ритм, розумійте стан і заходьте у приватний простір, коли будете готові.',
    footerTagline: 'Публічна головна для орієнтації, ритму та нотаток.',
    footerCopy: '© 2026 LUNA29 • ПУБЛІЧНА ГОЛОВНА'
  },
  shared: {
    footer: 'Приватно і локально. Ваші дані залишаються на вашому пристрої.',
    disclaimer: 'Luna29 не є медичним сервісом, медичним пристроєм, діагностичним інструментом або засобом лікування. Luna29 не надає медичних порад, діагнозів, моніторингу чи екстреної допомоги. Завжди звертайтесь до ліцензованого медичного фахівця.'
  }
};

const es: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: 'Inicio',
    dashboard: 'Hoy',
    cycle: 'Mi ciclo',
    labs: 'Informes de salud',
    meds: 'Mi apoyo',
    history: 'Mi camino',
    bridge: 'Puente',
    creative: 'Crear',
    reflections: 'Nota de voz',
    voiceFiles: 'Mis archivos de voz',
    relationships: 'Conexión',
    family: 'Estaciones del hogar',
    profile: 'Perfil',
    library: 'Conocimiento',
    faq: 'Preguntas',
    contact: 'Contacto',
    crisis: 'Sala Reset',
    admin: 'Admin',
    partner: 'PARTNER FAQ',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: 'Check-in',
    startCheckin: 'Iniciar check-in',
    talkToLuna: 'Hablar con Luna29',
    dailyTip: 'Consejo diario',
    bodyMap: 'Mapa corporal',
  },
  checkinOverlay: {
    headline: 'Check-in diario',
    subheadline: 'Captura tu estado actual.',
    save: 'Guardar',
    saveAndBridge: '+ Puente'
  },
  auth: {
    ...en.auth,
    recoveryHeadline: 'Restablecer acceso',
    recoveryText: 'Introduce el email de tu cuenta y Luna29 preparará una ruta segura de recuperación.',
    recoveryCta: 'Enviar enlace',
    headline: 'Autorización Luna29',
    subheadline: 'Acceso privado a tu espacio Luna29 y sistemas de admin.',
    google: 'Continuar con Google',
    password: 'Contraseña',
    hide: 'Ocultar',
    show: 'Mostrar',
    forgot: '¿Olvidaste tu contraseña?',
    login: 'Iniciar sesión',
    signup: 'Crear cuenta',
    noAccount: '¿Necesitas una cuenta?',
    hasAccount: '¿Ya tienes cuenta?'
  },
  publicHome: {
    ...en.publicHome,
    tabs: { home: 'Inicio', map: 'Mapa corporal', ritual: 'Ruta ritual' },
    pageTitle: { home: 'Inicio público', map: 'Mapa corporal', ritual: 'Ruta ritual', privacy: 'Privacidad' },
    signInUp: 'Entrar / Crear cuenta',
    heroTitleA: 'Espejo',
    heroTitleB: 'Diario.',
    heroSubtitle: 'Luna29 es una entrada pública y tranquila: observa tu ritmo, comprende tu estado y entra al espacio privado cuando quieras.',
    footerTagline: 'Página pública para orientación, ritmo y reflexión.',
    footerCopy: '© 2026 LUNA29 • PÁGINA PÚBLICA'
  },
  shared: {
    footer: 'Privado y local. Tus datos se quedan en tu dispositivo.',
    disclaimer: 'Luna29 no es un servicio médico, dispositivo médico, herramienta de diagnóstico ni proveedor de tratamiento. Luna29 no ofrece consejo médico, diagnóstico, monitorización ni atención de emergencia. Consulta siempre a un profesional sanitario autorizado.'
  }
};

const fr: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: 'Accueil',
    dashboard: "Aujourd'hui",
    cycle: 'Mon cycle',
    labs: 'Rapports santé',
    meds: 'Mon soutien',
    history: 'Mon parcours',
    bridge: 'Pont',
    creative: 'Créer',
    reflections: 'Note vocale',
    voiceFiles: 'Mes fichiers vocaux',
    relationships: 'Connexion',
    family: 'Saisons du foyer',
    profile: 'Profil',
    library: 'Connaissance',
    faq: 'Questions',
    contact: 'Contact',
    crisis: 'Salle Reset',
    admin: 'Admin',
    partner: 'PARTNER FAQ',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: 'Check-in',
    startCheckin: 'Commencer le check-in',
    talkToLuna: 'Parler à Luna29',
    dailyTip: 'Conseil du jour',
    bodyMap: 'Carte du corps',
  },
  checkinOverlay: {
    headline: 'Check-in quotidien',
    subheadline: 'Capturez votre état actuel.',
    save: 'Enregistrer',
    saveAndBridge: '+ Pont'
  },
  auth: {
    ...en.auth,
    recoveryHeadline: "Rétablir l'accès",
    recoveryText: 'Entrez votre email de compte et Luna29 préparera une récupération sécurisée.',
    recoveryCta: 'Envoyer le lien',
    headline: 'Autorisation Luna29',
    subheadline: 'Accès privé à votre espace Luna29 et aux systèmes admin.',
    google: 'Continuer avec Google',
    password: 'Mot de passe',
    hide: 'Masquer',
    show: 'Afficher',
    forgot: 'Mot de passe oublié ?',
    login: 'Se connecter',
    signup: 'Créer un compte',
    noAccount: 'Besoin d’un compte ?',
    hasAccount: 'Vous avez déjà un compte ?'
  },
  publicHome: {
    ...en.publicHome,
    tabs: { home: 'Accueil', map: 'Carte du corps', ritual: 'Chemin rituel' },
    pageTitle: { home: 'Accueil public', map: 'Carte du corps', ritual: 'Chemin rituel', privacy: 'Confidentialité' },
    signInUp: 'Connexion / Inscription',
    heroTitleA: 'Miroir',
    heroTitleB: 'Quotidien.',
    heroSubtitle: 'Luna29 est une entrée publique et apaisée: observez votre rythme, comprenez votre état et entrez dans votre espace privé quand vous êtes prête.',
    footerTagline: 'Accueil public pour orientation, rythme et réflexion.',
    footerCopy: '© 2026 LUNA29 • ACCUEIL PUBLIC'
  },
  shared: {
    footer: 'Privé et local. Vos données restent sur votre appareil.',
    disclaimer: 'Luna29 n est pas un service medical, un dispositif medical, un outil de diagnostic ni un service de traitement. Luna29 ne fournit pas de conseil medical, de diagnostic, de suivi clinique ni de soins d urgence. Consultez toujours un professionnel de sante autorise.'
  }
};

const de: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: 'Start',
    dashboard: 'Heute',
    cycle: 'Mein Zyklus',
    labs: 'Gesundheitsberichte',
    meds: 'Meine Unterstützung',
    history: 'Mein Weg',
    bridge: 'Brücke',
    creative: 'Kreativ',
    reflections: 'Sprachnotiz',
    voiceFiles: 'Meine Sprachdateien',
    relationships: 'Verbindung',
    family: 'Jahreszeiten Zuhause',
    profile: 'Profil',
    library: 'Wissen',
    faq: 'Fragen',
    contact: 'Kontakt',
    crisis: 'Reset Raum',
    admin: 'Admin',
    partner: 'PARTNER FAQ',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: 'Check-in',
    startCheckin: 'Check-in starten',
    talkToLuna: 'Mit Luna29 sprechen',
    dailyTip: 'Tageshinweis',
    bodyMap: 'Körperkarte',
  },
  checkinOverlay: {
    headline: 'Täglicher Check-in',
    subheadline: 'Erfasse deinen aktuellen Zustand.',
    save: 'Speichern',
    saveAndBridge: '+ Brücke'
  },
  auth: {
    ...en.auth,
    recoveryHeadline: 'Zugang wiederherstellen',
    recoveryText: 'Gib deine Konto-E-Mail ein und Luna29 bereitet einen sicheren Wiederherstellungsweg vor.',
    recoveryCta: 'Link senden',
    headline: 'Luna29 Anmeldung',
    subheadline: 'Privater Zugang zu deinem Luna29-Bereich und Admin-Systemen.',
    google: 'Mit Google fortfahren',
    password: 'Passwort',
    hide: 'Ausblenden',
    show: 'Anzeigen',
    forgot: 'Passwort vergessen?',
    login: 'Anmelden',
    signup: 'Konto erstellen',
    noAccount: 'Brauchst du ein Konto?',
    hasAccount: 'Hast du bereits ein Konto?'
  },
  publicHome: {
    ...en.publicHome,
    tabs: { home: 'Start', map: 'Körperkarte', ritual: 'Ritualpfad' },
    pageTitle: { home: 'Öffentliche Startseite', map: 'Körperkarte', ritual: 'Ritualpfad', privacy: 'Datenschutz' },
    signInUp: 'Anmelden / Registrieren',
    heroTitleA: 'Täglicher',
    heroTitleB: 'Spiegel.',
    heroSubtitle: 'Luna29 ist ein ruhiger öffentlicher Einstieg: beobachte deinen Rhythmus, verstehe deinen Zustand und betrete den privaten Bereich, wenn du bereit bist.',
    footerTagline: 'Öffentliche Startseite für Orientierung, Rhythmus und Reflexion.',
    footerCopy: '© 2026 LUNA29 • ÖFFENTLICHE STARTSEITE'
  },
  shared: {
    footer: 'Privat und lokal. Deine Daten bleiben auf deinem Gerät.',
    disclaimer: 'Luna29 ist kein medizinischer Dienst, kein Medizinprodukt, kein Diagnosetool und kein Behandlungsanbieter. Luna29 bietet keine medizinische Beratung, Diagnose, Ueberwachung oder Notfallversorgung. Wende dich immer an eine zugelassene medizinische Fachperson.'
  }
};

const zh: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: '主页',
    dashboard: '今日',
    cycle: '我的周期',
    labs: '健康报告',
    meds: '我的支持',
    history: '我的旅程',
    bridge: '桥接',
    creative: '创作',
    reflections: '语音笔记',
    voiceFiles: '我的语音文件',
    relationships: '连接',
    family: '家庭季节',
    profile: '个人资料',
    library: '知识库',
    faq: '常见问题',
    contact: '联系',
    crisis: '重置空间',
    admin: '管理',
    partner: 'PARTNER FAQ',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: '打卡',
    startCheckin: '开始打卡',
    talkToLuna: '与 Luna29 对话',
    dailyTip: '每日提示',
    bodyMap: '身体地图',
  },
  checkinOverlay: {
    headline: '每日打卡',
    subheadline: '记录你当前的状态。',
    save: '保存',
    saveAndBridge: '+ 桥接'
  },
  auth: {
    ...en.auth,
    recoveryHeadline: '恢复访问',
    recoveryText: '输入你的账号邮箱，Luna29 将准备安全的恢复路径。',
    recoveryCta: '发送恢复链接',
    headline: 'Luna29 登录',
    subheadline: '私密访问你的 Luna29 空间和管理系统。',
    google: '使用 Google 继续',
    password: '密码',
    hide: '隐藏',
    show: '显示',
    forgot: '忘记密码？',
    login: '登录',
    signup: '创建账户',
    noAccount: '需要账户？',
    hasAccount: '已有账户？'
  },
  publicHome: {
    ...en.publicHome,
    tabs: { home: '主页', map: '身体地图', ritual: '仪式路径' },
    pageTitle: { home: '公开首页', map: '身体地图', ritual: '仪式路径', privacy: '隐私' },
    signInUp: '登录 / 注册',
    heroTitleA: '每日',
    heroTitleB: '镜像。',
    heroSubtitle: 'Luna29 是平静的公开入口：观察你的节律，理解你的状态，并在准备好时进入私密空间。',
    footerTagline: '公开主页：用于定位、节律与反思。',
    footerCopy: '© 2026 LUNA29 • 公开主页'
  },
  shared: {
    footer: '私密且本地化。你的数据保留在你的设备上。',
    disclaimer: 'Luna29 不是医疗服务、医疗设备、诊断工具或治疗提供方。Luna29 不提供医疗建议、诊断、医疗监测或紧急护理。请始终咨询持证医疗专业人员。'
  }
};

const ja: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: 'ホーム',
    dashboard: '今日',
    cycle: '私のサイクル',
    labs: '健康レポート',
    meds: 'サポート',
    history: '私の記録',
    bridge: 'ブリッジ',
    creative: 'クリエイト',
    reflections: 'ボイスノート',
    voiceFiles: 'マイ音声ファイル',
    relationships: 'つながり',
    family: 'ホームシーズン',
    profile: 'プロフィール',
    library: '知識',
    faq: 'よくある質問',
    contact: '連絡先',
    crisis: 'リセットルーム',
    admin: '管理',
    partner: 'PARTNER FAQ',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: 'チェックイン',
    startCheckin: 'チェックイン開始',
    talkToLuna: 'Luna29と話す',
    dailyTip: '今日のヒント',
    bodyMap: 'ボディマップ',
  },
  checkinOverlay: {
    headline: 'デイリーチェックイン',
    subheadline: '今の状態を記録しましょう。',
    save: '保存',
    saveAndBridge: '+ ブリッジ'
  },
  auth: {
    ...en.auth,
    recoveryHeadline: 'アクセスを復元',
    recoveryText: 'アカウントのメールを入力すると、Luna29 が安全な復旧ルートを準備します。',
    recoveryCta: '復旧リンクを送信',
    headline: 'Luna29 認証',
    subheadline: 'Luna29ワークスペースと管理システムへのプライベートアクセス。',
    google: 'Googleで続行',
    password: 'パスワード',
    hide: '非表示',
    show: '表示',
    forgot: 'パスワードをお忘れですか？',
    login: 'サインイン',
    signup: 'アカウント作成',
    noAccount: 'アカウントが必要ですか？',
    hasAccount: 'すでにアカウントをお持ちですか？'
  },
  publicHome: {
    ...en.publicHome,
    tabs: { home: 'ホーム', map: 'ボディマップ', ritual: 'リチュアルパス' },
    pageTitle: { home: '公開ホーム', map: 'ボディマップ', ritual: 'リチュアルパス', privacy: 'プライバシー' },
    signInUp: 'サインイン / サインアップ',
    heroTitleA: '毎日の',
    heroTitleB: 'ミラー。',
    heroSubtitle: 'Luna29 は穏やかな公開入口です。リズムを観察し、状態を理解し、準備ができたらプライベート空間へ。',
    footerTagline: '公開ホーム: 方向づけ、リズム、リフレクションのために。',
    footerCopy: '© 2026 LUNA29 • 公開ホーム'
  },
  shared: {
    footer: 'プライベートかつローカル。データはあなたの端末に保存されます。',
    disclaimer: 'Luna29 は医療サービス、医療機器、診断ツール、治療提供者ではありません。Luna29 は医療助言、診断、医療モニタリング、緊急対応を提供しません。必ず有資格の医療専門家に相談してください。'
  }
};

const pt: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: 'Início',
    dashboard: 'Hoje',
    cycle: 'Meu ciclo',
    labs: 'Relatórios de saúde',
    meds: 'Meu suporte',
    history: 'Minha jornada',
    bridge: 'Ponte',
    creative: 'Criar',
    reflections: 'Nota de voz',
    voiceFiles: 'Meus arquivos de voz',
    relationships: 'Conexão',
    family: 'Estações da casa',
    profile: 'Perfil',
    library: 'Conhecimento',
    faq: 'Perguntas',
    contact: 'Contato',
    crisis: 'Sala Reset',
    admin: 'Admin',
    partner: 'PARTNER FAQ',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: 'Check-in',
    startCheckin: 'Iniciar check-in',
    talkToLuna: 'Falar com Luna29',
    dailyTip: 'Dica diária',
    bodyMap: 'Mapa corporal',
  },
  checkinOverlay: {
    headline: 'Check-in diário',
    subheadline: 'Registre seu estado atual.',
    save: 'Salvar',
    saveAndBridge: '+ Ponte'
  },
  auth: {
    ...en.auth,
    recoveryHeadline: 'Restaurar acesso',
    recoveryText: 'Digite o email da sua conta e a Luna29 preparará uma rota segura de recuperação.',
    recoveryCta: 'Enviar link',
    headline: 'Autorização Luna29',
    subheadline: 'Acesso privado ao seu espaço Luna29 e sistemas admin.',
    google: 'Continuar com Google',
    password: 'Senha',
    hide: 'Ocultar',
    show: 'Mostrar',
    forgot: 'Esqueceu a senha?',
    login: 'Entrar',
    signup: 'Criar conta',
    noAccount: 'Precisa de uma conta?',
    hasAccount: 'Já tem uma conta?'
  },
  publicHome: {
    ...en.publicHome,
    tabs: { home: 'Início', map: 'Mapa corporal', ritual: 'Caminho ritual' },
    pageTitle: { home: 'Página pública', map: 'Mapa corporal', ritual: 'Caminho ritual', privacy: 'Privacidade' },
    signInUp: 'Entrar / Cadastrar',
    heroTitleA: 'Espelho',
    heroTitleB: 'Diário.',
    heroSubtitle: 'Luna29 é uma entrada pública e calma: observe seu ritmo, entenda seu estado e entre no espaço privado quando estiver pronta.',
    footerTagline: 'Página pública para orientação, ritmo e reflexão.',
    footerCopy: '© 2026 LUNA29 • PÁGINA PÚBLICA'
  },
  shared: {
    footer: 'Privado e local. Seus dados ficam no seu dispositivo.',
    disclaimer: 'Luna29 nao e um servico medico, dispositivo medico, ferramenta diagnostica ou provedor de tratamento. Luna29 nao fornece aconselhamento medico, diagnostico, monitoramento clinico ou atendimento de emergencia. Consulte sempre um profissional de saude licenciado.'
  }
};

const ar: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: 'الرئيسية',
    dashboard: 'اليوم',
    cycle: 'دورتي',
    labs: 'تقارير الصحة',
    history: 'رحلتي',
    bridge: 'الجسر',
    reflections: 'ملاحظة صوتية',
    library: 'المعرفة',
    faq: 'أسئلة',
    contact: 'تواصل',
    support: 'الدعم',
    profile: 'الملف',
  },
  publicHome: {
    ...en.publicHome,
    signInUp: 'تسجيل الدخول / إنشاء حساب',
    heroTitleA: 'مرآة',
    heroTitleB: 'يومية.',
    heroSubtitle: 'مساحة هادئة لفهم إيقاعك الداخلي والدخول إلى منطقتك الخاصة عندما تكونين جاهزة.',
    footerTagline: 'الصفحة العامة للتوجيه والإيقاع والملاحظة.',
    footerCopy: `© 2026 ${BRAND_NAME} • PUBLIC HOME`,
  },
  auth: {
    ...en.auth,
    headline: `تسجيل الدخول إلى ${BRAND_NAME}`,
    subheadline: 'وصول خاص إلى مساحة العمل والأدوات الإدارية.',
    login: 'دخول',
    signup: 'إنشاء حساب',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: 'تسجيل',
    startCheckin: 'بدء التسجيل',
    talkToLuna: 'تحدثي مع Luna29',
    dailyTip: 'نصيحة اليوم',
    bodyMap: 'خريطة الجسم',
  },
  checkinOverlay: {
    headline: 'تسجيل يومي',
    subheadline: 'سجّلي حالتك الحالية.',
    save: 'حفظ',
    saveAndBridge: '+ الجسر',
  },
};

const he: TranslationSchema = {
  ...en,
  navigation: {
    ...en.navigation,
    home: 'בית',
    dashboard: 'היום',
    cycle: 'המחזור שלי',
    labs: 'דוחות בריאות',
    history: 'המסע שלי',
    bridge: 'הגשר',
    reflections: 'הערה קולית',
    library: 'ידע',
    faq: 'שאלות',
    contact: 'יצירת קשר',
    support: 'תמיכה',
    profile: 'פרופיל',
  },
  publicHome: {
    ...en.publicHome,
    signInUp: 'התחברות / הרשמה',
    heroTitleA: 'מראה',
    heroTitleB: 'יומית.',
    heroSubtitle: 'מרחב שקט להבנת הקצב הפנימי שלך ולכניסה לאזור הפרטי כשאת מוכנה.',
    footerTagline: 'דף ציבורי לכיוון, קצב והערה.',
    footerCopy: `© 2026 ${BRAND_NAME} • PUBLIC HOME`,
  },
  auth: {
    ...en.auth,
    headline: `התחברות ל-${BRAND_NAME}`,
    subheadline: 'גישה פרטית לסביבת העבודה ולמערכות הניהול.',
    login: 'כניסה',
    signup: 'יצירת חשבון',
  },
  dashboard: {
    ...en.dashboard,
    quickCheckin: 'צ׳ק-אין',
    startCheckin: 'התחלת צ׳ק-אין',
    talkToLuna: 'דברי עם Luna29',
    dailyTip: 'טיפ יומי',
    bodyMap: 'מפת גוף',
  },
  checkinOverlay: {
    headline: 'צ׳ק-אין יומי',
    subheadline: 'תעדי את המצב הנוכחי שלך.',
    save: 'שמירה',
    saveAndBridge: '+ הגשר',
  },
};

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  en,
  ru,
  uk,
  es,
  fr,
  de,
  zh,
  ja,
  pt,
  ar,
  he,
};

export interface FuelPhaseData {
  reason: string;
  avoid: string[];
  priorities: string[]; // Top 5 for quick view
  protocol: {
    micronutrients: string[];
    foods: string[];
    ritual: string[];
  };
}

export const FUEL_DATA: Record<CyclePhase, FuelPhaseData> = {
  [CyclePhase.MENSTRUAL]: {
    reason: "Your body is renewing itself. Focus on warmth and minerals.",
    avoid: ["Cold Drinks", "Too much Caffeine", "Sugar", "Salty Snacks"],
    priorities: ["Iron", "Zinc", "Warm Soups", "Vitamin C", "Magnesium"],
    protocol: {
      micronutrients: ["Iron", "Zinc", "Vitamin B12", "Magnesium", "Vitamin C"],
      foods: ["Lentils or Red Meat", "Spinach & Kale", "Beets", "Warm Broth", "Dark Chocolate", "Seaweed", "Beans"],
      ritual: ["Warm herbal tea", "Gentle warmth", "Slow breathing", "Stay hydrated"]
    }
  },
  [CyclePhase.FOLLICULAR]: {
    reason: "Energy is rising. Support your body with fiber and fresh foods.",
    avoid: ["Sugar", "Alcohol", "Heavy Fats", "Heavy Dairy"],
    priorities: ["B-Vitamins", "Fresh Veggies", "Probiotics", "Vitamin E", "Folate"],
    protocol: {
      micronutrients: ["B-Vitamins", "Folate", "Vitamin E", "CoQ10", "Selenium"],
      foods: ["Kimchi or Kraut", "Kefir", "Broccoli & Cauliflower", "Seeds", "Citrus", "Chicken or Fish", "Nuts"],
      ritual: ["Try something creative", "Lemon water", "Morning sun", "Start a new habit"]
    }
  },
  [CyclePhase.OVULATORY]: {
    reason: "Your energy is at its peak. Stay hydrated and eat healthy fats.",
    priorities: ["Omega-3", "Fiber", "Healthy Fats", "Hydration", "Vitamin A"],
    avoid: ["Too much Salt", "Fried Foods", "White Bread", "Too much Caffeine"],
    protocol: {
      micronutrients: ["Omega-3", "NAC", "Vitamin D3", "Vitamin A", "Antioxidants"],
      foods: ["Salmon", "Avocado", "Quinoa", "Berries", "Sprouts", "Peppers", "Flax Seeds", "Walnuts"],
      ritual: ["Dinner with friends", "Active movement", "Cool showers", "Talk and connect"]
    }
  },
  [CyclePhase.LUTEAL]: {
    reason: "Your body is slowing down. Focus on steady energy and calming minerals.",
    priorities: ["Magnesium", "Slow Carbs", "Calcium", "Vitamin B6", "Healthy Fats"],
    avoid: ["White Flour", "Alcohol", "Stimulants", "Late-night Snacks"],
    protocol: {
      micronutrients: ["Magnesium", "Vitamin B6", "Calcium", "Inositol", "GABA support"],
      foods: ["Roasted Veggies", "Oats", "Bananas", "Sesame Seeds", "Sunflower Seeds", "Tofu or Beef", "Spinach", "Peppermint Tea"],
      ritual: ["Early screen-off", "Journaling", "Warm baths", "Keep things simple"]
    }
  }
};

export const ARCHETYPES = {
  fog: { id: 'fog', name: 'The Fog', icon: '🌫️', color: '#94a3b8', description: 'Visibility is low. Your mind is focused on internal rest.' },
  radiance: { id: 'radiance', name: 'The Radiance', icon: '✨', color: '#f59e0b', description: 'Energy is high. You are at your most social and creative.' },
  storm: { id: 'storm', name: 'The Storm', icon: '⚡', color: '#6366f1', description: 'High sensitivity. You are very aware of everything around you.' },
  anchor: { id: 'anchor', name: 'The Anchor', icon: '⚓', color: '#10b981', description: 'Grounded and steady. A good time for deep work and rest.' }
};

export const INITIAL_HORMONES: HormoneData[] = [
  {
    id: 'estrogen',
    name: 'Estrogen (Estradiol)',
    icon: '✨',
    level: 65,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Verbal clarity', 'Skin glow', 'Bone density'],
    symptoms: ['Brain fog', 'Night sweats'],
    color: '#ff5a40',
    description: 'The master of vibrancy. Regulates dopamine and serotonin, making you more socially magnetic.',
    dailyImpact: 'Influences how clearly you speak and how fast you process information.',
    imbalanceFeeling: 'Low levels feel like a "fade-to-grey" of personality.',
    drivers: ['Phytoestrogens', 'Fiber', 'Liver health'],
    whatToTrack: ['Social ease', 'Cognitive speed'],
    generalDoctorQuestions: ["Is my pre-menstrual energy drop linked to estrogen withdrawal?"]
  },
  {
    id: 'progesterone',
    name: 'Progesterone',
    icon: '🌙',
    level: 40,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Sleep architecture', 'Internal warmth', 'GABA receptor sensitivity'],
    symptoms: ['Anxiety', 'Insomnia'],
    color: '#9d4edd',
    description: 'The "Biological Anchor". Calms the nervous system and supports pregnancy.',
    dailyImpact: 'Determines the quality of your deep sleep and your patience for noise.',
    imbalanceFeeling: 'Shortage feels like internal "fizzing" or background anxiety.',
    drivers: ['Zinc', 'Vitamin B6', 'Stress levels'],
    whatToTrack: ['Patience floor', 'Waking temperature'],
    generalDoctorQuestions: ["Are my sleep disturbances linked to my luteal progesterone peak?"]
  },
  {
    id: 'shbg',
    name: 'SHBG',
    icon: '📦',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Hormone transport', 'Bioavailable testosterone', 'Liver function'],
    symptoms: ['Low libido', 'Hair loss'],
    color: '#fb7185',
    description: 'Sex Hormone Binding Globulin. The traffic controller that carries hormones through your blood.',
    dailyImpact: 'High levels "lock up" your hormones, making them less available for use.',
    imbalanceFeeling: 'Even with "normal" hormone levels, high SHBG can make you feel low-drive.',
    drivers: ['Fiber', 'Insulin levels', 'Liver health'],
    whatToTrack: ['Libido baseline', 'Skin clarity'],
    generalDoctorQuestions: ["Does my SHBG level explain why my 'Free' hormone levels are low?"]
  },
  {
    id: 'lh',
    name: 'LH',
    icon: '⚡',
    level: 10,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Ovulation trigger', 'Progesterone production'],
    symptoms: ['Mid-cycle pain'],
    color: '#f43f5e',
    description: 'Luteinizing Hormone. The electrical spark that triggers the release of an egg.',
    dailyImpact: 'Peaks sharply 24-36 hours before ovulation.',
    imbalanceFeeling: 'A surge often brings a brief window of intense physical drive.',
    drivers: ['Pituitary health', 'PCOS baseline'],
    whatToTrack: ['Ovulation signs', 'Cervical fluid'],
    generalDoctorQuestions: ["Is my LH/FSH ratio indicative of PCOS?"]
  },
  {
    id: 'fsh',
    name: 'FSH',
    icon: '🥚',
    level: 15,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Egg maturation', 'Ovarian reserve signal'],
    symptoms: [],
    color: '#f472b6',
    description: 'Follicle-Stimulating Hormone. Signals the ovaries to prepare an egg.',
    dailyImpact: 'Highest in the first few days of your cycle.',
    imbalanceFeeling: 'Rising levels in your 40s signal the transition toward perimenopause.',
    drivers: ['Age', 'Ovarian health'],
    whatToTrack: ['Cycle length variance'],
    generalDoctorQuestions: ["Does my Day 3 FSH reflect my current ovarian capacity?"]
  },
  {
    id: 'amh',
    name: 'AMH',
    icon: '💎',
    level: 80,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Follicle count', 'Ovarian reserve'],
    symptoms: [],
    color: '#be185d',
    description: 'Anti-Müllerian Hormone. A marker of your remaining egg supply.',
    dailyImpact: 'Stable throughout the month, unlike other cycle hormones.',
    imbalanceFeeling: 'Not felt directly, but low levels can increase pressure regarding fertility timing.',
    drivers: ['Genetics', 'Age', 'Surgery'],
    whatToTrack: ['Annual changes in reserve'],
    generalDoctorQuestions: ["Is my AMH appropriate for my age?"]
  },
  {
    id: 'prolactin',
    name: 'Prolactin',
    icon: '🥛',
    level: 10,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Immune response', 'Breast tissue', 'Dopamine balance'],
    symptoms: ['Tender breasts', 'Headaches'],
    color: '#38bdf8',
    description: 'Manages stress response and immune modulation in non-lactating women.',
    dailyImpact: 'High levels can suppress ovulation and libido.',
    imbalanceFeeling: 'Excess feels like heavy, tender breasts and a total lack of drive.',
    drivers: ['Stress', 'Deep sleep', 'Nipple stimulation'],
    whatToTrack: ['Breast sensitivity', 'Period gaps'],
    generalDoctorQuestions: ["Could elevated Prolactin be suppressing my natural ovulation?"]
  },
  {
    id: 'thyroid',
    name: 'TSH',
    icon: '⚙️',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Metabolic pace', 'Body temp', 'Brain speed'],
    symptoms: ['Cold hands', 'Thinning hair'],
    color: '#0e7490',
    description: 'Thyroid Stimulating Hormone. The "thermostat" that tells your thyroid to work.',
    dailyImpact: 'Determines your general baseline energy and internal warmth.',
    imbalanceFeeling: 'High TSH (Hypo) feels like wading through water; low (Hyper) feels jittery.',
    drivers: ['Stress', 'Iodine', 'Sleep'],
    whatToTrack: ['Morning temp', 'Bowel regularity'],
    generalDoctorQuestions: ["Is my TSH optimal (around 1-2) or just 'in range'?"]
  },
  {
    id: 'freet3',
    name: 'Free T3',
    icon: '🔥',
    level: 45,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Active metabolism', 'Mood stability', 'Muscle preservation'],
    symptoms: ['Fatigue', 'Depression'],
    color: '#06b6d4',
    description: 'The active thyroid hormone. This is the actual "fuel" your cells use.',
    dailyImpact: 'Directly dictates how much energy you have for the day.',
    imbalanceFeeling: 'Low T3 feels like a flat battery that never fully charges.',
    drivers: ['Selenium', 'Liver conversion', 'Cortisol'],
    whatToTrack: ['Afternoon crashes', 'Mental clarity'],
    generalDoctorQuestions: ["Am I converting T4 into active T3 efficiently?"]
  },
  {
    id: 'freet4',
    name: 'Free T4',
    icon: '🔋',
    level: 55,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Thyroid storage', 'Systemic readiness'],
    symptoms: [],
    color: '#22d3ee',
    description: 'The storage form of thyroid hormone. Waiting to be converted into active T3.',
    dailyImpact: 'Your reserve tank for metabolic activity.',
    imbalanceFeeling: 'Low reserves mean you run out of stamina very quickly.',
    drivers: ['Iodine', 'Tyrosine'],
    whatToTrack: ['Overall stamina'],
    generalDoctorQuestions: ["Is my T4 level adequate for conversion?"]
  },
  {
    id: 'rt3',
    name: 'Reverse T3',
    icon: '🛡️',
    level: 20,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Metabolic braking', 'Hibernation signal'],
    symptoms: ['Unexplained weight gain'],
    color: '#64748b',
    description: 'The biological brake. Slows down metabolism during periods of extreme stress or illness.',
    dailyImpact: 'Prevents you from burning out by forcing the system to slow down.',
    imbalanceFeeling: 'High RT3 feels like your body is in "hibernation mode" despite eating well.',
    drivers: ['Chronic stress', 'Inflammation', 'Caloric restriction'],
    whatToTrack: ['Stress history vs energy levels'],
    generalDoctorQuestions: ["Is my Reverse T3 blocking my active T3 receptors?"]
  },
  {
    id: 'insulin',
    name: 'Insulin',
    icon: '⛽',
    level: 55,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Fuel storage', 'Inflammation', 'Ovarian health'],
    symptoms: ['Hanger', 'Afternoon slump'],
    color: '#10b981',
    description: 'The gatekeeper of glucose. Moves energy from your blood into your cells.',
    dailyImpact: 'Dictates how "stable" you feel after a meal.',
    imbalanceFeeling: 'Imbalance feels like "The Hanger" — extreme irritability when hungry.',
    drivers: ['Protein intake', 'Walking', 'Sleep quality'],
    whatToTrack: ['Energy crashes', 'Post-meal focus'],
    generalDoctorQuestions: ["Is my late-cycle sugar craving an insulin sensitivity shift?"]
  },
  {
    id: 'leptin',
    name: 'Leptin',
    icon: '🛑',
    level: 40,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Satiety', 'Energy expenditure'],
    symptoms: ['Constant hunger'],
    color: '#ef4444',
    description: 'The "Fullness" signal. Tells your brain you have enough energy stores.',
    dailyImpact: 'Manages when you feel "done" with eating.',
    imbalanceFeeling: 'Resistance feels like you never truly feel satisfied after meals.',
    drivers: ['Sleep duration', 'Body fat percentage'],
    whatToTrack: ['Hunger cycles'],
    generalDoctorQuestions: ["Could leptin resistance be masking my actual satiety signals?"]
  },
  {
    id: 'cortisol',
    name: 'Cortisol',
    icon: '🔋',
    level: 30,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'stress',
    affects: ['Blood sugar', 'Morning alertness', 'Inflammation'],
    symptoms: ['Wired but tired', 'Anxiety'],
    color: '#f59e0b',
    description: 'The survival signal. Prepares your body to handle external pressure.',
    dailyImpact: 'Gives you the morning "push" to wake up.',
    imbalanceFeeling: 'High feels like "wired but tired" at 11 PM; low feels like heavy limbs.',
    drivers: ['Caffeine', 'Deadlines', 'Intense HIIT'],
    whatToTrack: ['Waking ease', 'Midnight wakeups'],
    generalDoctorQuestions: ["Is my cortisol rhythm inverted?"]
  },
  {
    id: 'dheas',
    name: 'DHEA-S',
    icon: '🛡️',
    level: 60,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'stress',
    affects: ['Skin oil', 'Muscle mass', 'Immune health'],
    symptoms: ['Acne', 'Hair thinning'],
    color: '#8b5cf6',
    description: 'The anti-aging hormone. Buffers cortisol and acts as a building block for sex hormones.',
    dailyImpact: 'Your internal reserve of resilience and physical strength.',
    imbalanceFeeling: 'Low levels manifest as fragile health and slow recovery.',
    drivers: ['Sleep', 'Healthy fats'],
    whatToTrack: ['Skin clarity', 'Workout recovery'],
    generalDoctorQuestions: ["Does my DHEA-S level balance my cortisol load?"]
  },
  {
    id: 'pregnenolone',
    name: 'Pregnenolone',
    icon: '🧩',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'stress',
    affects: ['Brain function', 'Hormone precursor', 'Memory'],
    symptoms: ['Memory gaps', 'Emotional fragility'],
    color: '#a78bfa',
    description: 'The "Mother Hormone". The raw material for almost all other steroid hormones.',
    dailyImpact: 'Vital for cognitive "elasticity" and emotional resilience.',
    imbalanceFeeling: 'Shortage feels like you have no "raw materials" to handle life\'s demands.',
    drivers: ['Cholesterol intake', 'Low stress'],
    whatToTrack: ['Memory speed', 'Word finding'],
    generalDoctorQuestions: ["Is a 'Pregnenolone Steal' causing my sex hormone imbalance?"]
  },
  {
    id: 'testosterone',
    name: 'Testosterone',
    icon: '🏹',
    level: 45,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Libido', 'Ambition', 'Muscle tone'],
    symptoms: ['Loss of spark', 'Muscle loss'],
    color: '#ef4444',
    description: 'Drive and ambition. Vital for libido, goal-setting, and bone health.',
    dailyImpact: 'Fuels your motivation to "get things done" and physical stamina.',
    imbalanceFeeling: 'Low levels feel like you’ve lost your competitive edge or "spark."',
    drivers: ['Weight training', 'Zinc', 'Winning'],
    whatToTrack: ['Ambition peaks', 'Libido ease'],
    generalDoctorQuestions: ["Does my testosterone level align with my reported loss of drive?"]
  },
  {
    id: 'ferritin',
    name: 'Ferritin',
    icon: '🧲',
    level: 30,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Oxygen transport', 'Hair growth', 'Thyroid conversion'],
    symptoms: ['Extreme fatigue', 'Pale skin'],
    color: '#991b1b',
    description: 'Iron storage. Critical for transporting oxygen to your brain and cells.',
    dailyImpact: 'Determines if you have "gas in the tank" for exercise and focus.',
    imbalanceFeeling: 'Low feels like leaden legs and being out of breath from minor stairs.',
    drivers: ['Red meat', 'Vitamin C', 'Period blood loss'],
    whatToTrack: ['Breath ease', 'Physical endurance'],
    generalDoctorQuestions: ["Is my ferritin above 50? (Optimal for hair and energy)"]
  },
  {
    id: 'vitamind',
    name: 'Vitamin D',
    icon: '☀️',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Immunity', 'Mood', 'Hormone production'],
    symptoms: ['SAD', 'Bone aches'],
    color: '#fbbf24',
    description: 'A pro-hormone. Essential for the production of all other hormones.',
    dailyImpact: 'Sets the foundation for your immune defense and general mood.',
    imbalanceFeeling: 'Deficiency feels like a "heavy cloud" of low mood and frequent colds.',
    drivers: ['Sunlight', 'Supplements'],
    whatToTrack: ['Seasonal mood'],
    generalDoctorQuestions: ["Is my Vitamin D level sufficient to support my hormone synthesis?"]
  },
  {
    id: 'vitaminb12',
    name: 'Vitamin B12',
    icon: '🍄',
    level: 60,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Nerve health', 'Energy production', 'Red blood cells'],
    symptoms: ['Tingling', 'Fatigue'],
    color: '#dc2626',
    description: 'Essential for DNA synthesis and neurological function.',
    dailyImpact: 'Determines the sharpness of your nervous system and daily focus.',
    imbalanceFeeling: 'Deficiency feels like "unexplained static" in your brain and heavy limbs.',
    drivers: ['Animal products', 'Gut absorption'],
    whatToTrack: ['Numbness/Tingling', 'Mental endurance'],
    generalDoctorQuestions: ["Is my B12 level optimal for my energy needs?"]
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    icon: '🧊',
    level: 60,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Muscle relaxation', 'Nerve function', 'Cramp prevention'],
    symptoms: ['Muscle twitches', 'Chocolate cravings'],
    color: '#34d399',
    description: 'The "Spark Plug" of 300+ biochemical reactions. Helps the body relax.',
    dailyImpact: 'Reduces the intensity of period cramps and luteal anxiety.',
    imbalanceFeeling: 'Shortage feels like physical tension, eye twitches, and "busy" legs at night.',
    drivers: ['Stress (burns Mg)', 'Epsom baths', 'Dark chocolate'],
    whatToTrack: ['Cramp intensity', 'Sleep onset speed'],
    generalDoctorQuestions: ["Could my nighttime anxiety be linked to magnesium deficiency?"]
  },
  {
    id: 'zinc',
    name: 'Zinc',
    icon: '🛡️',
    level: 40,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Immune strength', 'Progesterone support', 'Skin healing'],
    symptoms: ['White spots on nails', 'Frequent colds'],
    color: '#4ade80',
    description: 'Essential for hormone synthesis and a healthy immune system.',
    dailyImpact: 'Crucial for a healthy ovulation and strong luteal phase.',
    imbalanceFeeling: 'Low zinc can dull your sense of taste and make your skin break out easily.',
    drivers: ['Oysters', 'Pumpkin seeds', 'B6 intake'],
    whatToTrack: ['Skin recovery speed'],
    generalDoctorQuestions: ["Do I have enough zinc to support my progesterone production?"]
  },
  {
    id: 'omega3',
    name: 'Omega-3 (DHA/EPA)',
    icon: '🐟',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Brain health', 'Inflammation control', 'Hormone sensitivity'],
    symptoms: ['Dry skin', 'Mood swings'],
    color: '#0891b2',
    description: 'Critical fatty acids that build the membranes of every cell in your body.',
    dailyImpact: 'Buffers your brain against stress and reduces inflammatory pain.',
    imbalanceFeeling: 'Shortage feels like "dry" mood and high sensitivity to physical pain.',
    drivers: ['Fatty fish', 'Algae', 'Supplementation'],
    whatToTrack: ['Skin hydration', 'Joint comfort'],
    generalDoctorQuestions: ["Is my Omega-3 index high enough to support brain health?"]
  },
  {
    id: 'oxytocin',
    name: 'Oxytocin',
    icon: '🫂',
    level: 70,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Trust', 'Social bonding', 'Stress reduction'],
    symptoms: ['Isolation', 'Lack of empathy'],
    color: '#ec4899',
    description: 'The "Love Hormone." Crucial for bonding, trust, and managing social stress.',
    dailyImpact: 'Determines how much connection you need to feel safe.',
    imbalanceFeeling: 'Shortage feels like social isolation or a coldness toward loved ones.',
    drivers: ['Physical touch', 'Petting animals', 'Meaningful conversation'],
    whatToTrack: ['Social hunger'],
    generalDoctorQuestions: ["How does oxytocin modulate my pre-menstrual social withdrawal?"]
  },
  {
    id: 'serotonin',
    name: 'Serotonin',
    icon: '🌈',
    level: 55,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Mood', 'Appetite', 'Sleep cycle'],
    symptoms: ['Depression', 'Carb cravings'],
    color: '#fb923c',
    description: 'The "Happiness Chemical". Influences your general sense of well-being.',
    dailyImpact: 'Lowers during the luteal phase, often leading to PMDD symptoms.',
    imbalanceFeeling: 'Low serotonin feels like life has lost its color and flavor.',
    drivers: ['Tryptophan', 'Morning sunlight', 'Gut health'],
    whatToTrack: ['Mood stability', 'Sugar cravings'],
    generalDoctorQuestions: ["Is my luteal mood drop related to serotonin sensitivity?"]
  },
  {
    id: 'dopamine',
    name: 'Dopamine',
    icon: '🚀',
    level: 60,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Focus', 'Motivation', 'Reward system'],
    symptoms: ['Procrastination', 'Apathy'],
    color: '#facc15',
    description: 'The "Drive Signal". Motivates you to pursue goals and rewards.',
    dailyImpact: 'Determines your ability to focus on complex tasks.',
    imbalanceFeeling: 'Shortage feels like you are "searching" for excitement or can\'t start a task.',
    drivers: ['Goal achievement', 'Protein', 'Novelty'],
    whatToTrack: ['Focus duration', 'Motivation peaks'],
    generalDoctorQuestions: ["Does my cycle affect my executive function via dopamine?"]
  },
  {
    id: 'gaba',
    name: 'GABA',
    icon: '🧘',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Calmness', 'Inhibition control', 'Anxiety reduction'],
    symptoms: ['Panic', 'Racing thoughts'],
    color: '#818cf8',
    description: 'The brain\'s primary inhibitory neurotransmitter. It tells your brain to slow down.',
    dailyImpact: 'Determines how easily you can "switch off" at night.',
    imbalanceFeeling: 'Low GABA feels like your brain has no "off switch," leading to racing thoughts.',
    drivers: ['Progesterone', 'Meditation', 'Fermented foods'],
    whatToTrack: ['Nighttime mind racing'],
    generalDoctorQuestions: ["How does my progesterone level influence my GABA receptors?"]
  },
  {
    id: 'melatonin',
    name: 'Melatonin',
    icon: '🌌',
    level: 20,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Sleep timing', 'Ovarian health', 'Cellular repair'],
    symptoms: ['Insomnia', 'Jet lag'],
    color: '#1e1b4b',
    description: 'The "Sleep Master." A powerful antioxidant that also protects your ovaries.',
    dailyImpact: 'Controls the timing of your sleep and your cellular cleanup at night.',
    imbalanceFeeling: 'Shortage feels like being "stuck" between sleep and wakefulness.',
    drivers: ['Evening darkness', 'Morning sun'],
    whatToTrack: ['Falling asleep speed'],
    generalDoctorQuestions: ["Is my melatonin production sufficient for deep ovarian recovery?"]
  }
];

export const PHASE_INFO = {
  [CyclePhase.MENSTRUAL]: {
    range: [1, 5],
    description: 'Restoration Season',
    feeling: 'A time for quiet and renewal.',
    expect: 'Your body is resetting. It is natural to feel more private.',
    sensitivity: { mood: 'Quiet', energy: 'Soft', social: 'Selective' }
  },
  [CyclePhase.FOLLICULAR]: {
    range: [6, 12],
    description: 'Building Season',
    feeling: 'Your energy is starting to climb.',
    expect: 'New ideas and curiosity often return.',
    sensitivity: { mood: 'Bright', energy: 'Rising', social: 'Open' }
  },
  [CyclePhase.OVULATORY]: {
    range: [13, 15],
    description: 'Vibrancy Season',
    feeling: 'Your internal brightness is at its peak.',
    expect: 'Social energy and verbal clarity are high.',
    sensitivity: { mood: 'Radiant', energy: 'Full', social: 'Outgoing' }
  },
  [CyclePhase.LUTEAL]: {
    range: [16, 28],
    description: 'Nesting Season',
    feeling: 'Turning inward to find comfort.',
    expect: 'Environmental noise feels louder. Patience is lower.',
    sensitivity: { mood: 'Reflective', energy: 'Grounding', social: 'Guarded' }
  }
};
