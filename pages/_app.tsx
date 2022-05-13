import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Router from "next/router";
import { useEffect, useState } from "react";
import { LoadingScene } from "src/scenes";
import { useDisplayStore } from "src/stores/displayStore";
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
  const [pageLoading, setPageLoading] = useState(false);

  // Page change loading indicator
  //  @see styles/globals.css
  Router.events.on("routeChangeStart", () => {
    setPageLoading(true);
  });

  Router.events.on("routeChangeComplete", () => {
    setPageLoading(false);
  });

  Router.events.on("routeChangeError", () => {
    setPageLoading(false);
  });

  // Display options detection
  const initDisplay = useDisplayStore((state) => state.initSettings);

  useEffect(() => {
    initDisplay();
  }, [initDisplay]);

  return (
    <SessionProvider session={session}>
      {pageLoading ? (
        <LoadingScene display={true} />
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}

export default MyApp;
