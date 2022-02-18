import { CategorySchema, ImageSchema } from "api"
import { Schema, model } from "mongoose"

const imageSchema = new Schema<ImageSchema>({
    id: { type: String },
    platform: { type: String }
})

imageSchema.index({ id: 1, platform: 1 }, { unique: true })

const categorySchema = new Schema<CategorySchema>({
    name: {
        type: String,
        unique: true,
        index: true
    },
    images: {
        type: [imageSchema]
    }
})

export { categorySchema }