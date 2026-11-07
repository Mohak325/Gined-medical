import { defineConfig } from "@playwright/test";

/**
 * Browser tests against a production build: run `npm run build` first, then `npm run test:e2e`.
 * They use the installed Chrome (set PW_CHANNEL to change it, e.g. msedge, or "chromium"
 * after `npx playwright install chromium`).
 */
const channel = process.env.PW_CHANNEL ?? "chrome";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3200",
    ...(channel === "chromium" ? {} : { channel }),
  },
  webServer: [
    {
      // Stands in for the Google Sheet webhook, so booking tests never reach the real sheet.
      command: "node tests/e2e/fake-webhook.mjs",
      url: "http://localhost:3201/received",
      reuseExistingServer: false,
    },
    {
      command: "npx next start -p 3200",
      url: "http://localhost:3200/medical",
      reuseExistingServer: false,
      env: { LEADS_WEBHOOK_URL: "http://localhost:3201/hook" },
      timeout: 60_000,
    },
  ],
});
