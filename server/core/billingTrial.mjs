/** Shared server-side trial record helpers (api/index.mjs + server/index.mjs). */

export const buildTrialRecord = (userId, email, trialDays) => {
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + Math.max(0, trialDays) * 24 * 60 * 60 * 1000);
  return {
    userId,
    email,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    used: true,
    status: 'active',
  };
};

export const isTrialActive = (trial) =>
  Boolean(trial?.endsAt && new Date(trial.endsAt).getTime() > Date.now());

export const trialStorageKey = (userId) => `trial:${userId}`;
