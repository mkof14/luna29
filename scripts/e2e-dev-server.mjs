#!/usr/bin/env node
/**
 * Isolated E2E full-stack launcher.
 * Forces empty DATABASE_URL so .env.local production Neon is never used.
 * Stripe billing stays disabled. Uses dedicated JSON data dir under .tmp-e2e/.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, '.tmp-e2e', 'api-data');
const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 3010);
const apiPort = Number(process.env.E2E_API_PORT || 8790);

rmSync(dataDir, { recursive: true, force: true });
mkdirSync(dataDir, { recursive: true });

const safeEnv = {
  ...process.env,
  // Critical: override any production DATABASE_URL from the parent shell / .env.local
  DATABASE_URL: '',
  STRIPE_BILLING_ENABLED: 'false',
  AUTH_ALLOWED_ORIGINS: `http://127.0.0.1:${frontendPort},http://localhost:${frontendPort}`,
  AUTH_ALLOW_UNVERIFIED_GOOGLE: 'false',
  AUTH_API_PORT: String(apiPort),
  LUNA_API_DATA_DIR: dataDir,
  PERSONAL_EVENTS_STORAGE: 'file',
  MEMORY_CONSENT_STORAGE: 'file',
  LUNA_MEMORY_CONSENT_ALLOW_FILE_FALLBACK: '1',
  PERSONAL_HEALTH_PROFILE_STORAGE: 'file',
  LUNA_HEALTH_PROFILE_ALLOW_FILE_FALLBACK: '1',
  NODE_ENV: 'development',
  VITE_API_BASE_URL: '',
  // Keep Google client id if present for UI visibility; never enable unverified.
};

const children = [];

const spawnChild = (command, args, label) => {
  const child = spawn(command, args, {
    cwd: root,
    env: safeEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
  children.push(child);
  const prefix = `[e2e-${label}]`;
  child.stdout.on('data', (buf) => {
    const text = String(buf);
    // Never echo secrets; strip common credential-looking fragments.
    process.stdout.write(
      text
        .split('\n')
        .map((line) => (line.includes('postgresql://') || line.includes('sk_') ? `${prefix} [redacted]\n` : line ? `${prefix} ${line}\n` : ''))
        .join(''),
    );
  });
  child.stderr.on('data', (buf) => {
    const text = String(buf);
    process.stderr.write(
      text
        .split('\n')
        .map((line) => (line.includes('postgresql://') || line.includes('sk_') ? `${prefix} [redacted]\n` : line ? `${prefix} ${line}\n` : ''))
        .join(''),
    );
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.stderr.write(`${prefix} exited ${code}\n`);
      shutdown(code);
    }
  });
  return child;
};

const shutdown = (code = 0) => {
  for (const child of children) {
    try {
      child.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  }
  process.exit(code);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

process.stdout.write(
  `[e2e-dev] frontend=http://127.0.0.1:${frontendPort} api=http://127.0.0.1:${apiPort} db=json-isolated stripe=disabled\n`,
);

spawnChild(process.execPath, ['server/index.mjs'], 'api');
spawnChild(
  path.join(root, 'node_modules', '.bin', 'vite'),
  ['--host', '127.0.0.1', '--port', String(frontendPort), '--strictPort'],
  'vite',
);
