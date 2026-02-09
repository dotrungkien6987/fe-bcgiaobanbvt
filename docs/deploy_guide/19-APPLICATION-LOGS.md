# 📘 PHẦN 19: APPLICATION LOGS - QUẢN LÝ LOG ỨNG DỤNG

> **📌 MỤC ĐÍCH:**
>
> Sau phần này bạn sẽ biết:
>
> - Nơi lưu trữ các loại log
> - Cách đọc và phân tích log
> - Thiết lập log rotation (tự động dọn log cũ)
> - Debug lỗi từ log

---

## 🎯 TẠI SAO CẦN QUẢN LÝ LOG?

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  LOGS = NHẬT KÝ HOẠT ĐỘNG CỦA HỆ THỐNG                                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Mỗi khi có gì xảy ra, hệ thống ghi lại:                                 ║
║  • User login/logout                                                      ║
║  • API requests                                                           ║
║  • Errors và exceptions                                                   ║
║  • Database queries                                                       ║
║  • Security events                                                        ║
║                                                                           ║
║  VÍ DỤ THỰC TẾ:                                                          ║
║  ─────────────                                                            ║
║  User: "App không load được!"                                             ║
║  Bạn: Xem log → thấy error "MongoDB connection refused"                  ║
║       → MongoDB đã stop → restart MongoDB → Fixed!                        ║
║                                                                           ║
║  KHÔNG CÓ LOG = ĐOÁN MÒ KHI DEBUG                                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📂 PHẦN 1: VỊ TRÍ CÁC LOG FILES

### **1.1 - System Logs (Linux):**

```bash
# Tất cả system logs nằm trong /var/log/

ls -la /var/log/

# Các file quan trọng:
# ─────────────────────────────────────────────────────────────────────────
# /var/log/syslog          # Log tổng hợp của hệ thống
# /var/log/auth.log        # Login attempts, SSH access, sudo usage
# /var/log/kern.log        # Kernel messages
# /var/log/ufw.log         # Firewall logs
# /var/log/mongodb/        # MongoDB logs (folder)
# /var/log/nginx/          # Nginx logs (folder) - nếu có
```

### **1.2 - Application Logs (Node.js với PM2):**

```bash
# PM2 logs mặc định:
~/.pm2/logs/

# Cấu trúc:
# ~/.pm2/logs/backend-out.log     # stdout của backend
# ~/.pm2/logs/backend-error.log   # stderr của backend
# ~/.pm2/logs/frontend-out.log    # stdout của frontend
# ~/.pm2/logs/frontend-error.log  # stderr của frontend
```

### **1.3 - MongoDB Logs:**

```bash
# MongoDB log file:
/var/log/mongodb/mongod.log

# Xem log
sudo tail -100 /var/log/mongodb/mongod.log
```

### **1.4 - Nginx Logs (nếu có Máy C):**

```bash
# Access log (ai truy cập)
/var/log/nginx/access.log
/var/log/nginx/hospital.vn.access.log

# Error log (lỗi)
/var/log/nginx/error.log
/var/log/nginx/hospital.vn.error.log
```

---

## 🔍 PHẦN 2: ĐỌC VÀ TÌM KIẾM LOG

### **2.1 - Commands cơ bản:**

```bash
# Xem 100 dòng cuối của log
tail -100 /var/log/syslog

# Xem log realtime (follow mode)
tail -f /var/log/syslog

# Xem nhiều log cùng lúc
tail -f /var/log/syslog ~/.pm2/logs/backend-error.log

# Xem đầu file
head -50 /var/log/syslog

# Xem toàn bộ file (dùng less để scroll)
less /var/log/syslog
# Trong less:
# - Space: next page
# - b: previous page
# - /keyword: search
# - n: next match
# - q: quit
```

### **2.2 - Tìm kiếm trong log:**

```bash
# Tìm keyword trong log
grep "error" ~/.pm2/logs/backend-error.log

# Tìm không phân biệt hoa thường
grep -i "error" ~/.pm2/logs/backend-error.log

# Tìm và hiển thị context (3 dòng trước, 3 dòng sau)
grep -B3 -A3 "error" ~/.pm2/logs/backend-error.log

# Tìm theo ngày (giả sử format log có date)
grep "2025-02-04" ~/.pm2/logs/backend-out.log

# Tìm nhiều keywords
grep -E "error|failed|exception" ~/.pm2/logs/backend-error.log

# Đếm số lần xuất hiện
grep -c "error" ~/.pm2/logs/backend-error.log
```

### **2.3 - Xem log theo thời gian:**

