import {
  completeTweetFields,
  getTwitterApi,
  tweetIdsToSchema,
  TWEET_OPTIONS,
} from "lib/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.ids) {
    return res.send([])
  }

  const tweetIds: string[] = (req.query.ids as string).split(",");

  const twitterClient = await getTwitterApi();

  const payload = await twitterClient.v2.tweets(tweetIds, TWEET_OPTIONS);

  if (!payload.includes) {
    return res.status(500).end();
  }

  const tweets = tweetIdsToSchema(tweetIds);

  completeTweetFields(tweets, payload);

  res.send(tweets);
}
