export type CalendarDayJournal = {
  note: string;
  intention: string;
  gratitude: string;
  updatedAt: string;
};

export type CalendarJournalStore = Record<string, CalendarDayJournal>;

export type CalendarEventKind = 'reminder' | 'birthday' | 'appointment' | 'anniversary' | 'task' | 'other';

export type CalendarEventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type CalendarEvent = {
  id: string;
  title: string;
  kind: CalendarEventKind;
  date: string;
  time?: string;
  recurrence: CalendarEventRecurrence;
  note?: string;
  remindAtMinutes: number[];
  emailReminder: boolean;
  browserReminder: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
};

export type CalendarPreferences = {
  browserNotifications: boolean;
  emailReminders: boolean;
  reminderEmail: string;
  sentReminderKeys: string[];
  lastSyncAt?: string;
  serverRevision?: string;
};

export type CalendarDataBundle = {
  version: 2;
  journal: CalendarJournalStore;
  events: CalendarEvent[];
  preferences: CalendarPreferences;
  updatedAt: string;
};

const STORAGE_KEY_V1 = 'luna_rhythm_calendar_journal_v1';
const STORAGE_KEY = 'luna_rhythm_calendar_v2';

const emptyJournalEntry = (): CalendarDayJournal => ({
  note: '',
  intention: '',
  gratitude: '',
  updatedAt: new Date().toISOString(),
});

const defaultPreferences = (): CalendarPreferences => ({
  browserNotifications: true,
  emailReminders: false,
  reminderEmail: '',
  sentReminderKeys: [],
});

export const emptyCalendarBundle = (): CalendarDataBundle => ({
  version: 2,
  journal: {},
  events: [],
  preferences: defaultPreferences(),
  updatedAt: new Date().toISOString(),
});

const migrateV1Journal = (): CalendarJournalStore => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CalendarJournalStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const loadCalendarData = (): CalendarDataBundle => {
  if (typeof window === 'undefined') return emptyCalendarBundle();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const journal = migrateV1Journal();
      if (Object.keys(journal).length === 0) return emptyCalendarBundle();
      return { ...emptyCalendarBundle(), journal, updatedAt: new Date().toISOString() };
    }
    const parsed = JSON.parse(raw) as CalendarDataBundle;
    if (!parsed || parsed.version !== 2) return emptyCalendarBundle();
    return {
      version: 2,
      journal: parsed.journal && typeof parsed.journal === 'object' ? parsed.journal : {},
      events: Array.isArray(parsed.events) ? parsed.events : [],
      preferences: { ...defaultPreferences(), ...(parsed.preferences || {}) },
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return emptyCalendarBundle();
  }
};

export const saveCalendarData = (bundle: CalendarDataBundle): void => {
  if (typeof window === 'undefined') return;
  try {
    const next = { ...bundle, version: 2 as const, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota or private mode
  }
};

export const loadCalendarJournal = (): CalendarJournalStore => loadCalendarData().journal;

export const saveCalendarJournal = (store: CalendarJournalStore): void => {
  const bundle = loadCalendarData();
  saveCalendarData({ ...bundle, journal: store });
};

export const getDayJournal = (iso: string, store?: CalendarJournalStore): CalendarDayJournal => {
  const data = store ?? loadCalendarJournal();
  return data[iso] ?? emptyJournalEntry();
};

export const upsertDayJournal = (
  iso: string,
  patch: Partial<CalendarDayJournal>,
  store?: CalendarJournalStore,
): CalendarJournalStore => {
  const bundle = loadCalendarData();
  const journal = { ...(store ?? bundle.journal) };
  const prev = journal[iso] ?? emptyJournalEntry();
  journal[iso] = { ...prev, ...patch, updatedAt: new Date().toISOString() };
  saveCalendarData({ ...bundle, journal });
  return journal;
};

export const hasJournalContent = (entry: CalendarDayJournal | undefined): boolean =>
  Boolean(entry && (entry.note.trim() || entry.intention.trim() || entry.gratitude.trim()));

export const journalSnippet = (entry: CalendarDayJournal | undefined, max = 28): string => {
  if (!entry) return '';
  const text = entry.note.trim() || entry.intention.trim() || entry.gratitude.trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

export const createCalendarEventId = (): string =>
  `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const upsertCalendarEvent = (event: CalendarEvent): CalendarEvent[] => {
  const bundle = loadCalendarData();
  const idx = bundle.events.findIndex((item) => item.id === event.id);
  const nextEvent = { ...event, updatedAt: new Date().toISOString() };
  const events =
    idx >= 0
      ? bundle.events.map((item, i) => (i === idx ? nextEvent : item))
      : [...bundle.events, { ...nextEvent, createdAt: nextEvent.createdAt || new Date().toISOString() }];
  saveCalendarData({ ...bundle, events });
  return events;
};

export const deleteCalendarEvent = (id: string): CalendarEvent[] => {
  const bundle = loadCalendarData();
  const events = bundle.events.filter((item) => item.id !== id);
  saveCalendarData({ ...bundle, events });
  return events;
};

export const updateCalendarPreferences = (patch: Partial<CalendarPreferences>): CalendarPreferences => {
  const bundle = loadCalendarData();
  const preferences = { ...bundle.preferences, ...patch };
  saveCalendarData({ ...bundle, preferences });
  return preferences;
};

export const mergeCalendarBundles = (local: CalendarDataBundle, remote: CalendarDataBundle): CalendarDataBundle => {
  const journal = { ...remote.journal };
  for (const [iso, entry] of Object.entries(local.journal)) {
    const remoteEntry = remote.journal[iso];
    if (!remoteEntry || new Date(entry.updatedAt).getTime() >= new Date(remoteEntry.updatedAt).getTime()) {
      journal[iso] = entry;
    }
  }

  const eventsById = new Map<string, CalendarEvent>();
  for (const event of remote.events) eventsById.set(event.id, event);
  for (const event of local.events) {
    const prev = eventsById.get(event.id);
    if (!prev || new Date(event.updatedAt).getTime() >= new Date(prev.updatedAt).getTime()) {
      eventsById.set(event.id, event);
    }
  }

  const localPrefs = local.preferences;
  const remotePrefs = remote.preferences;
  const preferences: CalendarPreferences = {
    ...remotePrefs,
    browserNotifications: localPrefs.browserNotifications,
    emailReminders: localPrefs.emailReminders,
    reminderEmail: localPrefs.reminderEmail || remotePrefs.reminderEmail,
    sentReminderKeys: Array.from(new Set([...(remotePrefs.sentReminderKeys || []), ...(localPrefs.sentReminderKeys || [])])).slice(-500),
    lastSyncAt: new Date().toISOString(),
    serverRevision: remote.updatedAt,
  };

  return {
    version: 2,
    journal,
    events: Array.from(eventsById.values()),
    preferences,
    updatedAt: new Date().toISOString(),
  };
};
