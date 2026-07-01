import { CyclePhase, HealthEvent } from '../types';
import { getCyclePhaseByDay } from './cycle';
import { versionedStaticAsset } from './staticAssetUrl';

export type CalendarDayMarker = {
  checkin: boolean;
  voice: boolean;
  period: boolean;
  cycleDay: number | null;
  phase: CyclePhase | null;
};

export type CalendarDay = {
  date: Date;
  iso: string;
  inMonth: boolean;
  isToday: boolean;
  marker: CalendarDayMarker;
};

export type CalendarMonthData = {
  year: number;
  month: number;
  monthLabel: string;
  days: CalendarDay[];
  stats: {
    checkins: number;
    voiceNotes: number;
    periodDays: number;
    activeDays: number;
    currentCycleDay: number;
    currentPhase: CyclePhase;
  };
  heroImage: string;
};

export type CalendarYearData = {
  year: number;
  yearLabel: string;
  months: CalendarMonthData[];
  stats: {
    checkins: number;
    voiceNotes: number;
    activeDays: number;
    currentCycleDay: number;
    currentPhase: CyclePhase;
  };
};

/** One unique hero illustration per calendar month (0 = January). */
const MONTH_HERO_IMAGES = [
  '/images/heroes/r2/today_mirror.webp',
  '/images/heroes/r2/my_day.webp',
  '/images/heroes/r2/cycle.webp',
  '/images/heroes/r2/history.webp',
  '/images/heroes/r2/monthly_reflection.webp',
  '/images/heroes/r2/reflections.webp',
  '/images/heroes/r2/library.webp',
  '/images/heroes/r2/relationships.webp',
  '/images/heroes/r2/family.webp',
  '/images/heroes/r2/bridge.webp',
  '/images/heroes/r2/creative.webp',
  '/images/heroes/r2/profile.webp',
] as const;

export const getCalendarMonthHeroImage = (month: number): string =>
  versionedStaticAsset(MONTH_HERO_IMAGES[month % MONTH_HERO_IMAGES.length]);

const pad = (n: number) => String(n).padStart(2, '0');

export const toIsoDate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseIso = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Last known cycle anchor from log (most recent CYCLE_SYNC). */
export const getCycleAnchor = (
  log: HealthEvent[],
): { anchorDate: string; cycleDay: number; cycleLength: number } | null => {
  for (let i = log.length - 1; i >= 0; i -= 1) {
    const ev = log[i];
    if (ev.type !== 'CYCLE_SYNC') continue;
    const payload = ev.payload as { day?: number; length?: number };
    if (typeof payload.day !== 'number') continue;
    return {
      anchorDate: ev.timestamp.split('T')[0],
      cycleDay: payload.day,
      cycleLength: typeof payload.length === 'number' ? payload.length : 28};
  }
  return null;
};

export const predictCycleDay = (
  targetIso: string,
  anchor: { anchorDate: string; cycleDay: number; cycleLength: number } | null,
  fallbackDay: number,
  fallbackLength: number,
): number => {
  const length = anchor?.cycleLength ?? fallbackLength;
  const baseDay = anchor?.cycleDay ?? fallbackDay;
  const baseDate = anchor ? parseIso(anchor.anchorDate) : parseIso(targetIso);
  const target = parseIso(targetIso);
  const diffMs = target.getTime() - baseDate.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);
  let day = baseDay + diffDays;
  while (day < 1) day += length;
  while (day > length) day -= length;
  return day;
};

const buildDayMarkers = (
  log: HealthEvent[],
  iso: string,
  cycleDay: number,
): CalendarDayMarker => {
  const dayEvents = log.filter((e) => e.timestamp.split('T')[0] === iso);
  let checkin = false;
  let voice = false;
  let period = false;

  for (const ev of dayEvents) {
    if (ev.type === 'DAILY_CHECKIN') {
      checkin = true;
      const payload = ev.payload as { isPeriod?: boolean };
      if (payload.isPeriod) period = true;
    }
    if (ev.type === 'AUDIO_REFLECTION') voice = true;
  }

  const phase = getCyclePhaseByDay(cycleDay);
  return { checkin, voice, period, cycleDay, phase };
};

const monthNames: Record<string, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']};

