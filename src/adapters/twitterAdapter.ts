import { jsonOrError } from "./adapter";

let next_token = "";

const cache_age = 60 * 60 * 24;

/**
 * Fetches liked tweets of the current user, and keeps track of pagination
 * Each subsequent fetch will return the next page
 * @returns
 */
export async function getLikedTweets(): Promise<Result<TweetSchema[], number>> {
  try {
    const res = await fetch(`/api/tweets/all/${next_token ?? ""}`, {
      method: "GET",
      headers: {
        "cache-control": `private, max-age=${cache_age}`,
      },
    });

    const { data: responseObject, error } = <
      { data: AllTweetsResponse; error: number }
    >await jsonOrError(res);

    // TODO next_token not refreshed on page hot-reloading, cause pages to be loaded wrongly
    //  need to check if issue happens in prod
    next_token = responseObject.next_token ?? "";

    return { data: responseObject.tweets, error };
  } catch (e) {
    return { data: [], error: 1 };
  }
}

export async function getTweetAsts(
  ids: string[]
): Promise<Result<TweetSchema[], number>> {
  try {
    const res = await fetch(`/api/tweets/`, {
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

    return { data: responseObject.tweets, error };
  } catch (e) {
    return { data: [], error: 1 };
  }
}
