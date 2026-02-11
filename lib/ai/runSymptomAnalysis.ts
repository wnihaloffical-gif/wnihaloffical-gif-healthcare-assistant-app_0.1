// lib/ai/runSymptomAnalysis.ts
import { callLLM } from "./llmClient"
import { checkDrugInteractions } from "./ddiChecker"
import { z } from "zod"

// Define the expected output schema
const symptomAnalysisSchema = z.object({
  structuredSymptoms: z.object({
    complaint: z.string(),
    onset: z.string(),
    duration: z.string(),
    severity: z.string(),
    associatedSymptoms: z.array(z.string()),
    currentMedications: z.array(z.string())
  }),
  probableConditions: z.array(z.string()),
  riskLevel: z.enum(["low", "medium", "high"]),
  redFlags: z.array(z.string()),
  suggestedMedicines: z.array(z.object({
    name: z.string(),
    class: z.string(),
    explanation: z.string()
  })),
  ddiAlerts: z.array(z.object({
    drugA: z.string(),
    drugB: z.string(),
    severity: z.string(),
    message: z.string()
  })),
  patientSummaryText: z.string()
})

export type SymptomAnalysisResult = z.infer<typeof symptomAnalysisSchema>

export async function runSymptomAnalysis(
  inputText: string,
  language: "en" | "hi" | "mr",
  currentMeds: string[]
): Promise<SymptomAnalysisResult> {
  // Build structured prompt
  const prompt = `
You are a medical AI assistant. Analyze the following patient symptoms and provide a structured analysis.

Patient Input: "${inputText}"
Language: ${language}
Current Medications: ${currentMeds.join(", ") || "None reported"}

Please respond with a valid JSON object in the following exact format:
{
  "structuredSymptoms": {
    "complaint": "main complaint",
    "onset": "when symptoms started",
    "duration": "how long",
    "severity": "mild|moderate|severe",
    "associatedSymptoms": ["symptom1", "symptom2"],
    "currentMedications": ["med1", "med2"]
  },
  "probableConditions": ["condition1", "condition2"],
  "riskLevel": "low|medium|high",
  "redFlags": ["red flag1", "red flag2"],
  "suggestedMedicines": [
    {"name": "medicine", "class": "class", "explanation": "why"}
  ],
  "ddiAlerts": [
    {"drugA": "drug", "drugB": "drug", "severity": "mild|moderate|severe", "message": "alert"}
  ],
  "patientSummaryText": "summary paragraph"
}

Ensure the response is valid JSON only.
`

  try {
    const llmResponse = await callLLM(prompt)

    // Parse JSON
    const parsed = JSON.parse(llmResponse)

    // Validate schema
    const validated = symptomAnalysisSchema.parse(parsed)

    // Override DDI alerts with real DB check
    const suggestedMeds = validated.suggestedMedicines.map(m => m.name)
    const realDdiAlerts = await checkDrugInteractions(suggestedMeds, currentMeds)

    validated.ddiAlerts = realDdiAlerts

    return validated
  } catch (error) {
    console.error("[SYMPTOM ANALYSIS] Error:", error)

    // Fallback response
    return {
      structuredSymptoms: {
        complaint: "Unable to analyze",
        onset: "Unknown",
        duration: "Unknown",
        severity: "unknown",
        associatedSymptoms: [],
        currentMedications: currentMeds
      },
      probableConditions: ["Further evaluation needed"],
      riskLevel: "medium",
      redFlags: ["Unable to analyze symptoms"],
      suggestedMedicines: [],
      ddiAlerts: [],
      patientSummaryText: "Analysis failed. Please consult a healthcare professional."
    }
  }
}