import type { Tweetv2ListResult } from "twitter-api-v2";
import { fetchRetry, jsonOrError } from "./adapter";

export async function getLikes(uid: string): Promise<Tweetv2ListResult> {
  const res = await fetchRetry(`/api/likes/${uid}/0?useId=true`, {
    method: "GET",
    cache: "force-cache",
  });

  return jsonOrError(res);
}
