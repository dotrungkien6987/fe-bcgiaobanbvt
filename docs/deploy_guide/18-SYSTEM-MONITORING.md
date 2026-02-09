# 📘 PHẦN 18: SYSTEM MONITORING - GIÁM SÁT HỆ THỐNG

> **📌 MỤC ĐÍCH:**
>
> Sau phần này bạn sẽ biết cách giám sát:
>
> - CPU, RAM, Disk usage
> - Network traffic
> - System health
> - Thiết lập cảnh báo tự động

---

## 🎯 TẠI SAO CẦN MONITORING?

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  KHÔNG CÓ MONITORING:                                                     ║
║  ────────────────────                                                     ║
║  • Server chậm → không biết tại sao                                       ║
║  • Disk đầy → app crash → mất data                                        ║
║  • RAM leak → restart liên tục                                            ║
║  • Chỉ biết lỗi KHI USER BÁO                                             ║
║                                                                           ║
║  CÓ MONITORING:                                                           ║
║  ──────────────                                                           ║
║  • Thấy CPU spike → điều tra ngay                                         ║
║  • Disk 80% → dọn dẹp trước khi đầy                                       ║
║  • RAM tăng dần → phát hiện memory leak                                   ║
║  • BIẾT TRƯỚC VẤN ĐỀ → fix trước khi user gặp                            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📊 PHẦN 1: COMMANDS CƠ BẢN

### **1.1 - Xem tổng quan hệ thống:**

```bash
# Xem tất cả thông tin cơ bản
neofetch
# Hoặc nếu chưa cài:
hostnamectl
```

### **1.2 - Xem CPU và RAM realtime:**

```bash
# htop - interactive process viewer
htop

# Phím tắt trong htop:
# F5: Tree view (xem process theo cây)
# F6: Sort by column
# F9: Kill process
# F10: Quit
# /: Search process
```

```bash
# top - built-in, không cần cài
top

# Trong top:
# Shift + M: Sort by memory
# Shift + P: Sort by CPU
# q: Quit
```

### **1.3 - Xem RAM chi tiết:**

```bash
# Xem RAM usage
free -h

# Output:
#               total        used        free      shared  buff/cache   available
# Mem:           15Gi       4.2Gi       8.1Gi       312Mi       3.0Gi        10Gi
# Swap:         2.0Gi          0B       2.0Gi

# Giải thích:
# - total: Tổng RAM
# - used: Đang dùng
# - free: Hoàn toàn trống
# - available: Có thể dùng được (free + buff/cache có thể giải phóng)
```

### **1.4 - Xem Disk usage:**

```bash
# Xem disk usage theo mount point
df -h

# Output:
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1       100G   45G   50G  47% /

# Xem folder nào chiếm nhiều dung lượng nhất
du -sh /* 2>/dev/null | sort -hr | head -10

# Xem chi tiết folder cụ thể
du -sh /var/log/*
du -sh /home/*
```

### **1.5 - Xem Network:**

```bash
# Xem các kết nối đang mở
ss -tuln

# Xem bandwidth usage (nếu có nethogs)
sudo nethogs

# Xem network interfaces
ip a
```

---

## 🔧 PHẦN 2: CÀI ĐẶT HTOP VÀ CÁC TOOLS

### **2.1 - Cài đặt monitoring tools:**

```bash
# Update package list
sudo apt update

# Cài htop (process viewer đẹp hơn top)
sudo apt install -y htop

# Cài các tools khác
sudo apt install -y \
    iotop \       # Disk I/O monitoring
    nethogs \     # Network per-process
    iftop \       # Network interface traffic
    sysstat \     # System statistics (sar, iostat)
    glances       # All-in-one monitoring
```

### **2.2 - Sử dụng glances (all-in-one):**

```bash
# Chạy glances
glances

# Glances hiển thị:
# - CPU usage (per core)
# - RAM usage
# - Disk I/O
# - Network I/O
# - Processes
# - Docker containers (nếu có)

# Web mode (xem từ xa):
glances -w
# Mở browser: http://192.168.1.243:61208
```

