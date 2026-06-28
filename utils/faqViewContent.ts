import { Language, LangCopy, getLang } from '../constants';
import { FAQ_EXPANDED_BY_LANG } from './faqExpandedLocales';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  intro?: string;
  items: FAQItem[];
}

interface FAQViewCopy {
  back: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  promiseTitle: string;
  promiseQuote: string;
  commentsTitle: string;
  comments: Array<{ quote: string; author: string }>;
}

const FAQ_DATA: LangCopy< FAQCategory[]> = {
  en: [
    {
      title: "System Overview",
      intro: "Luna29 Balance is a physiology-oriented self-observation system. These answers define what the platform is — and what it deliberately is not.",
      items: [
        { q: "What is Luna29 Balance?", a: "Luna29 Balance is a visual mapping environment for physiological rhythm and inner state. It integrates cycle context, stress load, metabolic signals, and daily markers into a coherent 'weather map' — helping you see patterns across time rather than isolated data points.\n\nIt is designed for clarity and language, not clinical classification." },
        { q: "Who is Luna29 designed for?", a: "Any woman who wants a structured, calm way to understand energy shifts, mood variability, sensitivity, and cycle-related changes — at any stage of reproductive life, including perimenopause, postpartum recovery, or stable contraceptive baselines.\n\nYou do not need a regular cycle to benefit. You need honest observation." },
        { q: "How is Luna29 different from period trackers?", a: "Period apps optimize prediction. Luna29 optimizes interpretation.\n\nInstead of asking 'when is my next bleed?', Luna29 asks 'what conditions am I moving through, and how do they relate to sleep, stress, focus, and communication?' The body is treated as a connected network — not a calendar event." },
        { q: "Do I need medical training to use Luna29?", a: "No. Luna29 translates complex physiology into plain language, visual scales, and phase context. Technical concepts include short definitions inside the Learning section. The interface is built for daily life, not for clinicians." },
        { q: "What is the relationship between public pages and the member zone?", a: "Public pages explain philosophy, safety boundaries, and product orientation. The authenticated member zone contains personal tools: rhythm map, voice reflections, reports, Bridge communication aids, and export controls.\n\nNothing in your private journal is required to browse public content." },
      ]
    },
    {
      title: "Medical Scope & Safety",
      intro: "Luna29 operates in the wellness and education space. The following boundaries protect users and preserve trust.",
      items: [
        { q: "Is Luna29 a medical service or device?", a: "No. Luna29 is not a medical service, medical device, diagnostic instrument, or treatment provider. It does not hold clinical certification and must not be used as a substitute for licensed care." },
        { q: "Can Luna29 diagnose conditions?", a: "No. Luna29 identifies correlations and descriptive patterns based on data you provide. Correlation is not causation, and pattern language is not a diagnosis. Only a qualified clinician can confirm medical conditions." },
        { q: "Does Luna29 provide therapy?", a: "No. Voice reflections and state language may support emotional processing, but Luna29 is not psychotherapy, counseling, or psychiatric care. If you need mental health support, please contact a licensed professional." },
        { q: "Can Luna29 replace my doctor?", a: "No. Luna29 is a preparation layer: it helps you arrive at appointments with organized observations, timelines, and vocabulary. Medical decisions — including labs, medications, and referrals — remain exclusively between you and your clinician." },
        { q: "Is Luna29 appropriate for emergencies?", a: "No. If you may be in immediate danger, contact local emergency services. Reset Room offers grounding orientation only — not emergency response or crisis clinical care." },
        { q: "Can I change medications based on Luna29 insights?", a: "Never without your prescribing clinician. Luna29 does not recommend dosage changes, supplements, or treatment plans. Use reports as conversation material, not as instructions." },
      ]
    },
    {
      title: "Rhythm, Hormones & Daily Life",
      intro: "Luna29 reads physiology as dynamic context — not as a scorecard.",
      items: [
        { q: "Why do hormones affect mood and energy?", a: "Hormones modulate how neural circuits process stress, reward, and fatigue signals. They also influence metabolic throughput — how efficiently cells access fuel. Together, this creates a baseline 'indoor climate' that shifts across cycle phases, sleep debt, and life load." },
        { q: "Why is stress so influential?", a: "Cortisol is a priority signal. Under sustained stress, the system reallocates resources toward survival functions. Digestive ease, reproductive signaling, and cognitive flexibility may temporarily deprioritize — which is why stress can flatten or distort other rhythms you expect." },
        { q: "What does a 'Strained' sensitivity state mean?", a: "Strained indicates elevated demand relative to recovery: your system is maintaining function under load. In daily life this may feel like irritability, sensory overload, shallow sleep, or difficulty switching off. It is an orientation flag — not a moral judgment." },
        { q: "What if I don't have a classic 28-day cycle?", a: "Luna29 remains useful. Align the map using physical signs, energy arcs, and the Temporal Scrubber rather than forcing calendar symmetry. Approximate alignment with honest notes beats artificial precision." },
        { q: "What changes on hormonal birth control?", a: "Exogenous hormones often create a steadier baseline with reduced natural wave amplitude. You can still track sensitivity, sleep, mood, libido, and stress response — many users discover subtle patterns even on a flattened map." },
      ]
    },
    {
      title: "Data, Privacy & Control",
      intro: "Your biology is personal. Luna29 defaults to local-first architecture wherever feasible.",
      items: [
        { q: "What data does Luna29 process?", a: "Data you enter or generate: check-ins, cycle notes, voice reflections, optional lab imports, profile context, and technical logs required for authentication and stability. Luna29 does not silently harvest unrelated device data for advertising." },
        { q: "Where is my health data stored?", a: "Core wellness records are designed to remain on your device (local storage). Account credentials, security workflows, and selected cloud-backed features may use protected backend infrastructure — always disclosed in Privacy Notice." },
        { q: "Does Luna29 sell personal data?", a: "No. The business model is subscription-based access to tools — not data brokerage. We do not sell behavioral or physiological profiles to advertisers or third-party data markets." },
        { q: "How do exports work?", a: "You initiate exports manually. Health Reports and JSON exports generate files you control. Share only what you choose — with a clinician, partner, or for personal archive." },
        { q: "What happens if I clear browser storage?", a: "Local history may be deleted. We recommend periodic exports as personal backup. Authentication data may persist separately depending on configuration." },
      ]
    },
    {
      title: "Membership & Tools",
      intro: "Practical questions about access, reports, and day-to-day use inside Luna29.",
      items: [
        { q: "What do I get in the member zone?", a: "Interactive rhythm map, structured check-ins, Voice Note reflections, Health Reports, The Bridge communication aids, Ritual Path rhythm, Reset Room grounding, and export/privacy controls — unified under one calm interface." },
        { q: "Can I upload lab PDFs and scans to reports?", a: "Yes. My Health Reports accepts text, images, and PDF inputs for structured review. Outputs organize markers into visit-ready sections — still educational, not diagnostic." },
        { q: "Can reports match my interface language?", a: "Yes. Report generation can follow your active Luna29 language setting, supporting multilingual care conversations." },
        { q: "Where can partners learn supportive communication?", a: "See Partner FAQ and The Bridge. Both provide calm phrasing, capacity-based language, and context that reduces blame cycles in relationships." },
        { q: "How much time should I spend daily?", a: "Most members sustain value with 60–90 seconds of check-in plus occasional voice notes. Luna29 is designed for continuity, not compulsive tracking." },
      ]
    },
  ],
  ru: [
    {
      title: "Обзор системы",
      intro: "Luna29 Balance — система самонаблюдения, ориентированная на физиологию. Эти ответы определяют, что платформа собой представляет — и чем она сознательно не является.",
      items: [
        { q: "Что такое Luna29 Balance?", a: "Luna29 Balance — визуальная среда для картирования физиологического ритма и внутреннего состояния. Она объединяет контекст цикла, нагрузку стресса, метаболические сигналы и ежедневные маркеры в связную «карту погоды» — помогая видеть паттерны во времени, а не изолированные точки данных.\n\nСистема создана для ясности и языка, а не для клинической классификации." },
        { q: "Для кого предназначена Luna29?", a: "Для любой женщины, которой нужен структурированный и спокойный способ понимать сдвиги энергии, изменчивость настроения, чувствительность и цикл-связанные изменения — на любом этапе репродуктивной жизни, включая перименопаузу, послеродовое восстановление или стабильный базис на гормональной контрацепции.\n\nРегулярный цикл не обязателен. Нужно честное наблюдение." },
        { q: "Чем Luna29 отличается от трекеров цикла?", a: "Приложения для цикла оптимизируют предсказание. Luna29 оптимизирует интерпретацию.\n\nВместо вопроса «когда следующая менструация?» Luna29 спрашивает: «через какие условия я прохожу и как они связаны со сном, стрессом, фокусом и общением?» Тело рассматривается как связанная сеть — не как календарное событие." },
        { q: "Нужны ли медицинские знания?", a: "Нет. Luna29 переводит сложную физиологию на простой язык, визуальные шкалы и контекст фаз. Технические понятия с краткими определениями — в разделе Обучение. Интерфейс создан для повседневной жизни, а не для клиницистов." },
        { q: "Как связаны публичные страницы и зона участника?", a: "Публичные страницы объясняют философию, границы безопасности и ориентацию в продукте. Авторизованная зона участника содержит личные инструменты: карту ритма, голосовые рефлексии, отчёты, коммуникационные помощники Bridge, Ritual Path и контроль экспорта.\n\nДля просмотра публичного контента личный журнал не требуется." },
      ]
    },
    {
      title: "Медицинские границы и безопасность",
      intro: "Luna29 работает в пространстве wellness и образования. Следующие границы защищают пользователей и сохраняют доверие.",
      items: [
        { q: "Является ли Luna29 медицинской услугой или устройством?", a: "Нет. Luna29 не является медицинской услугой, медицинским изделием, диагностическим инструментом или поставщиком лечения. Система не имеет клинической сертификации и не должна использоваться как замена лицензированной помощи." },
        { q: "Может ли Luna29 ставить диагнозы?", a: "Нет. Luna29 выявляет корреляции и описательные паттерны на основе ваших данных. Корреляция — не причинность, а язык паттернов — не диагноз. Медицинские состояния подтверждает только квалифицированный врач." },
        { q: "Предоставляет ли Luna29 терапию?", a: "Нет. Голосовые рефлексии и язык состояния могут поддерживать эмоциональную обработку, но Luna29 — не психотерапия, консультирование или психиатрическая помощь. При необходимости обратитесь к лицензированному специалисту." },
        { q: "Может ли Luna29 заменить врача?", a: "Нет. Luna29 — слой подготовки: помогает прийти на приём с организованными наблюдениями, хронологией и словарём. Медицинские решения — анализы, лекарства, направления — остаются исключительно между вами и врачом." },
        { q: "Подходит ли Luna29 для экстренных ситуаций?", a: "Нет. При непосредственной опасности обращайтесь в экстренные службы. Reset Room предлагает только заземление — не экстренный ответ и не кризисную клиническую помощь." },
        { q: "Можно ли менять лекарства на основе Luna29?", a: "Никогда без назначившего врача. Luna29 не рекомендует изменения дозировок, добавки или планы лечения. Используйте отчёты как материал для разговора, а не как инструкции." },
      ]
    },
    {
      title: "Ритм, гормоны и повседневность",
      intro: "Luna29 читает физиологию как динамический контекст — не как табель успеваемости.",
      items: [
        { q: "Почему гормоны влияют на настроение и энергию?", a: "Гормоны модулируют обработку стресса, награды и сигналов усталости нейронными контурами. Они также влияют на метаболический поток — насколько эффективно клетки получают топливо. Вместе это создаёт базовый «внутренний климат», который меняется по фазам цикла, дефициту сна и жизненной нагрузке." },
        { q: "Почему стресс так влиятелен?", a: "Кортизол — сигнал приоритета. При устойчивом стрессе система перераспределяет ресурсы на функции выживания. Пищеварение, репродуктивная сигнализация и когнитивная гибкость могут временно уступить — поэтому стресс «сглаживает» или искажает ожидаемые ритмы." },
        { q: "Что означает состояние «Strained» (напряжение)?", a: "Strained указывает на повышенный спрос относительно восстановления: система поддерживает функцию под нагрузкой. В жизни это может ощущаться как раздражительность, сенсорная перегрузка, поверхностный сон или неспособность «выключиться». Это флаг ориентации — не моральная оценка." },
        { q: "Что если у меня нет классического 28-дневного цикла?", a: "Luna29 остаётся полезной. Выравнивайте карту по физическим признакам, дугам энергии и Temporal Scrubber, а не навязывайте календарную симметрию. Честные заметки с приблизительным выравниванием лучше искусственной точности." },
        { q: "Что меняется на гормональной контрацепции?", a: "Экзогенные гормоны часто создают более ровный базис с меньшей амплитудой волн. Вы всё равно можете отслеживать чувствительность, сон, настроение, либидо и стресс — многие пользователи находят тонкие паттерны даже на «сглаженной» карте." },
      ]
    },
    {
      title: "Данные, приватность и контроль",
      intro: "Ваша биология — личное. Luna29 по умолчанию использует local-first архитектуру, где это возможно.",
      items: [
        { q: "Какие данные обрабатывает Luna29?", a: "Данные, которые вы вводите или генерируете: check-in, заметки о цикле, голосовые рефлексии, опциональные импорты анализов, контекст профиля и технические логи для аутентификации и стабильности. Luna29 не собирает скрытно посторонние данные устройства для рекламы." },
        { q: "Где хранятся данные о здоровье?", a: "Основные wellness-записи спроектированы так, чтобы оставаться на вашем устройстве (local storage). Учётные данные, процессы безопасности и отдельные облачные функции могут использовать защищённый backend — всегда с раскрытием в Privacy Notice." },
        { q: "Продаёт ли Luna29 персональные данные?", a: "Нет. Модель — подписка на доступ к инструментам, а не брокеридж данных. Мы не продаём поведенческие или физиологические профили рекламодателям." },
        { q: "Как работает экспорт?", a: "Экспорт инициируете вы. Health Reports и JSON-экспорт создают файлы под вашим контролем. Делитесь только тем, что выбираете — с врачом, партнёром или для личного архива." },
        { q: "Что будет при очистке хранилища браузера?", a: "Локальная история может быть удалена. Рекомендуем периодический экспорт как личный бэкап. Данные аутентификации могут сохраняться отдельно в зависимости от конфигурации." },
      ]
    },
    {
      title: "Участие и инструменты",
      intro: "Практические вопросы о доступе, отчётах и ежедневном использовании Luna29.",
      items: [
        { q: "Что входит в зону участника?", a: "Интерактивная карта ритма, структурированные check-in, голосовые Voice Note, Health Reports, коммуникационные помощники The Bridge, Ritual Path, Reset Room и контроль экспорта/приватности — в одном спокойном интерфейсе." },
        { q: "Можно ли загружать PDF анализов в отчёты?", a: "Да. My Health Reports принимает текст, изображения и PDF для структурированного обзора. Результаты организуют маркеры в разделы для визита — всё ещё образовательно, не диагностически." },
        { q: "Могут ли отчёты быть на языке интерфейса?", a: "Да. Генерация отчётов может следовать активной языковой настройке Luna29 для многоязычных консультаций." },
        { q: "Где партнёру учиться поддерживающей коммуникации?", a: "См. Partner FAQ и The Bridge. Оба дают спокойные формулировки, язык ёмкости и контекст, снижающий циклы обвинений в отношениях." },
        { q: "Сколько времени нужно ежедневно?", a: "Большинству участников достаточно 60–90 секунд check-in плюс периодические голосовые заметки. Luna29 создана для непрерывности, а не для навязчивого трекинга." },
      ]
    },
  ],
  uk: FAQ_EXPANDED_BY_LANG.uk!,
  es: FAQ_EXPANDED_BY_LANG.es!,
  fr: FAQ_EXPANDED_BY_LANG.fr!,
  de: FAQ_EXPANDED_BY_LANG.de!,
  zh: FAQ_EXPANDED_BY_LANG.zh!,
  ja: FAQ_EXPANDED_BY_LANG.ja!,
  pt: FAQ_EXPANDED_BY_LANG.pt!,
  ar: [
    {
      title: "نظرة عامة على النظام",
      intro: "Luna29 Balance نظام للملاحظة الذاتية مرتكز على الفسيولوجيا. هذه الإجابات تحدد ما هي المنصة — وما هي عمداً ليست عليه.",
      items: [
        { q: "ما هو Luna29 Balance؟", a: "Luna29 Balance بيئة بصرية لرسم إيقاعاتك الفسيولوجية وحالتك الداخلية. يدمج سياق الدورة، حمل الإجهاد، إشارات الأيض، والعلامات اليومية في «خريطة طقس» متماسكة — لتري الأنماط عبر الزمن لا نقاطاً معزولة.\n\nصُمم للوضوح واللغة، لا للتصنيف السريري." },
        { q: "لمن صُممت Luna29؟", a: "لأي امرأة تريد طريقة هادئة ومنظمة لفهم تحولات الطاقة، تقلب المزاج، الحساسية، وتغيرات الدورة — في أي مرحلة من الحياة الإنجابية.\n\nلا يلزم دورة منتظمة. يلزم ملاحظة صادقة." },
        { q: "كيف تختلف عن متتبعات الدورة؟", a: "تطبيقات الدورة تُحسّن التنبؤ. Luna29 تُحسّن التفسير.\n\nبدلاً من «متى الدورة القادمة؟» تسأل: «ما الظروف التي أمر بها وكيف ترتبط بالنوم والإجهاد والتركيز؟» الجسم شبكة مترابطة — لا حدثاً تقويمياً." },
        { q: "هل أحتاج تدريباً طبياً؟", a: "لا. Luna29 تترجم الفسيولوجيا إلى لغة بسيطة ومقاييس بصرية وسياق مراحل. المفاهيم التقنية معرّفة في صفحة التعلّم. الواجهة للحياة اليومية." },
        { q: "ما العلاقة بين الصفحات العامة ومنطقة العضو؟", a: "الصفحات العامة تشرح الفلسفة وحدود الأمان. منطقة العضو تحتوي أدواتك الشخصية: خريطة الإيقاع، التأملات الصوتية، التقارير، The Bridge، Ritual Path، والتحكم بالتصدير.\n\nلا يلزم يومياتك الخاصة لتصفح المحتوى العام." },
      ]
    },
    {
      title: "النطاق الطبي والسلامة",
      intro: "Luna29 تعمل في فضاء العافية والتعليم. هذه الحدود تحمي المستخدمات وتحافظ على الثقة.",
      items: [
        { q: "هل Luna29 خدمة أو جهازاً طبياً؟", a: "لا. ليست خدمة طبية ولا جهازاً طبياً ولا أداة تشخيص ولا مقدّمة علاج. لا تحمل اعتماداً سريرياً ولا تُستخدم بديلاً عن رعاية مرخّصة." },
        { q: "هل يمكنها تشخيص حالات؟", a: "لا. تُظهر ارتباطات وأنماطاً وصفية من بياناتك. الارتباط ليس سبباً، ولغة النمط ليست تشخيصاً. التشخيص للطبيب المؤهل فقط." },
        { q: "هل تقدّم علاجاً نفسياً؟", a: "لا. التأملات الصوتية قد تدعم المعالجة العاطفية، لكن Luna29 ليست علاجاً نفسياً أو استشارة. للدعم النفسي، راجعي مختصاً مرخّصاً." },
        { q: "هل تستبدل الطبيب؟", a: "لا. هي طبقة تحضير: تنظّم ملاحظاتك قبل الموعد. القرارات الطبية — تحاليل، أدوية، إحالات — بينك وبين طبيبك حصراً." },
        { q: "هل مناسبة للطوارئ؟", a: "لا. عند الخطر الفوري اتصلي بخدمات الطوارئ. Reset Room للتثبيت فقط — لا استجابة طوارئ." },
        { q: "هل أغيّر الأدوية بناءً على Luna29؟", a: "أبداً دون طبيبك. لا توصي بتغيير جرعات أو مكملات. استخدمي التقارير للحوار لا كتعليمات." },
      ]
    },
    {
      title: "الإيقاع والهرمونات والحياة اليومية",
      intro: "Luna29 تقرأ الفسيولوجيا كسياق ديناميكي — لا كبطاقة تقييم.",
      items: [
        { q: "لماذا تؤثر الهرمونات على المزاج والطاقة؟", a: "تُعدّل معالجة الإجهاد والمكافأة والتعب في الدوائر العصبية، وتؤثر على الأيض — كفاءة وصول الخلايا للطاقة. معاً تخلق «مناخاً داخلياً» يتغير بالمراحل والنوم والحمل." },
        { q: "لماذا الإجهاد مؤثر جداً؟", a: "الكورتيزول إشارة أولوية. تحت إجهاد مستمر، يُعاد توزيع الموارد للبقاء. الهضم والإشارات الإنجابية والمرونة المعرفية قد تتراجع مؤقتاً." },
        { q: "ماذا يعني حالة Strained؟", a: "تدل على طلب مرتفع مقابل التعافي: النظام يحافظ على الوظيفة تحت الحمل. قد تشعرين بتهيج، حساسية مفرطة، نوم سطحي. إشارة توجيه — لا حكم." },
        { q: "ماذا إن لم يكن لدي دورة 28 يوماً؟", a: "Luna29 مفيدة. حاذي الخريطة بالعلامات الجسدية وTemporal Scrubber لا بالتقويم. الملاحظات الصادقة أفضل من دقة مصطنعة." },
        { q: "ماذا يتغير مع مانع الحمل الهرموني؟", a: "الهرمونات الخارجية غالباً تخلق خطاً أساسياً أثبت. ما زال بإمكانك تتبع الحساسية والنوم والمزاج — كثيرات يكتشفن أنماطاً دقيقة." },
      ]
    },
    {
      title: "البيانات والخصوصية والتحكم",
      intro: "بيولوجيتك شخصية. Luna29 تفترض local-first حيثما أمكن.",
      items: [
        { q: "ما البيانات التي تُعالج؟", a: "ما تدخلينه: check-in، ملاحظات الدورة، تأملات صوتية، تحاليل اختيارية، سياق الملف، وسجلات تقنية للمصادقة. لا تجمع بيانات جهاز غير ذات صلة للإعلان." },
        { q: "أين تُخزّن بيانات الصحة؟", a: "السجلات الأساسية على جهازك. الحساب والأمان قد يستخدمان backend محمياً — مُفصّل في إشعار الخصوصية." },
        { q: "هل تبيع Luna29 بياناتي؟", a: "لا. النموذج اشتراك — لا وساطة بيانات. لا نبيع ملفات سلوكية أو فسيولوجية للمعلنين." },
        { q: "كيف يعمل التصدير؟", a: "أنتِ من يبدئين. Health Reports وJSON تُنشئ ملفات تحت سيطرتك. شاركي ما تختارين فقط." },
        { q: "ماذا عند مسح تخزين المتصفح؟", a: "قد يُحذف السجل المحلي. ننصح بتصدير دوري كنسخة احتياطية." },
      ]
    },
    {
      title: "العضوية والأدوات",
      intro: "أسئلة عملية عن الوصول والتقارير والاستخدام اليومي.",
      items: [
        { q: "ماذا في منطقة العضو؟", a: "خريطة إيقاع تفاعلية، check-in منظم، Voice Note، Health Reports، The Bridge، Ritual Path، Reset Room، وضوابط التصدير — في واجهة هادئة واحدة." },
        { q: "هل أرفع PDF تحاليل للتقارير؟", a: "نعم. My Health Reports يقبل نصاً وصوراً وPDF. المخرجات منظمة للزيارة — تعليمية لا تشخيصية." },
        { q: "هل التقارير بلغة الواجهة؟", a: "نعم. يمكن أن تتبع إعداد اللغة النشط لدعم محادثات متعددة اللغات." },
        { q: "أين يتعلم الشريك التواصل الداعم؟", a: "Partner FAQ وThe Bridge — صياغات هادئة وسياق يقلل دورات اللوم." },
        { q: "كم وقت يومياً؟", a: "60–90 ثانية check-in مع ملاحظات صوتية أحياناً. Luna29 للاستمرارية لا للتتبع القهري." },
      ]
    },
  ],
  he: [
    {
      title: "סקירת המערכת",
      intro: "Luna29 Balance היא מערכת תצפית עצמית ממוקדת פיזיולוגיה. התשובות מגדירות מה הפלטפורמה — ומה היא במכוון לא.",
      items: [
        { q: "מה זה Luna29 Balance?", a: "Luna29 Balance היא סביבה ויזואלית למיפוי קצב פיזיולוגי ומצב פנימי. היא מחברת הקשר מחזור, עומס לחץ, אותות חילוף חומרים וסמנים יומיים ל«מפת מזג אוויר» אחידה — כדי לראות דפוסים לאורך זמן.\n\nהיא נועדה לבהירות ושפה, לא לסיווג רפואי." },
        { q: "למי Luna29 מיועדת?", a: "לכל אישה שרוצה דרך רגועה ומובנית להבין שינויי אנרגיה, מצב רוח, רגישות ושינויי מחזור — בכל שלב בחיים.\n\nמחזור סדיר לא חובה. נדרשת תצפית כנה." },
        { q: "במה זה שונה ממעקבי מחזור?", a: "אפליקציות מחזור מייעלות חיזוי. Luna29 מייעלת פרשנות.\n\nבמקום «מתי הדימום הבא?» שואלת «באילו תנאים אני עוברת ואיך זה קשור לשינה, לחץ ותקשורת?» הגוף הוא רשת — לא אירוע ביומן." },
        { q: "האם צריך הכשרה רפואית?", a: "לא. Luna29 מתרגמת פיזיולוגיה לשפה פשוטה, סולמות ויזואליים והקשר פאזות. מושגים טכניים מוגדרים בדף הלימוד." },
        { q: "מה הקשר בין דפים ציבוריים לאזור חבר?", a: "דפים ציבוריים מסבירים פילוסופיה וגבולות בטיחות. אזור החבר כולל כלים אישיים: מפת קצב, Voice Note, דוחות, The Bridge, Ritual Path ושליטה בייצוא." },
      ]
    },
    {
      title: "היקף רפואי ובטיחות",
      intro: "Luna29 פועלת בתחום wellness וחינוך. הגבולות הבאים מגנים על משתמשות ושומרים אמון.",
      items: [
        { q: "האם Luna29 שירות או מכשיר רפואי?", a: "לא. אינה שירות רפואי, מכשיר, כלי אבחון או ספק טיפול. אין לה הסמכה קלינית רשמית ואין להחליף טיפול מורשה." },
        { q: "האם Luna29 מאבחנת?", a: "לא. היא מזהה מתאמים ודפוסים תיאוריים מנתוניך. מתאם אינו סיבתיות; שפת דפוס אינה אבחנה." },
        { q: "האם Luna29 מספקת טיפול?", a: "לא. רפלקציות קוליות עשויות לתמוך בעיבוד רגשי, אך Luna29 אינה פסיכותרפיה. לתמיכה נפשית פני למומחה מורשה." },
        { q: "האם Luna29 מחליפה רופא?", a: "לא. היא שכבת הכנה: מארגנת תצפיות לפני ביקור. החלטות רפואיות — בינך לרופא בלבד." },
        { q: "האם מתאימה לחירום?", a: "לא. בסכנה מיידית פני לשירותי חירום. Reset Room לעיגון בלבד — לא תגובת חירום." },
        { q: "האם לשנות תרופות לפי Luna29?", a: "לעולם לא בלי הרופא המטפל. אין המלצות על מינונים או תוספים. דוחות לשיחה — לא להוראות." },
      ]
    },
    {
      title: "קצב, הורמונים וחיי יום-יום",
      intro: "Luna29 קוראת פיזיולוגיה כהקשר דינמי — לא כציון.",
      items: [
        { q: "למה הורמונים משפיעים על מצב רוח ואנרגיה?", a: "הם מתאמים את עיבוד הלחץ, התגמול והעייפות; משפיעים על קצב חילוף החומרים — יעילות אספקת אנרגיה לתאים. יחד יוצרים «מזג פנימי»." },
        { q: "למה לחץ כל כך משפיע?", a: "קורטיזול הוא אות עדיפות. תחת לחץ מתמשך המערכת מקצה משאבים להישרדות. עיכול, אותות פוריות וגמישות קוגניטיבית עלולים להידחק." },
        { q: "מה אומר מצב Strained?", a: "ביקוש גבוה יחסית להתאוששות: המערכת שומרת על תפקוד תחת עומס. עשוי להרגיש כעצבנות, עומס חושי, שינה רדודה. דגל כיוון — לא שיפוט." },
        { q: "מה אם אין מחזור 28 יום?", a: "Luna29 עדיין שימושית. יישרי עם סימנים גופניים וTemporal Scrubber. הערות כנות עדיפות על דיוק מלאכותי." },
        { q: "מה משתנה בשימוש בגלולות הורמונליות?", a: "הורמונים חיצוניים יוצרים קו בסיס יציב יותר. עדיין אפשר לעקוב אחר רגישות, שינה, מצב רוח — דפוסים עדינים קיימים." },
      ]
    },
    {
      title: "נתונים, פרטיות ושליטה",
      intro: "הביולוגיה שלך אישית. Luna29 מניחה local-first בכל מקום שאפשר.",
      items: [
        { q: "אילו נתונים Luna29 מעבדת?", a: "מה שאת מזינה: check-in, הערות מחזור, Voice Note, ייבוא בדיקות, הקשר פרופיל ולוגים טכניים. לא אוספת נתוני מכשיר לפרסום." },
        { q: "איפה נשמרים נתוני בריאות?", a: "רשומות wellness על המכשיר. חשבון/אבטחה עשויים backend מוגן — מפורט בPrivacy Notice." },
        { q: "האם Luna29 מוכרת נתונים?", a: "לא. מודל מנוי — לא brokerage. לא מוכרים פרופילים התנהגותיים או פיזיולוגיים." },
        { q: "איך עובד ייצוא?", a: "את מתחילה. Health Reports וJSON יוצרים קבצים בשליטתך. שתפי רק מה שבוחרת." },
        { q: "מה אם מנקים storage בדפדפן?", a: "היסטוריה מקומית עלולה להימחק. מומלץ ייצוא תקופתי." },
      ]
    },
    {
      title: "חברות וכלים",
      intro: "שאלות מעשיות על גישה, דוחות ושימוש יומי.",
      items: [
        { q: "מה באזור החבר?", a: "מפת קצב אינטראקטיבית, check-in, Voice Note, Health Reports, The Bridge, Ritual Path, Reset Room ושליטה בייצוא — בממשק אחד." },
        { q: "האם מעלים PDF בדיקות?", a: "כן. My Health Reports מקבל text, תמונות וPDF. פלט מסודר לביקור — חינוכי לא אבחוני." },
        { q: "האם דוחות בשפת הממשק?", a: "כן. יכולים לעקוב אחר הגדרת השפה הפעילה." },
        { q: "איפה בן/בת זוג לומדים תמיכה?", a: "Partner FAQ וThe Bridge — ניסוח רגוע והקשר שמפחית מחזורי האשמה." },
        { q: "כמה זמן ביום?", a: "60–90 שניות check-in עם Voice Note מדי פעם. Luna29 לרציפות — לא מעקב כפייתי." },
      ]
    },
  ],
};

