import { Language, LangCopy, getLang } from '../constants';

export type MemberIntroPageId =
  | 'my_day'
  | 'voice_note'
  | 'voice_files'
  | 'monthly_reflection'
  | 'insights_paywall'
  | 'bridge'
  | 'relationships'
  | 'creative'
  | 'meds'
  | 'profile'
  | 'labs'
  | 'history';

export type MemberPageIntroCopy = {
  eyebrow: string;
  title: string;
  body: string;
  tips: string[];
};

const INTROS: LangCopy<Record<MemberIntroPageId, MemberPageIntroCopy>> = {
  en: {
    my_day: {
      eyebrow: 'Daily rhythm',
      title: 'My Day',
      body: 'A single-day canvas: how your body, sleep, and cycle phase read together. Use it as orientation — not a scorecard.',
      tips: ['Check in on Today first if numbers feel empty.', 'Export or share only when the day feels worth remembering.', 'Evening line is a soft closure, not homework.'],
    },
    voice_note: {
      eyebrow: 'Voice reflection',
      title: 'Voice note',
      body: 'Speak before you fix. Luna29 listens, structures your words, and answers with calm focus — without diagnosing or commanding.',
      tips: ['One minute is enough; depth beats length.', 'Name the feeling, not the verdict.', 'Save to My Voice Files when a phrase should return.'],
    },
    voice_files: {
      eyebrow: 'Voice archive',
      title: 'Voice files',
      body: 'Your spoken reflections over time — tagged, searchable, private. Patterns emerge when you review weeks, not minutes.',
      tips: ['Favorite clips you want to revisit before Bridge.', 'Filter by date when preparing for a clinician visit.', 'Tags help separate work stress from cycle weeks.'],
    },
    monthly_reflection: {
      eyebrow: 'Seasonal mirror',
      title: 'Monthly note',
      body: 'A gentle monthly note — what repeated, what softened, what asked for rest. Share only if it helps someone understand you.',
      tips: ['Needs a few check-ins across the month to feel rich.', 'Treat insights as hypotheses, not facts.', 'Pair with Rhythm Calendar for context.'],
    },
    insights_paywall: {
      eyebrow: 'Deeper patterns',
      title: 'Insights',
      body: 'Paid insights connect daily signals into longer arcs: sleep load, cycle edges, voice themes. Still observation — never medical advice.',
      tips: ['Trial lets you feel the rhythm before committing.', 'Monthly notes and Bridge depth expand with Insights.', 'Cancel anytime; your local data stays yours.'],
    },
    bridge: {
      eyebrow: 'Clear communication',
      title: 'Bridge',
      body: 'Turn inner weather into words someone else can receive. Three short answers → a letter you can edit before sending.',
      tips: ['Answer honestly, not performatively.', 'Edit every line — AI drafts, you decide.', 'Free tier has weekly limits; premium expands flow.'],
    },
    relationships: {
      eyebrow: 'Partner note',
      title: 'Relationships',
      body: 'Craft a message aligned with your capacity today: intent, tone, and boundary. Built for partners who want to support without pressure.',
      tips: ['Name your partner once — Luna29 remembers locally.', 'Soft boundary ≠ silence; it protects connection.', 'Read aloud before you send.'],
    },
    creative: {
      eyebrow: 'State visualizer',
      title: 'Create',
      body: 'Express state as image or motion when words lag behind. A creative ritual — not content for performance.',
      tips: ['Describe sensation + color + pace.', 'Requires API key for generation locally.', 'Save outputs that feel like truth, not art.'],
    },
    meds: {
      eyebrow: 'Medication note',
      title: 'Medication note',
      body: 'Log medications and supportive items you track. Luna29 notes timing alongside your rhythm — it does not prescribe or adjust doses.',
      tips: ['Name + dose is enough; notes optional.', 'Remove entries when plans change.', 'Bring this list to visits — export from Profile if needed.'],
    },
    profile: {
      eyebrow: 'Settings',
      title: 'Settings',
      body: 'Account, billing, privacy, memory, and support. Personal Health Profile is the clinical section on this page — separate from account settings.',
      tips: ['Use the Settings directory to jump to Billing or Support.', 'Personal Health Profile is clinical — not account settings.', 'Sync Account after meaningful baseline changes.'],
    },
    labs: {
      eyebrow: 'Health reports',
      title: 'Health Reports',
      body: 'Upload labs, add values manually, and build a calm report for yourself or a clinician — observation only, not diagnosis.',
      tips: ['Save a draft before you analyze.', 'Check conflicts when the same marker appears twice.', 'Share only what helps the conversation.'],
    },
    history: {
      eyebrow: 'Your story',
      title: 'My Journey',
      body: 'A timeline of check-ins, voice themes, and cycle edges — patterns over days, not verdicts about who you are.',
      tips: ['Look for repeats across weeks, not one bad day.', 'Pair with Rhythm Calendar for context.', 'Export before a visit if it helps.'],
    },
  },
  ru: {
    my_day: {
      eyebrow: 'Дневной ритм',
      title: 'Мой день',
      body: 'Холст одного дня: как тело, сон и фаза цикла складываются вместе. Это ориентация — не оценка.',
      tips: ['Сначала check-in на Today, если данных мало.', 'Экспорт — когда день стоит запомнить.', 'Вечерняя строка — мягкое завершение, не задание.'],
    },
    voice_note: {
      eyebrow: 'Голосовая рефлексия',
      title: 'Голосовая заметка',
      body: 'Сначала проговорите — потом «исправляйте». Luna29 слушает, структурирует и отвечает спокойно — без диагнозов.',
      tips: ['Минуты достаточно.', 'Назовите чувство, не приговор.', 'Сохраняйте в My Voice Files важные фразы.'],
    },
    voice_files: {
      eyebrow: 'Голосовой архив',
      title: 'Голосовой архив',
      body: 'Ваши голосовые заметки во времени — с тегами и поиском. Паттерны видны на неделях, не за минуты.',
      tips: ['Отмечайте избранное перед Bridge.', 'Фильтр по дате — перед визитом к врачу.', 'Теги отделяют работу от цикла.'],
    },
    monthly_reflection: {
      eyebrow: 'Месячное зеркало',
      title: 'Месячная заметка',
      body: 'Мягкая месячная заметка — что повторялось, что смягчилось, что просило отдых.',
      tips: ['Нужны check-in’ы в течение месяца.', 'Инсайты — гипотезы, не диагноз.', 'Смотрите вместе с Rhythm Calendar.'],
    },
    insights_paywall: {
      eyebrow: 'Глубже паттерны',
      title: 'Инсайты',
      body: 'Платные инсайты связывают сигналы в длинные дуги: сон, края цикла, темы голоса. Наблюдение, не медицина.',
      tips: ['Trial — почувствовать ритм до оплаты.', 'Расширяются monthly notes и Bridge.', 'Отмена в любой момент.'],
    },
    bridge: {
      eyebrow: 'Ясная коммуникация',
      title: 'Мост',
      body: 'Переведите внутреннюю погоду в слова, которые другой может принять. Три ответа → письмо для редактирования.',
      tips: ['Честно, не для показа.', 'Редактируйте каждую строку.', 'На free — лимит в неделю.'],
    },
    relationships: {
      eyebrow: 'Записка партнёру',
      title: 'Relationships',
      body: 'Сообщение под ваш ресурс сегодня: намерение, тон, граница. Для поддержки без давления.',
      tips: ['Имя партнёра сохраняется локально.', 'Мягкая граница ≠ молчание.', 'Прочитайте вслух перед отправкой.'],
    },
    creative: {
      eyebrow: 'Визуализатор состояния',
      title: 'Create',
      body: 'Когда слов мало — цвет и движение. Творческий ритуал, не контент для оценки.',
      tips: ['Ощущение + цвет + темп.', 'Нужен API key локально.', 'Сохраняйте правду, не «красоту».'],
    },
    meds: {
      eyebrow: 'Заметка о препарате',
      title: 'Заметка о препаратах',
      body: 'Препараты и поддерживающие позиции. Luna29 видит ритм рядом — не назначает и не меняет дозы.',
      tips: ['Название + доза достаточно.', 'Удаляйте при смене плана.', 'Список для визитов.'],
    },
    profile: {
      eyebrow: 'Линза идентичности',
      title: 'Профиль',
      body: 'Четыре столпа задают, как Luna29 читает ритм. Данные на устройстве.',
      tips: ['Sync Profile после изменений.', 'Billing отдельно от клиники.', 'Единицы — только отображение.'],
    },
    labs: {
      eyebrow: 'Отчёты здоровья',
      title: 'Health Reports',
      body: 'Загрузите анализы, добавьте значения и соберите спокойный отчёт — наблюдение, не диагноз.',
      tips: ['Сохраните черновик перед анализом.', 'Проверяйте конфликты дубликатов.', 'Делитесь только тем, что помогает разговору.'],
    },
    history: {
      eyebrow: 'Ваша история',
      title: 'My Journey',
      body: 'Хронология check-in, голосовых тем и краёв цикла — паттерны по дням, не приговор.',
      tips: ['Смотрите повторы по неделям.', 'С Rhythm Calendar — для контекста.', 'Экспорт перед визитом при необходимости.'],
    },
  },
  uk: {
    my_day: {
      eyebrow: 'Денний ритм',
      title: 'Мій день',
      body: 'Полотно одного дня: тіло, сон і фаза циклу разом. Орієнтація — не оцінка.',
      tips: ['Спочатку check-in на Today.', 'Експорт — коли день вартий памʼяті.', 'Вечірній рядок — мʼяке завершення.'],
    },
    voice_note: {
      eyebrow: 'Голосова рефлексія',
      title: 'Голосова нотатка',
      body: 'Спочатку проговоріть — потім виправляйте. Luna29 слухає і відповідає спокійно.',
      tips: ['Хвилини достатньо.', 'Назвіть почуття.', 'Зберігайте в My Voice Files.'],
    },
    voice_files: {
      eyebrow: 'Голосовий архів',
      title: 'Голосовий архів',
      body: 'Голосові нотатки в часі — з тегами. Патерни видно на тижнях.',
      tips: ['Обране перед Bridge.', 'Фільтр по даті.', 'Теги для роботи/циклу.'],
    },
    monthly_reflection: {
      eyebrow: 'Місячне дзеркало',
      title: 'Місячна нотатка',
      body: 'Мʼяка місячна нотатка — повтори, помʼякшення, відпочинок.',
      tips: ['Потрібні check-in протягом місяця.', 'Інсайти — гіпотези.', 'Разом з Rhythm Calendar.'],
    },
    insights_paywall: {
      eyebrow: 'Глибші патерни',
      title: 'Інсайти',
      body: 'Платні інсайти зʼєднують сигнали в довгі дуги. Спостереження, не медицина.',
      tips: ['Trial перед оплатою.', 'Monthly + Bridge глибше.', 'Скасування будь-коли.'],
    },
    bridge: {
      eyebrow: 'Ясна комунікація',
      title: 'Міст',
      body: 'Внутрішня погода → слова для іншого. Три відповіді → лист для редагування.',
      tips: ['Чесно.', 'Редагуйте кожен рядок.', 'Free — ліміт на тиждень.'],
    },
    relationships: {
      eyebrow: 'Нотатка партнеру',
      title: 'Relationships',
      body: 'Повідомлення під ресурс сьогодні: намір, тон, межа.',
      tips: ['Імʼя локально.', 'Мʼяка межа ≠ мовчання.', 'Прочитайте вголос.'],
    },
    creative: {
      eyebrow: 'Візуалізатор',
      title: 'Create',
      body: 'Колір і рух, коли слів мало.',
      tips: ['Відчуття + колір.', 'API key локально.', 'Правда, не «краса».'],
    },
    meds: {
      eyebrow: 'Нотатка про препарат',
      title: 'Нотатка про препарати',
      body: 'Препарати поруч із ритмом — без призначень.',
      tips: ['Назва + доза.', 'Видаляйте при зміні.', 'Для візитів.'],
    },
    profile: {
      eyebrow: 'Профіль',
      title: 'Профіль',
      body: 'Чотири столпи задають читання ритму. Дані на пристрої.',
      tips: ['Sync після змін.', 'Billing окремо.', 'Одиниці — відображення.'],
    },
    labs: {
      eyebrow: 'Звіти здоровʼя',
      title: 'Health Reports',
      body: 'Завантажте аналізи, додайте значення — спокійний звіт, не діагноз.',
      tips: ['Збережіть чернетку.', 'Перевіряйте конфлікти.', 'Діліться лише корисним.'],
    },
    history: {
      eyebrow: 'Ваша історія',
      title: 'My Journey',
      body: 'Хронологія check-in і тем — патерни по днях.',
      tips: ['Повтори по тижнях.', 'Разом з Rhythm Calendar.', 'Експорт перед візитом.'],
    },
  },
  es: {
    my_day: {
      eyebrow: 'Mi día',
      title: 'Mi día',
      body: 'Luna29 member space — calm orientation for Mi día. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_note: {
      eyebrow: 'Nota de voz',
      title: 'Nota de voz',
      body: 'Luna29 member space — calm orientation for Nota de voz. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_files: {
      eyebrow: 'Archivos de voz',
      title: 'Archivos de voz',
      body: 'Luna29 member space — calm orientation for Archivos de voz. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    monthly_reflection: {
      eyebrow: 'Nota mensual',
      title: 'Nota mensual',
      body: 'Luna29 member space — calm orientation for Nota mensual. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    insights_paywall: {
      eyebrow: 'Insights',
      title: 'Insights',
      body: 'Luna29 member space — calm orientation for Insights. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    bridge: {
      eyebrow: 'Puente',
      title: 'Puente',
      body: 'Luna29 member space — calm orientation for Puente. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    relationships: {
      eyebrow: 'Relaciones',
      title: 'Relaciones',
      body: 'Luna29 member space — calm orientation for Relaciones. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    creative: {
      eyebrow: 'Crear',
      title: 'Crear',
      body: 'Luna29 member space — calm orientation for Crear. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    meds: {
      eyebrow: 'Nota de medicación',
      title: 'Nota de medicación',
      body: 'Luna29 member space — calm orientation for Nota de medicación. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    profile: {
      eyebrow: 'Perfil',
      title: 'Perfil',
      body: 'Luna29 member space — calm orientation for Perfil. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    labs: {
      eyebrow: 'Informes de salud',
      title: 'Informes de salud',
      body: 'Luna29 member space — calm orientation for Informes de salud. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    history: {
      eyebrow: 'Mi recorrido',
      title: 'Mi recorrido',
      body: 'Luna29 member space — calm orientation for Mi recorrido. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
  },
  fr: {
    my_day: {
      eyebrow: 'Ma journée',
      title: 'Ma journée',
      body: 'Luna29 member space — calm orientation for Ma journée. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_note: {
      eyebrow: 'Note vocale',
      title: 'Note vocale',
      body: 'Luna29 member space — calm orientation for Note vocale. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_files: {
      eyebrow: 'Fichiers vocaux',
      title: 'Fichiers vocaux',
      body: 'Luna29 member space — calm orientation for Fichiers vocaux. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    monthly_reflection: {
      eyebrow: 'Note mensuelle',
      title: 'Note mensuelle',
      body: 'Luna29 member space — calm orientation for Note mensuelle. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    insights_paywall: {
      eyebrow: 'Insights',
      title: 'Insights',
      body: 'Luna29 member space — calm orientation for Insights. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    bridge: {
      eyebrow: 'Pont',
      title: 'Pont',
      body: 'Luna29 member space — calm orientation for Pont. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    relationships: {
      eyebrow: 'Relations',
      title: 'Relations',
      body: 'Luna29 member space — calm orientation for Relations. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    creative: {
      eyebrow: 'Créer',
      title: 'Créer',
      body: 'Luna29 member space — calm orientation for Créer. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    meds: {
      eyebrow: 'Note médicaments',
      title: 'Note médicaments',
      body: 'Luna29 member space — calm orientation for Note médicaments. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    profile: {
      eyebrow: 'Profil',
      title: 'Profil',
      body: 'Luna29 member space — calm orientation for Profil. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    labs: {
      eyebrow: 'Rapports santé',
      title: 'Rapports santé',
      body: 'Luna29 member space — calm orientation for Rapports santé. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    history: {
      eyebrow: 'Mon parcours',
      title: 'Mon parcours',
      body: 'Luna29 member space — calm orientation for Mon parcours. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
  },
  de: {
    my_day: {
      eyebrow: 'Mein Tag',
      title: 'Mein Tag',
      body: 'Luna29 member space — calm orientation for Mein Tag. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_note: {
      eyebrow: 'Sprachnotiz',
      title: 'Sprachnotiz',
      body: 'Luna29 member space — calm orientation for Sprachnotiz. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_files: {
      eyebrow: 'Sprachdateien',
      title: 'Sprachdateien',
      body: 'Luna29 member space — calm orientation for Sprachdateien. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    monthly_reflection: {
      eyebrow: 'Monatsnotiz',
      title: 'Monatsnotiz',
      body: 'Luna29 member space — calm orientation for Monatsnotiz. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    insights_paywall: {
      eyebrow: 'Insights',
      title: 'Insights',
      body: 'Luna29 member space — calm orientation for Insights. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    bridge: {
      eyebrow: 'Brücke',
      title: 'Brücke',
      body: 'Luna29 member space — calm orientation for Brücke. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    relationships: {
      eyebrow: 'Beziehungen',
      title: 'Beziehungen',
      body: 'Luna29 member space — calm orientation for Beziehungen. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    creative: {
      eyebrow: 'Erstellen',
      title: 'Erstellen',
      body: 'Luna29 member space — calm orientation for Erstellen. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    meds: {
      eyebrow: 'Medikamentennotiz',
      title: 'Medikamentennotiz',
      body: 'Luna29 member space — calm orientation for Medikamentennotiz. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    profile: {
      eyebrow: 'Profil',
      title: 'Profil',
      body: 'Luna29 member space — calm orientation for Profil. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    labs: {
      eyebrow: 'Gesundheitsberichte',
      title: 'Gesundheitsberichte',
      body: 'Luna29 member space — calm orientation for Gesundheitsberichte. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    history: {
      eyebrow: 'Meine Reise',
      title: 'Meine Reise',
      body: 'Luna29 member space — calm orientation for Meine Reise. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
  },
  zh: {
    my_day: {
      eyebrow: '我的一天',
      title: '我的一天',
      body: 'Luna29 member space — calm orientation for 我的一天. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_note: {
      eyebrow: '语音笔记',
      title: '语音笔记',
      body: 'Luna29 member space — calm orientation for 语音笔记. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_files: {
      eyebrow: '语音文件',
      title: '语音文件',
      body: 'Luna29 member space — calm orientation for 语音文件. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    monthly_reflection: {
      eyebrow: '月度笔记',
      title: '月度笔记',
      body: 'Luna29 member space — calm orientation for 月度笔记. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    insights_paywall: {
      eyebrow: '洞察',
      title: '洞察',
      body: 'Luna29 member space — calm orientation for 洞察. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    bridge: {
      eyebrow: '连接桥',
      title: '连接桥',
      body: 'Luna29 member space — calm orientation for 连接桥. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    relationships: {
      eyebrow: '关系',
      title: '关系',
      body: 'Luna29 member space — calm orientation for 关系. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    creative: {
      eyebrow: '创作',
      title: '创作',
      body: 'Luna29 member space — calm orientation for 创作. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    meds: {
      eyebrow: '用药笔记',
      title: '用药笔记',
      body: 'Luna29 member space — calm orientation for 用药笔记. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    profile: {
      eyebrow: '个人资料',
      title: '个人资料',
      body: 'Luna29 member space — calm orientation for 个人资料. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    labs: {
      eyebrow: '健康报告',
      title: '健康报告',
      body: 'Luna29 member space — calm orientation for 健康报告. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    history: {
      eyebrow: '我的旅程',
      title: '我的旅程',
      body: 'Luna29 member space — calm orientation for 我的旅程. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
  },
  ja: {
    my_day: {
      eyebrow: 'マイデイ',
      title: 'マイデイ',
      body: 'Luna29 member space — calm orientation for マイデイ. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_note: {
      eyebrow: 'ボイスノート',
      title: 'ボイスノート',
      body: 'Luna29 member space — calm orientation for ボイスノート. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_files: {
      eyebrow: 'ボイスファイル',
      title: 'ボイスファイル',
      body: 'Luna29 member space — calm orientation for ボイスファイル. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    monthly_reflection: {
      eyebrow: '月次ノート',
      title: '月次ノート',
      body: 'Luna29 member space — calm orientation for 月次ノート. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    insights_paywall: {
      eyebrow: 'インサイト',
      title: 'インサイト',
      body: 'Luna29 member space — calm orientation for インサイト. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    bridge: {
      eyebrow: 'ブリッジ',
      title: 'ブリッジ',
      body: 'Luna29 member space — calm orientation for ブリッジ. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    relationships: {
      eyebrow: '関係',
      title: '関係',
      body: 'Luna29 member space — calm orientation for 関係. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    creative: {
      eyebrow: '作成',
      title: '作成',
      body: 'Luna29 member space — calm orientation for 作成. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    meds: {
      eyebrow: '服薬メモ',
      title: '服薬メモ',
      body: 'Luna29 member space — calm orientation for 服薬メモ. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    profile: {
      eyebrow: 'プロフィール',
      title: 'プロフィール',
      body: 'Luna29 member space — calm orientation for プロフィール. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    labs: {
      eyebrow: '健康レポート',
      title: '健康レポート',
      body: 'Luna29 member space — calm orientation for 健康レポート. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    history: {
      eyebrow: 'マイジャーニー',
      title: 'マイジャーニー',
      body: 'Luna29 member space — calm orientation for マイジャーニー. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
  },
  pt: {
    my_day: {
      eyebrow: 'Meu dia',
      title: 'Meu dia',
      body: 'Luna29 member space — calm orientation for Meu dia. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_note: {
      eyebrow: 'Nota de voz',
      title: 'Nota de voz',
      body: 'Luna29 member space — calm orientation for Nota de voz. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_files: {
      eyebrow: 'Arquivos de voz',
      title: 'Arquivos de voz',
      body: 'Luna29 member space — calm orientation for Arquivos de voz. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    monthly_reflection: {
      eyebrow: 'Nota mensal',
      title: 'Nota mensal',
      body: 'Luna29 member space — calm orientation for Nota mensal. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    insights_paywall: {
      eyebrow: 'Insights',
      title: 'Insights',
      body: 'Luna29 member space — calm orientation for Insights. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    bridge: {
      eyebrow: 'Ponte',
      title: 'Ponte',
      body: 'Luna29 member space — calm orientation for Ponte. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    relationships: {
      eyebrow: 'Relacionamentos',
      title: 'Relacionamentos',
      body: 'Luna29 member space — calm orientation for Relacionamentos. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    creative: {
      eyebrow: 'Criar',
      title: 'Criar',
      body: 'Luna29 member space — calm orientation for Criar. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    meds: {
      eyebrow: 'Nota de medicação',
      title: 'Nota de medicação',
      body: 'Luna29 member space — calm orientation for Nota de medicação. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    profile: {
      eyebrow: 'Perfil',
      title: 'Perfil',
      body: 'Luna29 member space — calm orientation for Perfil. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    labs: {
      eyebrow: 'Relatórios de saúde',
      title: 'Relatórios de saúde',
      body: 'Luna29 member space — calm orientation for Relatórios de saúde. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    history: {
      eyebrow: 'Minha jornada',
      title: 'Minha jornada',
      body: 'Luna29 member space — calm orientation for Minha jornada. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
  },
  ar: {
    my_day: {
      eyebrow: 'يومي',
      title: 'يومي',
      body: 'Luna29 member space — calm orientation for يومي. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_note: {
      eyebrow: 'ملاحظة صوتية',
      title: 'ملاحظة صوتية',
      body: 'Luna29 member space — calm orientation for ملاحظة صوتية. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_files: {
      eyebrow: 'ملفات صوتية',
      title: 'ملفات صوتية',
      body: 'Luna29 member space — calm orientation for ملفات صوتية. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    monthly_reflection: {
      eyebrow: 'ملاحظة شهرية',
      title: 'ملاحظة شهرية',
      body: 'Luna29 member space — calm orientation for ملاحظة شهرية. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    insights_paywall: {
      eyebrow: 'رؤى',
      title: 'رؤى',
      body: 'Luna29 member space — calm orientation for رؤى. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    bridge: {
      eyebrow: 'الجسر',
      title: 'الجسر',
      body: 'Luna29 member space — calm orientation for الجسر. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    relationships: {
      eyebrow: 'العلاقات',
      title: 'العلاقات',
      body: 'Luna29 member space — calm orientation for العلاقات. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    creative: {
      eyebrow: 'إنشاء',
      title: 'إنشاء',
      body: 'Luna29 member space — calm orientation for إنشاء. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    meds: {
      eyebrow: 'ملاحظة دواء',
      title: 'ملاحظة دواء',
      body: 'Luna29 member space — calm orientation for ملاحظة دواء. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    profile: {
      eyebrow: 'الملف الشخصي',
      title: 'الملف الشخصي',
      body: 'Luna29 member space — calm orientation for الملف الشخصي. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    labs: {
      eyebrow: 'تقارير الصحة',
      title: 'تقارير الصحة',
      body: 'Luna29 member space — calm orientation for تقارير الصحة. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    history: {
      eyebrow: 'رحلتي',
      title: 'رحلتي',
      body: 'Luna29 member space — calm orientation for رحلتي. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
  },
  he: {
    my_day: {
      eyebrow: 'היום שלי',
      title: 'היום שלי',
      body: 'Luna29 member space — calm orientation for היום שלי. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_note: {
      eyebrow: 'הערת קול',
      title: 'הערת קול',
      body: 'Luna29 member space — calm orientation for הערת קול. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    voice_files: {
      eyebrow: 'קובצי קול',
      title: 'קובצי קול',
      body: 'Luna29 member space — calm orientation for קובצי קול. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    monthly_reflection: {
      eyebrow: 'הערה חודשית',
      title: 'הערה חודשית',
      body: 'Luna29 member space — calm orientation for הערה חודשית. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    insights_paywall: {
      eyebrow: 'תובנות',
      title: 'תובנות',
      body: 'Luna29 member space — calm orientation for תובנות. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    bridge: {
      eyebrow: 'גשר',
      title: 'גשר',
      body: 'Luna29 member space — calm orientation for גשר. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    relationships: {
      eyebrow: 'יחסים',
      title: 'יחסים',
      body: 'Luna29 member space — calm orientation for יחסים. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    creative: {
      eyebrow: 'יצירה',
      title: 'יצירה',
      body: 'Luna29 member space — calm orientation for יצירה. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    meds: {
      eyebrow: 'הערת תרופות',
      title: 'הערת תרופות',
      body: 'Luna29 member space — calm orientation for הערת תרופות. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    profile: {
      eyebrow: 'פרופיל',
      title: 'פרופיל',
      body: 'Luna29 member space — calm orientation for פרופיל. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    labs: {
      eyebrow: 'דוחות בריאות',
      title: 'דוחות בריאות',
      body: 'Luna29 member space — calm orientation for דוחות בריאות. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
    history: {
      eyebrow: 'המסע שלי',
      title: 'המסע שלי',
      body: 'Luna29 member space — calm orientation for המסע שלי. Observation only, not medical advice.',
      tips: ['Check in on Today first.', 'Review patterns across weeks.', 'Export only when it helps a conversation.'],
    },
  },
};

export const getMemberPageIntro = (lang: Language, page: MemberIntroPageId): MemberPageIntroCopy => {
  const localized = getLang(INTROS, lang)?.[page];
  if (localized) return localized;
  return INTROS.en[page];
};
