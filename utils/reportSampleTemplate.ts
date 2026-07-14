type SampleReportRow = {
  marker: string;
  value: string;
  reference: string;
  status: string;
  category: string;
  explanation: string;
  accent: string;
};

export type BuildSampleReportHtmlInput = {
  logoUrl: string;
  phaseArcImageUrl: string;
  siteUrl: string;
  reportTitle: string;
  sampleTitle: string;
  subtitle: string;
  generatedAtLabel: string;
  generatedAtValue: string;
  patientIdLabel: string;
  panelLabel: string;
  sourceLabel: string;
  allMarkersLabel: string;
  summaryLabel: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  reportCopyright: string;
  siteAddressLabel: string;
  servicePromise: string;
  serviceBullets: string[];
  stableLabel: string;
  highPriorityLabel: string;
  watchLabel: string;
  hormoneSignalsLabel: string;
  cycleVisualLabel: string;
  dayLabel: string;
  cycleDayValue: number;
  sexualSummaryLabel: string;
  painLabel: string;
  markerLabel: string;
  valueLabel: string;
  referenceLabel: string;
  statusLabel: string;
  categoryLabel: string;
  explanationLabel: string;
  textInputSourceLabel: string;
  manualTableSourceLabel: string;
  clinicalFocusTitle: string;
  estProgTitle: string;
  estProgBody: string;
  insulinAndrogenTitle: string;
  insulinAndrogenBody: string;
  recommendationsTitle: string;
  recCycle: string;
  recRepeat: string;
  recDoctor: string;
  recLifestyle: string;
  rows: SampleReportRow[];
};

const escapeHtml = (value: string): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Inline SVG if photo asset fails — keeps Cycle visual from looking empty. */
export const CYCLE_VISUAL_SVG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220" role="img">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ede9fe"/>
      <stop offset="50%" stop-color="#fce7f3"/>
      <stop offset="100%" stop-color="#ccfbf1"/>
    </linearGradient>
  </defs>
  <rect width="640" height="220" rx="18" fill="url(#sky)"/>
  <path d="M40 150 C160 40, 480 40, 600 150" fill="none" stroke="#7c3aed" stroke-width="6" stroke-linecap="round"/>
  <circle cx="70" cy="138" r="16" fill="#cbd5e1"/><circle cx="70" cy="138" r="16" fill="#0f172a" opacity=".35"/>
  <circle cx="180" cy="78" r="18" fill="#e2e8f0"/><circle cx="188" cy="78" r="18" fill="#0f172a" opacity=".2"/>
  <circle cx="320" cy="58" r="20" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="460" cy="78" r="18" fill="#e2e8f0"/><circle cx="452" cy="78" r="18" fill="#0f172a" opacity=".25"/>
  <circle cx="570" cy="138" r="16" fill="#0f172a"/>
  <text x="320" y="198" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#475569">Cycle day visual</text>
</svg>`);

const sectionTitle = (label: string, accent = '#6d28d9') =>
  `<div style="display:flex;align-items:center;gap:10px;margin:0 0 12px;">
    <span style="width:8px;height:28px;border-radius:999px;background:${accent};display:inline-block;"></span>
    <h2 style="margin:0;font-size:15px;letter-spacing:0.08em;text-transform:uppercase;color:#0f172a;">${escapeHtml(label)}</h2>
  </div>`;

const statusChip = (status: string) => {
  const key = String(status || '').toLowerCase();
  const tone =
    key.includes('high') ? { bg: '#fff1f2', fg: '#be123c', bd: '#fecdd3' } :
    key.includes('low') ? { bg: '#fffbeb', fg: '#b45309', bd: '#fde68a' } :
    { bg: '#ecfdf5', fg: '#047857', bd: '#a7f3d0' };
  return `<span style="display:inline-block;padding:3px 8px;border-radius:999px;border:1px solid ${tone.bd};background:${tone.bg};color:${tone.fg};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(status)}</span>`;
};

