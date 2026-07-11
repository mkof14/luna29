/**
 * UI-only dismiss / reminder prefs for Personal Health Profile entry points.
 * Not health-data authority — never store profile field values here.
 */

const TODAY_DISMISS_DATE_KEY = 'luna_hp_today_entry_dismissed_date_v1';
/** Legacy forever-dismiss key — ignored for once/day behavior. */
const TODAY_DISMISS_LEGACY_KEY = 'luna_hp_today_entry_dismissed_v1';
const LIVE_REMINDER_AT_KEY = 'luna_hp_live_reminder_at_v1';
/** Subtle Live reminder at most once every 3 days. */
const LIVE_REMINDER_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

const localDateKey = (now = new Date()) => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** True when the Today card was dismissed earlier today (local calendar day). */
export const isHealthProfileTodayCardDismissed = (now = new Date()): boolean =>
  read(TODAY_DISMISS_DATE_KEY) === localDateKey(now);

export const dismissHealthProfileTodayCard = (now = new Date()): void => {
  write(TODAY_DISMISS_DATE_KEY, localDateKey(now));
  try {
    localStorage.removeItem(TODAY_DISMISS_LEGACY_KEY);
  } catch {
    /* ignore */
  }
};

export const shouldShowHealthProfileLiveReminder = (now = Date.now()): boolean => {
  const raw = read(LIVE_REMINDER_AT_KEY);
  const last = raw ? Number(raw) : 0;
  if (!Number.isFinite(last) || last <= 0) return true;
  return now - last >= LIVE_REMINDER_COOLDOWN_MS;
};

export const markHealthProfileLiveReminderShown = (now = Date.now()): void => {
  write(LIVE_REMINDER_AT_KEY, String(now));
};
