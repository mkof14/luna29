import type { CalendarEvent, CalendarPreferences } from './calendarStore';

export type CalendarReminderOccurrence = {
  event: CalendarEvent;
  iso: string;
  fireAt: Date;
  reminderKey: string;
  minutesBefore: number;
};

const pad = (n: number) => String(n).padStart(2, '0');

export const eventOccursOn = (event: CalendarEvent, iso: string): boolean => {
  const [, m, d] = iso.split('-').map(Number);
  const [, em, ed] = event.date.split('-').map(Number);
  if (!m || !d || !em || !ed) return false;

  switch (event.recurrence) {
    case 'yearly':
      return m === em && d === ed;
    case 'monthly':
      return d === ed;
    case 'weekly': {
      const anchor = new Date(`${event.date}T12:00:00`);
      const target = new Date(`${iso}T12:00:00`);
      const diffDays = Math.round((target.getTime() - anchor.getTime()) / 86_400_000);
      return diffDays >= 0 && diffDays % 7 === 0;
    }
    case 'daily':
      return iso >= event.date;
    case 'none':
    default:
      return iso === event.date;
  }
};

export const occurrenceIsoForYear = (event: CalendarEvent, year: number): string | null => {
  const [, em, ed] = event.date.split('-').map(Number);
  if (!em || !ed) return null;
  if (event.recurrence === 'none' || event.recurrence === 'daily' || event.recurrence === 'weekly') {
    return event.date.startsWith(String(year)) ? event.date : null;
  }
  if (event.recurrence === 'monthly') {
    return `${year}-${pad(em)}-${pad(ed)}`;
  }
  return `${year}-${pad(em)}-${pad(ed)}`;
};

const eventDateTime = (iso: string, time?: string): Date => {
  const t = (time || '09:00').match(/^(\d{1,2}):(\d{2})$/) ? time || '09:00' : '09:00';
  return new Date(`${iso}T${t}:00`);
};

export const buildReminderKey = (eventId: string, iso: string, minutesBefore: number): string =>
  `${eventId}:${iso}:${minutesBefore}`;

export const listReminderOccurrences = (
  events: CalendarEvent[],
  windowStart: Date,
  windowEnd: Date,
): CalendarReminderOccurrence[] => {
  const out: CalendarReminderOccurrence[] = [];
  const startIso = windowStart.toISOString().slice(0, 10);
  const endIso = windowEnd.toISOString().slice(0, 10);

  for (const event of events) {
    const cursor = new Date(`${startIso}T00:00:00`);
    const end = new Date(`${endIso}T23:59:59`);
    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10);
      if (eventOccursOn(event, iso)) {
        const base = eventDateTime(iso, event.time);
        for (const minutesBefore of event.remindAtMinutes.length ? event.remindAtMinutes : [0]) {
          const fireAt = new Date(base.getTime() - minutesBefore * 60_000);
          if (fireAt >= windowStart && fireAt <= windowEnd) {
            out.push({
              event,
              iso,
              fireAt,
              minutesBefore,
              reminderKey: buildReminderKey(event.id, iso, minutesBefore),
            });
          }
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
};

export const getEventsForDate = (events: CalendarEvent[], iso: string): CalendarEvent[] =>
  events.filter((event) => eventOccursOn(event, iso));

export const getUpcomingEvents = (events: CalendarEvent[], from = new Date(), limit = 8): Array<{ event: CalendarEvent; iso: string }> => {
  const results: Array<{ event: CalendarEvent; iso: string; when: Date }> = [];
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const cursor = new Date(start);

  for (let i = 0; i < 400 && results.length < limit; i += 1) {
    const iso = cursor.toISOString().slice(0, 10);
    for (const event of events) {
      if (!eventOccursOn(event, iso)) continue;
      const when = eventDateTime(iso, event.time);
      if (when >= from) {
        results.push({ event, iso, when });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return results
    .sort((a, b) => a.when.getTime() - b.when.getTime())
    .slice(0, limit)
    .map(({ event, iso }) => ({ event, iso }));
};

export const markReminderSent = (preferences: CalendarPreferences, reminderKey: string): CalendarPreferences => ({
  ...preferences,
  sentReminderKeys: [...new Set([...(preferences.sentReminderKeys || []), reminderKey])].slice(-500),
});

export const wasReminderSent = (preferences: CalendarPreferences, reminderKey: string): boolean =>
  (preferences.sentReminderKeys || []).includes(reminderKey);

export const kindIndicatorClass = (kind: CalendarEvent['kind']): string => {
  switch (kind) {
    case 'birthday':
      return 'bg-rose-500';
    case 'appointment':
      return 'bg-sky-500';
    case 'anniversary':
      return 'bg-fuchsia-500';
    case 'task':
      return 'bg-emerald-500';
    case 'reminder':
      return 'bg-amber-500';
    default:
      return 'bg-violet-500';
  }
};
