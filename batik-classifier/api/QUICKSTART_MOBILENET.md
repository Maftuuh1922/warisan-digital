# Quick Start Guide - Batik MobileNet Ultimate API

## ✅ Model Files Berhasil Dicopy!

File-file model sudah berhasil dicopy ke folder `models/`:
- ✅ batik_mobilenet_ultimate_final.keras (30.37 MB)
- ✅ batik_classes_mobilenet_ultimate.json  
- ✅ batik_config_mobilenet_ultimate.json
- ✅ history_mobilenet_ultimate.pkl

## 📊 Model Info
- **Classes**: 38 motif batik
- **Accuracy**: 91.8%
- **Top-3 Accuracy**: 96.17%
- **Top-5 Accuracy**: 97.04%
- **Model**: MobileNetV2 Ultimate
- **Input Size**: 224x224

## 🚀 Cara Menjalankan

### Opsi 1: Gunakan Python Global (Recommended)

Jika Anda sudah punya TensorFlow installed secara global:

```powershell
# Test dulu apakah TensorFlow bisa diimport
python -c "import tensorflow as tf; print(tf.__version__)"

# Kalau berhasil, jalankan API:
cd C:\Users\muhammadmaftuh\warisan-digital\batik-classifier\api
python app_mobilenet.py
```

### Opsi 2: Install TensorFlow di Virtual Environment Lain

```powershell
# Buat virtual environment baru khusus untuk API
python -m venv batik_env
batik_env\Scripts\activate

# Install dependencies
pip install tensorflow flask flask-cors pillow numpy

# Jalankan API
python app_mobilenet.py
```

### Opsi 3: Gunakan Conda (Jika Ada)

```powershell
# Buat conda environment
conda create -n batik-api python=3.10
conda activate batik-api

# Install dependencies
conda install tensorflow flask flask-cors pillow numpy

# Jalankan API
python app_mobilenet.py
```

## 🧪 Test Local Prediction (Tanpa API)

Untuk test model tanpa perlu API server:

```powershell
# Edit local_predict.py sudah diupdate untuk model baru
cd C:\Users\muhammadmaftuh\batik-classifier
python local_predict.py path/to/batik_image.jpg
```

## 🔧 Troubleshooting TensorFlow DLL Error

Jika dapat error "DLL load failed", coba:

1. **Install Visual C++ Redistributable**:
   - Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
   - Install dan restart

2. **Gunakan TensorFlow 2.16+**:
   ```powershell
   pip uninstall tensorflow tensorflow-cpu tensorflow-intel
   pip install tensorflow
   ```

3. **Install TensorFlow DirectML (untuk Windows)**:
   ```powershell
   pip install tensorflow-directml
   ```

## 📡 API Endpoints (Ketika Sudah Berjalan)

- GET  `/` - API info
- POST `/predict` - Predict batik (upload gambar)
- GET  `/classes` - Daftar 38 kelas batik
- GET  `/info` - Model info dan akurasi
- GET  `/health` - Health check

## 🐳 Alternative: Gunakan Docker

Jika masalah TensorFlow terus terjadi, gunakan Docker:

```powershell
# Build image
docker build -t batik-api -f api\Dockerfile.mobilenet api\

# Run container
docker run -p 5000:5000 batik-api
```

## 📝 Next Steps

1. **Fix TensorFlow installation** - Coba salah satu opsi di atas
2. **Test local_predict.py** - Lebih mudah untuk test model
3. **Deploy ke cloud** - Jika lokal masalah, deploy ke Railway/Render yang sudah support TensorFlow

## 🆘 Need Help?

Kalau masih ada masalah, beri tahu saya:
- Error message lengkap
- Python version: `python --version`
- OS info: `systeminfo | findstr /B /C:"OS Name" /C:"OS Version"`
