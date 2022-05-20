import { BrowserContext, expect, Page, test } from "@playwright/test";
import { mockSession, PAGE_URL } from "test-e2e/_helpers/auth/sessionUtil";
import USER1 from "../_helpers/data/user1.json";
import USER2 from "../_helpers/data/user2.json";

/**
 * Test user 1: Has two tags: tag1 has 2 images and tag2 has 2 images; no overlaps
 *  Has 1 image in blacklist
 */
test.describe("user #1", () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await mockSession(USER1, page, context);

    expect(page.url()).toBe(PAGE_URL);
  });

  const TAGS_COUNT = Object.values(USER1.tags).length - 1;
  const TAG_1 = "tag1";
  const TAG_2 = "tag2";

  test("should load existing tag(s)", async () => {
    const selector = `.header__tag`;

    await page.waitForSelector(selector);

    await expect(page.locator(selector)).toHaveCount(TAGS_COUNT);
  });

  test("should delete a tag with right-click", async () => {
    const tagSelector = `.header__tag`;

    await page.waitForSelector(tagSelector);

    await page.click(tagSelector, { button: "right" });

    await page.locator("text=Delete").click();

    await page.click(".confirm-accept");

    await expect(page.locator(tagSelector)).toHaveCount(TAGS_COUNT - 1);
  });

  test("should delete images with right click", async () => {
    await test.step("Delete 1 image", async () => {
      await page
        .locator(".tweetComp__tag >> nth=0", { hasText: TAG_1 })
        .click({ button: "right" });

      await page.locator("text=Remove tag from image").click();

      await page.click("text=" + TAG_1);

      await expect(page.locator(".tweetComp")).toHaveCount(1);
    });
  });

  test("should delete images without throwing a masonic error", async () => {
    const tagName = USER1["tags"][TAG_1].name;

    await test.step("Delete 1 image", async () => {
      await page.click(`.header__tag:has-text('${tagName}')`);

      await expect(page.locator(".tweetComp")).toHaveCount(2);

      await page.click(".overlay__deleteMode");
      await page.click(".tweetComp__tag >> nth=0");
      await page.click(".overlay__deleteMode");

      await page.locator(".tweetComp").waitFor({ state: "visible" });
      await expect(page.locator(".tweetComp")).toHaveCount(1);
    });
  });

  test("should show blacklist options when blacklist tags are loaded", async () => {
    await page.click(".header__user");
    await expect(page.locator(".header__blacklist")).toHaveCount(1);

    await page.click(".header__blacklist");

    await page.locator(".tweetComp").waitFor({ state: "visible" });
    await expect(page.locator(".tweetComp")).toHaveCount(1);
  });

  test("should show images in multiple tags when selected with shift-click", async () => {
    await page.click("text=" + TAG_1);

    await page.click(".tweetComp__addImage >> nth=0");

    await page.locator(".tweetComp__addImageItem", { hasText: TAG_2 }).click();

    await page.click("text=" + TAG_2, { modifiers: ["Shift"] });

    await expect(page.locator(".tweetComp")).toHaveCount(1);
  });

  test("should order pinned tags first", async () => {
    await page
      .locator(".header__tag", { hasText: TAG_2 })
      .click({ button: "right" });

    await page.click("text=Pin");

    await expect(page.locator(".header__tag >> nth=0")).toHaveText(TAG_2);
  });

  test("should rename tag with the context menu", async () => {
    const NEW_NAME = "Isshin Ashina";

    await expect(
      page.locator(".header__tag", { hasText: NEW_NAME })
    ).toHaveCount(0);

    await page
      .locator(".header__tag", { hasText: TAG_1 })
      .click({ button: "right" });

    await page.click("text=Rename");

    await page.fill(".header__context-rename", NEW_NAME);
    await page.keyboard.press("Enter");

    await expect(
      page.locator(".header__tag", { hasText: NEW_NAME })
    ).toHaveCount(1);
  });
});

/**
 * Test user 2: Has 13 tags, all with the same single image.
 *  Tag are named with "tag" and 3 underscore to pad out the name and fill the header
 *  Has 1 pinned tag, which is the 13th tag (tag____l)
 */
test.describe("user #2", () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await mockSession(USER2, page, context);

    expect(page.url()).toBe(PAGE_URL);
  });

  test("should order pinned tag first", async () => {
    const PINNED_TAG_NAME = "tag____l";

    const firstTag = page.locator(".header__tag >> nth=0");

    expect(await firstTag.textContent()).toBe(PINNED_TAG_NAME);
  });

  test("should select tag based on URL query param", async () => {
    const QUERIED_TAG = "tag____c";

    await page.goto(PAGE_URL + `?tag=${QUERIED_TAG}`);

    const queryTag = page.locator(".header__tag-active");

    expect(await queryTag.textContent()).toBe(QUERIED_TAG);
  });

  test("should set URL query param based on selected tag", async () => {
    const QUERIED_TAG = "tag____c";

    await page.click(`text=${QUERIED_TAG}`);

    expect(page.url()).toBe(PAGE_URL + `?tag=${QUERIED_TAG}`);
  });

  test("should scroll to selected tag", async () => {
    const TAG_NAME = "tag____j";

    const tagLocator = page.locator(`.header__tag:has-text("${TAG_NAME}")`);
    const containerLocator = page.locator(".header__tags-container");

    await expect(tagLocator).not.isVisibleIn(containerLocator, {
      timeout: 500,
    });

    await page.click(".header__tag-menu");

    await page.click(`.header__tag-menu__item:has-text("${TAG_NAME}")`);

    await expect(tagLocator).isVisibleIn(containerLocator);
  });
});
