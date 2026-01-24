import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"

// --------------------
// JWT helper
// --------------------
function generateToken(userId: number): string {
  const secret = (process.env.JWT_SECRET || "dev-secret-key") as string
  const expiresIn = process.env.JWT_EXPIRY || "24h"

  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions)
}

// --------------------
// LOGIN API
// --------------------
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Email, password, and role are required" },
        { status: 400 }
      )
    }

    const normalizedRole = String(role).toUpperCase()

    const allowedRoles = ["PATIENT", "DOCTOR", "ADMIN"]

    if (!allowedRoles.includes(normalizedRole)) {
      logger.warn("Login failed: invalid role", { email, role }, "AUTH")
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    logger.info("Login attempt", { email, role: normalizedRole }, "AUTH")

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.role !== normalizedRole) {
      logger.warn(
        "Login failed: user not found or role mismatch",
        { email, role: normalizedRole },
        "AUTH"
      )
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      logger.warn("Login failed: invalid password", { email }, "AUTH")
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken(user.id)
    const duration = Date.now() - startTime

    logger.info(
      "Login successful",
      { userId: user.id, email, role: user.role, duration },
      "AUTH"
    )

    return NextResponse.json({
      token,
      userId: user.id,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      "Login error",
      { duration },
      "AUTH",
      error instanceof Error ? error.message : String(error)
    )
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 })
  }
}
