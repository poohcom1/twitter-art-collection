import Head from "next/head";
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
      router.push("/").then().catch(alert);
    }
  });

  const errorMessage = useStore((state) => state.errorMessage);

  useEffect(() => {
    if (errorMessage) {
      router
        .push("/error?message=" + errorMessage)
        .then()
        .catch(console.error);
    }
  }, [errorMessage, router]);

  useEffect(() => {
    const gitterScript = document.createElement("script");

    gitterScript.id = "gitter";
    gitterScript.innerHTML = `
            ;((window.gitter = {}).chat = {}).options = {
            room: "twitter-art-collection/community",
            activationElement: "#open-gitter-button",}`;

    const gitterSource = document.createElement("script");
    gitterSource.src = "https://sidecar.gitter.im/dist/sidecar.v1.js";
    gitterSource.defer = true;
    gitterSource.async = true;

    document.body.appendChild(gitterScript);
    document.body.appendChild(gitterSource);
  }, []);

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <link rel="canonical" href={`${CANONICAL_URL}/collection`} />
      </Head>

      {session.status === "authenticated" ? <MainScene /> : <LoadingScene />}
    </>
  );
}
