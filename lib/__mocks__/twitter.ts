import type { TweetV2PaginableListParams, TweetV2UserLikedTweetsPaginator } from "twitter-api-v2"



interface TwitterApiReadOnly {
    v2: {
        userLikedTweets: (userId: string, options?: Partial<TweetV2PaginableListParams> | undefined) => Promise<Partial<TweetV2UserLikedTweetsPaginator>>
    }
}

async function userLikedTweets(_userId: string, _options?: Partial<TweetV2PaginableListParams> | undefined): Promise<Partial<TweetV2UserLikedTweetsPaginator>> {
    return {

    };
}

export async function getTwitterApi(): Promise<TwitterApiReadOnly> {
    return {
        v2: {
            userLikedTweets
        }
    }
}