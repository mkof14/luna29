import React, { useRef, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Upload,
  Watch,
} from 'lucide-react';
import { Language, getLang } from '../../constants';
import { HealthEvent } from '../../types';
import { CALENDAR_SYNC_COPY, CALENDAR_DEVICE_LABELS, googleCalendarImportHint } from '../../utils/calendarI18n';
import { buildIcsCalendar, downloadIcsFile, mergeImportedJournal, parseIcsNotes } from '../../utils/calendarIcs';

const actionBtn =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-300/70 dark:border-slate-600/70 bg-white/80 dark:bg-slate-900/60 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 hover:border-luna-purple/50 hover:text-luna-purple transition-all';

const deviceIconDefs = [
  { icon: Smartphone, key: 'phone' as const },
  { icon: Tablet, key: 'tablet' as const },
  { icon: Watch, key: 'watch' as const },
  { icon: Laptop, key: 'laptop' as const },
  { icon: Monitor, key: 'desktop' as const },
  { icon: Calendar, key: 'google' as const },
];

type Props = {
  lang: Language;
  year: number;
  month: number;
  log: HealthEvent[];
  currentCycleDay: number;
  cycleLength: number;
  onImported: () => void;
};

export const CalendarSyncPanel: React.FC<Props> = ({
  lang,
  year,
  month,
  log,
  currentCycleDay,
  cycleLength,
  onImported,
}) => {
  const copy = getLang(CALENDAR_SYNC_COPY, lang);
  const deviceLabels = getLang(CALENDAR_DEVICE_LABELS, lang);
  const [status, setStatus] = useState('');
  const [devicesOpen, setDevicesOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportMonth = () => {
    const ics = buildIcsCalendar({ year, month, log, currentCycleDay, cycleLength, lang });
    downloadIcsFile(ics, `luna29-${year}-${String(month + 1).padStart(2, '0')}.ics`);
  };

  const exportYear = () => {
    const ics = buildIcsCalendar({ year, log, currentCycleDay, cycleLength, lang });
    downloadIcsFile(ics, `luna29-calendar-${year}.ics`);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const parsed = parseIcsNotes(text);
    mergeImportedJournal(parsed);
    setStatus(copy.imported);
    onImported();
    window.setTimeout(() => setStatus(''), 2500);
  };

  return (
    <section className="rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/40 p-5 md:p-6 space-y-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-luna-purple">{copy.title}</p>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">{copy.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportMonth} className={actionBtn}>
          <Download size={13} /> {copy.exportIcs}
        </button>
        <button type="button" onClick={exportYear} className={actionBtn}>
          <Download size={13} /> {copy.exportYear}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className={actionBtn}>
          <Upload size={13} /> {copy.importIcs}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".ics,text/calendar"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = '';
          }}
        />
      </div>

      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setDevicesOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-white/50 dark:bg-slate-900/30 hover:bg-white/80 dark:hover:bg-slate-900/50 transition-colors"
          aria-expanded={devicesOpen}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
            {copy.devicesMenu}
          </span>
          <ChevronDown size={16} className={`text-luna-purple transition-transform ${devicesOpen ? 'rotate-180' : ''}`} />
        </button>
        {devicesOpen && (
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-200/60 dark:border-slate-700/50">
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
              {deviceIconDefs.map(({ icon: Icon, key }) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                >
                  <Icon size={13} className="text-luna-purple/75" />
                  {deviceLabels[key]}
                </span>
              ))}
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-600 dark:text-slate-300">{copy.google}:</strong>{' '}
              {googleCalendarImportHint(lang)}
            </p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{copy.appleHint}</p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{copy.outlookHint}</p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{copy.devices}</p>
          </div>
        )}
      </div>

      {status && <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">{status}</p>}
    </section>
  );
};
