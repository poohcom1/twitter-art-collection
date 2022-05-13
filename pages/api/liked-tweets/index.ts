import { authOptions } from "lib/nextAuth";
import { storeTweetCache, useRedis } from "lib/redis";
import {
  createTweetObjects,
  getTwitterApi,
  TWEET_OPTIONS,
} from "lib/twitter/twitter";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [twitterApi, session] = await Promise.all([
    getTwitterApi(),
    getServerSession({ req, res }, authOptions),
  ]);

  if (!session) {
    return res.status(401).end();
  }

  const pagination_token = (req.query.token as string) ?? undefined;

  try {
    const payload = await twitterApi.v2.userLikedTweets(session.user.id, {
      ...TWEET_OPTIONS,
      pagination_token,
    });

    const token = payload.data.meta?.next_token || undefined;

    const tweets = createTweetObjects(payload.data);

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
