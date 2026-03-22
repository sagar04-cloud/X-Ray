/**
 * Image validation service to ensure only medical X-ray images are analyzed
 */

export interface ValidationResult {
  isValid: boolean;
  isMedicalImage: boolean;
  confidence: number;
  message: string;
}

export class ImageValidator {
  /**
   * Validate if the uploaded image is a medical X-ray
   * @param imageElement - HTML image element
   * @returns Promise<ValidationResult> - Validation result with details
   */
  async validateMedicalImage(imageElement: HTMLImageElement): Promise<ValidationResult> {
    try {
      // Create a canvas to analyze image pixels
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return {
          isValid: false,
          isMedicalImage: false,
          confidence: 0,
          message: 'Failed to process image for validation'
        };
      }

      // Set canvas size to a reasonable analysis size
      const analysisSize = 224;
      canvas.width = analysisSize;
      canvas.height = analysisSize;

      // Draw and analyze the image
      ctx.drawImage(imageElement, 0, 0, analysisSize, analysisSize);
      const imageData = ctx.getImageData(0, 0, analysisSize, analysisSize);
      const pixels = imageData.data;

      // Analyze image characteristics
      const characteristics = this.analyzeImageCharacteristics(pixels);
      
      // Determine if it's a medical X-ray
      const medicalScore = this.calculateMedicalScore(characteristics);
      
      // Make decision based on score - require higher score for medical images
      const isMedical = medicalScore > 0.65; // Stricter threshold for medical images
      const confidence = isMedical ? medicalScore : 1 - medicalScore;

      if (!isMedical) {
        return {
          isValid: false,
          isMedicalImage: false,
          confidence,
          message: this.getRejectionMessage(characteristics)
        };
      }

      return {
        isValid: true,
        isMedicalImage: true,
        confidence,
        message: 'Valid medical X-ray image detected'
      };

    } catch (error) {
      console.error('Image validation failed:', error);
      return {
        isValid: false,
        isMedicalImage: false,
        confidence: 0,
        message: 'Failed to validate image. Please try another image.'
      };
    }
  }

  /**
   * Analyze image characteristics
   */
  private analyzeImageCharacteristics(pixels: Uint8ClampedArray): {
    brightness: number;
    contrast: number;
    grayscaleRatio: number;
    darkPixelRatio: number;
    edgeDensity: number;
    aspectRatio: number;
  } {
    const pixelCount = pixels.length / 4;
    let totalR = 0, totalG = 0, totalB = 0;
    let grayscalePixels = 0;
    let darkPixels = 0;
    let minBrightness = 255;
    let maxBrightness = 0;

    // Analyze each pixel
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      totalR += r;
      totalG += g;
      totalB += b;
      
      const brightness = (r + g + b) / 3;
      
      // Track min/max for contrast
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
      
      // Count dark pixels (typical in X-rays)
      if (brightness < 50) {
        darkPixels++;
      }
      
      // Count grayscale pixels (X-rays are mostly grayscale)
      const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      if (colorVariance < 30) {
        grayscalePixels++;
      }
    }

    const avgBrightness = (totalR + totalG + totalB) / (3 * pixelCount);
    const contrast = (maxBrightness - minBrightness) / 255;
    const grayscaleRatio = grayscalePixels / pixelCount;
    const darkPixelRatio = darkPixels / pixelCount;

    // Calculate edge density (simplified)
    const edgeDensity = this.calculateEdgeDensity(pixels, 224, 224);

    return {
      brightness: avgBrightness / 255,
      contrast,
      grayscaleRatio,
      darkPixelRatio,
      edgeDensity,
      aspectRatio: 1.0 // Square analysis
    };
  }

  /**
   * Calculate edge density
   */
  private calculateEdgeDensity(pixels: Uint8ClampedArray, width: number, height: number): number {
    let edgeCount = 0;
    const totalChecks = (width - 1) * (height - 1);

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        
        // Check right neighbor
        const rightIdx = (y * width + (x + 1)) * 4;
        const rightBrightness = (pixels[rightIdx] + pixels[rightIdx + 1] + pixels[rightIdx + 2]) / 3;
        
        // Check bottom neighbor
        const bottomIdx = ((y + 1) * width + x) * 4;
        const bottomBrightness = (pixels[bottomIdx] + pixels[bottomIdx + 1] + pixels[bottomIdx + 2]) / 3;
        
        // Count as edge if there's significant difference
        if (Math.abs(brightness - rightBrightness) > 20 || 
            Math.abs(brightness - bottomBrightness) > 20) {
          edgeCount++;
        }
      }
    }

    return edgeCount / totalChecks;
  }

  /**
   * Calculate medical image score
   */
  private calculateMedicalScore(characteristics: {
    brightness: number;
    contrast: number;
    grayscaleRatio: number;
    darkPixelRatio: number;
    edgeDensity: number;
    aspectRatio: number;
  }): number {
    let score = 0.3; // Start with low score (favor rejection)

    // X-rays are typically grayscale - be strict about this
    if (characteristics.grayscaleRatio > 0.85) {
      score += 0.3;
    } else if (characteristics.grayscaleRatio > 0.7) {
      score += 0.15;
    } else if (characteristics.grayscaleRatio < 0.5) {
      score -= 0.3; // Heavy penalty for color photos
    }

    // X-rays have specific brightness range - be strict
    if (characteristics.brightness > 0.2 && characteristics.brightness < 0.7) {
      score += 0.2;
    } else if (characteristics.brightness > 0.8) {
      score -= 0.25; // Bright photos are not X-rays
    } else if (characteristics.brightness < 0.1) {
      score -= 0.2; // Too dark
    }

    // X-rays usually have good contrast
    if (characteristics.contrast > 0.25) {
      score += 0.15;
    } else if (characteristics.contrast < 0.15) {
      score -= 0.15;
    }

    // Dark areas are common in X-rays (bones, organs)
    if (characteristics.darkPixelRatio > 0.08) {
      score += 0.1;
    }

    // Edge density patterns typical of medical imaging
    if (characteristics.edgeDensity > 0.08 && characteristics.edgeDensity < 0.4) {
      score += 0.1;
    }

    // Additional check for medical imaging patterns
    const hasMedicalTexture = this.detectMedicalTexture(characteristics);
    if (hasMedicalTexture) {
      score += 0.15;
    } else {
      score -= 0.1; // Penalty if no medical texture detected
    }

    // Strict rejection of obvious photos
    if (characteristics.brightness > 0.6 && characteristics.contrast > 0.15 && 
        characteristics.grayscaleRatio < 0.7) {
      score -= 0.3; // Likely a regular photo
    }

    // Additional penalty for very bright, colorful images
    if (characteristics.brightness > 0.7 && characteristics.grayscaleRatio < 0.6) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Detect medical texture patterns in images
   */
  private detectMedicalTexture(characteristics: {
    brightness: number;
    contrast: number;
    grayscaleRatio: number;
    darkPixelRatio: number;
    edgeDensity: number;
    aspectRatio: number;
  }): boolean {
    // Medical images often have:
    // - Moderate brightness (not too dark, not too bright)
    // - Reasonable contrast
    // - Some dark areas (bones, organs)
    // - Textural patterns typical of medical imaging
    
    const brightnessInRange = characteristics.brightness > 0.2 && characteristics.brightness < 0.7;
    const contrastReasonable = characteristics.contrast > 0.1;
    const hasDarkAreas = characteristics.darkPixelRatio > 0.03;
    const edgesReasonable = characteristics.edgeDensity > 0.08;
    
    // If most conditions are met, it's likely medical
    const conditionsMet = [
      brightnessInRange,
      contrastReasonable,
      hasDarkAreas,
      edgesReasonable
    ].filter(Boolean).length;
    
    return conditionsMet >= 3; // At least 3 of 4 conditions
  }

  /**
   * Get appropriate rejection message based on image characteristics
   */
  private getRejectionMessage(characteristics: {
    brightness: number;
    contrast: number;
    grayscaleRatio: number;
    darkPixelRatio: number;
    edgeDensity: number;
    aspectRatio: number;
  }): string {
    // Strict rejection for color photos
    if (characteristics.grayscaleRatio < 0.5) {
      return 'This appears to be a color photograph. Only medical chest X-ray images (black and white) are accepted for analysis.';
    }

    // Reject bright images typical of photos
    if (characteristics.brightness > 0.8) {
      return 'This image appears too bright for a medical X-ray. Please upload a proper chest X-ray image with appropriate medical imaging contrast.';
    }

    // Reject very dark images
    if (characteristics.brightness < 0.1) {
      return 'This image is too dark or of poor quality. Please provide a clear, properly exposed chest X-ray image.';
    }

    // Reject low contrast images
    if (characteristics.contrast < 0.15) {
      return 'This image has insufficient contrast for medical analysis. Please upload a high-quality chest X-ray with clear anatomical details.';
    }

    // Reject images that look like regular photos
    if (characteristics.brightness > 0.6 && characteristics.grayscaleRatio < 0.7) {
      return 'This does not appear to be a medical X-ray image. Please upload only chest X-ray images taken in a medical setting.';
    }

    // Default strict message
    return 'Invalid image: This does not meet the criteria for a medical chest X-ray. Please ensure you are uploading a proper medical X-ray image.';
  }
}

// Export singleton instance
export const imageValidator = new ImageValidator();
