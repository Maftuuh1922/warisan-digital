import os
import json
import numpy as np
# Using standard TensorFlow Lite interpreter
try:
    from ai_edge_litert.interpreter import Interpreter
    print("✅ Using AI Edge LiteRT Runtime")
except ImportError:
    try:
        from tensorflow.lite import Interpreter
        print("✅ Using TensorFlow Lite Interpreter")
    except ImportError:
        from tflite_runtime.interpreter import Interpreter
        print("✅ Using TFLite Runtime")

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# --- KONFIGURASI ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# New model and labels based on user request
MODEL_PATH = os.path.join(BASE_DIR, 'batik_camera_robust_v2 tta.tflite') 
CLASSES_PATH = os.path.join(BASE_DIR, 'batik_labels_v2.json')

print("==================================================")
print("🚀 MEMULAI BATIK CLASSIFIER (LITERT ENGINE V2)")
print("⚡ Mode: ai-edge-litert (New Robust Model)")
print("==================================================")

# --- 1. LOAD MODEL TFLITE ---
if not os.path.exists(MODEL_PATH):
    # Try alternate path if not found in root
    MODEL_PATH = os.path.join(BASE_DIR, 'models', 'batik_camera_robust_v2 tta.tflite')

if not os.path.exists(MODEL_PATH):
    print(f"❌ ERROR: File model TFLite tidak ditemukan: {MODEL_PATH}")
    exit()

try:
    # Using Interpreter
    interpreter = Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    
    # Dapat info input/output
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    input_shape = input_details[0]['shape'] 
    output_shape = output_details[0]['shape']
    print(f"✅ Model TFLite berhasil dimuat!")
    print(f"📊 Input Shape: {input_shape}, Output Classes: {output_shape[1]}")
except Exception as e:
    print(f"❌ Gagal load TFLite: {e}")
    exit()

# --- 2. LOAD CLASSES ---
if not os.path.exists(CLASSES_PATH):
    print(f"❌ ERROR: File label tidak ditemukan di {CLASSES_PATH}")
    exit()

try:
    with open(CLASSES_PATH, 'r') as f:
        class_data = json.load(f)
        
        # Logika parsing JSON kamu sudah bagus!
        if isinstance(class_data, dict) and "classes" in class_data:
            class_names = class_data["classes"]
        elif isinstance(class_data, dict):
            try:
                sorted_keys = sorted(class_data.keys(), key=lambda x: int(x))
                class_names = [class_data[k] for k in sorted_keys]
            except ValueError:
                class_names = list(class_data.values())
        elif isinstance(class_data, list):
            class_names = class_data
        else:
            raise ValueError("Format JSON tidak dikenali.")

    print(f"✅ Berhasil memuat {len(class_names)} nama motif batik.")
    # print(f"📝 Contoh: {class_names[:3]}...") 

except Exception as e:
    print(f"❌ Gagal membaca file JSON Classes: {e}")
    exit()

# --- PREPROCESSING ---
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

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "Online", 
        "mode": "ai-edge-litert Runtime (BatikLens V2)",
        "model_version": "v2",
        "classes_loaded": len(class_names)
    })

@app.route('/predict', methods=['POST'])
def predict():
    # Support both 'file' and 'image' field names
    file = request.files.get('file') or request.files.get('image')
    
    if not file:
        return jsonify({"error": "No file part"}), 400
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # 1. Baca & Proses Gambar
        image = Image.open(io.BytesIO(file.read()))
        input_data = prepare_image(image)
        
        # 2. Masukkan data ke Interpreter
        interpreter.set_tensor(input_details[0]['index'], input_data)
        
        # 3. Jalankan Prediksi
        interpreter.invoke()
        
        # 4. Ambil Hasil
        output_data = interpreter.get_tensor(output_details[0]['index'])
        predictions = output_data[0]
        
        # 5. Cari skor tertinggi
        predicted_index = np.argmax(predictions)
        predicted_label = class_names[predicted_index]
        confidence = float(predictions[predicted_index])
        
        # Get top 5 predictions
        top_5_indices = np.argsort(predictions)[-5:][::-1]
        top_5_predictions = [
            {
                "class": class_names[idx],
                "confidence": float(predictions[idx]),
                "percentage": f"{float(predictions[idx]):.2%}"
            }
            for idx in top_5_indices
        ]
        
        return jsonify({
            "success": True,
            "prediction": predicted_label,
            "confidence": confidence,
            "percentage": f"{confidence:.2%}",
            "top_5_predictions": top_5_predictions
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)