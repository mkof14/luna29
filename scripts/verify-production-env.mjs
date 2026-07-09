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
console.log(hasRateLimitStore(vercelEnv) ? 'OK  rate-limit backend configured' : 'MISSING  rate-limit backend (in-memory fallback)');
reportGroup('Stripe (required when STRIPE_BILLING_ENABLED=true)', STRIPE_KEYS, vercelEnv);

let health;
try {
  const response = await fetch(`${baseUrl}/api/health?verbose=1`);
  health = await response.json();
} catch (error) {
  console.error('\nHealth check failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log('\nProduction health:', baseUrl);
console.log(JSON.stringify(health, null, 2));

const warnings = [];
if (health?.config?.billingEnabled && !health?.config?.stripeConfigReady) {
  warnings.push('Billing enabled but Stripe config incomplete.');
}
if (health?.checks?.storage !== 'ok') {
  warnings.push('Storage check failed — set DATABASE_URL (Neon) for durable server state.');
}
if (health?.checks?.durableStorage === 'unavailable' || health?.checks?.database === 'unavailable') {
  warnings.push('Durable storage unavailable — production/preview cannot use JSON or /tmp for critical stores.');
}
if (!vercelEnv.has('DATABASE_URL')) {
  warnings.push('DATABASE_URL not in Vercel — production must fail closed (no JSON/tmp for critical stores).');
}
if (!hasRateLimitStore(vercelEnv)) {
  warnings.push('Upstash/Vercel KV not configured — rate limits fall back to in-memory per instance.');
}
if (health?.checks?.rateLimit === 'memory') {
  warnings.push('Production API still reports in-memory rate limits — redeploy after KV/Upstash is linked.');
}

if (warnings.length) {
  console.log('\nAction items:');
  for (const line of warnings) console.log(`- ${line}`);
}

const missingRequired = REQUIRED_ALWAYS.filter((key) => !vercelEnv.has(key));
const durableOk =
  health?.checks?.durableStorage !== 'unavailable' && health?.checks?.database !== 'unavailable';
if (missingRequired.length || health?.ok !== true || !durableOk) {
  process.exitCode = 1;
} else {
  console.log('\nBaseline production env looks good.');
  if (!health?.config?.billingEnabled) {
    console.log('Billing is intentionally disabled (soft launch). Add Stripe live keys + STRIPE_BILLING_ENABLED=true when ready.');
  }
}
