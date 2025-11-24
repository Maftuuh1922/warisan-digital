# ML Service Testing Guide

## Manual Testing

### 1. Start Service
```bash
cd ml-service
./start.sh
```

### 2. Test Health Endpoint
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "models": {
    "ensemble": true,
    "scaler": true,
    "label_encoder": true
  },
  "metrics": { ... }
}
```

### 3. Test Classification

```bash
# Download test image
curl -o test_batik.jpg "https://example.com/batik-sample.jpg"

# Test classification
curl -X POST http://localhost:8000/api/classify \
  -F "file=@test_batik.jpg" \
  | jq '.'
```

Expected response:
```json
{
  "predicted_class": "Batik Parang",
  "confidence": 0.92,
  "probabilities": { ... },
  "top_k_predictions": [ ... ],
  "feature_insights": {
    "color": "Vibrant, saturated colors",
    "texture": "Complex, intricate patterns",
    "geometry": "Dense geometric patterns"
  }
}
```

### 4. Test Similarity Search

```bash
curl -X POST "http://localhost:8000/api/similarity?top_k=5" \
  -F "file=@test_batik.jpg" \
  | jq '.'
```

### 5. Test Explainability

```bash
curl -X POST http://localhost:8000/api/explain \
  -F "file=@test_batik.jpg" \
  -o explain_result.json

# View heatmap
echo "data:image/png;base64,$(jq -r '.heatmap_base64' explain_result.json)" > heatmap.html
```

## Python Testing Script

```python
import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("✓ Health check passed")

def test_classification(image_path):
    """Test classification endpoint"""
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/classify", files=files)
    
    assert response.status_code == 200
    data = response.json()
    
    assert 'predicted_class' in data
    assert 'confidence' in data
    assert data['confidence'] > 0 and data['confidence'] <= 1
    
    print(f"✓ Classification passed")
    print(f"  Predicted: {data['predicted_class']}")
    print(f"  Confidence: {data['confidence']:.2%}")
    
    return data

def test_similarity(image_path):
    """Test similarity search"""
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            f"{BASE_URL}/api/similarity?top_k=3", 
            files=files
        )
    
    assert response.status_code == 200
    data = response.json()
    
    assert 'similar_items' in data
    print(f"✓ Similarity search passed")
    print(f"  Found {len(data['similar_items'])} similar items")
    
    return data

def test_explainability(image_path):
    """Test explainability endpoint"""
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/api/explain", files=files)
    
    assert response.status_code == 200
    data = response.json()
    
    assert 'heatmap_base64' in data
    assert 'important_features' in data
    assert 'analysis' in data
    
    print(f"✓ Explainability passed")
    print(f"  Analysis: {data['analysis']['summary']}")
    
    return data

if __name__ == "__main__":
    print("🧪 Testing ML Service\n")
    
    # Test health
    test_health()
    print()
    
    # Test with sample image
    test_image = "test_batik.jpg"
    
    if not Path(test_image).exists():
        print(f"⚠️  {test_image} not found. Please provide a test image.")
        exit(1)
    
    # Run tests
    test_classification(test_image)
    print()
    
    test_similarity(test_image)
    print()
    
    test_explainability(test_image)
    print()
    
    print("✅ All tests passed!")
```

Save as `test_ml_service.py` and run:
```bash
python test_ml_service.py
```

## Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Simple load test
ab -n 100 -c 10 http://localhost:8000/health

# Classification load test (requires test image)
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/classify \
    -F "file=@test_batik.jpg" &
done
wait
```

## Performance Benchmarking

```python
import time
import requests

def benchmark_classification(image_path, n_requests=10):
    """Benchmark classification performance"""
    times = []
    
    for i in range(n_requests):
        start = time.time()
        
        with open(image_path, 'rb') as f:
            response = requests.post(
                "http://localhost:8000/api/classify",
                files={'file': f}
            )
        
        elapsed = time.time() - start
        times.append(elapsed)
        print(f"Request {i+1}: {elapsed:.2f}s")
    
    avg_time = sum(times) / len(times)
    print(f"\nAverage: {avg_time:.2f}s")
    print(f"Min: {min(times):.2f}s")
    print(f"Max: {max(times):.2f}s")

if __name__ == "__main__":
    benchmark_classification("test_batik.jpg", n_requests=10)
```

## Integration Testing with Frontend

```bash
# Start ML service
cd ml-service && ./start.sh &

# Start dev server (in another terminal)
npm run dev

# Test via browser
# 1. Go to http://localhost:3000/ai-analysis
# 2. Upload batik image
# 3. Check results appear correctly
# 4. Test similarity and explainability tabs
```

## Expected Performance

- **Classification**: 1-3 seconds per image
- **Similarity Search**: 0.5-1 second
- **Explainability**: 2-4 seconds
- **Memory**: ~500MB-1GB
- **CPU**: Moderate usage

## Troubleshooting Tests

### Classification returns error
```bash
# Check model exists
ls -lh models/batik_classifier_ensemble.joblib

# Check logs
tail -f logs/ml-service.log
```

### Slow performance
```bash
# Reduce image size in feature_extractor.py
# target_size=(224, 224) -> target_size=(128, 128)

# Use fewer Gabor kernels
# Edit feature_extractor.py: reduce gabor kernel count
```

### Memory issues
```bash
# Monitor memory
watch -n 1 free -h

# Restart service if needed
pkill -f uvicorn
./start.sh
```
