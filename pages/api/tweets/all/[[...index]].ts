import getMongoConnection from "lib/mongodb";
import { authOptions } from "lib/nextAuth";
import { filterTweets, getTwitterApi, mergeTweets } from "lib/twitter";
import UserModel from "models/User";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { fetchTweetAst } from "static-tweets";
import { TweetV2PaginableListParams, ApiResponseError } from "twitter-api-v2";

const PAGINATION_COUNT = 100;

const userLikedTweetsOptions: Partial<TweetV2PaginableListParams> = {
  expansions: ["attachments.media_keys"],
  "media.fields": ["url"],
  max_results: PAGINATION_COUNT,
};

/**
 * Responds with an object containing paginated tweets, next token, and deleted tweets
 * @param req.query.index Tweet index to fetch from. This is used as the pagination token if a backend is not present
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [twitterApi, session, _mongoConnection] = await Promise.all([
    getTwitterApi(),
    getServerSession({ req, res }, authOptions),
    getMongoConnection()
  ])

  try {
    if (session) {
      if (req.query.next_token) {
        userLikedTweetsOptions["pagination_token"] = req.query
          .index as string;
      }

      /* ------------------------------- Twitter API ------------------------------ */
      /// Make API call
      const payload = await twitterApi.v2.userLikedTweets(
        session.user.id,
        userLikedTweetsOptions
      );

      /// Fetch asts
      const newTweetIds = payload.data.data
        .filter(filterTweets(payload.data))
        .map((tweet) => tweet.id);

      /* ------------------------------ User Database ----------------------------- */
      const user = await UserModel.findOne({ uid: session!.user.id }).lean()

      const databaseTweetIds = user!.tweetIds

      /* ------------------------------- Tweet ASTs ------------------------------- */
      // Merge tweets
      const tweetIds = mergeTweets(newTweetIds, databaseTweetIds)

      if (tweetIds.length === newTweetIds.length + databaseTweetIds.length) {
        // TODO Database sync
      }

      const tweetDataAsts = await Promise.all(
        tweetIds.map((id) => fetchTweetAst(id))
      );

      const tweetAsts = [];

      for (let i = 0; i < tweetIds.length; i++) {
        if (tweetDataAsts[i]) {
          tweetAsts.push({
            id: tweetIds[i],
            ast: tweetDataAsts[i],
            platform: "twitter",
          });
        }
      }

      const responseObject: AllTweetsResponse = {
        tweets: tweetAsts as TweetSchema[],
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
