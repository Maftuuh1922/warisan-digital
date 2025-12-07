#!/bin/bash

# ============================================================
# Download Model Files from Google Drive
# Run this script on Ubuntu server after deployment
# ============================================================

echo "📥 Downloading trained model files from Google Drive..."

cd /var/www/batik-api/batik-classifier/api/models/

# Install gdown if not present
pip install gdown

# Download model files
# Replace with your actual Google Drive file IDs
echo ""
echo "⚠️  IMPORTANT: Update Google Drive file IDs in this script"
echo ""
echo "To get shareable links:"
echo "1. Go to Google Drive"
echo "2. Right-click on each model file"
echo "3. Click 'Get link' → 'Anyone with the link'"
echo "4. Copy the file ID from the URL"
echo ""
echo "Example URL: https://drive.google.com/file/d/1ABC123xyz/view"
echo "File ID: 1ABC123xyz"
echo ""
echo "Update the file IDs below in this script:"
echo ""

# TODO: Replace these with your actual Google Drive file IDs
# KNN_MODEL_ID="YOUR_FILE_ID_HERE"
# CLASSES_ID="YOUR_FILE_ID_HERE"
# SCALER_ID="YOUR_FILE_ID_HERE"
# METADATA_ID="YOUR_FILE_ID_HERE"

# Example (uncomment and update):
# gdown --id $KNN_MODEL_ID -O batik_knn_model_95acc.pkl
# gdown --id $CLASSES_ID -O batik_classes.pkl
# gdown --id $SCALER_ID -O scaler.joblib
# gdown --id $METADATA_ID -O batik_model_metadata.pkl

echo ""
echo "✅ After downloading, restart the service:"
echo "   sudo systemctl restart batik-api"
echo ""
