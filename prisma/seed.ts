import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    {
      email: "patient@example.com",
      name: "Default Patient",
      role: Role.PATIENT,
      passwordHash,
    },
    {
      email: "doctor@example.com",
      name: "Default Doctor",
      role: Role.DOCTOR,
      passwordHash,
      specialization: "General Medicine",
    },
    {
      email: "admin@example.com",
      name: "System Admin",
      role: Role.ADMIN,
      passwordHash,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log("✅ Default users seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
