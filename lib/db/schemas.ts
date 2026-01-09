// MongoDB collection schemas and validation

export interface User {
  _id?: string
  email: string
  name: string
  passwordHash: string
  role: "patient" | "doctor" | "admin"
  specialization?: string
  createdAt: Date
  updatedAt: Date
}

export interface Consultation {
  _id?: string
  patientId: string
  doctorId?: string
  symptoms: string[]
  probableConditions: Array<{
    name: string
    confidence: number
    severity: string
  }>
  riskLevel: "low" | "medium" | "high" | "critical"
  hasRedFlags: boolean
  redFlagWarnings: string[]
  suggestedMedicines: Array<{
    id: string
    name: string
    dose: string
    frequency: string
    explanation: string
  }>
  ddiAlerts: Array<{
    drug1: string
    drug2: string
    severity: "mild" | "moderate" | "severe"
    description: string
  }>
  patientSummaryText: string
  language: string
  status: "pending" | "reviewed" | "completed"
  doctorNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface BlockchainRecord {
  _id?: string
  consultationId: string
  patientId: string
  dataHash: string
  txId: string
  blockNumber: number
  timestamp: Date
  verified: boolean
}

export interface MLInferenceLog {
  _id?: string
  consultationId: string
  patientId: string
  inputText: string
  language: string
  modelVersion: string
  predictions: Record<string, any>
  processingTime: number
  timestamp: Date
}

export interface AuditLog {
  _id?: string
  module: string
  action: string
  userId?: string
  resourceId?: string
  timestamp: Date
  details: Record<string, any>
}
