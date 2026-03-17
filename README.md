# AI Pneumonia Detection System

An advanced end-to-end web application for detecting pneumonia from chest X-ray images using deep learning. The system includes model training with MobileNetV2, TensorFlow.js conversion, and a modern React web interface.

## 🚀 Features

- **🤖 AI-Powered Detection**: Deep learning model using MobileNetV2 with transfer learning
- **🔄 End-to-End Pipeline**: Complete training → conversion → deployment workflow
- **🌐 Browser-Based Processing**: All AI computations run locally using TensorFlow.js
- **⚡ Real-Time Results**: Instant predictions with confidence scores
- **🔒 Privacy-Focused**: Medical images never leave your device
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Medical-Grade UI**: Clean, professional interface designed for healthcare professionals

## 🛠️ Technology Stack

### AI/ML
- **TensorFlow 2.13** - Model training and conversion
- **MobileNetV2** - Transfer learning base model
- **TensorFlow.js** - Browser-based inference

### Frontend
- **React 18** + **TypeScript** - Modern UI framework
- **TailwindCSS** - Professional medical styling
- **Vite** - Fast development and building

### Dataset
- **Chest X-ray Pneumonia** - Kaggle medical imaging dataset

## 📋 Prerequisites

- **Python 3.8+** for model training
- **Node.js 18+** for web application
- **npm** or **yarn** package manager

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)

1. **Clone and Setup Training Environment**
   ```bash
   git clone <your-repo-url>
   cd ai-pneumonia-detection
   
   # Setup training environment
   python setup_training.py
   ```

2. **Download Dataset** 
   - Visit: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia
   - Download and extract the dataset
   - Organize images as shown in the setup instructions

3. **Train the Model**
   ```bash
   python train_model.py
   ```

4. **Start Web Application**
   ```bash
   npm install
   npm run dev
   ```

### Option 2: Web App Only (Using Pre-trained Model)

If you already have a trained TensorFlow.js model:

```bash
# Install dependencies
npm install

# Place your model files in public/model/
# - model.json
# - weights.bin (or group1-shard1of1.bin)

# Start development server
npm run dev
```

## 📁 Project Structure

```
ai-pneumonia-detection/
├── 🤖 Training Pipeline
│   ├── train_model.py           # Complete model training script
│   ├── setup_training.py        # Environment setup script
│   ├── download_dataset.py      # Dataset helper
│   ├── requirements.txt         # Python dependencies
│   └── dataset/                 # Training data directory
│       ├── train/
│       │   ├── NORMAL/
│       │   └── PNEUMONIA/
│       └── test/
│           ├── NORMAL/
│           └── PNEUMONIA/
│
├── 🌐 Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadXray.tsx      # Image upload with drag-and-drop
│   │   │   └── PredictionResult.tsx # Results display
│   │   ├── services/
│   │   │   └── modelLoader.ts      # TensorFlow.js integration
│   │   ├── pages/
│   │   │   └── Home.tsx           # Main dashboard
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx              # Entry point
│   ├── public/
│   │   └── model/                # TensorFlow.js model files
│   │       ├── model.json
│   │       └── weights.bin
│   └── package.json
│
└── 📚 Documentation
    ├── README.md
    └── DATASET_SETUP.md
```

## 🤖 Model Training

### Architecture
- **Base Model**: MobileNetV2 (pre-trained on ImageNet)
- **Custom Layers**: 
  - GlobalAveragePooling2D
  - Dense(128, activation='relu')
  - Dropout(0.5)
  - Dense(1, activation='sigmoid') for binary classification

### Training Configuration
```python
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.001
OPTIMIZER = Adam
LOSS = Binary Crossentropy
METRICS = Accuracy, Precision, Recall
```

### Training Process
1. **Data Augmentation**: Rotation, zoom, flip, brightness adjustment
2. **Transfer Learning**: Freeze MobileNetV2 base layers initially
3. **Fine-Tuning**: Unfreeze top layers for better performance
4. **Callbacks**: Early stopping, learning rate reduction, model checkpointing

### Expected Performance
- **Accuracy**: >90%
- **Precision**: >88%
- **Recall**: >90%

## 🔄 Model Conversion

The training script automatically converts the Keras model to TensorFlow.js format:

```python
# Convert to TensorFlow.js
tfjs.converters.save_keras_model(model, 'public/model')
```

