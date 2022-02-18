// API Objects

type Platform = "twitter"

export interface PostCategoryBody extends CategorySchema {
    userId: string
}

// DB Schema
export interface ImageSchema {
    id: string
    platform: Platform
}

export interface CategorySchema {
    name: string
    images: Array<ImageSchema>
}

export interface UserSchema {
    uid: string
    categories: Array<CategorySchema>
}