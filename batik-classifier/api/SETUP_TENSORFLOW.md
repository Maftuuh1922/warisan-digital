# 🚀 Setup API MobileNet Ultimate - Solusi TensorFlow

## ⚠️ Masalah Utama
- Python 3.14 belum support TensorFlow
- TensorFlow hanya support Python 3.8 - 3.11

## ✅ Solusi Recommended

### Opsi 1: Download Python 3.11 dari python.org (TERCEPAT)

1. **Download Python 3.11**:
   - Link: https://www.python.org/downloads/release/python-31111/
   - Pilih: "Windows installer (64-bit)"
   - ⚠️ PENTING: Jangan install dari Windows Store!

2. **Install Python 3.11**:
   - Centang "Add Python to PATH"
   - Install

3. **Buat Virtual Environment Baru**:
   ```powershell
   # Gunakan Python 3.11 yang baru diinstall
   py -3.11 -m venv batik_tf_env
   batik_tf_env\Scripts\activate
   
   # Install dependencies
   pip install tensorflow==2.15.0 flask flask-cors pillow numpy
   
   # Jalankan API
   cd C:\Users\muhammadmaftuh\warisan-digital\batik-classifier\api
   python app_mobilenet.py
   ```

### Opsi 2: Install Anaconda/Miniconda (PALING STABIL)

1. **Download Miniconda**:
   - Link: https://docs.conda.io/en/latest/miniconda.html
   - Install

2. **Setup Environment**:
   ```powershell
   # Buat conda env dengan Python 3.10
   conda create -n batik-api python=3.10
   conda activate batik-api
   
   # Install TensorFlow
   conda install tensorflow
   pip install flask flask-cors
   
   # Jalankan API
   cd C:\Users\muhammadmaftuh\warisan-digital\batik-classifier\api
   python app_mobilenet.py
   ```

### Opsi 3: Gunakan Google Colab (UNTUK TEST CEPAT)

Buat notebook baru di Google Colab dan upload model:

```python
# Upload model files ke Colab
from google.colab import files
uploaded = files.upload()

# Install dependencies
!pip install flask flask-cors pillow

# Run prediction
import tensorflow as tf
model = tf.keras.models.load_model('batik_mobilenet_ultimate_final.keras')

# Test prediction
from PIL import Image
import numpy as np

def predict_batik(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    arr = (arr / 127.5) - 1.0
    
    preds = model.predict(arr)[0]
    top_idx = np.argmax(preds)
    
    return classes[top_idx], float(preds[top_idx])
```

### Opsi 4: Deploy Langsung ke Cloud (PRODUCTION-READY)

**Railway.app** (Gratis + Mudah):

1. Push code ke GitHub
2. Connect ke Railway
3. Deploy otomatis!

File yang dibutuhkan sudah ada:
- ✅ `app_mobilenet.py` 
- ✅ `requirements.txt` (buat baru):

```txt
flask==3.0.0
flask-cors==4.0.0
tensorflow-cpu==2.15.0
pillow==10.2.0
numpy==1.26.4
gunicorn==21.2.0
```

- ✅ `Procfile`:
```
web: gunicorn app_mobilenet:app
```

### Opsi 5: Alternatif Simpel - TensorFlow.js

Jika TensorFlow Python terlalu ribet, convert model ke TensorFlow.js:

```powershell
pip install tensorflowjs
tensorflowjs_converter --input_format=keras \
    models/batik_mobilenet_ultimate_final.keras \
    web_model/
```

Lalu gunakan di frontend dengan JavaScript (no backend needed!).

## 🧪 Test Tanpa API (TERCEPAT UNTUK TEST SEKARANG)

Coba script lokal dulu untuk test model:

```powershell
# Install TensorFlow di Python 3.14 (experimental)
pip install tf-nightly

# Atau test di Google Colab
```

## 📊 Rekomendasi Saya

**Untuk Development Lokal**: Opsi 2 (Anaconda) - paling stabil
**Untuk Production**: Opsi 4 (Railway/Render) - paling mudah
**Untuk Test Cepat**: Opsi 3 (Google Colab) - langsung jalan

## ❓ Mana yang Mau Dicoba?

Beri tahu saya opsi mana yang mau dicoba, saya akan bantu step-by-step!
