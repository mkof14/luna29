import { describe, expect, it } from 'vitest';
import {
  buildHealthTimeline,
  groupTimelineByYear,
  intakeProgress,
  intakeSectionStatus,
  listInformationSources,
  mergeHealthHistory,
  missingCriticalInformation,
  needsProfileReview,
  profileConfidence,
  profileImpactMessage,
  profileQualityFromPercent,
  reportReadiness,
  statusLabel,
  visibleIntakeSections,
  type PersonalHealthProfileLike,
} from '../../utils/healthProfileIntake';

const baseProfile = (sections: PersonalHealthProfileLike['sections'] = {}): PersonalHealthProfileLike => ({
  sections,
  completion_percent: 40,
  updated_at: '2026-07-01T00:00:00.000Z',
});

describe('healthProfileIntake model', () => {
  it('maps profile quality from completion percent without inventing a score', () => {
    expect(profileQualityFromPercent(10)).toBe('Minimal');
    expect(profileQualityFromPercent(40)).toBe('Basic');
    expect(profileQualityFromPercent(70)).toBe('Good');
    expect(profileQualityFromPercent(90)).toBe('Excellent');
  });

  it('derives profile confidence from completion, critical gaps, and freshness', () => {
    const limited = baseProfile({});
    limited.completion_percent = 10;
    limited.updated_at = '2024-01-01T00:00:00.000Z';
    expect(profileConfidence(limited, Date.parse('2026-07-08T00:00:00.000Z'))).toBe('Limited');

    const strong = baseProfile({
      medications: { takes_daily_medication: 'no' },
      health_history: {
        allergies: [{ label: 'No known allergies' }],
        chronic_conditions: [{ label: 'Hypertension' }],
        surgeries: [{ label: 'No surgeries reported' }],
      },
      family_history: { items: [{ condition: 'Diabetes', relation: 'Mother' }] },
      care_context: { emergency_contact: 'Alex · 555' },
    });
    strong.completion_percent = 90;
    strong.updated_at = '2026-06-01T00:00:00.000Z';
    expect(profileConfidence(strong, Date.parse('2026-07-08T00:00:00.000Z'))).toBe('Excellent');
  });

  it('shows a review reminder only when information is stale', () => {
    const fresh = baseProfile({ about: { preferred_name: 'Ada' } });
    fresh.updated_at = '2026-06-01T00:00:00.000Z';
    expect(needsProfileReview(fresh, Date.parse('2026-07-08T00:00:00.000Z'))).toBe(false);

    const stale = baseProfile({ about: { preferred_name: 'Ada' } });
    stale.updated_at = '2025-01-01T00:00:00.000Z';
    expect(needsProfileReview(stale, Date.parse('2026-07-08T00:00:00.000Z'))).toBe(true);
  });

  it('lists only available information sources', () => {
    expect(listInformationSources(baseProfile({}), [])).toEqual([]);
    expect(
      listInformationSources(baseProfile({ about: { preferred_name: 'Ada' } }), [
        { source: 'wearable_device' },
        { source: 'lab_report' },
      ]).map((s) => s.id),
    ).toEqual(['user', 'devices', 'labs']);
  });

  it('reports readiness statuses from existing profile quality', () => {
    const items = reportReadiness(baseProfile({}));
    expect(items.map((i) => i.label)).toEqual([
      'Health Reports',
      'Medication Review',
      'Risk Assessment',
      'Lab Interpretation',
    ]);
    expect(items.every((i) => i.status.length > 0)).toBe(true);
  });

  it('rotates calm impact messages and never says saved successfully', () => {
    const msg = profileImpactMessage('medications', 0);
    expect(msg.toLowerCase()).not.toContain('saved successfully');
    expect(msg.length).toBeGreaterThan(10);
  });

  it('uses calm status wording', () => {
    expect(statusLabel('complete')).toBe('Complete');
    expect(statusLabel('needs_review')).toBe('Needs Review');
    expect(statusLabel('missing')).toBe('Missing Information');
    expect(statusLabel('ready')).toBe('Ready');
  });

  it("hides women's health when marked not applicable", () => {
    const profile = baseProfile({
      womens_health: { applicable: 'no' },
    });
    const ids = visibleIntakeSections(profile).map((s) => s.id);
    expect(ids).not.toContain('womens_health');
    expect(ids).toContain('summary');
  });

  it('reports section status and progress from existing section data', () => {
    const profile = baseProfile({
      about: { preferred_name: 'Ada', date_of_birth: '1990-01-01', biological_sex: 'female' },
      body: { height_cm: 165, weight_kg: 60 },
      medications: { takes_daily_medication: 'no', items: [] },
    });
    expect(intakeSectionStatus('about_you', profile)).toBe('complete');
    expect(intakeSectionStatus('medications', profile)).toBe('complete');
    expect(intakeSectionStatus('allergies', profile)).toBe('missing');
    const progress = intakeProgress(profile);
    expect(progress.percent).toBe(40);
    expect(progress.confidence).toMatch(/Excellent|High|Medium|Limited/);
    expect(progress.criticalMissing.some((item) => item.label === 'Allergies')).toBe(true);
  });

  it('lists only missing critical information', () => {
    const profile = baseProfile({
      medications: { takes_daily_medication: 'no' },
      health_history: {
        allergies: [{ label: 'No known allergies', severity: 'none' }],
        chronic_conditions: [{ label: 'Hypertension', status: 'active' }],
        surgeries: [{ label: 'No surgeries reported', year: '' }],
      },
      family_history: { items: [{ condition: 'Diabetes', relation: 'Mother' }] },
      care_context: { emergency_contact: 'Alex · spouse · 555' },
    });
    expect(missingCriticalInformation(profile)).toEqual([]);
  });

  it('builds and groups timeline only from available dated events', () => {
    const profile = baseProfile({
      health_history: {
        surgeries: [{ label: 'Appendectomy', year: '2012' }],
        chronic_conditions: [{ label: 'Hypertension', year: '2021' }],
      },
      medications: {
        items: [{ name: 'Statin', start_date: '2025-03-01' }],
      },
    });
    const timeline = buildHealthTimeline(profile);
    expect(timeline.map((e) => e.year)).toEqual([2012, 2021, 2025]);
    expect(timeline[0].kindLabel).toBe('Surgery');
    const groups = groupTimelineByYear(timeline);
    expect(groups.map((g) => g.year)).toEqual([2012, 2021, 2025]);
    expect(groups[0].events[0].label).toContain('Appendectomy');
  });

  it('merges health_history slices so allergies do not wipe surgeries', () => {
    const existing = {
      allergies: [{ label: 'Penicillin', severity: 'severe' }],
      surgeries: [{ label: 'Appendectomy', year: '2010' }],
    };
    const merged = mergeHealthHistory(existing, {
      allergies: [{ label: 'Peanuts', severity: 'mild' }],
    });
    expect(merged.allergies).toEqual([{ label: 'Peanuts', severity: 'mild' }]);
    expect(merged.surgeries).toEqual([{ label: 'Appendectomy', year: '2010' }]);
  });
});
