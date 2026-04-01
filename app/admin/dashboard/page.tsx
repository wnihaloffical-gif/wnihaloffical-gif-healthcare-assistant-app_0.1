"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminMetrics {
  users: {
    total: number;
    patients: number;
    doctors: number;
    admins: number;
  };
  consultations: {
    total: number;
    lastWeek: number;
    highRisk: number;
    avgPerDoctor: number;
    byStatus: Array<{ status: string; count: number }>;
    byRisk: Array<{ riskLevel: string; count: number }>;
  };
  integrations: {
    blockchainRecords: number;
    mlInferenceLogs: number;
  };
  recentActivity: Array<any>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch metrics from API
  const {
    data: metrics,
    error: metricsError,
    isLoading: metricsLoading,
  } = useSWR<AdminMetrics>(
    isAuthenticated ? "/api/admin/metrics" : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const lang = localStorage.getItem("language") || "en";

      if (!token || role !== "admin") {
        console.log("[v0] Auth check failed - redirecting to home");
        router.push("/");
        setLoading(false);
        return;
      }

      setLanguage(lang);
      setIsAuthenticated(true);
      setLoading(false);
    };

    // Use a small delay to ensure client-side rendering
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

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
  };

  const t = langText[language as keyof typeof langText];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
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
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            {t.logout}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* System Metrics */}
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {t.systemMetrics}
        </h2>

        {metricsLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        ) : metricsError || !metrics ? (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load metrics</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card-shadow">
                <p className="text-sm text-muted-foreground mb-1">
                  {t.totalConsultations}
                </p>
                <p className="text-4xl font-bold text-primary">
                  {metrics.consultations.total}
                </p>
              </div>
              <div className="card-shadow">
                <p className="text-sm text-muted-foreground mb-1">
                  High Risk Cases
                </p>
                <p className="text-4xl font-bold text-warning">
                  {metrics.consultations.highRisk}
                </p>
              </div>
              <div className="card-shadow">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Users
                </p>
                <p className="text-4xl font-bold text-destructive">
                  {metrics.users.total}
                </p>
              </div>
            </div>

            {/* User Distribution */}
            <div className="card-shadow mb-6">
              <h3 className="text-lg font-semibold mb-6">User Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Patients</p>
                  <p className="text-2xl font-bold">{metrics.users.patients}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Doctors</p>
                  <p className="text-2xl font-bold">{metrics.users.doctors}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Admins</p>
                  <p className="text-2xl font-bold">{metrics.users.admins}</p>
                </div>
              </div>
            </div>

            {/* Risk Level Distribution */}
            <div className="card-shadow">
              <h3 className="text-lg font-semibold mb-6">
                {t.riskDistribution}
              </h3>
              <div className="space-y-4">
                {metrics.consultations.byRisk.map((item) => {
                  const total = metrics.consultations.total;
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const riskName =
                    item.riskLevel === "LOW"
                      ? t.low
                      : item.riskLevel === "MEDIUM"
                        ? t.medium
                        : t.high;
                  const colors: Record<string, string> = {
                    LOW: "bg-success",
                    MEDIUM: "bg-warning",
                    HIGH: "bg-destructive",
                  };

                  return (
                    <div key={item.riskLevel}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{riskName}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`${colors[item.riskLevel]} rounded-full h-2`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Integration Status */}
            <div className="card-shadow mt-6">
              <h3 className="text-lg font-semibold mb-4">Integration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Blockchain Records
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">
                      {metrics.integrations.blockchainRecords}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    ML Inference Logs
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">
                      {metrics.integrations.mlInferenceLogs}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
