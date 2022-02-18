import TwitterApi from "twitter-api-v2"

export async function getTwitterApi(): Promise<TwitterApi> {
    // Twitter setup
    const userClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
    });

    return await userClient.appLogin()
}