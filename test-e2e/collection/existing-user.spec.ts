import { expect, test } from "@playwright/test";
import USER from "../helpers/data/user.json";
import { mockSession } from "test-e2e/helpers/auth/sessionUtil";

const BASE_URL = "http://localhost:3000";

test.describe("existing user", () => {
  const existingTag = USER.tags["existing-tag"];

  test.beforeEach(mockSession(BASE_URL, USER));

  test("should load existing tag", async ({ page }) => {
    await page.locator(".loadingScreen").waitFor({ state: "hidden" });

    await expect(
      page.locator(
        `.header__tag:has-text('${existingTag.name} - ${existingTag.images.length}')`
      )
    ).toHaveCount(1);
  });

  test("should show blacklist options when blacklist tags are loaded", async ({
    page,
  }) => {
    await page.click(".header__user");
    await expect(page.locator(".header__blacklist")).toHaveCount(1);

    await page.click(".header__blacklist");

    await page.locator(".tweetComp").waitFor({ state: "visible" });
    await expect(page.locator(".tweetComp")).toHaveCount(1);
  });
});
