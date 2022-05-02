import { expect, test } from "@playwright/test";
import { encode, SESSION_SECRET } from "./auth/sessionUtil";
import USER from "./data/user.json";
import NEW_USER from "./data/newUser.json";
import TWEETS from "./data/tweets.json";
import SESSION from "./data/session.json";

const BASE_URL = "http://localhost:3000";

const mockSession =
  (user: RawUserSchema): Parameters<typeof test.beforeEach>[0] =>
  async ({ page, context }) => {
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: await encode(SESSION, SESSION_SECRET!),
        path: "/",
        domain: "localhost",
      },
    ]);

    await page.route("**/api/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION),
      })
    );

    await page.route("**/api/user", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(user),
      })
    );

    await page.route("**/api/liked-tweets", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ tweets: TWEETS.slice(0, 100), next_token: "" }),
      })
    );

    await page.route("**/api/tags/*", (route) =>
      route.fulfill({
        status: 200,
        body: "Ok",
      })
    );

    await page.goto(BASE_URL + "/collection");
  };

test.describe("no user", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + "/collection");
  });

  test("should redirect to home page if not logged in", async ({ page }) => {
    await page.waitForURL(BASE_URL + "/");

    expect(page.url()).toBe(BASE_URL + "/");
  });
});

test.describe("new user", () => {
  test.beforeEach(mockSession(NEW_USER));

  test("should create a tag, format the tag name without space, and delete a tag", async ({
    page,
  }) => {
    const tagName = "new tag";

    await page.click(".header__addTag");
    await page.fill(".header__addTag", tagName);
    await page.keyboard.press("Enter");

    await expect(
      page.locator(`.header__tag:has-text('${tagName} - 0')`)
    ).toHaveCount(1);

    await page.click(".header__deleteMode");
    await page.click(`.header__tag:has-text('${tagName}')`);
    await page.click(".confirm-accept");

    await expect(page.locator(".header__tag")).toHaveCount(0);
  });

  test("should create a tag, add two images to the tag, and delete one image", async ({
    page,
  }) => {
    const tagName = "new tag";

    await page.click(".header__addTag");
    await page.fill(".header__addTag", tagName);
    await page.keyboard.press("Enter");

    await page.locator(".tweetComp__tagEdit >> nth=0").click();
    await page.click(`.addImage:has-text('${tagName}')`);
    await page.locator(".tweetComp__tagEdit>> nth=1").click();
    await page.click(`.addImage:has-text('${tagName}')`);

    await page.click(`.header__tag:has-text('${tagName} - 2')`);

    await expect(page.locator(".tweetComp")).toHaveCount(2);

    await page.click(".header__deleteMode");

    await page.click(".tweetComp__tagEdit >> nth=0");

    await expect(page.locator(".tweetComp")).toHaveCount(1);
  });

  test("should hide blacklist when no tags are blacklisted, and show when there are", async ({
    page,
  }) => {
    await page.click(".header__user");

    await expect(page.locator(".header__blacklist")).toHaveCount(0);

    await page.locator(".tweetComp__tagEdit >> nth=0").click();

    await expect(page.locator(".tweetComp__blacklist")).toHaveCount(1);

    await page.click(".tweetComp__blacklist");
    await page.click(".header__user");
    await page.click(".header__blacklist");

    await expect(page.locator(".tweetComp")).toHaveCount(1);
  });
});

test.describe("existing user", () => {
  const existingTag = USER.tags["existing-tag"];

  test.beforeEach(mockSession(USER));

  test("should load existing tag", async ({ page }) => {
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

    await expect(page.locator(".tweetComp")).toHaveCount(1);
  });
});
