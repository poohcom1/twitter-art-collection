import create from "zustand";
import { combine } from "zustand/middleware";
import { imageEqual } from "src/utils/objectUtils";
import { BLACKLIST_TAG } from "src/utils/constants";
import { getUser, postUser } from "src/adapters/userAdapter";
import { postTag, deleteTag, putTag } from "src/adapters/tagsAdapter";
import { fetchTweetData } from "src/adapters/tweetAdapter";

// Filters
type ImagePredicate = <S extends ImageSchema>(
  image: ImageSchema,
  index?: number,
  array?: ImageSchema[]
) => image is S;

const FILTERS = ["all", "uncategorized", "tag"] as const;
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

// Equality functions
const isString = (data: unknown): data is string => {
  return typeof data === 'string';
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
      filterTagName: "",
      editMode: <"add" | "delete">"add",
      // User
      newUser: false,
      // Twitter
      tweets: <TweetSchema[]>[],
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

        if (blacklist && get().filterTagName !== blacklist.name) {
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
          if (state.filterTagName === tag.name) {
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
            const tagObject = tags.get(tag)

            if (tagObject) {
              tagObject.images.push(image);
              tags.set(tagObject.name, tagObject);

              putTag(tagObject).then();
            } else {
              console.error("Nonexistent tagname image add attempt")
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
          const tags = state.tags;

          if (!tags.has(BLACKLIST_TAG)) {
            const blacklistTag = { name: BLACKLIST_TAG, images: [image] };

            tags.set(BLACKLIST_TAG, blacklistTag);

            postTag(blacklistTag);
          } else {
            const blacklistTag = tags.get(BLACKLIST_TAG);

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
      setFilter: (
        action:
          | FilterAction<"all">
          | FilterAction<"uncategorized">
          | FilterTagAction
      ) => set((state) => ({ ...state, ...setFilter(action, state.tags) })),
      /* -------------------------------- EditMode -------------------------------- */
      toggleEditMode: () =>
        set({ editMode: get().editMode === "add" ? "delete" : "add" }),
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
  action: FilterAction<"all"> | FilterAction<"uncategorized"> | FilterTagAction,
  tags: TagCollection
): {
  imageFilter: ImagePredicate;
  filterTagName: string;
  filterType: FilterType;
} {
  let imageFilter = <ImagePredicate>((_image) => true);
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
      imageFilter = <ImagePredicate>((image) => {
        return !!action.tag.images.find((im) => imageEqual(im, image));
      });
      break;
  }

  return {
    imageFilter: imageFilter,
    filterTagName: (action as FilterTagAction).tag?.name ?? "",
    filterType: action.type,
  };
}
