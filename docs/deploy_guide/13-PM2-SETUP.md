# 📘 PHẦN 13: PM2 ADVANCED SETUP

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:   
- ✅ Hiểu PM2 features nâng cao
- ✅ Setup monitoring dashboard
- ✅ Configure auto-restart strategies
- ✅ Setup log rotation
- ✅ Performance tuning
- ✅ Cluster mode (nếu cần)

---

## 📊 PM2 LÀ GÌ?  (REVIEW)

```
PM2 = Process Manager 2
    = Quản lý Node.js applications
    = Auto-restart, monitoring, logging

╔═══════════════════════════════════════════════════════════╗
║  Không có PM2:                                             ║
╠═══════════════════════════════════════════════════════════╣
║  • node server.js                                         ║
║  • Nếu crash → Stop, không tự động restart ❌             ║
║  • Nếu server reboot → Không tự động chạy ❌              ║
║  • Không có monitoring                                    ║
║  • Logs không organized                                   ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  Với PM2:                                                  ║
╠═══════════════════════════════════════════════════════════╣
║  • pm2 start app                                          ║
║  • Auto-restart nếu crash ✅                              ║
║  • Auto-start sau reboot ✅                               ║
║  • Built-in monitoring ✅                                 ║
║  • Log rotation ✅                                        ║
║  • Load balancing (cluster mode) ✅                       ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 BƯỚC 1: REVIEW CURRENT STATUS

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Check PM2 status
pm2 status

# Output:
# ┌─────┬─────────────┬─────────────┬─────────┬─────────┬──────────┐
# │ id  │ name        │ mode        │ ↺       │ status  │ cpu      │
# ├─────┼─────────────┼─────────────┼─────────┼─────────┼──────────┤
# │ 0   │ backend     │ fork        │ 0       │ online  │ 0.5%     │
# │ 1   │ frontend    │ fork        │ 0       │ online  │ 0.2%     │
# └─────┴─────────────┴─────────────┴─────────┴─────────┴──────────┘

# Giải thích columns:
# id     = Process ID trong PM2
# name   = App name
# mode   = fork (single instance) hoặc cluster (multiple)
# ↺      = Số lần restart
# status = online, stopped, errored
# cpu    = CPU usage
# memory = RAM usage
```

---

## 🔍 BƯỚC 2: PM2 MONITORING

### **2.1 - Realtime monitoring:**

```bash
# Monitor dashboard (interactive)
pm2 monit

# Interface: 
# ┌─────────────────────────────────────────────────────────┐
# │ backend [0]                  │  frontend [1]            │
# │ CPU:  ▓░░░░░░░ 5%             │  CPU: ▓░░░░░░░ 2%        │
# │ MEM: ▓▓░░░░░░ 45MB           │  MEM: ▓░░░░░░░ 28MB      │
# │                              │                          │
# │ Logs:                         │  Logs:                   │
# │ Server running on port 8000  │  Serving on port 3000    │
# │ MongoDB connected            │                          │
# └─────────────────────────────────────────────────────────┘

# Nhấn q để thoát
```

### **2.2 - Process details:**

```bash
# Chi tiết 1 process
pm2 describe backend

# Output:
# Describing process with id 0 - name backend
# ┌───────────────────┬──────────────────────────────────────┐
# │ status            │ online                               │
# │ name              │ backend                              │
# │ restarts          │ 0                                    │
# │ uptime            │ 2h                                   │
# │ script path       │ /home/user/projects/backend/server.js│
# │ script args       │ N/A                                  │
# │ error log path    │ /home/user/projects/backend/logs/...  │
# │ out log path      │ /home/user/projects/backend/logs/... │
# │ pid path          │ /home/user/.  pm2/pids/backend-0.pid  │
# │ interpreter       │ node                                 │
# │ interpreter args  │ N/A                                  │
# │ exec cwd          │ /home/user/projects/backend         │
# │ exec mode         │ fork_mode                            │
# │ node. js version   │ 20.10.0                              │
# │ watch & reload    │ ✘                                    │
# │ unstable restarts │ 0                                    │
# │ created at        │ 2025-12-26T12:00:00.000Z             │
# └───────────────────┴──────────────────────────────────────┘
```

