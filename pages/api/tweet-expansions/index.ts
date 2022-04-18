import {
  completeTweetFields,
  findDeletedTweets,
  getTwitterApi,
  TWEET_OPTIONS,
} from "lib/twitter";
import Redis from "ioredis";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getTweetCache, storeTweetCache } from "lib/redis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.ids) {
    return res.send([]);
  }
  const redis = process.env.REDIS_URI ? new Redis() : null;

  if (!redis) {
    console.warn("Redis not configure! Please add redis url to the REDIS_URL env var");
  }

  const tweetIds: string[] = (req.query.ids as string).split(",");

  const tweets = await getTweetCache(redis, tweetIds);

  const twitterClient = await getTwitterApi();

  // Tweets not in cache
  const partialTweet = tweets.filter((t) => !t.data);
  const partialTweetIds = partialTweet.map((t) => t.id);

  console.log("Cache hit: " + (tweets.length - partialTweetIds.length));

  if (partialTweetIds.length > 0) {
    try {
      const payload = await twitterClient.v2.tweets(
        partialTweetIds,
        TWEET_OPTIONS
      );

      const deletedTweets = findDeletedTweets(partialTweet, payload.data);
      const deletedTweetIds = deletedTweets.map((t) => t.id);

      if (deletedTweets.length > 0) {
        const session = await getSession({ req });

        if (session) {
          // TODO Delete deleted ids
          // try {
          //   await UserModel.updateOne(
          //     {
          //       uid: session.user.id,
          //     },
          //     {
          //       $pull: {
          //         tweetIds: {
          //           $in: deletedTweetIds,
          //         },
          //         "tags.$[].images": {
          //           $in: deletedTweetIds,
          //         },
          //       },
          //     }
          //   );
          // } catch (e) {
          //   console.error("Database error: " + e);
          //   return res.status(500).send("Database error");
          // }
        }
      }

      completeTweetFields(tweets, payload);
      deletedTweets.forEach((t) => (t.deleted = true));
    } catch (e) {
      console.error("Twitter API error:" + e);
      return res.status(500).send("Twitter API error");
    }
  }

  await storeTweetCache(redis, tweets);

  redis?.quit();

  // End
  res.send(tweets);
}
