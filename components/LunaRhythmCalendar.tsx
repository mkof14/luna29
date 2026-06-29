import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, getLang } from '../constants';
import { CyclePhase, HealthEvent } from '../types';
import { CALENDAR_MAIN_COPY, CALENDAR_WEEKDAYS } from '../utils/calendarI18n';
import {
  buildCalendarMonth,
  buildCalendarSummaryText,
  buildCalendarYear,
  buildYearSummaryText,
  CalendarDay,
  CalendarMonthData,
  PHASE_CALENDAR_COLORS,
} from '../utils/lunaCalendar';
import { shareTextSafely } from '../utils/share';
import {
  CalendarJournalStore,
  getDayJournal,
  hasJournalContent,
  journalSnippet,
  loadCalendarJournal,
} from '../utils/calendarJournalStorage';
import { buildIcsCalendar, downloadIcsFile } from '../utils/calendarIcs';
import { buildMonthPrintHtml, buildYearPrintHtml, openPrintHtml } from '../utils/calendarPrintHtml';
import { CalendarDayDrawer } from './calendar/CalendarDayDrawer';
import { CalendarToolsPanel } from './calendar/CalendarToolsPanel';

interface LunaRhythmCalendarProps {
  lang: Language;
  log: HealthEvent[];
  currentCycleDay: number;
  cycleLength: number;
  mode?: 'page';
  onBack?: () => void;
}

type ViewScope = 'month' | 'year';

const actionBtn =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-300/70 dark:border-slate-600/70 bg-white/80 dark:bg-slate-900/60 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-200 hover:border-luna-purple/50 hover:text-luna-purple transition-all';

const scopeBtn = (active: boolean) =>
  `px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
    active
      ? 'bg-luna-purple text-white shadow-[0_8px_24px_rgba(109,92,121,0.28)]'
      : 'border border-slate-300/70 dark:border-slate-600/70 text-slate-500 dark:text-slate-300 hover:border-luna-purple/40'
  }`;

type MonthBlockProps = {
  monthData: CalendarMonthData;
  weekdays: string[];
  copy: (typeof CALENDAR_MAIN_COPY)['en'];
  compact?: boolean;
  journal: CalendarJournalStore;
  onDayClick: (day: CalendarDay) => void;
};

const CalendarMonthHero: React.FC<{ monthData: CalendarMonthData; heroSize?: 'month' | 'year' }> = ({
  monthData,
  heroSize = 'month',
}) => (
  <div
    className={`luna-rhythm-calendar__hero relative w-full overflow-hidden bg-[#f5ebe4] dark:bg-[#0f172a] ${
      heroSize === 'year'
        ? 'pt-12 md:pt-16 min-h-[780px] md:min-h-[960px] lg:min-h-[1020px]'
        : 'pt-10 md:pt-14 min-h-[340px] sm:min-h-[400px] md:min-h-[460px] lg:min-h-[500px]'
    }`}
  >
    <img
      src={monthData.heroImage}
      alt=""
      aria-hidden
      className={`absolute inset-x-0 bottom-0 w-full object-contain ${
        heroSize === 'year'
          ? 'top-12 md:top-16 h-[calc(100%-3rem)] md:h-[calc(100%-4rem)] object-[center_48%] scale-[1.02]'
          : 'top-10 md:top-14 h-[calc(100%-2.5rem)] md:h-[calc(100%-3.5rem)] object-[center_52%]'
      }`}
    />
    <div className="member-hero-art__fade pointer-events-none absolute inset-x-0 bottom-0" />
    <div
      className={`absolute inset-x-0 bg-gradient-to-b from-[#f5ebe4]/90 to-transparent dark:from-[#0f172a]/90 pointer-events-none ${
        heroSize === 'year' ? 'top-12 md:top-16 h-20 md:h-24' : 'top-10 md:top-14 h-16'
      }`}
    />
    <div
      className={`absolute left-6 md:left-8 z-10 space-y-1 ${
        heroSize === 'year' ? 'top-16 md:top-20' : 'top-14 md:top-[4.5rem]'
      }`}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/85 drop-shadow-md">Luna29</p>
      <h4
        className={`font-black tracking-tight text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.45)] ${
          heroSize === 'year' ? 'text-3xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-4xl'
        }`}
      >
        {monthData.monthLabel}
      </h4>
    </div>
  </div>
);

