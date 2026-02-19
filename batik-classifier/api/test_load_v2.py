import numpy as np
import json
import os
import sys

print(f"Python version: {sys.version}")

try:
    try:
        from tensorflow.lite import Interpreter
    except ImportError:
        from tflite_runtime.interpreter import Interpreter
    print("TFLite Interpreter imported successfully.")
except ImportError:
    print("Cannot import TFLite Interpreter. Please install tensorflow or tflite-runtime.")
    sys.exit(1)

from PIL import Image

MODEL_PATH = "batik_camera_robust_v2 tta.tflite"
LABELS_PATH = "batik_labels_v2 (1).json"

if not os.path.exists(MODEL_PATH):
    print(f"Error: Model file not found at {MODEL_PATH}")
    sys.exit(1)

if not os.path.exists(LABELS_PATH):
    print(f"Error: Labels file not found at {LABELS_PATH}")
    sys.exit(1)

print(f"Loading model: {MODEL_PATH}")
try:
    interpreter = Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    print("✅ Model loaded successfully!")
    
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print(f"Input shape: {input_details[0]['shape']}")
    print(f"Output shape: {output_details[0]['shape']}")
    
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    sys.exit(1)

print(f"Loading labels: {LABELS_PATH}")
try:
    with open(LABELS_PATH, 'r') as f:
        data = json.load(f)
        classes = data.get('classes', [])
        print(f"✅ Labels loaded: {len(classes)} classes")
        if len(classes) != output_details[0]['shape'][1]:
            print(f"⚠️  WARNING: Mismatch! Model expects {output_details[0]['shape'][1]} classes but labels file has {len(classes)}.")
        else:
            print("✅ Class count matches model output.")
except Exception as e:
    print(f"❌ Failed to load labels: {e}")
    sys.exit(1)

print("\nAll checks passed. You can run the server now.")
