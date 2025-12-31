import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || "http://localhost:8000"

function hashPatientId(patientId: string): string {
  return crypto.createHash("sha256").update(patientId).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const { patientId, consultationSummary } = await request.json()

    if (!patientId || !consultationSummary) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Hash patient ID for privacy before sending to blockchain
    const patientHash = hashPatientId(patientId)

    // Call Python blockchain service
    const response = await fetch(`${BLOCKCHAIN_SERVICE_URL}/blockchain/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_hash: patientHash,
        consultation_summary: consultationSummary.substring(0, 1000),
      }),
    })

    if (!response.ok) {
      throw new Error(`Blockchain service error: ${response.statusText}`)
    }

    const blockchainResult = await response.json()

    return NextResponse.json({
      success: true,
      blockHash: blockchainResult.block.hash,
      timestamp: blockchainResult.block.timestamp,
      txId: blockchainResult.block.index,
      message: blockchainResult.message,
    })
  } catch (error) {
    console.error("Blockchain add error:", error)
    return NextResponse.json(
      { message: "Failed to record on blockchain", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
