import { expect, Locator, PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

expect.extend({
  async isVisibleIn(
    received: Locator,
    parent: Locator,
    options: { timeout: number; frame: number } = { timeout: 5000, frame: 250 }
  ) {
    let leftMatch = false,
      rightMatch = false,
      topMatch = false,
      bottomMatch = false;

    let pass = false;

    for (let i = 0; i < Math.max(options.timeout / options.frame, 1); i++) {
      const elemRect = await received.boundingBox();
      const parentRect = await parent.boundingBox();

      if (!elemRect || !parentRect) return false;

      leftMatch = elemRect.x >= parentRect.x;
      rightMatch =
        elemRect.x + elemRect.width <= parentRect.x + parentRect.width;
      topMatch = elemRect.y >= parentRect.y;
      bottomMatch =
        elemRect.y + elemRect.height <= parentRect.y + parentRect.height;

      pass = leftMatch && rightMatch && topMatch && bottomMatch;

      if (pass) break;

      await sleep(options.frame);
    }

    if (pass) {
      return {
        pass,
        message: () => "passed",
      };
    } else {
      return {
        pass,
        message: () => {
          let message = "";

          if (!leftMatch) {
            message += "Left boundary outside of container";
          }
          if (!rightMatch) {
            message += "; Right boundary outside of container";
          }
          if (!topMatch) {
            message += "; Top boundary outside of container";
          }
          if (!bottomMatch) {
            message += "; Right boundary outside of container";
          }

          return message;
        },
      };
    }
  },
});

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import { config as dotenv } from "dotenv";
dotenv();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: "./test-e2e",
  /* Maximum time one test can run for. */
  timeout: process.env.CI ? 30 * 1000 : 30 * 1000,
  fullyParallel: !!process.env.CI,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },

    // FIXME Cookies not working in CI for some reason
    !process.env.CI
      ? {
          name: "webkit",
          use: {
            ...devices["Desktop Safari"],
          },
        }
      : {},

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run start",
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
