import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { OAuth2Client } from 'google-auth-library';
import { getPublicVoiceConfig, handleVoiceConversation, listElevenLabsVoices, extractVoiceStructure } from '../voiceConversation.mjs';
import { buildApiSecurityHeaders } from './securityHeaders.mjs';
import { readBodyWithLimit, hasAiProcessingConsent } from './httpUtils.mjs';
import { resolveRole as resolveRoleSafe, ROLE_PERMISSIONS as CORE_ROLE_PERMISSIONS } from './authRoles.mjs';
import { sendCalendarReminderEmail, isCalendarEmailEnabled } from './calendarEmail.mjs';
import { dispatchDueEmailReminders } from './calendarReminders.mjs';
import { createRateLimiter, isUpstashRateLimitEnabled } from './rateLimit.mjs';
import { createAdminRouter, createAdminStateStore } from '../admin/index.mjs';
import {
  createPersonalEventsStore,
  normalizePersonalEventInput,
  syncLocalEventsForUser,
  isPersonalEventsStoreAvailable,
  PERSONAL_EVENT_STORE_UNAVAILABLE,
  MAX_EVENTS_PER_REQUEST,
  DEFAULT_LIST_LIMIT,
  MAX_LIST_LIMIT,
} from './personalEventsStore.mjs';
import {
  createObservationWithExtraction,
  listObservationsForUser,
  listSignalsForUser,
  confirmSignalForUser,
  rejectSignalForUser,
  correctSignalForUser,
  MAX_OBSERVATION_TEXT_CHARS,
} from './observationSignalsService.mjs';
import {
  listTimeline,
  getSignalHistory,
  getRecentChanges,
  getCoOccurrences,
  getObservationContext,
  getTimelineSummaryData,
  TIMELINE_MAX_LIMIT,
} from './timelineQueryService.mjs';
import {
  evaluatePatternCandidates,
  listPatternCandidates,
  getPatternCandidate,
  confirmPatternCandidate,
  rejectPatternCandidate,
  PATTERN_EVAL_DEFAULT_WINDOW_DAYS,
  PATTERN_EVAL_MAX_WINDOW_DAYS,
} from './patternCandidatesService.mjs';
import {
  buildPersonalContextPack,
  PERSONAL_CONTEXT_VERSION,
} from './personalContextPackService.mjs';
import {
  attemptLunaLiveMemoryWrite,
  isLunaLiveMemoryWriteEnabled,
  summarizeMemoryWriteForLogs,
} from './lunaLiveMemoryWriteService.mjs';
import {
  runPatternReevaluationAfterMutation,
  publicReevaluationMeta,
  summarizeReevaluationForLogs,
} from './patternReevaluationService.mjs';
import {
  createMemoryConsentStore,
  getMemoryConsentForWrite,
  toPublicMemoryConsent,
  MEMORY_CONSENT_VERSION,
  MEMORY_CONSENT_STORE_UNAVAILABLE,
  isMemoryConsentStoreAvailable,
} from './memoryConsentStore.mjs';
import {
  resolveDurableJsonStorageDecision,
  durableStorageUnavailablePayload,
  hasDatabaseUrl,
} from './durableStorageGuard.mjs';
import { resolveAuthIdentityStorageMode } from './authIdentityStorage.mjs';
import {
  initAuthUsersRepository,
  loadUsersFromPostgres,
  saveUsersToPostgres,
  countAuthUsers,
  getUserByIdFromPostgres,
  deleteUserFromPostgres,
} from './authUsersStore.mjs';
import {
  initAuthSessionsRepository,
  loadSessionsFromPostgres,
  saveSessionsToPostgres,
  countAuthSessions,
  getSessionRowFromPostgres,
  deleteSessionFromPostgres,
  deleteSessionsForUserFromPostgres,
} from './authSessionsStore.mjs';
import { ACCOUNT_DELETION_FAILED } from './accountDeletionService.mjs';
import {
  initAccountDeletionOpsRepository,
  createMemoryDeletionOpsLedger,
  DELETION_OP_STATUS,
} from './accountDeletionOpsStore.mjs';
import { createAccountDeletionOrchestrator } from './accountDeletionOrchestrator.mjs';
import {
  resolveBillingStorageMode,
  billingStorageHealthLabel,
  billingStorageUnavailablePayload,
  BILLING_STORAGE_UNAVAILABLE,
} from './billingStorage.mjs';
import { initBillingAccountsRepository } from './billingAccountsStore.mjs';
import {
  initBillingSubscriptionsRepository,
  getSubscriptionByUserId,
} from './billingSubscriptionsStore.mjs';
import { initBillingTrialsRepository } from './billingTrialsStore.mjs';
import { maybeImportLegacyBillingOnBoot } from './billingLegacyImport.mjs';
import { createBillingService } from './billingServiceCore.mjs';
import {
  initStripeWebhookEventsRepository,
  createMemoryStripeWebhookLedger,
} from './stripeWebhookEventsStore.mjs';
import { processStripeWebhookEvent } from './stripeWebhookProcessor.mjs';
import {
  resolveOperationalRecordsStorageMode,
  operationalRecordsHealthLabel,
  operationalRecordsStorageModeLabel,
  operationalRecordsUnavailablePayload,
  OPERATIONAL_RECORDS_UNAVAILABLE,
} from './operationalRecordsStorage.mjs';
import { initAdminInvitesRepository } from './adminInvitesStore.mjs';
import { initAdminAuditRepository } from './adminAuditStore.mjs';
import { initAdminWorkspaceRepository } from './adminWorkspaceStore.mjs';
import {
  initPrivacyRequestsRepository,
  insertPrivacyRequest,
  listPrivacyRequests,
} from './privacyRequestsStore.mjs';
import {
  initContactSubmissionsRepository,
  insertContactSubmission,
  listContactSubmissions,
  deleteContactSubmissionsByEmail,
  markContactSubmissionReplied,
} from './contactSubmissionsStore.mjs';
import { maybeImportOperationalRecordsOnBoot } from './operationalRecordsLegacyImport.mjs';
import {
  resolveUserDataStorageMode,
  userDataHealthLabel,
  userDataStorageModeLabel,
  userDataUnavailablePayload,
  USER_DATA_STORAGE_UNAVAILABLE,
} from './userDataStorage.mjs';
import {
  initCalendarUserDataRepository,
  getCalendarBundleForUser,
  upsertCalendarBundleForUser,
} from './calendarUserDataStore.mjs';
import {
  initMobileReflectionsRepository,
  ensureMobileReflectionMeta,
  getMobileReflectionProfile,
  insertMobileReflection,
} from './mobileReflectionsStore.mjs';
import {
  initMobileReportsRepository,
  listMobileReportsForUser,
  upsertMobileReportForUser,
} from './mobileReportsStore.mjs';
import {
  initMobileUserStateRepository,
  upsertMobileStateSection,
  listMobileStateSections,
} from './mobileUserStateStore.mjs';
import {
  initMobilePushRepository,
  listMobilePushTokensForUser,
  upsertMobilePushToken,
} from './mobilePushStore.mjs';
import { maybeImportUserDataOnBoot } from './userDataLegacyImport.mjs';
import { getPgPoolStatus } from './database.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let runtimeEnvironment = 'node';
let DATA_DIR = path.join(__dirname, '..', 'data');
let DATA_FILE = path.join(DATA_DIR, 'users.json');
let ADMIN_DATA_FILE = path.join(DATA_DIR, 'admin-state.json');
let CONTACTS_FILE = path.join(DATA_DIR, 'contact-submissions.json');
let SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
let PRIVACY_REQUESTS_FILE = path.join(DATA_DIR, 'privacy-requests.json');
let BILLING_STATE_FILE = path.join(DATA_DIR, 'billing-state.json');
let MOBILE_REFLECTIONS_FILE = path.join(DATA_DIR, 'mobile-reflections.json');
let MOBILE_REPORTS_FILE = path.join(DATA_DIR, 'mobile-reports.json');
let MOBILE_STATE_FILE = path.join(DATA_DIR, 'mobile-state.json');
let MOBILE_PUSH_FILE = path.join(DATA_DIR, 'mobile-push.json');
let CALENDAR_DATA_FILE = path.join(DATA_DIR, 'calendar-data.json');
let PERSONAL_EVENTS_FILE = path.join(DATA_DIR, 'personal-events.json');
let MEMORY_CONSENT_FILE = path.join(DATA_DIR, 'memory-consent.json');

const configureStoragePaths = (dataDir, environment) => {
  DATA_DIR = dataDir;
  runtimeEnvironment = environment;
  DATA_FILE = path.join(DATA_DIR, 'users.json');
  ADMIN_DATA_FILE = path.join(DATA_DIR, 'admin-state.json');
  CONTACTS_FILE = path.join(DATA_DIR, 'contact-submissions.json');
  SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
  PRIVACY_REQUESTS_FILE = path.join(DATA_DIR, 'privacy-requests.json');
  BILLING_STATE_FILE = path.join(DATA_DIR, 'billing-state.json');
  MOBILE_REFLECTIONS_FILE = path.join(DATA_DIR, 'mobile-reflections.json');
  MOBILE_REPORTS_FILE = path.join(DATA_DIR, 'mobile-reports.json');
  MOBILE_STATE_FILE = path.join(DATA_DIR, 'mobile-state.json');
  MOBILE_PUSH_FILE = path.join(DATA_DIR, 'mobile-push.json');
  CALENDAR_DATA_FILE = path.join(DATA_DIR, 'calendar-data.json');
  PERSONAL_EVENTS_FILE = path.join(DATA_DIR, 'personal-events.json');
  MEMORY_CONSENT_FILE = path.join(DATA_DIR, 'memory-consent.json');
};

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

const ROLE_PERMISSIONS = CORE_ROLE_PERMISSIONS;

const ADMIN_EMAIL_RULES = [];

const ALLOWED_ORIGINS = new Set(
  (process.env.AUTH_ALLOWED_ORIGINS
    || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173,https://luna29.vercel.app,https://luna29.com,https://www.luna29.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const rateLimit = createRateLimiter();
const sessions = new Map();
let lastSessionPurgeAt = 0;

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

const buildSecurityHeaders = () => buildApiSecurityHeaders();

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

const buildHealthPayload = async ({ verbose = false, durableDecision = null } = {}) => {
  const now = new Date().toISOString();
  const decision =
    durableDecision ||
    resolveDurableJsonStorageDecision({
      env: process.env,
      runtimeEnvironment,
    });
  const durableJsonAllowed = decision.allowed;
  const databaseConfigured = hasDatabaseUrl(process.env);
  const prodLikeMissingDb = !durableJsonAllowed;
  // Avoid writing health probes to /tmp when durable JSON is forbidden.
  const storageWritable = durableJsonAllowed ? await checkStorageWritable() : false;
  const stripeConfigReady = isStripeConfigReady();
  const billingStatus = !BILLING_ENABLED ? 'disabled' : stripeConfigReady ? 'ready' : 'misconfigured';
  let billingStorageMode = resolveBillingStorageMode({
    env: process.env,
    runtimeEnvironment,
  });
  // If mode says postgres, confirm shared pool is usable (reuse getPgPoolStatus; no Stripe calls).
  if (billingStorageMode === 'postgres') {
    try {
      const poolStatus = await getPgPoolStatus();
      if (!poolStatus.pool || poolStatus.category !== 'ok') {
        billingStorageMode = 'unavailable';
      }
    } catch {
      billingStorageMode = 'unavailable';
    }
  }
  const billingStorageLabel = billingStorageHealthLabel(billingStorageMode);
  const trialStorageLabel = billingStorageLabel;
  const stripeWebhookLedgerLabel =
    billingStorageMode === 'postgres'
      ? 'postgres'
      : billingStorageMode === 'json'
        ? 'json_dev'
        : 'unavailable';
  let operationalRecordsMode = resolveOperationalRecordsStorageMode({
    env: process.env,
    runtimeEnvironment,
  });
  if (operationalRecordsMode === 'postgres') {
    try {
      const poolStatus = await getPgPoolStatus();
      if (!poolStatus.pool || poolStatus.category !== 'ok') {
        operationalRecordsMode = 'unavailable';
      }
    } catch {
      operationalRecordsMode = 'unavailable';
    }
  }
  const operationalRecordsLabel = operationalRecordsHealthLabel(operationalRecordsMode);
  const operationalRecordsModeLabel = operationalRecordsStorageModeLabel(operationalRecordsMode);
  let userDataMode = resolveUserDataStorageMode({
    env: process.env,
    runtimeEnvironment,
  });
  if (userDataMode === 'postgres') {
    try {
      const poolStatus = await getPgPoolStatus();
      if (!poolStatus.pool || poolStatus.category !== 'ok') {
        userDataMode = 'unavailable';
      }
    } catch {
      userDataMode = 'unavailable';
    }
  }
  const userDataLabel = userDataHealthLabel(userDataMode);
  const userDataModeLabel = userDataStorageModeLabel(userDataMode);
  const googleAuthConfigured = GOOGLE_CLIENT_IDS.size > 0;
  const aiScanEnabled = Boolean(GEMINI_API_KEY);
  const rateLimitBackend = isUpstashRateLimitEnabled() ? 'upstash' : 'memory';
  const billingStorageOk = billingStorageMode !== 'unavailable';
  const operationalRecordsOk = operationalRecordsMode !== 'unavailable';
  const userDataOk = userDataMode !== 'unavailable';
  const ok =
    durableJsonAllowed &&
    storageWritable &&
    billingStorageOk &&
    operationalRecordsOk &&
    userDataOk &&
    (!BILLING_ENABLED || stripeConfigReady);
  const warnings = [];

  if (!durableJsonAllowed) {
    warnings.push(
      'DATABASE_URL is required in production/preview — critical durable stores cannot use JSON or /tmp.',
    );
  }
  if (!billingStorageOk) {
    warnings.push('Billing/trial storage unavailable — production requires Postgres (no JSON/tmp billing).');
  }
  if (!operationalRecordsOk) {
    warnings.push(
      'Operational records storage unavailable — admin/privacy/contacts require Postgres in production.',
    );
  }
  if (!userDataOk) {
    warnings.push(
      'User data storage unavailable — calendar/mobile require Postgres in production.',
    );
  }
  if (!storageWritable && durableJsonAllowed) warnings.push('Storage is not writable.');
  if (!databaseConfigured && durableJsonAllowed) {
    warnings.push('DATABASE_URL is not set — server state uses local JSON (dev/test only).');
  }
  if (rateLimitBackend === 'memory') warnings.push('Upstash Redis is not configured — rate limits are in-memory per instance.');
  if (BILLING_ENABLED && !stripeConfigReady) warnings.push('Stripe billing is enabled but required env vars are missing.');
  if (!googleAuthConfigured) warnings.push('Google OAuth client IDs are not configured.');
  if (!aiScanEnabled) warnings.push('AI scan-to-text is disabled (set GEMINI_API_KEY to enable).');

  const databaseCheck = databaseConfigured
    ? 'postgres'
    : prodLikeMissingDb
      ? 'unavailable'
      : 'json-fallback';

  const payload = {
    ok,
    service: 'luna-auth-api',
    timestamp: now,
    uptimeSec: Math.floor(process.uptime()),
    environment: runtimeEnvironment,
    checks: {
      storage: durableJsonAllowed ? (storageWritable ? 'ok' : 'error') : 'unavailable',
      durableStorage: durableJsonAllowed ? 'ok' : 'unavailable',
      database: databaseCheck,
      billingStorage: billingStorageLabel,
      trialStorage: trialStorageLabel,
      stripeWebhookLedger: stripeWebhookLedgerLabel,
      operationalRecordsStorage: operationalRecordsLabel,
      userDataStorage: userDataLabel,
      rateLimit: rateLimitBackend,
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
      databaseConfigured,
      durableJsonAllowed,
      durableStorageReason: decision.reason,
      billingStorageMode: billingStorageLabel,
      trialStorageMode: trialStorageLabel,
      stripeWebhookLedger: stripeWebhookLedgerLabel,
      operationalRecordsStorage: operationalRecordsModeLabel,
      userDataStorage: userDataModeLabel,
      rateLimitBackend,
      googleClientIds: GOOGLE_CLIENT_IDS.size,
      aiScanEnabled,
    };
  }

  return payload;
};

const readBody = async (req) => readBodyWithLimit(req);

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
  const audiences = GOOGLE_CLIENT_IDS.size > 0 ? [...GOOGLE_CLIENT_IDS] : [];
  if (audiences.length === 0) {
    throw new Error('Google OAuth is not configured on the server.');
  }

  const client = new OAuth2Client(audiences[0]);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: audiences,
  });
  const claims = ticket.getPayload();
  if (!claims) {
    throw new Error('Google token verification failed.');
  }

  const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : '';
  const emailVerified = claims.email_verified === true;
  const audience = typeof claims.aud === 'string' ? claims.aud.trim() : '';
  const issuer = typeof claims.iss === 'string' ? claims.iss : '';
  const issuedByGoogle = issuer === 'accounts.google.com' || issuer === 'https://accounts.google.com';

  if (!email || !emailVerified || !issuedByGoogle) {
    throw new Error('Google token is invalid or email is not verified.');
  }
  if (GOOGLE_CLIENT_IDS.size > 0 && audience && !GOOGLE_CLIENT_IDS.has(audience)) {
    throw new Error('Google token audience mismatch.');
  }

  return {
    email,
    name: typeof claims.name === 'string' ? claims.name : undefined,
    picture: typeof claims.picture === 'string' ? claims.picture : undefined,
  };
};

