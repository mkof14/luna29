import { AdminRole } from '../types';

const parseJson = async <T>(response: Response): Promise<T & { error?: string }> => {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = await parseJson<T>(response);
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
};

export type AdminStatePayload = {
  services: unknown[];
  content: unknown[];
  templates: unknown[];
  templateHistory: Record<string, unknown>;
  admins: unknown[];
  testHistory: string[];
  financialMetrics?: unknown;
  technicalMetrics?: unknown;
  metricsHistory?: unknown[];
};

export type AuditEntry = {
  id: string;
  at: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: string;
  details: string;
};

export type AdminMetricsPayload = {
  financial: {
    source?: 'live' | 'seeded';
    mrr: number;
    arr: number;
    churn: number;
    ltv: number;
    cac: number;
    conversion: number;
    activeSubscribers: number;
    trialToPaid: number;
    trialAccounts?: number;
    pastDue?: number;
    canceled?: number;
  };
  technical: {
    apiP95: number;
    errorRate: number;
    queueLag: number;
  };
  history: Array<{
    at: string;
    mrr: number;
    churn: number;
    subscribers: number;
    apiP95: number;
    errorRate: number;
  }>;
  stripeConfigured?: boolean;
};

export type RetentionSnapshot = {
  totalMembers: number;
  activeLast7Days: number;
  inactiveOver7Days: number;
  neverLoggedIn: number;
  funnel: { signups: number; trials: number; paid: number };
  atRisk: Array<{ email: string; name: string; daysSinceLogin: number; billingStatus: string }>;
  updatedAt: string;
};

export type AdminInviteRecord = {
  id: string;
  email: string;
  kind: 'site' | 'admin';
  role?: string;
  inviteLink: string;
  delivered: boolean;
  createdAt: string;
  createdBy: string;
};

export type CampaignQueueItem = {
  id: string;
  name: string;
  subject: string;
  body: string;
  templateId: string;
  recipients: string[];
  sendAt: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  sentAt?: string | null;
  error?: string | null;
};

export const adminService = {
  async getState(): Promise<AdminStatePayload> {
    return request<AdminStatePayload>('/api/admin/state', { method: 'GET' });
  },

  async saveState(payload: Partial<AdminStatePayload>): Promise<{ ok: boolean; changed: string[] }> {
    return request<{ ok: boolean; changed: string[] }>('/api/admin/state', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAudit(): Promise<AuditEntry[]> {
    const result = await request<{ audit: AuditEntry[] }>('/api/admin/audit', { method: 'GET' });
    return Array.isArray(result.audit) ? result.audit : [];
  },

  async assignRole(email: string, role: AdminRole): Promise<void> {
    await request<{ session: unknown }>('/api/admin/role', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  async getMetrics(): Promise<AdminMetricsPayload> {
    return request<AdminMetricsPayload>('/api/admin/metrics', { method: 'GET' });
  },

  async runTechChecks(): Promise<{ ok: boolean; technical: AdminMetricsPayload['technical']; testHistory: string[]; history: AdminMetricsPayload['history'] }> {
    return request<{ ok: boolean; technical: AdminMetricsPayload['technical']; testHistory: string[]; history: AdminMetricsPayload['history'] }>(
      '/api/admin/metrics/check',
      { method: 'POST', body: JSON.stringify({}) }
    );
  },

  async exportBlob(type: 'audit' | 'metrics', format: 'json' | 'csv'): Promise<Blob> {
    const response = await fetch(`/api/admin/export?type=${type}&format=${format}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const raw = await response.text();
      let error = `Export failed (${response.status})`;
      try {
        const parsed = JSON.parse(raw) as { error?: string };
        if (parsed.error) error = parsed.error;
      } catch {
        if (raw) error = raw;
      }
      throw new Error(error);
    }
    return response.blob();
  },

  async getOps(): Promise<{
    users: {
      total: number;
      newToday: number;
      newMonth: number;
      newYear: number;
      activeToday: number;
      lostToday: number;
      lostMonth: number;
      lostYear: number;
    };
    finance: { paidAccounts: number; trialAccounts: number; contactLeads: number };
    updatedAt: string;
  }> {
    return request('/api/admin/ops', { method: 'GET' });
  },

  async renderTemplate(payload: {
    templateId?: string;
    subject?: string;
    preheader?: string;
    body?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }): Promise<{ html: string; text: string; heroPath: string }> {
    return request('/api/admin/templates/render', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendMail(payload: {
    to: string;
    subject: string;
    body: string;
    preheader?: string;
    templateId?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }): Promise<{ ok: boolean; delivered: boolean; reason?: string | null }> {
    return request('/api/admin/mail/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendAdminInvite(payload: {
    email: string;
    role: AdminRole;
  }): Promise<{ ok: boolean; inviteLink: string; delivered: boolean; reason?: string | null }> {
    return request('/api/admin/invites/admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendSiteInvite(payload: {
    email: string;
  }): Promise<{ ok: boolean; inviteLink: string; delivered: boolean; reason?: string | null }> {
    return request('/api/admin/invites/site', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getContacts(): Promise<{ contacts: ContactSubmission[] }> {
    return request('/api/admin/contacts', { method: 'GET' });
  },

  async replyToContact(payload: {
    id: string;
    subject?: string;
    message: string;
  }): Promise<{ ok: boolean; delivered: boolean; reason?: string | null }> {
    return request('/api/admin/contacts/reply', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getIntegrationsHealth(): Promise<{ integrations: IntegrationHealth[]; emailEnabled: boolean }> {
    return request('/api/admin/integrations/health', { method: 'GET' });
  },

  async searchMembers(query: string): Promise<{ members: MemberSummary[] }> {
    const q = encodeURIComponent(query.trim());
    return request(`/api/admin/members/search?q=${q}`, { method: 'GET' });
  },

  async getRetention(): Promise<RetentionSnapshot> {
    return request<RetentionSnapshot>('/api/admin/retention', { method: 'GET' });
  },

  async getInvites(): Promise<{ invites: AdminInviteRecord[] }> {
    return request('/api/admin/invites', { method: 'GET' });
  },

  async getCampaignQueue(): Promise<{ queue: CampaignQueueItem[] }> {
    return request('/api/admin/campaigns/queue', { method: 'GET' });
  },

  async scheduleCampaign(payload: {
    name: string;
    subject: string;
    body: string;
    templateId: string;
    recipients: string[] | string;
    sendAt?: string;
  }): Promise<{ ok: boolean; entry: CampaignQueueItem }> {
    return request('/api/admin/campaigns/schedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async processDueCampaigns(): Promise<{ ok: boolean; processed: number; sent: number; failed: number; queue: CampaignQueueItem[] }> {
    return request('/api/admin/campaigns/process-due', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};

export type ContactSubmission = {
  id: string;
  at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  repliedAt?: string | null;
};

export type IntegrationHealth = {
  id: string;
  name: string;
  ok: boolean;
  envKey: string;
  detail: string;
};

export type MemberSummary = {
  email: string;
  name: string;
  createdAt: string | null;
  role: string;
  billingStatus: string;
  plan: string | null;
};

export type AdminRecord = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
};
