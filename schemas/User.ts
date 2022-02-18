import mongoose, { Schema, model } from "mongoose"
import type { UserSchema } from "api"
import { tagSchema } from "./Tag"

export const userSchema = new Schema<UserSchema>({
    uid: { type: String, index: true, unique: true },
    tags: { type: [tagSchema] }
})

const UserModel: mongoose.Model<UserSchema> = mongoose.models.users || model("users", userSchema)
export default UserModel