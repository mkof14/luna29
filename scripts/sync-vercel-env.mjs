import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(process.cwd());
const envPath = resolve(root, '.env.local');
const vercelBin = resolve(root, 'node_modules/.bin/vercel');

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
      })
  );
};

const local = parseEnv(envPath);
const targets = ['production'];

const vars = {
  VITE_GOOGLE_CLIENT_ID: local.VITE_GOOGLE_CLIENT_ID,
  AUTH_GOOGLE_CLIENT_IDS: local.AUTH_GOOGLE_CLIENT_IDS,
  SUPER_ADMIN_EMAILS: local.SUPER_ADMIN_EMAILS || 'dnainform@gmail.com',
  SUPER_ADMIN_BOOTSTRAP_PASSWORD: local.SUPER_ADMIN_BOOTSTRAP_PASSWORD,
  AUTH_ALLOWED_ORIGINS: 'https://www.luna29.com,https://luna29.com,https://luna29.vercel.app,http://localhost:3000,http://127.0.0.1:3000',
  AUTH_ALLOW_UNVERIFIED_GOOGLE: 'false',
  GEMINI_API_KEY: local.GEMINI_API_KEY,
  ELEVENLABS_API_KEY: local.ELEVENLABS_API_KEY,
  ELEVENLABS_MODEL_ID: local.ELEVENLABS_MODEL_ID,
  ELEVENLABS_VOICE_ID: local.ELEVENLABS_VOICE_ID,
  ELEVENLABS_VOICE_LUNA: local.ELEVENLABS_VOICE_LUNA,
  ELEVENLABS_VOICE_LUNA_SOFT: local.ELEVENLABS_VOICE_LUNA_SOFT,
  ELEVENLABS_VOICE_LUNA_CLEAR: local.ELEVENLABS_VOICE_LUNA_CLEAR,
  VITE_SITE_URL: 'https://www.luna29.com',
};

const runVercel = (args, input) =>
  spawnSync(vercelBin, args, {
    cwd: root,
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

const upsert = (key, value, target) => {
  if (!value) {
    console.log(`skip ${key}: empty`);
    return;
  }
  let result = runVercel(['env', 'update', key, target, '--yes'], value);
  if (result.status !== 0) {
    result = runVercel(['env', 'add', key, target, '--force', '--yes'], value);
  }
  if (result.status !== 0) {
    console.error(`failed ${key}:`, result.stderr?.trim() || result.stdout?.trim());
    process.exitCode = 1;
    return;
  }
  console.log(`ok ${key}`);
};

for (const [key, value] of Object.entries(vars)) {
  for (const target of targets) {
    upsert(key, value, target);
  }
}
