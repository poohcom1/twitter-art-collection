import Head from "next/head";
import { MainScene } from "src/scenes";
// Next SSR
import { useRouter } from "next/router";
import { useEffect } from "react";
import { CANONICAL_URL } from "types/constants";
import { useStore } from "src/stores/rootStore";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/nextAuth";

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Record<string, unknown>>> {
  const session = await getServerSession(context, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  session.user.email = null;

  return { props: {} };
}

export default function Index() {
  const router = useRouter();

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
        <link rel="canonical" href={`${CANONICAL_URL}/m/collection`} />
      </Head>

      <MainScene />
    </>
  );
}
