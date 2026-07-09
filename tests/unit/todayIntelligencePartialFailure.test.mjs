/**
 * Task 9.1 — todayIntelligenceService partial-failure (vitest ESM only).
 * Kept as .mjs so smoke CommonJS compile does not pull import.meta clients.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('todayIntelligenceService partial failure', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('13b. tolerates individual service failures', async () => {
    vi.doMock('../../services/memoryConsentService', () => ({
      getMemoryConsent: vi.fn(async () => {
        throw new Error('consent down');
      }),
    }));
    vi.doMock('../../services/observationSignalsService', () => ({
      listSignals: vi.fn(async () => {
        throw new Error('signals down');
      }),
    }));
    vi.doMock('../../services/patternCandidatesService', () => ({
      listPatternCandidates: vi.fn(async () => {
        throw new Error('patterns down');
      }),
    }));

    const { fetchTodayIntelligence } = await import('../../services/todayIntelligenceService');
    const snap = await fetchTodayIntelligence();
    expect(snap.settled).toBe(true);
    expect(snap.memoryStatus).toBe('unavailable');
    expect(snap.signalsAvailable).toBe(false);
    expect(snap.patternsAvailable).toBe(false);
    expect(snap.unreviewedCount).toBe(0);
  });
});
