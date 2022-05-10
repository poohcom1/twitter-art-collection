import mongoose, { Schema, model } from "mongoose";

export const userSchema = new Schema<UserSchema>({
  uid: { type: String, index: true, unique: true, required: true },
  tags: { type: Map },
  pinnedTags: { type: [String] },
  tweetIds: { type: [String] },
});

const UserModel: mongoose.Model<DBUserSchema> =
  mongoose.models.users || model("users", userSchema);
export default UserModel;
