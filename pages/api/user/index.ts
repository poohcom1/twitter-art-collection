import { authOptions } from "lib/nextAuth";
import {
  completeTweetFields,
  fetchAndMergeTweets,
  filterTweets,
  getTwitterApi,
  tweetIdsToSchema,
  TWEET_OPTIONS,
} from "lib/twitter";
import UserModel from "models/User";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { ApiResponseError } from "twitter-api-v2";
import { dbMethodHandler } from "lib/apiHelper";
import { storeTweetCache, useRedis } from "lib/redis";
import { convertDBTagToTag } from "lib/tagValidation";

export default dbMethodHandler({
  GET: getUserV2,
  POST: postUser,
});

/**
 * @deprecated
 * @param req
 * @param res
 * @returns
 */
async function getUser(req: NextApiRequest, res: NextApiResponse) {
  const [twitterApi, session] = await Promise.all([
    getTwitterApi(),
    getServerSession({ req, res }, authOptions),
  ]);

  try {
    if (session) {
      /* ------------------------------ User Database ----------------------------- */
      const user = await UserModel.findOne({ uid: session!.user.id });

      // New user
      if (!user) {
        console.log("[GET USER] New user found.");

        const newUserResponse: UserDataResponse = {
          newUser: true,

          tags: {},
          pinnedTags: [],
        };

        return res.send(newUserResponse);
      }

      const databaseTweetIds = user.tweetIds ?? [];

      /* ------------------------------- Twitter API ------------------------------ */
      const { tweetIds, results } = await fetchAndMergeTweets(
        twitterApi.v2,
        session.user.id,
        databaseTweetIds
      );
      // Update Database
      if (databaseTweetIds.length !== tweetIds.length) {
        user.tweetIds = tweetIds;

        await user.save();
      }

      const tweets: TweetSchema[] = tweetIds.map((id) => ({
        id,
        platform: "twitter",
        ast: null,
      }));

      /* ---------------------------- Tweet Expansions ---------------------------- */
      completeTweetFields(tweets, results[0]);

      await useRedis(storeTweetCache(tweets));

      const responseObject: UserDataResponse = {
        pinnedTags: user.pinnedTags,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
        return res
          .status(429)
          .send("Twitter isn't responding right now, please try again later!");
      }
    }

    console.error(e);
    res.status(500).send("Server Error");
  }
}

async function getUserV2(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req, res }, authOptions);

  try {
    if (!session) {
      res.status(500).send("Server auth Error");
    }
    /* ------------------------------ User Database ----------------------------- */
    const user = await UserModel.findOne({ uid: session!.user.id }).lean();

    // New user
    if (!user) {
      console.log("[GET USER] New user found.");

      const newUser = new UserModel({
        uid: session!.user.id,
        tags: {},
        pinnedTags: [],
      });

      await newUser.save();

      const response: UserDataResponse = {
        tags: {},
        pinnedTags: [],
      };

      return res.send(response);
    }

    // Fill out tag names
    const convertedTags: Record<string, TagSchema> = {};

    for (const [tagName, tag] of Object.entries(user.tags)) {
      convertedTags[tagName] = convertDBTagToTag(tag, { name: tagName });
    }

    const response: UserDataResponse = {
      tags: convertedTags,
      pinnedTags: user.pinnedTags,
    };

    return res.send(response);
  } catch (e) {
    res.status(500).send("Server Error");
  }
}

/**
 * @deprecated
 */
async function postUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [twitterApi, session] = await Promise.all([
      getTwitterApi(),
      getServerSession({ req, res }, authOptions),
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

      const user = new UserModel({
        uid: session!.user.id,
        tags: new Map(),
        tweetIds: tweetIds,
      });

      try {
        await user.save();

        console.log("[POST USER] User successfully created");

        const tweets = tweetIdsToSchema(tweetIds);

        completeTweetFields(tweets, payload.data);

        await useRedis(storeTweetCache(tweets));

        const response: UserDataResponse = {
          tags: {},
          pinnedTags: [],
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
