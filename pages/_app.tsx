import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import { useEffect, useState } from "react";
import { LoadingScene } from "src/scenes";
import { useDisplayStore } from "src/stores/displayStore";
import { ThemeProvider } from "styled-components";
import "../styles/globals.css";

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

  const theme = useDisplayStore((state) => state.theme);

  // Display options detection
  const initDisplay = useDisplayStore((state) => state.initSettings);

  useEffect(() => {
    initDisplay();
  }, [initDisplay]);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          {pageLoading ? (
            <LoadingScene display={true} />
          ) : (
            <Component {...pageProps} />
          )}
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
