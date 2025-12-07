# 🚀 Deployment Guide - Railway

## Deploy to Railway (Free with TensorFlow Support)

Railway adalah platform cloud yang mendukung TensorFlow dan menawarkan free tier untuk deployment.

### Prerequisites

1. ✅ Model files di folder `models/` (sudah ada)
2. ✅ GitHub repository (warisan-digital)
3. ✅ Railway account (gratis)

---

## Step 1: Create Railway Account

1. Buka [railway.app](https://railway.app)
2. Klik **"Start a New Project"**
3. Login dengan GitHub account kamu

---

## Step 2: Deploy from GitHub

### Option A: Deploy via Railway Dashboard

1. Di Railway dashboard, klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: `Maftuuh1922/warisan-digital`
4. Railway akan detect Python project secara otomatis

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
cd batik-classifier/api
railway link

# Deploy
railway up
```

---

## Step 3: Configure Environment

Railway akan otomatis:
- ✅ Detect Python 3.11
- ✅ Install TensorFlow dan dependencies
- ✅ Run `gunicorn` untuk production server
- ✅ Generate public URL (e.g., `https://your-app.railway.app`)

### Environment Variables (Optional)

Jika perlu environment variables:

1. Go to Railway dashboard
2. Select your project
3. Click **"Variables"** tab
4. Add variables:
   ```
   FLASK_ENV=production
   PORT=5000
   ```

---

## Step 4: Verify Deployment

### Test Endpoints

1. **Health Check**
   ```bash
   curl https://your-app.railway.app/health
   ```

2. **Get Model Info**
   ```bash
   curl https://your-app.railway.app/info
   ```

3. **Predict Image**
   ```bash
   curl -X POST -F "image=@test_batik.jpg" https://your-app.railway.app/predict
   ```

### Test with Web Interface

1. Buka `test_web.html`
2. Edit API URL di line 130:
   ```javascript
   fetch('https://your-app.railway.app/predict', {
   ```
3. Open in browser dan test drag & drop image

---

## Step 5: Monitor & Logs

### View Logs in Railway

1. Go to Railway dashboard
2. Select your project
3. Click **"Deployments"** tab
4. View real-time logs

### Check Application Status

```bash
curl https://your-app.railway.app/health

# Response:
{
  "status": "healthy",
  "model_loaded": true
}
```

---

## Alternative: Deploy to Render

Render juga free dan support TensorFlow.

### Deploy Steps:

1. Buka [render.com](https://render.com)
2. Create **"New Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:app`
   - **Python Version**: 3.11
5. Deploy!

---

## Troubleshooting

### Issue: Model files too large for Git

Railway supports Git LFS for large files.

**Solution 1: Use Git LFS**
```bash
# Install Git LFS
git lfs install

# Track model files
git lfs track "*.pkl"
git add .gitattributes
git add models/
git commit -m "Add model files with LFS"
git push
```

**Solution 2: Upload to Cloud Storage**

Upload model files to Google Drive/Dropbox dan download di startup:

```python
# app.py - add at startup
import urllib.request

MODEL_URL = "https://drive.google.com/uc?id=YOUR_FILE_ID"
urllib.request.urlretrieve(MODEL_URL, 'models/batik_knn_model_95acc.pkl')
```

### Issue: Out of Memory

Reduce workers in Dockerfile/railway.json:
```json
"startCommand": "gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 app:app"
```

### Issue: Slow First Request

Railway cold starts bisa lambat. Tambahkan keep-alive:

**Option: UptimeRobot**
1. Buka [uptimerobot.com](https://uptimerobot.com) (free)
2. Add monitor dengan URL: `https://your-app.railway.app/health`
3. Set interval: 5 minutes
4. UptimeRobot akan ping endpoint setiap 5 menit → app tetap warm

---

## Expected Results

✅ API deployed dengan **95% accuracy**  
✅ Full InceptionV3 + KNN model  
✅ Public URL untuk production  
✅ Health monitoring  
✅ Auto-scaling (Railway)  

---

## Next Steps After Deployment

1. ✅ Update frontend untuk point ke production URL
2. ✅ Test dengan real batik images
3. ✅ Monitor usage dan performance
4. ✅ Setup custom domain (optional)

---

## Cost Estimate

**Railway Free Tier:**
- $5 credit per month (free)
- ~500 hours of execution time
- Enough untuk testing dan low-traffic production

**Render Free Tier:**
- 750 hours per month (free)
- Auto-sleep after 15 min inactivity
- Good untuk MVP dan testing

---

## Support

Jika ada masalah deployment:
1. Check Railway logs
2. Verify model files uploaded correctly
3. Test `/health` endpoint
4. Check TensorFlow installation di logs

Selamat deploy! 🚀
