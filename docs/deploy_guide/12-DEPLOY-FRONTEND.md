# 📘 PHẦN 12: DEPLOY FRONTEND (REACT)

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Clone code frontend từ repository
- ✅ Cấu hình environment variables
- ✅ Build production bundle
- ✅ Serve với HTTP server
- ✅ Setup PM2 cho frontend
- ✅ Test PWA functionality

---

## 📂 BƯỚC 1: CLONE FRONTEND CODE

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Vào thư mục projects
cd ~/projects

# Clone frontend repository
git clone https://github.com/yourusername/your-frontend-repo.git frontend

# Hoặc upload từ local (như backend)
# scp frontend. zip youruser@192.168.1.243:~/projects/
# cd ~/projects && unzip frontend.zip -d frontend

# Vào thư mục
cd frontend

# Check cấu trúc
ls -la
```

### **Cấu trúc frontend (CRA - Create React App):**

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── robots.txt
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── service-worker.js  (nếu có)
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
├── package.json
├── .env. example
└── README.md
```

---

## 📦 BƯỚC 2: CÀI ĐẶT DEPENDENCIES

```bash
# Trong thư mục frontend
cd ~/projects/frontend

# Cài dependencies
npm install

# Output:
# added 1456 packages in 45s
#
# 45 packages are looking for funding
# found 0 vulnerabilities

# Fix vulnerabilities nếu có
npm audit fix

# Check node_modules
du -sh node_modules/
# Output:  ~300-500MB
```

---

## ⚙️ BƯỚC 3: CẤU HÌNH ENVIRONMENT VARIABLES

### **3.1 - Copy .env.example:**

```bash
# Xem file example
cat .env.example

# Output (ví dụ):
# REACT_APP_API_URL=https://api.example.com
# REACT_APP_WS_URL=wss://api.example.com
# REACT_APP_ENV=production
# ...

# Copy
cp .env.example .env
```

### **3.2 - Edit .env:**

```bash
nano .env
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: .env
# ──────────────────────────────────────────────────────────

# Environment
REACT_APP_ENV=production

# API URLs
REACT_APP_API_URL=https://api.hospital.vn
REACT_APP_WS_URL=wss://api.hospital.vn

# App Info
REACT_APP_NAME=Hospital Ticket System
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_PWA=true                 # ✅ Đang hoạt động
REACT_APP_ENABLE_NOTIFICATIONS=true       # ✅ Socket.IO in-app notifications
ENABLE_PUSH_NOTIFICATIONS=false            # ⏳ Phase 2: FCM chưa triển khai
ENABLE_OFFLINE_MODE=false                  # ⏳ Phase 2: Offline mode chưa triển khai

# Firebase — Phase 2 (CHƯA triển khai, xem File 16-FCM-SETUP.md)
# Chỉ uncomment khi đã tạo Firebase project và có credentials
# REACT_APP_FIREBASE_API_KEY=
# REACT_APP_FIREBASE_AUTH_DOMAIN=
# REACT_APP_FIREBASE_PROJECT_ID=
# REACT_APP_FIREBASE_STORAGE_BUCKET=
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
# REACT_APP_FIREBASE_APP_ID=
# REACT_APP_FIREBASE_VAPID_KEY=

# Analytics (optional)
# REACT_APP_GA_TRACKING_ID=

# ──────────────────────────────────────────────────────────
```

```bash
# Save:  Ctrl+O → Enter → Ctrl+X

# Set permissions
chmod 600 .env
```

---

## 🔨 BƯỚC 4: BUILD PRODUCTION

### **4.1 - Build:**

```bash
# Build production bundle
npm run build

# Output:
# Creating an optimized production build...
# Compiled successfully!
#
# File sizes after gzip:
#
#   100.23 kB  build/static/js/main.abc123.js
#   15.45 kB   build/static/css/main.def456.css
#
# The build folder is ready to be deployed.

# Kiểm tra build folder
ls -la build/

# Output:
# drwxr-xr-x  static/
# -rw-r--r--  index.html
# -rw-r--r--  manifest.json
# -rw-r--r--  robots.txt
# -rw-r--r--  asset-manifest.json
# ...

# Check size
du -sh build/
# Output:  ~2-5MB
```

