# 🎨 Batik Classifier - 95% Accuracy

AI-powered Indonesian batik motif classification using **InceptionV3 + KNN**.

## 📊 Model Performance
- **Accuracy**: 95.00%
- **Classes**: 20 batik motifs
- **Training Data**: 17,000 images (augmented)
- **Model**: InceptionV3 (feature extraction) + KNN (classification)

## 📁 Project Structure

```
batik-classifier/
├── training/                           # Model training
│   └── Batik_Training_Kaggle_Ready.ipynb
│
└── api/                                # Production API
    ├── app.py                          # Flask REST API
    ├── test_api.py                     # API testing
    ├── test_web.html                   # Web interface
    ├── requirements.txt                # Dependencies
    ├── README.md                       # API documentation
    └── models/                         # Model files (download from Drive)
        ├── batik_knn_model_95acc.pkl
        ├── batik_classes.pkl
        └── batik_model_metadata.pkl
```

## 🚀 Quick Start

### Step 1: Train Model (Google Colab)

1. Open `training/Batik_Training_Kaggle_Ready.ipynb` in Google Colab
2. Upload to Google Drive: `Dataset_Batik_Asli/` (your batik images)
3. Run all cells - training takes ~2-3 hours
4. Download model files to `api/models/`

### Step 2: Run API Server

```powershell
# Navigate to API folder
cd batik-classifier/api

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

Server runs at: `http://localhost:5000`

### Step 3: Test

**Option A: Web Interface**
- Open `test_web.html` in browser
- Drag & drop batik image
- See prediction instantly! 🎉

**Option B: Python Script**
```powershell
python test_api.py path/to/batik.jpg
```

**Option C: API Call**
```python
import requests

with open('batik.jpg', 'rb') as f:
    response = requests.post('http://localhost:5000/predict', 
                            files={'image': f})
    print(response.json())
```

## 📦 20 Batik Classes

1. batik-bali
2. batik-betawi
3. batik-celup
4. batik-cendrawasih
5. batik-ceplok
6. batik-ciamis
7. batik-garutan
8. batik-gentongan
9. batik-kawung
10. batik-keraton
11. batik-lasem
12. batik-megamendung
13. batik-parang
14. batik-pekalongan
15. batik-priangan
16. batik-sekar
17. batik-sidoluhur
18. batik-sidomukti
19. batik-sogan
20. batik-tambal

## 📝 API Endpoints

- `POST /predict` - Predict batik motif
- `GET /classes` - List all classes
- `GET /info` - Model information
- `GET /health` - Health check

See `api/README.md` for detailed API documentation.

## 🔧 Tech Stack

- **ML**: TensorFlow, Keras, scikit-learn
- **API**: Flask
- **Image Processing**: Pillow, NumPy

## 🤝 Contributing

GitHub: https://github.com/Maftuuh1922/warisan-digital

## 📄 License

MIT License

---

**Made with ❤️ by Maftuuh1922**
