import { MultipleTweetsLookupResponse } from "twitter-types";
import { fetchRetry, jsonOrError } from "./adapter";

export async function getLikes(uid: string): Promise<MultipleTweetsLookupResponse> {
    const res = await fetchRetry(`/api/likes/${uid}/0?useId=true`, {
        method: "GET",
        cache: "force-cache",
    })

    return jsonOrError(res)
}