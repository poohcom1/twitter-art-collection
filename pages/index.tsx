import Head from "next/head";
import { getSession, useSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { SelectedTagProvider } from "src/context/SelectedTagContext";
import { EditModeProvider } from "src/context/EditModeContext";
import { ThemeProvider } from "styled-components";
import { MainScene } from "src/scenes";
import { lightTheme } from "src/themes";
// Next SSR
import type { GetServerSideProps } from "next";
import getMongoConnection from "lib/mongodb";
import UserModel from "models/User";
import cache from "memory-cache";
import { useEffect, useState } from "react";
import { getTags } from "src/adapters";
import { Session } from "next-auth";
import { useStore } from "src/stores/rootStore";

interface IndexPageProps {
  props: any;
  session: Session;
}

const PROPS_CACHE_KEY = "indexProps";

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

export default function Index(props: IndexPageProps) {
  const session = useSession();
  const initTags = useStore((state) => state.initTags);

  useEffect(() => {
    if (session.data)
      getTags(session.data.user.id).then((tags) =>
        initTags(tags, session.data.user.id)
      );
  }, [session.data, initTags]);

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>
      <ThemeProvider theme={lightTheme}>
        <SelectedTagProvider>
          <EditModeProvider>
            <MainScene />
          </EditModeProvider>
        </SelectedTagProvider>
      </ThemeProvider>
    </>
  );
}
