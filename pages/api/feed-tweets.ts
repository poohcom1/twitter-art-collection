import { storeTweetCache, useRedis } from "lib/redis";
import {
  getTwitterOAuth,
  tweetSchemasFromPayload,
  TWEET_OPTIONS,
} from "lib/twitter/twitter";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getToken({ req });

  if (!user) {
    return res.status(401).end();
  }

  await useRedis(async (redis) => {
    const twitterApi = await getTwitterOAuth(user, redis);

    const pagination_token = (req.query.token as string) ?? undefined;

    try {
      const payload = await twitterApi.v2.homeTimeline({
        ...TWEET_OPTIONS,
        pagination_token,
        // TODO: Add this to user options
        exclude: ["replies", "retweets"],
      });

      const token = payload.data.meta?.next_token || undefined;

      const tweets = tweetSchemasFromPayload(payload.data);

      await storeTweetCache(tweets)(redis);

      const response: TweetsResponse = {
        nextToken: token,
        tweets,
      };

      res.send(response);
    } catch (e) {
      console.error(e);
      res.status(500).send("Server error! Failed to fetch liked tweets!");
    }
  });
}
