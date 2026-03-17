# DATASET SETUP INSTRUCTIONS

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
