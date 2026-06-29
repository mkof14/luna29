export type CalendarDayJournal = {
  note: string;
  intention: string;
  gratitude: string;
  updatedAt: string;
};

export type CalendarJournalStore = Record<string, CalendarDayJournal>;

const STORAGE_KEY = 'luna_rhythm_calendar_journal_v1';

const emptyEntry = (): CalendarDayJournal => ({
  note: '',
  intention: '',
  gratitude: '',
  updatedAt: new Date().toISOString(),
});

export const loadCalendarJournal = (): CalendarJournalStore => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CalendarJournalStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const saveCalendarJournal = (store: CalendarJournalStore): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota or private mode
  }
};

export const getDayJournal = (iso: string, store?: CalendarJournalStore): CalendarDayJournal => {
  const data = store ?? loadCalendarJournal();
  return data[iso] ?? emptyEntry();
};

export const upsertDayJournal = (
  iso: string,
  patch: Partial<CalendarDayJournal>,
  store?: CalendarJournalStore,
): CalendarJournalStore => {
  const data = { ...(store ?? loadCalendarJournal()) };
  const prev = data[iso] ?? emptyEntry();
  data[iso] = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString()};
  saveCalendarJournal(data);
  return data;
};

export const hasJournalContent = (entry: CalendarDayJournal | undefined): boolean =>
  Boolean(entry && (entry.note.trim() || entry.intention.trim() || entry.gratitude.trim()));

export const journalSnippet = (entry: CalendarDayJournal | undefined, max = 28): string => {
  if (!entry) return '';
  const text = entry.note.trim() || entry.intention.trim() || entry.gratitude.trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
};
