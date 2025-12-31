"""
FastAPI ML Inference Service for AarogyaGuard
Provides REST API for machine learning predictions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from inference_engine import InferenceEngine
import json

app = FastAPI(title="AarogyaGuard ML Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize inference engine
engine = InferenceEngine()


class AnalysisRequest(BaseModel):
    symptoms_text: str
    language: str = "english"
    current_medications: List[str] = []


class AnalysisResponse(BaseModel):
    conditions: List[Dict[str, Any]]
    risk_level: str
    has_red_flags: bool
    red_flags: List[str]
    medicines: List[Dict[str, Any]]
    ddi_alerts: List[Dict[str, Any]]
    summary: str
    model_source: str


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AarogyaGuard ML Service"}


@app.post("/infer", response_model=AnalysisResponse)
async def run_inference(request: AnalysisRequest):
    """Run ML inference on patient symptoms"""
    try:
        # Extract symptoms
        symptoms = request.symptoms_text.lower().split()

        # Get predictions
        conditions, _ = engine.predict_conditions(request.symptoms_text)
        risk_level, _ = engine.predict_risk_level(symptoms, 45)
        has_red_flags, red_flags = engine.detect_red_flags(symptoms)
        medicines = engine.recommend_medicines([c["condition"] for c in conditions])
        ddi_alerts = engine.check_ddi([m["id"] for m in medicines], request.current_medications)
        summary = engine.generate_consultation_summary(symptoms, conditions, risk_level, medicines)

        return AnalysisResponse(
            conditions=conditions,
            risk_level=risk_level,
            has_red_flags=has_red_flags,
            red_flags=red_flags,
            medicines=medicines,
            ddi_alerts=ddi_alerts,
            summary=summary,
            model_source="ML Models",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")


@app.get("/metrics")
async def get_metrics():
    """Get inference metrics"""
    return {
        "models_loaded": len(engine.models),
        "vectorizers_loaded": len(engine.vectorizers),
        "fallback_knowledge_size": sum(len(v) if isinstance(v, dict) else 1 for v in engine.fallback_knowledge.values()),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
