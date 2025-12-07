"""
FastAPI REST API for Batik Classification
Modern upgrade with automatic API docs
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
from pathlib import Path

# Config
MODEL_PATH = Path("models/final_model.keras")
CLASS_NAMES_PATH = Path("models/class_names.json")
IMG_SIZE = (224, 224)

# Initialize app
app = FastAPI(
    title="Batik Classification API",
    description="Modern batik classifier using EfficientNetB4 - Upgraded from VGG16 (2018)",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and classes
model = None
class_names = []


@app.on_event("startup")
async def load_model():
    """Load model on startup"""
    global model, class_names
    
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model not found: {MODEL_PATH}")
    
    if not CLASS_NAMES_PATH.exists():
        raise RuntimeError(f"Class names not found: {CLASS_NAMES_PATH}")
    
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(CLASS_NAMES_PATH, 'r') as f:
        class_names = json.load(f)
    
    print(f"✅ Model loaded: {len(class_names)} classes")


class PredictionResponse(BaseModel):
    """Response model"""
    predicted_class: str
    confidence: float
    top_5: List[Dict[str, float]]
    

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Preprocess image for prediction"""
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('RGB')
    img = img.resize(IMG_SIZE)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


@app.get("/")
async def root():
    """API root"""
    return {
        "name": "Batik Classification API",
        "version": "2.0.0",
        "status": "running",
        "model": "EfficientNetB4",
        "classes": len(class_names),
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "classes_loaded": len(class_names) > 0
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    """
    Predict batik class from uploaded image
    
    Args:
        file: Image file (jpg, png)
    
    Returns:
        Predicted class with confidence and top-5 predictions
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and preprocess image
        image_bytes = await file.read()
        img_array = preprocess_image(image_bytes)
        
        # Predict
        predictions = model.predict(img_array, verbose=0)[0]
        
        # Get top-5
        top_5_indices = np.argsort(predictions)[-5:][::-1]
        top_5 = [
            {"class": class_names[idx], "confidence": float(predictions[idx])}
            for idx in top_5_indices
        ]
        
        # Get top prediction
        top_idx = top_5_indices[0]
        predicted_class = class_names[top_idx]
        confidence = float(predictions[top_idx])
        
        return PredictionResponse(
            predicted_class=predicted_class,
            confidence=confidence,
            top_5=top_5
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/classes")
async def get_classes():
    """Get list of all supported classes"""
    return {
        "classes": class_names,
        "total": len(class_names)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
