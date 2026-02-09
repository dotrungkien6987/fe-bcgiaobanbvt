# 📘 PHẦN 11: DEPLOY BACKEND (NODE.JS + EXPRESS)

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Clone code backend từ repository
- ✅ Cài đặt dependencies
- ✅ Cấu hình environment variables
- ✅ Kết nối MongoDB
- ✅ Test backend locally
- ✅ Setup PM2 để chạy backend
- ✅ Monitor và troubleshoot

---

## 📂 BƯỚC 1: CHUẨN BỊ THƯ MỤC

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Tạo thư mục projects
mkdir -p ~/projects
cd ~/projects

# Kiểm tra Git
git --version

# Nếu chưa có:
sudo apt install git -y
```

---

## 📥 BƯỚC 2: CLONE CODE

### **Nếu code trên GitHub/GitLab:**

```bash
# Clone repository
git clone https://github.com/yourusername/your-backend-repo.git backend

# Hoặc với SSH:
# git clone git@github.com:yourusername/your-backend-repo.git backend

# Vào thư mục
cd backend

# Kiểm tra branch
git branch

# Checkout branch cần deploy (nếu không phải main)
# git checkout develop
```

### **Nếu code trên máy local (upload qua SCP):**

```bash
# Từ máy tính cá nhân (không phải server)

# Zip code backend
cd /path/to/your/backend
zip -r backend.zip .  -x "node_modules/*" -x ".git/*"

# Upload lên server
scp backend. zip youruser@192.168.1.243:~/projects/

# SSH vào server
ssh youruser@192.168.1.243

# Unzip
cd ~/projects
unzip backend.zip -d backend
cd backend
```

### **Cấu trúc thư mục backend (ví dụ):**

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── ticketController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── routes/
│   │   ├── ticketRoutes.js
│   │   └── userRoutes. js
│   ├── middleware/
│   │   └── auth.js
│   └── app.js
├── server.js
├── package.json
├── .env. example
└── README.md
```

---

## 📦 BƯỚC 3: CÀI ĐẶT DEPENDENCIES

```bash
# Kiểm tra package.json
cat package.json

# Cài dependencies
npm install

# Output:
# added 234 packages, and audited 235 packages in 15s
#
# 12 packages are looking for funding
# found 0 vulnerabilities

# Nếu có vulnerabilities:
npm audit fix

# Check node_modules đã cài
ls -la node_modules/ | wc -l
```

---

## ⚙️ BƯỚC 4: CẤU HÌNH ENVIRONMENT VARIABLES

### **4.1 - Copy file example:**

```bash
# Xem file example
cat .env.example

# Output (ví dụ):
# NODE_ENV=production
# PORT=8000
# MONGODB_URI=mongodb://user:pass@localhost:27017/dbname
# JWT_SECRET=your-secret-key
# FRONTEND_URL=https://hospital.vn
# ...

# Copy để tạo file . env
cp .env.example . env
```

### **4.2 - Edit .env file:**

```bash
nano .env
```

```bash
# ──────────────────────────────────────────────────────────
# FILE: .env
# ──────────────────────────────────────────────────────────

# Environment
NODE_ENV=production

# Server
PORT=8000
HOST=0.0.0.0
# ⚠️ QUAN TRỌNG: Dùng 0.0.0.0 (không phải localhost)
# • localhost = chỉ nhận request từ chính server
# • 0.0.0.0  = nhận request từ mọi nơi (cần thiết cho Nginx reverse proxy)
#
# 🔵 CF Tunnel: localhost cũng OK vì tunnel chạy trên cùng máy
# 🟢 Nginx:     BẮT BUỘC phải là 0.0.0.0 (Nginx gửi request từ Máy C)

# MongoDB
MONGODB_URI=mongodb://appuser:YOUR_APP_PASSWORD@localhost:27017/ticketdb? authSource=admin&replicaSet=rs0
# ↑ THAY YOUR_APP_PASSWORD bằng password thật!

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://hospital.vn
ALLOWED_ORIGINS=https://hospital.vn,https://api.hospital.vn

# API Base
API_BASE_URL=https://api.hospital.vn

# File Upload (nếu có)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email (nếu có)
# SMTP_HOST=smtp.gmail. com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Firebase — Phase 2 (CHƯA triển khai, xem File 16)
# FIREBASE_PROJECT_ID=
# FIREBASE_PRIVATE_KEY=
# FIREBASE_CLIENT_EMAIL=

# Logging
LOG_LEVEL=info

# ──────────────────────────────────────────────────────────
```

```bash
# Save:  Ctrl+O → Enter → Ctrl+X

# QUAN TRỌNG: Set permissions
chmod 600 .env

# Verify không thể đọc bởi users khác
ls -la .env
# Output:  -rw------- ...  . env
```

---

## 🔌 BƯỚC 5: TEST KẾT NỐI MONGODB

### **Tạo test script:**

```bash
nano test-db-connection.js
```

