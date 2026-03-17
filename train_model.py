import tensorflow as tf
import tensorflowjs as tfjs
import numpy as np
import os
import shutil
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import matplotlib.pyplot as plt
import json

# Configuration constants
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.001
DATASET_PATH = 'dataset'
MODEL_SAVE_PATH = 'trained_model'
TFJS_MODEL_PATH = 'public/model'

def create_dataset_structure():
    """
    Create the expected dataset directory structure
    """
    print("Creating dataset directory structure...")
    
    directories = [
        'dataset/train/NORMAL',
        'dataset/train/PNEUMONIA',
        'dataset/test/NORMAL',
        'dataset/test/PNEUMONIA'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    
    print("Dataset structure created. Please add your X-ray images to these directories:")
    print("- dataset/train/NORMAL/")
    print("- dataset/train/PNEUMONIA/")
    print("- dataset/test/NORMAL/")
    print("- dataset/test/PNEUMONIA/")

def prepare_dataset():
    """
    Prepare training, validation, and test datasets with data augmentation
    """
    print("Preparing datasets...")
    
    # Check if dataset exists
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset directory '{DATASET_PATH}' not found!")
        create_dataset_structure()
        return None, None, None, 0
    
    train_dir = os.path.join(DATASET_PATH, 'train')
    test_dir = os.path.join(DATASET_PATH, 'test')
    
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        zoom_range=0.15,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        fill_mode='nearest',
        validation_split=0.2  # Use 20% of training data for validation
    )
    
    # Only rescaling for validation and test
    validation_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Training data generator
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='training',
        shuffle=True,
        seed=42
    )
    
    # Validation data generator
    validation_generator = validation_datagen.flow_from_directory(
        train_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='validation',
        shuffle=True,
        seed=42
    )
    
    # Test data generator
    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        shuffle=False
    )
    
    # Get class information
    class_indices = train_generator.class_indices
    num_classes = len(class_indices)
    
    print(f"Classes found: {class_indices}")
    print(f"Training samples: {train_generator.samples}")
    print(f"Validation samples: {validation_generator.samples}")
    print(f"Test samples: {test_generator.samples}")
    
    return train_generator, validation_generator, test_generator, num_classes

def build_model(num_classes=1):
    """
    Build MobileNetV2 model with transfer learning for binary classification
    """
    print("Building MobileNetV2 model...")
    
    # Load MobileNetV2 without the top classification layer
    base_model = MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze the base model layers initially
    base_model.trainable = False
    
    # Add custom classification layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    
    if num_classes == 1:
        # Binary classification
        predictions = Dense(1, activation='sigmoid')(x)
        loss_function = 'binary_crossentropy'
        final_metrics = ['accuracy', 
                        tf.keras.metrics.Precision(name='precision'),
                        tf.keras.metrics.Recall(name='recall')]
    else:
        # Multi-class classification
        predictions = Dense(num_classes, activation='softmax')(x)
        loss_function = 'categorical_crossentropy'
        final_metrics = ['accuracy']
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile the model
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss=loss_function,
        metrics=final_metrics
    )
    
    print(f"Model built with {len(model.layers)} layers")
    return model, base_model

def train_model(model, train_generator, validation_generator):
    """
    Train the model with callbacks
    """
    print("Starting model training...")
    
    # Create callbacks
    checkpoint = ModelCheckpoint(
        'best_model.h5',
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )
    
    early_stopping = EarlyStopping(
        monitor='val_accuracy',
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
    
    reduce_lr = ReduceLROnPlateau(
        monitor='val_accuracy',
        factor=0.2,
        patience=3,
        min_lr=1e-6,
        verbose=1
    )
    
    # Calculate steps per epoch
    steps_per_epoch = train_generator.samples // BATCH_SIZE
    validation_steps = validation_generator.samples // BATCH_SIZE
    
    # Train the model
    history = model.fit(
        train_generator,
        steps_per_epoch=steps_per_epoch,
        epochs=EPOCHS,
        validation_data=validation_generator,
        validation_steps=validation_steps,
        callbacks=[checkpoint, early_stopping, reduce_lr],
        verbose=1
    )
    
    return history

def fine_tune_model(model, base_model, train_generator, validation_generator):
    """
    Fine-tune the model by unfreezing some top layers of the base model
    """
    print("Fine-tuning the model...")
    
    # Unfreeze the top layers of the base model
    base_model.trainable = True
    
    # Freeze all layers except the last 30
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    
    # Recompile the model with a lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE / 10),
        loss='binary_crossentropy',
        metrics=['accuracy', 
                tf.keras.metrics.Precision(name='precision'),
                tf.keras.metrics.Recall(name='recall')]
    )
    
    # Continue training
    fine_tune_history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // BATCH_SIZE,
        epochs=10,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // BATCH_SIZE,
        callbacks=[early_stopping, reduce_lr],
        verbose=1
    )
    
    return fine_tune_history

