import { expect, test } from "@playwright/test";
import NEW_USER from "../helpers/data/newUser.json";
import { mockSession } from "test-e2e/helpers/auth/sessionUtil";

const BASE_URL = "http://localhost:3000";

test.describe("new user", () => {
  test.beforeEach(mockSession(BASE_URL, NEW_USER));

  test("should create a tag and delete a tag", async ({ page }) => {
    const tagName = "new tag";
    await test.step("Create a tag", async () => {
      await page.click(".header__addTag");
      await page.fill(".header__addTag", tagName);
      await page.keyboard.press("Enter");

      await expect(
        page.locator(`.header__tag:has-text('${tagName} - 0')`)
      ).toHaveCount(1);
    });

    await test.step("Delete the tag", async () => {
      await page.click(".header__deleteMode");
      await page.click(`.header__tag:has-text('${tagName}')`);
      await page.click(".confirm-accept");

      await expect(page.locator(".header__tag")).toHaveCount(0);
    });
  });

  test("should delete images without throwing a masonic error", async ({
    page,
  }) => {
    const tagName = "new tag";
    await test.step("Create a tag", async () => {
      await page.click(".header__addTag");
      await page.fill(".header__addTag", tagName);
      await page.keyboard.press("Enter");

      await expect(
        page.locator(`.header__tag:has-text('${tagName} - 0')`)
      ).toHaveCount(1);
    });

    await test.step("Add 2 images to the tag", async () => {
      await page.click("#tweetComp0 .tweetComp__tagEdit");
      await page.click(`.addImage:has-text('${tagName}')`);
      await page.click("#tweetComp1 .tweetComp__tagEdit");
      await page.click(`.addImage:has-text('${tagName}')`);
    });

    await test.step("Delete 1 image", async () => {
      await page.click(`.header__tag:has-text('${tagName} - 2')`);

      await expect(page.locator(".tweetComp")).toHaveCount(2);

      await page.click(".header__deleteMode");
      await page.click("#tweetComp0 .tweetComp__tagEdit");
      await page.click(".header__deleteMode");

      await page.locator(".tweetComp").waitFor({ state: "visible" });
      await expect(page.locator(".tweetComp")).toHaveCount(1);
    });
  });

  test("should hide blacklist when no tags are blacklisted, and show when there are", async ({
    page,
  }) => {
    await page.click(".header__user");

    await expect(page.locator(".header__blacklist")).toHaveCount(0);

    await page.click(".header__user");

    await page.click("#tweetComp0 .tweetComp__tagEdit");

    await expect(page.locator(".tweetComp__blacklist")).toHaveCount(1);

    await page.click(".tweetComp__blacklist");
    await page.click(".header__user");
    await page.click(".header__blacklist");

    await page.locator(".tweetComp").waitFor({ state: "visible" });
    await expect(page.locator(".tweetComp")).toHaveCount(1);
  });
});
