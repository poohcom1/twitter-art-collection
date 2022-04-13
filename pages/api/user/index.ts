import getMongoConnection from "lib/mongodb";
import { authOptions } from "lib/nextAuth";
import {
  completeTweetFields,
  filterTweets,
  getTwitterApi,
  mergeTweets,
  tweetIdsToSchema,
  TWEET_OPTIONS,
} from "lib/twitter";
import UserModel from "models/User";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { fetchTweetAst } from "static-tweets";
import { ApiResponseError } from "twitter-api-v2";
import { methodHandler } from "lib/restAPI";

export default methodHandler({
  GET: getUser,
  POST: postUser,
});

async function getUser(req: NextApiRequest, res: NextApiResponse) {
  const [twitterApi, session, _mongoConnection] = await Promise.all([
    getTwitterApi(),
    getServerSession({ req, res }, authOptions),
    getMongoConnection(),
  ]);

  try {
    if (session) {
      /* ------------------------------ User Database ----------------------------- */
      const user = await UserModel.findOne({ uid: session!.user.id }).lean();

      if (!user) {
        console.log("[GET USER] New user found.");

        const newUserResponse: UserDataResponse = {
          newUser: true,

          tweets: [],
          tags: new Map(),
        };

        return res.send(newUserResponse);
      }

      const databaseTweetIds = user.tweetIds;

      /* ------------------------------- Twitter API ------------------------------ */
      /// Make API call
      const payload = await twitterApi.v2.userLikedTweets(
        session.user.id,
        TWEET_OPTIONS
      );

      const newTweetIds = payload.data.data
        .filter(filterTweets(payload.data))
        .map((tweet) => tweet.id);

      // Merge tweets
      const tweetIds = mergeTweets(newTweetIds, databaseTweetIds);

      if (tweetIds.length === newTweetIds.length + databaseTweetIds.length) {
        // TODO Database sync
      }

      const tweets: TweetSchema[] = tweetIds.map((id) => ({
        id,
        platform: "twitter",
        ast: null,
      }));

      /* ------------------------------- Tweet ASTs (unused) ------------------------------- */

      // TODO Figure out limit
      if (req.query.ast === "true") {
        const FETCH_AST_LOG = `[GET USER] AST fetch n=${tweetIds.length}`;

        console.time(FETCH_AST_LOG);
        const tweetDataAsts = await Promise.all(
          tweetIds.map((id) => fetchTweetAst(id))
        );

        console.timeEnd(FETCH_AST_LOG);

        for (let i = 0; i < tweetDataAsts.length; i++) {
          if (tweetDataAsts[i]) {
            tweets[i].ast = tweetDataAsts[i];
          }
        }
      }

      /* ---------------------------- Tweet Expansions ---------------------------- */
      completeTweetFields(tweets, payload.data);

      const responseObject: UserDataResponse = {
        tweets: tweets as TweetSchema[],
        tags: user.tags,
      };

      res.status(200).send(responseObject);
    } else {
      res.status(400).send("Error");
    }
  } catch (e) {
    if (e instanceof ApiResponseError) {
      if (e.code === 429) {
        console.error("[GET USER] API Limit Reached");
        return res.status(429).send("Too many tweets");
      }
    }

    console.error(e);
    res.status(500).send("Server Error");
  }
}

async function postUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [twitterApi, session, _mongoConnection] = await Promise.all([
      getTwitterApi(),
      getServerSession({ req, res }, authOptions),
      getMongoConnection(),
    ]);

    if (!session) {
      console.error("[GET USER] Invalid session get attempt");
      return res.status(401).send("Forbidden");
    }

    try {
      const payload = await twitterApi.v2.userLikedTweets(
        session.user.id,
        TWEET_OPTIONS
      );
      await payload.fetchLast();

      if (payload.rateLimit) {
        console.error(payload.rateLimit);
      }

      const tweetIds = payload.data.data
        .filter(filterTweets(payload.data))
        .map((tweet) => tweet.id);

      console.log(tweetIds.length);

      const user = new UserModel({
        uid: session!.user.id,
        tags: new Map(),
        tweetIds: tweetIds,
      });

      try {
        await user.save();

        console.log("[POST USER] User successfully created");

        const response: UserDataResponse = {
          tweets: tweetIdsToSchema(tweetIds),
          tags: new Map(),
        };
        return res.send(response);
      } catch (e) {
        console.error("[POST USER] Database error: " + e);
        return res.status(500).send("Failed to create user on database: " + e);
      }
    } catch (e) {
      console.error("[POST USER] Fetch error: " + e);
      return res.status(500).send("Failed to fetch tweets");
    }
  } catch (e) {
    console.error("[POST USER] Service error: " + e);
    return res.status(500).send("Database or API error");
  }
}
