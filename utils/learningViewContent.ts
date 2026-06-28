import { Language, LangCopy, getLang } from '../constants';
import type { AccordionCategory } from '../components/AccordionSections';
import { LEARNING_COPY_I18N, LEARNING_DATA_I18N } from './learningContentI18n';

export type TrainingViewCopy = {
  back: string;
  eyebrow: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  promiseTitle: string;
  promiseQuote: string;
};

const COPY: LangCopy<TrainingViewCopy> = {
  en: {
    back: 'Back to public home',
    eyebrow: 'Luna29 Learning',
    titleA: 'System',
    titleB: 'Learning.',
    subtitle: 'Terminology, core concepts, and practical questions — written in Luna29\'s calm language of observation. A structured guide for reading your physiology without turning it into diagnosis.',
    promiseTitle: 'How to use this page',
    promiseQuote: 'Read slowly. Open one section at a time. Luna29 is a mirror for self-observation — these notes help you read the mirror without turning it into a verdict.',
  },
  ru: {
    back: 'Назад на публичную главную',
    eyebrow: 'Обучение Luna29',
    titleA: 'Обучение',
    titleB: 'системе.',
    subtitle: 'Терминология, ключевые идеи и практические вопросы — на языке наблюдения Luna29, без диагностики и давления.',
    promiseTitle: 'Как пользоваться страницей',
    promiseQuote: 'Читайте спокойно. Открывайте по одному блоку. Luna29 — зеркало для самонаблюдения. Эти материалы помогают читать зеркало, не превращая его в приговор.',
  },
  uk: {
    back: 'Назад на публічну головну',
    eyebrow: 'Навчання Luna29',
    titleA: 'Навчання',
    titleB: 'системі.',
    subtitle: 'Термінологія, ключові ідеї та практичні питання — мовою спостереження Luna29.',
    promiseTitle: 'Як користуватися сторінкою',
    promiseQuote: 'Читайте повільно. Відкривайте по одному блоку. Luna29 — дзеркало для самоспостереження.',
  },
};

