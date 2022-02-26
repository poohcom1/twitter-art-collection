import { putTags } from 'src/adapters'
import create from 'zustand'

interface IStore {
    uid: string
    tags: TagCollection
    initTags: (tags: TagCollection, uid: string) => void
    addTag: (tag: TagSchema) => void
    removeTag: (tag: TagSchema) => void
    addImage: (tag: TagSchema, image: ImageSchema) => void
    removeImage: (tag: TagSchema, image: ImageSchema) => void
}

export const useStore = create<IStore>((set, get) => ({
    uid: "",
    tags: new Map(),
    initTags: (tags, uid) => set({ tags, uid }),
    addTag: (tag) => set((state) => {
        const tags = state.tags
        tags.set(tag.name, tag)
        return { ...state, tags }
    }),
    removeTag: (tag) => set(state => {
        const tags = state.tags
        tags.delete(tag.name)
        return { ...state, tags }
    }),
    addImage: (tag, image) => set(() => {
        tag.images.push(image)

        putTags(get().uid, tag).then()
    }),
    removeImage: (tag, image) => set(() => {
        tag.images.splice(tag.images.indexOf(image), 1)

        putTags(get().uid, tag).then()
    })
}))