import { authOptions } from "lib/nextAuth";
import { getTwitterApi } from "lib/twitter";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { fetchTweetAst } from "static-tweets";
import type {
  TweetV2,
  Tweetv2ListResult,
  TweetV2PaginableListParams,
} from "twitter-api-v2";

/**
 * Predicate to filter for only tweets with photo media
 * @param payloadData
 * @returns
 */
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
  const session = await getServerSession({ req, res }, authOptions);

  try {
    if (session) {
      const twitterApi = await getTwitterApi();

      // Set options
      const userLikedTweetsOptions: Partial<TweetV2PaginableListParams> = {
        expansions: ["attachments.media_keys"],
        "media.fields": ["url"],
      };

      if (req.query.nextToken) {
        userLikedTweetsOptions["pagination_token"] = req.query
          .nextToken as string;
      }

      // Make API call
      const payload = await twitterApi.v2.userLikedTweets(
        session.user.id,
        userLikedTweetsOptions
      );

      const next_token = payload.data.meta.next_token;

      // Fetch asts
      const likedTweetsIds = payload.data.data
        .filter(filterTweets(payload.data))
        .map((tweet) => tweet.id);

      const tweetDataAsts = await Promise.all(
        likedTweetsIds.map((id) => fetchTweetAst(id))
      );

      const responseObject: LikedTweetResponse = {
        tweets: [],
        next_token,
      };

      for (let i = 0; i < likedTweetsIds.length; i++) {
        if (tweetDataAsts[i]) {
          responseObject.tweets.push({
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
