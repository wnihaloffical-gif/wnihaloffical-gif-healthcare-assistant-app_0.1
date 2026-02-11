import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: consultationId } = await params

    logger.info("Fetching consultation", { consultationId }, "CONSULTATION")

    const consultation = await prisma.consultation.findUnique({
      where: { id: parseInt(consultationId, 10) },
      include: {
        blockchainRecord: true,
        mlInferenceLog: true,
        auditLogs: true,
      },
    })

    if (!consultation) {
      logger.warn("Consultation not found", { consultationId }, "CONSULTATION")
      return NextResponse.json({ message: "Consultation not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...consultation,
      blockchainProof: consultation.blockchainRecord || null,
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: consultationId } = await params
    const updates = await request.json()

    logger.info("Updating consultation", { consultationId, updates }, "CONSULTATION")

    const updatedConsultation = await prisma.consultation.update({
      where: { id: parseInt(consultationId, 10) },
      data: {
        finalDiagnosis: updates.finalDiagnosis,
        finalMedicines: updates.finalMedicines,
        doctorNotes: updates.doctorNotes,
        status: updates.status,
      },
      include: {
        probableConditions: true,
        suggestedMedicines: true,
        ddiAlerts: true,
      },
    })

    logger.info("Consultation updated", { consultationId }, "CONSULTATION")

    return NextResponse.json(updatedConsultation)
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
