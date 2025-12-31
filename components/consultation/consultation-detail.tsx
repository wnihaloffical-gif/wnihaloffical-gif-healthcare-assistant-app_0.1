import type { Consultation } from "@/lib/types"
import { seedData } from "@/lib/db-seed"

interface ConsultationDetailProps {
  consultation: Consultation
  language: string
}

export default function ConsultationDetail({ consultation, language }: ConsultationDetailProps) {
  const langText = {
    en: {
      transcription: "Patient Transcription",
      symptoms: "Detected Symptoms",
      conditions: "Probable Conditions",
      medicines: "Suggested Medicines",
      ddiWarnings: "Drug-Drug Interaction Warnings",
      doseFrequency: "Dose & Frequency",
      blockchainProof: "Blockchain Verification",
      hash: "Hash",
      timestamp: "Timestamp",
      verifiedOn: "Verified On",
      noInteractions: "No significant drug interactions detected",
      noDoctorNotes: "No doctor notes yet",
      riskLevel: "Risk Level",
      status: "Status",
    },
    hi: {
      transcription: "रोगी ट्रांसक्रिप्शन",
      symptoms: "पहचाने गए लक्षण",
      conditions: "संभावित स्थितियां",
      medicines: "सुझाई गई दवाएं",
      ddiWarnings: "दवा-दवा इंटरएक्शन चेतावनी",
      doseFrequency: "खुराक और आवृत्ति",
      blockchainProof: "ब्लॉकचेन सत्यापन",
      hash: "हैश",
      timestamp: "समय मुद्रांक",
      verifiedOn: "पर सत्यापित",
      noInteractions: "कोई महत्वपूर्ण दवा इंटरएक्शन नहीं",
      noDoctorNotes: "अभी तक कोई डॉक्टर नोट्स नहीं",
      riskLevel: "जोखिम स्तर",
      status: "स्थिति",
    },
    mr: {
      transcription: "रुग्ण ट्रांसक्रिप्शन",
      symptoms: "शोधलेली लक्षणे",
      conditions: "संभाव्य स्थिती",
      medicines: "सुचारू औषधे",
      ddiWarnings: "औषध-औषध परस्परक्रिया चेतावणी",
      doseFrequency: "डोज आणि वारंवारता",
      blockchainProof: "ब्लॉकचेन सत्यापन",
      hash: "हॅश",
      timestamp: "वेळ मुद्रा",
      verifiedOn: "वर सत्यापित",
      noInteractions: "कोणतेही महत्वपूर्ण औषध परस्परक्रिया आढळली नाही",
      noDoctorNotes: "अद्याप कोणतीही डॉक्टर नोट्स नाहीत",
      riskLevel: "जोखीम स्तर",
      status: "स्थिती",
    },
  }

  const t = langText[language as keyof typeof langText]

  const getSymptomName = (symId: string) => {
    const sym = seedData.symptoms.find((s) => s.id === symId)
    if (language === "hi") return sym?.nameHi || sym?.name
    if (language === "mr") return sym?.nameMr || sym?.name
    return sym?.name
  }

  const getConditionName = (condId: string) => {
    const cond = seedData.conditions.find((c) => c.id === condId)
    if (language === "hi") return cond?.nameHi || cond?.name
    if (language === "mr") return cond?.nameMr || cond?.name
    return cond?.name
  }

  const riskColors = {
    low: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    high: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-shadow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t.status}</p>
            <p className="font-semibold capitalize">{consultation.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t.riskLevel}</p>
            <p className={`font-semibold ${riskColors[consultation.riskLevel]} px-2 py-1 rounded inline-block`}>
              {consultation.riskLevel.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-semibold">{new Date(consultation.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-semibold">{new Date(consultation.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Transcription */}
      <div className="card-shadow">
        <h3 className="text-lg font-semibold mb-3">{t.transcription}</h3>
        <p className="text-gray-700 leading-relaxed">{consultation.transcription}</p>
      </div>

      {/* Symptoms */}
      <div className="card-shadow">
        <h3 className="text-lg font-semibold mb-3">{t.symptoms}</h3>
        <div className="flex flex-wrap gap-2">
          {consultation.symptoms.map((symId) => (
            <span key={symId} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {getSymptomName(symId)}
            </span>
          ))}
        </div>
      </div>

      {/* Probable Conditions */}
      <div className="card-shadow">
        <h3 className="text-lg font-semibold mb-3">{t.conditions}</h3>
        <div className="space-y-2">
          {consultation.probableConditions.map((condId) => (
            <div key={condId} className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="font-medium">{getConditionName(condId)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Medicines */}
      <div className="card-shadow">
        <h3 className="text-lg font-semibold mb-3">{t.medicines}</h3>
        <div className="space-y-3">
          {consultation.suggestedMedicines.map((med) => (
            <div key={med.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{med.name}</p>
                  <p className="text-sm text-gray-500">{med.class}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{med.description}</p>
              <p className="text-sm font-medium text-gray-700">
                {t.doseFrequency}: {med.dose} • {med.frequency}
              </p>
              <p className="text-xs text-warning mt-2">
                ⚠️ Not a prescription. Consult your doctor before taking any medicine.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DDI Warnings */}
      {consultation.ddiAlerts && consultation.ddiAlerts.length > 0 ? (
        <div className="card-shadow border-l-4 border-warning">
          <h3 className="text-lg font-semibold mb-3 text-warning">{t.ddiWarnings}</h3>
          <div className="space-y-2">
            {consultation.ddiAlerts.map((alert, idx) => (
              <div key={idx} className="p-3 bg-warning/10 rounded">
                <p className="text-sm font-medium text-warning">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-shadow border-l-4 border-success">
          <p className="text-success font-medium">✓ {t.noInteractions}</p>
        </div>
      )}

      {/* Doctor Notes */}
      {consultation.doctorNotes && (
        <div className="card-shadow">
          <h3 className="text-lg font-semibold mb-3">Doctor's Notes</h3>
          <p className="text-gray-700">{consultation.doctorNotes}</p>
        </div>
      )}

      {/* Blockchain Proof */}
      {consultation.blockchainHash && (
        <div className="card-shadow border-l-4 border-secondary bg-teal-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">✓ {t.blockchainProof}</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">{t.hash}</p>
              <p className="font-mono text-xs bg-white p-2 rounded border border-gray-200 break-all">
                {consultation.blockchainHash}
              </p>
            </div>
            <div>
              <p className="text-gray-500">{t.verifiedOn}</p>
              <p className="font-medium">{new Date(consultation.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
