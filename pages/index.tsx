import Head from "next/head";
import { getSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import styled, { ThemeProvider } from "styled-components";
import { lightTheme } from "src/themes";
import Image from "next/image";
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

const MainDiv = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: row;
`;

const SampleImageDiv = styled.div`
  overflow: hidden;
  border-radius: 15px;
`;

export default function Index() {
  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
        <meta
          name="description"
          content="Organize your Twitter art and photos."
        />

        <link
          rel="canonical"
          href="https://twitter-art-collection.vercel.app/"
        />
      </Head>
      <ThemeProvider theme={lightTheme}>
        <MainDiv>
          <div>
            <h2>Twitter Art Collection</h2>
            <h1>A place to organized photo and artworks from Twitter!</h1>
            <div>
              <TwitterLogin />
            </div>
          </div>
          <SampleImageDiv>
            <Image
              src="/assets/sample_image.png"
              alt="Sample image"
              width={1901}
              height={904}
            />
          </SampleImageDiv>
        </MainDiv>
      </ThemeProvider>
    </>
  );
}
