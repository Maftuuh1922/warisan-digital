---
title: Batik Classifier
emoji: 🎨
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# 🎯 Batik Classifier API

REST API untuk klasifikasi motif batik menggunakan **MobileNetV2 + TFLite** dengan akurasi tinggi.

## 📊 Model Info
- **Model**: MobileNetV2 (TFLite)
- **Classes**: 42 motif batik Indonesia
- **Input Size**: 224x224 RGB

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Buat virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Model Files

Model files sudah tersedia di folder `models/`:
- `batik_model.tflite`
- `batik_classes_mobilenet_ultimate.json`
- `batik_model_metadata.pkl`

```
batik-classifier/
└── api/
    ├── app.py
    ├── requirements.txt
    ├── test_api.py
    └── models/
        ├── batik_knn_model_95acc.pkl
        ├── batik_classes.pkl
        └── batik_model_metadata.pkl
```

### 3. Run Server

```bash
python app.py
```

Server akan berjalan di: `http://localhost:5000`

## 📋 API Endpoints

### GET `/`
Get API information

**Response:**
```json
{
  "message": "Batik Classifier API",
  "version": "1.0",
  "model": "InceptionV3 + KNN",
  "accuracy": "95.00%",
  "classes": 20
}
```

### POST `/predict`
Predict batik motif from image

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)

**Example using curl:**
```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@path/to/batik.jpg"
```

**Example using Python:**
```python
import requests

with open('batik.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post('http://localhost:5000/predict', files=files)
    print(response.json())
```

**Response:**
```json
{
  "success": true,
  "prediction": "batik-parang",
  "confidence": 0.95,
  "percentage": "95.00%",
  "top_5_predictions": [
    {
      "class": "batik-parang",
      "confidence": 0.95,
      "percentage": "95.00%"
    },
    {
      "class": "batik-kawung",
      "confidence": 0.03,
      "percentage": "3.00%"
    }
  ]
}
```

### GET `/classes`
Get list of all batik classes

**Response:**
```json
{
  "success": true,
  "total": 20,
  "classes": [
    "batik-bali",
    "batik-betawi",
    "batik-celup",
    ...
  ]
}
```

### GET `/info`
Get model information

**Response:**
```json
{
  "success": true,
  "model_info": {
    "accuracy": "95.00%",
    "model_type": "InceptionV3 + KNN",
    "n_classes": 20,
    "total_training_data": 17000,
    "trained_date": "2025-12-07 11:41:28"
  }
}
```

### GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## 🧪 Testing

Run test script:
```bash
# Test endpoints
python test_api.py

# Test with image prediction
python test_api.py path/to/batik.jpg
```

## 📦 Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t batik-classifier-api .
docker run -p 5000:5000 batik-classifier-api
```

### Heroku

```bash
# Login
heroku login

# Create app
heroku create batik-classifier-api

# Deploy
git push heroku main
```

### Railway / Render

1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python app.py`
4. Deploy

## 🔧 Configuration

Environment variables:
```bash
FLASK_ENV=production  # production or development
PORT=5000             # Server port
```

## 📝 20 Batik Classes

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

## 🤝 Support

For issues or questions:
- GitHub: https://github.com/Maftuuh1922/warisan-digital
- Email: rizkiuya12@gmail.com

## 📄 License

MIT License - feel free to use for commercial or personal projects.

---

**Made with ❤️ by Maftuuh1922**
