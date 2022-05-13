/* eslint-disable @typescript-eslint/no-explicit-any */
import TwitterApi, {
  TweetV2,
  Tweetv2FieldsParams,
  Tweetv2ListResult,
  TweetV2LookupResult,
  TwitterApiReadOnly,
  TwitterRateLimit,
} from "twitter-api-v2";
import type TwitterApiv2ReadOnly from "twitter-api-v2/dist/v2/client.v2.read";
import {
  TwitterApiRateLimitPlugin,
  ITwitterApiRateLimitGetArgs,
  ITwitterApiRateLimitSetArgs,
  ITwitterApiRateLimitStore,
  TwitterApiRateLimitPluginWithPrefixV2,
} from "@twitter-api-v2/plugin-rate-limit";
import TwitterApiCachePluginRedis from "@twitter-api-v2/plugin-cache-redis";
import { getRedis, useRedis } from "./redis";

let cachedApi: TwitterApiReadOnly | null = null;
let cachePlugin: TwitterApiCachePluginRedis | null = null;
let rateLimitPlugin: TwitterApiRateLimitRedisPlugin | null = null;

async function initTwitter() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    throw new Error("Missing TWITTER_BEARER_TOKEN environment variables!");
  }

  // Twitter setup
  const redis = await getRedis();

  const plugins = [];

  if (redis) {
    cachePlugin = new TwitterApiCachePluginRedis(redis);
    rateLimitPlugin = new TwitterApiRateLimitRedisPlugin();

    plugins.push(cachePlugin, rateLimitPlugin);
  }

  const client = new TwitterApi(bearerToken, {
    plugins,
  });

  return { client: client, rateLimitPlugin };
}

export async function getTwitterApi(): Promise<TwitterApiReadOnly> {
  if (cachedApi) {
    return cachedApi;
  }

  const twitterApi = await initTwitter();

  cachedApi = twitterApi.client;

  return cachedApi;
}

export async function getTwitterRateLimit(): Promise<TwitterApiRateLimitRedisPlugin | null> {
  if (rateLimitPlugin) {
    return rateLimitPlugin;
  }

  const twitterApi = await initTwitter();

  rateLimitPlugin = twitterApi.rateLimitPlugin;

  return rateLimitPlugin;
}

// Helper functions
/**
 * @deprecated
 * @param upstream
 * @param database
 * @returns
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
 * Generates TweetSchemas from a lookup payload
 * @param tweetPayloadData
 * @returns
 */
export function createTweetObjects(tweetPayloadData: Tweetv2ListResult) {
  if (!tweetPayloadData.includes) return [];

  const tweetSchemas: TweetSchema[] = [];

  const filteredTweetData = tweetPayloadData.data.filter(
    filterTweets(tweetPayloadData)
  );

  for (const tweetData of filteredTweetData) {
    const tweetSchema: TweetSchema = { id: tweetData.id, platform: "twitter" };

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
    };

    tweetSchemas.push(tweetSchema);
  }

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
  if (!tweetPayloadData.includes) {
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

export function findDeletedTweets(
  databaseTweets: TweetSchema[],
  apiFetchedTweet: TweetV2[] | undefined
): TweetSchema[] {
  if (!apiFetchedTweet) {
    return databaseTweets;
  } else {
    return databaseTweets.filter(
      (t_database) => !apiFetchedTweet.find((t_up) => t_up.id === t_database.id)
    );
  }
}

/* --------------------------------- Plugins -------------------------------- */

interface TwitterRateLimitTimeline extends TwitterRateLimit {
  time: number;
}

interface TimelineTwitterApiRateLimitPluginWithPrefixV2
  extends TwitterApiRateLimitPluginWithPrefixV2 {
  getRateLimitHistory(
    endpoint: string,
    method?: string
  ): Promise<RateLimitData | void>;
}

export type RateLimitData = TwitterRateLimitTimeline[];

export class TwitterApiRateLimitRedisPlugin extends TwitterApiRateLimitPlugin {
  declare store: RedisApiRateLimitStore;
  declare _v2Plugin: TimelineTwitterApiRateLimitPluginWithPrefixV2;

  constructor() {
    super(new RedisApiRateLimitStore());
  }

  getRateLimitHistory(args: ITwitterApiRateLimitGetArgs) {
    return this.store.getHistory(args);
  }

  get v2(): TimelineTwitterApiRateLimitPluginWithPrefixV2 {
    if (this._v2Plugin) {
      return this._v2Plugin;
    }
    return (this._v2Plugin =
      new (class extends TwitterApiRateLimitPluginWithPrefixV2 {
        declare plugin: TwitterApiRateLimitRedisPlugin;

        async getRateLimitHistory(
          endpoint: string,
          method?: string
        ): Promise<RateLimitData | void> {
          return await this.plugin.getRateLimitHistory({
            endpoint: "https://api.twitter.com/2/" + endpoint,
            method,
            plugin: this.plugin,
          });
        }
      })(this, "v2"));
  }
}

class RedisApiRateLimitStore implements ITwitterApiRateLimitStore {
  static getKey(
    args: Pick<ITwitterApiRateLimitGetArgs, "endpoint" | "method">
  ): string {
    return args.method + ":" + args.endpoint;
  }

  async set(args: ITwitterApiRateLimitSetArgs): Promise<void> {
    const key = RedisApiRateLimitStore.getKey(args);

    await useRedis(async (redis) => {
      const data = await redis.get(key);

      const parsedData: RateLimitData = data ? JSON.parse(data) : [];

      parsedData.push({ time: Date.now(), ...args.rateLimit });

      await redis.set(key, JSON.stringify(parsedData));
    });
  }

  async get(
    args: ITwitterApiRateLimitGetArgs
  ): Promise<void | TwitterRateLimit> {
    if (args.method) {
      const rateLimit = await useRedis(
        async (redis) => await redis.get(RedisApiRateLimitStore.getKey(args))
      );

      if (rateLimit) {
        const rateLimitData = JSON.parse(rateLimit) as RateLimitData;
        return rateLimitData[rateLimitData.length - 1];
      }
    }
  }

  async getHistory(
    args: ITwitterApiRateLimitGetArgs
  ): Promise<void | RateLimitData> {
    if (args.method) {
      const rateLimit = await useRedis(
        async (redis) => await redis.get(RedisApiRateLimitStore.getKey(args))
      );

      if (rateLimit) {
        return JSON.parse(rateLimit) as RateLimitData;
      }
    }
  }
}
