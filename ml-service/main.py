"""
FastAPI Inference Service for Batik Pattern Recognition
Provides REST API endpoints for classification, similarity search, and explainability
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import joblib
from pathlib import Path
import io
from PIL import Image
import base64
import logging

# Use simple feature extractor (no opencv/scipy dependencies)
from feature_extractor_simple import SimpleBatikFeatureExtractor
from dataset_api import router as dataset_router, BATIK_CLASSES, create_training_data

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Batik Pattern Recognition API",
    description="ML-powered batik classification, similarity search, and explainability",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
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
feature_database = {}  # In-memory feature storage (use DB in production)


# Response models
class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
    probabilities: Dict[str, float]
    top_k_predictions: List[Dict[str, float]]
    feature_insights: Dict[str, str]


class SimilarityResponse(BaseModel):
    similar_items: List[Dict[str, any]]
    query_features: List[float]


class ExplainabilityResponse(BaseModel):
    heatmap_base64: str
    important_features: List[Dict[str, any]]
    analysis: Dict[str, str]


@app.on_event("startup")
async def load_models():
    """Load models and initialize feature extractor on startup"""
    global models, feature_extractor
    
    try:
        logger.info("Loading models...")
        
        # Load ensemble model and components
        model_path = MODEL_DIR / "batik_classifier_ensemble.joblib"
        if model_path.exists():
            models = joblib.load(model_path)
            logger.info(f"✓ Loaded ensemble model (Accuracy: {models['metrics']['ensemble_accuracy']:.4f})")
        else:
            logger.warning("Model file not found. Using fallback mode.")
            models = {'ensemble_model': None}
        
        # Initialize feature extractor
        feature_extractor = BatikFeatureExtractor(target_size=(224, 224))
        logger.info("✓ Feature extractor initialized")
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Batik Pattern Recognition API",
        "status": "running",
        "model_loaded": models.get('ensemble_model') is not None,
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models": {
            "ensemble": models.get('ensemble_model') is not None,
            "scaler": models.get('scaler') is not None,
            "label_encoder": models.get('label_encoder') is not None,
        },
        "metrics": models.get('metrics', {}),
        "feature_database_size": len(feature_database)
    }


@app.post("/api/classify", response_model=PredictionResponse)
async def classify_batik(file: UploadFile = File(...)):
    """
    Classify batik motif from uploaded image
    
    Returns:
    - predicted_class: Most likely batik motif
    - confidence: Confidence score (0-1)
    - probabilities: Probability for each class
    - top_k_predictions: Top 5 predictions
    - feature_insights: Interpretable feature descriptions
    """
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Extract features
        feature_dict = feature_extractor.extract_all_features(image)
        features = feature_dict['combined'].reshape(1, -1)
        
        # Scale features
        features_scaled = models['scaler'].transform(features)
        
        # Predict
        prediction = models['ensemble_model'].predict(features_scaled)[0]
        probabilities = models['ensemble_model'].predict_proba(features_scaled)[0]
        
        # Get class names
        label_encoder = models['label_encoder']
        predicted_class = label_encoder.inverse_transform([prediction])[0]
        
        # Build response
        prob_dict = {
            label_encoder.inverse_transform([i])[0]: float(prob)
            for i, prob in enumerate(probabilities)
        }
        
        # Top-k predictions
        top_k_indices = np.argsort(probabilities)[-5:][::-1]
        top_k = [
            {
                "class": label_encoder.inverse_transform([i])[0],
                "probability": float(probabilities[i])
            }
            for i in top_k_indices
        ]
        
        # Feature insights
        insights = generate_feature_insights(feature_dict)
        
        return PredictionResponse(
            predicted_class=predicted_class,
            confidence=float(probabilities[prediction]),
            probabilities=prob_dict,
            top_k_predictions=top_k,
            feature_insights=insights
        )
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/similarity")
async def find_similar(
    file: UploadFile = File(...),
    top_k: int = 5
):
    """
    Find similar batik patterns using feature similarity
    
    Parameters:
    - file: Image file
    - top_k: Number of similar items to return
    
    Returns list of similar items with similarity scores
    """
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Extract features
        feature_dict = feature_extractor.extract_all_features(image)
        query_features = feature_dict['combined']
        
        # Calculate similarity with database
        similarities = []
        for item_id, stored_features in feature_database.items():
            # Cosine similarity
            similarity = cosine_similarity(query_features, stored_features)
            similarities.append({
                "item_id": item_id,
                "similarity": float(similarity),
                **stored_features.get('metadata', {})
            })
        
        # Sort by similarity
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        
        return SimilarityResponse(
            similar_items=similarities[:top_k],
            query_features=query_features.tolist()
        )
        
    except Exception as e:
        logger.error(f"Similarity search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/explain", response_model=ExplainabilityResponse)
async def explain_prediction(file: UploadFile = File(...)):
    """
    Generate explainability visualization and analysis
    
    Returns:
    - heatmap_base64: Base64-encoded heatmap showing important regions
    - important_features: List of most important features
    - analysis: Human-readable analysis
    """
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Extract features
        feature_dict = feature_extractor.extract_all_features(image)
        
        # Create heatmap
        heatmap = create_explainability_heatmap(image, feature_extractor)
        
        # Convert heatmap to base64
        _, buffer = cv2.imencode('.png', cv2.cvtColor(heatmap, cv2.COLOR_RGB2BGR))
        heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Analyze features
        important_features = analyze_features(feature_dict)
        analysis = generate_analysis(feature_dict)
        
        return ExplainabilityResponse(
            heatmap_base64=heatmap_base64,
            important_features=important_features,
            analysis=analysis
        )
        
    except Exception as e:
        logger.error(f"Explainability error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/register-features")
async def register_batik_features(
    item_id: str,
    file: UploadFile = File(...),
    metadata: Optional[Dict] = None
):
    """
    Register batik features in database for similarity search
    
    Parameters:
    - item_id: Unique identifier for the batik item
    - file: Image file
    - metadata: Additional metadata (name, artisan, etc.)
    """
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Extract features
        feature_dict = feature_extractor.extract_all_features(image)
        
        # Store in database
        feature_database[item_id] = {
            'features': feature_dict['combined'],
            'metadata': metadata or {}
        }
        
        return {
            "status": "success",
            "item_id": item_id,
            "feature_dimension": len(feature_dict['combined']),
            "database_size": len(feature_database)
        }
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions
def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors"""
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2 + 1e-8)


