"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en")

  const langText = {
    en: {
      title: "AarogyaGuard",
      subtitle: "AI-Powered Healthcare Assistant",
      description: "Voice-based symptom analysis, medication guidance, and secure health records",
      patient: "I am a Patient",
      doctor: "I am a Doctor",
      admin: "Admin Dashboard",
      selectLang: "Select Language",
    },
    hi: {
      title: "आरोग्यगार्ड",
      subtitle: "AI-संचालित स्वास्थ्य सहायक",
      description: "कंठस्वर-आधारित लक्षण विश्लेषण, दवा मार्गदर्शन, और सुरक्षित स्वास्थ्य रिकॉर्ड",
      patient: "मैं एक रोगी हूँ",
      doctor: "मैं एक डॉक्टर हूँ",
      admin: "प्रशासक डैशबोर्ड",
      selectLang: "भाषा चुनें",
    },
    mr: {
      title: "आरोग्यगार्ड",
      subtitle: "AI-चालित स्वास्थ्य सहायक",
      description: "व्हॉयस-आधारित लक्षण विश्लेषण, औषध मार्गदर्शन, आणि सुरक्षित स्वास्थ्य रेकॉर्ड",
      patient: "मी एक रुग्ण आहे",
      doctor: "मी एक डॉक्टर आहे",
      admin: "प्रशासक डॅशबोर्ड",
      selectLang: "भाषा निवडा",
    },
  }

  const t = langText[language]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-white">
      {/* Language selector */}
      <div className="absolute top-4 right-4">
        <div className="flex gap-2">
          {(["en", "hi", "mr"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                language === lang
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-5xl font-bold text-primary mb-2">{t.title}</h1>
          <p className="text-xl text-muted-foreground mb-2">{t.subtitle}</p>
          <p className="text-muted-foreground">{t.description}</p>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-banner mb-8 max-w-md w-full">
          <strong>⚠️ Important Disclaimer:</strong> This assistant does NOT provide medical diagnosis or prescriptions.
          In emergencies, contact local health services immediately. This is for educational and assistive purposes
          only.
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          <button
            onClick={() => {
              sessionStorage.setItem("selectedLanguage", language)
              router.push("/auth/login?role=patient")
            }}
            className="bg-primary text-primary-foreground px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-colors text-lg"
          >
            {t.patient}
          </button>
          <button
            onClick={() => {
              sessionStorage.setItem("selectedLanguage", language)
              router.push("/auth/login?role=doctor")
            }}
            className="bg-secondary text-secondary-foreground px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-colors text-lg"
          >
            {t.doctor}
          </button>
          <button
            onClick={() => {
              sessionStorage.setItem("selectedLanguage", language)
              router.push("/auth/login?role=admin")
            }}
            className="text-foreground px-6 py-4 rounded-lg font-semibold hover:opacity-80 transition-colors text-lg bg-slate-700"
          >
            {t.admin}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-6 border-t border-border">
        <p>🔒 Your data is encrypted and anchored on blockchain for maximum security</p>
      </div>
    </div>
  )
}
