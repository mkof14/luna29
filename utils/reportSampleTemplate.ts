type SampleReportRow = {
  marker: string;
  value: string;
  reference: string;
  status: string;
  category: string;
  explanation: string;
  accent: string;
};

type BuildSampleReportHtmlInput = {
  logoUrl: string;
  phaseArcImageUrl: string;
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
  servicePromise: string;
  serviceBullets: string[];
  stableLabel: string;
  highPriorityLabel: string;
  watchLabel: string;
  hormoneSignalsLabel: string;
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
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildLocalizedSampleReportHtml = (input: BuildSampleReportHtmlInput): string => {
  const sampleSpotlight = input.rows
    .map(
      (row) => `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:8px;background:#f8fafc;">
        <p style="margin:0;font-size:11px;font-weight:800;color:${row.accent};">${escapeHtml(row.marker)}</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:900;color:${row.accent};">${escapeHtml(row.value)}</p>
      </div>`
    )
    .join('');

  const rowsHtml = input.rows
    .map(
      (row) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;"><strong style="color:${row.accent};">${escapeHtml(row.marker)}</strong></td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;"><strong style="color:${row.accent};font-size:14px;">${escapeHtml(row.value)}</strong></td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row.reference)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row.status)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;color:${row.accent};font-weight:700;">${escapeHtml(row.category)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row.explanation)}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(input.reportTitle)} - ${escapeHtml(input.sampleTitle)}</title><style>@page{size:A4;margin:11mm;}*{box-sizing:border-box;}body{margin:0;font-family:Arial,sans-serif;background:#f1f5f9;color:#0f172a;padding:24px;} .sample-root{max-width:960px;margin:0 auto;background:#fff;border:1px solid #cbd5e1;border-radius:16px;overflow:hidden;} @media print{body{background:#fff;padding:0;}.sample-root{max-width:100%;border:none;border-radius:0;}}</style></head><body><div class="sample-root"><div style="padding:22px;background:linear-gradient(135deg,#f3e8ff,#ffe4e6,#ccfbf1);border-bottom:2px solid #cbd5e1;"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><div style="display:flex;align-items:center;gap:10px;"><img src="${input.logoUrl}" alt="Luna29 logo" style="width:52px;height:52px;object-fit:contain;border-radius:10px;background:#fff;padding:6px;border:1px solid #e2e8f0;"/><div><p style="margin:0;font-size:34px;line-height:1;font-family:'Brush Script MT','Segoe Script',cursive;">Luna29</p><p style="margin:2px 0 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(input.subtitle)} - ${escapeHtml(input.sampleTitle)}</p></div></div><div style="text-align:right;"><p style="margin:0;font-size:11px;font-weight:700;">${escapeHtml(input.generatedAtLabel)}: ${escapeHtml(input.generatedAtValue)}</p><p style="margin:4px 0 0;font-size:11px;">${escapeHtml(input.patientIdLabel)}: SAMPLE-001</p></div></div></div><div style="padding:20px 22px;"><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;"><div style="padding:10px;border-radius:10px;background:#ecfdf5;border:1px solid #a7f3d0;"><p style="margin:0;font-size:10px;font-weight:800;text-transform:uppercase;color:#047857;">${escapeHtml(input.stableLabel)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#047857;">2</p></div><div style="padding:10px;border-radius:10px;background:#fff1f2;border:1px solid #fecdd3;"><p style="margin:0;font-size:10px;font-weight:800;text-transform:uppercase;color:#be123c;">${escapeHtml(input.highPriorityLabel)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#be123c;">1</p></div><div style="padding:10px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;"><p style="margin:0;font-size:10px;font-weight:800;text-transform:uppercase;color:#b45309;">${escapeHtml(input.watchLabel)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#b45309;">1</p></div></div><div style="display:grid;grid-template-columns:1.2fr 1fr;gap:8px;margin-top:10px;"><article style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;background:#f8fafc;"><p style="margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;color:#334155;">${escapeHtml(input.hormoneSignalsLabel)}</p><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;">${sampleSpotlight}</div></article><article style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;background:#f8fafc;"><p style="margin:0 0 8px;font-size:11px;font-weight:800;text-transform:uppercase;color:#334155;">${escapeHtml(input.dayLabel)} ${input.cycleDayValue}</p><img src="${input.phaseArcImageUrl}" alt="Cycle visual" style="width:100%;height:90px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;"/></article></div><table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;"><tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>${escapeHtml(input.panelLabel)}</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">${escapeHtml(input.dayLabel)} 21</td><td style="padding:8px;border:1px solid #e2e8f0;">${escapeHtml(input.sexualSummaryLabel)} 3.5/5 | ${escapeHtml(input.painLabel)} 2/5</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>${escapeHtml(input.sourceLabel)}</strong></td><td colspan="2" style="padding:8px;border:1px solid #e2e8f0;">${escapeHtml(input.textInputSourceLabel)} + ${escapeHtml(input.manualTableSourceLabel)}</td></tr></table><h3 style="margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(input.allMarkersLabel)}</h3><table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;"><thead><tr style="background:#f8fafc;text-transform:uppercase;font-size:11px;"><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(input.markerLabel)}</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(input.valueLabel)}</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(input.referenceLabel)}</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(input.statusLabel)}</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(input.categoryLabel)}</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(input.explanationLabel)}</th></tr></thead><tbody>${rowsHtml}</tbody></table><h3 style="margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(input.clinicalFocusTitle)}</h3><div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;"><p style="margin:0 0 8px;font-size:12px;font-weight:800;">${escapeHtml(input.estProgTitle)}</p><p style="margin:0 0 10px;font-size:12px;line-height:1.55;">${escapeHtml(input.estProgBody)}</p><p style="margin:0 0 8px;font-size:12px;font-weight:800;">${escapeHtml(input.insulinAndrogenTitle)}</p><p style="margin:0;font-size:12px;line-height:1.55;">${escapeHtml(input.insulinAndrogenBody)}</p></div><h3 style="margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(input.recommendationsTitle)}</h3><ul style="margin:0;padding-left:18px;font-size:12px;line-height:1.55;border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#ecfeff;"><li>${escapeHtml(input.recCycle)}</li><li>${escapeHtml(input.recRepeat)}</li><li>${escapeHtml(input.recDoctor)}</li><li>${escapeHtml(input.recLifestyle)}</li></ul><h3 style="margin:18px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(input.summaryLabel)}</h3><p style="white-space:pre-wrap;line-height:1.6;border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">${escapeHtml(input.servicePromise)}\n• ${input.serviceBullets.map(escapeHtml).join('\n• ')}</p><div style="margin-top:18px;border:2px solid #b91c1c;border-radius:10px;padding:12px;background:#fef2f2;"><p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#b91c1c;">${escapeHtml(input.disclaimerTitle)}</p><p style="margin:0;font-size:12px;font-weight:700;color:#7f1d1d;line-height:1.55;">${escapeHtml(input.disclaimerBody)}</p></div></div><div style="padding:12px 22px;border-top:1px solid #e2e8f0;background:#f8fafc;"><p style="margin:0;font-size:11px;color:#475569;">${escapeHtml(input.reportCopyright)}</p></div></div></body></html>`;
};
