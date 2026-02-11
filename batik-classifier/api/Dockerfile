# Use Python 3.11 (TensorFlow compatible)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY main.py .
COPY app.py .
COPY batik_model.tflite .
COPY batik_labels_v2.json .
COPY models/ models/

# Expose port (HF Spaces expects 7860)
EXPOSE 7860

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Health check (port 7860 for HF Spaces)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD python -c "from urllib.request import urlopen; urlopen('http://localhost:7860/health', timeout=5)"

# Run FastAPI with uvicorn on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