const TRAINING_DATA: LangCopy<AccordionCategory[]> = {
  en: [
    {
      title: 'Core Terminology',
      intro: 'These terms appear across Luna29 public pages, member tools, and reports. They describe patterns — not labels for who you are.',
      items: [
        {
          title: 'Luna29 Balance',
          body: 'The visual rhythm map at the center of the system. It connects cycle context, sensitivity states, and daily markers into one readable picture — like weather for your inner state.',
        },
        {
          title: 'BioMath',
          body: 'The underlying logic that links physiological signals to plain-language states. BioMath does not diagnose; it organizes what you observe into structured, repeatable patterns.',
        },
        {
          title: 'Rhythm Map',
          body: 'A day-by-day view of where you are in your internal cycle. It helps you see phase shifts, not just calendar dates.',
        },
        {
          title: 'Phase / Internal Season',
          body: 'Luna29 describes cycle segments as seasons: renewal, growth, peak expression, and integration. Each phase has a different baseline for energy, focus, and sensitivity.',
        },
        {
          title: 'Sensitivity State',
          body: 'A readable summary of how reactive or resourced your system feels today — for example Steady, Elevated, Strained, or Quiet. It is descriptive, not a grade.',
        },
        {
          title: 'Marker',
          body: 'Any signal you log or import: sleep quality, mood, energy, symptoms, lab values, or voice reflections. Markers become meaningful when seen across time.',
        },
        {
          title: 'Weather Map',
          body: 'A metaphor Luna29 uses for inner state: conditions change, all states are valid, and the goal is orientation — not control.',
        },
        {
          title: 'Temporal Scrubber',
          body: 'A tool to align the map with your real body timing when cycles are irregular, delayed, or affected by stress or medication.',
        },
        {
          title: 'Voice Note',
          body: 'A structured voice reflection. Speaking often captures nuance faster than typing; Luna29 listens for themes, not for clinical scoring.',
        },
        {
          title: 'The Bridge',
          body: 'A communication layer that helps you translate inner state into calm, respectful language for partners, family, or colleagues.',
        },
        {
          title: 'Ritual Path',
          body: 'A gentle daily rhythm — a path, not a checklist. It protects attention and keeps signal quality high over time.',
        },
        {
          title: 'Reset Room',
          body: 'A crisis-orientation space for overwhelm. It is not emergency care; it helps you pause, ground, and choose the next safe step.',
        },
        {
          title: 'Local-First',
          body: 'Core wellness records stay on your device when possible. Account, security, and selected features may use protected backend services.',
        },
        {
          title: 'Health Report',
          body: 'A structured export that organizes markers and observations into a clear document you can review yourself or share with a licensed professional.',
        },
      ],
    },
    {
      title: 'Key Concepts',
      intro: 'Ideas that shape how Luna29 reads your data and how you should read Luna29.',
      items: [
        {
          title: 'Mirror, not coach',
          body: 'Luna29 reflects patterns back to you. It does not command behavior, assign scores, or push optimization culture. The question is always: "What do I notice?" — not "Am I failing?"',
        },
        {
          title: 'Network, not single hormone',
          body: 'Energy and mood emerge from interactions — reproductive rhythm, stress load, metabolism, sleep, and context. Luna29 maps connections instead of isolating one number.',
        },
        {
          title: 'Pattern over snapshot',
          body: 'One hard day is data, not destiny. The system becomes useful when you compare weeks, phases, and seasons — not when you judge a single morning.',
        },
        {
          title: 'Language before diagnosis',
          body: 'Many users come to Luna29 because they lack words for their state. Clear language helps conversations with partners and clinicians — it does not replace clinicians.',
        },
        {
          title: 'Consent and pace',
          body: 'You choose what to log, export, or share. Luna29 is designed for sustainable attention: small honest inputs beat perfect daily compliance.',
        },
      ],
    },
    {
      title: 'Important Questions',
      intro: 'Questions users ask once they start taking the system seriously.',
      items: [
        {
          title: 'What should I log first?',
          body: 'Start with three anchors: sleep quality, energy, and one sentence of context ("what kind of day was this?"). Add cycle day if you know it. After one week, add voice notes or lab markers if they matter to you.',
        },
        {
          title: 'What if my cycle is irregular?',
          body: 'Use physical signs and the Temporal Scrubber instead of forcing a 28-day template. Luna29 remains useful when the map is approximate — honesty beats artificial precision.',
        },
        {
          title: 'Can I use Luna29 on hormonal birth control?',
          body: 'Yes. Your map may look flatter because medication stabilizes hormone swings. Track how you feel on that steady baseline — sensitivity, sleep, mood, and stress still matter.',
        },
        {
          title: 'When should I bring a report to a doctor?',
          body: 'When you notice a persistent pattern that affects daily life, or when you need language for a visit. Luna29 prepares observation — your clinician provides medical judgment.',
        },
        {
          title: 'What should I not use Luna29 for?',
          body: 'Emergency decisions, self-diagnosis, medication changes, or replacing therapy or psychiatric care. If you may be in danger, contact local emergency services immediately.',
        },
        {
          title: 'Why do I feel worse after learning about hormones?',
          body: 'Naming patterns can feel exposing at first. Treat each state as weather passing through — not as identity. Reduce inputs for a few days if you feel overloaded; the system waits for you.',
        },
      ],
    },
    {
      title: 'Daily Practice',
      intro: 'How experienced members use Luna29 without turning it into another obligation.',
      items: [
        {
          title: 'The 60-second check-in',
          body: 'Once a day: energy (low–high), sleep (rough–rested), one word for mood. That is enough to build a rhythm map over time.',
        },
        {
          title: 'Weekly review (10 minutes)',
          body: 'Look at the week as a strip, not as individual failures. Ask: which phase was this? what repeated? what was context (work, travel, conflict, illness)?',
        },
        {
          title: 'Voice before fix',
          body: 'When you feel tangled, record a Voice Note before searching for solutions. Often the need is witness, not advice.',
        },
        {
          title: 'Bridge before conflict',
          body: 'If a conversation matters, open The Bridge and draft two calm sentences about your state. Share capacity, not blame.',
        },
        {
          title: 'Export with intention',
          body: 'Export data when preparing for a visit, a therapist session, or your own monthly reflection — not from anxiety. You control the file.',
        },
      ],
    },
  ],
  ru: [
    {
      title: 'Ключевая терминология',
      intro: 'Эти термины встречаются на публичных страницах Luna29, в инструментах участника и в отчётах. Они описывают паттерны — не ярлыки личности.',
      items: [
        {
          title: 'Luna29 Balance',
          body: 'Визуальная карта ритма в центре системы. Она связывает контекст цикла, состояния чувствительности и ежедневные маркеры в одну читаемую картину — как погоду внутреннего состояния.',
        },
        {
          title: 'BioMath',
          body: 'Логика, которая связывает физиологические сигналы с понятными состояниями. BioMath не ставит диагноз — она упорядочивает ваши наблюдения в повторяемые паттерны.',
        },
        {
          title: 'Карта ритма',
          body: 'Просмотр по дням: где вы находитесь во внутреннем цикле. Помогает видеть смену фаз, а не только даты календаря.',
        },
        {
          title: 'Фаза / внутренний сезон',
          body: 'Luna29 описывает сегменты цикла как сезоны: обновление, рост, пик выражения и интеграция. У каждой фазы свой базовый уровень энергии, фокуса и чувствительности.',
        },
        {
          title: 'Состояние чувствительности',
          body: 'Читаемое резюме того, насколько реактивной или ресурсной ощущается система сегодня — например Steady, Elevated, Strained или Quiet. Это описание, не оценка.',
        },
        {
          title: 'Маркер',
          body: 'Любой сигнал, который вы вносите: сон, настроение, энергия, симптомы, анализы или голосовые рефлексии. Маркеры обретают смысл во времени.',
        },
        {
          title: 'Карта погоды',
          body: 'Метафора Luna29 для внутреннего состояния: условия меняются, все состояния допустимы, цель — ориентация, а не контроль.',
        },
        {
          title: 'Temporal Scrubber',
          body: 'Инструмент выравнивания карты с реальным телом, когда цикл нерегулярен, сдвинут или подвержен влиянию стресса и медикаментов.',
        },
        {
          title: 'Voice Note',
          body: 'Структурированная голосовая рефлексия. Голос часто передаёт нюанс быстрее текста; Luna29 слушает темы, а не «клинические баллы».',
        },
        {
          title: 'The Bridge (Мост)',
          body: 'Слой коммуникации: перевод внутреннего состояния в спокойный, уважительный язык для партнёра, семьи или коллег.',
        },
        {
          title: 'Ritual Path',
          body: 'Мягкий ежедневный ритм — путь, а не чеклист. Он бережёт внимание и сохраняет качество сигнала со временем.',
        },
        {
          title: 'Reset Room',
          body: 'Пространство для моментов перегруза. Это не экстренная помощь — пауза, заземление и выбор следующего безопасного шага.',
        },
        {
          title: 'Local-First',
          body: 'Ключевые записи остаются на устройстве, когда это возможно. Аккаунт, безопасность и отдельные функции могут использовать защищённый backend.',
        },
        {
          title: 'Health Report',
          body: 'Структурированный экспорт: маркеры и наблюдения в ясном документе для себя или для лицензированного специалиста.',
        },
      ],
    },
    {
      title: 'Ключевые идеи',
      intro: 'Принципы, которые формируют то, как Luna29 читает данные — и как читать Luna29 вам.',
      items: [
        {
          title: 'Зеркало, а не коуч',
          body: 'Luna29 отражает паттерны. Она не командует, не ставит оценки и не толкает в культуру «оптимизации». Вопрос: «Что я замечаю?» — а не «Где я провалилась?»',
        },
        {
          title: 'Сеть, а не один гормон',
          body: 'Энергия и настроение — результат взаимодействий: цикл, стресс, метаболизм, сон, контекст. Luna29 показывает связи, а не один изолированный показатель.',
        },
        {
          title: 'Паттерн важнее снимка',
          body: 'Один тяжёлый день — это данные, не приговор. Система полезна, когда сравниваете недели и фазы, а не одно утро.',
        },
        {
          title: 'Язык раньше диагноза',
          body: 'Многие приходят в Luna29 из-за нехватки слов для своего состояния. Ясный язык помогает в разговорах — но не заменяет врача.',
        },
        {
          title: 'Согласие и темп',
          body: 'Вы выбираете, что логировать, экспортировать и делиться. Luna29 рассчитана на устойчивое внимание: маленькие честные записи лучше идеальной ежедневности.',
        },
      ],
    },
    {
      title: 'Важные вопросы',
      intro: 'То, что пользователи спрашивают, когда начинают относиться к системе серьёзно.',
      items: [
        {
          title: 'С чего начать записи?',
          body: 'Три опоры: качество сна, энергия и одно предложение контекста («какой это был день?»). Добавьте день цикла, если знаете. Через неделю — голос или анализы, если они важны.',
        },
        {
          title: 'Что если цикл нерегулярен?',
          body: 'Ориентируйтесь на телесные признаки и Temporal Scrubber, не впихивая себя в шаблон 28 дней. Честность важнее искусственной точности.',
        },
        {
          title: 'Можно ли на гормональной контрацепции?',
          body: 'Да. Карта может быть ровнее — препарат стабилизирует колебания. Отслеживайте чувствительность, сон, настроение и стресс на этом фоне.',
        },
        {
          title: 'Когда нести отчёт врачу?',
          body: 'Когда замечаете устойчивый паттерн, влияющий на жизнь, или нужен язык для визита. Luna29 готовит наблюдение — медицинское решение принимает специалист.',
        },
        {
          title: 'Для чего Luna29 не подходит?',
          body: 'Для экстренных решений, самодиагностики, смены лекарств или замены терапии. При риске для жизни — сразу звоните в экстренные службы.',
        },
        {
          title: 'Почему после изучения гормонов стало хуже?',
          body: 'Называние паттернов сначала может быть неприятным. Относитесь к состоянию как к погоде — не к личности. При перегрузе сократите записи; система подождёт.',
        },
      ],
    },
    {
      title: 'Ежедневная практика',
      intro: 'Как опытные участники используют Luna29 без новой «обязаловки».',
      items: [
        {
          title: 'Check-in на 60 секунд',
          body: 'Раз в день: энергия, сон, одно слово настроения. Этого достаточно для карты ритма со временем.',
        },
        {
          title: 'Обзор недели (10 минут)',
          body: 'Смотрите неделю полосой. Какая была фаза? что повторилось? какой был контекст — работа, поездка, конфликт, болезнь?',
        },
        {
          title: 'Сначала голос, потом решение',
          body: 'Когда всё перепутано — Voice Note до поиска «фикса». Часто нужен свидетель, а не совет.',
        },
        {
          title: 'Мост до конфликта',
          body: 'Перед важным разговором откройте The Bridge и сформулируйте два спокойных предложения о состоянии. Делитесь ресурсом, не обвинением.',
        },
        {
          title: 'Экспорт осознанно',
          body: 'Экспортируйте перед визитом, сессией или месячной рефлексией — не из тревоги. Файл под вашим контролем.',
        },
      ],
    },
  ],
};

export function getTrainingViewContent(lang: Language): { copy: TrainingViewCopy; categories: AccordionCategory[] } {
  const copy = getLang(COPY, lang) || LEARNING_COPY_I18N[lang] || COPY.en;
  const categories = getLang(TRAINING_DATA, lang) || LEARNING_DATA_I18N[lang] || TRAINING_DATA.en;
  return { copy, categories };
}
