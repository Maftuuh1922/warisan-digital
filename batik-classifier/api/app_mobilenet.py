"""
Batik Classifier API - MobileNet Ultimate Version
Model: MobileNetV2 Ultimate (Fine-tuned)
Author: Muhammad Maftuh
Last Updated: December 2025
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import os
import sys
import json

# Set TensorFlow logging
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

# Import TensorFlow
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("⚠️  TensorFlow tidak tersedia. Install dengan: pip install tensorflow")
    sys.exit(1)

app = Flask(__name__)
CORS(app)  # Enable CORS untuk frontend

# ============================================================
# KONFIGURASI MODEL
# ============================================================
print("🚀 Loading MobileNet Ultimate model...")

# Tentukan path model
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
USER_HOME = os.path.expanduser("~")
DOWNLOADS_DIR = os.path.join(USER_HOME, "Downloads")

# Priority: models/ directory, fallback ke Downloads/
MODEL_PATH = os.path.join(MODEL_DIR, 'batik_mobilenet_ultimate_final.keras')
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(DOWNLOADS_DIR, 'batik_mobilenet_ultimate_final.keras')

CLASSES_PATH = os.path.join(MODEL_DIR, 'batik_classes_mobilenet_ultimate.json')
if not os.path.exists(CLASSES_PATH):
    CLASSES_PATH = os.path.join(DOWNLOADS_DIR, 'batik_classes_mobilenet_ultimate.json')

CONFIG_PATH = os.path.join(MODEL_DIR, 'batik_config_mobilenet_ultimate.json')
if not os.path.exists(CONFIG_PATH):
    CONFIG_PATH = os.path.join(DOWNLOADS_DIR, 'batik_config_mobilenet_ultimate.json')

INPUT_SIZE = (224, 224)  # MobileNetV2 Ultimate (from config)

# ============================================================
# LOAD MODEL & METADATA
# ============================================================

# Load classes
try:
    with open(CLASSES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if isinstance(data, list):
        classes = data
    elif isinstance(data, dict) and "classes" in data:
        classes = data["classes"]
    else:
        raise ValueError("Format batik_classes_mobilenet_ultimate.json tidak dikenali")
    
    print(f"✅ Loaded {len(classes)} classes")
except Exception as e:
    print(f"❌ Gagal load classes: {e}")
    sys.exit(1)

# Load config (optional)
config = {}
try:
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
        print(f"✅ Config loaded")
except Exception as e:
    print(f"⚠️  Config tidak tersedia: {e}")

# Load Keras model
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model tidak ditemukan di: {MODEL_PATH}")
    
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"✅ Model loaded dari: {MODEL_PATH}")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
except Exception as e:
    print(f"❌ Gagal load model: {e}")
    sys.exit(1)

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def preprocess_mobilenet(x: np.ndarray) -> np.ndarray:
    """Preprocessing MobileNetV2: scale pixel to [-1, 1]."""
    return (x / 127.5) - 1.0


def preprocess_image(image_file) -> np.ndarray:
    """
    Preprocess uploaded image untuk MobileNet Ultimate
    
    Args:
        image_file: File object dari request.files
    
    Returns:
        np.ndarray: Preprocessed image array
    """
    # Read image
    img = Image.open(io.BytesIO(image_file.read()))
    
    # Convert to RGB
    if img.mode != "RGB":
        img = img.convert("RGB")
    
    # Resize to model input size
    img = img.resize(INPUT_SIZE, Image.Resampling.LANCZOS)
    
    # Convert to array
    arr = np.array(img, dtype=np.float32)
    
    # Add batch dimension
    arr = np.expand_dims(arr, axis=0)
    
    # Apply MobileNet preprocessing
    arr = preprocess_mobilenet(arr)
    
    return arr


# ============================================================
# API ROUTES
# ============================================================

@app.route('/')
def home():
    """API info endpoint"""
    return jsonify({
        'success': True,
        'message': 'Batik Classifier API - MobileNet Ultimate',
        'version': '2.0',
        'model': {
            'type': 'MobileNetV2 Ultimate',
            'classes': len(classes),
            'input_size': INPUT_SIZE,
            'accuracy': config.get('test_accuracy', 'N/A')
        },
        'endpoints': {
            'predict': '/predict (POST)',
            'classes': '/classes (GET)',
            'info': '/info (GET)',
            'health': '/health (GET)'
        }
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict batik motif dari uploaded image
    
    Request: multipart/form-data dengan field 'image'
    Response: JSON dengan prediction dan confidence scores
    """
    try:
        # Check if image in request
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image provided. Please upload an image file.'
            }), 400
        
        file = request.files['image']
        
        # Check empty filename
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'Empty filename'
            }), 400
        
        # Validate file extension
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
        file_ext = file.filename.rsplit('.', 1)[-1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
            }), 400
        
        # Preprocess image
        try:
            x = preprocess_image(file)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to process image: {str(e)}'
            }), 400
        
        # Predict
        preds = model.predict(x, verbose=0)[0]
        
        # Get top prediction
        top_idx = int(np.argmax(preds))
        top_conf = float(preds[top_idx])
        
        # Get top 5 predictions
        top5_idx = np.argsort(preds)[-5:][::-1]
        top_5 = [
            {
                'class': classes[int(i)],
                'confidence': float(preds[int(i)]),
                'percentage': f"{float(preds[int(i)]) * 100:.2f}%"
            }
            for i in top5_idx
        ]
        
        return jsonify({
            'success': True,
            'prediction': classes[top_idx],
            'confidence': top_conf,
            'percentage': f"{top_conf * 100:.2f}%",
            'top_5_predictions': top_5,
            'model': 'MobileNetV2 Ultimate'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/classes', methods=['GET'])
def get_classes():
    """Get list of all batik classes"""
    return jsonify({
        'success': True,
        'total': len(classes),
        'classes': classes
    })


@app.route('/info', methods=['GET'])
def get_info():
    """Get model information dan metadata"""
    return jsonify({
        'success': True,
        'model_info': {
            'type': 'MobileNetV2 Ultimate',
            'n_classes': len(classes),
            'input_size': INPUT_SIZE,
            'accuracy': config.get('test_accuracy', 'N/A'),
            'val_accuracy': config.get('val_accuracy', 'N/A'),
            'epochs': config.get('epochs', 'N/A'),
            'batch_size': config.get('batch_size', 'N/A'),
            'optimizer': config.get('optimizer', 'N/A'),
            'model_path': MODEL_PATH
        }
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'tensorflow_version': tf.__version__
    })


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == '__main__':
    # Get port from environment atau default ke 5000
    port = int(os.environ.get('PORT', 5000))
    
    print("\n" + "="*70)
    print("🎯 BATIK CLASSIFIER API - MOBILENET ULTIMATE")
    print("="*70)
    print(f"✅ Model Type: MobileNetV2 Ultimate")
    print(f"✅ Total Classes: {len(classes)}")
    print(f"✅ Input Size: {INPUT_SIZE}")
    print(f"✅ TensorFlow: {tf.__version__}")
    if 'test_accuracy' in config:
        print(f"✅ Test Accuracy: {config['test_accuracy']}")
    print(f"✅ Server running on: http://0.0.0.0:{port}")
    print("\n📋 API Endpoints:")
    print("   GET  /          - API info")
    print("   POST /predict   - Predict batik image")
    print("   GET  /classes   - List all classes")
    print("   GET  /info      - Model information")
    print("   GET  /health    - Health check")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=False)