### **4.2 - Verify build files:**

```bash
# Check index.html
cat build/index. html | head -20

# Check manifest.json
cat build/manifest.json

# Output:
# {
#   "short_name": "BC Bệnh viện",
#   "name": "Báo cáo Giaoban - Bệnh viện Đa khoa Tỉnh Phú Thọ",
#   "description": "Hệ thống quản lý công việc và KPI cho cán bộ y tế",
#   "icons": [
#     { "src": "logoBVTPT.png", "sizes": "192x192", ... },
#     { "src": "logoBVTPT.png", "sizes": "512x512", ... },
#     ... (+ favicon.ico, logo64, logo128, logo256)
#   ],
#   "start_url": ".",
#   "display": "standalone",
#   "theme_color": "#1976d2",
#   "background_color": "#ffffff",
#   "lang": "vi-VN",
#   "gcm_sender_id": "103953800507"
# }
```

---

## 🌐 BƯỚC 5: SERVE VỚI HTTP SERVER

### **5.1 - Cài serve package:**

```bash
# Cài globally
npm install -g serve

# Verify
serve --version
```

### **5.2 - Test serve locally:**

```bash
# Serve build folder trên port 3000
serve -s build -l 3000

# Output:
# ┌────────────────────────────────────────┐
# │                                        │
# │   Serving!                              │
# │                                        │
# │   Local:    http://localhost:3000       │
# │                                        │
# │   Copied local address to clipboard!   │
# │                                        │
# └────────────────────────────────────────┘

# GIỮ TERMINAL NÀY MỞ!

# Mở terminal mới, test
curl -I http://localhost:3000

# Output:
# HTTP/1.1 200 OK
# Content-Type: text/html
# ...

# Ctrl+C để stop serve
```

---

## 🚀 BƯỚC 6: SETUP PM2 CHO FRONTEND

### **6.1 - Tạo PM2 ecosystem file:**

```bash
# Trong thư mục frontend
cd ~/projects/frontend

nano ecosystem.config.js
```

```javascript
// ──────────────────────────────────────────────────────────
// FILE: ecosystem.config.js
// ──────────────────────────────────────────────────────────

module.exports = {
  apps: [
    {
      name: "frontend",
      script: "serve",
      args: "-s build -l 3000",

      // Environment
      env: {
        NODE_ENV: "production",
        PM2_SERVE_PATH: "./build",
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: "true",
      },

      // Instances
      instances: 1,
      exec_mode: "fork",

      // Logs
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm: ss Z",

      // Restart behavior
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
    },
  ],
};

// ──────────────────────────────────────────────────────────
```

```bash
# Save:  Ctrl+O → Enter → Ctrl+X

# Tạo logs folder
mkdir -p logs
```

### **6.2 - Start với PM2:**

```bash
# Start frontend
pm2 start ecosystem.config.js

# Output:
# [PM2] Starting ecosystem. config.js in fork_mode
# [PM2] Done.
# ┌─────┬─────────────┬─────────────┬─────────┬─────────┐
# │ id  │ name        │ mode        │ ↺       │ status  │
# ├─────┼─────────────┼─────────────┼─────────┼─────────┤
# │ 0   │ backend     │ fork        │ 0       │ online  │
# │ 1   │ frontend    │ fork        │ 0       │ online  │
# └─────┴─────────────┴─────────────┴─────────┴─────────┘

# Verify
pm2 status

# Check logs
pm2 logs frontend --lines 50

# Output:
# Serving!
# Local:   http://localhost:3000
```

### **6.3 - Save PM2 state:**

```bash
# Save process list
pm2 save

# Output:
# [PM2] Saving current process list...
# [PM2] Successfully saved
```

---

## 🧪 BƯỚC 7: TEST FRONTEND

### **7.1 - Test local:**

```bash
# Test homepage
curl -I http://localhost:3000

# Output:
# HTTP/1.1 200 OK
# Content-Type: text/html

# Test static files
curl -I http://localhost:3000/static/js/main.abc123.js

# Output:
# HTTP/1.1 200 OK
# Content-Type: application/javascript
```

