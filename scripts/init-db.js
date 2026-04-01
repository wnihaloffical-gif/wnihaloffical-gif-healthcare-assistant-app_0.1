const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('[v0] Starting database initialization...');

    // Test connection
    await prisma.$executeRawUnsafe('SELECT 1');
    console.log('[v0] Database connection successful');

    // Clean existing data (optional - comment out if you want to keep existing data)
    console.log('[v0] Clearing existing data...');
    await prisma.consultationReview.deleteMany();
    await prisma.consultation.deleteMany();
    await prisma.user.deleteMany();

    // Seed doctors
    console.log('[v0] Seeding doctors...');
    const doctor1 = await prisma.user.create({
      data: {
        email: 'doctor1@example.com',
        name: 'Dr. Arjun Sharma',
        password: 'hashedpassword123', // In real app, use bcrypt
        role: 'DOCTOR',
        specialization: 'General Physician',
      },
    });

    const doctor2 = await prisma.user.create({
      data: {
        email: 'doctor2@example.com',
        name: 'Dr. Priya Patel',
        password: 'hashedpassword123',
        role: 'DOCTOR',
        specialization: 'Cardiologist',
      },
    });

    console.log('[v0] Doctors seeded:', doctor1.id, doctor2.id);

    // Seed patients
    console.log('[v0] Seeding patients...');
    const patient1 = await prisma.user.create({
      data: {
        email: 'patient1@example.com',
        name: 'Rajesh Kumar',
        password: 'hashedpassword123',
        role: 'PATIENT',
      },
    });

    const patient2 = await prisma.user.create({
      data: {
        email: 'patient2@example.com',
        name: 'Anjali Singh',
        password: 'hashedpassword123',
        role: 'PATIENT',
      },
    });

    console.log('[v0] Patients seeded:', patient1.id, patient2.id);

    // Seed consultations
    console.log('[v0] Seeding consultations...');
    const consultation1 = await prisma.consultation.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor1.id,
        symptoms: 'Headache, fever, cough',
        status: 'PENDING',
        riskLevel: 'MEDIUM',
        createdAt: new Date(),
      },
    });

    const consultation2 = await prisma.consultation.create({
      data: {
        patientId: patient2.id,
        doctorId: doctor2.id,
        symptoms: 'Chest pain, shortness of breath',
        status: 'PENDING',
        riskLevel: 'HIGH',
        createdAt: new Date(),
      },
    });

    console.log('[v0] Consultations seeded:', consultation1.id, consultation2.id);

    // Seed consultation review (optional)
    console.log('[v0] Seeding consultation review...');
    const review = await prisma.consultationReview.create({
      data: {
        consultationId: consultation1.id,
        doctorId: doctor1.id,
        diagnosis: 'Common cold with mild fever',
        medicines: 'Paracetamol 500mg, Cough syrup',
        notes: 'Patient should rest for 2-3 days',
        blockchainHash: null,
        status: 'COMPLETED',
      },
    });

    console.log('[v0] Review seeded:', review.id);

    console.log('[v0] Database initialization completed successfully!');
  } catch (error) {
    console.error('[v0] Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
