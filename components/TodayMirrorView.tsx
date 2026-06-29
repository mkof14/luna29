import React, { useMemo } from 'react';
import { Mic, Share2 } from 'lucide-react';
import { Language, LangCopy, getLang } from '../constants';
import { CyclePhase, HealthEvent, SystemState } from '../types';
import { dataService } from '../services/dataService';
import { shareTextSafely } from '../utils/share';

interface TodayMirrorViewProps {
  lang: Language;
  currentPhase: CyclePhase;
  systemState: SystemState;
  events: HealthEvent[];
  onSpeak: () => void;
  onQuickCheckin: () => void;
  onOpenMyDay: () => void;
  onOpenMonthly: () => void;
}

export const TodayMirrorView: React.FC<TodayMirrorViewProps> = ({
  lang,
  currentPhase,
  systemState,
  events,
  onSpeak,
  onQuickCheckin,
  onOpenMyDay,
  onOpenMonthly,
}) => {
  const [writeOpen, setWriteOpen] = React.useState(false);
  const [writeText, setWriteText] = React.useState('');
  const [continuityStatus, setContinuityStatus] = React.useState('');
  const [partnerStatus, setPartnerStatus] = React.useState('');
  type TodayMirrorCopy = {
    evening: string;
    afternoon: string;
    morning: string;
    todayReflection: string;
    title: string;
    contextLower: string;
    contextSteady: string;
    slowerTonight: string;
    cycle: string;
    energy: string;
    sleep: string;
    lowerThanUsual: string;
    steady: string;
    storyTitle: string;
    fallback: string;
    speak: string;
    quickCheckin: string;
    lineIntro: (phase: string) => string;
    lineSleep: (sleepText: string, phase: string) => string;
    back: string;
    openMyDay: string;
    dayLabelToday: string;
    dayLabelYesterday: string;
    daysAgo: (days: number) => string;
    dayWord: string;
    phaseWord: string;
    sleepUnset: string;
    progressionTitle: string;
    stageDaily: string;
    stagePattern: string;
    stageMonthly: string;
    patternHintBase: string;
    monthlyA: string;
    monthlyB: string;
    continuityTitle: string;
    continuityQuestion: string;
    speakShort: string;
    writeShort: string;
    skipShort: string;
    writePlaceholder: string;
    saveWrite: string;
    skipped: string;
    saved: string;
    continuityFallback: string;
    continuityYesterday: (line: string) => string;
    continuityRecent: (line: string) => string;
  };
  const copyByLang: LangCopy<TodayMirrorCopy> = {
    en: {
      evening: 'Good evening',
      afternoon: 'Good afternoon',
      morning: 'Good morning',
      todayReflection: "Today's note",
      title: 'Today with Luna29',
      contextLower: 'Today may feel a little slower.',
      contextSteady: 'Today may feel more steady.',
      slowerTonight: 'It may help to keep tonight slower.',
      cycle: 'Cycle',
      energy: 'Energy',
      sleep: 'Sleep',
      lowerThanUsual: 'Lower than usual',
      steady: 'More steady',
      storyTitle: 'Your story with Luna29',
      fallback: 'Your story with Luna29 is just beginning.',
      speak: 'Speak to Luna29',
      quickCheckin: 'Quick check-in',
      lineIntro: (phase) => `Your body is in the ${phase} phase.`,
      lineSleep: (sleepText, phase) => `Sleep was ${sleepText} last night, and your body is in the ${phase} phase.`,
      back: 'Back',
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      progressionTitle: 'Insight progression',
      stageDaily: 'Daily explanation',
      stagePattern: 'Pattern hint',
      stageMonthly: 'Monthly rhythm summary',
      patternHintBase: 'Energy often feels lower when sleep is shorter.',
      monthlyA: 'Your energy tends to dip before your cycle.',
      monthlyB: 'Sleep often affects mood during the week.',
      continuityTitle: 'Continuity',
      continuityQuestion: 'How does today feel compared to yesterday?',
      speakShort: 'Speak',
      writeShort: 'Write',
      skipShort: 'Skip',
      writePlaceholder: 'Write a few words...',
      saveWrite: 'Save',
      skipped: 'Skipped for today.',
      saved: 'Saved.',
      continuityFallback: 'Yesterday you took a quiet moment with Luna29.',
      continuityYesterday: (line) => `Yesterday you said ${line}`,
      continuityRecent: (line) => `Recently you shared ${line}`,
    },
    ru: {
      evening: 'Добрый вечер',
      afternoon: 'Добрый день',
      morning: 'Доброе утро',
      todayReflection: 'Сегодняшняя заметка',
      title: 'Сегодня с Luna29',
      contextLower: 'Сегодня энергия кажется немного ниже.',
      contextSteady: 'Сегодня энергия ощущается более ровной.',
      slowerTonight: 'Сегодня вечером может помочь более спокойный ритм.',
      cycle: 'Цикл',
      energy: 'Энергия',
      sleep: 'Сон',
      lowerThanUsual: 'Ниже обычного',
      steady: 'Более ровно',
      storyTitle: 'Ваша история с Luna29',
      fallback: 'Ваша история с Luna29 только начинается.',
      speak: 'Поговорить с Luna29',
      quickCheckin: 'Быстрый check-in',
      lineIntro: (phase) => `Ваше тело сейчас в фазе ${phase}.`,
      lineSleep: (sleepText, phase) => `Сон был ${sleepText} прошлой ночью, и ваше тело сейчас в фазе ${phase}.`,
      back: 'Назад',
      openMyDay: 'Открыть My Day with Luna29',
      dayLabelToday: 'Сегодня',
      dayLabelYesterday: 'Вчера',
      daysAgo: (days) => `${days} дн. назад`,
      dayWord: 'День',
      phaseWord: 'фаза',
      sleepUnset: 'Нет данных',
      progressionTitle: 'Развитие инсайтов',
      stageDaily: 'Ежедневное объяснение',
      stagePattern: 'Подсказка паттерна',
      stageMonthly: 'Месячный ритм',
      patternHintBase: 'Энергия часто ниже, когда сон короче.',
      monthlyA: 'Перед циклом энергия обычно немного снижается.',
      monthlyB: 'Сон часто влияет на настроение в течение недели.',
      continuityTitle: 'Связь дней',
      continuityQuestion: 'Как сегодняшний день ощущается по сравнению со вчерашним?',
      speakShort: 'Сказать',
      writeShort: 'Написать',
      skipShort: 'Пропустить',
      writePlaceholder: 'Напишите пару слов...',
      saveWrite: 'Сохранить',
      skipped: 'Пропущено на сегодня.',
      saved: 'Сохранено.',
      continuityFallback: 'Вчера вы сделали тихую паузу с Luna29.',
      continuityYesterday: (line) => `Вчера вы говорили, что ${line}`,
      continuityRecent: (line) => `Недавно вы поделились, что ${line}`,
    },
    uk: {
      evening: 'Добрий вечір',
      afternoon: 'Добрий день',
      morning: 'Доброго ранку',
      todayReflection: 'Сьогоднішня нотатка',
      title: 'Сьогодні з Luna29',
      contextLower: 'Сьогодні енергія здається трохи нижчою.',
      contextSteady: 'Сьогодні енергія відчувається більш рівною.',
      slowerTonight: 'Сьогодні ввечері може допомогти більш спокійний ритм.',
      cycle: 'Цикл',
      energy: 'Енергія',
      sleep: 'Сон',
      lowerThanUsual: 'Нижче звичного',
      steady: 'Більш рівно',
      storyTitle: 'Ваша історія з Luna29',
      fallback: 'Ваша історія з Luna29 тільки починається.',
      speak: 'Поговорити з Luna29',
      quickCheckin: 'Швидкий check-in',
      lineIntro: (phase) => `Ваше тіло зараз у фазі ${phase}.`,
      lineSleep: (sleepText, phase) => `Сон був ${sleepText} минулої ночі, і ваше тіло зараз у фазі ${phase}.`,
      back: 'Назад',
      openMyDay: 'Відкрити My Day with Luna29',
      dayLabelToday: 'Сьогодні',
      dayLabelYesterday: 'Вчора',
      daysAgo: (days) => `${days} дн. тому`,
      dayWord: 'День',
      phaseWord: 'фаза',
      sleepUnset: 'Немає даних',
      progressionTitle: 'Розвиток інсайтів',
      stageDaily: 'Щоденне пояснення',
      stagePattern: 'Підказка патерна',
      stageMonthly: 'Місячний ритм',
      patternHintBase: 'Енергія часто нижча, коли сон коротший.',
      monthlyA: 'Перед циклом енергія зазвичай трохи знижується.',
      monthlyB: 'Сон часто впливає на настрій протягом тижня.',
      continuityTitle: 'Звʼязок днів',
      continuityQuestion: 'Як сьогоднішній день відчувається порівняно з учорашнім?',
      speakShort: 'Сказати',
      writeShort: 'Написати',
      skipShort: 'Пропустити',
      writePlaceholder: 'Напишіть кілька слів...',
      saveWrite: 'Зберегти',
      skipped: 'Пропущено на сьогодні.',
      saved: 'Збережено.',
      continuityFallback: 'Учора ви зробили тиху паузу з Luna29.',
      continuityYesterday: (line) => `Учора ви казали, що ${line}`,
      continuityRecent: (line) => `Нещодавно ви поділилися, що ${line}`,
    },
    es: {
      evening: 'Good evening',
      afternoon: 'Good afternoon',
      morning: 'Good morning',
      todayReflection: "Today's note",
      title: 'Today with Luna29',
      contextLower: 'Your energy seems a little lower today.',
      contextSteady: 'Your energy seems more steady today.',
      slowerTonight: 'It may help to keep tonight slower.',
      cycle: 'Cycle',
      energy: 'Energy',
      sleep: 'Sleep',
      lowerThanUsual: 'Lower than usual',
      steady: 'More steady',
      storyTitle: 'Your story with Luna29',
      fallback: 'Your story with Luna29 is just beginning.',
      speak: 'Speak to Luna29',
      quickCheckin: 'Quick check-in',
      lineIntro: (phase) => `Your body is in the ${phase} phase.`,
      lineSleep: (sleepText, phase) => `Sleep was ${sleepText} last night, and your body is in the ${phase} phase.`,
      back: 'Back',
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      progressionTitle: 'Insight progression',
      stageDaily: 'Daily explanation',
      stagePattern: 'Pattern hint',
      stageMonthly: 'Monthly rhythm summary',
      patternHintBase: 'Energy often feels lower when sleep is shorter.',
      monthlyA: 'Your energy tends to dip before your cycle.',
      monthlyB: 'Sleep often affects mood during the week.',
      continuityTitle: 'Continuity',
      continuityQuestion: 'How does today feel compared to yesterday?',
      speakShort: 'Speak',
      writeShort: 'Write',
      skipShort: 'Skip',
      writePlaceholder: 'Write a few words...',
      saveWrite: 'Save',
      skipped: 'Skipped for today.',
      saved: 'Saved.',
      continuityFallback: 'Yesterday you took a quiet moment with Luna29.',
      continuityYesterday: (line) => `Yesterday you said ${line}`,
      continuityRecent: (line) => `Recently you shared ${line}`,
    },
    fr: {
      evening: 'Good evening',
      afternoon: 'Good afternoon',
      morning: 'Good morning',
      todayReflection: "Today's note",
      title: 'Today with Luna29',
      contextLower: 'Your energy seems a little lower today.',
      contextSteady: 'Your energy seems more steady today.',
      slowerTonight: 'It may help to keep tonight slower.',
      cycle: 'Cycle',
      energy: 'Energy',
      sleep: 'Sleep',
      lowerThanUsual: 'Lower than usual',
      steady: 'More steady',
      storyTitle: 'Your story with Luna29',
      fallback: 'Your story with Luna29 is just beginning.',
      speak: 'Speak to Luna29',
      quickCheckin: 'Quick check-in',
      lineIntro: (phase) => `Your body is in the ${phase} phase.`,
      lineSleep: (sleepText, phase) => `Sleep was ${sleepText} last night, and your body is in the ${phase} phase.`,
      back: 'Back',
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      progressionTitle: 'Insight progression',
      stageDaily: 'Daily explanation',
      stagePattern: 'Pattern hint',
      stageMonthly: 'Monthly rhythm summary',
      patternHintBase: 'Energy often feels lower when sleep is shorter.',
      monthlyA: 'Your energy tends to dip before your cycle.',
      monthlyB: 'Sleep often affects mood during the week.',
      continuityTitle: 'Continuity',
      continuityQuestion: 'How does today feel compared to yesterday?',
      speakShort: 'Speak',
      writeShort: 'Write',
      skipShort: 'Skip',
      writePlaceholder: 'Write a few words...',
      saveWrite: 'Save',
      skipped: 'Skipped for today.',
      saved: 'Saved.',
      continuityFallback: 'Yesterday you took a quiet moment with Luna29.',
      continuityYesterday: (line) => `Yesterday you said ${line}`,
      continuityRecent: (line) => `Recently you shared ${line}`,
    },
    de: {
      evening: 'Good evening',
      afternoon: 'Good afternoon',
      morning: 'Good morning',
      todayReflection: "Today's note",
      title: 'Today with Luna29',
      contextLower: 'Your energy seems a little lower today.',
      contextSteady: 'Your energy seems more steady today.',
      slowerTonight: 'It may help to keep tonight slower.',
      cycle: 'Cycle',
      energy: 'Energy',
      sleep: 'Sleep',
      lowerThanUsual: 'Lower than usual',
      steady: 'More steady',
      storyTitle: 'Your story with Luna29',
      fallback: 'Your story with Luna29 is just beginning.',
      speak: 'Speak to Luna29',
      quickCheckin: 'Quick check-in',
      lineIntro: (phase) => `Your body is in the ${phase} phase.`,
      lineSleep: (sleepText, phase) => `Sleep was ${sleepText} last night, and your body is in the ${phase} phase.`,
      back: 'Back',
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      progressionTitle: 'Insight progression',
      stageDaily: 'Daily explanation',
      stagePattern: 'Pattern hint',
      stageMonthly: 'Monthly rhythm summary',
      patternHintBase: 'Energy often feels lower when sleep is shorter.',
      monthlyA: 'Your energy tends to dip before your cycle.',
      monthlyB: 'Sleep often affects mood during the week.',
      continuityTitle: 'Continuity',
      continuityQuestion: 'How does today feel compared to yesterday?',
      speakShort: 'Speak',
      writeShort: 'Write',
      skipShort: 'Skip',
      writePlaceholder: 'Write a few words...',
      saveWrite: 'Save',
      skipped: 'Skipped for today.',
      saved: 'Saved.',
      continuityFallback: 'Yesterday you took a quiet moment with Luna29.',
      continuityYesterday: (line) => `Yesterday you said ${line}`,
      continuityRecent: (line) => `Recently you shared ${line}`,
    },
    zh: {
      evening: 'Good evening',
      afternoon: 'Good afternoon',
      morning: 'Good morning',
      todayReflection: "Today's note",
      title: 'Today with Luna29',
      contextLower: 'Your energy seems a little lower today.',
      contextSteady: 'Your energy seems more steady today.',
      slowerTonight: 'It may help to keep tonight slower.',
      cycle: 'Cycle',
      energy: 'Energy',
      sleep: 'Sleep',
      lowerThanUsual: 'Lower than usual',
      steady: 'More steady',
      storyTitle: 'Your story with Luna29',
      fallback: 'Your story with Luna29 is just beginning.',
      speak: 'Speak to Luna29',
      quickCheckin: 'Quick check-in',
      lineIntro: (phase) => `Your body is in the ${phase} phase.`,
      lineSleep: (sleepText, phase) => `Sleep was ${sleepText} last night, and your body is in the ${phase} phase.`,
      back: 'Back',
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      progressionTitle: 'Insight progression',
      stageDaily: 'Daily explanation',
      stagePattern: 'Pattern hint',
      stageMonthly: 'Monthly rhythm summary',
      patternHintBase: 'Energy often feels lower when sleep is shorter.',
      monthlyA: 'Your energy tends to dip before your cycle.',
      monthlyB: 'Sleep often affects mood during the week.',
      continuityTitle: 'Continuity',
      continuityQuestion: 'How does today feel compared to yesterday?',
      speakShort: 'Speak',
      writeShort: 'Write',
      skipShort: 'Skip',
      writePlaceholder: 'Write a few words...',
      saveWrite: 'Save',
      skipped: 'Skipped for today.',
      saved: 'Saved.',
      continuityFallback: 'Yesterday you took a quiet moment with Luna29.',
      continuityYesterday: (line) => `Yesterday you said ${line}`,
      continuityRecent: (line) => `Recently you shared ${line}`,
    },
    ja: {
      evening: 'Good evening',
      afternoon: 'Good afternoon',
      morning: 'Good morning',
      todayReflection: "Today's note",
      title: 'Today with Luna29',
      contextLower: 'Your energy seems a little lower today.',
      contextSteady: 'Your energy seems more steady today.',
      slowerTonight: 'It may help to keep tonight slower.',
      cycle: 'Cycle',
      energy: 'Energy',
      sleep: 'Sleep',
      lowerThanUsual: 'Lower than usual',
      steady: 'More steady',
      storyTitle: 'Your story with Luna29',
      fallback: 'Your story with Luna29 is just beginning.',
      speak: 'Speak to Luna29',
      quickCheckin: 'Quick check-in',
      lineIntro: (phase) => `Your body is in the ${phase} phase.`,
      lineSleep: (sleepText, phase) => `Sleep was ${sleepText} last night, and your body is in the ${phase} phase.`,
      back: 'Back',
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      progressionTitle: 'Insight progression',
      stageDaily: 'Daily explanation',
      stagePattern: 'Pattern hint',
      stageMonthly: 'Monthly rhythm summary',
      patternHintBase: 'Energy often feels lower when sleep is shorter.',
      monthlyA: 'Your energy tends to dip before your cycle.',
      monthlyB: 'Sleep often affects mood during the week.',
      continuityTitle: 'Continuity',
      continuityQuestion: 'How does today feel compared to yesterday?',
      speakShort: 'Speak',
      writeShort: 'Write',
      skipShort: 'Skip',
      writePlaceholder: 'Write a few words...',
      saveWrite: 'Save',
      skipped: 'Skipped for today.',
      saved: 'Saved.',
      continuityFallback: 'Yesterday you took a quiet moment with Luna29.',
      continuityYesterday: (line) => `Yesterday you said ${line}`,
      continuityRecent: (line) => `Recently you shared ${line}`,
    },
    pt: {
      evening: 'Good evening',
      afternoon: 'Good afternoon',
      morning: 'Good morning',
      todayReflection: "Today's note",
      title: 'Today with Luna29',
      contextLower: 'Your energy seems a little lower today.',
      contextSteady: 'Your energy seems more steady today.',
      slowerTonight: 'It may help to keep tonight slower.',
      cycle: 'Cycle',
      energy: 'Energy',
      sleep: 'Sleep',
      lowerThanUsual: 'Lower than usual',
      steady: 'More steady',
      storyTitle: 'Your story with Luna29',
      fallback: 'Your story with Luna29 is just beginning.',
      speak: 'Speak to Luna29',
      quickCheckin: 'Quick check-in',
      lineIntro: (phase) => `Your body is in the ${phase} phase.`,
      lineSleep: (sleepText, phase) => `Sleep was ${sleepText} last night, and your body is in the ${phase} phase.`,
      back: 'Back',
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      progressionTitle: 'Insight progression',
      stageDaily: 'Daily explanation',
      stagePattern: 'Pattern hint',
      stageMonthly: 'Monthly rhythm summary',
      patternHintBase: 'Energy often feels lower when sleep is shorter.',
      monthlyA: 'Your energy tends to dip before your cycle.',
      monthlyB: 'Sleep often affects mood during the week.',
      continuityTitle: 'Continuity',
      continuityQuestion: 'How does today feel compared to yesterday?',
      speakShort: 'Speak',
      writeShort: 'Write',
      skipShort: 'Skip',
      writePlaceholder: 'Write a few words...',
      saveWrite: 'Save',
      skipped: 'Skipped for today.',
      saved: 'Saved.',
      continuityFallback: 'Yesterday you took a quiet moment with Luna29.',
      continuityYesterday: (line) => `Yesterday you said ${line}`,
      continuityRecent: (line) => `Recently you shared ${line}`,
    },
  ar: {
      evening: 'مساء الخير',
      afternoon: 'طاب يومك',
      morning: 'صباح الخير',
      todayReflection: 'ملاحظة اليوم',
      title: 'اليوم مع Luna29',
      contextLower: 'قد تشعرين اليوم بإيقاع أبطأ قليلاً.',
      contextSteady: 'قد تشعرين اليوم بإيقاع أكثر ثباتاً.',
      slowerTonight: 'قد يساعدك إبطاء وتيرة هذه الليلة.',
      cycle: 'الدورة',
      energy: 'الطاقة',
      sleep: 'النوم',
      lowerThanUsual: 'أقل من المعتاد',
      steady: 'أكثر ثباتاً',
      storyTitle: 'قصتك مع Luna29',
      fallback: 'قصتك مع Luna29 ما زالت في البداية.',
      speak: 'تحدّثي مع Luna29',
      quickCheckin: 'تسجيل سريع',
      lineIntro: (phase) => `جسمك في مرحلة ${phase}.`,
      lineSleep: (sleepText, phase) => `كان نومك ${sleepText} الليلة الماضية، وجسمك في مرحلة ${phase}.`,
      back: 'رجوع',
      openMyDay: 'افتحي يومي مع Luna29',
      dayLabelToday: 'اليوم',
      dayLabelYesterday: 'أمس',
      daysAgo: (days) => `منذ ${days} أيام`,
      dayWord: 'يوم',
      phaseWord: 'مرحلة',
      sleepUnset: 'غير محدّد',
      progressionTitle: 'تطوّر الرؤى',
      stageDaily: 'شرح يومي',
      stagePattern: 'تلميح نمط',
      stageMonthly: 'ملخّص الإيقاع الشهري',
      patternHintBase: 'الطاقة غالباً تكون أقل عندما يكون النوم أقصر.',
      monthlyA: 'طاقتك تميل للانخفاض قبل دورتك.',
      monthlyB: 'النوم غالباً يؤثر على المزاج خلال الأسبوع.',
      continuityTitle: 'الاستمرارية',
      continuityQuestion: 'كيف يشعر اليوم مقارنةً بأمس؟',
      speakShort: 'تحدّثي',
      writeShort: 'اكتبي',
      skipShort: 'تخطّي',
      writePlaceholder: 'اكتبي بضع كلمات...',
      saveWrite: 'حفظ',
      skipped: 'تم التخطّي لليوم.',
      saved: 'تم الحفظ.',
      continuityFallback: 'أمس خصّصتِ لحظة هادئة مع Luna29.',
      continuityYesterday: (line) => `أمس قلتِ ${line}`,
      continuityRecent: (line) => `شاركتِ مؤخراً ${line}`,
    },
  he: {
      evening: 'ערב טוב',
      afternoon: 'צהריים טובים',
      morning: 'בוקר טוב',
      todayReflection: 'הערת היום',
      title: 'היום עם Luna29',
      contextLower: 'היום אולי מרגיש קצת יותר איטי.',
      contextSteady: 'היום אולי מרגיש יותר יציב.',
      slowerTonight: 'אולי יעזור לשמור על ערב איטי יותר.',
      cycle: 'מחזור',
      energy: 'אנרגיה',
      sleep: 'שינה',
      lowerThanUsual: 'נמוך מהרגיל',
      steady: 'יותר יציב',
      storyTitle: 'הסיפור שלך עם Luna29',
      fallback: 'הסיפור שלך עם Luna29 רק מתחיל.',
      speak: 'דברי עם Luna29',
      quickCheckin: 'צ׳ק-אין מהיר',
      lineIntro: (phase) => `הגוף שלך בשלב ${phase}.`,
      lineSleep: (sleepText, phase) => `השינה הייתה ${sleepText} בלילה שעבר, והגוף שלך בשלב ${phase}.`,
      back: 'חזרה',
      openMyDay: 'פתחי את היום שלי עם Luna29',
      dayLabelToday: 'היום',
      dayLabelYesterday: 'אתמול',
      daysAgo: (days) => `לפני ${days} ימים`,
      dayWord: 'יום',
      phaseWord: 'שלב',
      sleepUnset: 'לא הוגדר',
      progressionTitle: 'התקדמות תובנות',
      stageDaily: 'הסבר יומי',
      stagePattern: 'רמז לדפוס',
      stageMonthly: 'סיכום קצב חודשי',
      patternHintBase: 'האנרגיה לרוב נמוכה יותר כשהשינה קצרה יותר.',
      monthlyA: 'האנרגיה שלך נוטה לרדת לפני המחזור.',
      monthlyB: 'שינה לרוב משפיעה על מצב הרוח במהלך השבוע.',
      continuityTitle: 'רצף',
      continuityQuestion: 'איך היום מרגיש לעומת אתמול?',
      speakShort: 'דברי',
      writeShort: 'כתבי',
      skipShort: 'דלגי',
      writePlaceholder: 'כתבי כמה מילים...',
      saveWrite: 'שמירה',
      skipped: 'דולג להיום.',
      saved: 'נשמר.',
      continuityFallback: 'אתמול לקחת רגע שקט עם Luna29.',
      continuityYesterday: (line) => `אתמול אמרת ${line}`,
      continuityRecent: (line) => `לאחרונה שיתפת ${line}`,
    },};
  const copy = getLang(copyByLang, lang) || copyByLang.en;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return copy.morning;
    if (hour < 18) return copy.afternoon;
    return copy.evening;
  }, [copy.afternoon, copy.evening, copy.morning]);

  const profileName = systemState.profile?.name?.trim() || 'Anna';
  const sleepValue = systemState.lastCheckin?.metrics?.sleep;
  const energyValue = systemState.lastCheckin?.metrics?.energy;
  const sleepMinutes = typeof sleepValue === 'number' ? 240 + Math.round((Math.max(0, Math.min(100, sleepValue)) / 100) * 300) : null;
  const sleepText = sleepMinutes ? `${Math.floor(sleepMinutes / 60)}h ${String(sleepMinutes % 60).padStart(2, '0')}m` : 'shorter';
  const energyLabel = typeof energyValue === 'number' && energyValue >= 50 ? copy.steady : copy.lowerThanUsual;
  const phaseLabel = `${currentPhase}`.toLowerCase();

  const storyEntries = useMemo(() => {
    const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const nowStart = dayStart(new Date());
    const label = (iso: string) => {
      const diff = Math.floor((nowStart - dayStart(new Date(iso))) / 86400000);
      if (diff <= 0) return copy.dayLabelToday;
      if (diff === 1) return copy.dayLabelYesterday;
      return copy.daysAgo(diff);
    };
    const lineFromEvent = (event: HealthEvent) => {
      if (event.type === 'DAILY_CHECKIN') {
        const payload = event.payload as { metrics?: Record<string, number> };
        const sleep = payload.metrics?.sleep ?? 50;
        const energy = payload.metrics?.energy ?? 50;
        if (sleep < 45) return 'Sleep felt shorter.';
        if (energy < 45) return 'Energy felt lower.';
        return 'Energy felt calmer.';
      }
      const payload = event.payload as { text?: string };
      const text = (payload.text || '').toLowerCase();
      if (/(work|office|deadline|meeting|job|pressure)/i.test(text)) return 'Work felt demanding.';
      if (/(sleep|tired|drained|insomnia)/i.test(text)) return 'Sleep felt shorter.';
      return 'You shared how the day felt.';
    };

    return events
      .filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4)
      .map((event) => ({ id: event.id, day: label(event.timestamp), text: lineFromEvent(event) }));
  }, [copy, events]);

  const insightStage = useMemo(() => {
    const activeDays = new Set(
      events
        .filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN')
        .map((event) => new Date(event.timestamp).toISOString().slice(0, 10))
    ).size;
    if (activeDays >= 30) return 'monthly' as const;
    if (activeDays >= 7) return 'pattern' as const;
    return 'daily' as const;
  }, [events]);

  const patternHint = useMemo(() => {
    const checkins = events.filter((event) => event.type === 'DAILY_CHECKIN');
    const shortSleepLowEnergy = checkins.filter((event) => {
      const payload = event.payload as { metrics?: Record<string, number> };
      const sleep = payload.metrics?.sleep ?? 50;
      const energy = payload.metrics?.energy ?? 50;
      return sleep < 45 && energy < 45;
    }).length;
    if (shortSleepLowEnergy >= 2) return copy.patternHintBase;
    return copy.patternHintBase;
  }, [copy.patternHintBase, events]);

  const continuityMessage = useMemo(() => {
    const toDayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);
    const todayKey = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    const timeline = events
      .filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const describe = (event: HealthEvent): string => {
      if (event.type === 'DAILY_CHECKIN') {
        const payload = event.payload as { metrics?: Record<string, number> };
        const sleep = payload.metrics?.sleep ?? 50;
        const energy = payload.metrics?.energy ?? 50;
        if (sleep < 45) return 'you felt tired after a short sleep.';
        if (energy < 45) return 'your energy felt lower.';
        return 'your day felt more balanced.';
      }
      const payload = event.payload as { text?: string };
      const text = (payload.text || '').toLowerCase();
      if (/(work|office|deadline|meeting|job|pressure)/i.test(text)) return 'you felt tired after work.';
      if (/(sleep|tired|drained|insomnia|overwhelmed|stress)/i.test(text)) return 'you felt tired and needed rest.';
      if (/(calm|steady|better|lighter)/i.test(text)) return 'you felt calmer than before.';
      return 'you shared how your day felt.';
    };

    const yesterdayEvent = timeline.find((event) => toDayKey(event.timestamp) === yesterdayKey);
    if (yesterdayEvent) return copy.continuityYesterday(describe(yesterdayEvent));
    const previousEvent = timeline.find((event) => toDayKey(event.timestamp) !== todayKey);
    if (previousEvent) return copy.continuityRecent(describe(previousEvent));
    return copy.continuityFallback;
  }, [copy, events]);

  const saveContinuityWrite = () => {
    if (!writeText.trim()) return;
    dataService.logEvent('AUDIO_REFLECTION', {
      source: 'continuity_prompt',
      text: writeText.trim(),
      question: copy.continuityQuestion,
    });
    setContinuityStatus(copy.saved);
    setWriteOpen(false);
    setWriteText('');
  };

  const partnerCtaByLang: LangCopy< string> = {
    en: 'Explain today to my partner',
    ru: 'Объяснить мой день партнеру',
    uk: 'Пояснити мій день партнеру',
    es: 'Explain today to my partner',
    fr: 'Explain today to my partner',
    de: 'Explain today to my partner',
    zh: 'Explain today to my partner',
    ja: 'Explain today to my partner',
    pt: 'Explain today to my partner',
  ar: 'اشرحي يومي لشريكي',
  he: 'הסבירי את היום שלי לבן/בת הזוג',};
  const monthlyCtaByLang: LangCopy< string> = {
    en: 'Your month with Luna29',
    ru: 'Ваш месяц с Luna29',
    uk: 'Ваш місяць з Luna29',
    es: 'Your month with Luna29',
    fr: 'Your month with Luna29',
    de: 'Your month with Luna29',
    zh: 'Your month with Luna29',
    ja: 'Your month with Luna29',
    pt: 'Your month with Luna29',
  ar: 'شهرك مع Luna29',
  he: 'החודש שלך עם Luna29',};
  const shareFeedbackByLang: LangCopy< { shared: string; copied: string; failed: string }> = {
    en: { shared: 'Shared.', copied: 'Copied.', failed: 'Could not share.' },
    ru: { shared: 'Отправлено.', copied: 'Скопировано.', failed: 'Не удалось поделиться.' },
    uk: { shared: 'Надіслано.', copied: 'Скопійовано.', failed: 'Не вдалося поділитися.' },
    es: { shared: 'Shared.', copied: 'Copied.', failed: 'Could not share.' },
    fr: { shared: 'Shared.', copied: 'Copied.', failed: 'Could not share.' },
    de: { shared: 'Shared.', copied: 'Copied.', failed: 'Could not share.' },
    zh: { shared: 'Shared.', copied: 'Copied.', failed: 'Could not share.' },
    ja: { shared: 'Shared.', copied: 'Copied.', failed: 'Could not share.' },
    pt: { shared: 'Shared.', copied: 'Copied.', failed: 'Could not share.' },
  ar: { shared: 'تمت المشاركة.', copied: 'تم النسخ.', failed: 'تعذّرت المشاركة.' },
  he: { shared: 'שותף.', copied: 'הועתק.', failed: 'לא ניתן לשתף.' },};

  const handleSharePartnerMessage = async () => {
    const cycleLine = `${copy.cycle}: ${copy.dayWord} ${systemState.currentDay} · ${currentPhase} ${copy.phaseWord}`;
    const sleepLine = `${copy.sleep}: ${sleepMinutes ? sleepText : copy.sleepUnset}`;
    const message = [
      'Today my energy may be lower.',
      '',
      `I slept ${sleepMinutes ? sleepText : 'less than usual'} last night and my cycle is in the ${phaseLabel} phase.`,
      '',
      cycleLine,
      sleepLine,
    ].join('\n');
    const result = await shareTextSafely(message, 'Luna29 partner message');
    const feedback = getLang(shareFeedbackByLang, lang) || shareFeedbackByLang.en;
    if (result === 'shared') setPartnerStatus(feedback.shared);
    else if (result === 'copied') setPartnerStatus(feedback.copied);
    else setPartnerStatus(feedback.failed);
  };

  return (
    <section className="relative max-w-4xl mx-auto p-6 md:p-8 space-y-6 overflow-hidden rounded-[2.4rem] bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,224,238,0.46),transparent_52%),radial-gradient(92%_78%_at_100%_0%,rgba(219,203,255,0.42),transparent_54%),linear-gradient(155deg,#fdf8fc_0%,#f6f2fd_50%,#f2f5ff_100%)] dark:bg-[radial-gradient(120%_90%_at_0%_0%,rgba(90,106,158,0.24),transparent_52%),radial-gradient(92%_78%_at_100%_0%,rgba(83,105,156,0.2),transparent_54%),linear-gradient(155deg,#0a1936_0%,#0f2248_50%,#132b56_100%)]">
      <div className="pointer-events-none absolute -top-12 -left-12 w-52 h-52 rounded-full bg-rose-200/55 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-violet-200/55 blur-3xl" />
      <article className="relative rounded-[2.2rem] border border-white/70 dark:border-[#486a9b] bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(250,244,255,0.85)_46%,rgba(244,247,255,0.82)_100%)] dark:!bg-[linear-gradient(145deg,rgba(11,30,63,0.96),rgba(16,38,76,0.94)_46%,rgba(20,48,90,0.92)_100%)] p-6 md:p-8 shadow-[0_24px_60px_rgba(113,82,168,0.18)] dark:shadow-[0_24px_54px_rgba(5,13,33,0.52)] space-y-5 overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-fuchsia-200/45 blur-3xl" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 dark:border-white/15 bg-white/70 dark:bg-slate-900/45 px-3 py-1.5 shadow-[0_8px_20px_rgba(145,111,188,0.16)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-violet-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">{copy.todayReflection}</p>
          </div>
          <p
            className="font-brand animate-color-shift-luna text-5xl md:text-6xl leading-[0.95] drop-shadow-[0_1px_0_rgba(255,255,255,0.45)] dark:drop-shadow-[0_1px_0_rgba(10,20,40,0.6)]"
          >
            {greeting}, {profileName}
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] dark:drop-shadow-none">{copy.title}</h1>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {typeof energyValue === 'number' && energyValue >= 50 ? copy.contextSteady : copy.contextLower}
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-100/95">
            {sleepMinutes ? copy.lineSleep(sleepText, phaseLabel) : copy.lineIntro(phaseLabel)}
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{copy.slowerTonight}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onSpeak}
            className="luna-soft-glow inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/70 dark:border-[#94a8d0]/35 bg-gradient-to-r from-[#9455e4] via-[#c85fb6] to-[#7a63f7] dark:from-[#4f5f8a] dark:via-[#4b5f89] dark:to-[#43638a] text-white text-[11px] font-black uppercase tracking-[0.15em] hover:brightness-110 transition-all shadow-[0_14px_30px_rgba(123,86,188,0.35)] dark:shadow-[0_14px_28px_rgba(18,33,67,0.45)]"
          >
            <Mic size={14} /> {copy.speak}
          </button>
          <button
            data-testid="dashboard-checkin-start"
            onClick={onQuickCheckin}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-luna-purple/25 dark:border-[#8ea8d3]/45 bg-luna-purple/18 dark:bg-[#183966]/82 text-luna-purple dark:text-[#d8e6ff] text-[11px] font-black uppercase tracking-[0.15em] hover:bg-luna-purple/28 dark:hover:bg-[#214678] transition-all"
          >
            {copy.quickCheckin}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={onOpenMyDay}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300/60 dark:border-[#86a0cb]/40 bg-white/72 dark:bg-[#17365f]/82 text-slate-700 dark:text-[#d9e6ff] text-[11px] font-black uppercase tracking-[0.15em] hover:bg-white/88 dark:hover:bg-[#214675] transition-all"
          >
            {copy.openMyDay}
          </button>
          <button
            onClick={onOpenMonthly}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300/60 dark:border-[#86a0cb]/40 bg-white/72 dark:bg-[#17365f]/82 text-slate-700 dark:text-[#d9e6ff] text-[11px] font-black uppercase tracking-[0.15em] hover:bg-white/88 dark:hover:bg-[#214675] transition-all"
          >
            {getLang(monthlyCtaByLang, lang) || monthlyCtaByLang.en}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="rounded-xl bg-[linear-gradient(140deg,rgba(255,255,255,0.9),rgba(246,235,255,0.8))] dark:!bg-[linear-gradient(145deg,rgba(18,43,81,0.94),rgba(23,53,95,0.9))] p-3 border border-white/70 dark:border-[#6f8bb9]/35">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{copy.cycle}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{copy.dayWord} {systemState.currentDay} · {currentPhase} {copy.phaseWord}</p>
          </div>
          <div className="rounded-xl bg-[linear-gradient(140deg,rgba(255,255,255,0.9),rgba(236,246,255,0.82))] dark:!bg-[linear-gradient(145deg,rgba(18,43,81,0.94),rgba(23,53,95,0.9))] p-3 border border-white/70 dark:border-[#6f8bb9]/35">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{copy.energy}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{energyLabel}</p>
          </div>
          <div className="rounded-xl bg-[linear-gradient(140deg,rgba(255,255,255,0.9),rgba(255,239,245,0.82))] dark:!bg-[linear-gradient(145deg,rgba(18,43,81,0.94),rgba(23,53,95,0.9))] p-3 border border-white/70 dark:border-[#6f8bb9]/35">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{copy.sleep}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{sleepMinutes ? sleepText : copy.sleepUnset}</p>
          </div>
        </div>

        <button
          onClick={handleSharePartnerMessage}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300/60 dark:border-[#86a0cb]/40 bg-white/72 dark:bg-[#17365f]/82 text-slate-700 dark:text-[#d9e6ff] text-[11px] font-black uppercase tracking-[0.12em] hover:bg-white/88 dark:hover:bg-[#214675] transition-all"
        >
          <Share2 size={14} /> {getLang(partnerCtaByLang, lang) || partnerCtaByLang.en}
        </button>
        {partnerStatus && <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{partnerStatus}</p>}
      </article>

      <article className="rounded-[1.8rem] border border-white/70 dark:border-[#486a9b] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(247,241,255,0.78))] dark:!bg-[linear-gradient(145deg,rgba(12,33,67,0.94),rgba(18,43,82,0.9))] p-5 shadow-luna-rich">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.progressionTitle}</p>
        {insightStage === 'daily' && (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{copy.stageDaily}</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-100/95">
              {typeof energyValue === 'number' && energyValue >= 50 ? copy.contextSteady : copy.contextLower}
            </p>
          </div>
        )}
        {insightStage === 'pattern' && (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{copy.stagePattern}</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-100/95">{patternHint}</p>
          </div>
        )}
        {insightStage === 'monthly' && (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{copy.stageMonthly}</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-100/95">{copy.monthlyA}</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-100/95">{copy.monthlyB}</p>
          </div>
        )}
      </article>

      <article className="rounded-[1.8rem] border border-white/70 dark:border-[#486a9b] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(242,247,255,0.78))] dark:!bg-[linear-gradient(145deg,rgba(12,33,67,0.94),rgba(18,43,82,0.9))] p-5 shadow-luna-rich">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.continuityTitle}</p>
        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-100/95">{continuityMessage}</p>
        <p className="mt-2 text-sm font-black text-slate-800 dark:text-slate-100">{copy.continuityQuestion}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onSpeak}
            className="luna-soft-glow px-4 py-2 rounded-full border border-white/70 bg-gradient-to-r from-[#9455e4] via-[#c85fb6] to-[#7a63f7] text-white text-[11px] font-black uppercase tracking-[0.14em]"
          >
            {copy.speakShort}
          </button>
          <button
            onClick={() => {
              setWriteOpen((prev) => !prev);
              setContinuityStatus('');
            }}
            className="px-4 py-2 rounded-full border border-luna-purple/25 dark:border-[#8ea8d3]/45 bg-luna-purple/14 dark:bg-[#183966]/82 text-luna-purple dark:text-[#d8e6ff] text-[11px] font-black uppercase tracking-[0.14em]"
          >
            {copy.writeShort}
          </button>
          <button
            onClick={() => {
              setWriteOpen(false);
              setContinuityStatus(copy.skipped);
            }}
            className="px-4 py-2 rounded-full border border-slate-300/60 dark:border-[#86a0cb]/40 bg-slate-200/70 dark:bg-[#17365f]/82 text-slate-700 dark:text-[#d9e6ff] text-[11px] font-black uppercase tracking-[0.14em]"
          >
            {copy.skipShort}
          </button>
        </div>
        {writeOpen && (
          <div className="mt-3 rounded-xl bg-slate-100/80 dark:bg-[#17365f]/75 p-3 space-y-2 border border-white/50 dark:border-[#6f8bb9]/35">
            <textarea
              value={writeText}
              onChange={(event) => setWriteText(event.target.value)}
              placeholder={copy.writePlaceholder}
              className="w-full min-h-[90px] resize-none rounded-lg border border-slate-200/80 dark:border-[#6f8bb9]/35 bg-white/90 dark:bg-[#102a53]/85 p-2 text-sm font-medium text-slate-700 dark:text-slate-100 outline-none"
            />
            <button
              onClick={saveContinuityWrite}
              disabled={!writeText.trim()}
              className="px-4 py-2 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-45"
            >
              {copy.saveWrite}
            </button>
          </div>
        )}
        {continuityStatus && <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-300">{continuityStatus}</p>}
      </article>

      <article className="rounded-[1.8rem] border border-white/70 dark:border-[#486a9b] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,242,248,0.78))] dark:!bg-[linear-gradient(145deg,rgba(12,33,67,0.94),rgba(18,43,82,0.9))] p-5 shadow-luna-rich">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.storyTitle}</p>
        {storyEntries.length > 0 ? (
          <div className="mt-3 space-y-3">
            {storyEntries.map((entry) => (
              <div key={entry.id} className="rounded-xl bg-[linear-gradient(140deg,rgba(255,255,255,0.86),rgba(244,238,255,0.72))] dark:!bg-[linear-gradient(145deg,rgba(22,50,90,0.9),rgba(28,59,103,0.86))] p-3 border border-white/65 dark:border-[#6f8bb9]/35">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{entry.day}</p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-100">{entry.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{copy.fallback}</p>
        )}
      </article>
    </section>
  );
};
