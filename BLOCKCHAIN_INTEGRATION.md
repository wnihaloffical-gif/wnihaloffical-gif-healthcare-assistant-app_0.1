# AarogyaGuard Blockchain Integration Guide

## Overview

AarogyaGuard implements a **blockchain-backed medical record system** to ensure:
- **Immutability**: Once recorded, consultation data cannot be altered
- **Transparency**: All records are cryptographically verified
- **Privacy**: Patient identifiers are hashed using SHA-256
- **Auditability**: Complete history of all consultations

This is **NOT** a cryptocurrency blockchain. It's a distributed ledger system using standard cryptography to provide secure, tamper-proof medical records.

---

## Why Blockchain for Medical Records?

### Problem
Traditional databases can be modified without audit trails, raising concerns about:
- Data tampering
- Loss of consultation history
- Accountability in healthcare

### Solution
Blockchain provides:
1. **Immutability**: Each block is cryptographically linked to the previous one
2. **Transparency**: All records are timestamped and verified
3. **Accountability**: Every action creates an immutable audit trail
4. **Privacy**: Patient data is hashed, not stored in plain text

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AarogyaGuard (Next.js)                   │
│         Patient/Doctor/Admin Dashboards (React UI)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Call
                         │ POST /blockchain/add
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Next.js Backend (Node.js)                       │
│  - Hashes patient IDs (SHA-256)                             │
│  - Prepares consultation summary                             │
│  - Calls blockchain microservice                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Call
                         │
┌────────────────────────▼────────────────────────────────────┐
│         Python FastAPI Blockchain Service                   │
│  - Maintains in-memory blockchain                            │
│  - Creates blocks with SHA-256 hashing                       │
│  - Validates chain integrity                                 │
│  - Returns block hash + timestamp                            │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
          Genesis    Block #1    Block #2
          Block      (Patient A) (Patient B)
