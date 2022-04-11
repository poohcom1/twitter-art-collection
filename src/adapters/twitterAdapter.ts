import { jsonOrError } from "./adapter";


const cache_age = 60 * 60 * 24;

export const ERR_LAST_PAGE = 9999;

/**
 * Fetches liked tweets of the current user, and keeps track of pagination
 * Each subsequent fetch will return the next page
 * @returns
 */
export async function getLikedTweets(): Promise<Result<TweetSchema[], number>> {
  try {
    const res = await fetch(`/api/tweets/`, {
      method: "GET",
      headers: {
        "cache-control": `private, max-age=${cache_age}`,
      },
    });

    const { data: responseObject, error } = <
      { data: AllTweetsResponse; error: number }
    >await jsonOrError(res);

    let fetchError = error;

    if (error === 0 && responseObject.next_token === undefined) {
      console.info("Tweets all loaded!");
      fetchError = ERR_LAST_PAGE;
    }

    return { data: responseObject.tweets ?? [], error: fetchError };
  } catch (e) {
    return { data: [], error: 1 };
  }
}

/**
 *
 * @param ids IDs to convert to AST. Does not check for duplicates
 * @returns
 */
export async function getTweetAsts(
  ids: string[]
): Promise<Result<TweetSchema[], number>> {
  try {
    const res = await fetch(`/api/tweets/ast`, {
      method: "POST",
      headers: {
        "cache-control": `private, max-age=${cache_age}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ tweetIds: ids }),
    });

    const { data: responseObject, error } = <
      { data: AllTweetsResponse; error: number }
    >await jsonOrError(res);

    return { data: responseObject.tweets ?? [], error };
  } catch (e) {
    return { data: [], error: 1 };
  }
}
