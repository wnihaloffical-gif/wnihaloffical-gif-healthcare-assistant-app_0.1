import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || "http://localhost:8000"

function hashPatientId(patientId: string): string {
  return crypto.createHash("sha256").update(patientId).digest("hex")
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    const { patientId } = await params

    if (!patientId) {
      return NextResponse.json({ message: "Patient ID required" }, { status: 400 })
    }

    // Hash patient ID for privacy
    const patientHash = hashPatientId(patientId)

    // Call Python blockchain service
    const response = await fetch(`${BLOCKCHAIN_SERVICE_URL}/blockchain/patient/${patientHash}`)

    if (!response.ok) {
      throw new Error(`Blockchain service error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      patientId: patientId.substring(0, 4) + "****", // Mask patient ID in response
      recordCount: data.total_records,
      records: data.records,
    })
  } catch (error) {
    console.error("Blockchain fetch error:", error)
    return NextResponse.json(
      {
        message: "Failed to retrieve blockchain records",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
