---
title: Batik Classifier API
emoji: 🎨
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# 🎨 Batik Classifier API

95% accuracy Indonesian batik pattern classifier using **InceptionV3 + KNN**.

## 🚀 Model Information

- **Architecture**: InceptionV3 (feature extraction) + KNN Classifier
- **Accuracy**: 95.00%
- **Classes**: 20 different batik patterns
- **Training Data**: 17,000 augmented images
- **Features**: 2048-dimensional InceptionV3 embeddings
- **KNN Parameters**: n_neighbors=3, weights='distance', metric='manhattan'

## 📋 Batik Classes

1. batik-bali
2. batik-betawi
3. batik-celup
4. batik-cendrawasih
5. batik-ceplok
6. batik-ciamis
7. batik-garutan
8. batik-gentongan
9. batik-kawung
10. batik-keraton
11. batik-lasem
12. batik-megamendung
13. batik-parang
14. batik-pekalongan
15. batik-priangan
16. batik-sekar
17. batik-sidoluhur
18. batik-sidomukti
19. batik-sogan
20. batik-tambal

## 🔌 API Endpoints

### 1. Get API Info
```bash
GET /
```

### 2. Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "tensorflow_available": true
}
```

### 3. Predict Batik Pattern
```bash
POST /predict
Content-Type: multipart/form-data

Body: image file
```

Response:
```json
{
  "success": true,
  "predictions": [
    {
      "class": "batik-parang",
      "confidence": 0.92
    },
    {
      "class": "batik-kawung",
      "confidence": 0.05
    }
  ],
  "model": "InceptionV3 + KNN",
  "accuracy": 0.95
}
```

### 4. Get All Classes
```bash
GET /classes
```

### 5. Get Model Info
```bash
GET /info
```

## 💻 Usage Examples

### Python
```python
import requests

url = "https://YOUR_USERNAME-batik-classifier.hf.space/predict"
files = {"image": open("batik.jpg", "rb")}

response = requests.post(url, files=files)
print(response.json())
```

### cURL
```bash
curl -X POST \
  -F "image=@batik.jpg" \
  https://YOUR_USERNAME-batik-classifier.hf.space/predict
```

### JavaScript
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('https://YOUR_USERNAME-batik-classifier.hf.space/predict', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🏗️ Architecture

```
Input Image (any size)
    ↓
Resize to 299×299
    ↓
InceptionV3 Feature Extraction (2048 features)
    ↓
StandardScaler Normalization
    ↓
KNN Classifier (k=3, manhattan distance)
    ↓
Top-5 Predictions with Confidence Scores
```

## 📊 Performance

- **Validation Accuracy**: 95.00%
- **Training Samples**: 17,000 (with augmentation)
- **Original Dataset**: ~1,000 images per class
- **Augmentation**: Rotation, zoom, shift, brightness
- **Inference Time**: ~1-2 seconds per image

## 🎯 Training Details

- **Framework**: TensorFlow/Keras + scikit-learn
- **Pre-trained Model**: InceptionV3 (ImageNet weights)
- **Fine-tuning**: Feature extraction only (frozen InceptionV3)
- **Classifier**: K-Nearest Neighbors (KNN)
- **Feature Scaling**: StandardScaler
- **Training Platform**: Google Colab with GPU

## 📦 Model Files

- `batik_knn_model_95acc.pkl` (106 MB) - KNN classifier
- `batik_classes.pkl` - Class labels
- `scaler.joblib` - Feature scaler
- `batik_model_metadata.pkl` - Training metadata

## 🔗 Links

- **Repository**: [GitHub](https://github.com/Maftuuh1922/warisan-digital)
- **Training Notebook**: [Google Colab](https://colab.research.google.com)
- **Dataset**: Indonesian Batik Patterns

## 📄 License

MIT License

## 👨‍💻 Author

Muhammad Maftuh
- GitHub: [@Maftuuh1922](https://github.com/Maftuuh1922)
- Email: rizkiuya12@gmail.com

## 🙏 Acknowledgments

- InceptionV3 model from TensorFlow/Keras
- Batik dataset from Indonesian heritage
- Hugging Face Spaces for hosting
