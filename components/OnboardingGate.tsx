import React, { useMemo, useState } from 'react';
import { dataService } from '../services/dataService';
import { Logo } from './Logo';
import { Language, getLang } from '../constants';

interface OnboardingGateProps {
  lang: Language;
  onComplete: () => void;
}

type Copy = {
  welcome: string;
  welcomeBody: string;
  optionalHint: string;
  broughtYou: string;
  reasons: [string, string, string, string];
  checkinTitle: string;
  checkinBody: string;
  energy: string;
  mood: string;
  reflectionTitle: string;
  reflectionQuestion: string;
  writePlaceholder: string;
  skipForNow: string;
  saveAndContinue: string;
};

/**
 * Post-registration onboarding — one optional page.
 * Members can answer any subset or skip straight to Today.
 */
export const OnboardingGate: React.FC<OnboardingGateProps> = ({ lang, onComplete }) => {
  const copyByLang: Partial<Record<Language, Copy>> = {
    en: {
      welcome: 'Welcome to Luna29',
      welcomeBody: 'A quiet place to understand how your body and emotions move together.',
      optionalHint: 'Everything below is optional. Answer what feels useful, or skip and go to Today.',
      broughtYou: 'What brought you here?',
      reasons: ['Understand my emotions', 'Track my cycle', 'Reflect on my days', 'Understand my body'],
      checkinTitle: 'How do you feel right now?',
      checkinBody: 'Two gentle dials — only if you want.',
      energy: 'Energy',
      mood: 'Mood',
      reflectionTitle: 'A few words (optional)',
      reflectionQuestion: 'How does today feel so far?',
      writePlaceholder: 'Write a few words…',
      skipForNow: 'Skip for now',
      saveAndContinue: 'Go to Today',
    },
    ru: {
      welcome: 'Добро пожаловать в Luna29',
      welcomeBody: 'Тихое пространство, чтобы понять, как тело и эмоции двигаются вместе.',
      optionalHint: 'Всё ниже по желанию. Ответьте на то, что полезно, или сразу перейдите в Today.',
      broughtYou: 'Что привело вас сюда?',
      reasons: ['Лучше понимать эмоции', 'Отслеживать цикл', 'Рефлексировать день', 'Понимать своё тело'],
      checkinTitle: 'Как вы себя чувствуете сейчас?',
      checkinBody: 'Два мягких ползунка — только если хотите.',
      energy: 'Энергия',
      mood: 'Настроение',
      reflectionTitle: 'Пара слов (необязательно)',
      reflectionQuestion: 'Как ощущается сегодняшний день?',
      writePlaceholder: 'Напишите пару слов…',
      skipForNow: 'Пропустить',
      saveAndContinue: 'Перейти в Today',
    },
    uk: {
      welcome: 'Ласкаво просимо до Luna29',
      welcomeBody: 'Тихий простір, щоб зрозуміти, як тіло та емоції рухаються разом.',
      optionalHint: 'Усе нижче за бажанням. Відповідайте на те, що корисно, або одразу перейдіть у Today.',
      broughtYou: 'Що привело вас сюди?',
      reasons: ['Краще розуміти емоції', 'Відстежувати цикл', 'Рефлексувати день', 'Розуміти своє тіло'],
      checkinTitle: 'Як ви себе відчуваєте зараз?',
      checkinBody: 'Два м’які повзунки — лише якщо хочете.',
      energy: 'Енергія',
      mood: 'Настрій',
      reflectionTitle: 'Кілька слів (необов’язково)',
      reflectionQuestion: 'Як відчувається цей день зараз?',
      writePlaceholder: 'Напишіть кілька слів…',
      skipForNow: 'Пропустити',
      saveAndContinue: 'Перейти в Today',
    },
    ar: {
      welcome: 'مرحباً بكِ في Luna29',
      welcomeBody: 'مكان هادئ لفهم كيف يتحرّك جسمكِ ومشاعركِ معاً.',
      optionalHint: 'كل ما يلي اختياري. أجيبي عمّا تريدين أو تخطّي إلى Today.',
      broughtYou: 'ما الذي جلبكِ إلى هنا؟',
      reasons: ['فهم مشاعري', 'تتبّع دورتي', 'التأمل في أيامي', 'فهم جسمي'],
      checkinTitle: 'كيف تشعرين الآن؟',
      checkinBody: 'مؤشران لطيفان — فقط إن رغبتِ.',
      energy: 'الطاقة',
      mood: 'المزاج',
      reflectionTitle: 'بضع كلمات (اختياري)',
      reflectionQuestion: 'كيف يبدو اليوم حتى الآن؟',
      writePlaceholder: 'اكتبي بضع كلمات…',
      skipForNow: 'تخطّي الآن',
      saveAndContinue: 'الذهاب إلى Today',
    },
    he: {
      welcome: 'ברוכה הבאה ל-Luna29',
      welcomeBody: 'מקום שקט להבין איך הגוף והרגשות שלך זזים יחד.',
      optionalHint: 'הכול למטה אופציונלי. עני על מה שמועיל, או דלגי ל-Today.',
      broughtYou: 'מה הביא אותך לכאן?',
      reasons: ['להבין את הרגשות שלי', 'לעקוב אחרי המחזור', 'לרפלקט על הימים שלי', 'להבין את הגוף שלי'],
      checkinTitle: 'איך את מרגישה עכשיו?',
      checkinBody: 'שני מחוונים עדינים — רק אם בא לך.',
      energy: 'אנרגיה',
      mood: 'מצב רוח',
      reflectionTitle: 'כמה מילים (אופציונלי)',
      reflectionQuestion: 'איך היום מרגיש עד עכשיו?',
      writePlaceholder: 'כתבי כמה מילים…',
      skipForNow: 'דלגי לעכשיו',
      saveAndContinue: 'ל-Today',
    },
    es: {
      welcome: 'Bienvenida a Luna29',
      welcomeBody: 'Un espacio tranquilo para entender cómo cuerpo y emociones se mueven juntos.',
      optionalHint: 'Todo abajo es opcional. Responde lo útil o ve directo a Today.',
      broughtYou: '¿Qué te trajo aquí?',
      reasons: ['Entender mis emociones', 'Seguir mi ciclo', 'Reflexionar mis días', 'Entender mi cuerpo'],
      checkinTitle: '¿Cómo te sientes ahora?',
      checkinBody: 'Dos diales suaves — solo si quieres.',
      energy: 'Energía',
      mood: 'Ánimo',
      reflectionTitle: 'Unas palabras (opcional)',
      reflectionQuestion: '¿Cómo se siente el día hasta ahora?',
      writePlaceholder: 'Escribe unas palabras…',
      skipForNow: 'Omitir por ahora',
      saveAndContinue: 'Ir a Today',
    },
    fr: {
      welcome: 'Bienvenue sur Luna29',
      welcomeBody: 'Un espace calme pour comprendre comment corps et émotions avancent ensemble.',
      optionalHint: 'Tout ci-dessous est optionnel. Répondez à ce qui est utile, ou allez à Today.',
      broughtYou: 'Qu’est-ce qui vous amène ici ?',
      reasons: ['Comprendre mes émotions', 'Suivre mon cycle', 'Réfléchir à mes jours', 'Comprendre mon corps'],
      checkinTitle: 'Comment vous sentez-vous maintenant ?',
      checkinBody: 'Deux curseurs doux — seulement si vous voulez.',
      energy: 'Énergie',
      mood: 'Humeur',
      reflectionTitle: 'Quelques mots (optionnel)',
      reflectionQuestion: 'Comment se sent la journée jusqu’ici ?',
      writePlaceholder: 'Écrivez quelques mots…',
      skipForNow: 'Passer pour l’instant',
      saveAndContinue: 'Aller à Today',
    },
    de: {
      welcome: 'Willkommen bei Luna29',
      welcomeBody: 'Ein ruhiger Ort, um zu verstehen, wie Körper und Emotionen zusammenwirken.',
      optionalHint: 'Alles unten ist optional. Antworte, was nützlich ist, oder gehe zu Today.',
      broughtYou: 'Was hat dich hierher gebracht?',
      reasons: ['Meine Emotionen verstehen', 'Meinen Zyklus tracken', 'Meine Tage reflektieren', 'Meinen Körper verstehen'],
      checkinTitle: 'Wie fühlst du dich gerade?',
      checkinBody: 'Zwei sanfte Regler — nur wenn du möchtest.',
      energy: 'Energie',
      mood: 'Stimmung',
      reflectionTitle: 'Ein paar Worte (optional)',
      reflectionQuestion: 'Wie fühlt sich der Tag bisher an?',
      writePlaceholder: 'Schreib ein paar Worte…',
      skipForNow: 'Vorerst überspringen',
      saveAndContinue: 'Zu Today',
    },
    zh: {
      welcome: '欢迎来到 Luna29',
      welcomeBody: '一个安静的空间，理解身体与情绪如何一起流动。',
      optionalHint: '以下全部可选。回答有用的，或直接进入 Today。',
      broughtYou: '是什么把你带到这里？',
      reasons: ['理解我的情绪', '追踪我的周期', '反思我的日子', '理解我的身体'],
      checkinTitle: '你现在感觉如何？',
      checkinBody: '两个温和的滑块——仅在你愿意时。',
      energy: '精力',
      mood: '情绪',
      reflectionTitle: '几句话（可选）',
      reflectionQuestion: '今天到目前感觉如何？',
      writePlaceholder: '写几句话…',
      skipForNow: '暂时跳过',
      saveAndContinue: '前往 Today',
    },
    ja: {
      welcome: 'Luna29 へようこそ',
      welcomeBody: '体と感情がどう一緒に動くかを理解する、静かな場所。',
      optionalHint: '以下はすべて任意です。役立つことに答えるか、Today へ進んでください。',
      broughtYou: '何があなたをここに連れてきましたか？',
      reasons: ['感情を理解したい', '周期を追跡したい', '日々を振り返りたい', '体を理解したい'],
      checkinTitle: '今の気分はどうですか？',
      checkinBody: 'やさしいダイヤルが2つ — 必要なときだけ。',
      energy: 'エネルギー',
      mood: '気分',
      reflectionTitle: '一言（任意）',
      reflectionQuestion: '今日はここまでどう感じますか？',
      writePlaceholder: '少し書いてください…',
      skipForNow: '今はスキップ',
      saveAndContinue: 'Today へ',
    },
    pt: {
      welcome: 'Bem-vinda à Luna29',
      welcomeBody: 'Um lugar calmo para entender como corpo e emoções se movem juntos.',
      optionalHint: 'Tudo abaixo é opcional. Responda o útil ou vá direto para Today.',
      broughtYou: 'O que te trouxe aqui?',
      reasons: ['Entender minhas emoções', 'Acompanhar meu ciclo', 'Refletir meus dias', 'Entender meu corpo'],
      checkinTitle: 'Como você se sente agora?',
      checkinBody: 'Dois dials suaves — só se quiser.',
      energy: 'Energia',
      mood: 'Humor',
      reflectionTitle: 'Algumas palavras (opcional)',
      reflectionQuestion: 'Como o dia está se sentindo até agora?',
      writePlaceholder: 'Escreva algumas palavras…',
      skipForNow: 'Pular por agora',
      saveAndContinue: 'Ir para Today',
    },
  };

  const defaultCopy = copyByLang.en!;
  const copy = getLang(copyByLang, lang) || defaultCopy;

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [writeText, setWriteText] = useState('');
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [touchedCheckin, setTouchedCheckin] = useState(false);

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((item) => item !== reason) : [...prev, reason],
    );
  };

  const finish = (opts: { saveAnswers: boolean }) => {
    if (opts.saveAnswers) {
      if (touchedCheckin) {
        dataService.logEvent('DAILY_CHECKIN', {
          metrics: { energy, mood, sleep: 3, libido: 3, irritability: 3, stress: 3 },
          symptoms: [],
          isPeriod: false,
          source: 'onboarding',
        });
      }
      if (writeText.trim()) {
        dataService.logEvent('AUDIO_REFLECTION', {
          source: 'onboarding',
          mode: 'write',
          text: writeText.trim(),
          question: copy.reflectionQuestion,
        });
      }
    }
    dataService.logEvent('ONBOARDING_COMPLETE', {
      skipped: !opts.saveAnswers,
      reasons: opts.saveAnswers ? selectedReasons : [],
      answeredCheckin: opts.saveAnswers && touchedCheckin,
      answeredReflection: opts.saveAnswers && Boolean(writeText.trim()),
    });
    onComplete();
  };

  const hasAnyAnswer = useMemo(
    () => selectedReasons.length > 0 || touchedCheckin || Boolean(writeText.trim()),
    [selectedReasons, touchedCheckin, writeText],
  );

  return (
    <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-[200]">
      <article
        data-testid="onboarding-optional-page"
        className="max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-10 bg-white/95 dark:bg-slate-900/95 shadow-luna-deep rounded-[2rem] md:rounded-[3rem] border border-slate-200/80 dark:border-slate-700/80 space-y-8"
      >
        <header className="flex items-start justify-between gap-4">
          <Logo size="md" />
          <button
            type="button"
            data-testid="onboarding-skip"
            onClick={() => finish({ saveAnswers: false })}
            className="shrink-0 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 hover:text-luna-purple transition-colors"
          >
            {copy.skipForNow}
          </button>
        </header>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950 dark:text-slate-100 leading-tight">
            {copy.welcome}
          </h1>
          <p className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-300 max-w-xl">
            {copy.welcomeBody}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{copy.optionalHint}</p>
        </div>

        <section className="space-y-3" aria-labelledby="onboarding-reasons">
          <h2 id="onboarding-reasons" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {copy.broughtYou}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {copy.reasons.map((reason) => {
              const active = selectedReasons.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`text-left rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-luna-purple bg-luna-purple/10 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="onboarding-checkin">
          <div>
            <h2 id="onboarding-checkin" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {copy.checkinTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{copy.checkinBody}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 space-y-3">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.energy}</span>
              <input
                type="range"
                min={1}
                max={5}
                value={energy}
                onChange={(e) => {
                  setTouchedCheckin(true);
                  setEnergy(Number(e.target.value));
                }}
                className="w-full accent-luna-purple"
              />
              <span className="text-xl font-black text-luna-purple tabular-nums">{energy}/5</span>
            </label>
            <label className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 space-y-3">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.mood}</span>
              <input
                type="range"
                min={1}
                max={5}
                value={mood}
                onChange={(e) => {
                  setTouchedCheckin(true);
                  setMood(Number(e.target.value));
                }}
                className="w-full accent-luna-purple"
              />
              <span className="text-xl font-black text-luna-purple tabular-nums">{mood}/5</span>
            </label>
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="onboarding-reflection">
          <div>
            <h2 id="onboarding-reflection" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {copy.reflectionTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.reflectionQuestion}</p>
          </div>
          <textarea
            value={writeText}
            onChange={(e) => setWriteText(e.target.value)}
            placeholder={copy.writePlaceholder}
            className="w-full min-h-[96px] resize-none rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-luna-purple/50"
          />
        </section>

        <footer className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            data-testid="onboarding-finish"
            onClick={() => finish({ saveAnswers: true })}
            className="px-8 py-3 rounded-full bg-luna-purple text-white font-black text-sm uppercase tracking-[0.14em]"
          >
            {copy.saveAndContinue}
          </button>
          <button
            type="button"
            data-testid="onboarding-begin"
            onClick={() => finish({ saveAnswers: hasAnyAnswer })}
            className="px-6 py-3 rounded-full border border-slate-300/80 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-[11px] font-black uppercase tracking-[0.14em] hover:border-luna-purple/50 hover:text-luna-purple transition-colors"
          >
            {copy.skipForNow}
          </button>
        </footer>
      </article>
    </div>
  );
};

export default OnboardingGate;
