import { describe, expect, it } from 'vitest';
import { buildLocalizedSampleReportHtml, CYCLE_VISUAL_SVG } from '../../utils/reportSampleTemplate.ts';

describe('reportSampleTemplate', () => {
  it('renders logo, cycle visual, copyright, and site url', () => {
    const html = buildLocalizedSampleReportHtml({
      logoUrl: 'data:image/png;base64,aaa',
      phaseArcImageUrl: CYCLE_VISUAL_SVG,
      siteUrl: 'https://www.luna29.com',
      reportTitle: 'Report',
      sampleTitle: 'Sample Report',
      subtitle: 'Subtitle',
      generatedAtLabel: 'Generated',
      generatedAtValue: 'Jul 14, 2026',
      patientIdLabel: 'Patient',
      panelLabel: 'Panel',
      sourceLabel: 'Source',
      allMarkersLabel: 'All markers',
      summaryLabel: 'Summary',
      disclaimerTitle: 'Disclaimer',
      disclaimerBody: 'Not medical.',
      reportCopyright: 'Sample preview',
      siteAddressLabel: 'Website',
      servicePromise: 'Promise',
      serviceBullets: ['A', 'B'],
      stableLabel: 'Stable',
      highPriorityLabel: 'High',
      watchLabel: 'Watch',
      hormoneSignalsLabel: 'Signals',
      cycleVisualLabel: 'Cycle visual',
      dayLabel: 'Day',
      cycleDayValue: 21,
      sexualSummaryLabel: 'Sexual',
      painLabel: 'Pain',
      markerLabel: 'Marker',
      valueLabel: 'Value',
      referenceLabel: 'Ref',
      statusLabel: 'Status',
      categoryLabel: 'Category',
      explanationLabel: 'Why',
      textInputSourceLabel: 'Text',
      manualTableSourceLabel: 'Table',
      clinicalFocusTitle: 'Focus',
      estProgTitle: 'E/P',
      estProgBody: 'Body',
      insulinAndrogenTitle: 'I/A',
      insulinAndrogenBody: 'Body2',
      recommendationsTitle: 'Recs',
      recCycle: 'C1',
      recRepeat: 'C2',
      recDoctor: 'C3',
      recLifestyle: 'C4',
      rows: [
        {
          marker: 'TSH',
          value: '4.8',
          reference: '0.4-4',
          status: 'high',
          category: 'Thyroid',
          explanation: 'High',
          accent: '#ea580c',
        },
      ],
    });

    expect(html).toContain('Sample Report');
    expect(html).toContain('data:image/png;base64,aaa');
    expect(html).toContain('Cycle visual');
    expect(html).toContain('©');
    expect(html).toContain('Luna29 Balance Systems');
    expect(html).toContain('https://www.luna29.com');
    expect(html).toContain('TSH');
    expect(html.length).toBeGreaterThan(2000);
  });
});
