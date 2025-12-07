"""
Batik Classifier API for Hugging Face Spaces
95% accuracy InceptionV3 + KNN model
"""

import os
import io
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import joblib

# Import TensorFlow
try:
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    import tensorflow as tf
    from tensorflow.keras.applications.inception_v3 import InceptionV3, preprocess_input
    TENSORFLOW_AVAILABLE = True
    print("✅ TensorFlow loaded successfully")
except ImportError as e:
    TENSORFLOW_AVAILABLE = False
    print(f"❌ TensorFlow not available: {e}")

app = Flask(__name__)
CORS(app)

# Global variables
model = None
label_encoder = None
scaler = None
inception_model = None
metadata = None

def load_models():
    """Load all model files"""
    global model, label_encoder, scaler, inception_model, metadata
    
    model_dir = "models"
    
    try:
        # Load KNN model
        model_path = os.path.join(model_dir, "batik_knn_model_95acc.pkl")
        model = joblib.load(model_path)
        print(f"✅ Loaded KNN model from {model_path}")
        
        # Load label encoder
        label_path = os.path.join(model_dir, "batik_classes.pkl")
        label_encoder = joblib.load(label_path)
        print(f"✅ Loaded label encoder from {label_path}")
        
        # Load scaler
        scaler_path = os.path.join(model_dir, "scaler.joblib")
        scaler = joblib.load(scaler_path)
        print(f"✅ Loaded scaler from {scaler_path}")
        
        # Load metadata
        try:
            metadata_path = os.path.join(model_dir, "batik_model_metadata.pkl")
            metadata = joblib.load(metadata_path)
            print(f"✅ Loaded metadata from {metadata_path}")
        except:
            metadata = {
                "accuracy": 0.95,
                "classes": len(label_encoder.classes_),
                "training_samples": 17000
            }
        
        # Load InceptionV3
        if TENSORFLOW_AVAILABLE:
            inception_model = InceptionV3(
                weights='imagenet',
                include_top=False,
                pooling='avg',
                input_shape=(299, 299, 3)
            )
            print("✅ InceptionV3 model loaded successfully")
        else:
            print("⚠️  TensorFlow not available, using fallback features")
        
        print("\n🎯 Model Info:")
        print(f"   - Classes: {len(label_encoder.classes_)}")
        print(f"   - Accuracy: {metadata.get('accuracy', 0.95) * 100}%")
        print(f"   - Training samples: {metadata.get('training_samples', 17000)}")
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        raise e

def extract_features(image):
    """Extract features using InceptionV3"""
    if not TENSORFLOW_AVAILABLE or inception_model is None:
        # Fallback: simple color histogram features
        img_array = np.array(image.resize((64, 64)))
        hist, _ = np.histogram(img_array.flatten(), bins=256, range=(0, 256))
        return hist.reshape(1, -1)
    
    # Resize image to 299x299 for InceptionV3
    img = image.resize((299, 299))
    img_array = np.array(img)
    
    # Convert grayscale to RGB if needed
    if len(img_array.shape) == 2:
        img_array = np.stack([img_array] * 3, axis=-1)
    elif img_array.shape[2] == 4:  # RGBA
        img_array = img_array[:, :, :3]
    
    # Preprocess
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    
    # Extract features
    features = inception_model.predict(img_array, verbose=0)
    return features

def predict_batik(image):
    """Predict batik pattern"""
    # Extract features
    features = extract_features(image)
    
    # Scale features
    if scaler is not None:
        features = scaler.transform(features)
    
    # Predict
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    
    # Get top 5 predictions
    top_indices = np.argsort(probabilities)[-5:][::-1]
    
    results = []
    for idx in top_indices:
        results.append({
            "class": label_encoder.classes_[idx],
            "confidence": float(probabilities[idx])
        })
    
    return results

@app.route("/", methods=["GET"])
def home():
    """Home endpoint"""
    return jsonify({
        "name": "Batik Classifier API",
        "version": "1.0.0",
        "description": "95% accuracy batik pattern classifier using InceptionV3 + KNN",
        "model": "InceptionV3 + KNN (n_neighbors=3)",
        "accuracy": metadata.get("accuracy", 0.95) if metadata else 0.95,
        "classes": len(label_encoder.classes_) if label_encoder else 20,
        "endpoints": {
            "/": "API information",
            "/health": "Health check",
            "/predict": "Predict batik pattern (POST with image)",
            "/classes": "Get all batik classes",
            "/info": "Get model information"
        }
    })

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "tensorflow_available": TENSORFLOW_AVAILABLE
    })

@app.route("/predict", methods=["POST"])
def predict():
    """Prediction endpoint"""
    try:
        # Check if image in request
        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "No image provided"
            }), 400
        
        # Load image
        file = request.files["image"]
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        
        # Predict
        results = predict_batik(image)
        
        return jsonify({
            "success": True,
            "predictions": results,
            "model": "InceptionV3 + KNN",
            "accuracy": metadata.get("accuracy", 0.95) if metadata else 0.95
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/classes", methods=["GET"])
def get_classes():
    """Get all classes"""
    if label_encoder is None:
        return jsonify({
            "success": False,
            "error": "Model not loaded"
        }), 500
    
    return jsonify({
        "success": True,
        "classes": label_encoder.classes_.tolist(),
        "count": len(label_encoder.classes_)
    })

@app.route("/info", methods=["GET"])
def get_info():
    """Get model information"""
    return jsonify({
        "success": True,
        "model": {
            "type": "InceptionV3 + KNN",
            "accuracy": metadata.get("accuracy", 0.95) if metadata else 0.95,
            "classes": len(label_encoder.classes_) if label_encoder else 20,
            "training_samples": metadata.get("training_samples", 17000) if metadata else 17000,
            "knn_neighbors": 3,
            "features": "InceptionV3 embeddings (2048-dim)" if TENSORFLOW_AVAILABLE else "Color histogram (256-dim)"
        },
        "tensorflow_available": TENSORFLOW_AVAILABLE
    })

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 BATIK CLASSIFIER API - HUGGING FACE SPACES")
    print("=" * 70)
    print()
    
    # Load models
    load_models()
    
    print()
    print("🚀 Batik Classifier API is running!")
    print("   - Endpoint: http://0.0.0.0:7860")
    print("   - Health: http://0.0.0.0:7860/health")
    print("   - Docs: http://0.0.0.0:7860")
    print()
    
    # Run Flask app
    app.run(host="0.0.0.0", port=7860, debug=False)
