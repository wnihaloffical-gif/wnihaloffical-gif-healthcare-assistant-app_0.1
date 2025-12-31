import { seedData } from "@/lib/db-seed"
import { type NextRequest, NextResponse } from "next/server"

// Mock JWT token generation
function generateToken(userId: string): string {
  return Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // Mock authentication - find user in seed data
    const user = seedData.users.find((u) => u.email === email && u.role === role)

    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken(user.id)

    return NextResponse.json({
      token,
      userId: user.id,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 })
  }
}
