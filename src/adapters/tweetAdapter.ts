import { jsonOrError } from "./adapter";

export async function fetchTweetData(tweetIds: string[]) {
  const res = await fetch("/api/tweet-expansions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tweetIds),
  });

  const resData = await jsonOrError<TweetSchema[]>(res);

  return resData;
}
