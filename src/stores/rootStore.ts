import create from "zustand";
import { combine } from "zustand/middleware";
import { imageEqual, isString, mapKeys } from "src/util/objectUtil";
import { BLACKLIST_TAG } from "types/constants";
import { getUser } from "src/adapters/userAdapter";
import { postTag, deleteTag, putTag } from "src/adapters/tagsAdapter";
import { fetchLikedTweets } from "src/adapters/tweetAdapter";
import { ImageList, isTagList, TagList, TweetList } from "./ImageList";
import { cacheTweets } from "src/util/tweetUtil";

/**
 * !IMPORTANT
 * While the store is made with the intention that it could be expanded to work with non-tweet images,
 * in its current state some refactoring will be required if that is needed.
 */

export const LIKED_TWEET_LIST = "__likes";
export const TIMELINE_TWEET_LIST = "__timeline";

export const SPECIAL_LIST_KEYS = [LIKED_TWEET_LIST, TIMELINE_TWEET_LIST];

const dataStore = {
  selectedLists: [LIKED_TWEET_LIST],
  tweetLists: <Map<string, ImageList>>new Map(),

  searchTerm: "",

  editMode: <"add" | "delete">"add",

  // Tags
  tags: <TagCollection>new Map(),
  tagsStatus: <"loading" | "loaded" | "error">"loading",

  // Display
  headerHeight: 0,

  // User
  newUser: false,

  // Twitter

  tweetMap: <Map<string, TweetSchema>>new Map(),
};

