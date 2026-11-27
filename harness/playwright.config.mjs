// Purpose: Playwright's config for the ledger's browser cases: tests/invariants/**/*.spec.ts, Chromium with fake microphones, against PRODUCT_URL
import { defineConfig, devices } from '@playwright/test';
const url = process.env.PRODUCT_URL || '';
// the product is served over plain HTTP by name (DIF-003): Chromium treats that one origin as secure, so the microphone API exists
export default defineConfig({
  testDir: '/app/tests/invariants',
  testMatch: '**/*.spec.ts',
  outputDir: '/tmp/playwright-output',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['junit']],
  use: { baseURL: url || undefined, trace: 'off' },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',               // the full Chromium build: the headless shell ignores the secure-origin flag
        permissions: ['microphone'],
        launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', ...(url.startsWith('http://') ? [`--unsafely-treat-insecure-origin-as-secure=${new URL(url).origin}`] : [])] },
      },
    },
  ],
});