def generate_feature_insights(feature_dict: Dict) -> Dict[str, str]:
    """Generate human-readable insights from features"""
    color_features = feature_dict['color']
    texture_features = feature_dict['texture']
    geometry_features = feature_dict['geometry']
    
    insights = {}
    
    # Color analysis
    hsv_mean = color_features[24:27]  # HSV mean values
    if hsv_mean[1] > 100:  # High saturation
        insights['color'] = "Vibrant, saturated colors"
    else:
        insights['color'] = "Subtle, muted tones"
    
    # Texture analysis
    texture_var = np.var(texture_features[:50])
    if texture_var > 0.1:
        insights['texture'] = "Complex, intricate patterns"
    else:
        insights['texture'] = "Simple, uniform texture"
    
    # Geometry analysis
    edge_density = geometry_features[0] if len(geometry_features) > 0 else 0
    if edge_density > 0.3:
        insights['geometry'] = "Dense geometric patterns"
    else:
        insights['geometry'] = "Flowing, organic shapes"
    
    return insights


def analyze_features(feature_dict: Dict) -> List[Dict]:
    """Analyze and return important features"""
    combined = feature_dict['combined']
    
    # Find features with highest magnitude
    indices = np.argsort(np.abs(combined))[-10:][::-1]
    
    features = []
    for idx in indices:
        feature_type = "unknown"
        if idx < 60:
            feature_type = "color"
        elif idx < 200:
            feature_type = "texture"
        else:
            feature_type = "geometry"
        
        features.append({
            "index": int(idx),
            "type": feature_type,
            "value": float(combined[idx]),
            "importance": float(np.abs(combined[idx]))
        })
    
    return features


def generate_analysis(feature_dict: Dict) -> Dict[str, str]:
    """Generate detailed analysis text"""
    insights = generate_feature_insights(feature_dict)
    
    return {
        "summary": f"This batik pattern shows {insights['color']} with {insights['texture']} and {insights['geometry']}.",
        "color_analysis": insights['color'],
        "texture_analysis": insights['texture'],
        "geometry_analysis": insights['geometry'],
        "recommendation": "Based on the extracted features, this pattern is suitable for formal or traditional occasions."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
