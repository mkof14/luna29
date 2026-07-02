import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(process.cwd());
const envPath = resolve(root, '.env.local');
const vercelBin = resolve(root, 'node_modules/.bin/vercel');

const PRODUCTION_SITE = 'https://www.luna29.com';

const parseEnv = (filePath) => {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .map((line) => {
        const idx = line.indexOf('=');
        if (idx === -1) return [line.trim(), ''];
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return [key, value];
      }),
  );
};

const gitRelease = () => {
  const result = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : 'main';
};

const local = parseEnv(envPath);
const release = gitRelease();

const vars = {
  // Frontend
  VITE_ENABLE_AI: local.VITE_ENABLE_AI || 'false',
  VITE_SITE_URL: PRODUCTION_SITE,
  VITE_SENTRY_DSN: local.VITE_SENTRY_DSN,
  VITE_SENTRY_ENV: 'production',
  VITE_APP_RELEASE: local.VITE_APP_RELEASE || (() => {
    try {
      const manifest = JSON.parse(readFileSync(resolve(root, 'release/version.json'), 'utf8'));
      return manifest.release || release;
    } catch {
      return release;
    }
  })(),
  VITE_GA4_MEASUREMENT_ID: local.VITE_GA4_MEASUREMENT_ID,
  VITE_GOOGLE_CLIENT_ID: local.VITE_GOOGLE_CLIENT_ID,
  VITE_APP_STORE_URL: local.VITE_APP_STORE_URL,
  VITE_GOOGLE_PLAY_URL: local.VITE_GOOGLE_PLAY_URL,

  // Auth / admin
  SUPER_ADMIN_EMAILS: local.SUPER_ADMIN_EMAILS || 'dnainform@gmail.com',
  SUPER_ADMIN_BOOTSTRAP_PASSWORD: local.SUPER_ADMIN_BOOTSTRAP_PASSWORD,
  AUTH_ALLOWED_ORIGINS:
    'https://www.luna29.com,https://luna29.com,https://luna29.vercel.app,http://localhost:3000,http://127.0.0.1:3000',
  AUTH_GOOGLE_CLIENT_IDS: local.AUTH_GOOGLE_CLIENT_IDS || local.VITE_GOOGLE_CLIENT_ID,
  AUTH_ALLOW_UNVERIFIED_GOOGLE: 'false',

  // AI (server-side)
  GEMINI_API_KEY: local.GEMINI_API_KEY,
  ELEVENLABS_API_KEY: local.ELEVENLABS_API_KEY,
  ELEVENLABS_MODEL_ID: local.ELEVENLABS_MODEL_ID,
  ELEVENLABS_VOICE_ID: local.ELEVENLABS_VOICE_ID,
  ELEVENLABS_VOICE_LUNA: local.ELEVENLABS_VOICE_LUNA,
  ELEVENLABS_VOICE_LUNA_SOFT: local.ELEVENLABS_VOICE_LUNA_SOFT,
  ELEVENLABS_VOICE_LUNA_CLEAR: local.ELEVENLABS_VOICE_LUNA_CLEAR,
  SENTRY_DSN: local.SENTRY_DSN,

  // Persistence + rate limits (optional but recommended for production)
  DATABASE_URL: local.DATABASE_URL,
  UPSTASH_REDIS_REST_URL: local.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: local.UPSTASH_REDIS_REST_TOKEN,

  // Calendar reminder emails (Resend)
  RESEND_API_KEY: local.RESEND_API_KEY,
  CALENDAR_REMINDER_FROM: local.CALENDAR_REMINDER_FROM || 'Luna29 <reminders@luna29.com>',

  // Stripe — keep billing off until live keys are ready
  STRIPE_BILLING_ENABLED: local.STRIPE_BILLING_ENABLED || 'false',
  STRIPE_SECRET_KEY: local.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: local.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_MONTHLY_ID: local.STRIPE_PRICE_MONTHLY_ID,
  STRIPE_PRICE_YEARLY_ID: local.STRIPE_PRICE_YEARLY_ID,
  STRIPE_SUCCESS_URL: local.STRIPE_SUCCESS_URL || `${PRODUCTION_SITE}/member?billing=success`,
  STRIPE_CANCEL_URL: local.STRIPE_CANCEL_URL || `${PRODUCTION_SITE}/pricing?billing=canceled`,
  STRIPE_PORTAL_RETURN_URL: local.STRIPE_PORTAL_RETURN_URL || `${PRODUCTION_SITE}/profile`,
  STRIPE_TRIAL_DAYS: local.STRIPE_TRIAL_DAYS || '7',
};

const runVercel = (args, input) =>
  spawnSync(vercelBin, args, {
    cwd: root,
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

const upsert = (key, value, target) => {
  if (value === undefined || value === null || value === '') {
    console.log(`skip ${key}: empty`);
    return 'skipped';
  }
  let result = runVercel(['env', 'update', key, target, '--yes'], value);
  if (result.status !== 0) {
    result = runVercel(['env', 'add', key, target, '--force', '--yes'], value);
  }
  if (result.status !== 0) {
    console.error(`failed ${key}:`, result.stderr?.trim() || result.stdout?.trim());
    process.exitCode = 1;
    return 'failed';
  }
  console.log(`ok ${key}`);
  return 'ok';
};

const targets = ['production'];
const summary = { ok: 0, skipped: 0, failed: 0 };

for (const [key, value] of Object.entries(vars)) {
  for (const target of targets) {
    const status = upsert(key, value, target);
    summary[status] += 1;
  }
}

console.log(`\nSync summary: ok=${summary.ok} skipped=${summary.skipped} failed=${summary.failed}`);

if (summary.skipped > 0) {
  console.log('\nOptional secrets still missing locally (.env.local):');
  for (const [key, value] of Object.entries(vars)) {
    if (!value) console.log(`  - ${key}`);
  }
  console.log('\nWhen ready: add secrets to .env.local and re-run `npm run vercel:env`.');
  console.log('Stripe webhook URL:', `${PRODUCTION_SITE}/api/billing/webhook`);
}