const CORE_FAQ_BY_LANG: LangCopy< FAQItem[]> = {
  en: [
    { q: 'Is Luna29 medical?', a: 'No. Luna29 is not a medical service, medical device, diagnostic tool, or treatment provider.' },
    { q: 'Is Luna29 therapy?', a: 'No. Luna29 is not therapy and does not replace mental health professionals.' },
    { q: 'What data does Luna29 use?', a: 'Luna29 uses your in-app inputs: check-ins, reflections, optional profile context, and usage events required for functionality.' },
    { q: 'Can Luna29 replace a doctor?', a: 'No. Luna29 helps you organize observations before consultation. Medical decisions must be made with licensed clinicians.' },
    { q: 'How private is Luna29?', a: 'Luna29 is local-first in development mode. Your data stays on device unless you export/share it.' },
    { q: 'Can I upload scans and lab PDFs to reports?', a: 'Yes. My Health Reports accepts text, images, and PDF files for extraction and structured review in one report flow.' },
    { q: 'Can report language match my selected app language?', a: 'Yes. Reports and key explanations can be generated in your active interface language.' },
    { q: 'Where can partners learn how to support without pressure?', a: 'Open PARTNER FAQ and The Bridge sections. They provide calm wording, context, and communication guidance.' },
  ],
  ru: [
    { q: 'Luna29 является медицинским сервисом?', a: 'Нет. Luna29 не является медицинской услугой, устройством, диагностикой или лечением.' },
    { q: 'Luna29 это терапия?', a: 'Нет. Luna29 не является психотерапией и не заменяет специалистов по психическому здоровью.' },
    { q: 'Какие данные использует Luna29?', a: 'Luna29 использует ваши данные внутри приложения: check-in, рефлексии, контекст профиля и сервисные события для работы функций.' },
    { q: 'Может ли Luna29 заменить врача?', a: 'Нет. Luna29 помогает структурировать наблюдения перед консультацией. Медицинские решения принимаются только с лицензированным врачом.' },
    { q: 'Насколько приватна Luna29?', a: 'В режиме разработки Luna29 local-first: данные остаются на устройстве, пока вы сами их не экспортируете/поделитесь.' },
    { q: 'Можно загружать сканы и PDF анализов в отчеты?', a: 'Да. My Health Reports принимает текст, изображения и PDF-файлы для распознавания и структурированного разбора в одном потоке.' },
    { q: 'Можно ли делать отчеты на выбранном языке?', a: 'Да. Отчеты и ключевые пояснения могут генерироваться на активном языке интерфейса.' },
    { q: 'Где партнеру понять, как поддерживать без давления?', a: 'Откройте разделы PARTNER FAQ и The Bridge. Там есть спокойные формулировки, контекст и правила коммуникации.' },
  ],
  uk: [
    { q: 'Luna29 є медичним сервісом?', a: 'Ні. Luna29 не є медичною послугою, пристроєм, діагностикою або лікуванням.' },
    { q: 'Luna29 це терапія?', a: 'Ні. Luna29 не є психотерапією і не замінює фахівців із ментального здоровʼя.' },
    { q: 'Які дані використовує Luna29?', a: 'Luna29 використовує ваші дані в застосунку: check-in, рефлексії, контекст профілю та технічні події для роботи функцій.' },
    { q: 'Чи може Luna29 замінити лікаря?', a: 'Ні. Luna29 допомагає структурувати спостереження перед консультацією. Медичні рішення ухвалюються лише з ліцензованим лікарем.' },
    { q: 'Наскільки приватна Luna29?', a: 'У dev-режимі Luna29 local-first: дані залишаються на вашому пристрої, поки ви самі не експортуєте або не поділитеся ними.' },
    { q: 'Чи можна завантажувати скани та PDF аналізів у звіти?', a: 'Так. My Health Reports приймає текст, зображення і PDF для розпізнавання та структурованого розбору.' },
    { q: 'Чи можна формувати звіти мовою інтерфейсу?', a: 'Так. Звіти та ключові пояснення можуть генеруватись активною мовою застосунку.' },
    { q: 'Де партнеру зрозуміти, як підтримувати без тиску?', a: 'Відкрийте PARTNER FAQ та The Bridge — там є спокійні формулювання і правила комунікації.' },
  ],
  es: [
    { q: '¿Luna29 es médica?', a: 'No. Luna29 no es un servicio médico, dispositivo médico, herramienta diagnóstica ni proveedor de tratamiento.' },
    { q: '¿Luna29 es terapia?', a: 'No. Luna29 no es terapia y no reemplaza a profesionales de salud mental.' },
    { q: '¿Qué datos usa Luna29?', a: 'Luna29 usa tus entradas en la app: check-ins, reflexiones, contexto opcional del perfil y eventos técnicos necesarios para el funcionamiento.' },
    { q: '¿Puede Luna29 reemplazar a un médico?', a: 'No. Luna29 ayuda a organizar observaciones antes de una consulta. Las decisiones médicas deben tomarse con profesionales licenciados.' },
    { q: '¿Qué tan privada es Luna29?', a: 'En modo desarrollo, Luna29 es local-first. Tus datos permanecen en el dispositivo salvo que los exportes o compartas.' },
    { q: '¿Puedo subir escaneos y PDFs de laboratorio a los reportes?', a: 'Sí. My Health Reports acepta texto, imágenes y PDF para extracción y revisión estructurada.' },
    { q: '¿El reporte puede generarse en el idioma seleccionado?', a: 'Sí. El reporte y sus explicaciones clave se pueden generar en el idioma activo de la interfaz.' },
    { q: '¿Dónde aprende la pareja a apoyar sin presión?', a: 'En PARTNER FAQ y The Bridge. Ahí hay contexto y frases claras para comunicar sin conflicto.' },
  ],
  fr: [
    { q: 'Luna29 est-elle médicale ?', a: 'Non. Luna29 n est ni un service médical, ni un dispositif médical, ni un outil de diagnostic ou de traitement.' },
    { q: 'Luna29 est-elle une thérapie ?', a: 'Non. Luna29 n est pas une thérapie et ne remplace pas les professionnels de santé mentale.' },
    { q: 'Quelles données Luna29 utilise-t-elle ?', a: 'Luna29 utilise vos entrées dans l application : check-ins, réflexions, contexte de profil optionnel et événements techniques nécessaires.' },
    { q: 'Luna29 peut-elle remplacer un médecin ?', a: 'Non. Luna29 aide à structurer les observations avant consultation. Les décisions médicales doivent être prises avec des professionnels agréés.' },
    { q: 'Quel est le niveau de confidentialité ?', a: 'En mode développement, Luna29 est local-first. Les données restent sur l appareil sauf export ou partage volontaire.' },
    { q: 'Puis-je importer des scans et PDF de laboratoire dans les rapports ?', a: 'Oui. My Health Reports accepte texte, images et PDF pour extraction et synthèse structurée.' },
    { q: 'Le rapport peut-il être généré dans la langue choisie ?', a: 'Oui. Le rapport et ses explications principales suivent la langue active de l interface.' },
    { q: 'Où le partenaire apprend-il à soutenir sans pression ?', a: 'Dans PARTNER FAQ et The Bridge. Vous y trouverez contexte et formulations calmes.' },
  ],
  de: [
    { q: 'Ist Luna29 medizinisch?', a: 'Nein. Luna29 ist kein medizinischer Dienst, kein Medizinprodukt, kein Diagnosetool und kein Behandlungsanbieter.' },
    { q: 'Ist Luna29 Therapie?', a: 'Nein. Luna29 ist keine Therapie und ersetzt keine Fachkräfte für psychische Gesundheit.' },
    { q: 'Welche Daten nutzt Luna29?', a: 'Luna29 nutzt deine In-App-Eingaben: Check-ins, Reflexionen, optionalen Profilkontext und technische Ereignisse für die Funktion.' },
    { q: 'Kann Luna29 einen Arzt ersetzen?', a: 'Nein. Luna29 hilft, Beobachtungen vor einem Termin zu strukturieren. Medizinische Entscheidungen gehören zu lizenzierten Fachkräften.' },
    { q: 'Wie privat ist Luna29?', a: 'Im Entwicklungsmodus arbeitet Luna29 local-first. Daten bleiben auf dem Gerät, außer bei aktivem Export/Teilen.' },
    { q: 'Kann ich Scans und Labor-PDFs in Berichte hochladen?', a: 'Ja. My Health Reports akzeptiert Text, Bilder und PDF-Dateien für Extraktion und strukturierte Auswertung.' },
    { q: 'Kann der Bericht in der gewählten Sprache erstellt werden?', a: 'Ja. Bericht und Kern-Erklärungen folgen der aktiven App-Sprache.' },
    { q: 'Wo lernt ein Partner Unterstützung ohne Druck?', a: 'In PARTNER FAQ und The Bridge. Dort gibt es ruhige Formulierungen und klare Kommunikationshilfe.' },
  ],
  zh: [
    { q: 'Luna29 是医疗服务吗？', a: '不是。Luna29 不是医疗服务、医疗设备、诊断工具或治疗提供方。' },
    { q: 'Luna29 是治疗吗？', a: '不是。Luna29 不是心理治疗，不能替代心理健康专业人员。' },
    { q: 'Luna29 使用哪些数据？', a: 'Luna29 使用你在应用内输入的数据：check-in、反思、可选资料上下文，以及功能运行所需的技术事件。' },
    { q: 'Luna29 能替代医生吗？', a: '不能。Luna29 用于在就诊前整理观察信息。医疗决策必须由持证专业人士做出。' },
    { q: 'Luna29 的隐私如何？', a: '在开发模式下，Luna29 采用 local-first。除非你主动导出或分享，数据都保留在本地设备。' },
    { q: '可以上传化验单扫描件和 PDF 吗？', a: '可以。My Health Reports 支持文本、图片和 PDF 的提取与结构化整理。' },
    { q: '报告能按当前语言生成吗？', a: '可以。报告及关键解释可按当前界面语言生成。' },
    { q: '伴侣如何学习“无压力支持”？', a: '请查看 PARTNER FAQ 与 The Bridge，提供清晰、平和的沟通方式。' },
  ],
  ja: [
    { q: 'Luna29 は医療サービスですか？', a: 'いいえ。Luna29 は医療サービス、医療機器、診断ツール、治療提供者ではありません。' },
    { q: 'Luna29 はセラピーですか？', a: 'いいえ。Luna29 はセラピーではなく、メンタルヘルス専門家の代替にはなりません。' },
    { q: 'Luna29 はどのデータを使いますか？', a: 'Luna29 はアプリ内入力（check-in、リフレクション、任意のプロフィール文脈、機能に必要な技術イベント）を使います。' },
    { q: 'Luna29 は医師の代わりになりますか？', a: 'いいえ。Luna29 は受診前の観察整理に使います。医療判断は有資格の専門家と行ってください。' },
    { q: 'Luna29 のプライバシーは？', a: '開発モードでは local-first で動作します。エクスポート/共有しない限り、データは端末内に保持されます。' },
    { q: '検査スキャンやPDFをレポートにアップロードできますか？', a: 'はい。My Health Reports はテキスト・画像・PDF の抽出と整理に対応しています。' },
    { q: 'レポートは選択言語で生成できますか？', a: 'はい。レポートと主要説明は現在の表示言語で生成できます。' },
    { q: 'パートナーが無理なく支える方法はどこで学べますか？', a: 'PARTNER FAQ と The Bridge を確認してください。落ち着いた伝え方を案内します。' },
  ],
  pt: [
    { q: 'Luna29 é médica?', a: 'Não. Luna29 não é serviço médico, dispositivo médico, ferramenta diagnóstica nem provedora de tratamento.' },
    { q: 'Luna29 é terapia?', a: 'Não. Luna29 não é terapia e não substitui profissionais de saúde mental.' },
    { q: 'Quais dados a Luna29 usa?', a: 'A Luna29 usa suas entradas no app: check-ins, reflexões, contexto opcional de perfil e eventos técnicos necessários ao funcionamento.' },
    { q: 'A Luna29 pode substituir um médico?', a: 'Não. Luna29 ajuda a organizar observações antes da consulta. Decisões médicas devem ser tomadas com profissionais licenciados.' },
    { q: 'Quão privada é a Luna29?', a: 'No modo de desenvolvimento, Luna29 é local-first. Os dados ficam no dispositivo, salvo quando você exporta ou compartilha.' },
    { q: 'Posso enviar scans e PDFs de exames para os relatórios?', a: 'Sim. My Health Reports aceita texto, imagem e PDF para extração e organização estruturada.' },
    { q: 'O relatório pode ser gerado no idioma escolhido?', a: 'Sim. O relatório e as explicações principais seguem o idioma ativo da interface.' },
    { q: 'Onde o parceiro aprende a apoiar sem pressão?', a: 'Veja PARTNER FAQ e The Bridge, com contexto e linguagem clara para conversa respeitosa.' },
  ],
  ar: [
    { q: 'هل Luna29 طبية؟', a: 'لا. Luna29 ليست خدمة طبية ولا جهازاً طبياً ولا أداة تشخيص ولا مقدّمة علاج.' },
    { q: 'هل Luna29 علاجاً نفسياً؟', a: 'لا. ليست علاجاً نفسياً ولا تُستبدل مختصي الصحة النفسية.' },
    { q: 'ما البيانات التي تستخدمها Luna29؟', a: 'مدخلاتك في التطبيق: check-in، تأملات، سياق الملف، وأحداث تقنية ضرورية للعمل.' },
    { q: 'هل تستبدل Luna29 الطبيب؟', a: 'لا. تساعد على تنظيم الملاحظات قبل الاستشارة. القرارات الطبية مع مختص مرخّص.' },
    { q: 'ما مستوى الخصوصية؟', a: 'Luna29 local-first: البيانات على الجهاز ما لم تصدّريها أو تشاركيها.' },
    { q: 'هل أرفع مسوحات وPDF تحاليل للتقارير؟', a: 'نعم. My Health Reports يقبل نصاً وصوراً وPDF للاستخراج والمراجعة المنظمة.' },
    { q: 'هل يُنشأ التقرير بلغة الواجهة؟', a: 'نعم. التقرير والشروحات الرئيسية تتبع اللغة النشطة.' },
    { q: 'أين يتعلم الشريك الدعم بلا ضغط؟', a: 'Partner FAQ وThe Bridge — سياق وصياغة هادئة.' },
  ],
  he: [
    { q: 'האם Luna29 רפואית?', a: 'לא. Luna29 אינה שירות רפואי, מכשיר רפואי, כלי אבחון או ספק טיפול.' },
    { q: 'האם Luna29 טיפול?', a: 'לא. אינה פסיכותרפיה ואינה מחליפה אנשי מקצוע לבריאות הנפש.' },
    { q: 'אילו נתונים Luna29 משתמשת?', a: 'קלט באפליקציה: check-in, רפלקציות, הקשר פרופיל ואירועים טכניים לתפקוד.' },
    { q: 'האם Luna29 מחליפה רופא?', a: 'לא. עוזרת לארגן תצפיות לפני ייעוץ. החלטות רפואיות עם בעל רישיון.' },
    { q: 'מה רמת הפרטיות?', a: 'Luna29 local-first: נתונים במכשיר אלא אם מייצאים או משתפים.' },
    { q: 'האם מעלים סריקות ו-PDF לדוחות?', a: 'כן. My Health Reports מקבל text, תמונות ו-PDF לחילוץ וסקירה מובנית.' },
    { q: 'האם הדוח בשפת הממשק?', a: 'כן. הדוח וההסברים העיקריים עוקבים אחר השפה הפעילה.' },
    { q: 'איפה בן/בת זוג לומדים תמיכה?', a: 'Partner FAQ ו-The Bridge — ניסוח רגוע והקשר ברור.' },
  ],
};

