import Head from "next/head";
import { ThemeProvider } from "styled-components";
import { LoadingScene, MainScene } from "src/scenes";
// Next SSR
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { CANONICAL_URL } from "types/constants";
import { useStore } from "src/stores/rootStore";

export default function Index() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/");
    }
  });

  const theme = useStore((state) => state.theme);

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <link rel="canonical" href={`${CANONICAL_URL}/collection`} />
      </Head>
      <ThemeProvider theme={theme}>
        {session.status === "authenticated" ? <MainScene /> : <LoadingScene />}
      </ThemeProvider>
    </>
  );
}
