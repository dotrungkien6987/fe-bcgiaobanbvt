# 📘 PHẦN 20: PM2 MONITORING - GIÁM SÁT ỨNG DỤNG NODE.JS

> **📌 MỤC ĐÍCH:**
>
> Sau phần này bạn sẽ biết:
>
> - Giám sát chi tiết các process PM2
> - Theo dõi CPU, Memory của từng app
> - Thiết lập auto-restart và recovery
> - PM2 Dashboard và Keymetrics (optional)

---

## 🎯 PM2 MONITORING OVERVIEW

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PM2 = Process Manager 2                                                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  PM2 không chỉ chạy app, mà còn:                                         ║
║  ✅ Monitor CPU/Memory của từng app                                       ║
║  ✅ Auto-restart khi app crash                                            ║
║  ✅ Load balancing (cluster mode)                                         ║
║  ✅ Zero-downtime reload                                                  ║
║  ✅ Log management                                                        ║
║  ✅ Startup scripts (chạy khi boot)                                       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 📊 PHẦN 1: COMMANDS MONITORING CƠ BẢN

### **1.1 - Xem danh sách apps:**

```bash
pm2 list
# hoặc
pm2 ls
pm2 status

# Output:
# ┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
# │ id  │ name         │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
# ├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
# │ 0   │ backend      │ default     │ 1.0.0   │ fork    │ 12345    │ 2D     │ 0    │ online    │ 0.1%     │ 150.0mb  │ user     │ disabled │
# │ 1   │ frontend     │ default     │ 1.0.0   │ fork    │ 12346    │ 2D     │ 0    │ online    │ 0.0%     │ 80.0mb   │ user     │ disabled │
# └─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

# Giải thích columns:
# - id: Process ID trong PM2
# - name: Tên app
# - mode: fork (1 instance) hoặc cluster (nhiều instances)
# - pid: Linux Process ID
# - uptime: Thời gian đã chạy
# - ↺: Số lần restart
# - status: online, stopping, stopped, errored
# - cpu: CPU usage hiện tại
# - mem: Memory usage hiện tại
```

### **1.2 - Xem chi tiết một app:**

```bash
pm2 show backend
# hoặc
pm2 describe backend
pm2 info backend

# Output chi tiết:
# Describing process with id 0 - name backend
# ┌───────────────────┬──────────────────────────────────────┐
# │ status            │ online                               │
# │ name              │ backend                              │
# │ version           │ 1.0.0                                │
# │ restarts          │ 0                                    │
# │ uptime            │ 2D                                   │
# │ script path       │ /home/user/giaobanbv-be/app.js       │
# │ script args       │ N/A                                  │
# │ error log path    │ /home/user/.pm2/logs/backend-error.log │
# │ out log path      │ /home/user/.pm2/logs/backend-out.log   │
# │ pid path          │ /home/user/.pm2/pids/backend-0.pid     │
# │ interpreter       │ node                                 │
# │ node.js version   │ 20.10.0                              │
# │ node env          │ production                           │
# │ watch & reload    │ ✘                                    │
# │ unstable restarts │ 0                                    │
# │ created at        │ 2025-02-02T10:00:00.000Z             │
# └───────────────────┴──────────────────────────────────────┘
```

### **1.3 - Monitor realtime (dashboard trong terminal):**

```bash
pm2 monit

# Hiển thị:
# ┌─ Process List ─────────────────────────────────────────────────────────┐
# │ ● backend                        Mem:  150 MB    CPU:  0.1 %          │
# │ ● frontend                       Mem:   80 MB    CPU:  0.0 %          │
# ├─ Logs ─────────────────────────────────────────────────────────────────┤
# │ [backend]  Server running on port 8000                                 │
# │ [backend]  MongoDB connected                                           │
# ├─ Custom Metrics ───────────────────────────────────────────────────────┤
# │ Loop delay:        0.5 ms                                              │
# │ Active handles:    15                                                  │
# └────────────────────────────────────────────────────────────────────────┘

# Phím tắt:
# - Up/Down: Chọn process
# - Left/Right: Chuyển panel
# - Enter: Xem logs của process
# - Ctrl+C: Thoát
```

---

## 🔧 PHẦN 2: CẤU HÌNH ECOSYSTEM FILE

### **2.1 - Tạo ecosystem.config.js đầy đủ:**

```bash
nano ~/ecosystem.config.js
```

