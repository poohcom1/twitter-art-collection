import { expect, test } from "@playwright/test";
import USER from "../_helpers/data/user.json";
import { mockSession } from "test-e2e/_helpers/auth/sessionUtil";

/**
 * Test user: Has two tags: tag1 has 2 images and tag2 has 2 images; no overlaps
 *  Has 1 image in blacklist
 */

const TAGS_COUNT = Object.values(USER.tags).length - 1;
const TAG_1 = "tag1";
const TAG_2 = "tag2";

test.describe("existing user", () => {
  test.beforeEach(mockSession(USER));

  test("should load existing tag(s)", async ({ page }) => {
    await page.locator(".loadingScreen").waitFor({ state: "hidden" });

    const selector = `.header__tag`;

    await page.waitForSelector(selector);

    await expect(page.locator(selector)).toHaveCount(TAGS_COUNT);
  });

  test("should delete a tag with right-click", async ({ page }) => {
    await page.locator(".loadingScreen").waitFor({ state: "hidden" });

    const tagSelector = `.header__tag`;

    await page.waitForSelector(tagSelector);

    await page.click(tagSelector, { button: "right" });

    await page.locator("text=Delete").click();

    await page.click(".confirm-accept");

    await expect(page.locator(tagSelector)).toHaveCount(TAGS_COUNT - 1);
  });

  test("should delete images with right click", async ({ page }) => {
    await test.step("Delete 1 image", async () => {
      await page
        .locator(".tweetComp__tag >> nth=0", { hasText: TAG_1 })
        .click({ button: "right" });

      await page.locator("text=Remove tag from image").click();

      await page.click("text=" + TAG_1);

      await expect(page.locator(".tweetComp")).toHaveCount(1);
    });
  });

  test("should delete images without throwing a masonic error", async ({
    page,
  }) => {
    const tagName = USER["tags"][TAG_1].name;

    await test.step("Delete 1 image", async () => {
      await page.click(`.header__tag:has-text('${tagName}')`);

      await expect(page.locator(".tweetComp")).toHaveCount(2);

      await page.click(".header__deleteMode");
      await page.click(".tweetComp__tag >> nth=0");
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

  test("should show images in multiple tags when selected with shift-click", async ({
    page,
  }) => {
    await page.click("text=" + TAG_1);

    await page.click(".tweetComp__addImage >> nth=0");

    await page.locator(".tweetComp__addImageItem", { hasText: TAG_2 }).click();

    await page.click("text=" + TAG_2, { modifiers: ["Shift"] });

    await expect(page.locator(".tweetComp")).toHaveCount(1);
  });
});
