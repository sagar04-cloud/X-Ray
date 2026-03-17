import React, { useState, useEffect } from 'react';
import { UploadXray } from '../components/UploadXray';
import { PredictionResult } from '../components/PredictionResult';
import { AnalysisReport } from '../components/AnalysisReport';
import { modelLoader } from '../services/modelLoader';
import { imageValidator } from '../services/imageValidator';
import { Brain, Shield, Zap, AlertCircle } from 'lucide-react';

interface Prediction {
  label: string;
  confidence: number;
}

export const Home: React.FC = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);

  /**
   * Load the TensorFlow.js model when component mounts
   */
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Starting model loading...');
        
        await modelLoader.loadModel();
        setModelReady(true);
        console.log('Pneumonia detection model loaded successfully');
      } catch (err) {
        console.error('Failed to load model:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load AI model. Please refresh the page and try again.';
        setError(errorMessage);
        setModelReady(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  /**
   * Handle image selection and run prediction
   * @param imageData - Base64 encoded image data
   */
  const handleImageSelect = async (imageData: string) => {
    if (!imageData) {
      setPrediction(null);
      setError(null);
      setShowReport(false);
      return;
    }

    // Reset previous results
    setPrediction(null);
    setError(null);
    setShowReport(false);

    if (!modelReady) {
      setError('AI model is not ready. Please wait for the model to load or refresh the page.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting image validation...');

      // Create image element from base64 data
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageData;
      });

      console.log('Image loaded, validating if it\'s a medical X-ray...');

      // Validate if it's a medical X-ray image
      const validation = await imageValidator.validateMedicalImage(img);
      
      if (!validation.isValid) {
        setError(validation.message);
        console.log('Image validation failed:', validation.message);
        return;
      }

      console.log('Image validation passed. Starting AI analysis...');

      // Preprocess image for model
      const imageTensor = await modelLoader.preprocessImage(img);

      console.log('Image preprocessed, running prediction...');

      // Run prediction
      const result = await modelLoader.predict(imageTensor);

      // Update state with prediction result
      setPrediction(result);
      console.log('Prediction completed:', result);

    } catch (err) {
      console.error('Prediction failed:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to analyze the image. Please try uploading a different image.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset the entire application state
   */
  const handleReset = () => {
    setPrediction(null);
    setError(null);
    setIsLoading(false);
    setShowReport(false);
    // Trigger reset in UploadXray component
    setResetTrigger(prev => !prev);
  };

  /**
   * Generate analysis report
   */
  const handleGenerateReport = () => {
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Pneumonia Detection
                </h1>
                <p className="text-sm text-gray-600">
                  Using Chest X-Ray Analysis with Deep Learning
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isLoading && !modelReady && (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Loading AI Model...</span>
                </div>
              )}
              {modelReady && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">AI Model Ready</span>
                </div>
              )}
              {error && !modelReady && !isLoading && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Model Error</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Pneumonia Detection System
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload a chest X-ray image to receive an AI-powered analysis. 
            Our deep learning model detects signs of pneumonia with high accuracy, 
            assisting healthcare professionals in faster diagnosis.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-6 h-6 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Fast Analysis</h3>
            </div>
            <p className="text-sm text-gray-600">
              Get results in seconds with our optimized TensorFlow.js model running directly in your browser.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-6 h-6 text-green-500" />
              <h3 className="font-semibold text-gray-900">Secure & Private</h3>
            </div>
            <p className="text-sm text-gray-600">
              All processing happens locally in your browser. Your medical images never leave your device.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <Brain className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-gray-900">AI-Powered</h3>
            </div>
            <p className="text-sm text-gray-600">
              Built with state-of-the-art deep learning technology trained on thousands of chest X-ray images.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <UploadXray 
            onImageSelect={handleImageSelect}
            isProcessing={isLoading}
            resetTrigger={resetTrigger}
          />
        </div>

        {/* Prediction Results */}
        <PredictionResult 
          prediction={prediction}
          isLoading={isLoading}
          error={error}
        />

        {/* Reset Button (shown when there's a result) */}
        {(prediction || error) && !isLoading && (
          <div className="text-center mt-8 space-y-4">
            {prediction && (
              <button
                onClick={handleGenerateReport}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
              >
                Generate Medical Report
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Analyze Another Image
            </button>
          </div>
        )}

        {/* Analysis Report */}
        {showReport && prediction && (
          <AnalysisReport 
            prediction={prediction}
            patientInfo={{
              name: '',
              age: '',
              gender: '',
              id: ''
            }}
          />
        )}

        {/* Instructions */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Upload Image</h4>
              <p className="text-sm text-gray-600">
                Drag and drop or select a chest X-ray image from your device
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">AI Processing</h4>
              <p className="text-sm text-gray-600">
                Our model analyzes the image for pneumonia indicators
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">View Results</h4>
              <p className="text-sm text-gray-600">
                Get instant prediction with confidence score
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Consult Doctor</h4>
              <p className="text-sm text-gray-600">
                Share results with healthcare professional for diagnosis
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              © 2024 AI Pneumonia Detection System. For medical assistance only.
            </p>
            <p>
              This tool should not replace professional medical diagnosis. 
              Always consult qualified healthcare providers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
