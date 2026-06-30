import { DetailedReportTemplateInput } from './reportHtmlTemplate';

type MarkerStatus = 'low' | 'normal' | 'high' | 'unknown';

type ParsedLabValueLite = {
  marker: string;
  value: number;
  unit?: string;
  referenceMin?: number;
  referenceMax?: number;
};

type HormoneTopicMeta = {
  accent: string;
  label: string;
};

type HormoneTopicStat = {
  count: number;
  ratio: number;
  meta: HormoneTopicMeta;
};

type WomenInsightItem = {
  level: 'high' | 'watch' | 'stable';
  title: string;
  body: string;
};

type WomenClinicalInsights = {
  combinations: WomenInsightItem[];
  effects: string[];
  risks: string[];
  recommendations: string[];
};

type DetailedUi = {
  title: string;
  subtitle: string;
  keyFindings: string;
  explanation: string;
  whatHappening: string;
  doctorQuestions: string;
  noQuestions: string;
  noMarkers: string;
};

type MedFormUi = {
  generatedAt: string;
  patientId: string;
  source: string;
  allMarkers: string;
  disclaimerTitle: string;
  disclaimerBody: string;
};

type ReportsUi = {
  withinRange: string;
  outOfRange: string;
  quickOverview: string;
  na: string;
  day: string;
  hormoneInfographic: string;
  detectedMarkers: string;
  hormoneSignals: string;
  marker?: string;
  value?: string;
  reference?: string;
  status: string;
  privateIdentity: string;
  reportReadyBody: string;
};

type SexualUi = {
  sexualSnapshotTitle: string;
  summaryLabel: string;
  scoreLabels: { pain: string };
};

type WomenUi = {
  stable: string;
  watch: string;
  highPriority: string;
  clinicalFocusTitle: string;
  clinicalFocusLead: string;
  effectsTitle: string;
  risksTitle: string;
  recommendationsTitle: string;
  combinationsTitle: string;
  noData: string;
};

