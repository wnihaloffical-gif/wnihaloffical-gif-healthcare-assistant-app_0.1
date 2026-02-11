// app/api/consultation/finalize/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { hashConsultation, storeConsultation } from "@/lib/blockchain/client"

export async function POST(request: NextRequest) {
  try {
    const { consultationId, doctorId, finalDiagnosis, doctorNotes } = await request.json()

    if (!consultationId || !doctorId) {
      return NextResponse.json({ error: "consultationId and doctorId required" }, { status: 400 })
    }

    // Update consultation
    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        doctorId,
        finalizedByDoctor: true,
        finalDiagnosis,
        doctorNotes,
        status: "COMPLETED",
      },
    })

    // Re-hash with doctor finalization
    const dataToHash = {
      transcript: consultation.transcript,
      structuredSymptoms: consultation.structuredSymptoms,
      probableConditions: consultation.probableConditions,
      riskLevel: consultation.riskLevel,
      medicines: consultation.medicines,
      ddiAlerts: consultation.ddiAlerts,
      summaryText: consultation.summaryText,
      finalDiagnosis,
      doctorNotes,
      finalizedByDoctor: true,
    }

    const newHash = hashConsultation(JSON.stringify(dataToHash))
    const { txId, timestamp } = await storeConsultation(newHash, consultation.patientId, "doctor")

    // Update blockchain hash
    await prisma.consultation.update({
      where: { id: consultationId },
      data: { blockchainHash: newHash },
    })

    // Update blockchain record
    await prisma.blockchainRecord.upsert({
      where: { consultationId },
      update: {
        dataHash: newHash,
        txId,
        timestamp,
      },
      create: {
        consultationId,
        patientId: consultation.patientId,
        dataHash: newHash,
        txId,
        blockNumber: 0,
        timestamp,
      },
    })

    return NextResponse.json({
      success: true,
      blockchainHash: newHash,
      txId,
      timestamp,
    })
  } catch (error) {
    console.error("[FINALIZE API] Error:", error)
    return NextResponse.json({ error: "Finalize failed" }, { status: 500 })
  }
}