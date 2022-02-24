import Head from "next/head";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";
import "react-static-tweets/styles.css";
import { TagsProvider } from "src/context/TagsContext";
import { MainScene } from "../src/scenes";
import Link from "next/link";
import { SelectedTagProvider } from "src/context/SelectedTagContext";
import { EditModeProvider } from "src/context/EditModeContext";
// Next SSR
import { fetchTweetAst } from "static-tweets";
import type { GetServerSideProps } from "next";
import { getTwitterApi } from "lib/twitter";
import getMongoConnection from "lib/mongodb";
import UserModel from "models/User";
import cache from "memory-cache";
import { TweetProvider } from "src/context/TweetsContext";
import { TweetV2, Tweetv2ListResult } from "twitter-api-v2";

interface IndexPageProps {
  tweetData: { id: string; ast: any }[];
  tags: Record<string, TagSchema>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Get tweets
  const props: IndexPageProps = {
    tweetData: [],
    tags: {},
  };

  if (session?.user) {
    await getMongoConnection();

    await UserModel.findOneAndUpdate(
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

    const user = await UserModel.findOne({ uid: session.user.id });

    if (!user?.tags) {
      throw new Error("Tags not found!");
    }

    props.tags = Object.fromEntries(user.tags);

    let likedTweetsIds: string[] = [];

    if (cache.get("tweetIds")) {
      console.info("Retreiving tweets from memory cache");
      likedTweetsIds = cache.get("tweetIds");
    } else {
      const twitterApi = await getTwitterApi();

      const payload = await twitterApi.v2.userLikedTweets(session.user.id, {
        expansions: ["attachments.media_keys"],
        "media.fields": ["url"],
      });

      likedTweetsIds = payload.data.data
        .filter(filterTweets(payload.data))
        .map((tweet) => tweet.id);

      cache.put("tweetIds", likedTweetsIds, 1000 * 60 * 60 * 24);
    }

    const tweetDataAsts = await Promise.all(
      likedTweetsIds.map((id) => fetchTweetAst(id))
    );

    for (let i = 0; i < likedTweetsIds.length; i++) {
      if (tweetDataAsts[i]) {
        props.tweetData.push({
          id: likedTweetsIds[i],
          ast: tweetDataAsts[i],
        });
      }
    }
  }

  return {
    props,
  };
};

const filterTweets = (payloadData: Tweetv2ListResult) => (tweet: TweetV2) => {
  if (!tweet.attachments) {
    return false;
  }

  const keys = tweet.attachments?.media_keys;

  for (const key of keys!) {
    const media = payloadData.includes?.media?.find(
      (obj) => obj.media_key === key
    );

    if (media?.type === "photo") return true;
  }
  return false;
};

export default function Index(props: IndexPageProps) {
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
        <TweetProvider value={props.tweetData}>
          <TagsProvider tags={new Map(Object.entries(props.tags))}>
            <SelectedTagProvider>
              <EditModeProvider>
                <MainScene />
              </EditModeProvider>
            </SelectedTagProvider>
          </TagsProvider>
        </TweetProvider>
      </>
    );
  }
}