```javascript
// ──────────────────────────────────────────────────────────
// FILE: test-db-connection.js
// ──────────────────────────────────────────────────────────

require("dotenv").config();
const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log(
      "URI:",
      process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//****: ****@"),
    );

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected successfully! ");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    console.log("📡 Host:", mongoose.connection.host);

    // Test query
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📁 Collections:",
      collections.map((c) => c.name),
    );

    await mongoose.disconnect();
    console.log("👋 Disconnected");

    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

testConnection();

// ──────────────────────────────────────────────────────────
```

```bash
# Save và chạy
node test-db-connection.js

# Output mong muốn:
# 🔄 Connecting to MongoDB...
# URI: mongodb://****:****@localhost:27017/ticketdb?...
# ✅ MongoDB connected successfully!
# 📊 Database: ticketdb
# 📡 Host: localhost
# 📁 Collections: []
# 👋 Disconnected

# Nếu lỗi → Check MONGODB_URI trong .env
```

---

## 🚀 BƯỚC 6: TEST BACKEND LOCALLY

```bash
# Chạy backend (development mode)
npm run dev

# Hoặc:
node server.js

# Output:
# Server running on port 8000
# MongoDB connected
# Server:  http://localhost:8000

# Mở terminal mới, SSH vào server lần nữa
ssh youruser@192.168.1.243

# Test API
curl http://localhost:8000/

# Output (ví dụ):
# {"message":"API is running","version":"1.0.0"}

# Test health endpoint
curl http://localhost:8000/api/health

# Output:
# {"status":"OK","timestamp":"2025-12-26T12:00:00.000Z"}

# Quay lại terminal đầu, stop server
# Ctrl+C
```

---

## 🔧 BƯỚC 7: CÀI ĐẶT PM2

```bash
# Cài PM2 globally
npm install -g pm2

# Verify
pm2 --version

# Output:  5.x.x
```

---

## 🚀 BƯỚC 8: CHẠY BACKEND VỚI PM2

### **8.1 - Tạo PM2 ecosystem file:**

```bash
# Trong thư mục backend
cd ~/projects/backend

nano ecosystem.config.js
```

```javascript
// ──────────────────────────────────────────────────────────
// FILE: ecosystem.config. js
// ──────────────────────────────────────────────────────────

module.exports = {
  apps: [
    {
      name: "backend",
      script: "./server.js",

      // Instances
      instances: 1, // Số lượng instances (1 cho dev, 'max' cho production)
      exec_mode: "fork", // 'fork' hoặc 'cluster'

      // Environment
      env: {
        NODE_ENV: "production",
        PORT: 8000,
      },

      // Logs
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm: ss Z",

      // Restart behavior
      watch: false, // Set true để auto-reload khi file thay đổi
      ignore_watch: ["node_modules", "logs"],
      max_memory_restart: "500M", // Restart nếu vượt quá RAM

      // Advanced
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",

      // Startup
      exp_backoff_restart_delay: 100,
    },
  ],
};

// ──────────────────────────────────────────────────────────
```

```bash
# Save:  Ctrl+O → Enter → Ctrl+X

# Tạo thư mục logs
mkdir -p logs
```

### **8.2 - Start backend với PM2:**

```bash
# Start
pm2 start ecosystem.config. js

# Output:
# [PM2] Starting ecosystem. config.js in fork_mode
# [PM2] Done.
# ┌─────┬────────────┬─────────────┬─────────┬─────────┬──────────┐
# │ id  │ name       │ mode        │ ↺       │ status  │ cpu      │
# ├─────┼────────────┼─────────────┼─────────┼─────────┼──────────┤
# │ 0   │ backend    │ fork        │ 0       │ online  │ 0%       │
# └─────┴────────────┴─────────────┴─────────┴─────────┴──────────┘

# Verify
pm2 status

# Output:
# ┌─────┬────────────┬─────────────┬─────────┬─────────┬──────────┐
# │ id  │ name       │ status      │ ↺       │ cpu     │ memory   │
# ├─────┼────────────┼─────────────┼─────────┼─────────┼──────────┤
# │ 0   │ backend    │ online      │ 0       │ 0.5%    │ 45 MB    │
# └─────┴────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### **8.3 - Test backend:**

```bash
# Test local
curl http://localhost:8000/api/health

# Output:
# {"status":"OK"}

# Test qua Cloudflare Tunnel
curl https://api.hospital.vn/api/health

# Output:
# {"status":"OK"}

# Nếu OK → Success!  ✅
```

---

## 📊 BƯỚC 9: MONITOR BACKEND

### **PM2 commands:**

```bash
# Status
pm2 status

# Logs (realtime)
pm2 logs backend

# Logs (last 100 lines)
pm2 logs backend --lines 100

# Error logs only
pm2 logs backend --err

# Monitor (CPU, RAM realtime)
pm2 monit

# Process details
pm2 describe backend

# Restart
pm2 restart backend

# Stop
pm2 stop backend

# Delete
pm2 delete backend

# Restart tất cả
pm2 restart all
```

### **Startup script (auto-start khi reboot):**

```bash
# Tạo startup script
pm2 startup