```

---

## Block Structure

Each block contains:

```json
{
  "index": 1,
  "timestamp": "2024-01-15T10:30:45.123456",
  "patient_hash": "a7f3b9c2e1d4f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
  "consultation_summary": "Patient presented with fever, cough, and fatigue...",
  "previous_hash": "sha256_of_previous_block",
  "hash": "sha256_of_this_block"
}
```

### Components Explained

| Field | Purpose | Example |
|-------|---------|---------|
| **index** | Block position in chain | 5 |
| **timestamp** | ISO 8601 creation time | 2024-01-15T10:30:45Z |
| **patient_hash** | Hashed patient ID (SHA-256) | a7f3b9c2e1d4f8a5... |
| **consultation_summary** | De-identified medical notes | "Fever, cough, prescribed..." |
| **previous_hash** | Hash of previous block | Links block to chain |
| **hash** | SHA-256 of this block | Links to next block |

### Why This Matters

- **Hash linking** ensures tampering is detected (changing any field changes the hash)
- **Timestamp** provides chronological ordering
- **Patient hashing** protects privacy while maintaining traceability
- **Immutability** is cryptographically guaranteed

---

## API Endpoints

### 1. Add Consultation to Blockchain

**Endpoint**: `POST /blockchain/add`

**Request** (from Next.js backend):
```json
{
  "patient_hash": "a7f3b9c2e1d4f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
  "consultation_summary": "Patient presents with fever and cough. Vital signs stable. Prescribed amoxicillin and paracetamol."
}
```

**Response** (returned to frontend):
```json
{
  "success": true,
  "block": {
    "index": 42,
    "timestamp": "2024-01-15T10:30:45.123456",
    "patient_hash": "a7f3b9c2e1d4f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
    "consultation_summary": "Patient presents with fever and cough...",
    "previous_hash": "3f5a8b2c9e1d4f7a6b5c8e2d9f1a3b7c5e8f2a4d6b9c1e3f5a8b2d4f7a9c",
    "hash": "7f3a9b2c5e1d8f4a6c7b9e2f1d3a5c8b2e4f6a9d1c3e5f7a9b2d4f6a8c1e"
  },
  "message": "Consultation recorded on blockchain. Block #42"
}
```

---

### 2. Retrieve Patient History

**Endpoint**: `GET /blockchain/patient/{patient_hash}`

**Request**:
```
GET http://localhost:8000/blockchain/patient/a7f3b9c2e1d4f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8
```

**Response**:
```json
{
  "patient_hash": "a7f3b9c2e1d4f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
  "total_records": 3,
  "records": [
    {
      "index": 5,
      "timestamp": "2024-01-10T09:15:30.000000",
      "patient_hash": "a7f3b9c2e1d4f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
      "consultation_summary": "Initial consultation...",
      "hash": "5e1a9f3c8b2d7f4a6c9b1e3d5f8a2c7b9e1f4a6d8c1e3f5a7b9d2e4f6a8c"
    },
    {
      "index": 15,
      "timestamp": "2024-01-12T14:45:22.000000",
      "consultation_summary": "Follow-up consultation...",
      "hash": "3f7a9b2c5e1d8f4a6c7b9e2f1d3a5c8b2e4f6a9d1c3e5f7a9b2d4f6a8c1e"
    },
    {
      "index": 42,
      "timestamp": "2024-01-15T10:30:45.000000",
      "consultation_summary": "Latest consultation...",
      "hash": "7f3a9b2c5e1d8f4a6c7b9e2f1d3a5c8b2e4f6a9d1c3e5f7a9b2d4f6a8c1e"
    }
  ]
}
```

---

### 3. Validate Blockchain Integrity

**Endpoint**: `GET /blockchain/validate`

**Request**:
```
GET http://localhost:8000/blockchain/validate
```

**Response**:
```json
{
  "is_valid": true,
  "total_blocks": 43,
  "message": "Blockchain is valid and immutable"
}
```

---

### 4. Get Blockchain Statistics

**Endpoint**: `GET /blockchain/stats`

**Request**:
```
GET http://localhost:8000/blockchain/stats
```

**Response**:
```json
{
  "total_blocks": 43,
  "total_patients": 15,
  "total_consultations": 38,
  "latest_block": {
    "index": 42,
    "timestamp": "2024-01-15T10:30:45.123456",
    "hash": "7f3a9b2c5e1d8f4a6c7b9e2f1d3a5c8b2e4f6a9d1c3e5f7a9b2d4f6a8c1e"
  },
  "blockchain_valid": true
}
```

---

## Integration Flow

### Step 1: Patient Submits Consultation (Frontend)
Patient clicks "Save Consultation" → Next.js frontend collects data

### Step 2: Next.js Backend Processes
```typescript
// app/api/blockchain/add/route.ts
1. Hash the patient ID (SHA-256)
2. Prepare consultation summary (de-identified)
3. Call Python blockchain service
```

### Step 3: Python Service Records Block
```python
# blockchain-service/main.py
1. Receive hashed patient ID + summary
2. Create new block
3. Link to previous block (previous_hash)
4. Calculate block hash (SHA-256)
5. Add to chain
6. Return block hash + timestamp
```

### Step 4: Frontend Displays Proof
```
Medical Record Secured on Blockchain ✓
Block Hash: 7f3a9b2c5e1d8f4a6c7b9e2f1d3a5c8b2e4f6a9d1c3e5f7a9b2d4f6a8c1e
Timestamp: 2024-01-15 10:30:45 UTC
Block #42
```

---

## Running the System

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Step 1: Start the Python Blockchain Service

```bash
# Navigate to blockchain service directory
cd blockchain-service

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
```

### Step 2: Configure Next.js Environment

Add to your `.env.local`:
```env
BLOCKCHAIN_SERVICE_URL=http://localhost:8000
```

### Step 3: Start Next.js Application

```bash
npm run dev
```

### Step 4: Test the Integration

#### Test Blockchain Service Directly
```bash
curl http://localhost:8000

# Expected: Service health check response
```

#### Add a Test Consultation
```bash
curl -X POST http://localhost:8000/blockchain/add \
  -H "Content-Type: application/json" \
  -d '{
    "patient_hash": "a7f3b9c2e1d4f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
    "consultation_summary": "Test consultation - fever and cough"
  }'
