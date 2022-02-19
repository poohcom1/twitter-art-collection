/**
 * For userId injection
 * @see https://github.com/nextauthjs/next-auth/discussions/536#discussioncomment-1932922
 */
import type { DefaultUser } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: DefaultUser & {
            id: string;
        };
    }
}

declare module 'next-auth/jwt/types' {
    interface JWT {
        uid: string;
    }
}