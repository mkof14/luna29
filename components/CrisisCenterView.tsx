import React, { useEffect, useMemo, useState } from 'react';
import { Language, LangCopy, getLang } from '../constants';

type GroundingState = {
  see: string[];
  feel: string[];
  hear: string[];
  smell: string[];
  taste: string[];
};

const NOTE_STORAGE_KEY = 'luna_reset_room_note_v1';
const GROUNDING_STORAGE_KEY = 'luna_reset_room_grounding_v1';
const STEPS_STORAGE_KEY = 'luna_reset_room_steps_v1';

const defaultGrounding: GroundingState = {
  see: Array(5).fill(''),
  feel: Array(4).fill(''),
  hear: Array(3).fill(''),
  smell: Array(2).fill(''),
  taste: Array(1).fill(''),
};

const defaultSteps = [false, false, false, false];

export const CrisisCenterView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const copyByLang = {
    en: {
      back: 'Back',
      title: 'Reset Room',
      subtitle: 'A live stabilization space for intense moments.',
      demand: 'Nervous System Overload Detected',
      breathTitle: 'Breath Protocol',
      breathProtocol: 'Inhale 4s • Hold 4s • Exhale 6s',
      start: 'Start',
      pause: 'Pause',
      reset: 'Reset',
      cycles: 'Completed cycles',
      groundingTitle: 'Grounding 5-4-3-2-1',
      groundingSubtitle: 'Fill what you notice right now. This lowers system intensity by restoring orientation.',
      toolsTitle: 'Immediate Actions',
      call911: 'Call 911',
      call988: 'Call 988 Lifeline',
      copyMessage: 'Copy check-in message',
      copied: 'Message copied',
      copyFailed: 'Copy failed',
      noteTitle: 'Personal Safety Note',
      notePlaceholder: 'Write one grounding sentence for yourself...',
      checklistTitle: 'Next 10-Minute Plan',
      checklist: ['Drink water', 'Open a window / fresh air', 'Send one safe-message', 'Set a 10-minute timer'],
      commentsTitle: 'After-Reset Comments',
      comments: [
        { quote: 'The breathing timer helps me stop spiraling in under two minutes.', author: 'Maya • 29' },
        { quote: 'Grounding fields make me focus on reality, not panic loops.', author: 'Elena • 34' },
        { quote: 'Copy message saved me from writing while overloaded.', author: 'Rina • 31' },
      ],
      quickStartTitle: 'How To Use This Page',
      quickStart: [
        '1. Start Breath Protocol and complete at least 3 cycles.',
        '2. Fill Grounding fields with short real observations.',
        '3. Use one Immediate Action (call or copy message).',
        '4. Complete your 10-minute plan and leave one note.',
      ],
      breathingHint: 'Tip: do not force deep breathing. Keep it soft and rhythmic.',
      groundingHint: 'Tip: write simple facts, not analysis.',
      toolsHint: 'Tip: if verbal communication is hard, use the copied message first.',
      checklistHint: 'Tip: complete only one step at a time.',
    },
    ru: {
      back: 'Назад',
      title: 'Комната Стабилизации',
      subtitle: 'Живое пространство самопомощи в интенсивные моменты.',
      demand: 'Выявлена Перегрузка Нервной Системы',
      breathTitle: 'Дыхательный Протокол',
      breathProtocol: 'Вдох 4с • Пауза 4с • Выдох 6с',
      start: 'Старт',
      pause: 'Пауза',
      reset: 'Сброс',
      cycles: 'Завершено циклов',
      groundingTitle: 'Заземление 5-4-3-2-1',
      groundingSubtitle: 'Заполните, что вы замечаете сейчас. Это снижает интенсивность состояния.',
      toolsTitle: 'Срочные Действия',
      call911: 'Позвонить 911',
      call988: 'Позвонить 988',
      copyMessage: 'Скопировать сообщение',
      copied: 'Сообщение скопировано',
      copyFailed: 'Не удалось скопировать',
      noteTitle: 'Личная Опорная Заметка',
      notePlaceholder: 'Запишите одну опорную фразу для себя...',
      checklistTitle: 'План На Ближайшие 10 Минут',
      checklist: ['Выпить воды', 'Открыть окно / свежий воздух', 'Отправить безопасное сообщение', 'Поставить таймер на 10 минут'],
      commentsTitle: 'Комментарии После Reset',
      comments: [
        { quote: 'Таймер дыхания останавливает раскрутку тревоги за пару минут.', author: 'Майя • 29' },
        { quote: 'Поля заземления возвращают в реальность, а не в панический цикл.', author: 'Елена • 34' },
        { quote: 'Кнопка копирования сообщения спасает, когда перегруз и нет слов.', author: 'Рина • 31' },
      ],
      quickStartTitle: 'Как Пользоваться Этой Страницей',
      quickStart: [
        '1. Запустите дыхание и пройдите минимум 3 цикла.',
        '2. Заполните поля заземления короткими реальными фактами.',
        '3. Используйте одно срочное действие (звонок или копирование сообщения).',
        '4. Отметьте план на 10 минут и запишите одну опорную заметку.',
      ],
      breathingHint: 'Подсказка: дышите мягко, не форсируйте глубину вдоха.',
      groundingHint: 'Подсказка: фиксируйте факты, без анализа.',
      toolsHint: 'Подсказка: если сложно говорить, сначала отправьте готовое сообщение.',
      checklistHint: 'Подсказка: делайте по одному шагу за раз.',
    },
    uk: {
      back: 'Назад',
      title: 'Кімната Стабілізації',
      subtitle: 'Живий простір самодопомоги в інтенсивні моменти.',
      demand: 'Виявлено Перевантаження Нервової Системи',
      breathTitle: 'Дихальний Протокол',
      breathProtocol: 'Вдих 4с • Пауза 4с • Видих 6с',
      start: 'Старт',
      pause: 'Пауза',
      reset: 'Скидання',
      cycles: 'Завершено циклів',
      groundingTitle: 'Заземлення 5-4-3-2-1',
      groundingSubtitle: 'Заповніть, що ви помічаєте зараз. Це знижує інтенсивність стану.',
      toolsTitle: 'Термінові Дії',
      call911: 'Подзвонити 911',
      call988: 'Подзвонити 988',
      copyMessage: 'Скопіювати повідомлення',
      copied: 'Повідомлення скопійовано',
      copyFailed: 'Не вдалося скопіювати',
      noteTitle: 'Особиста Опорна Нотатка',
      notePlaceholder: 'Запишіть одну опорну фразу для себе...',
      checklistTitle: 'План На Найближчі 10 Хвилин',
      checklist: ['Випити води', 'Відкрити вікно / свіже повітря', 'Надіслати безпечне повідомлення', 'Поставити таймер на 10 хвилин'],
      commentsTitle: 'Коментарі Після Reset',
      comments: [
        { quote: 'Таймер дихання зупиняє панічну спіраль за кілька хвилин.', author: 'Maya • 29' },
        { quote: 'Поля заземлення повертають у реальність.', author: 'Elena • 34' },
        { quote: 'Копія повідомлення рятує, коли важко говорити.', author: 'Rina • 31' },
      ],
      quickStartTitle: 'Як Користуватись Цією Сторінкою',
      quickStart: [
        '1. Запустіть дихання і пройдіть щонайменше 3 цикли.',
        '2. Заповніть поля заземлення короткими фактами.',
        '3. Використайте одну термінову дію (дзвінок або копія повідомлення).',
        '4. Виконайте план на 10 хвилин і залиште одну нотатку.',
      ],
      breathingHint: 'Порада: дихайте мʼяко, не форсуйте глибину.',
      groundingHint: 'Порада: фіксуйте факти, без аналізу.',
      toolsHint: 'Порада: якщо важко говорити, спочатку надішліть готове повідомлення.',
      checklistHint: 'Порада: виконуйте по одному кроку.',
    },
    es: {
      back: 'Atras',
      title: 'Sala Reset',
      subtitle: 'Espacio vivo de estabilizacion para momentos intensos.',
      demand: 'Sobrecarga Del Sistema Nervioso Detectada',
      breathTitle: 'Protocolo De Respiracion',
      breathProtocol: 'Inhala 4s • Pausa 4s • Exhala 6s',
      start: 'Iniciar',
      pause: 'Pausa',
      reset: 'Reiniciar',
      cycles: 'Ciclos completados',
      groundingTitle: 'Anclaje 5-4-3-2-1',
      groundingSubtitle: 'Escribe lo que notas ahora. Esto reduce la intensidad.',
      toolsTitle: 'Acciones Inmediatas',
      call911: 'Llamar 911',
      call988: 'Llamar 988',
      copyMessage: 'Copiar mensaje',
      copied: 'Mensaje copiado',
      copyFailed: 'Error al copiar',
      noteTitle: 'Nota Personal De Seguridad',
      notePlaceholder: 'Escribe una frase de apoyo para ti...',
      checklistTitle: 'Plan Para Los Proximos 10 Minutos',
      checklist: ['Tomar agua', 'Abrir una ventana / aire fresco', 'Enviar un mensaje seguro', 'Poner temporizador de 10 minutos'],
      commentsTitle: 'Comentarios Post-Reset',
      comments: [
        { quote: 'El temporizador de respiracion frena la espiral rapido.', author: 'Maya • 29' },
        { quote: 'Los campos de anclaje me devuelven a la realidad.', author: 'Elena • 34' },
        { quote: 'Copiar mensaje me salvo cuando no podia escribir.', author: 'Rina • 31' },
      ],
      quickStartTitle: 'Como Usar Esta Pagina',
      quickStart: [
        '1. Inicia el protocolo y completa al menos 3 ciclos.',
        '2. Completa anclaje con observaciones simples.',
        '3. Usa una accion inmediata (llamada o copiar mensaje).',
        '4. Completa tu plan de 10 minutos y deja una nota.',
      ],
      breathingHint: 'Tip: no fuerces la respiracion profunda.',
      groundingHint: 'Tip: escribe hechos simples, sin analizar.',
      toolsHint: 'Tip: si hablar es dificil, usa primero el mensaje copiado.',
      checklistHint: 'Tip: haz un paso a la vez.',
    },
    fr: {
      back: 'Retour',
      title: 'Salle Reset',
      subtitle: 'Espace de stabilisation en direct pour les moments intenses.',
      demand: 'Surcharge Du Systeme Nerveux Detectee',
      breathTitle: 'Protocole Respiratoire',
      breathProtocol: 'Inspire 4s • Pause 4s • Expire 6s',
      start: 'Demarrer',
      pause: 'Pause',
      reset: 'Reinitialiser',
      cycles: 'Cycles termines',
      groundingTitle: 'Ancrage 5-4-3-2-1',
      groundingSubtitle: 'Ecrivez ce que vous remarquez maintenant. Cela baisse l intensite.',
      toolsTitle: 'Actions Immediates',
      call911: 'Appeler 911',
      call988: 'Appeler 988',
      copyMessage: 'Copier le message',
      copied: 'Message copie',
      copyFailed: 'Copie impossible',
      noteTitle: 'Note Personnelle De Securite',
      notePlaceholder: 'Ecrivez une phrase d ancrage pour vous...',
      checklistTitle: 'Plan Des 10 Prochaines Minutes',
      checklist: ['Boire de l eau', 'Ouvrir une fenetre / air frais', 'Envoyer un message securisant', 'Mettre un minuteur 10 minutes'],
      commentsTitle: 'Commentaires Apres Reset',
      comments: [
        { quote: 'Le minuteur respiratoire stoppe vite la spirale.', author: 'Maya • 29' },
        { quote: 'Les champs d ancrage me ramennent au reel.', author: 'Elena • 34' },
        { quote: 'Le message copie m aide quand je suis surchargee.', author: 'Rina • 31' },
      ],
      quickStartTitle: 'Comment Utiliser Cette Page',
      quickStart: [
        '1. Lancez le protocole et faites au moins 3 cycles.',
        '2. Remplissez les champs d ancrage avec des faits simples.',
        '3. Utilisez une action immediate (appel ou copie message).',
        '4. Terminez votre plan de 10 minutes et laissez une note.',
      ],
      breathingHint: 'Conseil: gardez une respiration douce et rythmee.',
      groundingHint: 'Conseil: notez des faits simples, pas d analyse.',
      toolsHint: 'Conseil: si parler est difficile, envoyez d abord le message copie.',
      checklistHint: 'Conseil: faites une etape a la fois.',
    },
    de: {
      back: 'Zuruck',
      title: 'Reset Raum',
      subtitle: 'Live-Stabilisierung fur intensive Momente.',
      demand: 'Nervensystem-Uberlastung Erkannt',
      breathTitle: 'Atemprotokoll',
      breathProtocol: 'Einatmen 4s • Halten 4s • Ausatmen 6s',
      start: 'Start',
      pause: 'Pause',
      reset: 'Reset',
      cycles: 'Abgeschlossene Zyklen',
      groundingTitle: 'Grounding 5-4-3-2-1',
      groundingSubtitle: 'Notiere, was du jetzt wahrnimmst. Das senkt die Intensitat.',
      toolsTitle: 'Sofortaktionen',
      call911: '911 Anrufen',
      call988: '988 Anrufen',
      copyMessage: 'Nachricht kopieren',
      copied: 'Nachricht kopiert',
      copyFailed: 'Kopieren fehlgeschlagen',
      noteTitle: 'Persoenliche Sicherheitsnotiz',
      notePlaceholder: 'Schreibe einen stabilisierenden Satz fur dich...',
      checklistTitle: 'Plan Fur Die Nachsten 10 Minuten',
      checklist: ['Wasser trinken', 'Fenster offnen / frische Luft', 'Eine sichere Nachricht senden', '10-Minuten-Timer setzen'],
      commentsTitle: 'Kommentare Nach Reset',
      comments: [
        { quote: 'Der Atemtimer stoppt meine Spirale in Minuten.', author: 'Maya • 29' },
        { quote: 'Grounding-Felder holen mich in die Realitat zuruck.', author: 'Elena • 34' },
        { quote: 'Nachricht kopieren hilft bei Uberlastung ohne Worte.', author: 'Rina • 31' },
      ],
      quickStartTitle: 'So Nutzt Du Diese Seite',
      quickStart: [
        '1. Starte das Atemprotokoll und schaffe mindestens 3 Zyklen.',
        '2. Fulle Grounding mit kurzen realen Beobachtungen aus.',
        '3. Nutze eine Sofortaktion (Anruf oder Nachricht kopieren).',
        '4. SchlieBe den 10-Minuten-Plan ab und schreibe eine Notiz.',
      ],
      breathingHint: 'Tipp: nicht tief erzwingen, weich und rhythmisch atmen.',
      groundingHint: 'Tipp: einfache Fakten notieren, nicht analysieren.',
      toolsHint: 'Tipp: wenn Sprechen schwer ist, zuerst die kopierte Nachricht senden.',
      checklistHint: 'Tipp: immer nur einen Schritt gleichzeitig.',
    },
    zh: {
      back: '返回',
      title: '重置空间',
      subtitle: '用于高压时刻的实时稳定页面。',
      demand: '检测到神经系统过载',
      breathTitle: '呼吸协议',
      breathProtocol: '吸气 4秒 • 停 4秒 • 呼气 6秒',
      start: '开始',
      pause: '暂停',
      reset: '重置',
      cycles: '完成循环',
      groundingTitle: '着陆法 5-4-3-2-1',
      groundingSubtitle: '填写你当下真实注意到的内容，帮助降低强度。',
      toolsTitle: '立即操作',
      call911: '拨打 911',
      call988: '拨打 988',
      copyMessage: '复制消息',
      copied: '消息已复制',
      copyFailed: '复制失败',
      noteTitle: '个人安全备注',
      notePlaceholder: '写下一句支持自己的话...',
      checklistTitle: '接下来 10 分钟计划',
      checklist: ['喝水', '开窗 / 新鲜空气', '发送一条安全消息', '设置 10 分钟计时器'],
      commentsTitle: '重置后评论',
      comments: [
        { quote: '呼吸计时器能很快打断恐慌循环。', author: 'Maya • 29' },
        { quote: '着陆输入让我回到现实。', author: 'Elena • 34' },
        { quote: '复制消息功能在过载时非常有用。', author: 'Rina • 31' },
      ],
      quickStartTitle: '如何使用本页',
      quickStart: [
        '1. 启动呼吸协议，至少完成 3 个循环。',
        '2. 用简短事实填写着陆字段。',
        '3. 使用一个立即操作（拨号或复制消息）。',
        '4. 完成 10 分钟计划并留下一条备注。',
      ],
      breathingHint: '提示：不要强迫深呼吸，保持轻柔有节奏。',
      groundingHint: '提示：只写事实，不做分析。',
      toolsHint: '提示：如果难以说话，先发送复制消息。',
      checklistHint: '提示：一次只做一个步骤。',
    },
    ja: {
      back: '戻る',
      title: 'リセットルーム',
      subtitle: '強い負荷の瞬間に使うリアルタイム安定化ページ。',
      demand: '神経系の過負荷を検知',
      breathTitle: '呼吸プロトコル',
      breathProtocol: '吸う 4秒 • 止める 4秒 • 吐く 6秒',
      start: '開始',
      pause: '停止',
      reset: 'リセット',
      cycles: '完了サイクル',
      groundingTitle: 'グラウンディング 5-4-3-2-1',
      groundingSubtitle: '今気づくことを入力してください。強度を下げる助けになります。',
      toolsTitle: '即時アクション',
      call911: '911 に電話',
      call988: '988 に電話',
      copyMessage: 'メッセージをコピー',
      copied: 'メッセージをコピーしました',
      copyFailed: 'コピーできませんでした',
      noteTitle: '個人セーフティメモ',
      notePlaceholder: '自分を落ち着かせる一文を書いてください...',
      checklistTitle: '次の10分プラン',
      checklist: ['水を飲む', '窓を開ける / 新鮮な空気', '安全なメッセージを送る', '10分タイマーを設定'],
      commentsTitle: 'リセット後コメント',
      comments: [
        { quote: '呼吸タイマーで数分以内にパニックが落ち着きます。', author: 'Maya • 29' },
        { quote: 'グラウンディング入力で現実に戻れます。', author: 'Elena • 34' },
        { quote: 'コピー機能は過負荷時にとても助かります。', author: 'Rina • 31' },
      ],
      quickStartTitle: 'このページの使い方',
      quickStart: [
        '1. 呼吸プロトコルを開始し、最低3サイクル実施。',
        '2. グラウンディング欄に短い事実を入力。',
        '3. 即時アクションを1つ実行（電話またはコピー）。',
        '4. 10分プランを完了し、メモを1つ残す。',
      ],
      breathingHint: 'ヒント: 深く吸いすぎず、やわらかく一定に。',
      groundingHint: 'ヒント: 分析せず、事実だけを記入。',
      toolsHint: 'ヒント: 話しにくい時は先にコピー文を送信。',
      checklistHint: 'ヒント: 1回に1ステップだけ進める。',
    },
    pt: {
      back: 'Voltar',
      title: 'Sala Reset',
      subtitle: 'Espaco de estabilizacao ao vivo para momentos intensos.',
      demand: 'Sobrecarga Do Sistema Nervoso Detectada',
      breathTitle: 'Protocolo De Respiracao',
      breathProtocol: 'Inspirar 4s • Segurar 4s • Expirar 6s',
      start: 'Iniciar',
      pause: 'Pausar',
      reset: 'Resetar',
      cycles: 'Ciclos concluidos',
      groundingTitle: 'Aterramento 5-4-3-2-1',
      groundingSubtitle: 'Preencha o que voce percebe agora. Isso reduz a intensidade.',
      toolsTitle: 'Acoes Imediatas',
      call911: 'Ligar 911',
      call988: 'Ligar 988',
      copyMessage: 'Copiar mensagem',
      copied: 'Mensagem copiada',
      copyFailed: 'Falha ao copiar',
      noteTitle: 'Nota Pessoal De Seguranca',
      notePlaceholder: 'Escreva uma frase de apoio para voce...',
      checklistTitle: 'Plano Dos Proximos 10 Minutos',
      checklist: ['Beber agua', 'Abrir janela / ar fresco', 'Enviar mensagem segura', 'Definir timer de 10 minutos'],
      commentsTitle: 'Comentarios Pos-Reset',
      comments: [
        { quote: 'O timer de respiracao corta a espiral rapido.', author: 'Maya • 29' },
        { quote: 'Os campos de aterramento me trazem de volta ao real.', author: 'Elena • 34' },
        { quote: 'Copiar mensagem me ajuda quando estou sobrecarregada.', author: 'Rina • 31' },
      ],
      quickStartTitle: 'Como Usar Esta Pagina',
      quickStart: [
        '1. Inicie o protocolo e complete pelo menos 3 ciclos.',
        '2. Preencha o aterramento com observacoes curtas e reais.',
        '3. Use uma acao imediata (ligacao ou copiar mensagem).',
        '4. Complete seu plano de 10 minutos e deixe uma nota.',
      ],
      breathingHint: 'Dica: nao force respiracao profunda; mantenha ritmo suave.',
      groundingHint: 'Dica: escreva fatos simples, sem analise.',
      toolsHint: 'Dica: se falar estiver dificil, envie primeiro a mensagem copiada.',
      checklistHint: 'Dica: conclua um passo por vez.',
    },
  };

  const copy = getLang(copyByLang, lang) || copyByLang.en;
  const phaseCopyByLang: LangCopy< { inhale: string; hold: string; exhale: string }> = {
    en: { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale' },
    ru: { inhale: 'Вдох', hold: 'Пауза', exhale: 'Выдох' },
    uk: { inhale: 'Вдих', hold: 'Пауза', exhale: 'Видих' },
    es: { inhale: 'Inhala', hold: 'Pausa', exhale: 'Exhala' },
    fr: { inhale: 'Inspire', hold: 'Pause', exhale: 'Expire' },
    de: { inhale: 'Einatmen', hold: 'Halten', exhale: 'Ausatmen' },
    zh: { inhale: '吸气', hold: '停留', exhale: '呼气' },
    ja: { inhale: '吸う', hold: '止める', exhale: '吐く' },
    pt: { inhale: 'Inspirar', hold: 'Pausa', exhale: 'Expirar' },
  };
  const phaseText = getLang(phaseCopyByLang, lang) || phaseCopyByLang.en;
  const phases = useMemo(
    () => [
      { key: 'inhale', label: phaseText.inhale, sec: 4 },
      { key: 'hold', label: phaseText.hold, sec: 4 },
      { key: 'exhale', label: phaseText.exhale, sec: 6 },
    ],
    [phaseText.exhale, phaseText.hold, phaseText.inhale],
  );

  const sensesByLang: LangCopy< { see: string; feel: string; hear: string; smell: string; taste: string }> = {
    en: { see: 'See', feel: 'Feel', hear: 'Hear', smell: 'Smell', taste: 'Taste' },
    ru: { see: 'Вижу', feel: 'Ощущаю', hear: 'Слышу', smell: 'Чую', taste: 'Вкус' },
    uk: { see: 'Бачу', feel: 'Відчуваю', hear: 'Чую', smell: 'Нюхаю', taste: 'Смак' },
    es: { see: 'Veo', feel: 'Siento', hear: 'Oigo', smell: 'Huelo', taste: 'Sabor' },
    fr: { see: 'Je vois', feel: 'Je ressens', hear: "J entends", smell: 'Je sens', taste: 'Gout' },
    de: { see: 'Sehe', feel: 'Spuere', hear: 'Hoere', smell: 'Rieche', taste: 'Schmecke' },
    zh: { see: '看到', feel: '感到', hear: '听到', smell: '闻到', taste: '尝到' },
    ja: { see: '見る', feel: '感じる', hear: '聞く', smell: '嗅ぐ', taste: '味わう' },
    pt: { see: 'Vejo', feel: 'Sinto', hear: 'Ouco', smell: 'Cheiro', taste: 'Sabor' },
  };
  const senses = getLang(sensesByLang, lang) || sensesByLang.en;

  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(phases[0].sec);
  const [cycles, setCycles] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState('');

  const [grounding, setGrounding] = useState<GroundingState>(() => {
    try {
      const raw = localStorage.getItem(GROUNDING_STORAGE_KEY);
      if (!raw) return defaultGrounding;
      const parsed = JSON.parse(raw) as GroundingState;
      return {
        see: Array.isArray(parsed.see) ? parsed.see.slice(0, 5) : defaultGrounding.see,
        feel: Array.isArray(parsed.feel) ? parsed.feel.slice(0, 4) : defaultGrounding.feel,
        hear: Array.isArray(parsed.hear) ? parsed.hear.slice(0, 3) : defaultGrounding.hear,
        smell: Array.isArray(parsed.smell) ? parsed.smell.slice(0, 2) : defaultGrounding.smell,
        taste: Array.isArray(parsed.taste) ? parsed.taste.slice(0, 1) : defaultGrounding.taste,
      };
    } catch {
      return defaultGrounding;
    }
  });

  const [note, setNote] = useState(() => localStorage.getItem(NOTE_STORAGE_KEY) || '');
  const [steps, setSteps] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(STEPS_STORAGE_KEY);
      if (!raw) return defaultSteps;
      const parsed = JSON.parse(raw) as boolean[];
      return Array.isArray(parsed) ? parsed.slice(0, 4) : defaultSteps;
    } catch {
      return defaultSteps;
    }
  });

  useEffect(() => {
    localStorage.setItem(GROUNDING_STORAGE_KEY, JSON.stringify(grounding));
  }, [grounding]);

  useEffect(() => {
    localStorage.setItem(NOTE_STORAGE_KEY, note);
  }, [note]);

  useEffect(() => {
    localStorage.setItem(STEPS_STORAGE_KEY, JSON.stringify(steps));
  }, [steps]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setPhaseRemaining((prev) => {
        if (prev > 1) return prev - 1;
        setPhaseIndex((current) => {
          const next = (current + 1) % phases.length;
          if (next === 0) setCycles((old) => old + 1);
          return next;
        });
        return phases[(phaseIndex + 1) % phases.length].sec;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, phaseIndex, phases]);

  const updateGrounding = (sense: keyof GroundingState, index: number, value: string) => {
    setGrounding((prev) => {
      const next = [...prev[sense]];
      next[index] = value;
      return { ...prev, [sense]: next };
    });
  };

  const groundingProgress = useMemo(() => {
    const all = [...grounding.see, ...grounding.feel, ...grounding.hear, ...grounding.smell, ...grounding.taste];
    const done = all.filter((item) => item.trim().length > 0).length;
    return { done, total: 15, percent: Math.round((done / 15) * 100) };
  }, [grounding]);

  const resetBreathing = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setPhaseRemaining(phases[0].sec);
    setCycles(0);
  };

  const copyMessage = async () => {
    const messageByLang: LangCopy< string> = {
      en: 'I am in overload right now. I am using my reset protocol and will reconnect shortly.',
      ru: 'Сейчас у меня перегрузка. Я в режиме стабилизации и вернусь к разговору позже.',
      uk: 'Зараз у мене перевантаження. Я в режимі стабілізації і повернусь до розмови пізніше.',
      es: 'Ahora mismo tengo sobrecarga. Estoy usando mi protocolo de estabilizacion y vuelvo en breve.',
      fr: 'Je suis en surcharge pour le moment. J utilise mon protocole reset et je reviens tres vite.',
      de: 'Ich bin gerade uberlastet. Ich nutze mein Reset-Protokoll und melde mich gleich wieder.',
      zh: '我现在处于过载状态。我正在执行重置流程，稍后会恢复联系。',
      ja: '今は過負荷の状態です。リセット手順を使って落ち着き、少ししてから戻ります。',
      pt: 'Estou em sobrecarga agora. Estou usando meu protocolo reset e retorno em breve.',
    };
    const message = getLang(messageByLang, lang) || messageByLang.en;
    try {
      await navigator.clipboard.writeText(message);
      setCopyFeedback(copy.copied);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      setCopyFeedback(copy.copyFailed);
    }
  };

  const currentPhase = phases[phaseIndex];
  const phaseScale = currentPhase.key === 'inhale' ? 'scale-110' : currentPhase.key === 'hold' ? 'scale-95' : 'scale-75';
  const panelClass =
    'rounded-[2.3rem] border border-slate-300/80 dark:border-[#28406d] bg-gradient-to-br from-[#e8d7e3]/96 via-[#e1d4e6]/94 to-[#d7dfed]/92 dark:bg-none dark:!bg-[#0b1f45] p-7 shadow-[0_16px_48px_rgba(88,60,120,0.14),0_6px_20px_rgba(79,118,141,0.12),inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[0_22px_62px_rgba(0,0,0,0.72),0_10px_28px_rgba(18,40,83,0.45)]';
  const innerCardClass =
    'rounded-2xl border border-slate-300/70 dark:border-[#2e4c82] bg-gradient-to-br from-[#efe0e9]/94 via-[#e8ddef]/92 to-[#dfe6f3]/90 dark:bg-none dark:!bg-[#102a58] p-4';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700 relative dark:text-slate-100">
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-luna-purple/24 blur-[130px] dark:hidden" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-luna-coral/18 blur-[130px] dark:hidden" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-luna-teal/18 blur-[130px] dark:hidden" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full hidden dark:block bg-indigo-500/18 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 rounded-full hidden dark:block bg-cyan-400/12 blur-[145px]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 rounded-full hidden dark:block bg-fuchsia-500/14 blur-[140px]" />
      <button onClick={onBack} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-all">← {copy.back}</button>

      <section className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800/90 bg-gradient-to-br from-[#efe0e9]/96 via-[#e2d8e8]/94 to-[#d1c9d9]/92 dark:from-[#050a14]/98 dark:via-[#070d19]/97 dark:to-[#060b16]/96 p-8 md:p-10 shadow-[0_22px_70px_rgba(88,60,120,0.2),0_8px_26px_rgba(79,118,141,0.18)] dark:shadow-[0_30px_84px_rgba(0,0,0,0.76),0_12px_32px_rgba(26,46,84,0.3)] relative overflow-hidden">
        <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full bg-luna-purple/30 dark:bg-indigo-500/24 blur-[120px]" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-luna-coral/22 dark:bg-cyan-400/16 blur-[120px]" />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_18%_24%,rgba(129,140,248,0.2),transparent_38%),radial-gradient(circle_at_82%_76%,rgba(34,211,238,0.12),transparent_40%)]" />
        <header className="relative z-10 text-center space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-luna-purple">{copy.title}</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.demand}</h2>
          <p className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
        </header>
      </section>

      <article className={`${panelClass} dark:from-[#040811]/98 dark:via-[#050b16]/97 dark:to-[#040913]/96 space-y-4`}>
        <h3 className="text-xl font-black tracking-tight">{copy.quickStartTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {copy.quickStart.map((line) => (
            <div key={line} className={`${innerCardClass} px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100`}>
              {line}
            </div>
          ))}
        </div>
      </article>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <article className={`xl:col-span-5 ${panelClass} space-y-5`}>
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight">{copy.breathTitle}</h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-200">{copy.breathProtocol}</p>
          </div>
          <div className="flex flex-col items-center py-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full bg-luna-purple/15 transition-transform duration-700 ${phaseScale}`} />
              <div className={`absolute inset-6 rounded-full border-2 border-luna-purple/35 transition-transform duration-700 ${phaseScale}`} />
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-luna-purple">{currentPhase.label}</p>
                <p className="text-6xl font-black text-slate-900 dark:text-slate-100 leading-none mt-2">{phaseRemaining}</p>
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-200 mt-3">{copy.cycles}: {cycles}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setIsRunning(true)} className="px-4 py-2.5 rounded-xl bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all">{copy.start}</button>
            <button onClick={() => setIsRunning(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-100 hover:text-luna-purple transition-colors">{copy.pause}</button>
            <button onClick={resetBreathing} className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-100 hover:text-luna-purple transition-colors">{copy.reset}</button>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{copy.breathingHint}</p>
        </article>

        <article className={`xl:col-span-7 ${panelClass} dark:from-[#040811]/98 dark:via-[#050b16]/97 dark:to-[#040913]/96 space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-tight">{copy.groundingTitle}</h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-100">{copy.groundingSubtitle}</p>
            </div>
            <span className="px-3 py-2 rounded-full bg-luna-purple/10 border border-luna-purple/30 text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">
              {groundingProgress.done}/{groundingProgress.total} • {groundingProgress.percent}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/70 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal transition-all duration-500" style={{ width: `${groundingProgress.percent}%` }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'see' as const, label: `5 ${senses.see}`, count: 5 },
              { key: 'feel' as const, label: `4 ${senses.feel}`, count: 4 },
              { key: 'hear' as const, label: `3 ${senses.hear}`, count: 3 },
              { key: 'smell' as const, label: `2 ${senses.smell}`, count: 2 },
              { key: 'taste' as const, label: `1 ${senses.taste}`, count: 1 },
            ].map((sense) => (
              <div key={sense.key} className={`${innerCardClass} space-y-2`}>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-100">{sense.label}</p>
                {Array.from({ length: sense.count }).map((_, idx) => (
                  <input
                    key={`${sense.key}-${idx}`}
                    value={grounding[sense.key][idx] || ''}
                    onChange={(e) => updateGrounding(sense.key, idx, e.target.value)}
                    placeholder={`...`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-950/90 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 ring-luna-purple/35"
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{copy.groundingHint}</p>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className={`${panelClass} dark:from-[#040811]/98 dark:via-[#050b16]/97 dark:to-[#040913]/96 space-y-4`}>
          <h3 className="text-xl font-black tracking-tight">{copy.toolsTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="tel:911" className="px-4 py-3 rounded-xl bg-rose-600 text-white text-center text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-colors">{copy.call911}</a>
            <a href="tel:988" className="px-4 py-3 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300/60 dark:border-rose-700/70 text-rose-700 dark:text-rose-200 text-center text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-200/80 dark:hover:bg-rose-900/70 transition-colors">{copy.call988}</a>
            <button onClick={copyMessage} className="sm:col-span-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-100 hover:text-luna-purple transition-colors">
              {copy.copyMessage}
            </button>
          </div>
          {copyFeedback && <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">{copyFeedback}</p>}
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{copy.toolsHint}</p>
        </article>

        <article className={`${panelClass} space-y-4`}>
          <h3 className="text-xl font-black tracking-tight">{copy.checklistTitle}</h3>
          <div className="space-y-2">
            {copy.checklist.map((item, idx) => (
              <label key={item} className={`flex items-center gap-3 ${innerCardClass} p-3 cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={Boolean(steps[idx])}
                  onChange={() => setSteps((prev) => prev.map((v, i) => (i === idx ? !v : v)))}
                  className="accent-luna-purple"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">{item}</span>
              </label>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-100">{copy.noteTitle}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={copy.notePlaceholder}
              className="w-full min-h-28 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-950/90 p-4 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 ring-luna-purple/35"
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-200">{copy.checklistHint}</p>
        </article>
      </div>

      <article className={`${panelClass} dark:from-[#040811]/98 dark:via-[#050b16]/97 dark:to-[#040913]/96 space-y-4`}>
        <h3 className="text-xl font-black tracking-tight">{copy.commentsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {copy.comments.map((item) => (
            <div key={`${item.author}-${item.quote.slice(0, 12)}`} className={`${innerCardClass} space-y-2`}>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-100 italic leading-relaxed">“{item.quote}”</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{item.author}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
};
