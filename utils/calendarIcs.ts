import { Language, getLang } from '../constants';
import { HealthEvent } from '../types';
import { CalendarDayJournal, CalendarJournalStore, loadCalendarData, loadCalendarJournal } from './calendarStore';
import { eventOccursOn } from './calendarReminders';
import { buildCalendarMonth, buildCalendarYear, getCycleAnchor, predictCycleDay, toIsoDate } from './lunaCalendar';
import { getCyclePhaseByDay } from './cycle';
import { CALENDAR_GOOGLE_HINT } from './calendarI18n';

const pad = (n: number) => String(n).padStart(2, '0');

const foldIcs = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

const formatIcsDate = (iso: string): string => iso.replace(/-/g, '');

const formatIcsStamp = (d = new Date()): string =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

type IcsBuildOptions = {
  year: number;
  month?: number;
  log: HealthEvent[];
  currentCycleDay: number;
  cycleLength: number;
  lang: string;
  journal?: CalendarJournalStore;
};

const buildDayDescription = (
  iso: string,
  log: HealthEvent[],
  journal: CalendarJournalStore,
  cycleDay: number,
): string => {
  const lines: string[] = [];
  const phase = getCyclePhaseByDay(cycleDay);
  lines.push(`Luna29 · Cycle day ${cycleDay} · ${phase}`);

  const dayEvents = log.filter((e) => e.timestamp.split('T')[0] === iso);
  for (const ev of dayEvents) {
    if (ev.type === 'DAILY_CHECKIN') lines.push('✓ Daily check-in');
    if (ev.type === 'AUDIO_REFLECTION') lines.push('✓ Voice reflection');
  }

  const entry = journal[iso];
  if (entry?.intention.trim()) lines.push(`Intention: ${entry.intention.trim()}`);
  if (entry?.note.trim()) lines.push(`Note: ${entry.note.trim()}`);
  if (entry?.gratitude.trim()) lines.push(`Gratitude: ${entry.gratitude.trim()}`);
  return lines.join('\n');
};

export const buildIcsCalendar = ({
  year,
  month,
  log,
  currentCycleDay,
  cycleLength,
  lang,
  journal = loadCalendarJournal(),
}: IcsBuildOptions): string => {
  const anchor = getCycleAnchor(log);
  const months =
    typeof month === 'number'
      ? [buildCalendarMonth(year, month, log, currentCycleDay, cycleLength, lang)]
      : buildCalendarYear(year, log, currentCycleDay, cycleLength, lang).months;

  const events: string[] = [];

  for (const monthData of months) {
    for (const day of monthData.days) {
      if (!day.inMonth) continue;
      const iso = day.iso;
      const entry = journal[iso];
      const hasEntry = entry && (entry.note.trim() || entry.intention.trim() || entry.gratitude.trim());
      const hasActivity = day.marker.checkin || day.marker.voice || day.marker.period || hasEntry;
      if (!hasActivity) continue;

      const cycleDay = predictCycleDay(iso, anchor, currentCycleDay, cycleLength);
      const titleParts = ['Luna29'];
      if (day.marker.period) titleParts.push('Period');
      if (day.marker.checkin) titleParts.push('Check-in');
      if (day.marker.voice) titleParts.push('Voice');
      if (entry?.intention.trim()) titleParts.push(entry.intention.trim().slice(0, 40));

      const uid = `luna29-${iso}@luna29.app`;
      const summary = foldIcs(titleParts.join(' · '));
      const description = foldIcs(buildDayDescription(iso, log, journal, cycleDay));

      events.push(
        [
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${formatIcsStamp()}`,
          `DTSTART;VALUE=DATE:${formatIcsDate(iso)}`,
          `DTEND;VALUE=DATE:${formatIcsDate(iso)}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          'TRANSP:TRANSPARENT',
          'END:VEVENT',
        ].join('\r\n'),
      );
    }
  }

  const customEvents = loadCalendarData().events;
  for (const event of customEvents) {
    const cursor = new Date(`${year}-01-01T00:00:00`);
    const end = typeof month === 'number'
      ? new Date(year, month + 1, 0)
      : new Date(`${year}-12-31T23:59:59`);
    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10);
      if (eventOccursOn(event, iso)) {
        const uid = `luna29-evt-${event.id}-${iso}@luna29.app`;
        const summary = foldIcs(event.title);
        const description = foldIcs([event.note || '', event.kind, event.recurrence].filter(Boolean).join('\n'));
        const lines = [
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${formatIcsStamp()}`,
          `DTSTART;VALUE=DATE:${formatIcsDate(iso)}`,
          `DTEND;VALUE=DATE:${formatIcsDate(iso)}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          'TRANSP:TRANSPARENT',
        ];
        if (event.recurrence === 'yearly') lines.splice(5, 0, 'RRULE:FREQ=YEARLY');
        if (event.recurrence === 'monthly') lines.splice(5, 0, 'RRULE:FREQ=MONTHLY');
        if (event.recurrence === 'weekly') lines.splice(5, 0, 'RRULE:FREQ=WEEKLY');
        if (event.recurrence === 'daily') lines.splice(5, 0, 'RRULE:FREQ=DAILY');
        lines.push('END:VEVENT');
        events.push(lines.join('\r\n'));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Luna29//Rhythm Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Luna29 Rhythm',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
};

export const downloadIcsFile = (ics: string, filename: string): void => {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const buildDayIcs = (
  iso: string,
  log: HealthEvent[],
  currentCycleDay: number,
  cycleLength: number,
  lang: string,
  journal?: CalendarJournalStore,
): string => {
  const [y, m] = iso.split('-').map(Number);
  return buildIcsCalendar({
    year: y,
    month: m - 1,
    log,
    currentCycleDay,
    cycleLength,
    lang,
    journal,
  });
};

export const parseIcsNotes = (icsText: string): CalendarJournalStore => {
  const store = loadCalendarJournal();
  const blocks = icsText.split('BEGIN:VEVENT');
  for (const block of blocks.slice(1)) {
    const dtStart = block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/)?.[1];
    const description = block.match(/DESCRIPTION:([^\r\n]+)/)?.[1]?.replace(/\\n/g, '\n').replace(/\\,/g, ',');
    if (!dtStart) continue;
    const iso = `${dtStart.slice(0, 4)}-${dtStart.slice(4, 6)}-${dtStart.slice(6, 8)}`;
    if (!description) continue;
    store[iso] = {
      note: description,
      intention: '',
      gratitude: '',
      updatedAt: new Date().toISOString()};
  }
  return store;
};

export const mergeImportedJournal = (incoming: CalendarJournalStore): CalendarJournalStore => {
  const current = loadCalendarJournal();
  const merged = { ...current, ...incoming };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('luna_rhythm_calendar_journal_v1', JSON.stringify(merged));
    } catch {
      // ignore
    }
  }
  return merged;
};

export const googleCalendarImportHint = (lang: Language | string): string =>
  getLang(CALENDAR_GOOGLE_HINT, lang as Language);
