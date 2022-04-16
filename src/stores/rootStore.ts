import create from "zustand";
import { combine } from "zustand/middleware";
import { imageEqual } from "src/util/objectUtil";
import {
  BLACKLIST_TAG,
  LOCAL_THEME_DARK,
  LOCAL_THEME_KEY,
  LOCAL_THEME_LIGHT,
} from "types/constants";
import { getUser, postUser } from "src/adapters/userAdapter";
import { postTag, deleteTag, putTag } from "src/adapters/tagsAdapter";
import { fetchTweetData } from "src/adapters/tweetAdapter";
import { lightTheme } from "src/themes";
import { DefaultTheme } from "styled-components";

// Filters
type ImagePredicate = <S extends ImageSchema>(
  image: ImageSchema,
  index?: number,
  array?: ImageSchema[]
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

// Equality functions
const isString = (data: unknown): data is string => {
  return typeof data === "string";
};

// Store
export const useStore = create(
  combine(
    {
      tags: <TagCollection>new Map(),
      tagsStatus: <"loading" | "loaded" | "error">"loading",
      imageFilter: <ImagePredicate>((_image, _index, _array) => {
        return true;
      }),
      filterType: <FilterType>"all",
      filterSelectTags: <string[]>[],
      editMode: <"add" | "delete">"add",
      // User
      newUser: false,
      // Twitter
      tweets: <TweetSchema[]>[],

      // Settings
      theme: lightTheme,
    },
    (set, get) => ({
      initTweetsAndTags: async (): Promise<null | string> => {
        const userData = await getUser();

        if (userData.error === null) {
          if (userData.data.newUser) {
            set({
              newUser: true,
            });

            const newUserData = await postUser();

            if (newUserData.error === null) {
              set({
                tags: new Map(Object.entries(newUserData.data.tags)),
                tweets: newUserData.data.tweets,
                tagsStatus: "loaded",
                newUser: false,
              });

              return null;
            } else {
              return newUserData.error;
            }
          } else {
            set({
              tags: new Map(Object.entries(userData.data.tags)),
              tweets: userData.data.tweets,
              tagsStatus: "loaded",
            });

            return null;
          }
        } else {
          return userData.error;
        }
      },

      loadTweetData: async (tweets: TweetSchema[]) => {
        console.log(`Fetching ${tweets.length} tweets data`);

        if (tweets.length === 0) return;

        const tweetsToFetch = tweets.filter((tweet) => !tweet.loading);
        tweetsToFetch.forEach((tweet) => (tweet.loading = true));

        const tweetExpansionsData = await fetchTweetData(
          tweetsToFetch.map((t) => t.id)
        );

        if (tweetExpansionsData.error === null) {
          console.log(`Fetched ${tweetExpansionsData.data.length} tweets data`);

          const newTweets = tweetExpansionsData.data;

          const currentTweets = get().tweets;

          newTweets.forEach((newTweet) => {
            const match = currentTweets.find(
              (currentTweet) => currentTweet.id === newTweet.id
            );

            if (match) {
              match.loading = false;
              match.data = newTweet.data;
            }
          });

          set({ tweets: [...currentTweets] });
        }
      },

      getFilteredTweets: (includePartialTweets = false) => {
        let tweets = get().tweets;

        const blacklist = get().tags.get(BLACKLIST_TAG);

        if (blacklist && !get().filterSelectTags.includes(blacklist.name)) {
          tweets = tweets.filter(
            (tweet) =>
              !blacklist.images.find((image) => imageEqual(tweet, image))
          );
        }

        return tweets
          .filter((im) => includePartialTweets || !!im.data)
          .filter(get().imageFilter);
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

          return { ...state, tags };
        }),
      removeTag: (tag: TagSchema): void =>
        set((state) => {
          // Switch to "all" if current tag is deleted
          let tagChangeObject = {};
          if (
            state.filterSelectTags.length === 1 &&
            state.filterSelectTags[0] === tag.name
          ) {
            tagChangeObject = setFilter({ type: "all" }, state.tags);
          }

          deleteTag(tag).then();

          const tags = state.tags;
          tags.delete(tag.name);

          return { ...state, tags, ...tagChangeObject };
        }),
      /* --------------------------------- Images --------------------------------- */

      addImage: (tag: TagSchema | string, image: ImageSchema): void =>
        set((state) => {
          const tags = state.tags;

          if (isString(tag)) {
            const tagObject = tags.get(tag);

            if (tagObject) {
              tagObject.images.push(image);
              tags.set(tagObject.name, tagObject);

              putTag(tagObject).then();
            } else {
              console.error("Nonexistent tagname image add attempt");
            }
          } else {
            tag.images.push(image);
            tags.set(tag.name, tag);

            putTag(tag).then();
          }

          return { ...state, tags: tags };
        }),
      removeImage: (tag: TagSchema, image: ImageSchema): void =>
        set((state) => {
          const tags = state.tags;
          tag.images = tag.images.filter((im) => !imageEqual(im, image));
          tags.set(tag.name, tag);

          putTag(tag).then();

          return { ...state, tags: tags };
        }),
      blacklistImage: (image: ImageSchema) => {
        set((state) => {
          const tags = new Map(state.tags);

          if (!tags.has(BLACKLIST_TAG)) {
            const blacklistTag = { name: BLACKLIST_TAG, images: [image] };

            tags.set(BLACKLIST_TAG, blacklistTag);

            postTag(blacklistTag);
          } else {
            const blacklistTag = tags.get(BLACKLIST_TAG);

            if (blacklistTag?.images.find(im => imageEqual(im, image))) {
              return
            }

            blacklistTag?.images.push(image);

            putTag(blacklistTag!);
          }

          return { ...state, tags };
        });
      },

      /* --------------------------------- Filters -------------------------------- */
      /**
       * Dispatcher for filter
       * @param action.type Action
       * @param action.tag Payload if action type is "tag"
       */
      setFilter: (action: FilterActions) =>
        set((state) => ({ ...state, ...setFilter(action, state.tags) })),
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
    })
  )
);

/**
 * Shared logic for setting tags filter state
 * @param action Filter dispatch action
 * @param tags Tag list
 * @returns
 */
function setFilter(
  action: FilterActions,
  tags: TagCollection
): {
  imageFilter: ImagePredicate;
  filterSelectTags: string[];
  filterType: FilterType;
} {
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

          if (tag.images.find((im) => imageEqual(im, image))) return false;
        }
        return true;
      });
      break;
    case "tag":
      filterSelectTags = [action.tag.name];
      imageFilter = <ImagePredicate>((image) => {
        return !!action.tag.images.find((im) => imageEqual(im, image));
      });
      break;
    case "multi":
      filterSelectTags = action.tags.map((t) => t.name);
      imageFilter = <ImagePredicate>((image) => {
        for (const tag of action.tags) {
          if (!tag.images.find((im) => imageEqual(im, image))) {
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
