import { storeTweetCache, useRedis } from "lib/redis";
import {
  tweetSchemasFromPayload,
  getTwitterOAuth,
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

  const twitterApi = await getTwitterOAuth(user);

  const pagination_token = (req.query.token as string) ?? undefined;

  try {
    const payload = await twitterApi.v2.userLikedTweets(user.uid, {
      ...TWEET_OPTIONS,
      pagination_token,
    });

    const token = payload.data.meta?.next_token || undefined;

    const tweets = tweetSchemasFromPayload(payload.data);

    await useRedis(storeTweetCache(tweets));

    const response: TweetsResponse = {
      nextToken: token,
      tweets,
    };

    res.send(response);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error! Failed to fetch liked tweets!");
  }
}
