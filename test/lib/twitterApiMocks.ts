/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
import {
  Tweetv2ListResult,
  TweetV2PaginableListParams,
  TweetV2UserLikedTweetsPaginator,
  TwitterApi,
} from "twitter-api-v2";

import TwitterApiv2ReadOnly from "twitter-api-v2/dist/v2/client.v2.read";

class MockTweetPaginator implements Partial<TweetV2UserLikedTweetsPaginator> {
  private tweetIds: string[] = [];
  private iter = 0;
  private count = 0;

  constructor(tweetIds: string[], count: number) {
    this.tweetIds = tweetIds;
    this.count = count;
  }

  get data(): Tweetv2ListResult {
    const tweets = this.tweetIds.slice(this.iter, this.iter + this.count);

    return {
      data: tweets.map((id) => ({
        id,
        text: "",
        attachments: { media_keys: ["key"] },
      })),
      meta: { result_count: this.count },
      includes: {
        media: [
          {
            media_key: "key",
            type: "photo",
          },
        ],
      },
    };
  }

  async fetchNext(
    maxResults: number | undefined
  ): Promise<TweetV2UserLikedTweetsPaginator> {
    if (maxResults) {
      this.count = maxResults;
    }

    this.iter += this.count;
    return this as unknown as TweetV2UserLikedTweetsPaginator;
  }
}

export class MockTwitterApi extends TwitterApiv2ReadOnly {
  constructor(likedTweetIds: string[], resultCount: number) {
    super(new TwitterApi());

    this.likedTweetIds = likedTweetIds;
    this.resultCount = resultCount;
  }

  private likedTweetIds: string[];
  private resultCount: number;

  userLikedTweets = async (
    _userId: string,
    _options: Partial<TweetV2PaginableListParams> | undefined
  ): Promise<TweetV2UserLikedTweetsPaginator> => {
    return new MockTweetPaginator(
      this.likedTweetIds,
      this.resultCount
    ) as unknown as TweetV2UserLikedTweetsPaginator;
  };
}
