"""
Modern Batik Classification Training Script
Upgraded from VGG16 (2018) to EfficientNetB4 (2025)

Original: https://github.com/hanungrisqiwidianto/klasifikasi_batik
Improvements:
- Python 3.11+ (was 2.7)
- TensorFlow 2.x (was 1.6)
- EfficientNetB4 (was VGG16)
- 37 classes (was 5)
- Smart augmentation (preserves motif)
"""

import os
import sys
import argparse
import json
from pathlib import Path

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB4
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import AdamW
import numpy as np

# Config
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS_PHASE1 = 50
EPOCHS_PHASE2 = 50


def create_data_generators(data_dir, img_size, batch_size):
    """
    Create smart data generators with batik-friendly augmentation
    
    Old approach (VGG16):
    - Simple rescaling only
    - No augmentation
    
    New approach (EfficientNetB4):
    - Smart augmentation that preserves motif integrity
    - No extreme transformations (rotation_range=15 not 180!)
    """
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=15,           # Preserve motif orientation
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        vertical_flip=False,         # Batik has orientation!
        brightness_range=[0.8, 1.2],
        fill_mode='nearest',
        validation_split=0.2
    )
    
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    return train_generator, val_generator


def build_model(num_classes, img_size):
    """
    Build EfficientNetB4 model
    
    Old: VGG16 (138M params, slower)
    New: EfficientNetB4 (19M params, faster & more accurate)
    """
    base_model = EfficientNetB4(
        include_top=False,
        weights='imagenet',
        input_shape=(*img_size, 3)
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    # Build classification head
    inputs = base_model.input
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(1024, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(512, activation='relu')(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs, outputs)
    return model


def train_phase1(model, train_gen, val_gen, output_dir):
    """Phase 1: Train top layers with frozen base"""
    print("\n" + "="*70)
    print("📈 PHASE 1: Training Top Layers (Base Frozen)")
    print("="*70)
    
    model.compile(
        optimizer=AdamW(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    callbacks = [
        ModelCheckpoint(
            os.path.join(output_dir, 'best_model_phase1.keras'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=20,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=7,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    history1 = model.fit(
        train_gen,
        epochs=EPOCHS_PHASE1,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    return history1


def train_phase2(model, train_gen, val_gen, output_dir):
    """Phase 2: Fine-tune all layers"""
    print("\n" + "="*70)
    print("🔥 PHASE 2: Fine-Tuning All Layers")
    print("="*70)
    
    # Unfreeze base model
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model) and 'efficientnet' in layer.name.lower():
            layer.trainable = True
            print(f"✅ Unfrozen: {layer.name}")
            break
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=AdamW(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    callbacks = [
        ModelCheckpoint(
            os.path.join(output_dir, 'best_model_phase2.keras'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=20,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=7,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    history2 = model.fit(
        train_gen,
        epochs=EPOCHS_PHASE1 + EPOCHS_PHASE2,
        initial_epoch=EPOCHS_PHASE1,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    return history2


def main():
    parser = argparse.ArgumentParser(
        description='Train modern batik classifier (EfficientNetB4)',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument('--data', required=True, help='Path to dataset directory')
    parser.add_argument('--output', default='models', help='Output directory for models')
    parser.add_argument('--batch_size', type=int, default=BATCH_SIZE, help='Batch size')
    parser.add_argument('--epochs', type=int, default=EPOCHS_PHASE1 + EPOCHS_PHASE2, help='Total epochs')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output, exist_ok=True)
    
    # Check GPU
    print("="*70)
    print("🖥️  CHECKING HARDWARE")
    print("="*70)
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"✅ GPU detected: {gpus}")
    else:
        print("⚠️  No GPU detected! Training will be slow.")
    
    # Load data
    print("\n" + "="*70)
    print("📂 LOADING DATASET")
    print("="*70)
    train_gen, val_gen = create_data_generators(args.data, IMG_SIZE, args.batch_size)
    num_classes = train_gen.num_classes
    
    print(f"\n✅ Dataset loaded:")
    print(f"   Classes: {num_classes}")
    print(f"   Training samples: {train_gen.samples}")
    print(f"   Validation samples: {val_gen.samples}")
    print(f"   Images per class: ~{train_gen.samples // num_classes}")
    
    # Build model
    print("\n" + "="*70)
    print("🏗️  BUILDING MODEL")
    print("="*70)
    model = build_model(num_classes, IMG_SIZE)
    print(f"✅ Model built: {model.count_params():,} parameters")
    
    # Train Phase 1
    history1 = train_phase1(model, train_gen, val_gen, args.output)
    
    # Train Phase 2
    history2 = train_phase2(model, train_gen, val_gen, args.output)
    
    # Save final model
    final_path = os.path.join(args.output, 'final_model.keras')
    model.save(final_path)
    print(f"\n✅ Final model saved: {final_path}")
    
    # Save class names
    class_names = list(train_gen.class_indices.keys())
    class_names_path = os.path.join(args.output, 'class_names.json')
    with open(class_names_path, 'w') as f:
        json.dump(class_names, f, indent=2)
    print(f"✅ Class names saved: {class_names_path}")
    
    # Final evaluation
    print("\n" + "="*70)
    print("🎯 FINAL EVALUATION")
    print("="*70)
    final_loss, final_acc = model.evaluate(val_gen, verbose=0)
    print(f"Validation Accuracy: {final_acc*100:.2f}%")
    
    if final_acc >= 0.95:
        print("\n🎉🎉 EXCELLENT! 95%+ accuracy achieved!")
    
    print("\n" + "="*70)
    print("✅ TRAINING COMPLETE!")
    print("="*70)


if __name__ == '__main__':
    main()
