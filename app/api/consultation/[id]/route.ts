import { db } from "@/lib/db/crud"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: consultationId } = params

    logger.info("Fetching consultation", { consultationId }, "CONSULTATION")

    const consultation = await db.getConsultationById(consultationId)

    if (!consultation) {
      logger.warn("Consultation not found", { consultationId }, "CONSULTATION")
      return NextResponse.json({ message: "Consultation not found" }, { status: 404 })
    }

    const blockchainRecord = await db.getBlockchainRecord(consultationId)

    return NextResponse.json({
      ...consultation,
      blockchainProof: blockchainRecord || null,
    })
  } catch (error) {
    logger.error(
      "Failed to fetch consultation",
      {},
      "CONSULTATION",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ message: "Failed to fetch consultation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: consultationId } = params
    const updates = await request.json()

    logger.info("Updating consultation", { consultationId, updates }, "CONSULTATION")

    await db.updateConsultation(consultationId, updates)

    return NextResponse.json({ message: "Consultation updated successfully" })
  } catch (error) {
    logger.error(
      "Failed to update consultation",
      {},
      "CONSULTATION",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ message: "Failed to update consultation" }, { status: 500 })
  }
}
