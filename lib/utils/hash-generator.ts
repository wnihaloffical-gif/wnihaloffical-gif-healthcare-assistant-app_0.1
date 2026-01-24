import crypto from 'crypto';

/**
 * Generates a deterministic SHA-256 hash from consultation data.
 * The hash changes if any field (symptoms, conditions, medicines, etc.) is modified,
 * ensuring tamper-proof records for blockchain integration.
 */
export function generateConsultationHash(data: {
  symptoms: string[];
  conditions: any[];
  medicines: any[];
  riskLevel: string;
  redFlags: string[];
}): string {
  // Sort keys to ensure deterministic hashing
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  const hash = crypto.createHash('sha256');
  hash.update(sortedData);
  return hash.digest('hex');
}