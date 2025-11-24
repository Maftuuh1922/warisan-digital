"""
FastAPI Service for VGG16 Batik Classification
This version uses VGG16 model trained on real batik dataset
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, List
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import joblib
from pathlib import Path

app = FastAPI(title="Batik VGG16 Classification API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
model = None
label_encoder = None
metrics = None

# Paths
MODEL_PATH = Path(__file__).parent / 'models' / 'vgg16_batik_classifier.h5'
LABEL_ENCODER_PATH = Path(__file__).parent / 'models' / 'label_encoder.joblib'
METRICS_PATH = Path(__file__).parent / 'models' / 'training_metrics.json'

IMG_SIZE = (224, 224)


def load_model_and_encoder():
    """Load VGG16 model and label encoder"""
    global model, label_encoder, metrics
    
    try:
        if MODEL_PATH.exists():
            print(f"Loading VGG16 model from {MODEL_PATH}...")
            model = keras.models.load_model(MODEL_PATH)
            print("✅ VGG16 model loaded successfully")
        else:
            print(f"⚠️ Model not found: {MODEL_PATH}")
            print("Please train the model first: python train_vgg16.py")
            return False
        
        if LABEL_ENCODER_PATH.exists():
            print(f"Loading label encoder from {LABEL_ENCODER_PATH}...")
            label_encoder = joblib.load(LABEL_ENCODER_PATH)
            print("✅ Label encoder loaded successfully")
        else:
            print(f"⚠️ Label encoder not found: {LABEL_ENCODER_PATH}")
            return False
        
        if METRICS_PATH.exists():
            import json
            with open(METRICS_PATH) as f:
                metrics = json.load(f)
            print(f"✅ Model metrics loaded - Accuracy: {metrics.get('test_accuracy', 0):.2%}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False


@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    success = load_model_and_encoder()
    if success:
        print("🚀 VGG16 Batik Classification Service Ready!")
    else:
        print("⚠️ Service started but model not loaded. Train model first.")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Batik VGG16 Classification API",
        "status": "running",
        "model_loaded": model is not None,
        "version": "2.0-vgg16"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "label_encoder_loaded": label_encoder is not None,
        "metrics": metrics,
        "model_type": "VGG16 Transfer Learning"
    }


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Preprocess image for VGG16"""
    try:
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to expected size
        img = img.resize(IMG_SIZE)
        
        # Convert to array
        img_array = np.array(img)
        
        # VGG16 preprocessing
        from tensorflow.keras.applications.vgg16 import preprocess_input
        img_array = preprocess_input(img_array)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image preprocessing failed: {str(e)}")


@app.post("/api/classify")
async def classify_batik(file: UploadFile = File(...)):
    """
    Classify batik image using VGG16 model
    """
    if model is None or label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first: python train_vgg16.py"
        )
    
    try:
        # Read image
        image_bytes = await file.read()
        
        # Preprocess image
        img_array = preprocess_image(image_bytes)
        
        # Predict
        predictions = model.predict(img_array, verbose=0)
        
        # Get probabilities for all classes
        probabilities = predictions[0]
        
        # Get predicted class
        predicted_idx = np.argmax(probabilities)
        predicted_class = label_encoder.classes_[predicted_idx]
        confidence = float(probabilities[predicted_idx])
        
        # Get all class probabilities
        all_probabilities = {
            str(class_name): float(prob)
            for class_name, prob in zip(label_encoder.classes_, probabilities)
        }
        
        # Get top 3 predictions
        top_k_indices = np.argsort(probabilities)[-3:][::-1]
        top_k_predictions = [
            {
                "class": str(label_encoder.classes_[idx]),
                "probability": float(probabilities[idx])
            }
            for idx in top_k_indices
        ]
        
        return {
            "predicted_class": str(predicted_class),
            "confidence": confidence,
            "probabilities": all_probabilities,
            "top_k_predictions": top_k_predictions,
            "model_type": "VGG16 Transfer Learning",
            "model_accuracy": metrics.get('test_accuracy') if metrics else None
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@app.post("/api/classify-batch")
async def classify_batch(files: List[UploadFile] = File(...)):
    """
    Classify multiple batik images
    """
    if model is None or label_encoder is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    results = []
    
    for file in files:
        try:
            image_bytes = await file.read()
            img_array = preprocess_image(image_bytes)
            predictions = model.predict(img_array, verbose=0)
            
            predicted_idx = np.argmax(predictions[0])
            predicted_class = label_encoder.classes_[predicted_idx]
            confidence = float(predictions[0][predicted_idx])
            
            results.append({
                "filename": file.filename,
                "predicted_class": str(predicted_class),
                "confidence": confidence
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
