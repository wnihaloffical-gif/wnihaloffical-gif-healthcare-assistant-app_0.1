import { runTriage } from "@/lib/ai/triage-engine"
import { checkDDI } from "@/lib/ai/ddi-checker"
import { db } from "@/lib/db/crud"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { inputText, language, currentMedicines, patientId } = await request.json()

    logger.info("Consultation analysis started", { patientId, language }, "CONSULTATION")

    const triageResult = await runTriage(inputText, language, currentMedicines)

    // Check for DDI
    const suggestedMedicineIds = triageResult.suggestedMedicines.map((m) => m.id)
    const ddiAlerts = checkDDI(suggestedMedicineIds, currentMedicines || [])

    // Filter out high-risk combinations
    const safeMedicines = triageResult.suggestedMedicines.filter((med) => {
      return !ddiAlerts.filter((a) => a.severity === "high").some((a) => a.drug1 === med.id || a.drug2 === med.id)
    })

    const consultationData = {
      patientId,
      symptoms: triageResult.symptoms,
      probableConditions: triageResult.probableConditions,
      riskLevel: triageResult.riskLevel,
      hasRedFlags: triageResult.hasRedFlags,
      redFlagWarnings: triageResult.redFlagWarnings,
      suggestedMedicines: safeMedicines,
      ddiAlerts,
      patientSummaryText: triageResult.patientSummaryText,
      language,
      status: "pending" as const,
    }

    const consultationId = await db.createConsultation(consultationData)

    const blockchainRecord = await db.storeBlockchainRecord({
      consultationId,
      patientId,
      dataHash: `0x${Math.random().toString(16).slice(2)}`, // Mock hash
      txId: `0x${Math.random().toString(16).slice(2)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
      verified: true,
    })

    const duration = Date.now() - startTime
    await db.logMLInference({
      consultationId,
      patientId,
      inputText,
      language,
      modelVersion: "1.0.0",
      predictions: triageResult,
      processingTime: duration,
      timestamp: new Date(),
    })

    logger.info("Consultation analysis completed", { consultationId, patientId, duration }, "CONSULTATION")

    return NextResponse.json({
      consultationId,
      symptoms: triageResult.symptoms,
      probableConditions: triageResult.probableConditions,
      riskLevel: triageResult.riskLevel,
      hasRedFlags: triageResult.hasRedFlags,
      redFlagWarnings: triageResult.redFlagWarnings,
      suggestedMedicines: safeMedicines,
      ddiAlerts,
      patientSummaryText: triageResult.patientSummaryText,
      blockchainProof: {
        hash: blockchainRecord.dataHash,
        timestamp: blockchainRecord.timestamp,
        txId: blockchainRecord.txId,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      "Consultation analysis error",
      { duration },
      "CONSULTATION",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ message: "Analysis failed" }, { status: 500 })
  }
}
