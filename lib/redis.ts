import Redis from "ioredis";
import { tweetIdsToSchema } from "./twitter";

export async function getTweetCache(
  redis: Redis | null,
  tweetIds: string[]
): Promise<TweetSchema[]> {
  const tweets = tweetIdsToSchema(tweetIds);

  if (!redis) {
    return tweets;
  }

  const tweetData = await redis.mget(tweetIds);

  for (let i = 0; i < tweetData.length; i++) {
    const dataJSON = tweetData[i];
    if (dataJSON) {
      const data = JSON.parse(dataJSON);

      console.assert(data.id === tweets[i].id);

      tweets[i].data = data;
    }
  }

  return tweets;
}

export async function storeTweetCache(
  redis: Redis | null,
  tweets: TweetSchema[]
) {
  if (!redis) {
    return;
  }

  const redisKeypairs: Record<string, string> = {};

  for (const tweet of tweets) {
    if (tweet.data) {
      redisKeypairs[tweet.id] = JSON.stringify(tweet.data);
    }
  }

  await redis.mset(redisKeypairs);
}
