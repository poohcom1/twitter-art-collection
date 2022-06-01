/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, RedisClientType } from "redis";
import { tweetIdsToSchema } from "./twitter/twitter";

export type RedisClient = RedisClientType<any, any, any>;

/**
 *
 * @returns Redis client or null if unable to connect
 */
async function initRedis(): Promise<RedisClient | null> {
  const redis = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 2) {
          console.error("Cannot connect to Redis, disabling caching");
          return new Error("Could not connect");
        }

        return 0;
      },
    },
  });

  try {
    await redis.connect();

    return redis;
  } catch (e: any) {
    if (e.code === "ECONNREFUSED") {
      console.log("Attempting to reconnect...");
    } else {
      console.error(e);
    }

    return null;
  }
}

/**
 * Received a callback with redis as the parameter.
 * The callback will only be call if there is redis can be connected to
 */
export async function useRedis<T>(
  callback: (redis: RedisClient | null) => Promise<T>
): Promise<T | void> {
  const redis = await initRedis();

  const data = await callback(redis);

  await redis?.quit();

  return data;
}

export const getTweetCache =
  (tweetIds: string[]) =>
  async (redis: RedisClient | null): Promise<TweetSchema[]> => {
    const tweets = tweetIdsToSchema(tweetIds);

    if (!redis) {
      return tweets;
    }

    const tweetData = tweetIds.length > 0 ? await redis.mGet(tweetIds) : [];

    for (let i = 0; i < tweetData.length; i++) {
      const dataJSON = tweetData[i];
      if (dataJSON) {
        const data = JSON.parse(dataJSON);

        console.assert(data.id === tweets[i].id);

        tweets[i].data = data;
      }
    }

    return tweets;
  };

const TTL = 30 * 24 * 3600;

export const storeTweetCache =
  (tweets: TweetSchema[]) => async (redis: RedisClient | null) => {
    if (!redis) {
      return;
    }

    const redisKeypairs: Record<string, string> = {};

    for (const tweet of tweets) {
      if (tweet.data) {
        redisKeypairs[tweet.id] = JSON.stringify(tweet.data);
      }
    }

    let command = redis.multi();

    tweets.forEach((tweet) => {
      command = command.setEx(tweet.id, TTL, JSON.stringify(tweet.data));
    });

    await command.exec();
  };
