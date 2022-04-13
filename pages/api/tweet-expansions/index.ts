import { getTwitterApi, TWEET_OPTIONS } from "lib/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tweetIds: string[] = req.body;

  if (!req.body) {
  }

  const twitterClient = await getTwitterApi();

  const payload = await twitterClient.v2.tweets(tweetIds, TWEET_OPTIONS);

  const tweets: TweetExpansions[] = [];

  if (!payload.includes) {
    return res.status(500).end();
  }

  for (const tweetData of payload.data) {
    const user = payload.includes.users?.find(
      (user) => user.id === tweetData.author_id
    );

    tweets.push({
      id: tweetData.id,
      url: `https://twitter.com/twitter/status/${tweetData.id}`,
      avatar: user?.profile_image_url,
      name: user?.name,
      username: user?.username,
      date: tweetData.created_at,
      content: {
        text: tweetData.text,
        media: tweetData.attachments?.media_keys?.map(
          (key) =>
            payload.includes!.media!.find((m) => m.media_key === key)!.url!
        ),
      },
    });
  }

  res.send(tweets);
}
