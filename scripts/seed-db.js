import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const password = await bcrypt.hash("Password@123", 10);

  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        email: "admin@test.com",
        name: "Admin User",
        passwordHash: password,
        role: "ADMIN",
      },
      {
        email: "patient@test.com",
        name: "Patient User",
        passwordHash: password,
        role: "PATIENT",
      },
    ],
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
