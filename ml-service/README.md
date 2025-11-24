# Batik Pattern Recognition - ML Service

## 🎯 Overview

Custom machine learning service untuk klasifikasi motif batik dengan:
- **Feature Extraction**: 300+ fitur (warna, tekstur, geometri)
- **Classification**: Ensemble SVM + Random Forest
- **Similarity Search**: Pencarian pola serupa berbasis cosine similarity
- **Explainability**: Heatmap visualisasi fokus pola

## 🚀 Quick Start

### Option 1: Local Development

1. **Setup Environment**
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure Kaggle API**
```bash
# Get API credentials from https://www.kaggle.com/settings
mkdir -p ~/.kaggle
cp kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

3. **Train Model**
```bash
# Open and run the training notebook
cd ../notebooks
jupyter notebook train_batik_classifier.ipynb
```

Run all cells in the notebook to:
- Download dataset from Kaggle
- Extract features from images
- Train ensemble model (SVM + Random Forest)
- Save model artifacts

4. **Start ML Service**
```bash
cd ../ml-service
chmod +x start.sh
./start.sh
```

Service akan tersedia di `http://localhost:8000`

### Option 2: Docker

```bash
# Build dan jalankan dengan Docker Compose
docker-compose up --build

# Atau manual
cd ml-service
docker build -t batik-ml-service .
docker run -p 8000:8000 -v $(pwd)/models:/app/models batik-ml-service
```

## 📚 API Endpoints

### 1. Classification
```bash
POST /api/classify
Content-Type: multipart/form-data

# Example
curl -X POST http://localhost:8000/api/classify \
  -F "file=@batik_sample.jpg"
```

Response:
```json
{
  "predicted_class": "Batik Parang",
  "confidence": 0.92,
  "probabilities": {
    "Batik Parang": 0.92,
    "Batik Kawung": 0.05,
    ...
  },
  "top_k_predictions": [...],
  "feature_insights": {
    "color": "Vibrant, saturated colors",
    "texture": "Complex, intricate patterns",
    "geometry": "Dense geometric patterns"
  }
}
```

### 2. Similarity Search
```bash
POST /api/similarity?top_k=5
Content-Type: multipart/form-data

curl -X POST "http://localhost:8000/api/similarity?top_k=5" \
  -F "file=@batik_sample.jpg"
```

### 3. Explainability
```bash
POST /api/explain
Content-Type: multipart/form-data

curl -X POST http://localhost:8000/api/explain \
  -F "file=@batik_sample.jpg"
```

Response berisi heatmap (base64) dan analisis fitur.

### 4. Register Features
```bash
POST /api/register-features
Content-Type: multipart/form-data

curl -X POST http://localhost:8000/api/register-features \
  -F "file=@batik.jpg" \
  -F "item_id=batik-001" \
  -F 'metadata={"name":"Batik Parang","artisan":"John Doe"}'
```

## 🧪 Testing

```bash
# Test classification
python -c "
import requests
with open('test_image.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/classify',
        files={'file': f}
    )
print(response.json())
"
```

## 🔧 Configuration

Edit `.env` file:
```bash
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key
ML_SERVICE_PORT=8000
MODEL_PATH=./models
DATA_PATH=./data
```

## 📊 Model Architecture

### Feature Extraction (300+ dimensions)

1. **Color Features (90 dims)**
   - HSV histograms (24 bins)
   - LAB histograms (24 bins)
   - Statistical moments (mean, std, skew, kurtosis)
   - K-means dominant colors

2. **Texture Features (150+ dims)**
   - Gabor filters (36 kernels × 4 orientations × 3 frequencies)
   - Local Binary Patterns (LBP)
   - Haralick features from GLCM
   - Co-occurrence matrix properties

3. **Geometry Features (50+ dims)**
   - Histogram of Oriented Gradients (HOG)
   - Edge density and orientation
   - Hough line detection
   - Shape statistics

### Classification

- **SVM** with RBF kernel (GridSearchCV optimized)
- **Random Forest** (200 estimators, max depth optimization)
- **Ensemble**: Soft voting classifier

Typical performance: 85-95% accuracy (tergantung dataset)

## 🐛 Troubleshooting

### Model not found
```bash
# Train model terlebih dahulu
cd ../notebooks
jupyter notebook train_batik_classifier.ipynb
```

### Kaggle API error
```bash
# Verify credentials
cat ~/.kaggle/kaggle.json
# Re-download from https://www.kaggle.com/settings
```

### Port already in use
```bash
# Change port in .env
ML_SERVICE_PORT=8001

# Or kill existing process
lsof -ti:8000 | xargs kill -9
```

### Memory issues
```bash
# Reduce batch size or image resolution in feature_extractor.py
# target_size=(224, 224) -> target_size=(128, 128)
```

## 📦 Production Deployment

### Railway / Render
```bash
# Add to root package.json
"scripts": {
  "ml-start": "cd ml-service && uvicorn main:app --host 0.0.0.0 --port $PORT"
}
```

### AWS / GCP
```bash
# Build Docker image
docker build -t batik-ml:latest ml-service/

# Push to registry
docker tag batik-ml:latest gcr.io/your-project/batik-ml
docker push gcr.io/your-project/batik-ml

# Deploy to Cloud Run / ECS
```

### Environment Variables
```bash
ML_SERVICE_URL=https://your-ml-service.com
```

Update `worker/user-routes.ts`:
```typescript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
```

## 📝 License

Part of BatikIn project - MIT License
