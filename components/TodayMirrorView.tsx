import React, { useEffect, useMemo, useRef } from 'react';
import { Mic, Share2 } from 'lucide-react';
import { Language, LangCopy, getLang } from '../constants';
import { CyclePhase, HealthEvent, SystemState } from '../types';
import { shareTextSafely } from '../utils/share';
import { useTimeOfDayTick } from '../hooks/useTimeOfDayTick';
import { getMemberTimeGreeting } from '../utils/timeOfDayGreeting';
import { useTodayIntelligence } from '../hooks/useTodayIntelligence';
import { trackEvent } from '../services/analyticsService';
import { confirmSignal, rejectSignal } from '../services/observationSignalsService';
import {
  buildContinuityCopy,
  resolveTodayState,
  type TodayMeaningfulEvent,
} from '../utils/todayState';
import {
  resolveLiveContinuityCard,
  type LiveCloseSummary,
} from '../utils/liveSessionContinuity';
import {
  buildReviewContinuityLine,
  dailyReviewQuotaExhausted,
  markSignalHandledToday,
  readTodayReviewDayState,
  selectDailyReviewSignals,
  toDailyReviewDisplayItem,
  type TodayReviewDayState,
} from '../utils/todayDailyReview';
import { resolveTodayPatternExperience } from '../utils/todayPatternExperience';
import { HealthProfileTodayPrompt } from './HealthProfileTodayPrompt';

