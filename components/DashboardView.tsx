import React, { useEffect, useMemo, useState } from 'react';
import { Mic, Sparkles, Activity, PenLine, SkipForward } from 'lucide-react';
import { Language, TranslationSchema, LangCopy, getLang } from '../constants';
import {
  DASHBOARD_RETENTION_COPY,
  DASHBOARD_BILLING_COPY,
  DASHBOARD_GENTLE_REMINDERS,
  DASHBOARD_EVENING_COPY,
} from '../utils/memberCoreI18n';
import { CyclePhase, HealthEvent, HormoneData, RuleOutput } from '../types';
import HormoneGauge from './HormoneGauge';
import { FuelCompass } from './FuelCompass';
import { TabType } from '../utils/navigation';
import { dataService } from '../services/dataService';
import { HormoneTestingGuide } from './HormoneTestingGuide';
import { billingService, BillingStatusPayload } from '../services/billingService';
import { conversionEvents } from '../utils/conversionEvents';
import { getMemberTimeGreeting } from '../utils/timeOfDayGreeting';
import { getPublicChromeCopy } from '../utils/publicChromeCopy';

interface DashboardViewProps {
  lang: Language;
  ui: TranslationSchema;
  currentPhase: CyclePhase;
  ruleOutput: RuleOutput;
  isNarrativeLoading: boolean;
  stateNarrative: string | null;
  hormoneData: HormoneData[];
  setSelectedHormone: (hormone: HormoneData) => void;
  setShowSyncOverlay: (next: boolean) => void;
  setShowLive: (next: boolean) => void;
  navigateTo: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  ui,
  currentPhase,
  ruleOutput,
  isNarrativeLoading,
  stateNarrative,
  hormoneData,
  setSelectedHormone,
  setShowSyncOverlay,
  setShowLive,
  navigateTo,
}) => {
  const retentionCopy = getLang(DASHBOARD_RETENTION_COPY, lang) || DASHBOARD_RETENTION_COPY.en;
  const billingCopy = getLang(DASHBOARD_BILLING_COPY, lang) || DASHBOARD_BILLING_COPY.en;
  const chrome = getPublicChromeCopy(lang);
  const REMINDER_STORAGE_KEY = 'luna_daily_reminder_v1';
  const EVENING_SKIP_STORAGE_KEY = 'luna_evening_reflection_skip_v1';

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { enabled?: boolean };
      return Boolean(parsed.enabled);
    } catch {
      return false;
    }
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
      if (!raw) return '20:30';
      const parsed = JSON.parse(raw) as { time?: string };
      return parsed.time || '20:30';
    } catch {
      return '20:30';
    }
  });
  const [tick, setTick] = useState<number>(Date.now());
  const [billing, setBilling] = useState<BillingStatusPayload>({ status: 'inactive' });
  const [billingEnabled, setBillingEnabled] = useState<boolean>(false);
  const [billingLoading, setBillingLoading] = useState<boolean>(true);
  const [billingFeedback, setBillingFeedback] = useState<string>('');

  const events = useMemo<HealthEvent[]>(() => dataService.getLog(), [tick]);
  const dailyEvents = useMemo(
    () => events.filter((event) => event.type === 'DAILY_CHECKIN' || event.type === 'AUDIO_REFLECTION'),
    [events]
  );

  const streakDays = useMemo(() => {
    const dayKeys = Array.from(
      new Set(
        dailyEvents.map((event) => {
          const date = new Date(event.timestamp);
          return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        })
      )
    );
    if (!dayKeys.length) return 0;
    const toDate = (key: string) => {
      const [y, m, d] = key.split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1);
    };
    const sorted = dayKeys
      .map((key) => ({ key, date: toDate(key) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const unique = sorted.map((item) => item.date);
    const today = new Date();
    const last = unique[unique.length - 1];
    const dayDiffFromToday = Math.floor(
      (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
        new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime()) /
        86400000
    );
    if (dayDiffFromToday > 1) return 0;
    let streak = 1;
    for (let i = unique.length - 1; i > 0; i--) {
      const cur = unique[i];
      const prev = unique[i - 1];
      const diff = Math.floor(
        (new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()).getTime() -
          new Date(prev.getFullYear(), prev.getMonth(), prev.getDate()).getTime()) /
          86400000
      );
      if (diff === 1) streak += 1;
      else break;
    }
    return streak;
  }, [dailyEvents]);

  const weekly = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const weekEvents = events.filter((event) => new Date(event.timestamp).getTime() >= weekStart.getTime());
    const checkins = weekEvents.filter((event) => event.type === 'DAILY_CHECKIN').length;
    const voiceNotes = weekEvents.filter((event) => event.type === 'AUDIO_REFLECTION').length;
    const activeDayKeys = new Set(
      weekEvents.map((event) => {
        const date = new Date(event.timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      })
    );
    return { checkins, voiceNotes, activeDays: activeDayKeys.size };
  }, [events]);

  const todayDateKey = useMemo(() => new Date().toISOString().split('T')[0], [tick]);

  const nextReminderLabel = useMemo(() => {
    const [hh, mm] = reminderTime.split(':').map(Number);
    const next = new Date();
    next.setSeconds(0, 0);
    next.setHours(Number.isFinite(hh) ? hh : 20, Number.isFinite(mm) ? mm : 30, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
    return next.toLocaleString();
  }, [reminderTime, tick]);

  const isReminderDueNow = useMemo(() => {
    if (!reminderEnabled) return false;
    const [hh, mm] = reminderTime.split(':').map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
    const now = new Date();
    return now.getHours() === hh && now.getMinutes() === mm;
  }, [reminderEnabled, reminderTime, tick]);

  const gentleReminderMessage = useMemo(() => {
    const pool = getLang(DASHBOARD_GENTLE_REMINDERS, lang) || DASHBOARD_GENTLE_REMINDERS.en;
    const daySeed = new Date().getDate() + new Date().getMonth() * 31;
    return pool[daySeed % pool.length];
  }, [lang, tick]);

  const eveningCopy = getLang(DASHBOARD_EVENING_COPY, lang) || DASHBOARD_EVENING_COPY.en;

  const [eveningWriteOpen, setEveningWriteOpen] = useState(false);
  const [eveningText, setEveningText] = useState('');
  const [eveningStatus, setEveningStatus] = useState<string>('');

  const eveningQuestion = useMemo(() => {
    const idx = Math.abs(todayDateKey.split('-').join('').split('').reduce((sum, ch) => sum + Number(ch), 0));
    return eveningCopy.questions[idx % eveningCopy.questions.length] || eveningCopy.prompt;
  }, [eveningCopy.prompt, eveningCopy.questions, todayDateKey]);

  const getEveningPattern = (allEvents: HealthEvent[]) => {
    const relevant = allEvents.filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN');
    if (relevant.length < 5) return eveningCopy.learning;
    return 'Work days tend to feel heavier when sleep is shorter.';
  };

  const buildEveningResponse = (text: string) => {
    const normalized = text.toLowerCase();
    if (!normalized.trim()) {
      return 'Thank you for pausing tonight. Even a short check-in matters.';
    }
    if (/(work|office|deadline|meeting|job|pressure)/i.test(normalized)) {
      return 'You mentioned pressure at work today. It sounds like the day asked a lot from you.';
    }
    if (/(tired|exhausted|drained|sleep|insomnia|heavy|stress|sad|anxious|overwhelmed)/i.test(normalized)) {
      return 'You sounded a little tired today. Your body may be asking for a softer evening.';
    }
    return 'I hear you. You moved through a lot today, and you still made space to reflect.';
  };

  const handleEveningSave = () => {
    dataService.logEvent('AUDIO_REFLECTION', {
      text: eveningText.trim(),
      source: 'member_evening_reflection',
      question: eveningQuestion,
    });
    setEveningStatus(eveningCopy.saved);
    setEveningWriteOpen(false);
    localStorage.removeItem(EVENING_SKIP_STORAGE_KEY);
    setTick(Date.now());
  };

  const handleEveningSkip = () => {
    localStorage.setItem(EVENING_SKIP_STORAGE_KEY, JSON.stringify({ date: todayDateKey }));
    setEveningWriteOpen(false);
    setEveningText('');
    setEveningStatus(eveningCopy.skipped);
  };

  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    billingService
      .getStatus()
      .then((payload) => {
        if (!mounted) return;
        setBilling(payload.billing || { status: 'inactive' });
        setBillingEnabled(Boolean(payload.enabled));
      })
      .catch(() => {
        if (!mounted) return;
        setBillingEnabled(false);
        setBilling({ status: 'inactive' });
      })
      .finally(() => {
        if (!mounted) return;
        setBillingLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!reminderEnabled) return;
    localStorage.setItem(
      REMINDER_STORAGE_KEY,
      JSON.stringify({ enabled: reminderEnabled, time: reminderTime, updatedAt: new Date().toISOString() })
    );
  }, [reminderEnabled, reminderTime]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
      setTick(Date.now());
    }
  };

  const sendTestNotification = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification('Luna29', {
      body: gentleReminderMessage,
    });
  };

  const saveReminder = () => {
    localStorage.setItem(
      REMINDER_STORAGE_KEY,
      JSON.stringify({ enabled: reminderEnabled, time: reminderTime, updatedAt: new Date().toISOString() })
    );
    setTick(Date.now());
  };

  const startCheckout = async (period: 'month' | 'year') => {
    try {
      setBillingFeedback('');
      conversionEvents.checkoutStarted(period);
      const payload = await billingService.createCheckoutSession(period);
      conversionEvents.trialStarted();
      if (payload.url) window.location.href = payload.url;
    } catch (error) {
      setBillingFeedback(error instanceof Error ? error.message : 'Failed to start checkout.');
    }
  };

  const openPortal = async () => {
    try {
      setBillingFeedback('');
      const payload = await billingService.createPortalSession();
      if (payload.url) window.location.href = payload.url;
    } catch (error) {
      setBillingFeedback(error instanceof Error ? error.message : 'Failed to open billing portal.');
    }
  };

  const premiumActive = useMemo(() => ['active', 'trialing'].includes((billing.status || '').toLowerCase()), [billing.status]);
  const needsRecovery = useMemo(() => ['past_due', 'unpaid', 'incomplete'].includes((billing.status || '').toLowerCase()), [billing.status]);
  const canUsePaidInsights = billingEnabled && premiumActive;

  const paywallCopyByLang: LangCopy<{ locked: string; lineA: string; lineB: string; unlock: string; close: string; inPlan: string; featurePattern: string; featureMonthly: string; featureHistory: string; featureVoice: string }> = {
    en: {
      locked: 'Locked',
      lineA: 'Luna29 is starting to see patterns in your life.',
      lineB: 'Unlock deeper insights to understand your rhythm over time.',
      unlock: 'Unlock insights',
      close: 'Not now',
      inPlan: 'Included in Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
    ru: {
      locked: 'Закрыто',
      lineA: 'Luna29 начинает видеть паттерны в вашей жизни.',
      lineB: 'Откройте глубокие инсайты, чтобы лучше понимать свой ритм во времени.',
      unlock: 'Unlock insights',
      close: 'Позже',
      inPlan: 'Входит в Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
    uk: {
      locked: 'Закрито',
      lineA: 'Luna29 починає бачити патерни у вашому житті.',
      lineB: 'Відкрийте глибші інсайти, щоб краще розуміти свій ритм з часом.',
      unlock: 'Unlock insights',
      close: 'Пізніше',
      inPlan: 'Входить до Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
  es: {
      locked: 'Locked',
      lineA: 'Luna29 is starting to see patterns in your life.',
      lineB: 'Unlock deeper insights to understand your rhythm over time.',
      unlock: 'Unlock insights',
      close: 'Not now',
      inPlan: 'Included in Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
  fr: {
      locked: 'Locked',
      lineA: 'Luna29 is starting to see patterns in your life.',
      lineB: 'Unlock deeper insights to understand your rhythm over time.',
      unlock: 'Unlock insights',
      close: 'Not now',
      inPlan: 'Included in Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
  de: {
      locked: 'Locked',
      lineA: 'Luna29 is starting to see patterns in your life.',
      lineB: 'Unlock deeper insights to understand your rhythm over time.',
      unlock: 'Unlock insights',
      close: 'Not now',
      inPlan: 'Included in Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
  zh: {
      locked: 'Locked',
      lineA: 'Luna29 is starting to see patterns in your life.',
      lineB: 'Unlock deeper insights to understand your rhythm over time.',
      unlock: 'Unlock insights',
      close: 'Not now',
      inPlan: 'Included in Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
  ja: {
      locked: 'Locked',
      lineA: 'Luna29 is starting to see patterns in your life.',
      lineB: 'Unlock deeper insights to understand your rhythm over time.',
      unlock: 'Unlock insights',
      close: 'Not now',
      inPlan: 'Included in Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
  pt: {
      locked: 'Locked',
      lineA: 'Luna29 is starting to see patterns in your life.',
      lineB: 'Unlock deeper insights to understand your rhythm over time.',
      unlock: 'Unlock insights',
      close: 'Not now',
      inPlan: 'Included in Insights',
      featurePattern: 'Pattern discovery',
      featureMonthly: 'Monthly reflection',
      featureHistory: 'Full reflection history',
      featureVoice: 'Deeper voice insight',
    },
  ar: {
      locked: 'مقفل',
      lineA: 'Luna29 بدأت ترى أنماطاً في حياتك.',
      lineB: 'افتحي رؤى أعمق لفهم إيقاعك مع الوقت.',
      unlock: 'فتح الرؤى',
      close: 'ليس الآن',
      inPlan: 'ضمن Insights',
      featurePattern: 'اكتشاف الأنماط',
      featureMonthly: 'تأمل شهري',
      featureHistory: 'سجل التأملات الكامل',
      featureVoice: 'رؤى صوتية أعمق',
    },
  he: {
      locked: 'נעול',
      lineA: 'Luna29 מתחילה לראות דפוסים בחיים שלך.',
      lineB: 'פתחי תובנות עמוקות יותר כדי להבין את הקצב שלך לאורך זמן.',
      unlock: 'פתיחת תובנות',
      close: 'לא עכשיו',
      inPlan: 'כלול ב-Insights',
      featurePattern: 'גילוי דפוסים',
      featureMonthly: 'רפлексיה חודשית',
      featureHistory: 'היסטוריית רפлексיה מלאה',
      featureVoice: 'תובנה קולית עמוקה יותר',
    },};
  const defaultPaywallCopy = paywallCopyByLang.en!;
  const paywallCopy = getLang(paywallCopyByLang, lang) || defaultPaywallCopy;

  const openSoftPaywall = () => navigateTo('insights_paywall');

  const projectedState = useMemo(() => dataService.projectState(events), [events]);
  const dailyMirrorCopyByLang = {
    en: { dayMorning: 'Good morning', dayAfternoon: 'Good afternoon', dayEvening: 'Good evening', reflectionTitle: "Today's reflection", reflectionSub: 'Speak or check in. Luna29 reflects and helps you see your rhythm.', dailyAction: 'Daily action', speakTitle: 'Speak to Luna29', speakSub: 'Tap to record', quickAction: 'Quick action', quickTitle: 'Quick check-in', quickSub: '30 sec today check-in', rhythmTitle: 'Your Rhythm', rhythmSub: 'A calm snapshot for today.', cycle: 'Cycle', energy: 'Energy', mood: 'Mood', sleep: 'Sleep', levelLow: 'Low', levelMedium: 'Medium', levelHigh: 'High', learning: 'Learning', phaseSuffix: 'phase', insightsTitle: 'Luna29 Insights', learnTitle: 'Luna29 is learning about you.', learnSub: 'Complete a few check-ins to unlock personal observations.', patternTitle: 'Pattern preview', patternOneA: 'Energy drops', patternOneB: '2 days before cycle', patternTwoA: 'Sleep < 6h', patternTwoB: 'affects sensitivity', disclaimer: 'Observational guidance only. Not medical advice.', moreTools: 'More tools' },
    ru: { dayMorning: 'Доброе утро', dayAfternoon: 'Добрый день', dayEvening: 'Добрый вечер', reflectionTitle: 'Сегодняшняя рефлексия', reflectionSub: 'Скажите голосом или сделайте check-in. Luna29 поможет увидеть ваш ритм.', dailyAction: 'Ежедневное действие', speakTitle: 'Поговорить с Luna29', speakSub: 'Нажмите для записи', quickAction: 'Быстрое действие', quickTitle: 'Быстрый check-in', quickSub: '30 секунд сегодня', rhythmTitle: 'Ваш ритм', rhythmSub: 'Спокойный срез на сегодня.', cycle: 'Цикл', energy: 'Энергия', mood: 'Настроение', sleep: 'Сон', levelLow: 'Низкий', levelMedium: 'Средний', levelHigh: 'Высокий', learning: 'Изучаем', phaseSuffix: 'фаза', insightsTitle: 'Инсайты Luna29', learnTitle: 'Luna29 изучает ваш ритм.', learnSub: 'Наблюдения скоро появятся.', patternTitle: 'Превью паттернов', patternOneA: 'Энергия снижается', patternOneB: 'за 2 дня до цикла', patternTwoA: 'Сон < 6 ч', patternTwoB: 'повышает чувствительность', disclaimer: 'Наблюдательные подсказки. Не медицинский совет.', moreTools: 'Дополнительные инструменты' },
    uk: { dayMorning: 'Доброго ранку', dayAfternoon: 'Добрий день', dayEvening: 'Добрий вечір', reflectionTitle: 'Сьогоднішня рефлексія', reflectionSub: 'Скажіть голосом або зробіть check-in. Luna29 допоможе побачити ваш ритм.', dailyAction: 'Щоденна дія', speakTitle: 'Поговорити з Luna29', speakSub: 'Натисніть для запису', quickAction: 'Швидка дія', quickTitle: 'Швидкий check-in', quickSub: '30 секунд сьогодні', rhythmTitle: 'Ваш ритм', rhythmSub: 'Спокійний зріз на сьогодні.', cycle: 'Цикл', energy: 'Енергія', mood: 'Настрій', sleep: 'Сон', levelLow: 'Низький', levelMedium: 'Середній', levelHigh: 'Високий', learning: 'Вивчаємо', phaseSuffix: 'фаза', insightsTitle: 'Інсайти Luna29', learnTitle: 'Luna29 вивчає ваш ритм.', learnSub: 'Спостереження скоро зʼявляться.', patternTitle: 'Попередній перегляд патернів', patternOneA: 'Енергія знижується', patternOneB: 'за 2 дні до циклу', patternTwoA: 'Сон < 6 год', patternTwoB: 'підвищує чутливість', disclaimer: 'Лише спостережні підказки. Не медична порада.', moreTools: 'Додаткові інструменти' },
    es: { dayMorning: 'Buenos días', dayAfternoon: 'Buenas tardes', dayEvening: 'Buenas noches', reflectionTitle: 'Reflexión de hoy', reflectionSub: 'Habla o haz check-in. Luna29 refleja y te ayuda a ver tu ritmo.', dailyAction: 'Acción diaria', speakTitle: 'Habla con Luna29', speakSub: 'Toca para grabar', quickAction: 'Acción rápida', quickTitle: 'Check-in rápido', quickSub: '30 seg hoy', rhythmTitle: 'Tu ritmo', rhythmSub: 'Una vista tranquila de hoy.', cycle: 'Ciclo', energy: 'Energía', mood: 'Estado de ánimo', sleep: 'Sueño', levelLow: 'Bajo', levelMedium: 'Medio', levelHigh: 'Alto', learning: 'Aprendiendo', phaseSuffix: 'fase', insightsTitle: 'Insights de Luna29', learnTitle: 'Luna29 está aprendiendo sobre ti.', learnSub: 'Pronto habrá descubrimientos.', patternTitle: 'Vista previa de patrones', patternOneA: 'La energía baja', patternOneB: '2 días antes del ciclo', patternTwoA: 'Sueño < 6h', patternTwoB: 'afecta la sensibilidad', disclaimer: 'Guía observacional. No es consejo médico.', moreTools: 'Más herramientas' },
    fr: { dayMorning: 'Bonjour', dayAfternoon: 'Bon après-midi', dayEvening: 'Bonsoir', reflectionTitle: "Réflexion d'aujourd'hui", reflectionSub: 'Parlez ou faites un check-in. Luna29 reflète et vous aide à voir votre rythme.', dailyAction: 'Action quotidienne', speakTitle: 'Parler à Luna29', speakSub: 'Touchez pour enregistrer', quickAction: 'Action rapide', quickTitle: 'Check-in rapide', quickSub: "30 s aujourd'hui", rhythmTitle: 'Votre rythme', rhythmSub: "Une vue calme pour aujourd'hui.", cycle: 'Cycle', energy: 'Énergie', mood: 'Humeur', sleep: 'Sommeil', levelLow: 'Bas', levelMedium: 'Moyen', levelHigh: 'Élevé', learning: 'En apprentissage', phaseSuffix: 'phase', insightsTitle: 'Insights Luna29', learnTitle: 'Luna29 apprend à vous connaître.', learnSub: 'Découvertes à venir.', patternTitle: 'Aperçu des patterns', patternOneA: "L'énergie baisse", patternOneB: '2 jours avant le cycle', patternTwoA: 'Sommeil < 6h', patternTwoB: 'augmente la sensibilité', disclaimer: 'Indications observatoires uniquement. Pas un avis médical.', moreTools: 'Plus d’outils' },
    de: { dayMorning: 'Guten Morgen', dayAfternoon: 'Guten Tag', dayEvening: 'Guten Abend', reflectionTitle: 'Reflexion von heute', reflectionSub: 'Sprich oder mache einen Check-in. Luna29 spiegelt und zeigt deinen Rhythmus.', dailyAction: 'Tagesaktion', speakTitle: 'Mit Luna29 sprechen', speakSub: 'Tippen zum Aufnehmen', quickAction: 'Schnellaktion', quickTitle: 'Schneller Check-in', quickSub: '30 Sek. heute', rhythmTitle: 'Dein Rhythmus', rhythmSub: 'Ein ruhiger Überblick für heute.', cycle: 'Zyklus', energy: 'Energie', mood: 'Stimmung', sleep: 'Schlaf', levelLow: 'Niedrig', levelMedium: 'Mittel', levelHigh: 'Hoch', learning: 'Lernstatus', phaseSuffix: 'Phase', insightsTitle: 'Luna29 Insights', learnTitle: 'Luna29 lernt dich kennen.', learnSub: 'Erkenntnisse kommen bald.', patternTitle: 'Pattern-Vorschau', patternOneA: 'Energie sinkt', patternOneB: '2 Tage vor Zyklus', patternTwoA: 'Schlaf < 6h', patternTwoB: 'erhöht Sensitivität', disclaimer: 'Nur beobachtende Hinweise. Kein medizinischer Rat.', moreTools: 'Weitere Tools' },
    zh: { dayMorning: '早上好', dayAfternoon: '下午好', dayEvening: '晚上好', reflectionTitle: '今日反思', reflectionSub: '说一说或做一次 check-in。Luna29 会帮助你看见自己的节律。', dailyAction: '每日动作', speakTitle: '和 Luna29 说说', speakSub: '点击开始录音', quickAction: '快速动作', quickTitle: '快速 check-in', quickSub: '今日 30 秒', rhythmTitle: '你的节律', rhythmSub: '今天的平静快照。', cycle: '周期', energy: '能量', mood: '情绪', sleep: '睡眠', levelLow: '低', levelMedium: '中', levelHigh: '高', learning: '学习中', phaseSuffix: '阶段', insightsTitle: 'Luna29 洞察', learnTitle: 'Luna29 正在了解你。', learnSub: '即将发现更多规律。', patternTitle: '规律预览', patternOneA: '能量下降', patternOneB: '周期前 2 天', patternTwoA: '睡眠 < 6小时', patternTwoB: '影响情绪敏感度', disclaimer: '仅为观察性提示，不构成医疗建议。', moreTools: '更多工具' },
    ja: { dayMorning: 'おはようございます', dayAfternoon: 'こんにちは', dayEvening: 'こんばんは', reflectionTitle: '今日のリフレクション', reflectionSub: '話すか check-in するだけ。Luna29 があなたのリズムを映します。', dailyAction: 'デイリーアクション', speakTitle: 'Luna29 に話す', speakSub: 'タップして録音', quickAction: 'クイックアクション', quickTitle: 'クイック check-in', quickSub: '今日30秒', rhythmTitle: 'あなたのリズム', rhythmSub: '今日の落ち着いたスナップショット。', cycle: 'サイクル', energy: 'エネルギー', mood: '気分', sleep: '睡眠', levelLow: '低い', levelMedium: '中くらい', levelHigh: '高い', learning: '学習中', phaseSuffix: 'フェーズ', insightsTitle: 'Luna29 インサイト', learnTitle: 'Luna29 があなたを学習中です。', learnSub: '発見はもうすぐ。', patternTitle: 'パターンプレビュー', patternOneA: 'エネルギー低下', patternOneB: '周期の2日前', patternTwoA: '睡眠 < 6時間', patternTwoB: '感受性に影響', disclaimer: '観察に基づくガイドです。医療助言ではありません。', moreTools: 'その他のツール' },
    pt: { dayMorning: 'Bom dia', dayAfternoon: 'Boa tarde', dayEvening: 'Boa noite', reflectionTitle: 'Reflexão de hoje', reflectionSub: 'Fale ou faça check-in. A Luna29 reflete e mostra seu ritmo.', dailyAction: 'Ação diária', speakTitle: 'Fale com Luna29', speakSub: 'Toque para gravar', quickAction: 'Ação rápida', quickTitle: 'Check-in rápido', quickSub: '30 seg hoje', rhythmTitle: 'Seu ritmo', rhythmSub: 'Um retrato calmo de hoje.', cycle: 'Ciclo', energy: 'Energia', mood: 'Humor', sleep: 'Sono', levelLow: 'Baixo', levelMedium: 'Médio', levelHigh: 'Alto', learning: 'Aprendendo', phaseSuffix: 'fase', insightsTitle: 'Insights Luna29', learnTitle: 'A Luna29 está aprendendo sobre você.', learnSub: 'Novas descobertas em breve.', patternTitle: 'Prévia de padrões', patternOneA: 'Energia cai', patternOneB: '2 dias antes do ciclo', patternTwoA: 'Sono < 6h', patternTwoB: 'afeta sensibilidade', disclaimer: 'Apenas orientação observacional. Não é conselho médico.', moreTools: 'Mais ferramentas' },
  ar: { dayMorning: 'صباح الخير', dayAfternoon: 'مساء النور', dayEvening: 'مساء الخير', reflectionTitle: 'تأمل اليوم', reflectionSub: 'تحدثي أو سجّلي check-in. Luna29 تعكس وتساعدك على رؤية إيقاعك.', dailyAction: 'حركة يومية', speakTitle: 'تحدثي مع Luna29', speakSub: 'اضغطي للتسجيل', quickAction: 'إجراء سريع', quickTitle: 'check-in سريع', quickSub: '30 ثانية اليوم', rhythmTitle: 'إيقاعك', rhythmSub: 'لمحة هادئة لليوم.', cycle: 'الدورة', energy: 'الطاقة', mood: 'المزاج', sleep: 'النوم', levelLow: 'منخفض', levelMedium: 'متوسط', levelHigh: 'مرتفع', learning: 'قيد التعلّم', phaseSuffix: 'مرحلة', insightsTitle: 'رؤى Luna29', learnTitle: 'Luna29 تتعرّف عليك.', learnSub: 'اكتشافات قادمة قريباً.', patternTitle: 'معاينة الأنماط', patternOneA: 'الطاقة تنخفض', patternOneB: 'قبل يومين من الدورة', patternTwoA: 'نوم < 6 س', patternTwoB: 'يرفع الحساسية', disclaimer: 'إرشادات للملاحظة فقط. ليست نصيحة طبية.', moreTools: 'أدوات إضافية' },
  he: { dayMorning: 'בוקר טוב', dayAfternoon: 'צהריים טובים', dayEvening: 'ערב טוב', reflectionTitle: 'רפлексיה של היום', reflectionSub: 'דברי או עשי check-in. Luna29 משקפת ועוזרת לראות את הקצב שלך.', dailyAction: 'פעולה יומית', speakTitle: 'דברי עם Luna29', speakSub: 'הקישי להקלטה', quickAction: 'פעולה מהירה', quickTitle: 'check-in מהיר', quickSub: '30 שניות היום', rhythmTitle: 'הקצב שלך', rhythmSub: 'תמונה שקטה להיום.', cycle: 'מחזור', energy: 'אנרגיה', mood: 'מצב רוח', sleep: 'שינה', levelLow: 'נמוך', levelMedium: 'בינוני', levelHigh: 'גבוה', learning: 'לומדת', phaseSuffix: 'שלב', insightsTitle: 'תובנות Luna29', learnTitle: 'Luna29 לומדת עלייך.', learnSub: 'תגליות בקרוב.', patternTitle: 'תצוגה מקדימה של דפוסים', patternOneA: 'אנרגיה יורדת', patternOneB: 'יומיים לפני המחזור', patternTwoA: 'שינה < 6 ש', patternTwoB: 'משפיע על רגישות', disclaimer: 'הנחיה לצפייה בלבד. לא ייעוץ רפואי.', moreTools: 'עוד כלים' },};
  const dm = getLang(dailyMirrorCopyByLang, lang) || dailyMirrorCopyByLang.en;
  const todayMirrorCopyByLang: LangCopy< { open: string }> = {
    en: { open: 'Open Today' },
    ru: { open: 'Открыть Today' },
    uk: { open: 'Відкрити Today' },
    es: { open: 'Open Today' },
    fr: { open: 'Open Today' },
    de: { open: 'Open Today' },
    zh: { open: 'Open Today' },
    ja: { open: 'Open Today' },
    pt: { open: 'Open Today' },
  ar: { open: 'افتحي Today' },
  he: { open: 'פתחי Today' },};
  const todayMirrorCta = getLang(todayMirrorCopyByLang, lang) || todayMirrorCopyByLang.en;

  const profileName = useMemo(() => projectedState.profile?.name?.trim() || 'Anna', [projectedState]);

  const dayPart = useMemo(
    () => getMemberTimeGreeting(lang, new Date(tick)),
    [lang, tick],
  );

  const latestCheckin = useMemo(() => projectedState.lastCheckin?.metrics || null, [projectedState]);

  const levelLabel = (value: number | undefined) => {
    if (typeof value !== 'number') return dm.learning;
    if (value < 34) return dm.levelLow;
    if (value < 67) return dm.levelMedium;
    return dm.levelHigh;
  };

  const rhythmItems = [
    { label: dm.cycle, value: `Day ${projectedState.currentDay} · ${currentPhase} ${dm.phaseSuffix}` },
    { label: dm.energy, value: levelLabel(latestCheckin?.energy) },
    { label: dm.mood, value: levelLabel(latestCheckin?.mood) },
    { label: dm.sleep, value: levelLabel(latestCheckin?.sleep) },
  ];

  const insightLines = ruleOutput.insights.slice(0, 3).map((item) => item.text).filter(Boolean);
  const todayWithLunaCopyByLang: Partial<Record<
    Language,
    {
      title: string;
      slower: string;
      steadier: string;
      sleepShortWithPhase: (phase: string) => string;
      sleepSteadyWithPhase: (phase: string) => string;
      reflectionPressure: string;
      reflectionTired: string;
      reflectionCalm: string;
      reflectionGeneral: string;
    }
  >> = {
    en: {
      title: 'Today with Luna29',
      slower: 'Today may feel a little slower.',
      steadier: 'Today may feel a little steadier.',
      sleepShortWithPhase: (phase) => `Your sleep was shorter last night, and your body is in the ${phase} phase.`,
      sleepSteadyWithPhase: (phase) => `Your sleep looked steadier last night, and your body is in the ${phase} phase.`,
      reflectionPressure: 'You recently mentioned pressure, so a gentler pace may help today.',
      reflectionTired: 'You recently sounded tired, so a softer rhythm may feel better today.',
      reflectionCalm: 'You recently sounded calmer, and that can support a more balanced day.',
      reflectionGeneral: 'Take this day gently and notice what your body asks for.',
    },
    ru: {
      title: 'Сегодня с Luna29',
      slower: 'Сегодня день может ощущаться немного медленнее.',
      steadier: 'Сегодня день может ощущаться немного ровнее.',
      sleepShortWithPhase: (phase) => `Сон был короче прошлой ночью, и ваше тело сейчас в фазе ${phase}.`,
      sleepSteadyWithPhase: (phase) => `Сон был более ровным прошлой ночью, и ваше тело сейчас в фазе ${phase}.`,
      reflectionPressure: 'Вы недавно упоминали давление, поэтому сегодня может помочь более мягкий темп.',
      reflectionTired: 'Недавно вы звучали уставшей, поэтому сегодня может подойти более спокойный ритм.',
      reflectionCalm: 'Недавно вы звучали спокойнее, и это может поддержать более сбалансированный день.',
      reflectionGeneral: 'Проведите этот день бережно и замечайте, что просит ваше тело.',
    },
    uk: {
      title: 'Сьогодні з Luna29',
      slower: 'Сьогодні день може відчуватися трохи повільнішим.',
      steadier: 'Сьогодні день може відчуватися трохи рівнішим.',
      sleepShortWithPhase: (phase) => `Сон був коротшим минулої ночі, а ваше тіло зараз у фазі ${phase}.`,
      sleepSteadyWithPhase: (phase) => `Сон був рівнішим минулої ночі, а ваше тіло зараз у фазі ${phase}.`,
      reflectionPressure: 'Ви нещодавно згадували тиск, тож сьогодні може допомогти м’якший темп.',
      reflectionTired: 'Нещодавно ви звучали втомлено, тож сьогодні може підійти спокійніший ритм.',
      reflectionCalm: 'Нещодавно ви звучали спокійніше, і це може підтримати більш збалансований день.',
      reflectionGeneral: 'Проведіть цей день дбайливо й помічайте, чого просить ваше тіло.',
    },
    ar: {
      title: 'اليوم مع Luna29',
      slower: 'قد يشعر اليوم ببطء أكثر قليلاً.',
      steadier: 'قد يشعر اليوم بثبات أكثر قليلاً.',
      sleepShortWithPhase: (phase) => `نومك كان أقصر الليلة الماضية، وجسمك في مرحلة ${phase}.`,
      sleepSteadyWithPhase: (phase) => `نومك كان أكثر ثباتاً الليلة الماضية، وجسمك في مرحلة ${phase}.`,
      reflectionPressure: 'ذكرتِ مؤخراً ضغطاً، لذا قد يساعدك وتيرة أخف اليوم.',
      reflectionTired: 'بدوتِ متعبة مؤخراً، لذا قد يناسبك إيقاع ألطف اليوم.',
      reflectionCalm: 'بدوتِ أكثر هدوءاً مؤخراً، وهذا قد يدعم يوماً أكثر توازناً.',
      reflectionGeneral: 'عيشي هذا اليوم بلطف ولاحظي ما يطلبه جسمك.',
    },
    he: {
      title: 'היום עם Luna29',
      slower: 'היום עשוי להרגיש קצת יותר איטי.',
      steadier: 'היום עשוי להרגיש קצת יותר יציב.',
      sleepShortWithPhase: (phase) => `השינה שלך הייתה קצרה יותר בלילה, והגוף שלך בשלב ${phase}.`,
      sleepSteadyWithPhase: (phase) => `השינה שלך נראתה יציבה יותר בלילה, והגוף שלך בשלב ${phase}.`,
      reflectionPressure: 'הזכרת לאחרונה לחץ, אז קצב עדין יותר עשוי לעזור היום.',
      reflectionTired: 'נשמעת עייפה לאחרונה, אז קצב רך יותר עשוי להרגיש טוב יותר היום.',
      reflectionCalm: 'נשמעת רגועה יותר לאחרונה, וזה יכול לתמוך ביום מאוזן יותר.',
      reflectionGeneral: 'קחי את היום בעדינות ושימי לב למה שהגוף שלך מבקש.',
    },
  };
  const defaultTodayWithLuna = todayWithLunaCopyByLang.en!;
  const todayWithLuna = getLang(todayWithLunaCopyByLang, lang) || defaultTodayWithLuna;
  const latestVoiceReflectionText = useMemo(() => {
    const latestVoice = events
      .filter((event) => event.type === 'AUDIO_REFLECTION')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (!latestVoice) return '';
    const payload = latestVoice.payload as { text?: string };
    return (payload.text || '').toLowerCase();
  }, [events]);
  const todayWithLunaTopLine = useMemo(() => {
    const sleepScore = latestCheckin?.sleep ?? 50;
    if (sleepScore < 45 || currentPhase === CyclePhase.LUTEAL || currentPhase === CyclePhase.MENSTRUAL) {
      return todayWithLuna.slower;
    }
    return todayWithLuna.steadier;
  }, [currentPhase, latestCheckin?.sleep, todayWithLuna.slower, todayWithLuna.steadier]);
  const todayWithLunaSleepLine = useMemo(() => {
    const sleepScore = latestCheckin?.sleep ?? 50;
    const phase = currentPhase.toLowerCase();
    return sleepScore < 45 ? todayWithLuna.sleepShortWithPhase(phase) : todayWithLuna.sleepSteadyWithPhase(phase);
  }, [currentPhase, latestCheckin?.sleep, todayWithLuna]);
  const todayWithLunaReflectionLine = useMemo(() => {
    if (!latestVoiceReflectionText.trim()) return todayWithLuna.reflectionGeneral;
    if (/(work|office|deadline|meeting|job|pressure)/i.test(latestVoiceReflectionText)) return todayWithLuna.reflectionPressure;
    if (/(tired|drained|exhausted|sleep|insomnia|overwhelmed|stress)/i.test(latestVoiceReflectionText)) return todayWithLuna.reflectionTired;
    if (/(calm|steady|better|lighter|clear)/i.test(latestVoiceReflectionText)) return todayWithLuna.reflectionCalm;
    return todayWithLuna.reflectionGeneral;
  }, [latestVoiceReflectionText, todayWithLuna]);
  const latestReflectionEvent = useMemo(() => {
    const todayEvents = events
      .filter((event) => event.timestamp.startsWith(todayDateKey) && (event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return todayEvents[0] || null;
  }, [events, todayDateKey]);

  const resultHeard = useMemo(() => {
    if (!latestReflectionEvent) return '';
    if (latestReflectionEvent.type === 'AUDIO_REFLECTION') {
      const payload = latestReflectionEvent.payload as { text?: string };
      return buildEveningResponse(payload?.text || '');
    }
    const payload = latestReflectionEvent.payload as { metrics?: Record<string, number> };
    const mood = payload.metrics?.mood ?? 50;
    const energy = payload.metrics?.energy ?? 50;
    if (mood < 35) return 'The day felt a little sensitive emotionally.';
    if (energy < 35) return 'You seemed low on energy today.';
    return 'You checked in with a steady signal today.';
  }, [latestReflectionEvent]);

  const resultSuggestion = useMemo(() => {
    if (!latestReflectionEvent) return '';
    if (latestReflectionEvent.type === 'DAILY_CHECKIN') {
      const payload = latestReflectionEvent.payload as { metrics?: Record<string, number> };
      const sleep = payload.metrics?.sleep ?? 50;
      if (sleep < 45) return 'Tonight may feel better with a slower pace and earlier rest.';
      return 'A calm evening routine can help keep this balance tomorrow.';
    }
    return 'A softer evening may help your body settle after today.';
  }, [latestReflectionEvent]);

  const resultPattern = useMemo(() => {
    if (!latestReflectionEvent) return '';
    return getEveningPattern(events);
  }, [events, latestReflectionEvent]);

  const weeklyInsight = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const weekEvents = events.filter((event) => new Date(event.timestamp).getTime() >= weekStart.getTime());
    const reflections = weekEvents.filter((event) => event.type === 'AUDIO_REFLECTION').length;
    const checkins = weekEvents.filter((event) => event.type === 'DAILY_CHECKIN');
    if (reflections + checkins.length < 5) return '';
    if (reflections >= 3) return 'Evenings felt calmer on days when you reflected.';
    return 'Your week looked more steady when sleep was more consistent.';
  }, [events]);

  const recentStory = useMemo(() => {
    const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const nowStart = dayStart(new Date());
    const dayLabel = (iso: string) => {
      const diff = Math.floor((nowStart - dayStart(new Date(iso))) / 86400000);
      if (diff <= 0) return 'Today';
      if (diff === 1) return 'Yesterday';
      return `${diff} days ago`;
    };

    const voiceLine = (text?: string) => {
      const t = (text || '').toLowerCase();
      if (!t.trim()) return 'You took a quiet moment to reflect.';
      if (/(work|office|deadline|meeting|job|pressure)/i.test(t)) return 'Work felt demanding.';
      if (/(sleep|tired|drained|insomnia)/i.test(t)) return 'Sleep felt shorter.';
      if (/(calm|steady|lighter|better)/i.test(t)) return 'Energy felt calmer.';
      return 'You shared how the day felt.';
    };

    const checkinLine = (metrics?: Record<string, number>) => {
      const sleep = metrics?.sleep ?? 50;
      const energy = metrics?.energy ?? 50;
      if (sleep < 45) return 'Sleep felt shorter.';
      if (energy < 45) return 'Energy felt lower.';
      return 'Energy felt calmer.';
    };

    return events
      .filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4)
      .map((event) => {
        if (event.type === 'DAILY_CHECKIN') {
          const payload = event.payload as { metrics?: Record<string, number> };
          return { id: event.id, day: dayLabel(event.timestamp), text: checkinLine(payload.metrics) };
        }
        const payload = event.payload as { text?: string };
        return { id: event.id, day: dayLabel(event.timestamp), text: voiceLine(payload.text) };
      });
  }, [events]);

  return (
    <section className="relative overflow-hidden luna-page-shell luna-page-bodymap luna-page-focus luna-focus-bodymap space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-8 md:p-10 bg-[radial-gradient(130%_110%_at_10%_0%,rgba(255,255,255,0.66),rgba(245,240,252,0.5)_46%,rgba(240,236,248,0.42)_100%)] dark:bg-[radial-gradient(130%_110%_at_10%_0%,rgba(88,86,156,0.3),rgba(12,25,53,0.85)_46%,rgba(7,17,38,0.97)_100%)]">
      {needsRecovery && (
        <div
          data-testid="billing-recovery-banner"
          className="relative z-10 rounded-2xl border border-slate-300/80 dark:border-slate-600 bg-white/90 dark:bg-slate-900/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Payment needs attention. Update billing to keep premium access — your account stays open.
          </p>
          <button
            type="button"
            onClick={() => void openPortal()}
            className="px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest"
          >
            Update billing
          </button>
        </div>
      )}
      <div className="pointer-events-none absolute -top-20 -left-12 w-72 h-72 rounded-full bg-fuchsia-300/25 dark:bg-fuchsia-500/18 blur-[95px]" />
      <div className="pointer-events-none absolute top-[22rem] -right-16 w-80 h-80 rounded-full bg-indigo-300/24 dark:bg-indigo-500/18 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-32 left-1/3 w-72 h-72 rounded-full bg-rose-200/26 dark:bg-rose-500/16 blur-[100px]" />
      <div className="pointer-events-none absolute top-[44%] left-[36%] w-96 h-96 rounded-full bg-violet-300/18 dark:bg-violet-500/14 blur-[130px]" />
      <div className="space-y-10">
        <article className="relative min-h-[56vh] rounded-[2.8rem] border border-white/45 dark:border-[#3d5a89] bg-[radial-gradient(120%_90%_at_8%_0%,rgba(255,220,240,0.42),transparent_44%),radial-gradient(98%_80%_at_94%_10%,rgba(204,188,255,0.3),transparent_48%),linear-gradient(135deg,#fdf5fb_0%,#f6f1fd_50%,#eef2ff_100%)] dark:bg-[radial-gradient(120%_90%_at_8%_0%,rgba(186,105,180,0.28),transparent_44%),radial-gradient(98%_80%_at_94%_10%,rgba(102,123,210,0.28),transparent_48%),linear-gradient(135deg,#0b1836_0%,#112348_50%,#16315f_100%)] p-8 md:p-10 shadow-luna-rich backdrop-blur-[1px] flex flex-col justify-center">
          <div className="pointer-events-none absolute inset-0 rounded-[2.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_22%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%)]" />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/65 dark:border-white/15 bg-white/65 dark:bg-slate-900/45 px-3 py-1.5 shadow-[0_8px_20px_rgba(145,111,188,0.16)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-violet-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">{dm.reflectionTitle}</p>
          </div>
          <p
            className="mt-3 font-brand animate-color-shift-luna text-5xl md:text-6xl leading-[0.95] drop-shadow-[0_1px_0_rgba(255,255,255,0.45)] dark:drop-shadow-[0_1px_0_rgba(10,20,40,0.6)]"
          >
            {dayPart}, {profileName}
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{dm.reflectionTitle}</h1>
          <p className="mt-3 text-base font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
            {dm.reflectionSub}
          </p>
          <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <article className="lg:col-span-2 text-left rounded-[2rem] border border-luna-purple/35 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(250,242,255,0.88)_46%,rgba(244,236,255,0.84)_100%)] dark:bg-[linear-gradient(145deg,rgba(12,30,66,0.95),rgba(20,44,86,0.9)_46%,rgba(28,50,96,0.86)_100%)] p-7 shadow-luna-rich hover:shadow-luna-deep hover:-translate-y-[1px] transition-all relative overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-fuchsia-300/35 dark:bg-fuchsia-500/22 blur-3xl" />
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-luna-purple/15 text-luna-purple">
                <Mic size={18} />
              </div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{dm.dailyAction}</p>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{dm.speakTitle}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{dm.speakSub}</p>
              <div className="mt-5 flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setShowLive(true)}
                  className="luna-soft-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/70 dark:border-[#94a8d0]/35 bg-gradient-to-r from-[#8f51de] via-[#c455a6] to-[#7a5ef6] dark:from-[#4f5f8a] dark:via-[#4b5f89] dark:to-[#43638a] text-white text-[11px] font-black uppercase tracking-[0.14em] shadow-[0_14px_34px_rgba(121,79,189,0.45)] dark:shadow-[0_14px_28px_rgba(18,33,67,0.45)] hover:shadow-[0_22px_42px_rgba(121,79,189,0.58)] dark:hover:shadow-[0_20px_36px_rgba(18,33,67,0.58)] hover:-translate-y-[1px] transition-all"
                >
                  <Mic size={14} /> {eveningCopy.speak}
                </button>
              </div>
            </article>
            <button
              data-testid="dashboard-checkin-start"
              onClick={() => setShowSyncOverlay(true)}
              className="luna-soft-glow text-left rounded-[2rem] border border-slate-200/90 dark:border-[#3b5c8d] bg-[linear-gradient(150deg,rgba(255,255,255,0.9),rgba(244,246,255,0.84)_48%,rgba(236,243,255,0.78)_100%)] dark:bg-[linear-gradient(150deg,rgba(12,30,66,0.86),rgba(20,48,90,0.8)_48%,rgba(21,54,93,0.74)_100%)] p-6 shadow-luna-rich hover:shadow-luna-deep hover:-translate-y-[1px] transition-all"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-200">
                <Activity size={16} />
              </div>
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{dm.quickAction}</p>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{dm.quickTitle}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{dm.quickSub}</p>
            </button>
          </div>

          <article className="mt-5 max-w-3xl rounded-[1.8rem] border border-luna-purple/25 bg-[linear-gradient(150deg,rgba(255,255,255,0.9),rgba(250,241,255,0.8)_48%,rgba(242,239,255,0.72)_100%)] dark:bg-[linear-gradient(150deg,rgba(13,35,72,0.82),rgba(25,54,100,0.72)_48%,rgba(24,51,95,0.64)_100%)] p-5 text-left shadow-[0_14px_34px_rgba(116,82,181,0.2)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{todayWithLuna.title}</p>
            <p className="mt-2 text-base font-semibold text-slate-800 dark:text-slate-100">{todayWithLunaTopLine}</p>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{todayWithLunaSleepLine}</p>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{todayWithLunaReflectionLine}</p>
            <div className="mt-4">
              <button
                onClick={() => navigateTo('today_mirror')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luna-purple/16 hover:bg-luna-purple/28 text-luna-purple text-[10px] font-black uppercase tracking-[0.14em] transition-all border border-luna-purple/25"
              >
                {todayMirrorCta.open}
              </button>
            </div>
          </article>

          <article className="mt-5 rounded-[2rem] border border-luna-purple/30 bg-[radial-gradient(110%_120%_at_10%_0%,rgba(255,224,241,0.42),transparent_46%),radial-gradient(95%_95%_at_90%_100%,rgba(199,188,255,0.28),transparent_55%),linear-gradient(140deg,#fff8fded_0%,#f8f1ffde_52%,#f2effadb_100%)] dark:bg-[radial-gradient(110%_120%_at_10%_0%,rgba(172,95,165,0.24),transparent_46%),radial-gradient(95%_95%_at_90%_100%,rgba(111,119,210,0.22),transparent_55%),linear-gradient(140deg,#10244af0_0%,#152b54ea_52%,#1a3665e2_100%)] p-6 text-left shadow-luna-rich max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Evening Reflection</p>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">{eveningCopy.title}</p>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{eveningQuestion}</p>
            <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowLive(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-luna-purple/28 bg-luna-purple/16 hover:bg-luna-purple/28 text-luna-purple text-[11px] font-black uppercase tracking-[0.14em] shadow-[0_10px_22px_rgba(121,79,189,0.22)] transition-all"
                >
                  <Mic size={14} /> {eveningCopy.speak}
                </button>
              <button
                onClick={() => {
                  setEveningWriteOpen((prev) => !prev);
                  setEveningStatus('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase tracking-[0.14em] transition-all hover:bg-white"
              >
                <PenLine size={14} /> {eveningCopy.write}
              </button>
              <button
                onClick={handleEveningSkip}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase tracking-[0.14em] transition-all hover:bg-slate-300/70 dark:hover:bg-slate-700/70"
              >
                <SkipForward size={14} /> {eveningCopy.skip}
              </button>
            </div>
            {eveningWriteOpen && (
              <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/60 p-4">
                <textarea
                  value={eveningText}
                  onChange={(e) => setEveningText(e.target.value)}
                  placeholder={eveningCopy.writePlaceholder}
                  className="w-full min-h-[94px] resize-none rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none"
                />
                <button
                  onClick={handleEveningSave}
                  disabled={!eveningText.trim()}
                  className="mt-3 px-4 py-2 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
                >
                  {eveningCopy.save}
                </button>
              </div>
            )}
          </article>

          {latestReflectionEvent && (
            <article className="mt-6 rounded-[1.8rem] border border-luna-purple/25 bg-[linear-gradient(150deg,rgba(255,255,255,0.9),rgba(250,243,255,0.78)_48%,rgba(245,241,255,0.72)_100%)] dark:bg-[linear-gradient(150deg,rgba(13,35,72,0.82),rgba(24,51,96,0.7)_48%,rgba(23,46,90,0.64)_100%)] p-5 space-y-4 shadow-[0_14px_34px_rgba(109,78,175,0.2)]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Here is your reflection</p>
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">What Luna29 heard</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{resultHeard}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">What may help tonight</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{resultSuggestion}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">Something Luna29 is starting to notice</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{resultPattern}</p>
              </div>
              {canUsePaidInsights ? (
                <>
                  {weeklyInsight ? (
                    <div className="space-y-2">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100">{paywallCopy.featureMonthly}</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{weeklyInsight}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100">{dm.learnTitle}</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Complete a few check-ins so Luna29 can reflect patterns from your own information.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={openSoftPaywall}
                  className="w-full text-left rounded-2xl border border-luna-purple/30 bg-luna-purple/5 dark:bg-luna-purple/10 p-4 hover:bg-luna-purple/10 transition-colors"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">{paywallCopy.locked}</p>
                  <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">{paywallCopy.featureVoice}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{paywallCopy.inPlan}</p>
                </button>
              )}
              {eveningStatus && <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{eveningStatus}</p>}
            </article>
          )}

          <article className="mt-6 max-w-3xl rounded-[1.8rem] border border-slate-200/80 dark:border-[#3b5d8f] bg-[linear-gradient(150deg,rgba(255,255,255,0.92),rgba(248,248,255,0.8)_48%,rgba(242,245,255,0.76)_100%)] dark:bg-[linear-gradient(150deg,rgba(8,26,61,0.95),rgba(18,43,82,0.9)_48%,rgba(22,47,88,0.82)_100%)] p-5 shadow-luna-rich">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">Your story with Luna29</p>
            {(canUsePaidInsights ? recentStory : recentStory.slice(0, 2)).length > 0 ? (
              <div className="mt-3 space-y-3">
                {(canUsePaidInsights ? recentStory : recentStory.slice(0, 2)).map((entry) => (
                  <div key={entry.id} className="rounded-xl bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(246,241,255,0.72))] dark:bg-[linear-gradient(145deg,rgba(12,35,72,0.95),rgba(19,44,84,0.9))] p-3 border border-white/45 dark:border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{entry.day}</p>
                    <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{entry.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">Your story with Luna29 is just beginning.</p>
            )}
            {!canUsePaidInsights && recentStory.length > 2 && (
              <button
                onClick={openSoftPaywall}
                className="mt-4 w-full text-left rounded-xl border border-luna-purple/30 bg-luna-purple/5 dark:bg-luna-purple/10 p-3 hover:bg-luna-purple/10 transition-colors"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">{paywallCopy.locked}</p>
                <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">{paywallCopy.featureHistory}</p>
              </button>
            )}
          </article>
        </article>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 rounded-[2.5rem] border border-slate-200/80 dark:border-[#3b5d8f] bg-[linear-gradient(150deg,rgba(255,255,255,0.92),rgba(246,246,255,0.82)_48%,rgba(241,246,255,0.78)_100%)] dark:bg-[linear-gradient(150deg,rgba(8,26,61,0.95),rgba(18,43,82,0.9)_48%,rgba(23,49,91,0.84)_100%)] p-7 shadow-luna-rich space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{dm.rhythmTitle}</p>
              <p className="mt-2 text-lg font-semibold text-slate-600 dark:text-slate-300">{dm.rhythmSub}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {rhythmItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/55 dark:border-white/10 bg-gradient-to-br from-[#ffffffde] via-[#faf3ffdd] to-[#f1eeffd8] dark:from-[#0c2348] dark:via-[#13315a] dark:to-[#183b66] p-3 shadow-[0_10px_22px_rgba(109,78,175,0.16)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {isNarrativeLoading ? ui.dashboard.thinking : stateNarrative || ui.dashboard.balanced}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{dm.insightsTitle}</p>
            {insightLines.length > 0 ? (
              <ul className="space-y-3">
                {insightLines.map((line, index) => (
                  <li key={`${line.slice(0, 22)}-${index}`} className="rounded-2xl border border-white/55 dark:border-white/10 bg-gradient-to-br from-[#ffffffd9] to-[#f2f0ffd4] dark:from-[#0c2348] dark:to-[#16355f] p-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-white/55 dark:border-white/10 bg-gradient-to-br from-[#ffffffd9] to-[#f2f0ffd4] dark:from-[#0c2348] dark:to-[#16355f] p-5">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{dm.learnTitle}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{dm.learnSub}</p>
              </div>
            )}
          </article>
          <article className="rounded-[2.5rem] border border-slate-200/80 dark:border-[#3b5d8f] bg-[linear-gradient(150deg,rgba(255,255,255,0.92),rgba(246,246,255,0.82)_48%,rgba(241,246,255,0.78)_100%)] dark:bg-[linear-gradient(150deg,rgba(8,26,61,0.95),rgba(18,43,82,0.9)_48%,rgba(23,49,91,0.84)_100%)] p-7 shadow-luna-rich space-y-4">
            <div className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-luna-purple" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{dm.patternTitle}</p>
            </div>
            {canUsePaidInsights && insightLines.length > 0 ? (
              <>
                {insightLines.slice(0, 2).map((line, index) => (
                  <article
                    key={`pattern-${index}`}
                    className="rounded-2xl border border-white/55 dark:border-white/10 bg-gradient-to-br from-[#ffffffde] via-[#fbf3ffdd] to-[#f2efffd8] dark:from-[#0c2348] dark:via-[#13315a] dark:to-[#183b66] p-4"
                  >
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{line}</p>
                  </article>
                ))}
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{dm.disclaimer}</p>
              </>
            ) : canUsePaidInsights ? (
              <div className="rounded-2xl border border-white/55 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 p-4">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{dm.learnTitle}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{dm.learnSub}</p>
              </div>
            ) : (
              <button
                onClick={openSoftPaywall}
                className="w-full text-left rounded-2xl border border-luna-purple/30 bg-luna-purple/5 dark:bg-luna-purple/10 p-4 hover:bg-luna-purple/10 transition-colors"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">{paywallCopy.locked}</p>
                <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">{paywallCopy.featurePattern}</p>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{paywallCopy.inPlan}</p>
              </button>
            )}
          </article>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{dm.moreTools}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 opacity-90">
        <article className="lg:col-span-8">
          <FuelCompass phase={currentPhase} lang={lang} />
        </article>
        <div className="lg:col-span-4 space-y-10">
          <aside className="p-10 bg-slate-950 text-white dark:bg-[#081a3d] rounded-[4rem] flex flex-col justify-center shadow-luna-deep border border-slate-800 dark:border-[#2a4670] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:scale-110 transition-transform">💡</div>
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 mb-6">{ui.dashboard.insight}</p>
            <p className="text-xl font-bold italic leading-relaxed text-slate-100 z-10">
              {ruleOutput.archetype ? ruleOutput.archetype.description : ui.dashboard.baselineInsight}
            </p>
          </aside>

          <aside className="p-10 bg-white dark:bg-[#081a3d] rounded-[4rem] border-2 border-slate-200 dark:border-[#2a4670] shadow-luna-rich relative overflow-hidden group">
            <div className="absolute -bottom-4 -right-4 p-8 opacity-5 text-8xl group-hover:scale-110 transition-transform">🌿</div>
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] text-luna-purple mb-6">{ui.dashboard.dailyTip}</p>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
              {ui.dashboard.hydrateTip}
            </p>
            <button onClick={() => navigateTo('library')} className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-colors">{ui.dashboard.learnWhy}</button>
          </aside>

          <aside className="p-8 bg-gradient-to-br from-[#f6ebf7]/90 to-[#e7edf9]/90 dark:from-[#081a3d]/96 dark:to-[#0e2a55]/94 rounded-[3rem] border border-slate-200/80 dark:border-[#2a4670] shadow-luna-rich space-y-4">
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] text-luna-purple">{retentionCopy.title}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/75 dark:bg-[#0b1d40]/92 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{retentionCopy.streak}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{streakDays}</p>
              </div>
              <div className="rounded-2xl bg-white/75 dark:bg-[#0b1d40]/92 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{retentionCopy.checkins}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{weekly.checkins}</p>
              </div>
              <div className="rounded-2xl bg-white/75 dark:bg-[#0b1d40]/92 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{retentionCopy.voiceNotes}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{weekly.voiceNotes}</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {retentionCopy.thisWeek}: {weekly.activeDays} {retentionCopy.activeDays}
            </p>
            {weekly.activeDays === 0 && (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{retentionCopy.noData}</p>
            )}
          </aside>

          <aside className="p-8 bg-white dark:bg-[#081a3d] rounded-[3rem] border border-slate-200/80 dark:border-[#2a4670] shadow-luna-rich space-y-4">
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] text-luna-purple">{retentionCopy.reminderTitle}</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{gentleReminderMessage}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReminderEnabled((prev) => !prev)}
                className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${
                  reminderEnabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {reminderEnabled ? retentionCopy.reminderOn : retentionCopy.reminderOff}
              </button>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{retentionCopy.time}</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2 py-1 rounded-xl border border-slate-200 dark:border-[#2a4670] bg-white dark:bg-[#0b1d40] text-xs font-black text-slate-700 dark:text-slate-200"
              />
              <button
                onClick={saveReminder}
                className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-luna-purple/15 text-luna-purple"
              >
                {retentionCopy.save}
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {retentionCopy.nextReminder}: {nextReminderLabel}
            </p>
            {isReminderDueNow && (
              <div className="rounded-2xl border border-amber-300/70 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-amber-700 dark:text-amber-300">{retentionCopy.dueNow}</p>
                  <p className="text-xs font-semibold text-amber-700/90 dark:text-amber-200/90">{gentleReminderMessage}</p>
                </div>
                <button
                  onClick={() => setShowSyncOverlay(true)}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-amber-200 text-amber-800 dark:bg-amber-700/40 dark:text-amber-200"
                >
                  {retentionCopy.startNow}
                </button>
              </div>
            )}
            {'Notification' in window && (
              <div className="flex flex-wrap items-center gap-2">
                {Notification.permission !== 'granted' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                  >
                    {retentionCopy.notifyEnable}
                  </button>
                )}
                {Notification.permission === 'granted' && (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-300">{retentionCopy.notifyGranted}</span>
                    <button
                      onClick={sendTestNotification}
                      className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    >
                      {retentionCopy.testNow}
                    </button>
                  </>
                )}
                {Notification.permission === 'denied' && (
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-500">{retentionCopy.notifyBlocked}</span>
                )}
              </div>
            )}
          </aside>

          <aside className="p-8 bg-white dark:bg-[#081a3d] rounded-[3rem] border border-slate-200/80 dark:border-[#2a4670] shadow-luna-rich space-y-4">
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.12em] text-luna-purple">{billingCopy.title}</p>
            {billingLoading ? (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{billingCopy.loading}</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-100/80 dark:bg-[#0b1d40]/92 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{billingCopy.status}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {billing.status === 'active' ? billingCopy.active : billingCopy.inactive}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-100/80 dark:bg-[#0b1d40]/92 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{billingCopy.plan}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{billing.plan || '-'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => startCheckout('month')}
                    disabled={!billingEnabled}
                    className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-luna-purple/15 text-luna-purple disabled:opacity-50"
                  >
                    {billingCopy.monthly}
                  </button>
                  <button
                    onClick={() => startCheckout('year')}
                    disabled={!billingEnabled}
                    className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-luna-purple/15 text-luna-purple disabled:opacity-50"
                  >
                    {billingCopy.yearly}
                  </button>
                  <button
                    onClick={openPortal}
                    disabled={!billingEnabled}
                    className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
                  >
                    {billingCopy.manage}
                  </button>
                </div>
                {!billingEnabled && (
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{billingCopy.unavailable}</p>
                )}
                {billingFeedback && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">{billingFeedback}</p>
                )}
              </>
            )}
          </aside>
        </div>
      </div>

      <div className="space-y-12 bg-[linear-gradient(145deg,rgba(255,255,255,0.54),rgba(245,240,252,0.42))] dark:bg-[linear-gradient(145deg,rgba(7,21,47,0.94),rgba(10,28,58,0.92))] p-10 rounded-[4rem] border-2 border-slate-300/80 dark:border-[#355483] shadow-luna-inset">
        <div className="rounded-[2rem] border border-luna-purple/30 bg-gradient-to-r from-luna-purple/10 via-luna-coral/10 to-luna-teal/10 p-5 md:p-6 mb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] md:text-xs font-black uppercase tracking-[0.16em] text-luna-purple">Explore Knowledge</p>
              <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">
                Open the hormone library to understand why this marker matters, what influences it, and what to discuss with your doctor.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                data-testid="dashboard-explore-knowledge-btn"
                onClick={() => navigateTo('library')}
                className="px-5 py-2.5 rounded-full bg-luna-purple text-white text-[9px] font-black uppercase tracking-[0.12em] shadow-luna-rich hover:brightness-110 transition-all"
              >
                {ui.dashboard.exploreKnowledge}
              </button>
              <button
                data-testid="dashboard-open-reports-btn"
                onClick={() => navigateTo('labs')}
                className="px-5 py-2.5 rounded-full border border-luna-purple/40 text-luna-purple bg-white/80 dark:bg-slate-900/70 text-[9px] font-black uppercase tracking-[0.12em] hover:bg-luna-purple/10 transition-all"
              >
                {chrome.healthReportsTitle}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end border-b border-slate-300 dark:border-slate-800 pb-8">
          <h3 className="text-sm md:text-base font-black uppercase tracking-[0.28em] text-slate-600 dark:text-slate-500">{ui.dashboard.bodyMap}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {hormoneData.map((h) => <HormoneGauge key={h.id} hormone={h} onClick={setSelectedHormone} />)}
        </div>
      </div>

      <HormoneTestingGuide lang={lang} />
    </section>
  );
};
