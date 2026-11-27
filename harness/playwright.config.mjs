// Purpose: Playwright's config for the ledger's browser cases: tests/invariants/**/*.spec.ts, Chromium with fake microphones, against BASE_URL
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '/app/tests/invariants',
  testMatch: '**/*.spec.ts',
  outputDir: '/tmp/playwright-output',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['junit']],
  use: { baseURL: process.env.BASE_URL || undefined, trace: 'off' },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['microphone'],
        launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
      },
    },
  ],
});
