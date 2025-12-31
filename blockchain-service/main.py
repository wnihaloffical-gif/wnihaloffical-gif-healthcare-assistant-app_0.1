from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import hashlib
import json
import uvicorn

app = FastAPI(title="AarogyaGuard Blockchain Service", version="1.0.0")

# Enable CORS for Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Block & Blockchain Classes
# ============================================================================

class Block:
    """Represents a single block in the blockchain."""
    
    def __init__(self, index: int, timestamp: str, patient_hash: str, 
                 consultation_summary: str, previous_hash: str):
        self.index = index
        self.timestamp = timestamp
        self.patient_hash = patient_hash
        self.consultation_summary = consultation_summary
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate SHA-256 hash of the block."""
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "patient_hash": self.patient_hash,
            "consultation_summary": self.consultation_summary,
            "previous_hash": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self) -> dict:
        """Convert block to dictionary."""
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "patient_hash": self.patient_hash,
            "consultation_summary": self.consultation_summary,
            "previous_hash": self.previous_hash,
            "hash": self.hash
        }


class Blockchain:
    """In-memory blockchain implementation."""
    
    def __init__(self):
        self.chain = []
        self.patients = {}  # Track patient records
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create the first block in the chain."""
        genesis_block = Block(
            index=0,
            timestamp=datetime.utcnow().isoformat(),
            patient_hash="genesis",
            consultation_summary="Genesis Block - AarogyaGuard Blockchain",
            previous_hash="0"
        )
        self.chain.append(genesis_block)
    
    def get_latest_block(self) -> Block:
        """Get the most recent block."""
        return self.chain[-1]
    
    def add_block(self, patient_hash: str, consultation_summary: str) -> Block:
        """Add a new block to the blockchain."""
        latest_block = self.get_latest_block()
        
        new_block = Block(
            index=len(self.chain),
            timestamp=datetime.utcnow().isoformat(),
            patient_hash=patient_hash,
            consultation_summary=consultation_summary,
            previous_hash=latest_block.hash
        )
        
        self.chain.append(new_block)
        
        # Track patient records
        if patient_hash not in self.patients:
            self.patients[patient_hash] = []
        self.patients[patient_hash].append({
            "block_index": new_block.index,
            "hash": new_block.hash,
            "timestamp": new_block.timestamp
        })
        
        return new_block
    
    def get_patient_history(self, patient_hash: str) -> list:
        """Retrieve all consultation records for a patient."""
        if patient_hash not in self.patients:
            return []
        
        history = []
        for record in self.patients[patient_hash]:
            block = self.chain[record["block_index"]]
            history.append(block.to_dict())
        
        return history
    
    def validate_chain(self) -> bool:
        """Validate the integrity of the entire blockchain."""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Check if current block hash is valid
            if current_block.hash != current_block.calculate_hash():
                return False
            
            # Check if previous hash matches
            if current_block.previous_hash != previous_block.hash:
                return False
        
        return True
    
    def get_chain(self) -> list:
        """Get the entire blockchain."""
        return [block.to_dict() for block in self.chain]


# ============================================================================
# Initialize Blockchain
# ============================================================================
blockchain = Blockchain()


# ============================================================================
# Pydantic Models for API Requests/Responses
# ============================================================================

class ConsultationRequest(BaseModel):
    patient_hash: str
    consultation_summary: str


class BlockResponse(BaseModel):
    index: int
    timestamp: str
    patient_hash: str
    consultation_summary: str
    previous_hash: str
    hash: str


class AddBlockResponse(BaseModel):
    success: bool
    block: BlockResponse
    message: str


class PatientHistoryResponse(BaseModel):
    patient_hash: str
    records: list
    total_records: int


class ValidateResponse(BaseModel):
    is_valid: bool
    total_blocks: int
    message: str


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "operational",
        "service": "AarogyaGuard Blockchain",
        "version": "1.0.0",
        "blockchain_blocks": len(blockchain.chain),
        "patients_tracked": len(blockchain.patients)
    }


@app.post("/blockchain/add", response_model=AddBlockResponse, tags=["Blockchain"])
async def add_consultation(request: ConsultationRequest):
    """
    Add a new consultation record to the blockchain.
    
    Args:
        patient_hash: Unique hashed identifier for patient (SHA-256)
        consultation_summary: Brief summary of consultation (max 500 chars)
    
    Returns:
        Block data with hash, timestamp, and transaction ID
    """
    try:
        # Validate input
        if not request.patient_hash or len(request.patient_hash) < 10:
            raise HTTPException(status_code=400, detail="Invalid patient hash")
        
        if not request.consultation_summary or len(request.consultation_summary) > 1000:
            raise HTTPException(status_code=400, detail="Consultation summary required (max 1000 chars)")
        
        # Add block to blockchain
        new_block = blockchain.add_block(
            patient_hash=request.patient_hash,
            consultation_summary=request.consultation_summary
        )
        
        return AddBlockResponse(
            success=True,
            block=BlockResponse(**new_block.to_dict()),
            message=f"Consultation recorded on blockchain. Block #{new_block.index}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding block: {str(e)}")


@app.get("/blockchain/patient/{patient_hash}", response_model=PatientHistoryResponse, tags=["Blockchain"])
async def get_patient_records(patient_hash: str):
    """
    Retrieve all consultation records for a specific patient.
    
    Args:
        patient_hash: Unique hashed identifier for patient
    
    Returns:
        List of all consultation blocks for the patient
    """
    try:
        records = blockchain.get_patient_history(patient_hash)
        
        return PatientHistoryResponse(
            patient_hash=patient_hash,
            records=records,
            total_records=len(records)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving records: {str(e)}")


@app.get("/blockchain/validate", response_model=ValidateResponse, tags=["Blockchain"])
async def validate_blockchain():
    """
    Validate the integrity of the entire blockchain.
    
    Returns:
        Validation status and total block count
    """
    try:
        is_valid = blockchain.validate_chain()
        
        return ValidateResponse(
            is_valid=is_valid,
            total_blocks=len(blockchain.chain),
            message="Blockchain is valid and immutable" if is_valid else "Blockchain validation failed"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


@app.get("/blockchain/chain", tags=["Blockchain"])
async def get_full_chain():
    """
    Retrieve the entire blockchain (for verification/demo purposes).
    
    Returns:
        Complete chain with all blocks
    """
    try:
        chain = blockchain.get_chain()
        
        return {
            "total_blocks": len(chain),
            "is_valid": blockchain.validate_chain(),
            "chain": chain
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chain: {str(e)}")


@app.get("/blockchain/stats", tags=["Blockchain"])
async def get_blockchain_stats():
    """
    Get blockchain statistics.
    
    Returns:
        Total blocks, patients tracked, and system info
    """
    try:
        return {
            "total_blocks": len(blockchain.chain),
            "total_patients": len(blockchain.patients),
            "total_consultations": sum(len(records) for records in blockchain.patients.values()),
            "latest_block": blockchain.get_latest_block().to_dict() if len(blockchain.chain) > 1 else None,
            "blockchain_valid": blockchain.validate_chain()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
