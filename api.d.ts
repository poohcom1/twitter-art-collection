// API Objects

type Platform = "twitter"

export interface PostTagBody extends TagSchema {
    userId: string
}

// DB Schema
export interface ImageSchema {
    id: string
    platform: Platform
}

export interface TagSchema {
    name: string
    images: Array<ImageSchema>
}

export interface UserSchema {
    uid: string
    tags: Array<TagSchema>
}