import { Language, LangCopy, getLang } from '../constants';
export type HomeStory = {
    heroTitle: string;
    heroLead: string;
    heroBody: string;
    heroCta: string;
    heroSub: string;
    explainTitle: string;
    explainParagraphs: string[];
    flowTitle: string;
    flowItems: Array<{ title: string; text: string }>;
    sections: Array<{ title: string; body: string }>;
    differenceTitle: string;
    differenceList: string[];
    differenceBody: string;
    finalTitle: string;
    finalBody: string;
    finalCta: string;
  };

  const homeStoryByLang: Partial<LangCopy< HomeStory>> = {
    ru: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — физиология чувств.',
      heroBody: 'Персональная система, которая соединяет физиологические ритмы, личные наблюдения и спокойную формулировку мыслей.',
      heroCta: 'Попробовать Luna29',
      heroSub: 'Приватно. Спокойно. Лично.',
      explainTitle: 'Короткое объяснение',
      explainParagraphs: [
        'В обычной жизни многие состояния сложно сразу понять: усталость, напряжение, перегруженность, непонятные эмоции.',
        'Luna29 помогает увидеть эти состояния яснее — через данные, наблюдения и короткие рефлексии.',
        'Это не трекер привычек и не приложение для самоанализа. Это система спокойного понимания своего состояния во времени.',
      ],
      flowTitle: 'Как работает Luna29',
      flowItems: [
        { title: 'Ваше тело', text: 'физиологические ритмы и показатели' },
        { title: 'Ваши ощущения', text: 'наблюдения и голосовые заметки' },
        { title: 'Ваши слова', text: 'спокойная формулировка мыслей' },
      ],
      sections: [
        {
          title: 'Luna29 Balance',
          body: 'Luna29 Balance — это визуальная карта ваших физиологических ритмов. Она показывает, как различные гормональные и биологические маркеры могут взаимодействовать и отражаться на энергии, концентрации и настроении. Вместо отдельных цифр Luna29 формирует наглядную карту внутренней погоды, где видно, как меняется состояние организма во времени.',
        },
        {
          title: 'Voice Journal',
          body: 'Не нужно писать длинные дневники. Вы можете просто записать голосовую заметку — что вы чувствуете, что происходит в течение дня. Luna29 аккуратно превращает голос в структурированную запись, помогая увидеть смысл и сохранить наблюдение.',
        },
        {
          title: 'Мост',
          body: 'Иногда состояние трудно объяснить словами. Мост помогает сформулировать его спокойно и точно. Несколько коротких вопросов помогают превратить внутреннюю неясность в ясное сообщение — для себя или, при желании, для общения с близкими.',
        },
        {
          title: 'Комната восстановления',
          body: 'Иногда лучший шаг — остановиться. Комната восстановления — это тихое пространство, где можно на несколько минут снизить внутреннее напряжение и восстановить ощущение устойчивости. Без давления. Без задач. Без необходимости что-то исправлять.',
        },
      ],
      differenceTitle: 'Почему Luna29 отличается',
      differenceList: ['считают шаги', 'отслеживают привычки', 'анализируют поведение'],
      differenceBody: 'Luna29 делает другое. Она помогает увидеть взаимосвязи между телом, состоянием и мыслями — и превратить это понимание в ясные слова.',
      finalTitle: 'Luna29 — это не ещё одно приложение для самоконтроля.',
      finalBody: 'Это тихое пространство, где можно остановиться, понять своё состояние и вернуть ясность.',
      finalCta: 'Попробовать Luna29',
    },
    en: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — The physiology of feeling.',
      heroBody: 'A personal system that connects body rhythms, lived observations, and calm language for your inner state.',
      heroCta: 'Try Luna29',
      heroSub: 'Private. Calm. Personal.',
      explainTitle: 'Short Explanation',
      explainParagraphs: [
        'In everyday life, many states are hard to read quickly: fatigue, pressure, overload, unclear emotions.',
        'Luna29 helps make these states clearer through data, observations, and short reflections.',
        'This is not a habit tracker and not a self-analysis app. It is a calm system for understanding your state over time.',
      ],
      flowTitle: 'How Luna29 Works',
      flowItems: [
        { title: 'Your Body', text: 'physiological rhythms and markers' },
        { title: 'Your Senses', text: 'observations and voice notes' },
        { title: 'Your Words', text: 'clear and calm formulation of thoughts' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance is a visual map of your physiological rhythms. It shows how hormonal and biological markers can interact and reflect in energy, focus, and mood over time.' },
        { title: 'Voice Journal', body: 'No long journaling required. Record a short voice note about what you feel and what happened in your day. Luna29 transforms voice into structured reflection.' },
        { title: 'The Bridge', body: 'Sometimes a state is difficult to explain. The Bridge uses short prompts to turn inner uncertainty into a clear message for yourself or for trusted communication.' },
        { title: 'Reset Room', body: 'Sometimes the best step is to pause. Reset Room is a quiet space to reduce inner pressure and restore stability for a few minutes, with no pressure and no tasks.' },
      ],
      differenceTitle: 'Why Luna29 Is Different',
      differenceList: ['count steps', 'track habits', 'analyze behavior'],
      differenceBody: 'Luna29 does something else. It helps you see links between body, state, and thoughts — then put this understanding into clear words.',
      finalTitle: 'Luna29 is your personal system for physiological clarity.',
      finalBody: 'It is a quiet space to pause, understand your state, and return to clarity.',
      finalCta: 'Try Luna29',
    },
    uk: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — фізіологія відчуттів.',
      heroBody: 'Персональна система, що поєднує ритми тіла, живі спостереження та спокійну мову для вашого внутрішнього стану.',
      heroCta: 'Спробувати Luna29',
      heroSub: 'Приватно. Спокійно. Особисто.',
      explainTitle: 'Коротке Пояснення',
      explainParagraphs: [
        'У щоденному житті багато станів важко швидко зчитати: втома, тиск, перевантаження, неясні емоції.',
        'Luna29 допомагає побачити ці стани чіткіше через дані, спостереження та короткі рефлексії.',
        'Це не трекер звичок і не додаток для самоконтролю. Це спокійна система розуміння свого стану у часі.',
      ],
      flowTitle: 'Як Працює Luna29',
      flowItems: [
        { title: 'Ваше Тіло', text: 'фізіологічні ритми та маркери' },
        { title: 'Ваші Відчуття', text: 'спостереження та голосові нотатки' },
        { title: 'Ваші Слова', text: 'чітке й спокійне формулювання думок' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance — це візуальна карта ваших фізіологічних ритмів. Вона показує, як гормональні та біологічні маркери взаємодіють і відображаються в енергії, концентрації та настрої.' },
        { title: 'Voice Journal', body: 'Довгі щоденники не потрібні. Запишіть коротку голосову нотатку про відчуття та події дня. Luna29 перетворює голос на структуровану рефлексію.' },
        { title: 'Міст', body: 'Іноді стан важко пояснити. Міст допомагає перевести внутрішню неясність у зрозуміле повідомлення для себе або близьких.' },
        { title: 'Кімната відновлення', body: 'Іноді найкращий крок — зупинитися. Кімната відновлення — це тиха зона для зниження напруги та повернення стабільності на кілька хвилин.' },
      ],
      differenceTitle: 'Чому Luna29 Відрізняється',
      differenceList: ['рахують кроки', 'відстежують звички', 'аналізують поведінку'],
      differenceBody: 'Luna29 робить інше: допомагає побачити звʼязок між тілом, станом і думками та перетворити це розуміння в ясні слова.',
      finalTitle: 'Luna29 — ваша персональна система фізіологічної ясності.',
      finalBody: 'Це тихий простір, де можна зупинитися, зрозуміти свій стан і повернути ясність.',
      finalCta: 'Спробувати Luna29',
    },
    es: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — la fisiología del sentir.',
      heroBody: 'Un sistema personal que conecta ritmos corporales, observaciones reales y lenguaje claro para tu estado interno.',
      heroCta: 'Probar Luna29',
      heroSub: 'Privado. Calmo. Personal.',
      explainTitle: 'Explicación Breve',
      explainParagraphs: [
        'En la vida diaria, muchos estados son difíciles de leer rápido: fatiga, presión, sobrecarga y emociones difusas.',
        'Luna29 vuelve esos estados más claros con datos, observaciones y reflexiones cortas.',
        'No es un rastreador de hábitos ni una app de autocontrol. Es un sistema sereno para entender tu estado en el tiempo.',
      ],
      flowTitle: 'Cómo Funciona Luna29',
      flowItems: [
        { title: 'Tu Cuerpo', text: 'ritmos fisiológicos y marcadores' },
        { title: 'Tus Sensaciones', text: 'observaciones y notas de voz' },
        { title: 'Tus Palabras', text: 'formulación clara y calmada de pensamientos' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance es un mapa visual de tus ritmos fisiológicos. Muestra cómo los marcadores hormonales y biológicos se relacionan con energía, enfoque y estado de ánimo.' },
        { title: 'Voice Journal', body: 'No necesitas escribir mucho. Graba una nota de voz breve sobre cómo te sientes y qué pasó en tu día. Luna29 la convierte en una reflexión estructurada.' },
        { title: 'Puente', body: 'A veces es difícil explicar un estado interno. El Puente usa preguntas cortas para convertir esa sensación en un mensaje claro para ti o para comunicarlo.' },
        { title: 'Sala de reinicio', body: 'A veces la mejor decisión es pausar. La Sala de reinicio es un espacio tranquilo para bajar la presión interna y recuperar estabilidad.' },
      ],
      differenceTitle: 'Por Qué Luna29 Es Diferente',
      differenceList: ['cuentan pasos', 'rastrean hábitos', 'analizan conducta'],
      differenceBody: 'Luna29 hace otra cosa: te ayuda a ver conexiones entre cuerpo, estado y pensamientos para expresarlo con claridad.',
      finalTitle: 'Luna29 es tu sistema personal de claridad fisiológica.',
      finalBody: 'Un espacio tranquilo para pausar, entender tu estado y volver a la claridad.',
      finalCta: 'Probar Luna29',
    },
    fr: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — la physiologie du ressenti.',
      heroBody: 'Un système personnel qui relie les rythmes du corps, les observations vécues et un langage apaisé pour votre état intérieur.',
      heroCta: 'Essayer Luna29',
      heroSub: 'Privé. Calme. Personnel.',
      explainTitle: 'Explication Courte',
      explainParagraphs: [
        'Au quotidien, certains états sont difficiles à lire rapidement: fatigue, pression, surcharge, émotions floues.',
        'Luna29 rend ces états plus lisibles grâce aux données, observations et courtes réflexions.',
        'Ce n’est ni un traqueur d’habitudes ni une app d’autocontrôle. C’est un système calme pour comprendre votre état dans le temps.',
      ],
      flowTitle: 'Comment Fonctionne Luna29',
      flowItems: [
        { title: 'Votre Corps', text: 'rythmes physiologiques et marqueurs' },
        { title: 'Vos Ressentis', text: 'observations et notes vocales' },
        { title: 'Vos Mots', text: 'formulation claire et apaisée des pensées' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance est une carte visuelle de vos rythmes physiologiques. Elle montre comment les marqueurs hormonaux et biologiques influencent énergie, concentration et humeur.' },
        { title: 'Voice Journal', body: 'Pas besoin d’écrire longuement. Enregistrez une note vocale courte. Luna29 la transforme en réflexion structurée.' },
        { title: 'Le Pont', body: 'Parfois, il est difficile d’expliquer son état. Le Pont aide à transformer ce flou intérieur en message clair.' },
        { title: 'Salle de réinitialisation', body: 'Parfois, la meilleure action est de faire une pause. La Salle de réinitialisation est un espace calme pour relâcher la pression interne et retrouver de la stabilité.' },
      ],
      differenceTitle: 'Pourquoi Luna29 Est Différente',
      differenceList: ['comptent les pas', 'suivent les habitudes', 'analysent les comportements'],
      differenceBody: 'Luna29 fait autre chose: elle relie corps, état et pensées pour vous aider à vous exprimer clairement.',
      finalTitle: 'Luna29 est votre système personnel de clarté physiologique.',
      finalBody: 'Un espace calme pour faire pause, comprendre votre état et retrouver de la clarté.',
      finalCta: 'Essayer Luna29',
    },
    de: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — die Physiologie des Fühlens.',
      heroBody: 'Ein persönliches System, das Körperrhythmen, Beobachtungen und klare Sprache für den inneren Zustand verbindet.',
      heroCta: 'Luna29 testen',
      heroSub: 'Privat. Ruhig. Persönlich.',
      explainTitle: 'Kurze Erklärung',
      explainParagraphs: [
        'Im Alltag sind viele Zustände schwer schnell einzuordnen: Müdigkeit, Druck, Überlastung, unklare Emotionen.',
        'Luna29 macht diese Zustände durch Daten, Beobachtungen und kurze Reflexionen verständlicher.',
        'Es ist kein Gewohnheitstracker und keine Selbstkontroll-App. Es ist ein ruhiges System zum Verstehen des eigenen Zustands über Zeit.',
      ],
      flowTitle: 'So Funktioniert Luna29',
      flowItems: [
        { title: 'Dein Körper', text: 'physiologische Rhythmen und Marker' },
        { title: 'Deine Wahrnehmung', text: 'Beobachtungen und Sprachnotizen' },
        { title: 'Deine Worte', text: 'klare und ruhige Formulierung der Gedanken' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance ist eine visuelle Karte deiner physiologischen Rhythmen. Sie zeigt, wie hormonelle und biologische Marker Energie, Fokus und Stimmung beeinflussen.' },
        { title: 'Voice Journal', body: 'Keine langen Tagebücher nötig. Nimm eine kurze Sprachnotiz auf. Luna29 wandelt sie in eine strukturierte Reflexion um.' },
        { title: 'Die Brücke', body: 'Manchmal ist ein Zustand schwer zu erklären. Die Brücke hilft, innere Unklarheit in eine klare Botschaft zu übersetzen.' },
        { title: 'Reset-Raum', body: 'Manchmal ist Pause der beste Schritt. Der Reset-Raum ist ein ruhiger Raum, um innere Anspannung zu senken und Stabilität zurückzugewinnen.' },
      ],
      differenceTitle: 'Warum Luna29 Anders Ist',
      differenceList: ['zählen Schritte', 'tracken Gewohnheiten', 'analysieren Verhalten'],
      differenceBody: 'Luna29 macht etwas anderes: Es zeigt Verbindungen zwischen Körper, Zustand und Gedanken und macht sie klar aussprechbar.',
      finalTitle: 'Luna29 ist dein persönliches System für physiologische Klarheit.',
      finalBody: 'Ein ruhiger Ort, um zu pausieren, den eigenen Zustand zu verstehen und Klarheit zurückzugewinnen.',
      finalCta: 'Luna29 testen',
    },
    zh: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — 感受的生理学。',
      heroBody: '一个连接身体节律、真实观察与平静表达的个人系统，帮助你理解当下内在状态。',
      heroCta: '体验 Luna29',
      heroSub: '私密。平静。个人化。',
      explainTitle: '简短说明',
      explainParagraphs: [
        '在日常生活中，很多状态很难快速读懂：疲劳、压力、过载和难以描述的情绪。',
        'Luna29 通过数据、观察和简短反思，让这些状态更清晰。',
        '它不是习惯打卡工具，也不是自我控制应用，而是一套用于长期理解自身状态的平静系统。',
      ],
      flowTitle: 'Luna29 如何工作',
      flowItems: [
        { title: '你的身体', text: '生理节律与关键指标' },
        { title: '你的感受', text: '观察记录与语音笔记' },
        { title: '你的表达', text: '清晰且平静地描述状态' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance 是你的生理节律可视化地图，帮助你看到激素与生物指标如何共同影响精力、专注和情绪。' },
        { title: 'Voice Journal', body: '不需要写长日记。你只需录一段语音，Luna29 会将其整理为结构化反思。' },
        { title: '连接桥', body: '有些状态很难说清。连接桥通过简短引导，把模糊感受转为清晰信息。' },
        { title: '重置空间', body: '有时暂停是最好的选择。重置空间提供一个安静空间，帮助你降低内在压力、恢复稳定。' },
      ],
      differenceTitle: 'Luna29 的不同之处',
      differenceList: ['统计步数', '追踪习惯', '分析行为'],
      differenceBody: 'Luna29 做的是另一件事：帮助你看见身体、状态与想法之间的联系，并用清晰语言表达出来。',
      finalTitle: 'Luna29 是你的个人生理清晰系统。',
      finalBody: '一个让你暂停、理解自己并重回清晰的安静空间。',
      finalCta: '体验 Luna29',
    },
    ja: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — 感覚の生理学。',
      heroBody: '身体リズム・日々の観察・落ち着いた言語化をつなぐ、あなたのための個人システムです。',
      heroCta: 'Luna29 を試す',
      heroSub: 'プライベート。穏やか。パーソナル。',
      explainTitle: '短い説明',
      explainParagraphs: [
        '日常では、疲労・圧迫感・過負荷・言葉にしにくい感情などをすぐに把握するのは難しいです。',
        'Luna29 はデータ、観察、短い振り返りで、その状態を見えやすくします。',
        '習慣管理アプリでも自己管理アプリでもなく、時間軸で自分の状態を理解するための静かなシステムです。',
      ],
      flowTitle: 'Luna29 の仕組み',
      flowItems: [
        { title: 'あなたの身体', text: '生理リズムとマーカー' },
        { title: 'あなたの感覚', text: '観察と音声メモ' },
        { title: 'あなたの言葉', text: '状態を明確で落ち着いて表現' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance は生理リズムの可視化マップです。ホルモンや生体マーカーが、エネルギー・集中・気分にどう影響するかを示します。' },
        { title: 'Voice Journal', body: '長文記録は不要です。短い音声メモを残すだけで、Luna29 が構造化された振り返りに変換します。' },
        { title: 'ブリッジ', body: '状態を説明しにくい時、ブリッジが内面の曖昧さを明確なメッセージに整えます。' },
        { title: 'リセットルーム', body: '最善の一歩が「止まること」の日もあります。リセットルームは内圧を下げ、安定を取り戻す静かな空間です。' },
      ],
      differenceTitle: 'Luna29 が違う理由',
      differenceList: ['歩数を数える', '習慣を追う', '行動を分析する'],
      differenceBody: 'Luna29 は別のことをします。身体・状態・思考のつながりを見える化し、明確な言葉に変えることを助けます。',
      finalTitle: 'Luna29 は、生理的な明確さのための個人システムです。',
      finalBody: '立ち止まり、自分の状態を理解し、明確さを取り戻すための静かな場所です。',
      finalCta: 'Luna29 を試す',
    },
    pt: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — a fisiologia de sentir.',
      heroBody: 'Um sistema pessoal que conecta ritmos do corpo, observações reais e linguagem calma para o seu estado interno.',
      heroCta: 'Experimentar Luna29',
      heroSub: 'Privado. Calmo. Pessoal.',
      explainTitle: 'Explicação Curta',
      explainParagraphs: [
        'No dia a dia, muitos estados são difíceis de ler rapidamente: fadiga, pressão, sobrecarga e emoções confusas.',
        'A Luna29 torna esses estados mais claros com dados, observações e reflexões curtas.',
        'Não é um rastreador de hábitos nem app de autocontrole. É um sistema calmo para entender seu estado ao longo do tempo.',
      ],
      flowTitle: 'Como A Luna29 Funciona',
      flowItems: [
        { title: 'Seu Corpo', text: 'ritmos fisiológicos e marcadores' },
        { title: 'Suas Sensações', text: 'observações e notas de voz' },
        { title: 'Suas Palavras', text: 'formulação clara e calma dos pensamentos' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance é um mapa visual dos seus ritmos fisiológicos. Mostra como marcadores hormonais e biológicos influenciam energia, foco e humor.' },
        { title: 'Voice Journal', body: 'Sem diário longo. Grave uma nota de voz curta sobre seu dia, e a Luna29 transforma em reflexão estruturada.' },
        { title: 'A Ponte', body: 'Às vezes é difícil explicar o próprio estado. A Ponte ajuda a transformar incerteza interna em mensagem clara.' },
        { title: 'Sala de reinício', body: 'Às vezes a melhor decisão é pausar. A Sala de reinício é um espaço silencioso para reduzir pressão interna e recuperar estabilidade.' },
      ],
      differenceTitle: 'Por Que A Luna29 É Diferente',
      differenceList: ['contam passos', 'rastreiam hábitos', 'analisam comportamento'],
      differenceBody: 'A Luna29 faz outra coisa: ajuda você a ver conexões entre corpo, estado e pensamentos para comunicar com clareza.',
      finalTitle: 'A Luna29 é seu sistema pessoal de clareza fisiológica.',
      finalBody: 'Um espaço calmo para pausar, entender seu estado e voltar à clareza.',
      finalCta: 'Experimentar Luna29',
    },
    ar: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — فسيولوجيا الشعور.',
      heroBody: 'نظام شخصي يربط إيقاعات الجسم والملاحظات الحية ولغة هادئة لحالتك الداخلية.',
      heroCta: 'جرّبي Luna29',
      heroSub: 'خصوصي. هادئ. شخصي.',
      explainTitle: 'شرح مختصر',
      explainParagraphs: [
        'في الحياة اليومية، كثير من الحالات يصعب قراءتها بسرعة: التعب، الضغط، الإرهاق، المشاعر غير الواضحة.',
        'Luna29 تساعدك على رؤية هذه الحالات بوضوح أكبر — عبر البيانات والملاحظات والتأملات القصيرة.',
        'هذا ليس متتبّع عادات ولا تطبيقاً للتحليل الذاتي. إنه نظام هادئ لفهم حالتك عبر الزمن.',
      ],
      flowTitle: 'كيف تعمل Luna29',
      flowItems: [
        { title: 'جسمك', text: 'الإيقاعات الفسيولوجية والمؤشرات' },
        { title: 'إحساسك', text: 'الملاحظات والملاحظات الصوتية' },
        { title: 'كلماتك', text: 'صياغة هادئة وواضحة للأفكار' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance خريطة بصرية لإيقاعاتك الفسيولوجية. تُظهر كيف تتفاعل المؤشرات الهرمونية والبيولوجية وتنعكس على الطاقة والتركيز والمزاج مع الزمن.' },
        { title: 'Voice Journal', body: 'لا حاجة لكتابة يوميات طويلة. سجّلي ملاحظة صوتية قصيرة عما تشعرين به وما حدث في يومك. Luna29 تحوّل الصوت إلى تأمل منظّم.' },
        { title: 'The Bridge', body: 'أحياناً يصعب شرح الحالة. The Bridge يستخدم أسئلة قصيرة لتحويل عدم اليقين الداخلي إلى رسالة واضحة لنفسك أو للتواصل مع المقربين.' },
        { title: 'Reset Room', body: 'أحياناً أفضل خطوة هي التوقّف. Reset Room مساحة هادئة لتخفيف الضغط الداخلي واستعادة الاستقرار لبضع دقائق — بلا ضغط ولا مهام.' },
      ],
      differenceTitle: 'لماذا Luna29 مختلفة',
      differenceList: ['يعدّون الخطوات', 'يتتبّعون العادات', 'يحلّلون السلوك'],
      differenceBody: 'Luna29 تفعل شيئاً آخر. تساعدك على رؤية روابط بين الجسم والحالة والأفكار — ثم تحويل هذا الفهم إلى كلمات واضحة.',
      finalTitle: 'Luna29 نظامك الشخصي للوضوح الفسيولوجي.',
      finalBody: 'مساحة هادئة للتوقّف وفهم حالتك والعودة إلى الوضوح.',
      finalCta: 'جرّبي Luna29',
    },
    he: {
      heroTitle: 'Luna29',
      heroLead: 'Luna29 — הפיזיולוגיה של ההרגשה.',
      heroBody: 'מערכת אישית שמחברת ריתמי גוף, תצפיות חיות ושפה שקטה למצב הפנימי שלך.',
      heroCta: 'נסי את Luna29',
      heroSub: 'פרטי. שקט. אישי.',
      explainTitle: 'הסבר קצר',
      explainParagraphs: [
        'בחיי היומיום, הרבה מצבים קשים לקרוא במהירות: עייפות, לחץ, עומס יתר, רגשות לא ברורים.',
        'Luna29 עוזרת להפוך את המצבים האלה לברורים יותר — דרך נתונים, תצפיות ורפלקציות קצרות.',
        'זה לא מעקב הרגלים ולא אפליקציית ניתוח עצמי. זו מערכת שקטה להבנת המצב שלך לאורך זמן.',
      ],
      flowTitle: 'איך Luna29 עובדת',
      flowItems: [
        { title: 'הגוף שלך', text: 'ריתמים פיזיולוגיים וסמנים' },
        { title: 'התחושות שלך', text: 'תצפיות והערות קוליות' },
        { title: 'המילים שלך', text: 'ניסוח ברור ושקט של מחשבות' },
      ],
      sections: [
        { title: 'Luna29 Balance', body: 'Luna29 Balance היא מפת ריתמים פיזיולוגיים חזותית. היא מראה איך סמנים הורמונליים וביולוגיים משפיעים זה על זה ומשתקפים באנרגיה, מיקוד ומצב רוח לאורך זמן.' },
        { title: 'Voice Journal', body: 'אין צורך ביומן ארוך. הקליטי הערת קול קצרה על מה שאת מרגישה ומה קרה ביום. Luna29 הופכת את הקול לרפלקציה מובנית.' },
        { title: 'The Bridge', body: 'לפעמים קשה להסביר מצב. The Bridge משתמש בשאלות קצרות כדי להפוך אי-ודאות פנימית להודעה ברורה — לעצמך או לתקשורת עם קרובים.' },
        { title: 'Reset Room', body: 'לפעמים הצעד הטוב ביותר הוא לעצור. Reset Room הוא מרחב שקט להפחתת לחץ פנימי ולהחזרת יציבות לכמה דקות — בלי לחץ ובלי משימות.' },
      ],
      differenceTitle: 'למה Luna29 שונה',
      differenceList: ['סופרים צעדים', 'עוקבים אחרי הרגלים', 'מנתחים התנהגות'],
      differenceBody: 'Luna29 עושה משהו אחר. היא עוזרת לראות קשרים בין גוף, מצב ומחשבות — ולהפוך את ההבנה הזו למילים ברורות.',
      finalTitle: 'Luna29 היא המערכת האישית שלך לבהירות פיזיולוגית.',
      finalBody: 'מרחב שקט לעצור, להבין את המצב שלך ולחזור לבהירות.',
      finalCta: 'נסי את Luna29',
    },
  };

  const pricingCopyByLang: LangCopy< { title: string; subtitle: string; month: string; year: string; monthNote: string; yearNote: string; saveBadge: string; cta: string; recommended: string }> = {
    en: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Start free. Upgrade when you want deeper patterns, reports, and unlimited Bridge.',
      month: '$12.99',
      year: '$89',
      monthNote: 'per month',
      yearNote: 'per year',
      saveBadge: 'Save 25% yearly',
      cta: 'Subscribe after account',
      recommended: 'Cancel anytime · 7-day free trial included.',
    },
    ru: {
      title: 'Прозрачная И Простая Цена',
      subtitle: 'Начните бесплатно. Платный план — для глубоких паттернов, отчётов и безлимитного Bridge.',
      month: '$12.99',
      year: '$89',
      monthNote: 'в месяц',
      yearNote: 'в год',
      saveBadge: 'Экономия 25% в годовом плане',
      cta: 'Подписаться после аккаунта',
      recommended: 'Отмена в любой момент · trial 7 дней включён.',
    },
    uk: {
      title: 'Прозора Та Проста Ціна',
      subtitle: 'Почніть безкоштовно. Платний план — для глибоких патернів, звітів і безлімітного Bridge.',
      month: '$12.99',
      year: '$89',
      monthNote: 'за місяць',
      yearNote: 'за рік',
      saveBadge: 'Економія 25% на річному плані',
      cta: 'Підписатися після акаунта',
      recommended: 'Скасування будь-коли · trial 7 днів включено.',
    },
    es: { title: 'Precio Claro Y Simple', subtitle: 'Empieza gratis. Mejora cuando quieras patrones, informes y Bridge ilimitado.', month: '$12.99', year: '$89', monthNote: 'por mes', yearNote: 'por ano', saveBadge: 'Ahorra 25% anual', cta: 'Suscribirse tras cuenta', recommended: 'Cancela cuando quieras · prueba 7 dias incluida.' },
    fr: { title: 'Tarif Clair Et Simple', subtitle: 'Commencez gratuitement. Passez au payant pour plus de patterns et Bridge illimite.', month: '$12.99', year: '$89', monthNote: 'par mois', yearNote: 'par an', saveBadge: '25% d economie annuelle', cta: "S'abonner apres compte", recommended: 'Resiliation a tout moment · essai 7 jours inclus.' },
    de: { title: 'Klare Einfache Preise', subtitle: 'Kostenlos starten. Upgrade fur tiefere Muster, Reports und unbegrenztes Bridge.', month: '$12.99', year: '$89', monthNote: 'pro Monat', yearNote: 'pro Jahr', saveBadge: '25% sparen jahrlich', cta: 'Nach Konto abonnieren', recommended: 'Jederzeit kuendbar · 7-Tage-Test inklusive.' },
    zh: { title: '清晰透明的价格', subtitle: '免费开始。需要更深模式、报告与无限 Bridge 时再升级。', month: '$12.99', year: '$89', monthNote: '每月', yearNote: '每年', saveBadge: '年付节省25%', cta: '创建账户后订阅', recommended: '随时取消 · 含 7 天试用。' },
    ja: { title: 'わかりやすい料金', subtitle: '無料で開始。より深いパターン・レポート・無制限Bridgeは有料プランへ。', month: '$12.99', year: '$89', monthNote: '月額', yearNote: '年額', saveBadge: '年額で25%オフ', cta: 'アカウント後に登録', recommended: 'いつでも解約 · 7日間トライアル付き。' },
    pt: { title: 'Preco Simples E Claro', subtitle: 'Comece gratis. Faca upgrade para padroes, relatorios e Bridge ilimitado.', month: '$12.99', year: '$89', monthNote: 'por mes', yearNote: 'por ano', saveBadge: 'Economize 25% no anual', cta: 'Assinar apos conta', recommended: 'Cancele quando quiser · teste de 7 dias incluso.' },
  ar: {
      title: 'أسعار بسيطة وشفافة',
      subtitle: 'ابدئي مجاناً. ترقّي عندما تريدين أنماطاً أعمق وتقارير وBridge غير محدود.',
      month: '$12.99',
      year: '$89',
      monthNote: 'شهرياً',
      yearNote: 'سنوياً',
      saveBadge: 'وفّري 25% سنوياً',
      cta: 'Subscribe after account',
      recommended: 'Cancel anytime · 7-day free trial included.',
    },
  he: {
      title: 'תמחור פשוט ושקוף',
      subtitle: 'התחילי בחינם. שדרגי כשאת רוצה דפוסים עמוקים יותר, דוחות ו-Bridge ללא הגבלה.',
      month: '$12.99',
      year: '$89',
      monthNote: 'לחודש',
      yearNote: 'לשנה',
      saveBadge: 'חיסכון של 25% בתשלום שנתי',
      cta: 'Subscribe after account',
      recommended: 'Cancel anytime · 7-day free trial included.',
    },};

  const homeToggleByLang: LangCopy< { more: string; less: string }> = {
    en: { more: 'Show Full Story', less: 'Show Less' },
    ru: { more: 'Показать Полную Версию', less: 'Скрыть Детали' },
    uk: { more: 'Показати Повну Версію', less: 'Приховати Деталі' },
    es: { more: 'Ver Historia Completa', less: 'Mostrar Menos' },
    fr: { more: 'Afficher La Version Complete', less: 'Afficher Moins' },
    de: { more: 'Vollstaendige Version Zeigen', less: 'Weniger Anzeigen' },
    zh: { more: '显示完整内容', less: '收起详情' },
    ja: { more: '全文を表示', less: '表示を減らす' },
    pt: { more: 'Mostrar Historia Completa', less: 'Mostrar Menos' },
  ar: { more: 'عرض القصة كاملة', less: 'عرض أقل' },
  he: { more: 'הצגת הסיפור המלא', less: 'הצג פחות' },};

  const hormoneFocusByLang: Partial<LangCopy< { title: string; subtitle: string; cards: Array<{ hormone: string; why: string }> }>> = {
    en: {
      title: 'Hormones Matter',
      subtitle: 'Your markers are not random numbers. They are signals that shape energy, mood, focus, and recovery.',
      cards: [
        { hormone: 'Estrogen / Progesterone', why: 'Cycle rhythm, emotional steadiness, and sleep quality.' },
        { hormone: 'Cortisol', why: 'Stress load, recovery speed, and nervous system sensitivity.' },
        { hormone: 'Thyroid Axis (TSH/T3/T4)', why: 'Metabolic pace, cold tolerance, concentration, and fatigue.' },
        { hormone: 'Insulin / Glucose', why: 'Energy stability, cravings, and inflammation pressure.' },
      ],
    },
    ru: {
      title: 'Гормоны Важны',
      subtitle: 'Ваши маркеры — это не случайные цифры. Это сигналы, которые формируют энергию, настроение, фокус и восстановление.',
      cards: [
        { hormone: 'Эстроген / Прогестерон', why: 'Ритм цикла, эмоциональная устойчивость и качество сна.' },
        { hormone: 'Кортизол', why: 'Стресс-нагрузка, скорость восстановления и чувствительность нервной системы.' },
        { hormone: 'Ось Щитовидки (TSH/T3/T4)', why: 'Метаболический темп, переносимость холода, концентрация и утомляемость.' },
        { hormone: 'Инсулин / Глюкоза', why: 'Стабильность энергии, тяга к еде и воспалительная нагрузка.' },
      ],
    },
    uk: {
      title: 'Гормони Мають Значення',
      subtitle: 'Ваші маркери — не випадкові цифри. Це сигнали, що формують енергію, настрій, фокус і відновлення.',
      cards: [
        { hormone: 'Естроген / Прогестерон', why: 'Ритм циклу, емоційна стабільність і якість сну.' },
        { hormone: 'Кортизол', why: 'Стрес-навантаження, швидкість відновлення та чутливість нервової системи.' },
        { hormone: 'Щитоподібна Вісь (TSH/T3/T4)', why: 'Темп метаболізму, переносимість холоду, концентрація й втомлюваність.' },
        { hormone: 'Інсулін / Глюкоза', why: 'Стабільність енергії, тяга до їжі та запальне навантаження.' },
      ],
    },
    es: {
      title: 'Las Hormonas Importan',
      subtitle: 'Tus marcadores no son números sueltos. Son señales que modelan energía, ánimo, enfoque y recuperación.',
      cards: [
        { hormone: 'Estrógeno / Progesterona', why: 'Ritmo del ciclo, estabilidad emocional y calidad del sueño.' },
        { hormone: 'Cortisol', why: 'Carga de estrés, velocidad de recuperación y sensibilidad del sistema nervioso.' },
        { hormone: 'Eje Tiroideo (TSH/T3/T4)', why: 'Ritmo metabólico, tolerancia al frío, concentración y fatiga.' },
        { hormone: 'Insulina / Glucosa', why: 'Estabilidad de energía, antojos y presión inflamatoria.' },
      ],
    },
    fr: {
      title: 'Les Hormones Comptent',
      subtitle: 'Vos marqueurs ne sont pas des chiffres isolés. Ce sont des signaux qui influencent énergie, humeur, focus et récupération.',
      cards: [
        { hormone: 'Œstrogène / Progestérone', why: 'Rythme du cycle, stabilité émotionnelle et qualité du sommeil.' },
        { hormone: 'Cortisol', why: 'Charge de stress, vitesse de récupération et sensibilité nerveuse.' },
        { hormone: 'Axe Thyroïdien (TSH/T3/T4)', why: 'Rythme métabolique, tolérance au froid, concentration et fatigue.' },
        { hormone: 'Insuline / Glucose', why: 'Stabilité énergétique, fringales et charge inflammatoire.' },
      ],
    },
    de: {
      title: 'Hormone Sind Wichtig',
      subtitle: 'Deine Marker sind keine Zufallszahlen. Sie sind Signale für Energie, Stimmung, Fokus und Erholung.',
      cards: [
        { hormone: 'Östrogen / Progesteron', why: 'Zyklusrhythmus, emotionale Stabilität und Schlafqualität.' },
        { hormone: 'Cortisol', why: 'Stresslast, Erholungsgeschwindigkeit und Empfindlichkeit des Nervensystems.' },
        { hormone: 'Schilddrüsenachse (TSH/T3/T4)', why: 'Stoffwechseltempo, Kältetoleranz, Konzentration und Müdigkeit.' },
        { hormone: 'Insulin / Glukose', why: 'Energie-Stabilität, Heißhunger und Entzündungsdruck.' },
      ],
    },
    zh: {
      title: '激素很重要',
      subtitle: '你的指标不是随机数字，而是影响精力、情绪、专注和恢复的信号。',
      cards: [
        { hormone: '雌激素 / 孕激素', why: '周期节律、情绪稳定与睡眠质量。' },
        { hormone: '皮质醇', why: '压力负荷、恢复速度和神经系统敏感性。' },
        { hormone: '甲状腺轴 (TSH/T3/T4)', why: '代谢节奏、耐寒、专注与疲劳。' },
        { hormone: '胰岛素 / 葡萄糖', why: '能量稳定、食欲波动与炎症压力。' },
      ],
    },
    ja: {
      title: 'ホルモンは重要です',
      subtitle: 'マーカーは単なる数字ではなく、エネルギー・気分・集中・回復を左右するシグナルです。',
      cards: [
        { hormone: 'エストロゲン / プロゲステロン', why: '周期リズム、情緒安定、睡眠の質に関与。' },
        { hormone: 'コルチゾール', why: 'ストレス負荷、回復速度、神経感受性に関与。' },
        { hormone: '甲状腺軸 (TSH/T3/T4)', why: '代謝ペース、寒さ耐性、集中力、疲労に関与。' },
        { hormone: 'インスリン / グルコース', why: 'エネルギー安定、食欲変動、炎症負荷に関与。' },
      ],
    },
    pt: {
      title: 'Hormônios Importam',
      subtitle: 'Seus marcadores não são números aleatórios. São sinais que moldam energia, humor, foco e recuperação.',
      cards: [
        { hormone: 'Estrogênio / Progesterona', why: 'Ritmo do ciclo, estabilidade emocional e qualidade do sono.' },
        { hormone: 'Cortisol', why: 'Carga de estresse, velocidade de recuperação e sensibilidade do sistema nervoso.' },
        { hormone: 'Eixo Tireoidiano (TSH/T3/T4)', why: 'Ritmo metabólico, tolerância ao frio, concentração e fadiga.' },
        { hormone: 'Insulina / Glicose', why: 'Estabilidade de energia, compulsões e pressão inflamatória.' },
      ],
    },
    ar: {
      title: 'الهرمونات مهمة',
      subtitle: 'مؤشراتك ليست أرقاماً عشوائية. إنها إشارات تشكّل الطاقة والمزاج والتركيز والتعافي.',
      cards: [
        { hormone: 'Estrogen / Progesterone', why: 'إيقاع الدورة، الاستقرار العاطفي وجودة النوم.' },
        { hormone: 'Cortisol', why: 'عبء التوتر، سرعة التعافي وحساسية الجهاز العصبي.' },
        { hormone: 'Thyroid Axis (TSH/T3/T4)', why: 'وتيرة الأيض، تحمّل البرودة، التركيز والإرهاق.' },
        { hormone: 'Insulin / Glucose', why: 'استقرار الطاقة، الرغبة في الأكل وضغط الالتهاب.' },
      ],
    },
    he: {
      title: 'הורמונים חשובים',
      subtitle: 'הסמנים שלך אינם מספרים אקראיים. הם אותות שמעצבים אנרגיה, מצב רוח, מיקוד והתאוששות.',
      cards: [
        { hormone: 'אסטרוגן / פרוגסטרון', why: 'קצב מחזורי, יציבות רגשית ואיכות שינה.' },
        { hormone: 'קורטיזול', why: 'עומס לחץ, מהירות התאוששות ורגישות מערכת העצבים.' },
        { hormone: 'ציר בלוטת התריס (TSH/T3/T4)', why: 'קצב חילוף חומרים, סבילות לקור, ריכוז ועייפות.' },
        { hormone: 'אינסולין / גлюקозה', why: 'יציבות אנרגיה, תשוקות ולחץ דלקתי.' },
      ],
    },
  };

  const reportsOverviewByLang: LangCopy< { title: string; subtitle: string; points: [string, string, string, string] }> = {
    en: {
      title: 'My Health Reports',
      subtitle: 'A clear, doctor-ready page that turns labs and symptoms into one structured report.',
      points: ['Upload scan/photo or paste text', 'Track lab markers by categories', 'Generate branded report with ID and date', 'Copy, Print, Share, Download, PDF in selected language'],
    },
    ru: {
      title: 'Мои отчёты о здоровье',
      subtitle: 'Понятная страница для врача: анализы и симптомы в одном структурированном отчете.',
      points: ['Загрузка скана/фото или вставка текста', 'Отслеживание показателей по категориям', 'Фирменный отчет с ID и датой генерации', 'Copy, Print, Share, Download, PDF на выбранном языке'],
    },
    uk: {
      title: 'Мої звіти про здоров’я',
      subtitle: 'Зрозуміла сторінка для лікаря: аналізи та симптоми в одному структурованому звіті.',
      points: ['Завантаження скану/фото або вставка тексту', 'Відстеження показників за категоріями', 'Фірмовий звіт з ID і датою генерації', 'Copy, Print, Share, Download, PDF обраною мовою'],
    },
    es: {
      title: 'Mis informes de salud',
      subtitle: 'Página clara para consulta médica: análisis y síntomas en un reporte estructurado.',
      points: ['Sube escaneo/foto o pega texto', 'Seguimiento de marcadores por categorías', 'Reporte de marca con ID y fecha', 'Copy, Print, Share, Download, PDF en idioma elegido'],
    },
    fr: {
      title: 'Mes rapports de santé',
      subtitle: 'Une page claire pour la consultation: analyses et symptômes dans un rapport structuré.',
      points: ['Téléverser scan/photo ou coller du texte', 'Suivi des marqueurs par catégories', 'Rapport de marque avec ID et date', 'Copy, Print, Share, Download, PDF dans la langue choisie'],
    },
    de: {
      title: 'Meine Gesundheitsberichte',
      subtitle: 'Klare Seite für den Arzttermin: Laborwerte und Symptome in einem strukturierten Bericht.',
      points: ['Scan/Foto hochladen oder Text einfügen', 'Marker nach Kategorien verfolgen', 'Markenbericht mit ID und Erstellungsdatum', 'Copy, Print, Share, Download, PDF in gewählter Sprache'],
    },
    zh: {
      title: '我的健康报告',
      subtitle: '清晰的报告页面：将化验与症状整合为结构化医生沟通报告。',
      points: ['上传扫描/照片或粘贴文本', '按类别追踪实验室指标', '生成带品牌、用户ID和日期的报告', '支持 Copy、Print、Share、Download、PDF 和语言选择'],
    },
    ja: {
      title: 'マイヘルスレポート',
      subtitle: '検査値と症状を医師向けに整理する、わかりやすいレポートページ。',
      points: ['スキャン/写真アップロードまたはテキスト貼り付け', 'カテゴリ別に検査マーカーを管理', 'ID・生成日付きのブランドレポート作成', '選択言語で Copy / Print / Share / Download / PDF'],
    },
    pt: {
      title: 'Meus relatórios de saúde',
      subtitle: 'Página clara para consulta médica: exames e sintomas em um relatório estruturado.',
      points: ['Envie scan/foto ou cole texto', 'Acompanhe marcadores por categorias', 'Relatório de marca com ID e data', 'Copy, Print, Share, Download, PDF no idioma escolhido'],
    },
  ar: {
      title: 'تقاريري الصحية',
      subtitle: 'صفحة واضحة جاهزة للطبيب: تحوّل التحاليل والأعراض إلى تقرير منظّم واحد.',
      points: ['رفع مسح/صورة أو لصق نص', 'تتبّع مؤشرات المختبر حسب الفئات', 'إنشاء تقرير بعلامة تجارية مع المعرّف والتاريخ', 'Copy وPrint وShare وDownload وPDF باللغة المختارة'],
    },
  he: {
      title: 'דוחות הבריאות שלי',
      subtitle: 'עמוד ברור מוכן לרופא: הופך בדיקות ותסמינים לדוח מובנה אחד.',
      points: ['העלאת סריקה/תמונה או הדבקת טקסט', 'מעקב אחר סמני מעבדה לפי קטגוריות', 'יצירת דוח ממותג עם מזהה ותאריך', 'Copy, Print, Share, Download, PDF בשפה שנבחרה'],
    },};

export interface LandingNarratives {
  homeStory: HomeStory;
  homeToggle: { more: string; less: string };
  hormoneFocus: { title: string; subtitle: string; cards: Array<{ hormone: string; why: string }> };
  reportsOverview: { title: string; subtitle: string; points: [string, string, string, string] };
  pricingCopy: { title: string; subtitle: string; month: string; year: string; monthNote: string; yearNote: string; saveBadge: string; cta: string; recommended: string };
}

export function getLandingNarratives(lang: Language): LandingNarratives {
  return {
    homeStory: getLang(homeStoryByLang, lang) || homeStoryByLang.en!,
    homeToggle: getLang(homeToggleByLang, lang) || homeToggleByLang.en,
    hormoneFocus: getLang(hormoneFocusByLang, lang) || hormoneFocusByLang.en!,
    reportsOverview: getLang(reportsOverviewByLang, lang) || reportsOverviewByLang.en,
    pricingCopy: getLang(pricingCopyByLang, lang) || pricingCopyByLang.en,
  };
}
