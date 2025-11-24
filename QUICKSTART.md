# 🚀 Quick Reference - BatikIn ML

## Startup Commands

### Development
```bash
# Frontend & Worker
npm run dev                    # http://localhost:3000

# ML Service
cd ml-service && ./start.sh    # http://localhost:8000

# Train Model
jupyter notebook notebooks/train_batik_classifier.ipynb
```

### Production
```bash
# Deploy ML Service (Railway)
railway up

# Deploy Frontend (Cloudflare)
npm run deploy
```

## Essential URLs

- **Frontend**: http://localhost:3000
- **ML Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Key Files

| File | Purpose |
|------|---------|
| `ml-service/feature_extractor.py` | Custom feature pipeline |
| `ml-service/main.py` | FastAPI endpoints |
| `notebooks/train_batik_classifier.ipynb` | Model training |
| `worker/user-routes.ts` | Backend API routes |
| `src/pages/AiAnalysisPage.tsx` | ML UI |
| `src/components/MLEnhancedFeatures.tsx` | Similarity & explainability |

## API Quick Test

```bash
# Classification
curl -X POST http://localhost:8000/api/classify \
  -F "file=@batik.jpg"

# Similarity
curl -X POST "http://localhost:8000/api/similarity?top_k=5" \
  -F "file=@batik.jpg"

# Explainability
curl -X POST http://localhost:8000/api/explain \
  -F "file=@batik.jpg"
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Model not found | Run training notebook |
| Port 8000 busy | `pkill -f uvicorn` |
| Low accuracy | Add more training data |
| Memory error | Reduce image size in feature_extractor.py |
| Kaggle API error | Check `~/.kaggle/kaggle.json` |

## Environment Variables

```bash
# ML Service
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_key

# Worker (production)
ML_SERVICE_URL=https://your-ml-service.com
```

## Documentation

- 📘 [ML_IMPLEMENTATION.md](ML_IMPLEMENTATION.md) - Complete summary
- 📗 [ml-service/README.md](ml-service/README.md) - ML service guide
- 📙 [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- 📕 [ml-service/TESTING.md](ml-service/TESTING.md) - Testing guide

## Feature Dimensions

- **Color**: 90 features
- **Texture**: 150+ features  
- **Geometry**: 50+ features
- **Total**: 300+ features

## Performance Targets

- Classification: < 3s
- Similarity: < 1s
- Explainability: < 4s
- Accuracy: 85-95%

## Quick Checklist

- [ ] Python 3.11+ installed
- [ ] Kaggle API configured
- [ ] Model trained (check `ml-service/models/`)
- [ ] ML service running on port 8000
- [ ] Frontend running on port 3000
- [ ] Test classification works
- [ ] Test similarity works
- [ ] Test explainability works

---
**Need help?** Check [ML_IMPLEMENTATION.md](ML_IMPLEMENTATION.md) for detailed instructions.
