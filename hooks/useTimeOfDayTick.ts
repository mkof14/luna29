import { useEffect, useState } from 'react';

/** Re-render on a timer so time-of-day greetings update while the page stays open. */
export const useTimeOfDayTick = (intervalMs = 60_000): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
};
