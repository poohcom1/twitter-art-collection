import { authOptions } from "lib/nextAuth";
import NextAuth from "next-auth";

const AUTH_VER = process.env.TWITTER_AUTH_VER ?? "1.0";

// If auth_ver 1.0
const appId = process.env.TWITTER_API_KEY;
const appSecret = process.env.TWITTER_API_SECRET;

// If auth_ver 2.0
const clientId = process.env.TWITTER_CLIENT_ID;
const clientSecret = process.env.TWITTER_CLIENT_SECRET;

if (AUTH_VER === "1.0" && (!appId || !appSecret)) {
  throw new Error(
    "Missing TWITTER_API_KEY or TWITTER_API_SECRET env variables for Twitter OAuth1.0!"
  );
}

if (AUTH_VER === "2.0" && (!clientId || !clientSecret)) {
  throw new Error(
    "Missing TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET env variables for Twitter OAuth2.0!"
  );
}

export default NextAuth(authOptions);
