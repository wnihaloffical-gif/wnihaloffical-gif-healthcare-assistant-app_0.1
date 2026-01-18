from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from contextlib import asynccontextmanager
import hashlib
import json
import uvicorn
import time
import os
from logger import logger
from db_client import db_client

# ============================================================================
# FastAPI Lifespan Manager (replaces deprecated on_event)
# ============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db_client.connect()
    logger.info("Blockchain Service started", module="APP")
    yield
    # Shutdown
    db_client.disconnect()
    logger.info("Blockchain Service shut down", module="APP")

app = FastAPI(
    title="AarogyaGuard Blockchain Service", 
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
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
                 consultation_summary: str, previous_hash: str, consultation_id: str = ""):
        self.index = index
        self.timestamp = timestamp
        self.patient_hash = patient_hash
        self.consultation_summary = consultation_summary
        self.previous_hash = previous_hash
        self.consultation_id = consultation_id
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate SHA-256 hash of the block."""
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "patient_hash": self.patient_hash,
            "consultation_summary": self.consultation_summary,
            "previous_hash": self.previous_hash,
            "consultation_id": self.consultation_id
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self) -> dict:
        """Convert block to dictionary."""
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "patient_hash": self.patient_hash,
            "consultation_id": self.consultation_id,
            "consultation_summary": self.consultation_summary,
            "previous_hash": self.previous_hash,
            "hash": self.hash
        }


class Blockchain:
    """Blockchain with in-memory cache and database persistence."""
    
    def __init__(self):
        self.chain = []
        self.patients = {}  # Track patient records in memory
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
        logger.info("Genesis block created", module="BLOCKCHAIN")
    
    def get_latest_block(self) -> Block:
        """Get the most recent block."""
        return self.chain[-1]
    
    def add_block(self, patient_hash: str, consultation_summary: str, consultation_id: str = "") -> Block:
        """Add a new block to the blockchain and store in database."""
        start_time = time.time()
        
        latest_block = self.get_latest_block()
        
        new_block = Block(
            index=len(self.chain),
            timestamp=datetime.utcnow().isoformat(),
            patient_hash=patient_hash,
            consultation_summary=consultation_summary,
            previous_hash=latest_block.hash,
            consultation_id=consultation_id
        )
        
        self.chain.append(new_block)
        
        # Track patient records in memory
        if patient_hash not in self.patients:
            self.patients[patient_hash] = []
        self.patients[patient_hash].append({
            "block_index": new_block.index,
            "hash": new_block.hash,
            "timestamp": new_block.timestamp
        })
        
        # Store in database
        block_data = {
            "consultation_id": consultation_id,
            "patient_id": patient_hash,
            "data_hash": new_block.hash,
            "tx_id": f"0x{new_block.hash[:16]}",
            "block_number": new_block.index,
            "timestamp": datetime.utcnow().isoformat(),
            "verified": True,
            "block_data": new_block.to_dict()
        }
        
        db_client.store_block(block_data)
        
        processing_time = time.time() - start_time
        logger.info("Block added to blockchain",
                   {
                       "block_index": new_block.index,
                       "consultation_id": consultation_id,
                       "patient_hash": patient_hash,
                       "processing_time_ms": processing_time * 1000
                   }, "BLOCKCHAIN")
        
        return new_block
    
    def get_patient_history(self, patient_hash: str) -> list:
        """Retrieve all consultation records for a patient."""
        if patient_hash not in self.patients:
            return []
        
        history = []
        for record in self.patients[patient_hash]:
            if record["block_index"] < len(self.chain):
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
                logger.warn("Invalid block hash detected", 
                           {"block_index": i}, "BLOCKCHAIN")
                return False
            
            # Check if previous hash matches
            if current_block.previous_hash != previous_block.hash:
                logger.warn("Invalid previous hash", 
                           {"block_index": i}, "BLOCKCHAIN")
                return False
        
        logger.info("Blockchain validation successful",
                   {"total_blocks": len(self.chain)}, "BLOCKCHAIN")
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
    patient_id: str
    consultation_id: str
    consultation_summary: str


class BlockResponse(BaseModel):
    index: int
    timestamp: str
    patient_hash: str
    consultation_id: str
    consultation_summary: str
    previous_hash: str
    hash: str


class AddBlockResponse(BaseModel):
    success: bool
    block: BlockResponse
    tx_id: str
    message: str


class PatientHistoryResponse(BaseModel):
    patient_id: str
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
    logger.info("Health check request", module="APP")
    return {
        "status": "operational",
        "service": "AarogyaGuard Blockchain",
        "version": "1.0.0",
        "blockchain_blocks": len(blockchain.chain),
        "patients_tracked": len(blockchain.patients),
        "database_connected": db_client.db is not None,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/blockchain/add", response_model=AddBlockResponse, tags=["Blockchain"])
async def add_consultation(request: ConsultationRequest):
    """
    Add a new consultation record to the blockchain.
    
    Args:
        patient_id: Patient identifier
        consultation_id: Consultation identifier
        consultation_summary: Brief summary of consultation (max 1000 chars)
    
    Returns:
        Block data with hash, timestamp, and transaction ID
    """
    start_time = time.time()
    
    try:
        # Validate input
        if not request.patient_id or len(request.patient_id) < 3:
            logger.warn("Invalid patient ID", {"patient_id": request.patient_id}, "BLOCKCHAIN")
            raise HTTPException(status_code=400, detail="Invalid patient ID")
        
        if not request.consultation_summary or len(request.consultation_summary) > 1000:
            logger.warn("Invalid consultation summary", {}, "BLOCKCHAIN")
            raise HTTPException(status_code=400, detail="Consultation summary required (max 1000 chars)")
        
        # Add block to blockchain
        new_block = blockchain.add_block(
            patient_hash=request.patient_id,
            consultation_summary=request.consultation_summary,
            consultation_id=request.consultation_id
        )
        
        processing_time = time.time() - start_time
        
        logger.info("Consultation added to blockchain",
                   {
                       "block_index": new_block.index,
                       "consultation_id": request.consultation_id,
                       "processing_time_ms": processing_time * 1000
                   }, "BLOCKCHAIN")
        
        return AddBlockResponse(
            success=True,
            block=BlockResponse(**new_block.to_dict()),
            tx_id=f"0x{new_block.hash[:16]}",
            message=f"Consultation recorded on blockchain. Block #{new_block.index}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error("Error adding block",
                    {"processing_time_ms": processing_time * 1000},
                    "BLOCKCHAIN", str(e))
        raise HTTPException(status_code=500, detail=f"Error adding block: {str(e)}")


@app.get("/blockchain/patient/{patient_id}", response_model=PatientHistoryResponse, tags=["Blockchain"])
async def get_patient_records(patient_id: str):
    """
    Retrieve all consultation records for a specific patient.
    
    Args:
        patient_id: Patient identifier
    
    Returns:
        List of all consultation blocks for the patient
    """
    try:
        logger.info("Fetching patient blockchain history",
                   {"patient_id": patient_id}, "BLOCKCHAIN")
        
        # Try to get from database first
        db_records = db_client.get_patient_history(patient_id)
        
        if db_records:
            logger.info("Patient history retrieved from database",
                       {"patient_id": patient_id, "record_count": len(db_records)}, "BLOCKCHAIN")
            return PatientHistoryResponse(
                patient_id=patient_id,
                records=[r.get("block_data", {}) for r in db_records],
                total_records=len(db_records)
            )
        
        # Fallback to in-memory cache
        records = blockchain.get_patient_history(patient_id)
        
        return PatientHistoryResponse(
            patient_id=patient_id,
            records=records,
            total_records=len(records)
        )
    
    except Exception as e:
        logger.error("Error retrieving patient records",
                    {"patient_id": patient_id},
                    "BLOCKCHAIN", str(e))
        raise HTTPException(status_code=500, detail=f"Error retrieving records: {str(e)}")


@app.get("/blockchain/validate", response_model=ValidateResponse, tags=["Blockchain"])
async def validate_blockchain():
    """
    Validate the integrity of the entire blockchain.
    
    Returns:
        Validation status and total block count
    """
    try:
        logger.info("Validating blockchain integrity", module="BLOCKCHAIN")
        is_valid = blockchain.validate_chain()
        
        return ValidateResponse(
            is_valid=is_valid,
            total_blocks=len(blockchain.chain),
            message="Blockchain is valid and immutable" if is_valid else "Blockchain validation failed"
        )
    
    except Exception as e:
        logger.error("Validation error", module="BLOCKCHAIN", error=str(e))
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


@app.get("/blockchain/chain", tags=["Blockchain"])
async def get_full_chain():
    """
    Retrieve the entire blockchain (for verification/demo purposes).
    
    Returns:
        Complete chain with all blocks
    """
    try:
        logger.info("Fetching full blockchain", module="BLOCKCHAIN")
        chain = blockchain.get_chain()
        
        return {
            "total_blocks": len(chain),
            "is_valid": blockchain.validate_chain(),
            "chain": chain,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error("Error retrieving chain", module="BLOCKCHAIN", error=str(e))
        raise HTTPException(status_code=500, detail=f"Error retrieving chain: {str(e)}")


@app.get("/blockchain/stats", tags=["Blockchain"])
async def get_blockchain_stats():
    """
    Get blockchain statistics.
    
    Returns:
        Total blocks, patients tracked, and system info
    """
    try:
        logger.info("Fetching blockchain stats", module="BLOCKCHAIN")
        
        return {
            "total_blocks": len(blockchain.chain),
            "total_patients": len(blockchain.patients),
            "total_consultations": sum(len(records) for records in blockchain.patients.values()),
            "latest_block": blockchain.get_latest_block().to_dict() if len(blockchain.chain) > 1 else None,
            "blockchain_valid": blockchain.validate_chain(),
            "database_connected": db_client.db is not None,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error("Error getting stats", module="BLOCKCHAIN", error=str(e))
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
