import create from "zustand";
import { combine } from "zustand/middleware";
import {
  deleteTag,
  ERR_LAST_PAGE,
  getLikedTweets,
  getTags,
  getTweetAsts,
  postTag,
  putTag,
} from "src/adapters";
import { imageEqual } from "src/utils/objectUtils";
import { BLACKLIST_TAG } from "src/utils/constants";

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
      // Twitter
      tweets: <TweetSchema[]>[],
      extraTweets: <TweetSchema[]>[],
      tweetsAllFetched: false,
    },
    (set, get) => ({
      initTweetsAndTags: async () => {
        let error = 0;

        const [tagsResult, tweetsResult] = await Promise.all([
          getTags(),
          getLikedTweets(),
        ]);

        error = tagsResult.error !== 0 ? tagsResult.error : tweetsResult.error;

        set({
          tags: tagsResult.data,
          tweets: tweetsResult.data,
          tagsStatus: "loaded",
        });

        if (error === ERR_LAST_PAGE) {
          set({ tweetsAllFetched: true });
        }

        // Get tag tweets
        if (error === 0) {
          const tagList = Array.from(get().tags.values());
          const tweetIds = get().tweets.map((tweet) => tweet.id);

          // Find all tweets that are not yet fetched from the initial page fetch
          const tagsToFetch: string[] = tagList
            .reduce(
              (ids, tag) => ids.concat(tag.images.map((im) => im.id)),
              <string[]>[]
            )
            .filter((id) => !tweetIds.includes(id));

          // Fetch tweets, removing duplicates by converting list to a Set and back
          const extraTweetsData = await getTweetAsts(
            Array.from(new Set(tagsToFetch))
          );

          set({ extraTweets: extraTweetsData.data });

          error = extraTweetsData.error;
        }

        return error;
      },

      getTweets: () => {
        let tweets = get().tweets

        const blacklist = get().tags.get(BLACKLIST_TAG)

        if (blacklist) {
          tweets = tweets.filter(tweet => !blacklist.images.find(image => imageEqual(tweet, image)))
        }

        return tweets
      },
    

      /**
       * Loads liked tweets
       * @returns error
       */
      loadTweets: async () => {
        let error = 0;

        const tweetsData = await getLikedTweets();

        set({ tweets: get().tweets.concat(tweetsData.data) });

        error = tweetsData.error;

        if (error === ERR_LAST_PAGE) {
          console.log("Tweets all fetched");
          set({ tweetsAllFetched: true });
        }

        return error;
      },

      /* ---------------------------------- Tags ---------------------------------- */
      getTagList: (): TagSchema[] => {
        const tagList = Array.from(get().tags.values())

        return tagList.filter(tag => tag.name !== BLACKLIST_TAG)
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
          let tagChangeObject = {}
          if (state.filterTagName === tag.name) {
            tagChangeObject = setFilter({ type: "all" }, state.tags)
          }

          deleteTag(tag).then();

          const tags = state.tags;
          tags.delete(tag.name);

          return { ...state, tags, ...tagChangeObject };
        }),
      /* --------------------------------- Images --------------------------------- */
      addImage: (tag: TagSchema, image: ImageSchema): void =>
        set((state) => {
          const tags = state.tags;
          tag.images.push(image);
          tags.set(tag.name, tag);

          putTag(tag).then();

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
          const tags = state.tags

          if (!tags.has(BLACKLIST_TAG)) {
            const blacklistTag = { name: BLACKLIST_TAG, images: [image] }

            tags.set(BLACKLIST_TAG, blacklistTag)

            postTag(blacklistTag)
          } else {
            const blacklistTag = tags.get(BLACKLIST_TAG)

            blacklistTag?.images.push(image)

            putTag(blacklistTag!)
          }

          return {...state, tags}
        })
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
      ) =>
        set((state) => ({ ...state, ...setFilter(action, state.tags) })),
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
  action:
    | FilterAction<"all">
    | FilterAction<"uncategorized">
    | FilterTagAction,
  tags: TagCollection
): { imageFilter: ImagePredicate, filterTagName: string, filterType: FilterType } {
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

          if (tag.images.find((im) => imageEqual(im, image)))
            return false;
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
  }
}