---

## 📝 BƯỚC 3: LOG MANAGEMENT

### **3.1 - View logs:**

```bash
# Realtime logs (tất cả apps)
pm2 logs

# Logs của app cụ thể
pm2 logs backend

# Last 100 lines
pm2 logs backend --lines 100

# Error logs only
pm2 logs backend --err

# Output logs only
pm2 logs backend --out

# JSON format
pm2 logs backend --json

# Disable log streaming
pm2 logs --nostream

# Clear logs
pm2 flush

# Clear logs của app cụ thể
pm2 flush backend
```

### **3.2 - Log rotation (QUAN TRỌNG!):**

```bash
# Cài PM2 log rotate module
pm2 install pm2-logrotate

# Output:
# [PM2] Module pm2-logrotate installed

# Configure rotation
pm2 set pm2-logrotate: max_size 10M        # Max 10MB per file
pm2 set pm2-logrotate:retain 30           # Giữ 30 files
pm2 set pm2-logrotate:compress true       # Nén logs cũ
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # Daily at midnight

# Verify config
pm2 conf pm2-logrotate

# Output:
# Module:  pm2-logrotate
# max_size: 10M
# retain: 30
# compress: true
# rotateInterval:   0 0 * * *
```

---

## 🔄 BƯỚC 4: AUTO-RESTART STRATEGIES

### **4.1 - Restart on file changes (Development):**

```bash
# Edit ecosystem file
cd ~/projects/backend
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'backend',
    script: './server.js',
    
    // Watch mode (CHỈ DÙNG KHI DEV)
    watch: true,  // Enable watch
    ignore_watch: [
      'node_modules',
      'logs',
      '. git',
      '*.log'
    ],
    watch_options: {
      followSymlinks: false,
      usePolling: false
    },
    
    // ...  other configs
  }]
};
```

```bash
# Restart với config mới
pm2 restart backend --update-env

# ⚠️ Tắt watch khi production: 
# watch: false
```

### **4.2 - Restart on memory limit:**

```javascript
// ecosystem.config.js

module.exports = {
  apps: [{
    name: 'backend',
    script: './server.js',
    
    // Memory limit
    max_memory_restart: '500M',  // Restart nếu vượt 500MB
    
    // ...  
  }]
};
```

### **4.3 - Cron-based restart:**

```bash
# Restart backend mỗi ngày lúc 3 AM
pm2 restart backend --cron "0 3 * * *"

# Xem cron jobs
pm2 ls

# Output sẽ có thêm column "cron restart"
```

### **4.4 - Exponential backoff restart:**

```javascript
// ecosystem.config.js

module.exports = {
  apps: [{
    name: 'backend',
    script: './server.js',
    
    // Restart behavior
    autorestart: true,
    max_restarts: 10,              // Max 10 restarts trong... 
    min_uptime: '10s',             // ... 10 giây
    exp_backoff_restart_delay: 100, // Exponential delay
    
    // Nếu app crash nhiều lần liên tiếp: 
    // Restart 1:   Ngay lập tức
    // Restart 2: Đợi 100ms
    // Restart 3: Đợi 200ms
    // Restart 4: Đợi 400ms
    // ...
    // Restart 10: Stop restart (vượt quá max_restarts)
  }]
};
```

---

## ⚡ BƯỚC 5: CLUSTER MODE (LOAD BALANCING)

### **Khi nào dùng Cluster Mode? **

```
╔═══════════════════════════════════════════════════════════╗
║  FORK MODE (hiện tại):                                     ║
╠═══════════════════════════════════════════════════════════╣
║  • 1 process duy nhất                                     ║
║  • Dùng 1 CPU core                                        ║
║  • OK cho ≤500 concurrent users                            ║
║  • Simple, dễ debug                                       ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  CLUSTER MODE:                                              ║
╠═══════════════════════════════════════════════════════════╣
║  • Nhiều processes (1 per CPU core)                       ║
║  • Tận dụng tất cả CPU cores                              ║
║  • Load balancing tự động                                 ║
║  • OK cho >1000 concurrent users                           ║
║  • Zero-downtime reload                                   ║
║                                                           ║
║  Server 8 cores → 8 backend processes                     ║
╚═══════════════════════════════════════════════════════════╝
```

