import { authOptions } from "lib/nextAuth";
import { createTweetObjects, getTwitterApi, TWEET_OPTIONS } from "lib/twitter";
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

  const payload = await twitterApi.v2.userLikedTweets(session.user.id, {
    ...TWEET_OPTIONS,
    pagination_token,
    max_results: 50,
  });

  const token = payload.data.meta.next_token;

  const tweets = createTweetObjects(payload.data);

  const response: TweetsResponse = {
    nextToken: token,
    tweets,
  };

  res.send(response);
}
