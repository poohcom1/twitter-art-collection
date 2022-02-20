import mongoose, { connect } from "mongoose";

const uri = process.env.MONGODB_URI
const options = {}

let mongoClientCache: typeof mongoose

export default async function getMongoConnection(): Promise<typeof mongoose> {
    if (mongoClientCache) {
        return mongoClientCache as typeof mongoose
    }

    if (!uri) {
        throw new Error('Please add your Mongo URI to .env.local')
    }

    mongoClientCache = await connect(uri, options)
    return mongoClientCache as typeof mongoose
}