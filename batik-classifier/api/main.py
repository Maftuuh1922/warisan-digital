import json
import os
from io import BytesIO
from pathlib import Path
import threading
from typing import List

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

BASE_DIR = Path(__file__).parent
MODEL_CANDIDATES = [
    BASE_DIR / "batik_model.tflite",
    BASE_DIR / "models" / "batik_model.tflite",
]
LABEL_CANDIDATES = [
    BASE_DIR / "batik_labels_v2.json",
    BASE_DIR / "models" / "batik_labels_v2.json",
    BASE_DIR / "models" / "batik_classes_mobilenet_ultimate.json",
]


def _resolve_first_existing(paths: List[Path]) -> Path:
    for path in paths:
        if path.exists():
            return path
    raise FileNotFoundError("No valid file found in candidates: " + ", ".join(str(p) for p in paths))


def _load_class_names(path: Path) -> List[str]:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict) and "classes" in data:
        return list(data["classes"])
    if isinstance(data, dict):
        try:
            sorted_keys = sorted(data.keys(), key=lambda x: int(x))
            return [data[k] for k in sorted_keys]
        except ValueError:
            return list(data.values())
    if isinstance(data, list):
        return data
    raise ValueError("Unrecognized label file format")


def _load_interpreter(model_path: Path):
    try:
        import tensorflow as tf
        interpreter = tf.lite.Interpreter(model_path=str(model_path))
    except Exception:
        try:
            from tflite_runtime.interpreter import Interpreter
            interpreter = Interpreter(model_path=str(model_path))
        except Exception as exc:
            raise RuntimeError("TensorFlow Lite interpreter is not available") from exc
    interpreter.allocate_tensors()
    return interpreter


MODEL_PATH = _resolve_first_existing(MODEL_CANDIDATES)
LABEL_PATH = _resolve_first_existing(LABEL_CANDIDATES)
class_names = _load_class_names(LABEL_PATH)

interpreter = _load_interpreter(MODEL_PATH)
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
input_index = input_details[0]["index"]
output_index = output_details[0]["index"]

# Keep interpreter calls thread-safe
_interpreter_lock = threading.Lock()

# Derive target size from model input (height, width)
if len(input_details[0]["shape"]) >= 3:
    target_height = int(input_details[0]["shape"][1])
    target_width = int(input_details[0]["shape"][2])
else:
    target_height = target_width = 224
TARGET_SIZE = (target_width, target_height)


def preprocess_image(image: Image.Image) -> np.ndarray:
    # Handle EXIF orientation (important for mobile photos)
    image = ImageOps.exif_transpose(image) or image
    rgb_image = image.convert("RGB")
    
    # Debug: log original size and mode
    print(f"DEBUG: Original image size={image.size}, mode={image.mode}, format={image.format}")
    
    # CENTER CROP to square (prevent distortion from different aspect ratios)
    width, height = rgb_image.size
    min_side = min(width, height)
    left = (width - min_side) // 2
    top = (height - min_side) // 2
    right = left + min_side
    bottom = top + min_side
    rgb_image = rgb_image.crop((left, top, right, bottom))
    
    print(f"DEBUG: After center crop to square: {rgb_image.size}")
    
    # Use BILINEAR resampling for consistency with training (Google Colab default)
    resized = rgb_image.resize(TARGET_SIZE, Image.Resampling.BILINEAR)
    arr = np.array(resized, dtype=np.float32)
    
    # Debug: log pixel stats before normalization
    print(f"DEBUG: Before norm - min={arr.min():.2f}, max={arr.max():.2f}, mean={arr.mean():.2f}")
    
    arr = arr / 127.5 - 1.0
    
    # Debug: log pixel stats after normalization
    print(f"DEBUG: After norm - min={arr.min():.2f}, max={arr.max():.2f}, mean={arr.mean():.2f}")
    
    return np.expand_dims(arr, axis=0)


def run_inference(image: Image.Image) -> dict:
    input_data = preprocess_image(image)
    with _interpreter_lock:
        interpreter.set_tensor(input_index, input_data)
        interpreter.invoke()
        output = interpreter.get_tensor(output_index)[0]

    predicted_idx = int(np.argmax(output))
    predicted_label = class_names[predicted_idx]
    confidence = float(output[predicted_idx])

    top_indices = np.argsort(output)[-5:][::-1]
    top_5 = [
        {
            "class": class_names[idx],
            "confidence": float(output[idx]),
            "percentage": f"{float(output[idx]):.2%}",
        }
        for idx in top_indices
    ]

    return {
        "success": True,
        "prediction": predicted_label,
        "confidence": confidence,
        "percentage": f"{confidence:.2%}",
        "top_5_predictions": top_5,
    }


app = FastAPI(title="Batik Classifier API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "online",
        "model_path": str(MODEL_PATH.name),
        "labels_path": str(LABEL_PATH.name),
        "classes_loaded": len(class_names),
        "input_shape": input_details[0]["shape"].tolist() if hasattr(input_details[0]["shape"], "tolist") else input_details[0]["shape"],
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/classes")
async def classes():
    return {"success": True, "classes": class_names, "total": len(class_names)}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="File is required")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        image = Image.open(BytesIO(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to read image") from exc

    try:
        return run_inference(image)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc


# For manual execution
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=False)