export const buildLocalizedSampleReportHtml = (input: BuildSampleReportHtmlInput): string => {
  const siteUrl = String(input.siteUrl || 'https://www.luna29.com').replace(/\/+$/, '');
  const year = new Date().getFullYear();
  const logoSrc = input.logoUrl || '';
  const cycleSrc = input.phaseArcImageUrl || CYCLE_VISUAL_SVG;

  const sampleSpotlight = input.rows
    .map(
      (row) => `<div style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:linear-gradient(180deg,#ffffff,#f8fafc);box-shadow:0 1px 0 rgba(15,23,42,0.04);">
        <p style="margin:0;font-size:11px;font-weight:800;color:${row.accent};letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(row.marker)}</p>
        <p style="margin:8px 0 0;font-size:22px;font-weight:900;color:#0f172a;line-height:1;">${escapeHtml(row.value)}</p>
        <p style="margin:6px 0 0;font-size:11px;color:#64748b;">${escapeHtml(row.reference)}</p>
        <div style="margin-top:8px;">${statusChip(row.status)}</div>
      </div>`,
    )
    .join('');

  const rowsHtml = input.rows
    .map(
      (row) => `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;"><strong style="color:${row.accent};">${escapeHtml(row.marker)}</strong></td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:800;">${escapeHtml(row.value)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">${escapeHtml(row.reference)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${statusChip(row.status)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${row.accent};">${escapeHtml(row.category)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;">${escapeHtml(row.explanation)}</td>
      </tr>`,
    )
    .join('');

  const bullets = (input.serviceBullets || [])
    .map((b) => `<li style="margin:0 0 6px;">${escapeHtml(b)}</li>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(input.reportTitle)} — ${escapeHtml(input.sampleTitle)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, Arial, Helvetica, sans-serif; background: #eef2ff; color: #0f172a; padding: 28px 16px; }
    .sample-root { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #c7d2fe; border-radius: 22px; overflow: hidden; box-shadow: 0 24px 60px rgba(76,29,149,0.12); }
    .section { padding: 22px 26px; border-top: 1px solid #e2e8f0; }
    .section:first-of-type { border-top: none; }
    .muted { color: #64748b; }
    @media print {
      body { background: #fff; padding: 0; }
      .sample-root { max-width: 100%; border: none; border-radius: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="sample-root">
    <header style="padding:26px;background:linear-gradient(135deg,#ede9fe 0%,#fce7f3 48%,#ccfbf1 100%);border-bottom:2px solid #c7d2fe;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:14px;min-width:240px;">
          <img src="${logoSrc}" alt="Luna29 logo" width="64" height="64" style="width:64px;height:64px;object-fit:contain;border-radius:14px;background:#fff;padding:8px;border:1px solid #e2e8f0;"/>
          <div>
            <p style="margin:0;font-size:36px;line-height:1;font-weight:800;letter-spacing:-0.02em;">Luna29</p>
            <p style="margin:6px 0 0;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#5b21b6;">${escapeHtml(input.sampleTitle)}</p>
            <p class="muted" style="margin:4px 0 0;font-size:12px;">${escapeHtml(input.subtitle)}</p>
          </div>
        </div>
        <div style="text-align:right;background:rgba(255,255,255,0.72);border:1px solid #e2e8f0;border-radius:14px;padding:12px 14px;min-width:220px;">
          <p style="margin:0;font-size:12px;font-weight:700;">${escapeHtml(input.generatedAtLabel)}: ${escapeHtml(input.generatedAtValue)}</p>
          <p class="muted" style="margin:6px 0 0;font-size:12px;">${escapeHtml(input.patientIdLabel)}: SAMPLE-001</p>
          <p style="margin:8px 0 0;font-size:12px;font-weight:700;"><a href="${escapeHtml(siteUrl)}/" style="color:#6d28d9;text-decoration:none;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a></p>
        </div>
      </div>
    </header>

    <section class="section" style="background:#fafafa;">
      ${sectionTitle(input.summaryLabel, '#6d28d9')}
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;">
        <div style="padding:14px;border-radius:16px;background:#ecfdf5;border:1px solid #a7f3d0;">
          <p style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;color:#047857;">${escapeHtml(input.stableLabel)}</p>
          <p style="margin:6px 0 0;font-size:32px;font-weight:900;color:#047857;">2</p>
        </div>
        <div style="padding:14px;border-radius:16px;background:#fff1f2;border:1px solid #fecdd3;">
          <p style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;color:#be123c;">${escapeHtml(input.highPriorityLabel)}</p>
          <p style="margin:6px 0 0;font-size:32px;font-weight:900;color:#be123c;">1</p>
        </div>
        <div style="padding:14px;border-radius:16px;background:#fffbeb;border:1px solid #fde68a;">
          <p style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;color:#b45309;">${escapeHtml(input.watchLabel)}</p>
          <p style="margin:6px 0 0;font-size:32px;font-weight:900;color:#b45309;">1</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:14px;">
        <article style="border:1px solid #e2e8f0;border-radius:18px;padding:16px;background:#fff;">
          ${sectionTitle(input.hormoneSignalsLabel, '#db2777')}
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">${sampleSpotlight}</div>
        </article>
        <article style="border:1px solid #e2e8f0;border-radius:18px;padding:16px;background:linear-gradient(180deg,#faf5ff,#ffffff);">
          ${sectionTitle(input.cycleVisualLabel || `${input.dayLabel} ${input.cycleDayValue}`, '#0891b2')}
          <p class="muted" style="margin:0 0 10px;font-size:12px;font-weight:700;">${escapeHtml(input.dayLabel)} ${input.cycleDayValue}</p>
          <div style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;background:#f1f5f9;min-height:120px;">
            <img src="${cycleSrc}" alt="Cycle visual" width="640" height="220" style="display:block;width:100%;height:140px;object-fit:cover;background:#f1f5f9;"/>
          </div>
          <p style="margin:10px 0 0;font-size:12px;color:#475569;">${escapeHtml(input.sexualSummaryLabel)} 3.5/5 · ${escapeHtml(input.painLabel)} 2/5</p>
        </article>
      </div>
    </section>

    <section class="section" style="background:#f8fafc;">
      ${sectionTitle(input.panelLabel, '#ea580c')}
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#fff;">
          <p class="muted" style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;">${escapeHtml(input.panelLabel)}</p>
          <p style="margin:6px 0 0;font-size:16px;font-weight:800;">${escapeHtml(input.dayLabel)} 21</p>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#fff;">
          <p class="muted" style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;">${escapeHtml(input.sourceLabel)}</p>
          <p style="margin:6px 0 0;font-size:13px;font-weight:700;">${escapeHtml(input.textInputSourceLabel)} + ${escapeHtml(input.manualTableSourceLabel)}</p>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#fff;">
          <p class="muted" style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;">Luna29</p>
          <p style="margin:6px 0 0;font-size:13px;font-weight:700;"><a href="${escapeHtml(siteUrl)}/" style="color:#6d28d9;text-decoration:none;">${escapeHtml(siteUrl)}</a></p>
        </div>
      </div>
    </section>

    <section class="section">
      ${sectionTitle(input.allMarkersLabel, '#7c3aed')}
      <div style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f5f3ff;text-transform:uppercase;font-size:11px;letter-spacing:0.04em;">
              <th style="text-align:left;padding:10px 12px;">${escapeHtml(input.markerLabel)}</th>
              <th style="text-align:left;padding:10px 12px;">${escapeHtml(input.valueLabel)}</th>
              <th style="text-align:left;padding:10px 12px;">${escapeHtml(input.referenceLabel)}</th>
              <th style="text-align:left;padding:10px 12px;">${escapeHtml(input.statusLabel)}</th>
              <th style="text-align:left;padding:10px 12px;">${escapeHtml(input.categoryLabel)}</th>
              <th style="text-align:left;padding:10px 12px;">${escapeHtml(input.explanationLabel)}</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </section>

    <section class="section" style="background:#fafafa;">
      ${sectionTitle(input.clinicalFocusTitle, '#db2777')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <article style="border:1px solid #fbcfe8;border-radius:16px;padding:14px;background:#fff;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#9d174d;">${escapeHtml(input.estProgTitle)}</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#334155;">${escapeHtml(input.estProgBody)}</p>
        </article>
        <article style="border:1px solid #a5f3fc;border-radius:16px;padding:14px;background:#fff;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#0e7490;">${escapeHtml(input.insulinAndrogenTitle)}</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#334155;">${escapeHtml(input.insulinAndrogenBody)}</p>
        </article>
      </div>
    </section>

    <section class="section">
      ${sectionTitle(input.recommendationsTitle, '#0891b2')}
      <ul style="margin:0;padding:14px 14px 14px 32px;font-size:13px;line-height:1.6;border:1px solid #a5f3fc;border-radius:16px;background:#ecfeff;">
        <li>${escapeHtml(input.recCycle)}</li>
        <li>${escapeHtml(input.recRepeat)}</li>
        <li>${escapeHtml(input.recDoctor)}</li>
        <li>${escapeHtml(input.recLifestyle)}</li>
      </ul>
      <div style="margin-top:14px;border:1px solid #e2e8f0;border-radius:16px;padding:14px;background:#f8fafc;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;">${escapeHtml(input.servicePromise)}</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.55;">${bullets}</ul>
      </div>
    </section>

    <section class="section">
      <div style="border:2px solid #b91c1c;border-radius:16px;padding:14px;background:#fef2f2;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#b91c1c;">${escapeHtml(input.disclaimerTitle)}</p>
        <p style="margin:0;font-size:12px;font-weight:700;color:#7f1d1d;line-height:1.55;">${escapeHtml(input.disclaimerBody)}</p>
      </div>
    </section>

    <footer style="padding:18px 26px;border-top:1px solid #e2e8f0;background:#0f172a;color:#e2e8f0;">
      <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center;">
        <div>
          <p style="margin:0;font-size:12px;font-weight:800;">© ${year} Luna29 Balance Systems</p>
          <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">${escapeHtml(input.reportCopyright)}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#cbd5e1;">${escapeHtml(input.siteAddressLabel)}: <a href="${escapeHtml(siteUrl)}/" style="color:#c4b5fd;text-decoration:none;">${escapeHtml(siteUrl)}</a></p>
        </div>
        <img src="${logoSrc}" alt="Luna29" width="40" height="40" style="width:40px;height:40px;object-fit:contain;border-radius:10px;background:#fff;padding:4px;"/>
      </div>
    </footer>
  </div>
</body>
</html>`;
};
