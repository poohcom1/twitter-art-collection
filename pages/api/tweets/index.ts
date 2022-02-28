import { getTwitterApi } from "lib/twitter";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { fetchTweetAst } from "static-tweets";
import type { TweetV2, Tweetv2ListResult } from "twitter-api-v2";

const filterTweets = (payloadData: Tweetv2ListResult) => (tweet: TweetV2) => {
  if (!tweet.attachments) {
    return false;
  }

  const keys = tweet.attachments?.media_keys;

  for (const key of keys!) {
    const media = payloadData.includes?.media?.find(
      (obj) => obj.media_key === key
    );

    if (media?.type === "photo") return true;
  }
  return false;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  try {
    if (session) {
      const twitterApi = await getTwitterApi();

      const payload = await twitterApi.v2.userLikedTweets(session.user.id, {
        expansions: ["attachments.media_keys"],
        "media.fields": ["url"],
      });

      const likedTweetsIds = payload.data.data
        .filter(filterTweets(payload.data))
        .map((tweet) => tweet.id);

      const tweetDataAsts = await Promise.all(
        likedTweetsIds.map((id) => fetchTweetAst(id))
      );

      const responseObject: TweetSchema[] = [];

      for (let i = 0; i < likedTweetsIds.length; i++) {
        if (tweetDataAsts[i]) {
          responseObject.push({
            id: likedTweetsIds[i],
            ast: tweetDataAsts[i],
            platform: "twitter",
          });
        }
      }

      res.status(200).send(responseObject);
    } else {
      res.status(200).send([]);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Server Error");
  }
}
