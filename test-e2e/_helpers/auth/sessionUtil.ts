import { BrowserContext, Page } from "@playwright/test";

import SESSION from "../data/session.json";
import TWEETS from "../data/tweets.json";
import { COLLECTION_URL } from "types/constants";
import { encode } from "next-auth/jwt";

export const PAGE_URL = "http://localhost:3000/" + COLLECTION_URL;
export const SESSION_SECRET = process.env.NEXTAUTH_SECRET;

export async function mockSession(
  user: RawUserSchema,
  page: Page,
  context: BrowserContext
) {
  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: await encode({ token: SESSION, secret: SESSION_SECRET! }),
      url: "https://localhost:3000",
      sameSite: "Lax",
    },
    {
      name: "next-auth.callback-url",
      value: "http%3A%2F%2Flocalhost%3A3000%2Fcollection",
      url: "https://localhost:3000",
      sameSite: "Lax",
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

  await page.route("**/api/feed-tweets", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ tweets: TWEETS.slice(0, 100), next_token: "" }),
    })
  );

  await page.route("**/api/liked-tweets", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ tweets: TWEETS.slice(0, 100), next_token: "" }),
    })
  );

  // TODO Finish this
  await page.route("**/api/tweet-expansions", (route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        tweets: TWEETS.slice(0, 100),
        next_token: "",
      }),
    });
  });

  await page.route("**/api/tags/*", (route) =>
    route.fulfill({
      status: 200,
      body: "Ok",
    })
  );

  await page.route(
    (url) => url.pathname.includes("pbs.twimg.com"),
    (route) => route.fulfill({ status: 200 })
  );

  await page.route(
    (url) => url.pathname.includes("api/rename-tag"),
    (route) => route.fulfill({ status: 200 })
  );

  await page.route(
    (url) => url.pathname.includes("api/pinned-tag"),
    (route) => route.fulfill({ status: 200 })
  );

  await page.goto(PAGE_URL);

  await page.waitForURL(PAGE_URL);
}
