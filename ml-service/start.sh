#!/bin/bash

# ML Service Startup Script
# This script sets up and runs the Batik ML inference service

set -e

echo "🚀 Starting Batik ML Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please configure your .env file with Kaggle credentials."
fi

# Check if model exists
if [ ! -f "models/batik_classifier_ensemble.joblib" ]; then
    echo "⚠️  Warning: Trained model not found!"
    echo "📚 Please run the training notebook first:"
    echo "   jupyter notebook ../notebooks/train_batik_classifier.ipynb"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start the service
echo "✨ Starting FastAPI service..."
echo "🌐 Service will be available at: http://localhost:8000"
echo "📖 API documentation: http://localhost:8000/docs"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
