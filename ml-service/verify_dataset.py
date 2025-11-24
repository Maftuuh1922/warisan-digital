#!/usr/bin/env python3
"""
Verify dataset structure for VGG16 training
"""

from pathlib import Path
import sys

def verify_dataset():
    """Check if dataset is properly structured"""
    base_dir = Path(__file__).parent
    train_dir = base_dir / 'dataset' / 'train'
    test_dir = base_dir / 'dataset' / 'test'
    
    print("=" * 50)
    print("DATASET VERIFICATION")
    print("=" * 50)
    
    # Check train directory
    if not train_dir.exists():
        print(f"❌ Training directory not found: {train_dir}")
        print("\nPlease follow DOWNLOAD_DATASET.md to download and extract the dataset.")
        return False
    
    print(f"\n✅ Training directory found: {train_dir}")
    
    # Check test directory
    if not test_dir.exists():
        print(f"❌ Test directory not found: {test_dir}")
        return False
    
    print(f"✅ Test directory found: {test_dir}")
    
    # Check classes in train
    train_classes = sorted([d.name for d in train_dir.iterdir() if d.is_dir()])
    if not train_classes:
        print(f"\n❌ No class folders found in {train_dir}")
        return False
    
    print(f"\n📁 Training classes: {train_classes}")
    
    # Count images per class
    print("\n📊 Training images per class:")
    total_train = 0
    for class_name in train_classes:
        class_dir = train_dir / class_name
        images = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png'))
        count = len(images)
        total_train += count
        print(f"  - {class_name}: {count} images")
    
    print(f"\n  Total training images: {total_train}")
    
    # Check classes in test
    test_classes = sorted([d.name for d in test_dir.iterdir() if d.is_dir()])
    print(f"\n📁 Test classes: {test_classes}")
    
    # Count test images
    print("\n📊 Test images per class:")
    total_test = 0
    for class_name in test_classes:
        class_dir = test_dir / class_name
        images = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png'))
        count = len(images)
        total_test += count
        print(f"  - {class_name}: {count} images")
    
    print(f"\n  Total test images: {total_test}")
    
    # Verify classes match
    if set(train_classes) != set(test_classes):
        print("\n⚠️ WARNING: Train and test classes don't match!")
        print(f"Train only: {set(train_classes) - set(test_classes)}")
        print(f"Test only: {set(test_classes) - set(train_classes)}")
    
    # Check if we have enough data
    if total_train < 100:
        print(f"\n⚠️ WARNING: Only {total_train} training images. Recommended: 200+")
    
    if total_test < 20:
        print(f"\n⚠️ WARNING: Only {total_test} test images. Recommended: 50+")
    
    print("\n" + "=" * 50)
    if total_train > 0 and total_test > 0:
        print("✅ Dataset structure looks good!")
        print("\nReady to train. Run:")
        print("  python train_vgg16.py")
        return True
    else:
        print("❌ Dataset verification failed")
        return False


if __name__ == '__main__':
    success = verify_dataset()
    sys.exit(0 if success else 1)
