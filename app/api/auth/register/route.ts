import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || "dev-secret-key"
  const expiresIn = process.env.JWT_EXPIRY || "24h"

  return jwt.sign({ userId }, secret, { expiresIn })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { name, email, password, role, specialization } = await request.json()

    logger.info("Registration attempt", { email, role }, "AUTH")

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      logger.warn("Registration failed: user already exists", { email }, "AUTH")
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role.toUpperCase(),
        specialization,
      },
    })

    const token = generateToken(user.id)
    const duration = Date.now() - startTime

    logger.info("Registration successful", { userId: user.id, email, role, duration }, "AUTH")

    return NextResponse.json({
      token,
      userId: user.id,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error("Registration error", { duration }, "AUTH", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ message: "Registration failed" }, { status: 500 })
  }
}
