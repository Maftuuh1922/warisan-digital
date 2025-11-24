#!/usr/bin/env python3
"""
Quick Training Script - Using Synthetic Dataset
Train batik classifier without external dataset download
"""

import sys
from pathlib import Path
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import json
from datetime import datetime

# Add current dir to path
sys.path.insert(0, str(Path(__file__).parent))

# Use simple feature extractor (no opencv/scipy dependencies)
from feature_extractor_simple import SimpleBatikFeatureExtractor
from dataset_api import create_training_data, BATIK_CLASSES

def train_quick_model(samples_per_class=50):
    """Train model using synthetic dataset"""
    
    print("=" * 60)
    print("  Quick Training - Synthetic Batik Dataset")
    print("=" * 60)
    print()
    
    # Step 1: Generate synthetic data
    print("📊 Generating synthetic batik patterns...")
    print(f"   Classes: {len(BATIK_CLASSES)}")
    print(f"   Samples per class: {samples_per_class}")
    
    X_images, y_labels = create_training_data(samples_per_class)
    print(f"✓ Generated {len(X_images)} images")
    print(f"   Shape: {X_images.shape}")
    print()
    
    # Step 2: Extract features
    print("🔍 Extracting features...")
    extractor = SimpleBatikFeatureExtractor()
    
    features_list = []
    for idx, img in enumerate(X_images):
        features = extractor.extract_features(img)
        features_list.append(features)
        
        if (idx + 1) % 50 == 0:
            print(f"   Processed {idx + 1}/{len(X_images)} images...", end='\r')
    
    X = np.array(features_list)
    y = y_labels
    
    print(f"\n✓ Feature extraction complete")
    print(f"   Feature dimension: {X.shape[1]}")
    print()
    
    # Step 3: Prepare data
    print("🔧 Preparing data...")
    
    # Encode labels
    label_encoder = LabelEncoder()
    label_encoder.classes_ = np.array(BATIK_CLASSES)
    y_encoded = y
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print(f"✓ Data split:")
    print(f"   Training: {X_train.shape[0]} samples")
    print(f"   Testing: {X_test.shape[0]} samples")
    print()
    
    # Step 4: Train models
    print("🤖 Training models...")
    
    # SVM
    print("   Training SVM...")
    svm_model = SVC(C=10, gamma='scale', kernel='rbf', 
                    probability=True, random_state=42)
    svm_model.fit(X_train_scaled, y_train)
    svm_acc = accuracy_score(y_test, svm_model.predict(X_test_scaled))
    print(f"   ✓ SVM accuracy: {svm_acc:.4f}")
    
    # Random Forest
    print("   Training Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=200, max_depth=20,
                                     random_state=42, n_jobs=-1)
    rf_model.fit(X_train_scaled, y_train)
    rf_acc = accuracy_score(y_test, rf_model.predict(X_test_scaled))
    print(f"   ✓ Random Forest accuracy: {rf_acc:.4f}")
    
    # Ensemble
    print("   Creating ensemble...")
    ensemble_model = VotingClassifier(
        estimators=[('svm', svm_model), ('rf', rf_model)],
        voting='soft',
        weights=[1, 1]
    )
    ensemble_model.fit(X_train_scaled, y_train)
    ensemble_acc = accuracy_score(y_test, ensemble_model.predict(X_test_scaled))
    print(f"   ✓ Ensemble accuracy: {ensemble_acc:.4f}")
    print()
    
    # Step 5: Save models
    print("💾 Saving models...")
    
    MODEL_DIR = Path(__file__).parent / 'models'
    MODEL_DIR.mkdir(exist_ok=True)
    
    model_artifacts = {
        'ensemble_model': ensemble_model,
        'svm_model': svm_model,
        'rf_model': rf_model,
        'scaler': scaler,
        'label_encoder': label_encoder,
        'feature_extractor_params': {
            'target_size': extractor.target_size
        },
        'metrics': {
            'svm_accuracy': float(svm_acc),
            'rf_accuracy': float(rf_acc),
            'ensemble_accuracy': float(ensemble_acc),
            'n_classes': len(BATIK_CLASSES),
            'n_features': X.shape[1],
            'classes': BATIK_CLASSES
        }
    }
    
    # Save main model
    model_path = MODEL_DIR / 'batik_classifier_ensemble.joblib'
    joblib.dump(model_artifacts, model_path)
    print(f"✓ Model saved: {model_path}")
    
    # Save individual components
    joblib.dump(scaler, MODEL_DIR / 'scaler.joblib')
    joblib.dump(label_encoder, MODEL_DIR / 'label_encoder.joblib')
    joblib.dump(ensemble_model, MODEL_DIR / 'ensemble_model.joblib')
    print(f"✓ Components saved")
    
    # Save metadata
    metadata = {
        'model_version': '1.0-synthetic',
        'training_date': datetime.now().isoformat(),
        'dataset_type': 'synthetic',
        'n_training_samples': len(X_train),
        'n_test_samples': len(X_test),
        'feature_dimension': X.shape[1],
        'classes': BATIK_CLASSES,
        'accuracies': {
            'svm': float(svm_acc),
            'random_forest': float(rf_acc),
            'ensemble': float(ensemble_acc)
        }
    }
    
    with open(MODEL_DIR / 'model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✓ Metadata saved")
    print()
    
    # Step 6: Evaluation
    print("=" * 60)
    print("  MODEL EVALUATION")
    print("=" * 60)
    print()
    print(f"SVM Accuracy:        {svm_acc:.2%}")
    print(f"Random Forest:       {rf_acc:.2%}")
    print(f"Ensemble:            {ensemble_acc:.2%}")
    print()
    
    # Detailed classification report
    y_pred = ensemble_model.predict(X_test_scaled)
    print("Classification Report:")
    print(classification_report(y_test, y_pred, 
                                target_names=BATIK_CLASSES,
                                digits=4))
    
    print("=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print()
    print("🚀 Next steps:")
    print("   1. Start ML service: ./start.sh")
    print("   2. Test API: curl http://localhost:8000/health")
    print("   3. Use in app: npm run dev")
    print()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Quick train batik classifier')
    parser.add_argument('--samples', type=int, default=50,
                       help='Samples per class (default: 50)')
    
    args = parser.parse_args()
    
    try:
        train_quick_model(samples_per_class=args.samples)
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
