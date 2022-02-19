// DB Schema
type Platform = "twitter"

export interface ImageSchema {
    id: string
    platform: Platform
}

export interface TagSchema {
    name: string
    images: Array<ImageSchema>
}

type TagCollection = Array<TagSchema>

export interface UserSchema {
    uid: string
    tags: TagCollection
}

// API Objects

export interface PostTagBody extends TagSchema { }

export interface PutTagBody extends TagSchema { }
