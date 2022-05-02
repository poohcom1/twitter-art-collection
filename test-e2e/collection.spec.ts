import { expect, test } from "@playwright/test";
import { SESSION_JSON, encode, SESSION_SECRET } from "./auth/sessionUtil";

const BASE_URL = "http://localhost:3000";

test.describe("collections - no auth", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + "/collection");
  });

  test("should redirect to home page if not logged in", async ({ page }) => {
    await page.waitForNavigation();

    expect(page.url()).toBe(BASE_URL + "/");
  });
});

test.describe("collections", () => {
  test.beforeEach(async ({ page, context }) => {
    await page.route("/api/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(SESSION_JSON),
      })
    );

    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: await encode(SESSION_JSON, SESSION_SECRET!),
        path: "/",
        domain: "localhost",
      },
    ]);

    await page.goto(BASE_URL + "/collection");
  });

  test("should redirect to home page if not logged in", async ({ page }) => {
    expect(page.url()).toBe("http://localhost:3000/collection");
  });
});
