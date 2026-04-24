import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI, // Prevent 'test.only' in CI
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ["list"]], // Generate HTML and List reports
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL || "https://practicesoftwaretesting.com", // Base URL for navigation

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on', // Capture traces always for now, default value = 'on-first-retry'
    testIdAttribute: "data-test", // Custom test ID attribute
    headless: true,
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      args: [
        '--disable-dev-shm-usage', // Disable /dev/shm usage to prevent crashes in CI environments
        '--no-sandbox', // Disable sandbox for better compatibility in CI environments
        '--disable-blink-features=AutomationControlled' // Prevent detection of automation
      ], 
    },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9', // Set default language for tests
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' // Set a consistent user agent
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup", // Authentication setup project
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ["setup"], // Run setup first
      use: { 
        ...devices['Desktop Chrome'],
        storageState: ".auth/customer1StorageState.json", // Load auth state
      },
    },

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
