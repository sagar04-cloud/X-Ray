import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PredictionResultProps {
  prediction: {
    label: string;
    confidence: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ 
  prediction, 
  isLoading, 
  error 
}) => {
  /**
   * Get color scheme based on prediction result
   */
  const getResultColors = () => {
    if (!prediction) return 'bg-gray-50 border-gray-200';
    
    if (prediction.label === 'Normal') {
      return 'bg-green-50 border-green-200';
    } else {
      return 'bg-red-50 border-red-200';
    }
  };

  /**
   * Get icon based on prediction result
   */
  const getResultIcon = () => {
    if (!prediction) return null;
    
    if (prediction.label === 'Normal') {
      return <CheckCircle className="w-8 h-8 text-green-600" />;
    } else {
      return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  /**
   * Get text color based on prediction result
   */
  const getResultTextColor = () => {
    if (!prediction) return 'text-gray-600';
    
    if (prediction.label === 'Normal') {
      return 'text-green-800';
    } else {
      return 'text-red-800';
    }
  };

  /**
   * Get confidence bar color
   */
  const getConfidenceBarColor = () => {
    if (!prediction) return 'bg-gray-400';
    
    if (prediction.label === 'Normal') {
      return 'bg-green-500';
    } else {
      return 'bg-red-500';
    }
  };

  // Don't render if loading, no prediction, and no error
  if (!isLoading && !prediction && !error) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {isLoading && (
        // Loading state
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                AI Analysis in Progress
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Our deep learning model is analyzing the chest X-ray...
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        // Error state
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800">
                Analysis Failed
              </h3>
              <p className="text-red-700 mt-2">
                {error}
              </p>
              <div className="mt-4 text-sm text-red-600">
                Please try uploading the image again or contact support if the problem persists.
              </div>
            </div>
          </div>
        </div>
      )}

      {prediction && !isLoading && (
        // Success state with prediction results
        <div className={`rounded-xl shadow-lg border-2 p-8 ${getResultColors()}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {getResultIcon()}
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Prediction Result
                </h3>
                <p className={`text-lg font-medium mt-1 ${getResultTextColor()}`}>
                  {prediction.label === 'Normal' ? 'Normal' : 'Pneumonia Detected'}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Confidence Level
              </span>
              <span className={`text-lg font-bold ${getResultTextColor()}`}>
                {Math.round(prediction.confidence * 100)}%
              </span>
            </div>
            
            {/* Confidence Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${getConfidenceBarColor()}`}
                style={{ width: `${prediction.confidence * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 p-4 bg-white bg-opacity-70 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">
                  {prediction.label === 'Normal' 
                    ? 'No signs of pneumonia detected' 
                    : 'Indications of pneumonia detected'
                  }
                </p>
                <p className="text-gray-600">
                  This AI analysis should be used as a supportive tool. 
                  Please consult with a qualified healthcare professional for diagnosis.
                </p>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Medical Disclaimer:</strong> This AI system provides assistance only and 
              should not replace professional medical judgment. Always consult with qualified 
              healthcare providers for medical diagnosis and treatment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
