#!/usr/bin/env python3
"""
Simple Feature Extractor - No OpenCV/Scipy Dependencies
Uses only PIL and NumPy for fast prototyping
"""

import numpy as np
from PIL import Image
from typing import Tuple

class SimpleBatikFeatureExtractor:
    """Lightweight feature extractor using only PIL and NumPy"""
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        self.target_size = target_size
        
    def extract_features(self, image_array: np.ndarray) -> np.ndarray:
        """
        Extract simple but effective features from batik image
        Returns ~100 features (much lighter than full 300+)
        """
        # Ensure image is in correct format
        if len(image_array.shape) == 2:
            # Grayscale -> RGB
            image_array = np.stack([image_array] * 3, axis=-1)
        
        # Extract different feature types
        color_features = self._extract_color_features(image_array)
        texture_features = self._extract_texture_features(image_array)
        
        # Combine all features
        features = np.concatenate([
            color_features,
            texture_features
        ])
        
        return features
    
    def _extract_color_features(self, image: np.ndarray) -> np.ndarray:
        """
        Extract color features (RGB histograms + basic stats)
        Returns 48 features
        """
        features = []
        
        # RGB histograms (16 bins per channel = 48 features)
        for channel in range(3):
            hist, _ = np.histogram(image[:, :, channel], bins=16, range=(0, 256))
            hist = hist / (hist.sum() + 1e-6)  # Normalize
            features.extend(hist)
        
        return np.array(features)
    
    def _extract_texture_features(self, image: np.ndarray) -> np.ndarray:
        """
        Extract texture features using simple gradient and statistical measures
        Returns 52 features
        """
        features = []
        
        # Convert to grayscale
        gray = np.mean(image, axis=2).astype(np.uint8)
        
        # 1. Simple gradients (horizontal and vertical)
        grad_x = np.diff(gray, axis=1, prepend=gray[:, 0:1])
        grad_y = np.diff(gray, axis=0, prepend=gray[0:1, :])
        
        # Gradient magnitude and direction
        grad_mag = np.sqrt(grad_x**2 + grad_y**2)
        grad_dir = np.arctan2(grad_y, grad_x)
        
        # Gradient histogram (16 bins)
        hist_mag, _ = np.histogram(grad_mag, bins=16, range=(0, 255))
        hist_mag = hist_mag / (hist_mag.sum() + 1e-6)
        features.extend(hist_mag)
        
        # Direction histogram (16 bins)
        hist_dir, _ = np.histogram(grad_dir, bins=16, range=(-np.pi, np.pi))
        hist_dir = hist_dir / (hist_dir.sum() + 1e-6)
        features.extend(hist_dir)
        
        # 2. Statistical features of intensity
        features.extend([
            np.mean(gray),
            np.std(gray),
            np.median(gray),
            np.percentile(gray, 25),
            np.percentile(gray, 75),
            np.min(gray),
            np.max(gray),
        ])
        
        # 3. Local Binary Pattern approximation (simplified)
        # Compare center pixel with 8 neighbors
        lbp_hist = self._simple_lbp(gray)
        features.extend(lbp_hist)
        
        return np.array(features)
    
    def _simple_lbp(self, gray: np.ndarray) -> np.ndarray:
        """
        Simplified Local Binary Pattern
        Returns 13 features (histogram)
        """
        h, w = gray.shape
        
        # Pad image
        padded = np.pad(gray, 1, mode='edge')
        
        # Compare with 8 neighbors
        lbp_codes = []
        for i in range(1, h + 1):
            for j in range(1, w + 1):
                center = padded[i, j]
                code = 0
                
                # 8 neighbors (clockwise from top-left)
                neighbors = [
                    padded[i-1, j-1], padded[i-1, j], padded[i-1, j+1],
                    padded[i, j+1], padded[i+1, j+1], padded[i+1, j],
                    padded[i+1, j-1], padded[i, j-1]
                ]
                
                for k, neighbor in enumerate(neighbors):
                    if neighbor >= center:
                        code |= (1 << k)
                
                lbp_codes.append(code)
        
        # Histogram of LBP codes (13 bins for simplified version)
        hist, _ = np.histogram(lbp_codes, bins=13, range=(0, 256))
        hist = hist / (hist.sum() + 1e-6)
        
        return hist

def extract_features_from_file(image_path: str) -> np.ndarray:
    """Helper function to extract features from image file"""
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img)
    
    extractor = SimpleBatikFeatureExtractor()
    return extractor.extract_features(img_array)

def extract_features_from_array(image_array: np.ndarray) -> np.ndarray:
    """Helper function to extract features from numpy array"""
    if image_array.shape[:2] != (224, 224):
        img = Image.fromarray(image_array.astype(np.uint8))
        img = img.resize((224, 224))
        image_array = np.array(img)
    
    extractor = SimpleBatikFeatureExtractor()
    return extractor.extract_features(image_array)


if __name__ == "__main__":
    print("Simple Batik Feature Extractor")
    print("=" * 50)
    print("Dependencies: PIL, NumPy only")
    print("Feature count: ~100 features")
    print("  - Color: 48 (RGB histograms)")
    print("  - Texture: 52 (gradients, stats, LBP)")
    print()
    print("Usage:")
    print("  from feature_extractor_simple import extract_features_from_file")
    print("  features = extract_features_from_file('image.jpg')")
