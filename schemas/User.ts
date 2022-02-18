import mongoose, { Schema, model } from "mongoose"
import type { UserSchema } from "api"
import { categorySchema } from "./Category"

export const userSchema = new Schema<UserSchema>({
    uid: { type: String, index: true, unique: true },
    categories: { type: [categorySchema] }
})

const UserModel: mongoose.Model<UserSchema> = mongoose.models.users || model("users", userSchema)
export default UserModel