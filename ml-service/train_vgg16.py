#!/usr/bin/env python3
"""
VGG16 Transfer Learning untuk Klasifikasi Batik
Menggunakan dataset real batik (20 kelas)
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from pathlib import Path
import json

# TensorFlow imports
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import VGG16
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

print("="*60)
print("VGG16 BATIK CLASSIFIER TRAINING")
print("="*60)
print(f"TensorFlow version: {tf.__version__}")
print(f"Keras version: {keras.__version__}")
print(f"GPU Available: {len(tf.config.list_physical_devices('GPU'))} GPU(s)")
print("="*60)

# Konfigurasi
IMG_SIZE = (224, 224)  # VGG16 input size
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.0001

# Path
BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / "dataset_batik"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)

# Output files
MODEL_PATH = MODELS_DIR / "batik_vgg16_model.h5"
CLASS_INDICES_PATH = MODELS_DIR / "class_indices.json"
HISTORY_PATH = MODELS_DIR / "training_history.json"

print(f"\n📂 Dataset: {DATASET_DIR}")
print(f"💾 Model: {MODEL_PATH}")

# Cek dataset
if not DATASET_DIR.exists():
    raise FileNotFoundError(f"❌ Dataset not found: {DATASET_DIR}")

classes = sorted([d.name for d in DATASET_DIR.iterdir() if d.is_dir()])
print(f"\n✅ Found {len(classes)} classes:")
for i, cls in enumerate(classes, 1):
    n_images = len(list((DATASET_DIR / cls).glob("*")))
    print(f"  {i:2d}. {cls:25s} - {n_images:3d} images")

# Data generators
print("\n🔄 Preparing data generators...")

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

train_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

validation_generator = val_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

print(f"\n✅ Training samples: {train_generator.samples}")
print(f"✅ Validation samples: {validation_generator.samples}")
print(f"✅ Number of classes: {train_generator.num_classes}")

# Save class indices
class_indices = train_generator.class_indices
class_names = {v: k for k, v in class_indices.items()}
with open(CLASS_INDICES_PATH, 'w') as f:
    json.dump({
        'class_indices': class_indices,
        'class_names': class_names
    }, f, indent=2)
print(f"\n💾 Class indices saved")

# Build VGG16 Model
print("\n🏗️  Building VGG16 model...")

base_model = VGG16(
    weights='imagenet',
    include_top=False,
    input_shape=(*IMG_SIZE, 3)
)

# Freeze base model
for layer in base_model.layers:
    layer.trainable = False

print(f"✅ VGG16 loaded (frozen, {len(base_model.layers)} layers)")

# Custom classifier
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(512, activation='relu'),
    Dropout(0.5),
    Dense(256, activation='relu'),
    Dropout(0.3),
    Dense(train_generator.num_classes, activation='softmax')
])

model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("\n📋 Model Summary:")
model.summary()

# Callbacks
callbacks = [
    ModelCheckpoint(
        MODEL_PATH,
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    ),
    EarlyStopping(
        monitor='val_accuracy',
        patience=10,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7,
        verbose=1
    )
]

# Training
print(f"\n🚀 Starting training ({EPOCHS} epochs, batch size {BATCH_SIZE})...")
print("="*60 + "\n")

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=callbacks,
    verbose=1
)

print("\n" + "="*60)
print("✅ Training completed!")

# Save history
history_dict = {
    'accuracy': [float(x) for x in history.history['accuracy']],
    'val_accuracy': [float(x) for x in history.history['val_accuracy']],
    'loss': [float(x) for x in history.history['loss']],
    'val_loss': [float(x) for x in history.history['val_loss']]
}

with open(HISTORY_PATH, 'w') as f:
    json.dump(history_dict, f, indent=2)

# Fine-tuning
print("\n🔧 Fine-tuning: Unfreezing last 4 VGG16 layers...")

for layer in base_model.layers[-4:]:
    layer.trainable = True

model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE / 10),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

FINETUNE_EPOCHS = 20
print(f"🚀 Fine-tuning for {FINETUNE_EPOCHS} epochs...\n")

history_ft = model.fit(
    train_generator,
    epochs=FINETUNE_EPOCHS,
    validation_data=validation_generator,
    callbacks=[
        ModelCheckpoint(
            MODELS_DIR / "batik_vgg16_finetuned.h5",
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=5,
            restore_best_weights=True,
            verbose=1
        )
    ],
    verbose=1
)

print("\n✅ Fine-tuning completed!")

# Update history
for key in history_dict:
    if key in history_ft.history:
        history_dict[key].extend([float(x) for x in history_ft.history[key]])

with open(HISTORY_PATH, 'w') as f:
    json.dump(history_dict, f, indent=2)

# Final evaluation
print("\n📊 Final Evaluation:")
train_loss, train_acc = model.evaluate(train_generator, verbose=0)
val_loss, val_acc = model.evaluate(validation_generator, verbose=0)

print(f"   Training Accuracy:   {train_acc:.4f} ({train_acc*100:.2f}%)")
print(f"   Validation Accuracy: {val_acc:.4f} ({val_acc*100:.2f}%)")

# Save metrics
metrics = {
    'train_accuracy': float(train_acc),
    'train_loss': float(train_loss),
    'val_accuracy': float(val_acc),
    'val_loss': float(val_loss),
    'num_classes': train_generator.num_classes,
    'img_size': IMG_SIZE,
    'total_epochs': len(history_dict['accuracy'])
}

with open(MODELS_DIR / "metrics.json", 'w') as f:
    json.dump(metrics, f, indent=2)

# Plot training history
print("\n📈 Generating plots...")

plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history_dict['accuracy'], label='Train Accuracy')
plt.plot(history_dict['val_accuracy'], label='Val Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(history_dict['loss'], label='Train Loss')
plt.plot(history_dict['val_loss'], label='Val Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True)

plt.tight_layout()
plot_path = MODELS_DIR / "training_plot.png"
plt.savefig(plot_path, dpi=150)
print(f"💾 Plot saved: {plot_path}")

print("\n" + "="*60)
print("🎉 TRAINING SELESAI!")
print("="*60)
print(f"\nFile hasil:")
print(f"  1. Model: {MODEL_PATH.name}")
print(f"  2. Class indices: {CLASS_INDICES_PATH.name}")
print(f"  3. History: {HISTORY_PATH.name}")
print(f"  4. Metrics: metrics.json")
print(f"  5. Plot: training_plot.png")
print(f"\n✅ Final Validation Accuracy: {val_acc*100:.2f}%")
print(f"✅ Classes: {train_generator.num_classes}")
print("="*60)
