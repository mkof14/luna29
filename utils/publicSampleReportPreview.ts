import { Language } from '../constants';
import { getLabsViewLocalizedContent } from './labsViewContent';
import { buildLocalizedSampleReportHtml } from './reportSampleTemplate';

const SAMPLE_ACCENTS = ['#7c3aed', '#db2777', '#ea580c', '#0891b2'];

const downloadHtml = (filename: string, html: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export async function buildPublicSampleReportHtml(lang: Language): Promise<string> {
  const {
    reportUi,
    medForm,
    reportsUi,
    detailedUi,
    womenUi,
    sexualUi,
    reportSourcesUi,
  } = getLabsViewLocalizedContent(lang, lang);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.luna29.com';
  const generatedAt = new Intl.DateTimeFormat(getLabsViewLocalizedContent(lang, lang).locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const rows = [
    { marker: 'Estradiol (E2)', value: '148 pg/mL', reference: '30-400', status: 'normal', category: 'Hormonal', explanation: detailedUi.statusNormal, accent: SAMPLE_ACCENTS[0] },
    { marker: 'Progesterone', value: '8.1 ng/mL', reference: '0.2-25', status: 'normal', category: 'Hormonal', explanation: detailedUi.statusNormal, accent: SAMPLE_ACCENTS[1] },
    { marker: 'TSH', value: '4.8 mIU/L', reference: '0.4-4.0', status: 'high', category: 'Thyroid', explanation: detailedUi.statusHigh, accent: SAMPLE_ACCENTS[2] },
    { marker: 'Ferritin', value: '18 ng/mL', reference: '15-150', status: 'low-normal', category: 'Iron', explanation: detailedUi.statusLow, accent: SAMPLE_ACCENTS[3] },
  ];

  return buildLocalizedSampleReportHtml({
    logoUrl: `${origin}/brand/luna-lockup.png`,
    phaseArcImageUrl: `${origin}/images/moon_phases_arc.webp`,
    reportTitle: reportUi.reportTitle,
    sampleTitle: reportUi.sampleTitle,
    subtitle: detailedUi.subtitle,
    generatedAtLabel: medForm.generatedAt,
    generatedAtValue: generatedAt,
    patientIdLabel: medForm.patientId,
    panelLabel: medForm.panel,
    sourceLabel: medForm.source,
    allMarkersLabel: medForm.allMarkers,
    summaryLabel: medForm.summary,
    disclaimerTitle: medForm.disclaimerTitle,
    disclaimerBody: medForm.disclaimerBody,
    reportCopyright: 'Luna29 · Sample preview · Not a medical diagnosis',
    servicePromise: reportUi.servicePromise,
    serviceBullets: reportUi.serviceBullets,
    stableLabel: womenUi.stable,
    highPriorityLabel: womenUi.highPriority,
    watchLabel: womenUi.watch,
    hormoneSignalsLabel: reportsUi.hormoneSignals,
    dayLabel: reportsUi.day,
    cycleDayValue: 21,
    sexualSummaryLabel: sexualUi.summaryLabel,
    painLabel: sexualUi.scoreLabels.pain,
    markerLabel: reportsUi.marker || 'Marker',
    valueLabel: reportsUi.value || 'Value',
    referenceLabel: reportsUi.reference || 'Reference',
    statusLabel: reportsUi.status,
    categoryLabel: womenUi.combinationsTitle,
    explanationLabel: detailedUi.explanation,
    textInputSourceLabel: reportSourcesUi.textInput,
    manualTableSourceLabel: reportSourcesUi.manualTable,
    clinicalFocusTitle: womenUi.clinicalFocusTitle,
    estProgTitle: womenUi.estProgTitle,
    estProgBody: womenUi.estProgBody,
    insulinAndrogenTitle: womenUi.insulinAndrogenTitle,
    insulinAndrogenBody: womenUi.insulinAndrogenBody,
    recommendationsTitle: womenUi.recommendationsTitle,
    recCycle: womenUi.recCycle,
    recRepeat: womenUi.recRepeat,
    recDoctor: womenUi.recDoctor,
    recLifestyle: womenUi.recLifestyle,
    rows,
  });
}

export async function previewPublicSampleReport(lang: Language): Promise<boolean> {
  const html = await buildPublicSampleReportHtml(lang);
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) return false;
  popup.document.write(html);
  popup.document.close();
  return true;
}

export async function downloadPublicSampleReport(lang: Language): Promise<void> {
  const html = await buildPublicSampleReportHtml(lang);
  downloadHtml(`luna-sample-report-${lang}.html`, html);
}

export async function printPublicSampleReportPdf(lang: Language): Promise<boolean> {
  const html = await buildPublicSampleReportHtml(lang);
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) return false;
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}
