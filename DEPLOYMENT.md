# 🚀 Deployment Guide - BatikIn dengan ML Service

## Arsitektur Deployment

```
┌─────────────────┐         ┌──────────────────┐
│  React Frontend │────────▶│  Cloudflare      │
│  (Vite)         │         │  Worker (Hono)   │
└─────────────────┘         └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Python ML       │
                            │  Service         │
                            │  (FastAPI)       │
                            └──────────────────┘
```

## Prerequisites

- Node.js 18+ & npm
- Python 3.11+
- Cloudflare account (untuk frontend & worker)
- Cloud service untuk ML (Railway, Render, atau AWS)
- Kaggle account & API key

## Step 1: Setup ML Service

### 1.1 Train Model

```bash
# Setup environment
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure Kaggle API
mkdir -p ~/.kaggle
# Download kaggle.json dari https://www.kaggle.com/settings
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Train model
cd ../notebooks
jupyter notebook train_batik_classifier.ipynb
# Run all cells untuk train model
```

**Hasil:**
- `ml-service/models/batik_classifier_ensemble.joblib`
- `ml-service/models/model_metadata.json`
- Dataset di `ml-service/data/`

### 1.2 Test Locally

```bash
cd ../ml-service
chmod +x start.sh
./start.sh

# Test di terminal lain
curl http://localhost:8000/health
```

## Step 2: Deploy ML Service

### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add environment variables
railway variables set KAGGLE_USERNAME=your_username
railway variables set KAGGLE_KEY=your_key

# Deploy
cd ml-service
railway up
```

**Railway Configuration (`railway.toml`):**
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

### Option B: Render

1. Buat `render.yaml`:

```yaml
services:
  - type: web
    name: batik-ml-service
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: KAGGLE_USERNAME
        sync: false
      - key: KAGGLE_KEY
        sync: false
```

2. Connect GitHub repo di Render dashboard
3. Add environment variables
4. Deploy

### Option C: Docker + AWS/GCP

```bash
# Build image
docker build -t batik-ml-service ./ml-service

# Test locally
docker run -p 8000:8000 -v $(pwd)/ml-service/models:/app/models batik-ml-service

# Push to registry
docker tag batik-ml-service gcr.io/your-project/batik-ml
docker push gcr.io/your-project/batik-ml

# Deploy ke Cloud Run
gcloud run deploy batik-ml \
  --image gcr.io/your-project/batik-ml \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

**Dapatkan ML_SERVICE_URL** (misal: `https://batik-ml-xyz.railway.app`)

## Step 3: Configure Frontend & Worker

### 3.1 Update ML Service URL

Edit `worker/user-routes.ts`:

```typescript
// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'https://batik-ml-xyz.railway.app';
```

### 3.2 Setup Cloudflare

```bash
# Login ke Cloudflare
npx wrangler login

# Configure wrangler.jsonc
```

Update `wrangler.jsonc`:
```jsonc
{
  "name": "batikin-worker",
  "main": "worker/index.ts",
  "compatibility_date": "2024-01-01",
  "vars": {
    "ML_SERVICE_URL": "https://batik-ml-xyz.railway.app"
  }
}
```

### 3.3 Build & Deploy

```bash
# Install dependencies
npm install

# Build project
npm run build

# Deploy ke Cloudflare
npm run deploy
```

## Step 4: Environment Variables

### Production Environment Variables

**ML Service:**
- `KAGGLE_USERNAME` - Kaggle username
- `KAGGLE_KEY` - Kaggle API key
- `MODEL_PATH` - Path to models (default: ./models)
- `PORT` - Service port (set by platform)

**Cloudflare Worker:**
- `ML_SERVICE_URL` - URL ML service (https://...)

**Frontend:**
- Automatically proxied through worker

## Step 5: Verify Deployment

### Test ML Service

```bash
# Health check
curl https://your-ml-service.com/health

# Test classification
curl -X POST https://your-ml-service.com/api/classify \
  -F "file=@test_batik.jpg"
```

### Test Full Stack

1. Visit your Cloudflare deployment URL
2. Go to AI Analysis page
3. Upload batik image
4. Verify results appear correctly

## Monitoring & Maintenance

### Logs

**Railway:**
```bash
railway logs
```

**Render:**
- Check logs in dashboard

**Cloudflare:**
```bash
wrangler tail
```

### Performance Tips

1. **Model Optimization:**
   - Reduce image resolution jika perlu (edit `target_size` di feature_extractor.py)
   - Cache predictions untuk gambar yang sama
   - Use model quantization jika perlu

2. **API Optimization:**
   - Add Redis cache untuk frequent requests
   - Implement request queuing untuk high traffic
   - Use CDN untuk static assets

3. **Cost Optimization:**
   - ML service: Scale down saat tidak digunakan
   - Use spot instances jika available
   - Implement rate limiting

## Troubleshooting

### ML Service tidak merespon

```bash
# Check logs
railway logs --tail
# atau
heroku logs --tail

# Verify model files
ls -lh ml-service/models/

# Test locally
cd ml-service && ./start.sh
```

### Worker gagal connect ke ML service

```bash
# Verify environment variable
wrangler secret list

# Update ML_SERVICE_URL
wrangler secret put ML_SERVICE_URL
# Paste URL: https://your-ml-service.com

# Test connection
curl https://your-worker.workers.dev/api/classify-batik
```

### Model accuracy rendah

1. Retrain dengan lebih banyak data
2. Tune hyperparameters di notebook
3. Cek kualitas dataset
4. Verify preprocessing pipeline

## Scaling Considerations

### High Traffic (>1000 req/day)

1. **ML Service:**
   - Deploy multiple instances
   - Add load balancer
   - Use GPU instances untuk faster inference

2. **Database:**
   - Move feature storage dari in-memory ke Redis/PostgreSQL
   - Implement vector database (Pinecone, Weaviate) untuk similarity search

3. **Caching:**
   - Implement CDN caching
   - Use Redis untuk frequent predictions

### Cost Estimation

**Free Tier:**
- Railway: 500 hours/month
- Render: 750 hours/month
- Cloudflare Workers: 100k requests/day
- **Total: FREE untuk small-medium traffic**

**Paid (>10k users/month):**
- ML Service: $20-50/month
- Cloudflare: $5/month
- Storage: $10/month
- **Total: ~$35-65/month**

## Backup & Recovery

```bash
# Backup models
tar -czf models-backup-$(date +%Y%m%d).tar.gz ml-service/models/

# Backup to cloud
aws s3 cp models-backup-*.tar.gz s3://your-bucket/backups/

# Restore
tar -xzf models-backup-20250121.tar.gz -C ml-service/
```

## Production Checklist

- [ ] Model trained dan tested (>85% accuracy)
- [ ] ML service deployed dan accessible
- [ ] Environment variables configured
- [ ] Frontend & worker deployed
- [ ] End-to-end test passed
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Documentation updated

## Support

Jika ada masalah:
1. Check logs (Railway/Render dashboard)
2. Verify environment variables
3. Test ML service endpoint directly
4. Check GitHub Issues
5. Review API documentation: http://your-ml-service.com/docs

---

**Selamat! 🎉** BatikIn dengan ML service sudah ready untuk production!
