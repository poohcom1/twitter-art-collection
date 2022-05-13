import {
  completeTweetFields,
  findDeletedTweets,
  getTwitterApi,
  TWEET_OPTIONS,
} from "lib/twitter/twitter";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getRedis, getTweetCache, storeTweetCache } from "lib/redis";
import { getMongoConnection, removeDeletedTweets } from "lib/mongodb";

async function v1(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query.ids) {
    return res.send([]);
  }
  const redis = await getRedis();

  const tweetIds: string[] = (req.query.ids as string).split(",");

  const tweets = await getTweetCache(tweetIds)(redis);

  const twitterClient = await getTwitterApi();

  // Tweets not in cache
  const partialTweet = tweets.filter((t) => !t.data);
  const partialTweetIds = partialTweet.map((t) => t.id);

  console.log(
    `Cache hit: ${tweets.length - partialTweetIds.length}/${tweetIds.length}`
  );

  if (partialTweetIds.length > 0) {
    try {
      const payload = await twitterClient.v2.tweets(
        partialTweetIds,
        TWEET_OPTIONS
      );

      const deletedTweets = findDeletedTweets(partialTweet, payload.data);
      const deletedTweetIds = deletedTweets.map((t) => t.id);

      if (deletedTweets.length > 0) {
        console.log("Deleting tweets: " + deletedTweetIds);

        const [session, _mongo] = await Promise.all([
          getSession({ req }),
          getMongoConnection(),
        ]);

        if (session) {
          await removeDeletedTweets(session.user.id, deletedTweetIds);
        }
      }

      completeTweetFields(tweets, payload);
      deletedTweets.forEach((t) => (t.deleted = true));
    } catch (e) {
      console.error("Twitter API error:" + e);
      return res.status(500).send("Twitter API error");
    }

    await storeTweetCache(tweets)(redis);
  }

  await redis?.quit();

  // End
  res.send(tweets);
}

export default async function v2(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query.ids) {
    return res.send([]);
  }
  const redis = await getRedis();

  const tweetIds: string[] = (req.query.ids as string).split(",");

  let tweets = await getTweetCache(tweetIds)(redis);

  const twitterClient = await getTwitterApi();

  // Tweets not in cache
  const partialTweet = tweets.filter((t) => !t.data);
  const partialTweetIds = partialTweet.map((t) => t.id);

  console.log(
    `Cache hit: ${tweets.length - partialTweetIds.length}/${tweetIds.length}`
  );

  if (partialTweetIds.length > 0) {
    try {
      const payload = await twitterClient.v2.tweets(
        partialTweetIds,
        TWEET_OPTIONS
      );

      const deletedTweets = findDeletedTweets(partialTweet, payload.data);
      const deletedTweetIds = deletedTweets.map((t) => t.id);

      if (deletedTweets.length > 0) {
        console.log("Deleting tweets: " + deletedTweetIds);

        const [session, _mongo] = await Promise.all([
          getSession({ req }),
          getMongoConnection(),
        ]);

        if (session) {
          await removeDeletedTweets(session.user.id, deletedTweetIds);
        }
      }

      completeTweetFields(tweets, payload);
      tweets = tweets.filter((t) => !deletedTweetIds.includes(t.id));
    } catch (e) {
      console.error("Twitter API error:" + e);
      return res.status(500).send("Twitter API error");
    }

    await storeTweetCache(tweets)(redis);
  }

  await redis?.quit();

  // End
  res.send(tweets);
}
