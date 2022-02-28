import Head from "next/head";
import { getSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "src/themes";
// Next SSR
import type { GetServerSideProps } from "next";
import { TwitterLogin } from "src/components";

// Redirect to about if signed in
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: "/collection",
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
        <h1>Welcome to Twitter Art Collection!</h1>
        <div>
          <TwitterLogin />
        </div>
      </ThemeProvider>
    </>
  );
}
