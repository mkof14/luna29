import { ROLE_PERMISSIONS } from '../core/authRoles.mjs';

export const DEFAULT_ADMIN_STATE = {
  services: [
    { id: 'svc-auth', name: 'Auth Gateway', status: 'Healthy', owner: 'Ops', uptime: '99.98%' },
    { id: 'svc-ai', name: 'Narrative Engine', status: 'Healthy', owner: 'AI', uptime: '99.87%' },
    { id: 'svc-sync', name: 'Sync Queue', status: 'Degraded', owner: 'Platform', uptime: '98.62%' },
    { id: 'svc-mail', name: 'Mail Dispatch', status: 'Healthy', owner: 'Growth', uptime: '99.91%' },
  ],
  content: [],
  templates: [],
  templateHistory: {},
  admins: [
    { id: 'adm-0', name: 'Luna29 Primary Admin', email: 'dnainform@gmail.com', role: 'super_admin', active: true },
    { id: 'adm-1', name: 'Luna29 Owner', email: 'owner@luna.app', role: 'super_admin', active: true },
    { id: 'adm-2', name: 'Ops Control', email: 'ops@luna.app', role: 'operator', active: true },
    { id: 'adm-3', name: 'Growth Team', email: 'marketing@luna.app', role: 'content_manager', active: true },
    { id: 'adm-4', name: 'Finance Board', email: 'finance@luna.app', role: 'finance_manager', active: true },
  ],
  testHistory: [
    'Smoke tests: PASS (2026-03-03 08:20)',
    'Email template lint: PASS (2026-03-03 08:16)',
    'Analytics sync check: WARN (2026-03-03 07:54)',
  ],
  financialMetrics: {
    mrr: 48240,
    arr: 578880,
    churn: 2.4,
    ltv: 386,
    cac: 59,
    conversion: 6.8,
    activeSubscribers: 2148,
    trialToPaid: 41.7,
  },
  technicalMetrics: {
    apiP95: 183,
    errorRate: 0.31,
    queueLag: 12,
  },
  metricsHistory: [],
  audit: [],
  invites: [],
  campaignQueue: [],
};

export const sanitizeAdminState = (raw, { safeText, normalizeEmail, numberOr }) => {
  const next = { ...DEFAULT_ADMIN_STATE };
  if (!raw || typeof raw !== 'object') return next;

  if (Array.isArray(raw.services)) {
    next.services = raw.services.map((item, index) => ({
      id: safeText(item.id || `svc-${index}`, 80),
      name: safeText(item.name || 'Service', 120),
      status: ['Healthy', 'Degraded', 'Down'].includes(item.status) ? item.status : 'Healthy',
      owner: safeText(item.owner || 'Ops', 80),
      uptime: safeText(item.uptime || '99.00%', 20),
    }));
  }

  if (Array.isArray(raw.content)) next.content = raw.content.slice(0, 500);
  if (Array.isArray(raw.templates)) next.templates = raw.templates.slice(0, 500);
  if (raw.templateHistory && typeof raw.templateHistory === 'object') next.templateHistory = raw.templateHistory;

  if (Array.isArray(raw.admins)) {
    next.admins = raw.admins.map((item, index) => ({
      id: safeText(item.id || `adm-${index}`, 80),
      name: safeText(item.name || 'Admin', 120),
      email: normalizeEmail(item.email || ''),
      role: ROLE_PERMISSIONS[item.role] ? item.role : 'viewer',
      active: Boolean(item.active),
    }));
  }

  if (Array.isArray(raw.testHistory)) {
    next.testHistory = raw.testHistory.map((item) => safeText(item, 300)).filter(Boolean).slice(0, 100);
  }

  if (raw.financialMetrics && typeof raw.financialMetrics === 'object') {
    next.financialMetrics = {
      mrr: numberOr(raw.financialMetrics.mrr, 48240),
      arr: numberOr(raw.financialMetrics.arr, 578880),
      churn: numberOr(raw.financialMetrics.churn, 2.4),
      ltv: numberOr(raw.financialMetrics.ltv, 386),
      cac: numberOr(raw.financialMetrics.cac, 59),
      conversion: numberOr(raw.financialMetrics.conversion, 6.8),
      activeSubscribers: numberOr(raw.financialMetrics.activeSubscribers, 2148),
      trialToPaid: numberOr(raw.financialMetrics.trialToPaid, 41.7),
    };
  }

  if (raw.technicalMetrics && typeof raw.technicalMetrics === 'object') {
    next.technicalMetrics = {
      apiP95: numberOr(raw.technicalMetrics.apiP95, 183),
      errorRate: numberOr(raw.technicalMetrics.errorRate, 0.31),
      queueLag: numberOr(raw.technicalMetrics.queueLag, 12),
    };
  }

  if (Array.isArray(raw.metricsHistory)) {
    next.metricsHistory = raw.metricsHistory.slice(0, 365).map((item) => ({
      at: safeText(item.at || '', 64),
      mrr: numberOr(item.mrr, 0),
      churn: numberOr(item.churn, 0),
      subscribers: numberOr(item.subscribers, 0),
      apiP95: numberOr(item.apiP95, 0),
      errorRate: numberOr(item.errorRate, 0),
    }));
  }

  if (Array.isArray(raw.audit)) next.audit = raw.audit.slice(0, 500);

  if (Array.isArray(raw.invites)) {
    next.invites = raw.invites.slice(0, 500).map((item, index) => ({
      id: safeText(item.id || `inv-${index}`, 80),
      email: normalizeEmail(item.email || ''),
      kind: item.kind === 'admin' ? 'admin' : 'site',
      role: safeText(item.role || '', 40) || undefined,
      inviteLink: safeText(item.inviteLink || '', 500),
      delivered: Boolean(item.delivered),
      createdAt: safeText(item.createdAt || '', 40),
      createdBy: safeText(item.createdBy || '', 120),
    }));
  }

  if (Array.isArray(raw.campaignQueue)) {
    next.campaignQueue = raw.campaignQueue.slice(0, 200).map((item, index) => ({
      id: safeText(item.id || `cq-${index}`, 80),
      name: safeText(item.name || 'Campaign', 160),
      subject: safeText(item.subject || '', 200),
      body: safeText(item.body || '', 8000),
      templateId: safeText(item.templateId || 'tpl-newsletter', 80),
      recipients: Array.isArray(item.recipients)
        ? item.recipients.map((row) => normalizeEmail(String(row || ''))).filter((row) => row.includes('@')).slice(0, 200)
        : [],
      sendAt: safeText(item.sendAt || '', 40),
      status: ['scheduled', 'sent', 'failed', 'cancelled'].includes(item.status) ? item.status : 'scheduled',
      createdAt: safeText(item.createdAt || '', 40),
      sentAt: item.sentAt ? safeText(item.sentAt, 40) : null,
      error: item.error ? safeText(item.error, 300) : null,
    }));
  }

  return next;
};