---

## 📈 PHẦN 3: SCRIPT MONITORING TỰ ĐỘNG

### **3.1 - Tạo script check health:**

```bash
mkdir -p ~/scripts
nano ~/scripts/system-health.sh
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
NC='\033[0m' # No Color

# Thresholds (ngưỡng cảnh báo)
CPU_WARN=80
MEM_WARN=80
DISK_WARN=80

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  SYSTEM HEALTH CHECK - $(date '+%Y-%m-%d %H:%M:%S')                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# CPU Check
# ─────────────────────────────────────────────────────────────────────────────
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
echo -n "📊 CPU Usage: "
if [ "$CPU_USAGE" -ge "$CPU_WARN" ]; then
    echo -e "${RED}${CPU_USAGE}% ⚠️  HIGH${NC}"
else
    echo -e "${GREEN}${CPU_USAGE}%${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Memory Check
# ─────────────────────────────────────────────────────────────────────────────
MEM_TOTAL=$(free | grep Mem | awk '{print $2}')
MEM_USED=$(free | grep Mem | awk '{print $3}')
MEM_PERCENT=$((MEM_USED * 100 / MEM_TOTAL))
echo -n "💾 Memory Usage: "
if [ "$MEM_PERCENT" -ge "$MEM_WARN" ]; then
    echo -e "${RED}${MEM_PERCENT}% ⚠️  HIGH${NC}"
else
    echo -e "${GREEN}${MEM_PERCENT}%${NC}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Disk Check
# ─────────────────────────────────────────────────────────────────────────────
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

# ─────────────────────────────────────────────────────────────────────────────
# Services Check
# ─────────────────────────────────────────────────────────────────────────────
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

# PM2 check (user service)
if command -v pm2 &> /dev/null; then
    PM2_RUNNING=$(pm2 list 2>/dev/null | grep -c "online")
    echo -e "   ${GREEN}✅ pm2 - ${PM2_RUNNING} processes online${NC}"
fi

# Cloudflared check (user service)
if systemctl --user is-active --quiet cloudflared 2>/dev/null; then
    echo -e "   ${GREEN}✅ cloudflared - running${NC}"
else
    echo -e "   ⚪ cloudflared - stopped/not installed"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Network Check
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "🌐 Network:"
echo "   Listening ports:"
ss -tuln | grep LISTEN | awk '{print "   - " $5}' | head -10

# ─────────────────────────────────────────────────────────────────────────────
# Uptime
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "⏱️  Uptime: $(uptime -p)"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
```

```bash
chmod +x ~/scripts/system-health.sh
```

### **3.2 - Chạy script:**

```bash
# Chạy manual
~/scripts/system-health.sh

# Output example:
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SYSTEM HEALTH CHECK - 2025-02-04 10:30:00                                ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
# 📊 CPU Usage: 15%
# 💾 Memory Usage: 42%
# 💿 Disk Usage:
#    /: 47%
#
# 🔧 Services:
#    ✅ mongod - running
#    ✅ pm2 - 2 processes online
#    ✅ cloudflared - running
```

---

## ⏰ PHẦN 4: TỰ ĐỘNG CHẠY VÀ CẢNH BÁO

### **4.1 - Script cảnh báo qua file:**

