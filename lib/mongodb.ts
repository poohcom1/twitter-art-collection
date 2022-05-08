import UserModel from "models/User";
import mongoose, { connect } from "mongoose";

const uri = process.env.MONGODB_URI;
const options = {};

let mongoClientCache: typeof mongoose;

export async function getMongoConnection(): Promise<typeof mongoose> {
  if (mongoClientCache) {
    return mongoClientCache as typeof mongoose;
  }

  if (!uri) {
    throw new Error("Please add your Mongo URI to .env");
  }
  mongoClientCache = await connect(uri, options);

  return mongoClientCache as typeof mongoose;
}

/**
 * @deprecated
 */
export async function removeDeletedTweets(
  userId: string,
  deletedTweetIds: string[]
): Promise<void> {
  const user = await UserModel.findOne({ uid: userId });

  if (user && user.tweetIds) {
    user.tweetIds = user.tweetIds.filter((id) => !deletedTweetIds.includes(id));

    user.tags.forEach((tag) => {
      tag.images = tag.images.filter((id) => !deletedTweetIds.includes(id));
    });

    await UserModel.updateOne({ uid: user.uid }, user);
  } else {
    console.warn(`[removeDeletedTweets] User not found: ${userId}`);
  }
}
