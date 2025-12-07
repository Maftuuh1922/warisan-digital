# 🎉 Deployment Package Siap Dipakai!

## 📦 Apa yang Sudah Dibuat?

### 1. **deploy-ubuntu.sh** - Script Deployment Otomatis
Lokasi: `batik-classifier/api/deploy-ubuntu.sh`

Script ini akan:
- ✅ Install Python 3.11, Nginx, Git
- ✅ Clone repository GitHub
- ✅ Setup virtual environment
- ✅ Install semua dependencies (termasuk TensorFlow)
- ✅ Buat systemd service untuk auto-restart
- ✅ Configure Nginx reverse proxy
- ✅ Start semua services

**Cara pakai:**
```bash
# Di Ubuntu server
wget https://raw.githubusercontent.com/Maftuuh1922/warisan-digital/main/batik-classifier/api/deploy-ubuntu.sh
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

---

### 2. **UBUNTU_DEPLOYMENT.md** - Panduan Lengkap
Lokasi: `batik-classifier/api/UBUNTU_DEPLOYMENT.md`

Berisi:
- ✅ Panduan instalasi manual step-by-step
- ✅ Konfigurasi systemd service
- ✅ Konfigurasi Nginx
- ✅ Cara monitoring logs
- ✅ Troubleshooting common issues
- ✅ Performance optimization
- ✅ Backup & recovery

---

### 3. **SSL_SETUP.md** - Panduan SSL/HTTPS
Lokasi: `batik-classifier/api/SSL_SETUP.md`

Berisi:
- ✅ Setup Cloudflare SSL
- ✅ Install Certbot untuk Let's Encrypt
- ✅ Konfigurasi auto-renewal
- ✅ Firewall configuration
- ✅ Security recommendations

---

### 4. **download-models.sh** - Download Model dari Google Drive
Lokasi: `batik-classifier/api/download-models.sh`

Script untuk download model files (106MB) dari Google Drive.

---

### 5. **models/README.md** - Panduan Model Files
Lokasi: `batik-classifier/api/models/README.md`

Menjelaskan:
- ✅ Kenapa model tidak di GitHub (106MB > limit 100MB)
- ✅ Cara download dari Google Drive
- ✅ Cara verify model files
- ✅ Cara train model sendiri

---

## 🚀 Cara Deploy ke Ubuntu Server

### Langkah Cepat (Recommended):

1. **Login ke Ubuntu server**
   ```bash
   ssh user@icbs.my.id
   ```

2. **Download & jalankan deployment script**
   ```bash
   wget https://raw.githubusercontent.com/Maftuuh1922/warisan-digital/main/batik-classifier/api/deploy-ubuntu.sh
   chmod +x deploy-ubuntu.sh
   ./deploy-ubuntu.sh
   ```

3. **Script akan pause untuk download model files**
   - Buka Google Drive
   - Download 4 model files (batik_knn_model_95acc.pkl, dll)
   - Copy ke `/var/www/batik-api/batik-classifier/api/models/`
   - Press Enter untuk continue

4. **Setup SSL (setelah deployment selesai)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d icbs.my.id
   ```

5. **Test API**
   ```bash
   curl https://icbs.my.id/health
   ```

**Done!** 🎉

---

## 📋 Checklist Deployment

### Pre-Deployment:
- [ ] Ubuntu server siap (i5-650M, 4GB RAM) ✅ (sudah ada)
- [ ] Domain icbs.my.id pointing ke server IP ✅ (sudah setup Cloudflare)
- [ ] Port 80, 443 terbuka di firewall
- [ ] SSH access ke server
- [ ] Model files di Google Drive siap di-download

### During Deployment:
- [ ] Run `deploy-ubuntu.sh`
- [ ] Download model files saat script pause
- [ ] Verify services running
- [ ] Setup SSL dengan Certbot
- [ ] Test API endpoint

### Post-Deployment:
- [ ] Test prediction dengan gambar batik
- [ ] Setup monitoring (logs)
- [ ] Configure Cloudflare security (WAF, Bot Protection)
- [ ] Setup backup script

---

## 🔍 Cara Test API

### 1. Health Check
```bash
curl https://icbs.my.id/health
```

Response:
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

### 3. Prediction (dengan gambar)
```bash
curl -X POST https://icbs.my.id/predict \
  -F "image=@batik_test.jpg"
```

