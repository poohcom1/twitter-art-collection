import { Schema, model } from "mongoose"

const imageSchema = new Schema<ImageSchema>({
    id: { type: String },
    platform: { type: String }
})

imageSchema.index({ id: 1, platform: 1 }, { unique: true })

const tagSchema = new Schema<TagSchema>({
    name: {
        type: String,
        unique: true,
        index: true
    },
    images: {
        type: [imageSchema]
    }
})

export { tagSchema }