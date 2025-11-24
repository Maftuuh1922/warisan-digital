#!/bin/bash
# Quick start script for ML service development

echo "🚀 BatikIn ML Service - Quick Start"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

echo "✓ Python found: $(python3 --version)"

# Check if in ml-service directory
if [ ! -f "requirements.txt" ]; then
    echo "📁 Moving to ml-service directory..."
    cd ml-service 2>/dev/null || {
        echo "❌ Please run from project root or ml-service directory"
        exit 1
    }
fi

# Setup venv
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating environment..."
source venv/bin/activate

echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Kaggle API: cp .env.example .env"
echo "2. Train model: jupyter notebook ../notebooks/train_batik_classifier.ipynb"
echo "3. Start service: ./start.sh"
echo ""
echo "For detailed instructions, see ml-service/README.md"
