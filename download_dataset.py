import os
import zipfile
import requests
from pathlib import Path
import shutil

# Kaggle dataset URL (you need to download manually or use kaggle API)
DATASET_URL = "https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia"

def create_dataset_instructions():
    """
    Create instructions for downloading and setting up the dataset
    """
    instructions = """# DATASET SETUP INSTRUCTIONS

## Option 1: Manual Download (Recommended)

1. Visit the Kaggle dataset page:
   https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia

2. Click the "Download" button to download chest-xray-pneumonia.zip

3. Extract the ZIP file to get the chest_xray folder

4. Copy the contents as follows:
   
   chest_xray/train/NORMAL/* -> dataset/train/NORMAL/
   chest_xray/train/PNEUMONIA/* -> dataset/train/PNEUMONIA/
   chest_xray/test/NORMAL/* -> dataset/test/NORMAL/
   chest_xray/test/PNEUMONIA/* -> dataset/test/PNEUMONIA/

## Option 2: Using Kaggle API

1. Install Kaggle API:
   pip install kaggle

2. Setup Kaggle credentials:
   - Go to https://www.kaggle.com/your-account
   - Click "Create New API Token"
   - Download kaggle.json and place it in ~/.kaggle/

3. Download dataset:
   kaggle datasets download -d paultimothymooney/chest-xray-pneumonia

4. Extract and organize as shown in Option 1

## Expected Dataset Structure:

dataset/
├── train/
│   ├── NORMAL/
│   │   ├── IM-0115-0001.jpeg
│   │   ├── IM-0117-0001.jpeg
│   │   └── ...
│   └── PNEUMONIA/
│       ├── person1_bacteria_1.jpeg
│       ├── person1_bacteria_2.jpeg
│       └── ...
└── test/
    ├── NORMAL/
    │   ├── IM-0001-0001.jpeg
    │   ├── IM-0003-0001.jpeg
    │   └── ...
    └── PNEUMONIA/
        ├── person1_virus_6.jpeg
        ├── person2_bacteria_1.jpeg
        └── ...

## Dataset Statistics:
- Training: ~5,216 images
- Test: ~624 images
- Classes: NORMAL, PNEUMONIA

After setting up the dataset, run:
python train_model.py
"""
    
    with open('DATASET_SETUP.md', 'w', encoding='utf-8') as f:
        f.write(instructions)
    
    print("Dataset setup instructions created in 'DATASET_SETUP.md'")

def create_sample_dataset_structure():
    """
    Create the dataset directory structure with sample files
    """
    print("Creating dataset directory structure...")
    
    # Create directories
    directories = [
        'dataset/train/NORMAL',
        'dataset/train/PNEUMONIA', 
        'dataset/test/NORMAL',
        'dataset/test/PNEUMONIA'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    # Create placeholder files to show structure
    placeholder_files = [
        ('dataset/train/NORMAL/README.txt', 'Place NORMAL chest X-ray images here'),
        ('dataset/train/PNEUMONIA/README.txt', 'Place PNEUMONIA chest X-ray images here'),
        ('dataset/test/NORMAL/README.txt', 'Place NORMAL test images here'),
        ('dataset/test/PNEUMONIA/README.txt', 'Place PNEUMONIA test images here')
    ]
    
    for file_path, content in placeholder_files:
        with open(file_path, 'w') as f:
            f.write(content)
    
    print("Dataset structure created. See DATASET_SETUP.md for download instructions.")

if __name__ == "__main__":
    create_dataset_instructions()
    create_sample_dataset_structure()
