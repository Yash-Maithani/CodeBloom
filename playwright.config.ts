import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Tests run against the production build (`npm run test:e2e` builds first),
// because that is what visitors get.
export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
