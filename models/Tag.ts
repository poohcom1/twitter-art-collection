import { Schema } from "mongoose";

const imageSchema = new Schema<Pick<ImageSchema, "id" | "platform">>({
  id: { type: String },
  platform: { type: String },
});

imageSchema.index({ id: 1, platform: 1 }, { unique: true });

const tagSchema = new Schema<TagSchema>({
  images: {
    type: [String],
  },
});

export { tagSchema };