type BuildDetailedReportPayloadInput = {
  reportOrigin?: string;
  analysisText?: string;
  analysisSource: string;
  parsedValues: ParsedLabValueLite[];
  doctorQuestions: string[];
  hormoneTopicStats: HormoneTopicStat[];
  womenClinicalInsights: WomenClinicalInsights;
  sexualOverview: { avgPositive: number; pain: number };
  profileCycleDay: string;
  currentDay: number;
  reportIdentityLine: string;
  reportGeneratedAt: string;
  reportCopyright: string;
  detailedUi: DetailedUi;
  medForm: MedFormUi;
  reportsUi: ReportsUi;
  sexualUi: SexualUi;
  womenUi: WomenUi;
  markerCategory: (marker: string) => string;
  markerStatusExplanation: (status: MarkerStatus) => string;
  hormoneTopic: (text: string) => { accent: string; label: string };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const inferStatus = (value: number, referenceMin?: number, referenceMax?: number): MarkerStatus => {
  if (!Number.isFinite(value)) return 'unknown';
  if (!Number.isFinite(referenceMin as number) || !Number.isFinite(referenceMax as number)) return 'unknown';
  if (value < Number(referenceMin)) return 'low';
  if (value > Number(referenceMax)) return 'high';
  return 'normal';
};

export const buildDetailedReportPayload = (input: BuildDetailedReportPayloadInput): DetailedReportTemplateInput => {
  const {
    analysisText,
    reportOrigin,
    analysisSource,
    parsedValues,
    doctorQuestions,
    hormoneTopicStats,
    womenClinicalInsights,
    sexualOverview,
    profileCycleDay,
    currentDay,
    reportIdentityLine,
    reportGeneratedAt,
    reportCopyright,
    detailedUi,
    medForm,
    reportsUi,
    sexualUi,
    womenUi,
    markerCategory,
    markerStatusExplanation,
    hormoneTopic,
  } = input;

  const origin =
    reportOrigin || (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://luna.local');
  const logoUrl = `${origin}/brand/luna-lockup.png`;
  const signatureLogoUrl = `${origin}/images/Luna%20L%2044.png`;
  const phaseArcImageUrl = `${origin}/images/moon_phases_arc.webp`;
  const totals = parsedValues.reduce(
    (acc, item) => {
      const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
      if (status === 'normal') acc.normal += 1;
      else if (status === 'low') acc.low += 1;
      else if (status === 'high') acc.high += 1;
      else acc.unknown += 1;
      return acc;
    },
    { normal: 0, low: 0, high: 0, unknown: 0 },
  );
  const totalMarkers = parsedValues.length;
  const outOfRange = totals.low + totals.high;
  const riskIndex = totalMarkers ? Math.round((outOfRange / totalMarkers) * 100) : 0;
  const stabilityIndex = totalMarkers ? Math.round((totals.normal / totalMarkers) * 100) : 0;
  const categoryMap = parsedValues.reduce<Record<string, number>>((acc, item) => {
    const category = markerCategory(item.marker);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const categoryRows = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => {
      const width = totalMarkers ? Math.max(10, Math.round((count / totalMarkers) * 100)) : 10;
      return `<div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#334155;">
          <span>${escapeHtml(category)}</span><span>${count}</span>
        </div>
        <div style="height:8px;border-radius:999px;background:#e2e8f0;overflow:hidden;margin-top:4px;">
          <span style="display:block;height:100%;width:${width}%;background:linear-gradient(90deg,#7c3aed,#fb7185,#14b8a6);"></span>
        </div>
      </div>`;
    })
    .join('');

  const markerRows = parsedValues
    .map((item) => {
      const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
      const topic = hormoneTopic(item.marker);
      const reference =
        Number.isFinite(item.referenceMin as number) && Number.isFinite(item.referenceMax as number)
          ? `${item.referenceMin}-${item.referenceMax}`
          : (reportsUi.na || 'n/a');
      const explanation = markerStatusExplanation(status);
      const badge =
        status === 'normal'
          ? '#047857'
          : status === 'low'
            ? '#b45309'
            : status === 'high'
              ? '#be123c'
              : '#475569';
      const valueColor =
        status === 'normal'
          ? '#047857'
          : status === 'low'
            ? '#b45309'
            : status === 'high'
              ? '#be123c'
              : topic.accent;
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;"><span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${topic.accent};margin-right:6px;"></span><strong style="color:${topic.accent};">${escapeHtml(item.marker)}</strong></td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;"><strong style="color:${valueColor};font-size:14px;">${escapeHtml(`${item.value}${item.unit ? ` ${item.unit}` : ''}`)}</strong></td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;">${escapeHtml(reference)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;"><span style="display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid ${badge};color:${badge};font-weight:700;font-size:11px;text-transform:uppercase;">${status}</span></td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;color:${topic.accent};font-weight:700;">${escapeHtml(markerCategory(item.marker))}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top;line-height:1.5;">${escapeHtml(explanation)}</td>
      </tr>`;
    })
    .join('');

  const keyFindings = parsedValues
    .map((item) => ({ item, status: inferStatus(item.value, item.referenceMin, item.referenceMax) }))
    .filter((row) => row.status === 'low' || row.status === 'high')
    .slice(0, 6);

  const summary = escapeHtml(analysisText || reportsUi.reportReadyBody);
  const safeIdentity = escapeHtml(reportIdentityLine || reportsUi.privateIdentity);
  const safeAnalysisSource = escapeHtml(analysisSource);
  const findingsHtml = keyFindings.length
    ? keyFindings
        .map(({ item, status }) => `<li style="margin:0 0 6px;line-height:1.5;"><strong>${escapeHtml(item.marker)}</strong>: ${escapeHtml(markerStatusExplanation(status))}</li>`)
        .join('')
    : `<li style="margin:0;line-height:1.5;">${escapeHtml(detailedUi.noMarkers)}</li>`;

  const doctorQuestionsHtml = doctorQuestions.length
    ? doctorQuestions.map((question) => `<li style="margin:0 0 6px;line-height:1.5;">${escapeHtml(question)}</li>`).join('')
    : `<li style="margin:0;line-height:1.5;">${escapeHtml(detailedUi.noQuestions)}</li>`;

  const combinationCardsHtml = womenClinicalInsights.combinations.length
    ? womenClinicalInsights.combinations
        .map((item) => {
          const palette =
            item.level === 'high'
              ? { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', label: womenUi.highPriority }
              : item.level === 'watch'
                ? { bg: '#fffbeb', border: '#fde68a', text: '#b45309', label: womenUi.watch }
                : { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', label: womenUi.stable };
          return `<article style="border:1px solid ${palette.border};background:${palette.bg};border-radius:12px;padding:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
              <h4 style="margin:0;font-size:13px;font-weight:800;color:#0f172a;">${escapeHtml(item.title)}</h4>
              <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:${palette.text};">${escapeHtml(palette.label)}</span>
            </div>
            <p style="margin:0;font-size:12px;line-height:1.55;color:#334155;">${escapeHtml(item.body)}</p>
          </article>`;
        })
        .join('')
    : `<p style="margin:0;font-size:12px;color:#64748b;">${escapeHtml(womenUi.noData)}</p>`;

  const womenEffectsHtml = womenClinicalInsights.effects.map((item) => `<li style="margin:0 0 6px;line-height:1.5;">${escapeHtml(item)}</li>`).join('');
  const womenRisksHtml = womenClinicalInsights.risks.map((item) => `<li style="margin:0 0 6px;line-height:1.5;">${escapeHtml(item)}</li>`).join('');
  const womenRecommendationsHtml = womenClinicalInsights.recommendations.map((item) => `<li style="margin:0 0 6px;line-height:1.5;">${escapeHtml(item)}</li>`).join('');

  const statusDistributionInfographic = `<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;">
    <div style="padding:10px;border-radius:10px;background:#ecfdf5;border:1px solid #a7f3d0;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#047857;">${escapeHtml(womenUi.stable)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#047857;">${totals.normal}</p></div>
    <div style="padding:10px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#b45309;">${escapeHtml(womenUi.watch)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#b45309;">${totals.low}</p></div>
    <div style="padding:10px;border-radius:10px;background:#fff1f2;border:1px solid #fecdd3;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#be123c;">${escapeHtml(womenUi.highPriority)}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#be123c;">${totals.high}</p></div>
    <div style="padding:10px;border-radius:10px;background:#f1f5f9;border:1px solid #cbd5e1;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#475569;">${escapeHtml(reportsUi.na || 'n/a')}</p><p style="margin:2px 0 0;font-size:22px;font-weight:900;color:#475569;">${totals.unknown}</p></div>
  </div>`;

  const topicLegendHtml = hormoneTopicStats.length
    ? `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;">${hormoneTopicStats
        .map((entry) => `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:8px;background:#fff;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="width:10px;height:10px;border-radius:999px;background:${entry.meta.accent};display:inline-block;"></span>
            <strong style="font-size:11px;color:${entry.meta.accent};">${escapeHtml(entry.meta.label)}</strong>
          </div>
          <p style="margin:5px 0 0;font-size:18px;font-weight:900;color:#0f172a;">${entry.count}</p>
        </div>`)
        .join('')}</div>`
    : '';

  const spotlightRows = parsedValues
    .slice(0, 6)
    .map((item) => {
      const topic = hormoneTopic(item.marker);
      const status = inferStatus(item.value, item.referenceMin, item.referenceMax);
      const tone = status === 'high' ? '#fff1f2' : status === 'low' ? '#fffbeb' : status === 'normal' ? '#ecfdf5' : '#f8fafc';
      return `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:8px;background:${tone};">
        <p style="margin:0;font-size:11px;font-weight:800;color:${topic.accent};">${escapeHtml(item.marker)}</p>
        <p style="margin:3px 0 0;font-size:18px;font-weight:900;color:${topic.accent};">${escapeHtml(`${item.value}${item.unit ? ` ${item.unit}` : ''}`)}</p>
      </div>`;
    })
    .join('');

  const hormoneInfographicHtml = hormoneTopicStats.length
    ? hormoneTopicStats
        .map((item) => `<div style="margin-bottom:8px;">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:800;">
            <span style="color:${item.meta.accent};">${escapeHtml(item.meta.label)}</span>
            <span style="color:#475569;">${item.count}</span>
          </div>
          <div style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin-top:4px;">
            <span style="display:block;height:100%;width:${Math.max(item.ratio, 10)}%;background:${item.meta.accent};"></span>
          </div>
        </div>`)
        .join('')
    : `<p style="margin:0;font-size:12px;color:#64748b;">${escapeHtml(detailedUi.noMarkers)}</p>`;

  return {
    logoUrl,
    signatureLogoUrl,
    phaseArcImageUrl,
    detailedTitle: detailedUi.title,
    detailedSubtitle: detailedUi.subtitle,
    generatedAtLabel: medForm.generatedAt,
    generatedAtValue: reportGeneratedAt,
    patientIdLabel: medForm.patientId,
    patientIdValue: safeIdentity,
    sourceLabel: medForm.source,
    sourceValue: safeAnalysisSource,
    allMarkersLabel: medForm.allMarkers,
    withinRangeLabel: reportsUi.withinRange,
    outOfRangeLabel: reportsUi.outOfRange,
    quickOverviewLabel: reportsUi.quickOverview,
    naLabel: reportsUi.na || 'n/a',
    stableLabel: womenUi.stable,
    watchLabel: womenUi.watch,
    highPriorityLabel: womenUi.highPriority,
    sexualSnapshotTitle: sexualUi.sexualSnapshotTitle,
    sexualSummaryLabel: sexualUi.summaryLabel,
    sexualPainLabel: sexualUi.scoreLabels.pain,
    sexualAvgPositive: sexualOverview.avgPositive,
    sexualPain: sexualOverview.pain,
    dayLabel: reportsUi.day,
    dayValue: profileCycleDay || currentDay,
    hormoneInfographicLabel: reportsUi.hormoneInfographic,
    detectedMarkersLabel: reportsUi.detectedMarkers,
    hormoneSignalsLabel: reportsUi.hormoneSignals,
    keyFindingsLabel: detailedUi.keyFindings,
    clinicalFocusTitle: womenUi.clinicalFocusTitle,
    clinicalFocusLead: womenUi.clinicalFocusLead,
    effectsTitle: womenUi.effectsTitle,
    risksTitle: womenUi.risksTitle,
    recommendationsTitle: womenUi.recommendationsTitle,
    markerLabel: reportsUi.marker || 'Marker',
    valueLabel: reportsUi.value || 'Value',
    referenceLabel: reportsUi.reference || 'Reference',
    statusLabel: reportsUi.status,
    categoryLabel: womenUi.combinationsTitle,
    explanationLabel: detailedUi.explanation,
    whatHappeningLabel: detailedUi.whatHappening,
    doctorQuestionsLabel: detailedUi.doctorQuestions,
    noMarkersLabel: detailedUi.noMarkers,
    disclaimerTitle: medForm.disclaimerTitle,
    disclaimerBody: medForm.disclaimerBody,
    reportCopyright,
    totalMarkers,
    stabilityIndex,
    riskIndex,
    totalsNormal: totals.normal,
    totalsLow: totals.low,
    totalsHigh: totals.high,
    totalsUnknown: totals.unknown,
    normalPct: totalMarkers ? Math.round((totals.normal / totalMarkers) * 100) : 0,
    lowPct: totalMarkers ? Math.round((totals.low / totalMarkers) * 100) : 0,
    highPct: totalMarkers ? Math.round((totals.high / totalMarkers) * 100) : 0,
    unknownPct: totalMarkers ? Math.round((totals.unknown / totalMarkers) * 100) : 0,
    categoryRows,
    hormoneInfographicHtml,
    statusDistributionInfographic,
    topicLegendHtml,
    spotlightRows,
    findingsHtml,
    combinationCardsHtml,
    womenEffectsHtml,
    womenRisksHtml,
    womenRecommendationsHtml,
    markerRows,
    summaryHtml: summary,
    doctorQuestionsHtml,
  };
};
