import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("no user", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + "/collection");
  });

  test("should redirect to home page if not logged in", async ({ page }) => {
    await page.waitForURL(BASE_URL + "/");

    expect(page.url()).toBe(BASE_URL + "/");
  });
});
