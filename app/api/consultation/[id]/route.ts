import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

function parseNumericId(value: unknown): number | null {
  if (typeof value === "number") return value
  if (typeof value !== "string") return null
  const digits = value.replace(/\D/g, "")
  const parsed = parseInt(digits, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function mapConsultationRow(row: any) {
  return {
    id: row.id,
    patientId: String(row.patientId),
    doctorId: row.doctorId !== null && row.doctorId !== undefined ? String(row.doctorId) : undefined,
    transcription: row.transcript || "",
    symptoms: Array.isArray(row.structuredSymptoms?.associatedSymptoms)
      ? row.structuredSymptoms.associatedSymptoms
      : [],
    probableConditions: Array.isArray(row.probableConditions)
      ? row.probableConditions
      : [],
    suggestedMedicines: Array.isArray(row.medicines)
      ? row.medicines.map((med: any, index: number) => ({
          id: med.id || `med-${index}`,
          name: med.name || med.drug || "Unknown Medicine",
          class: med.class || "Unknown Class",
          dose: med.dose || med.frequency || "",
          frequency: med.frequency || "",
          description: med.description || med.explanation || "",
        }))
      : [],
    ddiAlerts: Array.isArray(row.ddiAlerts) ? row.ddiAlerts : [],
    riskLevel: typeof row.riskLevel === "string" ? row.riskLevel.toLowerCase() : row.riskLevel,
    finalDiagnosis: row.finalDiagnosis || "",
    doctorNotes: row.doctorNotes || "",
    status: typeof row.status === "string" ? row.status.toLowerCase() : row.status,
    blockchainHash: row.blockchainHash || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    summary: row.summaryText || "",
    blockchainProof: row.blockchainRecord || null,
  }
}

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

    return NextResponse.json(mapConsultationRow(consultation))
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

    const data: any = {}
    const doctorId = parseNumericId(updates.doctorId)
    if (doctorId !== null) {
      data.doctorId = doctorId
    }
    if (updates.finalDiagnosis !== undefined) {
      data.finalDiagnosis = updates.finalDiagnosis
    }
    if (updates.doctorNotes !== undefined) {
      data.doctorNotes = updates.doctorNotes
    }
    if (updates.status !== undefined) {
      data.status = updates.status
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 })
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: parseInt(consultationId, 10) },
      data,
    })

    logger.info("Consultation updated", { consultationId }, "CONSULTATION")

    return NextResponse.json(mapConsultationRow(updatedConsultation))
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
