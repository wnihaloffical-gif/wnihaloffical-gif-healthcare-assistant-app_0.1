#!/bin/bash

echo "Starting database initialization..."

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "Pushing schema to database..."
npx prisma db push --skip-generate

# Seed database with test data
echo "Seeding database..."
npx prisma db seed

echo "Database initialization complete!"
