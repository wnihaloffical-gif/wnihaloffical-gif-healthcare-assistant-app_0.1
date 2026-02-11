"use client";

import { useRouter } from "next/navigation";

interface AnalysisResultsProps {
  data: {
    structuredSymptoms: {
      complaint: string;
      onset: string;
      duration: string;
      severity: string;
      associatedSymptoms: string[];
      currentMedications: string[];
    };
    probableConditions: string[];
    riskLevel: "low" | "medium" | "high";
    redFlags: string[];
    suggestedMedicines: {
      name: string;
      class: string;
      explanation: string;
    }[];
    ddiAlerts: {
      drugA: string;
      drugB: string;
      severity: string;
      message: string;
    }[];
    patientSummaryText: string;
    consultationId?: number;
    blockchainHash?: string;
  };
  language: string;
}

export default function AnalysisResults({
  data,
  language,
}: AnalysisResultsProps) {
  const router = useRouter();

  const langText = {
    en: {
      patientSummary: "Patient Summary",
      symptoms: "Identified Symptoms",
      conditions: "Probable Conditions",
      medicines: "Suggested Medicines",
      ddiStatus: "Drug Interaction Status",
      blockchainVerification: "Blockchain Verification",
      saveConsultation: "Save This Consultation",
      nextSteps: "Recommended Next Steps",
      consultation: "Schedule Doctor Consultation",
      rest: "Rest and Monitor Symptoms",
      fluids: "Stay Hydrated",
      noInteractions: "No harmful interactions detected",
      verifiedOn: "Verified On Blockchain",
    },
    hi: {
      patientSummary: "रोगी सारांश",
      symptoms: "पहचानी गई लक्षणें",
      conditions: "संभावित स्थितियां",
      medicines: "सुझाई गई दवाएं",
      ddiStatus: "दवा इंटरएक्शन स्थिति",
      blockchainVerification: "ब्लॉकचेन सत्यापन",
      saveConsultation: "इस परामर्श को सहेजें",
      nextSteps: "अगले कदमों की सिफारिश",
      consultation: "डॉक्टर परामर्श शेड्यूल करें",
      rest: "आराम करें और लक्षणों की निगरानी करें",
      fluids: "हाइड्रेटेड रहें",
      noInteractions: "कोई हानिकारक इंटरएक्शन नहीं",
      verifiedOn: "ब्लॉकचेन पर सत्यापित",
    },
    mr: {
      patientSummary: "रुग्ण सारांश",
      symptoms: "ओळखलेली लक्षणे",
      conditions: "संभाव्य स्थिती",
      medicines: "सुचारू औषधे",
      ddiStatus: "औषध परस्परक्रिया स्थिती",
      blockchainVerification: "ब्लॉकचेन सत्यापन",
      saveConsultation: "हे परामर्श जतन करा",
      nextSteps: "शिफारस केलेली पुढील पावले",
      consultation: "डॉक्टर परामर्श शेड्यूल करा",
      rest: "विश्रांती घ्या आणि लक्षणांची निगरानी करा",
      fluids: "हायड्रेटेड राहा",
      noInteractions: "कोणतेही हानिकारक परस्परक्रिया नाही",
      verifiedOn: "ब्लॉकचेन वर सत्यापित",
    },
  };

  const t = langText[language as keyof typeof langText];

  const riskColors: Record<string, string> = {
    low: "bg-success/10 text-success border-success",
    medium: "bg-warning/10 text-warning border-warning",
    high: "bg-destructive/10 text-destructive border-destructive",
  };
  const riskClass = riskColors[data.riskLevel] ?? riskColors.medium;

  return (
    <div className="space-y-6">
      {/* Risk Level Banner */}
      {data.redFlags.length > 0 ? (
        <div className="card-shadow border-l-4 border-destructive bg-destructive/5 p-6">
          <h3 className="text-lg font-bold text-destructive mb-2">
            ⚠️ RED FLAG ALERT
          </h3>
          <ul className="text-destructive font-medium">
            {data.redFlags.map((flag, idx) => (
              <li key={idx}>• {flag}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={`card-shadow border-l-4 p-6 ${riskClass}`}>
          <h3 className="text-lg font-bold mb-2">
            Risk Level: {data.riskLevel.toUpperCase()}
          </h3>
          <p className="text-sm">
            Based on reported symptoms, this case has been classified as{" "}
            {data.riskLevel} risk.
          </p>
        </div>
      )}

      {/* Patient Summary */}
      <div className="card-shadow">
        <h2 className="text-xl font-bold mb-3">{t.patientSummary}</h2>
        <p className="text-foreground leading-relaxed">
          {data.patientSummaryText}
        </p>
      </div>

      {/* Symptoms */}
      <div className="card-shadow">
        <h3 className="text-lg font-semibold mb-3">{t.symptoms}</h3>
        <div className="space-y-2">
          <p>
            <strong>Complaint:</strong> {data.structuredSymptoms.complaint}
          </p>
          <p>
            <strong>Onset:</strong> {data.structuredSymptoms.onset}
          </p>
          <p>
            <strong>Duration:</strong> {data.structuredSymptoms.duration}
          </p>
          <p>
            <strong>Severity:</strong> {data.structuredSymptoms.severity}
          </p>
          {data.structuredSymptoms.associatedSymptoms.length > 0 && (
            <div>
              <strong>Associated Symptoms:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.structuredSymptoms.associatedSymptoms.map((sym, idx) => (
                  <span
                    key={idx}
                    className="bg-info/10 text-info px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.structuredSymptoms.currentMedications.length > 0 && (
            <div>
              <strong>Current Medications:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.structuredSymptoms.currentMedications.map((med, idx) => (
                  <span
                    key={idx}
                    className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Probable Conditions */}
      <div className="card-shadow">
        <h3 className="text-lg font-semibold mb-3">{t.conditions}</h3>
        <div className="space-y-2">
          {data.probableConditions.map((condition, idx) => (
            <div
              key={idx}
              className="p-3 bg-accent/10 rounded border border-accent"
            >
              <p className="font-medium text-foreground">{condition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Medicines */}
      <div className="card-shadow">
        <h3 className="text-lg font-semibold mb-4">{t.medicines}</h3>
        <div className="space-y-3">
          {data.suggestedMedicines.map((med, idx) => (
            <div key={idx} className="p-4 border border-border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-foreground">{med.name}</p>
                  <p className="text-sm text-muted-foreground">{med.class}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {med.explanation}
              </p>
              <div className="bg-warning/10 border border-warning/20 p-2 rounded text-xs text-warning">
                ⚠️ <strong>DISCLAIMER:</strong> This is NOT a prescription.
                These are educational suggestions only. Always consult a
                licensed doctor before taking any medicine.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DDI Status */}
      {data.ddiAlerts && data.ddiAlerts.length > 0 ? (
        <div className="card-shadow border-l-4 border-warning bg-warning/5">
          <h3 className="text-lg font-semibold mb-3 text-warning">
            {t.ddiStatus}
          </h3>
          <div className="space-y-2">
            {data.ddiAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 bg-warning/10 rounded text-sm font-medium text-warning"
              >
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-shadow border-l-4 border-success bg-success/5">
          <p className="text-success font-medium">✓ {t.noInteractions}</p>
        </div>
      )}

      {/* Blockchain Verification */}
      {data.blockchainHash && (
        <div className="card-shadow border-l-4 border-secondary bg-secondary/5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ✓ {t.blockchainVerification}
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Blockchain Hash</p>
              <p className="font-mono text-xs bg-background p-2 rounded border border-border break-all">
                {data.blockchainHash}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Status</p>
              <p className="font-medium text-success">
                ✓ Verified on Blockchain
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="card-shadow">
        <h3 className="text-lg font-semibold mb-4">{t.nextSteps}</h3>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="text-primary font-bold">1</span>
            <div>
              <p className="font-medium">{t.consultation}</p>
              <p className="text-sm text-muted-foreground">
                Book an appointment with a qualified doctor
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">2</span>
            <div>
              <p className="font-medium">{t.rest}</p>
              <p className="text-sm text-muted-foreground">
                Get adequate sleep and watch for changes
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">3</span>
            <div>
              <p className="font-medium">{t.fluids}</p>
              <p className="text-sm text-muted-foreground">
                Drink plenty of water and warm beverages
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Save Button */}
      <button
        onClick={() => router.push("/patient/dashboard")}
        className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-colors"
      >
        {t.saveConsultation}
      </button>
    </div>
  );
}
