import { db } from "@/lib/db/crud"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: patientId } = params

    logger.info("Fetching patient consultations", { patientId }, "CONSULTATION")

    const consultations = await db.getPatientConsultations(patientId)

    return NextResponse.json(consultations)
  } catch (error) {
    logger.error(
      "Failed to fetch patient consultations",
      { patientId: params.id },
      "CONSULTATION",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ message: "Failed to fetch consultations" }, { status: 500 })
  }
}
