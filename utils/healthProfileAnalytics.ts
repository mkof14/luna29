/**
 * Analytics for Personal Health Profile entry points.
 * Never log health field values — only surface + completion_bucket.
 */
import { trackEvent } from '../services/analyticsService';

export type HealthProfileAnalyticsSurface =
  | 'nav'
  | 'profile'
  | 'today'
  | 'live'
  | 'labs'
  | 'reports'
  | 'settings'
  | 'memory'
  | 'public';

export const healthProfileCompletionBucket = (percent: number): string => {
  const safe = Math.max(0, Math.min(100, Math.floor(Number(percent) || 0)));
  if (safe >= 100) return '100';
  const start = Math.floor(safe / 25) * 25;
  return `${start}_to_${Math.min(99, start + 24)}`;
};

const base = (surface: HealthProfileAnalyticsSurface, percent?: number | null) => ({
  surface,
  action: 'health_profile',
  result: 'ok' as const,
  ...(percent != null && Number.isFinite(percent)
    ? { completion_bucket: healthProfileCompletionBucket(percent) }
    : {}),
});

export const trackHealthProfileOpened = (
  surface: HealthProfileAnalyticsSurface,
  percent?: number | null,
) => {
  trackEvent('health_profile_opened', base(surface, percent));
};

export const trackHealthProfileContinued = (
  surface: HealthProfileAnalyticsSurface,
  percent?: number | null,
) => {
  trackEvent('health_profile_continued', base(surface, percent));
};

export const trackHealthProfileCompletedSection = (
  surface: HealthProfileAnalyticsSurface,
  percent?: number | null,
) => {
  trackEvent('health_profile_completed_section', {
    ...base(surface, percent),
    action: 'completed_section',
  });
};

export const trackHealthProfileDismissedPrompt = (
  surface: HealthProfileAnalyticsSurface,
  percent?: number | null,
) => {
  trackEvent('health_profile_dismissed_prompt', {
    ...base(surface, percent),
    action: 'dismissed_prompt',
  });
};
