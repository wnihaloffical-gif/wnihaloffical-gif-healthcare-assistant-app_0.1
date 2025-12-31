import type { Consultation } from "@/lib/types"
import Link from "next/link"

interface ConsultationCardProps {
  consultation: Consultation
  language: string
}

const riskColors = {
  low: { bg: "bg-success/10", text: "text-success", label: "Low Risk" },
  medium: { bg: "bg-warning/10", text: "text-warning", label: "Medium Risk" },
  high: { bg: "bg-destructive/10", text: "text-destructive", label: "High Risk" },
}

const riskLabels = {
  en: { low: "Low Risk", medium: "Medium Risk", high: "High Risk" },
  hi: { low: "कम जोखिम", medium: "मध्यम जोखिम", high: "उच्च जोखिम" },
  mr: { low: "कमी जोखीम", medium: "मध्यम जोखीम", high: "उच्च जोखीम" },
}

export default function ConsultationCard({ consultation, language }: ConsultationCardProps) {
  const colors = riskColors[consultation.riskLevel]
  const riskLabel = riskLabels[language as keyof typeof riskLabels][consultation.riskLevel]

  const dateStr = new Date(consultation.createdAt).toLocaleDateString(
    language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "mr-IN",
  )

  return (
    <Link href={`/patient/consultation/${consultation.id}`}>
      <div className="card-shadow hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">{dateStr}</p>
            <p className="font-semibold text-gray-900 line-clamp-2">{consultation.symptoms.join(", ")}</p>
          </div>
          <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-medium`}>{riskLabel}</div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <strong>Suspected:</strong> {consultation.probableConditions.join(", ")}
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