### **7.2 - Test từ bên ngoài:**

#### 🔵 Phase 1 — Qua Cloudflare Tunnel:

```bash
curl -I https://hospital.vn

# Output:
# HTTP/2 200
# content-type: text/html
# server: cloudflare        ← Header từ CF

# Mở browser → https://hospital.vn → App load ✅
```

#### 🟢 Phase 2 — Qua Nginx (Máy C: 192.168.1.250):

```bash
# Từ Máy C, test trực tiếp đến Máy A:
curl -I http://192.168.1.243:3000
# → HTTP/1.1 200 OK → Firewall OK ✅

# Từ bên ngoài, test qua Nginx:
curl -I https://hospital.vn

# Output:
# HTTP/2 200
# content-type: text/html
# server: nginx              ← Header từ Nginx

# Mở browser → https://hospital.vn → App load ✅
```

### **7.3 - Test API connection:**

```bash
# Mở browser DevTools (F12)
# Console tab

// Test API call
fetch('https://api.hospital.vn/api/health')
  .then(r => r.json())
  .then(d => console.log(d))

// Output:
// {status: "OK", timestamp: "2025-12-26T12:30:00.000Z"}

// → Frontend có thể connect backend ✅
```

---

## 📱 BƯỚC 8: VERIFY PWA

### **8.1 - Check manifest:**

```bash
# Browser → Truy cập https://hospital.vn
# DevTools (F12) → Application tab → Manifest

Kiểm tra:
✅ Name:             Báo cáo Giaoban - Bệnh viện Đa khoa Tỉnh Phú Thọ
✅ Short name:       BC Bệnh viện
✅ Start URL:        .
✅ Display:          standalone
✅ Theme color:      #1976d2
✅ Background color: #ffffff
✅ Icons:            192x192, 512x512 (logoBVTPT.png)
✅ Language:         vi-VN
```

### **8.2 - Check Service Worker:**

```bash
# DevTools → Application → Service Workers

# Service Worker đã có sẵn trong source code:
✅ Status:  Activated and running
✅ Source:  service-worker.js
✅ Cache:   hospital-pwa-v0.1.0

# Application → Cache Storage
✅ Cached: /, /index.html, /manifest.json, icons...

# ⚠️ SW chỉ hoạt động trong production mode (npm run build)
# → Không chạy trong npm start (development)
# → Chi tiết: File 15-SERVICE-WORKER.md
```

### **8.3 - Test install prompt:**

```bash
# Desktop Chrome:
# → URL bar phải có icon install (⊕ hoặc 🖥️)
# → Click để install

# Mobile:
# → Menu → "Add to Home Screen"
# → Thử install

# Nếu không thấy install prompt:
# → Kiểm tra manifest.json
# → Kiểm tra HTTPS (phải có ổ khóa)
# → Xem Console có error không
```

---

## 🔄 BƯỚC 9: REBUILD KHI CÓ CODE MỚI

### **Script tự động rebuild:**

```bash
# Tạo deploy script
nano ~/deploy-frontend.sh
```

```bash
#!/bin/bash
# ──────────────────────────────────────────────────────────
# FILE: deploy-frontend.sh
# ──────────────────────────────────────────────────────────

echo "🚀 Deploying Frontend..."

# Navigate to frontend directory
cd ~/projects/frontend || exit 1

# Pull latest code (nếu dùng Git)
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies (nếu có mới)
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building production bundle..."
npm run build

# Restart PM2
echo "🔄 Restarting frontend..."
pm2 restart frontend

# Status
pm2 status

echo "✅ Frontend deployed!"
echo "🌐 Check: https://hospital.vn"

# ──────────────────────────────────────────────────────────
```

```bash
# Save và make executable
chmod +x ~/deploy-frontend.sh

# Sử dụng:
~/deploy-frontend.sh
```

---

## 🛠️ TROUBLESHOOTING

### **Frontend không load (blank page):**

