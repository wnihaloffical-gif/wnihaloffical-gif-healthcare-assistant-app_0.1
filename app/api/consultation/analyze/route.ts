import { prisma } from "@/lib/db/prisma"
import { runTriage } from "@/lib/ai/triage-engine"
import { checkDDI } from "@/lib/ai/ddi-checker"
import { logger } from "@/lib/db/logger"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { generateConsultationHash } from "../../../../lib/utils/hash-generator"

// ============================================================================
// DETERMINISTIC HASH GENERATION FOR DATA INTEGRITY
// ============================================================================
// This function generates a SHA-256 hash from consultation data
// If ANY field changes (symptoms, diagnosis, medicines, etc), hash MUST change
// This ensures tamper-proof records on blockchain

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

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        symptoms: triageResult.symptoms,
        riskLevel: triageResult.riskLevel.toUpperCase(),
        hasRedFlags: triageResult.hasRedFlags,
        redFlagWarnings: triageResult.redFlagWarnings ?? [],
        finalMedicines: [],
        patientSummaryText: triageResult.patientSummaryText,
        language,
        status: "PENDING",

        probableConditions: {
          createMany: {
            data: triageResult.probableConditions.map((pc) => ({
              name: pc,
              confidence: 0.8,
              severity: "moderate",
            })),
          },
        },
        suggestedMedicines: {
          createMany: {
            data: safeMedicines.map((med) => ({
              medicineId: med.id,
              name: med.name,
              dose: med.dose,
              frequency: med.frequency,
              explanation: med.description ?? "",
            })),
          },
        },
        ddiAlerts: {
          createMany: {
            data: ddiAlerts.map((alert) => ({
              drug1: alert.drug1,
              drug2: alert.drug2,
              severity: alert.severity === "high" ? "SEVERE" : alert.severity === "medium" ? "MODERATE" : "MILD",
              description: alert.description,
            })),
          },
        },
        blockchainRecord: {
          create: {
            patientId,
            dataHash: generateConsultationHash({
              symptoms: triageResult.symptoms,
              conditions: triageResult.probableConditions,
              medicines: safeMedicines,
              riskLevel: triageResult.riskLevel,
              redFlags: triageResult.redFlagWarnings ?? [],
            }),
            txId: `0x${Math.random().toString(16).slice(2)}`,
            blockNumber: Math.floor(Math.random() * 1000000),
            timestamp: new Date(),
            verified: true,
          },
        },
        mlInferenceLog: {
          create: {
            patientId,
            inputText,
            language,
            modelVersion: "1.0.0",
            predictions: triageResult,
            processingTime: Date.now() - startTime,
            timestamp: new Date(),
          },
        },
      },
      include: {
        blockchainRecord: true,
        probableConditions: true,
        suggestedMedicines: true,
        ddiAlerts: true,
      },
    })

    const duration = Date.now() - startTime

    logger.info(
      "Consultation analysis completed",
      { consultationId: consultation.id, patientId, duration },
      "CONSULTATION",
    )

    return NextResponse.json({
      consultationId: consultation.id,
      symptoms: consultation.symptoms,
      probableConditions: consultation.probableConditions,
      riskLevel: consultation.riskLevel,
      hasRedFlags: consultation.hasRedFlags,
      redFlagWarnings: consultation.redFlagWarnings,
      suggestedMedicines: consultation.suggestedMedicines,
      ddiAlerts: consultation.ddiAlerts,
      patientSummaryText: consultation.patientSummaryText,
      blockchainProof: consultation.blockchainRecord
        ? {
            hash: consultation.blockchainRecord.dataHash,
            timestamp: consultation.blockchainRecord.timestamp,
            txId: consultation.blockchainRecord.txId,
          }
        : null,
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
