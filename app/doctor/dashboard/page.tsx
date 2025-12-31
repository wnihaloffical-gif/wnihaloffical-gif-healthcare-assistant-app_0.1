"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Consultation } from "@/lib/types"

export default function DoctorDashboard() {
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState("en")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [filterRisk, setFilterRisk] = useState<"all" | "low" | "medium" | "high">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "completed" | "reviewed">("all")

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role")
      const lang = localStorage.getItem("language") || "en"

      if (!token || role !== "doctor") {
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
          transcription: "Fever, cough, and body aches for 3 days",
          symptoms: ["sym-1", "sym-2", "sym-6"],
          probableConditions: ["cond-1", "cond-2"],
          riskLevel: "low",
          suggestedMedicines: [],
          ddiAlerts: [],
          status: "completed",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "cons-2",
          patientId: "user-1",
          transcription: "Chest pain and shortness of breath",
          symptoms: ["sym-8", "sym-7"],
          probableConditions: ["cond-6"],
          riskLevel: "high",
          suggestedMedicines: [],
          ddiAlerts: [],
          status: "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      setConsultations(mockConsultations)
      applyFilters(mockConsultations, "all", "all")
      setLoading(false)
    }

    // Use a small delay to ensure client-side rendering
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  const applyFilters = (items: Consultation[], risk: string, status: string) => {
    let filtered = items

    if (risk !== "all") {
      filtered = filtered.filter((c) => c.riskLevel === risk)
    }

    if (status !== "all") {
      filtered = filtered.filter((c) => c.status === status)
    }

    setFilteredConsultations(filtered)
  }

  const handleFilterChange = (type: string, value: string) => {
    if (type === "risk") {
      setFilterRisk(value as any)
      applyFilters(consultations, value, filterStatus)
    } else {
      setFilterStatus(value as any)
      applyFilters(consultations, filterRisk, value)
    }
  }

  const langText = {
    en: {
      dashboard: "Doctor Dashboard",
      consultations: "Patient Consultations",
      filter: "Filter",
      riskLevel: "Risk Level",
      status: "Status",
      total: "Total Consultations",
      pending: "Pending Review",
      logout: "Logout",
      viewDetails: "View & Review",
      all: "All",
      low: "Low",
      medium: "Medium",
      high: "High",
      draft: "Draft",
      completed: "Completed",
      reviewed: "Reviewed",
    },
    hi: {
      dashboard: "डॉक्टर डैशबोर्ड",
      consultations: "रोगी परामर्श",
      filter: "फ़िल्टर",
      riskLevel: "जोखिम स्तर",
      status: "स्थिति",
      total: "कुल परामर्श",
      pending: "समीक्षा के लिए प्रतीक्षमान",
      logout: "लॉग आउट",
      viewDetails: "देखें और समीक्षा करें",
      all: "सभी",
      low: "कम",
      medium: "मध्यम",
      high: "उच्च",
      draft: "ड्राफ्ट",
      completed: "पूर्ण",
      reviewed: "समीक्षा किया गया",
    },
    mr: {
      dashboard: "डॉक्टर डॅशबोर्ड",
      consultations: "रुग्ण परामर्श",
      filter: "फिल्टर",
      riskLevel: "जोखीम स्तर",
      status: "स्थिती",
      total: "एकूण परामर्श",
      pending: "पुनरावलोकनाची प्रतीक्षा",
      logout: "लॉग आउट",
      viewDetails: "पहा आणि पुनरावलोकन करा",
      all: "सर्व",
      low: "कमी",
      medium: "मध्यम",
      high: "उच्च",
      draft: "मसुदा",
      completed: "पूर्ण",
      reviewed: "पुनरावलोकन केले",
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

  const riskColors = {
    low: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    high: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="min-h-screen bg-subtle">
      {/* Header */}
      <header className="bg-header sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">AarogyaGuard</h1>
            <p className="text-sm text-muted-foreground">{t.dashboard}</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground text-sm font-medium">
            {t.logout}
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-shadow">
            <p className="text-sm text-muted-foreground mb-1">{t.total}</p>
            <p className="text-3xl font-bold text-primary">{consultations.length}</p>
          </div>
          <div className="card-shadow">
            <p className="text-sm text-muted-foreground mb-1">{t.pending}</p>
            <p className="text-3xl font-bold text-warning">
              {consultations.filter((c) => c.status === "draft").length}
            </p>
          </div>
          <div className="card-shadow">
            <p className="text-sm text-muted-foreground mb-1">High Risk Cases</p>
            <p className="text-3xl font-bold text-destructive">
              {consultations.filter((c) => c.riskLevel === "high").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-shadow mb-6">
          <h3 className="font-semibold mb-4">{t.filter}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.riskLevel}</label>
              <select
                value={filterRisk}
                onChange={(e) => handleFilterChange("risk", e.target.value)}
                className="w-full"
              >
                <option value="all">{t.all}</option>
                <option value="low">{t.low}</option>
                <option value="medium">{t.medium}</option>
                <option value="high">{t.high}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.status}</label>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full"
              >
                <option value="all">{t.all}</option>
                <option value="draft">{t.draft}</option>
                <option value="completed">{t.completed}</option>
                <option value="reviewed">{t.reviewed}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.consultations}</h2>
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="card-shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {new Date(consultation.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-semibold text-foreground">{consultation.symptoms.length} symptoms reported</p>
                  </div>
                  <div className={`${riskColors[consultation.riskLevel]} px-3 py-1 rounded-full text-xs font-medium`}>
                    {consultation.riskLevel.toUpperCase()}
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{consultation.transcription}</p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {consultation.ddiAlerts && consultation.ddiAlerts.length > 0 && (
                      <span className="bg-warning/10 text-warning text-xs px-2 py-1 rounded">⚠️ DDI Alert</span>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/doctor/consultation/${consultation.id}`)}
                    className="text-primary font-medium text-sm hover:opacity-80"
                  >
                    {t.viewDetails} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
