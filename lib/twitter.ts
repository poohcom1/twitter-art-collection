import TwitterApi, {
  TweetV2,
  Tweetv2ListResult,
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

export function mergeTweets(upstream: string[], database: string[]) {
  for (let i = 0; i < upstream.length; i++) {
    if (upstream[i] === database[0]) {
      return upstream.slice(0, i).concat(database)
    }
  }

  return upstream.concat(database)
}

/**
 * Finds all orphaned data nodes database, given the a paginated list
 * @param database Datastored in database
 * @param upstream Paginated data fetched from upstream
 * @param page Page of pagination
 * @param count Data nodes per page
 * @returns
 */
export function updateAndFindOrphans<T>(
  database: T[],
  upstream: T[],
  page: number,
  count = 100
): { updated: T[]; deleted: T[] } {
  const databaseSlice = database.slice(page * count, (page + 1) * count);

  const deleted = databaseSlice.filter((data) => !upstream.includes(data));
  const updated = database.filter((data) => !deleted.includes(data));

  return { updated, deleted };
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

export function tweetIdsToSchema(ids: string[], ast?: TweetAst[]): TweetSchema[] {
  const schemas = []

  for (let i = 0; i < ids.length; i++) {
    const schema: TweetSchema = {
      id: ids[i],
      platform: "twitter",
      ast: ast ? ast[i] : null
    }
    
    schemas.push(schema)
  }

  return schemas
}