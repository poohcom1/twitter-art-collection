import create from "zustand";
import { combine } from "zustand/middleware";
import { imageEqual, isString, remove, remove_mut } from "src/util/objectUtil";
import {
  BLACKLIST_TAG,
  HOME_LIST,
  LIKED_TWEET_LIST,
  SPECIAL_LIST_KEYS,
  TIMELINE_TWEET_LIST,
} from "types/constants";
import { getUser } from "src/adapters/userAdapter";
import {
  postTag,
  deleteTag,
  putTag,
  pinTags,
  renameTag,
} from "src/adapters/tagsAdapter";
import { fetchFeedTweets, fetchLikedTweets } from "src/adapters/tweetAdapter";
import { ImageList, isTagList, TagList, TweetList } from "./ImageList";
import { cacheTweets } from "src/util/tweetUtil";
import {
  getTag,
  TweetPredicate,
  getTweetTexts,
  getTagList,
  setURLParam,
} from "./storeUtils";

/**
 * !IMPORTANT
 * While the store is made with the intention that it could be expanded to work with non-tweet images,
 * in its current state some refactoring will be required if that is needed.
 */

const initialState = {
  selectedLists: [HOME_LIST],
  imageLists: <Map<string, ImageList>>new Map(),

  searchTerm: "",

  editMode: <"add" | "delete">"add",
  errorMessage: "",
  warningMessage: "",
  galleryErrors: <Record<string, string>>{},

  // Tags
  pinnedTags: <string[]>[],

  // Twitter
  tweetMap: <Map<string, TweetSchema>>new Map(),
};