```javascript
// ecosystem.config.js - Cấu hình PM2 đầy đủ
module.exports = {
  apps: [
    // ═══════════════════════════════════════════════════════════════════
    // BACKEND APP
    // ═══════════════════════════════════════════════════════════════════
    {
      name: "backend",
      script: "app.js",
      cwd: "/home/yourusername/giaobanbv-be",

      // ─────────────────────────────────────────────────────────────────
      // Environment
      // ─────────────────────────────────────────────────────────────────
      node_args: "--max-old-space-size=1024", // Giới hạn RAM 1GB
      env: {
        NODE_ENV: "production",
        PORT: 8000,
      },

      // ─────────────────────────────────────────────────────────────────
      // Restart behavior
      // ─────────────────────────────────────────────────────────────────
      autorestart: true, // Tự restart khi crash
      max_restarts: 10, // Max 10 restarts liên tiếp
      min_uptime: "10s", // App phải chạy ít nhất 10s mới tính stable
      restart_delay: 5000, // Chờ 5s trước khi restart

      // ─────────────────────────────────────────────────────────────────
      // Memory management
      // ─────────────────────────────────────────────────────────────────
      max_memory_restart: "500M", // Restart nếu dùng > 500MB RAM

      // ─────────────────────────────────────────────────────────────────
      // Logs
      // ─────────────────────────────────────────────────────────────────
      error_file: "/home/yourusername/.pm2/logs/backend-error.log",
      out_file: "/home/yourusername/.pm2/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // ─────────────────────────────────────────────────────────────────
      // Watch mode (for development)
      // ─────────────────────────────────────────────────────────────────
      watch: false, // Set true để auto-reload khi file thay đổi
      ignore_watch: ["node_modules", "logs", ".git"],

      // ─────────────────────────────────────────────────────────────────
      // Health check
      // ─────────────────────────────────────────────────────────────────
      exp_backoff_restart_delay: 100, // Exponential backoff

      // ─────────────────────────────────────────────────────────────────
      // Cluster mode (optional - cho high traffic)
      // ─────────────────────────────────────────────────────────────────
      // instances: 'max',         // Số CPU cores
      // exec_mode: 'cluster',     // Cluster mode
    },

    // ═══════════════════════════════════════════════════════════════════
    // FRONTEND APP (React with serve)
    // ═══════════════════════════════════════════════════════════════════
    {
      name: "frontend",
      script: "serve",
      args: "-s build -l 3000",
      cwd: "/home/yourusername/fe-bcgiaobanbvt",

      env: {
        NODE_ENV: "production",
      },

      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "200M",

      error_file: "/home/yourusername/.pm2/logs/frontend-error.log",
      out_file: "/home/yourusername/.pm2/logs/frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
```

### **2.2 - Apply config:**

```bash
# Start/Restart với ecosystem file
pm2 start ecosystem.config.js

# Reload (zero-downtime)
pm2 reload ecosystem.config.js

# Save để startup
pm2 save
```

---

## 📈 PHẦN 3: THEO DÕI METRICS

### **3.1 - Xem metrics realtime:**

```bash
# Metrics cơ bản
pm2 list

# Metrics chi tiết với monit
pm2 monit
```

### **3.2 - Export metrics:**

```bash
# Xem metrics dạng JSON
pm2 jlist

# Xem memory/cpu của tất cả apps
pm2 prettylist

# Metrics của 1 app
pm2 show backend --format json
```

### **3.3 - Script giám sát metrics:**

```bash
nano ~/scripts/pm2-metrics.sh
```

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Script: pm2-metrics.sh
# Mục đích: Hiển thị metrics của PM2 apps
# ═══════════════════════════════════════════════════════════════════════════

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  PM2 METRICS - $(date '+%Y-%m-%d %H:%M:%S')                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Lấy danh sách apps
pm2 jlist 2>/dev/null | jq -r '.[] | "\(.name)|\(.pm2_env.status)|\(.monit.memory)|\(.monit.cpu)|\(.pm2_env.restart_time)"' | while IFS='|' read name status memory cpu restarts; do
    # Convert memory to MB
    memory_mb=$(echo "scale=1; $memory / 1024 / 1024" | bc 2>/dev/null || echo "N/A")

    # Status emoji
    if [ "$status" = "online" ]; then
        status_icon="✅"
    else
        status_icon="❌"
    fi

    echo "📦 $name"
    echo "   Status: $status_icon $status"
    echo "   Memory: ${memory_mb}MB"
    echo "   CPU: ${cpu}%"
    echo "   Restarts: $restarts"
    echo ""
done

# Total memory
echo "─────────────────────────────────────────────────────────────────────────────"
TOTAL_MEM=$(pm2 jlist 2>/dev/null | jq '[.[] | .monit.memory] | add / 1024 / 1024' | cut -d. -f1)
echo "📊 Total PM2 Memory: ${TOTAL_MEM}MB"
```

```bash
chmod +x ~/scripts/pm2-metrics.sh

