import Head from "next/head";
import { getSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { TagsProvider } from "src/context/TagsContext";
import { LoadingScene, MainScene } from "../src/scenes";
import { SelectedTagProvider } from "src/context/SelectedTagContext";
import { EditModeProvider } from "src/context/EditModeContext";
import { TweetProvider } from "src/context/TweetsContext";
// Next SSR
import type { GetServerSideProps } from "next";
import getMongoConnection from "lib/mongodb";
import UserModel from "models/User";
import cache from "memory-cache";
import { useEffect, useRef, useState } from "react";

interface IndexPageProps {
  tags: Record<string, TagSchema>;
  session: any;
}

const DO_CACHE = false;
const PROPS_CACHE_KEY = "indexProps";

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (DO_CACHE && cache.get(PROPS_CACHE_KEY)) {
    return { props: cache.get(PROPS_CACHE_KEY) };
  }

  const session = await getSession(context);

  // Get tweets
  const props: IndexPageProps = {
    tags: {},
    session,
  };

  if (session?.user) {
    console.time("MongoConnect");

    await getMongoConnection();

    console.timeEnd("MongoConnect");

    console.time("UserFetch");

    const user = await UserModel.findOneAndUpdate(
      { uid: session.user.id },
      {
        $setOnInsert: {
          uid: session.user.id,
          tags: {},
        },
      },
      {
        upsert: true,
      }
    );

    if (!user?.tags) {
      throw new Error("Tags not found!");
    }

    props.tags = Object.fromEntries(user.tags);

    console.timeEnd("UserFetch");

    cache.put(PROPS_CACHE_KEY, props, 1000 * 60 * 60 * 24);
  }

  return {
    props,
  };
};

export default function Collection(props: IndexPageProps) {
  const [loaded, setPageLoaded] = useState(false);

  const tweetDataRef: any = useRef();

  useEffect(() => {
    fetch("/api/tweets")
      .then((res) => res.json())
      .then((res) => {
        tweetDataRef.current = res.tweetData;
        setPageLoaded(true);
      });
  });

  return (
    <>
      <Head>
        <title>Twitter Art Collection</title>
      </Head>
      {loaded ? (
        <TweetProvider value={tweetDataRef.current}>
          <TagsProvider tags={new Map(Object.entries(props.tags))}>
            <SelectedTagProvider>
              <EditModeProvider>
                <MainScene />
              </EditModeProvider>
            </SelectedTagProvider>
          </TagsProvider>
        </TweetProvider>
      ) : (
        <LoadingScene />
      )}
    </>
  );
}