Response:
```json
{
  "success": true,
  "predictions": [
    {
      "class": "batik-parang",
      "confidence": 0.92
    }
  ]
}
```

---

## 📊 Monitoring

### View Logs
```bash
# API logs
sudo journalctl -u batik-api -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check Status
```bash
# API service
sudo systemctl status batik-api

# Nginx
sudo systemctl status nginx
```

### Restart Services
```bash
# Restart API
sudo systemctl restart batik-api

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🐛 Troubleshooting

### Issue: API tidak start
```bash
# Lihat error logs
sudo journalctl -u batik-api -n 50

# Test manual
cd /var/www/batik-api/batik-classifier/api
source venv/bin/activate
python app.py
```

### Issue: 502 Bad Gateway
```bash
# Check API running
sudo systemctl status batik-api

# Check port 5000
curl http://localhost:5000/health

# Restart
sudo systemctl restart batik-api
```

### Issue: Model not found
```bash
# Verify model files ada
ls -lh /var/www/batik-api/batik-classifier/api/models/

# Harus ada 4 files:
# batik_knn_model_95acc.pkl (106MB)
# batik_classes.pkl
# scaler.joblib
# batik_model_metadata.pkl
```

---

## 💡 Tips

### 1. Pakai Gunicorn untuk Production
```bash
cd /var/www/batik-api/batik-classifier/api
source venv/bin/activate
pip install gunicorn

# Edit systemd service
sudo nano /etc/systemd/system/batik-api.service

# Ganti ExecStart jadi:
ExecStart=/var/www/batik-api/batik-classifier/api/venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 app:app

sudo systemctl daemon-reload
sudo systemctl restart batik-api
```

### 2. Enable Cloudflare Security
- Go to Cloudflare Dashboard
- Enable WAF (Web Application Firewall)
- Enable Bot Protection
- Set Rate Limiting untuk endpoint `/predict`

### 3. Setup Backup
```bash
# Create backup script
nano ~/backup-models.sh
```

```bash
#!/bin/bash
tar -czf ~/backups/batik-models-$(date +%Y%m%d).tar.gz \
  /var/www/batik-api/batik-classifier/api/models/
```

```bash
chmod +x ~/backup-models.sh

# Add to crontab (backup setiap hari jam 2 pagi)
crontab -e
# Add: 0 2 * * * /home/user/backup-models.sh
```

---

## 📞 Kontak

Jika ada masalah:
- GitHub Issues: https://github.com/Maftuuh1922/warisan-digital/issues
- Email: rizkiuya12@gmail.com

---

## 🎯 Expected Results

Setelah deployment sukses:

- ✅ API running di https://icbs.my.id
- ✅ SSL certificate valid (green padlock)
- ✅ Health endpoint returns `{"status": "healthy"}`
- ✅ Prediction accuracy 95% (sama kayak di Colab)
- ✅ Auto-restart kalau server reboot
- ✅ Logs tersimpan di systemd journal
- ✅ No errors di logs

---

## 💰 Cost Breakdown

- **Server**: Rp 0 (self-hosted, sudah punya)
- **Domain**: Rp 0 (icbs.my.id free domain)
- **Cloudflare**: Rp 0 (free tier)
- **SSL Certificate**: Rp 0 (Let's Encrypt)
- **GitHub**: Rp 0 (public repo)
- **Google Drive**: Rp 0 (15GB free)

**Total**: **Rp 0 / FREE** 🎉

---

## 📈 Performance Specs

- **Server**: Intel i5-650M, 4GB RAM
- **API Response Time**: ~1-2 detik per prediksi
- **Concurrent Requests**: 2-4 (dengan Gunicorn workers)
- **Model Accuracy**: 95%
- **Uptime**: Auto-restart on failure

---

## ✅ Deployment Complete!

Semua file sudah di-push ke GitHub:
- Repository: https://github.com/Maftuuh1922/warisan-digital
- Branch: main
- Latest commit: "feat: Complete Ubuntu deployment without large model files"

**Next Steps:**
1. Login ke Ubuntu server
2. Run `deploy-ubuntu.sh`
3. Download model files
4. Setup SSL
5. Test API
6. **DONE!** 🚀

---

**Deployment Time**: ~15-20 menit  
**Difficulty**: Mudah (automated script)  
**Maintenance**: Minimal (auto-restart, auto-renew SSL)

**Good luck with deployment! 🎉**
