import Redis from "ioredis";
import { tweetIdsToSchema } from "./twitter";


export async function getTweetCache(
  redis: Redis,
  tweetIds: string[]
): Promise<TweetSchema[]> {
  const tweets = tweetIdsToSchema(tweetIds);
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

const TTL = 30 * 24 * 3600;

export async function storeTweetCache(
  redis: Redis,
  tweets: TweetSchema[]
) {
  const redisKeypairs: Record<string, string> = {};

  for (const tweet of tweets) {
    if (tweet.data) {
      redisKeypairs[tweet.id] = JSON.stringify(tweet.data);
    }
  }

  const setCommands: [name: string, ...args: unknown[]][] = tweets.map(
    (tweet) => ["set", tweet.id, JSON.stringify(tweet.data), "ex", TTL]
  );

  await redis.multi(setCommands).exec();
}
