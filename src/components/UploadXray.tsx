import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface UploadXrayProps {
  onImageSelect: (imageData: string) => void;
  isProcessing: boolean;
  resetTrigger?: boolean; // Add reset trigger prop
}

export const UploadXray: React.FC<UploadXrayProps> = ({ onImageSelect, isProcessing, resetTrigger }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset image preview when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [resetTrigger]);

  /**
   * Handle file selection from input or drag-drop
   * @param file - Selected image file
   */
  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create file reader to convert image to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      onImageSelect(result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle file drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Handle file input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  /**
   * Handle button click to open file dialog
   */
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Reset image upload
   */
  const resetImage = () => {
    setImagePreview(null);
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!imagePreview ? (
        // Upload area when no image is selected
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-white'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center space-y-4">
            <Upload className="w-16 h-16 text-gray-400" />
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                Upload Chest X-Ray Image
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select
              </p>
            </div>
            
            <div className="text-xs text-gray-400">
              Supported formats: JPG, PNG (Max 10MB)
            </div>
            
            <button
              onClick={onButtonClick}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Select Image'
              )}
            </button>
          </div>
        </div>
      ) : (
        // Image preview area
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={resetImage}
              disabled={isProcessing}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="aspect-w-16 aspect-h-12">
            <img
              src={imagePreview}
              alt="Chest X-Ray"
              className="w-full h-96 object-contain bg-gray-50"
            />
          </div>
          
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-lg font-medium text-gray-700">
                  Analyzing X-Ray...
                </p>
                <p className="text-sm text-gray-500">
                  AI model is processing your image
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
