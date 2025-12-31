"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ConsultationCard from "@/components/patient/consultation-card"
import type { Consultation } from "@/lib/types"

export default function PatientDashboard() {
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState("en")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role")
      const lang = localStorage.getItem("language") || "en"

      if (!token || role !== "patient") {
        console.log("[v0] Auth check failed - redirecting to home")
        router.push("/")
        return
      }

      setLanguage(lang)
      setIsAuthenticated(true)

      // Mock load consultations
      const mockConsultations: Consultation[] = [
        {
          id: "cons-1",
          patientId: "user-1",
          transcription: "I have fever and cough for 3 days",
          symptoms: ["Fever", "Cough"],
          probableConditions: ["Common Cold", "Influenza"],
          riskLevel: "low",
          suggestedMedicines: [],
          ddiAlerts: [],
          status: "completed",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ]

      setConsultations(mockConsultations)
      setLoading(false)
    }

    // Use a small delay to ensure client-side rendering
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  const langText = {
    en: {
      dashboard: "Patient Dashboard",
      newConsultation: "Start New Consultation",
      pastConsultations: "Past Consultations",
      noConsultations: "No consultations yet",
      logout: "Logout",
    },
    hi: {
      dashboard: "रोगी डैशबोर्ड",
      newConsultation: "नया परामर्श शुरू करें",
      pastConsultations: "पिछले परामर्श",
      noConsultations: "अभी कोई परामर्श नहीं",
      logout: "लॉग आउट",
    },
    mr: {
      dashboard: "रुग्ण डॅशबोर्ड",
      newConsultation: "नवीन परामर्श सुरू करा",
      pastConsultations: "मागील परामर्श",
      noConsultations: "अद्याप कोणताही परामर्श नाही",
      logout: "लॉग आउट",
    },
  }

  const t = langText[language as keyof typeof langText]

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    router.push("/")
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-subtle">
      {/* Header */}
      <header className="bg-header sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">AarogyaGuard</h1>
            <p className="text-sm text-muted-foreground">{t.dashboard}</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground text-sm font-medium">
            {t.logout}
          </button>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="disclaimer-banner">
          <strong>⚠️ Important:</strong> This is for educational purposes only. Always consult a licensed doctor for
          medical advice.
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* CTA Section */}
        <div className="mb-12">
          <button
            onClick={() => router.push("/patient/consultation/new")}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-colors shadow-md"
          >
            {t.newConsultation}
          </button>
        </div>

        {/* Past Consultations */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.pastConsultations}</h2>
          {consultations.length === 0 ? (
            <div className="card-shadow text-center py-12">
              <p className="text-muted-foreground text-lg">{t.noConsultations}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} language={language} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
