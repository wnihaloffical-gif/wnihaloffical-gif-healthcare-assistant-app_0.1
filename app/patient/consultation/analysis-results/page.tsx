"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AnalysisResults from "@/components/patient/analysis-results";

export default function AnalysisResultsPage() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const lang = localStorage.getItem("language") || "en";
    setLanguage(lang);

    if (!token) {
      router.push("/");
      return;
    }

    // Retrieve actual analysis data from sessionStorage
    // Add small delay to ensure data is available
    const timer = setTimeout(() => {
      const storedData = sessionStorage.getItem("analysisData");
      console.log("[v0] Attempting to retrieve analysis data from session...");

      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setAnalysisData(data);
          console.log("[v0] Loaded analysis data from session:", data);
          // Clear after retrieving
          sessionStorage.removeItem("analysisData");
        } catch (error) {
          console.error("[v0] Failed to parse stored data:", error);
          setAnalysisData(null);
        }
      } else {
        console.warn("[v0] No analysis data found in session storage");
        setAnalysisData(null);
      }

      setLoading(false);
    }, 100); // Small delay to ensure navigation is complete

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // No data available - redirect back
  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => router.push("/patient/consultation/new")}
              className="text-primary hover:text-primary-light mb-4"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-primary">Analysis Results</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
            <p className="font-semibold">No analysis data found</p>
            <p className="text-sm mt-2">
              Please start a new consultation and go through the symptom recording process.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-primary hover:text-primary-light mb-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-primary">Analysis Results</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnalysisResults data={analysisData} language={language} />
      </main>
    </div>
  );
}
