# AarogyaGuard - Quick Start (5 Minutes)

## Prerequisites
- Node.js v18+ - [Download](https://nodejs.org/)
- Python 3.9+ - [Download](https://python.org/)
- MongoDB running locally - [Download Community](https://www.mongodb.com/try/download/community)

## Start MongoDB

**Windows/macOS/Linux:**
\`\`\`bash
mongod
\`\`\`

Keep this terminal open. MongoDB runs on `mongodb://localhost:27017`

## 4 Terminal Setup

### Terminal 1: Frontend

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000

### Terminal 2: Blockchain Service

\`\`\`bash
cd blockchain-service
pip install -r requirements.txt
python main.py
\`\`\`

### Terminal 3: ML Service

\`\`\`bash
cd ml-service
pip install -r requirements.txt
python app.py
\`\`\`

### Terminal 4: Database Setup (One-time)

\`\`\`bash
npx prisma generate
npx prisma db push --skip-generate --force-reset
npm run db:seed
\`\`\`

## Login

| Role   | Email                | Password    |
|--------|----------------------|-------------|
| Patient| patient@example.com  | password123 |
| Doctor | doctor@example.com   | password123 |
| Admin  | admin@example.com    | password123 |

## Environment Files

Files are already configured in `.env` and `blockchain-service/.env` and `ml-service/.env`. No manual setup needed!

If running on a different machine, copy `SETUP.md` for complete configuration.

## That's It!

- Frontend: http://localhost:3000
- Blockchain API: http://localhost:8000
- ML API: http://localhost:8002

Test with patient account to start a consultation.