```bash
nano ~/scripts/system-alert.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: system-alert.sh
# Mục đích: Kiểm tra và ghi log cảnh báo
# Chạy bằng cron mỗi 5 phút
# ═══════════════════════════════════════════════════════════════════════════

LOG_FILE="/var/log/system-alerts.log"
ALERT=false

# Thresholds
CPU_WARN=80
MEM_WARN=85
DISK_WARN=85

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# CPU Check
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
if [ "$CPU_USAGE" -ge "$CPU_WARN" ]; then
    echo "[$TIMESTAMP] ⚠️  ALERT: CPU usage ${CPU_USAGE}% (threshold: ${CPU_WARN}%)" >> $LOG_FILE
    ALERT=true
fi

# Memory Check
MEM_PERCENT=$(free | grep Mem | awk '{print $3/$2 * 100.0}' | cut -d. -f1)
if [ "$MEM_PERCENT" -ge "$MEM_WARN" ]; then
    echo "[$TIMESTAMP] ⚠️  ALERT: Memory usage ${MEM_PERCENT}% (threshold: ${MEM_WARN}%)" >> $LOG_FILE
    ALERT=true
fi

# Disk Check
DISK_PERCENT=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_PERCENT" -ge "$DISK_WARN" ]; then
    echo "[$TIMESTAMP] ⚠️  ALERT: Disk usage ${DISK_PERCENT}% (threshold: ${DISK_WARN}%)" >> $LOG_FILE
    ALERT=true
fi

# MongoDB Check
if ! systemctl is-active --quiet mongod; then
    echo "[$TIMESTAMP] 🔴 CRITICAL: MongoDB is DOWN!" >> $LOG_FILE
    ALERT=true
fi

# Log OK status nếu không có alert (mỗi giờ)
if [ "$ALERT" = false ]; then
    MINUTE=$(date +%M)
    if [ "$MINUTE" = "00" ]; then
        echo "[$TIMESTAMP] ✅ All systems normal - CPU:${CPU_USAGE}% MEM:${MEM_PERCENT}% DISK:${DISK_PERCENT}%" >> $LOG_FILE
    fi
fi
```

```bash
chmod +x ~/scripts/system-alert.sh

# Tạo log file
sudo touch /var/log/system-alerts.log
sudo chown $USER:$USER /var/log/system-alerts.log
```

### **4.2 - Thiết lập cron job:**

```bash
# Mở crontab editor
crontab -e

# Thêm dòng này (chạy mỗi 5 phút):
*/5 * * * * /home/yourusername/scripts/system-alert.sh

# Lưu và thoát
```

### **4.3 - Xem alerts:**

```bash
# Xem log alerts
tail -f /var/log/system-alerts.log

# Xem alerts gần nhất
tail -20 /var/log/system-alerts.log

# Tìm alerts cụ thể
grep "ALERT" /var/log/system-alerts.log
grep "CRITICAL" /var/log/system-alerts.log
```

---

## 📱 PHẦN 5: MONITORING DASHBOARD (OPTIONAL)

### **5.1 - Netdata (dễ cài, đẹp):**

```bash
# Cài Netdata - realtime monitoring dashboard
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Sau khi cài xong:
# Mở browser: http://192.168.1.243:19999

# Netdata tự động monitor:
# - CPU per core
# - RAM
# - Disk I/O
# - Network
# - MongoDB (nếu có plugin)
# - Node.js apps
```

### **5.2 - Bảo mật Netdata (chỉ truy cập nội bộ):**

```bash
# Chỉ cho phép LAN access
sudo nano /etc/netdata/netdata.conf

# Tìm section [web] và thêm:
[web]
    bind to = 192.168.1.243
    # Hoặc chỉ localhost nếu dùng SSH tunnel:
    # bind to = 127.0.0.1
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Đã cài htop, glances
□ Đã tạo script ~/scripts/system-health.sh
□ Đã tạo script ~/scripts/system-alert.sh
□ Đã thiết lập cron job (mỗi 5 phút)
□ Đã test script hoạt động
□ Đã xem được /var/log/system-alerts.log
□ (Optional) Đã cài Netdata dashboard

📌 COMMANDS THƯỜNG DÙNG:
─────────────────────────────
htop                           # Xem CPU/RAM realtime
df -h                          # Xem disk usage
~/scripts/system-health.sh     # Health check manual
tail -f /var/log/system-alerts.log  # Xem alerts
```

---

## 🔗 LIÊN KẾT

| Trước                                  | Tiếp theo                                        |
| -------------------------------------- | ------------------------------------------------ |
| [17-PWA-TESTING.md](17-PWA-TESTING.md) | [19-APPLICATION-LOGS.md](19-APPLICATION-LOGS.md) |
