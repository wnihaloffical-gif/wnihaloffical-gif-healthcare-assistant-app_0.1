"use client"

import VoiceRecorder from "@/components/patient/voice-recorder"
import ConsultationForm from "@/components/patient/consultation-form"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function NewConsultationPage() {
  const router = useRouter()
  const [step, setStep] = useState<"voice" | "confirm" | "analysis">("voice")
  const [transcription, setTranscription] = useState("")
  const [language, setLanguage] = useState("en")
  const [loading, setLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const lang = localStorage.getItem("language") || "en"
    setLanguage(lang)

    if (!token) {
      router.push("/")
    }
  }, [router])

  const langText = {
    en: {
      newConsultation: "New Consultation",
      step1: "Record Symptoms",
      step2: "Confirm & Review",
      step3: "Analysis Results",
      selectLanguage: "Consultation Language",
    },
    hi: {
      newConsultation: "नया परामर्श",
      step1: "लक्षण रिकॉर्ड करें",
      step2: "पुष्टि और समीक्षा करें",
      step3: "विश्लेषण परिणाम",
      selectLanguage: "परामर्श भाषा",
    },
    mr: {
      newConsultation: "नवीन परामर्श",
      step1: "लक्षण रेकॉर्ड करा",
      step2: "पुष्टी आणि समीक्षा",
      step3: "विश्लेषण परिणाम",
      selectLanguage: "परामर्श भाषा",
    },
  }

  const t = langText[language as keyof typeof langText]

  const steps = [
    { id: "voice", label: t.step1 },
    { id: "confirm", label: t.step2 },
    { id: "analysis", label: t.step3 },
  ]

  const handleAnalyze = async (editedText: string, medicines: string[]) => {
    setLoading(true)
    setAnalysisError("")
    setStep("analysis")

    try {
      const patientId = localStorage.getItem("userId") || "patient-default"
      const response = await fetch("/api/consultation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText: editedText,
          language,
          currentMedicines: medicines,
          patientId,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const analysisData = await response.json()

      sessionStorage.setItem("analysisData", JSON.stringify(analysisData))
      router.push("/patient/consultation/analysis-results")
    } catch (error) {
      console.error("Analysis error:", error)
      setAnalysisError("Failed to analyze symptoms. Please try again.")
      setStep("confirm")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-header">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="text-primary hover:opacity-80 mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">{t.newConsultation}</h1>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between mb-8">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === s.id || (idx === 0 && step === "voice")
                    ? "bg-primary text-primary-foreground"
                    : idx < steps.findIndex((x) => x.id === step)
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {idx + 1}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">{s.label}</p>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 ml-4 ${
                    idx < steps.findIndex((x) => x.id === step) ? "bg-success" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-banner mb-8">
          <strong>⚠️ Important:</strong> This is for educational purposes only. Always consult a licensed doctor for
          medical advice.
        </div>

        {/* Content */}
        <div className="card-shadow">
          {step === "voice" && (
            <VoiceRecorder
              language={language}
              onTranscriptionComplete={(text) => {
                setTranscription(text)
                setStep("confirm")
              }}
              onLanguageChange={setLanguage}
            />
          )}

          {step === "confirm" && (
            <ConsultationForm
              transcription={transcription}
              language={language}
              onAnalyze={handleAnalyze}
              onEdit={() => setStep("voice")}
            />
          )}

          {step === "analysis" && (
            <div className="text-center py-8">
              {loading ? (
                <>
                  <div className="mb-4">
                    <div className="inline-block animate-spin">⏳</div>
                  </div>
                  <p className="text-muted-foreground">Analyzing your symptoms...</p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">Redirecting to results...</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
