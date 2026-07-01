import React from 'react';
import { Clock, Heart, Mic, Moon, PenLine, Shield, Sparkles, Sun, Sunrise, Sunset } from 'lucide-react';
import { Language, LangCopy, getLang } from '../../constants';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW } from './publicButtonStyles';
import { PUBLIC_PAGE_ART } from '../../utils/publicPageArt';
import {
  PUBLIC_BODY,
  PUBLIC_CARD,
  PUBLIC_CARD_SOFT,
  PUBLIC_CHIP,
  PUBLIC_EYEBROW,
  PUBLIC_H1,
  PUBLIC_H2,
  PUBLIC_H3,
  PUBLIC_HERO_FRAME,
  PUBLIC_HERO_IMG,
  PUBLIC_ICON,
  PUBLIC_LEAD,
  PUBLIC_PAGE_STACK,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
  PUBLIC_SURFACE,
} from './publicPageStyles';

interface PublicRitualSectionProps {
  onSignIn: () => void;
  lang: Language;
}

type RitualPageCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroCaption: string;
  whyTitle: string;
  whyBody: string;
  whyPoints: [string, string, string];
  morningTitle: string;
  morningBody: string;
  morningPrompt: string;
  middayTitle: string;
  middayBody: string;
  middayPrompt: string;
  eveningTitle: string;
  eveningBody: string;
  eveningPrompt: string;
  rhythmTitle: string;
  flowTitle: string;
  flowSubtitle: string;
  stepSpeak: string;
  stepSpeakBody: string;
  stepCheckin: string;
  stepCheckinBody: string;
  stepRhythm: string;
  stepRhythmBody: string;
  stepPattern: string;
  stepPatternBody: string;
  preservesTitle: string;
  preservePoints: [string, string, string];
  memberTitle: string;
  memberBody: string;
  noteTitle: string;
  noteLine1: string;
  noteLine2: string;
  enterMember: string;
};