const CORE_TITLE_BY_LANG: LangCopy< string> = {
  en: 'Core FAQ',
  ru: 'Ключевые Вопросы',
  uk: 'Ключові Питання',
  es: 'FAQ Principal',
  fr: 'FAQ Principal',
  de: 'Kern-FAQ',
  zh: '核心 FAQ',
  ja: 'コアFAQ',
  pt: 'FAQ Principal',
  ar: 'الأسئلة الجوهرية',
  he: 'שאלות מרכזיות',
};

const REPORT_FAQ_BY_LANG: LangCopy< FAQCategory> = {
  en: {
    title: 'Health Reports & Women Clinical Insights',
    items: [
      { q: 'What makes My Health Reports useful for women?', a: 'The report interprets female-specific hormone patterns (cycle, thyroid, metabolic, androgen, libido-related) and explains how they may connect with symptoms, not just raw numbers.' },
      { q: 'Does it analyze combinations, risks, and side effects?', a: 'Yes. The report highlights hormone combinations, potential effects on mood/sleep/libido/energy, potential risks, and practical next-step recommendations for discussion with your clinician.' },
      { q: 'Can I use the report in a doctor appointment?', a: 'Yes. The layout is doctor-ready: clear sections, marker table, status indicators, trend logic, and questions to discuss. It is designed to save consultation time.' },
      { q: 'Is this a diagnosis?', a: 'No. Luna29 provides educational pattern interpretation and preparation support. Diagnosis and treatment decisions must be made by licensed medical professionals.' },
    ],
  },
  ru: {
    title: 'Health Reports И Клинические Инсайты Для Женщин',
    items: [
      { q: 'Что делает My Health Reports полезным для женщин?', a: 'Отчет интерпретирует женские гормональные паттерны (цикл, щитовидка, метаболизм, андрогены, либидо) и связывает их с симптомами, а не просто показывает цифры.' },
      { q: 'Анализируются ли сочетания, риски и побочные эффекты?', a: 'Да. Отчет выделяет сочетания гормонов, возможные эффекты на настроение/сон/либидо/энергию, потенциальные риски и практические шаги для обсуждения с врачом.' },
      { q: 'Можно ли использовать отчет на приеме у врача?', a: 'Да. Формат подготовлен для консультации: понятные разделы, таблица маркеров, статусы, логика тенденций и вопросы к врачу.' },
      { q: 'Это диагноз?', a: 'Нет. Luna29 дает образовательную интерпретацию паттернов и поддержку подготовки. Диагноз и лечение определяет лицензированный врач.' },
    ],
  },
  uk: {
    title: 'Health Reports І Клінічні Інсайти Для Жінок',
    items: [
      { q: 'Що робить My Health Reports корисним для жінок?', a: 'Звіт інтерпретує жіночі гормональні патерни (цикл, щитоподібна, метаболізм, андрогени, лібідо) і пов’язує їх із симптомами, а не лише з числами.' },
      { q: 'Чи аналізуються поєднання, ризики та побічні ефекти?', a: 'Так. Звіт показує гормональні поєднання, можливі ефекти на настрій/сон/лібідо/енергію, потенційні ризики та практичні кроки для лікаря.' },
      { q: 'Чи можна використовувати звіт на прийомі?', a: 'Так. Формат підготовлено для консультації: чіткі розділи, таблиця маркерів, статуси, логіка тренду і питання до лікаря.' },
      { q: 'Це діагноз?', a: 'Ні. Luna29 дає освітню інтерпретацію патернів і підтримку підготовки. Діагноз і лікування визначає ліцензований лікар.' },
    ],
  },
  es: {
    title: 'Health Reports E Insights Clínicos Femeninos',
    items: [
      { q: '¿Qué hace útil My Health Reports para mujeres?', a: 'Interpreta patrones hormonales femeninos y los relaciona con síntomas (energía, ánimo, sueño, libido), no solo con valores sueltos.' },
      { q: '¿Analiza combinaciones, riesgos y efectos?', a: 'Sí. Destaca combinaciones hormonales, posibles efectos, riesgos potenciales y recomendaciones prácticas para comentar con tu médica/o.' },
      { q: '¿Puedo usar el reporte en consulta?', a: 'Sí. El formato está listo para consulta médica: secciones claras, tabla de marcadores, estados y preguntas clínicas.' },
      { q: '¿Es un diagnóstico?', a: 'No. Luna29 ofrece interpretación educativa y apoyo de preparación. El diagnóstico y tratamiento los define un profesional de salud.' },
    ],
  },
  fr: {
    title: 'Health Reports Et Insights Cliniques Féminins',
    items: [
      { q: 'Pourquoi My Health Reports est utile pour les femmes ?', a: 'Le rapport interprète les profils hormonaux féminins et les relie aux symptômes, au-delà des valeurs isolées.' },
      { q: 'Analyse-t-il combinaisons, risques et effets ?', a: 'Oui. Il met en évidence les combinaisons hormonales, effets possibles, risques potentiels et recommandations à discuter en consultation.' },
      { q: 'Puis-je utiliser ce rapport avec mon médecin ?', a: 'Oui. Le format est prêt pour la consultation: sections claires, tableau des marqueurs, statuts et questions cliniques.' },
      { q: 'Est-ce un diagnostic ?', a: 'Non. Luna29 fournit une interprétation éducative et un support de préparation. Le diagnostic et le traitement relèvent d’un professionnel de santé.' },
    ],
  },
  de: {
    title: 'Health Reports Und Klinische Frauen-Insights',
    items: [
      { q: 'Was macht My Health Reports für Frauen nützlich?', a: 'Der Bericht interpretiert frauenspezifische Hormonmuster und verknüpft sie mit Symptomen statt nur Einzelwerten.' },
      { q: 'Werden Kombinationen, Risiken und Effekte analysiert?', a: 'Ja. Der Bericht zeigt Hormon-Kombinationen, potenzielle Effekte, Risiken und praktische Empfehlungen für das Arztgespräch.' },
      { q: 'Kann ich den Bericht im Arzttermin nutzen?', a: 'Ja. Das Format ist arztfertig: klare Abschnitte, Markertabelle, Statusindikatoren und Gesprächsfragen.' },
      { q: 'Ist das eine Diagnose?', a: 'Nein. Luna29 bietet edukative Musterinterpretation und Vorbereitung. Diagnose und Therapie erfolgen durch medizinisches Fachpersonal.' },
    ],
  },
  zh: {
    title: 'Health Reports 与女性临床洞察',
    items: [
      { q: '为什么 My Health Reports 对女性有价值？', a: '报告会解读女性激素模式（周期、甲状腺、代谢、雄激素、性健康）并关联症状，而不是只给数值。' },
      { q: '会分析组合、风险和潜在影响吗？', a: '会。报告会标出激素组合、潜在影响、潜在风险，并给出可与医生讨论的下一步建议。' },
      { q: '报告可以直接用于就诊吗？', a: '可以。结构是就诊友好的：分区清晰、指标表、状态标签、趋势逻辑和医生沟通问题。' },
      { q: '这算医疗诊断吗？', a: '不算。Luna29 提供教育性解读与就诊准备支持，诊断和治疗必须由持证医生决定。' },
    ],
  },
  ja: {
    title: 'Health Reports と女性向け臨床インサイト',
    items: [
      { q: 'My Health Reports が女性に有用な理由は？', a: '女性特有のホルモンパターンを症状と関連づけて解釈し、単なる数値表示で終わらせません。' },
      { q: '組み合わせ・リスク・影響も分析しますか？', a: 'はい。ホルモンの組み合わせ、想定影響、潜在リスク、医師相談用の実行提案を示します。' },
      { q: '診察で使えますか？', a: 'はい。医師向けに使える形式です。セクション整理、マーカー表、ステータス、確認質問を含みます。' },
      { q: '診断になりますか？', a: 'いいえ。Luna29 は教育的解釈と準備支援です。診断・治療は医療資格者が行います。' },
    ],
  },
  pt: {
    title: 'Health Reports E Insights Clínicos Femininos',
    items: [
      { q: 'O que torna My Health Reports útil para mulheres?', a: 'O relatório interpreta padrões hormonais femininos e conecta os achados aos sintomas, não apenas a números isolados.' },
      { q: 'Ele analisa combinações, riscos e efeitos?', a: 'Sim. Mostra combinações hormonais, efeitos potenciais, riscos e recomendações práticas para discutir com a médica/o.' },
      { q: 'Posso usar o relatório na consulta?', a: 'Sim. O formato é clínico: seções claras, tabela de marcadores, status e perguntas para consulta.' },
      { q: 'Isso é diagnóstico?', a: 'Não. Luna29 oferece interpretação educativa e apoio de preparo. Diagnóstico e tratamento são definidos por profissional de saúde.' },
    ],
  },
  ar: {
    title: 'Health Reports ورؤى سريرية للنساء',
    items: [
      { q: 'ما الذي يجعل My Health Reports مفيداً للنساء؟', a: 'يفسر أنماط هرمونية نسائية ويربطها بالأعراض — لا بالأرقام فقط.' },
      { q: 'هل يحلل التركيبات والمخاطر؟', a: 'نعم. يُبرز تركيبات هرمونية، التأثيرات المحتملة، المخاطر، وخطوات للنقاش مع الطبيب.' },
      { q: 'هل أستخدم التقرير في الموعد؟', a: 'نعم. التنسيق جاهز للاستشارة: أقسام واضحة، جدول مؤشرات، حالات وأسئلة.' },
      { q: 'هل هذا تشخيص؟', a: 'لا. Luna29 تقدم تفسيراً تعليمياً ودعم تحضير. التشخيص والعلاج للمتخصص المرخّص.' },
    ],
  },
  he: {
    title: 'Health Reports ותובנות קליניות לנשים',
    items: [
      { q: 'מה הופך את My Health Reports לשימושי לנשים?', a: 'הדוח מפרש דפוסים הורמונליים נשיים ומקשר אותם לתסמינים — לא רק מספרים.' },
      { q: 'האם מנתח שילובים וסיכונים?', a: 'כן. מדגיש שילובים הורמונליים, השפעות אפשריות, סיכונים והמלצות לשיחה עם רופא.' },
      { q: 'האם אפשר להשתמש בדוח בביקור?', a: 'כן. הפורמט מוכן לייעוץ: סעיפים ברורים, טבלת סמנים, סטטוסים ושאלות.' },
      { q: 'האם זה אבחנה?', a: 'לא. Luna29 מספקת פרשנות חינוכית והכנה. אבחנה וטיפול — אצל בעל רישיון.' },
    ],
  },
};

  const copyByLang: LangCopy< {
    back: string;
    backPublic?: string;
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    promiseTitle: string;
    promiseQuote: string;
    highlightsTitle: string;
    highlights: Array<{ title: string; body: string }>;
  }> = {
    en: {
      back: 'Back',
      backPublic: 'Back to public home',
      eyebrow: 'Luna29 Knowledge Base',
      titleA: 'Frequently',
      titleB: 'Asked Questions.',
      subtitle: 'Clear, structured answers about Luna29 Balance — scope, safety, privacy, rhythm logic, and practical daily use. Written for orientation, not diagnosis.',
      promiseTitle: 'Our commitment',
      promiseQuote: 'Luna29 is a private mirror for self-observation. We never sell your physiological patterns, and we never present wellness data as a clinical verdict.',
      highlightsTitle: 'Three principles to remember',
      highlights: [
        { title: 'Mirror, not medicine', body: 'Luna29 organizes what you observe. It does not diagnose, prescribe, or monitor emergencies.' },
        { title: 'Local-first privacy', body: 'Core records stay on your device when possible. You control exports and what you share.' },
        { title: 'Pattern over pressure', body: 'One difficult day is data — not failure. The system becomes useful across weeks and phases.' },
      ],
    },
    ru: {
      back: 'Назад',
      backPublic: 'Назад на публичную главную',
      eyebrow: 'База знаний Luna29',
      titleA: 'Частые',
      titleB: 'Вопросы.',
      subtitle: 'Структурированные ответы о Luna29 Balance — границы системы, безопасность, приватность, логика ритма и практика. Для ориентации, не для диагноза.',
      promiseTitle: 'Наш принцип',
      promiseQuote: 'Luna29 — приватное зеркало для самонаблюдения. Мы не продаём ваши физиологические паттерны и не выдаём wellness-данные за клинический приговор.',
      highlightsTitle: 'Три опоры',
      highlights: [
        { title: 'Зеркало, не медицина', body: 'Luna29 упорядочивает наблюдения. Не ставит диагнозы, не назначает лечение и не заменяет экстренную помощь.' },
        { title: 'Local-first приватность', body: 'Ключевые записи остаются на устройстве. Экспорт и sharing — только по вашему решению.' },
        { title: 'Паттерн, не давление', body: 'Один тяжёлый день — это данные, не провал. Ценность раскрывается во времени и фазах.' },
      ],
    },
    uk: {
      back: 'Назад',
      backPublic: 'Назад на публічну головну',
      eyebrow: 'База знань Luna29',
      titleA: 'Часті',
      titleB: 'Питання.',
      subtitle: 'Структуровані відповіді про Luna29 Balance — межі системи, безпеку, приватність і практику. Для орієнтації, не для діагнозу.',
      promiseTitle: 'Наш принцип',
      promiseQuote: 'Luna29 — приватне дзеркало для самоспостереження. Ми не продаємо ваші патерни і не видаємо wellness-дані за клінічний вердикт.',
      highlightsTitle: 'Три опори',
      highlights: [
        { title: 'Дзеркало, не медицина', body: 'Luna29 упорядковує спостереження. Не діагностує і не замінює екстрену допомогу.' },
        { title: 'Local-first приватність', body: 'Ключові записи лишаються на пристрої. Експорт — лише за вашим рішенням.' },
        { title: 'Патерн, не тиск', body: 'Один важкий день — це дані. Цінність відкривається у часі та фазах.' },
      ],
    },
    es: {
      back: 'Atrás',
      backPublic: 'Volver al inicio público',
      eyebrow: 'Base de conocimiento Luna29',
      titleA: 'Preguntas',
      titleB: 'Frecuentes.',
      subtitle: 'Respuestas claras sobre Luna29 Balance: alcance, seguridad, privacidad, lógica del ritmo y uso diario. Orientación, no diagnóstico.',
      promiseTitle: 'Nuestro compromiso',
      promiseQuote: 'Luna29 es un espejo privado de autoobservación. No vendemos tus patrones fisiológicos ni convertimos datos de bienestar en veredictos clínicos.',
      highlightsTitle: 'Tres principios',
      highlights: [
        { title: 'Espejo, no medicina', body: 'Luna29 organiza lo que observas. No diagnostica ni sustituye atención de emergencia.' },
        { title: 'Privacidad local-first', body: 'Los registros principales permanecen en tu dispositivo. Tú controlas exportaciones y compartidos.' },
        { title: 'Patrón, no presión', body: 'Un día difícil es dato, no fracaso. El valor aparece en semanas y fases.' },
      ],
    },
    fr: {
      back: 'Retour',
      backPublic: "Retour à l'accueil public",
      eyebrow: 'Base de connaissances Luna29',
      titleA: 'Questions',
      titleB: 'Fréquentes.',
      subtitle: 'Réponses structurées sur Luna29 Balance : périmètre, sécurité, confidentialité, logique du rythme et usage quotidien.',
      promiseTitle: 'Notre engagement',
      promiseQuote: 'Luna29 est un miroir privé d auto-observation. Nous ne vendons pas vos schémas physiologiques.',
      highlightsTitle: 'Trois principes',
      highlights: [
        { title: 'Miroir, pas médecine', body: 'Luna29 organise vos observations. Elle ne diagnostique pas et ne remplace pas les urgences.' },
        { title: 'Confidentialité local-first', body: 'Les données principales restent sur l appareil. Vous contrôlez les exports.' },
        { title: 'Schéma, pas pression', body: 'Une journée difficile est une donnée, pas un échec.' },
      ],
    },
    de: {
      back: 'Zurück',
      backPublic: 'Zur öffentlichen Startseite',
      eyebrow: 'Luna29 Wissensbasis',
      titleA: 'Häufige',
      titleB: 'Fragen.',
      subtitle: 'Klare Antworten zu Luna29 Balance: Umfang, Sicherheit, Datenschutz, Rhythmuslogik und Alltag. Orientierung, keine Diagnose.',
      promiseTitle: 'Unser Versprechen',
      promiseQuote: 'Luna29 ist ein privater Spiegel zur Selbstbeobachtung. Wir verkaufen keine physiologischen Muster.',
      highlightsTitle: 'Drei Grundsätze',
      highlights: [
        { title: 'Spiegel, nicht Medizin', body: 'Luna29 ordnet Beobachtungen. Es diagnostiziert nicht und ersetzt keine Notfallversorgung.' },
        { title: 'Local-first Datenschutz', body: 'Kerndaten bleiben auf dem Gerät. Exporte kontrollierst du selbst.' },
        { title: 'Muster statt Druck', body: 'Ein schwerer Tag ist Daten — kein Versagen.' },
      ],
    },
    zh: {
      back: '返回',
      backPublic: '返回公开主页',
      eyebrow: 'Luna29 知识库',
      titleA: '常见',
      titleB: '问题。',
      subtitle: '关于 Luna29 Balance 的清晰解答：范围、安全、隐私、节律逻辑与日常使用。用于理解，而非诊断。',
      promiseTitle: '我们的承诺',
      promiseQuote: 'Luna29 是私密的自我观察镜。我们不出售你的生理模式，也不把 wellness 数据包装成临床结论。',
      highlightsTitle: '三个原则',
      highlights: [
        { title: '镜像，而非医疗', body: 'Luna29 整理你的观察，不提供诊断或紧急护理。' },
        { title: 'Local-first 隐私', body: '核心记录优先保存在设备本地，导出由你控制。' },
        { title: '模式，而非压力', body: '艰难的一天是数据，不是失败。' },
      ],
    },
    ja: {
      back: '戻る',
      backPublic: '公開ホームに戻る',
      eyebrow: 'Luna29 ナレッジ',
      titleA: 'よくある',
      titleB: '質問。',
      subtitle: 'Luna29 Balance についての明確な回答。範囲、安全、プライバシー、リズムの考え方と日常利用。',
      promiseTitle: '私たちの約束',
      promiseQuote: 'Luna29 は自己観察のための私的な鏡です。生理パターンを販売しません。',
      highlightsTitle: '3つの原則',
      highlights: [
        { title: '鏡であり医療ではない', body: 'Luna29 は観察を整理します。診断や緊急対応の代替ではありません。' },
        { title: 'Local-first プライバシー', body: '主要データは端末に保持。エクスポートはあなたが管理します。' },
        { title: 'パターン優先', body: 'つらい1日はデータであり、失敗ではありません。' },
      ],
    },
    pt: {
      back: 'Voltar',
      backPublic: 'Voltar ao início público',
      eyebrow: 'Base de conhecimento Luna29',
      titleA: 'Perguntas',
      titleB: 'Frequentes.',
      subtitle: 'Respostas claras sobre Luna29 Balance: escopo, segurança, privacidade, lógica do ritmo e uso diário.',
      promiseTitle: 'Nosso compromisso',
      promiseQuote: 'Luna29 é um espelho privado de autoobservação. Não vendemos seus padrões fisiológicos.',
      highlightsTitle: 'Três princípios',
      highlights: [
        { title: 'Espelho, não medicina', body: 'Luna29 organiza observações. Não diagnostica nem substitui emergência.' },
        { title: 'Privacidade local-first', body: 'Registros principais ficam no dispositivo. Você controla exportações.' },
        { title: 'Padrão, não pressão', body: 'Um dia difícil é dado — não fracasso.' },
      ],
    },
    ar: {
      back: 'رجوع',
      backPublic: 'العودة إلى الصفحة العامة',
      eyebrow: 'قاعدة معرفة Luna29',
      titleA: 'أسئلة',
      titleB: 'شائعة.',
      subtitle: 'إجابات واضحة عن Luna29 Balance: النطاق، الأمان، الخصوصية، منطق الإيقاع والاستخدام اليومي.',
      promiseTitle: 'التزامنا',
      promiseQuote: 'Luna29 مرآة خاصة للملاحظة الذاتية. لا نبيع أنماطك الفسيولوجية.',
      highlightsTitle: 'ثلاثة مبادئ',
      highlights: [
        { title: 'مرآة لا طب', body: 'Luna29 ينظم ملاحظاتك. لا يشخص ولا يستبدل الطوارئ.' },
        { title: 'خصوصية local-first', body: 'البيانات الأساسية تبقى على جهازك.' },
        { title: 'نمط لا ضغط', body: 'يوم صعب هو بيانات — وليس فشلاً.' },
      ],
    },
    he: {
      back: 'חזרה',
      backPublic: 'חזרה לדף הציבורי',
      eyebrow: 'מאגר ידע Luna29',
      titleA: 'שאלות',
      titleB: 'נפוצות.',
      subtitle: 'תשובות ברורות על Luna29 Balance: היקף, בטיחות, פרטיות, לוגיקת קצב ושימוש יומיומי.',
      promiseTitle: 'המחויבות שלנו',
      promiseQuote: 'Luna29 היא מראה פרטית לתצפית עצמית. איננו מוכרים את דפוסי הפיזיולוגיה שלך.',
      highlightsTitle: 'שלושה עקרונות',
      highlights: [
        { title: 'מראה, לא רפואה', body: 'Luna29 מארגנת תצפיות. לא מאבחנת ולא מחליפה חירום.' },
        { title: 'פרטיות local-first', body: 'נתונים מרכזיים נשארים במכשיר.' },
        { title: 'דפוס, לא לחץ', body: 'יום קשה הוא נתון — לא כישלון.' },
      ],
    },
  };

