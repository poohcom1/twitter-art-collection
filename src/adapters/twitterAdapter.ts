import { jsonOrError } from "./adapter";

let next_token = "";

/**
 * Fetches liked tweets of the current user, and keeps track of pagination
 * Each subsequent fetch will return the next page
 * @returns
 */
export async function getLikedTweets(): Promise<TweetSchema[]> {
  try {
    const res = await fetch(
      `/api/tweets${next_token !== "" ? `?next_token=${next_token}` : ""}`,
      {
        method: "GET",
        cache: "force-cache",
      }
    );

    const responseObject: LikedTweetResponse = await jsonOrError(res);

    next_token = responseObject.next_token ?? "";

    return responseObject.tweets;
  } catch (e) {
    console.error(e);
    return [];
  }
}
