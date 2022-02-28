import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";

// Suppress specific warnings in dev
if (process.env.NODE_ENV === "development") {
  const warn = console.warn;

  console.warn = (message?: string, ...optionalParams: string[]) => {
    if (typeof message === "string") {
      // Put warnings phrases here
      const conditions = [
        'may not render properly with a parent using position:"static". Consider changing the parent style to position:"relative" with a width and height.',
      ];

      for (const condition of conditions) {
        if (message.includes(condition)) return;
      }
    }

    warn(message, ...optionalParams);
  };
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
