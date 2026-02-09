# 📘 PHẦN 28: SCRIPTS COLLECTION - BỘ SƯU TẬP SCRIPTS

> **📌 MỤC ĐÍCH:**
>
> Tổng hợp tất cả scripts hữu ích đã đề cập trong các phần trước

---

## 📁 CẤU TRÚC THƯ MỤC SCRIPTS

```bash
# Tạo cấu trúc thư mục
mkdir -p ~/scripts/{monitoring,backup,deployment,emergency}

# Cấu trúc:
~/scripts/
├── monitoring/
│   ├── system-health.sh
│   ├── system-alert.sh
│   ├── pm2-metrics.sh
│   └── find-errors.sh
├── backup/
│   ├── backup-mongodb.sh
│   ├── backup-app.sh
│   └── cleanup-old-backups.sh
├── deployment/
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   └── rollback.sh
└── emergency/
    ├── switch-to-cftunnel.sh
    ├── switch-to-nginx.sh
    └── check-status.sh
```

---

## 📊 MONITORING SCRIPTS

### **1. system-health.sh**

```bash
nano ~/scripts/monitoring/system-health.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: system-health.sh
# Mục đích: Kiểm tra và báo cáo tình trạng hệ thống
# ═══════════════════════════════════════════════════════════════════════════

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Thresholds
CPU_WARN=80
MEM_WARN=80
DISK_WARN=80

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  SYSTEM HEALTH CHECK - $(date '+%Y-%m-%d %H:%M:%S')                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
echo -n "📊 CPU Usage: "
if [ "$CPU_USAGE" -ge "$CPU_WARN" ]; then
    echo -e "${RED}${CPU_USAGE}% ⚠️  HIGH${NC}"
else
    echo -e "${GREEN}${CPU_USAGE}%${NC}"
fi

# Memory
MEM_TOTAL=$(free | grep Mem | awk '{print $2}')
MEM_USED=$(free | grep Mem | awk '{print $3}')
MEM_PERCENT=$((MEM_USED * 100 / MEM_TOTAL))
echo -n "💾 Memory Usage: "
if [ "$MEM_PERCENT" -ge "$MEM_WARN" ]; then
    echo -e "${RED}${MEM_PERCENT}% ⚠️  HIGH${NC}"
else
    echo -e "${GREEN}${MEM_PERCENT}%${NC}"
fi

# Disk
echo "💿 Disk Usage:"
df -h | grep -E "^/dev" | while read line; do
    DISK_PERCENT=$(echo "$line" | awk '{print $5}' | tr -d '%')
    MOUNT=$(echo "$line" | awk '{print $6}')
    if [ "$DISK_PERCENT" -ge "$DISK_WARN" ]; then
        echo -e "   ${RED}$MOUNT: ${DISK_PERCENT}% ⚠️  HIGH${NC}"
    else
        echo -e "   ${GREEN}$MOUNT: ${DISK_PERCENT}%${NC}"
    fi
done

# Services
echo ""
echo "🔧 Services:"
check_service() {
    if systemctl is-active --quiet $1 2>/dev/null; then
        echo -e "   ${GREEN}✅ $1 - running${NC}"
    else
        echo -e "   ${RED}❌ $1 - not running${NC}"
    fi
}

check_service mongod
check_service nginx 2>/dev/null || echo "   ⚪ nginx - not installed"

# PM2
if command -v pm2 &> /dev/null; then
    PM2_RUNNING=$(pm2 list 2>/dev/null | grep -c "online")
    echo -e "   ${GREEN}✅ pm2 - ${PM2_RUNNING} processes online${NC}"
fi

# Cloudflared
if systemctl --user is-active --quiet cloudflared 2>/dev/null; then
    echo -e "   ${GREEN}✅ cloudflared - running${NC}"
else
    echo -e "   ⚪ cloudflared - stopped/not installed"
fi

# Network
echo ""
echo "🌐 Listening Ports:"
ss -tuln | grep LISTEN | awk '{print "   - " $5}' | head -10

# Uptime
echo ""
echo "⏱️  Uptime: $(uptime -p)"
```

```bash
chmod +x ~/scripts/monitoring/system-health.sh
```

### **2. system-alert.sh (cho cron)**