def evaluate_model(model, test_generator):
    """
    Evaluate the model on test data
    """
    print("Evaluating model on test data...")
    
    # Get predictions
    predictions = model.predict(test_generator, steps=len(test_generator))
    predicted_classes = (predictions > 0.5).astype(int).flatten()
    
    # Get true classes
    true_classes = test_generator.classes
    class_labels = list(test_generator.class_indices.keys())
    
    # Calculate metrics
    from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
    
    accuracy = accuracy_score(true_classes, predicted_classes)
    report = classification_report(true_classes, predicted_classes, target_names=class_labels)
    conf_matrix = confusion_matrix(true_classes, predicted_classes)
    
    print(f"\nTest Accuracy: {accuracy:.4f}")
    print(f"\nClassification Report:\n{report}")
    print(f"\nConfusion Matrix:\n{conf_matrix}")
    
    return accuracy, report, conf_matrix

def convert_to_tensorflowjs(model):
    """
    Convert Keras model to TensorFlow.js format
    """
    print("Converting model to TensorFlow.js format...")
    
    # Create TFJS model directory
    os.makedirs(TFJS_MODEL_PATH, exist_ok=True)
    
    # Convert and save model
    tfjs.converters.save_keras_model(
        model,
        TFJS_MODEL_PATH,
        quantization_dtype=[tf.uint8]  # Optional quantization for smaller file size
    )
    
    print(f"Model converted and saved to {TFJS_MODEL_PATH}")
    
    # List the generated files
    print("Generated files:")
    for file in os.listdir(TFJS_MODEL_PATH):
        file_path = os.path.join(TFJS_MODEL_PATH, file)
        size = os.path.getsize(file_path) / (1024 * 1024)  # Size in MB
        print(f"  {file} ({size:.2f} MB)")

def plot_training_history(history, save_path='training_history.png'):
    """
    Plot and save training history
    """
    plt.figure(figsize=(15, 5))
    
    # Plot accuracy
    plt.subplot(1, 3, 1)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    
    # Plot loss
    plt.subplot(1, 3, 2)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    # Plot precision and recall if available
    if 'precision' in history.history:
        plt.subplot(1, 3, 3)
        plt.plot(history.history['precision'], label='Training Precision')
        plt.plot(history.history['val_precision'], label='Validation Precision')
        plt.plot(history.history['recall'], label='Training Recall')
        plt.plot(history.history['val_recall'], label='Validation Recall')
        plt.title('Precision & Recall')
        plt.xlabel('Epoch')
        plt.ylabel('Score')
        plt.legend()
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.show()
    print(f"Training history plot saved to {save_path}")

def main():
    """
    Main training pipeline
    """
    print("=" * 60)
    print("AI PNEUMONIA DETECTION MODEL TRAINING")
    print("=" * 60)
    
    # Prepare dataset
    train_generator, validation_generator, test_generator, num_classes = prepare_dataset()
    
    if train_generator is None:
        print("Please add dataset images and run again.")
        return
    
    # Build model
    model, base_model = build_model(num_classes)
    
    # Train model
    history = train_model(model, train_generator, validation_generator)
    
    # Fine-tune model
    fine_tune_history = fine_tune_model(model, base_model, train_generator, validation_generator)
    
    # Evaluate model
    if test_generator.samples > 0:
        accuracy, report, conf_matrix = evaluate_model(model, test_generator)
    
    # Plot training history
    plot_training_history(history)
    
    # Convert to TensorFlow.js
    convert_to_tensorflowjs(model)
    
    print("\n" + "=" * 60)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("Model saved in TensorFlow.js format in 'public/model/' directory")
    print("You can now run the web application with: npm run dev")

if __name__ == "__main__":
    main()
