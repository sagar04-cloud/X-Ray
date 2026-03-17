import tensorflow as tf
import tensorflowjs as tfjs
import numpy as np

def create_demo_model():
    """
    Create a simple demo model for pneumonia detection
    This is a lightweight model for demonstration purposes
    """
    print("Creating demo pneumonia detection model...")
    
    # Create a simple CNN model
    model = tf.keras.Sequential([
        # Input layer
        tf.keras.layers.Input(shape=(224, 224, 3)),
        
        # First convolutional block
        tf.keras.layers.Conv2D(16, (3, 3), activation='relu', padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.MaxPooling2D((2, 2)),
        
        # Second convolutional block
        tf.keras.layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.MaxPooling2D((2, 2)),
        
        # Third convolutional block
        tf.keras.layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.MaxPooling2D((2, 2)),
        
        # Fourth convolutional block
        tf.keras.layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.MaxPooling2D((2, 2)),
        
        # Global pooling
        tf.keras.layers.GlobalAveragePooling2D(),
        
        # Dense layers
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.5),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        
        # Output layer - binary classification
        tf.keras.layers.Dense(1, activation='sigmoid', name='output')
    ])
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )
    
    # Print model summary
    model.summary()
    
    return model

def test_model(model):
    """
    Test the model with dummy data
    """
    print("\nTesting model with dummy data...")
    
    # Create dummy input
    dummy_input = np.random.random((1, 224, 224, 3)).astype(np.float32)
    
    # Make prediction
    prediction = model.predict(dummy_input, verbose=0)
    print(f"Demo prediction: {prediction[0][0]:.4f}")
    print("✅ Model is working correctly!")

def convert_to_tensorflowjs(model):
    """
    Convert the model to TensorFlow.js format
    """
    print("\nConverting model to TensorFlow.js format...")
    
    # Ensure the public/model directory exists
    import os
    os.makedirs('public/model', exist_ok=True)
    
    # Convert and save the model
    tfjs.converters.save_keras_model(
        model,
        'public/model',
        quantization_dtype=[tf.uint8]  # Quantize for smaller file size
    )
    
    print("✅ Model converted and saved to public/model/")
    
    # List the generated files
    print("\nGenerated files:")
    for file in os.listdir('public/model'):
        file_path = os.path.join('public/model', file)
        size = os.path.getsize(file_path) / (1024 * 1024)  # Size in MB
        print(f"  {file} ({size:.2f} MB)")

def main():
    """
    Main function to create and save demo model
    """
    print("=" * 60)
    print("DEMO PNEUMONIA DETECTION MODEL CREATOR")
    print("=" * 60)
    
    # Create the model
    model = create_demo_model()
    
    # Test the model
    test_model(model)
    
    # Convert to TensorFlow.js
    convert_to_tensorflowjs(model)
    
    print("\n" + "=" * 60)
    print("✅ DEMO MODEL CREATED SUCCESSFULLY!")
    print("=" * 60)
    print("The demo model is now ready for the web application.")
    print("Note: This is a demonstration model only.")
    print("For production use, train with real medical data using train_model.py")

if __name__ == "__main__":
    main()
