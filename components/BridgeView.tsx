
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBridgeLetter } from '../services/geminiService';
import { BridgeReflectionInput, BridgeLetterOutput } from '../types';
import { incrementBridgeUsage, parseBridgeUsage } from '../utils/runtimeGuards';
import { normalizeBridgeReflectionInput } from '../utils/bridge';
import { shareTextSafely } from '../utils/share';
import { Language } from '../constants';
import { JourneyProgress } from './JourneyProgress';
import { useSubscriptionAccess } from '../hooks/useSubscriptionAccess';
import { canUseBridgeReflection } from '../utils/subscriptionAccess';

type BridgeStep = 'entry' | 'reflection' | 'result';

export const BridgeView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const { premiumActive } = useSubscriptionAccess();
  const copyByLang: Record<Language, {
    q1: string; q2: string; q3: string; weeklyLimit: string; generateError: string; shareTitle: string;
    shared: string; copied: string; shareError: string; entryQuote: string; continue: string; question: string; of3: string;
    placeholder: string; next: string; form: string; forming: string; back: string; resultQuote: string; keep: string; share: string;
  }> = {
    en: { q1: 'What is quiet but present in me today?', q2: 'What does this state not mean?', q3: 'What would feel like kindness tonight?', weeklyLimit: 'The Bridge is a rare space. You have reached your weekly limit of 2 reflections.', generateError: 'Could not form reflection right now. Please retry.', shareTitle: 'A Reflection from Luna', shared: 'Shared.', copied: 'Copied to clipboard.', shareError: 'Could not share. Try copy manually.', entryQuote: 'Before you explain yourself — feel what is true.', continue: 'Continue', question: 'Question', of3: 'of 3', placeholder: 'Type your answer...', next: 'Next', form: 'Form Reflection', forming: 'Forming Reflection...', back: 'Back', resultQuote: 'Do you want this to be shared — or simply understood?', keep: 'Keep it here', share: 'Share' },
    ru: { q1: 'Что сегодня тихо, но присутствует во мне?', q2: 'Чего это состояние НЕ означает?', q3: 'Что было бы заботой сегодня вечером?', weeklyLimit: 'Мост — редкое пространство. Вы достигли недельного лимита: 2 рефлексии.', generateError: 'Сейчас не удалось сформировать рефлексию. Попробуйте снова.', shareTitle: 'Рефлексия от Luna', shared: 'Отправлено.', copied: 'Скопировано в буфер.', shareError: 'Не удалось поделиться. Попробуйте скопировать вручную.', entryQuote: 'Прежде чем объяснять себя — почувствуйте, что правда.', continue: 'Продолжить', question: 'Вопрос', of3: 'из 3', placeholder: 'Введите ваш ответ...', next: 'Далее', form: 'Сформировать рефлексию', forming: 'Формируется рефлексия...', back: 'Назад', resultQuote: 'Вы хотите этим поделиться — или просто быть понятой?', keep: 'Оставить здесь', share: 'Поделиться' },
    uk: { q1: 'Що сьогодні тихо, але присутнє в мені?', q2: 'Чого цей стан НЕ означає?', q3: 'Що було б турботою сьогодні ввечері?', weeklyLimit: 'Міст — рідкісний простір. Ви досягли тижневого ліміту: 2 рефлексії.', generateError: 'Зараз не вдалося сформувати рефлексію. Спробуйте ще раз.', shareTitle: 'Рефлексія від Luna', shared: 'Надіслано.', copied: 'Скопійовано в буфер.', shareError: 'Не вдалося поділитися. Спробуйте скопіювати вручну.', entryQuote: 'Перш ніж пояснювати себе — відчуйте, що є правдою.', continue: 'Продовжити', question: 'Питання', of3: 'з 3', placeholder: 'Введіть вашу відповідь...', next: 'Далі', form: 'Сформувати рефлексію', forming: 'Формується рефлексія...', back: 'Назад', resultQuote: 'Ви хочете цим поділитися — чи просто бути зрозумілою?', keep: 'Залишити тут', share: 'Поділитися' },
    es: { q1: '¿Qué está en mí hoy, en silencio pero presente?', q2: '¿Qué NO significa este estado?', q3: '¿Qué se sentiría como amabilidad esta noche?', weeklyLimit: 'Bridge es un espacio raro. Alcanzaste tu límite semanal de 2 reflexiones.', generateError: 'No se pudo formar la reflexión ahora. Inténtalo de nuevo.', shareTitle: 'Una reflexión de Luna', shared: 'Compartido.', copied: 'Copiado al portapapeles.', shareError: 'No se pudo compartir. Intenta copiar manualmente.', entryQuote: 'Antes de explicarte, siente lo que es verdad.', continue: 'Continuar', question: 'Pregunta', of3: 'de 3', placeholder: 'Escribe tu respuesta...', next: 'Siguiente', form: 'Formar reflexión', forming: 'Formando reflexión...', back: 'Atrás', resultQuote: '¿Quieres compartir esto, o solo que sea comprendido?', keep: 'Guardar aquí', share: 'Compartir' },
    fr: { q1: "Qu'est-ce qui est discret mais présent en moi aujourd'hui ?", q2: "Que ne signifie PAS cet état ?", q3: 'Qu’est-ce qui serait de la douceur ce soir ?', weeklyLimit: 'Le Bridge est un espace rare. Vous avez atteint la limite hebdomadaire de 2 réflexions.', generateError: 'Impossible de former la réflexion pour le moment. Réessayez.', shareTitle: 'Une réflexion de Luna', shared: 'Partagé.', copied: 'Copié dans le presse-papiers.', shareError: 'Partage impossible. Essayez de copier manuellement.', entryQuote: 'Avant de vous expliquer, ressentez ce qui est vrai.', continue: 'Continuer', question: 'Question', of3: 'sur 3', placeholder: 'Écrivez votre réponse...', next: 'Suivant', form: 'Former la réflexion', forming: 'Formation de la réflexion...', back: 'Retour', resultQuote: 'Voulez-vous le partager, ou simplement être comprise ?', keep: 'Le garder ici', share: 'Partager' },
    de: { q1: 'Was ist heute still, aber in mir präsent?', q2: 'Was bedeutet dieser Zustand NICHT?', q3: 'Was würde sich heute Abend wie Freundlichkeit anfühlen?', weeklyLimit: 'Die Brücke ist ein seltener Raum. Du hast dein Wochenlimit von 2 Reflexionen erreicht.', generateError: 'Reflexion konnte gerade nicht erstellt werden. Bitte erneut versuchen.', shareTitle: 'Eine Reflexion von Luna', shared: 'Geteilt.', copied: 'In Zwischenablage kopiert.', shareError: 'Teilen nicht möglich. Bitte manuell kopieren.', entryQuote: 'Bevor du dich erklärst, spüre, was wahr ist.', continue: 'Weiter', question: 'Frage', of3: 'von 3', placeholder: 'Antwort eingeben...', next: 'Weiter', form: 'Reflexion erstellen', forming: 'Reflexion wird erstellt...', back: 'Zurück', resultQuote: 'Möchtest du das teilen oder einfach verstanden werden?', keep: 'Hier behalten', share: 'Teilen' },
    zh: { q1: '今天在我心中安静但存在的是什么？', q2: '这种状态“不意味着”什么？', q3: '今晚什么会让我感到被善待？', weeklyLimit: 'Bridge 是稀缺空间。你已达到每周 2 次反思上限。', generateError: '暂时无法生成反思，请重试。', shareTitle: '来自 Luna 的反思', shared: '已分享。', copied: '已复制到剪贴板。', shareError: '无法分享，请尝试手动复制。', entryQuote: '在解释自己之前，先感受真实。', continue: '继续', question: '问题', of3: '/3', placeholder: '输入你的回答...', next: '下一步', form: '生成反思', forming: '正在生成反思...', back: '返回', resultQuote: '你想分享它，还是只是被理解？', keep: '仅保留在这里', share: '分享' },
    ja: { q1: '今日、静かに存在しているものは何ですか？', q2: 'この状態が「意味しない」ことは何ですか？', q3: '今夜、優しさと感じられることは何ですか？', weeklyLimit: 'Bridgeは希少な空間です。週間上限（2回）に達しました。', generateError: '現在リフレクションを作成できません。再試行してください。', shareTitle: 'Lunaからのリフレクション', shared: '共有しました。', copied: 'クリップボードにコピーしました。', shareError: '共有できませんでした。手動コピーをお試しください。', entryQuote: '説明する前に、本当の感覚に触れてください。', continue: '続ける', question: '質問', of3: '/3', placeholder: '回答を入力...', next: '次へ', form: 'リフレクションを作成', forming: 'リフレクション作成中...', back: '戻る', resultQuote: '共有したいですか、それとも理解されるだけで十分ですか？', keep: 'ここに保存', share: '共有' },
    pt: { q1: 'O que está quieto, mas presente em mim hoje?', q2: 'O que este estado NÃO significa?', q3: 'O que seria gentileza esta noite?', weeklyLimit: 'Bridge é um espaço raro. Você atingiu o limite semanal de 2 reflexões.', generateError: 'Não foi possível formar a reflexão agora. Tente novamente.', shareTitle: 'Uma reflexão da Luna', shared: 'Compartilhado.', copied: 'Copiado para a área de transferência.', shareError: 'Não foi possível compartilhar. Tente copiar manualmente.', entryQuote: 'Antes de se explicar, sinta o que é verdade.', continue: 'Continuar', question: 'Pergunta', of3: 'de 3', placeholder: 'Digite sua resposta...', next: 'Próxima', form: 'Formar reflexão', forming: 'Formando reflexão...', back: 'Voltar', resultQuote: 'Você quer compartilhar isso ou apenas ser compreendida?', keep: 'Manter aqui', share: 'Compartilhar' }
  };
  const copy = copyByLang[lang];
  const infoByLang: Record<Language, {
    eyebrow: string;
    title: string;
    problemTitle: string;
    problemBody: string;
    helpsTitle: string;
    helps: [string, string, string];
    unique: string;
    howTitle: string;
    how: [string, string, string];
    commentsTitle: string;
    comments: Array<{ quote: string; author: string }>;
  }> = {
    en: {
      eyebrow: 'THE BRIDGE',
      title: 'Explain State Without Escalation',
      problemTitle: 'Problem',
      problemBody: 'Sometimes it is hard to explain your state to your partner or even to yourself.',
      helpsTitle: 'Bridge helps',
      helps: ['formulate your state', 'explain it calmly', 'preserve respect in conversation'],
      unique: 'This is one of Luna’s unique functions.',
      howTitle: 'How It Works',
      how: ['You answer 3 short prompts.', 'Luna forms a calm reflection letter.', 'You keep it private or share it safely.'],
      commentsTitle: 'Member Comments',
      comments: [
        { quote: 'Bridge gave me words before conflict started.', author: 'Mila • Member' },
        { quote: 'I stopped overexplaining. One clear note was enough.', author: 'Aria • Member' },
      ],
    },
    ru: {
      eyebrow: 'THE BRIDGE',
      title: 'Объяснить состояние без эскалации',
      problemTitle: 'Проблема',
      problemBody: 'Иногда трудно объяснить партнёру или себе своё состояние.',
      helpsTitle: 'Bridge помогает',
      helps: ['сформулировать состояние', 'объяснить его спокойно', 'сохранить уважение в разговоре'],
      unique: 'Это одна из уникальных функций Luna.',
      howTitle: 'Как это работает',
      how: ['Вы отвечаете на 3 коротких вопроса.', 'Luna формирует спокойное письмо-рефлексию.', 'Вы оставляете его приватно или делитесь безопасно.'],
      commentsTitle: 'Комментарии участниц',
      comments: [
        { quote: 'Bridge дал слова до того, как начался конфликт.', author: 'Mila • Участница' },
        { quote: 'Я перестала переобъяснять. Одного ясного текста хватило.', author: 'Aria • Участница' },
      ],
    },
    uk: {
      eyebrow: 'THE BRIDGE',
      title: 'Пояснити стан без ескалації',
      problemTitle: 'Проблема',
      problemBody: 'Іноді важко пояснити партнеру або собі свій стан.',
      helpsTitle: 'Bridge допомагає',
      helps: ['сформулювати стан', 'пояснити його спокійно', 'зберегти повагу в розмові'],
      unique: 'Це одна з унікальних функцій Luna.',
      howTitle: 'Як це працює',
      how: ['Ви відповідаєте на 3 короткі запитання.', 'Luna формує спокійний рефлексивний лист.', 'Ви залишаєте його приватно або ділитеся безпечно.'],
      commentsTitle: 'Коментарі учасниць',
      comments: [
        { quote: 'Bridge дав мені слова до початку конфлікту.', author: 'Mila • Учасниця' },
        { quote: 'Я перестала довго пояснювати. Одного чіткого тексту вистачило.', author: 'Aria • Учасниця' },
      ],
    },
    es: {
      eyebrow: 'THE BRIDGE',
      title: 'Explicar el estado sin escalar',
      problemTitle: 'Problema',
      problemBody: 'A veces es difícil explicar tu estado a tu pareja o incluso a ti misma.',
      helpsTitle: 'Bridge ayuda a',
      helps: ['formular tu estado', 'explicarlo con calma', 'preservar el respeto en la conversación'],
      unique: 'Esta es una de las funciones únicas de Luna.',
      howTitle: 'Cómo funciona',
      how: ['Respondes 3 preguntas cortas.', 'Luna crea una reflexión calmada.', 'La guardas en privado o la compartes.'],
      commentsTitle: 'Comentarios de miembros',
      comments: [
        { quote: 'Bridge me dio palabras antes del conflicto.', author: 'Mila • Miembro' },
        { quote: 'Dejé de sobreexplicar. Un mensaje claro fue suficiente.', author: 'Aria • Miembro' },
      ],
    },
    fr: {
      eyebrow: 'THE BRIDGE',
      title: 'Expliquer son état sans escalade',
      problemTitle: 'Problème',
      problemBody: "Parfois, il est difficile d'expliquer son état à son partenaire ou à soi-même.",
      helpsTitle: 'Bridge aide à',
      helps: ['formuler son état', 'l’expliquer calmement', 'préserver le respect dans la conversation'],
      unique: 'C’est une des fonctions uniques de Luna.',
      howTitle: 'Comment ça marche',
      how: ['Vous répondez à 3 questions courtes.', 'Luna forme une réflexion calme.', 'Vous la gardez privée ou la partagez.'],
      commentsTitle: 'Commentaires des membres',
      comments: [
        { quote: 'Bridge m’a donné des mots avant le conflit.', author: 'Mila • Membre' },
        { quote: 'J’ai arrêté de trop expliquer. Un message clair suffisait.', author: 'Aria • Membre' },
      ],
    },
    de: {
      eyebrow: 'THE BRIDGE',
      title: 'Zustand erklären ohne Eskalation',
      problemTitle: 'Problem',
      problemBody: 'Manchmal ist es schwer, den eigenen Zustand der Partnerperson oder sich selbst zu erklären.',
      helpsTitle: 'Bridge hilft dabei',
      helps: ['den Zustand zu formulieren', 'ihn ruhig zu erklären', 'Respekt im Gespräch zu bewahren'],
      unique: 'Das ist eine der einzigartigen Funktionen von Luna.',
      howTitle: 'So funktioniert es',
      how: ['Du beantwortest 3 kurze Fragen.', 'Luna erstellt eine ruhige Reflexion.', 'Du behältst sie privat oder teilst sie.'],
      commentsTitle: 'Mitglieds-Kommentare',
      comments: [
        { quote: 'Bridge gab mir Worte vor dem Konflikt.', author: 'Mila • Mitglied' },
        { quote: 'Ich musste mich nicht mehr rechtfertigen. Eine klare Nachricht reichte.', author: 'Aria • Mitglied' },
      ],
    },
    zh: {
      eyebrow: 'THE BRIDGE',
      title: '在不升级冲突的前提下表达状态',
      problemTitle: '问题',
      problemBody: '有时很难向伴侣，甚至向自己解释当前状态。',
      helpsTitle: 'Bridge 帮助你',
      helps: ['组织状态表达', '平静说明感受', '在对话中保留尊重'],
      unique: '这是 Luna 的独特功能之一。',
      howTitle: '使用方式',
      how: ['回答 3 个简短问题。', 'Luna 生成平静反思文本。', '你可以私存或分享。'],
      commentsTitle: '成员评论',
      comments: [
        { quote: 'Bridge 在冲突前给了我表达方式。', author: 'Mila • 成员' },
        { quote: '我不再反复解释，一条清晰信息就够了。', author: 'Aria • 成员' },
      ],
    },
    ja: {
      eyebrow: 'THE BRIDGE',
      title: '状態を穏やかに伝える',
      problemTitle: '課題',
      problemBody: '自分の状態をパートナーや自分自身に説明するのが難しい時があります。',
      helpsTitle: 'Bridge が助けること',
      helps: ['状態を言語化する', '落ち着いて説明する', '会話の尊重を保つ'],
      unique: 'これは Luna のユニーク機能の一つです。',
      howTitle: '使い方',
      how: ['3つの短い質問に答える。', 'Luna が落ち着いた反省文を作成。', '非公開で保存または共有。'],
      commentsTitle: 'メンバーコメント',
      comments: [
        { quote: 'Bridge は衝突前に言葉をくれました。', author: 'Mila • メンバー' },
        { quote: '説明しすぎなくなった。短く明確で十分だった。', author: 'Aria • メンバー' },
      ],
    },
    pt: {
      eyebrow: 'THE BRIDGE',
      title: 'Explicar o estado sem escalar',
      problemTitle: 'Problema',
      problemBody: 'Às vezes é difícil explicar seu estado ao parceiro ou até para si mesma.',
      helpsTitle: 'Bridge ajuda a',
      helps: ['formular seu estado', 'explicar com calma', 'preservar respeito na conversa'],
      unique: 'Esta é uma das funções únicas da Luna.',
      howTitle: 'Como funciona',
      how: ['Você responde 3 perguntas curtas.', 'Luna forma uma reflexão calma.', 'Você mantém privada ou compartilha.'],
      commentsTitle: 'Comentários de membros',
      comments: [
        { quote: 'Bridge me deu palavras antes do conflito.', author: 'Mila • Membro' },
        { quote: 'Parei de me explicar demais. Uma mensagem clara bastou.', author: 'Aria • Membro' },
      ],
    },
  };
  const info = infoByLang[lang] || infoByLang.en;
  const [step, setStep] = useState<BridgeStep>('entry');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [letter, setLetter] = useState<BridgeLetterOutput | null>(null);
  const [typedLetter, setTypedLetter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  const questions = [copy.q1, copy.q2, copy.q3];

  useEffect(() => {
    if (!letter?.bridge_letter.content) {
      setTypedLetter('');
      return;
    }
    let index = 0;
    setTypedLetter('');
    const timer = window.setInterval(() => {
      index += 1;
      setTypedLetter(letter.bridge_letter.content.slice(0, index));
      if (index >= letter.bridge_letter.content.length) {
        clearInterval(timer);
      }
    }, 10);
    return () => clearInterval(timer);
  }, [letter]);

  useEffect(() => {
    const now = new Date();
    const usage = parseBridgeUsage(localStorage.getItem('luna_bridge_usage'), now);
    setUsageCount(usage.count);
    localStorage.setItem('luna_bridge_usage', JSON.stringify(usage));
  }, []);

  const handleContinue = () => {
    setError(null);
    if (!canUseBridgeReflection(usageCount, premiumActive)) {
      setError(copy.weeklyLimit);
      return;
    }
    setStep('reflection');
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionIndex < 2) {
      setQuestionIndex(prev => prev + 1);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    setStep('result');
    
    const input: BridgeReflectionInput = normalizeBridgeReflectionInput({
      language: lang,
      reflection: {
        quiet_presence: answers[0],
        not_meaning: answers[1],
        kindness_needed: answers[2]
      }
    });

    try {
      const result = await generateBridgeLetter(input);
      
      if ('error' in result) {
        setError(result.error.message);
      } else {
        setLetter(result);
        const next = incrementBridgeUsage(localStorage.getItem('luna_bridge_usage'), new Date());
        setUsageCount(next.count);
        localStorage.setItem('luna_bridge_usage', JSON.stringify(next));
      }
    } catch (_e) {
      setError(copy.generateError);
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!letter) return;
    setShareFeedback(null);

    const result = await shareTextSafely(letter.bridge_letter.content, copy.shareTitle);
    if (result === 'shared') setShareFeedback(copy.shared);
    else if (result === 'copied') setShareFeedback(copy.copied);
    else setShareFeedback(copy.shareError);
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[70vh] luna-page-shell luna-page-bridge flex flex-col p-6 md:p-8 text-center space-y-10">
      <JourneyProgress lang={lang} currentStep={3} />
      <section className="rounded-[2.6rem] border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-br from-[#f6ebf4]/90 via-[#eee8f3]/86 to-[#e5edf9]/82 dark:from-[#07122a]/94 dark:via-[#0b1a35]/92 dark:to-[#112446]/90 p-7 md:p-9 shadow-[0_18px_46px_rgba(88,70,126,0.18)] dark:shadow-[0_22px_54px_rgba(0,0,0,0.5)] space-y-6">
        <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{info.eyebrow}</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{info.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <article className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/85 bg-white/75 dark:bg-slate-900/55 p-5 md:p-6 space-y-3">
            <p className="text-base md:text-lg font-black uppercase tracking-[0.18em] text-luna-purple">{info.problemTitle}</p>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{info.problemBody}</p>
          </article>
          <article className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/85 bg-white/75 dark:bg-slate-900/55 p-5 md:p-6 space-y-3">
            <p className="text-base md:text-lg font-black uppercase tracking-[0.18em] text-luna-purple">{info.helpsTitle}</p>
            <ul className="space-y-1">
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {info.helps[0]}</li>
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {info.helps[1]}</li>
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {info.helps[2]}</li>
            </ul>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">{info.unique}</p>
          </article>
        </div>
        <article className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/85 bg-gradient-to-br from-[#f3e8f2]/86 via-[#eae5f2]/82 to-[#e2eaf8]/78 dark:from-[#081329]/92 dark:via-[#0c1a34]/90 dark:to-[#122344]/88 p-5 md:p-6 text-left space-y-3">
          <p className="text-base md:text-lg font-black uppercase tracking-[0.18em] text-luna-purple">{info.howTitle}</p>
          <ul className="space-y-1">
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">1. {info.how[0]}</li>
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">2. {info.how[1]}</li>
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">3. {info.how[2]}</li>
          </ul>
        </article>
        <article className="rounded-[2rem] border border-slate-200/70 dark:border-slate-800/85 bg-white/72 dark:bg-slate-900/52 p-5 md:p-6 text-left space-y-3">
          <p className="text-base md:text-lg font-black uppercase tracking-[0.18em] text-luna-purple">{info.commentsTitle}</p>
          {info.comments.map((item) => (
            <div key={item.author} className="rounded-2xl border border-slate-200/70 dark:border-slate-800/85 bg-slate-50/70 dark:bg-slate-950/35 p-4">
              <p className="text-sm md:text-base font-semibold italic text-slate-700 dark:text-slate-200">“{item.quote}”</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.author}</p>
            </div>
          ))}
        </article>
      </section>
      <AnimatePresence mode="wait">
        {step === 'entry' && (
          <motion.div 
            key="entry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <h2 className="text-3xl md:text-5xl font-medium italic text-slate-800 dark:text-slate-200 leading-tight max-w-2xl">
              "{copy.entryQuote}"
            </h2>
            <button 
              onClick={handleContinue}
              className="px-12 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              {copy.continue}
            </button>
            {error && <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
          </motion.div>
        )}

        {step === 'reflection' && (
          <motion.div 
            key="reflection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl space-y-12"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{copy.question} {questionIndex + 1} {copy.of3}</span>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {questions[questionIndex]}
              </h3>
            </div>

            <form onSubmit={handleAnswerSubmit} className="space-y-8">
              <input 
                autoFocus
                type="text"
                value={answers[questionIndex]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[questionIndex] = e.target.value;
                  setAnswers(newAnswers);
                }}
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-luna-purple py-4 text-2xl outline-none transition-all text-center italic"
                placeholder={copy.placeholder}
              />
              <button 
                type="submit"
                disabled={!answers[questionIndex].trim()}
                className="px-10 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all"
              >
                {questionIndex < 2 ? copy.next : copy.form}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl space-y-12"
          >
            {isGenerating ? (
              <div className="space-y-8 animate-pulse">
                <div className="w-16 h-16 border-4 border-luna-purple border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{copy.forming}</p>
              </div>
            ) : error ? (
              <div className="space-y-8">
                <div className="text-5xl">⚠️</div>
                <p className="text-rose-500 font-bold">{error}</p>
                <button onClick={onBack} className="px-8 py-3 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest">{copy.back}</button>
              </div>
            ) : letter ? (
              <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="p-10 md:p-16 luna-vivid-surface rounded-[4rem] text-left">
                  <p className="text-xl md:text-2xl leading-relaxed italic text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                    {typedLetter || letter.bridge_letter.content}
                  </p>
                </div>

                <div className="space-y-8">
                  <p className="text-lg font-bold italic text-slate-500">
                    "{copy.resultQuote}"
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => onBack()}
                      className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                    >
                      {copy.keep}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="px-10 py-5 luna-vivid-chip text-slate-600 dark:text-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-luna-purple transition-all"
                    >
                      {copy.share}
                    </button>
                  </div>
                  {shareFeedback && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{shareFeedback}</p>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
