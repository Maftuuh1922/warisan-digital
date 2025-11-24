#!/bin/bash

echo "🚀 Quick Setup - Minimal Dependencies"
echo "======================================"

# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate
echo "🔧 Activating environment..."
source venv/bin/activate

# Install minimal deps
echo "📥 Installing minimal dependencies..."
pip install --upgrade pip -q
pip install -r requirements-minimal.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Train model: python train_quick.py"
echo "2. Start service: uvicorn main:app --reload --port 8000"