```bash
# Xem log từ journalctl (systemd services)
journalctl -u mongod --since "1 hour ago"
journalctl -u mongod --since "2025-02-04 08:00:00"
journalctl -u mongod -f  # Follow mode

# Xem log hôm nay
journalctl -u mongod --since today

# Xem log của cloudflared (user service)
journalctl --user -u cloudflared --since "30 min ago"
```

---

## 📊 PHẦN 3: PM2 LOG MANAGEMENT

### **3.1 - Xem PM2 logs:**

```bash
# Xem tất cả logs
pm2 logs

# Xem log của app cụ thể
pm2 logs backend
pm2 logs frontend

# Xem log với số dòng cụ thể
pm2 logs backend --lines 200

# Xem chỉ error logs
pm2 logs backend --err

# Flush (xóa) tất cả logs
pm2 flush

# Flush log của app cụ thể
pm2 flush backend
```

### **3.2 - Cấu hình PM2 log format:**

```bash
# Xem ecosystem file hiện tại
cat ecosystem.config.js
```

```javascript
// ecosystem.config.js - thêm log configuration
module.exports = {
  apps: [
    {
      name: "backend",
      script: "app.js",
      cwd: "/home/username/giaobanbv-be",

      // Log configuration
      error_file: "/home/username/.pm2/logs/backend-error.log",
      out_file: "/home/username/.pm2/logs/backend-out.log",
      log_file: "/home/username/.pm2/logs/backend-combined.log",

      // Log formatting
      time: true, // Thêm timestamp
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Log rotation
      max_size: "10M", // Rotate khi file > 10MB
      retain: 5, // Giữ 5 file cũ
      compress: true, // Nén file cũ

      // Merge stdout và stderr
      merge_logs: false,
    },
    // ... frontend config
  ],
};
```

### **3.3 - PM2 Log Rotate module:**

```bash
# Cài đặt pm2-logrotate
pm2 install pm2-logrotate

# Cấu hình
pm2 set pm2-logrotate:max_size 10M      # Rotate khi > 10MB
pm2 set pm2-logrotate:retain 7          # Giữ 7 files
pm2 set pm2-logrotate:compress true     # Nén file cũ
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # Rotate mỗi ngày lúc 00:00

# Kiểm tra cấu hình
pm2 conf pm2-logrotate
```

---

## 🔄 PHẦN 4: LOG ROTATION (DỌN LOG CŨ)

### **4.1 - Tại sao cần log rotation?**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  VẤN ĐỀ: LOG FILES LỚN DẦN THEO THỜI GIAN                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Tuần 1:  backend.log = 10MB                                              ║
║  Tháng 1: backend.log = 300MB                                             ║
║  Năm 1:   backend.log = 3.6GB ← DISK FULL!                               ║
║                                                                           ║
║  GIẢI PHÁP: LOG ROTATION                                                  ║
║  ────────────────────────                                                 ║
║  • Tự động chia nhỏ log file theo kích thước hoặc thời gian              ║
║  • Nén file cũ (.gz) để tiết kiệm dung lượng                             ║
║  • Tự động xóa file quá cũ                                               ║
║                                                                           ║
║  VÍ DỤ:                                                                   ║
║  backend.log          (file hiện tại)                                     ║
║  backend.log.1.gz     (hôm qua, nén)                                     ║
║  backend.log.2.gz     (2 ngày trước)                                     ║
║  backend.log.3.gz     (3 ngày trước)                                     ║
║  ...tự động xóa file > 7 ngày                                            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### **4.2 - Cấu hình logrotate cho PM2:**

```bash
# Tạo cấu hình logrotate
sudo nano /etc/logrotate.d/pm2-logs
```

```
# PM2 application logs rotation
/home/yourusername/.pm2/logs/*.log {
    daily              # Rotate mỗi ngày
    rotate 7           # Giữ 7 files
    compress           # Nén file cũ (.gz)
    delaycompress      # Delay compress 1 rotation
    missingok          # Không báo lỗi nếu file không tồn tại
    notifempty         # Không rotate nếu file rỗng
    copytruncate       # Copy rồi truncate (tốt cho app đang chạy)
    size 50M           # Rotate nếu file > 50MB
}
```

```bash
# Test cấu hình (dry run)
sudo logrotate -d /etc/logrotate.d/pm2-logs

# Force rotate ngay (để test)
sudo logrotate -f /etc/logrotate.d/pm2-logs

# Kiểm tra kết quả
ls -la ~/.pm2/logs/
```

### **4.3 - Cấu hình logrotate cho MongoDB:**

```bash
# MongoDB đã có sẵn logrotate config
cat /etc/logrotate.d/mongodb

# Nếu chưa có, tạo:
sudo nano /etc/logrotate.d/mongodb
```

