import { jsonOrError } from "./adapter";

let page = 0;
let next_token = "";

const cache_age = 60 * 60 * 24;

/**
 * Fetches liked tweets of the current user, and keeps track of pagination
 * Each subsequent fetch will return the next page
 * @returns
 */
export async function getLikedTweets(): Promise<TweetSchema[]> {
  try {
    const query = next_token ? "next_token=" + next_token : "";

    const res = await fetch(`/api/tweets/all/${page}${query}`, {
      method: "GET",
      headers: {
        "cache-control": `private, max-age=${cache_age}`,
      },
    });

    const responseObject: LikedTweetResponse = await jsonOrError(res);

    page++;

    next_token = responseObject.next_token ?? "";

    return responseObject.tweets;
  } catch (e) {
    console.error(e);
    return [];
  }
}
