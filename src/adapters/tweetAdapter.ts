import { jsonOrError } from "./adapter";

const MAX_AGE = 60 * 60 * 24 * 5;

export type TweetAdapter = (
  tweetIds: string[]
) => Promise<Result<TweetSchema[]>>;

export type PaginatedTweetAdapter = (
  token: string
) => Promise<Result<TweetsResponse>>;

export const fetchTweetData: TweetAdapter = async (tweetIds: string[]) => {
  const res = await fetch(`/api/tweet-expansions?ids=${tweetIds.join(",")}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${MAX_AGE}`,
    },
  });

  const resData = await jsonOrError<TweetSchema[]>(res);

  return resData;
};

export const fetchLikedTweets: PaginatedTweetAdapter = async (
  token?: string
) => {
  const res = await fetch(
    `/api/liked-tweets${token ? "?token=" + token : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${MAX_AGE}`,
      },
    }
  );

  const resData = await jsonOrError<TweetsResponse>(res);

  return resData;
};

export const fetchFeedTweets: PaginatedTweetAdapter = async (
  token?: string
) => {
  const res = await fetch(`/api/feed-tweets${token ? "?token=" + token : ""}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${MAX_AGE}`,
    },
  });

  const resData = await jsonOrError<TweetsResponse>(res);

  return resData;
};
