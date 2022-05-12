import { expect, test } from "@playwright/test";
import { COLLECTION_URL } from "types/constants";

const BASE_URL = "http://localhost:3000";

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL + "/" + COLLECTION_URL);
});

test("should redirect to home page if not logged in", async ({ page }) => {
  await page.waitForURL(BASE_URL + "/");

  expect(page.url()).toBe(BASE_URL + "/");
});
