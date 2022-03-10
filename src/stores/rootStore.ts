import create from "zustand";
import { combine } from "zustand/middleware";
import {
  deleteTag,
  ERR_LAST_PAGE,
  getLikedTweets,
  getTags,
  getTweetAsts,
  postTag,
  putTags,
} from "src/adapters";
import { imageEqual } from "src/utils/objectUtils";

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
        let tags: TagCollection = new Map();

        // Get tags
        try {
          tags = await getTags();

          set({ tags, tagsStatus: "loaded" });
        } catch (e) {
          return set({ tagsStatus: "error" });
        }

        // Get liked tweets
        const tweetsData = await getLikedTweets();

        set({ tweets: tweetsData.data });

        error = tweetsData.error;

        if (error === ERR_LAST_PAGE) {
          console.log("Tweets all fetched");
          set({ tweetsAllFetched: true });
        }

        // Get tag tweets
        if (error === 0) {
          try {
            const tagList = Array.from(tags.values());
            const tweetIds = tweetsData.data.map((tweet) => tweet.id);

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
          } catch (e) {}
        }

        return error;
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
      addTag: (tag: TagSchema): void =>
        set((state) => {
          postTag(tag).then();

          const tags = state.tags;
          tags.set(tag.name, tag);

          return { ...state, tags };
        }),
      removeTag: (tag: TagSchema): void =>
        set((state) => {
          deleteTag(tag).then();

          const tags = state.tags;
          tags.delete(tag.name);
          return { ...state, tags };
        }),
      /* --------------------------------- Images --------------------------------- */
      addImage: (tag: TagSchema, image: ImageSchema): void =>
        set((state) => {
          const tags = state.tags;
          tag.images.push(image);
          tags.set(tag.name, tag);

          putTags(tag).then();

          return { ...state, tags: tags };
        }),
      removeImage: (tag: TagSchema, image: ImageSchema): void =>
        set((state) => {
          const tags = state.tags;
          tag.images = tag.images.filter((im) => !imageEqual(im, image));
          tags.set(tag.name, tag);

          putTags(tag).then();

          return { ...state, tags: tags };
        }),

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
        set((state) => {
          switch (action.type) {
            case "all":
              state.imageFilter = <ImagePredicate>((_image) => true);
              break;
            case "uncategorized":
              state.imageFilter = <ImagePredicate>((image) => {
                const tags = Array.from(get().tags.values());
                for (let i = 0; i < tags.length; i++) {
                  const tag = tags[i];

                  if (tag.images.find((im) => imageEqual(im, image)))
                    return false;
                }
                return true;
              });
              break;
            case "tag":
              state.imageFilter = <ImagePredicate>((image) => {
                return !!action.tag.images.find((im) => imageEqual(im, image));
              });
              break;
          }

          return {
            imageFilter: state.imageFilter,
            filterTagName: (action as FilterTagAction).tag?.name ?? "",
            filterType: action.type,
          };
        }),
      /* -------------------------------- EditMode -------------------------------- */
      toggleEditMode: () =>
        set({ editMode: get().editMode === "add" ? "delete" : "add" }),
    })
  )
);
