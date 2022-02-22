// DB Schema
type Platform = "twitter"

interface ImageSchema {
    id: string
    platform: Platform
}

interface TagSchema {
    name: string
    images: Array<ImageSchema>
}

type TagCollection = Map<string, TagSchema>

interface UserSchema {
    uid: string
    tags: TagCollection
}

// API Objects

interface PostTagBody extends TagSchema { }

interface PutTagBody extends TagSchema { }

interface DeleteTagBody extends TagSchema { }