# 🚀 Deploy Batik Classifier ke Hugging Face Spaces

Panduan lengkap deploy API batik classifier (95% accuracy) ke Hugging Face Spaces - **100% GRATIS!**

---

## 🎯 Kenapa Hugging Face Spaces?

✅ **Gratis permanent** (tidak ada batasan waktu)  
✅ Support TensorFlow & model besar (106MB)  
✅ Auto-deploy dari GitHub  
✅ Public API langsung jadi  
✅ Subdomain gratis: `username-batik-classifier.hf.space`  
✅ Docker support  
✅ GPU optional (gratis untuk community)  

---

## 📋 Prerequisites

1. **Akun Hugging Face** (gratis): https://huggingface.co/join
2. **Akun GitHub** (sudah punya)
3. **Model files** (sudah ada di `models/`)

---

## 🚀 Step-by-Step Deployment

### Step 1: Buat Space Baru di Hugging Face

1. Login ke https://huggingface.co
2. Klik **"+ New"** → **"Space"**
3. Isi form:
   - **Space name**: `batik-classifier`
   - **License**: MIT
   - **Select the Space SDK**: **Docker**
   - **Space visibility**: Public
4. Klik **"Create Space"**

### Step 2: Prepare Files di Local

Pastikan files ini ada di folder `batik-classifier/api/`:

```
batik-classifier/api/
├── app_hf.py                  # ✅ Sudah dibuat
├── requirements_hf.txt        # ✅ Sudah dibuat
├── Dockerfile.hf              # ✅ Sudah dibuat
├── README_HF.md               # ✅ Sudah dibuat
└── models/
    ├── batik_knn_model_95acc.pkl   # ✅ Sudah upload
    ├── batik_classes.pkl            # ✅ Sudah upload
    ├── scaler.joblib                # ✅ Sudah upload
    └── batik_model_metadata.pkl     # ✅ Sudah upload
```

### Step 3: Upload ke Hugging Face

**Opsi A: Via Git (Recommended)**

```bash
cd C:\Users\muhammadmaftuh\warisan-digital\batik-classifier\api

# Clone Hugging Face Space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/batik-classifier
cd batik-classifier

# Copy files
copy ..\app_hf.py app.py
copy ..\requirements_hf.txt requirements.txt
copy ..\Dockerfile.hf Dockerfile
copy ..\README_HF.md README.md
xcopy /E /I ..\models models

# Add & commit
git add .
git commit -m "Initial commit: Batik Classifier API with 95% accuracy"

# Push to Hugging Face
git push
```

**Opsi B: Via Web Interface**

1. Buka Space yang sudah dibuat
2. Klik **"Files and versions"** → **"Add file"** → **"Upload files"**
3. Upload semua files:
   - `app_hf.py` → rename jadi `app.py`
   - `requirements_hf.txt` → rename jadi `requirements.txt`
   - `Dockerfile.hf` → rename jadi `Dockerfile`
   - `README_HF.md` → rename jadi `README.md`
   - Folder `models/` (semua 4 files)
4. Klik **"Commit changes"**

### Step 4: Tunggu Build Selesai

- Hugging Face akan otomatis build Docker image
- Proses build ~5-10 menit
- Lihat logs di tab **"Logs"**
- Tunggu sampai status **"Running"** ✅

### Step 5: Test API

Setelah status **Running**, API bisa diakses di:

```
https://YOUR_USERNAME-batik-classifier.hf.space
```

**Test dengan cURL:**

```bash
# Health check
curl https://YOUR_USERNAME-batik-classifier.hf.space/health

# Predict
curl -X POST \
  -F "image=@batik_test.jpg" \
  https://YOUR_USERNAME-batik-classifier.hf.space/predict
```

**Test dengan Python:**

```python
import requests

url = "https://YOUR_USERNAME-batik-classifier.hf.space/predict"
files = {"image": open("batik_test.jpg", "rb")}

response = requests.post(url, files=files)
print(response.json())
```

---

## 🎨 Customize Space (Optional)

Edit file `README.md` di Space untuk customize tampilan:

```yaml
---
title: Batik Classifier API
emoji: 🎨
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---
```

---

## 🔧 Troubleshooting

### Issue: Build gagal

**Solusi**: Cek logs, biasanya karena:
- Dockerfile syntax error
- requirements.txt dependency conflict
- Model files tidak ter-upload

### Issue: "Out of memory"

**Solusi**: 
1. Upgrade ke **Persistent Space** (masih gratis, tapi perlu verify email)
2. Atau optimize model size

### Issue: Model loading error

**Solusi**:
- Pastikan 4 model files ter-upload dengan benar
- Cek file size: `batik_knn_model_95acc.pkl` harus ~106MB

---

## 📊 Monitoring & Logs

- **Logs**: Tab "Logs" di Space
- **Usage**: Tab "Analytics" untuk lihat traffic
- **Restart**: Klik "Restart Space" kalau perlu

---

## 🎯 API Endpoints

Setelah deploy, API punya endpoints:

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/predict` | POST | Predict batik (upload image) |
| `/classes` | GET | List semua classes |
| `/info` | GET | Model information |

---

## 💡 Tips

1. **Public URL**: Share link `https://YOUR_USERNAME-batik-classifier.hf.space` ke siapa aja
2. **Rate Limiting**: Hugging Face auto-scale, no worries
3. **Uptime**: 24/7 online, gak ada sleep mode
4. **Custom Domain**: Bisa pakai custom domain (setting di Space)
5. **Analytics**: Lihat berapa orang yang pakai API kamu

---

## 🔐 Security

- **API Key**: Optional, bisa tambah authentication kalau mau
- **Rate Limiting**: Tambah di code kalau perlu
- **CORS**: Sudah enabled by default

---

## 📈 Upgrade Options (Tetap Gratis!)

1. **Persistent Storage**: Enable di Space settings
2. **GPU**: Upgrade ke GPU (gratis untuk community projects)
3. **Secrets**: Tambah environment variables

---

## 🎉 After Deployment

Setelah deploy sukses, kamu bisa:

1. ✅ Share public API ke siapa aja
2. ✅ Integrate ke aplikasi web/mobile
3. ✅ Monitor usage di dashboard
4. ✅ Update model dengan push ke Git
5. ✅ Add to portfolio/CV

---

## 📞 Support

Kalau ada masalah:
- **Hugging Face Discord**: https://hf.co/join/discord
- **Documentation**: https://huggingface.co/docs/hub/spaces
- **Community Forum**: https://discuss.huggingface.co

---

## ✅ Checklist Deployment

- [ ] Akun Hugging Face dibuat
- [ ] Space baru dibuat (Docker SDK)
- [ ] Files di-upload (app.py, requirements.txt, Dockerfile, models/)
- [ ] Build selesai (status "Running")
- [ ] API tested (health check & predict)
- [ ] Public URL di-share

---

## 🚀 Quick Start Commands

```bash
# Clone Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/batik-classifier

# Setup files
cd batik-classifier
copy path\to\app_hf.py app.py
copy path\to\requirements_hf.txt requirements.txt
copy path\to\Dockerfile.hf Dockerfile
xcopy /E path\to\models models

# Deploy
git add .
git commit -m "Deploy batik classifier"
git push
```

---

**Deployment Time**: ~10-15 menit  
**Cost**: **Rp 0 / FREE** 🎉  
**Maintenance**: Otomatis, no hassle  
**Uptime**: 24/7  

**Good luck! 🚀**