# Output:
# [PM2] Init System found:  systemd
# [PM2] To setup the Startup Script, copy/paste the following command:
# sudo env PATH=$PATH:/home/user/.nvm/versions/node/v20.10.0/bin pm2 startup systemd -u user --hp /home/user

# COPY command từ output và chạy
sudo env PATH=$PATH:/home/youruser/.nvm/versions/node/v20.10.0/bin pm2 startup systemd -u youruser --hp /home/youruser

# Save PM2 process list
pm2 save

# Output:
# [PM2] Saving current process list...
# [PM2] Successfully saved

# Test reboot (optional - cẩn thận!)
# sudo reboot

# Sau khi server boot lại:
# SSH vào và check
pm2 status
# → Backend phải tự động chạy ✅
```

---

## 🛠️ TROUBLESHOOTING

### **Backend không start:**

```bash
# Xem logs chi tiết
pm2 logs backend --lines 200

# Thường gặp:
# 1. MongoDB connection error
#    → Check MONGODB_URI trong .env
#    → Check MongoDB service:  sudo systemctl status mongod
#
# 2. Port already in use
#    → Check port:   sudo lsof -i: 8000
#    → Kill process:   kill -9 PID
#
# 3. Missing dependencies
#    → npm install lại
#
# 4. Permission error
#    → Check file permissions
#    → Check . env file có đọc được không

# Restart với clean state
pm2 delete backend
pm2 start ecosystem.config.js
```

### **🔵 API trả về 502 từ Cloudflare (Phase 1):**

```bash
# Kiểm tra backend có chạy không
pm2 status

# Test local
curl http://localhost:8000/api/health

# Nếu local OK nhưng Cloudflare 502:
# → Check cloudflared service
sudo systemctl status cloudflared

# Restart cloudflared
sudo systemctl restart cloudflared

# Wait 30 giây và thử lại
```

### **🟢 API trả về 502 từ Nginx (Phase 2):**

```bash
# Kiểm tra backend có chạy không
pm2 status

# Test local
curl http://localhost:8000/api/health

# Nếu local OK nhưng Nginx 502:
# → Kiểm tra trên Máy C (192.168.1.250):
sudo tail -50 /var/log/nginx/error.log

# Thường gặp:
# 1. HOST=localhost trong .env → Sửa thành 0.0.0.0
# 2. Firewall Máy A block port 8000 → ufw allow from 192.168.1.250
# 3. proxy_pass sai IP/port → Kiểm tra nginx config
```

### **High memory usage:**

```bash
# Check memory
pm2 monit

# Nếu vượt quá 500MB, sẽ auto restart (theo ecosystem.config.js)

# Giảm memory usage:
# 1. Optimize code (remove memory leaks)
# 2. Increase max_memory_restart limit
# 3. Use cluster mode với nhiều instances nhỏ hơn
```

---

## 🔐 BƯỚC 10: BẢO MẬT

### **10.1 - Secure .env file:**

```bash
# Chỉ owner đọc được
chmod 600 .env

# Thêm vào .gitignore
echo ". env" >> .gitignore
echo "logs/" >> .gitignore
echo "node_modules/" >> .gitignore

# Verify
cat .gitignore
```

### **10.2 - Generate strong JWT secret:**

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output và update vào .env
nano .env
# JWT_SECRET=<paste generated secret>
```

### **10.3 - Rotate credentials định kỳ:**

```
📝 GHI CHÚ:

Mỗi 3-6 tháng:
□ Đổi JWT_SECRET
□ Đổi MongoDB passwords
□ Review API keys
□ Update dependencies (npm update)
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
□ Code backend đã clone/upload
□ Dependencies đã cài (npm install)
□ File .env đã cấu hình đúng
□ MongoDB connection test OK
□ Backend chạy được local (node server.js)
□ PM2 đã cài
□ Backend chạy với PM2 (pm2 start)
□ PM2 status:  online ✅
□ API test local OK (curl localhost:8000)
□ 🔵 CF Tunnel: API test OK (curl https://api.hospital.vn)
□ 🟢 Nginx: API test qua Nginx OK (curl https://api.hospital.vn)
□ 🟢 Nginx: HOST=0.0.0.0 trong .env (KHÔNG phải localhost)
□ PM2 startup script đã setup
□ Logs đang ghi vào ./logs/
□ . env file permissions:  600

GHI CHÚ:
Backend location: ~/projects/backend
PM2 app name: backend
Port: 8000
Status: online ✅

Test commands:
pm2 status
pm2 logs backend
curl https://api.hospital.vn/api/health

Socket.IO (thông báo real-time):
→ Backend tự khởi tạo Socket.IO server cùng port 8000
→ 🔵 CF Tunnel: WebSocket tự động hỗ trợ
→ 🟢 Nginx: Cần config WebSocket upgrade headers (xem File 16)

→ Sẵn sàng deploy Frontend!
→ Chuyển sang File 12-DEPLOY-FRONTEND.md
```

---

**⏭️ TIẾP THEO: File 12-DEPLOY-FRONTEND.md**
