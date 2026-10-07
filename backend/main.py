from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uvicorn
import os

from backend.pipeline import VIIRSFireRiskPipeline

app = FastAPI(
    title="NASA VIIRS Fire Risk ML & Globe Dashboard API",
    description="Backend API powering NASA VIIRS Data Preprocessing, Feature Engineering, Model Training (Random Forest, XGBoost, LightGBM, ANN), Evaluation, and Real-Time Risk Prediction.",
    version="1.0.0"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Pipeline Instance
pipeline = VIIRSFireRiskPipeline(data_path="data/viirs_fire_data.csv")

# Run pipeline on startup
@app.on_event("startup")
def startup_event():
    print("Initializing NASA VIIRS Fire Risk ML Pipeline...")
    pipeline.run_pipeline()


class PredictionRequest(BaseModel):
    latitude: float = Field(..., example=38.45)
    longitude: float = Field(..., example=-122.30)
    bright_ti4: float = Field(345.5, example=345.5, description="Brightness Temp I4 (Kelvin)")
    bright_ti5: float = Field(302.1, example=302.1, description="Brightness Temp I5 (Kelvin)")
    frp: float = Field(85.0, example=85.0, description="Fire Radiative Power (MW)")
    confidence: Optional[str] = Field("nominal", example="high", description="low, nominal, high")
    acq_datetime: Optional[str] = Field(None, example="2025-08-15T14:30:00")


@app.get("/")
def read_root():
    return {
        "service": "NASA VIIRS Fire Risk ML API",
        "status": "online",
        "pipeline_trained": pipeline.is_trained
    }


@app.post("/api/pipeline/run")
def trigger_pipeline():
    """
    Triggers complete pipeline training, feature engineering, and evaluation.
    """
    results = pipeline.run_pipeline()
    return results


@app.get("/api/pipeline/status")
def get_pipeline_status():
    if not pipeline.is_trained:
        raise HTTPException(status_code=400, detail="Pipeline has not been executed yet.")
    
    return {
        "is_trained": pipeline.is_trained,
        "preprocessing_report": pipeline.preprocessing_report,
        "labeling_stats": pipeline.labeling_stats,
        "num_features": len(pipeline.feature_cols),
        "feature_list": pipeline.feature_cols,
        "total_records": len(pipeline.processed_df) if pipeline.processed_df is not None else 0
    }


@app.get("/api/models/evaluation")
def get_model_evaluation():
    """
    Returns evaluation metrics, confusion matrices, and feature importances for all 4 models.
    """
    if not pipeline.is_trained or pipeline.evaluation_results is None:
        raise HTTPException(status_code=400, detail="Pipeline has not been trained yet.")
    return pipeline.evaluation_results


@app.post("/api/predict")
def predict_fire_risk(req: PredictionRequest):
    """
    Predicts Fire Risk level across Random Forest, XGBoost, LightGBM, and ANN for custom parameters.
    """
    if not pipeline.is_trained or pipeline.predictor_engine is None:
        raise HTTPException(status_code=400, detail="Pipeline has not been trained yet.")

    try:
        prediction = pipeline.predictor_engine.predict_single(
            latitude=req.latitude,
            longitude=req.longitude,
            bright_ti4=req.bright_ti4,
            bright_ti5=req.bright_ti5,
            frp=req.frp,
            confidence=req.confidence,
            acq_datetime=req.acq_datetime
        )
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/api/data/globe-points")
def get_globe_data(limit: int = Query(1500, ge=10, le=5000)):
    """
    Returns active fire locations formatted for 3D Globe visualization.
    """
    if not pipeline.is_trained:
        raise HTTPException(status_code=400, detail="Pipeline data not loaded.")
    points = pipeline.get_globe_points(limit=limit)
    return {"count": len(points), "points": points}


@app.get("/api/data/sample-presets")
def get_sample_presets():
    """
    Returns preset hotspot test cases for the interactive predictor.
    """
    return [
        {
            "name": "California Wildfire Complex",
            "latitude": 38.5816,
            "longitude": -121.4944,
            "bright_ti4": 362.5,
            "bright_ti5": 308.2,
            "frp": 145.8,
            "confidence": "high"
        },
        {
            "name": "Amazon Deforestation Burn",
            "latitude": -8.7612,
            "longitude": -63.9039,
            "bright_ti4": 348.0,
            "bright_ti5": 301.5,
            "frp": 88.4,
            "confidence": "nominal"
        },
        {
            "name": "Australian Bushfire Event",
            "latitude": -33.8688,
            "longitude": 151.2093,
            "bright_ti4": 371.2,
            "bright_ti5": 312.0,
            "frp": 210.5,
            "confidence": "high"
        },
        {
            "name": "Siberian Boreal Forest Fire",
            "latitude": 62.0355,
            "longitude": 129.6755,
            "bright_ti4": 332.1,
            "bright_ti5": 294.0,
            "frp": 35.2,
            "confidence": "nominal"
        },
        {
            "name": "Cool Surface Noise / Non-Fire",
            "latitude": 45.5017,
            "longitude": -73.5673,
            "bright_ti4": 301.2,
            "bright_ti5": 288.4,
            "frp": 2.1,
            "confidence": "low"
        }
    ]


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