# Cài jq nếu chưa có
sudo apt install -y jq bc
```

---

## 🔄 PHẦN 4: AUTO-RESTART VÀ RECOVERY

### **4.1 - Các điều kiện restart:**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PM2 SẼ TỰ ĐỘNG RESTART KHI:                                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  1. App crash (exit code ≠ 0)                                            ║
║  2. Memory vượt max_memory_restart                                        ║
║  3. File thay đổi (nếu watch: true)                                      ║
║  4. Manual restart (pm2 restart)                                          ║
║  5. System reboot (nếu có startup script)                                ║
║                                                                           ║
║  GIỚI HẠN:                                                                ║
║  • max_restarts: Số restart tối đa liên tiếp                             ║
║  • min_uptime: App phải chạy đủ lâu mới tính là stable                   ║
║  • restart_delay: Thời gian chờ giữa các restart                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### **4.2 - Kiểm tra restart history:**

```bash
# Xem app đã restart bao nhiêu lần
pm2 show backend | grep restart

# Xem trong list
pm2 list  # Cột ↺ là số restarts

# Reset restart count
pm2 reset backend
pm2 reset all
```

### **4.3 - Setup startup script:**

```bash
# Tạo startup script (chạy PM2 khi boot)
pm2 startup

# Output:
# [PM2] To setup the Startup Script, copy/paste the following command:
# sudo env PATH=$PATH:/home/yourusername/.nvm/versions/node/v20.10.0/bin pm2 startup systemd -u yourusername --hp /home/yourusername

# Copy và chạy command đó
sudo env PATH=$PATH:/home/yourusername/.nvm/versions/node/v20.10.0/bin pm2 startup systemd -u yourusername --hp /home/yourusername

# Save current process list
pm2 save

# Verify
pm2 list
```

### **4.4 - Test startup:**

```bash
# Reboot server
sudo reboot

# Sau khi khởi động lại, SSH vào và kiểm tra
pm2 list
# → Apps phải đang online
```

---

## 🌐 PHẦN 5: PM2 WEB DASHBOARD (OPTIONAL)

### **5.1 - PM2 Plus (Cloud monitoring):**

```bash
# Đăng ký tài khoản miễn phí tại:
# https://app.pm2.io/

# Link PM2 với account
pm2 link <secret_key> <public_key>

# Hoặc đăng nhập
pm2 login

# Sau đó xem dashboard tại:
# https://app.pm2.io/
```

### **5.2 - Self-hosted dashboard với pm2-web:**

```bash
# Cài pm2-web
npm install -g pm2-webui

# Chạy dashboard
pm2-webui

# Mở browser: http://192.168.1.243:9615
```

---

## 🛠️ PHẦN 6: COMMANDS THƯỜNG DÙNG

### **6.1 - Process management:**

```bash
# Start
pm2 start ecosystem.config.js
pm2 start app.js --name myapp

# Stop
pm2 stop backend
pm2 stop all

# Restart
pm2 restart backend
pm2 restart all

# Reload (zero-downtime - chỉ cluster mode)
pm2 reload backend

# Delete
pm2 delete backend
pm2 delete all
```

### **6.2 - Monitoring:**

```bash
pm2 list                # Danh sách apps
pm2 show backend        # Chi tiết app
pm2 monit               # Dashboard terminal
pm2 logs                # Xem logs
pm2 logs backend        # Logs của 1 app
pm2 logs --lines 200    # 200 dòng cuối
```

### **6.3 - Troubleshooting:**

```bash
# Xem tại sao app crash
pm2 show backend        # Check error log path
cat ~/.pm2/logs/backend-error.log | tail -50

# Flush logs
pm2 flush

# Reset restart count
pm2 reset all

# Reload PM2 daemon
pm2 update
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Biết các commands monitoring cơ bản
  □ pm2 list
  □ pm2 show
  □ pm2 monit
  □ pm2 logs
□ Đã tạo ecosystem.config.js đầy đủ
□ Đã cấu hình auto-restart (max_memory_restart, etc.)
□ Đã setup startup script (pm2 startup)
□ Đã test restart khi reboot
□ Đã tạo script ~/scripts/pm2-metrics.sh

📌 COMMANDS THƯỜNG DÙNG:
─────────────────────────────
pm2 list                      # Danh sách apps
pm2 monit                     # Monitor realtime
pm2 logs backend --err        # Error logs
pm2 restart backend           # Restart app
pm2 show backend              # Chi tiết app
pm2 save                      # Lưu process list
```

---

## 🔗 LIÊN KẾT

| Trước                                            | Tiếp theo                              |
| ------------------------------------------------ | -------------------------------------- |
| [19-APPLICATION-LOGS.md](19-APPLICATION-LOGS.md) | [21-SETUP-MAY-C.md](21-SETUP-MAY-C.md) |
