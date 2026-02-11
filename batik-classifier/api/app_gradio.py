import os
import json
import numpy as np
# Using standard TensorFlow Lite interpreter for HuggingFace Spaces
try:
    from tensorflow.lite import Interpreter
except ImportError:
    from tflite_runtime.interpreter import Interpreter

import gradio as gr
from PIL import Image
import io

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'batik_model.tflite') 
CLASSES_PATH = os.path.join(BASE_DIR, 'batik_labels_v2.json')

print("==================================================")
print("🚀 BATIK CLASSIFIER - HUGGINGFACE SPACES")
print("⚡ Using TensorFlow Lite Runtime")
print("==================================================")

# --- 1. LOAD TFLITE MODEL ---
if not os.path.exists(MODEL_PATH):
    print(f"❌ ERROR: TFLite model file not found: {MODEL_PATH}")
    exit()

try:
    interpreter = Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    input_shape = input_details[0]['shape'] 
    output_shape = output_details[0]['shape']
    print(f"✅ TFLite model loaded successfully!")
    print(f"📊 Input Shape: {input_shape}, Output Classes: {output_shape[1]}")
except Exception as e:
    print(f"❌ Failed to load TFLite model: {e}")
    exit()

# --- 2. LOAD CLASSES ---
if not os.path.exists(CLASSES_PATH):
    print(f"❌ ERROR: Classes file not found: {CLASSES_PATH}")
    exit()

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
        raise ValueError("Unrecognized JSON format.")

    print(f"✅ Successfully loaded {len(class_names)} batik classes.")

except Exception as e:
    print(f"❌ Failed to load classes JSON: {e}")
    exit()

# --- PREPROCESSING FUNCTION ---
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

# --- PREDICTION FUNCTION ---
def predict_batik(image):
    """
    Predict batik pattern from image using TensorFlow Lite model.
    """
    if image is None:
        return "Please upload an image", {}
    
    try:
        # Preprocess image
        input_data = prepare_image(image)
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], input_data)
        
        # Run inference
        interpreter.invoke()
        
        # Get output
        output_data = interpreter.get_tensor(output_details[0]['index'])
        predictions = output_data[0]
        
        # Get top prediction
        predicted_index = np.argmax(predictions)
        predicted_label = class_names[predicted_index]
        confidence = float(predictions[predicted_index])
        
        # Get top 5 predictions
        top_5_indices = np.argsort(predictions)[-5:][::-1]
        top_5_results = {}
        
        for idx in top_5_indices:
            class_name = class_names[idx]
            class_confidence = float(predictions[idx])
            top_5_results[class_name] = class_confidence
        
        result_text = f"🎨 **{predicted_label}** (Confidence: {confidence:.1%})"
        
        return result_text, top_5_results
        
    except Exception as e:
        return f"Error during prediction: {str(e)}", {}

# --- GRADIO INTERFACE ---
def create_interface():
    with gr.Blocks(
        title="🎨 Batik Pattern Classifier",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 800px !important;
            margin: auto !important;
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        """
    ) as iface:
        
        gr.HTML("""
        <div class="header">
            <h1>🎨 Batik Pattern Classifier</h1>
            <p>Upload an image of a batik pattern and get AI-powered classification results!</p>
            <p><strong>Supported:</strong> 38+ Traditional Indonesian Batik Patterns</p>
        </div>
        """)
        
        with gr.Row():
            with gr.Column(scale=1):
                image_input = gr.Image(
                    label="📸 Upload Batik Image",
                    type="pil",
                    sources=["upload", "camera"],
                    height=300
                )
                
                predict_btn = gr.Button(
                    "🔍 Classify Batik Pattern",
                    variant="primary",
                    size="lg"
                )
            
            with gr.Column(scale=1):
                result_text = gr.Textbox(
                    label="🎯 Prediction Result",
                    interactive=False,
                    lines=2
                )
                
                confidence_plot = gr.Label(
                    label="📊 Top 5 Predictions",
                    num_top_classes=5
                )
        
        gr.HTML("""
        <div style="text-align: center; margin-top: 2rem; padding: 1rem; background: #f0f0f0; border-radius: 10px;">
            <p><strong>🚀 Model Info:</strong> MobileNetV2 + TensorFlow Lite | <strong>📊 Accuracy:</strong> 95%+ | <strong>⚡ Classes:</strong> 38 Batik Patterns</p>
            <p><em>Made with ❤️ for Indonesian Heritage Preservation</em></p>
        </div>
        """)
        
        # Event handlers
        predict_btn.click(
            fn=predict_batik,
            inputs=[image_input],
            outputs=[result_text, confidence_plot]
        )
        
        # Auto-predict on image upload
        image_input.change(
            fn=predict_batik,
            inputs=[image_input],
            outputs=[result_text, confidence_plot]
        )
    
    return iface

# --- LAUNCH ---
if __name__ == "__main__":
    demo = create_interface()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True
    )