import { test } from "@playwright/test";
import hkdf from "@panva/hkdf";
import { EncryptJWT } from "jose";

import SESSION from "../data/session.json";
import TWEETS from "../data/tweets.json";

const BASE_URL = "http://localhost:3000";
export const SESSION_SECRET = process.env.NEXTAUTH_SECRET;

export const mockSession =
  (user: RawUserSchema): Parameters<typeof test.beforeEach>[0] =>
  async ({ page, context }) => {
    const addCookies = context.addCookies([
      {
        name: "next-auth.session-token",
        value: await encode(SESSION, SESSION_SECRET!),
        path: "/",
        domain: "localhost",
      },
    ]);

    const sessionRoute = page.route("**/api/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(SESSION),
      })
    );

    const userRoute = page.route("**/api/user", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify(user),
      })
    );

    const tweetsRoute = page.route("**/api/liked-tweets", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ tweets: TWEETS.slice(0, 100), next_token: "" }),
      })
    );

    // TODO Finish this
    const tweetExpansionsRoute = page.route(
      "**/api/tweet-expansions",
      (route) => {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            tweets: TWEETS.slice(0, 100),
            next_token: "",
          }),
        });
      }
    );

    const tagsRoute = page.route("**/api/tags/*", (route) =>
      route.fulfill({
        status: 200,
        body: "Ok",
      })
    );

    const imageRoute = page.route("**/_next/image", (route) =>
      route.fulfill({ status: 200 })
    );

    await Promise.all([
      addCookies,
      sessionRoute,
      userRoute,
      tweetsRoute,
      tagsRoute,
      imageRoute,
      tweetExpansionsRoute,
    ]);

    await page.goto(BASE_URL + "/collection");
  };

// Function logic derived from https://github.com/nextauthjs/next-auth/blob/5c1826a8d1f8d8c2d26959d12375704b0a693bfc/packages/next-auth/src/jwt/index.ts#L113-L121
async function getDerivedEncryptionKey(secret: string) {
  return await hkdf(
    "sha256",
    secret,
    "",
    "NextAuth.js Generated Encryption Key",
    32
  );
}

// Function logic derived from https://github.com/nextauthjs/next-auth/blob/5c1826a8d1f8d8c2d26959d12375704b0a693bfc/packages/next-auth/src/jwt/index.ts#L16-L25
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function encode(token: any, secret: string) {
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  const encryptionSecret = await getDerivedEncryptionKey(secret);
  return await new EncryptJWT(token)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(Date.now() / 1000 + maxAge)
    .setJti("test")
    .encrypt(encryptionSecret);
}
