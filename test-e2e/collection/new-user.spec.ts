import { BrowserContext, expect, Page, test } from "@playwright/test";
import NEW_USER from "../_helpers/data/newUser.json";
import { mockSession } from "test-e2e/_helpers/auth/sessionUtil";

let page: Page;
let context: BrowserContext;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  context = await browser.newContext();
  await mockSession(NEW_USER, page, context);
});

test("should create a tag and delete a tag", async () => {
  const tagName = "new tag";
  await test.step("Create a tag", async () => {
    await page.click(".header__addTag");
    await page.fill(".header__addTag", tagName);
    await page.keyboard.press("Enter");

    await expect(
      page.locator(`.header__tag:has-text('${tagName}')`)
    ).toHaveCount(1);
  });

  await test.step("Delete the tag", async () => {
    await page.waitForSelector(".header__deleteMode");
    await page.click(".header__deleteMode");
    await page.click(`.header__tag:has-text('${tagName}')`);
    await page.click(".confirm-accept");

    await expect(page.locator(".header__tag")).toHaveCount(0);
  });
});

test("should hide blacklist when no tags are blacklisted, and show when there are", async () => {
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
