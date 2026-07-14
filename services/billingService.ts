export interface BillingStatusPayload {
  status: string;
  plan?: string;
  period?: string;
  updatedAt?: string;
}

const parseJson = async <T>(response: Response): Promise<T & { error?: string }> => {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });
};

const mockStatusPayload = (): { billing: BillingStatusPayload; enabled: boolean } => ({
  billing: { status: 'inactive', plan: 'none', period: 'none', updatedAt: new Date().toISOString() },
  enabled: false,
});

const shouldUseLocalBillingMock = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  const forceRealBilling = window.localStorage.getItem('luna_enable_billing_api') === 'true';
  return isLocalHost && !forceRealBilling;
};

export const billingService = {
  async getStatus(): Promise<{ billing: BillingStatusPayload; enabled: boolean }> {
    if (shouldUseLocalBillingMock()) {
      return mockStatusPayload();
    }
    const response = await fetch('/api/billing/status', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await parseJson<{ billing: BillingStatusPayload; enabled: boolean }>(response);
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
  },

  async createPortalSession(): Promise<{ id?: string; url: string }> {
    if (shouldUseLocalBillingMock()) {
      throw new Error('Billing is unavailable in local mode.');
    }
    const response = await fetch('/api/billing/portal-session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await parseJson<{ id?: string; url?: string }>(response);
    if (!response.ok || !data.url) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return { id: data.id, url: data.url };
  },

  async createCheckoutSession(period: 'month' | 'year'): Promise<{ id?: string; url: string }> {
    if (shouldUseLocalBillingMock()) {
      throw new Error('Billing is unavailable in local mode.');
    }
    const response = await fetch('/api/billing/checkout-session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period }),
    });
    const data = await parseJson<{ id?: string; url?: string }>(response);
    if (!response.ok || !data.url) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return { id: data.id, url: data.url };
  },

  async startServerTrial(): Promise<{ trial: Record<string, unknown>; alreadyActive?: boolean }> {
    // Dev/test only. When STRIPE_BILLING_ENABLED=true the API returns USE_STRIPE_CHECKOUT.
    const response = await fetch('/api/billing/trial/start', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await parseJson<{
      trial: Record<string, unknown>;
      alreadyActive?: boolean;
      code?: string;
    }>(response);
    if (!response.ok) {
      throw new Error(data.error || data.code || `Request failed (${response.status})`);
    }
    return data;
  },
};
