import { PrismaClient } from "@prisma/client"
import * as bcryptjs from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("[SEED] Starting database seeding...")

    // Sequential deletes work fine for seeding
    await prisma.auditLog.deleteMany({})
    await prisma.mlInferenceLog.deleteMany({})
    await prisma.blockchainRecord.deleteMany({})
    await prisma.ddiAlert.deleteMany({})
    await prisma.suggestedMedicine.deleteMany({})
    await prisma.probableCondition.deleteMany({})
    await prisma.consultation.deleteMany({})
    await prisma.user.deleteMany({})
    console.log("[SEED] Cleared existing data")

    // Hash passwords using bcryptjs (same as login API)
    const patientPassword = await bcryptjs.hash("patient123", 10)
    const doctorPassword = await bcryptjs.hash("doctor123", 10)
    const adminPassword = await bcryptjs.hash("admin123", 10)

    // Create test users
    const patient = await prisma.user.create({
      data: {
        email: "patient@example.com",
        name: "John Patient",
        passwordHash: patientPassword,
        role: "PATIENT",
      },
    })
    console.log("[SEED] Created patient user:", patient.email)

    const doctor = await prisma.user.create({
      data: {
        email: "doctor@example.com",
        name: "Dr. Sarah Smith",
        passwordHash: doctorPassword,
        role: "DOCTOR",
        specialization: "General Medicine",
      },
    })
    console.log("[SEED] Created doctor user:", doctor.email)

    const admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        passwordHash: adminPassword,
        role: "ADMIN",
      },
    })
    console.log("[SEED] Created admin user:", admin.email)

    console.log("[SEED] Database seeding completed successfully!")
    console.log("\n--- Login Credentials ---")
    console.log("Patient: patient@example.com / patient123")
    console.log("Doctor: doctor@example.com / doctor123")
    console.log("Admin: admin@example.com / admin123")
  } catch (error) {
    console.error("[SEED] Error during seeding:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
