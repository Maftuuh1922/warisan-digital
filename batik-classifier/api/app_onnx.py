"""
BatikLens Backend — ONNX Runtime Engine
Pakai model batik_model.onnx (hasil konversi dari TFLite)
Jalankan: python app_onnx.py
"""
import os, json, io
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'batik_camera_robust_v2.tflite')
# Coba ONNX dulu, fallback ke TFLite
ONNX_PATH  = os.path.join(BASE_DIR, 'batik_model.onnx')
# Jika onnx tidak ada, coba di models/
if not os.path.exists(ONNX_PATH):
    ONNX_PATH = os.path.join(BASE_DIR, 'models', 'batik_model.onnx')

LABELS_PATH = os.path.join(BASE_DIR, 'batik_labels_v2.json')
MIN_CONFIDENCE = 0.35
IMG_SIZE = 224

print("=" * 55)
print("🚀 BATIKLENS BACKEND — ONNX Runtime Engine")
print("=" * 55)

# ── Load Labels ───────────────────────────────────
with open(LABELS_PATH) as f:
    data = json.load(f)
    CLASS_NAMES = data["classes"] if isinstance(data, dict) and "classes" in data else data
print(f"✅ Labels: {len(CLASS_NAMES)} kelas batik")

# ── Load Model (ONNX atau TFLite fallback) ────────
session = None
interpreter = None
USE_ONNX = False

if os.path.exists(ONNX_PATH):
    try:
        import onnxruntime as ort
        session = ort.InferenceSession(
            ONNX_PATH,
            providers=['CPUExecutionProvider']
        )
        INPUT_NAME  = session.get_inputs()[0].name
        OUTPUT_NAME = session.get_outputs()[0].name
        USE_ONNX = True
        print(f"✅ ONNX model loaded: {os.path.basename(ONNX_PATH)}")
        print(f"   Input : {INPUT_NAME} → {session.get_inputs()[0].shape}")
        print(f"   Output: {OUTPUT_NAME} → {session.get_outputs()[0].shape}")
    except Exception as e:
        print(f"⚠️  ONNX gagal: {e} — coba TFLite...")

if not USE_ONNX:
    try:
        try:
            from tensorflow.lite import Interpreter
        except ImportError:
            try:
                from tflite_runtime.interpreter import Interpreter
            except ImportError:
                from ai_edge_litert.interpreter import Interpreter

        interpreter = Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        input_details  = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        print(f"✅ TFLite model loaded: {os.path.basename(MODEL_PATH)}")
    except Exception as e:
        print(f"❌ TFLite juga gagal: {e}")
        print("❌ Tidak ada model yang bisa diload! Keluar...")
        exit(1)

# ── Preprocessing ─────────────────────────────────
def preprocess(image: Image.Image) -> np.ndarray:
    """Resize + normalize [0,1] sesuai training MobileNetV2"""
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    arr = np.array(image, dtype=np.float32)
    # MobileNetV2 preprocess: /127.5 - 1.0  (range -1 to 1)
    arr = arr / 127.5 - 1.0
    return np.expand_dims(arr, axis=0)  # [1, 224, 224, 3]

# ── Routes ────────────────────────────────────────
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status":  "online",
        "engine":  "onnx" if USE_ONNX else "tflite",
        "classes": len(CLASS_NAMES),
        "version": "v2"
    })

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files.get('file') or request.files.get('image')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        image = Image.open(io.BytesIO(file.read()))
        inp   = preprocess(image)

        # ── Inference ─────────────────────────
        if USE_ONNX and session:
            out = session.run([OUTPUT_NAME], {INPUT_NAME: inp})[0][0]
        else:
            interpreter.set_tensor(input_details[0]['index'], inp)
            interpreter.invoke()
            out = interpreter.get_tensor(output_details[0]['index'])[0]

        # ── Parse results ─────────────────────
        probs = out.tolist()
        top_idx  = int(np.argmax(probs))
        top_conf = float(probs[top_idx])
        top_label = CLASS_NAMES[top_idx]

        # Top 5
        top5_idx = np.argsort(probs)[::-1][:5]
        top5 = [
            {
                "class":      CLASS_NAMES[i],
                "confidence": float(probs[i]),
                "percentage": f"{float(probs[i]):.2%}"
            }
            for i in top5_idx
        ]

        if top_conf < MIN_CONFIDENCE:
            return jsonify({
                "success":           True,
                "is_batik":          False,
                "prediction":        "Bukan Batik",
                "confidence":        top_conf,
                "percentage":        f"{top_conf:.2%}",
                "message":           f"Confidence {top_conf:.2%} di bawah threshold {MIN_CONFIDENCE:.0%}",
                "top_5_predictions": top5,
            })

        return jsonify({
            "success":           True,
            "is_batik":          True,
            "prediction":        top_label,
            "confidence":        top_conf,
            "percentage":        f"{top_conf:.2%}",
            "top_5_predictions": top5,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

# ── Run ───────────────────────────────────────────
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 5000))
    print(f"\n✅ Backend running → http://localhost:{PORT}")
    print(f"   Engine : {'ONNX' if USE_ONNX else 'TFLite'}")
    print(f"   Classes: {len(CLASS_NAMES)}")
    print("=" * 55)
    app.run(host='0.0.0.0', port=PORT, debug=False)