```bash
nano ~/scripts/monitoring/system-alert.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: system-alert.sh
# Mục đích: Kiểm tra và ghi log cảnh báo (chạy bằng cron)
# Cron: */5 * * * * /home/user/scripts/monitoring/system-alert.sh
# ═══════════════════════════════════════════════════════════════════════════

LOG_FILE="/var/log/system-alerts.log"
ALERT=false
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Thresholds
CPU_WARN=80
MEM_WARN=85
DISK_WARN=85

# CPU Check
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
if [ "$CPU_USAGE" -ge "$CPU_WARN" ]; then
    echo "[$TIMESTAMP] ⚠️  ALERT: CPU usage ${CPU_USAGE}%" >> $LOG_FILE
    ALERT=true
fi

# Memory Check
MEM_PERCENT=$(free | grep Mem | awk '{print $3/$2 * 100.0}' | cut -d. -f1)
if [ "$MEM_PERCENT" -ge "$MEM_WARN" ]; then
    echo "[$TIMESTAMP] ⚠️  ALERT: Memory usage ${MEM_PERCENT}%" >> $LOG_FILE
    ALERT=true
fi

# Disk Check
DISK_PERCENT=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_PERCENT" -ge "$DISK_WARN" ]; then
    echo "[$TIMESTAMP] ⚠️  ALERT: Disk usage ${DISK_PERCENT}%" >> $LOG_FILE
    ALERT=true
fi

# MongoDB Check
if ! systemctl is-active --quiet mongod; then
    echo "[$TIMESTAMP] 🔴 CRITICAL: MongoDB is DOWN!" >> $LOG_FILE
    ALERT=true
fi

# Log OK status hourly
if [ "$ALERT" = false ] && [ "$(date +%M)" = "00" ]; then
    echo "[$TIMESTAMP] ✅ All systems normal - CPU:${CPU_USAGE}% MEM:${MEM_PERCENT}% DISK:${DISK_PERCENT}%" >> $LOG_FILE
fi
```

```bash
chmod +x ~/scripts/monitoring/system-alert.sh

# Setup cron
(crontab -l 2>/dev/null; echo "*/5 * * * * $HOME/scripts/monitoring/system-alert.sh") | crontab -
```

---

## 💾 BACKUP SCRIPTS

### **3. backup-mongodb.sh**

```bash
nano ~/scripts/backup/backup-mongodb.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: backup-mongodb.sh
# Mục đích: Backup MongoDB database
# ═══════════════════════════════════════════════════════════════════════════

BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${DATE}"
RETENTION_DAYS=7

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  MONGODB BACKUP - $(date '+%Y-%m-%d %H:%M:%S')                            ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"

# Create backup directory
mkdir -p $BACKUP_PATH

# Run backup
echo "📦 Starting backup..."
mongodump --out=$BACKUP_PATH

if [ $? -eq 0 ]; then
    echo "✅ Backup completed: $BACKUP_PATH"

    # Compress
    echo "🗜️  Compressing..."
    tar -czf "${BACKUP_PATH}.tar.gz" -C $BACKUP_DIR $DATE
    rm -rf $BACKUP_PATH
    echo "✅ Compressed: ${BACKUP_PATH}.tar.gz"

    # Cleanup old backups
    echo "🧹 Cleaning old backups (>${RETENTION_DAYS} days)..."
    find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

    # Show backup size
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}.tar.gz" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
else
    echo "❌ Backup FAILED!"
    exit 1
fi

echo ""
echo "📁 Current backups:"
ls -lh $BACKUP_DIR/*.tar.gz
```

```bash
chmod +x ~/scripts/backup/backup-mongodb.sh

# Setup daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * $HOME/scripts/backup/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1") | crontab -
```

### **4. backup-app.sh**

