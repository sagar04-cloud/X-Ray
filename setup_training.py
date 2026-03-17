#!/usr/bin/env python3
"""
AI Pneumonia Detection - Training Setup Script
This script helps set up the environment and download the dataset for training.
"""

import os
import sys
import subprocess
import platform

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def install_requirements():
    """Install required Python packages"""
    print("\n📦 Installing required packages...")
    
    try:
        # Upgrade pip
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                      check=True, capture_output=True)
        
        # Install requirements
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True)
        print("✅ All packages installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing packages: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directory structure...")
    
    directories = [
        'dataset/train/NORMAL',
        'dataset/train/PNEUMONIA',
        'dataset/test/NORMAL',
        'dataset/test/PNEUMONIA',
        'trained_model',
        'public/model'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"   Created: {directory}")
    
    print("✅ Directory structure created")

def check_gpu():
    """Check if GPU is available for training"""
    print("\n🔍 Checking GPU availability...")
    
    try:
        import tensorflow as tf
        gpus = tf.config.list_physical_devices('GPU')
        
        if gpus:
            print(f"✅ GPU detected: {len(gpus)} device(s)")
            for gpu in gpus:
                print(f"   - {gpu}")
            print("   Training will use GPU (much faster!)")
        else:
            print("⚠️  No GPU detected")
            print("   Training will use CPU (slower but still works)")
    except ImportError:
        print("⚠️  TensorFlow not installed yet")
    except Exception as e:
        print(f"⚠️  Could not check GPU: {e}")

def show_dataset_instructions():
    """Show instructions for dataset setup"""
    print("\n" + "="*60)
    print("📋 DATASET SETUP INSTRUCTIONS")
    print("="*60)
    
    print("""
To train the model, you need to download the Chest X-ray dataset:

📍 Option 1: Manual Download (Recommended)
1. Visit: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
2. Click "Download" to get chest-xray-pneumonia.zip
3. Extract the ZIP file
4. Copy images to the dataset folders:

   chest_xray/train/NORMAL/*     → dataset/train/NORMAL/
   chest_xray/train/PNEUMONIA/*  → dataset/train/PNEUMONIA/
   chest_xray/test/NORMAL/*      → dataset/test/NORMAL/
   chest_xray/test/PNEUMONIA/*   → dataset/test/PNEUMONIA/

📍 Option 2: Kaggle API
1. Install Kaggle CLI: pip install kaggle
2. Get API token from kaggle.com → Account → Create New API Token
3. Place kaggle.json in ~/.kaggle/ (or C:\\Users\\Username\\.kaggle\\ on Windows)
4. Run: kaggle datasets download -d paultimothymooney/chest-xray-pneumonia
5. Extract and organize as shown above

📊 Expected Dataset:
- Training: ~5,216 images (NORMAL + PNEUMONIA)
- Test: ~624 images (NORMAL + PNEUMONIA)

After setting up the dataset, run:
   python train_model.py
""")

def main():
    """Main setup function"""
    print("🤖 AI PNEUMONIA DETECTION - TRAINING SETUP")
    print("="*60)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Install requirements
    if not install_requirements():
        return False
    
    # Create directories
    create_directories()
    
    # Check GPU
    check_gpu()
    
    # Show dataset instructions
    show_dataset_instructions()
    
    print("\n" + "="*60)
    print("🎉 SETUP COMPLETED!")
    print("="*60)
    print("Next steps:")
    print("1. Download and organize the dataset (see instructions above)")
    print("2. Run training: python train_model.py")
    print("3. Start the web app: npm run dev")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
