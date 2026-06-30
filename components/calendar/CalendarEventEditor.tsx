import React, { useState } from 'react';
import { Bell, Mail, Trash2 } from 'lucide-react';
import { Language, getLang } from '../../constants';
import {
  CalendarEvent,
  CalendarEventKind,
  CalendarEventRecurrence,
  createCalendarEventId,
  deleteCalendarEvent,
  upsertCalendarEvent,
} from '../../utils/calendarStore';
import { getEventsForDate } from '../../utils/calendarReminders';
import { CALENDAR_EVENT_COPY } from '../../utils/calendarI18n';

type Props = {
  lang: Language;
  iso: string;
  events: CalendarEvent[];
  onChanged: () => void;
};

const fieldClass =
  'w-full rounded-xl border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/50 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-luna-purple/40';

export const CalendarEventEditor: React.FC<Props> = ({ lang, iso, events, onChanged }) => {
  const copy = getLang(CALENDAR_EVENT_COPY, lang);
  const dayEvents = getEventsForDate(events, iso);
  const [draft, setDraft] = useState<Partial<CalendarEvent>>({
    title: '',
    kind: 'reminder',
    date: iso,
    recurrence: 'none',
    time: '09:00',
    remindAtMinutes: [0, 1440],
    browserReminder: true,
    emailReminder: false,
    note: '',
  });

  const saveNew = () => {
    const title = String(draft.title || '').trim();
    if (!title) return;
    upsertCalendarEvent({
      id: createCalendarEventId(),
      title,
      kind: (draft.kind as CalendarEventKind) || 'reminder',
      date: iso,
      time: draft.time || '09:00',
      recurrence: (draft.recurrence as CalendarEventRecurrence) || 'none',
      note: String(draft.note || '').trim(),
      remindAtMinutes: draft.remindAtMinutes?.length ? draft.remindAtMinutes : [0],
      browserReminder: draft.browserReminder !== false,
      emailReminder: draft.emailReminder === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setDraft({
      title: '',
      kind: 'reminder',
      date: iso,
      recurrence: 'none',
      time: '09:00',
      remindAtMinutes: [0, 1440],
      browserReminder: true,
      emailReminder: false,
      note: '',
    });
    onChanged();
  };

  return (
    <div className="space-y-4 border-t border-slate-200/70 dark:border-slate-700/60 pt-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-luna-purple">{copy.sectionTitle}</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{copy.sectionHint}</p>
      </div>

      {dayEvents.length > 0 && (
        <ul className="space-y-2">
          {dayEvents.map((event) => (
            <li
              key={event.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/40 px-3 py-2"
            >
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{event.title}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {copy.kinds[event.kind]} · {copy.recurrence[event.recurrence]}
                  {event.time ? ` · ${event.time}` : ''}
                </p>
                <div className="flex gap-2 mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {event.browserReminder && (
                    <span className="inline-flex items-center gap-1"><Bell size={10} /> {copy.browser}</span>
                  )}
                  {event.emailReminder && (
                    <span className="inline-flex items-center gap-1"><Mail size={10} /> {copy.email}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  deleteCalendarEvent(event.id);
                  onChanged();
                }}
                className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500"
                aria-label={copy.delete}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 rounded-2xl border border-dashed border-luna-purple/30 bg-luna-purple/5 dark:bg-luna-purple/10 p-3">
        <input
          value={draft.title || ''}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          placeholder={copy.titlePlaceholder}
          className={fieldClass}
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={draft.kind}
            onChange={(e) => setDraft((prev) => ({ ...prev, kind: e.target.value as CalendarEventKind }))}
            className={fieldClass}
          >
            {(Object.keys(copy.kinds) as CalendarEventKind[]).map((kind) => (
              <option key={kind} value={kind}>{copy.kinds[kind]}</option>
            ))}
          </select>
          <select
            value={draft.recurrence}
            onChange={(e) => setDraft((prev) => ({ ...prev, recurrence: e.target.value as CalendarEventRecurrence }))}
            className={fieldClass}
          >
            {(Object.keys(copy.recurrence) as CalendarEventRecurrence[]).map((key) => (
              <option key={key} value={key}>{copy.recurrence[key]}</option>
            ))}
          </select>
        </div>
        <input
          type="time"
          value={draft.time || '09:00'}
          onChange={(e) => setDraft((prev) => ({ ...prev, time: e.target.value }))}
          className={fieldClass}
        />
        <textarea
          value={draft.note || ''}
          onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))}
          placeholder={copy.notePlaceholder}
          rows={2}
          className={`${fieldClass} resize-none`}
        />
        <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.browserReminder !== false}
              onChange={(e) => setDraft((prev) => ({ ...prev, browserReminder: e.target.checked }))}
            />
            {copy.browserNotify}
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.emailReminder === true}
              onChange={(e) => setDraft((prev) => ({ ...prev, emailReminder: e.target.checked }))}
            />
            {copy.emailNotify}
          </label>
        </div>
        <button
          type="button"
          onClick={saveNew}
          className="w-full rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.2em] py-2.5"
        >
          {copy.addEvent}
        </button>
      </div>
    </div>
  );
};