```bash
nano ~/scripts/backup/backup-app.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: backup-app.sh
# Mục đích: Backup application code và configs
# ═══════════════════════════════════════════════════════════════════════════

BACKUP_DIR="/backup/app"
DATE=$(date +%Y-%m-%d)
APPS=("giaobanbv-be" "fe-bcgiaobanbvt")
RETENTION_DAYS=30

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  APP BACKUP - $(date '+%Y-%m-%d %H:%M:%S')                                ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"

mkdir -p $BACKUP_DIR

for APP in "${APPS[@]}"; do
    echo ""
    echo "📦 Backing up $APP..."

    if [ -d "$HOME/$APP" ]; then
        tar -czf "${BACKUP_DIR}/${APP}_${DATE}.tar.gz" \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='build' \
            --exclude='dist' \
            -C $HOME $APP

        echo "✅ Backed up: ${BACKUP_DIR}/${APP}_${DATE}.tar.gz"
    else
        echo "⚠️  Directory not found: $HOME/$APP"
    fi
done

# Backup ecosystem.config.js
if [ -f "$HOME/ecosystem.config.js" ]; then
    cp $HOME/ecosystem.config.js "${BACKUP_DIR}/ecosystem.config.js.${DATE}"
    echo "✅ Backed up: ecosystem.config.js"
fi

# Cleanup old backups
echo ""
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo ""
echo "📁 Current backups:"
ls -lh $BACKUP_DIR/
```

```bash
chmod +x ~/scripts/backup/backup-app.sh
```

---

## 🚀 DEPLOYMENT SCRIPTS

### **5. deploy-backend.sh**

```bash
nano ~/scripts/deployment/deploy-backend.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: deploy-backend.sh
# Mục đích: Deploy backend application
# ═══════════════════════════════════════════════════════════════════════════

APP_DIR="$HOME/giaobanbv-be"
BRANCH=${1:-main}

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  BACKEND DEPLOYMENT - $(date '+%Y-%m-%d %H:%M:%S')                        ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"

cd $APP_DIR || exit 1

# Save current commit
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "📌 Current commit: $CURRENT_COMMIT"

# Pull latest
echo ""
echo "📥 Pulling latest changes from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

NEW_COMMIT=$(git rev-parse HEAD)
echo "📌 New commit: $NEW_COMMIT"

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    echo "ℹ️  No changes to deploy"
    exit 0
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --production

# Restart app
echo ""
echo "🔄 Restarting backend..."
pm2 restart backend

# Wait and check
sleep 5
if pm2 list | grep -q "backend.*online"; then
    echo "✅ Backend deployed successfully!"
    echo ""
    echo "📊 Recent logs:"
    pm2 logs backend --lines 10 --nostream
else
    echo "❌ Deploy FAILED! Rolling back..."
    git checkout $CURRENT_COMMIT
    npm install --production
    pm2 restart backend
    echo "🔙 Rolled back to $CURRENT_COMMIT"
    exit 1
fi
```

```bash
chmod +x ~/scripts/deployment/deploy-backend.sh
```

### **6. deploy-frontend.sh**

```bash
nano ~/scripts/deployment/deploy-frontend.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: deploy-frontend.sh
# Mục đích: Deploy frontend application
# ═══════════════════════════════════════════════════════════════════════════

APP_DIR="$HOME/fe-bcgiaobanbvt"
BRANCH=${1:-main}

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  FRONTEND DEPLOYMENT - $(date '+%Y-%m-%d %H:%M:%S')                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"

cd $APP_DIR || exit 1

# Save current commit
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "📌 Current commit: $CURRENT_COMMIT"

# Pull latest
echo ""
echo "📥 Pulling latest changes from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

NEW_COMMIT=$(git rev-parse HEAD)
echo "📌 New commit: $NEW_COMMIT"

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    echo "ℹ️  No changes to deploy"
    exit 0
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build
echo ""
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build FAILED!"
    exit 1
fi

# Restart serve
echo ""
echo "🔄 Restarting frontend..."
pm2 restart frontend

# Check
sleep 3
if pm2 list | grep -q "frontend.*online"; then
    echo "✅ Frontend deployed successfully!"
else
    echo "❌ Deploy FAILED!"
    exit 1
fi
```

```bash
chmod +x ~/scripts/deployment/deploy-frontend.sh
```

---

## 🚨 EMERGENCY SCRIPTS

### **7. check-status.sh**

