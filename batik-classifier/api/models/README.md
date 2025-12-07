# Model Files - Important Notes

## 📁 Model Files Location

Model files are **NOT included in this repository** due to GitHub's 100MB file size limit.

The trained KNN model file (`batik_knn_model_95acc.pkl`) is **106.36 MB**, which exceeds GitHub's limit.

---

## 📥 How to Get Model Files

### Option 1: Download from Google Drive (Recommended)

Model files are stored in Google Drive. Download them manually:

1. **Download model files from Google Drive**:
   - Link: [Contact repository owner for link]
   - Or check the original training notebook for Drive links

2. **Required files**:
   ```
   models/
   ├── batik_knn_model_95acc.pkl    # 106 MB - KNN classifier
   ├── batik_classes.pkl             # Class names/labels
   ├── scaler.joblib                 # Feature scaler
   └── batik_model_metadata.pkl      # Training metadata
   ```

3. **Place files in**: `batik-classifier/api/models/`

### Option 2: Train Your Own Model

If you want to train from scratch:

1. Open `batik-classifier/training/Batik_Training_Kaggle_Ready.ipynb` in Google Colab
2. Run all cells to train the model (requires GPU, ~30-45 minutes)
3. Download the generated model files from Colab
4. Place them in `batik-classifier/api/models/`

---

## 🔧 Model Specifications

- **Model Type**: InceptionV3 (feature extraction) + KNN Classifier
- **Accuracy**: 95.00% on validation set
- **Classes**: 20 different batik patterns
- **Training Samples**: 17,000 (with augmentation)
- **Features**: 2048-dimensional InceptionV3 embeddings
- **KNN Parameters**:
  - `n_neighbors=3`
  - `weights='distance'`
  - `metric='manhattan'`

---

## ⚙️ Setup Instructions

### For Ubuntu Server Deployment

```bash
# 1. Clone repository
git clone https://github.com/Maftuuh1922/warisan-digital.git
cd warisan-digital/batik-classifier/api

# 2. Download model files to models/ directory
# (manually from Google Drive)

# 3. Verify files exist
ls -lh models/

# Expected output:
# -rw-r--r-- 1 user user 106M batik_knn_model_95acc.pkl
# -rw-r--r-- 1 user user  2K   batik_classes.pkl
# -rw-r--r-- 1 user user  15K  scaler.joblib
# -rw-r--r-- 1 user user  1K   batik_model_metadata.pkl

# 4. Continue with deployment
./deploy-ubuntu.sh
```

### For Local Development

```bash
# 1. Clone repository
git clone https://github.com/Maftuuh1922/warisan-digital.git
cd warisan-digital/batik-classifier/api

# 2. Download models to models/

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run API
python app.py
```

---

## ❓ Why Not Use Git LFS?

We initially tried Git LFS, but:
- Adds complexity for contributors
- Requires LFS bandwidth quota
- Google Drive is simpler for one-time model distribution
- Models don't change frequently

---

## 🔍 Verify Model Files

After downloading, verify the files are correct:

```bash
cd batik-classifier/api

# Check file sizes
du -h models/*

# Expected sizes:
# 106M    models/batik_knn_model_95acc.pkl
# 4.0K    models/batik_classes.pkl
# 16K     models/scaler.joblib
# 4.0K    models/batik_model_metadata.pkl

# Test loading models
python -c "
import joblib
model = joblib.load('models/batik_knn_model_95acc.pkl')
classes = joblib.load('models/batik_classes.pkl')
scaler = joblib.load('models/scaler.joblib')
print(f'✅ Models loaded successfully')
print(f'   Classes: {len(classes)}')
print(f'   KNN neighbors: {model.n_neighbors}')
"
```

Expected output:
```
✅ Models loaded successfully
   Classes: 20
   KNN neighbors: 3
```

---

## 📞 Support

If you can't access the model files:

1. Check if you have access to the Google Drive folder
2. Open an issue on GitHub with your email
3. Repository owner will grant access

---

## 📝 For Repository Maintainers

### Updating Model Files

If you retrain the model and need to update:

1. Train new model in Colab
2. Upload new files to Google Drive
3. Update share links in this README
4. Update version in `model_metadata.json`

### Sharing Model Files

To share models with collaborators:

1. Open Google Drive folder with models
2. Right-click → Share → Get link
3. Set to "Anyone with the link can view"
4. Update the link in this README
5. Notify collaborators

---

## ✅ Checklist for Setup

Before running the API, ensure:

- [ ] Repository cloned
- [ ] All 4 model files downloaded
- [ ] Files placed in `batik-classifier/api/models/`
- [ ] File sizes match expected values
- [ ] Python dependencies installed
- [ ] Models load without errors

---

**Last Updated**: 2024-01-20  
**Model Version**: v1.0 (95% accuracy)  
**Training Date**: [Check model_metadata.pkl]
