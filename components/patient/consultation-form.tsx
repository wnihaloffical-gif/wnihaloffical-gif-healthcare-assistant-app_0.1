"use client"

import { useState } from "react"

interface ConsultationFormProps {
  transcription: string
  language: string
  onAnalyze: (editedText: string, medicines: string[]) => void
  onEdit: () => void
}

export default function ConsultationForm({ transcription, language, onAnalyze, onEdit }: ConsultationFormProps) {
  const [editedText, setEditedText] = useState(transcription)
  const [medicines, setMedicines] = useState<string[]>([])
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false)

  const langText = {
    en: {
      title: "Review Your Symptoms",
      editText: "Edit Symptom Description",
      currentMeds: "Current Medications (if any)",
      addMeds: "Add Medicine",
      disclaimer: "I understand this is for educational purposes and will consult a doctor",
      analyze: "Analyze Symptoms",
      edit: "Edit Recording",
      medicineLabel: "Medicine name",
    },
    hi: {
      title: "अपने लक्षणों की समीक्षा करें",
      editText: "लक्षण विवरण संपादित करें",
      currentMeds: "वर्तमान दवाएं",
      addMeds: "दवा जोड़ें",
      disclaimer: "मैं समझता हूं कि यह शैक्षणिक उद्देश्यों के लिए है और डॉक्टर से परामर्श लूंगा",
      analyze: "लक्षण विश्लेषण",
      edit: "रिकॉर्डिंग संपादित करें",
      medicineLabel: "दवा का नाम",
    },
    mr: {
      title: "आपल्या लक्षणांची समीक्षा करा",
      editText: "लक्षण विवरण संपादित करा",
      currentMeds: "सध्याच्या औषधे",
      addMeds: "औषध जोडा",
      disclaimer: "मी समजतो की हे शैक्षणिक उद्देश्यांसाठी आहे आणि डॉक्टरांचा सल्ला घेईन",
      analyze: "लक्षण विश्लेषण",
      edit: "रेकॉर्डिंग संपादित करा",
      medicineLabel: "औषधाचे नाव",
    },
  }

  const t = langText[language as keyof typeof langText]

  const handleAnalyzeClick = () => {
    if (onAnalyze) {
      onAnalyze(editedText, medicines)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>

      {/* Symptom Text */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.editText}</label>
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg"
          rows={4}
        />
      </div>

      {/* Current Medications */}
      <div>
        <label className="block text-sm font-medium mb-2">{t.currentMeds}</label>
        <div className="space-y-2">
          {medicines.map((med, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={med}
                onChange={(e) => {
                  const newMeds = [...medicines]
                  newMeds[idx] = e.target.value
                  setMedicines(newMeds)
                }}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))}
                className="text-destructive font-bold"
              >
                ×
              </button>
            </div>
          ))}
          <button onClick={() => setMedicines([...medicines, ""])} className="text-primary text-sm font-semibold">
            + {t.addMeds}
          </button>
        </div>
      </div>

      {/* Disclaimer Checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={agreedToDisclaimer}
          onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
          className="mt-1"
        />
        <label className="text-sm text-gray-600">{t.disclaimer}</label>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onEdit}
          className="flex-1 border border-primary text-primary py-2 px-4 rounded font-semibold hover:bg-primary/5 transition-colors"
        >
          {t.edit}
        </button>
        <button
          onClick={handleAnalyzeClick}
          disabled={!agreedToDisclaimer}
          className="flex-1 bg-primary text-white py-2 px-4 rounded font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {t.analyze}
        </button>
      </div>
    </div>
  )
}
