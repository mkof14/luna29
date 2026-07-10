import { defineConfig, devices } from '@playwright/test';

const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 3020);
const apiPort = Number(process.env.E2E_API_PORT || 8791);
const reuse = process.env.E2E_REUSE_SERVER === '1';

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/prod-public.spec.js'],
  timeout: 60000,
  fullyParallel: true,
  workers: Number(process.env.PW_WORKERS || 2),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Isolated stack: empty DATABASE_URL, Stripe disabled, dedicated JSON data dir.
    // Default ports 3020/8791 avoid colliding with long-lived :3000/:8787 stacks.
    command: `E2E_FRONTEND_PORT=${frontendPort} E2E_API_PORT=${apiPort} node scripts/e2e-dev-server.mjs`,
    url: `http://127.0.0.1:${frontendPort}`,
    reuseExistingServer: reuse,
    timeout: 180000,
  },
});
