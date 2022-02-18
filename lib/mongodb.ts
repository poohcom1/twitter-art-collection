import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI
const options = {}

let mongoClientCache: MongoClient | null = null


export default async function getMongoClient(): Promise<MongoClient> {
    if (mongoClientCache) {
        return mongoClientCache
    }


    if (!uri) {
        throw new Error('Please add your Mongo URI to .env.local')
    }

    const client = new MongoClient(uri, options)

    mongoClientCache = await client.connect()
    return mongoClientCache
}