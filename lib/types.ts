export interface User {
  id: string
  name: string
  email: string
  role: "patient" | "doctor" | "admin"
  specialization?: string
  createdAt: Date
}

export interface Consultation {
  id: string
  patientId: string
  doctorId?: string
  transcription: string
  symptoms: string[]
  probableConditions: string[]
  riskLevel: "low" | "medium" | "high"
  suggestedMedicines: Medicine[]
  ddiAlerts: DDIAlert[]
  finalDiagnosis?: string
  finalMedicines?: string[]
  doctorNotes?: string
  status: "draft" | "completed" | "reviewed"
  blockchainHash?: string
  createdAt: Date
  updatedAt: Date
}

export interface Medicine {
  id: string
  name: string
  class: string
  dose: string
  frequency: string
  description: string
}

export interface DDIAlert {
  drug1: string
  drug2: string
  severity: "low" | "medium" | "high"
  description: string
}

export interface SymptomAnalysis {
  symptoms: string[]
  probableConditions: string[]
  riskLevel: "low" | "medium" | "high"
  hasRedFlags: boolean
  redFlagWarnings?: string[]
  patientSummary: string
}
