# AarogyaGuard Architecture Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AarogyaGuard Healthcare System                      │
│                          Multi-Language AI + Blockchain Assistant                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               User Interface Layer                              │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│   │   Patient UI    │  │   Doctor UI     │  │   Admin UI      │                 │
│   │                 │  │                 │  │                 │                 │
│   │ • Dashboard     │  │ • Dashboard     │  │ • Analytics     │                 │
│   │ • Consultations │  │ • Review Cases  │  │ • Metrics       │                 │
│   │ • Voice Input   │  │ • Add Notes     │  │ • System Health │                 │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             Application Layer                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    Next.js Full-Stack Application                       │   │
│   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │   │
│   │  │   Frontend      │  │   API Routes    │  │   Components     │          │   │
│   │  │   (React)       │  │   (Backend)     │  │   (UI)           │          │   │
│   │  │                 │  │                 │  │                 │          │   │
│   │  │ • Pages         │  │ • Auth          │  │ • Forms         │          │   │
│   │  │ • Navigation    │  │ • Orchestration │  │ • Voice Recorder │          │   │
│   │  │ • State Mgmt    │  │ • CRUD Ops      │  │ • Charts         │          │   │
│   │  └─────────────────┘  └─────────────────┘  └─────────────────┘          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Service Layer                                     │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│   │   ML Service    │  │ Blockchain Svc  │  │   Database      │                 │
│   │   (FastAPI)     │  │   (FastAPI)     │  │   (MongoDB)     │                 │
│   │                 │  │                 │  │                 │                 │
│   │ • Symptom       │  │ • Hash Data     │  │ • Users         │                 │
│   │   Analysis      │  │ • Immutable     │  │ • Consultations │                 │
│   │ • Risk Assess   │  │   Records       │  │ • Blockchain    │                 │
│   │ • DDI Check     │  │ • Verification  │  │ • Audit Logs    │                 │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Component Breakdown                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

Frontend Components:
├── Patient Components
│   ├── Dashboard (consultation history, new consultation button)
│   ├── Consultation Form (voice recorder, symptom input)
│   ├── Analysis Results (conditions, medicines, DDI alerts)
│   └── Consultation Detail (full consultation view)
├── Doctor Components
│   ├── Dashboard (pending consultations queue)
│   ├── Consultation Review (edit analysis, add notes)
│   └── Case Management (filter, sort consultations)
├── Admin Components
│   ├── Analytics Dashboard (metrics, charts)
│   ├── System Health (service status, logs)
│   └── User Management (role assignments)
└── Shared Components
    ├── Voice Recorder (Web Audio API integration)
    ├── Consultation Card (reusable display component)
    └── Theme Provider (styling context)

Backend API Routes:
├── Authentication
│   ├── POST /api/auth/login
│   ├── POST /api/auth/register
│   └── GET /api/auth/verify
├── Consultation Management
│   ├── POST /api/consultation/analyze (orchestrates ML + Blockchain)
│   ├── GET /api/consultation/[id]
│   ├── PUT /api/consultation/[id] (doctor updates)
│   └── GET /api/consultation/[id]/history
├── User Management
│   ├── GET /api/user/[id]
│   ├── PUT /api/user/[id]
│   └── GET /api/users (admin only)
└── Analytics
    ├── GET /api/analytics/overview
    ├── GET /api/analytics/consultations
    └── GET /api/analytics/users

ML Service (Python FastAPI):
├── Core Engine
│   ├── Symptom Extractor (NLP processing)
│   ├── Triage Engine (risk assessment)
│   ├── DDI Checker (drug interaction analysis)
│   └── Inference Engine (ML model predictions)
├── API Endpoints
│   ├── POST /infer (symptom analysis)
│   ├── GET /health (service status)
│   ├── GET /metrics (model performance)
│   └── GET /status (service info)
└── Data Processing
    ├── Text Preprocessing (language detection, cleaning)
    ├── Feature Extraction (symptom vectorization)
    └── Model Loading (scikit-learn models)

Blockchain Service (Python FastAPI):
├── Core Engine
│   ├── Hash Generator (SHA-256 hashing)
│   ├── Block Creator (immutable block creation)
│   ├── Chain Validator (integrity verification)
│   └── Proof System (transaction receipts)
├── API Endpoints
│   ├── POST /blockchain/add (record consultation)
│   ├── GET /blockchain/patient/{id} (consultation history)
│   ├── GET /blockchain/validate (chain integrity)
│   ├── GET /blockchain/chain (full blockchain)
│   └── GET /blockchain/stats (blockchain metrics)
└── Storage Integration
    ├── MongoDB Client (record persistence)
    ├── Block Storage (immutable records)
    └── Audit Trail (transaction logs)

