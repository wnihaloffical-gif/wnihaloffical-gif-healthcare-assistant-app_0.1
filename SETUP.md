# Quick Setup Guide

## One-Time Setup

### 1. Create Environment Files

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/aarogyaguard
MONGODB_DB_NAME=aarogyaguard
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRY=24h
BLOCKCHAIN_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8002
DEBUG=true
NODE_ENV=development
```

Create `blockchain-service/.env`:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=aarogyaguard
DEBUG=false
```

Create `ml-service/.env`:

```env
PORT=8002
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=aarogyaguard
DEBUG=false
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Blockchain service
cd blockchain-service
pip install -r requirements.txt
cd ..

# ML service
cd ml-service
pip install -r requirements.txt
cd ..
```

### 3. Setup Database

MongoDB must be running on `mongodb://localhost:27017`

```bash
# Generate Prisma client
npx prisma generate

# Push schema to MongoDB
npx prisma db push --skip-generate --force-reset

# Seed test users
npm run db:seed
```

## Running the Application

### Terminal 1: Blockchain Service

```bash
cd blockchain-service
python main.py
```

Expected: `INFO: Uvicorn running on http://127.0.0.1:8000`

### Terminal 2: ML Service

```bash
cd ml-service
python app.py
```

Expected: `INFO: Uvicorn running on http://0.0.0.0:8002`

### Terminal 3: Frontend

```bash
npm run dev
```

Expected: `Ready in X.Xs` - Open http://localhost:3000

## Test Accounts

| Role   | Email                | Password     |
|--------|----------------------|--------------|
| Patient| patient@example.com  | password123  |
| Doctor | doctor@example.com   | password123  |
| Admin  | admin@example.com    | password123  |

## Troubleshooting

**Error: "MONGODB_URI not found"**
- Ensure `.env.local` is created in the root directory
- Check MongoDB is running: `mongod` or `brew services start mongodb-community`

**Error: "Port already in use"**
- Kill existing process: `lsof -i :3000` then `kill -9 <PID>`
- Or use different port: `PORT=3001 npm run dev`

**Error: "Cannot connect to ML/Blockchain service"**
- Ensure all 3 services are running in separate terminals
- Check .env.local has correct URLs (localhost not 127.0.0.1 for BLOCKCHAIN_SERVICE_URL)

**Database empty (no users)**
- Run: `npm run db:seed`
- Check MongoDB is running and accessible
