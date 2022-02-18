import NextAuth, { DefaultUser } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

const clientId = process.env.TWITTER_CLIENT_ID
const clientSecret = process.env.TWITTER_CLIENT_SECRET

if (!clientId || !clientSecret) {
    throw new Error("Missing TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET env variables!")
}

export default NextAuth({
    providers: [
        TwitterProvider({
            clientId,
            clientSecret,
            version: "2.0", // opt-in to Twitter OAuth 2.0,
        })
    ],
    pages: {
        "signIn": "/",
        "error": "/"
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
    },
    session: {
        strategy: 'jwt',
    },
}); 