export interface FAQViewContent {
  categories: import('../components/AccordionSections').AccordionCategory[];
  copy: {
    back: string;
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    promiseTitle: string;
    promiseQuote: string;
    highlightsTitle: string;
    highlights: Array<{ title: string; body: string }>;
  };
}

function toAccordionCategories(categories: FAQCategory[]): import('../components/AccordionSections').AccordionCategory[] {
  return categories.map((cat) => ({
    title: cat.title,
    intro: cat.intro,
    items: cat.items.map((item) => ({ title: item.q, body: item.a })),
  }));
}

export function getFAQViewContent(lang: Language, mode: 'public' | 'member' = 'member'): FAQViewContent {
  const base = FAQ_DATA[lang] || FAQ_DATA.en;
  const core = CORE_FAQ_BY_LANG[lang] || CORE_FAQ_BY_LANG.en;
  const reportFaq = REPORT_FAQ_BY_LANG[lang] || REPORT_FAQ_BY_LANG.en;
  const existing = new Set(
    base.flatMap((cat) => cat.items.map((item) => item.q.trim().toLowerCase()))
  );
  const missingCore = core.filter((item) => !existing.has(item.q.trim().toLowerCase()));
  const data = missingCore.length
    ? [{ title: CORE_TITLE_BY_LANG[lang] || CORE_TITLE_BY_LANG.en, items: missingCore }, ...base]
    : [...base];
  const reportCategoryExists = data.some((cat) => cat.title.trim().toLowerCase() === reportFaq.title.trim().toLowerCase());
  if (!reportCategoryExists) data.push(reportFaq);

  const rawCopy = getLang(copyByLang, lang) || copyByLang.en;
  const copy = {
    ...rawCopy,
    back: mode === 'public' ? (rawCopy.backPublic || rawCopy.back) : rawCopy.back,
  };

  return {
    categories: toAccordionCategories(data),
    copy,
  };
}