const resolveRole = (email, roleOverride = null) =>
  resolveRoleSafe(email, roleOverride, SUPER_ADMIN_EMAILS);

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
  const expiredTokens = [];
  for (const [token, value] of sessions.entries()) {
    if (value.expiresAt < now) {
      sessions.delete(token);
      expiredTokens.push(token);
    }
  }
  return expiredTokens;
};

const createSession = (user) => {
  const maxAgeSec = SUPER_ADMIN_EMAILS.has(normalizeEmail(user.email)) ? SUPER_ADMIN_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS;
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + maxAgeSec * 1000;
  sessions.set(token, { userId: user.id, expiresAt, maxAgeSec });
  return token;
};

/**
 * Resolve session. In Postgres mode, Postgres is authoritative even on Map hit
 * so a warm instance cannot authenticate after another instance deleted the row.
 */
const resolveSessionRecord = async (token, authPgPool) => {
  if (!token) return null;

  if (authPgPool) {
    const row = await getSessionRowFromPostgres(authPgPool, token);
    if (!row) {
      sessions.delete(token);
      return null;
    }
    const session = { userId: row.userId, expiresAt: row.expiresAt, maxAgeSec: row.maxAgeSec };
    sessions.set(token, session);
    if (session.expiresAt < Date.now()) {
      sessions.delete(token);
      await deleteSessionFromPostgres(authPgPool, token);
      return null;
    }
    return session;
  }

  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
};

/**
 * Resolve user. In Postgres mode, Postgres is authoritative so a warm instance
 * cannot keep serving a deleted auth_users row from the local users array.
 */
const resolveUserRecord = async (userId, users, authPgPool = null) => {
  if (!userId) return null;
  if (authPgPool) {
    const user = await getUserByIdFromPostgres(authPgPool, userId);
    if (!user) {
      const idx = users.findIndex((item) => item.id === userId);
      if (idx >= 0) users.splice(idx, 1);
      return null;
    }
    const idx = users.findIndex((item) => item.id === userId);
    if (idx >= 0) users[idx] = user;
    else users.unshift(user);
    return user;
  }
  return users.find((item) => item.id === userId) || null;
};

const getSessionUser = async (req, users, authPgPool = null) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const session = await resolveSessionRecord(token, authPgPool);
  if (!session) return null;

  const user = await resolveUserRecord(session.userId, users, authPgPool);
  if (!user) {
    // User truly missing — drop orphan session. Do not drop when only local Map is stale.
    sessions.delete(token);
    if (authPgPool) await deleteSessionFromPostgres(authPgPool, token);
    return null;
  }

  return { token, user };
};

const getSessionByToken = async (token, users, authPgPool = null) => {
  if (!token) return null;
  const session = await resolveSessionRecord(token, authPgPool);
  if (!session) return null;

  const user = await resolveUserRecord(session.userId, users, authPgPool);
  if (!user) {
    sessions.delete(token);
    if (authPgPool) await deleteSessionFromPostgres(authPgPool, token);
    return null;
  }

  return { token, user };
};

const getMobileAuthUser = async (req, users, authPgPool = null) => {
  const auth = String(req.headers.authorization || '').trim();
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  const token = auth.slice('bearer '.length).trim();
  return getSessionByToken(token, users, authPgPool);
};

const corsHeaders = (origin) => {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-luna-mobile-id',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
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

const extractLabTextFromPdf = async ({ dataUrl, mimeType = 'application/pdf' }) => {
  const parsed = parseDataUrl(dataUrl);
  const resolvedMime = parsed?.mimeType || mimeType;
  const base64 = parsed?.base64;

  if (!base64) {
    return { text: '', message: 'Invalid PDF payload.' };
  }

  if (!GEMINI_API_KEY) {
    return {
      text: '',
      message: 'AI PDF extraction is disabled. Set GEMINI_API_KEY to enable PDF scan-to-text.',
    };
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Extract medical/lab text exactly from this PDF. Return plain text only, preserve markers, values, units, and reference ranges line-by-line.' },
          { inlineData: { mimeType: resolvedMime, data: base64 } },
        ],
      },
    ],
  });

  const text = String(response?.text || '').trim();
  return {
    text,
    message: text ? 'PDF scan completed.' : 'No readable text detected in PDF.',
  };
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

