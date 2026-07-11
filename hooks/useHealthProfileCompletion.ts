/**
 * Shared Personal Health Profile completion — reuses getCompletion API only.
 * No local scoring. UI-only cache for nav + surfaces.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  getCompletion,
  isProfileUnavailable,
  type ProfileCompletion,
  type ProfileSectionId,
} from '../services/personalHealthProfileService';

type State = {
  percent: number | null;
  recommendedNext: ProfileSectionId | null;
  completedSections: ProfileSectionId[];
  unavailable: boolean;
  loading: boolean;
  refresh: () => void;
};

let cached: ProfileCompletion | null = null;
let cachedAt = 0;
const CACHE_MS = 30_000;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((fn) => fn());
};

export const invalidateHealthProfileCompletionCache = () => {
  cached = null;
  cachedAt = 0;
  notify();
};

export const useHealthProfileCompletion = (enabled = true): State => {
  const [percent, setPercent] = useState<number | null>(
    () => (cached ? Number(cached.completion_percent || 0) : null),
  );
  const [recommendedNext, setRecommendedNext] = useState<ProfileSectionId | null>(
    () => cached?.recommended_next_section ?? null,
  );
  const [completedSections, setCompletedSections] = useState<ProfileSectionId[]>(
    () => cached?.completed_sections || [],
  );
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(!cached);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    cached = null;
    cachedAt = 0;
    setTick((n) => n + 1);
    notify();
  }, []);

  useEffect(() => {
    const onInvalidate = () => setTick((n) => n + 1);
    listeners.add(onInvalidate);
    return () => {
      listeners.delete(onInvalidate);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const now = Date.now();
    if (cached && now - cachedAt < CACHE_MS) {
      setPercent(Number(cached.completion_percent || 0));
      setRecommendedNext(cached.recommended_next_section ?? null);
      setCompletedSections(cached.completed_sections || []);
      setUnavailable(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    void getCompletion()
      .then((result) => {
        if (!alive) return;
        if (isProfileUnavailable(result)) {
          setUnavailable(true);
          setPercent(null);
          setRecommendedNext(null);
          setCompletedSections([]);
          return;
        }
        cached = result;
        cachedAt = Date.now();
        setUnavailable(false);
        setPercent(Number(result.completion_percent || 0));
        setRecommendedNext(result.recommended_next_section ?? null);
        setCompletedSections(result.completed_sections || []);
      })
      .catch(() => {
        if (!alive) return;
        setUnavailable(true);
        setPercent(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [enabled, tick]);

  return { percent, recommendedNext, completedSections, unavailable, loading, refresh };
};