This generates:
- `model.json` - Model architecture and weights manifest
- `weights.bin` - Binary weights file (or multiple shard files)

## � Web Application Features

### Image Upload
- **Drag-and-drop** interface
- **File validation** (JPG/PNG, max 10MB)
- **Image preview** with loading states
- **Reset functionality** to analyze multiple images

### AI Analysis
- **Real-time preprocessing** (resize, normalize, tensor conversion)
- **Confidence scores** with percentage display
- **Color-coded results** (green=Normal, red=Pneumonia)
- **Error handling** with user-friendly messages

### UI/UX Design
- **Medical dashboard** style
- **Responsive layout** for all devices
- **Loading indicators** during model loading and prediction
- **Professional color scheme** (blue primary, medical green/red)

## 🔧 Model Integration

### Browser-side Processing
```javascript
// Load model
const model = await tf.loadLayersModel('/model/model.json');

// Preprocess image
const imageTensor = tf.browser.fromPixels(imageElement);
const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
const normalized = resized.div(255.0);
const batched = normalized.expandDims(0);

// Run prediction
const prediction = model.predict(batched);
```

### Model Loading Strategy
- **Multiple path attempts** for robustness
- **Promise caching** to prevent duplicate loads
- **Warm-up prediction** for faster first inference
- **Error recovery** with detailed logging

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Other Platforms
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use GitHub Actions for auto-deployment
- **AWS S3 + CloudFront**: Static website hosting
- **Firebase Hosting**: Simple static hosting

## 📊 Model Performance Monitoring

### Training Metrics
The training script generates:
- **Accuracy/Loss plots** saved as PNG
- **Classification report** with precision/recall
- **Confusion matrix** for error analysis
- **Training history** for model improvement

### Web Analytics
- **Prediction confidence** tracking
- **Model loading time** monitoring
- **Error rate** measurement
- **User interaction** analytics

## 🔒 Privacy & Security

### Data Privacy
- **Local processing** - Images never leave the browser
- **No server uploads** - All computation happens client-side
- **Secure model loading** - Models served from same domain
- **Memory management** - Automatic tensor cleanup

### Medical Compliance
- **HIPAA considerations** - No data transmission
- **Disclaimer included** - Not for primary diagnosis
- **Professional use only** - Healthcare assistant tool

## 🧪 Testing & Validation

### Model Testing
```bash
# Test model performance
python -c "
import tensorflow as tf
model = tf.keras.models.load_model('best_model.h5')
# Run test suite
"
```

### Web Application Testing
```bash
# Run linting
npm run lint

# Type checking
npm run build

# Preview production build
npm run preview
```

## ⚠️ Medical Disclaimer

**⚠️ IMPORTANT: This tool is for medical assistance only and should not replace professional medical diagnosis.**

- Always consult qualified healthcare professionals
- Use results as supportive information, not definitive diagnosis
- Consider clinical context and patient history
- Follow local medical guidelines and regulations
- Not approved for clinical use as primary diagnostic tool

## 🐛 Troubleshooting

### Common Issues

#### Model Loading Errors
```bash
# Check model files exist
ls -la public/model/

# Verify model format
python -c "import tensorflowjs as tfjs; print('TF.js version:', tfjs.__version__)"
```

#### Training Issues
```bash
# Check GPU availability
python -c "import tensorflow as tf; print('GPUs:', len(tf.config.list_physical_devices('GPU')))"

# Increase memory if needed
export TF_GPU_ALLOCATOR=cuda_malloc_async
```

#### Web Application Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npx tsc --noEmit
```

### Performance Optimization

#### Model Size Reduction
```python
# Quantize model during conversion
tfjs.converters.save_keras_model(
    model, 
    'public/model',
    quantization_dtype=[tf.uint8]  # Reduces size by ~75%
)
```

#### Web Performance
- **Lazy loading** for model files
- **Progressive loading** with loading indicators
- **Memory optimization** with tensor disposal
- **Caching strategies** for model files

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

## 🙏 Acknowledgments

- **Kaggle** for the Chest X-ray Pneumonia dataset
- **TensorFlow** team for excellent ML frameworks
- **MobileNetV2** researchers for the base architecture
- **Medical community** for dataset annotation and validation

## 📞 Support

For support or questions:
- 🐛 **Report bugs**: Create an issue on GitHub
- 💡 **Feature requests**: Open a discussion
- 📧 **Medical inquiries**: Consult healthcare professionals

---


