import { useEffect } from 'react';
import { loadCalendarData, saveCalendarData } from '../utils/calendarStore';
import {
  listReminderOccurrences,
  markReminderSent,
  wasReminderSent,
} from '../utils/calendarReminders';
import { dispatchCalendarEmailReminders } from '../services/calendarSyncService';

const DISPATCH_COOLDOWN_MS = 55_000;
let lastDispatchAt = 0;

export const requestBrowserNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
};

const showBrowserReminder = (title: string, body: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, tag: `luna-cal-${title.slice(0, 40)}` });
  } catch {
    // ignore
  }
};

export const runCalendarReminderTick = async (): Promise<void> => {
  const bundle = loadCalendarData();
  let prefs = bundle.preferences;
  const now = new Date();
  const windowStart = new Date(now.getTime() - 2 * 60_000);
  const windowEnd = new Date(now.getTime() + 60_000);
  const occurrences = listReminderOccurrences(bundle.events, windowStart, windowEnd);
  let prefsChanged = false;

  for (const item of occurrences) {
    if (!item.event.browserReminder || !prefs.browserNotifications) continue;
    if (wasReminderSent(prefs, item.reminderKey)) continue;
    const body = item.event.note?.trim() || item.iso;
    showBrowserReminder(item.event.title, body);
    prefs = markReminderSent(prefs, item.reminderKey);
    prefsChanged = true;
  }

  if (prefsChanged) {
    saveCalendarData({ ...bundle, preferences: prefs });
  }

  if (prefs.emailReminders && now.getTime() - lastDispatchAt > DISPATCH_COOLDOWN_MS) {
    lastDispatchAt = now.getTime();
    await dispatchCalendarEmailReminders();
  }
};

export const useCalendarReminderLoop = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return undefined;

    void runCalendarReminderTick();
    const id = window.setInterval(() => {
      void runCalendarReminderTick();
    }, 60_000);

    return () => window.clearInterval(id);
  }, [enabled]);
};
