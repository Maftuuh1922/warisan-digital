"""
Mock Batik Dataset API
Provides synthetic batik images and labels for ML training without external dependencies
"""

from fastapi import APIRouter
from typing import List, Dict
import numpy as np
from PIL import Image
import io
import base64

router = APIRouter()

# Batik motif classes
BATIK_CLASSES = [
    "Batik Parang",
    "Batik Kawung",
    "Batik Mega Mendung",
    "Batik Sekar Jagad",
    "Batik Truntum",
    "Batik Sido Mukti",
    "Batik Tambal",
    "Batik Sogan",
]

def generate_synthetic_batik_pattern(motif_class: str, size: tuple = (224, 224)) -> np.ndarray:
    """Generate synthetic batik pattern based on class"""
    np.random.seed(hash(motif_class) % 2**32)
    
    img = np.zeros((*size, 3), dtype=np.uint8)
    
    # Different patterns for different classes
    if "Parang" in motif_class:
        # Diagonal lines pattern
        for i in range(0, size[0], 20):
            for j in range(size[1]):
                if (i + j) % 40 < 20:
                    img[min(i, size[0]-1), j] = [139, 69, 19]  # Brown
                    
    elif "Kawung" in motif_class:
        # Circular pattern
        center_x, center_y = size[0] // 2, size[1] // 2
        for i in range(size[0]):
            for j in range(size[1]):
                dist = np.sqrt((i - center_x)**2 + (j - center_y)**2)
                if dist % 30 < 15:
                    img[i, j] = [70, 50, 30]
                    
    elif "Mega Mendung" in motif_class:
        # Cloud-like pattern
        for i in range(size[0]):
            for j in range(size[1]):
                if np.sin(i/10) + np.cos(j/10) > 0.5:
                    img[i, j] = [100, 150, 200]  # Blue
                    
    elif "Sekar Jagad" in motif_class:
        # Colorful geometric
        for i in range(0, size[0], 30):
            for j in range(0, size[1], 30):
                color = [(i*j) % 255, (i+j) % 255, (255-i) % 255]
                img[i:i+30, j:j+30] = color
                
    elif "Truntum" in motif_class:
        # Star pattern
        for i in range(size[0]):
            for j in range(size[1]):
                if (i % 25 < 5) or (j % 25 < 5):
                    img[i, j] = [150, 100, 50]
                    
    elif "Sido Mukti" in motif_class:
        # Complex geometric
        for i in range(size[0]):
            for j in range(size[1]):
                if ((i + j) % 15 < 5) and ((i - j) % 15 < 5):
                    img[i, j] = [180, 150, 120]
                    
    elif "Tambal" in motif_class:
        # Patchwork pattern
        for i in range(0, size[0], 40):
            for j in range(0, size[1], 40):
                if (i + j) % 80 < 40:
                    img[i:i+40, j:j+40] = [120, 90, 60]
                else:
                    img[i:i+40, j:j+40] = [80, 60, 40]
                    
    else:  # Sogan
        # Brownish overall
        img[:, :] = [101, 67, 33]
        for i in range(0, size[0], 10):
            img[i, :] = [139, 90, 43]
    
    # Add some noise for realism
    noise = np.random.randint(-30, 30, (*size, 3), dtype=np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    return img


@router.get("/api/dataset/classes")
async def get_classes():
    """Get list of batik classes"""
    return {
        "success": True,
        "classes": BATIK_CLASSES,
        "total": len(BATIK_CLASSES)
    }


@router.get("/api/dataset/generate/{motif_class}")
async def generate_sample(motif_class: str, count: int = 10):
    """Generate synthetic samples for a specific class"""
    
    if motif_class not in BATIK_CLASSES:
        return {
            "success": False,
            "error": f"Unknown class. Available: {BATIK_CLASSES}"
        }
    
    samples = []
    for i in range(count):
        # Generate image
        img_array = generate_synthetic_batik_pattern(motif_class + str(i))
        
        # Convert to base64
        img_pil = Image.fromarray(img_array)
        buffer = io.BytesIO()
        img_pil.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        samples.append({
            "id": f"{motif_class.replace(' ', '_')}_{i:03d}",
            "class": motif_class,
            "image_base64": img_base64,
            "size": img_array.shape
        })
    
    return {
        "success": True,
        "class": motif_class,
        "count": count,
        "samples": samples
    }


@router.get("/api/dataset/generate-all")
async def generate_all_samples(samples_per_class: int = 50):
    """Generate complete dataset with all classes"""
    
    dataset = {
        "classes": BATIK_CLASSES,
        "samples_per_class": samples_per_class,
        "total_samples": len(BATIK_CLASSES) * samples_per_class,
        "data": []
    }
    
    for motif_class in BATIK_CLASSES:
        for i in range(samples_per_class):
            img_array = generate_synthetic_batik_pattern(motif_class + str(i))
            
            # Store as numpy array metadata (for training)
            dataset["data"].append({
                "id": f"{motif_class.replace(' ', '_')}_{i:03d}",
                "class": motif_class,
                "class_id": BATIK_CLASSES.index(motif_class),
                "shape": img_array.shape,
                "mean_color": img_array.mean(axis=(0, 1)).tolist(),
                "std_color": img_array.std(axis=(0, 1)).tolist()
            })
    
    return {
        "success": True,
        "dataset": dataset
    }


def create_training_data(samples_per_class: int = 50):
    """
    Create actual training data as numpy arrays
    Returns: X (features), y (labels)
    """
    X = []
    y = []
    
    for class_id, motif_class in enumerate(BATIK_CLASSES):
        for i in range(samples_per_class):
            img_array = generate_synthetic_batik_pattern(motif_class + str(i))
            X.append(img_array)
            y.append(class_id)
    
    return np.array(X), np.array(y)
