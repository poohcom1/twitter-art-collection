import { fetchRetry, jsonOrError } from "./adapter";

export async function getLikedTweets(): Promise<TweetSchema[]> {
  const res = await fetchRetry(`/api/tweets`, {
    method: "GET",
    cache: "force-cache",
  });

  return jsonOrError(res);
}
