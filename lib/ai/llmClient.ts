// lib/ai/llmClient.ts
// INTEGRATE REAL LLM SERVICE HERE (OpenAI, Claude, Llama, etc.)

export async function callLLM(prompt: string): Promise<string> {
  console.log("[LLM] Processing prompt:", prompt.substring(0, 100) + "...")

  // Stub implementation - simulate LLM processing
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mock response based on prompt content
  if (prompt.includes("headache") || prompt.includes("सिरदर्द") || prompt.includes("डोकेदुखी")) {
    return JSON.stringify({
      structuredSymptoms: {
        complaint: "Severe headache",
        onset: "3 days ago",
        duration: "3 days",
        severity: "severe",
        associatedSymptoms: ["nausea", "light sensitivity"],
        currentMedications: ["Aspirin"]
      },
      probableConditions: ["Migraine", "Tension headache"],
      riskLevel: "medium",
      redFlags: ["persistent headache", "neurological symptoms"],
      suggestedMedicines: [
        { name: "Ibuprofen", class: "NSAID", explanation: "For pain relief" },
        { name: "Sumatriptan", class: "Triptan", explanation: "For migraine" }
      ],
      ddiAlerts: [
        { drugA: "Ibuprofen", drugB: "Aspirin", severity: "moderate", message: "Reduced antiplatelet effect" }
      ],
      patientSummaryText: "Patient reports severe headache for 3 days with nausea and photophobia, currently on aspirin."
    })
  }

  // Default mock response
  return JSON.stringify({
    structuredSymptoms: {
      complaint: "General symptoms",
      onset: "Recent",
      duration: "Ongoing",
      severity: "mild",
      associatedSymptoms: [],
      currentMedications: []
    },
    probableConditions: ["Common cold"],
    riskLevel: "low",
    redFlags: [],
    suggestedMedicines: [
      { name: "Paracetamol", class: "Analgesic", explanation: "For fever and pain" }
    ],
    ddiAlerts: [],
    patientSummaryText: "Patient reports general symptoms."
  })
}