### **5.1 - Enable cluster mode:**

```bash
# Edit backend ecosystem file
cd ~/projects/backend
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'backend',
    script: './server.js',
    
    // Cluster mode
    instances: 'max',  // 1 instance per CPU core
    // Hoặc số cụ thể:   instances: 4
    
    exec_mode: 'cluster',  // Đổi từ 'fork' sang 'cluster'
    
    // Cluster-specific
    wait_ready: true,      // Đợi app emit 'ready' signal
    listen_timeout: 10000,  // Timeout 10s
    kill_timeout: 5000,    // Grace period trước khi force kill
    
    // ...  other configs
  }]
};
```

```bash
# Restart với cluster mode
pm2 reload backend

# Check status
pm2 status

# Output:
# ┌─────┬─────────────┬─────────────┬─────────┬─────────┐
# │ id  │ name        │ mode        │ ↺       │ status  │
# ├─────┼─────────────┼─────────────┼─────────┼─────────┤
# │ 0   │ backend     │ cluster     │ 0       │ online  │
# │ 1   │ backend     │ cluster     │ 0       │ online  │
# │ 2   │ backend     │ cluster     │ 0       │ online  │
# │ 3   │ backend     │ cluster     │ 0       │ online  │
# │ 4   │ backend     │ cluster     │ 0       │ online  │
# │ 5   │ backend     │ cluster     │ 0       │ online  │
# │ 6   │ backend     │ cluster     │ 0       │ online  │
# │ 7   │ backend     │ cluster     │ 0       │ online  │
# │ 8   │ frontend    │ fork        │ 0       │ online  │
# └─────┴─────────────┴─────────────┴─────────┴─────────┘
#        ↑ 8 instances của backend (8 CPU cores)
```

### **5.2 - Zero-downtime reload:**

```bash
# Reload app (không có downtime)
pm2 reload backend

# PM2 sẽ: 
# 1. Start instance mới
# 2. Đợi instance mới ready
# 3. Stop instance cũ
# 4. Lặp lại cho tất cả instances

# Khác với restart (có downtime ngắn):
pm2 restart backend
```

### **5.3 - Scale up/down:**

```bash
# Tăng lên 10 instances
pm2 scale backend 10

# Giảm xuống 4 instances
pm2 scale backend 4

# Check
pm2 status
```

---

## 📊 BƯỚC 6: PERFORMANCE TUNING

### **6.1 - Node.js memory settings:**

```javascript
// ecosystem.config.js

module.exports = {
  apps: [{
    name: 'backend',
    script: './server.js',
    
    // Node.js options
    node_args: [
      '--max-old-space-size=2048',  // Max heap size:  2GB
      '--max-http-header-size=16384' // Max HTTP header:  16KB
    ],
    
    // ... 
  }]
};
```

### **6.2 - Environment-specific configs:**

```javascript
// ecosystem.config.js

module.exports = {
  apps: [{
    name: 'backend',
    script: './server.js',
    
    // Production env
    env_production: {
      NODE_ENV: 'production',
      PORT: 8000,
      LOG_LEVEL: 'info'
    },
    
    // Development env
    env_development:  {
      NODE_ENV: 'development',
      PORT: 8000,
      LOG_LEVEL: 'debug'
    }
  }]
};

// Start với env cụ thể: 
// pm2 start ecosystem.config. js --env production
// pm2 start ecosystem.config. js --env development
```

---

## 🔔 BƯỚC 7: NOTIFICATIONS (OPTIONAL)

### **7.1 - Email notifications khi crash:**

```bash
# Cài module
pm2 install pm2-email

# Configure
pm2 set pm2-email:smtp_host smtp. gmail.com
pm2 set pm2-email:smtp_port 587
pm2 set pm2-email:smtp_user your-email@gmail.com
pm2 set pm2-email:smtp_password your-app-password
pm2 set pm2-email:to recipient@example.com

# Test
pm2 trigger pm2-email test
```

