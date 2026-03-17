#!/usr/bin/env python3
"""
Download Chest X-ray Images for Pneumonia Detection Training
===============================================================

This script helps you download the Kaggle Chest X-ray Pneumonia dataset
and organize it for training the pneumonia detection model.

Dataset Source: https://www.kaggle.com/datasets/paultimothymoys/chest-xray-pneumonia-classification
"""

import os
import sys
import urllib.request
import zipfile
from pathlib import Path
import shutil

def download_with_progress(url, filename, description):
    """Download file with progress indicator"""
    def progress_hook(block_num, block_size, total_size):
        if total_size > 0:
            percent = min(100, (block_num * block_size * 100) // total_size)
            print(f"\rDownloading {description}: {percent:.1f}%", end='')
            sys.stdout.flush()
    
    print(f"Downloading {description}...")
    try:
        urllib.request.urlretrieve(url, filename, progress_hook)
        print(f"\n✅ {description} downloaded successfully!")
        return True
    except Exception as e:
        print(f"\n❌ Failed to download {description}: {e}")
        return False

def create_directory_structure():
    """Create the necessary directory structure"""
    directories = [
        'dataset/train/NORMAL',
        'dataset/train/PNEUMONIA',
        'dataset/test/NORMAL',
        'dataset/test/PNEUMONIA',
        'dataset/val/NORMAL',
        'dataset/val/PNEUMONIA'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def extract_dataset(zip_path, extract_to):
    """Extract dataset from zip file"""
    print(f"Extracting {zip_path}...")
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"✅ Dataset extracted to {extract_to}")
        
        # Clean up zip file
        os.remove(zip_path)
        return True
    except Exception as e:
        print(f"❌ Failed to extract dataset: {e}")
        return False

def organize_files(extract_to):
    """Organize files into proper train/test structure"""
    base_path = Path(extract_to) / 'chest_xray'
    
    if not base_path.exists():
        print(f"❌ Dataset not found at {base_path}")
        return False
    
    # Find the actual image directories
    train_normal = base_path / 'train' / 'NORMAL'
    train_pneumonia = base_path / 'train' / 'PNEUMONIA'
    test_normal = base_path / 'test' / 'NORMAL'
    test_pneumonia = base_path / 'test' / 'PNEUMONIA'
    
    # Count files
    def count_files(directory):
        if directory.exists():
            return len(list(directory.glob('*.jpeg')))
        return 0
    
    print("\n📊 Dataset Statistics:")
    print(f"Train NORMAL: {count_files(train_normal)} images")
    print(f"Train PNEUMONIA: {count_files(train_pneumonia)} images")
    print(f"Test NORMAL: {count_files(test_normal)} images")
    print(f"Test PNEUMONIA: {count_files(test_pneumonia)} images")
    
    # Copy files to our structure
    def copy_files(src, dst, label):
        if src.exists():
            files = list(src.glob('*.jpeg'))
            print(f"Copying {len(files)} {label} images...")
            for file in files[:100]:  # Limit to 100 for demo
                shutil.copy2(file, dst / file.name)
            print(f"✅ Copied {min(100, len(files))} {label} images")
    
    # Copy training data
    copy_files(train_normal, Path('dataset/train/NORMAL'), 'NORMAL')
    copy_files(train_pneumonia, Path('dataset/train/PNEUMONIA'), 'PNEUMONIA')
    
    # Copy test data
    copy_files(test_normal, Path('dataset/test/NORMAL'), 'NORMAL')
    copy_files(test_pneumonia, Path('dataset/test/PNEUMONIA'), 'PNEUMONIA')
    
    # Create validation split from training data
    print("\n🔄 Creating validation split...")
    val_normal = Path('dataset/val/NORMAL')
    val_pneumonia = Path('dataset/val/PNEUMONIA')
    
    # Copy some training files to validation
    train_normal_files = list(train_normal.glob('*.jpeg'))[:20]
    train_pneumonia_files = list(train_pneumonia.glob('*.jpeg'))[:20]
    
    for file in train_normal_files:
        shutil.copy2(file, val_normal / file.name)
    
    for file in train_pneumonia_files:
        shutil.copy2(file, val_pneumonia / file.name)
    
    print(f"✅ Created validation split: {len(train_normal_files)} NORMAL, {len(train_pneumonia_files)} PNEUMONIA")
    
    return True

def main():
    """Main function to download and setup dataset"""
    print("🏥 Chest X-ray Dataset Downloader")
    print("=" * 50)
    
    # Dataset URLs
    dataset_url = "https://storage.googleapis.com/kaggle-data-sets/5475/chest-xray-pneumonia-classification.zip"
    
    try:
        # Create directory structure
        create_directory_structure()
        
        # Download dataset
        zip_path = "chest_xray_dataset.zip"
        if not download_with_progress(dataset_url, zip_path, "Chest X-ray Dataset"):
            print("❌ Failed to download dataset")
            return False
        
        # Extract dataset
        if not extract_dataset(zip_path, "chest_xray"):
            print("❌ Failed to extract dataset")
            return False
        
        # Organize files
        if not organize_files("chest_xray"):
            print("❌ Failed to organize dataset")
            return False
        
        print("\n🎉 Dataset setup completed successfully!")
        print("\n📋 Next Steps:")
        print("1. Run: python train_model.py")
        print("2. This will train a real pneumonia detection model")
        print("3. The trained model will replace the demo model")
        
        return True
        
    except KeyboardInterrupt:
        print("\n❌ Download interrupted by user")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