export const pushAudit = (adminState, entry) => {
  const nextEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  adminState.audit = [nextEntry, ...(adminState.audit || [])].slice(0, 500);
};

export const updateAdminStateByPermissions = (adminState, incoming, sessionPayload) => {
  const allowed = {
    services: sessionPayload.permissions.includes('manage_services'),
    content: sessionPayload.permissions.includes('manage_marketing'),
    templates: sessionPayload.permissions.includes('manage_email_templates'),
    templateHistory: sessionPayload.permissions.includes('manage_email_templates'),
    admins: sessionPayload.permissions.includes('manage_admin_roles'),
    testHistory: sessionPayload.permissions.includes('manage_services'),
    financialMetrics: sessionPayload.permissions.includes('manage_admin_roles'),
    technicalMetrics: sessionPayload.permissions.includes('manage_admin_roles'),
    metricsHistory: sessionPayload.permissions.includes('manage_admin_roles'),
    invites: sessionPayload.permissions.includes('manage_admin_roles') || sessionPayload.permissions.includes('manage_marketing'),
    campaignQueue: sessionPayload.permissions.includes('manage_marketing'),
  };

  const changed = [];
  for (const key of Object.keys(allowed)) {
    if (!allowed[key]) continue;
    if (typeof incoming[key] === 'undefined') continue;
    adminState[key] = incoming[key];
    changed.push(key);
  }
  return changed;
};

export const createAdminStateStore = ({ readJson, writeJson, filePath, helpers }) => {
  let adminState = sanitizeAdminState(null, helpers);

  return {
    async load() {
      adminState = sanitizeAdminState(await readJson(filePath, DEFAULT_ADMIN_STATE), helpers);
      return adminState;
    },
    async save() {
      await writeJson(filePath, adminState);
    },
    getState() {
      return adminState;
    },
    setState(next) {
      adminState = next;
    },
    sanitize(raw) {
      return sanitizeAdminState(raw, helpers);
    },
    pushAudit(entry) {
      pushAudit(adminState, entry);
    },
    updateByPermissions(incoming, sessionPayload) {
      return updateAdminStateByPermissions(adminState, incoming, sessionPayload);
    },
  };
};
