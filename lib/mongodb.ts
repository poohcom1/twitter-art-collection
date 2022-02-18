import mongoose from "mongoose";

const uri = process.env.MONGODB_URI
const options = {}

let mongoClientCache: typeof mongoose | null = null


export default async function getMongoClient(): Promise<typeof mongoose> {
    if (mongoClientCache) {
        return mongoClientCache
    }

    if (!uri) {
        throw new Error('Please add your Mongo URI to .env.local')
    }

    mongoClientCache = await mongoose.connect(uri, options)
    return mongoClientCache
}