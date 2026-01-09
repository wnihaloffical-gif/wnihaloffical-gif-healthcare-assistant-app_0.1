#!/bin/bash

# AarogyaGuard Database Setup Script

echo "🔧 AarogyaGuard Database Setup"
echo "================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ Error: .env.local file not found!"
  echo "Please create .env.local with MONGODB_URI"
  exit 1
fi

echo "📦 Installing Prisma dependencies..."
npm install

echo "🗄️  Generating Prisma Client..."
npx prisma generate

echo "🔄 Pushing schema to MongoDB..."
npx prisma db push --skip-generate

echo "✨ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Blockchain Service: cd blockchain-service && python main.py"
echo "2. Start ML Service: cd ml-service && python app.py"
echo "3. Start Next.js: npm run dev"
