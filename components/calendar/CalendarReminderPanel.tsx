import React, { useState } from 'react';
import { Bell, Cloud, Mail, RefreshCw } from 'lucide-react';
import { Language, getLang } from '../../constants';
import { loadCalendarData, updateCalendarPreferences } from '../../utils/calendarStore';
import { getUpcomingEvents } from '../../utils/calendarReminders';
import { CALENDAR_REMINDER_PANEL_COPY } from '../../utils/calendarI18n';
import { getCalendarSyncStatus, syncCalendarData } from '../../services/calendarSyncService';
import { requestBrowserNotificationPermission } from '../../hooks/useCalendarReminders';

type Props = {
  lang: Language;
  memberEmail?: string;
  onChanged: () => void;
};

export const CalendarReminderPanel: React.FC<Props> = ({ lang, memberEmail, onChanged }) => {
  const copy = getLang(CALENDAR_REMINDER_PANEL_COPY, lang);
  const [prefs, setPrefs] = useState(() => loadCalendarData().preferences);
  const [syncLabel, setSyncLabel] = useState(copy.syncIdle);
  const upcoming = getUpcomingEvents(loadCalendarData().events, new Date(), 5);

  const savePrefs = (patch: Partial<typeof prefs>) => {
    const next = updateCalendarPreferences(patch);
    setPrefs(next);
    onChanged();
  };

  const runSync = async () => {
    setSyncLabel(copy.syncing);
    await syncCalendarData();
    const { status } = getCalendarSyncStatus();
    setSyncLabel(status === 'synced' ? copy.synced : status === 'error' ? copy.syncError : copy.syncIdle);
    onChanged();
  };

  const enableBrowser = async () => {
    const permission = await requestBrowserNotificationPermission();
    savePrefs({ browserNotifications: permission === 'granted' });
  };

  return (
    <section className="rounded-xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-700/50">
        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-luna-purple">{copy.title}</p>
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">{copy.subtitle}</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void runSync()} className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-300/70 dark:border-slate-600/70 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 hover:border-luna-purple/50 hover:text-luna-purple">
            <RefreshCw size={13} /> {copy.syncNow}
          </button>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500"><Cloud size={12} /> {syncLabel}</span>
        </div>

        <div className="space-y-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.browserNotifications}
              onChange={(e) => {
                if (e.target.checked) void enableBrowser();
                else savePrefs({ browserNotifications: false });
              }}
            />
            <Bell size={12} /> {copy.browserLabel}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prefs.emailReminders}
              onChange={(e) => savePrefs({ emailReminders: e.target.checked, reminderEmail: prefs.reminderEmail || memberEmail || '' })}
            />
            <Mail size={12} /> {copy.emailLabel}
          </label>
          {prefs.emailReminders && (
            <input
              type="email"
              value={prefs.reminderEmail || memberEmail || ''}
              onChange={(e) => savePrefs({ reminderEmail: e.target.value })}
              placeholder={copy.emailPlaceholder}
              className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/50 px-3 py-2 text-sm"
            />
          )}
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{copy.emailHint}</p>
        </div>

        {upcoming.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{copy.upcoming}</p>
            <ul className="space-y-1.5">
              {upcoming.map(({ event, iso }) => (
                <li key={`${event.id}-${iso}`} className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span className="text-luna-purple">{iso}</span> · {event.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