Database Layer (MongoDB):
├── Collections
│   ├── users (authentication, profiles, roles)
│   ├── consultations (symptoms, analysis, status)
│   ├── blockchain_records (immutable proofs)
│   ├── ml_inference_logs (model predictions, metrics)
│   └── audit_logs (system activity, security)
├── Indexes
│   ├── User indexes (email, role)
│   ├── Consultation indexes (patient_id, status, created_at)
│   ├── Blockchain indexes (consultation_id, block_number)
│   └── Audit indexes (timestamp, module, action)
└── Aggregation Pipelines
    ├── Analytics queries (metrics, statistics)
    ├── Consultation summaries (patient history)
    └── System health (performance monitoring)
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Consultation Flow                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

1. Patient Interaction:
   Patient → Frontend → Voice/Symptom Input → API Call

2. Authentication & Validation:
   API Route → JWT Verification → User Context → Database Check

3. ML Analysis Pipeline:
   Backend → ML Service → Symptom Processing → Model Inference → Risk Assessment

4. DDI Analysis:
   ML Service → Current Medications → Interaction Database → Safety Alerts

5. Consultation Creation:
   Backend → Database → Consultation Record → Initial Status (pending)

6. Blockchain Recording:
   Backend → Blockchain Service → Data Hashing → Block Creation → Proof Generation

7. Doctor Review (Optional):
   Doctor → Frontend → Review Interface → Update Consultation → Final Status

8. Response Assembly:
   Backend → Aggregate Results → ML Predictions + Blockchain Proof → Frontend

9. Display & Verification:
   Frontend → Render Results → Show Analysis → Display Blockchain Proof

10. Audit Logging:
    All Services → Structured Logs → MongoDB → Analytics Dashboard
```

## Security & Communication Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Security & Communication Layers                            │
└─────────────────────────────────────────────────────────────────────────────────┘

Authentication Layer:
├── JWT Tokens (session management)
├── Role-Based Access Control (RBAC)
├── Password Hashing (bcrypt)
└── API Key Management (service-to-service)

Communication Layer:
├── REST APIs (HTTP/HTTPS)
├── JSON Payloads (structured data)
├── CORS Configuration (cross-origin requests)
└── Request/Response Validation (Pydantic/TypeScript)

Security Measures:
├── Input Sanitization (XSS prevention)
├── SQL Injection Protection (parameterized queries)
├── Rate Limiting (API throttling)
├── HTTPS Encryption (data in transit)
├── Data Validation (schema enforcement)
└── Audit Logging (security monitoring)

Service Communication:
├── Internal API Calls (Next.js ↔ Python services)
├── Database Connections (connection pooling)
├── Environment Variables (secret management)
└── Health Checks (service monitoring)
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Deployment Architecture                               │
└─────────────────────────────────────────────────────────────────────────────────┘

Development Environment:
├── Local Development Server (Next.js dev)
├── Python Services (uvicorn reload)
├── MongoDB Local Instance
├── Environment Variables (.env files)
└── Hot Reload (code changes)

Production Environment:
├── Containerized Services (Docker)
├── Orchestration Layer (Docker Compose/K8s)
├── Load Balancer (nginx/traefik)
├── Database Cluster (MongoDB Atlas/Replica Set)
└── CDN (static assets)

Service Ports:
├── Frontend: 3000 (Next.js)
├── ML Service: 8002 (FastAPI)
├── Blockchain Service: 8000 (FastAPI)
├── MongoDB: 27017 (Database)
└── Admin Interface: 3000/admin

Monitoring & Observability:
├── Application Logs (structured JSON)
├── Performance Metrics (response times)
├── Error Tracking (exception handling)
├── Health Endpoints (service status)
└── Analytics Dashboard (usage statistics)
```

## Technology Stack Summary

```
Frontend Layer:
• Next.js 16 (React Framework)
• TypeScript (Type Safety)
• Tailwind CSS (Styling)
• React Hook Form (Form Management)
• Web Audio API (Voice Recording)

Backend Layer:
• Next.js API Routes (Serverless Functions)
• TypeScript (Type Safety)
• MongoDB Driver (Database Access)
• JWT (Authentication)
• Axios/Fetch (HTTP Client)

ML Service Layer:
• FastAPI (Python Web Framework)
• scikit-learn (Machine Learning)
• NumPy (Numerical Computing)
• spaCy/NLTK (NLP Processing)
• Pydantic (Data Validation)

Blockchain Service Layer:
• FastAPI (Python Web Framework)
• Custom Blockchain Implementation
• SHA-256 (Cryptographic Hashing)
• JSON Serialization (Data Integrity)
• Pydantic (Data Validation)

Database Layer:
• MongoDB (Document Database)
• Mongoose-like Schema (Data Modeling)
• Aggregation Framework (Analytics)
• Indexing (Performance)
• Connection Pooling (Scalability)

Infrastructure:
• Docker (Containerization)
• Docker Compose (Local Orchestration)
• Environment Variables (Configuration)
• PM2/Uvicorn (Process Management)
• nginx (Reverse Proxy)
```