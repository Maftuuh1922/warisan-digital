# VGG16 Batik Classification Training
# Jalankan notebook ini di Google Colab: https://colab.research.google.com/

## ⚠️ PENTING: Aktifkan GPU
# Menu → Runtime → Change runtime type → Hardware accelerator → GPU

## 1️⃣ Mount Google Drive (untuk save model)
```python
from google.colab import drive
drive.mount('/content/drive')
```

## 2️⃣ Upload Dataset
# Upload file archive.zip (263MB) ke Colab atau Google Drive
# Atau download dari link Bapak

## 3️⃣ Extract Dataset
```python
!unzip -q /content/archive.zip -d /content/dataset_batik
!ls -la /content/dataset_batik
```

## 4️⃣ Training Code (Copy & Paste ke Cell)
```python
import os
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import json

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

print("TensorFlow:", tf.__version__)
print("GPU:", tf.config.list_physical_devices('GPU'))

# Config
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.0001

DATASET_DIR = "/content/dataset_batik"
SAVE_DIR = "/content/drive/MyDrive/batik_model"
os.makedirs(SAVE_DIR, exist_ok=True)

# Data generators
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest',
    validation_split=0.2
)

val_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_gen = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

val_gen = val_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

print(f"Training: {train_gen.samples}, Validation: {val_gen.samples}, Classes: {train_gen.num_classes}")

# Save class indices
class_indices = train_gen.class_indices
with open(f"{SAVE_DIR}/class_indices.json", 'w') as f:
    json.dump({'class_indices': class_indices, 'class_names': {v: k for k, v in class_indices.items()}}, f, indent=2)

# Build model
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(*IMG_SIZE, 3))
for layer in base_model.layers:
    layer.trainable = False

model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(512, activation='relu'),
    Dropout(0.5),
    Dense(256, activation='relu'),
    Dropout(0.3),
    Dense(train_gen.num_classes, activation='softmax')
])

model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# Callbacks
callbacks = [
    ModelCheckpoint(f"{SAVE_DIR}/batik_vgg16_model.h5", monitor='val_accuracy', save_best_only=True, mode='max', verbose=1),
    EarlyStopping(monitor='val_accuracy', patience=10, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-7, verbose=1)
]

# Train
print("\\n🚀 Starting training...")
history = model.fit(
    train_gen,
    epochs=EPOCHS,
    validation_data=val_gen,
    callbacks=callbacks,
    verbose=1
)

# Fine-tuning
print("\\n🔧 Fine-tuning...")
for layer in base_model.layers[-4:]:
    layer.trainable = True

model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE / 10),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history_ft = model.fit(
    train_gen,
    epochs=20,
    validation_data=val_gen,
    callbacks=[
        ModelCheckpoint(f"{SAVE_DIR}/batik_vgg16_finetuned.h5", monitor='val_accuracy', save_best_only=True, verbose=1),
        EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True, verbose=1)
    ],
    verbose=1
)

# Save history & metrics
history_dict = {
    'accuracy': [float(x) for x in history.history['accuracy']] + [float(x) for x in history_ft.history['accuracy']],
    'val_accuracy': [float(x) for x in history.history['val_accuracy']] + [float(x) for x in history_ft.history['val_accuracy']],
    'loss': [float(x) for x in history.history['loss']] + [float(x) for x in history_ft.history['loss']],
    'val_loss': [float(x) for x in history.history['val_loss']] + [float(x) for x in history_ft.history['val_loss']]
}

with open(f"{SAVE_DIR}/training_history.json", 'w') as f:
    json.dump(history_dict, f, indent=2)

# Final evaluation
train_loss, train_acc = model.evaluate(train_gen, verbose=0)
val_loss, val_acc = model.evaluate(val_gen, verbose=0)

print(f"\\n✅ Training Accuracy: {train_acc:.4f} ({train_acc*100:.2f}%)")
print(f"✅ Validation Accuracy: {val_acc:.4f} ({val_acc*100:.2f}%)")

metrics = {
    'train_accuracy': float(train_acc),
    'val_accuracy': float(val_acc),
    'num_classes': train_gen.num_classes
}

with open(f"{SAVE_DIR}/metrics.json", 'w') as f:
    json.dump(metrics, f, indent=2)

# Plot
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history_dict['accuracy'], label='Train')
plt.plot(history_dict['val_accuracy'], label='Val')
plt.title('Accuracy')
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(history_dict['loss'], label='Train')
plt.plot(history_dict['val_loss'], label='Val')
plt.title('Loss')
plt.legend()
plt.grid(True)

plt.savefig(f"{SAVE_DIR}/training_plot.png", dpi=150)
plt.show()

print(f"\\n🎉 Training selesai! Model disimpan di Google Drive: {SAVE_DIR}")
print(f"\\n📥 Download files:")
print(f"  - batik_vgg16_finetuned.h5")
print(f"  - class_indices.json")
print(f"  - metrics.json")
```

## 5️⃣ Download Model
# Setelah training selesai, download file dari Google Drive:
# - batik_vgg16_finetuned.h5 (model file)
# - class_indices.json (class mapping)  
# - metrics.json (accuracy metrics)

## 6️⃣ Copy ke Project
# Paste files tersebut ke folder: /home/muhammadmaftuh/warisan-digital/ml-service/models/

---

**ESTIMASI WAKTU (dengan GPU di Colab):**
- Initial training (50 epochs): ~15-20 menit
- Fine-tuning (20 epochs): ~6-10 menit
- **Total: ~25-30 menit** (jauh lebih cepat dari CPU!)

**AKURASI DIHARAPKAN:**
- Training: 85-95%
- Validation: 65-75% (real-world performance)
