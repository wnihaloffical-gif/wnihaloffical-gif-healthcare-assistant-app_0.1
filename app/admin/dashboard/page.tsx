"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const router = useRouter()
  const [language, setLanguage] = useState("en")
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({
    totalConsultations: 42,
    ddiAlerts: 5,
    highRiskCases: 8,
    byLanguage: { en: 24, hi: 12, mr: 6 },
    byRiskLevel: { low: 28, medium: 6, high: 8 },
  })

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role")
      const lang = localStorage.getItem("language") || "en"

      if (!token || role !== "admin") {
        console.log("[v0] Auth check failed - redirecting to home")
        router.push("/")
        return
      }

      setLanguage(lang)
      setIsAuthenticated(true)
      setLoading(false)
    }

    // Use a small delay to ensure client-side rendering
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  const langText = {
    en: {
      dashboard: "Admin Dashboard",
      systemMetrics: "System Metrics",
      totalConsultations: "Total Consultations",
      ddiAlerts: "DDI Alerts Raised",
      highRiskCases: "High Risk Cases",
      languageDistribution: "Language Distribution",
      riskDistribution: "Risk Level Distribution",
      english: "English",
      hindi: "Hindi",
      marathi: "Marathi",
      low: "Low",
      medium: "Medium",
      high: "High",
      logout: "Logout",
    },
    hi: {
      dashboard: "प्रशासक डैशबोर्ड",
      systemMetrics: "सिस्टम मेट्रिक्स",
      totalConsultations: "कुल परामर्श",
      ddiAlerts: "उठाई गई DDI चेतावनी",
      highRiskCases: "उच्च जोखिम मामले",
      languageDistribution: "भाषा वितरण",
      riskDistribution: "जोखिम स्तर वितरण",
      english: "अंग्रेजी",
      hindi: "हिंदी",
      marathi: "मराठी",
      low: "कम",
      medium: "मध्यम",
      high: "उच्च",
      logout: "लॉग आउट",
    },
    mr: {
      dashboard: "प्रशासक डॅशबोर्ड",
      systemMetrics: "सिस्टम मेट्रिक्स",
      totalConsultations: "एकूण परामर्श",
      ddiAlerts: "उभारलेल्या DDI अलर्ट",
      highRiskCases: "उच्च जोखीम केस",
      languageDistribution: "भाषा वितरण",
      riskDistribution: "जोखीम स्तर वितरण",
      english: "इंग्रजी",
      hindi: "हिंदी",
      marathi: "मराठी",
      low: "कमी",
      medium: "मध्यम",
      high: "उच्च",
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* System Metrics */}
        <h2 className="text-2xl font-bold text-foreground mb-6">{t.systemMetrics}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-shadow">
            <p className="text-sm text-muted-foreground mb-1">{t.totalConsultations}</p>
            <p className="text-4xl font-bold text-primary">{stats.totalConsultations}</p>
          </div>
          <div className="card-shadow">
            <p className="text-sm text-muted-foreground mb-1">{t.ddiAlerts}</p>
            <p className="text-4xl font-bold text-warning">{stats.ddiAlerts}</p>
          </div>
          <div className="card-shadow">
            <p className="text-sm text-muted-foreground mb-1">{t.highRiskCases}</p>
            <p className="text-4xl font-bold text-destructive">{stats.highRiskCases}</p>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Distribution */}
          <div className="card-shadow">
            <h3 className="text-lg font-semibold mb-6">{t.languageDistribution}</h3>
            <div className="space-y-4">
              {Object.entries(stats.byLanguage).map(([lang, count]) => {
                const total = stats.totalConsultations
                const percentage = ((count / total) * 100).toFixed(1)
                const langName = lang === "en" ? t.english : lang === "hi" ? t.hindi : t.marathi

                return (
                  <div key={lang}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{langName}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="card-shadow">
            <h3 className="text-lg font-semibold mb-6">{t.riskDistribution}</h3>
            <div className="space-y-4">
              {Object.entries(stats.byRiskLevel).map(([risk, count]) => {
                const total = stats.totalConsultations
                const percentage = ((count / total) * 100).toFixed(1)
                const riskName = risk === "low" ? t.low : risk === "medium" ? t.medium : t.high
                const colors: Record<string, string> = {
                  low: "bg-success",
                  medium: "bg-warning",
                  high: "bg-destructive",
                }

                return (
                  <div key={risk}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{riskName}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`${colors[risk]} rounded-full h-2`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card-shadow mt-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">API Status</p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span className="font-medium">Operational</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Database Status</p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span className="font-medium">Connected</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Blockchain Status</p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span className="font-medium">Synchronized</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
