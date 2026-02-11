# AarogyaGuard: ML & Blockchain Integration Architecture

**Version:** 1.0  
**Date:** January 28, 2026  
**Status:** Complete Reference Guide

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [End-to-End Flow (UI)](#end-to-end-flow-ui)
4. [Postman Flow](#postman-flow)
5. [Sample API Interactions](#sample-api-interactions)
6. [Why ML & Blockchain](#why-ml--blockchain)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
│  ┌──────────────────────┐                                                   │
│  │   Next.js Frontend   │  (Patient/Doctor Dashboards)                       │
│  │   - React Components │  Port: 3000                                        │
│  │   - NextAuth         │                                                    │
│  └──────────┬───────────┘                                                    │
└─────────────┼──────────────────────────────────────────────────────────────┘
              │ (HTTP/HTTPS)
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BACKEND API LAYER (Node.js)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Next.js API Routes (App Router)                                     │   │
│  │ ├─ POST /api/auth/login                                            │   │
│  │ ├─ POST /api/auth/register                                         │   │
│  │ ├─ POST /api/consultation/analyze  ◄── Main Consultation Endpoint  │   │
│  │ ├─ GET  /api/consultation/[id]                                     │   │
│  │ ├─ PUT  /api/consultation/[id]                                     │   │
│  │ └─ GET  /api/patient/[id]/consultations                            │   │
│  │                                                                      │   │
│  │ Core Logic:                                                         │   │
│  │ - Validate requests                                                │   │
│  │ - Call ML Service for analysis                                     │   │
│  │ - Store results in MySQL                                           │   │
│  │ - Generate SHA-256 hash                                            │   │
│  │ - Call Blockchain Service to store hash                            │   │
│  │ - Return comprehensive response                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Prisma ORM + MySQL Database (Port 1396)                             │  │
│  │  ├─ Users Table                                                      │  │
│  │  ├─ Consultations Table                                              │  │
│  │  ├─ Probable_Conditions Table                                        │  │
│  │  ├─ Suggested_Medicines Table                                        │  │
│  │  ├─ DDI_Alerts Table                                                 │  │
│  │  ├─ Blockchain_Records Table                                         │  │
│  │  ├─ ML_Inference_Logs Table                                          │  │
│  │  └─ Audit_Logs Table                                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
       │                              │                         │
       │                              │                         │
       ▼ (HTTP Port 8002)             ▼ (HTTP Port 8000)       ▼
   
┌──────────────────────────┐  ┌──────────────────────────┐
│   ML SERVICE (FastAPI)   │  │ BLOCKCHAIN SERVICE       │
│   Port: 8002             │  │ (FastAPI)                │
│                          │  │ Port: 8000               │
│ ┌──────────────────────┐ │  │ ┌────────────────────┐  │
│ │ Inference Engine     │ │  │ │ Blockchain Network │  │
│ ├─ TfidfVectorizer    │ │  │ │ (Custom Impl)      │  │
│ ├─ RandomForest       │ │  │ │                    │  │
│ ├─ GradientBoosting   │ │  │ │ Features:          │  │
│ ├─ LogisticRegression │ │  │ ├─ Immutable Ledger │  │
│ └──────────────────────┘ │  │ ├─ Hash Verification
│                          │  │ ├─ Block Chaining   │  │
│ ┌──────────────────────┐ │  │ ├─ Timestamp        │  │
│ │ POST /infer          │ │  │ ├─ Patient Privacy  │  │
│ │ GET  /health         │ │  │ │   (Hashed)        │  │
│ │ GET  /metrics        │ │  │ │                    │  │
│ └──────────────────────┘ │  │ └────────────────────┘  │
│                          │  │                        │
│ Returns:                 │  │ POST /blockchain/add    │
│ ├─ Conditions           │  │ GET /blockchain/patient │
│ ├─ Risk Level           │  │ GET /blockchain/validate
│ ├─ Medicines            │  │ GET /blockchain/chain   │
│ ├─ DDI Alerts           │  │                        │
│ ├─ Red Flags            │  └────────────────────────┘
│ └─ Processing Time      │
└──────────────────────────┘
```

---

## System Components

### 1. **Frontend (Next.js - Port 3000)**
- **Role:** User interface for patients, doctors, and admins
- **Authentication:** NextAuth.js with JWT tokens
- **Dashboards:** 
  - Patient: Create consultations, view results, verify blockchain
  - Doctor: Review consultations, add diagnosis
  - Admin: System management

### 2. **Backend API (Next.js API Routes)**
- **Role:** Orchestration layer - coordinates all services
- **Key Responsibilities:**
  - Request validation and authentication
  - Forward consultation data to ML service
  - Store results in MySQL database
  - Generate SHA-256 hashes
  - Call blockchain service to record hashes
  - Return aggregated responses to client
  - Log all operations in audit table

### 3. **Database (MySQL - Port 1396)**
- **Purpose:** Persistent storage for all consultation data
- **Key Tables:**
  - `users` - Patient/Doctor/Admin profiles
  - `consultations` - Main consultation records
  - `probable_conditions` - ML predictions
  - `suggested_medicines` - ML recommendations
  - `ddi_alerts` - Drug-drug interactions
  - `blockchain_records` - Links to blockchain entries
  - `ml_inference_logs` - ML processing history
  - `audit_logs` - All modifications (immutable trail)

### 4. **ML Service (FastAPI - Port 8002)**
- **Purpose:** Analyze symptoms and provide medical insights
- **Algorithms Used:**
  - **TfidfVectorizer** - Convert text symptoms to numerical features
  - **RandomForest** - Symptom → Disease classification
  - **GradientBoosting** - Risk level prediction
  - **LogisticRegression** - Medicine recommendation
- **Fallback:** Rule-based knowledge base if models unavailable
- **Input:** Free-text symptoms, current medications
- **Output:** Conditions, risk level, medicines, DDI alerts, red flags

### 5. **Blockchain Service (FastAPI - Port 8000)**
- **Purpose:** Create immutable, tamper-proof audit trail
- **Type:** Custom blockchain implementation (not public chain)
- **Features:**
  - Block chaining (each block references previous)
  - SHA-256 hashes for integrity
  - Timestamp for temporal proof
  - Patient hash (privacy: not raw ID)
  - Consultation ID linking
  - Consensus validation
- **Guarantees:** 
  - Records cannot be deleted
  - Records cannot be modified
  - Full history is traceable
  - Integrity verification available

---

## End-to-End Flow (UI)

### Scenario: Patient Creates a Consultation

```
STEP 1: Patient Login
├─ Patient opens browser → localhost:3000
├─ Clicks "I am a Patient"
├─ Enters: patient@example.com / patient123
├─ Backend verifies in MySQL → NextAuth issues JWT token
└─ Redirected to Patient Dashboard

STEP 2: Patient Initiates Consultation
├─ Patient clicks "New Consultation"
├─ Form displayed:
│  ├─ Symptoms textarea (e.g., "fever, cough, body ache")
│  ├─ Current medications (optional)
│  └─ Submit button
└─ Patient enters symptoms and clicks Submit

STEP 3: Frontend Sends Request to Backend
├─ POST /api/consultation/analyze
├─ Payload:
│  {
│    "symptoms_text": "fever, cough, body ache",
│    "current_medications": ["aspirin"],
│    "patient_id": "12345",
│    "language": "english"
│  }
├─ Header: Authorization: Bearer <JWT_TOKEN>
└─ Request reaches Backend API Route

STEP 4: Backend Validates & Prepares Data
├─ Verify JWT token valid
├─ Verify patient exists in MySQL
├─ Extract symptoms text
├─ Create consultation record (status: PENDING)
└─ Store in consultations table

STEP 5: Backend Calls ML Service
├─ Forward symptoms to: POST http://localhost:8002/infer
├─ Request:
│  {
│    "symptoms_text": "fever, cough, body ache",
│    "current_medications": ["aspirin"],
│    "language": "english"
│  }
├─ ML Service processes:
│  ├─ Vectorize symptoms with TfidfVectorizer
│  ├─ Run RandomForest → predict conditions
│  ├─ Run GradientBoosting → determine risk level
│  ├─ Check for red flags
│  ├─ Run LogisticRegression → recommend medicines
│  └─ Check for drug-drug interactions (DDI)
└─ ML Service returns:
   {
     "conditions": [
       {"condition": "Influenza", "confidence": 0.85, "severity": "HIGH"},
       {"condition": "COVID-19", "confidence": 0.72, "severity": "HIGH"}
     ],
     "risk_level": "HIGH",
     "has_red_flags": true,
     "red_flags": ["High fever", "Persistent cough"],
     "medicines": [
       {"id": "m1", "name": "Oseltamivir", "dose": "75mg", "frequency": "2x daily"},
       {"id": "m2", "name": "Paracetamol", "dose": "500mg", "frequency": "3x daily"}
     ],
     "ddi_alerts": [
       {"drug1": "Aspirin", "drug2": "Paracetamol", "severity": "LOW"}
     ],
     "processing_time": 0.234
   }

STEP 6: Backend Stores ML Results in MySQL
├─ Insert into probable_conditions:
│  ├─ consultation_id: unique_id
│  ├─ condition: "Influenza"
│  ├─ confidence: 0.85
│  └─ severity: "HIGH"
├─ Insert into suggested_medicines:
│  ├─ consultation_id: unique_id
│  ├─ medicine_name: "Oseltamivir"
│  ├─ dose: "75mg"
│  └─ frequency: "2x daily"
├─ Insert into ddi_alerts:
│  ├─ consultation_id: unique_id
│  ├─ drug1: "Aspirin"
│  ├─ drug2: "Paracetamol"
│  └─ severity: "LOW"
└─ Update consultations table:
   ├─ riskLevel: "HIGH"
   ├─ hasRedFlags: true
   ├─ redFlagWarnings: ["High fever", "Persistent cough"]
   └─ status: "ANALYZED"

STEP 7: Backend Generates Hash & Calls Blockchain
├─ Create hash input from:
│  ├─ Symptoms: "fever, cough, body ache"
│  ├─ Conditions: "Influenza, COVID-19"
│  ├─ Medicines: "Oseltamivir, Paracetamol"
│  └─ ML Output: all analysis results
├─ Generate SHA-256 hash (deterministic)
│  hash = SHA256(symptoms + conditions + medicines + ml_output)
│  Example: "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9..."
├─ Call Blockchain Service:
│  POST http://localhost:8000/blockchain/add
│  {
│    "consultation_id": "unique_id",
│    "patient_hash": "sha256_hash_of_patient_id",
│    "consultation_summary": "fever, cough, body ache → Influenza",
│    "hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9"
│  }
├─ Blockchain Service:
│  ├─ Validates request
│  ├─ Creates new block:
│  │  {
│  │    "index": 42,
│  │    "timestamp": "2026-01-28T10:30:00Z",
│  │    "patient_hash": "sha256_hash",
│  │    "consultation_id": "unique_id",
│  │    "consultation_summary": "...",
│  │    "hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9",
│  │    "previous_hash": "z9k2m5n8p1q4r7s0t3u6v9w2x5y8z1a4"
│  │  }
│  ├─ Appends to blockchain (immutable)
│  └─ Returns blockchain transaction ID
└─ Store blockchain record in MySQL:
   ├─ consultation_id: unique_id
   ├─ blockchain_hash: "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9"
   ├─ blockchain_index: 42
   └─ verified: true

STEP 8: Backend Logs Audit Entry
├─ Insert into audit_logs:
│  ├─ action: "CONSULTATION_CREATED"
│  ├─ user_id: patient_id
│  ├─ consultation_id: unique_id
│  ├─ timestamp: current time
│  ├─ changes: { symptoms, conditions, medicines, hash }
│  └─ ip_address: client IP
└─ Create ml_inference_log:
   ├─ consultation_id: unique_id
   ├─ model_type: "ENSEMBLE"
   ├─ processing_time: 0.234
   └─ results: full ML output

STEP 9: Backend Returns Response to Frontend
├─ HTTP 200 OK
└─ Response body:
   {
     "success": true,
     "message": "Consultation created and analyzed",
     "consultation": {
       "id": "unique_id",
       "patient_id": "12345",
       "status": "ANALYZED",
       "symptoms": "fever, cough, body ache",
       "riskLevel": "HIGH",
       "hasRedFlags": true
     },
     "ml_analysis": {
       "conditions": [...],
       "risk_level": "HIGH",
       "medicines": [...],
       "ddi_alerts": [...]
     },
     "blockchain": {
       "recorded": true,
       "hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9",
       "block_index": 42,
       "timestamp": "2026-01-28T10:30:00Z"
     },
     "processing_time": 0.234
   }

STEP 10: Frontend Displays Results
├─ Show consultation analysis:
│  ├─ Top conditions: Influenza (85%), COVID-19 (72%)
│  ├─ Risk level: HIGH (visual warning)
│  ├─ Red flags: "High fever", "Persistent cough"
│  ├─ Recommended medicines
│  ├─ Drug interaction warnings
│  └─ "Awaiting Doctor Review" status
├─ Show blockchain status:
│  ├─ ✓ Recorded on blockchain
│  ├─ Hash: a7f3e9d2c8b...
│  └─ Verify button (to check integrity)
└─ Patient waits for doctor to review

STEP 11: Doctor Reviews (Later)
├─ Doctor logs in → views Patient Consultations
├─ Doctor clicks consultation
├─ Can see:
│  ├─ Patient symptoms
│  ├─ ML analysis results
│  ├─ Blockchain hash and status
│  └─ Form to add final diagnosis
├─ Doctor adds:
│  ├─ Final diagnosis
│  ├─ Approved medicines
│  └─ Additional notes
├─ Doctor clicks Save
└─ Backend:
   ├─ Updates consultation (status: REVIEWED/COMPLETED)
   ├─ Generates NEW hash (different from original)
   ├─ Stores NEW blockchain record
   ├─ Creates audit log entry
   └─ Notification sent to patient

STEP 12: Patient Verifies Blockchain (Optional)
├─ Patient clicks "Verify Blockchain"
├─ Backend rehashes consultation data:
│  hash_computed = SHA256(current symptoms + diagnosis + medicines)
├─ Retrieves blockchain record hash
├─ Compares: hash_computed == blockchain_hash
├─ Returns:
│  {
│    "verified": true,
│    "message": "Data integrity confirmed",
│    "blockchain_hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9",
│    "computed_hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9",
│    "modified": false
│  }
└─ Patient sees: ✓ No unauthorized changes
```

---

## Postman Flow

### Using Postman Instead of Browser UI

#### **Pre-requisites**
1. All three services running:
   - Frontend: `npm run dev` (Port 3000)
   - ML Service: `python ml-service/app.py` (Port 8002)
   - Blockchain: `python blockchain-service/main.py` (Port 8000)

2. Test user exists:
   ```
   Email: patient@example.com
   Password: patient123
   Role: PATIENT
   ```

#### **Step 1: Get JWT Token via Login**

```
POST http://localhost:3000/api/auth/login

Headers:
  Content-Type: application/json

Body:
{
  "email": "patient@example.com",
  "password": "patient123"
}

Response (200 OK):
{
  "success": true,
  "user": {
    "id": 1,
    "email": "patient@example.com",
    "name": "Test Patient",
    "role": "PATIENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

→ Save token for next request
```

#### **Step 2: Submit Consultation for Analysis**

```
POST http://localhost:3000/api/consultation/analyze

Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body:
{
  "symptoms_text": "fever, cough, body ache, sore throat",
  "current_medications": ["aspirin", "vitamin C"],
  "language": "english"
}

Response (200 OK):
{
  "success": true,
  "message": "Consultation created and analyzed",
  "consultation": {
    "id": 5,
    "patient_id": 1,
    "status": "ANALYZED",
    "symptoms": "fever, cough, body ache, sore throat",
    "riskLevel": "HIGH",
    "hasRedFlags": true,
    "redFlagWarnings": ["High fever", "Persistent cough"],
    "createdAt": "2026-01-28T10:30:00Z"
  },
  "ml_analysis": {
    "conditions": [
      {
        "condition": "Influenza",
        "confidence": 0.87,
        "severity": "HIGH"
      },
      {
        "condition": "Common Cold",
        "confidence": 0.42,
        "severity": "LOW"
      }
    ],
    "risk_level": "HIGH",
    "has_red_flags": true,
    "red_flags": ["High fever (>39°C)", "Persistent cough", "Body ache"],
    "medicines": [
      {
        "id": "m001",
        "name": "Oseltamivir",
        "dose": "75mg",
        "frequency": "Twice daily for 5 days"
      },
      {
        "id": "m002",
        "name": "Paracetamol",
        "dose": "500mg",
        "frequency": "Three times daily"
      }
    ],
    "ddi_alerts": [
      {
        "drug1": "Aspirin",
        "drug2": "Paracetamol",
        "severity": "LOW",
        "note": "Avoid simultaneous use"
      }
    ],
    "processing_time": 0.245
  },
  "blockchain": {
    "recorded": true,
    "hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9d2e1f4a5b6c7d8e9f0a1b2c3d4e5",
    "block_index": 42,
    "timestamp": "2026-01-28T10:30:15Z",
    "previous_hash": "z9k2m5n8p1q4r7s0t3u6v9w2x5y8z1a4b5c6d7e8f9g0h1i2j3k4l5m6n7"
  }
}

→ Note: consultation.id = 5 (use for next steps)
```

#### **Step 3: Retrieve Full Consultation Details**

```
GET http://localhost:3000/api/consultation/5

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200 OK):
{
  "consultation": {
    "id": 5,
    "patient_id": 1,
    "doctor_id": null,
    "symptoms": "fever, cough, body ache, sore throat",
    "riskLevel": "HIGH",
    "hasRedFlags": true,
    "redFlagWarnings": ["High fever", "Persistent cough"],
    "status": "ANALYZED",
    "doctorNotes": null,
    "finalDiagnosis": null,
    "finalMedicines": null,
    "createdAt": "2026-01-28T10:30:00Z",
    "updatedAt": "2026-01-28T10:30:15Z"
  },
  "probable_conditions": [
    {
      "id": 1,
      "consultation_id": 5,
      "condition": "Influenza",
      "confidence": 0.87,
      "severity": "HIGH"
    },
    {
      "id": 2,
      "consultation_id": 5,
      "condition": "Common Cold",
      "confidence": 0.42,
      "severity": "LOW"
    }
  ],
  "suggested_medicines": [
    {
      "id": 1,
      "consultation_id": 5,
      "medicine_name": "Oseltamivir",
      "dose": "75mg",
      "frequency": "Twice daily"
    },
    {
      "id": 2,
      "consultation_id": 5,
      "medicine_name": "Paracetamol",
      "dose": "500mg",
      "frequency": "Three times daily"
    }
  ],
  "ddi_alerts": [
    {
      "id": 1,
      "consultation_id": 5,
      "drug1": "Aspirin",
      "drug2": "Paracetamol",
      "severity": "LOW"
    }
  ],
  "blockchain_record": {
    "hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9d2e1f4a5b6c7d8e9f0a1b2c3d4e5",
    "block_index": 42,
    "verified": true
  }
}
```

#### **Step 4: Verify Blockchain Integrity (Optional)**

```
POST http://localhost:3000/api/consultation/5/verify-blockchain

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200 OK):
{
  "verified": true,
  "message": "Consultation data integrity confirmed",
  "blockchain_hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9d2e1f4a5b6c7d8e9f0a1b2c3d4e5",
  "computed_hash": "a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9d2e1f4a5b6c7d8e9f0a1b2c3d4e5",
  "match": true,
  "modified": false,
  "timestamp": "2026-01-28T10:31:00Z"
}
```

#### **Step 5: Doctor Updates Consultation**

```
PUT http://localhost:3000/api/consultation/5

Headers:
  Content-Type: application/json
  Authorization: Bearer <DOCTOR_JWT_TOKEN>

Body:
{
  "finalDiagnosis": "Confirmed Influenza (H1N1)",
  "finalMedicines": [
    {
      "name": "Oseltamivir",
      "dose": "75mg",
      "frequency": "Twice daily for 5 days",
      "approved": true
    },
    {
      "name": "Ibuprofen",
      "dose": "400mg",
      "frequency": "Three times daily",
      "approved": true
    }
  ],
  "doctorNotes": "Patient has typical flu symptoms. Recommended rest and fluids."
}

Response (200 OK):
{
  "success": true,
  "message": "Consultation updated successfully",
  "consultation": {
    "id": 5,
    "status": "COMPLETED",
    "finalDiagnosis": "Confirmed Influenza (H1N1)",
    "finalMedicines": [...],
    "doctorNotes": "Patient has typical flu symptoms..."
  },
  "blockchain": {
    "recorded": true,
    "hash": "b8g4h1i9j6k3l0m7n4o1p8q5r2s9t6u3v0w7x4y1z8a5b2c9d6e3f0g7h4i1j8",
    "block_index": 43,
    "timestamp": "2026-01-28T11:15:30Z",
    "note": "NEW hash generated - doctor edit creates immutable record"
  }
}

→ Note: Hash changed because data was modified
```

#### **Step 6: Verify Updated Consultation**

```
POST http://localhost:3000/api/consultation/5/verify-blockchain

Response (200 OK):
{
  "verified": true,
  "message": "Consultation data integrity confirmed",
  "blockchain_hash": "b8g4h1i9j6k3l0m7n4o1p8q5r2s9t6u3v0w7x4y1z8a5b2c9d6e3f0g7h4i1j8",
  "computed_hash": "b8g4h1i9j6k3l0m7n4o1p8q5r2s9t6u3v0w7x4y1z8a5b2c9d6e3f0g7h4i1j8",
  "match": true,
  "modification_history": [
    {
      "index": 42,
      "timestamp": "2026-01-28T10:30:15Z",
      "action": "CONSULTATION_CREATED"
    },
    {
      "index": 43,
      "timestamp": "2026-01-28T11:15:30Z",
      "action": "CONSULTATION_COMPLETED",
      "modified_by": "doctor@example.com"
    }
  ]
}
```

---

## Sample API Interactions

### Interaction 1: Complete Consultation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     REQUEST SEQUENCE                             │
└─────────────────────────────────────────────────────────────────┘

REQUEST 1: Login
──────────────────────────────────────────────────────────────────
POST /api/auth/login

{
  "email": "patient@example.com",
  "password": "patient123"
}

RESPONSE:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJwYXRpZW50QGV4YW1wbGUuY29tIiwicm9sZSI6IlBBVElFTlQifQ...",
  "user": {
    "id": 1,
    "email": "patient@example.com",
    "role": "PATIENT"
  }
}


REQUEST 2: Create Consultation (calls ML service internally)
──────────────────────────────────────────────────────────────────
POST /api/consultation/analyze
Authorization: Bearer <TOKEN>

{
  "symptoms_text": "fever for 3 days, severe cough, body ache, difficulty breathing",
  "current_medications": ["aspirin 500mg"],
  "language": "english"
}

BACKEND FLOW:
├─ Receives request
├─ Validates JWT token → ✓ Valid
├─ Verifies patient exists → ✓ Patient ID: 1
├─ Creates consultation record in MySQL (status: PENDING)
├─ Calls ML Service:
│  POST http://localhost:8002/infer
│  {
│    "symptoms_text": "fever for 3 days, severe cough, body ache, difficulty breathing",
│    "current_medications": ["aspirin 500mg"],
│    "language": "english"
│  }
│
├─ ML Service Response (0.156 seconds):
│  {
│    "conditions": [
│      {
│        "condition": "Pneumonia",
│        "confidence": 0.92,
│        "severity": "CRITICAL"
│      },
│      {
│        "condition": "COVID-19",
│        "confidence": 0.76,
│        "severity": "HIGH"
│      },
│      {
│        "condition": "Acute Bronchitis",
│        "confidence": 0.58,
│        "severity": "MEDIUM"
│      }
│    ],
│    "risk_level": "CRITICAL",
│    "has_red_flags": true,
│    "red_flags": [
│      "High fever (>39°C)",
│      "Difficulty breathing",
│      "Severe cough",
│      "Hypoxemia risk"
│    ],
│    "medicines": [
│      {
│        "id": "m_ampicillin",
│        "name": "Ampicillin",
│        "dose": "500mg",
│        "frequency": "Four times daily"
│      },
│      {
│        "id": "m_oxygen",
│        "name": "Oxygen Therapy",
│        "dose": "Variable",
│        "frequency": "Continuous monitoring"
│      }
│    ],
│    "ddi_alerts": [
│      {
│        "drug1": "Aspirin",
│        "drug2": "Ampicillin",
│        "severity": "MEDIUM",
│        "note": "Monitor for GI bleeding"
│      }
│    ],
│    "processing_time": 0.156
│  }
│
├─ Stores results in MySQL:
│  ├─ consultations table (update status → ANALYZED)
│  ├─ probable_conditions table (3 records)
│  ├─ suggested_medicines table (2 records)
│  └─ ddi_alerts table (1 record)
│
├─ Generates hash:
│  input = "fever for 3 days, severe cough, body ache, difficulty breathing" +
│           "Pneumonia|COVID-19|Acute Bronchitis" +
│           "Ampicillin|Oxygen Therapy" +
│           "<ML_OUTPUT_JSON>"
│  hash = SHA256(input)
│  hash = "f7a2e8d3c1b4f6a9e2d5c8b1f4a7e0d3c6f9a2e5b8d1c4f7a0e3d6c9f2a5b"
│
├─ Calls Blockchain Service:
│  POST http://localhost:8000/blockchain/add
│  {
│    "consultation_id": "5",
│    "patient_hash": "sha256_hash_of_patient_id_1",
│    "consultation_summary": "fever, cough, breathing difficulty → Pneumonia (HIGH RISK)",
│    "hash": "f7a2e8d3c1b4f6a9e2d5c8b1f4a7e0d3c6f9a2e5b8d1c4f7a0e3d6c9f2a5b"
│  }
│
├─ Blockchain Service Response:
│  {
│    "block": {
│      "index": 5,
│      "timestamp": "2026-01-28T10:30:00Z",
│      "patient_hash": "sha256_hash",
│      "consultation_id": "5",
│      "consultation_summary": "fever, cough, breathing difficulty → Pneumonia",
│      "hash": "f7a2e8d3c1b4f6a9e2d5c8b1f4a7e0d3c6f9a2e5b8d1c4f7a0e3d6c9f2a5b",
│      "previous_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f"
│    },
│    "success": true
│  }
│
├─ Stores blockchain record in MySQL:
│  ├─ consultation_id: 5
│  ├─ blockchain_hash: "f7a2e8d3c1b4f6a9..."
│  ├─ blockchain_index: 5
│  ├─ verified: true
│  └─ timestamp: "2026-01-28T10:30:00Z"
│
├─ Creates audit log entry:
│  ├─ action: "CONSULTATION_CREATED"
│  ├─ user_id: 1
│  ├─ consultation_id: 5
│  ├─ changes: {symptoms, conditions, medicines, hash}
│  └─ timestamp: "2026-01-28T10:30:00Z"
│
└─ Returns response to client


RESPONSE:
{
  "success": true,
  "message": "Consultation created and analyzed successfully",
  "consultation": {
    "id": 5,
    "patient_id": 1,
    "status": "ANALYZED",
    "symptoms": "fever for 3 days, severe cough, body ache, difficulty breathing",
    "riskLevel": "CRITICAL",
    "hasRedFlags": true,
    "redFlagWarnings": [
      "High fever (>39°C)",
      "Difficulty breathing",
      "Severe cough",
      "Hypoxemia risk"
    ],
    "createdAt": "2026-01-28T10:30:00Z",
    "updatedAt": "2026-01-28T10:30:02Z"
  },
  "ml_analysis": {
    "conditions": [
      {
        "condition": "Pneumonia",
        "confidence": 0.92,
        "severity": "CRITICAL"
      },
      {
        "condition": "COVID-19",
        "confidence": 0.76,
        "severity": "HIGH"
      },
      {
        "condition": "Acute Bronchitis",
        "confidence": 0.58,
        "severity": "MEDIUM"
      }
    ],
    "risk_level": "CRITICAL",
    "has_red_flags": true,
    "red_flags": ["High fever (>39°C)", "Difficulty breathing", "Severe cough"],
    "medicines": [
      {
        "id": "m_ampicillin",
        "name": "Ampicillin",
        "dose": "500mg",
        "frequency": "Four times daily"
      },
      {
        "id": "m_oxygen",
        "name": "Oxygen Therapy",
        "dose": "Variable",
        "frequency": "Continuous monitoring"
      }
    ],
    "ddi_alerts": [
      {
        "drug1": "Aspirin",
        "drug2": "Ampicillin",
        "severity": "MEDIUM",
        "note": "Monitor for GI bleeding"
      }
    ],
    "processing_time": 0.156
  },
  "blockchain": {
    "recorded": true,
    "hash": "f7a2e8d3c1b4f6a9e2d5c8b1f4a7e0d3c6f9a2e5b8d1c4f7a0e3d6c9f2a5b",
    "block_index": 5,
    "timestamp": "2026-01-28T10:30:00Z",
    "previous_hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f",
    "verified": true
  },
  "total_processing_time": 0.243
}
```

### Interaction 2: Doctor Reviews & Updates

```
REQUEST: Doctor Login
─────────────────────────────────────────────────────────────────
POST /api/auth/login

{
  "email": "doctor@example.com",
  "password": "doctor123"
}

RESPONSE:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJkb2N0b3JAZXhhbXBsZS5jb20iLCJyb2xlIjoiRE9DVE9SIn0...",
  "user": {
    "id": 2,
    "email": "doctor@example.com",
    "role": "DOCTOR",
    "specialization": "Internal Medicine"
  }
}


REQUEST: Doctor Updates Consultation
─────────────────────────────────────────────────────────────────
PUT /api/consultation/5
Authorization: Bearer <DOCTOR_TOKEN>

{
  "doctorNotes": "Highly suspicious for community-acquired pneumonia. Patient requires hospitalization for respiratory support.",
  "finalDiagnosis": "Community-Acquired Pneumonia (CAP) - Moderate severity, likely bacterial origin",
  "finalMedicines": [
    {
      "name": "Azithromycin",
      "dose": "500mg",
      "frequency": "Once daily for 5 days",
      "approved": true
    },
    {
      "name": "Ceftriaxone",
      "dose": "1g IV",
      "frequency": "Every 12 hours for 7 days",
      "approved": true
    }
  ]
}

BACKEND FLOW:
├─ Verifies JWT token → ✓ Doctor ID: 2
├─ Verifies doctor can access consultation → ✓ Allowed
├─ Updates consultation in MySQL:
│  ├─ doctorNotes: "Highly suspicious for..."
│  ├─ finalDiagnosis: "Community-Acquired Pneumonia..."
│  ├─ finalMedicines: [...Azithromycin, Ceftriaxone...]
│  └─ status: COMPLETED
│
├─ Generates NEW hash (data changed):
│  input = "fever for 3 days, severe cough, body ache, difficulty breathing" +
│           "Community-Acquired Pneumonia (CAP)" +
│           "Azithromycin|Ceftriaxone" +
│           "Highly suspicious for community-acquired pneumonia..."
│  hash = SHA256(input)
│  hash = "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4"
│           ↑ DIFFERENT from original hash
│
├─ Stores new blockchain record:
│  POST http://localhost:8000/blockchain/add
│  {
│    "consultation_id": "5",
│    "patient_hash": "sha256_hash_of_patient_id",
│    "consultation_summary": "CAP - Bacterial, requires hospitalization",
│    "hash": "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4"
│  }
│
├─ Blockchain Response:
│  {
│    "block": {
│      "index": 6,
│      "timestamp": "2026-01-28T11:15:30Z",
│      "hash": "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4",
│      "previous_hash": "f7a2e8d3c1b4f6a9e2d5c8b1f4a7e0d3c6f9a2e5b8d1c4f7a0e3d6c9f2a5b"
│                       ↑ LINKS to previous block (immutable chain)
│    },
│    "success": true
│  }
│
├─ Creates audit log entry:
│  ├─ action: "CONSULTATION_UPDATED"
│  ├─ user_id: 2 (doctor)
│  ├─ consultation_id: 5
│  ├─ changes: {finalDiagnosis, finalMedicines, doctorNotes, new_hash}
│  └─ timestamp: "2026-01-28T11:15:30Z"
│
└─ Returns response

RESPONSE:
{
  "success": true,
  "message": "Consultation updated and blockchain record created",
  "consultation": {
    "id": 5,
    "status": "COMPLETED",
    "doctorNotes": "Highly suspicious for community-acquired pneumonia...",
    "finalDiagnosis": "Community-Acquired Pneumonia (CAP) - Moderate severity",
    "finalMedicines": [
      {
        "name": "Azithromycin",
        "dose": "500mg",
        "frequency": "Once daily for 5 days"
      },
      {
        "name": "Ceftriaxone",
        "dose": "1g IV",
        "frequency": "Every 12 hours for 7 days"
      }
    ],
    "updatedAt": "2026-01-28T11:15:30Z"
  },
  "blockchain": {
    "recorded": true,
    "old_hash": "f7a2e8d3c1b4f6a9e2d5c8b1f4a7e0d3c6f9a2e5b8d1c4f7a0e3d6c9f2a5b",
    "new_hash": "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4",
    "block_index": 6,
    "timestamp": "2026-01-28T11:15:30Z",
    "note": "Immutable history preserved - both versions on blockchain"
  }
}

KEY POINT: 
Both consultations (original + updated) exist on blockchain
Patient can trace complete modification history
No data can be deleted or hidden
```

### Interaction 3: Blockchain Verification

```
REQUEST: Patient Verifies Blockchain
─────────────────────────────────────────────────────────────────
POST /api/consultation/5/verify-blockchain
Authorization: Bearer <PATIENT_TOKEN>

BACKEND FLOW:
├─ Retrieves consultation from MySQL:
│  ├─ symptoms: "fever for 3 days, severe cough, body ache, difficulty breathing"
│  ├─ finalDiagnosis: "Community-Acquired Pneumonia (CAP)..."
│  └─ finalMedicines: [Azithromycin, Ceftriaxone]
│
├─ Retrieves blockchain record:
│  ├─ blockchain_hash: "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4"
│  └─ blockchain_index: 6
│
├─ Recomputes hash from current data:
│  input = symptoms + finalDiagnosis + finalMedicines + doctorNotes
│  computed_hash = SHA256(input)
│  computed_hash = "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4"
│
├─ Compares hashes:
│  blockchain_hash == computed_hash ✓
│  Result: Data integrity verified, no unauthorized changes
│
└─ Retrieves modification history from blockchain

RESPONSE:
{
  "verified": true,
  "message": "Consultation data integrity confirmed - no unauthorized changes",
  "current_hash": {
    "hash": "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4",
    "block_index": 6,
    "timestamp": "2026-01-28T11:15:30Z"
  },
  "computed_hash": "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4",
  "match": true,
  "data_modified": false,
  "modification_history": [
    {
      "block_index": 5,
      "timestamp": "2026-01-28T10:30:00Z",
      "hash": "f7a2e8d3c1b4f6a9e2d5c8b1f4a7e0d3c6f9a2e5b8d1c4f7a0e3d6c9f2a5b",
      "action": "CONSULTATION_CREATED",
      "summary": "fever, cough, difficulty breathing → ML Analysis complete"
    },
    {
      "block_index": 6,
      "timestamp": "2026-01-28T11:15:30Z",
      "hash": "e8c4f1a6d2b9e5c8f1a4d7g0h3k6m9n2p5q8s1u4v7w0x3y6z9a2b5c8d1e4",
      "action": "CONSULTATION_UPDATED",
      "modified_by": "doctor@example.com",
      "summary": "Doctor added final diagnosis and medicines"
    }
  ],
  "blockchain_status": "VALID",
  "chain_integrity": "VERIFIED",
  "tampering_detected": false
}
```

---

## Why ML & Blockchain

### Why ML (Machine Learning) is Used

#### **Problem It Solves:**
- **Manual diagnosis is slow & error-prone** → ML can analyze symptoms instantly
- **Symptoms are complex** → ML detects patterns humans might miss
- **Drug interactions are numerous** → ML checks all possible DDI combinations
- **Risk stratification needed** → ML categorizes severity (LOW/MEDIUM/HIGH/CRITICAL)
- **Red flags must be caught** → ML alerts doctors to emergency conditions

#### **Specific Use Cases in AarogyaGuard:**

| ML Task | Algorithm | Input | Output | Benefit |
|---------|-----------|-------|--------|---------|
| **Symptom → Disease** | RandomForest | Free-text symptoms | Top 5 conditions + confidence | Fast differential diagnosis |
| **Risk Assessment** | GradientBoosting | Symptom severity + conditions | Risk level (CRITICAL/HIGH/MEDIUM/LOW) | Triage patients appropriately |
| **Drug Recommendation** | LogisticRegression | Predicted conditions | Suitable medicines + dosage | Personalized treatment suggestions |
| **Drug Interaction Check** | Rule-based + ML | Current meds + new meds | DDI alerts + severity | Prevent dangerous combinations |
| **Red Flag Detection** | Feature engineering + threshold | Symptoms + vital signs | Emergency warnings | Alert doctors to ICU cases |

#### **Example - Why ML Matters:**

```
WITHOUT ML:
├─ Patient: "I have fever, cough, and sore throat"
├─ Doctor: Must manually look up symptoms
├─ Takes 10+ minutes to consider differential diagnosis
└─ Risk of missing critical conditions

WITH ML:
├─ Patient: "I have fever, cough, and sore throat"
├─ Symptoms vectorized with TfidfVectorizer
├─ RandomForest instantly predicts:
│  ├─ Influenza (confidence: 87%)
│  ├─ Common Cold (confidence: 62%)
│  └─ COVID-19 (confidence: 45%)
├─ GradientBoosting calculates Risk: MEDIUM
├─ LogisticRegression recommends:
│  ├─ Oseltamivir (antiviral)
│  └─ Paracetamol (fever)
├─ Checks for DDI with current medications
├─ Detects red flags (if any)
└─ Result delivered in 0.15 seconds
```

#### **Business Value:**
- ✅ Faster diagnosis → Better patient outcomes
- ✅ Reduces doctor workload → More patients served
- ✅ Prevents dangerous drug combinations → Fewer adverse events
- ✅ Catches emergencies early → Lower mortality
- ✅ Supports decision-making → Doctors make better choices
- ✅ Evidence-based → Consistent, standardized care

---

### Why Blockchain is Used

#### **Problem It Solves:**
- **Medical records can be falsified** → Blockchain makes tampering detectable
- **Audit trail is critical** → Blockchain creates immutable history
- **Doctor manipulation feared** → Blockchain proves data wasn't changed
- **Insurance fraud prevention** → Blockchain proves authenticity
- **Regulatory compliance** → Immutable records satisfy HIPAA/data protection laws

#### **Specific Use Cases in AarogyaGuard:**

| Blockchain Feature | Use Case | Benefit |
|-------------------|----------|---------|
| **Immutable Ledger** | Store consultation hash | Proof: consultation unchanged since creation |
| **Append-only** | Record all edits | Complete audit trail: who changed what, when |
| **Cryptographic hash** | Link blocks together | Tampering detected: changing 1 byte breaks chain |
| **Timestamp** | Temporal proof | Prove consultation existed at specific time |
| **Patient privacy** | Hash patient ID | Record history without exposing PII |

#### **Example - Why Blockchain Matters:**

```
SCENARIO 1: Without Blockchain
────────────────────────────────────
1. Doctor diagnoses: "Patient has Fever"
2. Days later, someone modifies record: "Patient has Pneumonia"
3. Patient sues: "That's not what the diagnosis was!"
4. Doctor claims: "I never changed it"
5. No way to prove who's right → Legal dispute

SCENARIO 2: With Blockchain
────────────────────────────────────
1. Doctor diagnoses: "Patient has Fever"
   ├─ Hash generated: SHA256(fever + treatment)
   ├─ Block 42 created with hash
   └─ Stored immutably on blockchain

2. Someone tries to change record: "Pneumonia"
   ├─ New hash computed
   ├─ Doesn't match blockchain hash
   └─ Change detected! ❌ TAMPERING ALERT

3. Patient/Doctor can verify:
   ├─ Compute hash from current data
   ├─ Compare with blockchain
   ├─ If match: ✓ Data unchanged since creation
   └─ If mismatch: ❌ Data was modified (& by whom)

4. Complete history visible:
   ├─ Block 42: Initial diagnosis (10:30 AM)
   ├─ Block 43: Doctor updated (11:15 AM)
   └─ Block 44: Prescription added (11:45 AM)
   → Full timeline, all changes permanent
```

#### **Medical & Legal Significance:**

| Benefit | Impact |
|---------|--------|
| **Tamper Detection** | Patient can prove diagnosis wasn't changed → Legal protection |
| **Accountability** | Every change attributed to specific user → No plausible deniability |
| **Regulatory Compliance** | HIPAA requires audit trails → Blockchain satisfies requirement |
| **Malpractice Prevention** | Documentation is irrefutable → Protects doctors & patients |
| **Insurance Claims** | Blockchain proves authenticity → Faster claim settlement |
| **Medical Research** | Genuine data for studies → More reliable results |

#### **Key Guarantee - The Hash Chain:**

```
Block 42 (Initial Consultation)
├─ Timestamp: 2026-01-28T10:30:00Z
├─ Data: symptoms + ML analysis
├─ Hash: a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9...
└─ Previous Hash: z9k2m5n8p1q4r7s0t3u6v9w2x5y8z1a4...
   
   ↓ Cannot break this link without invalidating all future blocks

Block 43 (Doctor Update)
├─ Timestamp: 2026-01-28T11:15:30Z
├─ Data: final diagnosis + medicines
├─ Hash: b8g4h1i9j6k3l0m7n4o1p8q5r2s9t6u3v0w7x4y1z8a5b2c9d6e3f0g7h4i1j8
└─ Previous Hash: a7f3e9d2c8b1f4e6a9d2c1e4f7a3b6c9...
   
   ↑ Links back to Block 42 (cannot modify Block 42 without breaking this)

Block 44 (Patient Verification)
├─ Timestamp: 2026-01-28T14:20:00Z
├─ Action: Data verified
├─ Hash: c9h5i2j9k6l3m0n7o4p1q8r5s2t9u6v3w0x7y4z1a8b5c2d9e6f3g0h7i4j1k8
└─ Previous Hash: b8g4h1i9j6k3l0m7n4o1p8q5r2s9t6u3v0w7x4y1z8a5b2c9d6e3f0g7h4i1j8

IF SOMEONE TRIES TO MODIFY:
├─ Change Block 42 data → Hash changes
├─ Breaks link in Block 43 → Block 43 becomes invalid
├─ Breaks link in Block 44 → Block 44 becomes invalid
├─ Cascading invalidation → Tampering obvious
└─ Result: ❌ TAMPERING DETECTED - Cannot silently modify
```

---

## Summary: ML + Blockchain Together

### **ML provides:**
- Intelligent decision support
- Symptom analysis at scale
- Risk stratification
- Drug safety checks
- Pattern recognition

### **Blockchain provides:**
- Proof of authenticity
- Tamper detection
- Legal compliance
- Audit trail
- Data integrity guarantee

### **Together they create:**
```
┌─────────────────────────────────────────────────────┐
│  Intelligent, Trustworthy Healthcare System         │
│                                                      │
│  ML: "Here are the most likely diagnoses"           │
│  + Blockchain: "And I can prove this data is       │
│                 authentic and unchanged"            │
│  = Trusted medical intelligence                     │
└─────────────────────────────────────────────────────┘
```

---

## Architecture Decision Matrix

| Aspect | Why This Approach | Alternative | Why Not Alternative |
|--------|------------------|-------------|---------------------|
| **ML Models** | Scikit-learn ensemble | Deep Learning (TensorFlow) | Smaller datasets, faster inference, less computational cost |
| **Blockchain Type** | Custom append-only | Ethereum/Public Chain | Private healthcare data, lower latency, no gas fees |
| **Database** | MySQL + Prisma | MongoDB | Structured relational data, ACID compliance, audit logging |
| **Backend** | Next.js API Routes | Separate Node.js server | Monolithic, faster deployment, built-in auth support |
| **Authentication** | NextAuth + JWT | OAuth3/OIDC | Self-hosted, complete control, regulatory compliance |

---

**Created:** January 28, 2026  
**Purpose:** Reference guide for stakeholders, developers, and presentation
