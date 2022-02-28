import Head from "next/head";
import { getSession, useSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { ThemeProvider } from "styled-components";
import { MainScene } from "src/scenes";
import { lightTheme } from "src/themes";
// Next SSR
import type { GetServerSideProps } from "next";
import { useEffect } from "react";
import { getTags } from "src/adapters";
import { Session } from "next-auth";
import { useStore } from "src/stores/rootStore";

interface IndexPageProps {
  props: any;
  session: Session;
}

// Redirect to about if not signed in
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: "/about",
      },
    };
  }

  return {
    props: { session },
  };
};

export default function Index() {
  const session = useSession();
  const initTags = useStore((state) => state.initTags);

  useEffect(() => {
    // TODO Use modal for alert
    if (session.status === "authenticated") initTags().then().catch(alert);
  }, [initTags, session.status]);

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>
      <ThemeProvider theme={lightTheme}>
        <MainScene />
      </ThemeProvider>
    </>
  );
}
