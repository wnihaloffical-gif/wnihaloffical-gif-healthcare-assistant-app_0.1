import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params

    logger.info("Fetching user profile", { userId }, "USER")

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    })

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
      { userId: "unknown" },
      "USER",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 })
  }
}
