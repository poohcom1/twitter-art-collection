import { IncomingMessage, ServerResponse } from "http";
import { NextAuthOptions, Session, unstable_getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import TwitterProvider from "next-auth/providers/twitter";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { COLLECTION_URL } from "types/constants";

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
    error: "/error",
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
    jwt: async ({ user, token, account }) => {
      if (user) {
        token.uid = user.id;
      }

      if (account) {
        if (account.provider && !token[account.provider]) {
          token.twitter = {};

          if (account.oauth_token) {
            token.twitter.oauth_token = account.oauth_token as string;
          }

          if (account.oauth_token_secret) {
            token.twitter.oauth_token_secret =
              account.oauth_token_secret as string;
          }
        }
      }

      return token;
    },
    redirect: async ({ baseUrl }) => {
      return baseUrl + "/" + COLLECTION_URL;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getUserId = async (
  req: IncomingMessage & { cookies: NextApiRequestCookies }
): Promise<string | undefined> => (await getToken({ req }))?.uid;

export const getServerSession = async (
  req: IncomingMessage & { cookies: NextApiRequestCookies },
  res: ServerResponse,
  context: NextAuthOptions
): Promise<Session | null> => {
  console.log(await getToken({ req }));

  const session = unstable_getServerSession(req, res, context);
  console.log(await session);
  return session;
};
