# Deployment Guide

This guide covers deploying the ITU Travel Backend to a remote server.

## Prerequisites

- Remote server with:
  - Python 3.10+ installed
  - Static IP or Dynamic DNS setup
  - Ports 80/443 open (or Cloudflare Tunnel)
  - Systemd (Linux) for service management
  - Root/sudo access

## Step 1: Server Setup

### 1.1. Create User and Directories

```bash
sudo useradd -m -s /bin/bash travelbot
sudo mkdir -p /opt/travelbot/{be,data,logs,backups}
sudo chown -R travelbot:travelbot /opt/travelbot
```

### 1.2. Install Python Dependencies

```bash
sudo apt update
sudo apt install python3-venv python3-pip
```

## Step 2: Deploy Application

### 2.1. Copy Code to Server

```bash
# From your local machine
rsync -avz --exclude '.venv' --exclude '__pycache__' --exclude '*.pyc' \
  be/ user@your-server:/opt/travelbot/be/
```

### 2.2. Set Up Virtual Environment

```bash
ssh user@your-server
cd /opt/travelbot/be
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2.3. Configure Environment

```bash
sudo nano /opt/travelbot/.env
```

Set production values:
```
DB_URL=sqlite:///./data/travelbot.db
ALLOWED_ORIGINS=https://travelbot.yourdomain.com
ENV=production
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
IMAGE_PROVIDER=unsplash
UNSPLASH_KEY=...
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_EXPLORE_PER_MINUTE=10
```

## Step 3: Systemd Service

### 3.1. Install Service File

```bash
sudo cp /opt/travelbot/be/deploy/travelbot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable travelbot
sudo systemctl start travelbot
sudo systemctl status travelbot
```

### 3.2. View Logs

```bash
sudo journalctl -u travelbot -f
```

## Step 4: Reverse Proxy (Caddy)

### 4.1. Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 4.2. Configure Caddy

```bash
sudo nano /etc/caddy/Caddyfile
```

Add configuration (see `be/deploy/Caddyfile.example`):
```
travelbot.yourdomain.com {
    reverse_proxy /api/* localhost:8000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_addr}
        header_up X-Forwarded-Proto {scheme}
        timeout 60s
    }
    
    root * /var/www/travelbot-frontend
    try_files {path} /index.html
    file_server
    
    encode zstd gzip
}
```

### 4.3. Start Caddy

```bash
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

## Step 5: Cloudflare Configuration

### 5.1. DNS Setup

1. Add A record: `travelbot` → Your server IP
2. Set Proxy status: **Proxied** (orange cloud)

### 5.2. SSL/TLS Settings

1. SSL/TLS encryption mode: **Full (strict)**
2. Always Use HTTPS: **On**
3. Minimum TLS Version: **1.2**

## Step 6: Verification

### 6.1. Test Health Endpoint

```bash
curl https://travelbot.yourdomain.com/health
```

Expected response:
```json
{
  "data": {
    "status": "ok",
    "database": "ok"
  },
  "error": null
}
```

### 6.2. Test API Endpoints

```bash
curl https://travelbot.yourdomain.com/api/v1/agent/offers
```

## Step 7: Backup Strategy

Create backup script at `/opt/travelbot/scripts/backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/travelbot/backups"
mkdir -p "$BACKUP_DIR"
cp /opt/travelbot/data/travelbot.db "$BACKUP_DIR/travelbot_$(date +%Y%m%d_%H%M%S).db"
find "$BACKUP_DIR" -name "*.db" -mtime +7 -delete
```

Schedule daily backups:
```bash
sudo crontab -e
# Add: 0 2 * * * /opt/travelbot/scripts/backup_db.sh
```

## Maintenance

### Update Code

```bash
rsync -avz --exclude '.venv' --exclude '__pycache__' be/ user@server:/opt/travelbot/be/
ssh user@server "sudo systemctl restart travelbot"
```

### View Logs

```bash
sudo journalctl -u travelbot -f
sudo journalctl -u caddy -f
```

