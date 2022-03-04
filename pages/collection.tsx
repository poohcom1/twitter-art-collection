import Head from "next/head";
import "react-static-tweets/styles.css";
import { ThemeProvider } from "styled-components";
import { MainScene } from "src/scenes";
import { lightTheme } from "src/themes";
// Next SSR
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/nextAuth";

// Redirect to about if not signed in
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context, authOptions);

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
        <link
          rel="canonical"
          href="https://twitter-art-collection.vercel.app/collection"
        />
      </Head>
      <ThemeProvider theme={lightTheme}>
        <MainScene />
      </ThemeProvider>
    </>
  );
}
