export type DetailedReportTemplateInput = {
  logoUrl: string;
  signatureLogoUrl: string;
  phaseArcImageUrl: string;
  detailedTitle: string;
  detailedSubtitle: string;
  generatedAtLabel: string;
  generatedAtValue: string;
  patientIdLabel: string;
  patientIdValue: string;
  sourceLabel: string;
  sourceValue: string;
  allMarkersLabel: string;
  withinRangeLabel: string;
  outOfRangeLabel: string;
  quickOverviewLabel: string;
  naLabel: string;
  stableLabel: string;
  watchLabel: string;
  highPriorityLabel: string;
  sexualSnapshotTitle: string;
  sexualSummaryLabel: string;
  sexualPainLabel: string;
  sexualAvgPositive: number;
  sexualPain: number;
  dayLabel: string;
  dayValue: string | number;
  hormoneInfographicLabel: string;
  detectedMarkersLabel: string;
  hormoneSignalsLabel: string;
  keyFindingsLabel: string;
  clinicalFocusTitle: string;
  clinicalFocusLead: string;
  effectsTitle: string;
  risksTitle: string;
  recommendationsTitle: string;
  markerLabel: string;
  valueLabel: string;
  referenceLabel: string;
  statusLabel: string;
  categoryLabel: string;
  explanationLabel: string;
  whatHappeningLabel: string;
  doctorQuestionsLabel: string;
  noMarkersLabel: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  reportCopyright: string;
  totalMarkers: number;
  stabilityIndex: number;
  riskIndex: number;
  totalsNormal: number;
  totalsLow: number;
  totalsHigh: number;
  totalsUnknown: number;
  normalPct: number;
  lowPct: number;
  highPct: number;
  unknownPct: number;
  categoryRows: string;
  hormoneInfographicHtml: string;
  statusDistributionInfographic: string;
  topicLegendHtml: string;
  spotlightRows: string;
  findingsHtml: string;
  combinationCardsHtml: string;
  womenEffectsHtml: string;
  womenRisksHtml: string;
  womenRecommendationsHtml: string;
  markerRows: string;
  summaryHtml: string;
  doctorQuestionsHtml: string;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildDetailedReportHtml = (p: DetailedReportTemplateInput): string => `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(p.detailedTitle)}</title>
  <style>
    @page { size: A4; margin: 11mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; background: #eaf0f8; color: #0f172a; padding: 24px; }
    .report-root { max-width: 1040px; margin: 0 auto; background: white; border: 1px solid #cbd5e1; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 54px rgba(15,23,42,0.12); }
    .print-avoid { break-inside: avoid; page-break-inside: avoid; }
    @media print {
      body { background: #fff; padding: 0; }
      .report-root { max-width: 100%; border: none; border-radius: 0; box-shadow: none; }
      .print-avoid { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="report-root">
    <div style="padding:26px;background:linear-gradient(120deg,#ede9fe,#ffe4e6,#ccfbf1);border-bottom:2px solid #cbd5e1;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${p.logoUrl}" alt="Luna29 logo" style="width:62px;height:62px;object-fit:contain;border-radius:12px;background:#fff;padding:7px;border:1px solid #e2e8f0;"/>
          <div>
            <p style="margin:0;font-size:42px;line-height:1;font-family:'Brush Script MT','Segoe Script',cursive;">Luna29</p>
            <p style="margin:4px 0 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(p.detailedSubtitle)}</p>
          </div>
        </div>
        <div style="text-align:right;min-width:260px;">
          <p style="margin:0;font-size:12px;font-weight:700;">${escapeHtml(p.generatedAtLabel)}: ${escapeHtml(p.generatedAtValue)}</p>
          <p style="margin:5px 0 0;font-size:12px;">${escapeHtml(p.patientIdLabel)}: ${escapeHtml(p.patientIdValue)}</p>
          <p style="margin:5px 0 0;font-size:11px;color:#475569;">${escapeHtml(p.sourceLabel)}: ${escapeHtml(p.sourceValue)}</p>
        </div>
      </div>
    </div>

    <div class="print-avoid" style="padding:20px 24px 4px;">
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
        <div style="border:1px solid #dbeafe;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:14px;padding:12px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#1d4ed8;">${escapeHtml(p.allMarkersLabel)}</p>
          <p style="margin:0;font-size:34px;font-weight:900;color:#1e3a8a;">${p.totalMarkers}</p>
        </div>
        <div style="border:1px solid #dcfce7;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:14px;padding:12px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#047857;">${escapeHtml(p.withinRangeLabel)}</p>
          <p style="margin:0;font-size:34px;font-weight:900;color:#047857;">${p.stabilityIndex}%</p>
        </div>
        <div style="border:1px solid #fee2e2;background:linear-gradient(135deg,#fff1f2,#fee2e2);border-radius:14px;padding:12px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#b91c1c;">${escapeHtml(p.outOfRangeLabel)}</p>
          <p style="margin:0;font-size:34px;font-weight:900;color:#b91c1c;">${p.riskIndex}%</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px;">
        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">${escapeHtml(p.quickOverviewLabel)}</p>
          <div style="display:flex;height:12px;border-radius:999px;overflow:hidden;background:#e2e8f0;">
            <span style="width:${p.normalPct}%;background:#10b981;"></span>
            <span style="width:${p.lowPct}%;background:#f59e0b;"></span>
            <span style="width:${p.highPct}%;background:#f43f5e;"></span>
            <span style="width:${p.unknownPct}%;background:#64748b;"></span>
          </div>
          <p style="margin:8px 0 0;font-size:11px;color:#475569;">${escapeHtml(p.stableLabel)} ${p.totalsNormal} • ${escapeHtml(p.watchLabel)} ${p.totalsLow} • ${escapeHtml(p.highPriorityLabel)} ${p.totalsHigh} • ${escapeHtml(p.naLabel)} ${p.totalsUnknown}</p>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#f8fafc;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">${escapeHtml(p.sexualSnapshotTitle)}</p>
          <p style="margin:0;font-size:30px;font-weight:900;color:#7c3aed;">${Math.max(0, Math.min(100, Math.round(p.sexualAvgPositive * 20 - p.sexualPain * 8)))}%</p>
          <p style="margin:2px 0 0;font-size:11px;color:#475569;">${escapeHtml(p.sexualSummaryLabel)}: ${p.sexualAvgPositive}/5 • ${escapeHtml(p.sexualPainLabel)} ${p.sexualPain}/5</p>
        </div>
      </div>
    </div>

    <div class="print-avoid" style="padding:10px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(p.categoryLabel)}</h3>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">
        ${p.categoryRows || `<p style="margin:0;font-size:12px;color:#64748b;">${escapeHtml(p.noMarkersLabel)}</p>`}
      </div>
    </div>

    <div class="print-avoid" style="padding:12px 24px 0;">
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:10px;">
        <article style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#334155;">${escapeHtml(p.hormoneInfographicLabel)}</p>
          ${p.hormoneInfographicHtml}
        </article>
        <article style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#334155;">${escapeHtml(p.dayLabel)} ${escapeHtml(String(p.dayValue))}</p>
          <img src="${p.phaseArcImageUrl}" alt="Cycle arc" style="width:100%;height:88px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;"/>
        </article>
      </div>
    </div>

    <div class="print-avoid" style="padding:12px 24px 0;">
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:10px;">
        <article style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#334155;">${escapeHtml(p.detectedMarkersLabel)}</p>
          ${p.statusDistributionInfographic}
          <div style="margin-top:8px;">${p.topicLegendHtml}</div>
        </article>
        <article style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#f8fafc;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#334155;">${escapeHtml(p.hormoneSignalsLabel)}</p>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;">
            ${p.spotlightRows || `<p style="margin:0;font-size:12px;color:#64748b;">${escapeHtml(p.noMarkersLabel)}</p>`}
          </div>
        </article>
      </div>
    </div>

    <div class="print-avoid" style="padding:14px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(p.keyFindingsLabel)}</h3>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">
        <ul style="margin:0;padding-left:18px;font-size:13px;">${p.findingsHtml}</ul>
      </div>
    </div>

    <div class="print-avoid" style="padding:14px 24px 0;">
      <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(p.clinicalFocusTitle)}</h3>
      <p style="margin:0 0 10px;font-size:12px;color:#475569;">${escapeHtml(p.clinicalFocusLead)}</p>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
        ${p.combinationCardsHtml}
      </div>
    </div>

    <div class="print-avoid" style="padding:14px 24px 0;">
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
        <article style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#eff6ff;">
          <h4 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#1d4ed8;">${escapeHtml(p.effectsTitle)}</h4>
          <ul style="margin:0;padding-left:16px;font-size:12px;color:#1e293b;">${p.womenEffectsHtml}</ul>
        </article>
        <article style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#fff1f2;">
          <h4 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#be123c;">${escapeHtml(p.risksTitle)}</h4>
          <ul style="margin:0;padding-left:16px;font-size:12px;color:#1e293b;">${p.womenRisksHtml}</ul>
        </article>
        <article style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#ecfeff;">
          <h4 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;color:#0f766e;">${escapeHtml(p.recommendationsTitle)}</h4>
          <ul style="margin:0;padding-left:16px;font-size:12px;color:#1e293b;">${p.womenRecommendationsHtml}</ul>
        </article>
      </div>
    </div>

    <div class="print-avoid" style="padding:14px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(p.allMarkersLabel)}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f8fafc;text-transform:uppercase;font-size:11px;">
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(p.markerLabel)}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(p.valueLabel)}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(p.referenceLabel)}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(p.statusLabel)}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(p.categoryLabel)}</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(p.explanationLabel)}</th>
          </tr>
        </thead>
        <tbody>${p.markerRows || `<tr><td colspan="6" style="padding:10px;">${escapeHtml(p.noMarkersLabel)}</td></tr>`}</tbody>
      </table>
    </div>

    <div class="print-avoid" style="padding:16px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(p.whatHappeningLabel)}</h3>
      <p style="white-space:pre-wrap;line-height:1.68;border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;font-size:13px;">${p.summaryHtml}</p>
    </div>

    <div class="print-avoid" style="padding:16px 24px 0;">
      <h3 style="margin:0 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(p.doctorQuestionsLabel)}</h3>
      <div style="border:1px solid #e2e8f0;border-radius:10px;padding:12px;background:#f8fafc;">
        <ul style="margin:0;padding-left:18px;font-size:13px;">${p.doctorQuestionsHtml}</ul>
      </div>
    </div>

    <div class="print-avoid" style="padding:16px 24px 20px;">
      <div style="border:2px solid #b91c1c;border-radius:10px;padding:12px;background:#fef2f2;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#b91c1c;">${escapeHtml(p.disclaimerTitle)}</p>
        <p style="margin:0;font-size:12px;font-weight:700;color:#7f1d1d;line-height:1.55;">${escapeHtml(p.disclaimerBody)}</p>
      </div>
    </div>

    <div style="padding:14px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <p style="margin:0;font-size:11px;color:#475569;">${escapeHtml(p.reportCopyright)}</p>
      <img src="${p.signatureLogoUrl}" alt="Luna29 mark" style="width:26px;height:26px;object-fit:contain;opacity:0.9;"/>
    </div>
  </div>
</body>
</html>`;
