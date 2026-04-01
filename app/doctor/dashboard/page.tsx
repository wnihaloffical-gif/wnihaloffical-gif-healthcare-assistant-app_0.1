"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import type { Consultation } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DoctorMetrics {
  totalConsultations: number;
  pendingConsultations: number;
  completedConsultations: number;
  highRiskConsultations: number;
  consultationsByStatus: Array<{ status: string; count: number }>;
  consultationsByRisk: Array<{ riskLevel: string; count: number }>;
  topConditions: Array<{ condition: string; count: number }>;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<
    Consultation[]
  >([]);
  const [language, setLanguage] = useState("en");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState("");
  const [filterRisk, setFilterRisk] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed" | "reviewed"
  >("all");

  // Fetch metrics from API
  const {
    data: metrics,
    error: metricsError,
    isLoading: metricsLoading,
  } = useSWR<DoctorMetrics>(
    isAuthenticated ? "/api/doctor/metrics" : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const uid = localStorage.getItem("userId");
      const lang = localStorage.getItem("language") || "en";

      if (!token || role !== "doctor" || !uid) {
        console.log("[v0] Auth check failed - redirecting to home");
        router.push("/");
        return;
      }

      setLanguage(lang);
      setIsAuthenticated(true);
      setDoctorId(uid);
      fetchConsultations(uid);
    };

    // Use a small delay to ensure client-side rendering
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const normalizeValue = (value: unknown) =>
    typeof value === "string"
      ? value.toLowerCase()
      : String(value).toLowerCase();

  const applyFilters = (
    items: Consultation[],
    risk: string,
    status: string,
  ) => {
    let filtered = items;

    if (risk !== "all") {
      filtered = filtered.filter((c) => normalizeValue(c.riskLevel) === risk);
    }

    if (status !== "all") {
      filtered = filtered.filter((c) => normalizeValue(c.status) === status);
    }

    setFilteredConsultations(filtered);
  };

  const fetchConsultations = async (doctorId: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/doctor/${doctorId}/consultations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch consultations: ${response.statusText}`,
        );
      }

      const data: Consultation[] = await response.json();
      setConsultations(data);
      applyFilters(data, filterRisk, filterStatus);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Doctor consultations fetch failed", errorMsg);
      setError("Failed to load consultations. Please try again.");
      setConsultations([]);
      setFilteredConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "risk") {
      setFilterRisk(value as any);
      applyFilters(consultations, value, filterStatus);
    } else {
      setFilterStatus(value as any);
      applyFilters(consultations, filterRisk, value);
    }
  };

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
      completed: "पूर्ण",
      reviewed: "समीक्षा किया गया",
      logout: "लॉग आउट",
      viewDetails: "देखें और समीक्षा करें",
      all: "सभी",
      low: "कम",
      medium: "मध्यम",
      high: "उच्च",
    },
    mr: {
      dashboard: "डॉक्टर डॅशबोर्ड",
      consultations: "रुग्ण परामर्श",
      filter: "फिल्टर",
      riskLevel: "जोखीम स्तर",
      status: "स्थिती",
      total: "एकूण परामर्श",
      pending: "पुनरावलोकनाची प्रतीक्षा",
      completed: "पूर्ण",
      reviewed: "पुनरावलोकन केले",
      logout: "लॉग आउट",
      viewDetails: "पहा आणि पुनरावलोकन करा",
      all: "सर्व",
      low: "कमी",
      medium: "मध्यम",
      high: "उच्च",
    },
  };

  const t = langText[language as keyof typeof langText];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  const riskColors = {
    low: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    high: "bg-destructive/10 text-destructive",
  };

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

      {/* Metrics */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-shadow">
              <p className="text-sm text-muted-foreground mb-1">{t.total}</p>
              <p className="text-3xl font-bold text-primary">
                {metrics.totalConsultations}
              </p>
            </div>
            <div className="card-shadow">
              <p className="text-sm text-muted-foreground mb-1">{t.pending}</p>
              <p className="text-3xl font-bold text-warning">
                {metrics.pendingConsultations}
              </p>
            </div>
            <div className="card-shadow">
              <p className="text-sm text-muted-foreground mb-1">
                High Risk Cases
              </p>
              <p className="text-3xl font-bold text-destructive">
                {metrics.highRiskConsultations}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card-shadow mb-6">
          <h3 className="font-semibold mb-4">{t.filter}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.riskLevel}
              </label>
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
              <label className="block text-sm font-medium mb-2">
                {t.status}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full"
              >
                <option value="all">{t.all}</option>
                <option value="pending">{t.pending}</option>
                <option value="completed">{t.completed}</option>
                <option value="reviewed">{t.reviewed}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top Conditions */}
        {metrics?.topConditions?.length > 0 && (
          <div className="card-shadow mb-6">
            <h3 className="font-semibold mb-4">Top Diagnosed Conditions</h3>
            <div className="space-y-2">
              {metrics.topConditions?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center pb-2 border-b last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.condition}
                  </span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-shadow p-6 mb-8">
          <h3 className="font-semibold mb-4">{t.consultations}</h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading consultations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No consultations found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConsultations.map((consultation) => {
                const riskKey = normalizeValue(consultation.riskLevel) as
                  | "low"
                  | "medium"
                  | "high";
                return (
                  <Link
                    key={consultation.id}
                    href={`/doctor/consultation/${consultation.id}`}
                  >
                    <div className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              consultation.createdAt,
                            ).toLocaleDateString(
                              language === "en"
                                ? "en-US"
                                : language === "hi"
                                  ? "hi-IN"
                                  : "mr-IN",
                            )}
                          </p>
                          <p className="font-semibold text-foreground line-clamp-2">
                            {Array.isArray(consultation.probableConditions)
                              ? consultation.probableConditions.join(", ")
                              : consultation.probableConditions}
                          </p>
                        </div>
                        <span
                          className={`${riskColors[riskKey] ?? "bg-muted text-muted"} px-3 py-1 rounded-full text-xs font-medium`}
                        >
                          {riskKey === "low"
                            ? "Low Risk"
                            : riskKey === "medium"
                              ? "Medium Risk"
                              : "High Risk"}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        Status: {normalizeValue(consultation.status)}
                      </p>
                      <div className="text-primary text-sm font-medium">
                        {t.viewDetails} →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
