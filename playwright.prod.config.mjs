import { defineConfig, devices } from '@playwright/test';

const baseURL = (process.env.PW_BASE_URL || 'https://www.luna29.com').replace(/\/+$/, '');

export default defineConfig({
  testDir: './e2e',
  testMatch: 'prod-public.spec.js',
  timeout: 45000,
  fullyParallel: true,
  workers: 2,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
