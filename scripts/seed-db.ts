import { prisma } from "../lib/db/prisma"
import * as bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Seeding database...")

  // Create default users
  const defaultUsers = [
    {
      email: "patient@example.com",
      name: "John Patient",
      password: "password123",
      role: "PATIENT",
    },
    {
      email: "doctor@example.com",
      name: "Dr. Sarah Smith",
      password: "password123",
      role: "DOCTOR",
      specialization: "General Medicine",
    },
    {
      email: "admin@example.com",
      name: "Admin User",
      password: "password123",
      role: "ADMIN",
    },
  ]

  for (const user of defaultUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10)
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          passwordHash,
          role: user.role as any,
          specialization: user.specialization,
        },
      })
      console.log(`✅ Created user: ${user.email}`)
    }
  }

  console.log("✨ Database seeding complete!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
