/* eslint-disable @typescript-eslint/no-explicit-any */
import { RedisClientType } from "@node-redis/client";
import { createClient } from "redis";
import { tweetIdsToSchema } from "./twitter/twitter";

export async function getRedis(): Promise<RedisClientType<any, any> | null> {
  const redis = createClient({ url: process.env.REDIS_URL });

  redis.on("error", (e) => console.error(e));

  try {
    await redis.connect();

    return redis;
  } catch (e: any) {
    if (e.code === "ECONNREFUSED") {
      console.log("Cannot connect to Redis, disabling caching");
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
  callback: (redis: RedisClientType<any, any>) => Promise<T>
): Promise<T | void> {
  const redis = await getRedis();

  if (redis) {
    const data = await callback(redis);

    await redis.quit();

    return data;
  }
}

export const getTweetCache =
  (tweetIds: string[]) =>
  async (
    redis: RedisClientType<any, any> | undefined
  ): Promise<TweetSchema[]> => {
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
  (tweets: TweetSchema[]) =>
  async (redis: RedisClientType<any, any> | undefined) => {
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
