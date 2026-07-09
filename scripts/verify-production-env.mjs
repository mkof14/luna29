#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const vercelBin = resolve(root, 'node_modules/.bin/vercel');
const baseUrl = (process.env.SMOKE_BASE_URL || 'https://www.luna29.com').replace(/\/+$/, '');

const REQUIRED_ALWAYS = [
  'SUPER_ADMIN_EMAILS',
  'SUPER_ADMIN_BOOTSTRAP_PASSWORD',
  'AUTH_ALLOWED_ORIGINS',
  'AUTH_ALLOW_UNVERIFIED_GOOGLE',
  'VITE_SITE_URL',
  'VITE_GOOGLE_CLIENT_ID',
  'AUTH_GOOGLE_CLIENT_IDS',
  'DATABASE_URL',
];

const RECOMMENDED = [
  'GEMINI_API_KEY',
  'RESEND_API_KEY',
  'CALENDAR_REMINDER_FROM',
  'VITE_SENTRY_DSN',
  'VITE_GA4_MEASUREMENT_ID',
  'PRIMARY_SUPER_ADMIN_EMAIL',
  'HEALTH_VERBOSE_SECRET',
];

const RATE_LIMIT_KEYS = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
];

const hasRateLimitStore = (present) =>
  (present.has('UPSTASH_REDIS_REST_URL') && present.has('UPSTASH_REDIS_REST_TOKEN')) ||
  (present.has('KV_REST_API_URL') && present.has('KV_REST_API_TOKEN'));

const STRIPE_KEYS = [
  'STRIPE_BILLING_ENABLED',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_MONTHLY_ID',
  'STRIPE_PRICE_YEARLY_ID',
  'STRIPE_SUCCESS_URL',
  'STRIPE_CANCEL_URL',
  'STRIPE_PORTAL_RETURN_URL',
  'STRIPE_TRIAL_DAYS',
];

