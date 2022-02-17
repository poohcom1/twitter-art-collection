
export interface Category {
    name: string;
}

export interface TweetWrapper {
    tweetId: string;
    categories: Array<Category>
}
