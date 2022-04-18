import { jsonOrError } from "./adapter";

const MAX_AGE = 60 * 60 * 24 * 5;

export async function fetchTweetData(tweetIds: string[]) {
  const res = await fetch(`/api/tweet-expansions?ids=${tweetIds.join(",")}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // "Cache-Control": `public, max-age=${MAX_AGE}`,
    },
  });

  const resData = await jsonOrError<TweetSchema[]>(res);

  return resData;
}
