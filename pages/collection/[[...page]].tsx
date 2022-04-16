import Head from "next/head";
import { ThemeProvider } from "styled-components";
import { LoadingScene, MainScene } from "src/scenes";
import { lightTheme } from "src/themes";
// Next SSR
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { CANONICAL_URL } from "types/constants";

export default function Index() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/");
    }
  });

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <link
          rel="canonical"
          href={`${CANONICAL_URL}/collection`}
        />
      </Head>
      <ThemeProvider theme={lightTheme}>
        {session.status === "authenticated" ? <MainScene /> : <LoadingScene />}
      </ThemeProvider>
    </>
  );
}
