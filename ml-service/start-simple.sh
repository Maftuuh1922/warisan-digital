#!/bin/bash

echo "🚀 Starting ML Service (Simplified)"
echo "===================================="

cd "$(dirname "$0")"

# Activate venv
source venv/bin/activate

# Start service
echo "Starting uvicorn on port 8000..."
uvicorn main_simple:app --reload --port 8000
