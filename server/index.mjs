import http from 'node:http';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { getPublicVoiceConfig, handleVoiceConversation, listElevenLabsVoices } from './voiceConversation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.AUTH_API_PORT || 8787);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');
const ADMIN_DATA_FILE = path.join(DATA_DIR, 'admin-state.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contact-submissions.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const PRIVACY_REQUESTS_FILE = path.join(DATA_DIR, 'privacy-requests.json');
const BILLING_STATE_FILE = path.join(DATA_DIR, 'billing-state.json');
const MOBILE_REFLECTIONS_FILE = path.join(DATA_DIR, 'mobile-reflections.json');
const MOBILE_REPORTS_FILE = path.join(DATA_DIR, 'mobile-reports.json');
const MOBILE_STATE_FILE = path.join(DATA_DIR, 'mobile-state.json');
const MOBILE_PUSH_FILE = path.join(DATA_DIR, 'mobile-push.json');

const SESSION_COOKIE = 'luna_sid';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SUPER_ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 180;
const SUPER_ADMIN_BOOTSTRAP_PASSWORD = String(process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD || '').trim();
const SUPER_ADMIN_BOOTSTRAP_PASSWORD_CONFIGURED = Boolean(SUPER_ADMIN_BOOTSTRAP_PASSWORD);
const PRIMARY_SUPER_ADMIN_EMAIL = 'dnainform@gmail.com';

const SUPER_ADMIN_EMAILS = new Set(
  `${process.env.SUPER_ADMIN_EMAILS || ''},${PRIMARY_SUPER_ADMIN_EMAIL}`
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);
const GOOGLE_CLIENT_IDS = new Set(
  (process.env.AUTH_GOOGLE_CLIENT_IDS || process.env.VITE_GOOGLE_CLIENT_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
);
const AUTH_ALLOW_UNVERIFIED_GOOGLE = process.env.AUTH_ALLOW_UNVERIFIED_GOOGLE === 'true';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const BILLING_ENABLED = process.env.STRIPE_BILLING_ENABLED === 'true';
const STRIPE_SECRET_KEY = String(process.env.STRIPE_SECRET_KEY || '').trim();
const STRIPE_WEBHOOK_SECRET = String(process.env.STRIPE_WEBHOOK_SECRET || '').trim();
const STRIPE_PRICE_MONTHLY_ID = String(process.env.STRIPE_PRICE_MONTHLY_ID || '').trim();
const STRIPE_PRICE_YEARLY_ID = String(process.env.STRIPE_PRICE_YEARLY_ID || '').trim();
const STRIPE_SUCCESS_URL = String(process.env.STRIPE_SUCCESS_URL || '').trim();
const STRIPE_CANCEL_URL = String(process.env.STRIPE_CANCEL_URL || '').trim();
const STRIPE_PORTAL_RETURN_URL = String(process.env.STRIPE_PORTAL_RETURN_URL || '').trim();
const STRIPE_TRIAL_DAYS = Math.max(0, Number(process.env.STRIPE_TRIAL_DAYS || '7') || 0);
const ADMIN_EMERGENCY_RESET_KEY = String(process.env.ADMIN_EMERGENCY_RESET_KEY || '').trim();

const buildStripeCheckoutFields = (fields) => {
  if (STRIPE_TRIAL_DAYS > 0) {
    fields.push(['subscription_data[trial_period_days]', String(STRIPE_TRIAL_DAYS)]);
  }
  return fields;
};

const ROLE_PERMISSIONS = {
  viewer: ['view_financials', 'view_technical_metrics'],
  operator: ['manage_services', 'view_technical_metrics'],
  content_manager: ['manage_marketing', 'manage_email_templates'],
  finance_manager: ['view_financials'],
  super_admin: [
    'manage_services',
    'manage_marketing',
    'manage_email_templates',
    'manage_admin_roles',
    'view_financials',
    'view_technical_metrics',
  ],
};

const ADMIN_EMAIL_RULES = [
  { pattern: /admin|owner|founder/i, role: 'super_admin' },
  { pattern: /ops|support|service/i, role: 'operator' },
  { pattern: /marketing|content|brand/i, role: 'content_manager' },
  { pattern: /finance|billing|accounting/i, role: 'finance_manager' },
];

const ALLOWED_ORIGINS = new Set(
  (process.env.AUTH_ALLOWED_ORIGINS
    || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173,https://luna29.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const rateLimits = new Map();
const sessions = new Map();
let lastSessionPurgeAt = 0;

const DEFAULT_ADMIN_STATE = {
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
    { id: 'adm-0', name: 'Luna29 Primary Admin', email: PRIMARY_SUPER_ADMIN_EMAIL, role: 'super_admin', active: true },
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
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeName = (email, fallback = 'Luna29 Member') => {
  const local = email.split('@')[0] || '';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return fallback;
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const safeText = (value, max = 5000) => String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
const safeId = (value, max = 120) => String(value || '').replace(/[^a-zA-Z0-9:_-]/g, '').trim().slice(0, max);

const createMobileProfile = (name = 'Anna') => ({
  name: safeText(name, 80) || 'Anna',
  entries: [],
  updatedAt: new Date().toISOString(),
});

const sanitizeMobileState = (raw) => {
  if (!raw || typeof raw !== 'object') return { profiles: {} };
  const profilesRaw = raw.profiles && typeof raw.profiles === 'object' ? raw.profiles : {};
  const profiles = {};

  for (const [key, value] of Object.entries(profilesRaw)) {
    const profileKey = safeId(key, 160);
    if (!profileKey || !value || typeof value !== 'object') continue;

    const entriesRaw = Array.isArray(value.entries) ? value.entries : [];
    const entries = entriesRaw
      .map((item) => {
        const id = safeText(item?.id, 120);
        const at = safeText(item?.at, 64) || new Date().toISOString();
        const mode = ['voice', 'quick_checkin', 'write'].includes(item?.mode) ? item.mode : 'voice';
        const text = safeText(item?.text, 500);
        if (!id || !text) return null;
        return { id, at, mode, text };
      })
      .filter(Boolean)
      .slice(0, 200);

    profiles[profileKey] = {
      name: safeText(value.name, 80) || 'Anna',
      entries,
      updatedAt: safeText(value.updatedAt, 64) || new Date().toISOString(),
    };
  }

  return { profiles };
};

const mapStoryEntries = (entries = []) =>
  entries.slice(0, 4).map((entry, index) => ({
    id: entry.id,
    label: index === 0 ? 'Today' : index === 1 ? 'Yesterday' : index === 2 ? '3 days ago' : 'Earlier',
    text: entry.text,
  }));

const buildPatternByCount = (count) => {
  if (count >= 30) {
    return 'Your energy tends to dip before your cycle. Sleep affects mood during the week.';
  }
  if (count >= 7) {
    return 'Your energy often drops a couple of days before your cycle.';
  }
  return 'Luna29 is still learning about you. The more you reflect, the clearer your rhythm becomes.';
};

const buildTodayExplanation = (count) => {
  if (count >= 30) return 'Today may feel slower before your cycle. A calm evening can help you reset.';
  if (count >= 7) return 'Today may feel a little slower. Sleep was shorter last night and your body is in the luteal phase.';
  return 'Today may feel a little slower while Luna29 learns your rhythm day by day.';
};

const buildReflectionSummary = (lastEntryText) => {
  if (!lastEntryText) {
    return [
      'You sounded a little tired today.',
      'You mentioned pressure at work.',
      'Your sleep was shorter than usual.',
    ];
  }
  return [
    'Luna29 heard your reflection today.',
    lastEntryText,
    'Your words suggest the day asked a lot from you.',
  ];
};

const sanitizeMobileReportsState = (raw) => {
  if (!raw || typeof raw !== 'object') return { profiles: {} };
  const profilesRaw = raw.profiles && typeof raw.profiles === 'object' ? raw.profiles : {};
  const profiles = {};
  for (const [key, value] of Object.entries(profilesRaw)) {
    const profileKey = safeId(key, 160);
    if (!profileKey || !Array.isArray(value)) continue;
    profiles[profileKey] = value
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const id = safeText(item.id, 120);
        const generatedAt = safeText(item.generatedAt, 64);
        const text = safeText(item.text, 20000);
        if (!id || !generatedAt || !text) return null;
        return { id, generatedAt, text };
      })
      .filter(Boolean)
      .slice(0, 100);
  }
  return { profiles };
};

const sanitizeMobileStateStore = (raw) => {
  if (!raw || typeof raw !== 'object') return { profiles: {} };
  const profilesRaw = raw.profiles && typeof raw.profiles === 'object' ? raw.profiles : {};
  const profiles = {};
  for (const [key, value] of Object.entries(profilesRaw)) {
    const profileKey = safeId(key, 160);
    if (!profileKey || !value || typeof value !== 'object') continue;
    const sectionsRaw = value.sections && typeof value.sections === 'object' ? value.sections : {};
    const sections = {};
    for (const [sectionKey, sectionData] of Object.entries(sectionsRaw)) {
      const nextSectionKey = safeId(sectionKey, 80);
      if (!nextSectionKey) continue;
      sections[nextSectionKey] = sectionData;
    }
    profiles[profileKey] = {
      sections,
      updatedAt: safeText(value.updatedAt, 64) || new Date().toISOString(),
    };
  }
  return { profiles };
};

const sanitizeMobilePushStore = (raw) => {
  if (!raw || typeof raw !== 'object') return { profiles: {} };
  const profilesRaw = raw.profiles && typeof raw.profiles === 'object' ? raw.profiles : {};
  const profiles = {};
  for (const [key, value] of Object.entries(profilesRaw)) {
    const profileKey = safeId(key, 160);
    if (!profileKey || !value || typeof value !== 'object') continue;
    const tokensRaw = Array.isArray(value.tokens) ? value.tokens : [];
    const tokens = tokensRaw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const token = safeText(item.token, 512);
        const platform = safeText(item.platform, 32);
        const deviceName = safeText(item.deviceName, 120);
        const updatedAt = safeText(item.updatedAt, 64) || new Date().toISOString();
        if (!token) return null;
        return { token, platform: platform || 'unknown', deviceName, updatedAt };
      })
      .filter(Boolean)
      .slice(0, 10);

    profiles[profileKey] = {
      tokens,
      updatedAt: safeText(value.updatedAt, 64) || new Date().toISOString(),
    };
  }
  return { profiles };
};

const readJson = async (filePath, fallback) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = async (filePath, value) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
};

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${digest}`;
};

const verifyPassword = (password, encoded) => {
  if (!encoded || typeof encoded !== 'string') return false;
  const [algo, salt, digest] = encoded.split(':');
  if (algo !== 'scrypt' || !salt || !digest) return false;
  const computed = scryptSync(password, salt, 64).toString('hex');
  const digestBuf = Buffer.from(digest, 'hex');
  const computedBuf = Buffer.from(computed, 'hex');
  if (digestBuf.length !== computedBuf.length) return false;
  return timingSafeEqual(digestBuf, computedBuf);
};

const parseCookies = (cookieHeader) => {
  const result = {};
  if (!cookieHeader) return result;
  const chunks = cookieHeader.split(';');
  for (const chunk of chunks) {
    const [rawKey, ...rest] = chunk.trim().split('=');
    if (!rawKey) continue;
    result[rawKey] = decodeURIComponent(rest.join('='));
  }
  return result;
};

const buildSecurityHeaders = () => {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  };
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }
  return headers;
};

const send = (res, status, payload, extraHeaders = {}) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...buildSecurityHeaders(),
    ...extraHeaders,
  });
  res.end(body);
};

const sendText = (res, status, text, extraHeaders = {}) => {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    ...buildSecurityHeaders(),
    ...extraHeaders,
  });
  res.end(text);
};

const sendEmpty = (res, status, extraHeaders = {}) => {
  res.writeHead(status, {
    ...buildSecurityHeaders(),
    ...extraHeaders,
  });
  res.end();
};

const isStripeConfigReady = () =>
  Boolean(
    STRIPE_SECRET_KEY &&
      STRIPE_WEBHOOK_SECRET &&
      STRIPE_PRICE_MONTHLY_ID &&
      STRIPE_PRICE_YEARLY_ID &&
      STRIPE_SUCCESS_URL &&
      STRIPE_CANCEL_URL &&
      STRIPE_PORTAL_RETURN_URL
  );

const checkStorageWritable = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const probePath = path.join(DATA_DIR, '.healthcheck-probe');
    await fs.writeFile(probePath, String(Date.now()), 'utf8');
    await fs.unlink(probePath);
    return true;
  } catch {
    return false;
  }
};

const buildHealthPayload = async ({ verbose = false } = {}) => {
  const now = new Date().toISOString();
  const storageWritable = await checkStorageWritable();
  const stripeConfigReady = isStripeConfigReady();
  const billingStatus = !BILLING_ENABLED ? 'disabled' : stripeConfigReady ? 'ready' : 'misconfigured';
  const googleAuthConfigured = GOOGLE_CLIENT_IDS.size > 0;
  const aiScanEnabled = Boolean(GEMINI_API_KEY);
  const ok = storageWritable && (!BILLING_ENABLED || stripeConfigReady);
  const warnings = [];

  if (!storageWritable) warnings.push('Storage is not writable.');
  if (BILLING_ENABLED && !stripeConfigReady) warnings.push('Stripe billing is enabled but required env vars are missing.');
  if (!googleAuthConfigured) warnings.push('Google OAuth client IDs are not configured.');
  if (!aiScanEnabled) warnings.push('AI scan-to-text is disabled (set GEMINI_API_KEY to enable).');

  const payload = {
    ok,
    service: 'luna-auth-api',
    timestamp: now,
    uptimeSec: Math.floor(process.uptime()),
    environment: 'node',
    checks: {
      storage: storageWritable ? 'ok' : 'error',
      billing: billingStatus,
      googleAuth: googleAuthConfigured ? 'configured' : 'missing',
      aiScan: aiScanEnabled ? 'enabled' : 'disabled',
    },
  };

  if (verbose) {
    payload.warnings = warnings;
    payload.config = {
      allowedOrigins: ALLOWED_ORIGINS.size,
      superAdminEmails: SUPER_ADMIN_EMAILS.size,
      superAdminBootstrapPasswordConfigured: SUPER_ADMIN_BOOTSTRAP_PASSWORD_CONFIGURED,
      emergencyResetConfigured: Boolean(ADMIN_EMERGENCY_RESET_KEY),
      billingEnabled: BILLING_ENABLED,
      stripeConfigReady,
      googleClientIds: GOOGLE_CLIENT_IDS.size,
      aiScanEnabled,
    };
  }

  return payload;
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
};

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const decodeGoogleJwt = (credential) => {
  try {
    const [, payload] = String(credential || '').split('.');
    if (!payload) return {};
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const claims = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    return {
      email: typeof claims.email === 'string' ? claims.email : undefined,
      name: typeof claims.name === 'string' ? claims.name : undefined,
      picture: typeof claims.picture === 'string' ? claims.picture : undefined,
    };
  } catch {
    return {};
  }
};

const verifyGoogleCredential = async (credential) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
      method: 'GET',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error('Google token verification failed.');
    }
    const claims = await response.json();
    const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : '';
    const emailVerified = String(claims.email_verified || '').toLowerCase() === 'true';
    const audience = typeof claims.aud === 'string' ? claims.aud.trim() : '';
    const issuer = typeof claims.iss === 'string' ? claims.iss : '';
    const issuedByGoogle = issuer === 'accounts.google.com' || issuer === 'https://accounts.google.com';

    if (!email || !emailVerified || !issuedByGoogle) {
      throw new Error('Google token is invalid or email is not verified.');
    }
    if (GOOGLE_CLIENT_IDS.size > 0 && !GOOGLE_CLIENT_IDS.has(audience)) {
      throw new Error('Google token audience mismatch.');
    }

    return {
      email,
      name: typeof claims.name === 'string' ? claims.name : undefined,
      picture: typeof claims.picture === 'string' ? claims.picture : undefined,
    };
  } finally {
    clearTimeout(timer);
  }
};

const resolveRole = (email, roleOverride = null) => {
  if (roleOverride && ROLE_PERMISSIONS[roleOverride]) return roleOverride;
  const normalizedEmail = normalizeEmail(email);
  if (SUPER_ADMIN_EMAILS.has(normalizedEmail)) return 'super_admin';
  for (const rule of ADMIN_EMAIL_RULES) {
    if (rule.pattern.test(normalizedEmail)) return rule.role;
  }
  return 'viewer';
};

const buildSessionPayload = (user) => {
  const role = resolveRole(user.email, user.roleOverride || null);
  const provider = user.lastProvider === 'google' ? 'google' : 'password';
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider,
    role,
    permissions: ROLE_PERMISSIONS[role],
    lastLoginAt: new Date().toISOString(),
    avatarUrl: user.avatarUrl,
  };
};

const parseStoredSessions = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const item = raw || {};
      const token = safeText(item.token, 256);
      const userId = safeText(item.userId, 256);
      const expiresAt = Number(item.expiresAt);
      const maxAgeSec = Number(item.maxAgeSec);
      if (!token || !userId || !Number.isFinite(expiresAt)) return null;
      return {
        token,
        userId,
        expiresAt,
        maxAgeSec: Number.isFinite(maxAgeSec) && maxAgeSec > 0 ? maxAgeSec : SESSION_TTL_SECONDS,
      };
    })
    .filter(Boolean);
};

const serializeSessions = () =>
  Array.from(sessions.entries()).map(([token, value]) => ({
    token,
    userId: value.userId,
    expiresAt: value.expiresAt,
    maxAgeSec: Number.isFinite(value.maxAgeSec) && value.maxAgeSec > 0 ? value.maxAgeSec : SESSION_TTL_SECONDS,
  }));

const purgeExpiredSessions = (now = Date.now()) => {
  let changed = false;
  for (const [token, value] of sessions.entries()) {
    if (value.expiresAt < now) {
      sessions.delete(token);
      changed = true;
    }
  }
  return changed;
};

const createSession = (user) => {
  const maxAgeSec = SUPER_ADMIN_EMAILS.has(normalizeEmail(user.email)) ? SUPER_ADMIN_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS;
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + maxAgeSec * 1000;
  sessions.set(token, { userId: user.id, expiresAt, maxAgeSec });
  return token;
};

const getSessionUser = async (req, users) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  const user = users.find((item) => item.id === session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return { token, user };
};

const getSessionByToken = (token, users) => {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  const user = users.find((item) => item.id === session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return { token, user };
};

const getMobileAuthUser = (req, users) => {
  const auth = String(req.headers.authorization || '').trim();
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  const token = auth.slice('bearer '.length).trim();
  return getSessionByToken(token, users);
};

const corsHeaders = (origin) => {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-luna-mobile-id',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    Vary: 'Origin',
  };
};

const clearSessionCookie = () => `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;

const createSessionCookie = (token) => {
  const session = sessions.get(token);
  const maxAge = session && Number.isFinite(session.maxAgeSec) && session.maxAgeSec > 0 ? session.maxAgeSec : SESSION_TTL_SECONDS;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${secure}`;
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
};

const rateLimit = (key, limit, windowMs) => {
  const now = Date.now();
  const state = rateLimits.get(key);
  if (!state || state.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (state.count >= limit) return false;
  state.count += 1;
  return true;
};

const hasAnyPermission = (sessionPayload, permissions) => permissions.some((item) => sessionPayload.permissions.includes(item));

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const numberOr = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toCsv = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );

  const escape = (value) => {
    const text = String(value ?? '');
    if (text.includes('"') || text.includes(',') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [columns.join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => escape(row[column])).join(','));
  }
  return lines.join('\n');
};

const parseDataUrl = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
};

const extractLabTextFromImage = async ({ dataUrl, mimeType = 'image/png' }) => {
  const parsed = parseDataUrl(dataUrl);
  const resolvedMime = parsed?.mimeType || mimeType;
  const base64 = parsed?.base64;

  if (!base64) {
    return { text: '', message: 'Invalid image payload.' };
  }

  if (!GEMINI_API_KEY) {
    return {
      text: '',
      message: 'AI image extraction is disabled. Set GEMINI_API_KEY to enable scan-to-text.',
    };
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Extract medical/lab text exactly from this image. Return plain text only, keep values and units line-by-line.' },
          { inlineData: { mimeType: resolvedMime, data: base64 } },
        ],
      },
    ],
  });

  const text = String(response?.text || '').trim();
  return {
    text,
    message: text ? 'Image scan completed.' : 'No readable text detected in image.',
  };
};

const sanitizeAdminState = (raw) => {
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

  if (Array.isArray(raw.content)) {
    next.content = raw.content.slice(0, 500);
  }

  if (Array.isArray(raw.templates)) {
    next.templates = raw.templates.slice(0, 500);
  }

  if (raw.templateHistory && typeof raw.templateHistory === 'object') {
    next.templateHistory = raw.templateHistory;
  }

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

  if (Array.isArray(raw.audit)) {
    next.audit = raw.audit.slice(0, 500);
  }

  return next;
};

const pushAudit = (adminState, entry) => {
  const nextEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  adminState.audit = [nextEntry, ...(adminState.audit || [])].slice(0, 500);
};

const updateAdminStateByPermissions = (adminState, incoming, sessionPayload) => {
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

const stripeConfigError = () => {
  if (!BILLING_ENABLED) return 'Stripe billing is disabled. Set STRIPE_BILLING_ENABLED=true.';
  if (!STRIPE_SECRET_KEY) return 'Missing STRIPE_SECRET_KEY.';
  if (!STRIPE_PRICE_MONTHLY_ID || !STRIPE_PRICE_YEARLY_ID) return 'Missing STRIPE_PRICE_MONTHLY_ID or STRIPE_PRICE_YEARLY_ID.';
  if (!STRIPE_SUCCESS_URL || !STRIPE_CANCEL_URL) return 'Missing STRIPE_SUCCESS_URL or STRIPE_CANCEL_URL.';
  return '';
};

const stripeFormBody = (entries) => {
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    params.append(key, String(value));
  }
  return params.toString();
};

const constantTimeEquals = (a, b) => {
  const left = Buffer.from(a || '', 'utf8');
  const right = Buffer.from(b || '', 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
};

const verifyStripeSignature = (rawBody, signatureHeader, secret) => {
  if (!signatureHeader || !secret) return false;
  const pairs = String(signatureHeader)
    .split(',')
    .map((chunk) => chunk.trim().split('='))
    .filter((item) => item.length === 2);
  const timestamp = pairs.find(([key]) => key === 't')?.[1];
  const signatures = pairs.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;
  const payload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  return signatures.some((value) => constantTimeEquals(value, expected));
};

const sanitizeCorrectionPayload = (payload) => {
  const next = {};
  if (typeof payload !== 'object' || payload === null) return next;
  if (typeof payload.name === 'string' && payload.name.trim()) {
    next.name = safeText(payload.name, 120);
  }
  return next;
};

const stripeRequest = async (method, url, body = null) => {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    ...(body ? { body } : {}),
  });
  const raw = await response.text();
  let parsed = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = { raw };
  }
  return { ok: response.ok, status: response.status, data: parsed };
};

const start = async () => {
  let users = await readJson(DATA_FILE, []);
  if (!Array.isArray(users)) users = [];

  let adminState = sanitizeAdminState(await readJson(ADMIN_DATA_FILE, DEFAULT_ADMIN_STATE));
  let contactSubmissions = await readJson(CONTACTS_FILE, []);
  if (!Array.isArray(contactSubmissions)) contactSubmissions = [];
  let privacyRequests = await readJson(PRIVACY_REQUESTS_FILE, []);
  if (!Array.isArray(privacyRequests)) privacyRequests = [];
  let billingState = await readJson(BILLING_STATE_FILE, {});
  if (!billingState || typeof billingState !== 'object') billingState = {};
  let mobileReflections = sanitizeMobileState(await readJson(MOBILE_REFLECTIONS_FILE, { profiles: {} }));
  let mobileReports = sanitizeMobileReportsState(await readJson(MOBILE_REPORTS_FILE, { profiles: {} }));
  let mobileStateStore = sanitizeMobileStateStore(await readJson(MOBILE_STATE_FILE, { profiles: {} }));
  let mobilePushStore = sanitizeMobilePushStore(await readJson(MOBILE_PUSH_FILE, { profiles: {} }));
  const storedSessions = parseStoredSessions(await readJson(SESSIONS_FILE, []));
  for (const item of storedSessions) {
    sessions.set(item.token, { userId: item.userId, expiresAt: item.expiresAt });
  }
  const didPurgeOnBoot = purgeExpiredSessions();

  const saveUsers = async () => writeJson(DATA_FILE, users);
  const saveAdminState = async () => writeJson(ADMIN_DATA_FILE, adminState);
  const saveContacts = async () => writeJson(CONTACTS_FILE, contactSubmissions);
  const saveSessions = async () => writeJson(SESSIONS_FILE, serializeSessions());
  const savePrivacyRequests = async () => writeJson(PRIVACY_REQUESTS_FILE, privacyRequests);
  const saveBillingState = async () => writeJson(BILLING_STATE_FILE, billingState);
  const saveMobileReflections = async () => writeJson(MOBILE_REFLECTIONS_FILE, mobileReflections);
  const saveMobileReports = async () => writeJson(MOBILE_REPORTS_FILE, mobileReports);
  const saveMobileStateStore = async () => writeJson(MOBILE_STATE_FILE, mobileStateStore);
  const saveMobilePushStore = async () => writeJson(MOBILE_PUSH_FILE, mobilePushStore);

  const resolveMobileProfile = async (req, ip) => {
    const cookieSession = await getSessionUser(req, users);
    const bearerSession = getMobileAuthUser(req, users);
    const mobileAuth = cookieSession || bearerSession;
    const mobileIdHeader = safeId(req.headers['x-luna-mobile-id'], 160);
    const profileKey = mobileAuth?.user?.id
      ? `user:${safeId(mobileAuth.user.id, 120)}`
      : mobileIdHeader
        ? `device:${mobileIdHeader}`
        : `guest:${safeId(ip, 120)}`;

    const defaultName = mobileAuth?.user?.name ? safeText(mobileAuth.user.name, 80) : 'Anna';
    if (!mobileReflections.profiles[profileKey]) {
      mobileReflections.profiles[profileKey] = createMobileProfile(defaultName);
      await saveMobileReflections();
    }

    const profile = mobileReflections.profiles[profileKey];
    if (!profile.name && defaultName) {
      profile.name = defaultName;
    }

    return { profile, profileKey };
  };

  const resolveMobileReportsProfile = async (req, ip) => {
    const { profileKey } = await resolveMobileProfile(req, ip);
    if (!mobileReports.profiles[profileKey]) {
      mobileReports.profiles[profileKey] = [];
      await saveMobileReports();
    }
    return { profileKey, reports: mobileReports.profiles[profileKey] };
  };

  const resolveMobileStateProfile = async (req, ip) => {
    const { profileKey } = await resolveMobileProfile(req, ip);
    if (!mobileStateStore.profiles[profileKey]) {
      mobileStateStore.profiles[profileKey] = { sections: {}, updatedAt: new Date().toISOString() };
      await saveMobileStateStore();
    }
    return { profileKey, profile: mobileStateStore.profiles[profileKey] };
  };

  const resolveMobilePushProfile = async (req, ip) => {
    const { profileKey } = await resolveMobileProfile(req, ip);
    if (!mobilePushStore.profiles[profileKey]) {
      mobilePushStore.profiles[profileKey] = { tokens: [], updatedAt: new Date().toISOString() };
      await saveMobilePushStore();
    }
    return { profileKey, profile: mobilePushStore.profiles[profileKey] };
  };

  let didBootstrapSuperAdmin = false;
  for (const email of SUPER_ADMIN_EMAILS) {
    let account = users.find((item) => item.email === email);
    if (!account) {
      account = {
        id: randomBytes(12).toString('hex'),
        email,
        name: 'Luna29 Super Admin',
        passwordHash: SUPER_ADMIN_BOOTSTRAP_PASSWORD ? hashPassword(SUPER_ADMIN_BOOTSTRAP_PASSWORD) : null,
        createdAt: new Date().toISOString(),
        roleOverride: 'super_admin',
        lastProvider: SUPER_ADMIN_BOOTSTRAP_PASSWORD ? 'password' : 'google',
        avatarUrl: undefined,
      };
      users = [account, ...users];
      didBootstrapSuperAdmin = true;
      continue;
    }

    if (account.roleOverride !== 'super_admin') {
      account.roleOverride = 'super_admin';
      didBootstrapSuperAdmin = true;
    }

    if (SUPER_ADMIN_BOOTSTRAP_PASSWORD) {
      if (!account.passwordHash || !verifyPassword(SUPER_ADMIN_BOOTSTRAP_PASSWORD, account.passwordHash)) {
        account.passwordHash = hashPassword(SUPER_ADMIN_BOOTSTRAP_PASSWORD);
        account.lastProvider = 'password';
        didBootstrapSuperAdmin = true;
      }
    }
  }
  if (didBootstrapSuperAdmin) {
    await saveUsers();
  }

  if (didPurgeOnBoot || storedSessions.length === 0) {
    await saveSessions();
  }

  const requireSession = async (req, res, headers) => {
    const current = await getSessionUser(req, users);
    if (!current) {
      send(res, 401, { error: 'Not authenticated.' }, headers);
      return null;
    }
    return { current, sessionPayload: buildSessionPayload(current.user) };
  };

  const server = http.createServer(async (req, res) => {
    try {
    const method = req.method || 'GET';
    const origin = req.headers.origin;
    const headers = corsHeaders(origin);

    if (method === 'OPTIONS') {
      sendEmpty(res, 204, headers);
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const ip = getClientIp(req);

    if (Date.now() - lastSessionPurgeAt > 60_000) {
      lastSessionPurgeAt = Date.now();
      if (purgeExpiredSessions()) {
        await saveSessions();
      }
    }

    if (method === 'GET' && url.pathname === '/api/health') {
      const verbose = ['1', 'true', 'yes'].includes(String(url.searchParams.get('verbose') || '').toLowerCase());
      const payload = await buildHealthPayload({ verbose });
      send(res, payload.ok ? 200 : 503, payload, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/auth/session') {
      const current = getMobileAuthUser(req, users);
      if (!current) {
        send(res, 200, { session: null }, headers);
        return;
      }
      send(res, 200, { session: buildSessionPayload(current.user) }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/auth/signup') {
      if (!rateLimit(`mobile-signup:${ip}`, 12, 60_000)) {
        send(res, 429, { error: 'Too many signup attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const password = String(body.password || '');
        const name = typeof body.name === 'string' && body.name.trim() ? safeText(body.name, 120) : normalizeName(email, 'Luna29 Member');

        if (!email || !email.includes('@')) {
          send(res, 400, { error: 'Provide a valid email.' }, headers);
          return;
        }
        if (password.length < 8) {
          send(res, 400, { error: 'Password must contain at least 8 characters.' }, headers);
          return;
        }
        if (users.some((item) => item.email === email)) {
          send(res, 409, { error: 'Account already exists. Please sign in.' }, headers);
          return;
        }

        const user = {
          id: randomBytes(12).toString('hex'),
          email,
          name,
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
          roleOverride: null,
          lastProvider: 'password',
          avatarUrl: undefined,
        };
        users = [user, ...users];
        await saveUsers();

        const token = createSession(user);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user), token }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to sign up.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/auth/signin') {
      if (!rateLimit(`mobile-signin:${ip}`, 24, 60_000)) {
        send(res, 429, { error: 'Too many login attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const password = String(body.password || '');
        const user = users.find((item) => item.email === email);
        if (!user || !verifyPassword(password, user.passwordHash)) {
          send(res, 401, { error: 'Invalid credentials.' }, headers);
          return;
        }

        user.lastProvider = 'password';
        const token = createSession(user);
        await saveUsers();
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user), token }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to sign in.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/auth/logout') {
      const current = getMobileAuthUser(req, users);
      if (current) {
        sessions.delete(current.token);
        await saveSessions();
      }
      send(res, 200, { ok: true }, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/auth/providers') {
      send(
        res,
        200,
        {
          google: Boolean(process.env.EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID || process.env.AUTH_GOOGLE_CLIENT_IDS),
          apple: true,
          message: 'Native provider auth requires app-build credentials and store-ready configuration.',
        },
        headers,
      );
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/today') {
      const { profile } = await resolveMobileProfile(req, ip);
      const storyEntries = mapStoryEntries(profile.entries);
      send(
        res,
        200,
        {
          userName: profile.name || 'Anna',
          title: 'Today with Luna29',
          explanation: buildTodayExplanation(profile.entries.length),
          continuity: storyEntries[1]?.text ? `Yesterday you said: ${storyEntries[1].text}` : 'Yesterday you said work felt heavy.',
          context: {
            cycle: 'Day 17 · Luteal phase',
            energy: 'Lower today',
            mood: 'Sensitive',
            sleep: '6h 20m',
          },
        },
        headers,
      );
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/reflection-result') {
      const { profile } = await resolveMobileProfile(req, ip);
      const latest = profile.entries[0];
      send(
        res,
        200,
        {
          shortSummary: buildReflectionSummary(latest?.text || ''),
          suggestion: ['Take a slower evening.', 'Try to rest a little earlier tonight.'],
          continuity: profile.entries[1]?.text ? `Yesterday you said: ${profile.entries[1].text}` : 'Yesterday you said work felt heavy.',
          pattern: buildPatternByCount(profile.entries.length),
        },
        headers,
      );
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/story') {
      const { profile } = await resolveMobileProfile(req, ip);
      send(
        res,
        200,
        {
          entries: mapStoryEntries(profile.entries),
        },
        headers,
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/reflection') {
      if (!rateLimit(`mobile-reflection:${ip}`, 40, 60_000)) {
        send(res, 429, { error: 'Too many reflection updates. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const mode = ['voice', 'quick_checkin', 'write'].includes(body.mode) ? body.mode : 'voice';
        const text = safeText(body.text || '', 500);
        if (!text) {
          send(res, 400, { error: 'Reflection text is required.' }, headers);
          return;
        }

        const { profile } = await resolveMobileProfile(req, ip);
        profile.entries = [
          {
            id: `mob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            at: new Date().toISOString(),
            mode,
            text,
          },
          ...(Array.isArray(profile.entries) ? profile.entries : []),
        ].slice(0, 200);
        profile.updatedAt = new Date().toISOString();
        await saveMobileReflections();

        send(
          res,
          200,
          {
            ok: true,
            entries: mapStoryEntries(profile.entries),
            reflection: {
              shortSummary: buildReflectionSummary(text),
              suggestion: ['Take a slower evening.', 'Try to rest a little earlier tonight.'],
              continuity: profile.entries[1]?.text ? `Yesterday you said: ${profile.entries[1].text}` : 'Yesterday you said work felt heavy.',
              pattern: buildPatternByCount(profile.entries.length),
            },
          },
          headers,
        );
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not save reflection.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/reports/generate') {
      if (!rateLimit(`mobile-reports-generate:${ip}`, 24, 60_000)) {
        send(res, 429, { error: 'Too many report generations. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        const now = new Date();
        const id = `LUNA29-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${Math.floor(Math.random() * 900 + 100)}`;
        const cycleDay = safeText(body.cycleDay, 32) || '17';
        const sleep = safeText(body.sleep, 64) || '6h 20m';
        const energy = safeText(body.energy, 64) || 'Lower';
        const mood = safeText(body.mood, 64) || 'Sensitive';
        const source = safeText(body.source, 160) || 'Blood test + user note';
        const note = safeText(body.note, 500) || 'No additional notes.';
        const hormones = body.hormones && typeof body.hormones === 'object' ? body.hormones : {};
        const labs = body.labs && typeof body.labs === 'object' ? body.labs : {};

        const text = [
          'Luna29 Health Report',
          `Report ID: ${id}`,
          `Generated: ${now.toLocaleString()}`,
          '',
          'Today context',
          `Cycle day: ${cycleDay}`,
          `Sleep: ${sleep}`,
          `Energy: ${energy}`,
          `Mood: ${mood}`,
          `Source: ${source}`,
          '',
          'Hormones',
          `Estradiol: ${safeText(hormones.estradiol, 64) || 'n/a'}`,
          `Progesterone: ${safeText(hormones.progesterone, 64) || 'n/a'}`,
          `Cortisol: ${safeText(hormones.cortisol, 64) || 'n/a'}`,
          '',
          'Lab markers',
          `Ferritin: ${safeText(labs.ferritin, 64) || 'n/a'}`,
          `TSH: ${safeText(labs.tsh, 64) || 'n/a'}`,
          `Vitamin D: ${safeText(labs.vitaminD, 64) || 'n/a'}`,
          '',
          'Interpretation summary',
          '- Energy and mood can feel more sensitive after shorter sleep.',
          '- Luteal-phase timing may align with lower stress tolerance.',
          '- Track markers over time with your doctor for context.',
          '',
          'Gentle recommendation:',
          'Keep tonight slower, hydrate, and prioritize earlier sleep.',
          `Note: ${note}`,
          '',
          'LUNA29 IS NOT A DIAGNOSIS TOOL. IF NEEDED, CONTACT YOUR DOCTOR.',
        ].join('\n');

        send(res, 200, { id, generatedAt: now.toISOString(), text }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not generate report.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/reports/save') {
      try {
        const body = await readBody(req);
        const id = safeText(body.id, 120);
        const generatedAt = safeText(body.generatedAt, 64) || new Date().toISOString();
        const text = safeText(body.text, 20000);
        if (!id || !text) {
          send(res, 400, { error: 'Invalid report payload.' }, headers);
          return;
        }

        const { reports } = await resolveMobileReportsProfile(req, ip);
        const next = [{ id, generatedAt, text }, ...(Array.isArray(reports) ? reports : [])]
          .filter((item, index, arr) => arr.findIndex((target) => target.id === item.id) === index)
          .slice(0, 100);
        const { profileKey } = await resolveMobileReportsProfile(req, ip);
        mobileReports.profiles[profileKey] = next;
        await saveMobileReports();
        send(res, 200, { ok: true }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not save report.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/reports/history') {
      const { reports } = await resolveMobileReportsProfile(req, ip);
      send(res, 200, Array.isArray(reports) ? reports.slice(0, 20) : [], headers);
      return;
    }

    if (method === 'POST' && /^\/api\/mobile\/reports\/[^/]+\/pdf$/.test(url.pathname)) {
      send(res, 200, { ok: true, url: '' }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/reports/ocr-intake') {
      try {
        const body = await readBody(req);
        const input = safeText(body.input, 8000);
        send(res, 200, { ok: true, extractedText: input }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not process OCR intake.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/state') {
      const section = safeId(url.searchParams.get('section') || '', 80);
      if (!section) {
        send(res, 400, { error: 'State section is required.' }, headers);
        return;
      }
      const { profile } = await resolveMobileStateProfile(req, ip);
      send(res, 200, { section, data: profile.sections?.[section] ?? null }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/state') {
      try {
        const body = await readBody(req);
        const section = safeId(body.section, 80);
        if (!section) {
          send(res, 400, { error: 'State section is required.' }, headers);
          return;
        }
        const { profile } = await resolveMobileStateProfile(req, ip);
        profile.sections = profile.sections && typeof profile.sections === 'object' ? profile.sections : {};
        profile.sections[section] = body.data ?? null;
        profile.updatedAt = new Date().toISOString();
        await saveMobileStateStore();
        send(res, 200, { ok: true }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not save mobile state.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/push/status') {
      const { profile } = await resolveMobilePushProfile(req, ip);
      const tokens = Array.isArray(profile.tokens) ? profile.tokens : [];
      send(
        res,
        200,
        {
          registered: tokens.length > 0,
          count: tokens.length,
          updatedAt: profile.updatedAt || null,
        },
        headers,
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/push/register') {
      try {
        const body = await readBody(req);
        const token = safeText(body.token, 512);
        const platform = safeText(body.platform, 32) || 'unknown';
        const deviceName = safeText(body.deviceName, 120) || '';
        if (!token) {
          send(res, 400, { error: 'Push token is required.' }, headers);
          return;
        }
        const { profile } = await resolveMobilePushProfile(req, ip);
        const next = [
          { token, platform, deviceName, updatedAt: new Date().toISOString() },
          ...(Array.isArray(profile.tokens) ? profile.tokens : []),
        ]
          .filter((item, index, arr) => arr.findIndex((candidate) => candidate.token === item.token) === index)
          .slice(0, 10);
        profile.tokens = next;
        profile.updatedAt = new Date().toISOString();
        await saveMobilePushStore();
        send(res, 200, { ok: true, registered: true, count: next.length }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not register push token.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/push/test') {
      const { profile } = await resolveMobilePushProfile(req, ip);
      const count = Array.isArray(profile.tokens) ? profile.tokens.length : 0;
      send(
        res,
        200,
        {
          ok: true,
          queued: count > 0,
          message: count > 0 ? `Test notification queued for ${count} registered device(s).` : 'No registered device tokens yet.',
        },
        headers,
      );
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/billing/status') {
      send(
        res,
        200,
        {
          enabled: BILLING_ENABLED && Boolean(STRIPE_SECRET_KEY),
          monthlyPrice: '$12.99',
          yearlyPrice: '$89',
          trial: '7-day free trial',
          provider: BILLING_ENABLED ? 'stripe' : 'disabled',
        },
        headers,
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/labs/extract-image') {
      if (!rateLimit(`labs-scan:${ip}`, 20, 60_000)) {
        send(res, 429, { error: 'Too many image scan attempts. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        const dataUrl = safeText(body.dataUrl, 5_000_000);
        const mimeType = safeText(body.mimeType, 120) || 'image/png';
        const result = await extractLabTextFromImage({ dataUrl, mimeType });
        send(res, 200, { text: result.text, message: result.message, provider: GEMINI_API_KEY ? 'gemini' : 'fallback' }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not scan image.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/voice/config') {
      send(res, 200, getPublicVoiceConfig(), headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/voice/voices') {
      try {
        const voices = await listElevenLabsVoices();
        send(res, 200, { voices, configured: voices.length > 0 }, headers);
      } catch (error) {
        send(res, 500, { error: error instanceof Error ? error.message : 'Could not list voices.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/voice/respond') {
      if (!rateLimit(`voice-respond:${ip}`, 30, 60_000)) {
        send(res, 429, { error: 'Too many voice requests. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        const result = await handleVoiceConversation(body);
        send(res, 200, result, headers);
      } catch (error) {
        send(res, 500, { error: error instanceof Error ? error.message : 'Voice conversation failed.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/auth/config') {
      send(res, 200, {
        googleEnabled: GOOGLE_CLIENT_IDS.size > 0,
        googleUnverifiedAllowed: AUTH_ALLOW_UNVERIFIED_GOOGLE,
        superAdminBootstrapConfigured: SUPER_ADMIN_BOOTSTRAP_PASSWORD_CONFIGURED,
        emailEnabled: true,
      }, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/auth/session') {
      const current = await getSessionUser(req, users);
      if (!current) {
        send(res, 200, { session: null }, headers);
        return;
      }
      send(res, 200, { session: buildSessionPayload(current.user) }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/signup') {
      if (!rateLimit(`signup:${ip}`, 10, 60_000)) {
        send(res, 429, { error: 'Too many signup attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const password = String(body.password || '');
        const name = typeof body.name === 'string' && body.name.trim() ? safeText(body.name, 120) : normalizeName(email);

        if (!email || !email.includes('@')) {
          send(res, 400, { error: 'Provide a valid email.' }, headers);
          return;
        }
        if (password.length < 8) {
          send(res, 400, { error: 'Password must contain at least 8 characters.' }, headers);
          return;
        }

        const exists = users.some((item) => item.email === email);
        if (exists) {
          send(res, 409, { error: 'Account already exists. Please sign in.' }, headers);
          return;
        }

        const user = {
          id: randomBytes(12).toString('hex'),
          email,
          name,
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
          roleOverride: null,
          lastProvider: 'password',
          avatarUrl: undefined,
        };
        users = [user, ...users];
        await saveUsers();

        const token = createSession(user);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user) }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to sign up.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/signin') {
      if (!rateLimit(`signin:${ip}`, 20, 60_000)) {
        send(res, 429, { error: 'Too many login attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const password = String(body.password || '');

        if (SUPER_ADMIN_EMAILS.has(email) && SUPER_ADMIN_BOOTSTRAP_PASSWORD && password === SUPER_ADMIN_BOOTSTRAP_PASSWORD) {
          let superAdmin = users.find((item) => item.email === email);
          if (!superAdmin) {
            superAdmin = {
              id: randomBytes(12).toString('hex'),
              email,
              name: 'Luna29 Super Admin',
              passwordHash: hashPassword(SUPER_ADMIN_BOOTSTRAP_PASSWORD),
              createdAt: new Date().toISOString(),
              roleOverride: 'super_admin',
              lastProvider: 'password',
              avatarUrl: undefined,
            };
            users = [superAdmin, ...users];
          } else {
            superAdmin.passwordHash = hashPassword(SUPER_ADMIN_BOOTSTRAP_PASSWORD);
            superAdmin.roleOverride = 'super_admin';
            superAdmin.lastProvider = 'password';
          }
          await saveUsers();
          const token = createSession(superAdmin);
          await saveSessions();
          send(res, 200, { session: buildSessionPayload(superAdmin) }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
          return;
        }

        const user = users.find((item) => item.email === email);
        if (user && SUPER_ADMIN_EMAILS.has(email) && !user.passwordHash) {
          if (password.length < 8) {
            send(res, 400, { error: 'Super admin recovery password must contain at least 8 characters.' }, headers);
            return;
          }
          user.passwordHash = hashPassword(password);
          user.roleOverride = 'super_admin';
          user.lastProvider = 'password';
          await saveUsers();
          const token = createSession(user);
          await saveSessions();
          send(res, 200, { session: buildSessionPayload(user), recovered: true }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
          return;
        }
        if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
          send(res, 401, { error: 'Incorrect email or password.' }, headers);
          return;
        }

        user.lastProvider = 'password';
        const token = createSession(user);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user) }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to sign in.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/emergency-admin-reset') {
      if (!rateLimit(`emergency-reset:${ip}`, 5, 60_000)) {
        send(res, 429, { error: 'Too many reset attempts. Try again in a minute.' }, headers);
        return;
      }
      try {
        if (!ADMIN_EMERGENCY_RESET_KEY) {
          send(res, 503, { error: 'Emergency reset is not configured.' }, headers);
          return;
        }
        const body = await readBody(req);
        const key = String(req.headers['x-admin-reset-key'] || body.resetKey || '').trim();
        if (!key || key !== ADMIN_EMERGENCY_RESET_KEY) {
          send(res, 403, { error: 'Invalid emergency reset key.' }, headers);
          return;
        }
        const email = normalizeEmail(body.email);
        const newPassword = String(body.newPassword || '');
        if (email !== PRIMARY_SUPER_ADMIN_EMAIL) {
          send(res, 403, { error: 'Emergency reset allowed only for primary super admin.' }, headers);
          return;
        }
        if (newPassword.length < 8) {
          send(res, 400, { error: 'Password must contain at least 8 characters.' }, headers);
          return;
        }
        let user = users.find((item) => item.email === email);
        if (!user) {
          user = {
            id: randomBytes(12).toString('hex'),
            email,
            name: 'Luna29 Super Admin',
            passwordHash: hashPassword(newPassword),
            createdAt: new Date().toISOString(),
            roleOverride: 'super_admin',
            lastProvider: 'password',
            avatarUrl: undefined,
          };
          users = [user, ...users];
        } else {
          user.passwordHash = hashPassword(newPassword);
          user.roleOverride = 'super_admin';
          user.lastProvider = 'password';
        }
        await saveUsers();
        const token = createSession(user);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user), ok: true }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Emergency reset failed.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/google') {
      if (!rateLimit(`google:${ip}`, 20, 60_000)) {
        send(res, 429, { error: 'Too many authorization attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const credential = safeText(body.credential, 8192);
        if (!credential) {
          send(res, 400, { error: 'Google credential payload is invalid.' }, headers);
          return;
        }

        let claims;
        try {
          claims = await verifyGoogleCredential(credential);
        } catch (error) {
          if (!AUTH_ALLOW_UNVERIFIED_GOOGLE) {
            throw error;
          }
          claims = decodeGoogleJwt(credential);
        }

        const email = normalizeEmail(claims.email);
        if (!email) {
          send(res, 400, { error: 'Google credential payload is invalid.' }, headers);
          return;
        }

        let user = users.find((item) => item.email === email);
        if (!user) {
          user = {
            id: randomBytes(12).toString('hex'),
            email,
            name: claims.name ? safeText(claims.name, 120) : normalizeName(email),
            passwordHash: null,
            createdAt: new Date().toISOString(),
            roleOverride: null,
            lastProvider: 'google',
            avatarUrl: claims.picture,
          };
          users = [user, ...users];
        } else {
          user.lastProvider = 'google';
          user.name = claims.name ? safeText(claims.name, 120) : user.name;
          user.avatarUrl = claims.picture || user.avatarUrl;
        }

        await saveUsers();

        const token = createSession(user);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user) }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Google authorization failed.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/logout') {
      const cookies = parseCookies(req.headers.cookie || '');
      const token = cookies[SESSION_COOKIE];
      if (token) sessions.delete(token);
      await saveSessions();
      send(res, 200, { ok: true }, { ...headers, 'Set-Cookie': clearSessionCookie() });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/privacy/export') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      const subjectEmail = auth.sessionPayload.email;
      const userRow = users.find((item) => item.email === subjectEmail);
      const exportRows = {
        generatedAt: new Date().toISOString(),
        account: userRow
          ? {
              id: userRow.id,
              email: userRow.email,
              name: userRow.name,
              role: resolveRole(userRow.email, userRow.roleOverride || null),
              createdAt: userRow.createdAt,
              lastProvider: userRow.lastProvider || 'password',
            }
          : null,
        contactSubmissions: contactSubmissions
          .filter((item) => normalizeEmail(item.email) === subjectEmail)
          .map((item) => ({
            id: item.id,
            at: item.at,
            subject: item.subject,
            message: item.message,
          })),
        sessions: serializeSessions()
          .filter((item) => item.userId === auth.current.user.id)
          .map((item) => ({ tokenTail: item.token.slice(-8), expiresAt: item.expiresAt })),
        notes: [
          'Luna29 uses local-first architecture for core health data.',
          'This server export includes account-level and support records only.',
        ],
      };

      const requestId = `dsar-exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      privacyRequests = [
        {
          id: requestId,
          type: 'export',
          status: 'completed',
          requestedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          email: subjectEmail,
          actor: auth.sessionPayload.email,
        },
        ...privacyRequests,
      ].slice(0, 2000);
      await savePrivacyRequests();

      send(res, 200, {
        requestId,
        exportVersion: 2,
        exportedAt: exportRows.generatedAt,
        export: exportRows,
        audit: {
          requestId,
          type: 'export',
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/privacy/correct') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      try {
        const body = await readBody(req);
        const patch = sanitizeCorrectionPayload(body);
        if (!patch.name) {
          send(res, 400, { error: 'No supported correction fields provided.' }, headers);
          return;
        }

        const user = users.find((item) => item.id === auth.current.user.id);
        if (!user) {
          send(res, 404, { error: 'User not found.' }, headers);
          return;
        }

        user.name = patch.name;
        await saveUsers();

        const requestId = `dsar-cor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        privacyRequests = [
          {
            id: requestId,
            type: 'correct',
            status: 'completed',
            requestedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            email: auth.sessionPayload.email,
            actor: auth.sessionPayload.email,
            fields: Object.keys(patch),
          },
          ...privacyRequests,
        ].slice(0, 2000);
        await savePrivacyRequests();

        send(res, 200, { requestId, session: buildSessionPayload(user) }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to process correction request.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/privacy/delete') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      try {
        const body = await readBody(req);
        const scope = safeText(body.scope || 'account', 32);
        const user = users.find((item) => item.id === auth.current.user.id);
        if (!user) {
          send(res, 404, { error: 'User not found.' }, headers);
          return;
        }
        const role = resolveRole(user.email, user.roleOverride || null);
        if (role === 'super_admin') {
          send(res, 403, { error: 'Super admin account cannot be deleted from self-service endpoint.' }, headers);
          return;
        }

        if (scope === 'support_only') {
          contactSubmissions = contactSubmissions.filter((item) => normalizeEmail(item.email) !== user.email);
          await saveContacts();
        } else {
          users = users.filter((item) => item.id !== user.id);
          for (const [token, session] of sessions.entries()) {
            if (session.userId === user.id) sessions.delete(token);
          }
          contactSubmissions = contactSubmissions.filter((item) => normalizeEmail(item.email) !== user.email);
          delete billingState[user.id];
          delete billingState[user.email];
          await Promise.all([saveUsers(), saveSessions(), saveContacts(), saveBillingState()]);
        }

        const requestId = `dsar-del-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        privacyRequests = [
          {
            id: requestId,
            type: 'delete',
            status: 'completed',
            requestedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            email: auth.sessionPayload.email,
            actor: auth.sessionPayload.email,
            scope,
          },
          ...privacyRequests,
        ].slice(0, 2000);
        await savePrivacyRequests();

        send(
          res,
          200,
          { requestId, deleted: true, scope },
          { ...headers, 'Set-Cookie': clearSessionCookie() }
        );
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to process deletion request.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/privacy/requests') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      const canManage = hasAnyPermission(auth.sessionPayload, ['manage_admin_roles', 'manage_services']);
      const rows = canManage
        ? privacyRequests
        : privacyRequests.filter((item) => normalizeEmail(item.email) === normalizeEmail(auth.sessionPayload.email));
      send(res, 200, { requests: rows.slice(0, 200) }, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/billing/status') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      const byId = billingState[auth.current.user.id];
      const byEmail = billingState[auth.current.user.email];
      const currentStatus = byId || byEmail || { status: 'inactive', plan: 'none' };
      send(res, 200, { billing: currentStatus, enabled: BILLING_ENABLED }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/checkout-session') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      const configError = stripeConfigError();
      if (configError) {
        send(res, 503, { error: configError }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const period = safeText(body.period || 'month', 12) === 'year' ? 'year' : 'month';
        const price = period === 'year' ? STRIPE_PRICE_YEARLY_ID : STRIPE_PRICE_MONTHLY_ID;
        const form = stripeFormBody(buildStripeCheckoutFields([
          ['mode', 'subscription'],
          ['success_url', STRIPE_SUCCESS_URL],
          ['cancel_url', STRIPE_CANCEL_URL],
          ['client_reference_id', auth.current.user.id],
          ['customer_email', auth.current.user.email],
          ['line_items[0][price]', price],
          ['line_items[0][quantity]', '1'],
          ['metadata[luna_user_id]', auth.current.user.id],
          ['metadata[luna_email]', auth.current.user.email],
          ['metadata[luna_period]', period],
        ]));

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form,
        });

        const raw = await response.text();
        let parsed = {};
        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch {
          parsed = { raw };
        }

        if (!response.ok) {
          send(res, 502, { error: 'Stripe checkout session creation failed.', detail: parsed }, headers);
          return;
        }

        const sessionId = safeText(parsed.id, 200);
        const checkoutUrl = safeText(parsed.url, 1000);
        send(res, 200, { id: sessionId, url: checkoutUrl }, headers);
      } catch (error) {
        send(res, 500, { error: error instanceof Error ? error.message : 'Unable to create checkout session.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/portal-session') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      const configError = stripeConfigError();
      if (configError) {
        send(res, 503, { error: configError }, headers);
        return;
      }

      try {
        const lookup = await stripeRequest(
          'GET',
          `https://api.stripe.com/v1/customers?email=${encodeURIComponent(auth.current.user.email)}&limit=1`
        );
        if (!lookup.ok) {
          send(res, 502, { error: 'Could not query Stripe customer.', detail: lookup.data }, headers);
          return;
        }

        const customerId = safeText(lookup.data?.data?.[0]?.id, 120);
        if (!customerId) {
          send(res, 404, { error: 'No Stripe customer found for this account yet.' }, headers);
          return;
        }

        const returnUrl =
          STRIPE_PORTAL_RETURN_URL ||
          STRIPE_SUCCESS_URL ||
          `${req.headers.origin || 'http://localhost:3000'}/profile`;
        const form = stripeFormBody([
          ['customer', customerId],
          ['return_url', returnUrl],
        ]);
        const portal = await stripeRequest('POST', 'https://api.stripe.com/v1/billing_portal/sessions', form);
        if (!portal.ok) {
          send(res, 502, { error: 'Stripe portal session creation failed.', detail: portal.data }, headers);
          return;
        }

        send(res, 200, { id: safeText(portal.data?.id, 200), url: safeText(portal.data?.url, 1200) }, headers);
      } catch (error) {
        send(res, 500, { error: error instanceof Error ? error.message : 'Unable to create billing portal session.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/webhook') {
      const rawBody = await readRawBody(req);
      const sig = req.headers['stripe-signature'];

      if (!verifyStripeSignature(rawBody, sig, STRIPE_WEBHOOK_SECRET)) {
        send(res, 401, { error: 'Invalid Stripe signature.' }, headers);
        return;
      }

      let event;
      try {
        event = JSON.parse(rawBody.toString('utf8'));
      } catch {
        send(res, 400, { error: 'Invalid Stripe payload.' }, headers);
        return;
      }

      const eventType = safeText(event?.type, 80);
      const data = event?.data?.object || {};
      const customerEmail = normalizeEmail(data.customer_email || data.metadata?.luna_email || '');
      const userId = safeText(data.client_reference_id || data.metadata?.luna_user_id || '', 120);
      const period = safeText(data.metadata?.luna_period || '', 12) || 'month';
      const nowIso = new Date().toISOString();

      const setBilling = (status, extra = {}) => {
        const payload = { status, period, updatedAt: nowIso, ...extra };
        if (userId) billingState[userId] = payload;
        if (customerEmail) billingState[customerEmail] = payload;
      };

      if (eventType === 'checkout.session.completed' || eventType === 'invoice.paid') {
        setBilling('active', { source: eventType });
      } else if (eventType === 'invoice.payment_failed') {
        setBilling('past_due', { source: eventType });
      } else if (eventType === 'customer.subscription.deleted') {
        setBilling('canceled', { source: eventType });
      }

      await saveBillingState();
      send(res, 200, { received: true }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/role') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!auth.sessionPayload.permissions.includes('manage_admin_roles')) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const role = String(body.role || '');
        if (!email || !ROLE_PERMISSIONS[role]) {
          send(res, 400, { error: 'Invalid role update request.' }, headers);
          return;
        }
        if (SUPER_ADMIN_EMAILS.has(email) && role !== 'super_admin') {
          send(res, 403, { error: 'Primary super admin role is protected and cannot be downgraded.' }, headers);
          return;
        }

        const targetUser = users.find((item) => item.email === email);
        if (!targetUser) {
          send(res, 404, { error: 'Target account not found.' }, headers);
          return;
        }

        targetUser.roleOverride = role;
        await saveUsers();

        pushAudit(adminState, {
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.role.update',
          details: `Assigned ${role} to ${email}`,
        });
        await saveAdminState();

        send(res, 200, { session: buildSessionPayload(targetUser) }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to update role.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/state') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_marketing', 'manage_email_templates', 'manage_admin_roles', 'view_financials', 'view_technical_metrics'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      send(res, 200, {
        services: adminState.services,
        content: adminState.content,
        templates: adminState.templates,
        templateHistory: adminState.templateHistory,
        admins: adminState.admins,
        testHistory: adminState.testHistory,
        financialMetrics: adminState.financialMetrics,
        technicalMetrics: adminState.technicalMetrics,
        metricsHistory: adminState.metricsHistory,
      }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/state') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      try {
        const body = await readBody(req);
        const incoming = sanitizeAdminState(body || {});
        const changed = updateAdminStateByPermissions(adminState, incoming, auth.sessionPayload);

        if (!isNonEmptyArray(changed)) {
          send(res, 403, { error: 'No permitted fields in update payload.' }, headers);
          return;
        }

        pushAudit(adminState, {
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.state.update',
          details: `Updated fields: ${changed.join(', ')}`,
        });
        await saveAdminState();

        send(res, 200, { ok: true, changed }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to update admin state.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/audit') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_admin_roles', 'manage_services'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      send(res, 200, { audit: adminState.audit || [] }, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/metrics') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!hasAnyPermission(auth.sessionPayload, ['view_financials', 'view_technical_metrics', 'manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      send(
        res,
        200,
        {
          financial: adminState.financialMetrics,
          technical: adminState.technicalMetrics,
          history: adminState.metricsHistory || [],
        },
        headers
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/metrics/check') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      const now = new Date();
      const nextApiP95 = Math.max(120, Math.round(adminState.technicalMetrics.apiP95 + (Math.random() * 16 - 8)));
      const nextErrorRate = Math.max(0.1, Number((adminState.technicalMetrics.errorRate + (Math.random() * 0.08 - 0.04)).toFixed(2)));
      const nextQueueLag = Math.max(3, Math.round(adminState.technicalMetrics.queueLag + (Math.random() * 4 - 2)));

      adminState.technicalMetrics = {
        ...adminState.technicalMetrics,
        apiP95: nextApiP95,
        errorRate: nextErrorRate,
        queueLag: nextQueueLag,
      };

      const checkLine = `System probes: PASS (${now.toLocaleString('en-US', { timeZone: 'UTC' })} UTC)`;
      adminState.testHistory = [checkLine, ...(adminState.testHistory || [])].slice(0, 100);
      adminState.metricsHistory = [
        {
          at: now.toISOString(),
          mrr: adminState.financialMetrics.mrr,
          churn: adminState.financialMetrics.churn,
          subscribers: adminState.financialMetrics.activeSubscribers,
          apiP95: adminState.technicalMetrics.apiP95,
          errorRate: adminState.technicalMetrics.errorRate,
        },
        ...(adminState.metricsHistory || []),
      ].slice(0, 365);

      pushAudit(adminState, {
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.metrics.check',
        details: `Updated technical metrics (p95=${nextApiP95}ms, err=${nextErrorRate}%, queue=${nextQueueLag}s)`,
      });
      await saveAdminState();

      send(
        res,
        200,
        {
          ok: true,
          technical: adminState.technicalMetrics,
          testHistory: adminState.testHistory,
          history: adminState.metricsHistory,
        },
        headers
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/social/connect-all') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }
      pushAudit(adminState, {
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.social.connect_all',
        details: 'Connected all social channels via mobile admin.',
      });
      await saveAdminState();
      send(res, 200, { ok: true }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/social/pending-review') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }
      pushAudit(adminState, {
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.social.pending_review',
        details: 'Set social channels to pending review via mobile admin.',
      });
      await saveAdminState();
      send(res, 200, { ok: true }, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/social/analytics') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles', 'view_technical_metrics'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }
      send(res, 200, { reach: 12400, engagement: 4.8, growth: 2.1 }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/templates/preview') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_email_templates', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }
      pushAudit(adminState, {
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.templates.preview',
        details: 'Opened template preview via mobile admin.',
      });
      await saveAdminState();
      send(res, 200, { ok: true }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/invites/admin') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }
      pushAudit(adminState, {
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.invite.send',
        details: 'Sent admin invite via mobile admin.',
      });
      await saveAdminState();
      send(res, 200, { ok: true }, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/export') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      const type = safeText(url.searchParams.get('type') || 'audit', 32);
      const format = safeText(url.searchParams.get('format') || 'json', 16).toLowerCase();

      let rows = [];
      let filename = '';
      let neededPermissions = [];

      if (type === 'audit') {
        neededPermissions = ['manage_admin_roles', 'manage_services'];
        rows = (adminState.audit || []).map((entry) => ({
          at: entry.at,
          actorEmail: entry.actorEmail,
          actorRole: entry.actorRole,
          action: entry.action,
          details: entry.details,
        }));
        filename = 'luna-admin-audit';
      } else if (type === 'metrics') {
        neededPermissions = ['view_financials', 'view_technical_metrics', 'manage_services', 'manage_admin_roles'];
        rows = (adminState.metricsHistory || []).map((entry) => ({
          at: entry.at,
          mrr: entry.mrr,
          churn: entry.churn,
          subscribers: entry.subscribers,
          apiP95: entry.apiP95,
          errorRate: entry.errorRate,
        }));
        filename = 'luna-admin-metrics';
      } else {
        send(res, 400, { error: 'Unsupported export type.' }, headers);
        return;
      }

      if (!hasAnyPermission(auth.sessionPayload, neededPermissions)) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      if (format === 'csv') {
        const csv = toCsv(rows);
        sendText(
          res,
          200,
          csv,
          {
            ...headers,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename=\"${filename}.csv\"`,
          }
        );
        return;
      }

      send(
        res,
        200,
        { type, exportedAt: new Date().toISOString(), rows },
        {
          ...headers,
          'Content-Disposition': `attachment; filename=\"${filename}.json\"`,
        }
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/public/contact') {
      if (!rateLimit(`contact:${ip}`, 8, 60_000)) {
        send(res, 429, { error: 'Too many contact submissions. Please try again later.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const name = safeText(body.name, 120);
        const subject = safeText(body.subject || 'support', 60);
        const message = safeText(body.message, 5000);

        if (!email.includes('@')) {
          send(res, 400, { error: 'Provide a valid email.' }, headers);
          return;
        }
        if (name.length < 2) {
          send(res, 400, { error: 'Provide your name.' }, headers);
          return;
        }
        if (message.length < 10) {
          send(res, 400, { error: 'Message is too short.' }, headers);
          return;
        }

        contactSubmissions = [
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            at: new Date().toISOString(),
            name,
            email,
            subject,
            message,
            ip,
          },
          ...contactSubmissions,
        ].slice(0, 2000);

        await saveContacts();
        send(res, 200, { ok: true }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to submit message.' }, headers);
      }
      return;
    }

    send(res, 404, { error: 'Not found.' }, headers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error.';
      send(res, 500, { error: message, code: 'UNHANDLED_API_ERROR' });
    }
  });

  server.listen(PORT, () => {
    process.stdout.write(`[luna-auth-api] listening on http://localhost:${PORT}\n`);
  });
};

start().catch((error) => {
  process.stderr.write(`[luna-auth-api] failed to start: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
