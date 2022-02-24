import Head from "next/head";
import { getSession, useSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { TagsProvider } from "src/context/TagsContext";
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

export default function Collection(props: IndexPageProps) {
  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>
      <ThemeProvider theme={lightTheme}>
        <TagsProvider>
          <SelectedTagProvider>
            <EditModeProvider>
              <MainScene />
            </EditModeProvider>
          </SelectedTagProvider>
        </TagsProvider>
      </ThemeProvider>
    </>
  );
}
