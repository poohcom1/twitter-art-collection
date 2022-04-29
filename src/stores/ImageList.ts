import {
  fetchTweetData,
  PaginatedTweetAdapter,
} from "src/adapters/tweetAdapter";
import { imageEqual } from "src/util/objectUtil";
import { cacheTweets, fillCachedTweets } from "src/util/tweetUtil";

/**
 * These classes represent a Tab on the UI ("Timeline", "Liked", "{tag}", etc.)
 * Functions that are meant to propagate UI changes should be prefixed with an underscore
 *  to indicate that they should not be used outside of rootStore
 */

export type FetchState = "fetched" | "fetching" | "all_fetched" | "error";

export interface ImageList {
  tweets: TweetSchema[];
  /**
   * Should only be used inside rootStore to ensure that changes are propagated
   */
  _fetchMoreTweets: () => Promise<void>;

  fetchState: FetchState;
}

export class TweetList implements ImageList {
  public tweets: TweetSchema[];
  public fetchState: FetchState = "fetched";

  private adapter: PaginatedTweetAdapter;
  private token = "";

  constructor(adapter: PaginatedTweetAdapter) {
    this.adapter = adapter;
    this.tweets = [];
  }

  _fetchMoreTweets = async () => {
    this.fetchState = "fetching";
    const res = await this.adapter(this.token);

    if (res.error === null) {
      this.tweets = this.tweets.concat(res.data.tweets);

      if (res.data.nextToken && res.data.tweets.length > 0) {
        this.fetchState = "fetched";
        this.token = res.data.nextToken;
      } else {
        this.token = "";
        this.fetchState = "all_fetched";
      }
    } else {
      alert(res.error);
      this.fetchState = "error";
    }
  };
}

export class TagList implements ImageList {
  public fetchState: FetchState = "fetched";

  public tag: TagSchema;
  public fetchCount: number;

  /**
   * All tweets, including unloaded ones
   */
  private _tweets: TweetSchema[];
  private tweetsMap: Map<string, TweetSchema>;

  get tweets() {
    return this._tweets.filter((t) => !!t.data);
  }

  constructor(
    tweetsMap: Map<string, TweetSchema>,
    tag: TagSchema,
    fetchCount = 100
  ) {
    this.tweetsMap = tweetsMap;
    this.tag = tag;
    this.fetchCount = fetchCount;

    this._tweets = tag.images;
  }

  _fetchMoreTweets = async () => {
    this.fetchState = "fetching";

    fillCachedTweets(this.tweetsMap, this._tweets);

    const unfetchedImages = this._tweets.filter((t) => !t.data);
    const imagesToFetch = unfetchedImages
      .slice(0, this.fetchCount)
      .map((t) => t.id);

    if (imagesToFetch.length > 0) {
      const res = await fetchTweetData(imagesToFetch);

      if (res.error === null) {
        res.data.forEach((t) => {
          const tweet = this._tweets.find((current) => imageEqual(t, current));

          if (tweet) {
            tweet.data = t.data;
          }
        });

        cacheTweets(this.tweetsMap, res.data);
      } else {
        this.fetchState = "error";
      }
    }

    if (this._tweets.filter((t) => !t.data).length === 0) {
      this.fetchState = "all_fetched";
    } else {
      this.fetchState = "fetched";
    }
  };
}

export function isTagList(imageList: ImageList): imageList is TagList {
  return "tag" in imageList;
}
