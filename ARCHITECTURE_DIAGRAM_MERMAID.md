```mermaid
graph TB
    %% Define main actors
    Patient[👤 Patient]
    Doctor[👨‍⚕️ Doctor]
    Admin[👑 Admin]

    %% Frontend Layer
    subgraph "Frontend Layer (Next.js + React)"
        NextJS[Next.js App]
        PatientUI[Patient Dashboard<br/>• New Consultation<br/>• Voice Input<br/>• Results View]
        DoctorUI[Doctor Dashboard<br/>• Review Cases<br/>• Add Notes<br/>• Finalize]
        AdminUI[Admin Dashboard<br/>• Analytics<br/>• Metrics<br/>• System Health]
        VoiceComp[Voice Recorder<br/>Web Audio API]
    end

    %% Backend Layer
    subgraph "Backend Layer (Next.js API Routes)"
        APIRoutes[API Routes]
        Auth[Authentication<br/>JWT Tokens]
        Orchestrator[Consultation<br/>Orchestrator]
        DBLayer[Database Layer<br/>MongoDB Client]
    end

    %% Service Layer
    subgraph "ML Service (Python FastAPI)"
        MLService[ML Service API]
        SymptomExtractor[Symptom Extractor<br/>NLP Processing]
        TriageEngine[Triage Engine<br/>Risk Assessment]
        DDIChecker[DDI Checker<br/>Drug Interactions]
        InferenceEngine[Inference Engine<br/>ML Models]
    end

    subgraph "Blockchain Service (Python FastAPI)"
        BlockchainService[Blockchain Service API]
        HashGenerator[Hash Generator<br/>SHA-256]
        BlockCreator[Block Creator<br/>Immutable Blocks]
        ChainValidator[Chain Validator<br/>Integrity Check]
    end

    %% Database Layer
    subgraph "Database Layer (MongoDB)"
        MongoDB[(MongoDB)]
        Users[(Users<br/>auth, profiles)]
        Consultations[(Consultations<br/>symptoms, analysis)]
        BlockchainRecords[(Blockchain Records<br/>immutable proofs)]
        MLLogs[(ML Inference Logs<br/>predictions, metrics)]
        AuditLogs[(Audit Logs<br/>system activity)]
    end

    %% User interactions
    Patient --> PatientUI
    Doctor --> DoctorUI
    Admin --> AdminUI

    %% Frontend to Backend
    PatientUI --> NextJS
    DoctorUI --> NextJS
    AdminUI --> NextJS
    VoiceComp --> NextJS

    NextJS --> APIRoutes

    %% Backend components
    APIRoutes --> Auth
    APIRoutes --> Orchestrator
    Orchestrator --> DBLayer

    %% Service orchestration
    Orchestrator --> MLService
    Orchestrator --> BlockchainService

    %% ML Service internals
    MLService --> SymptomExtractor
    MLService --> TriageEngine
    MLService --> DDIChecker
    MLService --> InferenceEngine

    %% Blockchain Service internals
    BlockchainService --> HashGenerator
    BlockchainService --> BlockCreator
    BlockchainService --> ChainValidator

    %% Database connections
    DBLayer --> MongoDB
    MLService --> MLLogs
    BlockchainService --> BlockchainRecords
    Auth --> Users
    Orchestrator --> Consultations
    APIRoutes --> AuditLogs

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef services fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef actors fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class Patient,Doctor,Admin actors
    class NextJS,PatientUI,DoctorUI,AdminUI,VoiceComp frontend
    class APIRoutes,Auth,Orchestrator,DBLayer backend
    class MLService,SymptomExtractor,TriageEngine,DDIChecker,InferenceEngine,BlockchainService,HashGenerator,BlockCreator,ChainValidator services
    class MongoDB,Users,Consultations,BlockchainRecords,MLLogs,AuditLogs database
```

```mermaid
flowchart TD
    %% Consultation Creation Flow
    A[👤 Patient] --> B[Start Consultation]
    B --> C[Voice/Symptom Input]
    C --> D[Submit to API]

    D --> E{Authentication}
    E -->|Valid| F[Process Request]
    E -->|Invalid| G[Return Error]

    F --> H[Send to ML Service]
    H --> I[Symptom Analysis]
    I --> J[Risk Assessment]
    J --> K[DDI Checking]
    K --> L[Generate Predictions]

    L --> M[Create Consultation Record]
    M --> N[Send to Blockchain Service]
    N --> O[Hash Consultation Data]
    O --> P[Create Immutable Block]
    P --> Q[Generate Proof]

    Q --> R[Store in Database]
    R --> S[Return Complete Response]
    S --> T[Display Results to Patient]

    %% Doctor Review Flow
    U[👨‍⚕️ Doctor] --> V[Review Pending Cases]
    V --> W[Load Consultation Details]
    W --> X[Review AI Analysis]
    X --> Y[Add Clinical Notes]
    Y --> Z[Finalize/Update Status]
    Z --> AA[Update Database]
    AA --> BB[Optional: New Blockchain Entry]

    %% Admin Monitoring
    CC[👑 Admin] --> DD[View System Analytics]
    DD --> EE[Load Metrics from Database]
    EE --> FF[Display Charts & Reports]

    %% Logging (background process)
    D -.-> GG[Log API Request]
    H -.-> HH[Log ML Inference]
    N -.-> II[Log Blockchain Transaction]
    M -.-> JJ[Log Database Operation]

    %% Styling
    classDef process fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class A,U,CC external
    class E decision
    class M,R,AA,EE database
    class B,C,D,F,H,I,J,K,L,N,O,P,Q,S,T,V,W,X,Y,Z,DD,FF process
    class GG,HH,II,JJ process
```

## Architecture Summary

### **System Overview**
AarogyaGuard is a multi-language AI-powered healthcare assistant with blockchain-backed secure record storage, built with a microservices architecture.

### **Key Components**

1. **Frontend Layer** (Next.js + React)
   - Patient, Doctor, and Admin interfaces
   - Voice-based symptom collection
   - Real-time consultation management

2. **Backend Layer** (Next.js API Routes)
   - Authentication & authorization
   - Service orchestration
   - Database operations

3. **ML Service** (Python FastAPI)
   - Symptom analysis & disease prediction
   - Risk level assessment
   - Drug-drug interaction checking

4. **Blockchain Service** (Python FastAPI)
   - Immutable consultation records
   - Cryptographic hashing
   - Chain integrity verification

5. **Database Layer** (MongoDB)
   - User management
   - Consultation storage
   - Audit logging
   - Analytics data

### **Technology Stack**
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **AI/ML**: Python FastAPI, scikit-learn, NumPy
- **Blockchain**: Python FastAPI, Custom implementation
- **Database**: MongoDB with aggregation pipelines
- **Infrastructure**: Docker, Docker Compose

### **Security Features**
- JWT-based authentication
- Role-based access control
- Input validation & sanitization
- HTTPS encryption
- Audit logging

### **Scalability Considerations**
- Microservices architecture
- Database connection pooling
- Service health monitoring
- Structured logging
- Containerized deployment