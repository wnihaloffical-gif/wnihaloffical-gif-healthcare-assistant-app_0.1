# AarogyaGuard - Complete Project Setup & Documentation

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## 🎯 Project Overview

AarogyaGuard is an AI-powered healthcare assistant combining:
- **Next.js 16** frontend with role-based dashboards
- **Prisma ORM** with MySQL database
- **FastAPI** ML service for symptom analysis
- **FastAPI** Blockchain service for immutable health records
- **NextAuth** for secure authentication
- **SHA-256 hashing** for data integrity

---

## 🗄️ Database Configuration (MANDATORY)

**MySQL Server 8.0.36+**

```
Host:     localhost
Port:     1396
Database: aarogyaguard
User:     root
Password: root
Auth:     mysql_native_password
```

### Database Schema

**Users Table:**
- `id` (INT, auto-increment, PK)
- `email` (VARCHAR, unique)
- `name` (VARCHAR)
- `passwordHash` (VARCHAR, bcryptjs hashed)
- `role` (ENUM: PATIENT, DOCTOR, ADMIN)
- `specialization` (VARCHAR, nullable)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

**Consultations Table:**
- `id` (INT, auto-increment, PK)
- `patientId` (INT, FK to users)
- `doctorId` (INT, FK to users, nullable)
- `symptoms` (LONGTEXT, JSON array)
- `riskLevel` (ENUM: LOW, MEDIUM, HIGH, CRITICAL)
- `hasRedFlags` (BOOLEAN)
- `redFlagWarnings` (LONGTEXT, JSON array)
- `status` (ENUM: PENDING, REVIEWED, COMPLETED)
- `doctorNotes` (LONGTEXT, nullable)
- `finalDiagnosis` (LONGTEXT, nullable)
- `finalMedicines` (LONGTEXT, JSON array)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

**Related Tables:**
- `probable_conditions` - ML predicted conditions
- `suggested_medicines` - ML recommended medicines
- `ddi_alerts` - Drug-Drug Interactions
- `blockchain_records` - Immutable consultation hash records
- `ml_inference_logs` - ML processing history
- `audit_logs` - All data modifications

---

## 🔐 Seeded Test Users (Auto-Created)

| Role   | Email                  | Password  |
|--------|------------------------|-----------|
| ADMIN  | admin@example.com      | admin123  |
| DOCTOR | doctor@example.com     | doctor123 |
| PATIENT| patient@example.com    | patient123|

**Password Hashing:** bcryptjs (10 rounds salt)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create MySQL Database
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS aarogyaguard;"
# Enter password: root
```

### 3. Setup Prisma & Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed Test Users
```bash
npm run db:seed
```

### 5. Start Services

**Terminal 1 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - ML Service:**
```bash
cd ml-service
python -m pip install -r requirements.txt
python app.py
# Runs on http://localhost:8002
```

**Terminal 3 - Blockchain Service:**
```bash
cd blockchain-service
python -m pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

---

## 🔑 Environment Variables (.env)

```
# MySQL Database (Port 1396)
DATABASE_URL="mysql://root:root@localhost:1396/aarogyaguard?authPlugin=mysql_native_password"

# Authentication
NEXTAUTH_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# External Services
BLOCKCHAIN_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8002

# Application
NODE_ENV=production
DEBUG=false
```

---

## 📊 API Architecture

### Authentication API
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - User registration

### Consultation APIs
- `POST /api/consultation/analyze` - Submit consultation for ML analysis
- `GET /api/consultation/[id]` - Retrieve consultation
- `PUT /api/consultation/[id]` - Update consultation (creates new hash)
- `GET /api/patient/[id]/consultations` - Retrieve patient's consultations

### ML Service (Port 8002)
- `POST /infer` - Run ML inference on symptoms
- `GET /health` - Health check
- `GET /metrics` - Service metrics

**ML Output:**
```json
{
  "conditions": [
    {"condition": "string", "confidence": 0.85, "severity": "string"}
  ],
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "has_red_flags": boolean,
  "red_flags": ["string"],
  "medicines": [
    {"id": "string", "name": "string", "dose": "string", "frequency": "string"}
  ],
  "ddi_alerts": [
    {"drug1": "string", "drug2": "string", "severity": "string"}
  ],
  "processing_time": 0.234
}
```

### Blockchain Service (Port 8000)
- `POST /blockchain/add` - Add consultation to blockchain
- `GET /blockchain/patient/{patient_id}` - Get patient's blockchain records
- `GET /blockchain/validate` - Validate blockchain integrity
- `GET /blockchain/chain` - Get full blockchain

