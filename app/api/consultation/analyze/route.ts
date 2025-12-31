import { runTriage } from "@/lib/ai/triage-engine"
import { checkDDI } from "@/lib/ai/ddi-checker"
import { hashConsultationData, storeConsultationHash } from "@/lib/blockchain/client"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { inputText, language, currentMedicines, patientId } = await request.json()

    // Run triage analysis
    const triageResult = await runTriage(inputText, language, currentMedicines)

    // Check for DDI
    const suggestedMedicineIds = triageResult.suggestedMedicines.map((m) => m.id)
    const ddiAlerts = checkDDI(suggestedMedicineIds, currentMedicines || [])

    // Filter out high-risk combinations
    const safeMedicines = triageResult.suggestedMedicines.filter((med) => {
      return !ddiAlerts.filter((a) => a.severity === "high").some((a) => a.drug1 === med.id || a.drug2 === med.id)
    })

    // Create consultation record
    const consultationData = {
      symptoms: triageResult.symptoms,
      conditions: triageResult.probableConditions,
      riskLevel: triageResult.riskLevel,
      medicines: safeMedicines,
      timestamp: new Date().toISOString(),
    }

    // Store on blockchain
    const dataHash = hashConsultationData(consultationData)
    const blockchainRecord = storeConsultationHash(`cons-${Date.now()}`, patientId, "patient", dataHash)

    return NextResponse.json({
      symptoms: triageResult.symptoms,
      probableConditions: triageResult.probableConditions,
      riskLevel: triageResult.riskLevel,
      hasRedFlags: triageResult.hasRedFlags,
      redFlagWarnings: triageResult.redFlagWarnings,
      suggestedMedicines: safeMedicines,
      ddiAlerts,
      patientSummaryText: triageResult.patientSummaryText,
      blockchainProof: {
        hash: blockchainRecord.hash,
        timestamp: blockchainRecord.timestamp,
        txId: blockchainRecord.txId,
      },
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ message: "Analysis failed" }, { status: 500 })
  }
}
