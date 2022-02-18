import TwitterApi from "twitter-api-v2"

let cachedApi: TwitterApi | null = null

export async function getTwitterApi(): Promise<TwitterApi> {
    if (cachedApi) {
        return cachedApi
    }

    // Twitter setup
    const userClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
    });

    cachedApi = await userClient.appLogin()

    return cachedApi
}