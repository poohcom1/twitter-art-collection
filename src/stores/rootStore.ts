import create from "zustand";
import { combine } from "zustand/middleware";
import { deleteTag, getTags, postTag, putTags } from "src/adapters";
import { imageEqual } from "src/utils/objectUtils";

// Filters
type ImagePredicate = <S extends ImageSchema>(
  image: ImageSchema,
  index?: number,
  array?: ImageSchema[]
) => image is S;

export type FilterTypes = "all" | "uncategorized" | "tag";

interface FilterAction<A extends FilterTypes> {
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
      tagsLoaded: false,
      imageFilter: <ImagePredicate>((_image, _index, _array) => {
        return true;
      }),
      filterTagName: "",
      filterType: <FilterTypes>"all",
      editMode: <"add" | "delete">"add",
    },
    (set, get) => ({
      initTags: async () => {
        await getTags().then((tags) => set({ tags }));
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
