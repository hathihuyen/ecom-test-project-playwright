import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import { env } from "./config/env";
import path from 'path';
import { AUTH_FILES } from "./config/auth";
import { TIMEOUTS } from "./config/timeouts";
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const isCI = !!process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI, // Prevent 'test.only' in CI
  /* Retry on CI only */
  retries: isCI ? 2 : 0, // Retry failed tests in CI
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 2 : undefined, // kept it low because this is a public demo site behind Cloudflare.
  timeout: TIMEOUTS.test,
  expect: { timeout: TIMEOUTS.expect },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI
    ? [["github"], ["html", { open: "never"}], ["junit", { outputFile: "test-results/junit.xml" }]]
    : [['html', { open: 'never' }], ["list"]], // Generate HTML and List reports
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: env.baseUrl, // Base URL for navigation

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure', // Capture traces only when failure, default value = 'on-first-retry'
    testIdAttribute: "data-test", // Custom test ID attribute
    locale: "en-US",
    // headless: true,
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: TIMEOUTS.action,
    navigationTimeout: TIMEOUTS.navigation,
    // launchOptions: {
    //   args: [
    //     '--disable-dev-shm-usage', // Disable /dev/shm usage to prevent crashes in CI environments
    //     '--no-sandbox', // Disable sandbox for better compatibility in CI environments
    //     '--disable-blink-features=AutomationControlled' // Prevent detection of automation
    //   ], 
    // },
    // extraHTTPHeaders: {
    //   'Accept-Language': 'en-US,en;q=0.9', // Set default language for tests
    //   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' // Set a consistent user agent
    // },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup", // Authentication setup project
      testMatch: /.*\.setup\.ts/,
      teardown: "teardown",
    },
    {
      name: "teardown", // Deletes the customer created by setup, after all tests finish
      testMatch: /.*\.teardown\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ["setup"], // Run setup first
      grepInvert: /@stress/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILES.customer1, // Load auth state. the setup project runs once before chromium, and each file is written exactly once. Every test reads the file and nothing writes to it during the run, so there is no race.
      },
    },
    // Opt-in projects: `npm run test:stress`, or ALL_BROWSERS=1 for a nightly cross-browser run
    ...(process.env.STRESS
        ? [{ name: "stress", grep: /@stress/, use: { ...devices["Desktop Chrome"] } }]
        : []),
    ...(process.env.ALL_BROWSERS
        ? [
            { name: "firefox", dependencies: ["setup"], grepInvert: /@stress/, use: { ...devices["Desktop Firefox"], storageState: AUTH_FILES.customer1 } },
            { name: "webkit", dependencies: ["setup"], grepInvert: /@stress/, use: { ...devices["Desktop Safari"], storageState: AUTH_FILES.customer1 } },
        ]
        : []),

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
