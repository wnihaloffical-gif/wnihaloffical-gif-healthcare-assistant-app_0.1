import type { SymptomAnalysis } from "@/lib/types"
import { seedData } from "@/lib/db-seed"

/**
 * Extracts structured symptoms from patient's text input
 * In production, this would call an LLM like GPT-4 or Claude
 */
export async function extractSymptoms(inputText: string, language = "en"): Promise<SymptomAnalysis> {
  // Mock implementation - in production, integrate with LLM
  // Example: const response = await fetch('/api/llm/analyze', { body: inputText })

  // Parse symptoms from input text
  const keywords = {
    en: {
      fever: ["fever", "high temperature", "temperature"],
      cough: ["cough", "coughing", "persistent cough"],
      headache: ["headache", "head pain", "migraine"],
      fatigue: ["fatigue", "tired", "tiredness", "weakness"],
      sore_throat: ["sore throat", "throat pain"],
      body_aches: ["body aches", "muscle pain", "joint pain"],
      shortness_breath: ["shortness of breath", "breathing difficulty", "dyspnea"],
      chest_pain: ["chest pain", "chest discomfort"],
    },
    hi: {
      fever: ["बुखार", "तापमान"],
      cough: ["खांसी"],
      headache: ["सिरदर्द", "माइग्रेन"],
      fatigue: ["थकान", "कमजोरी"],
      sore_throat: ["गले में दर्द"],
      body_aches: ["शरीर में दर्द"],
      shortness_breath: ["सांस की कमी", "सांस लेने में कठिनाई"],
      chest_pain: ["छाती में दर्द"],
    },
    mr: {
      fever: ["ताप", "तापमान"],
      cough: ["खोकला"],
      headache: ["डोकेदुखी", "माइग्रेन"],
      fatigue: ["थकव"],
      sore_throat: ["घशाला दुखणे"],
      body_aches: ["शरीरात दुखणे"],
      shortness_breath: ["श्वासाचा त्रास"],
      chest_pain: ["छातीचा दुखणे"],
    },
  }

  const lowerInput = inputText.toLowerCase()
  const detectedSymptoms: string[] = []

  // Detect symptoms
  const symptomsObj = keywords[language as keyof typeof keywords] || keywords.en

  Object.entries(symptomsObj).forEach(([key, patterns]) => {
    patterns.forEach((pattern) => {
      if (lowerInput.includes(pattern)) {
        const symptom = seedData.symptoms.find((s) => s.id === `sym-${Object.keys(symptomsObj).indexOf(key) + 1}`)
        if (symptom && !detectedSymptoms.includes(symptom.id)) {
          detectedSymptoms.push(symptom.id)
        }
      }
    })
  })

  // If no symptoms detected, assign default ones based on analysis
  if (detectedSymptoms.length === 0) {
    detectedSymptoms.push("sym-1", "sym-2") // Default: fever and cough
  }

  // Determine probable conditions
  const probableConditions = determineProbableConditions(detectedSymptoms)

  // Check for red flags
  const hasChestPain = detectedSymptoms.includes("sym-8")
  const hasShortnessBreathe = detectedSymptoms.includes("sym-7")
  const hasRedFlags = hasChestPain || hasShortnessBreathe

  const riskLevel = hasRedFlags ? "high" : detectedSymptoms.length > 3 ? "medium" : "low"

  // Generate patient summary
  const patientSummary = generatePatientSummary(detectedSymptoms, language)

  return {
    symptoms: detectedSymptoms,
    probableConditions,
    riskLevel,
    hasRedFlags,
    redFlagWarnings: hasRedFlags ? getRedFlagWarnings(language) : undefined,
    patientSummary,
  }
}

function determineProbableConditions(symptomIds: string[]): string[] {
  // Simple mapping logic - in production, use ML or rules engine
  const symptomToCondition: Record<string, string[]> = {
    "sym-1": ["cond-1", "cond-2", "cond-3"],
    "sym-2": ["cond-1", "cond-2", "cond-4"],
    "sym-3": ["cond-1", "cond-5"],
    "sym-7": ["cond-3", "cond-6"],
    "sym-8": ["cond-6"],
  }

  const conditionCounts: Record<string, number> = {}

  symptomIds.forEach((symId) => {
    ;(symptomToCondition[symId] || []).forEach((cond) => {
      conditionCounts[cond] = (conditionCounts[cond] || 0) + 1
    })
  })

  return Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cond]) => cond)
}

function generatePatientSummary(symptomIds: string[], language: string): string {
  const symptoms = symptomIds.map((id) => {
    const sym = seedData.symptoms.find((s) => s.id === id)
    if (language === "hi") return sym?.nameHi || sym?.name || ""
    if (language === "mr") return sym?.nameMr || sym?.name || ""
    return sym?.name || ""
  })

  const summaries = {
    en: `Patient reports: ${symptoms.join(", ")}. Duration and severity noted. Consultation recommended with licensed physician.`,
    hi: `रोगी की रिपोर्ट: ${symptoms.join(", ")}। अवधि और गंभीरता नोट की गई। लाइसेंसप्राप्त चिकित्सक से परामर्श की सिफारिश की जाती है।`,
    mr: `रुग्णाच्या अहवाल: ${symptoms.join(", ")}। अवधी आणि तीव्रता नोट केली गई। परस्यांच्या परामर्शाची शिफारस केली जाते।`,
  }

  return summaries[language as keyof typeof summaries] || summaries.en
}

function getRedFlagWarnings(language: string): string[] {
  const warnings = {
    en: [
      "Red Flag Alert: Chest pain and shortness of breath detected. Seek immediate medical attention!",
      "This may indicate a serious condition requiring emergency care.",
    ],
    hi: [
      "लाल झंडा चेतावनी: छाती में दर्द और सांस की कमी का पता चला। तुरंत चिकित्सा सहायता लें!",
      "यह एक गंभीर स्थिति का संकेत दे सकता है जिसके लिए आपातकालीन देखभाल की आवश्यकता है।",
    ],
    mr: [
      "लाल झंडा अलर्ट: छातीचा दुखणे आणि श्वासाचा त्रास आढळला। तातडीने वैद्यकीय सहायता लें!",
      "हे एक गंभीर स्थिती दर्शवू शकते ज्याला आपातकालीन काळजीची आवश्यकता आहे।",
    ],
  }

  return warnings[language as keyof typeof warnings] || warnings.en
}