```bash
nano ~/scripts/emergency/check-status.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: check-status.sh
# Mục đích: Kiểm tra trạng thái tổng quan của hệ thống
# ═══════════════════════════════════════════════════════════════════════════

MAYC_IP="192.168.1.250"
DOMAIN="hospital.vn"

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  SYSTEM STATUS CHECK - $(date '+%Y-%m-%d %H:%M:%S')                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Local Services
echo "📍 LOCAL SERVICES (Máy A):"
echo "──────────────────────────────"

# React
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✅ React (port 3000) - RUNNING"
else
    echo "  ❌ React (port 3000) - NOT RESPONDING"
fi

# Backend
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "  ✅ Backend (port 8000) - RUNNING"
else
    echo "  ❌ Backend (port 8000) - NOT RESPONDING"
fi

# MongoDB
if mongosh --quiet --eval "db.runCommand('ping').ok" > /dev/null 2>&1; then
    echo "  ✅ MongoDB (port 27017) - RUNNING"
else
    echo "  ❌ MongoDB (port 27017) - NOT RESPONDING"
fi

# Cloudflare Tunnel
echo ""
echo "📍 CLOUDFLARE TUNNEL:"
echo "──────────────────────────────"
if systemctl --user is-active --quiet cloudflared 2>/dev/null; then
    echo "  ✅ cloudflared - RUNNING"
else
    echo "  ⚪ cloudflared - STOPPED"
fi

# Máy C
echo ""
echo "📍 MÁY C (NGINX):"
echo "──────────────────────────────"
if ping -c 1 $MAYC_IP > /dev/null 2>&1; then
    echo "  ✅ Network - REACHABLE"
else
    echo "  ❌ Network - UNREACHABLE"
fi

# Active System
echo ""
echo "═════════════════════════════════════════════════════════════════════════════"
if systemctl --user is-active --quiet cloudflared 2>/dev/null; then
    echo "🔵 Active System: CLOUDFLARE TUNNEL"
else
    echo "🟢 Active System: NGINX (Máy C)"
fi
```

```bash
chmod +x ~/scripts/emergency/check-status.sh
```

### **8. switch-to-cftunnel.sh & switch-to-nginx.sh**

Xem [File 24-SWITCH-GUIDE.md](24-SWITCH-GUIDE.md) để có scripts đầy đủ.

---

## 📋 MASTER SETUP SCRIPT

### **9. setup-all-scripts.sh**

```bash
nano ~/setup-all-scripts.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: setup-all-scripts.sh
# Mục đích: Tạo tất cả scripts và cấu trúc thư mục
# ═══════════════════════════════════════════════════════════════════════════

echo "Creating script directories..."
mkdir -p ~/scripts/{monitoring,backup,deployment,emergency}

echo "Creating log directory..."
sudo mkdir -p /backup/{mongodb,app}
sudo chown -R $USER:$USER /backup/

echo "Setting up log file..."
sudo touch /var/log/system-alerts.log
sudo chown $USER:$USER /var/log/system-alerts.log

echo ""
echo "✅ Directory structure created!"
echo ""
echo "Next steps:"
echo "1. Copy scripts from documentation to ~/scripts/"
echo "2. chmod +x ~/scripts/*/*.sh"
echo "3. Setup cron jobs for automated tasks"
echo ""
echo "Cron jobs to add:"
echo "  */5 * * * * \$HOME/scripts/monitoring/system-alert.sh"
echo "  0 2 * * * \$HOME/scripts/backup/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1"
```

```bash
chmod +x ~/setup-all-scripts.sh
./setup-all-scripts.sh
```

---

## ✅ CHECKLIST

```
□ Đã tạo cấu trúc thư mục ~/scripts/
□ Đã tạo monitoring scripts
□ Đã tạo backup scripts
□ Đã tạo deployment scripts
□ Đã tạo emergency scripts
□ Đã chmod +x tất cả scripts
□ Đã setup cron jobs

📌 QUICK ACCESS:
─────────────────────────────
~/scripts/monitoring/system-health.sh  # Health check
~/scripts/backup/backup-mongodb.sh     # Backup DB
~/scripts/deployment/deploy-backend.sh # Deploy BE
~/scripts/emergency/check-status.sh    # System status
```

---

## 🔗 LIÊN KẾT

| Trước                                              | Tiếp theo                            |
| -------------------------------------------------- | ------------------------------------ |
| [27-COMMAND-REFERENCE.md](27-COMMAND-REFERENCE.md) | [29-CHECKLISTS.md](29-CHECKLISTS.md) |