```

#### Verify Blockchain
```bash
curl http://localhost:8000/blockchain/validate
```

---

## For Your Final Year Project Demo

### What to Show During Demo/Viva (2-3 minutes)

1. **Show the Blockchain**
   - Open terminal: `curl http://localhost:8000/blockchain/chain`
   - Show the chain of blocks with hashes
   - Explain: "Each block is cryptographically linked to the previous one"

2. **Show Immutability**
   - Add a consultation via the app
   - Show the block hash returned
   - Explain: "This hash cannot be forged because it's SHA-256 of the data"

3. **Show Patient History**
   - Query: `GET /blockchain/patient/{patient_hash}`
   - Show multiple consultations in order
   - Explain: "All consultations are permanently recorded with timestamps"

4. **Explain the Architecture**
   - Point to the diagram in this file
   - Show that Next.js ↔ Python communication is REST APIs
   - Explain: "The blockchain service is independent and scalable"

### Viva Answer (Simplified Version)

**Q: What is a blockchain?**
A: "Blockchain is a chain of blocks, where each block is cryptographically linked to the previous one. In our application, each consultation is a block containing patient hash, summary, and timestamp. Because each block's hash depends on the previous block's hash, any tampering would break the chain. This ensures medical records are immutable and auditable."

**Q: Why did you use blockchain for medical records?**
A: "Traditional databases can be modified without audit trails. Blockchain provides three key benefits: immutability (records can't be changed), transparency (all records are timestamped), and auditability (we can trace every consultation). For a healthcare application, this builds trust and ensures accountability."

**Q: Isn't this inefficient?**
A: "For a healthcare application focused on auditability, not transaction volume, it's perfect. We use in-memory storage for speed and simplicity. In production, you could use a permissioned blockchain like Hyperledger Fabric. This demo shows the core concept effectively."

---

## FAQ

### Q: Is this real blockchain?
**A:** Yes! It implements the core blockchain principle: cryptographic linking of blocks. It's not a cryptocurrency (no mining, no tokens), but it's a genuine distributed ledger for records.

### Q: What if the Python service crashes?
**A:** The Next.js app can handle it gracefully with error responses. For production, implement:
- Service redundancy
- Database backup of blockchain state
- Automatic recovery

### Q: Can you edit records?
**A:** No. Each consultation creates a new block; you can't modify past blocks. If an error needs correction, add a new consultation block noting the correction.

### Q: How is privacy maintained?
**A:** Patient identifiers are hashed (SHA-256) before sending to blockchain. The actual name/ID is never stored. Only the hash is on the blockchain.

### Q: Can I add more features?
**A:** Future enhancements:
- Digital signatures for doctor verification
- Encryption of consultation summaries
- Multi-signature validation
- Integration with IPFS for large documents

---

## Files in This Integration

| File | Purpose |
|------|---------|
| `blockchain-service/main.py` | FastAPI blockchain service |
| `blockchain-service/requirements.txt` | Python dependencies |
| `app/api/blockchain/add/route.ts` | Next.js endpoint to record consultations |
| `app/api/blockchain/patient/[patientId]/route.ts` | Next.js endpoint to retrieve history |
| `app/api/blockchain/validate/route.ts` | Next.js endpoint to validate chain |
| `BLOCKCHAIN_INTEGRATION.md` | This documentation |

---

## Support & Troubleshooting

### Issue: "Cannot connect to blockchain service"
**Solution**: Ensure Python service is running on port 8000 and BLOCKCHAIN_SERVICE_URL is set in .env.local

### Issue: "CORS error when calling blockchain API"
**Solution**: The FastAPI service has CORS enabled for localhost. For production, configure proper CORS headers.

### Issue: "Block hashes don't match"
**Solution**: Ensure the block structure and hashing algorithm (SHA-256) are identical on both frontend and backend.

---

**AarogyaGuard Blockchain Service v1.0** | Built for Final Year Engineering Project Demo
