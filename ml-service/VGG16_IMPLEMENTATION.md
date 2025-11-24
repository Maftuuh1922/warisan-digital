# VGG16 Transfer Learning untuk Batik Classification

## Overview

Implementasi ini terinspirasi dari: https://github.com/yohanesgultom/deep-learning-batik-classification

Model menggunakan **VGG16 pretrained (ImageNet)** sebagai feature extractor + fully-connected neural network sebagai classifier.

## Mengapa VGG16?

1. **Transfer Learning**: VGG16 sudah trained dengan 1M+ images (ImageNet)
2. **Feature Extraction**: Layers VGG16 bisa extract generic features dari images
3. **Accuracy**: Paper mencapai 74% accuracy vs SIFT (25%) dan SURF (40%)
4. **Speed**: Training dengan GPU hanya 64 detik vs 492s (SIFT) dan 616s (SURF)

## Requirements Real Dataset

Untuk training VGG16 yang akurat, butuh:

```
dataset/
├── train/
│   ├── Parang/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── ...
│   ├── Kawung/
│   │   └── ...
│   ├── Mega_Mendung/
│   └── ...
└── test/
    ├── Parang/
    ├── Kawung/
    └── ...
```

**Minimum requirements:**
- 50-100 images per class
- Classes: 5-10 motif batik utama
- Image size: 224x224 pixels (akan di-resize otomatis)

## Architecture

```
Input (224x224x3)
    ↓
VGG16 Pretrained (freeze)
    ↓ (512x7x7 features)
Flatten
    ↓
Dense(4096, relu) + Dropout(0.6)
    ↓
Dense(4096, tanh) + Dropout(0.6)
    ↓
Dense(num_classes, softmax)
```

## Dataset Sources

### Option 1: Kaggle Batik Dataset
- https://www.kaggle.com/datasets/dionisiusdh/indonesian-batik-motifs/data
- 2,092 images, 5 classes
- Motif: Parang, Kawung, Ceplok, Nitik, Lereng

### Option 2: Build Your Own
Collect from:
- Museum Batik Indonesia
- E-commerce batik websites
- Google Images dengan keyword spesifik
- Batik artisan photos

**Important**: Label harus konsisten dan accurate!

## Installation

```bash
cd ml-service

# Create new venv for VGG16 (isolated from current setup)
python3 -m venv venv-vgg16
source venv-vgg16/bin/activate

# Install TensorFlow + Keras
pip install -r requirements-vgg16.txt
```

## Training Steps

### 1. Download & Prepare Dataset

```bash
# Download dari Kaggle
kaggle datasets download -d dionisiusdh/indonesian-batik-motifs

# Extract
unzip indonesian-batik-motifs.zip -d dataset/

# Structure harus seperti ini:
# dataset/
#   train/
#     Parang/
#     Kawung/
#     ...
#   test/
#     Parang/
#     Kawung/
#     ...
```

### 2. Preprocess Images

```python
# preprocess_vgg16.py
from tensorflow.keras.preprocessing.image import ImageDataGenerator

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

train_generator = train_datagen.flow_from_directory(
    'dataset/train',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)
```

### 3. Build Model

```python
# model_vgg16.py
from tensorflow.keras.applications import VGG16
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, Dropout, Flatten
from tensorflow.keras.optimizers import Adam

# Load VGG16 pretrained (without top layer)
base_model = VGG16(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)

# Freeze VGG16 layers (transfer learning)
for layer in base_model.layers:
    layer.trainable = False

# Build classifier
model = Sequential([
    base_model,
    Flatten(),
    Dense(4096, activation='relu'),
    Dropout(0.6),
    Dense(4096, activation='tanh'),
    Dropout(0.6),
    Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=Adam(lr=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
```

### 4. Train

```python
# train_vgg16.py
history = model.fit(
    train_generator,
    epochs=50,
    validation_data=validation_generator,
    callbacks=[
        EarlyStopping(patience=10),
        ModelCheckpoint('best_model.h5', save_best_only=True)
    ]
)

# Save final model
model.save('models/batik_vgg16_classifier.h5')
```

### 5. Evaluate

```python
# evaluate_vgg16.py
test_loss, test_acc = model.evaluate(test_generator)
print(f'Test accuracy: {test_acc:.2%}')

# Confusion matrix
y_pred = model.predict(test_generator)
predictions = y_pred.argmax(axis=1)
cm = confusion_matrix(y_true, predictions)
print(cm)
```

## Expected Results (dari paper)

### Dataset: 2,092 images (5 classes)

