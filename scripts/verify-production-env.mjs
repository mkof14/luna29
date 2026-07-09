#!/usr/bin/env node

/**
 * Production env verifier — never prints secret values.
 * Public /api/health = liveness. Readiness requires HEALTH_VERBOSE_SECRET.
 */

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
  'HEALTH_VERBOSE_SECRET',
];

const RECOMMENDED = [
  'GEMINI_API_KEY',
  'ELEVENLABS_API_KEY',
  'RESEND_API_KEY',
  'CALENDAR_REMINDER_FROM',
  'VITE_SENTRY_DSN',
  'VITE_GA4_MEASUREMENT_ID',
  'PRIMARY_SUPER_ADMIN_EMAIL',
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

/** Never print secret values — presence only. */
const assertNoSecretLeak = (text) => {
  const blocked = [
    /sk_live_[A-Za-z0-9]+/i,
    /sk_test_[A-Za-z0-9]+/i,
    /whsec_[A-Za-z0-9]+/i,
    /postgresql:\/\/[^\s"']+/i,
    /Bearer\s+[A-Za-z0-9._-]+/i,
  ];
  for (const re of blocked) {
    if (re.test(text)) {
      console.error('Verifier refused to continue: output matched a secret-like pattern.');
      process.exit(1);
    }
  }
};

const vercelEnv = listVercelEnv();
reportGroup('Required (production)', REQUIRED_ALWAYS, vercelEnv);
reportGroup('Recommended (AI, email, analytics)', RECOMMENDED, vercelEnv);
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

let liveness;
try {
  const response = await fetch(`${baseUrl}/api/health`);
  liveness = await response.json();
} catch (error) {
  console.error('\nLiveness check failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log('\nProduction liveness (public):', baseUrl);
const livenessSafe = JSON.stringify(liveness, null, 2);
assertNoSecretLeak(livenessSafe);
console.log(livenessSafe);

const warnings = [];
const hardFails = [];

if (Object.prototype.hasOwnProperty.call(liveness || {}, 'config')) {
  hardFails.push('Public /api/health must not expose verbose config.');
}
if (Object.prototype.hasOwnProperty.call(liveness?.checks || {}, 'aiScan')) {
  hardFails.push('Public /api/health must not expose aiScan provider details.');
}
if (Object.prototype.hasOwnProperty.call(liveness?.checks || {}, 'googleAuth')) {
  hardFails.push('Public /api/health must not expose googleAuth provider details.');
}
if (Object.prototype.hasOwnProperty.call(liveness?.checks || {}, 'gemini')) {
  hardFails.push('Public /api/health must not expose gemini config.');
}
if (Object.prototype.hasOwnProperty.call(liveness?.checks || {}, 'elevenLabs')) {
  hardFails.push('Public /api/health must not expose elevenLabs config.');
}
if (liveness?.ok !== true || liveness?.status !== 'alive') {
  hardFails.push('Public liveness must return { ok: true, status: "alive" }.');
}

// Readiness requires secret — never log the secret value.
const healthSecret = String(process.env.HEALTH_VERBOSE_SECRET || '').trim();
let readiness = null;
if (!vercelEnv.has('HEALTH_VERBOSE_SECRET') && !healthSecret) {
  hardFails.push('HEALTH_VERBOSE_SECRET must be configured in Vercel production.');
} else if (!healthSecret) {
  warnings.push(
    'HEALTH_VERBOSE_SECRET is in Vercel but not in local env — skipping live readiness probe. Export it locally to verify readiness.',
  );
} else {
  try {
    const response = await fetch(`${baseUrl}/api/health?verbose=1`, {
      headers: { 'x-luna-health-secret': healthSecret },
    });
    readiness = await response.json();
    if (response.status === 401) {
      hardFails.push('Verbose health unauthorized — HEALTH_VERBOSE_SECRET mismatch.');
    }
  } catch (error) {
    hardFails.push(
      `Readiness check failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (readiness) {
  console.log('\nProduction readiness (protected): ok=', readiness.ok);
  // Print check keys/values only — never env dumps.
  const checks = readiness.checks || {};
  for (const [key, value] of Object.entries(checks)) {
    console.log(`  ${key}: ${value}`);
  }
  assertNoSecretLeak(JSON.stringify(checks));

  if (readiness?.checks?.storage !== 'ok') {
    hardFails.push('Storage check failed — set DATABASE_URL (Neon) for durable server state.');
  }
  if (readiness?.checks?.durableStorage === 'unavailable' || readiness?.checks?.database === 'unavailable') {
    hardFails.push('Durable storage unavailable — production/preview cannot use JSON or /tmp.');
  }
  if (
    readiness?.checks?.billingStorage === 'unavailable' ||
    readiness?.checks?.trialStorage === 'unavailable' ||
    readiness?.checks?.billingStorage === 'json_dev' ||
    readiness?.checks?.trialStorage === 'json_dev'
  ) {
    hardFails.push('Billing/trial storage must be postgres in production.');
  }
  if (readiness?.checks?.operationalRecordsStorage === 'unavailable') {
    hardFails.push('Operational records storage must be postgres in production.');
  }
  if (readiness?.checks?.userDataStorage === 'unavailable') {
    hardFails.push('User data storage must be postgres in production.');
  }
  if (readiness?.checks?.personalEventsStorage === 'unavailable' || readiness?.checks?.personalEventsStorage === 'file_dev') {
    hardFails.push('Personal events must use postgres in production (not file).');
  }
  if (readiness?.checks?.memoryConsentStorage === 'unavailable' || readiness?.checks?.memoryConsentStorage === 'file_dev') {
    hardFails.push('Memory consent must use postgres in production.');
  }
  if (readiness?.checks?.rateLimit !== 'upstash') {
    hardFails.push('Durable rate limiter (Upstash/KV) required — memory fallback forbidden in production.');
  }
  if (readiness?.checks?.accountDeletionOps === 'unavailable') {
    hardFails.push('account_deletion_ops storage must be reachable.');
  }
  if (readiness?.ok !== true) {
    hardFails.push('Readiness ok=false.');
  }
}

let authConfig = null;
try {
  const response = await fetch(`${baseUrl}/api/auth/config`);
  authConfig = await response.json();
} catch {
  authConfig = null;
}

if (!vercelEnv.has('DATABASE_URL')) {
  hardFails.push('DATABASE_URL not in Vercel.');
}
if (!hasRateLimitStore(vercelEnv)) {
  hardFails.push('Durable rate limiter (Upstash/KV) required in Vercel env.');
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

const billingEnabled =
  String(process.env.STRIPE_BILLING_ENABLED || '').toLowerCase() === 'true' ||
  readiness?.checks?.billing === 'ready' ||
  readiness?.checks?.billing === 'misconfigured';

if (billingEnabled) {
  const missingStripe = STRIPE_KEYS.filter((key) => key !== 'STRIPE_BILLING_ENABLED' && !vercelEnv.has(key));
  if (missingStripe.length) {
    hardFails.push(`Stripe billing enabled but missing: ${missingStripe.join(', ')}`);
  }
  if (readiness && readiness?.checks?.stripeWebhookLedger !== 'postgres') {
    hardFails.push(
      `Stripe webhook ledger must be postgres when billing enabled (got ${readiness?.checks?.stripeWebhookLedger}).`,
    );
  }
  if (readiness?.checks?.billing === 'misconfigured') {
    hardFails.push('Billing enabled but Stripe config incomplete (health.checks.billing=misconfigured).');
  }
}

// AI keys recommended when voice/labs used commercially
if (!vercelEnv.has('GEMINI_API_KEY')) {
  warnings.push('GEMINI_API_KEY missing — Luna Live / labs AI will degrade.');
}
if (!vercelEnv.has('ELEVENLABS_API_KEY')) {
  warnings.push('ELEVENLABS_API_KEY missing — voice TTS will use browser fallback.');
}

if (warnings.length) {
  console.log('\nAction items (warnings):');
  for (const line of warnings) console.log(`- ${line}`);
}

const missingRequired = REQUIRED_ALWAYS.filter((key) => !vercelEnv.has(key));

if (missingRequired.length || hardFails.length) {
  process.exitCode = 1;
  console.error('\nProduction verification FAILED:');
  for (const line of hardFails) console.error(`- ${line}`);
  if (missingRequired.length) {
    console.error(`- Missing required env keys: ${missingRequired.join(', ')}`);
  }
} else {
  console.log('\nBaseline production env looks good.');
  console.log(
    'Liveness alive · Readiness checked when secret available · Rate limit: upstash expected · No secrets printed',
  );
  if (readiness?.checks?.billing === 'disabled') {
    console.log(
      'Billing is intentionally disabled (soft launch). Add Stripe live keys + STRIPE_BILLING_ENABLED=true when ready.',
    );
  }
}
