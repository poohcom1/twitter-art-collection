import { authOptions } from "lib/nextAuth";
import { filterTweets, getTwitterApi } from "lib/twitter";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { fetchTweetAst } from "static-tweets";
import { TweetV2PaginableListParams, ApiResponseError } from "twitter-api-v2";

const pagination_count = 100;

/**
 * Responds with an object containing paginated tweets, next token, and deleted tweets
 * @param req.query.nextToken Next token for the Twitter API. Required as url parameter
 */
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
        max_results: pagination_count,
      };

      if (req.query.next_token) {
        userLikedTweetsOptions["pagination_token"] = req.query
          .next_token as string;
      }

      // Make API call
      const payload = await twitterApi.v2.userLikedTweets(
        session.user.id,
        userLikedTweetsOptions
      );

      // Tweets all loaded
      // FIXME The documentation seem to suggest that next_token would be undefined when all tweets are loaded,
      //  but it seems to be the case that the payload data is null instead
      if (!payload.data.data) {
        const responseObject: AllTweetsResponse = {
          tweets: [],
        };

        return res.send(responseObject);
      }

      const next_token = payload.data.meta.next_token;

      // Fetch asts
      const likedTweetsIds = payload.data.data
        .filter(filterTweets(payload.data))
        .map((tweet) => tweet.id);

      const tweetDataAsts = await Promise.all(
        likedTweetsIds.map((id) => fetchTweetAst(id))
      );

      const tweetAsts = [];

      for (let i = 0; i < likedTweetsIds.length; i++) {
        if (tweetDataAsts[i]) {
          tweetAsts.push({
            id: likedTweetsIds[i],
            ast: tweetDataAsts[i],
            platform: "twitter",
          });
        }
      }

      const responseObject: AllTweetsResponse = {
        tweets: tweetAsts as TweetSchema[],
        next_token,
      };

      res.status(200).send(responseObject);
    } else {
      res.status(400).send([]);
    }
  } catch (e) {
    if (e instanceof ApiResponseError) {
      if (e.code === 429) {
        return res.status(429).send("Too many tweets");
      }
    }

    console.error(e);
    res.status(500).send("Server Error");
  }
}