const store = combine(dataStore, (set, get) => ({
  initTweetsAndTags: async (): Promise<Result<null>> => {
    const userData = await getUser();

    if (userData.error === null) {
      const tweetLists = get().tweetLists;

      const likedTweetList = new TweetList(fetchLikedTweets);
      // const timelineTweetList = new TweetList(fetchFeedTweets);

      // Generate special lists
      tweetLists.set(LIKED_TWEET_LIST, likedTweetList);
      // tweetLists.set(TIMELINE_TWEET_LIST, timelineTweetList);

      // Generate tag lists
      const tags = new Map(Object.entries(userData.data.tags));

      Array.from(tags.values()).forEach((tag) => {
        tweetLists.set(tag.name, new TagList(get().tweetMap, tag));
      });

      get().tags = tags;
      get().tweetLists = tweetLists;

      set({
        tagsStatus: "loaded",
        ...updateTagLists({
          tags,
          tweetLists,
          tweetMap: get().tweetMap,
        }),
      });

      return { data: null, error: null };
    } else {
      return { data: null, error: "Failed to fetch user" };
    }
  },
  /* ---------------------------------- Lists --------------------------------- */

  getTweets: () => {
    const selectedLists = get().selectedLists;
    const tweetLists = get().tweetLists;

    let tweets: TweetSchema[] = tweetLists.get(selectedLists[0])?.tweets ?? [];

    for (let i = 1; i < selectedLists.length; i++) {
      tweets = tweets.filter((t1) =>
        tweetLists
          .get(selectedLists[i])
          ?.tweets.find((t2) => imageEqual(t1, t2))
      );
    }

    const blacklist = get().tags.get(BLACKLIST_TAG);

    if (blacklist && !get().selectedLists.includes(blacklist.name)) {
      tweets = tweets.filter(
        (tweet) => !blacklist.images.find((image) => tweet.id === image)
      );
    }

    return tweets;
  },
  setSelectedList: (list: string[]) => {
    set({ selectedLists: list });
  },
  fetchMoreTweets: async () => {
    if (get().selectedLists.length === 1 && get().searchTerm === "") {
      const tweetList = get().tweetLists.get(get().selectedLists[0]);

      if (tweetList) {
        if (tweetList.fetchState === "fetched") {
          const newTweets = await tweetList._fetchMoreTweets();

          cacheTweets(get().tweetMap, newTweets);

          set({ tweetLists: new Map(get().tweetLists) });
        }
      } else {
        console.warn("[fetchMoreTweets] Unknown tweet list fetch attempt");
      }
    }
  },

  /* ---------------------------------- Tags ---------------------------------- */
  getTagList: (): TagSchema[] => {
    const tagList = Array.from(get().tags.values());

    return tagList.filter((tag) => tag.name !== BLACKLIST_TAG);
  },
  addTag: (tag: TagSchema): void =>
    set((state) => {
      postTag(tag).then().catch(alert);

      const tags = state.tags;
      tags.set(tag.name, tag);

      return {
        ...state,
        ...updateTagLists(state),
      };
    }),
  removeTag: (tag: TagSchema): void =>
    set((state) => {
      // TODO Switch to "all" if current tag is deleted
      deleteTag(tag).then().catch(alert);

      const tags = state.tags;
      tags.delete(tag.name);

      const tweetLists = state.tweetLists;
      tweetLists.delete(tag.name);

      return {
        ...state,
        ...updateTagLists(state),
      };
    }),

  /* --------------------------------- Images --------------------------------- */
  addImage: (tag: TagSchema | string, image: ImageSchema): void =>
    set((state) => {
      const tags = state.tags;

      let tagObject: TagSchema | undefined;

      if (isString(tag)) {
        tagObject = tags.get(tag);
      } else {
        tagObject = tag;
      }

      if (tagObject) {
        tagObject.images.push(image.id);
        tags.set(tagObject.name, tagObject);

        putTag(tagObject).then().catch(alert);

        return {
          ...state,
          ...updateTagLists(state),
        };
      } else {
        console.error("Nonexistent tagname image add attempt");
      }
    }),
  removeImage: (tag: string | TagSchema, image: ImageSchema): void =>
    set((state) => {
      const tags = state.tags;

      let tagObject: TagSchema | undefined;

      if (isString(tag)) {
        tagObject = tags.get(tag);
      } else {
        tagObject = tag;
      }

      if (tagObject) {
        tagObject.images = tagObject.images.filter((im) => im !== image.id);
        tags.set(tagObject.name, tagObject);

        putTag(tagObject).then().catch(alert);

        return {
          ...state,
          ...updateTagLists(state),
        };
      }
    }),
  blacklistImage: (image: ImageSchema) => {
    set((state) => {
      const tags = state.tags;

      const blacklistTag = tags.get(BLACKLIST_TAG);

      if (!blacklistTag) {
        const newBlacklistTag = {
          name: BLACKLIST_TAG,
          images: [image.id],
        };

        tags.set(BLACKLIST_TAG, newBlacklistTag);

        postTag(newBlacklistTag).then().catch(alert);
      } else {
        if (blacklistTag.images.find((im) => im === image.id)) {
          return;
        }

        blacklistTag.images.push(image.id);

        putTag(blacklistTag).then().catch(alert);
      }

      return {
        ...state,
        ...updateTagLists(state),
      };
    });
  },

  /* --------------------------------- Filters -------------------------------- */
  searchFilter: <TweetPredicate>((tweet) => {
    if (!get().searchTerm) return true;

    if (!tweet.data) {
      return false;
    }

    let include = false;

    const texts = getTweetTexts(tweet);

    for (const [_key, text] of Object.entries(texts)) {
      if (
        text &&
        text.toLowerCase().includes(get().searchTerm.toLowerCase().trim())
      ) {
        include = true;
      }
    }

    return include;
  }),

  setSearchFilter: (search: string) => {
    set({ searchTerm: search });
  },
  /* -------------------------------- EditMode -------------------------------- */
  toggleEditMode: () =>
    set((state) => ({ editMode: state.editMode === "add" ? "delete" : "add" })),
}));

export const useStore = create(store);

// Image List helpers

function updateTagLists(
  state: Pick<typeof dataStore, "tags" | "tweetLists" | "tweetMap">
): Pick<typeof dataStore, "tags" | "tweetLists"> {
  mapKeys(state.tags).forEach((tagName) => {
    const tag = state.tags.get(tagName);
    const tagList = state.tweetLists.get(tagName);

    if (tag) {
      if (tagList && isTagList(tagList)) {
        tagList.updateTag(tag);
      } else {
        state.tweetLists.set(tag.name, new TagList(state.tweetMap, tag));
      }
    }
  });

  return { tags: new Map(state.tags), tweetLists: new Map(state.tweetLists) };
}

// Filters helpers

type TweetPredicate = <S extends TweetSchema>(
  image: S,
  index?: number,
  array?: S[]
) => image is S;

// Search Filter helper
interface TweetTextData {
  text?: string;
  name?: string;
  username?: string;
}

function getTweetTexts(tweet: TweetSchema): TweetTextData {
  return {
    text: tweet.data?.content.text,
    name: tweet.data?.name,
    username: tweet.data?.username,
  };
}
