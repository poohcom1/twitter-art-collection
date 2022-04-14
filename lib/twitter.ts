import TwitterApi, {
  TweetV2,
  Tweetv2FieldsParams,
  Tweetv2ListResult,
  TweetV2LookupResult,
  TwitterApiReadOnly,
} from "twitter-api-v2";

let cachedClient: TwitterApi | null;
let cachedApi: TwitterApiReadOnly | null = null;

export function getTwitterClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    throw new Error("Missing TWITTER_BEARER_TOKEN environment variables!");
  }

  // Twitter setup
  cachedClient = new TwitterApi(bearerToken);

  return cachedClient;
}

export async function getTwitterApi(): Promise<TwitterApiReadOnly> {
  if (cachedApi) {
    return cachedApi;
  }

  const twitterApi = getTwitterClient();

  cachedApi = twitterApi.readOnly;

  return cachedApi;
}

export function setTwitterApi(api: TwitterApi) {
  cachedApi = api;
}

// Helper funtions
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

export function tweetIdsToSchema(
  ids: string[],
  ast?: TweetAst[]
): TweetSchema[] {
  const schemas = [];

  for (let i = 0; i < ids.length; i++) {
    const schema: TweetSchema = {
      id: ids[i],
      platform: "twitter",
      ast: ast ? ast[i] : null,
    };

    schemas.push(schema);
  }

  return schemas;
}

export function completeTweetFields(
  tweets: TweetSchema[],
  tweetPayloadData: TweetV2LookupResult
) {
  if (!tweetPayloadData.includes) {
    return;
  }

  for (const tweetData of tweetPayloadData.data) {
    const user = tweetPayloadData.includes.users?.find(
      (user) => user.id === tweetData.author_id
    );

    const tweetSchema = tweets.find((tweet) => tweet.id === tweetData.id);

    if (!tweetSchema) continue;

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
          const img = tweetPayloadData.includes!.media!.find((m) => m.media_key === key);

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
