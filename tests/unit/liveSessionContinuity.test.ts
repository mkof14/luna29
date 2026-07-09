import { describe, expect, it } from 'vitest';
import { resolveLiveContinuityCard } from '../../utils/liveSessionContinuity';

describe('resolveLiveContinuityCard', () => {
  it('returns null when no user turns', () => {
    expect(
      resolveLiveContinuityCard({
        userTurnCount: 0,
        memoryWriteStatus: 'written',
        unreviewedCount: 0,
        possiblePatternTitle: null,
        confirmedPatternTitle: null,
        memoryStatus: 'on',
      }),
    ).toBeNull();
  });

  it('store unavailable wins', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: 'consent_unavailable',
      unreviewedCount: 2,
      possiblePatternTitle: 'X',
      confirmedPatternTitle: null,
      memoryStatus: 'unavailable',
    });
    expect(c?.kind).toBe('store_unavailable');
  });

  it('review available when unreviewed signals exist', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 2,
      memoryWriteStatus: 'written',
      unreviewedCount: 3,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'on',
    });
    expect(c?.kind).toBe('review_available');
    expect(c?.line).toMatch(/may want to check/);
  });

  it('remembered for written', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: 'written',
      unreviewedCount: 0,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'on',
    });
    expect(c?.kind).toBe('remembered');
    expect(c?.line).toMatch(/remembered something/i);
  });

  it('already_exists mapped', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: 'already_exists',
      unreviewedCount: 0,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'on',
    });
    expect(c?.kind).toBe('remembered');
    expect(c?.line).toMatch(/already had/i);
  });

  it('memory off for consent_disabled', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: 'consent_disabled',
      unreviewedCount: 0,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'off',
    });
    expect(c?.kind).toBe('memory_off');
  });

  it('feature_disabled mapped', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: 'feature_disabled',
      unreviewedCount: 0,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'on',
    });
    expect(c?.kind).toBe('memory_off');
  });

  it('nothing saved for ineligible', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: 'ineligible',
      unreviewedCount: 0,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'on',
    });
    expect(c?.kind).toBe('nothing_saved');
  });

  it('failed status is factual', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: 'failed',
      unreviewedCount: 0,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'on',
    });
    expect(c?.kind).toBe('failed');
    expect(c?.line.toLowerCase()).not.toMatch(/remembered something/);
  });

  it('extraction_failed mapped explicitly', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: 'extraction_failed',
      unreviewedCount: 0,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'on',
    });
    expect(c?.kind).toBe('failed');
    expect(c?.memory_write_status).toBe('extraction_failed');
  });

  it('never invents success without written status', () => {
    const c = resolveLiveContinuityCard({
      userTurnCount: 1,
      memoryWriteStatus: null,
      unreviewedCount: 0,
      possiblePatternTitle: null,
      confirmedPatternTitle: null,
      memoryStatus: 'on',
    });
    expect(c?.kind).toBe('conversation_completed');
    expect(c?.line.toLowerCase()).not.toMatch(/remembered/);
  });
});
