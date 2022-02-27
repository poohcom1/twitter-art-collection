import create from "zustand";
import { combine } from "zustand/middleware";
import { putTags } from "src/adapters";

type ImagePredicate = <S extends ImageSchema<any>>(
  image: ImageSchema<any>,
  index?: number,
  array?: ImageSchema<any>[]
) => image is S;

export type FilterTypes = "all" | "uncategorized" | "tag";

interface FilterAction<A extends FilterTypes> {
  type: A;
}

interface FilterTagAction extends FilterAction<"tag"> {
  tag: TagSchema;
}

export const useStore = create(
  combine(
    {
      uid: "",
      tags: <TagCollection>new Map(),
      imageFilter: <ImagePredicate>((_image, _index, _array) => {
        return true;
      }),
      filterTagName: "",
      filterType: <FilterTypes>"all",
    },
    (set, get) => ({
      initTags: (tags: TagCollection, uid: string) => set({ tags, uid }),
      addTag: (tag: TagSchema): void =>
        set((state) => {
          const tags = state.tags;
          tags.set(tag.name, tag);
          return { ...state, tags };
        }),
      removeTag: (tag: TagSchema): void =>
        set((state) => {
          const tags = state.tags;
          tags.delete(tag.name);
          return { ...state, tags };
        }),
      // Images
      addImage: (tag: TagSchema, image: ImageSchema<any>): void =>
        set((state) => {
          const tags = state.tags;
          tag.images.push(image);
          tags.set(tag.name, tag);

          putTags(get().uid, tag).then();

          return { ...state, tags: tags };
        }),
      removeImage: (tag: TagSchema, image: ImageSchema<any>): void =>
        set((state) => {
          const tags = state.tags;
          tag.images = tag.images.filter((im) => im !== image);
          tags.set(tag.name, tag);

          putTags(get().uid, tag).then();

          return { ...state, tags: tags };
        }),
      // Filter
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

                  if (tag.images.find((im) => im.id === image.id)) return false;
                }
                return true;
              });
              break;
            case "tag":
              state.imageFilter = <ImagePredicate>((image) => {
                return !!action.tag.images.find((im) => im.id === image.id);
              });
              break;
          }

          return {
            imageFilter: state.imageFilter,
            filterTagName: (action as FilterTagAction).tag?.name ?? "",
            filterType: action.type,
          };
        }),
      setFilterTag: (tag: TagSchema) =>
        set((state) => {
          state.imageFilter = <ImagePredicate>((image) => {
            return !!tag.images.find((im) => im.id === image.id);
          });

          return {
            imageFilter: state.imageFilter,
            filterTagName: tag?.name,
            filterType: "tag",
          };
        }),
      setFilterType: (filter: "all" | "uncategorized") =>
        set((state) => {
          state.imageFilter = <ImagePredicate>((image) => {
            switch (filter) {
              case "all":
                return true;
              case "uncategorized":
                const tags = Array.from(get().tags.values());
                for (let i = 0; i < tags.length; i++) {
                  const tag = tags[i];

                  if (tag.images.find((im) => im.id === image.id)) return false;
                }
                return true;
            }
          });

          return { imageFilter: state.imageFilter, filterType: filter };
        }),
    })
  )
);