```bash
# 1. Check PM2 status
pm2 status

# Nếu frontend errored hoặc stopped:
pm2 logs frontend

# 2. Check build folder
ls -la ~/projects/frontend/build/

# Nếu không có build/ folder:
cd ~/projects/frontend
npm run build
pm2 restart frontend

# 3. Check serve đang chạy đúng port
curl http://localhost:3000

# 4. Check routing:
# 🔵 CF Tunnel: Dashboard → Public hostname → hospital.vn → localhost:3000
# 🟢 Nginx: Kiểm tra proxy_pass http://192.168.1.243:3000 trong nginx config
```

### **API calls fail (CORS error):**

```javascript
// Browser Console:
// Access to fetch at 'https://api.hospital.vn' from origin
// 'https://hospital.vn' has been blocked by CORS policy

// Giải pháp:  Check backend CORS config

// Backend:  src/app.js (hoặc server.js)
const cors = require('cors');

app.use(cors({
  origin: ['https://hospital.vn', 'https://api.hospital.vn'],
  credentials: true
}));

// Restart backend
pm2 restart backend
```

### **Routing issues (404 on refresh):**

```bash
# SPA routing với serve
# Đảm bảo dùng -s flag (single page app)

# Check PM2 args:
pm2 describe frontend | grep args

# Output phải có:
# args: '-s build -l 3000'

# Nếu không có -s:
pm2 delete frontend
pm2 start ecosystem.config.js
```

### **Build errors:**

```bash
# Error: JavaScript heap out of memory

# Giải pháp:  Tăng Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Hoặc add vào package.json scripts:
"build": "NODE_OPTIONS=--max-old-space-size=4096 react-scripts build"
```

---

## 🎨 BƯỚC 10: OPTIMIZE BUILD

### **10.1 - Bundle size analysis:**

```bash
# Cài webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Thêm vào package.json scripts:
"analyze": "source-map-explorer 'build/static/js/*.js'"

# Run analysis
npm run analyze

# → Mở browser để xem bundle breakdown
```

### **10.2 - Code splitting (nếu chưa có):**

```javascript
// src/App.js
import React, { lazy, Suspense } from "react";

// Lazy load components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tickets = lazy(() => import("./pages/Tickets"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
      </Routes>
    </Suspense>
  );
}
```

### **10.3 - Compression:**

```bash
# serve tự động enable gzip

# Verify compression
curl -I -H "Accept-Encoding: gzip" https://hospital.vn

# Output phải có:
# content-encoding: gzip
```

---

## 📊 PERFORMANCE CHECK

### **Lighthouse audit:**

```
Browser → https://hospital.vn
DevTools (F12) → Lighthouse tab

Run audit:
□ Performance
□ Accessibility
□ Best Practices
□ SEO
□ PWA

Mục tiêu:
✅ Performance: >90
✅ PWA: 100 (sau khi setup Service Worker)
✅ Accessibility: >90
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Frontend code đã clone/upload
□ Dependencies đã cài (npm install)
□ .env đã cấu hình (API URLs)
□ Build thành công (npm run build)
□ Build folder tạo ra (~2-5MB)
□ serve package đã cài globally
□ PM2 ecosystem file đã tạo
□ Frontend chạy với PM2 (pm2 start)
□ PM2 status frontend:   online ✅
□ Test local OK (curl localhost:3000)
□ 🔵 CF Tunnel: Test qua CF OK (https://hospital.vn loads)
□ 🟢 Nginx: Test qua Nginx OK (https://hospital.vn loads)
□ API connection working (fetch test in Console)
□ Manifest.json valid (BC Bệnh viện, logoBVTPT.png icons)
□ Service Worker activated and running (DevTools → Application)
□ PWA installable (có install prompt)
□ PM2 saved (pm2 save)
□ Socket.IO notification hoạt động (NotificationBell + real-time)

GHI CHÚ:
Frontend location: ~/projects/frontend
PM2 app name: frontend
Port: 3000
Build size: _____ MB
Status: online ✅

URLs:
Frontend:   https://hospital.vn
Backend:  https://api.hospital.vn

PM2 Status:
pm2 status
→ backend:   online ✅
→ frontend:  online ✅

→ Sẵn sàng setup PM2 advanced features!
→ Chuyển sang File 13-PM2-SETUP.md
```

---

**⏭️ TIẾP THEO: File 13-PM2-SETUP.md**