const store = combine(initialState, (set, get) => ({
  fetchUser: async (): Promise<Result<null>> => {
    const userData = await getUser();

    if (userData.error === null) {
      const tweetLists = get().imageLists;

      const likedTweetList = new TweetList(fetchLikedTweets);
      const timelineTweetList = new TweetList(fetchFeedTweets);

      // Generate special lists

      tweetLists.set(LIKED_TWEET_LIST, likedTweetList);
      tweetLists.set(TIMELINE_TWEET_LIST, timelineTweetList);

      // Generate tag lists

      const tags = userData.data.tags;

      Object.values(tags).forEach((tag) => {
        tweetLists.set(tag.name, new TagList(get().tweetMap, tag));
      });

      get().imageLists = tweetLists;

      set({
        imageLists: tweetLists,
        tweetMap: get().tweetMap,
        pinnedTags: userData.data.pinnedTags ?? [],
      });

      return { data: null, error: null };
    } else {
      return { data: null, error: "Failed to fetch user" };
    }
  },
  /* ---------------------------------- Lists --------------------------------- */

  getTweets: () => {
    const selectedLists = get().selectedLists;
    const tweetLists = get().imageLists;

    let tweets: TweetSchema[] = tweetLists.get(selectedLists[0])?.tweets ?? [];

    for (let i = 1; i < selectedLists.length; i++) {
      tweets = tweets.filter((t1) =>
        tweetLists
          .get(selectedLists[i])
          ?.tweets.find((t2) => imageEqual(t1, t2))
      );
    }

    const blacklist = getTag(get().imageLists, BLACKLIST_TAG);

    if (blacklist && !get().selectedLists.includes(blacklist.name)) {
      tweets = tweets.filter(
        (tweet) => !blacklist.images.find((image) => tweet.id === image)
      );
    }

    // TODO: Set view sensitive tweets to user settings
    return tweets.filter((t) => !t.data?.possibly_sensitive);
  },
  setSelectedList: (list: string[]) => {
    if (
      list.length === 1 &&
      get().selectedLists.length === 1 &&
      list[0] === get().selectedLists[0]
    )
      return;

    setURLParam(list[0]);
    set({ selectedLists: list });
  },
  addToSelectedList: (tag: string) => {
    const selectedLists = get().selectedLists.filter(
      (t) => !SPECIAL_LIST_KEYS.includes(t)
    );

    if (!get().selectedLists.includes(tag)) {
      selectedLists.push(tag);
    } else {
      remove_mut(selectedLists, tag);
    }

    setURLParam(selectedLists[0]);

    set({
      selectedLists: selectedLists.length > 0 ? selectedLists : [HOME_LIST],
    });
  },
  fetchMoreTweets: async () => {
    if (
      get().imageLists.size > 0 &&
      get().selectedLists.length === 1 &&
      get().searchTerm === ""
    ) {
      const list = get().selectedLists[0];
      const tweetList = get().imageLists.get(list);

      if (tweetList) {
        if (tweetList.fetchState === "fetched") {
          const res = await tweetList._fetchMoreTweets();

          if (res.error === null) {
            cacheTweets(get().tweetMap, res.data);

            set({
              imageLists: new Map(get().imageLists),
              galleryErrors: { ...get().galleryErrors, [list]: "" },
            });
          } else {
            set({
              galleryErrors: { ...get().galleryErrors, [list]: res.error },
            });
          }
        }
      } else {
        console.warn(
          "[fetchMoreTweets] Unknown tweet list fetch attempt: " +
            get().selectedLists[0]
        );
      }
    }
  },

  /* ---------------------------------- Tags ---------------------------------- */
  getTagList: (): TagSchema[] => {
    const tagList = Array.from(get().imageLists.values())
      .filter(isTagList)
      .map((i) => i.tag);

    return tagList
      .filter((tag) => tag.name !== BLACKLIST_TAG)
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => {
        if (get().pinnedTags.includes(a.name)) return -1;
        else if (get().pinnedTags.includes(b.name)) return 1;
        else return 0;
      });
  },
  addTag: (tag: TagSchema): void =>
    set((state) => {
      postTag(tag).then().catch(alert);

      const imageLists = state.imageLists;
      imageLists.set(tag.name, new TagList(get().tweetMap, tag));

      return { ...state, imageLists: new Map(imageLists) };
    }),
  removeTag: (tag: TagSchema): void =>
    set((state) => {
      deleteTag(tag).then().catch(alert);

      const imageLists = state.imageLists;
      imageLists.delete(tag.name);

      if (
        state.selectedLists.length === 1 &&
        state.selectedLists[0] === tag.name
      ) {
        state.selectedLists = [HOME_LIST];
      }

      return {
        ...state,
        imageLists: new Map(imageLists),
        selectedLists: state.selectedLists,
      };
    }),
  renameTag: (oldName: string, newName: string) => {
    const imageLists = get().imageLists;

    const oldList = imageLists.get(oldName);

    if (imageLists.has(newName)) {
      console.warn("Attempted to rename to existing tag");
      return;
    }

    if (oldList && isTagList(oldList)) {
      oldList.tag.name = newName;

      imageLists.set(newName, imageLists.get(oldName)!);
      imageLists.delete(oldName);

      renameTag(oldName, newName)
        .then()
        .catch(() => alert("Unable to rename tag"));

      const selectedLists = get().selectedLists.includes(oldName)
        ? [newName]
        : get().selectedLists;

      set({ imageLists: new Map(imageLists), selectedLists });
    }
  },
  pinTag: (tagName: string) => {
    const pinnedTags = get().pinnedTags.filter((tag) =>
      // Remove non-existent tags
      Array.from(get().imageLists.entries())
        .filter(([, list]) => isTagList(list))
        .map(([key]) => key)
        .includes(tag)
    );
    if (pinnedTags.includes(tagName)) return;

    pinnedTags.push(tagName);

    pinTags(pinnedTags)
      .then()
      .catch(() => alert("Failed to pin tag!"));

    set({ pinnedTags });
  },
  unpinTag: (tagName: string) => {
    if (!get().pinnedTags.includes(tagName)) {
      console.warn("Attempted to unpin tag that wasn't pinned");
      return;
    }
    const pinnedTags = remove(get().pinnedTags, tagName);

    pinTags(pinnedTags)
      .then()
      .catch(() => alert("Failed to unpin tag!"));

    set({ pinnedTags: pinnedTags });
  },
  /* --------------------------------- Images --------------------------------- */
  addImage: (tag: TagSchema | string, image: ImageSchema): void =>
    set((state) => {
      let tagList: ImageList | undefined;

      if (isString(tag)) {
        tagList = state.imageLists.get(tag);
      } else {
        tagList = state.imageLists.get(tag.name);
      }

      if (tagList && isTagList(tagList)) {
        const tag = tagList.tag;

        tag.images.push(image.id);
        tagList.updateTag(tag);

        putTag(tag).then().catch(alert);

        return { ...state, imageLists: new Map(state.imageLists) };
      } else {
        console.error("Nonexistent tagname image add attempt");
      }
    }),
  removeImage: (tag: string | TagSchema, image: ImageSchema): void =>
    set((state) => {
      let tagList: ImageList | undefined;

      if (isString(tag)) {
        tagList = state.imageLists.get(tag);
      } else {
        tagList = state.imageLists.get(tag.name);
      }

      if (tagList && isTagList(tagList)) {
        const tagObject = tagList.tag;

        tagObject.images = tagObject.images.filter((im) => im !== image.id);
        tagList.updateTag(tagObject);
        putTag(tagObject).then().catch(alert);

        return {
          ...state,
          imageLists: new Map(state.imageLists),
        };
      }
    }),
  blacklistImage: (image: ImageSchema) => {
    const blacklistTagList = getTagList(get().imageLists, BLACKLIST_TAG);

    if (!blacklistTagList) {
      const newBlacklistTag = {
        name: BLACKLIST_TAG,
        images: [image.id],
      };

      get().imageLists.set(
        BLACKLIST_TAG,
        new TagList(get().tweetMap, newBlacklistTag)
      );

      postTag(newBlacklistTag).then().catch(alert);
    } else {
      const blacklistTag = blacklistTagList.tag;

      if (blacklistTag.images.find((im) => im === image.id)) {
        console.warn(
          "Attempted to blacklist image that is already blacklisted"
        );
        return {};
      }

      blacklistTag.images.push(image.id);

      putTag(blacklistTag).then().catch(alert);
    }

    (get().imageLists.get(BLACKLIST_TAG) as TagList).updateTag();

    set((state) => ({
      ...state,
      imageLists: new Map(get().imageLists),
    }));
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

  /* ---------------------------------- Error --------------------------------- */
  setError(message: string) {
    set({ errorMessage: message });
  },
  setWarning(message: string) {
    set({ warningMessage: message });
  },
}));

export const useStore = create(store);
