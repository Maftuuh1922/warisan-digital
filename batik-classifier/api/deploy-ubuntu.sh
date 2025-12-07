#!/bin/bash

# ============================================================
# Batik Classifier API - Ubuntu Server Deployment
# Domain: icbs.my.id
# Server: Intel i5-650M, 4GB RAM
# ============================================================

set -e  # Exit on error

echo "======================================================================"
echo "🚀 BATIK CLASSIFIER API - UBUNTU DEPLOYMENT"
echo "======================================================================"
echo ""

# ============================================================
# 1. UPDATE SYSTEM
# ============================================================
echo "📦 Step 1: Updating system..."
sudo apt update
sudo apt upgrade -y

# ============================================================
# 2. INSTALL DEPENDENCIES
# ============================================================
echo ""
echo "📦 Step 2: Installing dependencies..."
sudo apt install -y python3.11 python3.11-venv python3-pip nginx git

# ============================================================
# 3. CREATE APP DIRECTORY
# ============================================================
echo ""
echo "📁 Step 3: Creating app directory..."
sudo mkdir -p /var/www/batik-api
sudo chown -R $USER:$USER /var/www/batik-api
cd /var/www/batik-api

# ============================================================
# 4. CLONE REPOSITORY
# ============================================================
echo ""
echo "📥 Step 4: Cloning repository..."
if [ -d ".git" ]; then
    echo "Repository already exists, pulling latest changes..."
    git pull origin main
else
    git clone https://github.com/Maftuuh1922/warisan-digital.git .
fi

cd batik-classifier/api

# ============================================================
# 5. SETUP PYTHON VIRTUAL ENVIRONMENT
# ============================================================
echo ""
echo "🐍 Step 5: Setting up Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# ============================================================
# 6. INSTALL PYTHON PACKAGES
# ============================================================
echo ""
echo "📦 Step 6: Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "⚠️  TensorFlow installation may take 5-10 minutes..."
echo "    This is normal for the first time."
echo ""

# ============================================================
# 6.5. DOWNLOAD MODEL FILES
# ============================================================
echo ""
echo "📥 Step 6.5: Downloading model files..."
echo ""
echo "⚠️  IMPORTANT: Model files need to be downloaded manually"
echo ""
echo "Models are stored in Google Drive (106MB exceeds GitHub limit)"
echo ""
echo "Download these files to: batik-classifier/api/models/"
echo "  - batik_knn_model_95acc.pkl (106 MB)"
echo "  - batik_classes.pkl"
echo "  - scaler.joblib"
echo "  - batik_model_metadata.pkl"
echo ""
echo "After downloading models, continue deployment..."
read -p "Press Enter after you've downloaded the models..."
echo ""

# ============================================================
# 7. TEST APPLICATION
# ============================================================
echo ""
echo "🧪 Step 7: Testing application..."
python -c "
from flask import Flask
import joblib
print('✅ Flask imported successfully')
print('✅ joblib imported successfully')
"

# ============================================================
# 8. CREATE SYSTEMD SERVICE
# ============================================================
echo ""
echo "⚙️  Step 8: Creating systemd service..."

sudo tee /etc/systemd/system/batik-api.service > /dev/null <<EOF
[Unit]
Description=Batik Classifier API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/batik-api/batik-classifier/api
Environment="PATH=/var/www/batik-api/batik-classifier/api/venv/bin"
ExecStart=/var/www/batik-api/batik-classifier/api/venv/bin/python app.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# ============================================================
# 9. CONFIGURE NGINX
# ============================================================
echo ""
echo "🌐 Step 9: Configuring Nginx..."

sudo tee /etc/nginx/sites-available/batik-api > /dev/null <<'EOF'
server {
    listen 80;
    server_name icbs.my.id;

    # Increase max upload size for images
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/batik-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# ============================================================
# 10. START SERVICES
# ============================================================
echo ""
echo "🚀 Step 10: Starting services..."

# Reload systemd
sudo systemctl daemon-reload

# Enable and start batik-api service
sudo systemctl enable batik-api
sudo systemctl restart batik-api

# Restart nginx
sudo systemctl restart nginx

# ============================================================
# 11. CHECK STATUS
# ============================================================
echo ""
echo "======================================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================================================"
echo ""
echo "📊 Service Status:"
sudo systemctl status batik-api --no-pager -l | head -n 10
echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l | head -n 5
echo ""
echo "======================================================================"
echo "🎯 NEXT STEPS:"
echo "======================================================================"
echo ""
echo "1. Point domain icbs.my.id to your server IP in Cloudflare"
echo "2. Enable Cloudflare SSL (Full mode)"
echo "3. Test API: http://icbs.my.id"
echo ""
echo "📋 Useful Commands:"
echo "   - Check logs: sudo journalctl -u batik-api -f"
echo "   - Restart API: sudo systemctl restart batik-api"
echo "   - Check status: sudo systemctl status batik-api"
echo ""
echo "======================================================================"
