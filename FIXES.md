# 🔧 FormData Fix & Dataset Download

## Masalah yang Diperbaiki

### 1. ❌ FormData Content-Type Error
**Error:**
```
TypeError: Unrecognized Content-Type header value. FormData can only parse the following MIME types: multipart/form-data, application/x-www-form-urlencoded
```

**Penyebab:** Worker menggunakan `c.req.formData()` yang tidak kompatibel dengan Cloudflare Workers runtime.

**Solusi:** ✅ Diganti dengan `c.req.parseBody()` dan manual handling arrayBuffer.

**File yang diupdate:**
- `worker/user-routes.ts` - Semua ML endpoints (classify, similarity, explain)

### 2. ❌ Kaggle Dataset Download
**Masalah:** Cara lama pakai `kaggle.api` memerlukan konfigurasi kompleks.

**Solusi:** ✅ Gunakan `kagglehub` yang lebih modern dan mudah.

**Yang diupdate:**
- `ml-service/requirements.txt` - Tambah `kagglehub==0.3.4`
- `notebooks/train_batik_classifier.ipynb` - Update download code
- `ml-service/download_dataset.py` - Script otomatis download

## 🚀 Cara Menggunakan (Updated)

### Step 1: Setup Kaggle Credentials

**Option A: Environment Variables (Recommended)**
```bash
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_api_key
```

**Option B: .env file**
```bash
cd ml-service
cp .env.example .env
# Edit .env:
# KAGGLE_USERNAME=your_username
# KAGGLE_KEY=your_api_key
```

**Get credentials:**
1. Go to https://www.kaggle.com/settings
2. Scroll to "API" section
3. Click "Create New Token"
4. Download `kaggle.json`
5. Extract username dan key dari file tersebut

### Step 2: Download Dataset

**Automatic (Recommended):**
```bash
cd ml-service
source venv/bin/activate  # if not activated
python download_dataset.py
```

Output akan seperti:
```
============================================================
  Batik Dataset Downloader
============================================================

🚀 Downloading Indonesian Batik Motifs dataset from Kaggle...
📥 Downloading: dionisiusdh/indonesian-batik-motifs
✓ Downloaded to: /home/user/.cache/kagglehub/datasets/...
📂 Copying dataset to project structure...
✓ Copied 1234 items successfully

✅ Dataset setup complete!

📊 Dataset structure:
   - Batik_Parang: 150 images
   - Batik_Kawung: 120 images
   ...
```

**Manual (via Python):**
```python
import kagglehub
path = kagglehub.dataset_download("dionisiusdh/indonesian-batik-motifs")
print("Dataset path:", path)
```

### Step 3: Verify Fix

```bash
# Start dev server (if not running)
npm run dev

# Test di browser
# 1. Go to http://localhost:3000/analisis-ai
# 2. Upload batik image
# 3. Should work without FormData error
```

## 🧪 Testing FormData Fix

### Terminal Test:
```bash
# Create test image
curl -o test_batik.jpg "https://picsum.photos/400/400"

# Test classification endpoint (will fallback to simulation)
curl -X POST http://localhost:3000/api/classify-batik \
  -F "image=@test_batik.jpg" \
  | jq '.'
```

Expected: No FormData error, returns simulation result

### Browser Test:
1. Open http://localhost:3000/analisis-ai
2. Upload image
3. Click "Analisis Gambar"
4. Should see result (simulation mode jika ML service belum jalan)
5. Try "Similarity" and "Explainability" tabs
6. Should return proper error (not FormData error)

## 📝 Changes Made

### worker/user-routes.ts
```typescript
// BEFORE (ERROR)
const formData = await c.req.formData();
const imageFile = formData.get('image');

// AFTER (FIXED)
const body = await c.req.parseBody();
const imageFile = body['image'];
const imageBlob = await imageFile.arrayBuffer();
const mlFormData = new FormData();
mlFormData.append('file', new Blob([imageBlob], { type: imageFile.type }), imageFile.name);
```

### ml-service/requirements.txt
```diff
- kaggle==1.6.6
+ kagglehub==0.3.4
```

### New Files
- `ml-service/download_dataset.py` - Automated dataset downloader

## ✅ Verification Checklist

- [ ] No more FormData Content-Type errors
- [ ] Classification endpoint works (even in fallback mode)
- [ ] Similarity endpoint returns proper error
- [ ] Explainability endpoint returns proper error
- [ ] kagglehub installed in venv
- [ ] Dataset downloaded successfully
- [ ] Ready to train model

## 🔄 Next Steps

1. **Download dataset:**
   ```bash
   cd ml-service
   python download_dataset.py
   ```

2. **Train model:**
   ```bash
   cd ../notebooks
   jupyter notebook train_batik_classifier.ipynb
   # Run all cells
   ```

3. **Start ML service:**
   ```bash
   cd ../ml-service
   ./start.sh
   ```

4. **Test full pipeline:**
   - Upload image di http://localhost:3000/analisis-ai
   - Should get real ML predictions (not simulation)
   - Similarity and explainability should work

## 🐛 Troubleshooting

### Still getting FormData error?
```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

### kagglehub not found?
```bash
cd ml-service
source venv/bin/activate
pip install kagglehub
```

### Dataset download fails?
```bash
# Check credentials
echo $KAGGLE_USERNAME
echo $KAGGLE_KEY

# Try manual download
# Visit: https://www.kaggle.com/datasets/dionisiusdh/indonesian-batik-motifs/data
# Download ZIP and extract to ml-service/data/raw/
```

---

**Status: ✅ FIXED**

FormData parsing issue resolved. Dataset download modernized dengan kagglehub. Ready untuk training!
