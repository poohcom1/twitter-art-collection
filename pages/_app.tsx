import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Router from "next/router";
import { useEffect, useState } from "react";
import { LoadingScene } from "src/scenes";
import { useStore } from "src/stores/rootStore";
import { darkTheme, lightTheme } from "src/themes";
import { LOCAL_THEME_KEY, LOCAL_THEME_LIGHT } from "types/constants";
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

  const setTheme = useStore((state) => state.setTheme);

  // Theme detection
  useEffect(() => {
    if (!localStorage.getItem(LOCAL_THEME_KEY)) {
      const preferDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (preferDark) {
        setTheme(darkTheme);
      } else {
        setTheme(lightTheme);
      }
    } else {
      setTheme(
        localStorage.getItem(LOCAL_THEME_KEY) === LOCAL_THEME_LIGHT
          ? lightTheme
          : darkTheme
      );
    }
  }, [setTheme]);

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