interface TodayMirrorViewProps {
  lang: Language;
  currentPhase: CyclePhase;
  systemState: SystemState;
  events: HealthEvent[];
  onSpeak: () => void;
  onQuickCheckin: () => void;
  onOpenMyDay: () => void;
  onOpenMonthly: () => void;
  /** Optional path to Memory settings (Profile). */
  onOpenMemory?: () => void;
  liveCloseSummary?: LiveCloseSummary | null;
  liveRefreshToken?: number;
  onContinueLiveConversation?: () => void;
  onDismissLiveContinuity?: () => void;
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
  onOpenMemory,
  liveCloseSummary = null,
  liveRefreshToken = 0,
  onContinueLiveConversation,
  onDismissLiveContinuity,
}) => {
  const [partnerStatus, setPartnerStatus] = React.useState('');
  const [reviewBusyId, setReviewBusyId] = React.useState<string | null>(null);
  const [reviewDayState, setReviewDayState] = React.useState<TodayReviewDayState>(() =>
    readTodayReviewDayState(),
  );
  const [confirmedTodayCount, setConfirmedTodayCount] = React.useState(0);
  const [reviewCaughtUp, setReviewCaughtUp] = React.useState(false);
  const viewedRef = useRef(false);
  const continuityTrackedRef = useRef(false);
  const reviewCardTrackedRef = useRef(false);
  const patternTrackedRef = useRef(false);
  const liveCardTrackedRef = useRef(false);

  const { intelligence, refresh: refreshIntelligence } = useTodayIntelligence(true, liveRefreshToken);
  type TodayMirrorCopy = {
    todayReflection: string;
    title: string;
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
    openMyDay: string;
    dayLabelToday: string;
    dayLabelYesterday: string;
    daysAgo: (days: number) => string;
    dayWord: string;
    phaseWord: string;
    sleepUnset: string;
    continuityTitle: string;
  };
  const copyByLang: LangCopy<TodayMirrorCopy> = {
    en: {
      todayReflection: "Today's note",
      title: 'Today with Luna29',
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
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      continuityTitle: 'Continuity',
    },
    ru: {
      todayReflection: 'Сегодняшняя заметка',
      title: 'Сегодня с Luna29',
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
      openMyDay: 'Открыть My Day with Luna29',
      dayLabelToday: 'Сегодня',
      dayLabelYesterday: 'Вчера',
      daysAgo: (days) => `${days} дн. назад`,
      dayWord: 'День',
      phaseWord: 'фаза',
      sleepUnset: 'Нет данных',
      continuityTitle: 'Связь дней',
    },
    uk: {
      todayReflection: 'Сьогоднішня нотатка',
      title: 'Сьогодні з Luna29',
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
      openMyDay: 'Відкрити My Day with Luna29',
      dayLabelToday: 'Сьогодні',
      dayLabelYesterday: 'Вчора',
      daysAgo: (days) => `${days} дн. тому`,
      dayWord: 'День',
      phaseWord: 'фаза',
      sleepUnset: 'Немає даних',
      continuityTitle: 'Звʼязок днів',
    },
    es: {
      todayReflection: "Today's note",
      title: 'Today with Luna29',
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
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      continuityTitle: 'Continuity',
    },
    fr: {
      todayReflection: "Today's note",
      title: 'Today with Luna29',
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
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      continuityTitle: 'Continuity',
    },
    de: {
      todayReflection: "Today's note",
      title: 'Today with Luna29',
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
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      continuityTitle: 'Continuity',
    },
    zh: {
      todayReflection: "Today's note",
      title: 'Today with Luna29',
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
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      continuityTitle: 'Continuity',
    },
    ja: {
      todayReflection: "Today's note",
      title: 'Today with Luna29',
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
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      continuityTitle: 'Continuity',
    },
    pt: {
      todayReflection: "Today's note",
      title: 'Today with Luna29',
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
      openMyDay: 'Open My Day with Luna29',
      dayLabelToday: 'Today',
      dayLabelYesterday: 'Yesterday',
      daysAgo: (days) => `${days} days ago`,
      dayWord: 'Day',
      phaseWord: 'phase',
      sleepUnset: 'Not set',
      continuityTitle: 'Continuity',
    },
  ar: {
      todayReflection: 'ملاحظة اليوم',
      title: 'اليوم مع Luna29',
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
      openMyDay: 'افتحي يومي مع Luna29',
      dayLabelToday: 'اليوم',
      dayLabelYesterday: 'أمس',
      daysAgo: (days) => `منذ ${days} أيام`,
      dayWord: 'يوم',
      phaseWord: 'مرحلة',
      sleepUnset: 'غير محدّد',
      continuityTitle: 'الاستمرارية',
    },
  he: {
      todayReflection: 'הערת היום',
      title: 'היום עם Luna29',
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
      openMyDay: 'פתחי את היום שלי עם Luna29',
      dayLabelToday: 'היום',
      dayLabelYesterday: 'אתמול',
      daysAgo: (days) => `לפני ${days} ימים`,
      dayWord: 'יום',
      phaseWord: 'שלב',
      sleepUnset: 'לא הוגדר',
      continuityTitle: 'רצף',
    },};
  const copy = getLang(copyByLang, lang) || copyByLang.en;
  const timeTick = useTimeOfDayTick();

  const greeting = useMemo(
    () => getMemberTimeGreeting(lang, new Date(timeTick)),
    [lang, timeTick],
  );

  const profileName = systemState.profile?.name?.trim() || 'Anna';
  const sleepValue = systemState.lastCheckin?.metrics?.sleep;
  const energyValue = systemState.lastCheckin?.metrics?.energy;
  const sleepMinutes = typeof sleepValue === 'number' ? 240 + Math.round((Math.max(0, Math.min(100, sleepValue)) / 100) * 300) : null;
  const sleepText = sleepMinutes ? `${Math.floor(sleepMinutes / 60)}h ${String(sleepMinutes % 60).padStart(2, '0')}m` : null;
  const hasEnergyMetric = typeof energyValue === 'number';
  const energyLabel = hasEnergyMetric
    ? energyValue >= 50
      ? copy.steady
      : copy.lowerThanUsual
    : null;
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

  const localMeaningful: TodayMeaningfulEvent[] = useMemo(
    () =>
      events
        .filter((event) => event.type === 'AUDIO_REFLECTION' || event.type === 'DAILY_CHECKIN')
        .map((event) => ({ type: event.type, timestamp: event.timestamp })),
    [events],
  );

  const todayResolved = useMemo(
    () =>
      resolveTodayState({
        localEvents: localMeaningful,
        memoryStatus: intelligence.memoryStatus,
        unreviewedCount: intelligence.unreviewedCount,
        possiblePatterns: intelligence.possiblePatterns,
        confirmedPatterns: intelligence.confirmedPatterns,
      }),
    [localMeaningful, intelligence],
  );

  const continuity = useMemo(
    () =>
      buildContinuityCopy({
        state: todayResolved.state,
        memoryStatus: todayResolved.memoryStatus,
        hasLocalHistory: todayResolved.hasLocalHistory,
        lastActivityAt: todayResolved.lastActivityAt,
        lastActivityDayRelation: todayResolved.lastActivityDayRelation,
        daysSinceLastActivity: todayResolved.daysSinceLastActivity,
        confirmedPattern: todayResolved.confirmedPattern,
        possiblePattern: todayResolved.possiblePattern,
      }),
    [todayResolved],
  );

  const safeAnalyticsProps = useMemo(
    () => ({
      surface: 'today' as const,
      state: todayResolved.state,
      memory_status: todayResolved.memoryStatus,
      pattern_status: todayResolved.patternStatus,
      has_history: todayResolved.hasLocalHistory,
    }),
    [todayResolved],
  );

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackEvent('today_viewed', { ...safeAnalyticsProps, action: 'view', result: 'ok' });
  }, [safeAnalyticsProps]);

  useEffect(() => {
    if (!continuity.shown || continuityTrackedRef.current) return;
    if (!intelligence.settled && intelligence.memoryStatus === 'unknown') return;
    continuityTrackedRef.current = true;
    trackEvent('today_continuity_shown', { ...safeAnalyticsProps, action: 'continuity', result: 'ok' });
  }, [continuity.shown, intelligence.settled, intelligence.memoryStatus, safeAnalyticsProps]);

  const patternExperience = useMemo(
    () =>
      resolveTodayPatternExperience({
        confirmedPatterns: intelligence.confirmedPatterns,
        possiblePatterns: intelligence.possiblePatterns,
      }),
    [intelligence.confirmedPatterns, intelligence.possiblePatterns],
  );

  // Show after intelligence settles. "No patterns yet" only when the list succeeded (never invent).
  const showPatternExperienceCard =
    intelligence.settled &&
    (patternExperience.kind !== 'none' || intelligence.patternsAvailable);

  useEffect(() => {
    if (!showPatternExperienceCard || patternTrackedRef.current) return;
    patternTrackedRef.current = true;
    trackEvent('today_pattern_seen', {
      ...safeAnalyticsProps,
      action: 'pattern',
      result: patternExperience.kind,
    });
  }, [showPatternExperienceCard, patternExperience.kind, safeAnalyticsProps]);

  const handlePatternOpen = () => {
    trackEvent('today_pattern_opened', {
      ...safeAnalyticsProps,
      action: 'pattern_open',
      result: patternExperience.kind,
    });
    onOpenMemory?.();
  };

  const handlePrimaryAction = () => {
    trackEvent('today_primary_action_started', {
      ...safeAnalyticsProps,
      action: 'quick_checkin',
      result: 'started',
    });
    onQuickCheckin();
    trackEvent('today_primary_action_completed', {
      ...safeAnalyticsProps,
      action: 'quick_checkin',
      result: 'opened',
    });
  };

  const liveContinuityCard = useMemo(() => {
    if (!liveCloseSummary || liveCloseSummary.userTurnCount < 1) return null;
    return resolveLiveContinuityCard({
      userTurnCount: liveCloseSummary.userTurnCount,
      memoryWriteStatus: liveCloseSummary.memoryWriteStatus,
      unreviewedCount: intelligence.unreviewedCount,
      possiblePatternTitle: todayResolved.possiblePattern?.title ?? null,
      confirmedPatternTitle: todayResolved.confirmedPattern?.title ?? null,
      memoryStatus: todayResolved.memoryStatus,
    });
  }, [liveCloseSummary, intelligence.unreviewedCount, todayResolved]);

  useEffect(() => {
    if (!liveContinuityCard || liveCardTrackedRef.current) return;
    liveCardTrackedRef.current = true;
    trackEvent('continuity_card_shown', {
      surface: 'today',
      action: 'live_continuity',
      result: 'ok',
      state: liveContinuityCard.kind,
      memory_status: todayResolved.memoryStatus,
      pattern_status: todayResolved.patternStatus,
      has_history: true,
    });
  }, [liveContinuityCard, todayResolved.memoryStatus, todayResolved.patternStatus]);

  useEffect(() => {
    liveCardTrackedRef.current = false;
  }, [liveCloseSummary]);

  const dailyReviewSignals = useMemo(
    () => selectDailyReviewSignals(intelligence.unreviewedSignals, reviewDayState),
    [intelligence.unreviewedSignals, reviewDayState],
  );

  const dailyReviewItems = useMemo(
    () => dailyReviewSignals.map((s) => toDailyReviewDisplayItem(s)),
    [dailyReviewSignals],
  );

  // Today review is Memory-ON only. off / unknown / unavailable → never show.
  const memoryReviewAllowed = todayResolved.memoryStatus === 'on';
  const quotaExhaustedToday = dailyReviewQuotaExhausted(reviewDayState);

  const showDailyReviewCard =
    memoryReviewAllowed &&
    !reviewCaughtUp &&
    !quotaExhaustedToday &&
    dailyReviewItems.length > 0 &&
    intelligence.unreviewedCount > 0;

  // New selectable signals after refresh (e.g. Live) reopen Today review when quota remains.
  useEffect(() => {
    if (!reviewCaughtUp) return;
    if (!memoryReviewAllowed) return;
    if (quotaExhaustedToday) return;
    if (dailyReviewSignals.length > 0 && intelligence.unreviewedCount > 0) {
      setReviewCaughtUp(false);
    }
  }, [
    reviewCaughtUp,
    memoryReviewAllowed,
    quotaExhaustedToday,
    dailyReviewSignals.length,
    intelligence.unreviewedCount,
  ]);

  useEffect(() => {
    if (!showDailyReviewCard || reviewCardTrackedRef.current) return;
    reviewCardTrackedRef.current = true;
    trackEvent('review_card_shown', {
      ...safeAnalyticsProps,
      action: 'review_card',
      result: 'ok',
    });
  }, [showDailyReviewCard, safeAnalyticsProps]);

  useEffect(() => {
    reviewCardTrackedRef.current = false;
  }, [reviewDayState.dayKey]);

  const finishReviewIfEmpty = (nextState: TodayReviewDayState, remainingUnreviewed: number) => {
    const nextVisible = selectDailyReviewSignals(intelligence.unreviewedSignals, nextState);
    if (nextVisible.length === 0 || dailyReviewQuotaExhausted(nextState) || remainingUnreviewed <= 0) {
      setReviewCaughtUp(true);
      trackEvent('review_completed', {
        ...safeAnalyticsProps,
        action: 'review_complete',
        result: 'ok',
      });
    }
  };

  const handleConfirmSignal = async (id: string) => {
    setReviewBusyId(id);
    try {
      await confirmSignal(id);
      const next = markSignalHandledToday(id, 'confirm');
      setReviewDayState(next);
      setConfirmedTodayCount((n) => n + 1);
      trackEvent('review_confirmed', {
        ...safeAnalyticsProps,
        action: 'confirm',
        result: 'ok',
      });
      // Task 7.1 reevaluation runs server-side on confirm; one Today refresh.
      refreshIntelligence();
      finishReviewIfEmpty(next, Math.max(0, intelligence.unreviewedCount - 1));
    } catch {
      /* local Today stays usable */
    } finally {
      setReviewBusyId(null);
    }
  };

  const handleRejectSignal = async (id: string) => {
    setReviewBusyId(id);
    try {
      await rejectSignal(id);
      const next = markSignalHandledToday(id, 'reject');
      setReviewDayState(next);
      trackEvent('review_rejected', {
        ...safeAnalyticsProps,
        action: 'reject',
        result: 'ok',
      });
      refreshIntelligence();
      finishReviewIfEmpty(next, Math.max(0, intelligence.unreviewedCount - 1));
    } catch {
      /* local Today stays usable */
    } finally {
      setReviewBusyId(null);
    }
  };

  const handleReviewLater = (id: string) => {
    const next = markSignalHandledToday(id, 'later');
    setReviewDayState(next);
    trackEvent('review_later', {
      ...safeAnalyticsProps,
      action: 'later',
      result: 'ok',
    });
    finishReviewIfEmpty(next, intelligence.unreviewedCount);
  };

  const reviewContinuity = useMemo(
    () =>
      memoryReviewAllowed
        ? buildReviewContinuityLine({
            confirmedTodayCount,
            visibleRemaining: dailyReviewItems.length,
            unreviewedTotal: intelligence.unreviewedCount,
            caughtUp: reviewCaughtUp,
            quotaExhausted: quotaExhaustedToday,
          })
        : null,
    [
      memoryReviewAllowed,
      confirmedTodayCount,
      dailyReviewItems.length,
      intelligence.unreviewedCount,
      reviewCaughtUp,
      quotaExhaustedToday,
    ],
  );

  // Pattern experience card owns pattern messaging — avoid duplicate continuity lines.
  const showContinuityBlock =
    continuity.shown &&
    !liveContinuityCard &&
    !showDailyReviewCard &&
    !reviewCaughtUp &&
    continuity.kind !== 'confirmed_pattern' &&
    continuity.kind !== 'possible_pattern';

  // Memory hint only when continuity is not already explaining Memory off/unavailable.
  const showMemoryHint =
    (todayResolved.memoryStatus === 'off' || todayResolved.memoryStatus === 'unavailable') &&
    continuity.kind !== 'memory_off' &&
    continuity.kind !== 'memory_unavailable' &&
    continuity.kind !== 'memory_on_empty' &&
    liveContinuityCard?.kind !== 'memory_off' &&
    liveContinuityCard?.kind !== 'store_unavailable';

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
    const lines: string[] = [];
    if (hasEnergyMetric) {
      lines.push(
        energyValue >= 50
          ? `Today my energy felt ${copy.steady.toLowerCase()}.`
          : `Today my energy felt ${copy.lowerThanUsual.toLowerCase()}.`,
      );
    }
    if (sleepMinutes && sleepText) {
      lines.push(`I slept ${sleepText} last night.`);
    }
    lines.push(`My cycle is in the ${phaseLabel} phase (${copy.dayWord} ${systemState.currentDay}).`);
    if (hasEnergyMetric) {
      lines.push(`${copy.energy}: ${energyLabel}`);
    }
    if (sleepMinutes && sleepText) {
      lines.push(`${copy.sleep}: ${sleepText}`);
    }
    const message = lines.join('\n');
    const result = await shareTextSafely(message, 'Luna29 partner message');
    const feedback = getLang(shareFeedbackByLang, lang) || shareFeedbackByLang.en;
    if (result === 'shared') setPartnerStatus(feedback.shared);
    else if (result === 'copied') setPartnerStatus(feedback.copied);
    else setPartnerStatus(feedback.failed);
  };

  return (
    <section className="relative max-w-4xl mx-auto p-5 md:p-7 space-y-4 overflow-hidden rounded-[2.4rem] bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,224,238,0.46),transparent_52%),radial-gradient(92%_78%_at_100%_0%,rgba(219,203,255,0.42),transparent_54%),linear-gradient(155deg,#fdf8fc_0%,#f6f2fd_50%,#f2f5ff_100%)] dark:bg-[radial-gradient(120%_90%_at_0%_0%,rgba(90,106,158,0.24),transparent_52%),radial-gradient(92%_78%_at_100%_0%,rgba(83,105,156,0.2),transparent_54%),linear-gradient(155deg,#0a1936_0%,#0f2248_50%,#132b56_100%)]">
      <div className="pointer-events-none absolute -top-12 -left-12 w-52 h-52 rounded-full bg-rose-200/55 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-violet-200/55 blur-3xl" />
      <article className="relative rounded-[2.2rem] border border-white/70 dark:border-[#486a9b] bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(250,244,255,0.85)_46%,rgba(244,247,255,0.82)_100%)] dark:!bg-[linear-gradient(145deg,rgba(11,30,63,0.96),rgba(16,38,76,0.94)_46%,rgba(20,48,90,0.92)_100%)] p-5 md:p-7 shadow-[0_24px_60px_rgba(113,82,168,0.18)] dark:shadow-[0_24px_54px_rgba(5,13,33,0.52)] space-y-4 overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-fuchsia-200/45 blur-3xl" />
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 dark:border-white/15 bg-white/70 dark:bg-slate-900/45 px-3 py-1.5 shadow-[0_8px_20px_rgba(145,111,188,0.16)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-violet-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">{copy.todayReflection}</p>
          </div>
          <p
            className="font-brand animate-color-shift-luna text-4xl md:text-5xl leading-[0.95] drop-shadow-[0_1px_0_rgba(255,255,255,0.45)] dark:drop-shadow-[0_1px_0_rgba(10,20,40,0.6)]"
          >
            {greeting}, {profileName}
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] dark:drop-shadow-none">{copy.title}</h1>
        </div>

        <div className="space-y-1">
          <p className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100">
            Tell Luna how you are today
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-100/95">
            {sleepMinutes && sleepText ? copy.lineSleep(sleepText, phaseLabel) : copy.lineIntro(phaseLabel)}
          </p>
        </div>

        <div>
          <button
            data-testid="dashboard-checkin-start"
            data-today-primary="quick_checkin"
            data-today-state={todayResolved.state}
            onClick={handlePrimaryAction}
            className="luna-soft-glow w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-white/70 dark:border-[#94a8d0]/35 bg-gradient-to-r from-[#9455e4] via-[#c85fb6] to-[#7a63f7] dark:from-[#4f5f8a] dark:via-[#4b5f89] dark:to-[#43638a] text-white text-sm font-black tracking-wide hover:brightness-110 transition-all shadow-[0_14px_30px_rgba(123,86,188,0.35)] dark:shadow-[0_14px_28px_rgba(18,33,67,0.45)]"
          >
            {copy.quickCheckin}
          </button>
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-300">
            About a minute · works with Memory off
          </p>
        </div>

        {liveContinuityCard && (
          <div
            data-testid="today-live-continuity"
            data-live-continuity-kind={liveContinuityCard.kind}
            className="rounded-xl border border-emerald-200/70 dark:border-emerald-500/25 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3 space-y-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">
                  After Luna Live
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-100/95">
                  {liveContinuityCard.line}
                </p>
              </div>
              {onDismissLiveContinuity ? (
                <button
                  type="button"
                  className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500"
                  onClick={onDismissLiveContinuity}
                >
                  Dismiss
                </button>
              ) : null}
            </div>
            {onContinueLiveConversation ? (
              <button
                type="button"
                data-testid="today-continue-conversation"
                onClick={onContinueLiveConversation}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-luna-purple/30 bg-luna-purple/10 text-luna-purple text-[10px] font-bold uppercase tracking-[0.12em]"
              >
                Continue conversation
              </button>
            ) : null}
          </div>
        )}

        {showContinuityBlock && (
          <div
            data-testid="today-continuity"
            data-continuity-kind={continuity.kind}
            className="rounded-xl border border-white/60 dark:border-[#6f8bb9]/35 bg-white/55 dark:bg-[#17365f]/55 px-4 py-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">{copy.continuityTitle}</p>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-100/95">{continuity.line}</p>
          </div>
        )}

        {reviewContinuity &&
          (reviewCaughtUp || confirmedTodayCount > 0 || quotaExhaustedToday) &&
          !showDailyReviewCard &&
          !liveContinuityCard && (
          <div
            data-testid="today-review-continuity"
            className="rounded-xl border border-white/60 dark:border-[#6f8bb9]/35 bg-white/55 dark:bg-[#17365f]/55 px-4 py-3"
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-100/95">{reviewContinuity.line}</p>
          </div>
        )}

        {showDailyReviewCard && (
          <div
            data-testid="today-daily-review"
            className="rounded-xl border border-amber-200/70 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 space-y-3"
          >
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Luna noticed a few things.
            </p>
            <ul className="space-y-2">
              {dailyReviewItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg bg-white/70 dark:bg-[#102a53]/70 px-3 py-2 space-y-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                        {item.typeLabel}
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.valueLabel}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.timeLabel} · {item.trustLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={reviewBusyId === item.id}
                      onClick={() => handleConfirmSignal(item.id)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] bg-luna-purple text-white disabled:opacity-45"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      disabled={reviewBusyId === item.id}
                      onClick={() => handleRejectSignal(item.id)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-slate-300/70 dark:border-[#86a0cb]/40 text-slate-600 dark:text-slate-200 disabled:opacity-45"
                    >
                      Not correct
                    </button>
                    <button
                      type="button"
                      disabled={reviewBusyId === item.id}
                      onClick={() => handleReviewLater(item.id)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 disabled:opacity-45"
                    >
                      Review later
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showPatternExperienceCard && (
          <div
            data-testid="today-pattern-experience"
            data-pattern-kind={patternExperience.kind}
            className="rounded-xl border border-white/60 dark:border-[#6f8bb9]/35 bg-white/55 dark:bg-[#17365f]/55 px-4 py-3 space-y-2"
          >
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {patternExperience.headline}
            </p>
            {patternExperience.pattern?.title ? (
              <p className="text-sm font-medium text-slate-700 dark:text-slate-100/95">
                {patternExperience.pattern.title}
              </p>
            ) : null}
            {patternExperience.body.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {line}
              </p>
            ))}
            {patternExperience.ctaLabel && onOpenMemory ? (
              <button
                type="button"
                data-testid="today-pattern-open"
                onClick={handlePatternOpen}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-luna-purple/30 bg-luna-purple/10 text-luna-purple text-[10px] font-bold uppercase tracking-[0.12em]"
              >
                {patternExperience.ctaLabel}
              </button>
            ) : null}
          </div>
        )}

        {!showDailyReviewCard && !showPatternExperienceCard && (
          <HealthProfileTodayPrompt onOpenProfile={onOpenMemory} />
        )}

        {showMemoryHint && (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
            {todayResolved.memoryStatus === 'unavailable'
              ? 'Memory settings are temporarily unavailable. Your check-in still works on this device.'
              : 'Memory is off — check-ins still work on this device.'}
            {onOpenMemory ? (
              <>
                {' '}
                <button
                  type="button"
                  onClick={onOpenMemory}
                  className="underline underline-offset-2 text-luna-purple"
                >
                  About Memory
                </button>
              </>
            ) : null}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSpeak}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-300/60 dark:border-[#86a0cb]/40 bg-white/72 dark:bg-[#17365f]/82 text-slate-600 dark:text-[#d9e6ff] text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-white/88 dark:hover:bg-[#214675] transition-all"
          >
            <Mic size={12} /> {copy.speak}
          </button>
          <button
            onClick={onOpenMyDay}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-300/60 dark:border-[#86a0cb]/40 bg-white/72 dark:bg-[#17365f]/82 text-slate-600 dark:text-[#d9e6ff] text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-white/88 dark:hover:bg-[#214675] transition-all"
          >
            {copy.openMyDay}
          </button>
          <button
            onClick={onOpenMonthly}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-300/60 dark:border-[#86a0cb]/40 bg-white/72 dark:bg-[#17365f]/82 text-slate-600 dark:text-[#d9e6ff] text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-white/88 dark:hover:bg-[#214675] transition-all"
          >
            {getLang(monthlyCtaByLang, lang) || monthlyCtaByLang.en}
          </button>
          <button
            onClick={handleSharePartnerMessage}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-300/60 dark:border-[#86a0cb]/40 bg-white/72 dark:bg-[#17365f]/82 text-slate-600 dark:text-[#d9e6ff] text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-white/88 dark:hover:bg-[#214675] transition-all"
          >
            <Share2 size={12} /> {getLang(partnerCtaByLang, lang) || partnerCtaByLang.en}
          </button>
        </div>
        {partnerStatus && <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{partnerStatus}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-[linear-gradient(140deg,rgba(255,255,255,0.9),rgba(246,235,255,0.8))] dark:!bg-[linear-gradient(145deg,rgba(18,43,81,0.94),rgba(23,53,95,0.9))] p-3 border border-white/70 dark:border-[#6f8bb9]/35">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{copy.cycle}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{copy.dayWord} {systemState.currentDay} · {currentPhase} {copy.phaseWord}</p>
          </div>
          <div className="rounded-xl bg-[linear-gradient(140deg,rgba(255,255,255,0.9),rgba(236,246,255,0.82))] dark:!bg-[linear-gradient(145deg,rgba(18,43,81,0.94),rgba(23,53,95,0.9))] p-3 border border-white/70 dark:border-[#6f8bb9]/35">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{copy.energy}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {energyLabel ?? copy.sleepUnset}
            </p>
          </div>
          <div className="rounded-xl bg-[linear-gradient(140deg,rgba(255,255,255,0.9),rgba(255,239,245,0.82))] dark:!bg-[linear-gradient(145deg,rgba(18,43,81,0.94),rgba(23,53,95,0.9))] p-3 border border-white/70 dark:border-[#6f8bb9]/35">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{copy.sleep}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {sleepMinutes && sleepText ? sleepText : copy.sleepUnset}
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-[1.8rem] border border-white/70 dark:border-[#486a9b] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,242,248,0.78))] dark:!bg-[linear-gradient(145deg,rgba(12,33,67,0.94),rgba(18,43,82,0.9))] p-4 md:p-5 shadow-luna-rich">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{copy.storyTitle}</p>
        {storyEntries.length > 0 ? (
          <div className="mt-2.5 space-y-2.5">
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
