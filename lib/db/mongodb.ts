// This file is kept for backward compatibility but now uses Prisma for MySQL
// All database operations should use Prisma Client instead
import { logger } from "./logger"
import { prisma } from "./prisma"

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    logger.info("Connected to MySQL database successfully")
    return { client: null, db: null }
  } catch (error) {
    logger.error("Failed to connect to MySQL database", {
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    logger.info("Disconnected from MySQL database")
  } catch (error) {
    logger.error("Failed to disconnect from MySQL database", {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function getDatabase() {
  try {
    await prisma.$connect()
    return prisma
  } catch (error) {
    logger.error("Failed to get database connection", {
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
