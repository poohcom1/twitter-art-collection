import TwitterApi, { TwitterApiReadOnly } from "twitter-api-v2"

let cachedClient: TwitterApi | null
let cachedApi: TwitterApiReadOnly | null = null

export function getTwitterClient() {
    if (cachedClient) {
        return cachedClient
    }

    const appKey = process.env.TWITTER_API_KEY
    const appSecret = process.env.TWITTER_API_SECRET

    if (!appKey || !appSecret) {
        throw new Error("Missing TWITTER_API_KEY or TWITTER_API_SECRET environment variables!")
    }

    // Twitter setup
    cachedClient = new TwitterApi({
        appKey,
        appSecret,
    });

    return cachedClient
}

export async function getTwitterApi(): Promise<TwitterApiReadOnly> {
    if (cachedApi) {
        return cachedApi
    }

    const twitterClient = getTwitterClient()

    const twitterApi = await twitterClient.appLogin()

    cachedApi = twitterApi.readOnly

    return cachedApi
}

export function setTwitterApi(api: TwitterApi) {
    cachedApi = api
}