# Ubuntu Server Deployment Guide

Complete guide for deploying Batik Classifier API on Ubuntu server with domain `icbs.my.id`.

---

## 📋 Server Requirements

- **OS**: Ubuntu 20.04+ (64-bit)
- **CPU**: Intel i5-650M or better
- **RAM**: 4GB minimum
- **Storage**: 10GB free space
- **Domain**: icbs.my.id (configured with Cloudflare)
- **Network**: Public IP with ports 80, 443 open

---

## 🚀 Quick Start (Automated)

### Option 1: Run Deployment Script

```bash
# Download deployment script
wget https://raw.githubusercontent.com/Maftuuh1922/warisan-digital/main/batik-classifier/api/deploy-ubuntu.sh

# Make executable
chmod +x deploy-ubuntu.sh

# Run deployment
./deploy-ubuntu.sh
```

The script will automatically:
- Install Python 3.11, Nginx, Git
- Clone repository
- Setup virtual environment
- Install dependencies (including TensorFlow)
- Create systemd service
- Configure Nginx reverse proxy
- Start all services

---

## 📖 Manual Deployment Steps

### Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Dependencies

```bash
sudo apt install -y python3.11 python3.11-venv python3-pip nginx git
```

### Step 3: Clone Repository

```bash
sudo mkdir -p /var/www/batik-api
sudo chown -R $USER:$USER /var/www/batik-api
cd /var/www/batik-api

git clone https://github.com/Maftuuh1922/warisan-digital.git .
cd batik-classifier/api
```

### Step 4: Setup Python Environment

```bash
python3.11 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

**Note**: TensorFlow installation may take 5-10 minutes on first run.

### Step 5: Test Application

```bash
python app.py
```

Expected output:
```
✅ Loaded KNN model from models/batik_knn_model_95acc.pkl
✅ Loaded label encoder from models/batik_classes.pkl
✅ Loaded scaler from models/scaler.joblib
✅ InceptionV3 model loaded successfully

🎯 Model Info:
   - Classes: 20
   - Accuracy: 95.0%
   - Training samples: 17000

🚀 Batik Classifier API is running!
   - Endpoint: http://0.0.0.0:5000
   - Health: http://0.0.0.0:5000/health
```

Press `Ctrl+C` to stop. Now configure as service.

---

## ⚙️ Systemd Service Configuration

### Create Service File

```bash
sudo nano /etc/systemd/system/batik-api.service
```

Paste this configuration:

```ini
[Unit]
Description=Batik Classifier API
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/var/www/batik-api/batik-classifier/api
Environment="PATH=/var/www/batik-api/batik-classifier/api/venv/bin"
ExecStart=/var/www/batik-api/batik-classifier/api/venv/bin/python app.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**Important**: Replace `YOUR_USERNAME` with your actual username.

### Enable and Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable batik-api
sudo systemctl start batik-api

# Check status
sudo systemctl status batik-api
```

---

## 🌐 Nginx Configuration

### Create Nginx Site Config

```bash
sudo nano /etc/nginx/sites-available/batik-api
```

Paste this configuration:

```nginx
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
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/batik-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔐 SSL/HTTPS Setup

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL Certificate

```bash
sudo certbot --nginx -d icbs.my.id
```

Follow the prompts:
- Email: `rizkiuya12@gmail.com`
- Agree to Terms: `Yes`
- Redirect HTTP to HTTPS: `Yes`

Certbot will automatically update your Nginx configuration.

### Verify Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## 🧪 Testing Deployment

### 1. Health Check

```bash
curl https://icbs.my.id/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### 2. Get Classes

```bash
curl https://icbs.my.id/classes
```

### 3. Get API Info

```bash
curl https://icbs.my.id/info
```

### 4. Test Prediction

```bash
# Upload image
curl -X POST https://icbs.my.id/predict \
  -F "image=@test_image.jpg"
```

---

## 📊 Monitoring and Logs

### View API Logs

```bash
# Follow logs in real-time
sudo journalctl -u batik-api -f

# View last 100 lines
sudo journalctl -u batik-api -n 100

# View logs from today
sudo journalctl -u batik-api --since today
```

### View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Check Service Status

```bash
# API status
sudo systemctl status batik-api

# Nginx status
sudo systemctl status nginx

# Check if API is listening on port 5000
sudo netstat -tulpn | grep 5000
```

---

## 🔧 Maintenance Commands

### Restart Services

```bash
# Restart API
sudo systemctl restart batik-api

