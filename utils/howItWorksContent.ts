import {Language, LangCopy } from '../constants';
export type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  flowTitle: string;
  flow: Array<{ step: string; title: string; text: string; icon: 'pulse' | 'map' | 'guide' | 'bridge' }>;
  benefitsTitle: string;
  benefits: Array<{ title: string; text: string }>;
  faqTitle: string;
  faq: Array<{ q: string; a: string }>;
  commentsTitle: string;
  comments: Array<{ quote: string; author: string }>;
  cta: string;
  livePreview: string;
  stepLabel: string;
  prev: string;
  next: string;
  of: string;
};

export type ExtraHowCopy = {
  dailyTitle: string;
  dailyItems: string[];
  onboardingTitle: string;
  onboardingBody: string;
  localModeTitle: string;
  localModeBody: string;
  reportsTitle: string;
  reportsBody: string;
};

export const EXTRA_HOW_COPY: LangCopy< ExtraHowCopy> = {
  en: {
    dailyTitle: 'Daily Use Structure (90 Seconds)',
    dailyItems: [
      'Morning: set baseline (energy, mood, focus).',
      'Midday: check capacity and adjust workload.',
      'Evening: add one short reflection or voice note.',
    ],
    onboardingTitle: '7-Day Guided Start',
    onboardingBody: 'Day 1-2 capture baseline, day 3-5 detect pattern shifts, day 6-7 create your first Inner Weather summary and personal rhythm rules.',
    localModeTitle: 'Development Mode (Local-First)',
    localModeBody: 'Current setup runs locally. Data remains on this device unless manually exported.',
    reportsTitle: 'My Health Reports',
    reportsBody: 'Generates a doctor-ready women-focused report with hormone combinations, potential effects, risk areas, and practical recommendations.',
  },
  ru: {
    dailyTitle: 'Ежедневный Формат (90 Секунд)',
    dailyItems: [
      'Утро: зафиксируйте базу (энергия, настроение, фокус).',
      'День: проверьте емкость и скорректируйте нагрузку.',
      'Вечер: добавьте короткую рефлексию или voice note.',
    ],
    onboardingTitle: '7-Дневный Запуск',
    onboardingBody: 'Дни 1-2 фиксируют базу, дни 3-5 показывают сдвиги паттернов, дни 6-7 формируют первый отчет Inner Weather и личные правила ритма.',
    localModeTitle: 'Режим Разработки (Local-First)',
    localModeBody: 'Сейчас система работает локально. Данные остаются на этом устройстве, пока вы сами их не экспортируете.',
    reportsTitle: 'My Health Reports',
    reportsBody: 'Формирует отчет для врача с женским клиническим фокусом: сочетания гормонов, эффекты, риски и практические рекомендации.',
  },
  uk: {
    dailyTitle: 'Щоденний Формат (90 Секунд)',
    dailyItems: [
      'Ранок: зафіксуйте базу (енергія, настрій, фокус).',
      'День: перевірте ємність і скоригуйте навантаження.',
      'Вечір: додайте коротку рефлексію або voice note.',
    ],
    onboardingTitle: '7-Денний Старт',
    onboardingBody: 'Дні 1-2 формують базу, дні 3-5 показують зсуви патернів, дні 6-7 дають перший звіт Inner Weather і власні правила ритму.',
    localModeTitle: 'Режим Розробки (Local-First)',
    localModeBody: 'Поточне налаштування працює локально. Дані залишаються на пристрої, доки ви їх не експортуєте.',
    reportsTitle: 'My Health Reports',
    reportsBody: 'Формує звіт для лікаря з жіночим клінічним фокусом: гормональні поєднання, ефекти, ризики та практичні дії.',
  },
  es: {
    dailyTitle: 'Uso Diario (90 Segundos)',
    dailyItems: [
      'Mañana: define línea base (energía, ánimo, foco).',
      'Mediodía: revisa capacidad y ajusta carga.',
      'Noche: agrega una reflexión corta o nota de voz.',
    ],
    onboardingTitle: 'Inicio Guiado De 7 Días',
    onboardingBody: 'Días 1-2 establecen base, 3-5 detectan cambios de patrón, 6-7 generan tu primer resumen Inner Weather y reglas personales.',
    localModeTitle: 'Modo Desarrollo (Local-First)',
    localModeBody: 'La configuración actual corre en local. Tus datos quedan en este dispositivo salvo exportación manual.',
    reportsTitle: 'My Health Reports',
    reportsBody: 'Genera reporte clínico enfocado en salud femenina: combinaciones hormonales, efectos potenciales, riesgos y acciones sugeridas.',
  },
  fr: {
    dailyTitle: 'Usage Quotidien (90 Secondes)',
    dailyItems: [
      'Matin : fixer la base (énergie, humeur, focus).',
      'Midi : vérifier la capacité et ajuster la charge.',
      'Soir : ajouter une réflexion courte ou note vocale.',
    ],
    onboardingTitle: 'Démarrage Guidé 7 Jours',
    onboardingBody: 'Jours 1-2 base initiale, 3-5 détection de variations, 6-7 premier résumé Inner Weather et règles personnelles.',
    localModeTitle: 'Mode Développement (Local-First)',
    localModeBody: 'La configuration actuelle est locale. Les données restent sur cet appareil sauf export manuel.',
    reportsTitle: 'My Health Reports',
    reportsBody: 'Génère un rapport clinique orienté santé féminine: combinaisons hormonales, effets possibles, risques et actions recommandées.',
  },
  de: {
    dailyTitle: 'Tägliche Nutzung (90 Sekunden)',
    dailyItems: [
      'Morgen: Basis setzen (Energie, Stimmung, Fokus).',
      'Mittag: Kapazität prüfen und Belastung anpassen.',
      'Abend: kurze Reflexion oder Voice-Note ergänzen.',
    ],
    onboardingTitle: 'Geführter 7-Tage-Start',
    onboardingBody: 'Tag 1-2 Basis erfassen, 3-5 Musteränderungen erkennen, 6-7 erste Inner-Weather-Zusammenfassung und persönliche Regeln erstellen.',
    localModeTitle: 'Entwicklungsmodus (Local-First)',
    localModeBody: 'Das System läuft aktuell lokal. Daten bleiben auf diesem Gerät bis zum manuellen Export.',
    reportsTitle: 'My Health Reports',
    reportsBody: 'Erstellt einen frauenfokussierten klinischen Bericht mit Hormonkombinationen, möglichen Effekten, Risiken und Handlungsempfehlungen.',
  },
  zh: {
    dailyTitle: '每日使用结构（90 秒）',
    dailyItems: [
      '早晨：记录基线（精力、情绪、专注）。',
      '中午：检查承载能力并调整计划。',
      '晚上：添加一条简短反思或语音记录。',
    ],
    onboardingTitle: '7 天引导启动',
    onboardingBody: '第 1-2 天建立基线，第 3-5 天识别模式变化，第 6-7 天生成首个 Inner Weather 总结与个人节律规则。',
    localModeTitle: '开发模式（Local-First）',
    localModeBody: '当前为本地运行。除非你手动导出，数据将保存在本机。',
    reportsTitle: 'My Health Reports',
    reportsBody: '生成女性健康临床报告：激素组合、潜在影响、风险区域和可执行建议。',
  },
  ja: {
    dailyTitle: '毎日の利用構造（90秒）',
    dailyItems: [
      '朝：基準値を記録（エネルギー・気分・集中）。',
      '昼：余力を再確認して負荷を調整。',
      '夜：短い振り返りまたは音声メモを追加。',
    ],
    onboardingTitle: '7日間ガイド開始',
    onboardingBody: '1-2日目で基準を作り、3-5日目で変化を把握、6-7日目で最初のInner Weather要約と個人ルールを作成します。',
    localModeTitle: '開発モード（Local-First）',
    localModeBody: '現在はローカル実行です。手動エクスポートしない限りデータは端末内に保存されます。',
    reportsTitle: 'My Health Reports',
    reportsBody: '女性向けの臨床レポートを生成し、ホルモン組み合わせ、想定影響、リスク、行動提案を提示します。',
  },
  pt: {
    dailyTitle: 'Uso Diario (90 Segundos)',
    dailyItems: [
      'Manhã: definir baseline (energia, humor, foco).',
      'Meio do dia: revisar capacidade e ajustar carga.',
      'Noite: registrar uma reflexão curta ou nota de voz.',
    ],
    onboardingTitle: 'Início Guiado De 7 Dias',
    onboardingBody: 'Dias 1-2 criam base, 3-5 mostram mudanças de padrão, 6-7 geram o primeiro resumo Inner Weather e regras pessoais.',
    localModeTitle: 'Modo De Desenvolvimento (Local-First)',
    localModeBody: 'A configuração atual roda localmente. Os dados ficam neste dispositivo, salvo exportação manual.',
    reportsTitle: 'My Health Reports',
    reportsBody: 'Gera relatório clínico focado na mulher com combinações hormonais, efeitos potenciais, riscos e recomendações práticas.',
  },
};

