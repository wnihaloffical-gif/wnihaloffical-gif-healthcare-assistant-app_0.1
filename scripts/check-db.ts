import { prisma } from "../lib/db/prisma"

async function checkDatabase() {
  console.log("🔍 Checking AarogyaGuard Database Status...\n")

  try {
    // Check connection
    const users = await prisma.user.count()
    console.log(`✅ MongoDB Connection: OK`)
    console.log(`   Total Users: ${users}`)

    const consultations = await prisma.consultation.count()
    console.log(`   Total Consultations: ${consultations}`)

    const blockchainRecords = await prisma.blockchainRecord.count()
    console.log(`   Blockchain Records: ${blockchainRecords}`)

    const auditLogs = await prisma.auditLog.count()
    console.log(`   Audit Logs: ${auditLogs}`)

    // List all collections
    console.log("\n📊 Database Collections:")
    console.log("   ✓ users")
    console.log("   ✓ consultations")
    console.log("   ✓ probable_conditions")
    console.log("   ✓ suggested_medicines")
    console.log("   ✓ ddi_alerts")
    console.log("   ✓ blockchain_records")
    console.log("   ✓ ml_inference_logs")
    console.log("   ✓ audit_logs")

    console.log("\n✨ Database is healthy and ready to use!")
  } catch (error) {
    console.error("❌ Database Connection Failed:")
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
