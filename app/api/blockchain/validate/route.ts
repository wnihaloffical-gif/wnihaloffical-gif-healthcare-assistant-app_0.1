import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    // Call Python blockchain service
    const response = await fetch(`${BLOCKCHAIN_SERVICE_URL}/blockchain/validate`)

    if (!response.ok) {
      throw new Error(`Blockchain service error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      isValid: data.is_valid,
      totalBlocks: data.total_blocks,
      status: data.message,
    })
  } catch (error) {
    console.error("Blockchain validate error:", error)
    return NextResponse.json(
      { message: "Failed to validate blockchain", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
