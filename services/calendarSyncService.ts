import {
  CalendarDataBundle,
  loadCalendarData,
  mergeCalendarBundles,
  saveCalendarData,
  updateCalendarPreferences,
} from '../utils/calendarStore';

const apiUrl = (path: string) => {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
  const base =
    fromEnv &&
    !fromEnv.includes('localhost') &&
    !fromEnv.includes('127.0.0.1')
      ? fromEnv.replace(/\/$/, '')
      : '';
  return `${base}${path}`;
};

type SyncResponse = {
  data: CalendarDataBundle | null;
  updatedAt?: string;
};

export type CalendarSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

let syncStatus: CalendarSyncStatus = 'idle';
let lastError = '';

export const getCalendarSyncStatus = () => ({ status: syncStatus, error: lastError });

export const pullCalendarFromServer = async (): Promise<CalendarDataBundle | null> => {
  const response = await fetch(apiUrl('/api/calendar/data'), { credentials: 'include' });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Could not load calendar from server.');
  const payload = (await response.json()) as SyncResponse;
  return payload.data;
};

export const pushCalendarToServer = async (bundle: CalendarDataBundle): Promise<CalendarDataBundle | null> => {
  const response = await fetch(apiUrl('/api/calendar/data'), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: bundle }),
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Could not save calendar to server.');
  const payload = (await response.json()) as SyncResponse;
  return payload.data;
};

export const syncCalendarData = async (): Promise<CalendarDataBundle> => {
  syncStatus = 'syncing';
  lastError = '';
  const local = loadCalendarData();
  try {
    const remote = await pullCalendarFromServer();
    if (!remote) {
      syncStatus = 'offline';
      return local;
    }
    const merged = mergeCalendarBundles(local, remote);
    saveCalendarData(merged);
    const pushed = await pushCalendarToServer(merged);
    if (pushed) {
      const finalBundle = mergeCalendarBundles(merged, pushed);
      saveCalendarData(finalBundle);
      updateCalendarPreferences({ lastSyncAt: new Date().toISOString(), serverRevision: pushed.updatedAt });
      syncStatus = 'synced';
      return finalBundle;
    }
    syncStatus = 'synced';
    return merged;
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    syncStatus = 'error';
    return local;
  }
};

export const dispatchCalendarEmailReminders = async (): Promise<{ fired: number; skipped?: string }> => {
  const response = await fetch(apiUrl('/api/calendar/reminders/dispatch'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (response.status === 401) return { fired: 0, skipped: 'auth' };
  if (!response.ok) return { fired: 0, skipped: 'error' };
  return (await response.json()) as { fired: number; skipped?: string };
};
