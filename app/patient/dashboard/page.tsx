"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ConsultationCard from "@/components/patient/consultation-card"
import { logger } from "@/lib/db/logger"
import type { Consultation } from "@/lib/types"

export default function PatientDashboard() {
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState("en")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role")
      const uid = localStorage.getItem("userId")
      const lang = localStorage.getItem("language") || "en"

      if (!token || role !== "patient" || !uid) {
        logger.info("Auth check failed - redirecting to home", {}, "PATIENT_DASHBOARD")
        router.push("/")
        return
      }

      setLanguage(lang)
      setUserId(uid)
      setIsAuthenticated(true)

      fetchConsultations(uid)
    }

    // Use a small delay to ensure client-side rendering
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  const fetchConsultations = async (patientId: string) => {
    try {
      logger.info("Fetching consultations from API", { patientId }, "PATIENT_DASHBOARD")

      const response = await fetch(`/api/patient/${patientId}/consultations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch consultations: ${response.statusText}`)
      }

      const data = await response.json()

      logger.info("Consultations fetched successfully", { count: data.length }, "PATIENT_DASHBOARD")

      setConsultations(data)
      setError("")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      logger.error("Failed to fetch consultations", { patientId }, "PATIENT_DASHBOARD", errorMsg)
      setError("Failed to load consultations. Please try again.")
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const langText = {
    en: {
      dashboard: "Patient Dashboard",
      newConsultation: "Start New Consultation",
      pastConsultations: "Past Consultations",
      noConsultations: "No consultations yet",
      logout: "Logout",
      error: "Error loading consultations",
    },
    hi: {
      dashboard: "रोगी डैशबोर्ड",
      newConsultation: "नया परामर्श शुरू करें",
      pastConsultations: "पिछले परामर्श",
      noConsultations: "अभी कोई परामर्श नहीं",
      logout: "लॉग आउट",
      error: "परामर्श लोड करने में त्रुटि",
    },
    mr: {
      dashboard: "रुग्ण डॅशबोर्ड",
      newConsultation: "नवीन परामर्श सुरू करा",
      pastConsultations: "मागील परामर्श",
      noConsultations: "अद्याप कोणताही परामर्श नाही",
      logout: "लॉग आउट",
      error: "परामर्श लोड करू शकत नाही",
    },
  }

  const t = langText[language as keyof typeof langText]

  const handleLogout = () => {
    logger.info("User logout", { userId }, "PATIENT_DASHBOARD")
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

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
