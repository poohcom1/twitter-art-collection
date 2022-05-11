import Head from "next/head";
import { ThemeProvider } from "styled-components";
import { LoadingScene, MainScene } from "src/scenes";
// Next SSR
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { CANONICAL_URL } from "types/constants";
import { useDisplayStore } from "src/stores/displayStore";

export default function Index() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/").then().catch(alert);
    }
  });

  const theme = useDisplayStore((state) => state.theme);

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <link rel="canonical" href={`${CANONICAL_URL}/collection`} />
        <script>
          {`;((window.gitter = {}).chat = {}).options = {
            room: "twitter-art-collection/community",
            activationElement: "#open-gitter-button",
          }`}
        </script>
        <script
          src="https://sidecar.gitter.im/dist/sidecar.v1.js"
          async
          defer
        />
      </Head>
      <ThemeProvider theme={theme}>
        {session.status === "authenticated" ? <MainScene /> : <LoadingScene />}
      </ThemeProvider>
    </>
  );
}
