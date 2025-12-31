"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import AnalysisResults from "@/components/patient/analysis-results"

export default function AnalysisResultsPage() {
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const lang = localStorage.getItem("language") || "en"
    setLanguage(lang)

    if (!token) {
      router.push("/")
      return
    }

    // Then fall back to mock data if not available
    const storedData = sessionStorage.getItem("analysisData")

    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setAnalysisData(data)
        // Clear after retrieving
        sessionStorage.removeItem("analysisData")
      } catch (error) {
        console.error("Failed to parse stored data:", error)
        setAnalysisData(getMockAnalysis())
      }
    } else {
      // Fallback to mock if no data in session
      setAnalysisData(getMockAnalysis())
    }

    setLoading(false)
  }, [router])

  const getMockAnalysis = () => ({
    symptoms: ["sym-1", "sym-2", "sym-6"],
    probableConditions: ["cond-1", "cond-2"],
    riskLevel: "low",
    hasRedFlags: false,
    suggestedMedicines: [
      {
        id: "med-1",
        name: "Paracetamol",
        class: "Analgesic",
        dose: "500mg",
        frequency: "3-4 times daily",
        description: "For fever and pain relief",
      },
    ],
    ddiAlerts: [],
    patientSummaryText:
      "Patient reports fever, cough, and body aches. Common cold or influenza likely. Rest, fluids, and symptomatic treatment recommended.",
    blockchainProof: {
      hash: "0x1a2b3c4d",
      timestamp: Date.now(),
      txId: "0xabc123",
    },
  })

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="text-primary hover:text-primary-light mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">Analysis Results</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {analysisData && <AnalysisResults data={analysisData} language={language} />}
      </main>
    </div>
  )
}
