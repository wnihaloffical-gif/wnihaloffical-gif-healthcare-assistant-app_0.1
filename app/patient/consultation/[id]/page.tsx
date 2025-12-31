"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Consultation } from "@/lib/types"
import ConsultationDetail from "@/components/consultation/consultation-detail"

export default function ConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const consultationId = params.id as string
  const [consultation, setConsultation] = useState<Consultation | null>(null)
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

    // Mock load consultation
    const mockConsultation: Consultation = {
      id: consultationId,
      patientId: "user-1",
      transcription: "I have fever and cough for 3 days with body aches",
      symptoms: ["sym-1", "sym-2", "sym-6"],
      probableConditions: ["cond-1", "cond-2"],
      riskLevel: "low",
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
      status: "completed",
      blockchainHash: "0x1a2b3c4d",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }

    setConsultation(mockConsultation)
    setLoading(false)
  }, [router, consultationId])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!consultation) {
    return <div className="flex items-center justify-center min-h-screen">Consultation not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => router.back()} className="text-primary hover:text-primary-light mb-4">
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ConsultationDetail consultation={consultation} language={language} />
      </main>
    </div>
  )
}
