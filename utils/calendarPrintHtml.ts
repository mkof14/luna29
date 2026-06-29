import { CyclePhase } from '../types';
import { CalendarJournalStore, journalSnippet } from './calendarJournalStorage';
import { CalendarMonthData, CalendarYearData, PHASE_CALENDAR_COLORS } from './lunaCalendar';

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const resolveAssetUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return path;
};

const printStyles = `
  @page { size: A4 portrait; margin: 10mm 8mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #334155; margin: 0; background: #fff; }
  .month { page-break-after: always; break-after: page; padding-bottom: 6mm; }
  .month:last-child { page-break-after: auto; }
  .hero {
    position: relative;
    margin-bottom: 5mm;
    background: #f5ebe4;
    border-radius: 4mm;
    overflow: hidden;
  }
  .hero-art {
    width: 100%;
    min-height: 130mm;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-art img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 168mm;
    object-fit: contain;
    object-position: center center;
  }
  .hero-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 38%;
    background: linear-gradient(to bottom, transparent, rgba(245, 235, 228, 0.95));
    pointer-events: none;
  }
  .hero h2 {
    position: absolute;
    left: 7mm;
    bottom: 5mm;
    margin: 0;
    font-size: 28pt;
    font-weight: 800;
    color: #334155;
    text-shadow: 0 1px 10px rgba(255, 255, 255, 0.92);
    z-index: 2;
  }
  .hero .brand {
    position: absolute;
    left: 7mm;
    top: 6mm;
    font-size: 8pt;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #64748b;
    z-index: 2;
    text-shadow: 0 1px 6px rgba(255, 255, 255, 0.85);
  }
  .weekdays, .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1.2mm; }
  .weekdays { margin-bottom: 1.5mm; }
  .wd { text-align: center; font-size: 7pt; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #94a3b8; }
  .cell { min-height: 14.5mm; border: 0.3mm solid #e2e8f0; border-radius: 2mm; padding: 1.2mm 1.8mm; position: relative; }
  .cell.out { opacity: 0.25; border-color: transparent; }
  .cell .day { font-size: 9pt; font-weight: 800; }
  .cell .note { font-size: 5.5pt; line-height: 1.2; margin-top: 1.5mm; color: #64748b; overflow: hidden; max-height: 7mm; }
  .cover { text-align: center; padding: 30mm 10mm; page-break-after: always; }
  .cover h1 { font-size: 32pt; margin: 0 0 6mm; }
  .cover p { font-size: 11pt; color: #64748b; }
  .legend { font-size: 6.5pt; color: #64748b; margin-top: 3mm; }
`;

export type PrintCopy = {
  brand: string;
  coverTitle: string;
  coverSub: string;
  legend: string;
  phases: Record<CyclePhase, string>;
};

const renderMonthSection = (
  month: CalendarMonthData,
  journal: CalendarJournalStore,
  weekdays: string[],
  copy: PrintCopy,
): string => {
  const wd = weekdays.map((d) => `<div class="wd">${escapeHtml(d)}</div>`).join('');
  const cells = month.days
    .map((day) => {
      if (!day.inMonth) {
        return `<div class="cell out"><span class="day">${day.date.getDate()}</span></div>`;
      }
      const phase = day.marker.phase;
      const bg = phase ? PHASE_CALENDAR_COLORS[phase].bg : '#fff';
      const note = journalSnippet(journal[day.iso], 48);
      const markers = [
        day.marker.checkin ? '•' : '',
        day.marker.voice ? '◦' : '',
        day.marker.period ? '—' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<div class="cell" style="background:${bg}">
        <span class="day">${day.date.getDate()}</span>
        ${note ? `<div class="note">${escapeHtml(note)}</div>` : ''}
        ${markers ? `<div class="note" style="margin-top:1mm">${markers}</div>` : ''}
      </div>`;
    })
    .join('');

  return `<section class="month">
    <div class="hero">
      <span class="brand">${escapeHtml(copy.brand)}</span>
      <div class="hero-art">
        <img src="${escapeHtml(resolveAssetUrl(month.heroImage))}" alt="" crossorigin="anonymous" />
      </div>
      <div class="hero-fade"></div>
      <h2>${escapeHtml(month.monthLabel)}</h2>
    </div>
    <div class="weekdays">${wd}</div>
    <div class="grid">${cells}</div>
    <p class="legend">${escapeHtml(copy.legend)}</p>
  </section>`;
};

const wrapPrintDocument = (title: string, body: string): string =>
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${printStyles}</style>
</head>
<body>${body}</body>
</html>`;

export const buildMonthPrintHtml = (
  month: CalendarMonthData,
  journal: CalendarJournalStore,
  weekdays: string[],
  copy: PrintCopy,
): string =>
  wrapPrintDocument(
    `Luna29 ${month.monthLabel}`,
    renderMonthSection(month, journal, weekdays, copy),
  );

export const buildYearPrintHtml = (
  yearData: CalendarYearData,
  journal: CalendarJournalStore,
  weekdays: string[],
  copy: PrintCopy,
): string => {
  const monthHtml = yearData.months
    .map((month) => renderMonthSection(month, journal, weekdays, copy))
    .join('\n');
  const cover = `<section class="cover">
    <p class="brand">${escapeHtml(copy.brand)}</p>
    <h1>${escapeHtml(copy.coverTitle)} ${yearData.year}</h1>
    <p>${escapeHtml(copy.coverSub)}</p>
  </section>`;
  return wrapPrintDocument(`Luna29 Calendar ${yearData.year}`, `${cover}${monthHtml}`);
};

export const downloadHtmlFile = (html: string, filename: string): void => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const waitForImages = (doc: Document): Promise<void> =>
  new Promise((resolve) => {
    const imgs = Array.from(doc.querySelectorAll('img'));
    if (imgs.length === 0) {
      resolve();
      return;
    }
    let done = 0;
    const check = () => {
      done += 1;
      if (done >= imgs.length) resolve();
    };
    imgs.forEach((img) => {
      if (img.complete) check();
      else {
        img.addEventListener('load', check, { once: true });
        img.addEventListener('error', check, { once: true });
      }
    });
  });

/** Opens print dialog via hidden iframe — reliable without pop-up blockers. */
export const openPrintHtml = (html: string, title: string): void => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', title);
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(iframe);

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1500);
  };

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument ?? win?.document;
  if (!doc || !win) {
    downloadHtmlFile(html, `${title.replace(/\s+/g, '-')}.html`);
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  void waitForImages(doc).then(() => {
    window.setTimeout(() => {
      win.focus();
      win.print();
      cleanup();
    }, 400);
  });
};

/** @deprecated use openPrintHtml */
export const openYearPrintPdf = openPrintHtml;