| Model | Accuracy | Training Time |
|-------|----------|---------------|
| SIFT + BoW + SVM | 25% | 492s |
| SURF + BoW + SVM | 40% | 616s |
| **VGG16 + NN** | **74%** | **64s** (GPU) |

### Tuned Dataset Results
- VGG16 + NN: **74.46%** accuracy
- Better class distribution
- More consistent image quality

## Integration dengan FastAPI

```python
# main_vgg16.py
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

# Load model
model = load_model('models/batik_vgg16_classifier.h5')
classes = ['Parang', 'Kawung', 'Mega Mendung', 'Sekar Jagad', 'Truntum']

@app.post("/api/classify")
async def classify(file: UploadFile = File(...)):
    # Preprocess
    img = Image.open(io.BytesIO(await file.read()))
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    
    # Predict
    predictions = model.predict(img_array)[0]
    
    # Get top predictions
    top_indices = predictions.argsort()[-3:][::-1]
    results = [
        {
            "class": classes[i],
            "probability": float(predictions[i])
        }
        for i in top_indices
    ]
    
    return {
        "predicted_class": classes[predictions.argmax()],
        "confidence": float(predictions.max()),
        "top_k_predictions": results
    }
```

## GPU Recommendations

### For Training:
- **Minimum**: NVIDIA GTX 1050 Ti (4GB VRAM)
- **Recommended**: NVIDIA RTX 3060 (12GB VRAM)
- **Optimal**: NVIDIA RTX 4090 (24GB VRAM)

### Training Time Estimates:
| GPU | Time (50 epochs, 2K images) |
|-----|------------------------------|
| CPU only | 6-8 hours |
| GTX 1060 | 30-40 minutes |
| RTX 3060 | 10-15 minutes |
| RTX 4090 | 3-5 minutes |

## Cloud Training Options

### Google Colab (FREE)
- Free GPU (T4, 15GB VRAM)
- Limited to 12 hours session
- Perfect untuk training awal

### Google Cloud Platform
- Custom VM dengan GPU
- Pay per use
- ~$0.45/hour (K80 GPU)

### AWS SageMaker
- Managed ML service
- Various GPU instances
- ~$1.26/hour (ml.p2.xlarge)

### RunPod / Vast.ai
- Cheap GPU rental
- $0.20-0.50/hour
- Good untuk experimentation

## Limitations & Caveats

### Current Synthetic Model:
❌ Trained on fake patterns (not real batik)
❌ Cannot recognize real batik motifs
❌ 100% accuracy misleading (only on synthetic data)

### VGG16 Approach:
✅ Requires real batik dataset (hundreds of images)
✅ Need GPU for efficient training
✅ More setup complexity (TensorFlow/Keras)
✅ But will give **real** accuracy on real batik!

### Current Intelligent Simulation:
✅ Uses REAL_BATIK_DATASET (real Indonesian batik)
✅ Weighted selection (favor popular motifs)
✅ Realistic confidence scores (78-92%)
✅ Accurate philosophy & historical context
✅ **Works NOW without training**

## Recommendation

### For Immediate Demo/Development:
→ **Use current intelligent simulation** (sudah improved!)
   - Real batik data
   - Realistic results
   - No training needed

### For Production with Real ML:
→ **Collect real dataset (200-500 images)**
→ **Train VGG16 model** (sesuai repo reference)
→ **Deploy trained model**

## Next Steps

Jika mau proceed dengan VGG16:

1. **Collect Dataset**
   ```bash
   # Create structure
   mkdir -p dataset/{train,test}/{Parang,Kawung,Mega_Mendung,Sekar_Jagad,Truntum}
   ```

2. **Download images** (minimum 50 per class)

3. **Install VGG16 dependencies**
   ```bash
   pip install -r requirements-vgg16.txt
   ```

4. **Train model** (akan saya buatkan script lengkap)

5. **Integrate dengan API**

## Resources

- Original Paper: https://github.com/yohanesgultom/deep-learning-batik-classification
- VGG16 Architecture: https://keras.io/api/applications/vgg/
- Transfer Learning Guide: https://keras.io/guides/transfer_learning/
- Batik Dataset Kaggle: https://www.kaggle.com/datasets/dionisiusdh/indonesian-batik-motifs

## Summary

**Current Status**: Intelligent simulation active (better than synthetic model)
**VGG16 Status**: Requirements prepared, need real dataset
**Accuracy Expected**: 70-80% with proper dataset (vs current realistic simulation)

Untuk development sekarang, **intelligent simulation sudah cukup baik**. 
VGG16 untuk production deployment ketika sudah ada real dataset.
