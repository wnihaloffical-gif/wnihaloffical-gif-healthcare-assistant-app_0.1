import { MongoClient, type Db, type MongoClientOptions } from "mongodb"
import { logger } from "./logger"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB_NAME || "aarogyaguard"

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    logger.info("Using cached MongoDB connection")
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const options: MongoClientOptions = {
      retryWrites: true,
      w: "majority",
    }

    const client = new MongoClient(mongoUri, options)
    await client.connect()

    const db = client.db(dbName)

    // Verify connection
    await db.admin().ping()
    logger.info("Connected to MongoDB successfully", { dbName })

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    logger.error("Failed to connect to MongoDB", {
      error: error instanceof Error ? error.message : String(error),
      mongoUri: mongoUri.split("@")[0] + "@***", // Mask password
    })
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    logger.info("Disconnected from MongoDB")
  }
}

export async function getDatabase(): Promise<Db> {
  if (!cachedDb) {
    const { db } = await connectToDatabase()
    return db
  }
  return cachedDb
}
