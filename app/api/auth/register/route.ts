import { seedData } from "@/lib/db-seed"
import { type NextRequest, NextResponse } from "next/server"

function generateToken(userId: string): string {
  return Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, specialization } = await request.json()

    // Check if user already exists
    const userExists = seedData.users.some((u) => u.email === email)
    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Create new user (in mock, just return success)
    const newUserId = `user-${Date.now()}`
    const token = generateToken(newUserId)

    return NextResponse.json({
      token,
      userId: newUserId,
      name,
      role,
    })
  } catch (error) {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 })
  }
}
