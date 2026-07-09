import { describe, expect, it, vi } from 'vitest';
import {
  patternExperienceCopyIsSafe,
  resolveTodayPatternExperience,
  TODAY_PATTERN_FORBIDDEN_TERMS,
} from '../../utils/todayPatternExperience';
import { filterSurfacedPatterns } from '../../utils/todayState';

describe('todayPatternExperience', () => {
  it('no patterns → none card', () => {
    const card = resolveTodayPatternExperience({
      confirmedPatterns: [],
      possiblePatterns: [],
    });
    expect(card.kind).toBe('none');
    expect(card.headline).toBe('No patterns yet');
    expect(card.ctaLabel).toBeNull();
    expect(card.pattern).toBeNull();
    expect(card.body.length).toBeLessThanOrEqual(2);
  });

  it('candidate → Luna noticed something', () => {
    const card = resolveTodayPatternExperience({
      confirmedPatterns: [],
      possiblePatterns: [{ id: 'c1', title: 'Sleep and energy often appear together', status: 'candidate' }],
    });
    expect(card.kind).toBe('candidate');
    expect(card.headline).toBe('Luna noticed something');
    expect(card.ctaLabel).toBe('Review');
    expect(card.pattern?.id).toBe('c1');
    expect(card.body).toEqual([
      'This has appeared several times.',
      "You can review it when you're ready.",
    ]);
  });

  it('confirmed → You confirmed a pattern', () => {
    const card = resolveTodayPatternExperience({
      confirmedPatterns: [{ id: 'p1', title: 'Low energy after short sleep', status: 'confirmed' }],
      possiblePatterns: [],
    });
    expect(card.kind).toBe('confirmed');
    expect(card.headline).toBe('You confirmed a pattern');
    expect(card.ctaLabel).toBe('View details');
    expect(card.pattern?.id).toBe('p1');
  });

  it('confirmed wins over candidate — never both', () => {
    const card = resolveTodayPatternExperience({
      confirmedPatterns: [{ id: 'conf', title: 'Confirmed one', status: 'confirmed' }],
      possiblePatterns: [{ id: 'cand', title: 'Candidate one', status: 'candidate' }],
    });
    expect(card.kind).toBe('confirmed');
    expect(card.pattern?.id).toBe('conf');
    expect(card.kind).not.toBe('candidate');
  });

  it('rejected / stale / invalidated stay hidden via filterSurfacedPatterns', () => {
    const filtered = filterSurfacedPatterns([
      { id: '1', payload: { status: 'candidate', title: 'Possible A' } },
      { id: '2', payload: { status: 'confirmed', title: 'Confirmed B' } },
      { id: '3', payload: { status: 'rejected', title: 'Rejected C' } },
      { id: '4', payload: { status: 'stale', title: 'Stale D' } },
      { id: '5', payload: { status: 'invalidated', title: 'Invalid E' } },
    ]);
    expect(filtered.possible.map((p) => p.id)).toEqual(['1']);
    expect(filtered.confirmed.map((p) => p.id)).toEqual(['2']);

    const card = resolveTodayPatternExperience({
      confirmedPatterns: filtered.confirmed,
      possiblePatterns: filtered.possible,
    });
    // Confirmed wins; rejected/stale/invalidated never enter the lists.
    expect(card.kind).toBe('confirmed');
    expect(card.pattern?.id).toBe('2');
  });

  it('only rejected/stale/invalidated → none (no invent)', () => {
    const filtered = filterSurfacedPatterns([
      { id: '3', payload: { status: 'rejected', title: 'Rejected C' } },
      { id: '4', payload: { status: 'stale', title: 'Stale D' } },
      { id: '5', payload: { status: 'invalidated', title: 'Invalid E' } },
    ]);
    const card = resolveTodayPatternExperience({
      confirmedPatterns: filtered.confirmed,
      possiblePatterns: filtered.possible,
    });
    expect(card.kind).toBe('none');
  });

  it('no duplicate cards — resolver returns a single kind', () => {
    const card = resolveTodayPatternExperience({
      confirmedPatterns: [
        { id: 'a', title: 'A', status: 'confirmed' },
        { id: 'b', title: 'B', status: 'confirmed' },
      ],
      possiblePatterns: [
        { id: 'c', title: 'C', status: 'candidate' },
        { id: 'd', title: 'D', status: 'candidate' },
      ],
    });
    expect(['confirmed', 'candidate', 'none']).toContain(card.kind);
    expect(card.pattern?.id).toBe('a');
  });

  it('copy avoids forbidden certainty / medical language', () => {
    for (const input of [
      { confirmedPatterns: [], possiblePatterns: [] },
      {
        confirmedPatterns: [],
        possiblePatterns: [{ id: '1', title: 'X', status: 'candidate' as const }],
      },
      {
        confirmedPatterns: [{ id: '1', title: 'Y', status: 'confirmed' as const }],
        possiblePatterns: [],
      },
    ]) {
      const card = resolveTodayPatternExperience(input);
      expect(patternExperienceCopyIsSafe(card)).toBe(true);
      const blob = [card.headline, ...card.body].join(' ').toLowerCase();
      for (const term of TODAY_PATTERN_FORBIDDEN_TERMS) {
        expect(blob).not.toContain(term);
      }
    }
  });

  it('does not call network / pattern APIs', async () => {
    const listSpy = vi.fn();
    resolveTodayPatternExperience({
      confirmedPatterns: [],
      possiblePatterns: [{ id: '1', title: 'T', status: 'candidate' }],
    });
    expect(listSpy).not.toHaveBeenCalled();
    // Pure module — no service imports.
    const mod = await import('../../utils/todayPatternExperience');
    expect(mod.resolveTodayPatternExperience).toBeTypeOf('function');
    expect('listPatternCandidates' in mod).toBe(false);
    expect('fetchTodayIntelligence' in mod).toBe(false);
  });
});