const ritualCopyByLang: LangCopy<RitualPageCopy> = {
  en: {
    eyebrow: 'RITUAL PATH',
    title: 'A path, not a task list',
    subtitle: 'A simple daily rhythm to protect attention and preserve signal — repeatable in under a minute.',
    heroCaption: 'My Day with Luna29 — a calm daily note, not a productivity sprint.',
    whyTitle: 'Why a path?',
    whyBody: 'Most wellness apps turn self-awareness into chores. Ritual Path keeps the opposite logic: small anchors that help you notice state without draining focus.',
    whyPoints: ['No streak pressure or guilt loops', 'Three gentle touchpoints: morning, midday, evening', 'Each step fits real life — 20 seconds is enough'],
    morningTitle: 'Morning',
    morningBody: 'Name your baseline before the world sets your pace.',
    morningPrompt: 'Try: “Today I feel…” or “My body starts at…”',
    middayTitle: 'Midday',
    middayBody: 'Re-check capacity and adjust plans with respect for your energy.',
    middayPrompt: 'Try: “What changed since morning?” or “What can wait?”',
    eveningTitle: 'Evening',
    eveningBody: 'Close the day with a short note to preserve signal, not noise.',
    eveningPrompt: 'Try: “What mattered today?” or “What can rest now?”',
    rhythmTitle: 'Daily rhythm',
    flowTitle: 'The one-minute flow',
    flowSubtitle: 'In the member zone, Ritual Path runs as a clear sequence you can repeat every day.',
    stepSpeak: 'Speak to Luna29',
    stepSpeakBody: 'Say how you feel in your own words — voice or text.',
    stepCheckin: 'Quick check-in',
    stepCheckinBody: 'Mark energy, mood, and sleep in a few taps.',
    stepRhythm: 'See your rhythm',
    stepRhythmBody: 'Connect today to your cycle and inner weather map.',
    stepPattern: 'Notice patterns',
    stepPatternBody: 'Luna29 surfaces repeating links — without turning them into labels.',
    preservesTitle: 'What Ritual Path preserves',
    preservePoints: ['Attention — no infinite scroll or urgency design', 'Signal — short notes that stay meaningful over time', 'Agency — you choose depth; Luna29 does not push'],
    memberTitle: 'Your private rhythm lives in the member zone',
    memberBody: 'Check-ins, voice notes, rhythm calendar, and pattern history stay private. The public page shows the shape; your member space holds the data.',
    noteTitle: 'Ready to begin?',
    noteLine1: 'This page is public by design — orientation without overload.',
    noteLine2: 'Sign in to start today’s note and build your personal Ritual Path.',
    enterMember: 'Enter Member Zone',
  },
  ru: {
    eyebrow: 'RITUAL PATH',
    title: 'Путь, а не список дел',
    subtitle: 'Простой ежедневный ритм, который защищает внимание и сохраняет сигнал состояния — повторяется меньше чем за минуту.',
    heroCaption: 'My Day with Luna29 — спокойная ежедневная заметка, а не гонка продуктивности.',
    whyTitle: 'Зачем путь?',
    whyBody: 'Большинство wellness-приложений превращают самонаблюдение в обязанности. Ritual Path работает иначе: маленькие якоря, которые помогают замечать состояние без перегруза.',
    whyPoints: ['Без давления streak и чувства вины', 'Три мягкие точки: утро, день, вечер', 'Каждый шаг вписывается в жизнь — достаточно 20 секунд'],
    morningTitle: 'Утро',
    morningBody: 'Назовите базовое состояние до того, как мир задаст темп.',
    morningPrompt: 'Попробуйте: «Сегодня я чувствую…» или «Моё тело начинается с…»',
    middayTitle: 'День',
    middayBody: 'Переоцените ресурс и скорректируйте планы с уважением к энергии.',
    middayPrompt: 'Попробуйте: «Что изменилось с утра?» или «Что может подождать?»',
    eveningTitle: 'Вечер',
    eveningBody: 'Закройте день короткой заметкой, чтобы сохранить сигнал, а не шум.',
    eveningPrompt: 'Попробуйте: «Что сегодня было важным?» или «Что может отдохнуть?»',
    rhythmTitle: 'Ежедневный ритм',
    flowTitle: 'Поток на одну минуту',
    flowSubtitle: 'В зоне участника Ritual Path идёт как понятная последовательность, которую можно повторять каждый день.',
    stepSpeak: 'Поговорить с Luna29',
    stepSpeakBody: 'Скажите, как вы себя чувствуете — голосом или текстом.',
    stepCheckin: 'Быстрый check-in',
    stepCheckinBody: 'Отметьте энергию, настроение и сон в несколько касаний.',
    stepRhythm: 'Увидеть ритм',
    stepRhythmBody: 'Свяжите сегодня с циклом и картой внутренней погоды.',
    stepPattern: 'Замечать паттерны',
    stepPatternBody: 'Luna29 показывает повторяющиеся связи — без ярлыков и диагнозов.',
    preservesTitle: 'Что сохраняет Ritual Path',
    preservePoints: ['Внимание — без бесконечной ленты и срочности', 'Сигнал — короткие заметки, которые остаются осмысленными', 'Выбор — глубину задаёте вы; Luna29 не давит'],
    memberTitle: 'Ваш личный ритм — в зоне участника',
    memberBody: 'Check-in, голосовые заметки, календарь ритма и история паттернов остаются приватными. Публичная страница показывает форму; member zone хранит данные.',
    noteTitle: 'Готовы начать?',
    noteLine1: 'Эта страница публичная по задумке — ориентир без перегруза.',
    noteLine2: 'Войдите, чтобы начать сегодняшнюю заметку и построить свой Ritual Path.',
    enterMember: 'Перейти в зону участника',
  },
  uk: {
    eyebrow: 'RITUAL PATH',
    title: 'Шлях, а не список завдань',
    subtitle: 'Простий щоденний ритм для захисту уваги і збереження сигналу стану — менше ніж за хвилину.',
    heroCaption: 'My Day with Luna29 — спокійна щоденна нотатка, а не гонка продуктивності.',
    whyTitle: 'Навіщо шлях?',
    whyBody: 'Більшість wellness-додатків перетворюють самоспостереження на обовʼязки. Ritual Path працює інакше: маленькі якорі, що допомагають помічати стан без перевантаження.',
    whyPoints: ['Без тиску streak і почуття провини', 'Три мʼякі точки: ранок, день, вечір', 'Кожен крок вписується в життя — достатньо 20 секунд'],
    morningTitle: 'Ранок',
    morningBody: 'Назвіть свій базовий стан до того, як світ задасть темп.',
    morningPrompt: 'Спробуйте: «Сьогодні я відчуваю…» або «Моє тіло починається з…»',
    middayTitle: 'День',
    middayBody: 'Переоцініть ресурс і скоригуйте плани відповідно до енергії.',
    middayPrompt: 'Спробуйте: «Що змінилося з ранку?» або «Що може почекати?»',
    eveningTitle: 'Вечір',
    eveningBody: 'Завершіть день короткою нотаткою, зберігаючи сигнал, а не шум.',
    eveningPrompt: 'Спробуйте: «Що сьогодні було важливим?» або «Що може відпочити?»',
    rhythmTitle: 'Щоденний ритм',
    flowTitle: 'Потік на одну хвилину',
    flowSubtitle: 'У зоні учасника Ritual Path іде як зрозуміла послідовність, яку можна повторювати щодня.',
    stepSpeak: 'Поговорити з Luna29',
    stepSpeakBody: 'Скажіть, як ви себе почуваєте — голосом або текстом.',
    stepCheckin: 'Швидкий check-in',
    stepCheckinBody: 'Відмітьте енергію, настрій і сон кількома дотиками.',
    stepRhythm: 'Побачити ритм',
    stepRhythmBody: 'Повʼяжіть сьогодні з циклом і картою внутрішньої погоди.',
    stepPattern: 'Помічати патерни',
    stepPatternBody: 'Luna29 показує повторювані звʼязки — без ярликів.',
    preservesTitle: 'Що зберігає Ritual Path',
    preservePoints: ['Увагу — без нескінченної стрічки', 'Сигнал — короткі нотатки зі змістом', 'Вибір — глибину задаєте ви'],
    memberTitle: 'Ваш особистий ритм — у зоні учасника',
    memberBody: 'Check-in, голосові нотатки, календар ритму та історія патернів залишаються приватними.',
    noteTitle: 'Готові почати?',
    noteLine1: 'Ця сторінка публічна за задумом — орієнтація без перевантаження.',
    noteLine2: 'Увійдіть, щоб почати сьогоднішню нотатку.',
    enterMember: 'Увійти в зону учасника',
  },
  es: {
    eyebrow: 'RITUAL PATH',
    title: 'Un camino, no una lista',
    subtitle: 'Un ritmo diario simple para proteger tu atención y conservar la señal — repetible en menos de un minuto.',
    heroCaption: 'My Day with Luna29 — una nota diaria tranquila, no una carrera de productividad.',
    whyTitle: '¿Por qué un camino?',
    whyBody: 'Muchas apps convierten la autoconciencia en tareas. Ritual Path hace lo contrario: pequeños anclajes que ayudan a notar el estado sin agotar el foco.',
    whyPoints: ['Sin presión de rachas ni culpa', 'Tres puntos suaves: mañana, mediodía, noche', 'Cada paso encaja en la vida real — 20 segundos bastan'],
    morningTitle: 'Mañana',
    morningBody: 'Nombra tu estado base antes de que el mundo marque tu ritmo.',
    morningPrompt: 'Prueba: «Hoy me siento…» o «Mi cuerpo empieza en…»',
    middayTitle: 'Mediodía',
    middayBody: 'Revisa tu capacidad y ajusta planes con respeto a tu energía.',
    middayPrompt: 'Prueba: «¿Qué cambió desde la mañana?» o «¿Qué puede esperar?»',
    eveningTitle: 'Noche',
    eveningBody: 'Cierra el día con una reflexión corta para preservar señal, no ruido.',
    eveningPrompt: 'Prueba: «¿Qué importó hoy?» o «¿Qué puede descansar?»',
    rhythmTitle: 'Ritmo diario',
    flowTitle: 'El flujo de un minuto',
    flowSubtitle: 'En la zona de miembro, Ritual Path funciona como una secuencia clara que puedes repetir cada día.',
    stepSpeak: 'Hablar con Luna29',
    stepSpeakBody: 'Di cómo te sientes — con voz o texto.',
    stepCheckin: 'Check-in rápido',
    stepCheckinBody: 'Marca energía, ánimo y sueño en pocos toques.',
    stepRhythm: 'Ver tu ritmo',
    stepRhythmBody: 'Conecta hoy con tu ciclo y mapa de clima interno.',
    stepPattern: 'Notar patrones',
    stepPatternBody: 'Luna29 muestra vínculos repetidos — sin convertirlos en etiquetas.',
    preservesTitle: 'Lo que Ritual Path preserva',
    preservePoints: ['Atención — sin scroll infinito ni urgencia', 'Señal — notas breves que siguen siendo significativas', 'Agencia — tú eliges la profundidad'],
    memberTitle: 'Tu ritmo privado vive en la zona de miembro',
    memberBody: 'Check-ins, notas de voz, calendario de ritmo e historial de patrones permanecen privados.',
    noteTitle: '¿Lista para empezar?',
    noteLine1: 'Esta página es pública por diseño — orientación sin sobrecarga.',
    noteLine2: 'Inicia sesión para empezar la nota de hoy.',
    enterMember: 'Entrar a zona de miembro',
  },
  fr: {
    eyebrow: 'RITUAL PATH',
    title: 'Un chemin, pas une liste',
    subtitle: 'Un rythme quotidien simple pour proteger l attention et conserver le signal — répétable en moins d une minute.',
    heroCaption: 'My Day with Luna29 — une note quotidienne calme, pas un sprint de productivité.',
    whyTitle: 'Pourquoi un chemin ?',
    whyBody: 'La plupart des apps transforment la conscience de soi en corvées. Ritual Path fait l inverse : de petites ancres qui aident à remarquer l état sans épuiser l attention.',
    whyPoints: ['Sans pression de streak ni culpabilité', 'Trois points doux : matin, midi, soir', 'Chaque étape tient dans la vraie vie — 20 secondes suffisent'],
    morningTitle: 'Matin',
    morningBody: 'Nommez votre base avant que le monde impose son rythme.',
    morningPrompt: 'Essayez : « Aujourd hui je me sens… » ou « Mon corps commence à… »',
    middayTitle: 'Midi',
    middayBody: 'Réévaluez votre capacité et ajustez vos plans selon votre énergie.',
    middayPrompt: 'Essayez : « Qu est-ce qui a changé ce matin ? » ou « Qu est-ce qui peut attendre ? »',
    eveningTitle: 'Soir',
    eveningBody: 'Fermez la journée avec une courte réflexion pour garder le signal, pas le bruit.',
    eveningPrompt: 'Essayez : « Qu est-ce qui comptait aujourd hui ? » ou « Qu est-ce qui peut se reposer ? »',
    rhythmTitle: 'Rythme quotidien',
    flowTitle: 'Le flux d une minute',
    flowSubtitle: 'Dans la zone membre, Ritual Path suit une séquence claire que vous pouvez répéter chaque jour.',
    stepSpeak: 'Parler avec Luna29',
    stepSpeakBody: 'Dites comment vous vous sentez — voix ou texte.',
    stepCheckin: 'Check-in rapide',
    stepCheckinBody: 'Marquez énergie, humeur et sommeil en quelques taps.',
    stepRhythm: 'Voir votre rythme',
    stepRhythmBody: 'Reliez aujourd hui à votre cycle et à la carte météo intérieure.',
    stepPattern: 'Remarquer les tendances',
    stepPatternBody: 'Luna29 fait émerger des liens répétés — sans étiquettes.',
    preservesTitle: 'Ce que Ritual Path préserve',
    preservePoints: ['L attention — pas de scroll infini', 'Le signal — des notes courtes et significatives', 'Votre choix — vous décidez de la profondeur'],
    memberTitle: 'Votre rythme privé vit dans la zone membre',
    memberBody: 'Check-ins, notes vocales, calendrier de rythme et historique des tendances restent privés.',
    noteTitle: 'Prête à commencer ?',
    noteLine1: 'Cette page est publique par design — orientation sans surcharge.',
    noteLine2: 'Connectez-vous pour commencer la note du jour.',
    enterMember: 'Entrer dans la zone membre',
  },
  de: {
    eyebrow: 'RITUAL PATH',
    title: 'Ein Pfad, keine To-do-Liste',
    subtitle: 'Ein einfacher Tagesrhythmus, der Aufmerksamkeit schützt und Signale bewahrt — in unter einer Minute wiederholbar.',
    heroCaption: 'My Day with Luna29 — eine ruhige Tagesnotiz, kein Produktivitätssprint.',
    whyTitle: 'Warum ein Pfad?',
    whyBody: 'Die meisten Apps machen Selbstwahrnehmung zur Pflicht. Ritual Path macht das Gegenteil: kleine Anker, die helfen, den Zustand zu bemerken, ohne den Fokus zu erschöpfen.',
    whyPoints: ['Kein Streak-Druck und keine Schuld', 'Drei sanfte Punkte: Morgen, Mittag, Abend', 'Jeder Schritt passt ins echte Leben — 20 Sekunden reichen'],
    morningTitle: 'Morgen',
    morningBody: 'Benenne deinen Basiszustand, bevor die Welt dein Tempo setzt.',
    morningPrompt: 'Probiere: „Heute fühle ich…“ oder „Mein Körper startet bei…“',
    middayTitle: 'Mittag',
    middayBody: 'Prüfe Kapazität neu und passe Pläne energiegerecht an.',
    middayPrompt: 'Probiere: „Was hat sich seit dem Morgen geändert?“ oder „Was kann warten?“',
    eveningTitle: 'Abend',
    eveningBody: 'Schließe den Tag mit kurzer Reflexion, um Signal statt Rauschen zu behalten.',
    eveningPrompt: 'Probiere: „Was war heute wichtig?“ oder „Was darf jetzt ruhen?“',
    rhythmTitle: 'Täglicher Rhythmus',
    flowTitle: 'Der Ein-Minuten-Flow',
    flowSubtitle: 'In der Mitgliederzone läuft Ritual Path als klare Sequenz, die du täglich wiederholen kannst.',
    stepSpeak: 'Mit Luna29 sprechen',
    stepSpeakBody: 'Sag, wie du dich fühlst — per Stimme oder Text.',
    stepCheckin: 'Schneller Check-in',
    stepCheckinBody: 'Markiere Energie, Stimmung und Schlaf mit wenigen Taps.',
    stepRhythm: 'Rhythmus sehen',
    stepRhythmBody: 'Verbinde heute mit Zyklus und innerer Wetterkarte.',
    stepPattern: 'Muster bemerken',
    stepPatternBody: 'Luna29 zeigt wiederkehrende Zusammenhänge — ohne Etiketten.',
    preservesTitle: 'Was Ritual Path bewahrt',
    preservePoints: ['Aufmerksamkeit — kein Endlos-Scroll', 'Signal — kurze Notizen mit Bedeutung', 'Wahlfreiheit — du bestimmst die Tiefe'],
    memberTitle: 'Dein privater Rhythmus lebt in der Mitgliederzone',
    memberBody: 'Check-ins, Sprachnotizen, Rhythmuskalender und Musterhistorie bleiben privat.',
    noteTitle: 'Bereit anzufangen?',
    noteLine1: 'Diese Seite ist bewusst öffentlich — Orientierung ohne Überlastung.',
    noteLine2: 'Melde dich an, um die heutige Notiz zu starten.',
    enterMember: 'Zur Mitgliederzone',
  },
  zh: {
    eyebrow: 'RITUAL PATH',
    title: '是一条路径，不是任务清单',
    subtitle: '一个简单的日常节律，保护注意力并保留状态信号——不到一分钟即可重复。',
    heroCaption: 'My Day with Luna29 — 平静的日常记录，不是效率冲刺。',
    whyTitle: '为什么是路径？',
    whyBody: '多数 wellness 应用把自我觉察变成待办。Ritual Path 相反：用小锚点帮你觉察状态，而不消耗专注。',
    whyPoints: ['没有 streak 压力和内疚循环', '三个温柔触点：早、中、晚', '每步都贴合真实生活——20 秒就够'],
    morningTitle: '早晨',
    morningBody: '在外界设定节奏前，先命名你的基线状态。',
    morningPrompt: '试试：「今天我感到…」或「我的身体从…开始」',
    middayTitle: '中午',
    middayBody: '重新评估容量，并按能量调整计划。',
    middayPrompt: '试试：「和早上相比有什么变化？」或「什么可以等等？」',
    eveningTitle: '夜晚',
    eveningBody: '用简短反思结束一天，保留信号而非噪音。',
    eveningPrompt: '试试：「今天什么最重要？」或「什么可以休息了？」',
    rhythmTitle: '日常节律',
    flowTitle: '一分钟流程',
    flowSubtitle: '在会员区，Ritual Path 是一条可每天重复的清晰序列。',
    stepSpeak: '与 Luna29 对话',
    stepSpeakBody: '用自己的话表达感受——语音或文字。',
    stepCheckin: '快速 check-in',
    stepCheckinBody: '几次点击标记能量、情绪与睡眠。',
    stepRhythm: '看见节律',
    stepRhythmBody: '把今天与周期和内在天气地图连接。',
    stepPattern: '觉察模式',
    stepPatternBody: 'Luna29 呈现重复关联——不贴标签。',
    preservesTitle: 'Ritual Path 保护什么',
    preservePoints: ['注意力——无无限滚动与紧迫感', '信号——简短而有意义的记录', '主动权——深度由你选择'],
    memberTitle: '你的私人节律在会员区',
    memberBody: 'Check-in、语音笔记、节律日历与模式历史都保持私密。',
    noteTitle: '准备开始？',
    noteLine1: '此页公开设计——提供方向，不制造过载。',
    noteLine2: '登录即可开始今天的记录。',
    enterMember: '进入会员区',
  },
  ja: {
    eyebrow: 'RITUAL PATH',
    title: 'タスクではなく、道筋',
    subtitle: '注意力を守り、状態のシグナルを残すシンプルな日次リズム——1分以内で繰り返せます。',
    heroCaption: 'My Day with Luna29 — 落ち着いた日次ノート。生産性スプリントではありません。',
    whyTitle: 'なぜ「道筋」？',
    whyBody: '多くのアプリは自己理解を義務に変えます。Ritual Path は逆で、小さなアンカーが状態に気づく手助けをし、集中力を削りません。',
    whyPoints: ['ストリーク圧や罪悪感のループなし', '3つのやさしい接点：朝・昼・夜', '各ステップは現実に合う — 20秒で十分'],
    morningTitle: '朝',
    morningBody: '世界にペースを決められる前に、自分の基準状態を言語化する。',
    morningPrompt: '例：「今日は…と感じる」「身体は…から始まる」',
    middayTitle: '昼',
    middayBody: '容量を再確認し、エネルギーに合わせて予定を調整する。',
    middayPrompt: '例：「朝から何が変わった？」「何を後回しにできる？」',
    eveningTitle: '夜',
    eveningBody: '短い振り返りで一日を閉じ、ノイズではなくシグナルを残す。',
    eveningPrompt: '例：「今日大切だったことは？」「何を休ませられる？」',
    rhythmTitle: '日次リズム',
    flowTitle: '1分フロー',
    flowSubtitle: 'メンバーゾーンでは、Ritual Path が毎日繰り返せる明確な順序として動きます。',
    stepSpeak: 'Luna29 に話す',
    stepSpeakBody: '自分の言葉で状態を伝える — 音声でもテキストでも。',
    stepCheckin: 'クイック check-in',
    stepCheckinBody: 'エネルギー・気分・睡眠を数タップで記録。',
    stepRhythm: 'リズムを見る',
    stepRhythmBody: '今日をサイクルとインナーウェザーに結びつける。',
    stepPattern: 'パターンに気づく',
    stepPatternBody: 'Luna29 が繰り返しの関連を示す — ラベル化はしない。',
    preservesTitle: 'Ritual Path が守るもの',
    preservePoints: ['注意力 — 無限スクロールや urgency なし', 'シグナル — 意味のある短いノート', '選択 — 深さはあなたが決める'],
    memberTitle: 'プライベートなリズムはメンバーゾーンに',
    memberBody: 'Check-in、音声ノート、リズムカレンダー、パターン履歴は非公開のまま。',
    noteTitle: '始める準備はできましたか？',
    noteLine1: 'このページは公開設計 — 過負荷なく方向を示します。',
    noteLine2: 'サインインして今日のノートを始めましょう。',
    enterMember: 'メンバーゾーンへ',
  },
  pt: {
    eyebrow: 'CAMINHO RITUAL',
    title: 'Um caminho, não uma lista',
    subtitle: 'Um ritmo diário simples que protege atenção e preserva sinal — repetível em menos de um minuto.',
    heroCaption: 'My Day with Luna29 — uma nota diária calma, não uma corrida de produtividade.',
    whyTitle: 'Por que um caminho?',
    whyBody: 'A maioria dos apps transforma autoconsciência em tarefas. Ritual Path faz o oposto: pequenas âncoras que ajudam a notar o estado sem drenar o foco.',
    whyPoints: ['Sem pressão de streak ou culpa', 'Três pontos suaves: manhã, meio-dia, noite', 'Cada passo cabe na vida real — 20 segundos bastam'],
    morningTitle: 'Manhã',
    morningBody: 'Nomeie sua base antes que o mundo imponha o ritmo.',
    morningPrompt: 'Tente: «Hoje eu sinto…» ou «Meu corpo começa em…»',
    middayTitle: 'Meio-dia',
    middayBody: 'Reavalie capacidade e ajuste planos com respeito à sua energia.',
    middayPrompt: 'Tente: «O que mudou desde a manhã?» ou «O que pode esperar?»',
    eveningTitle: 'Noite',
    eveningBody: 'Feche o dia com uma reflexão curta para preservar sinal, não ruído.',
    eveningPrompt: 'Tente: «O que importou hoje?» ou «O que pode descansar?»',
    rhythmTitle: 'Ritmo diário',
    flowTitle: 'O fluxo de um minuto',
    flowSubtitle: 'Na zona de membro, Ritual Path funciona como uma sequência clara para repetir todo dia.',
    stepSpeak: 'Falar com Luna29',
    stepSpeakBody: 'Diga como você se sente — por voz ou texto.',
    stepCheckin: 'Check-in rápido',
    stepCheckinBody: 'Marque energia, humor e sono em poucos toques.',
    stepRhythm: 'Ver seu ritmo',
    stepRhythmBody: 'Conecte hoje ao ciclo e ao mapa do clima interno.',
    stepPattern: 'Notar padrões',
    stepPatternBody: 'Luna29 mostra ligações repetidas — sem virar rótulos.',
    preservesTitle: 'O que Ritual Path preserva',
    preservePoints: ['Atenção — sem scroll infinito', 'Sinal — notas curtas e significativas', 'Agência — você escolhe a profundidade'],
    memberTitle: 'Seu ritmo privado fica na zona de membro',
    memberBody: 'Check-ins, notas de voz, calendário de ritmo e histórico de padrões permanecem privados.',
    noteTitle: 'Pronta para começar?',
    noteLine1: 'Esta página é pública por design — orientação sem sobrecarga.',
    noteLine2: 'Entre para começar a nota de hoje.',
    enterMember: 'Entrar na zona de membro',
  },
  ar: {
    eyebrow: 'RITUAL PATH',
    title: 'مسار، وليس قائمة مهام',
    subtitle: 'إيقاع يومي بسيط يحمي انتباهك ويحفظ إشارة حالتك — يتكرر في أقل من دقيقة.',
    heroCaption: 'My Day with Luna29 — ملاحظة يومية هادئة، وليست سباق إنتاجية.',
    whyTitle: 'لماذا مسار؟',
    whyBody: 'معظم تطبيقات العافية تحوّل الوعي الذاتي إلى واجبات. Ritual Path يعمل بالعكس: نقاط ربط صغيرة تساعدك على ملاحظة حالتك دون استنزاف تركيزك.',
    whyPoints: ['بدون ضغط streak أو شعور بالذنب', 'ثلاث نقاط لطيفة: الصباح، الظهر، المساء', 'كل خطوة تناسب الحياة الحقيقية — 20 ثانية تكفي'],
    morningTitle: 'الصباح',
    morningBody: 'سمّي حالتك الأساسية قبل أن يفرض العالم إيقاعه.',
    morningPrompt: 'جرّبي: «اليوم أشعر…» أو «جسدي يبدأ من…»',
    middayTitle: 'الظهر',
    middayBody: 'أعيدي تقييم طاقتك وعدّلي خططك باحترام لمواردك.',
    middayPrompt: 'جرّبي: «ما الذي تغيّر منذ الصباح؟» أو «ما الذي يمكن أن ينتظر؟»',
    eveningTitle: 'المساء',
    eveningBody: 'اختتمي يومك بملاحظة قصيرة تحفظ الإشارة لا الضجيج.',
    eveningPrompt: 'جرّبي: «ما الذي كان مهمّاً اليوم؟» أو «ما الذي يمكن أن يرتاح الآن؟»',
    rhythmTitle: 'الإيقاع اليومي',
    flowTitle: 'تدفق الدقيقة الواحدة',
    flowSubtitle: 'في منطقة العضو، Ritual Path يعمل كتسلسل واضح يمكنك تكراره كل يوم.',
    stepSpeak: 'تحدّثي مع Luna29',
    stepSpeakBody: 'عبّري عن شعورك بكلماتك — صوتاً أو نصاً.',
    stepCheckin: 'تسجيل سريع',
    stepCheckinBody: 'سجّلي الطاقة والمزاج والنوم ببضع نقرات.',
    stepRhythm: 'رؤية إيقاعك',
    stepRhythmBody: 'اربطي اليوم بدورتك وخريطة الطقس الداخلي.',
    stepPattern: 'ملاحظة الأنماط',
    stepPatternBody: 'Luna29 تُظهر روابط متكررة — دون تحويلها إلى أسماء أو تشخيصات.',
    preservesTitle: 'ما الذي يحفظه Ritual Path',
    preservePoints: ['الانتباه — بلا تمرير لا نهائي أو إلحاح', 'الإشارة — ملاحظات قصيرة تبقى ذات معنى', 'الاختيار — أنتِ تحددين العمق؛ Luna29 لا تضغط'],
    memberTitle: 'إيقاعك الخاص في منطقة العضو',
    memberBody: 'التسجيلات والملاحظات الصوتية وتقويم الإيقاع وتاريخ الأنماط تبقى خاصة.',
    noteTitle: 'مستعدة للبدء؟',
    noteLine1: 'هذه الصفحة عامة عن قصد — توجيه دون إرهاق.',
    noteLine2: 'سجّلي الدخول لبدء ملاحظة اليوم وبناء Ritual Path الشخصي.',
    enterMember: 'الدخول إلى منطقة العضو',
  },
  he: {
    eyebrow: 'RITUAL PATH',
    title: 'מסלול, לא רשימת משימות',
    subtitle: 'קצב יומי פשוט ששומר על הקשב ושומר את אות המצב — חוזר בפחות מדקה.',
    heroCaption: 'My Day with Luna29 — הערה יומית שקטה, לא ספרינט פרודוקטיביות.',
    whyTitle: 'למה מסלול?',
    whyBody: 'רוב אפליקציות ה-wellness הופכות מודעות עצמית למטלות. Ritual Path עושה את ההפך: עוגנים קטנים שעוזרים לשים לב למצב בלי לשאוב את המיקוד.',
    whyPoints: ['בלי לחץ streak או אשמה', 'שלוש נקודות רכות: בוקר, צהריים, ערב', 'כל שלב מתאים לחיים האמיתיים — 20 שניות מספיקות'],
    morningTitle: 'בוקר',
    morningBody: 'תני שם לקו הבסיס שלך לפני שהעולם קובע את הקצב.',
    morningPrompt: 'נסי: «היום אני מרגישה…» או «הגוף שלי מתחיל ב…»',
    middayTitle: 'צהריים',
    middayBody: 'בדקי מחדש את הקיבולת והתאימי תוכניות בהתאם לאנרגיה.',
    middayPrompt: 'נסי: «מה השתנה מאז הבוקר?» או «מה יכול לחכות?»',
    eveningTitle: 'ערב',
    eveningBody: 'סגרי את היום בהערה קצרה כדי לשמור אות, לא רעש.',
    eveningPrompt: 'נסי: «מה היה חשוב היום?» או «מה יכול לנוח עכשיו?»',
    rhythmTitle: 'קצב יומי',
    flowTitle: 'זרימה של דקה',
    flowSubtitle: 'באזור החברים, Ritual Path פועל כרצף ברור שאפשר לחזור עליו כל יום.',
    stepSpeak: 'לדבר עם Luna29',
    stepSpeakBody: 'אמרי איך את מרגישה במילים שלך — קול או טקסט.',
    stepCheckin: 'צ׳ק-אין מהיר',
    stepCheckinBody: 'סמני אנרגיה, מצב רוח ושינה בכמה הקשות.',
    stepRhythm: 'לראות את הקצב',
    stepRhythmBody: 'חברי את היום למחזור ולמפת מזג האוויר הפנימי.',
    stepPattern: 'לשים לב לדפוסים',
    stepPatternBody: 'Luna29 מציגה קשרים חוזרים — בלי להפוך אותם לתוויות.',
    preservesTitle: 'מה Ritual Path שומר',
    preservePoints: ['קשב — בלי גלילה אינסופית או דחיפות', 'אות — הערות קצרות שנשארות משמעותיות', 'בחירה — את בוחרת את העומק; Luna29 לא דוחפת'],
    memberTitle: 'הקצב הפרטי שלך באזור החברים',
    memberBody: 'צ׳ק-אינים, הערות קול, לוח קצב והיסטוריית דפוסים נשארים פרטיים.',
    noteTitle: 'מוכנה להתחיל?',
    noteLine1: 'הדף הזה ציבורי בכוונה — כיוון בלי עומס.',
    noteLine2: 'התחברי כדי להתחיל את ההערה של היום ולבנות Ritual Path אישי.',
    enterMember: 'כניסה לאזור החברים',
  },
};

