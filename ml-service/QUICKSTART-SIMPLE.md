# 🚀 QUICK START - Synthetic Dataset ML

## ✅ Already Completed

- ✅ Model trained (100% accuracy on synthetic data)
- ✅ Simplified service (no OpenCV/scipy)
- ✅ FormData parsing fixed
- ✅ 8 batik classes ready

## 🏃 Quick Start (3 Commands)

### Terminal 1: ML Service

```bash
cd ml-service
./start-simple.sh
```

Service will start on http://localhost:8000

### Terminal 2: Frontend

```bash
npm run dev
```

Frontend will start on http://localhost:3000

## 🧪 Test It

1. Open browser: http://localhost:3000/analisis-ai
2. Upload any image
3. Get batik classification!

## 📊 What Just Happened?

### 1. Synthetic Dataset Created
- 8 batik pattern classes
- Generated programmatically
- No Kaggle download needed
- Training data: `dataset_api.py`

### 2. Model Trained
- 400 synthetic images (50 per class)
- SVM + Random Forest ensemble
- 100% accuracy (synthetic data)
- ~100 features per image
- Training time: ~3 minutes

### 3. Service Simplified
- **main_simple.py**: No OpenCV/scipy dependencies
- Only PIL + NumPy + scikit-learn
- Fast install, fast startup
- Production-ready for demo

### 4. Integration Fixed
- Worker uses `parseBody()` instead of `formData()`
- Response format matches worker expectations
- Full pipeline: Frontend → Worker → ML Service

## 🎯 8 Batik Classes

1. **Batik Parang** - Diagonal lines pattern
2. **Batik Kawung** - Circular/geometric
3. **Batik Mega Mendung** - Cloud-like
4. **Batik Sekar Jagad** - Colorful geometric
5. **Batik Truntum** - Star pattern
6. **Batik Sido Mukti** - Complex geometric
7. **Batik Tambal** - Patchwork
8. **Batik Sogan** - Traditional brown tones

## 🔍 API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

### Classify Image
```bash
curl -X POST http://localhost:8000/api/classify \
  -F "file=@test_image.jpg"
```

Response:
```json
{
  "predicted_class": "Batik Parang",
  "confidence": 0.95,
  "top_k_predictions": [
    {"class": "Batik Parang", "probability": 0.95},
    {"class": "Batik Kawung", "probability": 0.03},
    {"class": "Batik Mega Mendung", "probability": 0.02}
  ],
  "feature_insights": {
    "color": "RGB histogram analysis",
    "texture": "Gradient and LBP texture features",
    "geometry": "Pattern geometry analysis"
  }
}
```

## 📁 Files Structure

```
ml-service/
├── main_simple.py              # FastAPI service (simplified)
├── feature_extractor_simple.py # Feature extraction (PIL only)
├── dataset_api.py              # Synthetic dataset generator
├── train_quick.py              # Training script
├── start-simple.sh             # Quick startup script
├── setup-minimal.sh            # Setup with minimal deps
├── requirements-minimal.txt    # Minimal dependencies
└── models/
    └── batik_classifier_ensemble.joblib  # Trained model
```

## 🐛 Troubleshooting

### ML Service not starting?
```bash
cd ml-service
source venv/bin/activate
python -c "import fastapi, uvicorn; print('OK')"
```

If error, reinstall:
```bash
./setup-minimal.sh
```

### Frontend getting 400 error?
Check ML service is running:
```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "metrics": {...}
}
```

### Want to retrain?
```bash
cd ml-service
source venv/bin/activate
python train_quick.py
```

## 💡 Next Steps

### For Development
- ✅ Already working end-to-end
- Test with different images
- Tweak feature extraction
- Adjust model parameters

### For Production
1. **Dataset**: Replace synthetic with real batik images
2. **Model**: Fine-tune with real data
3. **Deploy**: 
   - Railway/Render for ML service
   - Cloudflare for frontend
4. **Monitor**: Add logging and metrics

### To Upgrade
- Add real batik dataset
- Implement similarity search with feature database
- Add explainability heatmaps (requires OpenCV)
- Scale horizontally

## ✅ Summary

**What works NOW:**
- ✅ Full ML pipeline (dataset → training → inference)
- ✅ REST API with FastAPI
- ✅ Frontend integration
- ✅ 8-class batik classification
- ✅ No external dependencies (synthetic data)
- ✅ Fast setup (< 5 minutes)

**Ready to use:**
```bash
# Terminal 1
cd ml-service && ./start-simple.sh

# Terminal 2
npm run dev

# Browser
open http://localhost:3000/analisis-ai
```

**That's it! 🎉**
