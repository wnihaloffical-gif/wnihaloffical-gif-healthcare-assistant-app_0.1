// app/api/consultation/save/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { hashConsultation, storeConsultation } from "@/lib/blockchain/client"
import { SymptomAnalysisResult } from "@/lib/ai/runSymptomAnalysis"

export async function POST(request: NextRequest) {
  try {
    const { patientId, analysis, transcription } = await request.json()

    if (!patientId || !analysis || !transcription) {
      return NextResponse.json({ error: "patientId, analysis, and transcription required" }, { status: 400 })
    }

    // Validate analysis structure
    const requiredFields = [
      "structuredSymptoms", "probableConditions", "riskLevel",
      "suggestedMedicines", "ddiAlerts", "patientSummaryText"
    ]

    for (const field of requiredFields) {
      if (!(field in analysis)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create consultation
    const consultationData = {
      transcript: transcription,
      structuredSymptoms: analysis.structuredSymptoms,
      probableConditions: analysis.probableConditions,
      riskLevel: analysis.riskLevel.toUpperCase(),
      medicines: analysis.suggestedMedicines,
      ddiAlerts: analysis.ddiAlerts,
      summaryText: analysis.patientSummaryText,
      finalizedByDoctor: false,
    }

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        ...consultationData,
      },
    })

    // Hash and store on blockchain
    const dataHash = hashConsultation(JSON.stringify(consultationData))
    const { txId, timestamp } = await storeConsultation(dataHash, patientId, "patient")

    // Update with blockchain hash
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: { blockchainHash: dataHash },
    })

    // Create blockchain record (handle duplicate dataHash gracefully)
    try {
      await prisma.blockchainRecord.create({
        data: {
          consultationId: consultation.id,
          patientId,
          dataHash,
          txId,
          blockNumber: 0, // Placeholder
          timestamp,
        },
      })
    } catch (err: any) {
      // Prisma duplicate key error code is P2002
      // If a record with the same dataHash already exists, retrieve it and continue
      if (err?.code === "P2002") {
        console.warn("[SAVE API] Duplicate blockchain record detected for dataHash, fetching existing record")
        const existing = await prisma.blockchainRecord.findUnique({ where: { dataHash } })
        if (existing) {
          // Use existing transaction info
          console.info("[SAVE API] Using existing blockchain record", { dataHash, txId: existing.txId })
          return NextResponse.json({
            consultationId: consultation.id,
            blockchainHash: dataHash,
            txId: existing.txId,
            timestamp: existing.timestamp,
            note: "Existing blockchain record used (duplicate dataHash)",
          })
        }
        // If somehow not found, fall through to rethrow
      }
      throw err
    }

    return NextResponse.json({
      consultationId: consultation.id,
      blockchainHash: dataHash,
      txId,
      timestamp,
    })
  } catch (error) {
    console.error("[SAVE API] Error:", error)
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}