const runVercel = (args) =>
  spawnSync(vercelBin, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

const listVercelEnv = () => {
  const result = runVercel(['env', 'ls', 'production']);
  if (result.status !== 0) {
    console.error('Could not list Vercel env:', result.stderr?.trim() || result.stdout?.trim());
    process.exit(1);
  }
  const names = new Set();
  for (const line of result.stdout.split('\n')) {
    const match = line.trim().match(/^([A-Z0-9_]+)\s+/);
    if (match) names.add(match[1]);
  }
  return names;
};

const reportGroup = (title, keys, present) => {
  console.log(`\n${title}`);
  for (const key of keys) {
    console.log(`${present.has(key) ? 'OK' : 'MISSING'}  ${key}`);
  }
};

const vercelEnv = listVercelEnv();
reportGroup('Required (production)', REQUIRED_ALWAYS, vercelEnv);
reportGroup('Recommended (persistence, analytics, monitoring)', RECOMMENDED, vercelEnv);
console.log('\nRate limits (Upstash or Vercel KV)');
for (const key of RATE_LIMIT_KEYS) {
  console.log(`${vercelEnv.has(key) ? 'OK' : 'MISSING'}  ${key}`);
}
console.log(
  hasRateLimitStore(vercelEnv)
    ? 'OK  rate-limit backend configured'
    : 'MISSING  rate-limit backend (required in production)',
);
reportGroup('Stripe (required when STRIPE_BILLING_ENABLED=true)', STRIPE_KEYS, vercelEnv);

let health;
try {
  const response = await fetch(`${baseUrl}/api/health`);
  health = await response.json();
} catch (error) {
  console.error('\nHealth check failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log('\nProduction health (public):', baseUrl);
console.log(JSON.stringify(health, null, 2));

let authConfig = null;
try {
  const response = await fetch(`${baseUrl}/api/auth/config`);
  authConfig = await response.json();
} catch {
  authConfig = null;
}

const warnings = [];
const hardFails = [];

if (Object.prototype.hasOwnProperty.call(health || {}, 'config')) {
  hardFails.push('Public /api/health must not expose verbose config without secret protection.');
}
if (Object.prototype.hasOwnProperty.call(health?.checks || {}, 'aiScan')) {
  hardFails.push('Public /api/health must not expose aiScan provider details.');
}
if (Object.prototype.hasOwnProperty.call(health?.checks || {}, 'googleAuth')) {
  hardFails.push('Public /api/health must not expose googleAuth provider details.');
}

if (health?.checks?.storage !== 'ok') {
  hardFails.push('Storage check failed — set DATABASE_URL (Neon) for durable server state.');
}
if (health?.checks?.durableStorage === 'unavailable' || health?.checks?.database === 'unavailable') {
  hardFails.push('Durable storage unavailable — production/preview cannot use JSON or /tmp.');
}
if (
  health?.checks?.billingStorage === 'unavailable' ||
  health?.checks?.trialStorage === 'unavailable' ||
  health?.checks?.billingStorage === 'json_dev' ||
  health?.checks?.trialStorage === 'json_dev'
) {
  hardFails.push('Billing/trial storage must be postgres in production.');
}
if (health?.checks?.operationalRecordsStorage === 'unavailable') {
  hardFails.push('Operational records storage must be postgres in production.');
}
if (health?.checks?.userDataStorage === 'unavailable') {
  hardFails.push('User data storage must be postgres in production.');
}
if (!vercelEnv.has('DATABASE_URL')) {
  hardFails.push('DATABASE_URL not in Vercel.');
}
if (!hasRateLimitStore(vercelEnv) || health?.checks?.rateLimit !== 'upstash') {
  hardFails.push('Durable rate limiter (Upstash/KV) required — memory fallback forbidden in production.');
}
if (authConfig?.googleUnverifiedAllowed === true) {
  hardFails.push('Live /api/auth/config reports googleUnverifiedAllowed=true.');
}
if (vercelEnv.has('ADMIN_EMERGENCY_RESET_KEY')) {
  warnings.push('ADMIN_EMERGENCY_RESET_KEY is set — ensure intentional and rotated.');
}
if (vercelEnv.has('PERSONAL_EVENTS_STORAGE')) {
  warnings.push('PERSONAL_EVENTS_STORAGE is set — must not be file in production.');
}

if (warnings.length) {
  console.log('\nAction items (warnings):');
  for (const line of warnings) console.log(`- ${line}`);
}

const missingRequired = REQUIRED_ALWAYS.filter((key) => !vercelEnv.has(key));
const durableOk =
  health?.checks?.durableStorage !== 'unavailable' && health?.checks?.database !== 'unavailable';
const billingStorageOk = health?.checks?.billingStorage === 'postgres';
const trialStorageOk = health?.checks?.trialStorage === 'postgres';
const webhookLedgerOk = health?.checks?.stripeWebhookLedger === 'postgres';
const operationalRecordsOk = health?.checks?.operationalRecordsStorage === 'ok';
const userDataOk = health?.checks?.userDataStorage === 'ok';
const billingEnabled =
  String(process.env.STRIPE_BILLING_ENABLED || '').toLowerCase() === 'true' ||
  health?.checks?.billing === 'ready' ||
  health?.checks?.billing === 'misconfigured';

if (billingEnabled) {
  const missingStripe = STRIPE_KEYS.filter((key) => key !== 'STRIPE_BILLING_ENABLED' && !vercelEnv.has(key));
  if (missingStripe.length) {
    hardFails.push(`Stripe billing enabled but missing: ${missingStripe.join(', ')}`);
  }
  if (!webhookLedgerOk) {
    hardFails.push(
      `Stripe webhook ledger must be postgres when billing enabled (got ${health?.checks?.stripeWebhookLedger}).`,
    );
  }
  if (health?.checks?.billing === 'misconfigured') {
    hardFails.push('Billing enabled but Stripe config incomplete (health.checks.billing=misconfigured).');
  }
}

if (
  missingRequired.length ||
  health?.ok !== true ||
  !durableOk ||
  !billingStorageOk ||
  !trialStorageOk ||
  !webhookLedgerOk ||
  !operationalRecordsOk ||
  !userDataOk ||
  hardFails.length
) {
  process.exitCode = 1;
  console.error('\nProduction verification FAILED:');
  for (const line of hardFails) console.error(`- ${line}`);
  if (missingRequired.length) {
    console.error(`- Missing required env keys: ${missingRequired.join(', ')}`);
  }
} else {
  console.log('\nBaseline production env looks good.');
  console.log(
    'Billing storage: postgres · Trial storage: postgres · Webhook ledger: postgres · Operational records: ok · User data: ok · Rate limit: upstash',
  );
  if (health?.checks?.billing === 'disabled') {
    console.log(
      'Billing is intentionally disabled (soft launch). Add Stripe live keys + STRIPE_BILLING_ENABLED=true when ready.',
    );
  }
}