const CalendarMonthGrid: React.FC<MonthBlockProps> = ({ monthData, weekdays, copy, compact, journal, onDayClick }) => (
  <div className={`space-y-3 ${compact ? 'p-4 md:p-5' : 'p-5 md:p-8'}`}>
    <div className="luna-rhythm-calendar__grid">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 py-1"
          >
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthData.days.map((day) => {
          const phase = day.marker.phase;
          const colors = phase ? PHASE_CALENDAR_COLORS[phase] : null;
          const entry = journal[day.iso];
          const snippet = journalSnippet(entry);
          const hasNote = hasJournalContent(entry);
          return (
            <button
              type="button"
              key={day.iso}
              disabled={!day.inMonth}
              onClick={() => day.inMonth && onDayClick(day)}
              className={`luna-rhythm-calendar__cell relative min-h-[4.5rem] rounded-xl border text-left transition-all ${
                day.inMonth
                  ? 'border-slate-200/80 dark:border-slate-700/60 hover:ring-2 hover:ring-luna-purple/35 cursor-pointer'
                  : 'border-transparent opacity-30 cursor-default'
              } ${day.isToday ? 'ring-2 ring-luna-purple/60 ring-offset-2 ring-offset-[#faf8f6] dark:ring-offset-slate-900' : ''}`}
              style={day.inMonth && colors ? { backgroundColor: colors.bg } : undefined}
              title={
                day.inMonth && phase
                  ? `${day.date.getDate()} · ${copy.phases[phase]}${snippet ? ` · ${snippet}` : ''}`
                  : undefined
              }
            >
              <span
                className={`absolute top-1.5 left-2 text-[11px] font-black tabular-nums ${
                  day.inMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300'
                }`}
              >
                {day.date.getDate()}
              </span>
              {day.inMonth && snippet && (
                <span className="absolute top-7 left-2 right-2 text-[8px] font-semibold leading-tight text-slate-600/90 dark:text-slate-300/90 line-clamp-2">
                  {snippet}
                </span>
              )}
              {day.inMonth && hasNote && (
                <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-amber-500/90" aria-hidden />
              )}
              {day.inMonth && day.marker.checkin && (
                <span className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-luna-purple" aria-hidden />
              )}
              {day.inMonth && day.marker.voice && (
                <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full border-2 border-[#c85fb6]" aria-hidden />
              )}
              {day.inMonth && day.marker.period && (
                <span className="absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-rose-400/80" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const CalendarMonthBlock: React.FC<MonthBlockProps & { showHero?: boolean; heroSize?: 'month' | 'year' }> = ({
  monthData,
  weekdays,
  copy,
  compact,
  journal,
  onDayClick,
  showHero = true,
  heroSize = 'month',
}) => (
  <div className="luna-rhythm-calendar__month-page overflow-hidden">
    {showHero && <CalendarMonthHero monthData={monthData} heroSize={heroSize} />}
    <CalendarMonthGrid
      monthData={monthData}
      weekdays={weekdays}
      copy={copy}
      compact={compact}
      journal={journal}
      onDayClick={onDayClick}
    />
  </div>
);

export const LunaRhythmCalendar: React.FC<LunaRhythmCalendarProps> = ({
  lang,
  log,
  currentCycleDay,
  cycleLength,
  onBack,
}) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [scope, setScope] = useState<ViewScope>('month');
  const [status, setStatus] = useState('');
  const [printYearMode, setPrintYearMode] = useState(false);
  const [journal, setJournal] = useState<CalendarJournalStore>(() => loadCalendarJournal());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const copy = getLang(CALENDAR_MAIN_COPY, lang);
  const weekdays = getLang(CALENDAR_WEEKDAYS, lang);

  const monthData = useMemo(
    () => buildCalendarMonth(viewYear, viewMonth, log, currentCycleDay, cycleLength, lang),
    [viewYear, viewMonth, log, currentCycleDay, cycleLength, lang],
  );

  const yearData = useMemo(
    () => buildCalendarYear(viewYear, log, currentCycleDay, cycleLength, lang),
    [viewYear, log, currentCycleDay, cycleLength, lang],
  );

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const shiftYear = (delta: number) => setViewYear((y) => y + delta);

  const summaryText =
    scope === 'year' ? buildYearSummaryText(yearData, lang) : buildCalendarSummaryText(monthData, lang);

  const handleShare = async () => {
    const label = scope === 'year' ? yearData.yearLabel : monthData.monthLabel;
    const result = await shareTextSafely(summaryText, `Luna29 ${label}`);
    setStatus(result === 'shared' ? copy.shared : result === 'copied' ? copy.copied : '');
    window.setTimeout(() => setStatus(''), 2500);
  };

  const runPrint = (title: string, yearOnly = false) => {
    const prev = document.title;
    document.title = title;
    if (yearOnly) {
      setPrintYearMode(true);
      window.setTimeout(() => {
        window.print();
        setPrintYearMode(false);
        document.title = prev;
      }, 120);
      return;
    }
    window.print();
    document.title = prev;
  };

  const handlePrint = () => {
    if (scope === 'year') {
      runPrint(`Luna29-Calendar-${viewYear}`, true);
      return;
    }
    runPrint(`Luna29-${monthData.monthLabel.replace(/\s+/g, '-')}`);
  };

  const handleDownloadMonth = () => {
    const ics = buildIcsCalendar({
      year: viewYear,
      month: viewMonth,
      log,
      currentCycleDay,
      cycleLength,
      lang,
      journal,
    });
    downloadIcsFile(ics, `luna29-${viewYear}-${String(viewMonth + 1).padStart(2, '0')}.ics`);
  };

  const handleDownloadYearIcs = () => {
    const ics = buildIcsCalendar({
      year: viewYear,
      log,
      currentCycleDay,
      cycleLength,
      lang,
      journal,
    });
    downloadIcsFile(ics, `luna29-calendar-${viewYear}.ics`);
  };

  const printCopy = {
    brand: 'Luna29',
    coverTitle: copy.printCoverTitle,
    coverSub: copy.printCoverSub,
    legend: copy.legend,
    phases: copy.phases};

  const handleDownloadMonthPdf = () => {
    const html = buildMonthPrintHtml(monthData, journal, weekdays, printCopy);
    openPrintHtml(html, `Luna29-${monthData.monthLabel.replace(/\s+/g, '-')}`);
  };

  const handleDownloadYearPdf = () => {
    const html = buildYearPrintHtml(yearData, journal, weekdays, printCopy);
    openPrintHtml(html, `Luna29-Calendar-${viewYear}`);
  };

  const handleSend = () => {
    const label = scope === 'year' ? yearData.yearLabel : monthData.monthLabel;
    const subject = encodeURIComponent(`Luna29 — ${label}`);
    const body = encodeURIComponent(`${summaryText}\n\n— Luna29 Balance`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const showYearPrint = printYearMode || scope === 'year';
  const openDay = (day: CalendarDay) => setSelectedDay(day);

  const scopeLabel = scope === 'year' ? `${copy.yearView} · ${viewYear}` : monthData.monthLabel;

  const footerBlock = (
    <div className="luna-rhythm-calendar__footer-wrap px-5 md:px-8 pb-8 pt-4 space-y-5 border-t border-slate-200/50 dark:border-slate-700/40">
      <CalendarToolsPanel
        lang={lang}
        scopeLabel={scopeLabel}
        year={viewYear}
        month={viewMonth}
        log={log}
        currentCycleDay={currentCycleDay}
        cycleLength={cycleLength}
        onShare={handleShare}
        onPrint={handlePrint}
        onDownloadPdfMonth={handleDownloadMonthPdf}
        onDownloadPdfYear={handleDownloadYearPdf}
        onDownloadMonthIcs={handleDownloadMonth}
        onDownloadYearIcs={handleDownloadYearIcs}
        onSend={handleSend}
        onImported={() => setJournal(loadCalendarJournal())}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {(scope === 'year'
          ? [
              { label: copy.yearStats, value: viewYear },
              { label: copy.cycleDay, value: yearData.stats.currentCycleDay },
              { label: copy.checkins, value: yearData.stats.checkins },
              { label: copy.voice, value: yearData.stats.voiceNotes },
            ]
          : [
              { label: copy.cycleDay, value: monthData.stats.currentCycleDay },
              { label: copy.phase, value: copy.phases[monthData.stats.currentPhase] },
              { label: copy.checkins, value: monthData.stats.checkins },
              { label: copy.voice, value: monthData.stats.voiceNotes },
            ]
        ).map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/45 px-3 py-3"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{copy.legend}</p>

      <div className="flex flex-wrap gap-3">
        {(Object.values(CyclePhase) as CyclePhase[]).map((phase) => {
          const c = PHASE_CALENDAR_COLORS[phase];
          return (
            <span
              key={phase}
              className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500"
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.dot }} />
              {copy.phases[phase]}
            </span>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
    <section
      id="luna-rhythm-calendar"
      className="luna-rhythm-calendar luna-rhythm-calendar-page rounded-[2rem] border border-slate-300/60 dark:border-slate-700/60 overflow-hidden shadow-[0_20px_60px_rgba(109,92,121,0.12)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
      aria-label={copy.title}
    >
      <div ref={printRef} className="luna-rhythm-calendar__print-root">
        <div className="luna-rhythm-calendar__toolbar bg-[linear-gradient(180deg,rgba(255,252,250,0.98),rgba(248,242,246,0.96))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(17,28,51,0.96))] px-5 md:px-8 py-6 space-y-5 border-b border-slate-200/60 dark:border-slate-700/50">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="luna-rhythm-calendar__back text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all"
            >
              ← Menu
            </button>
          )}

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-luna-purple">{copy.bonus}</p>
            <h3 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-slate-50">{copy.title}</h3>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-2xl">{copy.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setScope('month')} className={scopeBtn(scope === 'month' && !printYearMode)}>
              {copy.monthView}
            </button>
            <button type="button" onClick={() => setScope('year')} className={scopeBtn(scope === 'year' || printYearMode)}>
              {copy.yearView}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => (scope === 'year' ? shiftYear(-1) : shiftMonth(-1))}
                className={actionBtn}
                aria-label="Previous"
              >
                <ChevronLeft size={14} />
              </button>
              <p className="text-lg md:text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 min-w-[10rem] text-center">
                {scope === 'year' ? viewYear : monthData.monthLabel}
              </p>
              <button
                type="button"
                onClick={() => (scope === 'year' ? shiftYear(1) : shiftMonth(1))}
                className={actionBtn}
                aria-label="Next"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {status && <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">{status}</p>}
        </div>

        {showYearPrint ? (
          <div className="luna-rhythm-calendar__year bg-[#faf8f6] dark:bg-slate-950">
            {yearData.months.map((m) => (
              <CalendarMonthBlock
                key={m.month}
                monthData={m}
                weekdays={weekdays}
                copy={copy}
                compact
                heroSize="year"
                showHero
                journal={journal}
                onDayClick={openDay}
              />
            ))}
            {footerBlock}
          </div>
        ) : (
          <div className="bg-[linear-gradient(180deg,rgba(255,252,250,0.98),rgba(248,242,246,0.96))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(17,28,51,0.96))]">
            <CalendarMonthBlock
              monthData={monthData}
              weekdays={weekdays}
              copy={copy}
              showHero
              journal={journal}
              onDayClick={openDay}
            />
            {footerBlock}
          </div>
        )}
      </div>
    </section>

    {selectedDay && (
      <CalendarDayDrawer
        day={selectedDay}
        entry={getDayJournal(selectedDay.iso, journal)}
        lang={lang}
        log={log}
        currentCycleDay={currentCycleDay}
        cycleLength={cycleLength}
        onClose={() => setSelectedDay(null)}
        onSaved={() => setJournal(loadCalendarJournal())}
      />
    )}
    </>
  );
};
