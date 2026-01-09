import { db } from "@/lib/db/crud"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || "dev-secret-key"
  const expiresIn = process.env.JWT_EXPIRY || "24h"

  return jwt.sign({ userId }, secret, { expiresIn })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { email, password, role } = await request.json()

    logger.info("Login attempt", { email, role }, "AUTH")

    // Fetch user from database
    const user = await db.getUserByEmail(email)

    if (!user || user.role !== role) {
      logger.warn("Login failed: user not found or role mismatch", { email, role }, "AUTH")
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Compare password hash
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      logger.warn("Login failed: invalid password", { email }, "AUTH")
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken(user._id!)
    const duration = Date.now() - startTime

    logger.info("Login successful", { userId: user._id, email, role, duration }, "AUTH")

    return NextResponse.json({
      token,
      userId: user._id,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error("Login error", { duration }, "AUTH", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 })
  }
}
