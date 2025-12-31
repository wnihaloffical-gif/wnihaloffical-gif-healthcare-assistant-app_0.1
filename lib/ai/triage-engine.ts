import { extractSymptoms } from "./symptom-extractor"
import { seedData } from "@/lib/db-seed"
import type { Medicine } from "@/lib/types"

export interface TriageResult {
  symptoms: string[]
  probableConditions: string[]
  riskLevel: "low" | "medium" | "high"
  hasRedFlags: boolean
  redFlagWarnings?: string[]
  suggestedMedicines: Medicine[]
  patientSummaryText: string
}

/**
 * Main triage engine that orchestrates symptom analysis
 * and medication recommendations
 */
export async function runTriage(
  inputText: string,
  language = "en",
  currentMedicines: string[] = [],
): Promise<TriageResult> {
  // Extract symptoms from input
  const analysis = await extractSymptoms(inputText, language)

  // Get suggested medicines for probable conditions
  const suggestedMedicines = await getSuggestedMedicines(analysis.probableConditions, currentMedicines, language)

  return {
    symptoms: analysis.symptoms,
    probableConditions: analysis.probableConditions,
    riskLevel: analysis.riskLevel,
    hasRedFlags: analysis.hasRedFlags,
    redFlagWarnings: analysis.redFlagWarnings,
    suggestedMedicines,
    patientSummaryText: analysis.patientSummary,
  }
}

async function getSuggestedMedicines(
  conditionIds: string[],
  currentMedicines: string[] = [],
  language = "en",
): Promise<Medicine[]> {
  // Map conditions to recommended medicines
  const conditionToMedicines: Record<string, string[]> = {
    "cond-1": ["med-1", "med-5"], // Common cold: paracetamol, cetirizine
    "cond-2": ["med-1", "med-3"], // Influenza: paracetamol, aspirin
    "cond-3": ["med-2"], // COVID-19: may need antibiotics
    "cond-4": ["med-4"], // Bronchitis: ibuprofen
    "cond-5": ["med-4"], // Migraine: ibuprofen
    "cond-6": ["med-8"], // Hypertension: lisinopril
  }

  const recommendedMedicineIds = new Set<string>()

  conditionIds.forEach((condId) => {
    ;(conditionToMedicines[condId] || []).forEach((medId) => {
      recommendedMedicineIds.add(medId)
    })
  })

  const medicines: Medicine[] = []

  for (const medId of recommendedMedicineIds) {
    const med = seedData.medicines.find((m) => m.id === medId)
    if (med) {
      medicines.push({
        id: med.id,
        name: med.name,
        class: med.class,
        dose: med.dose,
        frequency: med.frequency,
        description: med.description,
      })
    }
  }

  return medicines
}
