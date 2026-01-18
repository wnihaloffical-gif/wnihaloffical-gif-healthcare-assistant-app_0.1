"""
FastAPI ML Inference Service for AarogyaGuard
Provides REST API for machine learning predictions with logging and database integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
from contextlib import asynccontextmanager
from inference_engine import InferenceEngine
from logger import logger
from db_client import db_client
import json
import os
import time

# Initialize components
engine = InferenceEngine()

# ============================================================================
# FastAPI Lifespan Manager (replaces deprecated on_event)
# ============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db_client.connect()
    logger.info("ML Service started", module="APP")
    yield
    # Shutdown
    db_client.disconnect()
    logger.info("ML Service shut down", module="APP")

app = FastAPI(
    title="AarogyaGuard ML Service", 
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisRequest(BaseModel):
    symptoms_text: str
    language: str = "english"
    current_medications: List[str] = []
    consultation_id: str = ""
    patient_id: str = ""


class AnalysisResponse(BaseModel):
    conditions: List[Dict[str, Any]]
    risk_level: str
    has_red_flags: bool
    red_flags: List[str]
    medicines: List[Dict[str, Any]]
    ddi_alerts: List[Dict[str, Any]]
    summary: str
    model_source: str
    processing_time: float


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("Health check", module="APP")
    return {
        "status": "healthy", 
        "service": "AarogyaGuard ML Service",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/infer", response_model=AnalysisResponse)
async def run_inference(request: AnalysisRequest):
    """Run ML inference on patient symptoms with database logging"""
    start_time = time.time()
    
    try:
        logger.info("Inference request received", 
                   {
                       "symptoms_length": len(request.symptoms_text),
                       "language": request.language,
                       "consultation_id": request.consultation_id,
                       "patient_id": request.patient_id
                   }, "INFERENCE")
        
        # Extract symptoms
        symptoms = request.symptoms_text.lower().split()
        
        # Get predictions
        conditions, _ = engine.predict_conditions(request.symptoms_text)
        risk_level, _ = engine.predict_risk_level(symptoms, 45)
        has_red_flags, red_flags = engine.detect_red_flags(symptoms)
        medicines = engine.recommend_medicines([c["condition"] for c in conditions])
        ddi_alerts = engine.check_ddi([m["id"] for m in medicines], request.current_medications)
        summary = engine.generate_consultation_summary(symptoms, conditions, risk_level, medicines)
        
        processing_time = time.time() - start_time
        
        # Log to database
        log_data = {
            "consultation_id": request.consultation_id,
            "patient_id": request.patient_id,
            "input_text": request.symptoms_text,
            "language": request.language,
            "model_version": "1.0.0",
            "predictions": {
                "conditions": conditions,
                "risk_level": risk_level,
                "red_flags": red_flags,
                "medicines": medicines,
                "ddi_alerts": ddi_alerts,
            },
            "processing_time_ms": processing_time * 1000,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        db_client.insert_inference_log(log_data)
        
        logger.info("Inference completed successfully",
                   {
                       "consultation_id": request.consultation_id,
                       "processing_time_ms": processing_time * 1000,
                       "risk_level": risk_level
                   }, "INFERENCE")
        
        return AnalysisResponse(
            conditions=conditions,
            risk_level=risk_level,
            has_red_flags=has_red_flags,
            red_flags=red_flags,
            medicines=medicines,
            ddi_alerts=ddi_alerts,
            summary=summary,
            model_source="ML Models v1.0.0",
            processing_time=processing_time,
        )
    
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error("Inference failed",
                    {
                        "consultation_id": request.consultation_id,
                        "processing_time_ms": processing_time * 1000,
                    }, "INFERENCE", str(e))
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")


@app.get("/metrics")
async def get_metrics():
    """Get inference metrics"""
    logger.info("Metrics request", module="APP")
    return {
        "models_loaded": len(engine.models),
        "vectorizers_loaded": len(engine.vectorizers),
        "service_status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/status")
async def get_status():
    """Get detailed service status"""
    logger.info("Status request", module="APP")
    return {
        "service": "AarogyaGuard ML Service",
        "version": "1.0.0",
        "status": "operational",
        "database_connected": db_client.db is not None,
        "timestamp": datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
