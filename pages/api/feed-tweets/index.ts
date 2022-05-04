import { authOptions } from "lib/nextAuth";
import { getTwitterApi } from "lib/twitter";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

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
  const [twitterApi, session] = await Promise.all([
    getTwitterApi(),
    getServerSession({ req, res }, authOptions),
  ]);

  if (!session) {
    return res.status(401).end();
  }

  const since_id = (req.query.token as string) ?? undefined;

  try {
    // Access error?
    const payload = await twitterApi.v1.homeTimeline({ since_id });

    const tweetsV1 = payload.tweets.filter((tweet) =>
      tweet.entities.media?.find((media) => media.type === "photo")
    );

    const tweets: TweetSchema[] = [];

    for (const tweet of tweetsV1) {
      tweets.push({
        id: tweet.id + "",
        platform: "twitter",
        data: {
          id: tweet.id + "",
          url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id}`,
          avatar: tweet.user.profile_image_url_https,
          name: tweet.user.name,
          username: tweet.user.screen_name,
          date: tweet.created_at,
          content: {
            text: tweet.text,
            media: tweet.entities.media?.map((media) => ({
              url: media.display_url,
              width: 100,
              height: 100,
            })),
          },
        },
      });
    }

    const response: TweetsResponse = {
      nextToken: tweets[tweets.length - 1].id,
      tweets,
    };

    res.send("Not implemented");
  } catch (e) {
    console.error(e);
    res.status(500).send("Not implemented");
  }
}
