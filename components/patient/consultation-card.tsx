import type { Consultation } from "@/lib/types"
import Link from "next/link"

interface ConsultationCardProps {
  consultation: Consultation
  language: string
}

const riskColors: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-success/10", text: "text-success", label: "Low Risk" },
  medium: { bg: "bg-warning/10", text: "text-warning", label: "Medium Risk" },
  high: { bg: "bg-destructive/10", text: "text-destructive", label: "High Risk" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", label: "Critical Risk" },
}

const riskLabels: Record<string, Record<string, string>> = {
  en: { low: "Low Risk", medium: "Medium Risk", high: "High Risk", critical: "Critical Risk" },
  hi: { low: "कम जोखिम", medium: "मध्यम जोखिम", high: "उच्च जोखिम", critical: "गंभीर जोखिम" },
  mr: { low: "कमी जोखीम", medium: "मध्यम जोखीम", high: "उच्च जोखीम", critical: "गंभीर जोखीम" },
}

function pickColors(riskLevel: unknown): { bg: string; text: string; label: string } {
  const key = (typeof riskLevel === "string" ? riskLevel.toLowerCase() : "medium") as string
  return riskColors[key] ?? riskColors.medium
}

function formatSymptoms(symptoms: unknown): string {
  if (Array.isArray(symptoms)) return (symptoms as unknown[]).map(String).join(", ")
  return typeof symptoms === "string" ? symptoms : "—"
}

function formatConditions(conditions: unknown): string {
  if (!Array.isArray(conditions)) return "—"
  return (conditions as unknown[])
    .map((c) => (typeof c === "string" ? c : (c as { name?: string })?.name))
    .filter(Boolean)
    .join(", ") || "—"
}

export default function ConsultationCard({ consultation, language }: ConsultationCardProps) {
  const colors = pickColors(consultation.riskLevel)
  const riskKey = (typeof consultation.riskLevel === "string" ? consultation.riskLevel.toLowerCase() : "medium") as string
  const riskLabel = (riskLabels[language] ?? riskLabels.en)[riskKey] ?? colors.label

  const dateStr = new Date(consultation.createdAt).toLocaleDateString(
    language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "mr-IN",
  )

  return (
    <Link href={`/patient/consultation/${consultation.id}`}>
      <div className="card-shadow hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">{dateStr}</p>
            <p className="font-semibold text-gray-900 line-clamp-2">{formatSymptoms(consultation.symptoms)}</p>
          </div>
          <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-medium`}>{riskLabel}</div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <strong>Suspected:</strong> {formatConditions(consultation.probableConditions)}
          </p>
          {consultation.finalDiagnosis && (
            <p className="text-sm text-gray-600">
              <strong>Doctor's Diagnosis:</strong> {consultation.finalDiagnosis}
            </p>
          )}
        </div>

        <div className="text-primary text-sm font-medium">View Details →</div>
      </div>
    </Link>
  )
}
