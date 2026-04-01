import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

function parseDoctorId(value: string): number | null {
  const digits = value.replace(/\D/g, "")
  return digits ? parseInt(digits, 10) : null
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
    probableConditions: Array.isArray(row.probableConditions) ? row.probableConditions : [],
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
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: doctorId } = await params
    const parsedDoctorId = parseDoctorId(doctorId)

    logger.info(
      "Fetching doctor consultations",
      { doctorId, parsedDoctorId },
      "DOCTOR_CONSULTATIONS",
    )

    const whereFilter = parsedDoctorId !== null
      ? {
          OR: [
            { doctorId: parsedDoctorId },
            { doctorId: null, status: "PENDING" },
          ],
        }
      : { doctorId: null, status: "PENDING" }

    const consultations = await prisma.consultation.findMany({
      where: whereFilter,
      include: {
        blockchainRecord: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(consultations.map(mapConsultationRow))
  } catch (error) {
    logger.error(
      "Failed to fetch doctor consultations",
      { doctorId: "unknown" },
      "DOCTOR_CONSULTATIONS",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ message: "Failed to fetch consultations" }, { status: 500 })
  }
}
