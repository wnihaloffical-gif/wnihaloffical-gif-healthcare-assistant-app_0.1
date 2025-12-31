/**
 * ML Inference Integration Layer
 * Bridges Next.js API with Python ML models
 */

export interface MLPrediction {
  conditions: Array<{
    condition: string
    confidence: number
  }>
  riskLevel: string
  hasRedFlags: boolean
  redFlags: string[]
  medicines: Array<{
    id: string
    name: string
    class: string
    dose: string
    frequency: string
    description: string
  }>
  ddiAlerts: Array<{
    drug1: string
    drug2: string
    severity: string
    description: string
  }>
  summary: string
  modelSource: string
}

/**
 * Call ML inference service or use hardcoded fallback
 */
export async function runMLInference(
  symptomsText: string,
  language: string,
  currentMedicines: string[],
): Promise<MLPrediction> {
  try {
    // Attempt to call Python ML service
    const response = await fetch(`${process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8002"}/infer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptoms_text: symptomsText,
        language: language,
        current_medications: currentMedicines,
      }),
    })

    if (response.ok) {
      const mlResult = await response.json()
      return mlResult
    }
  } catch (error) {
    console.log("[v0] ML service unavailable, using fallback logic")
  }

  // Fallback to hardcoded logic
  return getFallbackPrediction(symptomsText, currentMedicines)
}

function getFallbackPrediction(symptomsText: string, currentMeds: string[]): MLPrediction {
  // CHANGE: Using hardcoded fallback when ML service is unavailable
  const keywords = symptomsText.toLowerCase().split(/\s+/)

  // Rule-based condition detection
  let conditions = [{ condition: "Viral Infection", confidence: 0.72 }]

  if (keywords.some((k) => ["fever", "cough"].includes(k))) {
    conditions = [
      { condition: "Influenza", confidence: 0.85 },
      { condition: "COVID-19", confidence: 0.78 },
    ]
  } else if (keywords.some((k) => ["runny", "nose", "sneezing"].includes(k))) {
    conditions = [{ condition: "Common Cold", confidence: 0.88 }]
  } else if (keywords.some((k) => ["chest", "pain", "breath"].includes(k))) {
    conditions = [
      { condition: "Asthma", confidence: 0.75 },
      { condition: "Pneumonia", confidence: 0.68 },
    ]
  }

  // Risk level determination
  let riskLevel = "low"
  let hasRedFlags = false
  const redFlags: string[] = []

  if (keywords.some((k) => ["chest", "shortness", "severe", "critical"].includes(k))) {
    riskLevel = "high"
    hasRedFlags = true
    redFlags.push("Chest pain and breathing difficulty detected - seek immediate medical attention")
  } else if (keywords.some((k) => ["fever", "persistent"].includes(k))) {
    riskLevel = "medium"
  }

  // Medicine recommendation
  const medicines = [
    {
      id: "paracetamol",
      name: "Paracetamol",
      class: "Analgesic",
      dose: "500mg",
      frequency: "Twice daily",
      description: "For fever and pain relief",
    },
    {
      id: "cetirizine",
      name: "Cetirizine",
      class: "Antihistamine",
      dose: "10mg",
      frequency: "Once daily",
      description: "For allergic symptoms",
    },
  ]

  // DDI checking
  const ddiAlerts: Array<{
    drug1: string
    drug2: string
    severity: string
    description: string
  }> = []
  if (currentMeds.includes("aspirin") && medicines.some((m) => m.id === "ibuprofen")) {
    ddiAlerts.push({
      drug1: "aspirin",
      drug2: "ibuprofen",
      severity: "high",
      description: "Increased bleeding risk - do not use together",
    })
  }

  return {
    conditions,
    riskLevel,
    hasRedFlags,
    redFlags,
    medicines: medicines.filter((m) => !ddiAlerts.some((d) => d.drug2 === m.id)),
    ddiAlerts,
    summary: `Based on reported symptoms of ${symptomsText}. Most probable condition: ${conditions[0].condition}. Risk level: ${riskLevel}. ⚠️ This is educational only - consult a doctor.`,
    modelSource: "Fallback Rule-Based",
  }
}
