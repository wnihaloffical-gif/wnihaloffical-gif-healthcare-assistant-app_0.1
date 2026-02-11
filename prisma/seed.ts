import { PrismaClient } from "@prisma/client"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("[SEED] Starting database seeding...")

  const users = [
    {
      email: "patient@example.com",
      name: "John Patient",
      role: Role.PATIENT,
      password: "patient123",
    },
    {
      email: "doctor@example.com",
      name: "Dr. Sarah Smith",
      role: Role.DOCTOR,
      specialization: "General Medicine",
      password: "doctor123",
    },
    {
      email: "admin@example.com",
      name: "Admin User",
      role: Role.ADMIN,
      password: "admin123",
    },
  ]

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10)

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        specialization: user.specialization,
        passwordHash,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        specialization: user.specialization,
        passwordHash,
      },
    })

    console.log(`[SEED] User ensured: ${user.email}`)
  }

  console.log("[SEED] Seeding drug interactions...")

  const drugInteractions = [
    {
      drugA: "Aspirin",
      drugB: "Warfarin",
      severity: "SEVERE",
      description: "Increased risk of bleeding due to additive anticoagulant effects.",
    },
    {
      drugA: "Ibuprofen",
      drugB: "Aspirin",
      severity: "MODERATE",
      description: "Reduced antiplatelet effect of aspirin and increased gastrointestinal risk.",
    },
    {
      drugA: "Paracetamol",
      drugB: "Warfarin",
      severity: "MILD",
      description: "Potential increase in anticoagulant effect.",
    },
  ]

  for (const interaction of drugInteractions) {
    await prisma.drugInteraction.create({
      data: interaction,
    })
  }

  console.log("[SEED] Drug interactions seeded.")

  console.log("[SEED] Database seeding completed successfully ✅")
}

main()
  .catch((e) => {
    console.error("[SEED] Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
