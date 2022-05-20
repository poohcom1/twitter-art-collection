/**
 * For userId injection
 * @see https://github.com/nextauthjs/next-auth/discussions/536#discussioncomment-1932922
 */
import type { DefaultUser } from "next-auth";

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

declare module "next-auth/jwt/types" {
  interface JWT {
    uid: string;
    twitter?: {
      oauth_token?: string;
      oauth_token_secret?: string;
    };
  }
}

declare module "@next/bundle-analyzer";

// ts with react18 throws error for reactjs-popup's children when using the function pattern
import type { PopupProps, PopupActions } from "reactjs-popup/dist/types";

declare module "reactjs-popup" {
  const Popup: React.ForwardRefExoticComponent<
    (
      | PopupProps
      | {
          children: (close: () => void) => JSX.Element;
        }
    ) &
      React.RefAttributes<PopupActions>
  >;

  export = Popup;
}

declare global {
  namespace PlaywrightTest {
    // eslint-disable-next-line unused-imports/no-unused-vars
    interface Matchers<R, T> {
      isVisibleIn(parent: Locator, options?: { timeout: number }): Promise<R>;
    }
  }
}
