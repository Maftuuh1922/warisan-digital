# SETUP INSTRUCTIONS - Batik ML Service

## Problem: Python 3.14 Too New!

TensorFlow belum support Python 3.14. Butuh **Python 3.11** atau **3.12**.

## ✅ SOLUSI 1: Install Python 3.11 (Recommended)

1. **Download Python 3.11:**
   - https://www.python.org/downloads/release/python-3119/
   - Pilih "Windows installer (64-bit)"

2. **Install dengan "Add Python to PATH"** ✅

3. **Buat venv baru:**
   ```powershell
   cd C:\Users\muhammadmaftuh\warisan-digital\batik-ml-service
   py -3.11 -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

## ✅ SOLUSI 2: Training di Kaggle (Easier!)

Karena training butuh GPU, lebih baik pakai Kaggle:

1. **Upload notebook yang sudah di-fix:**
   - File: `Batik_Training_Kaggle_Ready.ipynb`
   - Sudah ada di folder `batik-classifier/training/`

2. **Training di Kaggle:**
   - Aktifkan GPU T4
   - Run all cells
   - Training ~1 hour

3. **Download trained model:**
   - `best_model_batik.keras`
   - `class_names.json`

4. **Copy ke folder `models/`:**
   ```
   batik-ml-service/
   └── models/
       ├── final_model.keras  (rename dari best_model_batik.keras)
       └── class_names.json
   ```

5. **Run API:**
   ```powershell
   # API bisa jalan tanpa TensorFlow untuk training
   # Cuma butuh untuk inference
   pip install fastapi uvicorn pillow numpy
   python api.py
   ```

## ✅ SOLUSI 3: Simplified Version (No Training Locally)

Pakai model yang sudah trained di Kaggle, API running di Python 3.14:

```powershell
# Install minimal dependencies
pip install fastapi uvicorn pillow numpy

# Download model dari Kaggle (setelah training selesai)
# Copy ke models/

# Run API
python api.py
```

## 🎯 RECOMMENDATION:

**Pakai SOLUSI 2 (Kaggle)** karena:
- ✅ Gratis GPU T4
- ✅ Training cuma 1 jam
- ✅ Gak perlu install Python 3.11 lokal
- ✅ Model langsung production-ready
- ✅ API bisa run di Python 3.14 nanti (cuma untuk inference)

Next step: **Upload & train di Kaggle**, lalu download model untuk API!
