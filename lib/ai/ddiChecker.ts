// lib/ai/ddiChecker.ts
import { prisma } from "@/lib/db/prisma"

export interface DDIAlert {
  drugA: string
  drugB: string
  severity: string
  message: string
}

export async function checkDrugInteractions(suggestedMedicines: string[], currentMedications: string[]): Promise<DDIAlert[]> {
  const alerts: DDIAlert[] = []

  // Check interactions between suggested medicines and current medications
  for (const suggested of suggestedMedicines) {
    for (const current of currentMedications) {
      // Query DB for interactions (check both directions)
      const interaction = await prisma.drugInteraction.findFirst({
        where: {
          OR: [
            { drugA: suggested, drugB: current },
            { drugA: current, drugB: suggested }
          ]
        }
      })

      if (interaction) {
        alerts.push({
          drugA: interaction.drugA,
          drugB: interaction.drugB,
          severity: interaction.severity.toLowerCase(),
          message: interaction.description
        })
      }
    }
  }

  // Also check interactions within suggested medicines
  for (let i = 0; i < suggestedMedicines.length; i++) {
    for (let j = i + 1; j < suggestedMedicines.length; j++) {
      const drugA = suggestedMedicines[i]
      const drugB = suggestedMedicines[j]

      const interaction = await prisma.drugInteraction.findFirst({
        where: {
          OR: [
            { drugA, drugB },
            { drugA: drugB, drugB: drugA }
          ]
        }
      })

      if (interaction) {
        alerts.push({
          drugA: interaction.drugA,
          drugB: interaction.drugB,
          severity: interaction.severity.toLowerCase(),
          message: interaction.description
        })
      }
    }
  }

  return alerts
}