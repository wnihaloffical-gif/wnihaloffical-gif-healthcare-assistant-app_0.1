# Prisma ORM Setup Guide for AarogyaGuard

## Overview
This application now uses **Prisma ORM** with MongoDB for automatic schema management and type-safe database operations. All tables are created automatically when you run the setup script.

## Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB instance running (local or Atlas)

### 2. Setup Database (Automatic)

\`\`\`bash
# Run the setup script - this does everything automatically
npm run db:setup

# Or run individual commands:
npm install                    # Install dependencies
npx prisma generate          # Generate Prisma Client
npx prisma db push           # Create all tables in MongoDB
npm run db:seed              # Seed with default users
\`\`\`

### 3. What Gets Created Automatically

When you run `npm run db:setup`, the following collections are created in MongoDB:

- **users** - Patient, Doctor, Admin accounts
- **consultations** - Consultation records with symptoms, diagnosis, medicines
- **probable_conditions** - Disease predictions with confidence scores
- **suggested_medicines** - Medication recommendations with dosage
- **ddi_alerts** - Drug-drug interaction warnings
- **blockchain_records** - Immutable blockchain verification records
- **ml_inference_logs** - ML model prediction logs for auditing
- **audit_logs** - System audit trail for compliance

### 4. Default Test Users

After setup, you can login with:

\`\`\`
Patient:  patient@example.com / password123
Doctor:   doctor@example.com / password123
Admin:    admin@example.com / password123
\`\`\`

## Usage in API Routes

Before (Raw MongoDB):
\`\`\`typescript
const user = await db.getUserByEmail(email)
\`\`\`

After (Prisma):
\`\`\`typescript
const user = await prisma.user.findUnique({
  where: { email },
})
\`\`\`

## Useful Commands

\`\`\`bash
# View/edit database in browser UI
npm run db:studio

# Seed database with test data
npm run db:seed

# Apply schema changes
npx prisma db push

# Generate Prisma Client after schema changes
npx prisma generate

# Reset entire database (WARNING: deletes all data)
npx prisma db push --skip-generate --force-reset
\`\`\`

## Environment Variables

Required in `.env.local`:

\`\`\`
MONGODB_URI=mongodb://localhost:27017/aarogyaguard
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
\`\`\`

## Schema Relationships

\`\`\`
User (1) ──→ (Many) Consultation (Patient)
User (1) ──→ (Many) Consultation (Doctor)
Consultation (1) ──→ (Many) ProbableConditions
Consultation (1) ──→ (Many) SuggestedMedicines
Consultation (1) ──→ (Many) DDIAlerts
Consultation (1) ──→ (1) BlockchainRecord
Consultation (1) ──→ (1) MLInferenceLog
\`\`\`

## Troubleshooting

**Error: "No MongoDB instance found"**
- Start MongoDB locally: `mongod`
- Or update MONGODB_URI in `.env.local` with your Atlas connection string

**Error: "Prisma schema validation failed"**
- Run: `npx prisma db push --force-reset` to reinitialize

**Type errors after schema changes**
- Run: `npx prisma generate` to regenerate types

## Next Steps

1. Start the application: `npm run dev`
2. Start Blockchain Service: `cd blockchain-service && python main.py`
3. Start ML Service: `cd ml-service && python app.py`
4. Access the app at http://localhost:3000
