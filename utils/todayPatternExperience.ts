/**
 * Today pattern experience (Task 9.4).
 * AUTHORITY (Task 10): sole owner of Today pattern card copy/priority.
 * Presentation only — reuses Task 5 candidates already filtered by filterSurfacedPatterns.
 * No mutations, no new fetches, no pattern-engine changes.
 *
 * Priority: 1 confirmed → else 1 candidate → else none.
 * Never both. Never surfaces rejected / stale / invalidated (caller must filter first).
 */

import type { TodayPatternPreview } from './todayState';

export type TodayPatternExperienceKind = 'confirmed' | 'candidate' | 'none';

export type TodayPatternExperienceCard = {
  kind: TodayPatternExperienceKind;
  /** Present for confirmed | candidate; null for none. */
  pattern: TodayPatternPreview | null;
  headline: string;
  /** Up to two short body sentences. */
  body: string[];
  /** Navigation-only CTA label; null when none. */
  ctaLabel: string | null;
};

const CONFIRMED: Omit<TodayPatternExperienceCard, 'pattern'> = {
  kind: 'confirmed',
  headline: 'You confirmed a pattern',
  body: ['You have confirmed that this has appeared repeatedly over time.'],
  ctaLabel: 'View details',
};

const CANDIDATE: Omit<TodayPatternExperienceCard, 'pattern'> = {
  kind: 'candidate',
  headline: 'Luna noticed something',
  body: ['This has appeared several times.', "You can review it when you're ready."],
  ctaLabel: 'Review',
};

const NONE: TodayPatternExperienceCard = {
  kind: 'none',
  pattern: null,
  headline: 'No patterns yet',
  body: ['As you continue using Luna, recurring observations can appear here.'],
  ctaLabel: null,
};

/**
 * Resolve at most one pattern card for Today.
 * Confirmed wins over candidate. Never returns both.
 */
export const resolveTodayPatternExperience = (input: {
  confirmedPatterns: TodayPatternPreview[];
  possiblePatterns: TodayPatternPreview[];
}): TodayPatternExperienceCard => {
  const confirmed = (input.confirmedPatterns || []).find((p) => p?.status === 'confirmed' && p.id && p.title);
  if (confirmed) {
    return { ...CONFIRMED, pattern: confirmed };
  }
  const candidate = (input.possiblePatterns || []).find((p) => p?.status === 'candidate' && p.id && p.title);
  if (candidate) {
    return { ...CANDIDATE, pattern: candidate };
  }
  return NONE;
};

/** Forbidden copy tokens for Today pattern experience. */
export const TODAY_PATTERN_FORBIDDEN_TERMS = [
  'prediction',
  'diagnosis',
  'correlation',
  'cause',
  'medical pattern',
  'risk score',
] as const;

export const patternExperienceCopyIsSafe = (card: TodayPatternExperienceCard): boolean => {
  const blob = [card.headline, ...card.body, card.ctaLabel || ''].join(' ').toLowerCase();
  return TODAY_PATTERN_FORBIDDEN_TERMS.every((term) => !blob.includes(term));
};
