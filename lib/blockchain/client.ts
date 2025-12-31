/**
 * Mock blockchain client for storing consultation hashes
 * In production, integrate with actual Ethereum node or blockchain service
 */

interface BlockchainRecord {
  hash: string
  timestamp: number
  consultationId: string
  patientId: string
  role: string
  txId: string
}

// In-memory mock blockchain ledger
const mockBlockchain: BlockchainRecord[] = []

export function storeConsultationHash(
  consultationId: string,
  patientId: string,
  role: string,
  dataHash: string,
): BlockchainRecord {
  const record: BlockchainRecord = {
    hash: dataHash,
    timestamp: Date.now(),
    consultationId,
    patientId,
    role,
    txId: `0x${Math.random().toString(16).slice(2)}`, // Mock transaction ID
  }

  mockBlockchain.push(record)
  console.log("[v0] Blockchain record stored:", record)

  return record
}

export function getConsultationHistory(patientId: string): BlockchainRecord[] {
  return mockBlockchain.filter((record) => record.patientId === patientId)
}

export function getBlockchainProof(consultationId: string): BlockchainRecord | null {
  return mockBlockchain.find((record) => record.consultationId === consultationId) || null
}

/**
 * Generates a simple SHA-256-like hash for the consultation data
 * In production, use crypto-js or Node.js crypto module
 */
export function hashConsultationData(data: object): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `0x${Math.abs(hash).toString(16)}`
}
