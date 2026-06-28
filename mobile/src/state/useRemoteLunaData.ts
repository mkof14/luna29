import { useCallback, useEffect, useMemo, useState } from 'react';
import { continuityMessage, defaultContextSignal, defaultReflectionResult, storyEntriesSeed } from '../data/mockData';
import { fetchReflectionResult, fetchStoryThread, fetchTodayView, submitReflection, TodayViewPayload } from '../services/api';
import { logError } from '../services/logger';
import { ReflectionPayload, StoryEntry } from '../types';

const fallbackToday: TodayViewPayload = {
  userName: 'Anna',
  title: 'Today with Luna29',
  explanation: 'Today may feel a little slower. Sleep was shorter last night and your body is in the luteal phase.',
  continuity: continuityMessage,
  context: defaultContextSignal,
};

export function useRemoteLunaData() {
  const [today, setToday] = useState<TodayViewPayload>(fallbackToday);
  const [reflection, setReflection] = useState<ReflectionPayload>(defaultReflectionResult);
  const [thread, setThread] = useState<StoryEntry[]>(storyEntriesSeed);
  const [loading, setLoading] = useState(false);
  const [remoteError, setRemoteError] = useState('');

  const [mobileId] = useState(() => `device-${Math.random().toString(36).slice(2, 10)}`);

  const loadRemoteData = useCallback(async () => {
    setLoading(true);
    setRemoteError('');
    try {
      const [todayData, reflectionData, storyData] = await Promise.all([
        fetchTodayView(mobileId),
        fetchReflectionResult(mobileId),
        fetchStoryThread(mobileId),
      ]);
      setToday(todayData);
      setReflection(reflectionData);
      setThread(storyData.entries);
    } catch (error) {
      logError('Failed to load remote mobile data', { error: error instanceof Error ? error.message : String(error) });
      setRemoteError('Using offline snapshot right now. Pull to refresh when connection is back.');
    } finally {
      setLoading(false);
    }
  }, [mobileId]);

  useEffect(() => {
    void loadRemoteData();
  }, [loadRemoteData]);

  const prependStoryEntry = useCallback((entryText: string) => {
    setThread((current) => {
      const normalized = current.map((item, index) => {
        if (index === 0) return { ...item, label: 'Yesterday' };
        if (index === 1) return { ...item, label: '3 days ago' };
        if (index === 2) return { ...item, label: 'Earlier' };
        return item;
      });

      return [
        {
          id: `local-${Date.now()}`,
          label: 'Today',
          text: entryText,
        },
        ...normalized,
      ].slice(0, 4);
    });
  }, []);

  const syncReflection = useCallback(
    async (mode: 'voice' | 'quick_checkin' | 'write', text: string) => {
      try {
        const payload = await submitReflection({ mobileId, mode, text });
        setThread(payload.entries);
        setReflection(payload.reflection);
        setRemoteError('');
      } catch (error) {
        logError('Failed to sync reflection', { mode, error: error instanceof Error ? error.message : String(error) });
        setRemoteError('Saved locally. We will sync this when connection is back.');
        prependStoryEntry(text);
      }
    },
    [mobileId, prependStoryEntry],
  );

  const value = useMemo(
    () => ({
      today,
      reflection,
      thread,
      loading,
      remoteError,
      refresh: loadRemoteData,
      prependStoryEntry,
      syncReflection,
    }),
    [today, reflection, thread, loading, remoteError, loadRemoteData, prependStoryEntry, syncReflection],
  );

  return value;
}