# Restart Nginx
sudo systemctl restart nginx

# Restart both
sudo systemctl restart batik-api nginx
```

### Update Application

```bash
cd /var/www/batik-api
git pull origin main

# Restart API to apply changes
sudo systemctl restart batik-api
```

### Update Dependencies

```bash
cd /var/www/batik-api/batik-classifier/api
source venv/bin/activate
pip install --upgrade -r requirements.txt

sudo systemctl restart batik-api
```

---

## 🛡️ Firewall Configuration

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (important!)
sudo ufw allow 22

# Allow HTTP
sudo ufw allow 80

# Allow HTTPS
sudo ufw allow 443

# Check status
sudo ufw status
```

---

## 🐛 Troubleshooting

### Issue: API not starting

```bash
# Check logs for errors
sudo journalctl -u batik-api -n 50

# Check if port 5000 is in use
sudo lsof -i :5000

# Test manually
cd /var/www/batik-api/batik-classifier/api
source venv/bin/activate
python app.py
```

### Issue: 502 Bad Gateway

```bash
# Check if API is running
sudo systemctl status batik-api

# Check if listening on port 5000
curl http://localhost:5000/health

# Restart API
sudo systemctl restart batik-api
```

### Issue: TensorFlow import error

```bash
# Ensure Python 3.11 is used
python3.11 --version

# Reinstall TensorFlow
cd /var/www/batik-api/batik-classifier/api
source venv/bin/activate
pip uninstall tensorflow
pip install tensorflow>=2.16.0
```

### Issue: Permission denied

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/batik-api

# Fix service user in systemd file
sudo nano /etc/systemd/system/batik-api.service
# Update User=YOUR_USERNAME

sudo systemctl daemon-reload
sudo systemctl restart batik-api
```

---

## 📈 Performance Optimization

### 1. Enable Nginx Caching

Add to Nginx config:

```nginx
# Cache static responses
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location / {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... rest of proxy config
}
```

### 2. Use Gunicorn (Production WSGI Server)

```bash
# Install Gunicorn
cd /var/www/batik-api/batik-classifier/api
source venv/bin/activate
pip install gunicorn

# Update systemd service
sudo nano /etc/systemd/system/batik-api.service
```

Change `ExecStart` to:
```ini
ExecStart=/var/www/batik-api/batik-classifier/api/venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 app:app
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart batik-api
```

### 3. Monitor Resource Usage

```bash
# Install htop
sudo apt install htop

# Monitor in real-time
htop

# Check memory usage
free -h

# Check disk usage
df -h
```

---

## 🔄 Backup and Recovery

### Backup Model Files

```bash
# Create backup directory
mkdir -p ~/backups

# Backup models
tar -czf ~/backups/batik-models-$(date +%Y%m%d).tar.gz \
  /var/www/batik-api/batik-classifier/api/models/
```

### Restore from Backup

```bash
tar -xzf ~/backups/batik-models-20240101.tar.gz -C /
sudo systemctl restart batik-api
```

---

## 📞 Support

If you encounter issues:

1. Check logs: `sudo journalctl -u batik-api -n 100`
2. Verify configuration: `sudo nginx -t`
3. Test API manually: `curl http://localhost:5000/health`
4. Check GitHub issues: https://github.com/Maftuuh1922/warisan-digital/issues

---

## 📝 Deployment Checklist

- [ ] Ubuntu server with public IP
- [ ] Domain icbs.my.id points to server IP in Cloudflare
- [ ] Ports 80, 443 open in firewall
- [ ] Run deployment script or manual steps
- [ ] Verify API health: `curl https://icbs.my.id/health`
- [ ] Setup SSL with Certbot
- [ ] Test prediction with test image
- [ ] Configure monitoring and backups
- [ ] Enable Cloudflare security features (WAF, Bot Protection)

---

## 🎉 Success Indicators

When everything works correctly:

- ✅ `sudo systemctl status batik-api` shows "active (running)"
- ✅ `sudo systemctl status nginx` shows "active (running)"
- ✅ `curl https://icbs.my.id/health` returns `{"status": "healthy"}`
- ✅ Test prediction works with 95% accuracy
- ✅ SSL certificate valid (green padlock in browser)
- ✅ No errors in logs

---

**Deployment Time**: ~15-20 minutes (excluding TensorFlow download)  
**Server Cost**: $0 (self-hosted)  
**Domain Cost**: Free (.my.id)  
**Cloudflare**: Free tier  

**Total Cost**: 🎉 **FREE** 🎉
