import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: patientId } = await params

    logger.info("Fetching patient consultations", { patientId }, "CONSULTATION")

    const consultations = await prisma.consultation.findMany({
      where: { patientId: parseInt(patientId, 10) },
      include: {
        blockchainRecord: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(consultations)
  } catch (error) {
    logger.error(
      "Failed to fetch patient consultations",
      { patientId: "unknown" },
      "CONSULTATION",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ message: "Failed to fetch consultations" }, { status: 500 })
  }
}
