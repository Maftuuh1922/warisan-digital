"""
Simplified FastAPI Service - No OpenCV Dependencies
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import joblib
from pathlib import Path
import io
from PIL import Image
import logging

from feature_extractor_simple import SimpleBatikFeatureExtractor
from dataset_api import router as dataset_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Batik Pattern Recognition API",
    description="ML-powered batik classification (simplified)",
    version="1.0.0-simple"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include dataset API routes
app.include_router(dataset_router)

# Global model storage
MODEL_DIR = Path("./models")
models = {}
feature_extractor = None

class PredictionResponse(BaseModel):
    motif: str
    confidence: float
    probabilities: Dict[str, float]
    top_3: List[Dict[str, float]]
    features_count: int

class SimilarityResponse(BaseModel):
    similar_batiks: List[Dict]
    query_features_count: int

@app.on_event("startup")
async def load_models():
    """Load trained models on startup"""
    global models, feature_extractor
    
    try:
        logger.info("Loading models...")
        
        # Load ensemble model
        model_path = MODEL_DIR / "batik_classifier_ensemble.joblib"
        if model_path.exists():
            models = joblib.load(model_path)
            logger.info(f"✓ Loaded model (Accuracy: {models['metrics']['ensemble_accuracy']:.4f})")
        else:
            logger.warning("Model not found")
            models = {'ensemble_model': None}
        
        # Initialize feature extractor
        feature_extractor = SimpleBatikFeatureExtractor()
        logger.info("✓ Feature extractor ready")
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise

@app.get("/")
async def root():
    return {
        "service": "Batik Recognition API",
        "status": "running",
        "version": "1.0.0-simple"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": models.get('ensemble_model') is not None,
        "metrics": models.get('metrics', {})
    }

@app.post("/api/classify")
async def classify_batik(file: UploadFile = File(...)):
    """Classify batik motif from uploaded image"""
    
    if not models.get('ensemble_model'):
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image = image.resize((224, 224))
        image_array = np.array(image)
        
        # Extract features
        features = feature_extractor.extract_features(image_array)
        features = features.reshape(1, -1)
        
        # Scale features
        scaler = models['scaler']
        features_scaled = scaler.transform(features)
        
        # Predict
        ensemble = models['ensemble_model']
        label_encoder = models['label_encoder']
        
        prediction = ensemble.predict(features_scaled)[0]
        probabilities = ensemble.predict_proba(features_scaled)[0]
        
        # Get class name - convert numpy types to Python native
        motif_name = str(label_encoder.classes_[prediction])
        confidence = float(probabilities[prediction])
        
        # Create probabilities dict - ensure all keys/values are Python native
        prob_dict = {
            str(label_encoder.classes_[i]): float(probabilities[i])
            for i in range(len(probabilities))
        }
        
        # Get top 3
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        top_k_predictions = [
            {
                "class": str(label_encoder.classes_[i]),
                "probability": float(probabilities[i])
            }
            for i in top_3_indices
        ]
        
        # Return in format expected by worker
        return {
            "predicted_class": motif_name,
            "confidence": confidence,
            "probabilities": prob_dict,
            "top_k_predictions": top_k_predictions,
            "feature_insights": {
                "color": "RGB histogram analysis",
                "texture": "Gradient and LBP texture features",
                "geometry": "Pattern geometry analysis"
            },
            "features_count": int(len(features[0]))
        }
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/similarity")
async def find_similar(file: UploadFile = File(...), top_k: int = 5):
    """Find similar batik patterns (mock for now)"""
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image = image.resize((224, 224))
        image_array = np.array(image)
        
        # Extract features
        features = feature_extractor.extract_features(image_array)
        
        # Mock response (no feature database yet)
        return SimilarityResponse(
            similar_batiks=[
                {"id": "mock_1", "similarity": 0.95, "motif": "Batik Parang"},
                {"id": "mock_2", "similarity": 0.87, "motif": "Batik Kawung"},
            ],
            query_features_count=len(features)
        )
        
    except Exception as e:
        logger.error(f"Similarity error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/explain")
async def explain_prediction(file: UploadFile = File(...)):
    """Explain prediction (simplified - no heatmap)"""
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        image = image.resize((224, 224))
        image_array = np.array(image)
        
        # Extract features
        features = feature_extractor.extract_features(image_array)
        
        return {
            "success": True,
            "feature_count": len(features),
            "feature_types": {
                "color": "48 features (RGB histograms)",
                "texture": "52 features (gradients, LBP, stats)"
            },
            "note": "Heatmap visualization requires OpenCV (not available in simple mode)"
        }
        
    except Exception as e:
        logger.error(f"Explain error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