/** Stripe webhook signature: HMAC over exact raw body (never re-serialized JSON). */
const verifyStripeSignature = (rawBody, signatureHeader, secret, { maxSkewSec = 300 } = {}) => {
  if (!signatureHeader || !secret) return false;
  const pairs = String(signatureHeader)
    .split(',')
    .map((chunk) => chunk.trim().split('='))
    .filter((item) => item.length === 2);
  const timestamp = pairs.find(([key]) => key === 't')?.[1];
  const signatures = pairs.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;
  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum)) return false;
  // Reject grossly skewed timestamps (replay window). Does not replace event ledger.
  if (maxSkewSec > 0 && Math.abs(Math.floor(Date.now() / 1000) - tsNum) > maxSkewSec) {
    return false;
  }
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
  const durableDecision = resolveDurableJsonStorageDecision({
    env: process.env,
    runtimeEnvironment,
  });

  // WS1.1: production/preview without DATABASE_URL must not load or write critical JSON stores.
  if (!durableDecision.allowed) {
    console.warn(
      `[durable-storage] unavailable: ${durableDecision.reason} — critical JSON/tmp stores blocked`,
    );
    return async (req, res) => {
      const method = req.method || 'GET';
      const origin = req.headers.origin;
      const headers = corsHeaders(origin);

      if (method === 'OPTIONS') {
        sendEmpty(res, 204, headers);
        return;
      }

      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      if (method === 'GET' && url.pathname === '/api/health') {
        const verbose = ['1', 'true', 'yes'].includes(
          String(url.searchParams.get('verbose') || '').toLowerCase(),
        );
        const payload = await buildHealthPayload({ verbose, durableDecision });
        send(res, 503, payload, headers);
        return;
      }

      send(res, 503, durableStorageUnavailablePayload(durableDecision), headers);
    };
  }

  // WS1.2 — Users + Sessions: Postgres when DATABASE_URL set (non-test); JSON for test/dev-without-DB.
  const authIdentityMode = resolveAuthIdentityStorageMode({
    env: process.env,
    runtimeEnvironment,
  });
  if (authIdentityMode === 'unavailable') {
    console.warn('[auth-identity] unavailable: database_missing — users/sessions blocked');
    return async (req, res) => {
      const method = req.method || 'GET';
      const origin = req.headers.origin;
      const headers = corsHeaders(origin);
      if (method === 'OPTIONS') {
        sendEmpty(res, 204, headers);
        return;
      }
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      if (method === 'GET' && url.pathname === '/api/health') {
        const verbose = ['1', 'true', 'yes'].includes(
          String(url.searchParams.get('verbose') || '').toLowerCase(),
        );
        const payload = await buildHealthPayload({ verbose, durableDecision });
        send(res, 503, payload, headers);
        return;
      }
      send(res, 503, durableStorageUnavailablePayload({ reason: 'database_missing' }), headers);
    };
  }

  let authPgPool = null;
  if (authIdentityMode === 'postgres') {
    const poolStatus = await getPgPoolStatus();
    const usersRepo = await initAuthUsersRepository({ mode: 'postgres', pool: poolStatus.pool });
    const sessionsRepo = await initAuthSessionsRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    if (!usersRepo.ok || !sessionsRepo.ok || !poolStatus.pool) {
      console.warn(
        `[auth-identity] init failed: users=${usersRepo.reason || usersRepo.mode} sessions=${sessionsRepo.reason || sessionsRepo.mode}`,
      );
      return async (req, res) => {
        const method = req.method || 'GET';
        const origin = req.headers.origin;
        const headers = corsHeaders(origin);
        if (method === 'OPTIONS') {
          sendEmpty(res, 204, headers);
          return;
        }
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        if (method === 'GET' && url.pathname === '/api/health') {
          const verbose = ['1', 'true', 'yes'].includes(
            String(url.searchParams.get('verbose') || '').toLowerCase(),
          );
          const payload = await buildHealthPayload({ verbose, durableDecision });
          payload.ok = false;
          payload.checks = {
            ...(payload.checks || {}),
            authUsers: 'unavailable',
            authSessions: 'unavailable',
          };
          send(res, 503, payload, headers);
          return;
        }
        send(
          res,
          503,
          {
            error: 'Auth identity storage is unavailable.',
            code: 'AUTH_IDENTITY_STORE_UNAVAILABLE',
            reason: usersRepo.reason || sessionsRepo.reason || 'init_failed',
          },
          headers,
        );
      };
    }
    authPgPool = poolStatus.pool;
    console.info('[auth-identity] users+sessions repositories initialized (postgres)');
  }

  let users = [];
  if (authIdentityMode === 'postgres' && authPgPool) {
    users = await loadUsersFromPostgres(authPgPool);
    // One-time import from legacy JSON when Postgres is empty (preserve accounts/sessions).
    if ((await countAuthUsers(authPgPool)) === 0) {
      const legacyUsersRaw = await readJson(DATA_FILE, []);
      const legacyUsers = Array.isArray(legacyUsersRaw)
        ? legacyUsersRaw.filter(
            (u) =>
              u &&
              typeof u.id === 'string' &&
              u.id &&
              typeof u.email === 'string' &&
              u.email.includes('@'),
          )
        : [];
      if (legacyUsers.length > 0) {
        await saveUsersToPostgres(authPgPool, legacyUsers);
        users = await loadUsersFromPostgres(authPgPool);
        console.info(`[auth-identity] imported ${users.length} users from legacy JSON`);
      }
    }
  } else {
    users = await readJson(DATA_FILE, []);
    if (!Array.isArray(users)) users = [];
  }

  // WS1.5 — Operational records (admin workspace/invites/audit, privacy, contacts)
  const operationalRecordsMode = resolveOperationalRecordsStorageMode({
    env: process.env,
    runtimeEnvironment,
  });
  let operationalPgPool = null;
  if (operationalRecordsMode === 'unavailable') {
    console.warn('[operational-records] storage unavailable: database_missing');
  } else if (operationalRecordsMode === 'postgres') {
    const poolStatus = await getPgPoolStatus();
    const invitesRepo = await initAdminInvitesRepository({ mode: 'postgres', pool: poolStatus.pool });
    const auditRepo = await initAdminAuditRepository({ mode: 'postgres', pool: poolStatus.pool });
    const workspaceRepo = await initAdminWorkspaceRepository({ mode: 'postgres', pool: poolStatus.pool });
    const privacyRepo = await initPrivacyRequestsRepository({ mode: 'postgres', pool: poolStatus.pool });
    const contactsRepo = await initContactSubmissionsRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    if (
      !invitesRepo.ok ||
      !auditRepo.ok ||
      !workspaceRepo.ok ||
      !privacyRepo.ok ||
      !contactsRepo.ok ||
      !poolStatus.pool
    ) {
      console.warn('[operational-records] init failed — fail closed');
      return async (req, res) => {
        const method = req.method || 'GET';
        const origin = req.headers.origin;
        const headers = corsHeaders(origin);
        if (method === 'OPTIONS') {
          sendEmpty(res, 204, headers);
          return;
        }
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        if (method === 'GET' && url.pathname === '/api/health') {
          const verbose = ['1', 'true', 'yes'].includes(
            String(url.searchParams.get('verbose') || '').toLowerCase(),
          );
          const payload = await buildHealthPayload({ verbose, durableDecision });
          payload.ok = false;
          payload.checks = {
            ...(payload.checks || {}),
            operationalRecordsStorage: 'unavailable',
          };
          send(res, 503, payload, headers);
          return;
        }
        send(res, 503, operationalRecordsUnavailablePayload('init_failed'), headers);
      };
    }
    operationalPgPool = authPgPool || poolStatus.pool;
    const legacyAdmin = await readJson(ADMIN_DATA_FILE, {});
    const legacyPrivacy = await readJson(PRIVACY_REQUESTS_FILE, []);
    const legacyContacts = await readJson(CONTACTS_FILE, []);
    await maybeImportOperationalRecordsOnBoot(operationalPgPool, {
      adminStateRaw: legacyAdmin && typeof legacyAdmin === 'object' ? legacyAdmin : {},
      privacyRequestsRaw: Array.isArray(legacyPrivacy) ? legacyPrivacy : [],
      contactSubmissionsRaw: Array.isArray(legacyContacts) ? legacyContacts : [],
    });
    console.info('[operational-records] repositories initialized (postgres)');
  }

  const adminStore = createAdminStateStore({
    mode: operationalRecordsMode === 'postgres' ? 'postgres' : 'json',
    pool: operationalPgPool,
    readJson,
    writeJson,
    filePath: ADMIN_DATA_FILE,
    helpers: { safeText, normalizeEmail, numberOr },
  });
  if (operationalRecordsMode !== 'unavailable') {
    await adminStore.load();
  }
  const handleAdminApi = createAdminRouter(adminStore, {
    safeText,
    normalizeEmail,
    SUPER_ADMIN_EMAILS,
    isNonEmptyArray,
    toCsv,
    send,
    sendText,
    readBody,
    buildSessionPayload,
  });

  let contactSubmissions = [];
  let privacyRequests = [];
  if (operationalRecordsMode === 'json') {
    contactSubmissions = await readJson(CONTACTS_FILE, []);
    if (!Array.isArray(contactSubmissions)) contactSubmissions = [];
    privacyRequests = await readJson(PRIVACY_REQUESTS_FILE, []);
    if (!Array.isArray(privacyRequests)) privacyRequests = [];
  } else if (operationalRecordsMode === 'postgres' && operationalPgPool) {
    contactSubmissions = await listContactSubmissions(operationalPgPool, { limit: 2000 });
    privacyRequests = await listPrivacyRequests(operationalPgPool, { limit: 2000 });
  }

  // WS1.6 — Calendar + Mobile user data
  let userDataMode = resolveUserDataStorageMode({
    env: process.env,
    runtimeEnvironment,
  });
  let userDataPgPool = null;
  if (userDataMode === 'unavailable') {
    console.warn('[user-data] storage unavailable: database_missing');
  } else if (userDataMode === 'postgres') {
    const poolStatus = await getPgPoolStatus();
    const calendarRepo = await initCalendarUserDataRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    const reflectionsRepo = await initMobileReflectionsRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    const reportsRepo = await initMobileReportsRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    const stateRepo = await initMobileUserStateRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    const pushRepo = await initMobilePushRepository({ mode: 'postgres', pool: poolStatus.pool });
    if (
      !calendarRepo.ok ||
      !reflectionsRepo.ok ||
      !reportsRepo.ok ||
      !stateRepo.ok ||
      !pushRepo.ok ||
      !poolStatus.pool
    ) {
      console.warn('[user-data] init failed — fail closed');
      return async (req, res) => {
        const method = req.method || 'GET';
        const origin = req.headers.origin;
        const headers = corsHeaders(origin);
        if (method === 'OPTIONS') {
          sendEmpty(res, 204, headers);
          return;
        }
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        if (method === 'GET' && url.pathname === '/api/health') {
          const verbose = ['1', 'true', 'yes'].includes(
            String(url.searchParams.get('verbose') || '').toLowerCase(),
          );
          const payload = await buildHealthPayload({ verbose, durableDecision });
          payload.ok = false;
          payload.checks = {
            ...(payload.checks || {}),
            userDataStorage: 'unavailable',
          };
          send(res, 503, payload, headers);
          return;
        }
        send(res, 503, userDataUnavailablePayload('init_failed'), headers);
      };
    }
    userDataPgPool = authPgPool || operationalPgPool || poolStatus.pool;
    const legacyCalendar = await readJson(CALENDAR_DATA_FILE, {});
    const legacyReflections = await readJson(MOBILE_REFLECTIONS_FILE, { profiles: {} });
    const legacyReports = await readJson(MOBILE_REPORTS_FILE, { profiles: {} });
    const legacyState = await readJson(MOBILE_STATE_FILE, { profiles: {} });
    const legacyPush = await readJson(MOBILE_PUSH_FILE, { profiles: {} });
    await maybeImportUserDataOnBoot(userDataPgPool, {
      calendarStoreRaw: legacyCalendar && typeof legacyCalendar === 'object' ? legacyCalendar : {},
      mobileReflectionsRaw: legacyReflections,
      mobileReportsRaw: legacyReports,
      mobileStateRaw: legacyState,
      mobilePushRaw: legacyPush,
    });
    console.info('[user-data] repositories initialized (postgres)');
  }

  // WS1.3 — Billing + trials durable storage
  const billingStorageMode = resolveBillingStorageMode({
    env: process.env,
    runtimeEnvironment,
  });
  let billingPgPool = null;
  let billingState = {};
  if (billingStorageMode === 'unavailable') {
    console.warn('[billing] storage unavailable: database_missing — billing/trial JSON blocked');
  } else if (billingStorageMode === 'postgres') {
    const poolStatus = await getPgPoolStatus();
    const accountsRepo = await initBillingAccountsRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    const subsRepo = await initBillingSubscriptionsRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    const trialsRepo = await initBillingTrialsRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    const webhookLedgerRepo = await initStripeWebhookEventsRepository({
      mode: 'postgres',
      pool: poolStatus.pool,
    });
    if (!accountsRepo.ok || !subsRepo.ok || !trialsRepo.ok || !webhookLedgerRepo.ok || !poolStatus.pool) {
      console.warn(
        `[billing] init failed: accounts=${accountsRepo.reason || accountsRepo.mode} subscriptions=${subsRepo.reason || subsRepo.mode} trials=${trialsRepo.reason || trialsRepo.mode} webhookLedger=${webhookLedgerRepo.reason || webhookLedgerRepo.mode}`,
      );
      return async (req, res) => {
        const method = req.method || 'GET';
        const origin = req.headers.origin;
        const headers = corsHeaders(origin);
        if (method === 'OPTIONS') {
          sendEmpty(res, 204, headers);
          return;
        }
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        if (method === 'GET' && url.pathname === '/api/health') {
          const verbose = ['1', 'true', 'yes'].includes(
            String(url.searchParams.get('verbose') || '').toLowerCase(),
          );
          const payload = await buildHealthPayload({ verbose, durableDecision });
          payload.ok = false;
          payload.checks = {
            ...(payload.checks || {}),
            billingStorage: 'unavailable',
            trialStorage: 'unavailable',
            stripeWebhookLedger: 'unavailable',
          };
          send(res, 503, payload, headers);
          return;
        }
        send(res, 503, billingStorageUnavailablePayload('init_failed'), headers);
      };
    }
    billingPgPool = poolStatus.pool;
    // Prefer shared auth pool when already initialized (same getPgPool singleton).
    if (authPgPool) billingPgPool = authPgPool;
    const legacyBillingRaw = await readJson(BILLING_STATE_FILE, {});
    await maybeImportLegacyBillingOnBoot(
      billingPgPool,
      legacyBillingRaw && typeof legacyBillingRaw === 'object' ? legacyBillingRaw : {},
    );
    console.info('[billing] accounts+subscriptions+trials+webhook-ledger repositories initialized (postgres)');
  } else {
    billingState = await readJson(BILLING_STATE_FILE, {});
    if (!billingState || typeof billingState !== 'object') billingState = {};
  }

  // JSON/test: process-local webhook ledger (same claim semantics; not multi-instance durable).
  const stripeWebhookLedger =
    billingStorageMode === 'json' ? createMemoryStripeWebhookLedger() : null;

  const saveBillingState = async () => {
    if (billingStorageMode === 'postgres') {
      // Postgres mode: no JSON authority writes.
      return;
    }
    if (billingStorageMode === 'unavailable') {
      const err = new Error('Billing storage is unavailable.');
      err.code = BILLING_STORAGE_UNAVAILABLE;
      throw err;
    }
    await writeJson(BILLING_STATE_FILE, billingState);
  };

  const billingService = createBillingService({
    mode: billingStorageMode === 'postgres' ? 'postgres' : billingStorageMode === 'json' ? 'json' : 'unavailable',
    pool: billingPgPool,
    billingState,
    saveBillingState,
    trialDays: STRIPE_TRIAL_DAYS,
  });

  // WS2 Block 2 — durable deletion ops + orchestrator (Stripe → local cascade).
  const deletionOpsMode =
    authIdentityMode === 'postgres' && authPgPool
      ? 'postgres'
      : authIdentityMode === 'json'
        ? 'json'
        : 'unavailable';
  let deletionOpsPool = null;
  let memoryDeletionOps = null;
  if (deletionOpsMode === 'postgres') {
    const opsRepo = await initAccountDeletionOpsRepository({
      mode: 'postgres',
      pool: authPgPool || billingPgPool || operationalPgPool,
    });
    if (opsRepo.ok) {
      deletionOpsPool = opsRepo.pool;
    } else {
      console.warn('[account-deletion-ops] init failed — deletion ops unavailable');
    }
  } else if (deletionOpsMode === 'json') {
    memoryDeletionOps = createMemoryDeletionOpsLedger();
  }

  const accountDeletionOrchestrator = createAccountDeletionOrchestrator({
    mode: deletionOpsMode === 'postgres' && deletionOpsPool ? 'postgres' : 'json',
    pool: deletionOpsPool,
    memoryOps: memoryDeletionOps,
    stripeRequest,
    billingEnabled: BILLING_ENABLED,
    secretConfigured: Boolean(STRIPE_SECRET_KEY),
    getSubscriptionByUserId,
    getStripeCustomerIdForUser: billingService.getStripeCustomerIdForUser,
    getStatusForUser: billingService.getStatusForUser,
  });

  const isDeletionBlockingUser = async (userId) => {
    if (!userId) return false;
    try {
      return await accountDeletionOrchestrator.isUserDeletionBlocking(userId);
    } catch {
      return false;
    }
  };

  // JSON mode keeps in-memory mirrors; postgres mode loads per-request by user_id.
  let mobileReflections = { profiles: {} };
  let mobileReports = { profiles: {} };
  let mobileStateStore = { profiles: {} };
  let mobilePushStore = { profiles: {} };
  let calendarStore = {};
  if (userDataMode === 'json') {
    mobileReflections = sanitizeMobileState(await readJson(MOBILE_REFLECTIONS_FILE, { profiles: {} }));
    mobileReports = sanitizeMobileReportsState(await readJson(MOBILE_REPORTS_FILE, { profiles: {} }));
    mobileStateStore = sanitizeMobileStateStore(await readJson(MOBILE_STATE_FILE, { profiles: {} }));
    mobilePushStore = sanitizeMobilePushStore(await readJson(MOBILE_PUSH_FILE, { profiles: {} }));
    calendarStore = await readJson(CALENDAR_DATA_FILE, {});
    if (!calendarStore || typeof calendarStore !== 'object') calendarStore = {};
  }

  // Clear process-local session map for this handler boot, then hydrate.
  sessions.clear();
  let storedSessions = [];
  if (authIdentityMode === 'postgres' && authPgPool) {
    storedSessions = await loadSessionsFromPostgres(authPgPool);
    if ((await countAuthSessions(authPgPool)) === 0) {
      const legacySessions = parseStoredSessions(await readJson(SESSIONS_FILE, []));
      if (legacySessions.length > 0) {
        await saveSessionsToPostgres(authPgPool, legacySessions);
        storedSessions = await loadSessionsFromPostgres(authPgPool);
        console.info(`[auth-identity] imported ${storedSessions.length} sessions from legacy JSON`);
      }
    }
  } else {
    storedSessions = parseStoredSessions(await readJson(SESSIONS_FILE, []));
  }
  for (const item of storedSessions) {
    sessions.set(item.token, {
      userId: item.userId,
      expiresAt: item.expiresAt,
      maxAgeSec: item.maxAgeSec,
    });
  }
  const purgeExpiredFromStores = async () => {
    const expiredTokens = purgeExpiredSessions();
    if (expiredTokens.length === 0) return false;
    if (authIdentityMode === 'postgres' && authPgPool) {
      await Promise.all(expiredTokens.map((token) => deleteSessionFromPostgres(authPgPool, token)));
    } else {
      await writeJson(SESSIONS_FILE, serializeSessions());
    }
    return true;
  };
  const didPurgeOnBoot = await purgeExpiredFromStores();

  const saveUsers = async () => {
    if (authIdentityMode === 'postgres' && authPgPool) {
      await saveUsersToPostgres(authPgPool, users);
      return;
    }
    await writeJson(DATA_FILE, users);
  };
  const saveContacts = async () => {
    if (operationalRecordsMode === 'postgres') {
      // Postgres mode: inserts/deletes are targeted; no full-array rewrite.
      return;
    }
    if (operationalRecordsMode === 'unavailable') {
      const err = new Error('Operational records storage is unavailable.');
      err.code = OPERATIONAL_RECORDS_UNAVAILABLE;
      throw err;
    }
    await writeJson(CONTACTS_FILE, contactSubmissions);
  };
  const saveSessions = async () => {
    if (authIdentityMode === 'postgres' && authPgPool) {
      await saveSessionsToPostgres(authPgPool, serializeSessions());
      return;
    }
    await writeJson(SESSIONS_FILE, serializeSessions());
  };
  const savePrivacyRequests = async () => {
    if (operationalRecordsMode === 'postgres') {
      return;
    }
    if (operationalRecordsMode === 'unavailable') {
      const err = new Error('Operational records storage is unavailable.');
      err.code = OPERATIONAL_RECORDS_UNAVAILABLE;
      throw err;
    }
    await writeJson(PRIVACY_REQUESTS_FILE, privacyRequests);
  };
  const appendPrivacyRequestRecord = async (record) => {
    if (operationalRecordsMode === 'unavailable') {
      const err = new Error('Operational records storage is unavailable.');
      err.code = OPERATIONAL_RECORDS_UNAVAILABLE;
      throw err;
    }
    if (operationalRecordsMode === 'postgres' && operationalPgPool) {
      await insertPrivacyRequest(operationalPgPool, record);
      privacyRequests = await listPrivacyRequests(operationalPgPool, { limit: 2000 });
      return;
    }
    privacyRequests = [record, ...privacyRequests].slice(0, 2000);
    await savePrivacyRequests();
  };
  const appendContactRecord = async (record) => {
    if (operationalRecordsMode === 'unavailable') {
      const err = new Error('Operational records storage is unavailable.');
      err.code = OPERATIONAL_RECORDS_UNAVAILABLE;
      throw err;
    }
    if (operationalRecordsMode === 'postgres' && operationalPgPool) {
      await insertContactSubmission(operationalPgPool, record);
      contactSubmissions = await listContactSubmissions(operationalPgPool, { limit: 2000 });
      return;
    }
    contactSubmissions = [record, ...contactSubmissions].slice(0, 2000);
    await saveContacts();
  };
  const removeContactsForEmail = async (email) => {
    if (operationalRecordsMode === 'unavailable') {
      const err = new Error('Operational records storage is unavailable.');
      err.code = OPERATIONAL_RECORDS_UNAVAILABLE;
      throw err;
    }
    if (operationalRecordsMode === 'postgres' && operationalPgPool) {
      await deleteContactSubmissionsByEmail(operationalPgPool, email);
      contactSubmissions = await listContactSubmissions(operationalPgPool, { limit: 2000 });
      return;
    }
    contactSubmissions = contactSubmissions.filter(
      (item) => normalizeEmail(item.email) !== normalizeEmail(email),
    );
    await saveContacts();
  };
  const markContactReplied = async (id, repliedAt) => {
    if (operationalRecordsMode === 'unavailable') {
      const err = new Error('Operational records storage is unavailable.');
      err.code = OPERATIONAL_RECORDS_UNAVAILABLE;
      throw err;
    }
    if (operationalRecordsMode === 'postgres' && operationalPgPool) {
      await markContactSubmissionReplied(operationalPgPool, id, repliedAt);
      contactSubmissions = await listContactSubmissions(operationalPgPool, { limit: 2000 });
      return;
    }
    const row = contactSubmissions.find((item) => item.id === id);
    if (row) row.repliedAt = repliedAt;
    await saveContacts();
  };
  const requireOperationalRecords = (res, headers) => {
    if (operationalRecordsMode === 'unavailable') {
      send(res, 503, operationalRecordsUnavailablePayload('database_missing'), headers);
      return false;
    }
    return true;
  };
  const saveMobileReflections = async () => {
    if (userDataMode === 'postgres') return;
    if (userDataMode === 'unavailable') {
      const err = new Error('User data storage is unavailable.');
      err.code = USER_DATA_STORAGE_UNAVAILABLE;
      throw err;
    }
    await writeJson(MOBILE_REFLECTIONS_FILE, mobileReflections);
  };
  const saveMobileReports = async () => {
    if (userDataMode === 'postgres') return;
    if (userDataMode === 'unavailable') {
      const err = new Error('User data storage is unavailable.');
      err.code = USER_DATA_STORAGE_UNAVAILABLE;
      throw err;
    }
    await writeJson(MOBILE_REPORTS_FILE, mobileReports);
  };
  const saveMobileStateStore = async () => {
    if (userDataMode === 'postgres') return;
    if (userDataMode === 'unavailable') {
      const err = new Error('User data storage is unavailable.');
      err.code = USER_DATA_STORAGE_UNAVAILABLE;
      throw err;
    }
    await writeJson(MOBILE_STATE_FILE, mobileStateStore);
  };
  const saveMobilePushStore = async () => {
    if (userDataMode === 'postgres') return;
    if (userDataMode === 'unavailable') {
      const err = new Error('User data storage is unavailable.');
      err.code = USER_DATA_STORAGE_UNAVAILABLE;
      throw err;
    }
    await writeJson(MOBILE_PUSH_FILE, mobilePushStore);
  };
  const saveCalendarStore = async () => {
    if (userDataMode === 'postgres') return;
    if (userDataMode === 'unavailable') {
      const err = new Error('User data storage is unavailable.');
      err.code = USER_DATA_STORAGE_UNAVAILABLE;
      throw err;
    }
    await writeJson(CALENDAR_DATA_FILE, calendarStore);
  };
  const requireUserDataStorage = (res, headers) => {
    if (userDataMode === 'unavailable') {
      send(res, 503, userDataUnavailablePayload('database_missing'), headers);
      return false;
    }
    return true;
  };
  const personalEventsStoreHandle = await createPersonalEventsStore(PERSONAL_EVENTS_FILE, {
    runtimeEnvironment,
  });
  const personalEventsStore = personalEventsStoreHandle.store;
  const personalEventsStoreAvailable = isPersonalEventsStoreAvailable(personalEventsStoreHandle);

  const memoryConsentStoreHandle = await createMemoryConsentStore(MEMORY_CONSENT_FILE, {
    runtimeEnvironment,
  });
  const memoryConsentStore = memoryConsentStoreHandle.store;
  const memoryConsentStoreAvailable = isMemoryConsentStoreAvailable(memoryConsentStoreHandle);

  const reevaluateAfterSignalMutation = async (userId, before, after, mutationType) => {
    try {
      const meta = await runPatternReevaluationAfterMutation({
        store: personalEventsStore,
        userId,
        before_signal: before,
        after_signal: after,
        mutation_type: mutationType,
      });
      console.info('[pattern] reevaluation', JSON.stringify(summarizeReevaluationForLogs(meta)));
      return publicReevaluationMeta(meta);
    } catch {
      const failed = { pattern_reevaluation_status: 'failed', pattern_reevaluation_reason: 'unavailable' };
      console.info('[pattern] reevaluation', JSON.stringify(summarizeReevaluationForLogs(failed)));
      return failed;
    }
  };


  const sendPersonalEventsUnavailable = (res, headers) => {
    send(
      res,
      503,
      {
        error: 'Personal event store unavailable.',
        code: PERSONAL_EVENT_STORE_UNAVAILABLE,
      },
      headers,
    );
  };

  const sendMemoryConsentUnavailable = (res, headers) => {
    send(
      res,
      503,
      {
        error: 'Memory consent store unavailable.',
        code: MEMORY_CONSENT_STORE_UNAVAILABLE,
        status: 'consent_unavailable',
        consent_version: MEMORY_CONSENT_VERSION,
        memory_write_available: false,
      },
      headers,
    );
  };

  const buildMemoryConsentResponse = async (userId) => {
    if (!memoryConsentStoreAvailable) {
      return { unavailable: true };
    }
    try {
      const record = await memoryConsentStore.get(userId);
      return {
        unavailable: false,
        body: toPublicMemoryConsent(record, {
          memoryWriteFeatureEnabled: isLunaLiveMemoryWriteEnabled(),
        }),
      };
    } catch {
      return { unavailable: true };
    }
  };


  const sanitizeCalendarBundle = (raw) => {
    if (!raw || typeof raw !== 'object') return null;
    return {
      version: 2,
      journal: raw.journal && typeof raw.journal === 'object' ? raw.journal : {},
      events: Array.isArray(raw.events) ? raw.events.slice(0, 500) : [],
      preferences:
        raw.preferences && typeof raw.preferences === 'object'
          ? {
              browserNotifications: raw.preferences.browserNotifications !== false,
              emailReminders: raw.preferences.emailReminders === true,
              reminderEmail: safeText(raw.preferences.reminderEmail, 160),
              sentReminderKeys: Array.isArray(raw.preferences.sentReminderKeys)
                ? raw.preferences.sentReminderKeys.slice(-500)
                : [],
              lastSyncAt: safeText(raw.preferences.lastSyncAt, 40),
              serverRevision: safeText(raw.preferences.serverRevision, 40),
            }
          : {
              browserNotifications: true,
              emailReminders: false,
              reminderEmail: '',
              sentReminderKeys: [],
            },
      updatedAt: safeText(raw.updatedAt, 40) || new Date().toISOString(),
    };
  };

  const mergeCalendarBundlesServer = (local, remote) => {
    const journal = { ...remote.journal };
    for (const [iso, entry] of Object.entries(local.journal || {})) {
      const remoteEntry = journal[iso];
      if (!remoteEntry || new Date(entry.updatedAt).getTime() >= new Date(remoteEntry.updatedAt).getTime()) {
        journal[iso] = entry;
      }
    }
    const eventsById = new Map();
    for (const event of remote.events || []) eventsById.set(event.id, event);
    for (const event of local.events || []) {
      const prev = eventsById.get(event.id);
      if (!prev || new Date(event.updatedAt).getTime() >= new Date(prev.updatedAt).getTime()) {
        eventsById.set(event.id, event);
      }
    }
    return {
      version: 2,
      journal,
      events: Array.from(eventsById.values()),
      preferences: {
        ...remote.preferences,
        browserNotifications: local.preferences?.browserNotifications !== false,
        emailReminders: local.preferences?.emailReminders === true,
        reminderEmail: safeText(local.preferences?.reminderEmail, 160) || remote.preferences?.reminderEmail || '',
        sentReminderKeys: Array.from(
          new Set([...(remote.preferences?.sentReminderKeys || []), ...(local.preferences?.sentReminderKeys || [])]),
        ).slice(-500),
        lastSyncAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
  };

  /**
   * Canonical authenticated identity for mobile personal data.
   * Cookie session (web) OR verified Bearer token (mobile) only.
   * Never trusts x-luna-mobile-id, x-user-id, body/query userId, or IP.
   */
  const getVerifiedRequestUser = async (req) => {
    const cookieSession = await getSessionUser(req, users, authPgPool);
    if (cookieSession) return cookieSession;
    return getMobileAuthUser(req, users, authPgPool);
  };

  const requireMobileSession = async (req, res, headers) => {
    const current = await getVerifiedRequestUser(req);
    if (!current?.user?.id) {
      send(res, 401, { error: 'Not authenticated.' }, headers);
      return null;
    }
    if (await isDeletionBlockingUser(current.user.id)) {
      send(res, 403, { error: 'Account deletion in progress.', code: 'ACCOUNT_DELETION_IN_PROGRESS' }, headers);
      return null;
    }
    return { current, sessionPayload: buildSessionPayload(current.user) };
  };

  const resolveAuthenticatedMobileProfile = async (req, res, headers) => {
    if (!requireUserDataStorage(res, headers)) return null;
    const auth = await requireMobileSession(req, res, headers);
    if (!auth) return null;

    const userId = safeId(auth.current.user.id, 120);
    if (!userId) {
      send(res, 401, { error: 'Not authenticated.' }, headers);
      return null;
    }

    const profileKey = `user:${userId}`;
    const defaultName = auth.current.user.name ? safeText(auth.current.user.name, 80) : 'Anna';

    if (userDataMode === 'postgres' && userDataPgPool) {
      await ensureMobileReflectionMeta(userDataPgPool, userId, defaultName);
      const profile = await getMobileReflectionProfile(userDataPgPool, userId);
      if (!profile.name && defaultName) profile.name = defaultName;
      return { auth, profile, profileKey, userId };
    }

    if (!mobileReflections.profiles[profileKey]) {
      mobileReflections.profiles[profileKey] = createMobileProfile(defaultName);
      await saveMobileReflections();
    }

    const profile = mobileReflections.profiles[profileKey];
    if (!profile.name && defaultName) {
      profile.name = defaultName;
    }

    return { auth, profile, profileKey, userId };
  };

  const resolveAuthenticatedMobileReportsProfile = async (req, res, headers) => {
    const resolved = await resolveAuthenticatedMobileProfile(req, res, headers);
    if (!resolved) return null;
    const { profileKey, userId } = resolved;
    if (userDataMode === 'postgres' && userDataPgPool) {
      const reports = await listMobileReportsForUser(userDataPgPool, userId, { limit: 100 });
      return { ...resolved, reports };
    }
    if (!mobileReports.profiles[profileKey]) {
      mobileReports.profiles[profileKey] = [];
      await saveMobileReports();
    }
    return { ...resolved, reports: mobileReports.profiles[profileKey] };
  };

  const resolveAuthenticatedMobileStateProfile = async (req, res, headers) => {
    const resolved = await resolveAuthenticatedMobileProfile(req, res, headers);
    if (!resolved) return null;
    const { profileKey, userId } = resolved;
    if (userDataMode === 'postgres' && userDataPgPool) {
      const stateProfile = await listMobileStateSections(userDataPgPool, userId);
      return { ...resolved, stateProfile };
    }
    if (!mobileStateStore.profiles[profileKey]) {
      mobileStateStore.profiles[profileKey] = { sections: {}, updatedAt: new Date().toISOString() };
      await saveMobileStateStore();
    }
    return { ...resolved, stateProfile: mobileStateStore.profiles[profileKey] };
  };

  const resolveAuthenticatedMobilePushProfile = async (req, res, headers) => {
    const resolved = await resolveAuthenticatedMobileProfile(req, res, headers);
    if (!resolved) return null;
    const { profileKey, userId } = resolved;
    if (userDataMode === 'postgres' && userDataPgPool) {
      const tokens = await listMobilePushTokensForUser(userDataPgPool, userId, { limit: 10 });
      const updatedAt = tokens[0]?.updatedAt || null;
      return { ...resolved, pushProfile: { tokens, updatedAt } };
    }
    if (!mobilePushStore.profiles[profileKey]) {
      mobilePushStore.profiles[profileKey] = { tokens: [], updatedAt: new Date().toISOString() };
      await saveMobilePushStore();
    }
    return { ...resolved, pushProfile: mobilePushStore.profiles[profileKey] };
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

  const requireSession = async (req, res, headers, { allowDeletionInProgress = false } = {}) => {
    const current = await getSessionUser(req, users, authPgPool);
    if (!current) {
      send(res, 401, { error: 'Not authenticated.' }, headers);
      return null;
    }
    if (!allowDeletionInProgress && (await isDeletionBlockingUser(current.user.id))) {
      send(res, 403, { error: 'Account deletion in progress.', code: 'ACCOUNT_DELETION_IN_PROGRESS' }, headers);
      return null;
    }
    return { current, sessionPayload: buildSessionPayload(current.user) };
  };

  const requireSessionAndAi = async (req, res, headers) => {
    const auth = await requireSession(req, res, headers);
    if (!auth) return null;
    if (!hasAiProcessingConsent(req)) {
      send(res, 403, { error: 'AI processing consent required. Enable in Privacy settings.' }, headers);
      return null;
    }
    return auth;
  };

  return async (req, res) => {
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
      await purgeExpiredFromStores();
    }

    if (method === 'GET' && url.pathname === '/api/health') {
      const verbose = ['1', 'true', 'yes'].includes(String(url.searchParams.get('verbose') || '').toLowerCase());
      const payload = await buildHealthPayload({ verbose });
      send(res, payload.ok ? 200 : 503, payload, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/auth/session') {
      const current = await getMobileAuthUser(req, users, authPgPool);
      if (!current) {
        send(res, 200, { session: null }, headers);
        return;
      }
      send(res, 200, { session: buildSessionPayload(current.user) }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/auth/signup') {
      if (!(await rateLimit(`mobile-signup:${ip}`, 12, 60_000))) {
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
      if (!(await rateLimit(`mobile-signin:${ip}`, 24, 60_000))) {
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
        if (await isDeletionBlockingUser(user.id)) {
          send(res, 403, { error: 'Account deletion in progress.', code: 'ACCOUNT_DELETION_IN_PROGRESS' }, headers);
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
      const current = await getMobileAuthUser(req, users, authPgPool);
      if (current) {
        sessions.delete(current.token);
        if (authPgPool) {
          await deleteSessionFromPostgres(authPgPool, current.token);
        } else {
          await saveSessions();
        }
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
      const resolved = await resolveAuthenticatedMobileProfile(req, res, headers);
      if (!resolved) return;
      const { profile } = resolved;
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
      const resolved = await resolveAuthenticatedMobileProfile(req, res, headers);
      if (!resolved) return;
      const { profile } = resolved;
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
      const resolved = await resolveAuthenticatedMobileProfile(req, res, headers);
      if (!resolved) return;
      send(
        res,
        200,
        {
          entries: mapStoryEntries(resolved.profile.entries),
        },
        headers,
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/reflection') {
      const resolved = await resolveAuthenticatedMobileProfile(req, res, headers);
      if (!resolved) return;
      if (!(await rateLimit(`mobile-reflection:${ip}:${resolved.auth.current.user.id}`, 40, 60_000))) {
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

        // Ownership is always the authenticated user — never body.userId / headers.
        const { profile, userId } = resolved;
        const entry = {
          id: `mob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          at: new Date().toISOString(),
          mode,
          text,
        };
        if (userDataMode === 'postgres' && userDataPgPool) {
          const nextProfile = await insertMobileReflection(userDataPgPool, userId, entry);
          profile.entries = nextProfile.entries;
          profile.updatedAt = nextProfile.updatedAt;
          profile.name = nextProfile.name || profile.name;
        } else {
          profile.entries = [entry, ...(Array.isArray(profile.entries) ? profile.entries : [])].slice(0, 200);
          profile.updatedAt = new Date().toISOString();
          await saveMobileReflections();
        }

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
        if (error?.code === USER_DATA_STORAGE_UNAVAILABLE) {
          send(res, 503, userDataUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not save reflection.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/reports/generate') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!(await rateLimit(`mobile-reports-generate:${ip}:${auth.current.user.id}`, 24, 60_000))) {
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
      const resolved = await resolveAuthenticatedMobileReportsProfile(req, res, headers);
      if (!resolved) return;
      try {
        const body = await readBody(req);
        const id = safeText(body.id, 120);
        const generatedAt = safeText(body.generatedAt, 64) || new Date().toISOString();
        const text = safeText(body.text, 20000);
        if (!id || !text) {
          send(res, 400, { error: 'Invalid report payload.' }, headers);
          return;
        }

        const { reports, profileKey, userId } = resolved;
        if (userDataMode === 'postgres' && userDataPgPool) {
          await upsertMobileReportForUser(userDataPgPool, userId, { id, generatedAt, text });
        } else {
          const next = [{ id, generatedAt, text }, ...(Array.isArray(reports) ? reports : [])]
            .filter((item, index, arr) => arr.findIndex((target) => target.id === item.id) === index)
            .slice(0, 100);
          mobileReports.profiles[profileKey] = next;
          await saveMobileReports();
        }
        send(res, 200, { ok: true }, headers);
      } catch (error) {
        if (error?.code === USER_DATA_STORAGE_UNAVAILABLE) {
          send(res, 503, userDataUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not save report.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/reports/history') {
      const resolved = await resolveAuthenticatedMobileReportsProfile(req, res, headers);
      if (!resolved) return;
      const { reports } = resolved;
      send(res, 200, Array.isArray(reports) ? reports.slice(0, 20) : [], headers);
      return;
    }

    if (method === 'POST' && /^\/api\/mobile\/reports\/[^/]+\/pdf$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      send(res, 200, { ok: true, url: '' }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/reports/ocr-intake') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
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
      const resolved = await resolveAuthenticatedMobileStateProfile(req, res, headers);
      if (!resolved) return;
      const { stateProfile } = resolved;
      send(res, 200, { section, data: stateProfile.sections?.[section] ?? null }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/state') {
      const resolved = await resolveAuthenticatedMobileStateProfile(req, res, headers);
      if (!resolved) return;
      try {
        const body = await readBody(req);
        const section = safeId(body.section, 80);
        if (!section) {
          send(res, 400, { error: 'State section is required.' }, headers);
          return;
        }
        const { stateProfile, userId } = resolved;
        if (userDataMode === 'postgres' && userDataPgPool) {
          await upsertMobileStateSection(userDataPgPool, userId, section, body.data ?? null);
        } else {
          stateProfile.sections = stateProfile.sections && typeof stateProfile.sections === 'object' ? stateProfile.sections : {};
          stateProfile.sections[section] = body.data ?? null;
          stateProfile.updatedAt = new Date().toISOString();
          await saveMobileStateStore();
        }
        send(res, 200, { ok: true }, headers);
      } catch (error) {
        if (error?.code === USER_DATA_STORAGE_UNAVAILABLE) {
          send(res, 503, userDataUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not save mobile state.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/mobile/push/status') {
      const resolved = await resolveAuthenticatedMobilePushProfile(req, res, headers);
      if (!resolved) return;
      const { pushProfile } = resolved;
      const tokens = Array.isArray(pushProfile.tokens) ? pushProfile.tokens : [];
      send(
        res,
        200,
        {
          registered: tokens.length > 0,
          count: tokens.length,
          updatedAt: pushProfile.updatedAt || null,
        },
        headers,
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/push/register') {
      const resolved = await resolveAuthenticatedMobilePushProfile(req, res, headers);
      if (!resolved) return;
      try {
        const body = await readBody(req);
        const token = safeText(body.token, 512);
        const platform = safeText(body.platform, 32) || 'unknown';
        const deviceName = safeText(body.deviceName, 120) || '';
        if (!token) {
          send(res, 400, { error: 'Push token is required.' }, headers);
          return;
        }
        const { pushProfile, userId } = resolved;
        let next;
        if (userDataMode === 'postgres' && userDataPgPool) {
          next = await upsertMobilePushToken(userDataPgPool, userId, { token, platform, deviceName });
        } else {
          next = [
            { token, platform, deviceName, updatedAt: new Date().toISOString() },
            ...(Array.isArray(pushProfile.tokens) ? pushProfile.tokens : []),
          ]
            .filter((item, index, arr) => arr.findIndex((candidate) => candidate.token === item.token) === index)
            .slice(0, 10);
          pushProfile.tokens = next;
          pushProfile.updatedAt = new Date().toISOString();
          await saveMobilePushStore();
        }
        send(res, 200, { ok: true, registered: true, count: next.length }, headers);
      } catch (error) {
        if (error?.code === USER_DATA_STORAGE_UNAVAILABLE) {
          send(res, 503, userDataUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not register push token.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/mobile/push/test') {
      const resolved = await resolveAuthenticatedMobilePushProfile(req, res, headers);
      if (!resolved) return;
      const { pushProfile } = resolved;
      const count = Array.isArray(pushProfile.tokens) ? pushProfile.tokens.length : 0;
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


    // --- Authenticated personal event foundation (Task 2) ---
    if (method === 'POST' && url.pathname === '/api/personal/events') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      if (!(await rateLimit(`personal-events-create:${ip}:${auth.current.user.id}`, 60, 60_000))) {
        send(res, 429, { error: 'Too many personal event writes. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        const items = Array.isArray(body?.events) ? body.events : [body];
        if (!items.length) {
          send(res, 400, { error: 'Provide an event object or events array.' }, headers);
          return;
        }
        if (items.length > MAX_EVENTS_PER_REQUEST) {
          send(res, 400, { error: `At most ${MAX_EVENTS_PER_REQUEST} events per request.` }, headers);
          return;
        }
        const userId = auth.current.user.id;
        const created = [];
        const errors = [];
        for (let i = 0; i < items.length; i += 1) {
          const normalized = normalizePersonalEventInput(items[i], { defaultSource: 'api' });
          if (normalized.error) {
            errors.push({ index: i, error: normalized.error });
            continue;
          }
          const result = await personalEventsStore.create(userId, normalized.event);
          created.push(result.event);
        }
        if (!created.length && errors.length) {
          send(res, 400, { error: errors[0].error, errors }, headers);
          return;
        }
        send(res, 200, { events: created, errors: errors.length ? errors : undefined }, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not create personal events.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/personal/events') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      try {
        const eventType = safeText(url.searchParams.get('event_type') || url.searchParams.get('type') || '', 80) || undefined;
        const since = safeText(url.searchParams.get('since') || '', 64) || undefined;
        const until = safeText(url.searchParams.get('until') || '', 64) || undefined;
        if (since && Number.isNaN(Date.parse(since))) {
          send(res, 400, { error: 'Invalid since timestamp.' }, headers);
          return;
        }
        if (until && Number.isNaN(Date.parse(until))) {
          send(res, 400, { error: 'Invalid until timestamp.' }, headers);
          return;
        }
        // Ignore any client-supplied user_id query — ownership is auth only.
        const limitRaw = Number(url.searchParams.get('limit') || DEFAULT_LIST_LIMIT);
        const offsetRaw = Number(url.searchParams.get('offset') || 0);
        const limit = Number.isFinite(limitRaw) ? Math.min(MAX_LIST_LIMIT, Math.max(1, Math.floor(limitRaw))) : DEFAULT_LIST_LIMIT;
        const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0;
        const result = await personalEventsStore.list(auth.current.user.id, {
          eventType,
          since,
          until,
          limit,
          offset,
        });
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not list personal events.' }, headers);
      }
      return;
    }

    if (method === 'DELETE' && /^\/api\/personal\/events\/[^/]+$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const eventId = safeId(url.pathname.split('/').pop() || '', 120);
      if (!eventId) {
        send(res, 400, { error: 'Event id is required.' }, headers);
        return;
      }
      const beforeDelete = await personalEventsStore.getOwned(auth.current.user.id, eventId);
      const deleted = await personalEventsStore.softDelete(auth.current.user.id, eventId);
      if (!deleted) {
        // Do not reveal whether another user's event exists.
        send(res, 404, { error: 'Event not found.' }, headers);
        return;
      }
      const reeval = await reevaluateAfterSignalMutation(
        auth.current.user.id,
        beforeDelete,
        deleted,
        'soft_delete',
      );
      send(res, 200, { ok: true, event: deleted, ...reeval }, headers);
      return;
    }

    if (method === 'POST' && /^\/api\/personal\/events\/[^/]+\/delete$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const parts = url.pathname.split('/');
      const eventId = safeId(parts[parts.length - 2] || '', 120);
      if (!eventId) {
        send(res, 400, { error: 'Event id is required.' }, headers);
        return;
      }
      const beforeDelete = await personalEventsStore.getOwned(auth.current.user.id, eventId);
      const deleted = await personalEventsStore.softDelete(auth.current.user.id, eventId);
      if (!deleted) {
        send(res, 404, { error: 'Event not found.' }, headers);
        return;
      }
      const reeval = await reevaluateAfterSignalMutation(
        auth.current.user.id,
        beforeDelete,
        deleted,
        'soft_delete',
      );
      send(res, 200, { ok: true, event: deleted, ...reeval }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/personal/events/sync-local') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      if (!(await rateLimit(`personal-events-sync:${ip}:${auth.current.user.id}`, 20, 60_000))) {
        send(res, 429, { error: 'Too many sync attempts. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        const items = Array.isArray(body?.events) ? body.events : Array.isArray(body) ? body : [];
        if (!items.length) {
          send(res, 400, { error: 'Provide events array from localStorage.' }, headers);
          return;
        }
        if (items.length > MAX_EVENTS_PER_REQUEST) {
          send(res, 400, { error: `At most ${MAX_EVENTS_PER_REQUEST} events per sync request.` }, headers);
          return;
        }
        const result = await syncLocalEventsForUser(personalEventsStore, auth.current.user.id, items);
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not sync local events.' }, headers);
      }
      return;
    }



    // --- Authenticated pattern candidate engine v1 (Task 5) ---
    if (method === 'POST' && url.pathname === '/api/personal/pattern-candidates/evaluate') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      if (!(await rateLimit(`pattern-eval:${ip}:${auth.current.user.id}`, 10, 60_000))) {
        send(res, 429, { error: 'Too many pattern evaluations. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        // Ignore any client-supplied user_id — ownership is auth only.
        const result = await evaluatePatternCandidates(personalEventsStore, auth.current.user.id, {
          timezone: body?.timezone || url.searchParams.get('timezone') || undefined,
          window_days: body?.window_days ?? url.searchParams.get('window_days') ?? undefined,
          as_of: body?.as_of || url.searchParams.get('as_of') || undefined,
        });
        if (result.error) {
          send(res, result.status || 400, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not evaluate pattern candidates.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/personal/pattern-candidates') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      try {
        const result = await listPatternCandidates(personalEventsStore, auth.current.user.id, {
          status: url.searchParams.get('status') || undefined,
          candidate_type: url.searchParams.get('candidate_type') || undefined,
          since: url.searchParams.get('since') || undefined,
          limit: url.searchParams.get('limit'),
          offset: url.searchParams.get('offset'),
          timezone: url.searchParams.get('timezone') || undefined,
        });
        if (result.error) {
          send(res, result.status || 400, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not list pattern candidates.' }, headers);
      }
      return;
    }

    if (method === 'GET' && /^\/api\/personal\/pattern-candidates\/[^/]+$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const candidateId = safeId(url.pathname.split('/').pop() || '', 120);
      if (!candidateId) {
        send(res, 400, { error: 'Candidate id is required.' }, headers);
        return;
      }
      try {
        const result = await getPatternCandidate(personalEventsStore, auth.current.user.id, candidateId);
        if (result.error) {
          send(res, result.status || 404, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not load pattern candidate.' }, headers);
      }
      return;
    }

    if (method === 'POST' && /^\/api\/personal\/pattern-candidates\/[^/]+\/confirm$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const parts = url.pathname.split('/');
      const candidateId = safeId(parts[parts.length - 2] || '', 120);
      if (!candidateId) {
        send(res, 400, { error: 'Candidate id is required.' }, headers);
        return;
      }
      try {
        const result = await confirmPatternCandidate(personalEventsStore, auth.current.user.id, candidateId);
        if (result.error) {
          send(res, result.status || 404, { error: result.error }, headers);
          return;
        }
        send(res, 200, { ok: true, candidate: result.candidate }, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not confirm pattern candidate.' }, headers);
      }
      return;
    }

    if (method === 'POST' && /^\/api\/personal\/pattern-candidates\/[^/]+\/reject$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const parts = url.pathname.split('/');
      const candidateId = safeId(parts[parts.length - 2] || '', 120);
      if (!candidateId) {
        send(res, 400, { error: 'Candidate id is required.' }, headers);
        return;
      }
      try {
        const result = await rejectPatternCandidate(personalEventsStore, auth.current.user.id, candidateId);
        if (result.error) {
          send(res, result.status || 404, { error: result.error }, headers);
          return;
        }
        send(res, 200, { ok: true, candidate: result.candidate }, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not reject pattern candidate.' }, headers);
      }
      return;
    }

    // --- Authenticated deterministic timeline query layer (Task 4) ---
    if (method === 'GET' && url.pathname === '/api/personal/timeline') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      try {
        // Ignore any client-supplied user_id — ownership is auth only.
        const result = await listTimeline(personalEventsStore, auth.current.user.id, {
          event_type: url.searchParams.get('event_type') || url.searchParams.get('type') || undefined,
          signal_type: url.searchParams.get('signal_type') || undefined,
          since: url.searchParams.get('since') || undefined,
          until: url.searchParams.get('until') || undefined,
          include_candidates: url.searchParams.get('include_candidates'),
          include_negated: url.searchParams.get('include_negated'),
          source_surface: url.searchParams.get('source_surface') || undefined,
          timezone: url.searchParams.get('timezone') || undefined,
          limit: url.searchParams.get('limit'),
          offset: url.searchParams.get('offset'),
        });
        if (result.error) {
          send(res, result.status || 400, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not load timeline.' }, headers);
      }
      return;
    }

    if (method === 'GET' && /^\/api\/personal\/timeline\/signals\/[^/]+$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const signalType = safeText(url.pathname.split('/').pop() || '', 40);
      try {
        const result = await getSignalHistory(personalEventsStore, auth.current.user.id, signalType, {
          subtype: url.searchParams.get('subtype') || url.searchParams.get('normalized_value') || undefined,
          since: url.searchParams.get('since') || undefined,
          until: url.searchParams.get('until') || undefined,
          include_candidates: url.searchParams.get('include_candidates'),
          include_negated: url.searchParams.get('include_negated'),
          timezone: url.searchParams.get('timezone') || undefined,
          repeated_threshold: url.searchParams.get('repeated_threshold'),
        });
        if (result.error) {
          send(res, result.status || 400, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not load signal history.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/personal/timeline/recent-changes') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      try {
        const result = await getRecentChanges(personalEventsStore, auth.current.user.id, {
          signal_type: url.searchParams.get('signal_type') || undefined,
          subtype: url.searchParams.get('subtype') || undefined,
          window_days: url.searchParams.get('window_days'),
          include_candidates: url.searchParams.get('include_candidates'),
          include_negated: url.searchParams.get('include_negated'),
          timezone: url.searchParams.get('timezone') || undefined,
          as_of: url.searchParams.get('as_of') || undefined,
        });
        if (result.error) {
          send(res, result.status || 400, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not load recent changes.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/personal/timeline/co-occurrences') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      try {
        const result = await getCoOccurrences(personalEventsStore, auth.current.user.id, {
          mode: url.searchParams.get('mode') || undefined,
          signal_type_a: url.searchParams.get('signal_type_a') || undefined,
          signal_type_b: url.searchParams.get('signal_type_b') || undefined,
          subtype_a: url.searchParams.get('subtype_a') || undefined,
          subtype_b: url.searchParams.get('subtype_b') || undefined,
          within_hours: url.searchParams.get('within_hours'),
          since: url.searchParams.get('since') || undefined,
          until: url.searchParams.get('until') || undefined,
          include_candidates: url.searchParams.get('include_candidates'),
          include_negated: url.searchParams.get('include_negated'),
          timezone: url.searchParams.get('timezone') || undefined,
          limit: url.searchParams.get('limit'),
        });
        if (result.error) {
          send(res, result.status || 400, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not load co-occurrences.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/personal/timeline/summary') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      try {
        const result = await getTimelineSummaryData(personalEventsStore, auth.current.user.id, {
          since: url.searchParams.get('since') || undefined,
          until: url.searchParams.get('until') || undefined,
          include_candidates: url.searchParams.get('include_candidates'),
          include_negated: url.searchParams.get('include_negated'),
          timezone: url.searchParams.get('timezone') || undefined,
        });
        if (result.error) {
          send(res, result.status || 400, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not load timeline summary.' }, headers);
      }
      return;
    }

    if (method === 'GET' && /^\/api\/personal\/timeline\/observations\/[^/]+$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const observationId = safeId(url.pathname.split('/').pop() || '', 120);
      if (!observationId) {
        send(res, 400, { error: 'Observation id is required.' }, headers);
        return;
      }
      try {
        const result = await getObservationContext(personalEventsStore, auth.current.user.id, observationId, {
          include_candidates: url.searchParams.get('include_candidates'),
          include_negated: url.searchParams.get('include_negated'),
        });
        if (result.error) {
          // Do not reveal whether another user's observation exists.
          send(res, result.status || 404, { error: result.error }, headers);
          return;
        }
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not load observation context.' }, headers);
      }
      return;
    }

    // --- Authenticated observation + structured signal extraction (Task 3) ---
    // Task 8 — authenticated per-user memory consent (dedicated authority).
    if (method === 'GET' && url.pathname === '/api/personal/memory-consent') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      // Ignore body/query user_id, device, IP — owner from session only.
      void url.searchParams.get('user_id');
      const result = await buildMemoryConsentResponse(auth.current.user.id);
      if (result.unavailable) {
        sendMemoryConsentUnavailable(res, headers);
        return;
      }
      send(res, 200, result.body, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/personal/memory-consent/enable') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!memoryConsentStoreAvailable) {
        sendMemoryConsentUnavailable(res, headers);
        return;
      }
      try {
        const body = await readBody(req);
        // Ignore client-selected owner fields.
        void body?.user_id;
        void body?.userId;
        void url.searchParams.get('user_id');
        const sourceSurface =
          typeof body?.source_surface === 'string'
            ? safeText(body.source_surface, 64) || 'memory_settings'
            : 'memory_settings';
        const record = await memoryConsentStore.enable(auth.current.user.id, {
          source_surface: sourceSurface,
          consent_version: MEMORY_CONSENT_VERSION,
        });
        console.info(
          '[memory_consent] enable',
          JSON.stringify({
            status: record?.status || 'enabled',
            consent_version: MEMORY_CONSENT_VERSION,
            source_surface: sourceSurface,
          }),
        );
        send(
          res,
          200,
          toPublicMemoryConsent(record, {
            memoryWriteFeatureEnabled: isLunaLiveMemoryWriteEnabled(),
          }),
          headers,
        );
      } catch (error) {
        if (error && typeof error === 'object' && error.code === MEMORY_CONSENT_STORE_UNAVAILABLE) {
          sendMemoryConsentUnavailable(res, headers);
          return;
        }
        send(res, 503, {
          error: 'Memory consent store unavailable.',
          code: MEMORY_CONSENT_STORE_UNAVAILABLE,
          status: 'consent_unavailable',
          memory_write_available: false,
        }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/personal/memory-consent/disable') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!memoryConsentStoreAvailable) {
        sendMemoryConsentUnavailable(res, headers);
        return;
      }
      try {
        const body = await readBody(req);
        void body?.user_id;
        void body?.userId;
        void url.searchParams.get('user_id');
        const sourceSurface =
          typeof body?.source_surface === 'string'
            ? safeText(body.source_surface, 64) || 'memory_settings'
            : 'memory_settings';
        const record = await memoryConsentStore.disable(auth.current.user.id, {
          source_surface: sourceSurface,
        });
        console.info(
          '[memory_consent] disable',
          JSON.stringify({
            status: record?.status || 'disabled',
            consent_version: MEMORY_CONSENT_VERSION,
            source_surface: sourceSurface,
          }),
        );
        send(
          res,
          200,
          toPublicMemoryConsent(record, {
            memoryWriteFeatureEnabled: isLunaLiveMemoryWriteEnabled(),
          }),
          headers,
        );
      } catch (error) {
        if (error && typeof error === 'object' && error.code === MEMORY_CONSENT_STORE_UNAVAILABLE) {
          sendMemoryConsentUnavailable(res, headers);
          return;
        }
        send(res, 503, {
          error: 'Memory consent store unavailable.',
          code: MEMORY_CONSENT_STORE_UNAVAILABLE,
          status: 'consent_unavailable',
          memory_write_available: false,
        }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/personal/observations') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      if (!(await rateLimit(`personal-observations:${ip}:${auth.current.user.id}`, 30, 60_000))) {
        send(res, 429, { error: 'Too many observation writes. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        // Ignore any client-supplied user_id — ownership is auth only.
        const rawText = typeof body?.raw_text === 'string' ? body.raw_text : typeof body?.text === 'string' ? body.text : '';
        if (!String(rawText || '').trim()) {
          send(res, 400, { error: 'raw_text is required.' }, headers);
          return;
        }
        if (String(rawText).length > MAX_OBSERVATION_TEXT_CHARS) {
          send(res, 400, { error: `raw_text exceeds ${MAX_OBSERVATION_TEXT_CHARS} characters.` }, headers);
          return;
        }
        const extract =
          body?.extract === false || body?.extract === 'false' || body?.run_extraction === false
            ? false
            : true;
        const result = await createObservationWithExtraction({
          store: personalEventsStore,
          userId: auth.current.user.id,
          input: {
            raw_text: rawText,
            observation_kind: body?.observation_kind || body?.kind,
            input_mode: body?.input_mode || body?.mode,
            source_surface: body?.source_surface || body?.surface,
            language: body?.language || body?.lang,
            transcript_status: body?.transcript_status,
            original_event_id: body?.original_event_id,
            session_id: body?.session_id,
            client_event_id: body?.client_event_id || body?.id,
            occurred_at: body?.occurred_at || body?.timestamp,
            source: body?.source || 'api',
          },
          extract,
        });
        if (result.error && !result.observation) {
          send(res, 400, { error: result.error }, headers);
          return;
        }
        send(res, 200, {
          observation: result.observation,
          signals: result.signals,
          extraction: result.extraction,
          created: result.created,
        }, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not create observation.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/personal/observations') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      try {
        const since = safeText(url.searchParams.get('since') || '', 64) || undefined;
        const until = safeText(url.searchParams.get('until') || '', 64) || undefined;
        if (since && Number.isNaN(Date.parse(since))) {
          send(res, 400, { error: 'Invalid since timestamp.' }, headers);
          return;
        }
        if (until && Number.isNaN(Date.parse(until))) {
          send(res, 400, { error: 'Invalid until timestamp.' }, headers);
          return;
        }
        const limitRaw = Number(url.searchParams.get('limit') || DEFAULT_LIST_LIMIT);
        const offsetRaw = Number(url.searchParams.get('offset') || 0);
        const limit = Number.isFinite(limitRaw) ? Math.min(MAX_LIST_LIMIT, Math.max(1, Math.floor(limitRaw))) : DEFAULT_LIST_LIMIT;
        const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0;
        const result = await listObservationsForUser(personalEventsStore, auth.current.user.id, {
          since,
          until,
          limit,
          offset,
          observationKind: safeText(url.searchParams.get('observation_kind') || '', 40) || undefined,
          sourceSurface: safeText(url.searchParams.get('source_surface') || '', 40) || undefined,
        });
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not list observations.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/personal/signals') {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      try {
        const since = safeText(url.searchParams.get('since') || '', 64) || undefined;
        const until = safeText(url.searchParams.get('until') || '', 64) || undefined;
        if (since && Number.isNaN(Date.parse(since))) {
          send(res, 400, { error: 'Invalid since timestamp.' }, headers);
          return;
        }
        if (until && Number.isNaN(Date.parse(until))) {
          send(res, 400, { error: 'Invalid until timestamp.' }, headers);
          return;
        }
        const limitRaw = Number(url.searchParams.get('limit') || DEFAULT_LIST_LIMIT);
        const offsetRaw = Number(url.searchParams.get('offset') || 0);
        const limit = Number.isFinite(limitRaw) ? Math.min(MAX_LIST_LIMIT, Math.max(1, Math.floor(limitRaw))) : DEFAULT_LIST_LIMIT;
        const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0;
        const result = await listSignalsForUser(personalEventsStore, auth.current.user.id, {
          since,
          until,
          limit,
          offset,
          signalType: safeText(url.searchParams.get('signal_type') || '', 40) || undefined,
          userStatus: safeText(url.searchParams.get('user_status') || '', 40) || undefined,
          sourceObservationId: safeId(url.searchParams.get('source_observation_id') || '', 120) || undefined,
        });
        send(res, 200, result, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not list signals.' }, headers);
      }
      return;
    }

    if (method === 'POST' && /^\/api\/personal\/signals\/[^/]+\/confirm$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const parts = url.pathname.split('/');
      const signalId = safeId(parts[parts.length - 2] || '', 120);
      if (!signalId) {
        send(res, 400, { error: 'Signal id is required.' }, headers);
        return;
      }
      const before = await personalEventsStore.getOwned(auth.current.user.id, signalId);
      const result = await confirmSignalForUser(personalEventsStore, auth.current.user.id, signalId);
      if (result.error || !result.signal) {
        send(res, result.error === 'Signal not found.' ? 404 : 400, { error: result.error || 'Signal not found.' }, headers);
        return;
      }
      const reeval = await reevaluateAfterSignalMutation(
        auth.current.user.id,
        before,
        result.signal,
        'confirm',
      );
      send(res, 200, { ok: true, signal: result.signal, ...reeval }, headers);
      return;
    }

    if (method === 'POST' && /^\/api\/personal\/signals\/[^/]+\/reject$/.test(url.pathname)) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const parts = url.pathname.split('/');
      const signalId = safeId(parts[parts.length - 2] || '', 120);
      if (!signalId) {
        send(res, 400, { error: 'Signal id is required.' }, headers);
        return;
      }
      const before = await personalEventsStore.getOwned(auth.current.user.id, signalId);
      const result = await rejectSignalForUser(personalEventsStore, auth.current.user.id, signalId);
      if (result.error || !result.signal) {
        send(res, result.error === 'Signal not found.' ? 404 : 400, { error: result.error || 'Signal not found.' }, headers);
        return;
      }
      const reeval = await reevaluateAfterSignalMutation(
        auth.current.user.id,
        before,
        result.signal,
        'reject',
      );
      send(res, 200, { ok: true, signal: result.signal, ...reeval }, headers);
      return;
    }

    if (
      (method === 'PATCH' || method === 'POST') &&
      /^\/api\/personal\/signals\/[^/]+\/correct$/.test(url.pathname)
    ) {
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!personalEventsStoreAvailable) {
        sendPersonalEventsUnavailable(res, headers);
        return;
      }
      const parts = url.pathname.split('/');
      const signalId = safeId(parts[parts.length - 2] || '', 120);
      if (!signalId) {
        send(res, 400, { error: 'Signal id is required.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        const before = await personalEventsStore.getOwned(auth.current.user.id, signalId);
        const result = await correctSignalForUser(personalEventsStore, auth.current.user.id, signalId, {
          signal_type: body?.signal_type,
          normalized_value: body?.normalized_value,
          display_label: body?.display_label,
          negated: body?.negated,
          uncertain: body?.uncertain,
          severity: body?.severity,
          note: body?.note,
        });
        if (result.error || !result.signal) {
          send(res, result.error === 'Signal not found.' ? 404 : 400, { error: result.error || 'Signal not found.' }, headers);
          return;
        }
        const reeval = await reevaluateAfterSignalMutation(
          auth.current.user.id,
          before,
          result.signal,
          'correct',
        );
        send(res, 200, { ok: true, signal: result.signal, ...reeval }, headers);
      } catch (error) {
        if (error && typeof error === 'object' && error.code === PERSONAL_EVENT_STORE_UNAVAILABLE) {
          sendPersonalEventsUnavailable(res, headers);
          return;
        }
        send(res, 400, { error: 'Could not correct signal.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/labs/extract-image') {
      const auth = await requireSessionAndAi(req, res, headers);
      if (!auth) return;
      if (!(await rateLimit(`labs-scan:${ip}:${auth.current.user.id}`, 20, 60_000))) {
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

    if (method === 'POST' && url.pathname === '/api/labs/extract-pdf') {
      const auth = await requireSessionAndAi(req, res, headers);
      if (!auth) return;
      if (!(await rateLimit(`labs-pdf:${ip}:${auth.current.user.id}`, 12, 60_000))) {
        send(res, 429, { error: 'Too many PDF scan attempts. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        const dataUrl = safeText(body.dataUrl, 15_000_000);
        const mimeType = safeText(body.mimeType, 120) || 'application/pdf';
        const result = await extractLabTextFromPdf({ dataUrl, mimeType });
        send(res, 200, { text: result.text, message: result.message, provider: GEMINI_API_KEY ? 'gemini' : 'fallback' }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not scan PDF.' }, headers);
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
      // Cookie or Bearer + AI consent. Owner derived server-side only.
      const auth = await requireMobileSession(req, res, headers);
      if (!auth) return;
      if (!hasAiProcessingConsent(req)) {
        send(res, 403, { error: 'AI processing consent required. Enable in Privacy settings.' }, headers);
        return;
      }
      if (!(await rateLimit(`voice-respond:${ip}:${auth.current.user.id}`, 30, 60_000))) {
        send(res, 429, { error: 'Too many voice requests. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        // Ignore any client-supplied personal context / user_id as authority.
        const transcript = typeof body?.transcript === 'string' ? body.transcript : typeof body?.text === 'string' ? body.text : '';
        const timezone =
          (body?.context && typeof body.context === 'object' && body.context.timezone) ||
          body?.timezone ||
          undefined;

        let serverPack = null;
        if (personalEventsStoreAvailable) {
          try {
            serverPack = await buildPersonalContextPack({
              store: personalEventsStore,
              userId: auth.current.user.id,
              messageText: transcript,
              timezone,
            });
          } catch {
            serverPack = {
              version: PERSONAL_CONTEXT_VERSION,
              status: 'unavailable',
              reason: 'context_build_failed',
              recent_signals: [],
              timeline_facts: [],
              confirmed_patterns: [],
              relevant_facts: [],
              exclusions_applied: ['context_build_failed'],
              budget: { max_items: 0, max_chars: 0, actual_items: 0, actual_chars: 0, truncated: false },
            };
          }
        } else {
          serverPack = {
            version: PERSONAL_CONTEXT_VERSION,
            status: 'unavailable',
            reason: 'store_unavailable',
            recent_signals: [],
            timeline_facts: [],
            confirmed_patterns: [],
            relevant_facts: [],
            exclusions_applied: ['store_unavailable'],
            budget: { max_items: 0, max_chars: 0, actual_items: 0, actual_chars: 0, truncated: false },
          };
        }

        // Safe operational log only — no health content.
        console.info(
          '[voice] personal_context',
          JSON.stringify({
            status: serverPack?.status || 'none',
            items: Number(serverPack?.budget?.actual_items) || 0,
            truncated: Boolean(serverPack?.budget?.truncated),
            authenticated: true,
          }),
        );

        const result = await handleVoiceConversation({
          ...body,
          __server_personal_context: serverPack,
        });

        // Best-effort selective memory write AFTER reply generation.
        // Two-gate: server feature flag AND authenticated per-user memory consent.
        // In-request with timeout (no fire-and-forget — Vercel may terminate after response).
        // Chat success does not depend on memory write success.
        let memoryMeta = {
          memory_write_status: 'feature_disabled',
          eligible: false,
          gate_reason: null,
          matched_domain_count: 0,
          observation_created: false,
          signal_count: 0,
          extraction_status: null,
        };
        try {
          const clientMessageId =
            typeof body?.client_message_id === 'string'
              ? body.client_message_id
              : typeof body?.clientMessageId === 'string'
                ? body.clientMessageId
                : undefined;
          const inputModeHint =
            body?.input_mode ||
            body?.inputMode ||
            (body?.context && typeof body.context === 'object' && body.context.input_mode) ||
            'text';
          // Client cannot force feature flag or consent.
          void body?.memory_consent;
          void body?.memoryConsent;
          void body?.consent_enabled;
          void body?.LUNA_LIVE_MEMORY_WRITE_ENABLED;
          void body?.luna_live_memory_write_enabled;

          memoryMeta = await attemptLunaLiveMemoryWrite({
            store: personalEventsStoreAvailable ? personalEventsStore : null,
            consentStore: memoryConsentStoreAvailable ? memoryConsentStore : null,
            userId: auth.current.user.id,
            text: transcript,
            mode: typeof body?.mode === 'string' ? body.mode : 'live',
            language: typeof body?.lang === 'string' ? body.lang : 'en',
            inputMode: inputModeHint,
            clientMessageId,
          });
          console.info('[voice] memory_write', JSON.stringify(summarizeMemoryWriteForLogs(memoryMeta)));
        } catch {
          memoryMeta = {
            memory_write_status: 'failed',
            eligible: false,
            gate_reason: 'exception',
            matched_domain_count: 0,
            observation_created: false,
            signal_count: 0,
            extraction_status: null,
          };
          console.info('[voice] memory_write', JSON.stringify(summarizeMemoryWriteForLogs(memoryMeta)));
        }

        send(
          res,
          200,
          {
            ...result,
            memory_write_status: memoryMeta.memory_write_status,
          },
          headers,
        );
      } catch (error) {
        send(res, 500, { error: error instanceof Error ? error.message : 'Voice conversation failed.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/voice/extract') {
      const auth = await requireSessionAndAi(req, res, headers);
      if (!auth) return;
      if (!(await rateLimit(`voice-extract:${ip}:${auth.current.user.id}`, 40, 60_000))) {
        send(res, 429, { error: 'Too many voice extract requests. Try again in a minute.' }, headers);
        return;
      }
      try {
        const body = await readBody(req);
        const result = await extractVoiceStructure(body);
        send(res, 200, result, headers);
      } catch (error) {
        send(res, 500, { error: error instanceof Error ? error.message : 'Voice extract failed.' }, headers);
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
      const current = await getSessionUser(req, users, authPgPool);
      if (!current) {
        send(res, 200, { session: null }, headers);
        return;
      }
      send(res, 200, { session: buildSessionPayload(current.user) }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/signup') {
      if (!(await rateLimit(`signup:${ip}`, 10, 60_000))) {
        send(res, 429, { error: 'Too many signup attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const password = String(body.password || '');
        const name = typeof body.name === 'string' && body.name.trim() ? safeText(body.name, 120) : normalizeName(email);
        const inviteToken = safeText(body.inviteToken || body.invite || '', 120);

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

        // Invite ordering: validate → persist role_override → consume.
        // Never burn a single-use invite before role authority is durable.
        let pendingInviteRole = null;
        if (inviteToken && operationalRecordsMode !== 'unavailable') {
          const peek = await adminStore.validateInvite({ inviteId: inviteToken, email });
          if (peek.ok && peek.invite?.kind === 'admin') {
            const inviteRole =
              peek.invite.role && ROLE_PERMISSIONS[peek.invite.role] ? peek.invite.role : null;
            if (inviteRole) pendingInviteRole = inviteRole;
          }
        }

        const user = {
          id: randomBytes(12).toString('hex'),
          email,
          name,
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
          roleOverride: pendingInviteRole,
          lastProvider: 'password',
          avatarUrl: undefined,
        };
        users = [user, ...users];
        await saveUsers();

        if (pendingInviteRole && inviteToken && operationalRecordsMode !== 'unavailable') {
          try {
            const consumeResult = await adminStore.consumeInvite({ inviteId: inviteToken, email });
            if (!consumeResult.ok) {
              // Lost race / expired between peek and consume — do not leave unearned privilege.
              user.roleOverride = null;
              await saveUsers();
            }
          } catch (consumeError) {
            // Consume failed unexpectedly after role persist — revoke provisional role; invite remains usable.
            user.roleOverride = null;
            try {
              await saveUsers();
            } catch {
              /* best-effort compensation */
            }
            throw consumeError;
          }
          if (operationalRecordsMode === 'json') {
            await adminStore.save();
          }
        }

        const token = createSession(user);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user) }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to sign up.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/signin') {
      if (!(await rateLimit(`signin:${ip}`, 20, 60_000))) {
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
        if (await isDeletionBlockingUser(user.id)) {
          send(res, 403, { error: 'Account deletion in progress.', code: 'ACCOUNT_DELETION_IN_PROGRESS' }, headers);
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
      if (!(await rateLimit(`emergency-reset:${ip}`, 5, 60_000))) {
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
      if (!(await rateLimit(`google:${ip}`, 20, 60_000))) {
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
          if (await isDeletionBlockingUser(user.id)) {
            send(res, 403, { error: 'Account deletion in progress.', code: 'ACCOUNT_DELETION_IN_PROGRESS' }, headers);
            return;
          }
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
      if (token) {
        sessions.delete(token);
        if (authPgPool) {
          await deleteSessionFromPostgres(authPgPool, token);
        } else {
          await saveSessions();
        }
      }
      send(res, 200, { ok: true }, { ...headers, 'Set-Cookie': clearSessionCookie() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/calendar/data') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!requireUserDataStorage(res, headers)) return;
      const key = auth.current.user.id;
      let stored = null;
      if (userDataMode === 'postgres' && userDataPgPool) {
        stored = await getCalendarBundleForUser(userDataPgPool, key);
      } else {
        stored = calendarStore[key];
      }
      const data = sanitizeCalendarBundle(stored) || sanitizeCalendarBundle({
        version: 2,
        journal: {},
        events: [],
        preferences: { browserNotifications: true, emailReminders: false, reminderEmail: auth.sessionPayload.email, sentReminderKeys: [] },
        updatedAt: new Date().toISOString(),
      });
      send(res, 200, { data, updatedAt: data.updatedAt, emailConfigured: isCalendarEmailEnabled() }, headers);
      return;
    }

    if (method === 'PUT' && url.pathname === '/api/calendar/data') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!requireUserDataStorage(res, headers)) return;
      try {
        const body = await readBody(req);
        const incoming = sanitizeCalendarBundle(body.data);
        if (!incoming) {
          send(res, 400, { error: 'Invalid calendar payload.' }, headers);
          return;
        }
        const key = auth.current.user.id;
        let existingRaw = null;
        if (userDataMode === 'postgres' && userDataPgPool) {
          existingRaw = await getCalendarBundleForUser(userDataPgPool, key);
        } else {
          existingRaw = calendarStore[key];
        }
        const existing = sanitizeCalendarBundle(existingRaw);
        const merged = existing ? mergeCalendarBundlesServer(incoming, existing) : incoming;
        if (userDataMode === 'postgres' && userDataPgPool) {
          await upsertCalendarBundleForUser(userDataPgPool, key, merged);
        } else {
          calendarStore[key] = merged;
          await saveCalendarStore();
        }
        send(res, 200, { ok: true, data: merged, updatedAt: merged.updatedAt }, headers);
      } catch (error) {
        if (error?.code === USER_DATA_STORAGE_UNAVAILABLE) {
          send(res, 503, userDataUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Could not save calendar.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/calendar/reminders/dispatch') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!requireUserDataStorage(res, headers)) return;
      const key = auth.current.user.id;
      let stored = null;
      if (userDataMode === 'postgres' && userDataPgPool) {
        stored = await getCalendarBundleForUser(userDataPgPool, key);
      } else {
        stored = calendarStore[key];
      }
      const bundle = sanitizeCalendarBundle(stored);
      if (!bundle) {
        send(res, 200, { fired: 0, skipped: 'empty' }, headers);
        return;
      }
      const result = await dispatchDueEmailReminders({
        bundle,
        userEmail: auth.sessionPayload.email,
        sendEmail: sendCalendarReminderEmail,
      });
      if (result.bundle) {
        const next = sanitizeCalendarBundle(result.bundle);
        if (userDataMode === 'postgres' && userDataPgPool) {
          await upsertCalendarBundleForUser(userDataPgPool, key, next);
        } else {
          calendarStore[key] = next;
          await saveCalendarStore();
        }
      }
      send(
        res,
        200,
        {
          fired: result.fired,
          skipped: result.skipped,
          emailConfigured: isCalendarEmailEnabled(),
        },
        headers,
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/privacy/export') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!requireOperationalRecords(res, headers)) return;

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

      try {
        const requestId = `dsar-exp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await appendPrivacyRequestRecord({
          id: requestId,
          type: 'export',
          status: 'completed',
          requestedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          email: subjectEmail,
          actor: auth.sessionPayload.email,
        });

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
      } catch (error) {
        if (error?.code === OPERATIONAL_RECORDS_UNAVAILABLE) {
          send(res, 503, operationalRecordsUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 500, { error: 'Unable to process export request.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/privacy/correct') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!requireOperationalRecords(res, headers)) return;
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
        await appendPrivacyRequestRecord({
          id: requestId,
          type: 'correct',
          status: 'completed',
          requestedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          email: auth.sessionPayload.email,
          actor: auth.sessionPayload.email,
          fields: Object.keys(patch),
        });

        send(res, 200, { requestId, session: buildSessionPayload(user) }, headers);
      } catch (error) {
        if (error?.code === OPERATIONAL_RECORDS_UNAVAILABLE) {
          send(res, 503, operationalRecordsUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to process correction request.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/privacy/delete') {
      // Cookie (web) or Bearer (mobile). Allow in-progress deletion for idempotent retries.
      const verified = await getVerifiedRequestUser(req);
      if (!verified?.user?.id) {
        send(res, 401, { error: 'Not authenticated.' }, headers);
        return;
      }
      const auth = {
        current: verified,
        sessionPayload: buildSessionPayload(verified.user),
      };
      if (!requireOperationalRecords(res, headers)) return;
      try {
        const body = await readBody(req);
        // Owner identity from authenticated session only — ignore body/query userId/email.
        void body?.userId;
        void body?.email;
        void body?.user_id;
        const scope = safeText(body.scope || 'account', 32);
        const user =
          users.find((item) => item.id === auth.current.user.id) ||
          (authPgPool ? await getUserByIdFromPostgres(authPgPool, auth.current.user.id) : null);
        if (!user) {
          // Already deleted — idempotent success if op completed.
          const latest = await accountDeletionOrchestrator.ops.getLatest(auth.current.user.id);
          if (latest?.status === DELETION_OP_STATUS.COMPLETED) {
            send(
              res,
              200,
              { requestId: latest.id, deleted: true, scope: 'account' },
              { ...headers, 'Set-Cookie': clearSessionCookie() },
            );
            return;
          }
          send(res, 404, { error: 'User not found.' }, headers);
          return;
        }
        const role = resolveRole(user.email, user.roleOverride || null);
        if (role === 'super_admin') {
          send(res, 403, { error: 'Super admin account cannot be deleted from self-service endpoint.' }, headers);
          return;
        }

        const requestId = `dsar-del-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        if (scope === 'support_only') {
          await removeContactsForEmail(user.email);
          await appendPrivacyRequestRecord({
            id: requestId,
            type: 'delete',
            status: 'completed',
            requestedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            email: auth.sessionPayload.email,
            actor: auth.sessionPayload.email,
            scope,
          });
          send(
            res,
            200,
            { requestId, deleted: true, scope },
            { ...headers, 'Set-Cookie': clearSessionCookie() },
          );
          return;
        }

        if (scope !== 'account') {
          send(res, 400, { error: 'Invalid deletion scope.' }, headers);
          return;
        }

        const adminState = adminStore?.getState?.() || null;
        const outcome = await accountDeletionOrchestrator.runAccountDeletion({
          user,
          requestId,
          jsonCascadeContext:
            authIdentityMode === 'postgres'
              ? null
              : {
                  users,
                  sessions,
                  contactSubmissions,
                  privacyRequests,
                  calendarStore,
                  mobileReflections,
                  mobileReports,
                  mobileStateStore,
                  mobilePushStore,
                  personalEventsStore,
                  memoryConsentStore,
                  billingService,
                  adminState,
                },
        });

        if (!outcome?.ok) {
          const status = outcome?.httpStatus || 500;
          send(
            res,
            status,
            {
              error: 'Unable to complete account deletion.',
              deleted: false,
              requestId: outcome?.requestId || requestId,
              code: outcome?.errorCode || ACCOUNT_DELETION_FAILED,
              retryable: outcome?.retryable !== false,
            },
            headers,
          );
          return;
        }

        if (authIdentityMode !== 'postgres') {
          await Promise.all([
            saveUsers(),
            saveSessions(),
            saveContacts(),
            savePrivacyRequests(),
            saveCalendarStore(),
            saveMobileReflections(),
            saveMobileReports(),
            saveMobileStateStore(),
            saveMobilePushStore(),
            adminStore?.save?.() || Promise.resolve(),
          ]);
        }

        // Refresh in-memory mirrors after successful cascade.
        users = users.filter((item) => item.id !== user.id);
        for (const [token, session] of sessions.entries()) {
          if (session.userId === user.id) sessions.delete(token);
        }
        if (operationalRecordsMode === 'postgres' && operationalPgPool) {
          contactSubmissions = await listContactSubmissions(operationalPgPool, { limit: 2000 });
          privacyRequests = await listPrivacyRequests(operationalPgPool, { limit: 2000 });
        }

        send(
          res,
          200,
          { requestId: outcome.requestId || requestId, deleted: true, scope: 'account' },
          { ...headers, 'Set-Cookie': clearSessionCookie() },
        );
      } catch (error) {
        if (error?.code === OPERATIONAL_RECORDS_UNAVAILABLE) {
          send(res, 503, operationalRecordsUnavailablePayload('unavailable'), headers);
          return;
        }
        if (error?.code === ACCOUNT_DELETION_FAILED || error?.code === BILLING_STORAGE_UNAVAILABLE) {
          send(res, 500, { error: 'Unable to complete account deletion.', deleted: false }, headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to process deletion request.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/privacy/consent') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!requireOperationalRecords(res, headers)) return;
      try {
        const body = await readBody(req);
        const rawScopes = body.scopes && typeof body.scopes === 'object' ? body.scopes : {};
        const scopes = {
          analytics: rawScopes.analytics === true,
          ai_processing: rawScopes.ai_processing !== false,
          personalization: rawScopes.personalization !== false,
        };
        const action = safeText(body.action || 'save', 32);
        const source = safeText(body.source || 'privacy_controls', 64);
        const consentVersion = Math.max(1, Number(body.version) || 1);
        const requestId = `consent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await appendPrivacyRequestRecord({
          id: requestId,
          type: 'consent',
          status: 'completed',
          requestedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          email: auth.sessionPayload.email,
          actor: auth.sessionPayload.email,
          action,
          source,
          scopes,
          consentVersion,
        });
        send(res, 200, { requestId, ok: true }, headers);
      } catch (error) {
        if (error?.code === OPERATIONAL_RECORDS_UNAVAILABLE) {
          send(res, 503, operationalRecordsUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to record consent event.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/privacy/requests') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (!requireOperationalRecords(res, headers)) return;
      try {
        if (operationalRecordsMode === 'postgres' && operationalPgPool) {
          privacyRequests = await listPrivacyRequests(operationalPgPool, { limit: 2000 });
        }
        const canManage = hasAnyPermission(auth.sessionPayload, ['manage_admin_roles', 'manage_services']);
        const rows = canManage
          ? privacyRequests
          : privacyRequests.filter(
              (item) => normalizeEmail(item.email) === normalizeEmail(auth.sessionPayload.email),
            );
        send(res, 200, { requests: rows.slice(0, 200) }, headers);
      } catch (error) {
        if (error?.code === OPERATIONAL_RECORDS_UNAVAILABLE) {
          send(res, 503, operationalRecordsUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 500, { error: 'Unable to load privacy requests.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/billing/status') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (billingStorageMode === 'unavailable') {
        send(res, 503, billingStorageUnavailablePayload('database_missing'), headers);
        return;
      }
      try {
        const { billing, trial } = await billingService.getStatusForUser(auth.current.user);
        send(res, 200, { billing, enabled: BILLING_ENABLED, trial: trial || null }, headers);
      } catch (error) {
        if (error?.code === BILLING_STORAGE_UNAVAILABLE) {
          send(res, 503, billingStorageUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 500, { error: 'Unable to load billing status.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/trial/start') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;
      if (billingStorageMode === 'unavailable') {
        send(res, 503, billingStorageUnavailablePayload('database_missing'), headers);
        return;
      }
      try {
        const result = await billingService.startTrial(auth.current.user);
        send(res, 200, { trial: result.trial, alreadyActive: result.alreadyActive }, headers);
      } catch (error) {
        if (error?.code === 'TRIAL_ALREADY_USED') {
          send(res, 403, { error: 'Trial already used for this account.' }, headers);
          return;
        }
        if (error?.code === BILLING_STORAGE_UNAVAILABLE) {
          send(res, 503, billingStorageUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 500, { error: 'Unable to start trial.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/checkout-session') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (billingStorageMode === 'unavailable') {
        send(res, 503, billingStorageUnavailablePayload('database_missing'), headers);
        return;
      }

      const configError = stripeConfigError();
      if (configError) {
        send(res, 503, { error: configError }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const period = safeText(body.period || 'month', 12) === 'year' ? 'year' : 'month';
        const price = period === 'year' ? STRIPE_PRICE_YEARLY_ID : STRIPE_PRICE_MONTHLY_ID;
        // Ensure durable account row exists before checkout (no Stripe customer invent).
        if (billingStorageMode === 'postgres') {
          await billingService.ensureBillingAccount({
            userId: auth.current.user.id,
            email: auth.current.user.email,
          });
        }
        const existingCustomerId = await billingService.getStripeCustomerIdForUser(auth.current.user);
        const checkoutFields = [
          ['mode', 'subscription'],
          ['success_url', STRIPE_SUCCESS_URL],
          ['cancel_url', STRIPE_CANCEL_URL],
          ['client_reference_id', auth.current.user.id],
          ['line_items[0][price]', price],
          ['line_items[0][quantity]', '1'],
          ['metadata[luna_user_id]', auth.current.user.id],
          ['metadata[luna_email]', auth.current.user.email],
          ['metadata[luna_period]', period],
        ];
        if (existingCustomerId) {
          checkoutFields.push(['customer', existingCustomerId]);
        } else {
          checkoutFields.push(['customer_email', auth.current.user.email]);
        }
        const form = stripeFormBody(buildStripeCheckoutFields(checkoutFields));

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
        if (error?.code === BILLING_STORAGE_UNAVAILABLE) {
          send(res, 503, billingStorageUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 500, { error: error instanceof Error ? error.message : 'Unable to create checkout session.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/portal-session') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (billingStorageMode === 'unavailable') {
        send(res, 503, billingStorageUnavailablePayload('database_missing'), headers);
        return;
      }

      const configError = stripeConfigError();
      if (configError) {
        send(res, 503, { error: configError }, headers);
        return;
      }

      try {
        let customerId = await billingService.getStripeCustomerIdForUser(auth.current.user);
        if (!customerId) {
          const lookup = await stripeRequest(
            'GET',
            `https://api.stripe.com/v1/customers?email=${encodeURIComponent(auth.current.user.email)}&limit=1`
          );
          if (!lookup.ok) {
            send(res, 502, { error: 'Could not query Stripe customer.', detail: lookup.data }, headers);
            return;
          }
          customerId = safeText(lookup.data?.data?.[0]?.id, 120);
          if (customerId) {
            await billingService.rememberStripeCustomer({
              userId: auth.current.user.id,
              email: auth.current.user.email,
              stripeCustomerId: customerId,
            });
          }
        }
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
        if (error?.code === BILLING_STORAGE_UNAVAILABLE) {
          send(res, 503, billingStorageUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 500, { error: error instanceof Error ? error.message : 'Unable to create billing portal session.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/webhook') {
      if (billingStorageMode === 'unavailable') {
        send(res, 503, billingStorageUnavailablePayload('database_missing'), headers);
        return;
      }

      // Exact raw body — never JSON.stringify before signature verification.
      const rawBody = await readRawBody(req);
      const sig = req.headers['stripe-signature'];

      if (!verifyStripeSignature(rawBody, sig, STRIPE_WEBHOOK_SECRET)) {
        // Invalid signature: reject; do not create trusted ledger entries.
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

      const outcome = await processStripeWebhookEvent({
        mode: billingStorageMode === 'postgres' ? 'postgres' : 'json',
        pool: billingPgPool,
        billingState,
        saveBillingState,
        event,
        ledger: stripeWebhookLedger,
        rememberStripeCustomer: billingService.rememberStripeCustomer,
        authUserExists: async (userId) => {
          if (authPgPool) {
            const row = await getUserByIdFromPostgres(authPgPool, userId);
            return Boolean(row);
          }
          return users.some((u) => u.id === userId);
        },
      });
      send(res, outcome.httpStatus, outcome.body, headers);
      return;
    }

    const isAdminPath = String(url.pathname || '').startsWith('/api/admin');
    const adminBillingState = isAdminPath
      ? billingStorageMode === 'postgres'
        ? await billingService.buildAdminBillingStateProjection(users)
        : billingStorageMode === 'json'
          ? billingState
          : {}
      : {};

    if (operationalRecordsMode === 'postgres' && operationalPgPool && isAdminPath) {
      contactSubmissions = await listContactSubmissions(operationalPgPool, { limit: 2000 });
    }

    if (
      await handleAdminApi(req, res, {
        method,
        url,
        headers,
        requireSession,
        users,
        saveUsers,
        billingState: adminBillingState,
        contactSubmissions,
        saveContacts,
        markContactReplied,
        operationalRecordsMode,
      })
    ) {
      return;
    }

    if (method === 'POST' && url.pathname === '/api/public/contact') {
      if (!requireOperationalRecords(res, headers)) return;
      if (!(await rateLimit(`contact:${ip}`, 8, 60_000))) {
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

        await appendContactRecord({
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          at: new Date().toISOString(),
          name,
          email,
          subject,
          message,
          ip,
        });
        send(res, 200, { ok: true }, headers);
      } catch (error) {
        if (error?.code === OPERATIONAL_RECORDS_UNAVAILABLE) {
          send(res, 503, operationalRecordsUnavailablePayload('unavailable'), headers);
          return;
        }
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to submit message.' }, headers);
      }
      return;
    }

    send(res, 404, { error: 'Not found.' }, headers);
  };
};

export async function buildApiHandler({ dataDir, environment = 'node' } = {}) {
  configureStoragePaths(dataDir ?? path.join(__dirname, '..', 'data'), environment);
  return start();
}
