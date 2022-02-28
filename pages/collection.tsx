import Head from "next/head";
import { getSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { ThemeProvider } from "styled-components";
import { MainScene } from "src/scenes";
import { lightTheme } from "src/themes";
// Next SSR
import type { GetServerSideProps } from "next";

// Redirect to about if not signed in
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: { session },
  };
};

export default function Index() {
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