**Blockchain Record:**
```json
{
  "index": 1,
  "timestamp": "2026-01-16T10:30:00Z",
  "patient_hash": "patient_id_hash",
  "consultation_id": "consultation_123",
  "consultation_summary": "symptoms summary",
  "hash": "sha256_hash",
  "previous_hash": "previous_block_hash"
}
```

---

## 🔐 Data Integrity & Hashing

### Hash Generation
Hash is generated from:
```
symptoms + diagnosis + medicines + ml_output
```

**Algorithm:** SHA-256 (deterministic)

### Hash Update Flow
1. **Consultation Created** → Hash generated → Blockchain record created
2. **Doctor Updates Diagnosis** → Old hash invalidated → New hash generated
3. **New Blockchain Record** → Audit log entry → Immutable record created
4. **Verification:** Rehash consultation data and compare = validation

---

## 👥 Role-Based Access Control

### Patient
- Create consultations
- View own consultations
- View blockchain verification status
- View ML analysis results

### Doctor
- View assigned consultations
- Add diagnosis and medicines
- Review ML suggestions
- View blockchain records

### Admin
- System administration
- Audit log access
- User management
- Blockchain validation

---

## 🏗️ Technology Stack

| Component         | Technology                    | Version |
|-------------------|-------------------------------|---------|
| Frontend          | Next.js 16 (App Router)       | 16.x    |
| Backend Database  | Prisma ORM                    | 5.8+    |
| Database          | MySQL                         | 8.0.36  |
| Authentication    | NextAuth.js                   | 5.x     |
| ML Service        | FastAPI                       | 0.104+  |
| Blockchain        | FastAPI + Custom blockchain   | 0.104+  |
| Password Hashing  | bcryptjs                      | 2.4.3   |
| Hashing           | SHA-256                       | native  |

---

## ✅ Validation Checklist

Before deployment, verify:

- [ ] MySQL database created: `aarogyaguard`
- [ ] Prisma migrations applied: `npx prisma migrate dev`
- [ ] Test users seeded: `npm run db:seed`
- [ ] Frontend starts: `npm run dev` (http://localhost:3000)
- [ ] ML service runs: `python ml-service/app.py` (http://localhost:8002)
- [ ] Blockchain service runs: `python blockchain-service/main.py` (http://localhost:8000)
- [ ] Login works with test credentials
- [ ] Patient can create consultation
- [ ] ML analysis returns results
- [ ] Blockchain record created
- [ ] Hash updates on doctor edits
- [ ] No MongoDB references remain
- [ ] Prisma client never crashes
- [ ] All API endpoints respond correctly

---

## 🐛 Troubleshooting

### MySQL Connection Fails
```bash
mysql -u root -p
# Verify database exists: SHOW DATABASES;
# Verify user permissions: SHOW GRANTS FOR 'root'@'localhost';
```

### Prisma Client Errors
```bash
npx prisma generate
npx prisma migrate dev --name fix
```

### ML Service Won't Start
```bash
# Check Python 3.10+
python --version

# Reinstall dependencies
pip install -r ml-service/requirements.txt --force-reinstall
```

### Blockchain Service ASGI Error
```bash
# Ensure no running process on port 8000
lsof -i :8000
kill -9 <PID>
```

---

## 📝 Important Notes

1. **No MongoDB**: All references removed. MySQL only.
2. **Hashing**: Deterministic SHA-256. Changes on ANY update.
3. **Audit Logs**: Every modification recorded.
4. **Blockchain**: Immutable append-only ledger.
5. **Authentication**: JWT tokens valid for 24 hours.
6. **Password Security**: bcryptjs with 10 rounds.

---

## 🔄 Complete Data Flow

```
1. User logs in → JWT token issued
2. Patient creates consultation → Stored in MySQL
3. Consultation submitted → ML service processes
4. ML results → Stored in database + consultation updated
5. Hash generated → From symptoms + diagnosis + medicines + ML
6. Blockchain record → Created with hash
7. Doctor edits → Updates consultation
8. New hash → Generated (different from original)
9. New blockchain record → Created (immutable history)
10. Audit log → Entry recorded for ALL changes
11. Verification → Any user can validate blockchain integrity
```

---

## 🎓 Example Login Session

```bash
# Terminal 1: Start frontend
npm run dev

# Browser: http://localhost:3000
# Click "I am a Patient"
# Email: patient@example.com
# Password: patient123
# Login successful → Redirected to patient dashboard
```

---

## 📞 Support

For issues, verify:
1. MySQL running on port 1396
2. All three services started in separate terminals
3. Database exists: `USE aarogyaguard;`
4. Tables exist: `SHOW TABLES;`
5. No old MongoDB code remains
6. Environment variables correct

---

**Last Verified:** January 16, 2026  
**Project Status:** ✅ Production Ready
