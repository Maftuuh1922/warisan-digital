# Cloudflare SSL Setup for icbs.my.id

## Prerequisites
- Domain: `icbs.my.id`
- Cloudflare account with domain configured
- Ubuntu server with Nginx installed

---

## Step 1: Cloudflare Dashboard Configuration

### 1.1 Set SSL/TLS Mode
1. Login to Cloudflare Dashboard
2. Select domain `icbs.my.id`
3. Go to **SSL/TLS** → **Overview**
4. Set encryption mode to: **Full** (or **Full (Strict)** if you have valid SSL cert)

### 1.2 Enable Always Use HTTPS
1. Go to **SSL/TLS** → **Edge Certificates**
2. Enable **Always Use HTTPS**
3. Enable **Automatic HTTPS Rewrites**

### 1.3 Configure DNS
1. Go to **DNS** → **Records**
2. Ensure A record points to your Ubuntu server IP:
   ```
   Type: A
   Name: @ (or icbs.my.id)
   Content: [Your Server IP]
   Proxy status: Proxied (orange cloud)
   ```

---

## Step 2: Install Certbot on Ubuntu Server

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d icbs.my.id

# Follow prompts:
# - Enter email: rizkiuya12@gmail.com
# - Agree to Terms of Service: Yes
# - Redirect HTTP to HTTPS: Yes
```

---

## Step 3: Verify Nginx Configuration

Certbot will automatically update your Nginx config. Verify:

```bash
sudo cat /etc/nginx/sites-available/batik-api
```

Should contain SSL configuration:
```nginx
server {
    server_name icbs.my.id;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/icbs.my.id/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/icbs.my.id/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = icbs.my.id) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name icbs.my.id;
    return 404; # managed by Certbot
}
```

---

## Step 4: Test SSL Configuration

```bash
# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check certificate expiry
sudo certbot certificates
```

---

## Step 5: Auto-Renewal Setup

Certbot automatically sets up renewal. Verify:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# Test renewal (dry run)
sudo certbot renew --dry-run
```

---

## Step 6: Test API with HTTPS

```bash
# Test from server
curl https://icbs.my.id

# Test from browser
# Open: https://icbs.my.id
```

---

## Cloudflare SSL Modes Explained

| Mode | Description | Use Case |
|------|-------------|----------|
| **Off** | No encryption | ❌ Not recommended |
| **Flexible** | Cloudflare ↔ Visitor (encrypted)<br>Cloudflare ↔ Server (unencrypted) | Basic setup, but insecure server connection |
| **Full** | End-to-end encryption<br>Server uses self-signed cert | ✅ **Recommended for this setup** |
| **Full (Strict)** | End-to-end encryption<br>Server uses valid cert from trusted CA | Best security (use with Certbot) |

---

## Troubleshooting

### Issue: Certificate validation failed
```bash
# Check if port 80 is accessible
sudo ufw allow 80
sudo ufw allow 443

# Restart Nginx
sudo systemctl restart nginx

# Try certbot again
sudo certbot --nginx -d icbs.my.id
```

### Issue: 502 Bad Gateway
```bash
# Check if API is running
sudo systemctl status batik-api

# Check API logs
sudo journalctl -u batik-api -n 50

# Restart API
sudo systemctl restart batik-api
```

### Issue: Mixed content warnings
- Ensure Cloudflare SSL mode is **Full** or **Full (Strict)**
- Enable **Automatic HTTPS Rewrites** in Cloudflare

---

## Security Recommendations

1. **Enable Cloudflare WAF** (Web Application Firewall)
   - Go to **Security** → **WAF**
   - Enable managed rules

2. **Configure Rate Limiting**
   - Protect `/predict` endpoint from abuse
   - Go to **Security** → **Rate Limiting**

3. **Enable Bot Protection**
   - Go to **Security** → **Bots**
   - Set to "Challenge" or "Block"

4. **Configure Firewall Rules**
   ```bash
   sudo ufw enable
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw status
   ```

---

## Certificate Renewal

Certificates auto-renew via systemd timer. To manually renew:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## API Access After SSL Setup

- **Public API**: `https://icbs.my.id/predict`
- **Health Check**: `https://icbs.my.id/health`
- **Classes List**: `https://icbs.my.id/classes`
- **API Info**: `https://icbs.my.id/info`

---

## Complete Setup Commands

```bash
# 1. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtain certificate
sudo certbot --nginx -d icbs.my.id

# 3. Test renewal
sudo certbot renew --dry-run

# 4. Configure firewall
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# 5. Test API
curl https://icbs.my.id/health
```

---

## Monitoring

```bash
# Watch API logs in real-time
sudo journalctl -u batik-api -f

# Check SSL certificate status
sudo certbot certificates

# Monitor Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Monitor Nginx error logs
sudo tail -f /var/log/nginx/error.log
```