```
/var/log/mongodb/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        /bin/kill -SIGUSR1 $(cat /var/run/mongod.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
```

---

## 🐛 PHẦN 5: DEBUG TỪ LOG

### **5.1 - Quy trình debug:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  DEBUG WORKFLOW                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  1. User báo lỗi: "Không login được"                                     ║
║     ↓                                                                     ║
║  2. Xác định thời điểm: "Lúc mấy giờ?"                                   ║
║     ↓                                                                     ║
║  3. Tìm trong backend error log:                                          ║
║     grep "2025-02-04 10:3" ~/.pm2/logs/backend-error.log                 ║
║     ↓                                                                     ║
║  4. Thấy: "MongoError: connection refused"                               ║
║     ↓                                                                     ║
║  5. Check MongoDB:                                                        ║
║     sudo systemctl status mongod → inactive                              ║
║     ↓                                                                     ║
║  6. Fix:                                                                  ║
║     sudo systemctl start mongod                                          ║
║     ↓                                                                     ║
║  7. Verify: Xem log có error mới không                                   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### **5.2 - Các pattern lỗi thường gặp:**

```bash
# 1. Database connection errors
grep -i "mongo" ~/.pm2/logs/backend-error.log
# → MongoNetworkError, MongoTimeoutError

# 2. Memory issues
grep -i "heap\|memory\|ENOMEM" ~/.pm2/logs/backend-error.log

# 3. Authentication errors
grep -i "auth\|unauthorized\|401\|403" ~/.pm2/logs/backend-out.log

# 4. Network errors
grep -i "ECONNREFUSED\|ETIMEDOUT\|ENOTFOUND" ~/.pm2/logs/backend-error.log

# 5. Uncaught exceptions
grep -i "uncaught\|unhandled" ~/.pm2/logs/backend-error.log
```

### **5.3 - Script tìm lỗi nhanh:**

```bash
nano ~/scripts/find-errors.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: find-errors.sh
# Mục đích: Tìm và tổng hợp lỗi từ logs
# ═══════════════════════════════════════════════════════════════════════════

LOG_DIR="$HOME/.pm2/logs"
HOURS_AGO=${1:-1}  # Mặc định 1 giờ, có thể truyền tham số

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  ERROR FINDER - Last ${HOURS_AGO} hour(s)                                 ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Tìm trong error logs
echo "📛 ERRORS FOUND:"
echo "─────────────────────────────────────────────────────────────────────────────"

find $LOG_DIR -name "*error*.log" -mmin -$((HOURS_AGO * 60)) -exec grep -l "" {} \; | while read file; do
    ERRORS=$(tail -100 "$file" | grep -icE "error|exception|failed|critical")
    if [ "$ERRORS" -gt 0 ]; then
        echo ""
        echo "📁 File: $file ($ERRORS errors)"
        echo "   Last 5 errors:"
        grep -iE "error|exception|failed|critical" "$file" | tail -5 | while read line; do
            echo "   → ${line:0:100}..."
        done
    fi
done

echo ""
echo "─────────────────────────────────────────────────────────────────────────────"
echo "💡 Tip: Xem chi tiết: tail -100 ~/.pm2/logs/[app]-error.log"
```

```bash
chmod +x ~/scripts/find-errors.sh

# Sử dụng
~/scripts/find-errors.sh      # Tìm lỗi trong 1 giờ qua
~/scripts/find-errors.sh 24   # Tìm lỗi trong 24 giờ qua
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Biết vị trí các log files:
  □ System: /var/log/
  □ PM2: ~/.pm2/logs/
  □ MongoDB: /var/log/mongodb/
□ Biết cách đọc log (tail, grep, less)
□ Đã cấu hình PM2 logrotate
□ Đã tạo script ~/scripts/find-errors.sh
□ Đã test tìm error trong log

📌 COMMANDS THƯỜNG DÙNG:
─────────────────────────────
pm2 logs                      # Xem PM2 logs
pm2 logs backend --err        # Xem chỉ errors
tail -f ~/.pm2/logs/backend-error.log  # Follow error log
grep "error" file.log         # Tìm error
journalctl -u mongod -f       # MongoDB log
~/scripts/find-errors.sh      # Tìm lỗi nhanh
```

---

## 🔗 LIÊN KẾT

| Trước                                              | Tiếp theo                                    |
| -------------------------------------------------- | -------------------------------------------- |
| [18-SYSTEM-MONITORING.md](18-SYSTEM-MONITORING.md) | [20-PM2-MONITORING.md](20-PM2-MONITORING.md) |
