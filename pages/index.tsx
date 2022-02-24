import Head from "next/head";
import { useRouter } from "next/router";
import { getSession, SessionProvider, useSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { TagsProvider } from "src/context/TagsContext";
import { MainScene } from "../src/scenes";
import Link from "next/link";
import { SelectedTagProvider } from "src/context/SelectedTagContext";
import { EditModeProvider } from "src/context/EditModeContext";
import { TweetProvider } from "src/context/TweetsContext";
// Next SSR
import { fetchTweetAst } from "static-tweets";
import type { GetServerSideProps } from "next";
import { getTwitterApi } from "lib/twitter";
import getMongoConnection from "lib/mongodb";
import UserModel from "models/User";
import cache from "memory-cache";
import { TweetV2, Tweetv2ListResult } from "twitter-api-v2";
import { TwitterLogin } from "src/components";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession();
  if (session?.user) {
    return {
      redirect: {
        permanent: false,
        destination: "/collection",
      },
    };
  }

  return { props: {} };
};

export default function Index() {
  const router = useRouter();

  if (router.query["error"] !== undefined) {
    return (
      <div className="main">
        <h1>Oh noes something went wrong</h1>
        <Link href="/">Return to home</Link>
      </div>
    );
  } else {
    return (
      <>
        <Head>
          <title>Twitter Art Collection</title>
        </Head>
        <p>Welcome!</p>
        <TwitterLogin />
      </>
    );
  }
}
