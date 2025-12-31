"use client"

import type { Consultation } from "@/lib/types"
import { seedData } from "@/lib/db-seed"
import { useState } from "react"

interface DoctorConsultationReviewProps {
  consultation: Consultation
  language: string
}

export default function DoctorConsultationReview({ consultation, language }: DoctorConsultationReviewProps) {
  const [diagnosis, setDiagnosis] = useState(consultation.finalDiagnosis || "")
  const [medicines, setMedicines] = useState(consultation.finalMedicines || [])
  const [notes, setNotes] = useState(consultation.doctorNotes || "")
  const [medicineInput, setMedicineInput] = useState("")
  const [saving, setSaving] = useState(false)

  const langText = {
    en: {
      aiAnalysis: "AI Analysis",
      symptoms: "Symptoms",
      conditions: "Probable Conditions",
      medicines: "Suggested Medicines",
      ddiWarnings: "Drug-Drug Interactions",
      yourReview: "Your Review",
      diagnosis: "Final Diagnosis",
      finalMedicines: "Final Medication Plan",
      addMedicine: "Add Medicine",
      notes: "Clinical Notes",
      save: "Save Review & Anchor to Blockchain",
      saving: "Saving...",
      noInteractions: "No interactions detected",
    },
    hi: {
      aiAnalysis: "AI विश्लेषण",
      symptoms: "लक्षण",
      conditions: "संभावित स्थितियां",
      medicines: "सुझाई गई दवाएं",
      ddiWarnings: "दवा-दवा इंटरएक्शन",
      yourReview: "आपकी समीक्षा",
      diagnosis: "अंतिम निदान",
      finalMedicines: "अंतिम दवा योजना",
      addMedicine: "दवा जोड़ें",
      notes: "नैदानिक नोट्स",
      save: "समीक्षा सहेजें और ब्लॉकचेन को एंकर करें",
      saving: "सहेजा जा रहा है...",
      noInteractions: "कोई इंटरएक्शन नहीं पाया गया",
    },
    mr: {
      aiAnalysis: "AI विश्लेषण",
      symptoms: "लक्षणे",
      conditions: "संभाव्य स्थिती",
      medicines: "सुचारू औषधे",
      ddiWarnings: "औषध-औषध परस्परक्रिया",
      yourReview: "आपल्या समीक्षा",
      diagnosis: "अंतिम निदान",
      finalMedicines: "अंतिम औषध योजना",
      addMedicine: "औषध जोडा",
      notes: "क्लिनिकल नोट्स",
      save: "समीक्षा जतन करा आणि ब्लॉकचेन लंगर करा",
      saving: "जतन केले जात आहे...",
      noInteractions: "कोणतेही परस्परक्रिया आढळली नाही",
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

  const handleAddMedicine = () => {
    if (medicineInput.trim()) {
      setMedicines([...medicines, medicineInput])
      setMedicineInput("")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Mock save to blockchain
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Consultation saved and anchored to blockchain!")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      <div className="card-shadow border-l-4 border-primary">
        <h2 className="text-xl font-bold mb-4">{t.aiAnalysis}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Symptoms */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-700">{t.symptoms}</h3>
            <div className="flex flex-wrap gap-2">
              {consultation.symptoms.map((symId) => (
                <span key={symId} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {getSymptomName(symId)}
                </span>
              ))}
            </div>
          </div>

          {/* AI Conditions */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-700">{t.conditions}</h3>
            <div className="flex flex-wrap gap-2">
              {consultation.probableConditions.map((condId) => (
                <span key={condId} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {getConditionName(condId)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Medicines */}
        {consultation.suggestedMedicines.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-3 text-gray-700">{t.medicines}</h3>
            <div className="space-y-2">
              {consultation.suggestedMedicines.map((med) => (
                <div key={med.id} className="text-sm bg-gray-50 p-3 rounded">
                  <p className="font-medium">{med.name}</p>
                  <p className="text-gray-600">
                    {med.dose} • {med.frequency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DDI Section */}
        {consultation.ddiAlerts && consultation.ddiAlerts.length > 0 ? (
          <div className="mt-6 pt-6 border-t border-gray-200 bg-warning/10 p-3 rounded">
            <h3 className="font-semibold mb-2 text-warning">{t.ddiWarnings}</h3>
            <div className="space-y-2">
              {consultation.ddiAlerts.map((alert, idx) => (
                <p key={idx} className="text-sm text-warning">
                  {alert.description}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-success">✓ {t.noInteractions}</div>
        )}
      </div>

      {/* Doctor Review Section */}
      <div className="card-shadow border-l-4 border-secondary">
        <h2 className="text-xl font-bold mb-6">{t.yourReview}</h2>

        <div className="space-y-6">
          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium mb-2">{t.diagnosis}</label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Enter your final diagnosis..."
            />
          </div>

          {/* Final Medicines */}
          <div>
            <label className="block text-sm font-medium mb-2">{t.finalMedicines}</label>
            <div className="space-y-2 mb-3">
              {medicines.map((med, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <span>{med}</span>
                  <button
                    onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))}
                    className="text-destructive font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={medicineInput}
                onChange={(e) => setMedicineInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddMedicine()}
                className="flex-1"
                placeholder="Medicine name and dosage"
              />
              <button
                onClick={handleAddMedicine}
                className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary-light"
              >
                {t.addMedicine}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">{t.notes}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Add any clinical notes or observations..."
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-secondary text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  )
}
