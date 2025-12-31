import { seedData } from "@/lib/db-seed"
import type { DDIAlert } from "@/lib/types"

/**
 * Checks for Drug-Drug Interactions (DDI) between suggested medicines
 * and patient's current medications
 */
export function checkDDI(suggestedMedicineIds: string[], currentMedicineIds: string[] = []): DDIAlert[] {
  const alerts: DDIAlert[] = []

  // Check suggested medicines against each other
  for (let i = 0; i < suggestedMedicineIds.length; i++) {
    for (let j = i + 1; j < suggestedMedicineIds.length; j++) {
      const pair = findDDIPair(suggestedMedicineIds[i], suggestedMedicineIds[j])
      if (pair && pair.severity === "high") {
        alerts.push({
          drug1: suggestedMedicineIds[i],
          drug2: suggestedMedicineIds[j],
          severity: pair.severity,
          description: pair.description,
        })
      }
    }
  }

  // Check suggested medicines against current medicines
  suggestedMedicineIds.forEach((suggestedId) => {
    currentMedicineIds.forEach((currentId) => {
      const pair = findDDIPair(suggestedId, currentId)
      if (pair && (pair.severity === "high" || pair.severity === "medium")) {
        alerts.push({
          drug1: suggestedId,
          drug2: currentId,
          severity: pair.severity,
          description: pair.description,
        })
      }
    })
  })

  return alerts
}

function findDDIPair(drug1Id: string, drug2Id: string): { severity: string; description: string } | null {
  for (const pair of seedData.ddiPairs) {
    if ((pair.drug1 === drug1Id && pair.drug2 === drug2Id) || (pair.drug1 === drug2Id && pair.drug2 === drug1Id)) {
      return {
        severity: pair.severity,
        description: pair.description,
      }
    }
  }
  return null
}

export function hasCriticalDDI(alerts: DDIAlert[]): boolean {
  return alerts.some((alert) => alert.severity === "high")
}

export function filterSafeMedicines(medicineIds: string[], currentMedicineIds: string[] = []): string[] {
  return medicineIds.filter((medId) => {
    const alerts = checkDDI([medId], currentMedicineIds)
    return !alerts.some((a) => a.severity === "high")
  })
}
