"""
Batik Classifier API - Flask Version
Accuracy: 95% (InceptionV3 + KNN)
Training: 17,000 samples, 20 batik classes
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.applications.inception_v3 import InceptionV3, preprocess_input
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import joblib
import pickle
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# ============================================================
# LOAD MODEL SAAT STARTUP
# ============================================================
print("🚀 Loading models...")

# Load InceptionV3 feature extractor
base_model = InceptionV3(weights='imagenet', include_top=False, input_shape=(299, 299, 3))
x = base_model.output
x = GlobalAveragePooling2D()(x)
feature_extractor = Model(inputs=base_model.input, outputs=x)

# Load KNN model
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
knn = joblib.load(os.path.join(MODEL_DIR, 'batik_knn_model_95acc.pkl'))

with open(os.path.join(MODEL_DIR, 'batik_classes.pkl'), 'rb') as f:
    classes = pickle.load(f)

with open(os.path.join(MODEL_DIR, 'batik_model_metadata.pkl'), 'rb') as f:
    metadata = pickle.load(f)

print(f"✅ Model loaded! Accuracy: {metadata['accuracy']*100:.2f}%")
print(f"✅ Classes: {len(classes)}")

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def process_image(image_file):
    """Process uploaded image for prediction"""
    img = Image.open(io.BytesIO(image_file.read()))
    img = img.convert('RGB')
    img = img.resize((299, 299))
    
    x_img = img_to_array(img)
    x_img = preprocess_input(x_img)
    x_img = x_img.reshape((1,) + x_img.shape)
    
    return x_img

# ============================================================
# API ROUTES
# ============================================================

@app.route('/')
def home():
    return jsonify({
        'message': 'Batik Classifier API',
        'version': '1.0',
        'model': metadata['model'],
        'accuracy': f"{metadata['accuracy']*100:.2f}%",
        'classes': len(classes),
        'endpoints': {
            'predict': '/predict (POST)',
            'classes': '/classes (GET)',
            'info': '/info (GET)'
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict batik motif from uploaded image
    
    Request: multipart/form-data with 'image' field
    Response: JSON with prediction and confidence
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image provided. Please upload an image file.'
            }), 400
        
        file = request.files['image']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'Empty filename'
            }), 400
        
        # Process image
        x_img = process_image(file)
        
        # Extract features
        feature = feature_extractor.predict(x_img, verbose=0)
        
        # Predict with KNN
        prediction = knn.predict(feature)[0]
        probabilities = knn.predict_proba(feature)[0]
        
        # Get top 5 predictions
        top_5_idx = np.argsort(probabilities)[-5:][::-1]
        top_5 = [
            {
                'class': classes[i],
                'confidence': float(probabilities[i]),
                'percentage': f"{probabilities[i]*100:.2f}%"
            }
            for i in top_5_idx
        ]
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'confidence': float(probabilities[top_5_idx[0]]),
            'percentage': f"{probabilities[top_5_idx[0]]*100:.2f}%",
            'top_5_predictions': top_5
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
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
    """Get model information"""
    return jsonify({
        'success': True,
        'model_info': {
            'accuracy': f"{metadata['accuracy']*100:.2f}%",
            'model_type': metadata['model'],
            'n_classes': metadata['n_classes'],
            'total_training_data': metadata['total_data'],
            'trained_date': metadata['trained_date'],
            'knn_parameters': metadata['knn_params']
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': True
    })

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🎯 BATIK CLASSIFIER API")
    print("="*70)
    print(f"✅ Model Accuracy: {metadata['accuracy']*100:.2f}%")
    print(f"✅ Total Classes: {len(classes)}")
    print(f"✅ Server running on: http://localhost:5000")
    print("\n📋 API Endpoints:")
    print("   GET  /          - API info")
    print("   POST /predict   - Predict batik image")
    print("   GET  /classes   - List all classes")
    print("   GET  /info      - Model information")
    print("   GET  /health    - Health check")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
