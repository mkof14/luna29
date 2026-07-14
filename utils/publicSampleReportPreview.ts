import { Language } from '../constants';
import { getLabsViewLocalizedContent } from './labsViewContent';
import {
  buildLocalizedSampleReportHtml,
  CYCLE_VISUAL_SVG,
} from './reportSampleTemplate';
import { LUNA_BRAND_PATHS, resolveLunaSiteUrl } from './lunaBrandAssets';

const SAMPLE_ACCENTS = ['#7c3aed', '#db2777', '#ea580c', '#0891b2'];

const SITE_URL = 'https://www.luna29.com';

const openHtmlInNewTab = (html: string, autoPrint = false): boolean => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) {
    URL.revokeObjectURL(url);
    return false;
  }
  // Revoke after the tab has a chance to load the blob.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  if (autoPrint) {
    window.setTimeout(() => {
      try {
        popup.focus();
        popup.print();
      } catch {
        // ignore print blockers
      }
    }, 400);
  }
  return true;
};

const downloadHtml = (filename: string, html: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const fetchAsDataUri = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { credentials: 'omit', cache: 'force-cache' });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.size) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('read failed'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const absoluteBrandUrl = (path: string): string => {
  const site = SITE_URL;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${site}${normalized}`;
};

export async function buildPublicSampleReportHtml(lang: Language): Promise<string> {
  const localized = getLabsViewLocalizedContent(lang, lang);
  const {
    reportUi,
    reportsUi,
    sexualUi,
    locale,
    export: exportCopy,
  } = localized;
  const { medForm, detailedUi, womenUi, reportSourcesUi } = exportCopy;

  const siteUrl = resolveLunaSiteUrl() || SITE_URL;
  const generatedAt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const logoHttp = absoluteBrandUrl(LUNA_BRAND_PATHS.lockup);
  const cycleHttp = absoluteBrandUrl('/images/moon_phases_arc.webp');
  const [logoData, cycleData] = await Promise.all([
    fetchAsDataUri(logoHttp),
    fetchAsDataUri(cycleHttp),
  ]);

  const rows = [
    { marker: 'Estradiol (E2)', value: '148 pg/mL', reference: '30-400', status: 'normal', category: 'Hormonal', explanation: detailedUi.statusNormal, accent: SAMPLE_ACCENTS[0] },
    { marker: 'Progesterone', value: '8.1 ng/mL', reference: '0.2-25', status: 'normal', category: 'Hormonal', explanation: detailedUi.statusNormal, accent: SAMPLE_ACCENTS[1] },
    { marker: 'TSH', value: '4.8 mIU/L', reference: '0.4-4.0', status: 'high', category: 'Thyroid', explanation: detailedUi.statusHigh, accent: SAMPLE_ACCENTS[2] },
    { marker: 'Ferritin', value: '18 ng/mL', reference: '15-150', status: 'low-normal', category: 'Iron', explanation: detailedUi.statusLow, accent: SAMPLE_ACCENTS[3] },
  ];

  return buildLocalizedSampleReportHtml({
    logoUrl: logoData || logoHttp,
    phaseArcImageUrl: cycleData || CYCLE_VISUAL_SVG,
    siteUrl,
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
    reportCopyright: 'Sample preview · Not a medical diagnosis · For illustration only',
    siteAddressLabel: 'Website',
    servicePromise: reportUi.servicePromise,
    serviceBullets: reportUi.serviceBullets,
    stableLabel: womenUi.stable,
    highPriorityLabel: womenUi.highPriority,
    watchLabel: womenUi.watch,
    hormoneSignalsLabel: reportsUi.hormoneSignals,
    cycleVisualLabel: 'Cycle visual',
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
  return openHtmlInNewTab(html, false);
}

export async function downloadPublicSampleReport(lang: Language): Promise<void> {
  const html = await buildPublicSampleReportHtml(lang);
  downloadHtml(`luna-sample-report-${lang}.html`, html);
}

export async function printPublicSampleReportPdf(lang: Language): Promise<boolean> {
  const html = await buildPublicSampleReportHtml(lang);
  return openHtmlInNewTab(html, true);
}
