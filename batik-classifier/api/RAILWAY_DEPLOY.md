# Batik MobileNet Ultimate - Railway Deployment

## Model sudah siap deploy! 🚀

### Files:
- ✅ app_mobilenet.py
- ✅ requirements_mobilenet.txt
- ✅ Procfile.mobilenet
- ✅ models/ (dengan model files)

### Railway Deployment Steps:

1. **Buat file requirements.txt** (rename dari requirements_mobilenet.txt):
   ```powershell
   cd C:\Users\muhammadmaftuh\warisan-digital\batik-classifier\api
   Copy-Item requirements_mobilenet.txt requirements.txt
   Copy-Item Procfile.mobilenet Procfile
   ```

2. **Push ke GitHub**:
   ```powershell
   git add .
   git commit -m "Add MobileNet Ultimate API"
   git push
   ```

3. **Deploy di Railway**:
   - Login ke railway.app
   - New Project -> Deploy from GitHub
   - Pilih repo Anda
   - Select `batik-classifier/api` folder
   - Deploy!

### Environment Variables (Optional):
```
PORT=5000
PYTHON_VERSION=3.11
```

### Build Settings:
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app_mobilenet:app`

### Notes:
- Model size: ~30MB (akan di-upload otomatis)
- Cold start: ~10-15 detik (normal untuk TensorFlow)
- Free tier: 500 jam/bulan

### Alternatif: Render.com

Sama seperti Railway, tapi dengan `render.yaml`:

```yaml
services:
  - type: web
    name: batik-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app_mobilenet:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
```

Tinggal push dan auto-deploy! 🎉
