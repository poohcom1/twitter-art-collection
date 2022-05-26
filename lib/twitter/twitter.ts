import {
  ITwitterApiClientPlugin,
  TweetV2,
  Tweetv2FieldsParams,
  Tweetv2ListResult,
  TweetV2LookupResult,
  TwitterApi,
  TwitterApiReadOnly,
} from "twitter-api-v2";
import type TwitterApiv2ReadOnly from "twitter-api-v2/dist/v2/client.v2.read";
import TwitterApiCachePluginRedis from "@twitter-api-v2/plugin-cache-redis";
import { getRedis, getTweetCache, storeTweetCache } from "../redis";
import RateLimitRedisPlugin from "./RateLimitRedisPlugin";
import { JWT } from "next-auth/jwt";

let cachedApi: TwitterApiReadOnly | null = null;

const bearerToken = process.env.TWITTER_BEARER_TOKEN;

async function getPlugins(userId?: string): Promise<ITwitterApiClientPlugin[]> {
  const plugins = [];

  const redis = await getRedis();

  if (redis) {
    plugins.push(new TwitterApiCachePluginRedis(redis));
    plugins.push(
      userId ? new RateLimitRedisPlugin(userId) : new RateLimitRedisPlugin()
    );
  }

  return plugins;
}

export async function getTwitterAppApi() {
  if (cachedApi) return cachedApi;

  if (!bearerToken)
    throw new Error("Missing TWITTER_BEARER_TOKEN environment variables!");

  const twitterApi = new TwitterApi(bearerToken, {
    plugins: await getPlugins(),
  });

  cachedApi = twitterApi;

  return cachedApi;
}

export async function getTwitterOAuth(user: JWT) {
  const twitterApi = new TwitterApi(
    {
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: user.twitter?.oauth_token as string,
      accessSecret: user.twitter?.oauth_token_secret as string,
    },
    {
      plugins: await getPlugins(user.uid),
    }
  );

  return twitterApi;
}

/* ---------------------------- Helper functions ---------------------------- */

/**
 * Predicate to filter for only tweets with photo media
 * @param payloadData
 * @returns
 */