const ritualIcons = [Sunrise, Sun, Sunset] as const;
const ritualAlts = ['', 'luna-vivid-card-alt-1', 'luna-vivid-card-alt-2'] as const;
const preserveIcons = [Shield, PenLine, Heart] as const;
const flowIcons = [Mic, Sparkles, Sun, Moon] as const;
const flowAlts = ['', 'luna-vivid-card-alt-1', 'luna-vivid-card-alt-2', 'luna-vivid-card-alt-3'] as const;

export const PublicRitualSection: React.FC<PublicRitualSectionProps> = ({ onSignIn, lang }) => {
  const copy = getLang(ritualCopyByLang, lang) || ritualCopyByLang.en;
  const rhythmSteps = [
    { title: copy.morningTitle, body: copy.morningBody, prompt: copy.morningPrompt },
    { title: copy.middayTitle, body: copy.middayBody, prompt: copy.middayPrompt },
    { title: copy.eveningTitle, body: copy.eveningBody, prompt: copy.eveningPrompt },
  ];
  const flowSteps = [
    { title: copy.stepSpeak, body: copy.stepSpeakBody },
    { title: copy.stepCheckin, body: copy.stepCheckinBody },
    { title: copy.stepRhythm, body: copy.stepRhythmBody },
    { title: copy.stepPattern, body: copy.stepPatternBody },
  ];

  return (
    <section className={PUBLIC_PAGE_STACK}>
      <section className={`${PUBLIC_SHELL} luna-page-ritual luna-page-focus luna-focus-home ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-6 sm:gap-8 items-center min-w-0 w-full`}>
          <header className="space-y-4">
            <p className={PUBLIC_EYEBROW}>{copy.eyebrow}</p>
            <h1 className={PUBLIC_H1}>{copy.title}</h1>
            <p className={PUBLIC_LEAD}>{copy.subtitle}</p>
            <p className={`${PUBLIC_CHIP} inline-flex items-center gap-2`}>
              <Clock size={12} />
              &lt; 1 min
            </p>
          </header>

          <div className={`${PUBLIC_HERO_FRAME} h-56 md:h-72 lg:h-80`}>
            <img
              src={PUBLIC_PAGE_ART.ritual}
              alt="My Day with Luna29"
              loading="eager"
              decoding="async"
              className={`h-full ${PUBLIC_HERO_IMG}`}
              style={{ objectPosition: 'center 32%' }}
            />
            <p className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-gradient-to-t from-slate-100/95 via-slate-100/70 to-transparent dark:from-slate-950/95 dark:via-slate-950/70">
              {copy.heroCaption}
            </p>
          </div>
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-journey ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} ${PUBLIC_SURFACE} space-y-5`}>
          <div className="space-y-2 max-w-3xl">
            <h2 className={PUBLIC_H2}>{copy.whyTitle}</h2>
            <p className={PUBLIC_BODY}>{copy.whyBody}</p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {copy.whyPoints.map((point, index) => (
              <li key={point} className={`${PUBLIC_CARD_SOFT} flex gap-3 items-start`}>
                <span className={PUBLIC_ICON}>
                  <Sparkles size={14} />
                </span>
                <span className={PUBLIC_BODY}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-ritual ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} space-y-5`}>
          <h2 className={PUBLIC_H2}>{copy.rhythmTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rhythmSteps.map((step, index) => {
              const Icon = ritualIcons[index] ?? Moon;
              return (
                <article key={step.title} className={`${PUBLIC_CARD} min-h-0 sm:min-h-[200px] ${ritualAlts[index] ?? ''}`}>
                  <span className={PUBLIC_ICON}>
                    <Icon size={16} />
                  </span>
                  <h3 className={`mt-3 ${PUBLIC_H3}`}>{step.title}</h3>
                  <p className={`mt-2 ${PUBLIC_BODY}`}>{step.body}</p>
                  <p className={`mt-3 text-xs font-medium text-luna-purple/90 italic`}>{step.prompt}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-knowledge ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} space-y-5`}>
          <div className="space-y-2 max-w-3xl">
            <h2 className={PUBLIC_H2}>{copy.flowTitle}</h2>
            <p className={PUBLIC_BODY}>{copy.flowSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {flowSteps.map((step, index) => {
              const Icon = flowIcons[index] ?? Sparkles;
              return (
                <article key={step.title} className={`${PUBLIC_CARD_SOFT} ${flowAlts[index] ?? ''}`}>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-luna-purple text-white text-[10px] font-black">
                    {index + 1}
                  </span>
                  <span className={`mt-3 block ${PUBLIC_ICON}`}>
                    <Icon size={14} />
                  </span>
                  <h3 className={`mt-2 ${PUBLIC_H3}`}>{step.title}</h3>
                  <p className={`mt-2 ${PUBLIC_BODY}`}>{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-bodymap ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} ${PUBLIC_SURFACE} space-y-5`}>
          <h2 className={PUBLIC_H2}>{copy.preservesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {copy.preservePoints.map((point, index) => {
              const Icon = preserveIcons[index] ?? Shield;
              return (
                <article key={point} className={`${PUBLIC_CARD} ${ritualAlts[index] ?? ''}`}>
                  <span className={PUBLIC_ICON}>
                    <Icon size={14} />
                  </span>
                  <p className={`mt-3 ${PUBLIC_BODY}`}>{point}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-journey ${PUBLIC_SHELL_PAD}`}>
        <article className={`${PUBLIC_SHELL_INNER} ${PUBLIC_CARD_SOFT} luna-vivid-card-alt-3 space-y-3`}>
          <p className={PUBLIC_H3}>{copy.memberTitle}</p>
          <p className={PUBLIC_BODY}>{copy.memberBody}</p>
        </article>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-pricing luna-page-focus luna-focus-pricing ${PUBLIC_SHELL_PAD}`}>
        <article className={`${PUBLIC_SHELL_INNER} ${PUBLIC_CARD} space-y-4 text-center`}>
          <p className={PUBLIC_EYEBROW}>{copy.noteTitle}</p>
          <p className={`mx-auto max-w-2xl ${PUBLIC_BODY}`}>
            {copy.noteLine1}
            <br />
            {copy.noteLine2}
          </p>
          <button type="button" onClick={onSignIn} className={`${PUBLIC_BTN_PRIMARY} px-7 py-3 text-sm tracking-[0.08em] mt-2`}>
            <span className={PUBLIC_BTN_PRIMARY_GLOW} />
            <span className="relative z-10">{copy.enterMember}</span>
          </button>
        </article>
      </section>
    </section>
  );
};
