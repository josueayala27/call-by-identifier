// Purpose: Vitest's config for the ledger's engine-free cases: tests/invariants/**/*.test.ts, in Node, against BASE_URL; no in-process server
import { defineConfig } from 'vitest/config';
export default defineConfig({
  cacheDir: '/tmp/vite',
  test: {
    root: '/app',
    include: ['tests/invariants/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    retry: 0,
  },
});
