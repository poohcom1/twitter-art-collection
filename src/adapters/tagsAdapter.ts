import { fetchRetry, jsonOrError } from "./adapter";

export async function getTags(uid: string): Promise<TagCollection> {
    const res = await fetchRetry(`/api/user/${uid}/tags`, {
        method: "GET",
    })

    const object: object = await jsonOrError(res)

    return new Map(Object.entries(object))
}