export const buildCalendarMonth = (
  year: number,
  month: number,
  log: HealthEvent[],
  currentCycleDay: number,
  cycleLength: number,
  lang: string,
): CalendarMonthData => {
  const todayIso = toIsoDate(new Date());
  const anchor = getCycleAnchor(log);
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-start week
  const gridStart = new Date(year, month, 1 - startOffset);

  const names = monthNames[lang] ?? monthNames.en;
  const monthLabel = `${names[month]} ${year}`;

  const days: CalendarDay[] = [];
  let checkins = 0;
  let voiceNotes = 0;
  let periodDays = 0;

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const iso = toIsoDate(date);
    const inMonth = date.getMonth() === month;
    const cycleDay = predictCycleDay(iso, anchor, currentCycleDay, cycleLength);
    const marker = buildDayMarkers(log, iso, cycleDay);

    if (inMonth) {
      if (marker.checkin) checkins += 1;
      if (marker.voice) voiceNotes += 1;
      if (marker.period) periodDays += 1;
    }

    days.push({
      date,
      iso,
      inMonth,
      isToday: iso === todayIso,
      marker,
    });
  }

  const activeDays = new Set(
    log
      .filter((e) => ['DAILY_CHECKIN', 'AUDIO_REFLECTION'].includes(e.type))
      .map((e) => e.timestamp.split('T')[0]),
  ).size;

  const currentPhase = getCyclePhaseByDay(currentCycleDay);

  return {
    year,
    month,
    monthLabel,
    days,
    stats: {
      checkins,
      voiceNotes,
      periodDays,
      activeDays,
      currentCycleDay,
      currentPhase,
    },
    heroImage: getCalendarMonthHeroImage(month),
  };
};

export const buildCalendarYear = (
  year: number,
  log: HealthEvent[],
  currentCycleDay: number,
  cycleLength: number,
  lang: string,
): CalendarYearData => {
  const months = Array.from({ length: 12 }, (_, month) =>
    buildCalendarMonth(year, month, log, currentCycleDay, cycleLength, lang),
  );
  const checkins = months.reduce((sum, m) => sum + m.stats.checkins, 0);
  const voiceNotes = months.reduce((sum, m) => sum + m.stats.voiceNotes, 0);
  const anchor = getCycleAnchor(log);
  const activeDays = new Set(
    log
      .filter((e) => {
        const iso = e.timestamp.split('T')[0];
        return iso.startsWith(String(year)) && ['DAILY_CHECKIN', 'AUDIO_REFLECTION'].includes(e.type);
      })
      .map((e) => e.timestamp.split('T')[0]),
  ).size;

  return {
    year,
    yearLabel: String(year),
    months,
    stats: {
      checkins,
      voiceNotes,
      activeDays,
      currentCycleDay: anchor?.cycleDay ?? currentCycleDay,
      currentPhase: getCyclePhaseByDay(currentCycleDay),
    },
  };
};

export const buildCalendarSummaryText = (
  data: CalendarMonthData,
  lang: string,
): string => {
  const { stats, monthLabel } = data;
  if (lang === 'ru') {
    return `Luna29 — ${monthLabel}\nДень цикла: ${stats.currentCycleDay} · Фаза: ${stats.currentPhase}\nCheck-in: ${stats.checkins} · Голосовые: ${stats.voiceNotes} · Активных дней: ${stats.activeDays}`;
  }
  return `Luna29 — ${monthLabel}\nCycle day ${stats.currentCycleDay} · ${stats.currentPhase} phase\nCheck-ins: ${stats.checkins} · Voice notes: ${stats.voiceNotes} · Active days: ${stats.activeDays}`;
};

export const buildYearSummaryText = (data: CalendarYearData, lang: string): string => {
  const { stats, yearLabel } = data;
  if (lang === 'ru') {
    return `Luna29 — Календарь ${yearLabel}\nДень цикла: ${stats.currentCycleDay} · Фаза: ${stats.currentPhase}\nCheck-in за год: ${stats.checkins} · Голосовые: ${stats.voiceNotes} · Активных дней: ${stats.activeDays}`;
  }
  return `Luna29 — Calendar ${yearLabel}\nCycle day ${stats.currentCycleDay} · ${stats.currentPhase} phase\nYear check-ins: ${stats.checkins} · Voice notes: ${stats.voiceNotes} · Active days: ${stats.activeDays}`;
};

export const PHASE_CALENDAR_COLORS: Record<CyclePhase, { bg: string; text: string; dot: string }> = {
  [CyclePhase.MENSTRUAL]: { bg: 'rgba(232,180,188,0.35)', text: '#9f4d5c', dot: '#e8b4bc' },
  [CyclePhase.FOLLICULAR]: { bg: 'rgba(214,223,247,0.4)', text: '#5b6b9a', dot: '#b8c4e8' },
  [CyclePhase.OVULATORY]: { bg: 'rgba(245,235,228,0.55)', text: '#8a6b4a', dot: '#e8d4c4' },
  [CyclePhase.LUTEAL]: { bg: 'rgba(196,181,212,0.38)', text: '#6b5a7a', dot: '#c4b5d4' },
};
