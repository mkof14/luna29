import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env.local');
const lines = existsSync(envPath) ? readFileSync(envPath, 'utf8').split('\n') : [];
const env = Object.fromEntries(
  lines
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      if (idx === -1) return [line.trim(), ''];
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const GOOGLE_OAUTH_ORIGINS = [
  'https://www.luna29.com',
  'https://luna29.com',
  'https://luna29.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

  ['SUPER_ADMIN_BOOTSTRAP_PASSWORD', env.SUPER_ADMIN_BOOTSTRAP_PASSWORD, 'Email login for dnainform@gmail.com'],
  ['VITE_GOOGLE_CLIENT_ID', env.VITE_GOOGLE_CLIENT_ID, 'Google button in browser'],
  ['AUTH_GOOGLE_CLIENT_IDS', env.AUTH_GOOGLE_CLIENT_IDS || env.VITE_GOOGLE_CLIENT_ID, 'Google token verification on server'],
];

console.log('Luna29 auth setup check\n');
for (const [key, value, purpose] of checks) {
  const ok = Boolean(value && value.length > 0);
  console.log(`${ok ? 'OK' : 'MISSING'}  ${key} — ${purpose}`);
}

if (!env.VITE_GOOGLE_CLIENT_ID) {
  console.log('\nGoogle OAuth setup:');
  console.log('1. https://console.cloud.google.com/apis/credentials');
  console.log('2. Edit your Web OAuth client → Authorized JavaScript origins');
  console.log('3. Add every origin you use (exact match, no trailing slash):');
  for (const origin of GOOGLE_OAUTH_ORIGINS) {
    console.log(`   ${origin}`);
  }
  console.log('4. Add to .env.local:');
  console.log('   VITE_GOOGLE_CLIENT_ID=....apps.googleusercontent.com');
  console.log('   AUTH_GOOGLE_CLIENT_IDS=....apps.googleusercontent.com');
  console.log('5. Restart: npm run dev:full');
} else {
  console.log('\nRegister these JavaScript origins in Google Cloud Console:');
  for (const origin of GOOGLE_OAUTH_ORIGINS) {
    console.log(`   ${origin}`);
  }
}

if (!env.SUPER_ADMIN_BOOTSTRAP_PASSWORD) {
  console.log('\nEmail login: set SUPER_ADMIN_BOOTSTRAP_PASSWORD=YourPassword8+ in .env.local');
}
