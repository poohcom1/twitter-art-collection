import getMongoConnection from "lib/mongodb";
import { authOptions } from "lib/nextAuth";
import { filterTweets, updateAndFindOrphans, getTwitterApi } from "lib/twitter";
import UserModel from "models/User";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { fetchTweetAst } from "static-tweets";
import type { TweetV2PaginableListParams } from "twitter-api-v2";

const pagination_count = 100;

/**
 * Responds with an object containing paginated tweets, next token, and deleted tweets
 * @param req.query.nextToken Next token for the Twitter API. Required as url parameter
 * @param req.query.page Page for pagination. Only used for data syncing and caching
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession({ req, res }, authOptions);

  await getMongoConnection();

  try {
    if (session) {
      const twitterApi = await getTwitterApi();

      // Set options
      const userLikedTweetsOptions: Partial<TweetV2PaginableListParams> = {
        expansions: ["attachments.media_keys"],
        "media.fields": ["url"],
        max_results: pagination_count,
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

      // Check for orphaned tweets
      if (!req.query.page || typeof req.query.page !== "string") {
        res
          .status(500)
          .send("Page path parameter is missing or is not a string!");
        return;
      }

      const user = await UserModel.findOne({ uid: session.user.id });

      if (!user) {
        res
          .status(500)
          .send("User does not exist. Something went very wrong lmao");
        return;
      }

      const { deleted: deletedTweetIds } = updateAndFindOrphans(
        user.tweetIds,
        likedTweetsIds,
        parseInt(req.query.page),
        pagination_count
      );

      // TODO sync when one pages > 0

      const responseObject: LikedTweetResponse = {
        tweets: tweetAsts as TweetSchema[],
        next_token,
        deletedTweetIds,
      };

      res.status(200).send(responseObject);
    } else {
      res.status(200).send([]);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Server Error");
  }
}
