import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4321',
    channel: 'chrome',
    viewport: { width: 1440, height: 1000 }
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4321 --ignore-lock',
    env: { ASTRO_DEV_BACKGROUND: '0' },
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
    timeout: 120_000
  }
});
