const STORAGE_KEY = 'luna_live_public_turns_v1';

export const MAX_PUBLIC_LIVE_TURNS = 5;

export const readPublicLiveTurns = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(sessionStorage.getItem(STORAGE_KEY) || '0') || 0;
  } catch {
    return 0;
  }
};

export const consumePublicLiveTurn = (): number => {
  const next = readPublicLiveTurns() + 1;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
  }
  return next;
};

export const publicLiveTurnsLeft = (): number =>
  Math.max(0, MAX_PUBLIC_LIVE_TURNS - readPublicLiveTurns());

export const isPublicLiveLimitReached = (): boolean =>
  readPublicLiveTurns() >= MAX_PUBLIC_LIVE_TURNS;
