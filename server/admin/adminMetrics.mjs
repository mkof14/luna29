const MONTHLY_MRR = Number(process.env.ADMIN_EST_MRR_MONTHLY || '12') || 12;
const YEARLY_MRR = Number(process.env.ADMIN_EST_MRR_YEARLY || '8.25') || 8.25;

const parseTs = (value) => {
  const ts = value ? Date.parse(String(value)) : NaN;
  return Number.isFinite(ts) ? ts : NaN;
};

const billingForUser = (user, billingState = {}) => {
  if (!user || typeof user !== 'object') return null;
  const byEmail = billingState[user.email];
  const byId = billingState[user.id];
  return byEmail || byId || null;
};

/** Derive finance KPIs from real users + billingState (falls back to seeded admin metrics). */
export const computeLiveFinancialMetrics = (users = [], billingState = {}, fallback = {}) => {
  let activeSubscribers = 0;
  let trialAccounts = 0;
  let pastDue = 0;
  let canceled = 0;
  let mrr = 0;

  for (const user of users) {
    const billing = billingForUser(user, billingState);
    if (!billing || typeof billing !== 'object') continue;
    const status = String(billing.status || billing.planStatus || '').toLowerCase();
    if (billing.trial || status.includes('trial')) {
      trialAccounts += 1;
      continue;
    }
    if (status.includes('past_due') || status.includes('failed')) {
      pastDue += 1;
      continue;
    }
    if (status.includes('cancel')) {
      canceled += 1;
      continue;
    }
    if (status.includes('active') || status.includes('paid') || billing.subscriptionId) {
      activeSubscribers += 1;
      mrr += String(billing.period || '').includes('year') ? YEARLY_MRR : MONTHLY_MRR;
    }
  }

  const hasLiveData = activeSubscribers + trialAccounts + pastDue + canceled > 0;
  if (!hasLiveData) {
    return {
      source: 'seeded',
      mrr: Number(fallback.mrr || 0),
      arr: Number(fallback.arr || 0),
      churn: Number(fallback.churn || 0),
      ltv: Number(fallback.ltv || 0),
      cac: Number(fallback.cac || 0),
      conversion: Number(fallback.conversion || 0),
      activeSubscribers: Number(fallback.activeSubscribers || 0),
      trialToPaid: Number(fallback.trialToPaid || 0),
      trialAccounts: 0,
      pastDue: 0,
      canceled: 0,
    };
  }

  const churnBase = activeSubscribers + canceled;
  const churn = churnBase > 0 ? Number(((canceled / churnBase) * 100).toFixed(1)) : 0;
  const trialBase = trialAccounts + activeSubscribers;
  const trialToPaid = trialBase > 0 ? Number(((activeSubscribers / trialBase) * 100).toFixed(1)) : 0;

  return {
    source: 'live',
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    churn,
    ltv: Number(fallback.ltv || 386),
    cac: Number(fallback.cac || 59),
    conversion: users.length > 0 ? Number(((activeSubscribers / users.length) * 100).toFixed(1)) : 0,
    activeSubscribers,
    trialToPaid,
    trialAccounts,
    pastDue,
    canceled,
  };
};

/** Retention funnel + at-risk members from login timestamps. */
export const computeRetentionSnapshot = (users = [], billingState = {}) => {
  const now = Date.now();
  const dayMs = 86400000;
  let active7d = 0;
  let inactive7d = 0;
  let neverLoggedIn = 0;
  const atRisk = [];

  for (const user of users) {
    const loginTs = parseTs(user.lastLoginAt) || parseTs(user.createdAt);
    if (!Number.isFinite(loginTs)) {
      neverLoggedIn += 1;
      continue;
    }
    const daysSince = Math.floor((now - loginTs) / dayMs);
    if (daysSince <= 7) active7d += 1;
    else {
      inactive7d += 1;
      if (daysSince >= 7 && atRisk.length < 15) {
        const billing = billingForUser(user, billingState);
        atRisk.push({
          email: String(user.email || ''),
          name: String(user.name || ''),
          daysSinceLogin: daysSince,
          billingStatus: billing?.status || (billing?.trial ? 'trial' : 'unknown'),
        });
      }
    }
  }

  const total = users.length;
  const paid = users.filter((user) => {
    const billing = billingForUser(user, billingState);
    const status = String(billing?.status || '').toLowerCase();
    return status.includes('active') || status.includes('paid') || billing?.subscriptionId;
  }).length;
  const trials = users.filter((user) => {
    const billing = billingForUser(user, billingState);
    return billing?.trial || String(billing?.status || '').includes('trial');
  }).length;

  return {
    totalMembers: total,
    activeLast7Days: active7d,
    inactiveOver7Days: inactive7d,
    neverLoggedIn,
    funnel: {
      signups: total,
      trials,
      paid,
    },
    atRisk,
    updatedAt: new Date().toISOString(),
  };
};

export const stripeConfigured = () =>
  Boolean(String(process.env.STRIPE_SECRET_KEY || '').trim() && String(process.env.STRIPE_BILLING_ENABLED || '') === 'true');
