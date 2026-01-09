import { db } from "@/lib/db/crud"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: userId } = params

    logger.info("Fetching user profile", { userId }, "USER")

    const user = await db.getUserById(userId)

    if (!user) {
      logger.warn("User not found", { userId }, "USER")
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Don't return password hash
    const { passwordHash, ...userPublicData } = user

    return NextResponse.json(userPublicData)
  } catch (error) {
    logger.error(
      "Failed to fetch user",
      { userId: params.id },
      "USER",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 })
  }
}
