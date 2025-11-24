#!/usr/bin/env python3
"""
Quick script to download Indonesian Batik Motifs dataset from Kaggle
using kagglehub (no need for kaggle.json file)
"""

import os
import sys
from pathlib import Path
import shutil

def download_dataset():
    """Download and setup batik dataset"""
    
    # Check if kagglehub is installed
    try:
        import kagglehub
    except ImportError:
        print("❌ kagglehub not installed!")
        print("📦 Installing kagglehub...")
        os.system(f"{sys.executable} -m pip install kagglehub")
        import kagglehub
    
    # Setup paths
    script_dir = Path(__file__).parent
    raw_data_dir = script_dir / "data" / "raw"
    raw_data_dir.mkdir(parents=True, exist_ok=True)
    
    print("🚀 Downloading Indonesian Batik Motifs dataset from Kaggle...")
    print("   This may take a few minutes...")
    print()
    
    # Check for Kaggle credentials
    username = os.getenv('KAGGLE_USERNAME')
    key = os.getenv('KAGGLE_KEY')
    
    if not username or not key:
        print("⚠️  Warning: KAGGLE_USERNAME and KAGGLE_KEY not found in environment")
        print("   kagglehub will look for ~/.kaggle/kaggle.json")
        print()
        print("   To set credentials:")
        print("   1. Get API key from https://www.kaggle.com/settings")
        print("   2. Set environment variables:")
        print("      export KAGGLE_USERNAME=your_username")
        print("      export KAGGLE_KEY=your_api_key")
        print()
    
    try:
        # Download dataset
        dataset_name = "dionisiusdh/indonesian-batik-motifs"
        print(f"📥 Downloading: {dataset_name}")
        
        kaggle_path = kagglehub.dataset_download(dataset_name)
        print(f"✓ Downloaded to: {kaggle_path}")
        print()
        
        # Check if data already copied
        if list(raw_data_dir.iterdir()):
            print(f"✓ Data already exists in {raw_data_dir}")
            print(f"   Found {len(list(raw_data_dir.iterdir()))} items")
        else:
            print(f"📂 Copying dataset to project structure...")
            print(f"   Source: {kaggle_path}")
            print(f"   Target: {raw_data_dir}")
            
            kaggle_source = Path(kaggle_path)
            
            # Copy all files/folders
            copied_count = 0
            for item in kaggle_source.iterdir():
                if item.is_dir():
                    dest = raw_data_dir / item.name
                    shutil.copytree(item, dest, dirs_exist_ok=True)
                    copied_count += len(list(dest.rglob('*')))
                else:
                    shutil.copy2(item, raw_data_dir / item.name)
                    copied_count += 1
            
            print(f"✓ Copied {copied_count} items successfully")
        
        print()
        print("✅ Dataset setup complete!")
        print()
        print("📊 Dataset structure:")
        
        # Show structure
        for class_dir in raw_data_dir.iterdir():
            if class_dir.is_dir():
                img_count = len(list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png')))
                print(f"   - {class_dir.name}: {img_count} images")
        
        print()
        print("🎓 Next step:")
        print("   Run the training notebook: jupyter notebook ../notebooks/train_batik_classifier.ipynb")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("💡 Troubleshooting:")
        print("   1. Check Kaggle credentials are set correctly")
        print("   2. Verify internet connection")
        print("   3. Try manual download:")
        print(f"      Visit: https://www.kaggle.com/datasets/{dataset_name}/data")
        print(f"      Extract to: {raw_data_dir}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("  Batik Dataset Downloader")
    print("=" * 60)
    print()
    
    success = download_dataset()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)
