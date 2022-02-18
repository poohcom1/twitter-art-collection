import TwitterApi, { TwitterApiReadOnly } from "twitter-api-v2"

let cachedClient: TwitterApi | null
let cachedApi: TwitterApiReadOnly | null = null

export function getTwitterClient() {
    if (cachedClient) {
        return cachedClient
    }

    const bearerToken = process.env.TWITTER_BEARER_TOKEN

    if (!bearerToken) {
        throw new Error("Missing TWITTER_BEARER_TOKEN environment variables!")
    }

    // Twitter setup
    cachedClient = new TwitterApi(bearerToken);

    return cachedClient
}

export async function getTwitterApi(): Promise<TwitterApiReadOnly> {
    if (cachedApi) {
        return cachedApi
    }

    const twitterApi = getTwitterClient()

    cachedApi = twitterApi.readOnly

    return cachedApi
}

export function setTwitterApi(api: TwitterApi) {
    cachedApi = api
}