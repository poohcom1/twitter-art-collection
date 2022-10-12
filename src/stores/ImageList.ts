import {
  fetchTweetData,
  PaginatedTweetAdapter,
} from "src/adapters/tweetAdapter";
import { fillCachedTweets } from "src/util/tweetUtil";

/**
 * These classes represent a Tab on the UI ("Timeline", "Liked", "{tag}", etc.)
 * Functions that are meant to propagate UI changes should be prefixed with an underscore
 *  to indicate that they should not be used outside of rootStore
 */

export type FetchState = "fetched" | "fetching" | "all_fetched" | "error";

export interface ImageList {
  tweets: TweetSchema[];
  /**
   * DON'T CALL THIS METHOD FROM THE UI!
   * This should only be used inside rootStore to ensure that changes are propagated
   */
  _fetchMoreTweets: () => Promise<Result<TweetSchema[]>>;

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

  _fetchMoreTweets = async (): Promise<Result<TweetSchema[]>> => {
    this.fetchState = "fetching";
    const res = await this.adapter(this.token);

    if (res.error === null) {
      this.tweets = this.tweets.concat(
        res.data.tweets.filter((t) => !this.tweets.find((t2) => t.id === t2.id))
      );

      if (
        res.data.nextToken &&
        res.data.nextToken !== this.token &&
        res.data.tweets.length > 0
      ) {
        this.fetchState = "fetched";
        this.token = res.data.nextToken;
      } else {
        this.token = "";
        this.fetchState = "all_fetched";
      }

      return {
        data: res.data.tweets,
        error: null,
      };
    } else {
      return {
        data: null,
        error: res.error,
      };
    }
  };
}

export class TagList implements ImageList {
  public fetchState: FetchState = "fetched";

  public fetchCount: number;

  /**
   * All tweets, including unloaded ones
   */
  private _tweets: TweetSchema[];
  private _tag: TagSchema;
  private tweetsMap: Map<string, TweetSchema>;

  get tag() {
    return this._tag;
  }

  get tweets() {
    for (const tweet of this._tweets) {
      // FIXME why is tweet undefined?
      if (!tweet) continue;

      if (!tweet.data) {
        tweet.data = this.tweetsMap.get(tweet.id)?.data;
      }
    }

    return [...this._tweets].reverse();
  }

  constructor(
    tweetsMap: Map<string, TweetSchema>,
    tag: TagSchema,
    fetchCount = 100
  ) {
    this.tweetsMap = tweetsMap;
    this._tag = tag;
    this.fetchCount = fetchCount;

    this._tweets = tag.images.map((id) => ({ id, platform: "twitter" }));
  }

  updateTag(tag?: TagSchema) {
    if (tag) {
      this._tag = tag;
    }

    this._tweets = this._tag.images.map((id) => ({
      id,
      platform: "twitter",
      data: this._tweets.find((t) => t.id === id)?.data,
    }));

    if (
      this.fetchState === "all_fetched" &&
      this._tweets.filter((t) => !t.data).length !== 0
    ) {
      this.fetchState = "fetched";
    }
  }

  _fetchMoreTweets = async () => {
    this.fetchState = "fetching";

    fillCachedTweets(this.tweetsMap, this._tweets);

    const unfetchedImages = this._tweets.filter((t) => !t.data);
    const imagesToFetch = unfetchedImages
      .slice(0, this.fetchCount)
      .map((t) => t.id);

    const fetchedTweets: TweetSchema[] = [];

    if (imagesToFetch.length > 0) {
      const res = await fetchTweetData(imagesToFetch);

      if (res.error === null) {
        const tweetIds = this._tweets.map((t) => t.id);

        // Remove deleted images
        this._tweets = this._tweets.filter(
          (t) => !!res.data.find((resTweet) => resTweet.id == t.id)
        );

        // Fill images data
        res.data.forEach((t) => {
          const tweetIndex = tweetIds.indexOf(t.id);

          if (tweetIndex !== -1) {
            this._tweets[tweetIndex] = t;

            fetchedTweets.push(t);
          }
        });
      } else {
        this.fetchState = "error";
        return { data: null, error: res.error };
      }
    }

    if (this._tweets.filter((t) => !t.data).length === 0) {
      this.fetchState = "all_fetched";
    } else {
      this.fetchState = "fetched";
    }
    return { data: fetchedTweets, error: null };
  };
}

export function isTagList(imageList: ImageList): imageList is TagList {
  return "tag" in imageList;
}
