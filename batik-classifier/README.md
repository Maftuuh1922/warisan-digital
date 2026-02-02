# 🎨 Batik Classifier - 95% Accuracy

AI-powered Indonesian batik motif classification using **EfficientNetB4 + TensorFlow Lite**.

## 📊 Model Performance
- **Accuracy**: 95.00%
- **Classes**: 38 batik motifs
- **Training Data**: 17,000 images (augmented)
- **Model**: EfficientNetB4 (CNN) + TensorFlow Lite (optimized inference)

## 📁 Project Structure

```
batik-classifier/
├── training/                           # Model training
│   └── Batik_Training_Kaggle_Ready.ipynb
│
└── api/                                # Production API
    ├── app_mobilenet.py                # Flask REST API (TensorFlow Lite)
    ├── app_tflite_enhanced.py          # Enhanced TFLite API
    ├── app_tflite_simple.py            # Simple TFLite API
    ├── test_api.py                     # API testing
    ├── test_web.html                   # Web interface
    ├── requirements.txt                # Dependencies
    ├── requirements_mobilenet.txt      # TFLite dependencies
    ├── README.md                       # API documentation
    └── models/                         # Model files (download from Drive)
        ├── batik_model.tflite           # TensorFlow Lite model (~20MB)
        ├── batik_classes_mobilenet_ultimate.json # 38 classes
        └── batik_config_mobilenet_ultimate.json
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

# Run server (TensorFlow Lite version)
python app_mobilenet.py
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

## 📦 38 Batik Classes

1. batik-aceh
2. batik-bali
3. batik-bali_barong
4. batik-bali_merak
5. batik-betawi
6. batik-celup
7. batik-ceplok
8. batik-ciamis
9. batik-corak_insang
10. batik-garutan
11. batik-gentongan
12. batik-ikat_celup
13. batik-jakarta_ondel_ondel
14. batik-jawa_barat_megamendung
15. batik-jawa_timur_pring
16. batik-kalimantan_dayak
17. batik-keraton
18. batik-lampung_gajah
19. batik-lasem
20. batik-madura_mataketeran
21. batik-maluku_pala
22. batik-ntb_lumbung
23. batik-papua_asmat
24. batik-papua_cendrawasih
25. batik-papua_tifa
26. batik-pekalongan
27. batik-priangan
28. batik-sekar
29. batik-sidoluhur
30. batik-sidomukti
31. batik-sogan
32. batik-solo_parang
33. batik-sulawesi_selatan_lontara
34. batik-sumatera_barat_rumah_minang
35. batik-sumatera_utara_boraspati
36. batik-tambal
37. batik-yogyakarta_kawung
38. batik-yogyakarta_parang

## 📝 API Endpoints

- `POST /predict` - Predict batik motif
- `GET /classes` - List all classes
- `GET /info` - Model information
- `GET /health` - Health check

See `api/README.md` for detailed API documentation.

## 🔧 Tech Stack

- **ML**: TensorFlow, EfficientNetB4, TensorFlow Lite
- **API**: Flask with CORS
- **Image Processing**: Pillow, NumPy
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Storage**: Google Drive API
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

## 🤝 Contributing

GitHub: https://github.com/Maftuuh1922/warisan-digital

## 📄 License

MIT License

---

**Made with ❤️ by Maftuuh1922**