### **7.2 - Slack notifications:**

```bash
# Cài module
pm2 install pm2-slack

# Configure (cần Slack webhook URL)
pm2 set pm2-slack:slack_url https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Test
pm2 trigger pm2-slack test
```

---

## 🛠️ BƯỚC 8: PM2 COMMANDS REFERENCE

```bash
# ═══════════════════════════════════════════════════════════
# Process Management
# ═══════════════════════════════════════════════════════════

pm2 start app.js                # Start
pm2 start ecosystem.config.js   # Start với config file
pm2 restart app_name            # Restart (với downtime)
pm2 reload app_name             # Reload (zero downtime)
pm2 stop app_name               # Stop
pm2 delete app_name             # Delete khỏi PM2

pm2 restart all                 # Restart tất cả
pm2 stop all                    # Stop tất cả
pm2 delete all                  # Delete tất cả

# ═══════════════════════════════════════════════════════════
# Monitoring
# ═══════════════════════════════════════════════════════════

pm2 status                      # List apps
pm2 list                        # Alias của status
pm2 ls                          # Alias của status

pm2 monit                       # Realtime monitoring
pm2 describe app_name           # Chi tiết app

# ═══════════════════════════════════════════════════════════
# Logs
# ═══════════════════════════════════════════════════════════

pm2 logs                        # Tất cả logs
pm2 logs app_name               # Logs của app
pm2 logs --lines 100            # Last 100 lines
pm2 logs --json                 # JSON format
pm2 logs --err                  # Error logs only
pm2 logs --out                  # Output logs only

pm2 flush                       # Clear tất cả logs
pm2 flush app_name              # Clear logs của app

# ═══════════════════════════════════════════════════════════
# Cluster
# ═══════════════════════════════════════════════════════════

pm2 scale app_name 4            # Scale to 4 instances
pm2 scale app_name +2           # Add 2 instances
pm2 scale app_name -1           # Remove 1 instance

# ═══════════════════════════════════════════════════════════
# Startup
# ═══════════════════════════════════════════════════════════

pm2 startup                     # Generate startup script
pm2 save                        # Save process list
pm2 resurrect                   # Restore saved processes
pm2 unstartup                   # Remove startup script

# ═══════════════════════════════════════════════════════════
# Update
# ═══════════════════════════════════════════════════════════

pm2 update                      # Update PM2
npm install -g pm2@latest       # Update to latest
pm2 save --force                # Force save after update

# ═══════════════════════════════════════════════════════════
# Advanced
# ═══════════════════════════════════════════════════════════

pm2 sendSignal SIGUSR2 app_name # Send signal
pm2 ping                        # Ping PM2 daemon
pm2 reset app_name              # Reset restart counter
pm2 updatePM2                   # Update PM2 in-memory
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ PM2 đang chạy backend và frontend
□ Đã xem pm2 status và pm2 monit
□ Đã setup log rotation (pm2-logrotate)
□ Đã configure auto-restart strategies
□ Đã test pm2 logs
□ Ecosystem files đã optimize
□ Startup script đã enable (pm2 startup)
□ PM2 saved (pm2 save)
□ Đã test reboot (optional):
  sudo reboot
  → Sau khi boot:  pm2 status → Apps tự động chạy ✅

CLUSTER MODE (nếu enable):
□ Backend chạy cluster mode (8 instances)
□ pm2 reload hoạt động (zero-downtime)
□ pm2 scale hoạt động

MONITORING:
□ Biết xem pm2 monit
□ Biết xem pm2 logs
□ Logs rotate tự động
□ Logs không chiếm quá nhiều disk

PM2 STATUS:
pm2 status

→ Tất cả apps:  online ✅
→ Uptime: > 0
→ Restarts: 0 (hoặc thấp)

→ Sẵn sàng setup Environment Variables management! 
→ Chuyển sang File 14-ENV-VARIABLES.md
```

---

**⏭️ TIẾP THEO: File 14-ENV-VARIABLES. md**