import { describe, expect, it } from 'vitest';
import {
  formatProfileContextForAnalysis,
  labsDraftFromPhp,
  labsFieldsCoveredByPhp,
  missingPersonalizationHint,
  personalizationHeadline,
  platformModuleReadiness,
  reportAttributionFromProfile,
} from '../../utils/healthProfilePlatform';
import type { PersonalHealthProfileLike } from '../../utils/healthProfileIntake';

const profile = (sections: PersonalHealthProfileLike['sections'] = {}): PersonalHealthProfileLike => ({
  sections,
  completion_percent: 55,
  updated_at: '2026-07-01T00:00:00.000Z',
});

describe('healthProfilePlatform integration', () => {
  it('prefills labs draft fields from Personal Health Profile only', () => {
    const php = profile({
      about: { date_of_birth: '1990-05-01', biological_sex: 'female' },
      medications: { items: [{ name: 'Statin' }] },
      health_history: { chronic_conditions: [{ label: 'Hypertension' }] },
      goals: { primary_goal: 'Improve Sleep' },
    });
    const draft = labsDraftFromPhp(php);
    expect(draft.birthYear).toBe('1990');
    expect(draft.medications).toContain('Statin');
    expect(draft.knownConditions).toContain('Hypertension');
    expect(draft.goals).toBe('Improve Sleep');
    expect(labsFieldsCoveredByPhp(php)).toEqual(
      expect.arrayContaining(['birthYear', 'medications', 'knownConditions', 'goals']),
    );
  });

  it('formats analysis context without inventing facts', () => {
    const text = formatProfileContextForAnalysis({
      status: 'ok',
      sections: {
        medications: { takes_daily_medication: 'no' },
        health_history: { allergies: [{ label: 'Penicillin' }] },
      },
      facts: [],
    });
    expect(text).toContain('Medications: none reported');
    expect(text).toContain('Penicillin');
    expect(formatProfileContextForAnalysis({ status: 'unavailable' })).toBe('');
  });

  it('builds report attribution labels from available sections', () => {
    const labels = reportAttributionFromProfile(
      profile({
        medications: { takes_daily_medication: 'no' },
        health_history: { chronic_conditions: [{ label: 'Asthma' }] },
        family_history: { items: [{ condition: 'Diabetes', relation: 'Mother' }] },
      }),
    );
    expect(labels).toEqual(
      expect.arrayContaining(['Current Medications', 'Medical History', 'Family History']),
    );
  });

  it('uses consistent personalization headlines and missing hints', () => {
    expect(
      personalizationHeadline({
        completionPercent: 10,
        hasMedications: false,
        hasMedicalHistory: false,
      }),
    ).toBe('Needs more profile information');
    expect(
      personalizationHeadline({
        completionPercent: 60,
        hasMedications: true,
      }),
    ).toBe('Personalized using confirmed medications');
    expect(missingPersonalizationHint('medications')).toContain('medications');
    expect(missingPersonalizationHint('family_history')).toContain('family history');
  });

  it('exposes module readiness including AI Assistant', () => {
    const items = platformModuleReadiness(profile({}));
    expect(items.some((i) => i.label === 'AI Assistant')).toBe(true);
    expect(items.some((i) => i.label === 'Health Reports')).toBe(true);
  });
});
