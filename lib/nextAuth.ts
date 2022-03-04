import { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

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

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: AUTH_VER === "2.0" ? clientId! : appId!,
      clientSecret: AUTH_VER === "2.0" ? clientSecret! : appSecret!,
      version: AUTH_VER ?? "1.0", // opt-in to Twitter OAuth 2.0,
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  /**
   * For userId injection. Thanks to:
   * @see https://github.com/nextauthjs/next-auth/discussions/536#discussioncomment-1932922
   */
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    redirect: async ({ baseUrl }) => {
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
