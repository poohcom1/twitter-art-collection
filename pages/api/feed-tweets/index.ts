import { tweetExpansions } from "lib/twitter";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { TwitterApi } from "twitter-api-v2";

/**
 * Not working
 * @param req ;
 * @param res
 * @returns
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getToken({ req });

  if (!user) {
    return;
  }

  const twitterApi = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: user.twitter?.oauth_token as string,
    accessSecret: user.twitter?.oauth_token_secret as string,
  });

  const since_id = (req.query.token as string) ?? undefined;

  try {
    const payload = await twitterApi.v1.homeTimeline({ since_id });

    const tweetsV1 = payload.tweets.filter((tweet) =>
      tweet.entities.media?.find((media) => media.type === "photo")
    );

    const tweets = await tweetExpansions(
      tweetsV1.map((t) => t.id_str),
      user.uid
    );

    const response: TweetsResponse = {
      nextToken: tweets[tweets.length - 1].id,
      tweets,
    };

    res.send(response);
  } catch (e) {
    console.error(e);
    res.status(500).send("");
  }
}
