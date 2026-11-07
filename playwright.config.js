import { defineConfig } from "@playwright/test";
const port = process.env.TEST_PORT || "5173";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: { baseURL: `http://127.0.0.1:${port}`, headless: true },
  projects: [
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: "desktop", use: { viewport: { width: 1440, height: 960 } } },
  ],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
  },
});
