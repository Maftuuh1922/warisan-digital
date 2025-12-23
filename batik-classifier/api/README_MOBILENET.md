# Batik Classifier API - MobileNet Ultimate

API backend untuk klasifikasi motif batik menggunakan model **MobileNetV2 Ultimate**.

## 📋 File Model

Model yang digunakan:
- `batik_mobilenet_ultimate_final.keras` - Model utama (Keras format)
- `batik_classes_mobilenet_ultimate.json` - Daftar kelas batik
- `batik_config_mobilenet_ultimate.json` - Konfigurasi & metadata training
- `history_mobilenet_ultimate.pkl` - History training (opsional)

## 🚀 Quick Start

### 1. Setup Model Files

Copy model files dari Downloads ke folder `models/`:

```powershell
cd C:\Users\muhammadmaftuh\warisan-digital\batik-classifier\api
python setup_mobilenet_model.py
```

### 2. Install Dependencies

```powershell
pip install flask flask-cors tensorflow pillow numpy
```

Atau install dari requirements:

```powershell
pip install -r requirements.txt
```

### 3. Run API Server

```powershell
python app_mobilenet.py
```

Server akan berjalan di `http://localhost:5000`

### 4. Test API

Test semua endpoints:

```powershell
python test_mobilenet_api.py
```

Test dengan gambar:

```powershell
python test_mobilenet_api.py path/to/batik_image.jpg
```

## 📡 API Endpoints

### GET /
Info API dan daftar endpoints

**Response:**
```json
{
  "success": true,
  "message": "Batik Classifier API - MobileNet Ultimate",
  "version": "2.0",
  "model": {
    "type": "MobileNetV2 Ultimate",
    "classes": 39,
    "input_size": [160, 160]
  }
}
```

### POST /predict
Prediksi motif batik dari gambar

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field: `image` (file)

**Response:**
```json
{
  "success": true,
  "prediction": "Batik Parang",
  "confidence": 0.9456,
  "percentage": "94.56%",
  "top_5_predictions": [
    {
      "class": "Batik Parang",
      "confidence": 0.9456,
      "percentage": "94.56%"
    },
    ...
  ],
  "model": "MobileNetV2 Ultimate"
}
```

### GET /classes
Daftar semua kelas batik

**Response:**
```json
{
  "success": true,
  "total": 39,
  "classes": ["Batik Parang", "Batik Kawung", ...]
}
```

### GET /info
Informasi model dan metadata

**Response:**
```json
{
  "success": true,
  "model_info": {
    "type": "MobileNetV2 Ultimate",
    "n_classes": 39,
    "input_size": [160, 160],
    "accuracy": "95.23%",
    "epochs": 50
  }
}
```

### GET /health
Health check

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "tensorflow_version": "2.18.0"
}
```

## 🧪 Testing dengan cURL

```powershell
# Health check
curl http://localhost:5000/health

# Get info
curl http://localhost:5000/info

# Predict image
curl -X POST -F "image=@path/to/batik.jpg" http://localhost:5000/predict
```

## 🧪 Testing dengan Python

```python
import requests

# Predict
url = "http://localhost:5000/predict"
files = {'image': open('batik.jpg', 'rb')}
response = requests.post(url, files=files)
result = response.json()

print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['percentage']}")
```

## 🐳 Docker Deployment

Build Docker image:

```bash
docker build -t batik-api-mobilenet -f Dockerfile.mobilenet .
```

Run container:

```bash
docker run -p 5000:5000 batik-api-mobilenet
```

## 🌐 Deploy to Cloud

### Railway
1. Push code ke GitHub
2. Connect repository di Railway
3. Set PORT environment variable
4. Deploy!

### Render
1. Push code ke GitHub
2. Create new Web Service
3. Set build & start command
4. Deploy!

### Google Cloud Run
1. Build Docker image
2. Push ke Google Container Registry
3. Deploy ke Cloud Run

## 📊 Model Performance

- **Architecture**: MobileNetV2 (Fine-tuned)
- **Input Size**: 160x160
- **Classes**: 39 motif batik
- **Accuracy**: ~95% (lihat config file)
- **Inference Time**: ~100ms (CPU) / ~20ms (GPU)

## 🔧 Troubleshooting

### Model tidak ditemukan
```
❌ Model tidak ditemukan di: models/batik_mobilenet_ultimate_final.keras
```

**Solusi**: Jalankan `python setup_mobilenet_model.py` untuk copy file dari Downloads.

### TensorFlow error
```
❌ TensorFlow tidak tersedia
```

**Solusi**: Install TensorFlow: `pip install tensorflow`

### CORS error
API sudah mengaktifkan CORS. Jika masih error, pastikan request menggunakan correct headers.

## 📝 Notes

- Model menggunakan MobileNetV2 preprocessing: pixel values scaled to [-1, 1]
- Supported image formats: JPG, PNG, GIF, BMP, WEBP
- Maximum image size: tergantung server memory
- Recommended: resize gambar < 5MB sebelum upload

## 🔗 Links

- Frontend: `src/pages/BatikIdentifier.tsx`
- Training Code: `training/`
- Original Model: `Downloads/`

## 📄 License

MIT License
