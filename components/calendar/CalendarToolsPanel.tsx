import React, { useRef, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Laptop,
  Mail,
  Monitor,
  Printer,
  Share2,
  Smartphone,
  Tablet,
  Upload,
  Watch,
} from 'lucide-react';
import { Language, getLang } from '../../constants';
import { HealthEvent } from '../../types';
import {
  CALENDAR_DEVICE_LABELS,
  CALENDAR_TOOLS_COPY,
  googleCalendarImportHint,
} from '../../utils/calendarI18n';
import { mergeImportedJournal, parseIcsNotes } from '../../utils/calendarIcs';
import { CalendarReminderPanel } from './CalendarReminderPanel';

const btn =
  'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/45 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-200 hover:border-luna-purple/45 hover:text-luna-purple transition-all text-left';

type Props = {
  lang: Language;
  scopeLabel: string;
  year: number;
  month: number;
  log: HealthEvent[];
  currentCycleDay: number;
  cycleLength: number;
  onShare: () => void;
  onPrint: () => void;
  onDownloadPdfMonth: () => void;
  onDownloadPdfYear: () => void;
  onDownloadMonthIcs: () => void;
  onDownloadYearIcs: () => void;
  onSend: () => void;
  onImported: () => void;
  memberEmail?: string;
  syncEnabled?: boolean;
  onCalendarChanged: () => void;
};

export const CalendarToolsPanel: React.FC<Props> = ({
  lang,
  scopeLabel,
  onShare,
  onPrint,
  onDownloadPdfMonth,
  onDownloadPdfYear,
  onDownloadMonthIcs,
  onDownloadYearIcs,
  onSend,
  onImported,
  memberEmail,
  syncEnabled,
  onCalendarChanged,
}) => {
  const copy = getLang(CALENDAR_TOOLS_COPY, lang);
  const deviceLabels = getLang(CALENDAR_DEVICE_LABELS, lang);
  const [open, setOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const deviceIcons = [
    { icon: Smartphone, label: deviceLabels.phone },
    { icon: Tablet, label: deviceLabels.tablet },
    { icon: Watch, label: deviceLabels.watch },
    { icon: Laptop, label: deviceLabels.laptop },
    { icon: Monitor, label: deviceLabels.desktop },
    { icon: Calendar, label: deviceLabels.google },
  ];

  const handleImport = async (file: File) => {
    const text = await file.text();
    mergeImportedJournal(parseIcsNotes(text));
    setStatus(copy.imported);
    onImported();
    window.setTimeout(() => setStatus(''), 2500);
  };

  return (
    <div className="luna-rhythm-calendar__footer rounded-[1.75rem] border border-slate-200/70 dark:border-slate-700/60 overflow-hidden bg-white/50 dark:bg-slate-900/35">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/60 dark:hover:bg-slate-900/50 transition-colors"
        aria-expanded={open}
      >
        <span>
          <span className="block text-[9px] font-black uppercase tracking-[0.28em] text-luna-purple">{copy.panelTitle}</span>
          <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{scopeLabel}</span>
        </span>
        <ChevronDown size={18} className={`shrink-0 text-luna-purple transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-200/60 dark:border-slate-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button type="button" onClick={onShare} className={btn}><Share2 size={14} /> {copy.share}</button>
            <button type="button" onClick={onPrint} className={btn}><Printer size={14} /> {copy.print}</button>
            <button type="button" onClick={onDownloadPdfMonth} className={`${btn} border-luna-purple/30 text-luna-purple`}>
              <FileText size={14} /> {copy.downloadPdfMonth}
            </button>
            <button type="button" onClick={onDownloadPdfYear} className={`${btn} border-luna-purple/30 text-luna-purple`}>
              <FileText size={14} /> {copy.downloadPdfYear}
            </button>
            <button type="button" onClick={onDownloadMonthIcs} className={btn}><Download size={14} /> {copy.downloadMonthIcs}</button>
            <button type="button" onClick={onDownloadYearIcs} className={btn}><Download size={14} /> {copy.downloadYearIcs}</button>
            <button type="button" onClick={onSend} className={btn}><Mail size={14} /> {copy.send}</button>
          </div>

          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{copy.pdfHint}</p>

          <CalendarReminderPanel lang={lang} memberEmail={memberEmail} onChanged={onCalendarChanged} />

          <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
            <p className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/80 dark:bg-slate-900/40">
              {copy.syncTitle}
            </p>
            <div className="p-3 flex flex-wrap gap-2">
              <button type="button" onClick={onDownloadMonthIcs} className={`${btn} w-auto flex-1 min-w-[8rem]`}>
                <Download size={13} /> {copy.downloadMonthIcs}
              </button>
              <button type="button" onClick={onDownloadYearIcs} className={`${btn} w-auto flex-1 min-w-[8rem]`}>
                <Download size={13} /> {copy.downloadYearIcs}
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className={`${btn} w-auto flex-1 min-w-[8rem]`}>
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
          </div>

          <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setDevicesOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left bg-slate-50/80 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 transition-colors"
              aria-expanded={devicesOpen}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{copy.devicesMenu}</span>
              <ChevronDown size={14} className={`text-luna-purple transition-transform ${devicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {devicesOpen && (
              <div className="px-3 pb-3 pt-2 space-y-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {deviceIcons.map(({ icon: Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                      <Icon size={12} className="text-luna-purple/70" /> {label}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-600 dark:text-slate-300">{copy.google}:</strong> {googleCalendarImportHint(lang)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{copy.appleHint}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{copy.outlookHint}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{copy.devices}</p>
              </div>
            )}
          </div>

          {status && <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">{status}</p>}
        </div>
      )}
    </div>
  );
};
