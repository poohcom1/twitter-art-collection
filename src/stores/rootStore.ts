import create from "zustand";
import { combine } from "zustand/middleware";
import { imageEqual, isString, mapKeys } from "src/util/objectUtil";
import {
  BLACKLIST_TAG,
  LOCAL_THEME_DARK,
  LOCAL_THEME_KEY,
  LOCAL_THEME_LIGHT,
} from "types/constants";
import { getUser } from "src/adapters/userAdapter";
import { postTag, deleteTag, putTag } from "src/adapters/tagsAdapter";
import { fetchLikedTweets, fetchFeedTweets } from "src/adapters/tweetAdapter";
import { lightTheme } from "src/themes";
import { DefaultTheme } from "styled-components";
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

const initialState = {
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

  // Settings
  theme: lightTheme,
};

const store = combine(initialState, (set, get) => ({
  initTweetsAndTags: async (): Promise<Result<null>> => {
    const userData = await getUser();

    if (userData.error === null) {
      const tweetLists = get().tweetLists;

      const likedTweetList = new TweetList(fetchLikedTweets);
      const timelineTweetList = new TweetList(fetchFeedTweets);

      // Generate special lists
      tweetLists.set(TIMELINE_TWEET_LIST, timelineTweetList);
      tweetLists.set(LIKED_TWEET_LIST, likedTweetList);

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
      postTag(tag).then();

      const tags = state.tags;
      tags.set(tag.name, tag);

      return {
        ...state,
        ...updateTagLists(get()),
      };
    }),
  removeTag: (tag: TagSchema): void =>
    set((state) => {
      // TODO Switch to "all" if current tag is deleted
      deleteTag(tag).then();

      const tags = state.tags;
      tags.delete(tag.name);

      const tweetLists = get().tweetLists;
      tweetLists.delete(tag.name);

      return {
        ...state,
        ...updateTagLists(get()),
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

        putTag(tagObject).then();

        return {
          ...state,
          ...updateTagLists(get()),
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

        putTag(tagObject).then();

        return {
          ...state,
          ...updateTagLists(get()),
        };
      }
    }),
  blacklistImage: (image: ImageSchema) => {
    set((state) => {
      const tags = new Map(state.tags);

      let blacklistTag: TagSchema;

      if (!tags.has(BLACKLIST_TAG)) {
        blacklistTag = { name: BLACKLIST_TAG, images: [image.id] };

        tags.set(BLACKLIST_TAG, blacklistTag);

        postTag(blacklistTag);
      } else {
        blacklistTag = tags.get(BLACKLIST_TAG)!;

        if (blacklistTag?.images.find((im) => im === image.id)) {
          return;
        }

        blacklistTag?.images.push(image.id);

        putTag(blacklistTag!);
      }

      return {
        ...state,
        ...updateTagLists(get()),
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
    set({ editMode: get().editMode === "add" ? "delete" : "add" }),

  /* ---------------------------------- etc. ---------------------------------- */
  setTheme: (theme: DefaultTheme) => {
    if (window) {
      localStorage.setItem(
        LOCAL_THEME_KEY,
        theme === lightTheme ? LOCAL_THEME_LIGHT : LOCAL_THEME_DARK
      );
    }

    set({ theme });
  },
}));

export const useStore = create(store);

// Init helpers

// Image List helpers

function updateTagLists(
  state: Pick<typeof initialState, "tags" | "tweetLists" | "tweetMap">
): Pick<typeof initialState, "tags" | "tweetLists"> {
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
type ImagePredicate = <S extends ImageSchema>(
  image: S,
  index?: number,
  array?: S[]
) => image is S;

type TweetPredicate = <S extends TweetSchema>(
  image: S,
  index?: number,
  array?: S[]
) => image is S;

const FILTERS = ["all", "uncategorized", "tag", "multi"] as const;
export type FilterType = typeof FILTERS[number];
export function isFilterType(filter: string): filter is FilterType {
  return FILTERS.includes(filter as FilterType);
}

interface FilterAction<A extends FilterType> {
  type: A;
}

interface FilterTagAction extends FilterAction<"tag"> {
  tag: TagSchema;
}

interface FilterMultipleTagAction extends FilterAction<"multi"> {
  tags: TagSchema[];
}

type FilterActions =
  | FilterAction<"all">
  | FilterAction<"uncategorized">
  | FilterTagAction
  | FilterMultipleTagAction;

/**
 * @deprecated Shared logic for setting tags filter state
 * @param action Filter dispatch action
 * @param tags Tag list
 * @returns
 */
// eslint-disable-next-line unused-imports/no-unused-vars
function setFilter(action: FilterActions, tags: TagCollection) {
  let imageFilter = <ImagePredicate>((_image) => true);
  let filterSelectTags: string[] = [];

  switch (action.type) {
    case "all":
      imageFilter = <ImagePredicate>((_image) => true);
      break;
    case "uncategorized":
      imageFilter = <ImagePredicate>((image) => {
        const tagList = Array.from(tags.values());
        for (let i = 0; i < tagList.length; i++) {
          const tag = tagList[i];

          if (tag.images.find((im) => im === image.id)) return false;
        }
        return true;
      });
      break;
    case "tag":
      filterSelectTags = [action.tag.name];
      imageFilter = <ImagePredicate>((image) => {
        return !!action.tag.images.find((im) => im === image.id);
      });
      break;
    case "multi":
      filterSelectTags = action.tags.map((t) => t.name);
      imageFilter = <ImagePredicate>((image) => {
        for (const tag of action.tags) {
          if (!tag.images.find((im) => im === image.id)) {
            return false;
          }
        }

        return true;
      });
      break;
  }

  return {
    filterType: action.type,
    imageFilter: imageFilter,
    filterSelectTags,
  };
}

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