export const COPY: LangCopy< Copy> = {
  en: {
    eyebrow: 'How It Works',
    title: 'From Daily Signal To Clear Decisions',
    subtitle: 'Luna29 turns small daily inputs into visible rhythm patterns so users can understand themselves faster and act with less stress.',
    flowTitle: 'Simple 4-Step Flow',
    flow: [
      { step: '01', title: 'Check In Daily', text: 'A short daily check-in captures energy, mood, stress, sleep, and context.', icon: 'pulse' },
      { step: '02', title: 'See The Pattern', text: 'Luna29 maps changes over days and cycles so patterns become clear, not random.', icon: 'map' },
      { step: '03', title: 'Get Gentle Guidance', text: 'The system proposes low-friction suggestions for pacing, care, and communication.', icon: 'guide' },
      { step: '04', title: 'Act And Reflect', text: 'Users adjust plans, share partner notes, and build a calmer routine over time.', icon: 'bridge' },
    ],
    benefitsTitle: 'What Users Understand Quickly',
    benefits: [
      { title: 'Why they feel different day-to-day', text: 'State shifts become explainable through rhythm context.' },
      { title: 'When to push vs. when to protect energy', text: 'Users avoid overload by matching plans to capacity.' },
      { title: 'How to communicate needs clearly', text: 'Bridge tools reduce conflict and improve partner understanding.' },
    ],
    faqTitle: 'Quick Answers',
    faq: [
      { q: 'Is Luna29 a medical diagnosis tool?', a: 'No. It is a self-observation and decision support system.' },
      { q: 'How long does daily use take?', a: 'Usually about 60 seconds per day for core check-in.' },
      { q: 'Is my data private?', a: 'Yes. The architecture is local-first with controlled member access.' },
    ],
    commentsTitle: 'Member Comments',
    comments: [
      { quote: 'I finally understood why my energy drops were not random.', author: 'Anna • 32' },
      { quote: 'The 60-second check-in made my routine realistic.', author: 'Mia • 28' },
      { quote: 'Bridge notes helped me explain my state without conflict.', author: 'Sara • 35' },
    ],
    cta: 'Start With 7-Day Trial',
    livePreview: 'Live Preview',
    stepLabel: 'Step',
    prev: 'Prev',
    next: 'Next',
    of: 'of',
  },
  ru: {
    eyebrow: 'Как Это Работает',
    title: 'От Ежедневного Сигнала К Ясным Решениям',
    subtitle: 'Luna29 превращает короткие ежедневные отметки в понятные ритмы, чтобы пользователи быстрее понимали себя и действовали спокойнее.',
    flowTitle: 'Простой Путь Из 4 Шагов',
    flow: [
      { step: '01', title: 'Ежедневный Check-in', text: 'Короткая отметка фиксирует энергию, настроение, стресс, сон и контекст.', icon: 'pulse' },
      { step: '02', title: 'Видимый Паттерн', text: 'Luna29 показывает изменения по дням и циклам — без хаоса и догадок.', icon: 'map' },
      { step: '03', title: 'Мягкие Подсказки', text: 'Система предлагает щадящие шаги для темпа, заботы о себе и коммуникации.', icon: 'guide' },
      { step: '04', title: 'Действие И Рефлексия', text: 'Пользователь корректирует планы, делится запиской партнеру и выстраивает устойчивый ритм.', icon: 'bridge' },
    ],
    benefitsTitle: 'Что Пользователь Понимает Быстро',
    benefits: [
      { title: 'Почему состояние меняется изо дня в день', text: 'Изменения становятся объяснимыми в контексте ритма.' },
      { title: 'Когда ускоряться, а когда беречь ресурс', text: 'Планы лучше совпадают с фактической емкостью.' },
      { title: 'Как спокойно говорить о своих потребностях', text: 'Bridge-инструменты снижают конфликт и непонимание.' },
    ],
    faqTitle: 'Короткие Ответы',
    faq: [
      { q: 'Это медицинская диагностика?', a: 'Нет. Это система самонаблюдения и поддержки решений.' },
      { q: 'Сколько занимает ежедневное использование?', a: 'Обычно около 60 секунд в день для базового check-in.' },
      { q: 'Данные защищены?', a: 'Да. Архитектура local-first и доступ только в member-зоне.' },
    ],
    commentsTitle: 'Комментарии Пользователей',
    comments: [
      { quote: 'Я наконец поняла, что мои спады энергии не случайны.', author: 'Анна • 32' },
      { quote: 'Check-in на 60 секунд реально вписался в мой день.', author: 'Мия • 28' },
      { quote: 'Bridge-заметки помогли говорить о состоянии без конфликтов.', author: 'Сара • 35' },
    ],
    cta: 'Начать 7-Дневный Trial',
    livePreview: 'Живой Просмотр',
    stepLabel: 'Шаг',
    prev: 'Назад',
    next: 'Далее',
    of: 'из',
  },
  uk: {
    eyebrow: 'Як Це Працює',
    title: 'Від Щоденного Сигналу До Ясних Рішень',
    subtitle: 'Luna29 перетворює короткі щоденні дані у видимі ритми, щоб легше розуміти себе і діяти спокійно.',
    flowTitle: 'Простий Шлях У 4 Кроки',
    flow: [
      { step: '01', title: 'Щоденний Check-in', text: 'Коротка відмітка фіксує енергію, настрій, стрес, сон і контекст.', icon: 'pulse' },
      { step: '02', title: 'Побачити Патерн', text: 'Luna29 показує зміни по днях і циклах, щоб прибрати хаос.', icon: 'map' },
      { step: '03', title: 'Мʼякі Підказки', text: 'Система дає прості кроки для ритму, турботи та комунікації.', icon: 'guide' },
      { step: '04', title: 'Дія Та Рефлексія', text: 'Користувачка коригує плани і поступово формує стійкий режим.', icon: 'bridge' },
    ],
    benefitsTitle: 'Що Користувач Розуміє Швидко',
    benefits: [
      { title: 'Чому стан змінюється щодня', text: 'Зміни стають зрозумілими в ритмічному контексті.' },
      { title: 'Коли прискорюватись, а коли берегти ресурс', text: 'Плани краще збігаються з реальною ємністю.' },
      { title: 'Як чітко говорити про потреби', text: 'Bridge-інструменти знижують напругу у спілкуванні.' },
    ],
    faqTitle: 'Швидкі Відповіді',
    faq: [
      { q: 'Чи це медична діагностика?', a: 'Ні. Це система самоспостереження і підтримки рішень.' },
      { q: 'Скільки часу займає щоденне використання?', a: 'Зазвичай близько 60 секунд для базового check-in.' },
      { q: 'Чи приватні мої дані?', a: 'Так. Архітектура local-first і контрольований доступ у member-зоні.' },
    ],
    commentsTitle: 'Коментарі Користувачок',
    comments: [
      { quote: 'Я нарешті побачила, що спад енергії не випадковий.', author: 'Анна • 32' },
      { quote: 'Check-in на 60 секунд реально працює щодня.', author: 'Мія • 28' },
      { quote: 'Bridge-допис допоміг спокійно пояснювати свій стан.', author: 'Сара • 35' },
    ],
    cta: 'Почати 7-Денний Trial',
    livePreview: 'Живий Перегляд',
    stepLabel: 'Крок',
    prev: 'Назад',
    next: 'Далі',
    of: 'з',
  },
  es: {
    eyebrow: 'Como Funciona',
    title: 'De Senales Diarias A Decisiones Claras',
    subtitle: 'Luna29 convierte entradas diarias en patrones visibles para actuar con menos estres.',
    flowTitle: 'Flujo Simple De 4 Pasos',
    flow: [
      { step: '01', title: 'Check-in Diario', text: 'Un check-in corto capta energia, estado, estres, sueno y contexto.', icon: 'pulse' },
      { step: '02', title: 'Ver El Patron', text: 'Luna29 muestra cambios por dias y ciclos para eliminar la sensacion de azar.', icon: 'map' },
      { step: '03', title: 'Guia Suave', text: 'El sistema propone pasos simples para ritmo, cuidado y comunicacion.', icon: 'guide' },
      { step: '04', title: 'Actuar Y Reflexionar', text: 'Las usuarias ajustan planes y construyen una rutina mas estable.', icon: 'bridge' },
    ],
    benefitsTitle: 'Lo Que Entienden Rapido',
    benefits: [
      { title: 'Por que cambia su estado dia a dia', text: 'Los cambios se vuelven explicables por contexto de ritmo.' },
      { title: 'Cuando exigir y cuando proteger energia', text: 'Se evita sobrecarga al alinear el plan con la capacidad real.' },
      { title: 'Como comunicar necesidades con calma', text: 'Bridge reduce conflictos y mejora entendimiento con la pareja.' },
    ],
    faqTitle: 'Respuestas Rapidas',
    faq: [
      { q: 'Es una herramienta de diagnostico medico?', a: 'No. Es observacion personal y soporte de decisiones.' },
      { q: 'Cuanto tarda el uso diario?', a: 'Normalmente 60 segundos para el check-in principal.' },
      { q: 'Mis datos son privados?', a: 'Si. Arquitectura local-first con acceso controlado de miembros.' },
    ],
    commentsTitle: 'Comentarios De Miembros',
    comments: [
      { quote: 'Ahora entiendo que mis bajones no eran aleatorios.', author: 'Anna • 32' },
      { quote: 'El check-in de 60 segundos hizo viable mi rutina.', author: 'Mia • 28' },
      { quote: 'Bridge me ayudo a explicar mi estado sin conflicto.', author: 'Sara • 35' },
    ],
    cta: 'Comenzar Trial De 7 Dias',
    livePreview: 'Vista En Vivo',
    stepLabel: 'Paso',
    prev: 'Anterior',
    next: 'Siguiente',
    of: 'de',
  },
  fr: {
    eyebrow: 'Comment Ca Marche',
    title: 'Du Signal Quotidien A Des Decisions Claires',
    subtitle: 'Luna29 transforme de petites donnees quotidiennes en rythmes visibles pour agir avec moins de stress.',
    flowTitle: 'Flux Simple En 4 Etapes',
    flow: [
      { step: '01', title: 'Check-in Quotidien', text: 'Un check-in court capte energie, humeur, stress, sommeil et contexte.', icon: 'pulse' },
      { step: '02', title: 'Voir Le Schema', text: 'Luna29 cartographie les changements pour rendre les rythmes clairs.', icon: 'map' },
      { step: '03', title: 'Guidance Douce', text: 'Le systeme propose des actions simples pour rythme, soin et communication.', icon: 'guide' },
      { step: '04', title: 'Agir Et Reflechir', text: 'Les utilisatrices ajustent leurs plans et construisent une routine stable.', icon: 'bridge' },
    ],
    benefitsTitle: 'Ce Que Les Utilisatrices Comprennent Vite',
    benefits: [
      { title: 'Pourquoi elles se sentent differentes chaque jour', text: 'Les variations deviennent lisibles avec le contexte de rythme.' },
      { title: 'Quand accelerer ou proteger son energie', text: 'Les plans suivent mieux la capacite reelle.' },
      { title: 'Comment communiquer ses besoins clairement', text: 'Bridge diminue les conflits et clarifie la communication.' },
    ],
    faqTitle: 'Reponses Rapides',
    faq: [
      { q: 'Est-ce un outil de diagnostic medical?', a: 'Non. C est un systeme d auto-observation et d aide a la decision.' },
      { q: 'Combien de temps prend l usage quotidien?', a: 'En general, 60 secondes pour le check-in principal.' },
      { q: 'Mes donnees sont-elles privees?', a: 'Oui. Architecture local-first et acces membre controle.' },
    ],
    commentsTitle: 'Commentaires Des Membres',
    comments: [
      { quote: 'J ai enfin compris que mes baisses d energie n etaient pas aleatoires.', author: 'Anna • 32' },
      { quote: 'Le check-in de 60 secondes est devenu realiste chaque jour.', author: 'Mia • 28' },
      { quote: 'Les notes Bridge m ont aidee a expliquer mon etat sans conflit.', author: 'Sara • 35' },
    ],
    cta: 'Commencer Le Trial De 7 Jours',
    livePreview: 'Apercu En Direct',
    stepLabel: 'Etape',
    prev: 'Prec',
    next: 'Suiv',
    of: 'sur',
  },
  de: {
    eyebrow: 'So Funktioniert Es',
    title: 'Vom Tagesignal Zu Klaren Entscheidungen',
    subtitle: 'Luna29 macht aus kleinen Tagesdaten sichtbare Rhythmusmuster fur ruhigere Entscheidungen.',
    flowTitle: 'Einfacher 4-Schritte Ablauf',
    flow: [
      { step: '01', title: 'Taeglicher Check-in', text: 'Ein kurzer Check-in erfasst Energie, Stimmung, Stress, Schlaf und Kontext.', icon: 'pulse' },
      { step: '02', title: 'Muster Erkennen', text: 'Luna29 zeigt Veraenderungen uber Tage und Zyklen klar und nachvollziehbar.', icon: 'map' },
      { step: '03', title: 'Sanfte Guidance', text: 'Das System gibt einfache Hinweise fur Tempo, Selbstfursorge und Kommunikation.', icon: 'guide' },
      { step: '04', title: 'Handeln Und Reflektieren', text: 'Nutzerinnen passen Plane an und bauen langfristig stabile Routinen auf.', icon: 'bridge' },
    ],
    benefitsTitle: 'Was Nutzerinnen Schnell Verstehen',
    benefits: [
      { title: 'Warum sich der Zustand taeglich aendert', text: 'Veraenderungen werden im Rhythmuskontext erklaerbar.' },
      { title: 'Wann antreiben und wann Energie schuetzen', text: 'Plaene passen besser zur realen Kapazitaet.' },
      { title: 'Wie man Bedurfnisse klar kommuniziert', text: 'Bridge reduziert Konflikte und verbessert Verstandnis.' },
    ],
    faqTitle: 'Schnelle Antworten',
    faq: [
      { q: 'Ist Luna29 ein medizinisches Diagnose-Tool?', a: 'Nein. Es ist Selbstbeobachtung und Entscheidungsunterstuetzung.' },
      { q: 'Wie lange dauert die taegliche Nutzung?', a: 'Meist etwa 60 Sekunden fur den Kern-Check-in.' },
      { q: 'Sind meine Daten privat?', a: 'Ja. Local-first Architektur mit kontrolliertem Mitgliederzugang.' },
    ],
    commentsTitle: 'Mitgliederstimmen',
    comments: [
      { quote: 'Ich habe verstanden, dass mein Energieabfall nicht zufallig war.', author: 'Anna • 32' },
      { quote: 'Der 60-Sekunden Check-in passt wirklich in meinen Alltag.', author: 'Mia • 28' },
      { quote: 'Bridge half mir, meinen Zustand konfliktfrei zu erklaren.', author: 'Sara • 35' },
    ],
    cta: 'Mit 7-Tage Trial Starten',
    livePreview: 'Live Vorschau',
    stepLabel: 'Schritt',
    prev: 'Zuruck',
    next: 'Weiter',
    of: 'von',
  },
  zh: {
    eyebrow: '如何使用',
    title: '从每日信号到清晰决策',
    subtitle: 'Luna29 将每天的小输入转为可见节律，帮助用户更快理解自己、减轻压力。',
    flowTitle: '简单四步流程',
    flow: [
      { step: '01', title: '每日 Check-in', text: '简短记录能量、情绪、压力、睡眠和当下情境。', icon: 'pulse' },
      { step: '02', title: '看到模式', text: 'Luna29 按天和周期展示变化，让模式清晰可见。', icon: 'map' },
      { step: '03', title: '温和引导', text: '系统提供低负担建议，帮助节奏、照护和沟通。', icon: 'guide' },
      { step: '04', title: '行动与反思', text: '用户调整计划、记录反馈，逐步建立稳定日常。', icon: 'bridge' },
    ],
    benefitsTitle: '用户能快速理解',
    benefits: [
      { title: '为什么每天状态不同', text: '在节律背景下，变化更容易解释。' },
      { title: '何时推进，何时保护精力', text: '计划与真实承载能力更匹配。' },
      { title: '如何清晰表达需求', text: 'Bridge 工具降低冲突，提升彼此理解。' },
    ],
    faqTitle: '快速问答',
    faq: [
      { q: 'Luna29 是医疗诊断工具吗？', a: '不是。它是自我观察与决策支持系统。' },
      { q: '每天要花多久？', a: '核心 check-in 通常约 60 秒。' },
      { q: '数据是否私密？', a: '是。采用 local-first 架构并控制会员访问。' },
    ],
    commentsTitle: '会员评论',
    comments: [
      { quote: '我终于明白能量下滑并不是随机的。', author: 'Anna • 32' },
      { quote: '60 秒 check-in 真的能坚持下去。', author: 'Mia • 28' },
      { quote: 'Bridge 让我更平静地表达状态。', author: 'Sara • 35' },
    ],
    cta: '开始 7 天 Trial',
    livePreview: '实时预览',
    stepLabel: '步骤',
    prev: '上一步',
    next: '下一步',
    of: '/',
  },
  ja: {
    eyebrow: '使い方',
    title: '毎日のサインから明確な判断へ',
    subtitle: 'Luna29 は日々の小さな入力を見えるリズムに変え、理解と行動をやさしく支えます。',
    flowTitle: 'シンプルな4ステップ',
    flow: [
      { step: '01', title: '毎日の Check-in', text: '短い入力で、エネルギー・気分・ストレス・睡眠・状況を記録。', icon: 'pulse' },
      { step: '02', title: 'パターンを可視化', text: 'Luna29 が日ごと・周期ごとの変化を示し、流れを理解しやすくします。', icon: 'map' },
      { step: '03', title: 'やさしいガイダンス', text: '負担の少ない提案で、ペース・セルフケア・対話を支援します。', icon: 'guide' },
      { step: '04', title: '実行と振り返り', text: '計画を調整し、少しずつ安定した習慣を作ります。', icon: 'bridge' },
    ],
    benefitsTitle: 'すぐに分かること',
    benefits: [
      { title: '日ごとに状態が変わる理由', text: 'リズム文脈で変化を説明しやすくなります。' },
      { title: '頑張る日と守る日の判断', text: '実際の余力に合わせて計画できます。' },
      { title: '必要を伝えるコミュニケーション', text: 'Bridge により衝突を減らし、理解を高めます。' },
    ],
    faqTitle: 'クイックFAQ',
    faq: [
      { q: 'Luna29 は医療診断ですか？', a: 'いいえ。自己観察と意思決定支援のためのツールです。' },
      { q: '毎日の利用時間は？', a: 'コア check-in は通常60秒ほどです。' },
      { q: 'データは安全ですか？', a: 'はい。local-first 構成で会員アクセスを制御しています。' },
    ],
    commentsTitle: 'メンバーの声',
    comments: [
      { quote: 'エネルギー低下が偶然ではないと分かりました。', author: 'Anna • 32' },
      { quote: '60秒 check-in なら毎日続けられます。', author: 'Mia • 28' },
      { quote: 'Bridge で状態を穏やかに伝えられました。', author: 'Sara • 35' },
    ],
    cta: '7日間 Trial を開始',
    livePreview: 'ライブプレビュー',
    stepLabel: 'ステップ',
    prev: '前へ',
    next: '次へ',
    of: '/',
  },
  pt: {
    eyebrow: 'Como Funciona',
    title: 'Do Sinal Diario A Decisoes Claras',
    subtitle: 'Luna29 transforma pequenos dados diarios em padroes visiveis para agir com menos estresse.',
    flowTitle: 'Fluxo Simples Em 4 Etapas',
    flow: [
      { step: '01', title: 'Check-in Diario', text: 'Um check-in curto captura energia, humor, estresse, sono e contexto.', icon: 'pulse' },
      { step: '02', title: 'Ver O Padrao', text: 'Luna29 mostra mudancas por dias e ciclos para tirar a sensacao de aleatorio.', icon: 'map' },
      { step: '03', title: 'Guia Suave', text: 'O sistema sugere passos simples para ritmo, autocuidado e comunicacao.', icon: 'guide' },
      { step: '04', title: 'Agir E Refletir', text: 'As usuarias ajustam planos e constroem uma rotina mais estavel.', icon: 'bridge' },
    ],
    benefitsTitle: 'O Que As Usuarias Entendem Rapido',
    benefits: [
      { title: 'Por que o estado muda no dia a dia', text: 'As mudancas ficam explicaveis no contexto de ritmo.' },
      { title: 'Quando acelerar e quando proteger energia', text: 'Planos combinam melhor com a capacidade real.' },
      { title: 'Como comunicar necessidades com clareza', text: 'Bridge reduz conflito e melhora entendimento na relacao.' },
    ],
    faqTitle: 'Respostas Rapidas',
    faq: [
      { q: 'Luna29 e uma ferramenta de diagnostico medico?', a: 'Nao. E um sistema de auto-observacao e suporte a decisao.' },
      { q: 'Quanto tempo leva por dia?', a: 'Normalmente 60 segundos para o check-in principal.' },
      { q: 'Meus dados sao privados?', a: 'Sim. Arquitetura local-first e acesso de membros controlado.' },
    ],
    commentsTitle: 'Comentarios De Membros',
    comments: [
      { quote: 'Entendi que minhas quedas de energia nao eram aleatorias.', author: 'Anna • 32' },
      { quote: 'O check-in de 60 segundos ficou real no meu dia.', author: 'Mia • 28' },
      { quote: 'As notas Bridge me ajudaram a explicar meu estado sem conflito.', author: 'Sara • 35' },
    ],
    cta: 'Iniciar Trial De 7 Dias',
    livePreview: 'Preview Ao Vivo',
    stepLabel: 'Etapa',
    prev: 'Anterior',
    next: 'Proxima',
    of: 'de',
  },
};
