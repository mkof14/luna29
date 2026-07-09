#!/usr/bin/env node

const baseUrl = (process.env.SMOKE_BASE_URL || process.argv[2] || '').trim().replace(/\/+$/, '');

if (!baseUrl) {
  console.error('Missing base URL. Set SMOKE_BASE_URL or pass URL as first argument.');
  process.exit(1);
}

const healthSecret = String(process.env.HEALTH_VERBOSE_SECRET || '').trim();

const checks = [
  { name: 'Public Home', path: '/', type: 'html' },
  { name: 'Rhythm Calendar', path: '/rhythm-calendar', type: 'html' },
  { name: 'Pricing', path: '/pricing', type: 'html' },
  { name: 'How It Works', path: '/how-it-works', type: 'html' },
  { name: 'About', path: '/about', type: 'html' },
  { name: 'Session API', path: '/api/auth/session', type: 'json-session' },
  { name: 'Health API', path: '/api/health', type: 'json-health' },
  ...(healthSecret
    ? [{ name: 'Health readiness', path: '/api/health?verbose=1', type: 'json-health-verbose' }]
    : []),
];

const failures = [];

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const init =
      check.type === 'json-health-verbose' && healthSecret
        ? { redirect: 'follow', headers: { 'x-luna-health-secret': healthSecret } }
        : { redirect: 'follow' };
    const response = await fetch(url, init);
    if (!response.ok) {
      failures.push(`${check.name}: HTTP ${response.status} for ${url}`);
      continue;
    }

    if (check.type === 'html') {
      const body = await response.text();
      const looksLikeHtml = /<!doctype html|<html/i.test(body);
      const hasLunaHint = /luna/i.test(body);
      if (!looksLikeHtml && !hasLunaHint) {
        failures.push(`${check.name}: Response is not recognized as app HTML for ${url}`);
      }
      continue;
    }

    const body = await response.json();
    if (check.type === 'json-session') {
      if (!Object.prototype.hasOwnProperty.call(body, 'session')) {
        failures.push(`${check.name}: Missing 'session' key in ${url}`);
      }
      continue;
    }

    if (check.type === 'json-health') {
      if (body?.ok !== true || body?.status !== 'alive') {
        failures.push(`${check.name}: Expected { ok: true, status: "alive" } in ${url}`);
      }
      if (body?.config || body?.checks?.gemini || body?.checks?.database) {
        failures.push(`${check.name}: Public liveness must not expose readiness topology`);
      }
      continue;
    }

    if (check.type === 'json-health-verbose') {
      if (body?.ok !== true) {
        failures.push(`${check.name}: Expected { ok: true } in ${url}`);
      } else if (body?.checks?.database !== 'postgres') {
        failures.push(`${check.name}: Expected database=postgres in ${url}`);
      } else if (body?.checks?.rateLimit !== 'upstash') {
        failures.push(`${check.name}: Expected rateLimit=upstash in ${url}`);
      }
    }
  } catch (error) {
    failures.push(`${check.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (!healthSecret) {
  console.warn(
    'Note: HEALTH_VERBOSE_SECRET not set locally — skipped protected readiness smoke. Public liveness still checked.',
  );
}

if (failures.length > 0) {
  console.error('Post-deploy smoke failed:');
  for (const line of failures) {
    console.error(`- ${line}`);
  }
  process.exit(1);
}

console.log(`Post-deploy smoke passed for ${baseUrl}`);

