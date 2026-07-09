/**
 * One-shot Today secondary intelligence hook (Task 9.1).
 * Primary daily action must remain available while this loads.
 */

import { useEffect, useState } from 'react';
import {
  EMPTY_TODAY_INTELLIGENCE,
  fetchTodayIntelligence,
  type TodayIntelligenceSnapshot,
} from '../services/todayIntelligenceService';

export const useTodayIntelligence = (
  enabled = true,
  refreshToken = 0,
): {
  intelligence: TodayIntelligenceSnapshot;
  loading: boolean;
  refresh: () => void;
} => {
  const [intelligence, setIntelligence] = useState<TodayIntelligenceSnapshot>(EMPTY_TODAY_INTELLIGENCE);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchTodayIntelligence()
      .then((snap) => {
        if (!cancelled) setIntelligence(snap);
      })
      .catch(() => {
        if (!cancelled) {
          setIntelligence({
            ...EMPTY_TODAY_INTELLIGENCE,
            memoryStatus: 'unavailable',
            consentAvailable: false,
            signalsAvailable: false,
            patternsAvailable: false,
            settled: true,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, tick, refreshToken]);

  return {
    intelligence,
    loading,
    refresh: () => setTick((n) => n + 1),
  };
};
