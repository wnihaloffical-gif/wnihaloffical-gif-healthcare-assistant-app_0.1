// DEPRECATED: This file is kept for reference only
// All data is now fetched from MongoDB through API endpoints
// See lib/db/crud.ts for database operations

import type { User } from "./schemas"

export const seedData = {
  // Users are now fetched via /api/user/[id] and /api/auth/login
  users: [] as User[],

  // Symptoms are now fetched via /api/symptoms
  symptoms: [] as any[],

  // Conditions are now fetched via /api/conditions
  conditions: [] as any[],

  // Medicines are now fetched via /api/medicines
  medicines: [] as any[],

  // DDI pairs are now fetched via /api/ddi-pairs
  ddiPairs: [] as any[],
}

console.warn("seedData is deprecated. All data is now persisted in MongoDB.")
