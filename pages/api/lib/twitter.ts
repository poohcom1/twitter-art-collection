import TwitterApi from "twitter-api-v2"

export async function getTwitterApi(): Promise<TwitterApi> {
    // Twitter setup
    const userClient = new TwitterApi({
        appKey: process.env.NEXT_PUBLIC_TWITTER_APP_KEY,
        appSecret: process.env.NEXT_PUBLIC_TWITTER_APP_SECRET,
    });

    return await userClient.appLogin()
}