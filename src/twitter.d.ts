
interface Category {
    name: string;
}

interface TweetWrapper {
    tweetId: string;
    categories: Array<Category>
}
