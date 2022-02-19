import mongoose, { Schema, model } from "mongoose"
import { tagSchema } from "./Tag"

export const userSchema = new Schema<UserSchema>({
    uid: { type: String, index: true, unique: true, required: true },
    tags: { type: Map }
})

const UserModel: mongoose.Model<UserSchema> = mongoose.models.users || model("users", userSchema)
export default UserModel