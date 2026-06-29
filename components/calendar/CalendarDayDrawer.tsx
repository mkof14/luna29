import React, { useEffect, useRef, useState } from 'react';
import { Download, Mail, Printer, Share2, X } from 'lucide-react';
import { Language, getLang } from '../../constants';
import { HealthEvent } from '../../types';
import { CalendarDay, PHASE_CALENDAR_COLORS } from '../../utils/lunaCalendar';
import { CalendarDayJournal, upsertDayJournal } from '../../utils/calendarJournalStorage';
import { buildDayIcs, downloadIcsFile } from '../../utils/calendarIcs';
import { CALENDAR_DAY_DRAWER_COPY } from '../../utils/calendarI18n';
import { shareTextSafely } from '../../utils/share';

const actionBtn =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-300/70 dark:border-slate-600/70 bg-white/80 dark:bg-slate-900/60 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 hover:border-luna-purple/50 hover:text-luna-purple transition-all';

type Props = {
  day: CalendarDay | null;
  entry: CalendarDayJournal;
  lang: Language;
  log: HealthEvent[];
  currentCycleDay: number;
  cycleLength: number;
  onClose: () => void;
  onSaved: () => void;
};

export const CalendarDayDrawer: React.FC<Props> = ({
  day,
  entry,
  lang,
  log,
  currentCycleDay,
  cycleLength,
  onClose,
  onSaved,
}) => {
  const copy = getLang(CALENDAR_DAY_DRAWER_COPY, lang);
  const [note, setNote] = useState(entry.note);
  const [intention, setIntention] = useState(entry.intention);
  const [gratitude, setGratitude] = useState(entry.gratitude);
  const [status, setStatus] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNote(entry.note);
    setIntention(entry.intention);
    setGratitude(entry.gratitude);
  }, [entry, day?.iso]);

  if (!day) return null;

  const phase = day.marker.phase;
  const colors = phase ? PHASE_CALENDAR_COLORS[phase] : null;

  const save = () => {
    upsertDayJournal(day.iso, { note, intention, gratitude });
    setStatus(copy.saved);
    onSaved();
    window.setTimeout(() => setStatus(''), 2000);
  };

  const daySummary = [
    `${day.iso}`,
    phase ? `${copy.phase}: ${copy.phases[phase]}` : '',
    day.marker.cycleDay ? `${copy.cycleDay}: ${day.marker.cycleDay}` : '',
    note.trim() ? `${copy.note}: ${note.trim()}` : '',
    intention.trim() ? `${copy.intention}: ${intention.trim()}` : '',
    gratitude.trim() ? `${copy.gratitude}: ${gratitude.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const handleShare = async () => {
    const result = await shareTextSafely(daySummary, `Luna29 ${day.iso}`);
    setStatus(result === 'shared' ? copy.shared : result === 'copied' ? copy.copied : '');
    window.setTimeout(() => setStatus(''), 2000);
  };

  const handlePrint = () => {
    const prev = document.title;
    document.title = `Luna29-${day.iso}`;
    window.print();
    document.title = prev;
  };

  const handleDownload = () => {
    const ics = buildDayIcs(day.iso, log, currentCycleDay, cycleLength, lang);
    downloadIcsFile(ics, `luna29-${day.iso}.ics`);
  };

  const handleSend = () => {
    const subject = encodeURIComponent(`Luna29 — ${day.iso}`);
    const body = encodeURIComponent(`${daySummary}\n\n— Luna29 Balance`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const fieldClass =
    'w-full rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/50 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-luna-purple/40 resize-none';

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-6">
      <button type="button" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div
        ref={printRef}
        className="calendar-day-drawer relative w-full md:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[2rem] md:rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-[#faf8f6] dark:bg-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      >
        <div
          className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/60"
          style={colors ? { backgroundColor: colors.bg } : undefined}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{copy.dayTitle}</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{day.date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
              {phase && (
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  {copy.cycleDay} {day.marker.cycleDay} · {copy.phases[phase]}
                </p>
              )}
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 text-[9px] font-black uppercase tracking-wider text-slate-500">
            {day.marker.checkin && <span>{copy.checkin}</span>}
            {day.marker.voice && <span>{copy.voice}</span>}
            {day.marker.period && <span>{copy.period}</span>}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{copy.intention}</span>
            <input value={intention} onChange={(e) => setIntention(e.target.value)} className={fieldClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{copy.note}</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className={fieldClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{copy.gratitude}</span>
            <textarea value={gratitude} onChange={(e) => setGratitude(e.target.value)} rows={2} className={fieldClass} />
          </label>

          <div className="flex flex-wrap gap-2 calendar-day-drawer__actions">
            <button type="button" onClick={save} className={`${actionBtn} bg-luna-purple/10 border-luna-purple/40 text-luna-purple`}>
              {copy.save}
            </button>
            <button type="button" onClick={handleShare} className={actionBtn}><Share2 size={13} /> {copy.share}</button>
            <button type="button" onClick={handlePrint} className={actionBtn}><Printer size={13} /> {copy.print}</button>
            <button type="button" onClick={handleDownload} className={actionBtn}><Download size={13} /> {copy.download}</button>
            <button type="button" onClick={handleSend} className={actionBtn}><Mail size={13} /> {copy.send}</button>
          </div>
          {status && <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">{status}</p>}
        </div>
      </div>
    </div>
  );
};