export const filterTweets =
  (payloadData: Tweetv2ListResult) => (tweet: TweetV2) => {
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

export function tweetIdsToSchema(ids: string[]): TweetSchema[] {
  return ids.map((id) => ({ id, platform: "twitter" }));
}

/**
 * Given the tweetIds, fetch and create TweetSchema objects
 * @param tweetIds
 * @param userIdToCheckDeleted Pass the userId to check remove tweets that has been deleted from user's tags
 * @returns
 */
export async function tweetExpansions(
  tweetIds: string[],
  userIdToCheckDeleted?: string
): Promise<TweetSchema[]> {
  const redis = await getRedis();

  const tweets = redis
    ? await getTweetCache(tweetIds)(redis)
    : tweetIdsToSchema(tweetIds);

  const twitterApi = await getTwitterAppApi();

  // Tweets not in cache
  const partialTweet = tweets.filter((t) => !t.data);
  const partialTweetIds = partialTweet.map((t) => t.id);

  console.log(
    `Cache hit: ${tweets.length - partialTweetIds.length}/${tweetIds.length}`
  );

  if (partialTweetIds.length > 0) {
    try {
      const payload = await twitterApi.v2.tweets(
        partialTweetIds,
        TWEET_OPTIONS
      );

      if (userIdToCheckDeleted) {
        const deletedTweets = findDeletedTweets(partialTweet, payload.data);
        const deletedTweetIds = deletedTweets.map((t) => t.id);

        if (deletedTweets.length > 0) {
          console.log("Deleting tweets: " + deletedTweetIds);

          const mongoLib = await import("lib/mongodb");

          await mongoLib.getMongoConnection();

          await mongoLib.removeDeletedTweets(
            userIdToCheckDeleted,
            deletedTweetIds
          );
        }
      }

      completeTweetFields(tweets, payload);
    } catch (e) {
      console.error("Twitter API error: " + e);
    }

    redis && (await storeTweetCache(tweets)(redis));
  }

  await redis?.quit();

  return tweets.filter(
    (t) =>
      t.data?.content.media && t.data.content.media.every((m) => m.url !== "")
  );
}

export function tweetSchemasFromPayload(tweetPayloadData: Tweetv2ListResult) {
  const tweetSchemas = tweetIdsToSchema(
    tweetPayloadData.data
      .filter(filterTweets(tweetPayloadData))
      .map((t) => t.id)
  );

  completeTweetFields(tweetSchemas, tweetPayloadData);

  return tweetSchemas;
}

/**
 * Complete missing data fields of tweets schemas with data from a lookup payload
 * @param tweets
 * @param tweetPayloadData
 * @returns
 */
export function completeTweetFields(
  tweets: TweetSchema[],
  tweetPayloadData: TweetV2LookupResult
) {
  if (!tweetPayloadData.includes || tweets.length === 0) {
    return;
  }

  for (const tweetData of tweetPayloadData.data) {
    const tweetSchema = tweets.find((tweet) => tweet.id === tweetData.id);

    if (!tweetSchema || tweetSchema.data) continue;

    const user = tweetPayloadData.includes.users?.find(
      (user) => user.id === tweetData.author_id
    );

    tweetSchema.data = {
      id: tweetData.id,
      url: `https://twitter.com/${user?.username}/status/${tweetData.id}`,
      avatar: user?.profile_image_url,
      name: user?.name,
      username: user?.username,
      date: tweetData.created_at,
      content: {
        text: tweetData.text,
        media: tweetData.attachments?.media_keys?.map((key) => {
          const img = tweetPayloadData.includes!.media!.find(
            (m) => m.media_key === key
          );

          return {
            url: img?.url ?? "",
            width: img?.width ?? 0,
            height: img?.height ?? 0,
          };
        }),
      },
      possibly_sensitive: tweetData.possibly_sensitive,
    };
  }
}

export const TWEET_OPTIONS: Partial<Tweetv2FieldsParams> = {
  "user.fields": ["name", "username", "url", "profile_image_url"],
  "tweet.fields": [
    "text",
    "created_at",
    "lang",
    "in_reply_to_user_id",
    "source",
  ],
  expansions: ["attachments.media_keys", "author_id"],
  "media.fields": ["url", "width", "height"],
};

/**
 * @deprecated
 */
export function mergeTweets<T>(upstream: T[], database: T[]) {
  for (let j = 0; j < database.length; j++) {
    for (let i = 0; i < upstream.length; i++) {
      if (upstream[i] === database[j]) {
        return upstream.slice(0, i).concat(database.slice(j));
      }
    }
  }

  return upstream.concat(database);
}

/**
 * @deprecated
 */
export async function fetchAndMergeTweets(
  twitterApi: TwitterApiv2ReadOnly,
  userId: string,
  databaseTweetIds: string[]
) {
  /// Make API call

  const payload = await twitterApi.userLikedTweets(userId, TWEET_OPTIONS);

  const lookupResults = [payload.data];

  let newTweetIds = payload.data.data
    .filter(filterTweets(payload.data))
    .map((tweet) => tweet.id);

  // Merge tweets
  let tweetIds = mergeTweets(newTweetIds, databaseTweetIds);

  while (
    payload.data.data.length !== 0 &&
    newTweetIds.length > 0 &&
    tweetIds.length === newTweetIds.length + databaseTweetIds.length
  ) {
    await payload.fetchNext();

    lookupResults.push(payload.data);

    newTweetIds = newTweetIds.concat(
      payload.data.data
        .filter(filterTweets(payload.data))
        .map((tweet) => tweet.id)
    );

    tweetIds = mergeTweets(newTweetIds, databaseTweetIds);
  }

  return { tweetIds, results: lookupResults };
}

/**
 * Returns list of tweets found in databaseTweets that are not found in fetchedTweets
 * @param databaseTweets
 * @param fetchedTweets
 * @returns
 */
export function findDeletedTweets(
  databaseTweets: TweetSchema[],
  fetchedTweets: TweetV2[] | undefined
): TweetSchema[] {
  if (!fetchedTweets) {
    return databaseTweets;
  } else {
    return databaseTweets.filter(
      (t_database) => !fetchedTweets.find((t_up) => t_up.id === t_database.id)
    );
  }
}
