"""
Feature Extraction Pipeline for Batik Pattern Recognition
Extracts comprehensive features: Color, Texture, and Geometry
"""

import cv2
import numpy as np
from skimage import color, feature
from skimage.filters import gabor_kernel
from scipy import ndimage as ndi
from typing import Dict, Tuple, List
import warnings
warnings.filterwarnings('ignore')


class BatikFeatureExtractor:
    """Extract multi-modal features from batik images"""
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        self.target_size = target_size
        self.gabor_kernels = self._prepare_gabor_kernels()
        
    def _prepare_gabor_kernels(self) -> List:
        """Prepare Gabor filter bank with multiple orientations and frequencies"""
        kernels = []
        # 4 orientations, 3 frequencies
        for theta in range(4):
            theta = theta / 4. * np.pi
            for sigma in (1, 3):
                for frequency in (0.05, 0.15, 0.25):
                    kernel = np.real(gabor_kernel(frequency, theta=theta,
                                                  sigma_x=sigma, sigma_y=sigma))
                    kernels.append(kernel)
        return kernels
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image: resize and normalize"""
        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
            
        # Resize
        image = cv2.resize(image, self.target_size)
        return image
    
    def extract_color_features(self, image: np.ndarray) -> np.ndarray:
        """Extract color features from HSV and LAB color spaces"""
        features = []
        
        # Convert to HSV
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        # HSV histograms (8 bins per channel)
        for i in range(3):
            hist = cv2.calcHist([hsv], [i], None, [8], [0, 256])
            features.extend(hist.flatten())
        
        # HSV moments (mean, std, skewness, kurtosis)
        for i in range(3):
            channel = hsv[:, :, i]
            features.extend([
                np.mean(channel),
                np.std(channel),
                self._skewness(channel),
                self._kurtosis(channel)
            ])
        
        # Convert to LAB
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        # LAB histograms (8 bins per channel)
        for i in range(3):
            hist = cv2.calcHist([lab], [i], None, [8], [0, 256])
            features.extend(hist.flatten())
        
        # LAB moments
        for i in range(3):
            channel = lab[:, :, i]
            features.extend([
                np.mean(channel),
                np.std(channel)
            ])
        
        # Dominant colors (k-means clustering)
        pixels = image.reshape(-1, 3).astype(np.float32)
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
        _, labels, centers = cv2.kmeans(pixels, 5, None, criteria, 10, 
                                        cv2.KMEANS_RANDOM_CENTERS)
        # Sort by frequency and take top 3
        unique, counts = np.unique(labels, return_counts=True)
        sorted_indices = np.argsort(-counts)[:3]
        dominant_colors = centers[sorted_indices].flatten()
        features.extend(dominant_colors)
        
        return np.array(features)
    
    def extract_texture_features(self, image: np.ndarray) -> np.ndarray:
        """Extract texture features using Gabor, LBP, and Haralick"""
        features = []
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        gray = gray.astype(np.float32) / 255.0
        
        # Gabor features
        gabor_features = []
        for kernel in self.gabor_kernels:
            filtered = ndi.convolve(gray, kernel, mode='wrap')
            gabor_features.extend([
                np.mean(filtered),
                np.std(filtered),
                np.max(filtered),
                np.min(filtered)
            ])
        features.extend(gabor_features)
        
        # Local Binary Pattern (LBP)
        radius = 3
        n_points = 8 * radius
        lbp = feature.local_binary_pattern(gray, n_points, radius, method='uniform')
        lbp_hist, _ = np.histogram(lbp.ravel(), bins=n_points + 2, 
                                   range=(0, n_points + 2), density=True)
        features.extend(lbp_hist)
        
        # Haralick texture features from GLCM
        gray_int = (gray * 255).astype(np.uint8)
        # Compute GLCM for multiple angles
        distances = [1, 3]
        angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
        
        for distance in distances:
            glcm_features = []
            for angle in angles:
                glcm = feature.graycomatrix(gray_int, [distance], [angle], 
                                           levels=256, symmetric=True, 
                                           normed=True)
                # Extract properties
                contrast = feature.graycoprops(glcm, 'contrast')[0, 0]
                dissimilarity = feature.graycoprops(glcm, 'dissimilarity')[0, 0]
                homogeneity = feature.graycoprops(glcm, 'homogeneity')[0, 0]
                energy = feature.graycoprops(glcm, 'energy')[0, 0]
                correlation = feature.graycoprops(glcm, 'correlation')[0, 0]
                
                glcm_features.extend([contrast, dissimilarity, homogeneity, 
                                     energy, correlation])
            
            features.extend(glcm_features)
        
        return np.array(features)
    
    def extract_geometry_features(self, image: np.ndarray) -> np.ndarray:
        """Extract geometric features using HOG and edge analysis"""
        features = []
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # HOG (Histogram of Oriented Gradients)
        hog_features = feature.hog(gray, orientations=9, pixels_per_cell=(16, 16),
                                   cells_per_block=(2, 2), visualize=False,
                                   feature_vector=True)
        features.extend(hog_features)
        
        # Edge detection and statistics
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
        features.append(edge_density)
        
        # Edge orientation histogram
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        magnitude = np.sqrt(sobelx**2 + sobely**2)
        orientation = np.arctan2(sobely, sobelx)
        
        # Histogram of edge orientations (8 bins)
        hist, _ = np.histogram(orientation[magnitude > np.mean(magnitude)], 
                              bins=8, range=(-np.pi, np.pi), density=True)
        features.extend(hist)
        
        # Line detection (Hough Transform)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50,
                               minLineLength=30, maxLineGap=10)
        
        if lines is not None:
            # Line statistics
            lengths = [np.sqrt((x2-x1)**2 + (y2-y1)**2) 
                      for line in lines for x1, y1, x2, y2 in line]
            angles = [np.arctan2(y2-y1, x2-x1) 
                     for line in lines for x1, y1, x2, y2 in line]
            
            features.extend([
                len(lines),  # number of lines
                np.mean(lengths) if lengths else 0,
                np.std(lengths) if lengths else 0,
                np.mean(angles) if angles else 0,
                np.std(angles) if angles else 0
            ])
        else:
            features.extend([0, 0, 0, 0, 0])
        
        return np.array(features)
    
    def extract_all_features(self, image: np.ndarray) -> Dict[str, np.ndarray]:
        """Extract all features and return as dictionary"""
        # Preprocess
        image = self.preprocess_image(image)
        
        # Extract features
        color_features = self.extract_color_features(image)
        texture_features = self.extract_texture_features(image)
        geometry_features = self.extract_geometry_features(image)
        
        # Combine all features
        combined_features = np.concatenate([
            color_features,
            texture_features,
            geometry_features
        ])
        
        return {
            'color': color_features,
            'texture': texture_features,
            'geometry': geometry_features,
            'combined': combined_features,
            'preprocessed_image': image
        }
    
    @staticmethod
    def _skewness(data: np.ndarray) -> float:
        """Calculate skewness"""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0
        return np.mean(((data - mean) / std) ** 3)
    
    @staticmethod
    def _kurtosis(data: np.ndarray) -> float:
        """Calculate kurtosis"""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0
        return np.mean(((data - mean) / std) ** 4) - 3


def create_explainability_heatmap(image: np.ndarray, 
                                  extractor: BatikFeatureExtractor) -> np.ndarray:
    """Create heatmap showing important regions for pattern recognition"""
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    
    # Apply dominant Gabor filters
    heatmap = np.zeros_like(gray)
    
    for kernel in extractor.gabor_kernels[:8]:  # Use top 8 kernels
        filtered = ndi.convolve(gray, kernel, mode='wrap')
        heatmap += np.abs(filtered)
    
    # Normalize
    heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)
    
    # Apply colormap
    heatmap_colored = cv2.applyColorMap((heatmap * 255).astype(np.uint8), 
                                        cv2.COLORMAP_JET)
    
    # Overlay on original image
    overlay = cv2.addWeighted(image, 0.6, heatmap_colored, 0.4, 0)
    
    return overlay
