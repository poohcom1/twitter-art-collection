import { TwitterRateLimit } from "twitter-api-v2";
import {
  TwitterApiRateLimitPlugin,
  ITwitterApiRateLimitGetArgs,
  ITwitterApiRateLimitSetArgs,
  ITwitterApiRateLimitStore,
  TwitterApiRateLimitPluginWithPrefixV2,
  TwitterApiRateLimitPluginWithPrefixV1,
} from "@twitter-api-v2/plugin-rate-limit";
import { useRedis } from "../redis";

interface TwitterRateLimitTimeline extends TwitterRateLimit {
  time: number;
}

interface TimelineTwitterApiRateLimitPluginWithPrefixV1
  extends TwitterApiRateLimitPluginWithPrefixV1 {
  getRateLimitHistory(
    endpoint: string,
    method?: string
  ): Promise<RateLimitData | void>;
}

interface TimelineTwitterApiRateLimitPluginWithPrefixV2
  extends TwitterApiRateLimitPluginWithPrefixV2 {
  getRateLimitHistory(
    endpoint: string,
    method?: string
  ): Promise<RateLimitData | void>;
}

export type RateLimitData = TwitterRateLimitTimeline[];

class RedisApiRateLimitStore implements ITwitterApiRateLimitStore {
  constructor(protected userId?: string | undefined) {}

  /**
   * Schema ratelimit:method:endpoint:user?:userId
   */
  getKey(
    args: Pick<ITwitterApiRateLimitGetArgs, "endpoint" | "method">
  ): string {
    return (
      "ratelimit:" +
      args.method! +
      ":" +
      args.endpoint +
      (this.userId ? ":user:" + this.userId : "")
    );
  }

  async set(args: ITwitterApiRateLimitSetArgs): Promise<void> {
    const key = this.getKey(args);

    await useRedis(async (redis) => {
      if (!redis) return;

      const data = await redis.get(key);

      const parsedData: RateLimitData = data ? JSON.parse(data) : [];

      parsedData.push({ time: Date.now(), ...args.rateLimit });

      await redis.setEx(key, 3600 * 24 * 30 * 12, JSON.stringify(parsedData));
    });
  }

  async get(
    args: ITwitterApiRateLimitGetArgs
  ): Promise<void | TwitterRateLimit> {
    if (args.method) {
      const rateLimit = await useRedis(
        async (redis) => await redis?.get(this.getKey(args))
      );

      if (rateLimit) {
        const rateLimitData = JSON.parse(rateLimit) as RateLimitData;
        return rateLimitData[rateLimitData.length - 1];
      }
    }
  }

  async getHistory(
    args: ITwitterApiRateLimitGetArgs & { id?: string }
  ): Promise<void | RateLimitData> {
    if (args.method) {
      const rateLimit = await useRedis(
        async (redis) => await redis?.get(this.getKey(args))
      );

      if (rateLimit) {
        return JSON.parse(rateLimit) as RateLimitData;
      }
    }
  }
}

/**
 * Implementation of TwitterApiRateLimitPlugin that keeps track of rate limits over time
 */
export default class RateLimitRedisPlugin extends TwitterApiRateLimitPlugin {
  declare store: RedisApiRateLimitStore;
  declare _v1Plugin: TimelineTwitterApiRateLimitPluginWithPrefixV1;
  declare _v2Plugin: TimelineTwitterApiRateLimitPluginWithPrefixV2;

  constructor(userId?: string) {
    super(new RedisApiRateLimitStore(userId));
  }

  getRateLimitHistory(args: ITwitterApiRateLimitGetArgs) {
    return this.store.getHistory(args);
  }

  get v1(): TimelineTwitterApiRateLimitPluginWithPrefixV1 {
    if (this._v1Plugin) {
      return this._v1Plugin;
    }
    return (this._v1Plugin =
      new (class extends TwitterApiRateLimitPluginWithPrefixV1 {
        declare plugin: RateLimitRedisPlugin;

        async getRateLimitHistory(
          endpoint: string,
          method?: string
        ): Promise<RateLimitData | void> {
          return await this.plugin.getRateLimitHistory({
            endpoint: "https://api.twitter.com/1.1/" + endpoint,
            method,
            plugin: this.plugin,
          });
        }
      })(this, "v1"));
  }

  get v2(): TimelineTwitterApiRateLimitPluginWithPrefixV2 {
    if (this._v2Plugin) {
      return this._v2Plugin;
    }
    return (this._v2Plugin =
      new (class extends TwitterApiRateLimitPluginWithPrefixV2 {
        declare plugin: RateLimitRedisPlugin;

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
