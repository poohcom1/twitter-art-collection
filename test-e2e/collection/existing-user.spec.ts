import { expect, test } from "@playwright/test";
import USER from "../helpers/data/user.json";
import { mockSession } from "test-e2e/helpers/auth/sessionUtil";

const BASE_URL = "http://localhost:3000";

test.describe("existing user", () => {
  const existingTag = USER.tags["existing-tag"];

  test.beforeEach(mockSession(BASE_URL, USER));

  test("should load existing tag", async ({ page }) => {
    await page.locator(".loadingScreen").waitFor({ state: "hidden" });

    const selector = `.header__tag:has-text('${existingTag.name}')`;

    await page.waitForSelector(selector);

    await expect(page.locator(selector)).toHaveCount(1);
  });

  test("should delete a tag with right-click", async ({ page }) => {
    await page.locator(".loadingScreen").waitFor({ state: "hidden" });

    const tagSelector = `.header__tag:has-text('${existingTag.name}')`;

    await page.waitForSelector(tagSelector);

    await page.click(tagSelector, { button: "right" });

    const deleteSelector = ".header-tags__context-delete";

    await page.waitForSelector(deleteSelector);

    await page.click(deleteSelector);

    await page.click(".confirm-accept");

    await expect(page.locator(tagSelector)).toHaveCount(0);
  });

  test("should delete images without throwing a masonic error", async ({
    page,
  }) => {
    const tagName = USER["tags"]["existing-tag"].name;

    await test.step("Delete 1 image", async () => {
      await page.click(`.header__tag:has-text('${tagName}')`);

      await expect(page.locator(".tweetComp")).toHaveCount(2);

      await page.click(".header__deleteMode");
      await page.click("#tweetComp0 .tweetComp__tagEdit");
      await page.click(".header__deleteMode");

      await page.locator(".tweetComp").waitFor({ state: "visible" });
      await expect(page.locator(".tweetComp")).toHaveCount(1);
    });
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
