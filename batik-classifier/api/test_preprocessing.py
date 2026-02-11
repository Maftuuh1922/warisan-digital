#!/usr/bin/env python3
"""
Test script to validate backend preprocessing matches Google Colab exactly.
"""
import os
import numpy as np
from PIL import Image
import json
from ai_edge_litert.interpreter import Interpreter

# Configuration
MODEL_PATH = os.path.join('models', 'batik_model.tflite')
CLASSES_PATH = os.path.join('models', 'batik_classes_mobilenet_ultimate.json')

def prepare_image(image, target_size=(224, 224)):
    """
    Preprocess image to match Google Colab training exactly:
    - Resize to 224x224
    - Convert to RGB
    - Convert to float32
    - Normalize using x/127.5 - 1.0 (range -1 to 1)
    """
    # Ensure RGB format
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    # Resize to exact target size
    image = image.resize(target_size)
    
    # Convert to numpy array with float32 dtype
    img_array = np.array(image, dtype=np.float32) 
    
    # Apply exact normalization used in Google Colab: x/127.5 - 1.0
    # This converts 0-255 range to -1 to 1 range
    img_array = img_array / 127.5 - 1.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def test_preprocessing():
    """Test preprocessing pipeline."""
    print("🧪 Testing Preprocessing Pipeline")
    print("=" * 50)
    
    # Test with a sample RGB image
    test_image = Image.new('RGB', (300, 300), color='red')
    
    # Process the image
    processed = prepare_image(test_image)
    
    # Validate output
    print(f"✅ Output shape: {processed.shape}")
    print(f"✅ Output dtype: {processed.dtype}")
    print(f"✅ Value range: [{processed.min():.3f}, {processed.max():.3f}]")
    
    # Check if normalization is correct
    # For red pixels (255, 0, 0), normalized should be (1.0, -1.0, -1.0)
    expected_red = (255 / 127.5) - 1.0  # Should be 1.0
    expected_zero = (0 / 127.5) - 1.0   # Should be -1.0
    
    print(f"✅ Expected red channel value: {expected_red}")
    print(f"✅ Expected blue/green channel value: {expected_zero}")
    print(f"✅ Actual red channel value: {processed[0, 0, 0, 0]:.3f}")
    print(f"✅ Actual green channel value: {processed[0, 0, 0, 1]:.3f}")
    print(f"✅ Actual blue channel value: {processed[0, 0, 0, 2]:.3f}")
    
    # Validate normalization formula
    if abs(processed[0, 0, 0, 0] - expected_red) < 0.01:
        print("✅ Red channel normalization: CORRECT")
    else:
        print("❌ Red channel normalization: INCORRECT")
        
    if abs(processed[0, 0, 0, 1] - expected_zero) < 0.01:
        print("✅ Green channel normalization: CORRECT")
    else:
        print("❌ Green channel normalization: INCORRECT")
        
    return processed

def test_model_loading():
    """Test TFLite model loading."""
    print("\n🤖 Testing Model Loading")
    print("=" * 50)
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model file not found: {MODEL_PATH}")
        return None, None, None
        
    try:
        interpreter = Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"✅ Model loaded successfully")
        print(f"✅ Input shape: {input_details[0]['shape']}")
        print(f"✅ Output shape: {output_details[0]['shape']}")
        print(f"✅ Input dtype: {input_details[0]['dtype']}")
        
        return interpreter, input_details, output_details
        
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        return None, None, None

def test_classes_loading():
    """Test classes loading."""
    print("\n📋 Testing Classes Loading")
    print("=" * 50)
    
    if not os.path.exists(CLASSES_PATH):
        print(f"❌ Classes file not found: {CLASSES_PATH}")
        return None
        
    try:
        with open(CLASSES_PATH, 'r', encoding='utf-8') as f:
            class_data = json.load(f)
            
        if isinstance(class_data, dict):
            if all(str(k).isdigit() for k in class_data.keys()):
                sorted_keys = sorted(class_data.keys(), key=int)
                class_names = [class_data[k] for k in sorted_keys]
            else:
                sorted_keys = sorted(class_data.keys())
                class_names = [class_data[k] for k in sorted_keys]
        elif isinstance(class_data, list):
            class_names = class_data
        else:
            raise ValueError("Invalid JSON format")
            
        print(f"✅ Classes loaded: {len(class_names)} classes")
        print(f"✅ Sample classes: {class_names[:3]}...")
        
        return class_names
        
    except Exception as e:
        print(f"❌ Classes loading failed: {e}")
        return None

def test_full_pipeline():
    """Test complete prediction pipeline."""
    print("\n🔄 Testing Full Pipeline")
    print("=" * 50)
    
    # Load model and classes
    interpreter, input_details, output_details = test_model_loading()
    class_names = test_classes_loading()
    
    if interpreter is None or class_names is None:
        print("❌ Cannot test full pipeline - prerequisites failed")
        return
        
    try:
        # Create test image
        test_image = Image.new('RGB', (300, 300), color='blue')
        
        # Preprocess
        input_data = prepare_image(test_image)
        
        # Run inference
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        predictions = output_data[0]
        predicted_index = np.argmax(predictions)
        confidence = float(predictions[predicted_index])
        
        print(f"✅ Prediction successful")
        print(f"✅ Predicted class: {class_names[predicted_index]}")
        print(f"✅ Confidence: {confidence:.4f}")
        print(f"✅ Predictions shape: {predictions.shape}")
        print(f"✅ Predictions sum: {np.sum(predictions):.4f}")
        
        # Get top 3 predictions
        top_3_indices = np.argsort(predictions)[-3:][::-1]
        print("✅ Top 3 predictions:")
        for i, idx in enumerate(top_3_indices):
            print(f"   {i+1}. {class_names[idx]}: {predictions[idx]:.4f}")
            
        print("✅ Full pipeline test: SUCCESS")
        
    except Exception as e:
        print(f"❌ Full pipeline test failed: {e}")

if __name__ == "__main__":
    print("🚀 Batik Classifier Preprocessing Test")
    print("=" * 50)
    
    test_preprocessing()
    test_model_loading()
    test_classes_loading()
    test_full_pipeline()
    
    print("\n✅ Testing completed!")